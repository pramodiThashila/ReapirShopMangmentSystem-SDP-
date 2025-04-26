const express = require("express");
const db = require("../config/db");
const { body, validationResult } = require("express-validator");
const { upload, uploadToCloudinary } = require("../../middleware/multer"); // Updated import path

const router = express.Router();

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
            
            // Upload to Cloudinary if file exists and store the secure URL
            let product_image = null;
            if (req.file) {
                const result = await uploadToCloudinary(req.file.path, "repair_shop_products");
                product_image = result.secure_url; // Cloudinary URL
            }

            // Check if email already exists
            const [existingCustomer] = await connection.query(
                "SELECT * FROM customers WHERE email = ?",
                [email]
            );
            if (existingCustomer.length > 0) {
                return res.status(400).json({
                    errors: [
                        {
                            type: "field",
                            msg: "Customer with this email already exists",
                            path: "email",
                            location: "body"
                        }
                    ]
                });
            }

            for (let phone of phone_number) {
                const [existingPhone] = await connection.query(
                    "SELECT * FROM telephones_customer WHERE phone_number = ?",
                    [phone]
                );
                if (existingPhone.length > 0) {
                    return res.status(400).json({
                        errors: [
                            {
                                type: "field",
                                msg: `Phone number ${phone} already exists`,
                                path: "phone_number",
                                location: "body"
                            }
                        ]
                    });
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

            // Register Product with Cloudinary URL
            const [productResult] = await connection.query(
                "INSERT INTO products (product_name, model, model_no, product_image,customer_id) VALUES (?, ?, ?,?, ?)",
                [product_name, model, model_no, product_image,customerID] // product_image is now the Cloudinary URL
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
                jobID: jobResult.insertId,
                product_image: product_image // Return the Cloudinary URL in response
            });
        } catch (error) {
            await connection.rollback();

            // Handle specific database errors
            if (error.code === "ER_DUP_ENTRY") {
                const duplicateField = error.sqlMessage.match(/key '(.+?)'/)?.[1];
                return res.status(400).json({
                    errors: [
                        {
                            type: "field",
                            msg: `Duplicate entry detected for field: ${duplicateField}. Please check your input.`,
                            path: duplicateField,
                            location: "body"
                        }
                    ]
                });
            } else if (error.code === "ER_NO_REFERENCED_ROW_2") {
                if (error.sqlMessage.includes("FOREIGN KEY (`employee_id`)")) {
                    return res.status(400).json({
                        errors: [
                            {
                                type: "field",
                                msg: "Invalid employee ID. Please provide a valid employee ID.",
                                path: "employeeID",
                                location: "body"
                            }
                        ]
                    });
                } else if (error.sqlMessage.includes("FOREIGN KEY (`product_id`)")) {
                    return res.status(400).json({
                        errors: [
                            {
                                type: "field",
                                msg: "Invalid product ID. Please provide a valid product ID.",
                                path: "productID",
                                location: "body"
                            }
                        ]
                    });
                } else if (error.sqlMessage.includes("FOREIGN KEY (`customer_id`)")) {
                    return res.status(400).json({
                        errors: [
                            {
                                type: "field",
                                msg: "Invalid customer ID. Please provide a valid customer ID.",
                                path: "customerID",
                                location: "body"
                            }
                        ]
                    });
                }
            }

            // Default error message
            res.status(500).json({
                errors: [
                    {
                        type: "unknown",
                        msg: error.message,
                        path: "unknown",
                        location: "body"
                    }
                ]
            });
        } finally {
            connection.release();
        }
    }
);



