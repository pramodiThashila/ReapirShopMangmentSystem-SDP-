const express = require("express");
const db = require("../config/db");
const { body, validationResult } = require("express-validator");
const router = express.Router();


// Submit a quotation
router.post('/submitQuotation', [
    body('inventoryItem_id')
        .isInt().withMessage('Inventory Item ID must be an integer')
        .notEmpty().withMessage('Inventory Item ID is required'),
    body('supplier_id')
        .isInt().withMessage('Supplier ID must be an integer')
        .notEmpty().withMessage('Supplier ID is required'),
    body('unit_price')
        .isFloat({ min: 0.01 }).withMessage('Unit price must be a positive number'),
    body('notes')
        .optional()
        .isString().withMessage('Notes must be a string'),
], async (req, res) => {
    const { inventoryItem_id, supplier_id, unit_price, notes } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        // Set the current date
        const quatationR_date = new Date().toISOString().split('T')[0];

        // Insert the quotation into the database
        const insertQuery = `
            INSERT INTO supplier_quotation (
                inventoryItem_id, 
                supplier_id, 
                unit_price, 
                notes, 
                quatationR_date
            ) VALUES (?, ?, ?, ?, ?)
        `;

        const [result] = await db.query(insertQuery, [
            inventoryItem_id,
            supplier_id,
            unit_price,
            notes || null, // Allow notes to be null
            quatationR_date
        ]);

        res.status(201).json({
            message: 'Quotation submitted successfully',
            quotation_id: result.insertId,
            inventoryItem_id,
            supplier_id,
            unit_price,
            notes,
            quatationR_date
        });
    } catch (error) {
        console.error('Error submitting quotation:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Fetch all quotations with supplier name and inventory item name
router.get('/quotations/:inventoryItem_id', async (req, res) => {
    const { inventoryItem_id } = req.params;

    try {
        // Query to fetch quotations with supplier name and inventory item name
        const fetchQuery = `
            SELECT 
                sq.quotation_id, 
                sq.inventoryItem_id, 
                i.item_name, 
                sq.supplier_id, 
                s.supplier_name, 
                sq.unit_price, 
                sq.notes, 
                sq.quatationR_date 
            FROM 
                supplier_quotation sq
            JOIN 
                suppliers s ON sq.supplier_id = s.supplier_id
            JOIN 
                inventory i ON sq.inventoryItem_id = i.inventoryItem_id
            WHERE 
                sq.inventoryItem_id = ?
        `;

        const [rows] = await db.query(fetchQuery, [inventoryItem_id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'No quotations found for the given inventory item ID' });
        }

        res.status(200).json({ quotations: rows });
    } catch (error) {
        console.error('Error fetching quotations:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Approve a quotation by updating its status
router.put('/quotations/approve/:quotationId', async (req, res) => {
    const { quotationId } = req.params;

    try {
        // Update the status of the quotation to 'approved'
        const updateQuery = `
            UPDATE supplier_quotation
            SET qutation_status = 'approved'
            WHERE quotation_id = ?
        `;

        const [result] = await db.query(updateQuery, [quotationId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Quotation not found' });
        }

        res.status(200).json({ message: 'Quotation approved successfully' });
    } catch (error) {
        console.error('Error approving quotation:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.put('/quotations/reject/:quotationId', async (req, res) => {
    const { quotationId } = req.params;

    try {
        // Update the status of the quotation to 'approved'
        const updateQuery = `
            UPDATE supplier_quotation
            SET qutation_status = 'rejected'
            WHERE quotation_id = ?
        `;

        const [result] = await db.query(updateQuery, [quotationId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Quotation not found' });
        }

        res.status(200).json({ message: 'Quotation approved successfully' });
    } catch (error) {
        console.error('Error approving quotation:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;