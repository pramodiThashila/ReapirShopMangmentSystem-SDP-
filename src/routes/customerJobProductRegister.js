const express = require("express");
const db = require("../config/db");
const { body, validationResult } = require("express-validator");
const multer = require("multer");
const path = require("path");

const router = express.Router();

// Multer setup for storing uploaded images
const storage = multer.diskStorage({
    destination: "./uploads/",
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// Combined API
router.post(
    "/registerAll",
    upload.single("product_image"), // Accepts a single file for the product image
    [
        // Customer validation
        body("firstName")
            .notEmpty().withMessage("First name is mandatory")
            .isLength({ max: 10 }).withMessage("First name should not exceed 10 characters"),
        body("lastName")
            .notEmpty().withMessage("Last name is mandatory")
            .isLength({ max: 20 }).withMessage("Last name should not exceed 20 characters"),
        body("email")
            .notEmpty().withMessage("Email is mandatory")
            .isEmail().withMessage("Invalid email format"),
        body("type")
            .notEmpty().withMessage("Customer type is mandatory")
            .isIn(["Regular", "Normal"]).withMessage("Customer type should be either 'Regular' or 'Normal'"),
        body("phone_number")
            .isArray().withMessage("Phone numbers should be an array")
            .custom((phone_number) => {
                for (let phone of phone_number) {
                    if (!/^07\d{8}$/.test(phone)) {
                        throw new Error("Telephone number should contain 10 digits and start with 07");
                    }
                }
                return true;
            }),

        // Product validation
        body("product_name")
            .notEmpty().withMessage("Product name is required")
            .isLength({ max: 100 }).withMessage("Product name cannot exceed 100 characters"),
        body("model")
            .notEmpty().withMessage("Model is required")
            .isLength({ max: 50 }).withMessage("Model cannot exceed 50 characters"),
        body("model_no")
            .notEmpty().withMessage("Model number is required")
            .isLength({ max: 30 }).withMessage("Model number cannot exceed 30 characters"),

        // Job validation
        body("repairDescription")
            .notEmpty().withMessage("Repair description is required")
            .isLength({ max: 255 }).withMessage("Repair description cannot exceed 255 characters"),
        body("receiveDate")
            .notEmpty().withMessage("Receive date is required")
            .isISO8601().withMessage("Invalid date format (YYYY-MM-DD required)"),
        body("employeeID")
            .notEmpty().withMessage("Employee ID is required")
            .isInt().withMessage("Employee ID must be an integer")
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            const { firstName, lastName, email, type, phone_number, product_name, model, model_no, repairDescription, receiveDate, employeeID } = req.body;
            const product_image = req.file ? `/uploads/${req.file.filename}` : null;

            // Check if email already exists
            const [existingCustomer] = await connection.query(
                "SELECT * FROM customers WHERE email = ?",
                [email]
            );
            if (existingCustomer.length > 0) {
                return res.status(400).json({ message: "Customer with this email already exists" });
            }

            for (let phone of phone_number) {
                const [existingPhone] = await connection.query(
                    "SELECT * FROM telephones_customer WHERE phone_number = ?",
                    [phone]
                );
                if (existingPhone.length > 0) {
                    return res.status(400).json({ message: `Phone number ${phone} already exists` });
                }
            }

            // Register Customer
            const [customerResult] = await connection.query(
                "INSERT INTO customers (firstName, lastName, email, type) VALUES (?, ?, ?, ?)",
                [firstName, lastName, email, type]
            );
            const customerID = customerResult.insertId;

            // Insert customer phone numbers
            if (phone_number.length > 0) {
                const phoneValues = phone_number.map(phone => [customerID, phone]);
                await connection.query("INSERT INTO telephones_customer (customer_id, phone_number) VALUES ?", [phoneValues]);
            }

            // Register Product
            const [productResult] = await connection.query(
                "INSERT INTO products (product_name, model, model_no, product_image) VALUES (?, ?, ?, ?)",
                [product_name, model, model_no, product_image]
            );
            const productID = productResult.insertId;

            // Register Job
            const [jobResult] = await connection.query(
                "INSERT INTO jobs (repair_description, receive_date, customer_id, employee_id, product_id) VALUES (?, ?, ?, ?, ?)",
                [repairDescription, receiveDate, customerID, employeeID, productID]
            );

            // Commit the transaction
            await connection.commit();

            res.status(201).json({
                message: "Customer, Product, and Job registered successfully!",
                customerID,
                productID,
                jobID: jobResult.insertId
            });
        } catch (error) {
            await connection.rollback();

            // Handle specific database errors
            if (error.code === "ER_DUP_ENTRY") {
                const duplicateField = error.sqlMessage.match(/key '(.+?)'/)?.[1];
                return res.status(400).json({
                    message: `Duplicate entry detected for field: ${duplicateField}. Please check your input.`,
                    field: duplicateField
                });
            } else if (error.code === "ER_NO_REFERENCED_ROW_2") {
                if (error.sqlMessage.includes("FOREIGN KEY (`employee_id`)")) {
                    return res.status(400).json({
                        message: "Invalid employee ID. Please provide a valid employee ID.",
                        field: "employeeID"
                    });
                } else if (error.sqlMessage.includes("FOREIGN KEY (`product_id`)")) {
                    return res.status(400).json({
                        message: "Invalid product ID. Please provide a valid product ID.",
                        field: "productID"
                    });
                } else if (error.sqlMessage.includes("FOREIGN KEY (`customer_id`)")) {
                    return res.status(400).json({
                        message: "Invalid customer ID. Please provide a valid customer ID.",
                        field: "customerID"
                    });
                }
            }

            // Default error message
            res.status(500).json({ error: error.message });
        } finally {
            connection.release();
        }
    }
);

module.exports = router;