// Update both job and its associated product in a single request
router.put(
    "/updateJobAndProduct/:jobId",
    upload.single("product_image"),
    [
        // Job validation
        body("repairDescription").optional().isLength({ max: 255 })
            .withMessage("Repair description cannot exceed 255 characters"),
        body("repairStatus").optional().isIn(["Pending", "In Progress", "Completed", "Cancelled"])
            .withMessage("Invalid repair status"),
        body("handoverDate").optional().isISO8601()
            .withMessage("Invalid handover date format"),
        body("receiveDate").optional().isISO8601()
            .withMessage("Invalid receive date format"),
        body("employeeID").optional().isInt()
            .withMessage("Employee ID must be an integer"),
            
        // Product validation
        body("product_name").optional().isLength({ max: 100 })
            .withMessage("Product name cannot exceed 100 characters"),
        body("model").optional().isLength({ max: 50 })
            .withMessage("Model cannot exceed 50 characters"),
        body("model_no").optional().isLength({ max: 30 })
            .withMessage("Model number cannot exceed 30 characters")
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            const { jobId } = req.params;
            const { 
                // Job fields
                repairDescription, 
                repairStatus, 
                handoverDate, 
                receiveDate, 
                employeeID,
                
                // Product fields
                product_name,
                model,
                model_no
            } = req.body;

            // Check if job exists and get associated product_id
            const [jobResult] = await connection.query(
                "SELECT * FROM jobs WHERE job_id = ?", 
                [jobId]
            );
            
            if (jobResult.length === 0) {
                await connection.rollback();
                connection.release();
                return res.status(404).json({ 
                    errors: [
                        {
                            type: "field",
                            msg: "Job not found",
                            path: "jobId",
                            location: "params"
                        }
                    ]
                });
            }
            
            const productId = jobResult[0].product_id;
            
            // Check if associated product exists
            const [productResult] = await connection.query(
                "SELECT * FROM products WHERE product_id = ?", 
                [productId]
            );
            
            if (productResult.length === 0) {
                await connection.rollback();
                connection.release();
                return res.status(404).json({ 
                    errors: [
                        {
                            type: "field",
                            msg: "Associated product not found",
                            path: "product_id",
                            location: "body"
                        }
                    ]
                });
            }

            // Handle image upload to Cloudinary if provided
            let product_image = null;
            if (req.file) {
                try {
                    const result = await uploadToCloudinary(req.file.path);
                    product_image = result.secure_url;
                } catch (uploadError) {
                    console.error("Error uploading to Cloudinary:", uploadError);
                    await connection.rollback();
                    connection.release();
                    return res.status(500).json({ 
                        errors: [
                            {
                                type: "field",
                                msg: "Failed to upload image to Cloudinary",
                                path: "product_image",
                                location: "body"
                            }
                        ]
                    });
                }
            }

            // Update product fields if any are provided
            const productUpdateFields = [];
            const productUpdateValues = [];

            if (product_name) {
                productUpdateFields.push("product_name = ?");
                productUpdateValues.push(product_name);
            }

            if (model) {
                productUpdateFields.push("model = ?");
                productUpdateValues.push(model);
            }

            if (model_no) {
                productUpdateFields.push("model_no = ?");
                productUpdateValues.push(model_no);
            }

            if (product_image) {
                productUpdateFields.push("product_image = ?");
                productUpdateValues.push(product_image);
            }

            // Update product if fields were provided
            if (productUpdateFields.length > 0) {
                const productQuery = `UPDATE products SET ${productUpdateFields.join(", ")} WHERE product_id = ?`;
                productUpdateValues.push(productId);
                
                await connection.query(productQuery, productUpdateValues);
            }

            // Update job fields if any are provided
            const jobUpdateFields = [];
            const jobUpdateValues = [];

            if (repairDescription) {
                jobUpdateFields.push("repair_description = ?");
                jobUpdateValues.push(repairDescription);
            }

            if (repairStatus) {
                jobUpdateFields.push("repair_status = ?");
                jobUpdateValues.push(repairStatus);
            }

            if (handoverDate) {
                jobUpdateFields.push("handover_date = ?");
                jobUpdateValues.push(handoverDate);
            }

            if (receiveDate) {
                jobUpdateFields.push("receive_date = ?");
                jobUpdateValues.push(receiveDate);
            }

            if (employeeID) {
                jobUpdateFields.push("employee_id = ?");
                jobUpdateValues.push(employeeID);
            }

            // Update job if fields were provided
            if (jobUpdateFields.length > 0) {
                const jobQuery = `UPDATE jobs SET ${jobUpdateFields.join(", ")} WHERE job_id = ?`;
                jobUpdateValues.push(jobId);
                
                await connection.query(jobQuery, jobUpdateValues);
            }

            // If no updates were made to either job or product
            if (productUpdateFields.length === 0 && jobUpdateFields.length === 0) {
                await connection.rollback();
                connection.release();
                return res.status(400).json({
                    errors: [
                        {
                            type: "field",
                            msg: "No fields provided for update",
                            path: "none",
                            location: "body"
                        }
                    ]
                });
            }

            // Commit the transaction
            await connection.commit();

            // Fetch the updated job and product data to return
            const [updatedData] = await connection.query(`
                SELECT j.*, p.product_name, p.model, p.model_no, p.product_image 
                FROM jobs j 
                JOIN products p ON j.product_id = p.product_id 
                WHERE j.job_id = ?
            `, [jobId]);

            res.status(200).json({
                message: "Job and product updated successfully",
                data: updatedData[0]
            });

        } catch (error) {
            await connection.rollback();
            
            // Handle specific database errors
            if (error.code === "ER_DUP_ENTRY") {
                const duplicateField = error.sqlMessage.match(/key '(.+?)'/)?.[1];
                return res.status(400).json({
                    errors: [
                        {
                            type: "field",
                            msg: `Duplicate entry detected for field: ${duplicateField}. Please check your input.`,
                            path: duplicateField,
                            location: "body"
                        }
                    ]
                });
            } else if (error.code === "ER_NO_REFERENCED_ROW_2") {
                if (error.sqlMessage.includes("FOREIGN KEY (`employee_id`)")) {
                    return res.status(400).json({
                        errors: [
                            {
                                type: "field",
                                msg: "Invalid employee ID. Please provide a valid employee ID.",
                                path: "employeeID",
                                location: "body"
                            }
                        ]
                    });
                }
            }
            
            // Default error message
            res.status(500).json({
                errors: [
                    {
                        type: "unknown",
                        msg: error.message,
                        path: "unknown",
                        location: "body"
                    }
                ]
            });
        } finally {
            connection.release();
        }
    }
);
 
