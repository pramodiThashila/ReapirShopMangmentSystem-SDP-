const express = require("express");
const router = express.Router(); //initializes an Express router to define routes for operations
const db = require("../config/db");
const { body, param, validationResult } = require("express-validator");

// Middleware for validation errors
const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

//  Get all inventory items
router.get("/all", async (req, res) => {
    try {
        const [inventory] = await db.query("SELECT * FROM Inventory");
        res.status(200).json(inventory);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//  Get  inventory items with qty count
// Get inventory items with quantity count and stock status
router.get("/allBatchcount", async (req, res) => {
    try {
        // Query to get inventory details with total quantity
        const [inventory] = await db.query(`
            SELECT 
                i.inventoryItem_id,
                i.item_name,
                SUM(ib.quantity) AS total_quantity,
                i.outOfStockLevel
            FROM 
                inventory i
            JOIN 
                inventorybatch ib 
            ON 
                i.inventoryItem_id = ib.inventoryItem_id
            GROUP BY 
                i.inventoryItem_id, i.item_name, i.outOfStockLevel
        `);

        // Add stock status to each inventory item
        const inventoryWithStatus = inventory.map(item => { // Map through each item in the inventory array
            const status = item.total_quantity < item.outOfStockLevel ? "Out of Stock" : "In Stock";
            return {
                ...item,//copy all the properties of the item object to the new object
                status // Add the stock status to the new object
            };
        });

        // Send the response
        res.status(200).json(inventoryWithStatus);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


//  Get a single inventory item by ID
router.get(
    "/:inventoryItem_id",
    [param("inventoryItem_id").isInt().withMessage("Inventory ID must be an integer")],
    validateRequest,
    async (req, res) => {
        try {
            const [inventory] = await db.query("SELECT * FROM Inventory WHERE inventoryItem_id = ?", [
                req.params.inventoryItem_id,
            ]);

            if (inventory.length === 0) {
                return res.status(404).json({ message: "Inventory item not found" });
            }

            res.status(200).json(inventory[0]);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
);

// Add a new inventory item
router.post(
    "/addInventory",
    [
        body("item_name")
            .notEmpty().withMessage("Item name is required"),
        body("outOfStockLevel")
            .isInt({ min: 0 })
            .withMessage("Out of Stock Level must be a positive integer"),
    ],
    validateRequest,
    async (req, res) => {
        const {  item_name, outOfStockLevel } = req.body;

        try {
            const [result] = await db.query(
                "INSERT INTO inventory (item_name, outOfStockLevel) VALUES ( ?, ?)",
                [ item_name, outOfStockLevel]
            );

            res.status(201).json({ message: "Inventory item added successfully!", id: result.insertId });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
);

//  Update an inventory item
router.put(
    '/:inventoryItem_id',
    [
        body('item_name')
            .notEmpty().withMessage("Item name is required"),
        body('outOfStockLevel')
            .isInt({ min: 0 }).withMessage('Stock limit must be a positive integer')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { inventoryItem_id } = req.params;
        const { item_name, outOfStockLevel } = req.body;

        try {
            await db.query(
                "UPDATE Inventory SET item_name = ?, outOfStockLevel = ? WHERE inventoryItem_id = ?",
                [item_name, outOfStockLevel, inventoryItem_id]
            );

            res.status(200).json({ message: "Inventory item updated successfully!" });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
);


module.exports = router;
