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
// Fetch all invoices

router.get('/all', async (req, res) => {
    try {
        // Fetch all invoices
        const invoiceQuery = `
            SELECT * FROM invoice;
        `;

        const [invoiceRows] = await pool.query(invoiceQuery);

        if (invoiceRows.length === 0) {
            return res.status(404).json({ error: 'No invoices found' });
        }

        res.json(invoiceRows); // Return all invoices
    } catch (error) {
        console.error('Error fetching invoices:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Fetch an invoice by ID
router.get('/:Invoice_Id', async (req, res) => { // Removed extra space here
    const invoiceId = req.params.Invoice_Id;

    try {
        // Fetch invoice details including TotalCost_for_Parts
        const invoiceQuery = `
            SELECT * FROM invoice WHERE Invoice_Id = ?;
        `;

        const [invoiceRows] = await pool.query(invoiceQuery, [invoiceId]);

        if (invoiceRows.length === 0) {
            return res.status(404).json({ error: 'Invoice not found' });
        }

        res.json(invoiceRows[0]);
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

module.exports = router;