// Route to register new job and product for existing customer
router.post(
    "/registerJobProduct",
    upload.single("product_image"),
    [
        // Customer validation
        body("customer_id")
            .notEmpty().withMessage("Customer ID is required")
            .isInt().withMessage("Customer ID must be an integer"),

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
            const { customer_id, product_name, model, model_no, repairDescription, receiveDate, employeeID } = req.body;
            
            // Check if customer exists
            const [existingCustomer] = await connection.query(
                "SELECT * FROM customers WHERE customer_id = ?",
                [customer_id]
            );
            
            if (existingCustomer.length === 0) {
                return res.status(404).json({
                    errors: [
                        {
                            type: "field",
                            msg: "Customer not found. Please provide a valid customer ID.",
                            path: "customer_id",
                            location: "body"
                        }
                    ]
                });
            }
            
            // Check if employee exists
            const [existingEmployee] = await connection.query(
                "SELECT * FROM employees WHERE employee_id = ?",
                [employeeID]
            );
            
            if (existingEmployee.length === 0) {
                return res.status(404).json({
                    errors: [
                        {
                            type: "field",
                            msg: "Employee not found. Please provide a valid employee ID.",
                            path: "employeeID",
                            location: "body"
                        }
                    ]
                });
            }
            
            // Upload to Cloudinary if file exists and store the secure URL
            let product_image = null;
            if (req.file) {
                try {
                    const result = await uploadToCloudinary(req.file.path, "repair_shop_products");
                    product_image = result.secure_url; // Cloudinary URL
                } catch (uploadError) {
                    console.error("Error uploading to Cloudinary:", uploadError);
                    throw new Error("Failed to upload product image");
                }
            }

            // Register Product with Cloudinary URL
            const [productResult] = await connection.query(
                "INSERT INTO products (product_name, model, model_no, product_image,customer_id) VALUES (?, ?, ?, ?,?)",
                [product_name, model, model_no, product_image,customer_id]
            );
            const productID = productResult.insertId;

            // Register Job with the existing customer ID
            const [jobResult] = await connection.query(
                "INSERT INTO jobs (repair_description, repair_status, receive_date, customer_id, employee_id, product_id) VALUES (?, ?, ?, ?, ?, ?)",
                [repairDescription, "pending", receiveDate, customer_id, employeeID, productID]
            );
            const jobID = jobResult.insertId;

            // Commit the transaction
            await connection.commit();

            // Fetch complete job with customer and product details
            const [jobDetails] = await connection.query(`
                SELECT 
                    j.job_id, 
                    j.repair_description, 
                    j.repair_status,
                    j.receive_date,
                    j.customer_id, 
                    c.firstName, 
                    c.lastName,
                    j.employee_id,
                    e.first_name AS employee_name,
                    j.product_id,
                    p.product_name,
                    p.model,
                    p.model_no,
                    p.product_image
                FROM jobs j
                JOIN customers c ON j.customer_id = c.customer_id
                JOIN employees e ON j.employee_id = e.employee_id
                JOIN products p ON j.product_id = p.product_id
                WHERE j.job_id = ?
            `, [jobID]);

            res.status(201).json({
                message: "Job and Product registered successfully for existing customer!",
                jobID,
                productID,
                customer_id,
                data: jobDetails[0]
            });
        } catch (error) {
            await connection.rollback();

            // Handle specific database errors
            if (error.code === "ER_DUP_ENTRY") {
                const duplicateField = error.sqlMessage.match(/key '(.+?)'/)?.[1];
                return res.status(400).json({
                    errors: [
                        {
                            type: "field",
                            msg: `Duplicate entry detected for field: ${duplicateField}. Please check your input.`,
                            path: duplicateField,
                            location: "body"
                        }
                    ]
                });
            } else if (error.code === "ER_NO_REFERENCED_ROW_2") {
                if (error.sqlMessage.includes("FOREIGN KEY (`employee_id`)")) {
                    return res.status(400).json({
                        errors: [
                            {
                                type: "field",
                                msg: "Invalid employee ID. Please provide a valid employee ID.",
                                path: "employeeID",
                                location: "body"
                            }
                        ]
                    });
                } else if (error.sqlMessage.includes("FOREIGN KEY (`customer_id`)")) {
                    return res.status(400).json({
                        errors: [
                            {
                                type: "field",
                                msg: "Invalid customer ID. Please provide a valid customer ID.",
                                path: "customer_id",
                                location: "body"
                            }
                        ]
                    });
                }
            }

            // Default error message
            res.status(500).json({
                errors: [
                    {
                        type: "unknown",
                        msg: error.message,
                        path: "unknown",
                        location: "body"
                    }
                ]
            });
        } finally {
            connection.release();
        }
    }
);

