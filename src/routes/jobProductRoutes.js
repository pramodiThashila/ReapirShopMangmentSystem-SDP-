const express = require("express");
const db = require("../config/db");
const { body, validationResult } = require("express-validator");
const { upload, uploadToCloudinary } = require("../../middleware/multer");

const router = express.Router();

/**
 * Update both job and its associated product in a single request
 * Handles image uploads to Cloudinary
 */
router.put(
    "/updateJobAndProducts/:jobId",
    upload.single("product_image"),
    [
        // Job validation
        body("repair_description").optional().isLength({ max: 255 })
            .withMessage("Repair description cannot exceed 255 characters"),
        body("repair_status").optional().isIn(["pending", "on progress", "completed", "cancelled"])
            .withMessage("Invalid repair status"),
        body("handover_date").optional().isISO8601()
            .withMessage("Invalid handover date format"),
        body("receive_date").optional()
            .isISO8601().withMessage("Invalid receive date format")
            .custom(value => {
                const receiveDate = new Date(value);
                const today = new Date();

                // Reset time portions for comparison of just the dates
                receiveDate.setHours(0, 0, 0, 0);
                today.setHours(0, 0, 0, 0);

                if (receiveDate > today) {
                    throw new Error("Receive date cannot be in the future");
                }

                return true;
            }),
        body("employee_id").optional().isInt()
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
                repair_description, 
                repair_status, 
                handover_date, 
                receive_date, 
                employee_id,
                
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
                    message: "Job not found" 
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
                    message: "Associated product not found" 
                });
            }

            // Handle image upload to Cloudinary if provided
            let product_image = null;
            if (req.file) {
                try {
                    console.log("Uploading file to Cloudinary:", req.file.path);
                    const result = await uploadToCloudinary(req.file.path);
                    product_image = result.secure_url;
                    console.log("Uploaded to Cloudinary:", product_image);
                } catch (uploadError) {
                    console.error("Error uploading to Cloudinary:", uploadError);
                    await connection.rollback();
                    connection.release();
                    return res.status(500).json({ 
                        error: "Failed to upload image to Cloudinary" 
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
                console.log("Product updated successfully");
            }

            // Update job fields if any are provided
            const jobUpdateFields = [];
            const jobUpdateValues = [];

            if (repair_description) {
                jobUpdateFields.push("repair_description = ?");
                jobUpdateValues.push(repair_description);
            }

            if (repair_status) {
                jobUpdateFields.push("repair_status = ?");
                jobUpdateValues.push(repair_status);
            }

            if (handover_date) {
                jobUpdateFields.push("handover_date = ?");
                jobUpdateValues.push(handover_date);
            }

            if (receive_date) {
                jobUpdateFields.push("receive_date = ?");
                jobUpdateValues.push(receive_date);
            }

            if (employee_id) {
                jobUpdateFields.push("employee_id = ?");
                jobUpdateValues.push(employee_id);
            }

            // Update job if fields were provided
            if (jobUpdateFields.length > 0) {
                const jobQuery = `UPDATE jobs SET ${jobUpdateFields.join(", ")} WHERE job_id = ?`;
                jobUpdateValues.push(jobId);
                
                await connection.query(jobQuery, jobUpdateValues);
                console.log("Job updated successfully");
            }

            // If no updates were made to either job or product
            if (productUpdateFields.length === 0 && jobUpdateFields.length === 0) {
                await connection.rollback();
                connection.release();
                return res.status(400).json({
                    message: "No fields provided for update"
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
            if (error.code === "ER_NO_REFERENCED_ROW_2") {
                if (error.sqlMessage.includes("FOREIGN KEY (`employee_id`)")) {
                    return res.status(400).json({
                        errors: [
                            {
                                type: "field",
                                msg: "Invalid employee ID. Please provide a valid employee ID.",
                                path: "employee_id",
                                location: "body"
                            }
                        ]
                    });
                }
            }
            
            console.error("Update error:", error);
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