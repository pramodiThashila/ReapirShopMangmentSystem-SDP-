const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const pool = require('../config/db'); // MySQL connection pool


//method  to check if the user is an owner

const checkOwnerRole = async (req, res, next) => {
    const { employee_id } = req.body;
    try {

        const [owner] = await pool.query("SELECT role FROM Employees WHERE employee_id  = ?", [employee_id]);
        if (owner.length === 0 || owner[0].role !== 'owner') {
            return res.status(403).json({ message: "Only owners can generate invoices" });
        }
        next();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


// POST: Add a new invoice
router.post('/add', [
    // Required fields validation
    body('job_id').isInt().withMessage('Job ID must be an integer'),
    body('customer_id').isInt().withMessage('Customer ID must be an integer'),
    body('employee_id').isInt().withMessage('Employee ID must be an integer'),
    
    // Validate labor_cost (positive, non-zero)
    body('labour_cost')
        .isFloat({ min: 0.01 }).withMessage('Labour Cost must be greater than zero'),
    
    // Validate parts_cost
    body('parts_cost')
        .isFloat({ min: 0 }).withMessage('Parts cost must be a non-negative number'),
    
    // Validate total_amount (positive, non-zero)
    body('total_amount')
        .isFloat({ min: 0.01 }).withMessage('Total amount must be greater than zero'),
    
    // Validate date is today
    body('invoice_date')
        .isISO8601().withMessage('Date must be in valid format (YYYY-MM-DD)')
        .custom(value => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const inputDate = new Date(value);
            inputDate.setHours(0, 0, 0, 0);
            
            if (inputDate.getTime() !== today.getTime()) {
                throw new Error('Invoice date must be today');
            }
            return true;
        }),
    
    body('created_by')
        .isString().withMessage('Created by must be a string'),
    
    body('warranty_eligible')
        .isBoolean().withMessage('Warranty eligibility must be a boolean')
    
], async (req, res) => {
    // Validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { 
        job_id, 
        customer_id, 
        employee_id, 
        labour_cost, 
        parts_cost,
        total_amount,
        invoice_date,
        created_by,
        warranty_eligible
    } = req.body;

    try {
        // Check if employee exists
        const [employee] = await pool.query("SELECT role FROM Employees WHERE employee_id = ?", [employee_id]);
        if (employee.length === 0) {
            return res.status(404).json({ message: "Employee not found" });
        }

        // Check if job exists
        const [job] = await pool.query("SELECT repair_status FROM jobs WHERE job_id = ?", [job_id]);
        if (job.length === 0) {
            return res.status(404).json({ message: "Job not found" });
        }

        // Check if invoice already exists for the job
        const [existingInvoice] = await pool.query("SELECT Invoice_Id FROM invoice WHERE job_id = ?", [job_id]);
        if (existingInvoice.length > 0) {
            return res.status(409).json({ message: "Invoice already exists for this job" });
        }

        // Check for advance invoice for this job
        const [advanceInvoice] = await pool.query(
            "SELECT AdvanceInvoice_Id FROM AdvanceInvoice WHERE job_id = ?", 
            [job_id]
        );
        
        

        // Calculate warranty expiration date (6 months from today)
        const warrantyExpDate = new Date(invoice_date);
        warrantyExpDate.setMonth(warrantyExpDate.getMonth() + 6);
        const formattedWarrantyExpDate = warrantyExpDate.toISOString().split('T')[0];

        // Insert new invoice into the database
        const insertQuery = `
            INSERT INTO Invoice (
                job_id, 
                customer_id, 
                employee_id, 
                TotalCost_for_Parts, 
                Labour_Cost, 
                Total_Amount, 
                warranty,
                warranty_exp_date,
                Date,
                Created_By
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `;

        const [result] = await pool.query(insertQuery, [
            job_id, 
            customer_id, 
            employee_id,
            parts_cost, 
            labour_cost,
            total_amount,
            warranty_eligible ? 1 : 0,
            warranty_eligible ? formattedWarrantyExpDate : null,
            invoice_date,
            created_by
        ]);

        

        res.status(201).json({
            message: 'Invoice created successfully',
            Invoice_Id: result.insertId,
            parts_cost,
            labour_cost,
            total_amount,
            warranty_eligible,
            warranty_exp_date: warranty_eligible ? formattedWarrantyExpDate : null
        });
    } catch (error) {
        console.error('Error adding invoice:', error);
        res.status(500).json({ 
            error: error.message || 'Failed to create invoice'
        });
    }
});
// Fetch all invoices with complete details
router.get('/all', async (req, res) => {
    try {
        // Fetch all invoices with related information
        const invoiceQuery = `
            SELECT 
                i.Invoice_Id,
                i.job_id,
                j.repair_description,
                j.repair_status,
                i.customer_id,
                CONCAT(c.firstName, ' ', c.lastName) as customer_name,
                c.email as customer_email,
                i.employee_id,
                CONCAT(e.first_name, ' ', e.last_name) as employee_name,
                e.role as employee_role,
                p.product_id,
                p.product_name,
                p.model,
                p.model_no,
                p.product_image,
                i.TotalCost_for_Parts,
                i.Labour_Cost,
                i.Total_Amount,
                i.warranty,
                i.warranty_exp_date,
                i.Date as invoice_date,
                i.Created_By,
                i.AdvanceInvoice_Id,
                ai.Advance_Amount as advance_payment
            FROM 
                invoice i
            JOIN 
                jobs j ON i.job_id = j.job_id
            JOIN 
                customers c ON i.customer_id = c.customer_id
            JOIN 
                employees e ON i.employee_id = e.employee_id
            JOIN 
                products p ON j.product_id = p.product_id
            LEFT JOIN 
                AdvanceInvoice ai ON i.AdvanceInvoice_Id = ai.AdvanceInvoice_Id
            ORDER BY 
                i.Date DESC;
        `;

        const [invoiceRows] = await pool.query(invoiceQuery);

        if (invoiceRows.length === 0) {
            return res.status(404).json({ error: 'No invoices found' });
        }

        // Process the results to calculate additional fields
        const processedInvoices = invoiceRows.map(invoice => {
            // Calculate balance due (if advance payment exists)
            const advancePayment = invoice.advance_payment || 0;
            const balanceDue = invoice.Total_Amount - advancePayment;
            
            // Format the dates for better readability
            const formattedInvoiceDate = new Date(invoice.invoice_date).toISOString().split('T')[0];
            const formattedWarrantyExpDate = invoice.warranty_exp_date ? 
                new Date(invoice.warranty_exp_date).toISOString().split('T')[0] : null;
            
            return {
                ...invoice,
                advance_payment: advancePayment,
                balance_due: balanceDue,
                invoice_date: formattedInvoiceDate,
                warranty_exp_date: formattedWarrantyExpDate,
                warranty_status: determineWarrantyStatus(invoice.warranty, invoice.warranty_exp_date)
            };
        });

        res.json({
            count: processedInvoices.length,
            invoices: processedInvoices
        });
    } catch (error) {
        console.error('Error fetching invoices:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Fetch an invoice by ID with complete details
router.get('/:Invoice_Id', async (req, res) => {
    const invoiceId = req.params.Invoice_Id;

    try {
        // Validate invoiceId is a number
        if (isNaN(invoiceId)) {
            return res.status(400).json({ 
                error: 'Invalid invoice ID format. Must be a number.' 
            });
        }
        
        // Fetch invoice with related information
        const invoiceQuery = `
            SELECT 
                i.Invoice_Id,
                i.job_id,
                j.repair_description,
                j.repair_status,
                j.receive_date,
                j.handover_date,
                i.customer_id,
                CONCAT(c.firstName, ' ', c.lastName) as customer_name,
                c.email as customer_email,
                c.type as customer_type,
                i.employee_id,
                CONCAT(e.first_name, ' ', e.last_name) as employee_name,
                e.role as employee_role,
                p.product_id,
                p.product_name,
                p.model,
                p.model_no,
                p.product_image,
                i.TotalCost_for_Parts,
                i.Labour_Cost,
                i.Total_Amount,
                i.warranty,
                i.warranty_exp_date,
                i.Date as invoice_date,
                i.Created_By,
                i.AdvanceInvoice_Id,
                ai.Advance_Amount as advance_payment
            FROM 
                invoice i
            JOIN 
                jobs j ON i.job_id = j.job_id
            JOIN 
                customers c ON i.customer_id = c.customer_id
            JOIN 
                employees e ON i.employee_id = e.employee_id
            JOIN 
                products p ON j.product_id = p.product_id
            LEFT JOIN 
                AdvanceInvoice ai ON i.AdvanceInvoice_Id = ai.AdvanceInvoice_Id
            WHERE 
                i.Invoice_Id = ?;
        `;

        const [invoiceRows] = await pool.query(invoiceQuery, [invoiceId]);

        if (invoiceRows.length === 0) {
            return res.status(404).json({ error: 'Invoice not found' });
        }

        // Get customer phone numbers
        const [phoneNumbers] = await pool.query(
            "SELECT phone_number FROM telephones_customer WHERE customer_id = ?",
            [invoiceRows[0].customer_id]
        );
        
        // Get inventory items used for this job
        const [usedItems] = await pool.query(`
            SELECT 
                jui.inventoryItem_id,
                i.item_name,
                jui.batch_no,
                jui.quantity,
                jui.total,
                ib.unitprice
            FROM 
                jobusedinventory jui
            LEFT JOIN 
                inventorybatch ib ON jui.inventoryItem_id = ib.inventoryItem_id AND jui.batch_no = ib.batch_no
            LEFT JOIN 
                inventory i ON jui.inventoryItem_id = i.inventoryItem_id
            WHERE 
                jui.job_id = ?
        `, [invoiceRows[0].job_id]);
        
        // Calculate balance due
        const advancePayment = invoiceRows[0].advance_payment || 0;
        const balanceDue = invoiceRows[0].Total_Amount - advancePayment;
        
        // Format dates
        const formattedInvoiceDate = new Date(invoiceRows[0].invoice_date).toISOString().split('T')[0];
        const formattedWarrantyExpDate = invoiceRows[0].warranty_exp_date ? 
            new Date(invoiceRows[0].warranty_exp_date).toISOString().split('T')[0] : null;
        
        // Prepare the response
        const invoiceDetails = {
            ...invoiceRows[0],
            phone_numbers: phoneNumbers.map(p => p.phone_number),
            used_inventory: usedItems,
            advance_payment: advancePayment,
            balance_due: balanceDue,
            invoice_date: formattedInvoiceDate,
            warranty_exp_date: formattedWarrantyExpDate,
            warranty_status: determineWarrantyStatus(invoiceRows[0].warranty, invoiceRows[0].warranty_exp_date)
        };

        res.json(invoiceDetails);
    } catch (error) {
        console.error('Error fetching invoice:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * Check if invoice exists for a job and if job status is completed
 * GET /api/invoice/check/:jobId
 */
router.get('/check/:jobId', async (req, res) => {
    const { jobId } = req.params;

    try {
        // Validate jobId is a number
        if (isNaN(jobId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid job ID format. Job ID must be a number.'
            });
        }

        // 1. Check if job exists and get its status
        const [jobRows] = await pool.query(
            'SELECT job_id, repair_status FROM jobs WHERE job_id = ?', 
            [jobId]
        );

        if (jobRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        // 2. Check if job status is completed
        const isJobCompleted = jobRows[0].repair_status === 'completed';

        // 3. Check if invoice exists for this job
        const [invoiceRows] = await pool.query(
            'SELECT Invoice_Id FROM invoice WHERE job_id = ?',
            [jobId]
        );

        const invoiceExists = invoiceRows.length > 0;
        
        // 4. Prepare the response based on both conditions
        if (!isJobCompleted) {
            return res.status(200).json({
                success: false,
                canCreateInvoice: false,
                message: 'Job is not yet completed. Cannot create invoice.',
                jobStatus: jobRows[0].repair_status
            });
        }
        
        if (invoiceExists) {
            return res.status(200).json({
                success: true,
                canCreateInvoice: false,
                message: 'Invoice already exists for this job.',
                invoiceId: invoiceRows[0].Invoice_Id,
                jobStatus: jobRows[0].repair_status
            });
        }
        
        // Job is completed and no invoice exists - can create invoice
        return res.status(200).json({
            success: true,
            canCreateInvoice: true,
            message: 'Job is completed and no invoice exists. Invoice can be created.',
            jobStatus: jobRows[0].repair_status
        });

    } catch (error) {
        console.error('Error checking invoice eligibility:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while checking invoice eligibility',
            error: error.message
        });
    }
});

// Get all warranty-eligible jobs
router.get('/warrantyEligibleJobs', async (req, res) => {
    try {
        const query = `
            SELECT 
                j.job_id,
                j.repair_description,
                j.repair_status,
                j.receive_date,
                j.handover_date,
                c.customer_id,
                CONCAT(c.firstName, ' ', c.lastName) as customer_name,
                c.email as customer_email,
                p.product_id,
                p.product_name,
                p.model,
                p.model_no,
                i.Invoice_Id,
                i.warranty_exp_date,
                CASE 
                    WHEN i.warranty_exp_date >= CURDATE() THEN 'Active'
                    ELSE 'Expired'
                END as warranty_status
            FROM 
                jobs j
            JOIN 
                invoice i ON j.job_id = i.job_id
            JOIN 
                customers c ON j.customer_id = c.customer_id
            JOIN 
                products p ON j.product_id = p.product_id
            WHERE 
                i.warranty = 1 -- Only include warranty-eligible jobs
            ORDER BY 
                i.warranty_exp_date DESC;
        `;

        const [warrantyJobs] = await pool.query(query);

        if (warrantyJobs.length === 0) {
            return res.status(404).json({ message: 'No warranty-eligible jobs found' });
        }

        res.status(200).json({
            message: 'Warranty-eligible jobs retrieved successfully',
            jobs: warrantyJobs
        });
    } catch (error) {
        console.error('Error fetching warranty-eligible jobs:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Helper function to determine warranty status
function determineWarrantyStatus(hasWarranty, expiryDate) {
    if (!hasWarranty) return 'No Warranty';
    
    if (!expiryDate) return 'Unknown';
    
    const today = new Date();
    const expiry = new Date(expiryDate);
    
    if (expiry < today) {
        return 'Expired';
    } else {
        // Calculate days remaining
        const diffTime = Math.abs(expiry - today);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return `Active (${diffDays} days remaining)`;
    }
}

router.get('/invoiceDetails/:jobId', async (req, res) => {
    const { jobId } = req.params;

    try {
        // Validate jobId is a number
        if (isNaN(jobId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid job ID format. Job ID must be a number.'
            });
        }

        // Fetch invoice details for the given job ID
        const [invoiceRows] = await pool.query(`
            SELECT 
                i.Invoice_Id,
                i.job_id,
                i.TotalCost_for_Parts,
                i.Labour_Cost,
                i.Total_Amount,
                i.warranty,
                i.warranty_exp_date,
                i.Is_warranty_claimed,
                i.Date as invoice_date,
                i.created_by
            FROM 
                invoice i
            WHERE 
                i.job_id = ?;
        `, [jobId]);

        if (invoiceRows.length === 0) {
            return res.status(404).json({ message: 'Invoice not found for the given job ID' });
        }

        const invoice = invoiceRows[0];

        // Fetch advance payment details for the given job ID
        const [advanceRows] = await pool.query(`
            SELECT 
                Advance_Amount
            FROM 
                advanceinvoice
            WHERE 
                job_id = ?;
        `, [jobId]);

        const advancePayment = advanceRows.length > 0 ? advanceRows[0].Advance_Amount : 0;

        // Fetch job details for the given job ID
        const [jobRows] = await pool.query(`
            SELECT 
                job_id,
                repair_description,
                repair_status,
                receive_date,
                handover_date
            FROM 
                jobs
            WHERE 
                job_id = ?;
        `, [jobId]);

        if (jobRows.length === 0) {
            return res.status(404).json({ message: 'Job not found for the given job ID' });
        }

        const job = jobRows[0];

        // Calculate balance due
        const balanceDue = invoice.Total_Amount - advancePayment;

        // Format warranty expiration date
        const formattedWarrantyExpDate = invoice.warranty_exp_date
            ? new Date(invoice.warranty_exp_date).toISOString().split('T')[0]
            : null;

        // Prepare the response
        const response = {
            invoice: {
                Invoice_Id: invoice.Invoice_Id,
                job_id: invoice.job_id,
                TotalCost_for_Parts: invoice.TotalCost_for_Parts,
                Labour_Cost: invoice.Labour_Cost,
                Total_Amount: invoice.Total_Amount,
                warranty: invoice.warranty ? 'Yes' : 'No',
                warranty_exp_date: formattedWarrantyExpDate,
                Is_warranty_claimed: invoice.Is_warranty_claimed ? 'Yes' : 'No',
                invoice_date: new Date(invoice.invoice_date).toISOString().split('T')[0],
                created_by: invoice.created_by
            },
            advance_payment: advancePayment,
            balance_due: balanceDue,
            job: {
                job_id: job.job_id,
                repair_description: job.repair_description,
                repair_status: job.repair_status,
                receive_date: new Date(job.receive_date).toISOString().split('T')[0],
                handover_date: job.handover_date
                    ? new Date(job.handover_date).toISOString().split('T')[0]
                    : null
            }
        };

        res.status(200).json(response);
    } catch (error) {
        console.error('Error fetching invoice details:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