// Route to register new job with existing customer and product
router.post(
    "/registerJobWithExisting",
    [
        // Customer validation
        body("customer_id")
            .notEmpty().withMessage("Customer ID is required")
            .isInt().withMessage("Customer ID must be an integer"),

        // Product validation
        body("product_id")
            .notEmpty().withMessage("Product ID is required")
            .isInt().withMessage("Product ID must be an integer"),

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
            const { customer_id, product_id, repairDescription, receiveDate, employeeID } = req.body;
            
            // Check if customer exists
            const [existingCustomer] = await connection.query(
                "SELECT * FROM customers WHERE customer_id = ?",
                [customer_id]
            );
            
            if (existingCustomer.length === 0) {
                return res.status(404).json({
                    errors: [
                        {
                            type: "field",
                            msg: "Customer not found. Please provide a valid customer ID.",
                            path: "customer_id",
                            location: "body"
                        }
                    ]
                });
            }
            
            // Check if product exists
            const [existingProduct] = await connection.query(
                "SELECT * FROM products WHERE product_id = ?",
                [product_id]
            );
            
            if (existingProduct.length === 0) {
                return res.status(404).json({
                    errors: [
                        {
                            type: "field",
                            msg: "Product not found. Please provide a valid product ID.",
                            path: "product_id",
                            location: "body"
                        }
                    ]
                });
            }
            
            // Check if employee exists
            const [existingEmployee] = await connection.query(
                "SELECT * FROM employees WHERE employee_id = ?",
                [employeeID]
            );
            
            if (existingEmployee.length === 0) {
                return res.status(404).json({
                    errors: [
                        {
                            type: "field",
                            msg: "Employee not found. Please provide a valid employee ID.",
                            path: "employeeID",
                            location: "body"
                        }
                    ]
                });
            }

            // Check if there's an active job for this product
            const [activeJobs] = await connection.query(
                "SELECT * FROM jobs WHERE product_id = ? AND repair_status != 'completed' AND repair_status != 'cancelled'",
                [product_id]
            );
            
            if (activeJobs.length > 0) {
                return res.status(400).json({
                    errors: [
                        {
                            type: "field",
                            msg: "This product already has an active repair job. Complete or cancel the existing job before creating a new one.",
                            path: "product_id",
                            location: "body"
                        }
                    ]
                });
            }

            // Register Job with the existing customer ID and product ID
            const [jobResult] = await connection.query(
                "INSERT INTO jobs (repair_description, repair_status, receive_date, customer_id, employee_id, product_id) VALUES (?, ?, ?, ?, ?, ?)",
                [repairDescription, "pending", receiveDate, customer_id, employeeID, product_id]
            );
            const jobID = jobResult.insertId;

            // Commit the transaction
            await connection.commit();

            // Fetch complete job with customer and product details
            const [jobDetails] = await connection.query(`
                SELECT 
                    j.job_id, 
                    j.repair_description, 
                    j.repair_status,
                    j.receive_date,
                    j.customer_id, 
                    c.firstName, 
                    c.lastName,
                    c.email,
                    c.type,
                    j.employee_id,
                    e.first_name AS employee_name,
                    j.product_id,
                    p.product_name,
                    p.model,
                    p.model_no,
                    p.product_image
                FROM jobs j
                JOIN customers c ON j.customer_id = c.customer_id
                JOIN employees e ON j.employee_id = e.employee_id
                JOIN products p ON j.product_id = p.product_id
                WHERE j.job_id = ?
            `, [jobID]);

            // Get customer phone numbers
            const [phoneNumbers] = await connection.query(
                "SELECT phone_number FROM telephones_customer WHERE customer_id = ?",
                [customer_id]
            );

            // Format phone numbers
            const formattedPhoneNumbers = phoneNumbers.map(phone => phone.phone_number);

            // Add phone numbers to the response
            const responseData = {
                ...jobDetails[0],
                phone_numbers: formattedPhoneNumbers
            };

            res.status(201).json({
                message: "Job registered successfully with existing customer and product!",
                jobID,
                data: responseData
            });
        } catch (error) {
            await connection.rollback();

            // Handle specific database errors
            if (error.code === "ER_DUP_ENTRY") {
                const duplicateField = error.sqlMessage.match(/key '(.+?)'/)?.[1];
                return res.status(400).json({
                    errors: [
                        {
                            type: "field",
                            msg: `Duplicate entry detected for field: ${duplicateField}. Please check your input.`,
                            path: duplicateField,
                            location: "body"
                        }
                    ]
                });
            } else if (error.code === "ER_NO_REFERENCED_ROW_2") {
                if (error.sqlMessage.includes("FOREIGN KEY (`employee_id`)")) {
                    return res.status(400).json({
                        errors: [
                            {
                                type: "field",
                                msg: "Invalid employee ID. Please provide a valid employee ID.",
                                path: "employeeID",
                                location: "body"
                            }
                        ]
                    });
                } else if (error.sqlMessage.includes("FOREIGN KEY (`customer_id`)")) {
                    return res.status(400).json({
                        errors: [
                            {
                                type: "field",
                                msg: "Invalid customer ID. Please provide a valid customer ID.",
                                path: "customer_id",
                                location: "body"
                            }
                        ]
                    });
                } else if (error.sqlMessage.includes("FOREIGN KEY (`product_id`)")) {
                    return res.status(400).json({
                        errors: [
                            {
                                type: "field",
                                msg: "Invalid product ID. Please provide a valid product ID.",
                                path: "product_id",
                                location: "body"
                            }
                        ]
                    });
                }
            }

            // Default error message
            res.status(500).json({
                errors: [
                    {
                        type: "unknown",
                        msg: error.message,
                        path: "unknown",
                        location: "body"
                    }
                ]
            });
        } finally {
            connection.release();
        }
    }
);


