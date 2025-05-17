const express = require('express');
const db = require('../config/db'); // Import your database connection

const router = express.Router();

// Route to generate the purchase report
router.get('/purchase-report', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        // Base query for fetching purchase data
        let query = `
            SELECT 
                ip.purchase_id,
                i.item_name AS item_name,
                s.supplier_name AS supplier_name,
                ip.quantity,
                ip.unitprice,
                ip.total,
                ip.purchaseDate
            FROM InventoryPurchase ip
            JOIN Inventory i ON ip.inventoryItem_id = i.inventoryItem_id
            JOIN Suppliers s ON ip.supplier_id = s.supplier_id
        `;

        // Add date filters if provided
        const queryParams = [];
        if (startDate && endDate) {
            query += ` WHERE ip.purchaseDate BETWEEN ? AND ?`;
            queryParams.push(startDate, endDate);
        }

        // Execute the query
        const [purchases] = await db.query(query, queryParams);

        // Fetch the total number of distinct items bought
        const [distinctItemsResult] = await db.query(`
            SELECT COUNT(DISTINCT inventoryItem_id) AS NoOfItemsBought
            FROM InventoryPurchase
            ${startDate && endDate ? `WHERE purchaseDate BETWEEN ? AND ?` : ''}
        `, startDate && endDate ? [startDate, endDate] : []);

        const totalDistinctItemsBought = distinctItemsResult[0]?.NoOfItemsBought || 0;

        // Calculate totals and statistics
        const totalPurchasesCount = purchases.length;
        const totalItemsBought = purchases.reduce((sum, purchase) => sum + purchase.quantity, 0);
        const totalPurchaseCost = purchases.reduce((sum, purchase) => sum + parseFloat(purchase.total), 0);

        // Find the most purchased item based on quantity
        const itemQuantities = {};
        purchases.forEach(purchase => {
            if (!itemQuantities[purchase.item_name]) {
                itemQuantities[purchase.item_name] = 0;
            }
            itemQuantities[purchase.item_name] += purchase.quantity;
        });

        const mostPurchasedItem = Object.keys(itemQuantities).length > 0
            ? Object.keys(itemQuantities).reduce((a, b) => 
                itemQuantities[a] > itemQuantities[b] ? a : b
            )
            : null;

        // Prepare the response
        const report = {
            purchases,
            totals: {
                totalPurchasesCount,
                totalItemsBought,
                totalDistinctItemsBought,
                totalPurchaseCost,
                mostPurchasedItem
            }
        };

        res.status(200).json(report);
    } catch (error) {
        console.error('Error generating purchase report:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


//valuation report

router.get('/valuation-report', async (req, res) => {
    try {
        // // Get optional date filters
        // const { startDate, endDate } = req.query;

        // Base query to fetch inventory valuation data with individual item values
        let itemsQuery = `
            SELECT 
                i.inventoryItem_id ,
                i.item_name,
                ib.batch_no,
                ib.quantity,
                ib.unitprice,
                (ib.quantity * ib.unitprice) AS total_value
            FROM Inventory i
            JOIN InventoryBatch ib ON i.inventoryItem_id = ib.inventoryItem_id
            WHERE quantity > 0
        `;

        // Query to calculate the sum directly in the database
        let totalQuery = `
            SELECT SUM(ib.quantity * ib.unitprice) AS total_inventory_value
            FROM Inventory i
            JOIN InventoryBatch ib ON i.inventoryItem_id = ib.inventoryItem_id
            WHERE ib.quantity > 0
        `;

        // Add date filters if provided
        // const queryParams = [];
        // if (startDate && endDate) {
        //     const dateFilter = ` AND ib.entry_date BETWEEN ? AND ?`;
        //     itemsQuery += dateFilter;
        //     totalQuery += dateFilter;
        //     queryParams.push(startDate, endDate);
        //     queryParams.push(startDate, endDate); // Push twice since we have two queries
        // }

        // Execute both queries
        const [inventoryItems] = await db.query(itemsQuery);
        const [totalResult] = await db.query(totalQuery);

        // Get the total from the query result (with fallback to 0) //0 means get the first row fron result
        const totalInventoryValue = parseFloat(totalResult[0]?.total_inventory_value || 0);

        // Prepare the response
        const report = {
            inventoryItems,
            totals: {
                itembatchCount: inventoryItems.length,
                totalInventoryValue
            }
        };

        res.status(200).json(report);
    } catch (error) {
        console.error('Error generating inventory valuation report:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route to generate the income report
router.get('/income-report',async (req, res) => {
     try{
        const {startDate, endDate}= req.query;

        let invoicequery = `
            SELECT 
                i.invoice_id,
                i.Date,
                i.total_amount,
                j.repair_description
            FROM
                invoice i
            JOIN
                jobs j
            ON
                i.job_id = j.job_id;  `;

        let totIncome = `
            SELECT 
                SUM(total_amount) as total_income
            FROM 
                invoice i
            `;   
            
        //add date filter
        let queryParm=[];
        if (startDate && endDate){
            invoicequery += `WHERE i.Date  BETWEEN ? AND ?`;
            totIncome += `WHERE i.Date  BETWEEN ? AND ?`;
            queryParm.push (startDate , endDate);
            queryParm.push (startDate , endDate);
        }    
                
        const[invoices]= await db.query(invoicequery,queryParm); 
        const[totalincome]= await db.query(totIncome,queryParm);
        
        const report = { 
            invoices,
            totalinfo:{
                totalInvoiceCount : invoices.length,
                totalincome : totalincome[0].total_income || 0

            }
        };

        res.status(200).json(report);
    }catch{
        console.log ("internal server error");
        res.status(500).json({error:'internal server error'});
    }
        

});

router.get('/customer-report', async (req, res) => {
    try {
        const customerQuery = `
                    SELECT 
                        c.firstName,
                        c.customer_id, 
                        c.type,
                        c.email,
                        (SELECT SUM(i.Total_Amount) FROM invoice i WHERE i.customer_id = c.customer_id) AS total_spent,
                        (SELECT COUNT(j.job_id) FROM jobs j WHERE j.customer_id = c.customer_id) AS job_count,
                        GROUP_CONCAT(DISTINCT tc.phone_number) AS phone_number
                    FROM 
                        customers c
                    LEFT JOIN 
                        telephones_customer tc ON c.customer_id = tc.customer_id
                    GROUP BY 
                        c.customer_id
                    ORDER BY 
                        total_spent DESC;
                     `;

        const totalQuery = `
                            SELECT 
                                SUM(total_spent) AS totalFromTopCustomers
                            FROM (
                                SELECT 
                                    SUM(i.Total_Amount) AS total_spent
                                FROM 
                                    invoice i
                                JOIN 
                                    customers c ON i.customer_id = c.customer_id
                                GROUP BY 
                                    i.customer_id
                                ORDER BY 
                                    total_spent DESC
                                LIMIT 10
                            ) AS top_customers`;

       
        const [topcustomers] = await db.query(customerQuery);
        const [incomeFromcustomers] = await db.query(totalQuery);

        const totaltopCustomerIncome = parseFloat(incomeFromcustomers[0]?.totalFromTopCustomers || 0);

        const report = {
            topcustomers,
            grandtotal: {
                totaltopCustomerIncome
            }
        };

        res.status(200).json(report);

    } catch (error) {
        console.error("Error generating customer report:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;