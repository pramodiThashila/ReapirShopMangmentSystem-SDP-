const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const db = require('../config/db');

/**
 * Create a new advance invoice
 * 
 */
router.post(
  '/create',
  [
    // Validation rules
    body('job_id')
      .notEmpty().withMessage('Job ID is required')
      .isInt().withMessage('Job ID must be a number'),
    body('customer_id')
      .notEmpty().withMessage('Customer ID is required')
      .isInt().withMessage('Customer ID must be a number'),
    body('employee_id')
      .notEmpty().withMessage('Employee ID is required')
      .isInt().withMessage('Employee ID must be a number'),
    body('advance_amount')
      .notEmpty().withMessage('Advance amount is required')
      .isFloat({ min: 0 }).withMessage('Advance amount must be a positive number')
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Get a connection from the pool
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();
      
      const { job_id, customer_id, employee_id, advance_amount, date } = req.body;
      
      // Verify that the job exists
      const [jobResult] = await connection.query(
        'SELECT * FROM jobs WHERE job_id = ?',
        [job_id]
      );
      
      if (jobResult.length === 0) {
        await connection.rollback();
        return res.status(404).json({ 
          error: 'Job not found' 
        });
      }
      
      // Verify that the customer exists
      const [customerResult] = await connection.query(
        'SELECT * FROM customers WHERE customer_id = ?',
        [customer_id]
      );
      
      if (customerResult.length === 0) {
        await connection.rollback();
        return res.status(404).json({ 
          error: 'Customer not found' 
        });
      }
      
      // Verify that the employee exists
      const [employeeResult] = await connection.query(
        'SELECT * FROM employees WHERE employee_id = ?',
        [employee_id]
      );
      
      if (employeeResult.length === 0) {
        await connection.rollback();
        return res.status(404).json({ 
          error: 'Employee not found' 
        });
      }
      
      // Check if an invoice already exists for this job
      const [existingInvoice] = await connection.query(
        'SELECT * FROM AdvanceInvoice WHERE job_id = ?',
        [job_id]
      );
      
      if (existingInvoice.length > 0) {
        await connection.rollback();
        return res.status(400).json({ 
          error: 'An advance invoice already exists for this job' 
        });
      }
      
      // Insert the advance invoice
      const [result] = await connection.query(
        `INSERT INTO AdvanceInvoice 
        (job_id, customer_id, employee_id, Advance_Amount, Date) 
        VALUES (?, ?, ?, ?, ?)`,
        [
          job_id, 
          customer_id, 
          employee_id, 
          advance_amount, 
          date || new Date() // Use provided date or current date
        ]
      );
      
      // Get the newly created invoice
      const [newInvoice] = await connection.query(
        `SELECT ai.*, j.repair_description, c.firstName, c.lastName, e.first_name as employee_name 
         FROM AdvanceInvoice ai
         JOIN jobs j ON ai.job_id = j.job_id
         JOIN customers c ON ai.customer_id = c.customer_id
         JOIN employees e ON ai.employee_id = e.employee_id
         WHERE ai.AdvanceInvoice_Id = ?`,
        [result.insertId]
      );
      
      await connection.commit();
      
      res.status(201).json({
        message: 'Advance invoice created successfully',
        invoice: newInvoice[0],
        createdInvoiceId: result.insertId
      });
      
    } catch (error) {
      await connection.rollback();
      
      // Handle specific database errors
      if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(400).json({
          error: 'Foreign key constraint failed. One of the provided IDs does not exist.'
        });
      }
      
      console.error('Error creating advance invoice:', error);
      res.status(500).json({ 
        error: 'An error occurred while creating the advance invoice' 
      });
    } finally {
      connection.release();
    }
  }
);

/**
 * Get all advance invoices
 * GET /api/advance-invoice
 */
router.get('/', async (req, res) => {
  try {
    const [invoices] = await db.query(
      `SELECT ai.*, j.repair_description, c.firstName, c.lastName, e.first_name as employee_name, 
              p.product_name, p.model, p.product_image
       FROM AdvanceInvoice ai
       JOIN jobs j ON ai.job_id = j.job_id
       JOIN customers c ON ai.customer_id = c.customer_id
       JOIN employees e ON ai.employee_id = e.employee_id
       JOIN products p ON j.product_id = p.product_id
       ORDER BY ai.Date DESC`
    );
    
    res.status(200).json(invoices);
  } catch (error) {
    console.error('Error fetching advance invoices:', error);
    res.status(500).json({ 
      error: 'An error occurred while fetching advance invoices' 
    });
  }
});

/**
 * Get advance invoice by ID
 * GET /api/advance-invoice/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [invoice] = await db.query(
      `SELECT ai.*, j.repair_description, c.firstName, c.lastName, e.first_name as employee_name, 
              p.product_name, p.model, p.product_image
       FROM AdvanceInvoice ai
       JOIN jobs j ON ai.job_id = j.job_id
       JOIN customers c ON ai.customer_id = c.customer_id
       JOIN employees e ON ai.employee_id = e.employee_id
       JOIN products p ON j.product_id = p.product_id
       WHERE ai.AdvanceInvoice_Id = ?`,
      [id]
    );
    
    if (invoice.length === 0) {
      return res.status(404).json({ 
        error: 'Advance invoice not found' 
      });
    }
    
    res.status(200).json(invoice[0]);
  } catch (error) {
    console.error('Error fetching advance invoice:', error);
    res.status(500).json({ 
      error: 'An error occurred while fetching the advance invoice' 
    });
  }
});

/**
 * Get advance invoices by job ID
 * GET /api/advance-invoice/job/:jobId
 * didnt' use
 */
router.get('/job/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    
    const [invoice] = await db.query(
      `SELECT ai.*, j.repair_description, c.firstName, c.lastName, e.first_name as employee_name, 
              p.product_name, p.model, p.product_image
       FROM AdvanceInvoice ai
       JOIN jobs j ON ai.job_id = j.job_id
       JOIN customers c ON ai.customer_id = c.customer_id
       JOIN employees e ON ai.employee_id = e.employee_id
       JOIN products p ON j.product_id = p.product_id
       WHERE ai.job_id = ?`,
      [jobId]
    );
    
    if (invoice.length === 0) {
      return res.status(404).json({ 
        error: 'No advance invoice found for this job' 
      });
    }
    
    res.status(200).json(invoice[0]);
  } catch (error) {
    console.error('Error fetching job advance invoice:', error);
    res.status(500).json({ 
      error: 'An error occurred while fetching the job advance invoice' 
    });
  }
});

/**
 * Delete advance invoice
 * DELETE /api/advance-invoice/:id
 * didnt use
 */
router.delete('/:id', async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { id } = req.params;
    
    // Check if the invoice exists
    const [invoice] = await connection.query(
      'SELECT * FROM AdvanceInvoice WHERE AdvanceInvoice_Id = ?',
      [id]
    );
    
    if (invoice.length === 0) {
      await connection.rollback();
      return res.status(404).json({ 
        error: 'Advance invoice not found' 
      });
    }
    
    // Delete the invoice
    await connection.query(
      'DELETE FROM AdvanceInvoice WHERE AdvanceInvoice_Id = ?',
      [id]
    );
    
    await connection.commit();
    
    res.status(200).json({ 
      message: 'Advance invoice deleted successfully' 
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error deleting advance invoice:', error);
    res.status(500).json({ 
      error: 'An error occurred while deleting the advance invoice' 
    });
  } finally {
    connection.release();
  }
});

module.exports = router;