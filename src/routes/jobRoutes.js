const express = require("express");
const db = require("../config/db");
const { body, validationResult } = require("express-validator");
const moment = require("moment");

const router = express.Router();

// Create Job
router.post(
    "/register",
    [
        body("repairDescription")
            .notEmpty().withMessage("Repair description is required")
            .isLength({ max: 255 }).withMessage("Repair description cannot exceed 255 characters"),
        body("repairStatus")
            .notEmpty().withMessage("Repair status is required")
            .isIn(["pending", "on progress", "complete"]).withMessage("Invalid repair status"),
        body("handoverDate")
            .optional({ checkFalsy: true }) // Allows empty/null values
            .custom(value => {
                if (value && !moment(value, "YYYY-MM-DD", true).isValid()) {
                    throw new Error("Invalid date format (YYYY-MM-DD required)");
                }
                return true;
            }),
        body("receiveDate")
            .notEmpty().withMessage("Receive date is required")
            .custom((value, { req }) => {
                if (!moment(value, "YYYY-MM-DD", true).isValid()) {
                    throw new Error("Invalid date format (YYYY-MM-DD required)");
                }
                if (moment(value).isAfter(moment(req.body.handoverDate))) {
                    throw new Error("Receive date cannot be after the handover date");
                }
                return true;
            }),
        body("estimatedTime")
            .notEmpty().withMessage("Estimated time is required")
            .isInt({ min: 1 }).withMessage("Estimated time must be a positive integer (in days)"),
        body("customerID")
            .notEmpty().withMessage("Customer ID is required")
            .isInt().withMessage("Customer ID must be an integer"),
        body("employeeID")
            .notEmpty().withMessage("Employee ID is required")
            .isInt().withMessage("Employee ID must be an integer"),
        body("productID")
            .notEmpty().withMessage("Product ID is required")
            .isInt().withMessage("Product ID must be an integer")
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        try {
            const { repairDescription, repairStatus, handoverDate, receiveDate, estimatedTime, customerID, employeeID, productID } = req.body;
            const [result] = await db.query(
                "INSERT INTO jobs (repair_description, repair_status, handover_date, receive_date, estimated_time, customer_id, employee_id, product_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                [repairDescription, repairStatus, handoverDate, receiveDate, estimatedTime, customerID, employeeID, productID]
            );

            res.status(201).json({ message: "Job created successfully!", jobId: result.insertId });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
);

// Get All Jobs
router.get("/all", async (req, res) => {
    try {
        const [jobs] = await db.query(`
            SELECT 
                j.job_id,
                j.repair_description,
                j.repair_status,
                j.handover_date,
                j.receive_date,
                j.customer_id,
                c.firstName AS customer_name,
                j.employee_id,
                e.first_name AS employee_name,
                j.product_id,
                p.product_image,
                p.product_name
            FROM 
                jobs j
            LEFT JOIN 
                customers c ON j.customer_id = c.customer_id
            LEFT JOIN 
                employees e ON j.employee_id = e.employee_id
            LEFT JOIN 
                products p ON j.product_id = p.product_id
        `);

        res.status(200).json(jobs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get("/eachjob/:id", async (req, res) => {
    try {
        const [jobs] = await db.query(`
            SELECT 
                j.job_id,
                j.repair_description,
                j.repair_status,
                j.handover_date,
                j.receive_date,
                j.customer_id,
                c.firstName AS customer_name,
                j.employee_id,
                e.first_name AS employee_name,
                j.product_id,
                p.product_image,
                p.product_name,
                p.model_no,
                p.model
            FROM 
                jobs j
            LEFT JOIN 
                customers c ON j.customer_id = c.customer_id
            LEFT JOIN 
                employees e ON j.employee_id = e.employee_id
            LEFT JOIN 
                products p ON j.product_id = p.product_id
            WHERE j.job_id = ?
        `, [req.params.id]); // Use parameterized query to prevent SQL injection    

        // Check if the job exists
        if (jobs.length === 0) return res.status(404).json({ message: "Job not found" });

        res.status(200).json(jobs[0]); // Return the first job object
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Get Job by ID
router.get("/:id", async (req, res) => {
    try {
        const [job] = await db.query("SELECT * FROM jobs WHERE job_id = ?", [req.params.id]);
        if (job.length === 0) return res.status(404).json({ message: "Job not found" });

        res.status(200).json(job[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Update Job Details
router.put(
    "/updatejob/:id",
    [
        body("repairDescription")
            .optional()
            .isLength({ max: 255 }).withMessage("Repair description cannot exceed 255 characters"),
        body("repairStatus")
            .optional()
            .isIn(["pending", "on progress", "complete"]).withMessage("Invalid repair status"),
        body("handoverDate")
            .optional({ checkFalsy: true }) // Allows empty/null values
            .custom(value => {
                if (value && !moment(value, "YYYY-MM-DD", true).isValid()) {
                    throw new Error("Invalid date format (YYYY-MM-DD required)");
                }
                return true;
            }),
        body("employeeID")
            .optional()
            .isInt().withMessage("Employee ID must be an integer"),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { repairDescription, repairStatus, handoverDate, employeeID } = req.body;
            const { id } = req.params;

            // Check if the job exists
            const [existingJob] = await db.query("SELECT * FROM jobs WHERE job_id = ?", [id]);
            if (existingJob.length === 0) {
                return res.status(404).json({ message: "Job not found" });
            }

            // Update the job
            await db.query(
                `UPDATE jobs 
                 SET 
                    repair_description = COALESCE(?, repair_description),
                    repair_status = COALESCE(?, repair_status),
                    handover_date = COALESCE(?, handover_date),
                    employee_id = COALESCE(?, employee_id)
                 WHERE job_id = ?`,
                [repairDescription, repairStatus, handoverDate, employeeID, id]
            );

            res.status(200).json({ message: "Job updated successfully!" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
);

// Delete Job
router.delete("/:id", async (req, res) => {
    try {
        await db.query("DELETE FROM jobs WHERE job_id = ?", [req.params.id]);
        res.status(200).json({ message: "Job deleted successfully!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});




module.exports = router;
