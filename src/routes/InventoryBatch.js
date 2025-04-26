const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/db');

const router = express.Router(); //initializes an Express router to define routes for operations

// Get all inventory batches
router.get('/all', async (req, res) => {
    try {
        const [batches] = await db.query("SELECT * FROM inventorybatch");
        res.status(200).json(batches);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get inventory purchase details ordered by most recent purchase date
router.get('/inventoryPurchases', async (req, res) => {
    try {
        const [purchases] = await db.query(`
            SELECT 
                ip.purchase_id,
                i.item_name,
                ip.batch_no,
                s.supplier_name,
                DATE_FORMAT(ip.purchaseDate, '%Y-%m-%d') as purchaseDate, -- Format date as YYYY-MM-DD
                ip.quantity,
                ip.unitprice,
                ip.total
            FROM 
                inventorypurchase ip
            JOIN 
                suppliers s ON ip.supplier_id = s.supplier_id
            JOIN 
                inventory i ON ip.inventoryItem_id = i.inventoryItem_id
            ORDER BY 
                ip.purchaseDate DESC; -- Order by most recent date
        `);

        res.status(200).json({
            message: "Inventory purchases retrieved successfully",
            purchases: purchases
        });
    } catch (err) {
        console.error("Error fetching inventory purchases:", err);
        res.status(500).json({ error: err.message });
    }
});

// Get a specific inventory batch by BatchNo
router.get('/getInventoryBatch/:batch_no', async (req, res) => {
    const { batch_no } = req.params;
    try {
        const [batches] = await db.query("SELECT * FROM InventoryBatch WHERE batch_no = ?", [batch_no]);
        res.status(200).json(batches);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all inventory batches for a specific inventory item
router.get('/getInventoryItemBatch/:inventoryItem_id', async (req, res) => {
    const { inventoryItem_id } = req.params;
    try {
        const [batches] = await db.query(
            `SELECT 
                i.item_name, 
                ib.batch_no, 
                ib.unitprice, 
                ib.quantity, 
                ib.Purchase_Date, 
                s.supplier_name
            FROM 
                inventory i
            JOIN 
                inventorybatch ib ON i.inventoryItem_id = ib.inventoryItem_id
            JOIN 
                suppliers s ON ib.supplier_id = s.supplier_id
            WHERE 
                ib.inventoryItem_id = ? AND ib.quantity > 0;`, // Exclude batches with quantity = 0
            [inventoryItem_id]
        );
        res.status(200).json(batches);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// Add a new inventory batch
router.post(
    '/add',
    [
        body('inventoryItem_id')
            .isInt().withMessage('Inventory ID must be an integer'),
        body('supplier_id')
            .isInt().withMessage('Supplier ID must be an integer'),
        body('quantity')
            .isInt({ min: 1, max: 9999 }).withMessage('Quantity must be an integer between 1 and 9999'),
        body('unitprice')
            .isFloat({ min: 0.01 }).withMessage('Unit price must be a positive number'),
        body('Purchase_Date')
            .optional()
            .isISO8601().withMessage('Purchase date must be a valid date')
            .custom((value) => {
                const purchaseDate = new Date(value);
                const now = new Date();
                if (purchaseDate > now) {
                    throw new Error('Purchase date cannot be a future date');
                }
                return true;
            })
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { inventoryItem_id, supplier_id, quantity, unitprice, Purchase_Date } = req.body;

        try {
            // If purchase_date is provided, use it; otherwise, use the current date
            const purchaseDate = Purchase_Date || new Date();

            // Calculate Total_Amount
            const totalAmount = quantity * unitprice;

            // Insert into inventorybatch
            const [result] = await db.query(
                "INSERT INTO inventorybatch (inventoryItem_id, quantity, unitprice, Total_Amount, Purchase_Date, supplier_id) VALUES (?, ?, ?, ?, ?, ?)",
                [inventoryItem_id, quantity, unitprice, totalAmount, purchaseDate, supplier_id]
            );

            const batch_no = result.insertId;

            // Insert into inventorypurchase
            const [result1] = await db.query(
                "INSERT INTO inventorypurchase (inventoryItem_id, batch_no, supplier_id, total, purchaseDate, quantity, unitprice) VALUES (?, ?, ?, ?, ?, ?, ?)",
                [inventoryItem_id, batch_no, supplier_id, totalAmount, purchaseDate, quantity, unitprice]
            );

            // Send a single response with both results
            res.status(201).json({
                message: "Inventory batch and purchase added successfully!",
                batchId: batch_no,
                purchaseId: result1.insertId
            });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
);

// Update an existing inventory batch
router.put(
    '/updateBatch/:batch_no',
    [
        body('quantity')
            .isInt({ min: 1, max: 9999 }).withMessage('Quantity must be an integer between 1 and 9999'),
        body('unitprice')
            .isFloat({ min: 0.01 }).withMessage('Unit price must be a positive number'),
        body('supplier_id')
            .isInt().withMessage('Supplier ID must be an integer'),
        body('Purchase_Date')
            .optional()
            .isISO8601().withMessage('Purchase date must be a valid date')
            .custom((value) => {
                const purchaseDate = new Date(value);
                const now = new Date();
                if (purchaseDate > now) {
                    throw new Error('Purchase date cannot be a future date');
                }
                return true;
            })
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { batch_no } = req.params;
        const { quantity, unitprice, supplier_id, Purchase_Date } = req.body;

        try {
            // If purchase_date is provided, use it; otherwise, retain the existing one
            const purchaseDate = Purchase_Date || new Date();

            await db.query(
                "UPDATE inventorybatch SET quantity = ?, unitprice = ?, Purchase_Date = ?, supplier_id = ? WHERE batch_no = ?",
                [quantity, unitprice, purchaseDate, supplier_id, batch_no]
            );

            res.status(200).json({ message: "Inventory batch updated successfully!" });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
);

// Delete an inventory batch
router.delete('/deleteBatch/:batch_no', async (req, res) => {
    const { batch_no } = req.params;
    try {
        await db.query("DELETE FROM inventorybatch WHERE batch_no = ?", [batch_no]);
        res.status(200).json({ message: "Inventory batch deleted successfully!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;