// Route to register new job with existing customer and product
router.post(
    "/registerJobWithExisting",
    [
        // Customer validation
        body("customer_id")
            .notEmpty().withMessage("Customer ID is required")
            .isInt().withMessage("Customer ID must be an integer"),

        // Product validation
        body("product_id")
            .notEmpty().withMessage("Product ID is required")
            .isInt().withMessage("Product ID must be an integer"),

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
            const { customer_id, product_id, repairDescription, receiveDate, employeeID } = req.body;
            
            // Check if customer exists
            const [existingCustomer] = await connection.query(
                "SELECT * FROM customers WHERE customer_id = ?",
                [customer_id]
            );
            
            if (existingCustomer.length === 0) {
                return res.status(404).json({
                    errors: [
                        {
                            type: "field",
                            msg: "Customer not found. Please provide a valid customer ID.",
                            path: "customer_id",
                            location: "body"
                        }
                    ]
                });
            }
            
            // Check if product exists
            const [existingProduct] = await connection.query(
                "SELECT * FROM products WHERE product_id = ?",
                [product_id]
            );
            
            if (existingProduct.length === 0) {
                return res.status(404).json({
                    errors: [
                        {
                            type: "field",
                            msg: "Product not found. Please provide a valid product ID.",
                            path: "product_id",
                            location: "body"
                        }
                    ]
                });
            }
            
            // Check if employee exists
            const [existingEmployee] = await connection.query(
                "SELECT * FROM employees WHERE employee_id = ?",
                [employeeID]
            );
            
            if (existingEmployee.length === 0) {
                return res.status(404).json({
                    errors: [
                        {
                            type: "field",
                            msg: "Employee not found. Please provide a valid employee ID.",
                            path: "employeeID",
                            location: "body"
                        }
                    ]
                });
            }

            // Check if there's an active job for this product
            const [activeJobs] = await connection.query(
                "SELECT * FROM jobs WHERE product_id = ? AND repair_status != 'completed' AND repair_status != 'cancelled'",
                [product_id]
            );
            
            if (activeJobs.length > 0) {
                return res.status(400).json({
                    errors: [
                        {
                            type: "field",
                            msg: "This product already has an active repair job. Complete or cancel the existing job before creating a new one.",
                            path: "product_id",
                            location: "body"
                        }
                    ]
                });
            }

            // Register Job with the existing customer ID and product ID
            const [jobResult] = await connection.query(
                "INSERT INTO jobs (repair_description, repair_status, receive_date, customer_id, employee_id, product_id) VALUES (?, ?, ?, ?, ?, ?)",
                [repairDescription, "pending", receiveDate, customer_id, employeeID, product_id]
            );
            const jobID = jobResult.insertId;

            // Commit the transaction
            await connection.commit();

            // Fetch complete job with customer and product details
            const [jobDetails] = await connection.query(`
                SELECT 
                    j.job_id, 
                    j.repair_description, 
                    j.repair_status,
                    j.receive_date,
                    j.customer_id, 
                    c.firstName, 
                    c.lastName,
                    c.email,
                    c.type,
                    j.employee_id,
                    e.first_name AS employee_name,
                    j.product_id,
                    p.product_name,
                    p.model,
                    p.model_no,
                    p.product_image
                FROM jobs j
                JOIN customers c ON j.customer_id = c.customer_id
                JOIN employees e ON j.employee_id = e.employee_id
                JOIN products p ON j.product_id = p.product_id
                WHERE j.job_id = ?
            `, [jobID]);

            // Get customer phone numbers
            const [phoneNumbers] = await connection.query(
                "SELECT phone_number FROM telephones_customer WHERE customer_id = ?",
                [customer_id]
            );

            // Format phone numbers
            const formattedPhoneNumbers = phoneNumbers.map(phone => phone.phone_number);

            // Add phone numbers to the response
            const responseData = {
                ...jobDetails[0],
                phone_numbers: formattedPhoneNumbers
            };

            res.status(201).json({
                message: "Job registered successfully with existing customer and product!",
                jobID,
                data: responseData
            });
        } catch (error) {
            await connection.rollback();

            // Handle specific database errors
            if (error.code === "ER_DUP_ENTRY") {
                const duplicateField = error.sqlMessage.match(/key '(.+?)'/)?.[1];
                return res.status(400).json({
                    errors: [
                        {
                            type: "field",
                            msg: `Duplicate entry detected for field: ${duplicateField}. Please check your input.`,
                            path: duplicateField,
                            location: "body"
                        }
                    ]
                });
            } else if (error.code === "ER_NO_REFERENCED_ROW_2") {
                if (error.sqlMessage.includes("FOREIGN KEY (`employee_id`)")) {
                    return res.status(400).json({
                        errors: [
                            {
                                type: "field",
                                msg: "Invalid employee ID. Please provide a valid employee ID.",
                                path: "employeeID",
                                location: "body"
                            }
                        ]
                    });
                } else if (error.sqlMessage.includes("FOREIGN KEY (`customer_id`)")) {
                    return res.status(400).json({
                        errors: [
                            {
                                type: "field",
                                msg: "Invalid customer ID. Please provide a valid customer ID.",
                                path: "customer_id",
                                location: "body"
                            }
                        ]
                    });
                } else if (error.sqlMessage.includes("FOREIGN KEY (`product_id`)")) {
                    return res.status(400).json({
                        errors: [
                            {
                                type: "field",
                                msg: "Invalid product ID. Please provide a valid product ID.",
                                path: "product_id",
                                location: "body"
                            }
                        ]
                    });
                }
            }

            // Default error message
            res.status(500).json({
                errors: [
                    {
                        type: "unknown",
                        msg: error.message,
                        path: "unknown",
                        location: "body"
                    }
                ]
            });
        } finally {
            connection.release();
        }
    }
);

module.exports = router;