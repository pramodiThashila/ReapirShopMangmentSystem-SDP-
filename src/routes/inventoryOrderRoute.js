const express = require("express");
const db = require("../config/db");
const { body, validationResult } = require("express-validator");
const router = express.Router();
const moment = require("moment");

// Create a new inventory order
router.post('/create', [
    body('inventoryItem_id')
        .isInt().withMessage('Inventory Item ID must be an integer')
        .notEmpty().withMessage('Inventory Item ID is required'),
    body('supplier_id')
        .isInt().withMessage('Supplier ID must be an integer')
        .notEmpty().withMessage('Supplier ID is required'),
    body('quotation_id')
        .isInt().withMessage('Quotation ID must be an integer')
        .notEmpty().withMessage('Quotation ID is required'),
    body('quantity')
        .isInt({ min: 1 }).withMessage('Quantity must be a positive integer')
        .notEmpty().withMessage('Quantity is required'),
    body('unit_price')
        .optional()
        .isFloat({ min: 0 }).withMessage('Unit price must be a positive number'),
    body('needBeforeDate')
        .optional()
        .isDate().withMessage('Date must be in valid format (YYYY-MM-DD)')
        .custom(value => {
            const inputDate = new Date(value);
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Reset time part to start of day for fair comparison
            
            if (inputDate < today) {
                throw new Error('Date cannot be in the past');
            }
            return true;
        }),
    body('notes')
        .optional()
        .isString().withMessage('Notes must be a string'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { 
        inventoryItem_id, 
        supplier_id, 
        quotation_id, 
        quantity, 
        unit_price, 
        needBeforeDate, 
        order_status = 'pending',
        notes 
    } = req.body;

    try {
        // Check if inventory item exists
        const [inventoryItems] = await db.query(
            'SELECT inventoryItem_id FROM inventory WHERE inventoryItem_id = ?', 
            [inventoryItem_id]
        );

        if (inventoryItems.length === 0) {
            return res.status(404).json({ message: 'Inventory item not found' });
        }

        // Check if supplier exists
        const [suppliers] = await db.query(
            'SELECT supplier_id FROM suppliers WHERE supplier_id = ?', 
            [supplier_id]
        );

        if (suppliers.length === 0) {
            return res.status(404).json({ message: 'Supplier not found' });
        }

        // Check if quotation exists and is approved
        const [quotations] = await db.query(
            'SELECT quotation_id FROM supplier_quotation WHERE quotation_id = ?', 
            [quotation_id]
        );

        if (quotations.length === 0) {
            return res.status(404).json({ message: 'Quotation not found' });
        }

        // Insert the inventory order
        const insertQuery = `
            INSERT INTO inventory_order (
                inventoryItem_id,
                supplier_id,
                quotation_id,
                needBeforeDate,
                unit_price,
                quantity,
                order_status,
                notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await db.query(insertQuery, [
            inventoryItem_id,
            supplier_id,
            quotation_id,
            needBeforeDate || null,
            unit_price || null,
            quantity,
            order_status,
            notes || null
        ]);

        res.status(201).json({
            message: 'Inventory order created successfully',
            order_id: result.insertId,
            inventoryItem_id,
            supplier_id,
            quotation_id,
            needBeforeDate,
            unit_price,
            quantity,
            order_status,
            notes
        });
    } catch (error) {
        console.error('Error creating inventory order:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all inventory orders
router.get('/', async (req, res) => {
    try {
        // Query to fetch all orders with related data
        const fetchQuery = `
            SELECT 
                io.order_id,
                io.inventoryItem_id,
                i.item_name,
                io.supplier_id,
                s.supplier_name,
                io.quotation_id,
                io.needBeforeDate,
                io.unit_price,
                io.quantity,
                io.order_status,
                io.notes
            FROM 
                inventory_order io
            JOIN 
                inventory i ON io.inventoryItem_id = i.inventoryItem_id
            JOIN 
                suppliers s ON io.supplier_id = s.supplier_id
        `;

        const [rows] = await db.query(fetchQuery);

        res.status(200).json({ orders: rows });
    } catch (error) {
        console.error('Error fetching inventory orders:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/bysupplier/:supplier_id', async (req, res) => {
    const { supplier_id } = req.params;

    try {
        const fetchQuery = `
            SELECT 
                io.order_id,
                io.inventoryItem_id,
                i.item_name,
                io.supplier_id,
                s.supplier_name,
                io.quotation_id,
                io.needBeforeDate,
                io.unit_price,
                io.quantity,
                io.order_status,
                io.notes
            FROM 
                inventory_order io
            JOIN 
                inventory i ON io.inventoryItem_id = i.inventoryItem_id
            JOIN 
                suppliers s ON io.supplier_id = s.supplier_id
            WHERE 
                io.supplier_id = ?
        `;

        const [rows] = await db.query(fetchQuery, [supplier_id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'No inventory orders found for this supplier' });
        }

        res.status(200).json({ 
            count: rows.length,
            orders: rows 
        });
    } catch (error) {
        console.error('Error fetching inventory orders:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.put('/order/supplier/approve/:quotationId', async (req, res) => {
    const { quotationId } = req.params;

    try {
        // Update the status of the quotation to 'approved'
        const updateQuery = `
            UPDATE inventory_order
            SET order_status = 'confirmed'
            WHERE quotation_id = ?
        `;

        const [result] = await db.query(updateQuery, [quotationId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'order not found' });
        }

        res.status(200).json({ message: 'order approved successfully' });
    } catch (error) {
        console.error('Error approving order:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Update order status (approve or reject)
router.put('/status/:orderId', [
    body('order_status')
        .isIn(['pending', 'approved', 'rejected']).withMessage('Status must be pending, approved, or rejected')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { orderId } = req.params;
    const { order_status } = req.body;

    try {
        const updateQuery = `
            UPDATE inventory_order
            SET order_status = ?
            WHERE order_id = ?
        `;

        const [result] = await db.query(updateQuery, [order_status, orderId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Inventory order not found' });
        }

        res.status(200).json({ message: `Order status updated to ${order_status} successfully` });
    } catch (error) {
        console.error('Error updating inventory order status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;