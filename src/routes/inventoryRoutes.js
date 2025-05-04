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
                COALESCE(SUM(ib.quantity), 0) AS total_quantity,
                i.outOfStockLevel
            FROM 
                inventory i
            LEFT JOIN 
                inventorybatch ib 
            ON 
                i.inventoryItem_id = ib.inventoryItem_id
            GROUP BY 
                i.inventoryItem_id, i.item_name, i.outOfStockLevel
        `);

        // Add stock status to each inventory item
        const inventoryWithStatus = inventory.map(item => {
            let status;
            if (item.total_quantity == 0) {
                status = "Out of Stock";
            } else if (item.total_quantity < item.outOfStockLevel) {
                status = "Limited stock";
            } else {
                status = "In Stock";
            }

            return {
                ...item, // Copy all the properties of the item object to the new object
                status // Add the stock status to the new object
            };
        });

        // Send the response
        res.status(200).json(inventoryWithStatus);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all out-of-stock and near-out-of-stock products
router.get('/lowStock', async (req, res) => {
    try {
        // Query to get inventory items with total quantity and stock status
        const [inventory] = await db.query(`
            SELECT 
                i.inventoryItem_id,
                i.item_name,
                COALESCE(SUM(ib.quantity), 0) AS total_quantity,
                i.outOfStockLevel,
                i.specification
            FROM 
                inventory i
            LEFT JOIN 
                inventorybatch ib 
            ON 
                i.inventoryItem_id = ib.inventoryItem_id
            GROUP BY 
                i.inventoryItem_id, i.item_name, i.outOfStockLevel
            HAVING 
                total_quantity = 0 OR total_quantity < i.outOfStockLevel
        `);

        // Add stock status to each inventory item
        const lowStockItems = inventory.map(item => {
            const status = item.total_quantity == 0 ? "Out of Stock" : "Limited stock";
            return {
                ...item, // Copy all the properties of the item object to the new object
                status // Add the stock status to the new object
            };
        });

        // Send the response
        res.status(200).json({
            message: "Low stock items retrieved successfully",
            items: lowStockItems
        });
    } catch (err) {
        console.error("Error fetching low stock items:", err);
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
        body("specification")
            .isString()
            .withMessage("Specification must be a string")
            .isLength({ max: 100 })
            .withMessage("Specification must be less than 100 characters")    
    ],
    validateRequest,
    async (req, res) => {
        const {  item_name, outOfStockLevel ,specification} = req.body;

        try {
            const [result] = await db.query(
                "INSERT INTO inventory (item_name, outOfStockLevel,specification ) VALUES ( ?, ?,?)",
                [ item_name, outOfStockLevel,specification]
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
