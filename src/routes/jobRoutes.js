const express = require("express");
const db = require("../config/db");
const { body, validationResult } = require("express-validator");
const moment = require("moment");

const router = express.Router();

// Create Job

{/*router.post(
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
                "INSERT INTO jobs (repair_description, repair_status, handover_date, receive_date, customer_id, employee_id, product_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                [repairDescription, repairStatus, handoverDate, receiveDate, customerID, employeeID, productID]
            );

            res.status(201).json({ message: "Job created successfully!", jobId: result.insertId });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
);*/}

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
                j.is_a_warrentyClaim,
                j.feedback,
                j.rating,
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

// Get All Jobs
router.get("/getallfeedbacks", async (req, res) => {
    try {
        const [jobs] = await db.query(`
            SELECT 
                j.job_id,
                j.repair_description,
                j.repair_status,
                j.handover_date,
                j.receive_date,
                j.customer_id,
                j.is_a_warrentyClaim,
                j.feedback,
                j.rating,
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
            WHERE 
                feedback IS NOT NULL 
            ORDER BY 
                j.receive_date DESC    
        `);

        res.status(200).json(jobs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Jobs by Employee ID
router.get("/myjobs/:employeeId", async (req, res) => {
    try {
        const { employeeId } = req.params;
        
        // Validate employeeId is a number
        if (isNaN(employeeId)) {
            return res.status(400).json({ 
                error: "Invalid employee ID. Employee ID must be a number." 
            });
        }
        
        const [jobs] = await db.query(`
            SELECT 
                j.job_id,
                j.repair_description,
                j.repair_status,
                j.handover_date,
                j.receive_date,
                j.customer_id,
                c.firstName AS customer_name,
                c.lastName,
                j.employee_id,
                e.first_name AS employee_name,
                j.product_id,
                p.product_image,
                p.product_name,
                p.model,
                p.model_no
            FROM 
                jobs j
            LEFT JOIN 
                customers c ON j.customer_id = c.customer_id
            LEFT JOIN 
                employees e ON j.employee_id = e.employee_id
            LEFT JOIN 
                products p ON j.product_id = p.product_id
            WHERE 
                j.employee_id = ?
            ORDER BY
                j.receive_date DESC
        `, [employeeId]);

        if (jobs.length === 0) {
            return res.status(200).json({
                message: "No jobs found for this employee",
                jobs: []
            });
        }

        res.status(200).json(jobs);
    } catch (error) {
        console.error("Error fetching employee jobs:", error);
        res.status(500).json({ error: error.message });
    }
});

// Get job ID(s) based on phone number
router.get('/jobsByPhone/:phoneNumber', async (req, res) => {
    const { phoneNumber } = req.params;

    try {
        const query = `
            SELECT 
                j.job_id,
                j.repair_description,
                j.repair_status,
                j.receive_date,
                j.handover_date,
                c.customer_id,
                CONCAT(c.firstName, ' ', c.lastName) AS customer_name,
                c.email AS customer_email,
                p.product_id,
                p.product_name,
                p.model,
                p.model_no
            FROM 
                jobs j
            JOIN 
                customers c ON j.customer_id = c.customer_id
            JOIN 
                telephones_customer tc ON c.customer_id = tc.customer_id
            JOIN 
                products p ON j.product_id = p.product_id
            WHERE 
                tc.phone_number = ?
            ORDER BY 
                j.receive_date DESC;
        `;

        const [jobs] = await db.query(query, [phoneNumber]);

        if (jobs.length === 0) {
            return res.status(404).json({ message: 'No jobs found for the provided phone number' });
        }

        res.status(200).json({
            message: 'Jobs retrieved successfully',
            jobs: jobs
        });
    } catch (error) {
        console.error('Error fetching jobs by phone number:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

//register a warrenty claim
router.post("/registerWarrantyJob", async (req, res) => {
    const { employee_id, customer_id, product_id, repair_description, receive_date ,oldjobid} = req.body;
  
    try {
      // Insert the new job into the database
      const job = await db.query(
        `INSERT INTO jobs (employee_id, customer_id, product_id, repair_description, receive_date, repair_status,is_a_warrentyClaim)
         VALUES (?, ?, ?, ?, ?, 'Pending',1)`,
        [employee_id, customer_id, product_id, repair_description, receive_date]
      );

      const invoice = await db.query(`Update invoice SET Is_warranty_claimed = 1 WHERE job_id = ?`, [oldjobid]);
  
      res.status(201).json({ message: "Warranty job registered successfully!" });
    } catch (error) {
      console.error("Error registering warranty job:", error);
      res.status(500).json({ message: "Failed to register warranty job." });
    }
  });

//get each job details
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


// Update feedback and rating for a job
router.put('/updateFeedback/:jobId', [
    body('feedback')
        .optional()
        .isString().withMessage('Feedback must be a string')
        .isLength({ max: 500 }).withMessage('Feedback cannot exceed 500 characters'),
    body('rating')
        .optional()
        .isInt({ min: 1, max: 5 }).withMessage('Rating must be an integer between 1 and 5')
], async (req, res) => {
    const { jobId } = req.params;
    const { feedback, rating } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        // Check if the job exists
        const [existingJob] = await db.query("SELECT * FROM jobs WHERE job_id = ?", [jobId]);
        if (existingJob.length === 0) {
            return res.status(404).json({ message: "Job not found" });
        }

        // Update feedback and rating
        await db.query(
            `UPDATE jobs 
             SET 
                feedback = COALESCE(?, feedback),
                rating = COALESCE(?, rating)
             WHERE job_id = ?`,
            [feedback, rating, jobId]
        );

        res.status(200).json({ message: "Feedback and rating updated successfully!" });
    } catch (error) {
        console.error('Error updating feedback and rating:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});





// Delete Job
router.delete("/:id", async (req, res) => {
    try {
        await db.query("DELETE FROM jobs WHERE job_id = ?", [req.params.id]);
        res.status(200).json({ message: "Job deleted successfully!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Get warranty-eligible job list with customer, job, and employee details
router.get('/get/warrantyEligibleJobs', async (req, res) => {
    try {
        const query = `
            SELECT 
                i.Invoice_Id,
                j.job_id,
                j.repair_description,
                j.repair_status,
                j.receive_date,
                j.handover_date,
                c.customer_id,
                CONCAT(c.firstName, ' ', c.lastName) AS customer_name,
                c.email AS customer_email,
                e.employee_id,
                CONCAT(e.first_name, ' ', e.last_name) AS employee_name,
                e.role AS employee_role,
                p.product_id,
                p.product_name,
                p.model,
                p.model_no,
                i.TotalCost_for_Parts,
                i.Labour_Cost,
                i.Total_Amount,
                i.Is_warranty_claimed,
                i.warranty_exp_date,
                CASE 
                    WHEN i.warranty_exp_date >= CURDATE() THEN 'Active'
                    ELSE 'Expired'
                END AS warranty_status,
                CASE 
                    WHEN i.Is_warranty_claimed = 1 THEN 'warranty claimed'
                    ELSE 'not claimed'
                END AS warranty_claim_status
            FROM 
                invoice i
            JOIN 
                jobs j ON i.job_id = j.job_id
            JOIN 
                customers c ON i.customer_id = c.customer_id
            JOIN 
                employees e ON i.employee_id = e.employee_id
            JOIN 
                products p ON j.product_id = p.product_id
            WHERE 
                i.warranty = 1 -- Only include warranty-eligible jobs
            ORDER BY 
                i.warranty_exp_date DESC;
        `;

        const [warrantyJobs] = await db.query(query);

        if (warrantyJobs.length === 0) {
            return res.status(404).json({ message: 'No warranty-eligible jobs found' });
        }

        res.status(200).json({
            message: 'Warranty-eligible jobs retrieved successfully',
            jobs: warrantyJobs
        });
    } catch (error) {
        console.error('Error fetching warranty-eligible jobs:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


module.exports = router;
