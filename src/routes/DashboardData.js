const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/db');
const moment = require('moment');

const router = express.Router();

// Admin Dashboard API
router.get('/admin-dashboard/:employee_id', async (req, res) => {
    const { employee_id } = req.params;

    try {
        // Get the current month and year
        const currentMonth = moment().format('YYYY-MM');
        const startOfMonth = `${currentMonth}-01`;
        const endOfMonth = moment(startOfMonth).endOf('month').format('YYYY-MM-DD');

        // Get the current year
        const currentYear = moment().format('YYYY');
        const startOfYear = `${currentYear}-01-01`;
        const endOfYear = `${currentYear}-12-31`;

       

        // Queries for dashboard data
        const queries = {
            totalJobsRegistered: `
                SELECT COUNT(*) AS totalJobsRegistered
                FROM jobs
                WHERE DATE(receive_date) BETWEEN ? AND ?;
            `,
            totalJobsCompleted: `
                SELECT COUNT(*) AS totalJobsCompleted
                FROM invoice
                WHERE DATE(Date) BETWEEN ? AND ?;
            `,
            totalIncome: `
                SELECT SUM(Total_Amount) AS totalIncome
                FROM invoice
                WHERE DATE(Date) BETWEEN ? AND ?;
            `,
            totalInventoryPurchases: `
                SELECT COUNT(*) AS totalPurchases, SUM(total) AS totalPurchaseAmount
                FROM InventoryPurchase
                WHERE DATE(purchaseDate) BETWEEN ? AND ?;
            `,
            outOfStockProducts: `
                SELECT COUNT(*) AS outOfStockCount
                FROM (
                    SELECT 
                        i.inventoryItem_id
                    FROM 
                        inventory i
                    LEFT JOIN 
                        inventorybatch ib ON i.inventoryItem_id = ib.inventoryItem_id
                    GROUP BY 
                        i.inventoryItem_id
                    HAVING 
                        COALESCE(SUM(ib.quantity), 0) = 0
                ) AS out_of_stock_items;
            `,
            employeeCount: `
                SELECT COUNT(*) AS employeeCount
                FROM employees
                WHERE is_active = 1;
            `,
            activeRepairs: `
                SELECT COUNT(*) AS activeRepairs
                FROM jobs
                WHERE repair_status IN ('pending', 'on progress');
            `,
            myIncompleteJobs: `
                SELECT COUNT(*) AS myIncompleteJobs
                FROM jobs
                WHERE employee_id = ? AND repair_status != 'completed';
            `,
            pendingJobs: `
                SELECT COUNT(job_id) AS pendingJobs
                FROM jobs
                WHERE repair_status = "pending";
            `,
            completedJobs: `
                SELECT COUNT(job_id) AS completedJobs
                FROM jobs
                WHERE DATE(receive_date) BETWEEN ? AND ? AND repair_status = "completed";
            `,
            cancelledJobs: `
                SELECT COUNT(job_id) AS cancelledJobs
                FROM jobs
                WHERE DATE(receive_date) BETWEEN ? AND ? AND repair_status = "cancelled";
            `,
            onProgress: `
                SELECT COUNT(job_id) AS onProgressJobs
                FROM jobs
                WHERE repair_status = "on progress";
            `
        };

        // Execute queries
        const [
            [totalJobsRegistered],
            [totalJobsCompleted],
            [totalIncome],
            [totalInventoryPurchases],
            [outOfStockProducts],
            [employeeCount],
            [activeRepairs],
            [myIncompleteJobs],
            [pendingJobs],
            [completedJobs],
            [cancelledJobs],
            [onProgressJobs]
        ] = await Promise.all([
            db.query(queries.totalJobsRegistered, [startOfMonth, endOfMonth]),
            db.query(queries.totalJobsCompleted, [startOfMonth, endOfMonth]),
            db.query(queries.totalIncome, [startOfMonth, endOfMonth]),
            db.query(queries.totalInventoryPurchases, [startOfMonth, endOfMonth]),
            db.query(queries.outOfStockProducts),
            db.query(queries.employeeCount),
            db.query(queries.activeRepairs),
            db.query(queries.myIncompleteJobs, [employee_id]),
            db.query(queries.pendingJobs),
            db.query(queries.completedJobs, [startOfYear, endOfYear]),
            db.query(queries.cancelledJobs, [startOfYear, endOfYear]),
            db.query(queries.onProgress)
        ]);

        

        // Prepare response
        const response = {
            totalJobsRegistered: totalJobsRegistered || 0,
            totalJobsCompleted: totalJobsCompleted|| 0,
            totalIncome: totalIncome || 0,
            totalInventoryPurchases: {
                count: totalInventoryPurchases || 0,
                amount: totalInventoryPurchases || 0
            },
            outOfStockProducts: outOfStockProducts || 0,
            employeeCount: employeeCount || 0,
            activeRepairs: activeRepairs || 0,
            myIncompleteJobs: myIncompleteJobs || 0,
            pendingJobs: pendingJobs || 0,
            completedJobs: completedJobs|| 0,
            cancelledJobs: cancelledJobs|| 0,
            onProgressJobs: onProgressJobs|| 0
        };

        res.status(200).json(response);
    } catch (error) {
        console.error('Error fetching admin dashboard data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/employee-jobs/:employee_id', async (req, res) => {
    const { employee_id } = req.params;

    try {
        // Queries to get counts of "on progress" and "pending" jobs for the employee
        const queries = {
            pendingJobs: `
                SELECT COUNT(job_id) AS pendingJobs
                FROM jobs
                WHERE employee_id = ? AND repair_status = "pending";
            `,
            onProgressJobs: `
                SELECT COUNT(job_id) AS onProgressJobs
                FROM jobs
                WHERE employee_id = ? AND repair_status = "on progress";
            `
        };

        // Execute queries
        const [[pendingJobs], [onProgressJobs]] = await Promise.all([
            db.query(queries.pendingJobs, [employee_id]),
            db.query(queries.onProgressJobs, [employee_id])
        ]);

        // Prepare response
        const response = {
            pendingJobs: pendingJobs || 0,
            onProgressJobs: onProgressJobs || 0
        };

        res.status(200).json(response);
    } catch (error) {
        console.error('Error fetching employee jobs data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



module.exports = router;