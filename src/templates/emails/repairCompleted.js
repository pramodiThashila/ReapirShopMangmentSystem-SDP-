const moment = require('moment');

/**
 * Generates HTML email content for repair completion notification
 * @param {Object} data - The data needed to populate the email template
 * @param {string} data.customer_name - Customer's full name
 * @param {string} data.jobId - Job ID
 * @param {string} data.product_name - Product name
 * @param {string} data.model - Product model (optional)
 * @returns {string} HTML content for email
 */
const repairCompletedTemplate = (data) => {
  const { customer_name, jobId, product_name, model } = data;
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #4CAF50; margin-bottom: 5px;">Repair Completed Successfully</h2>
            <div style="height: 3px; background-color: #4CAF50; width: 100px; margin: 0 auto;"></div>
        </div>
        
        <p style="color: #555;">Dear <strong>${customer_name}</strong>,</p>
        
        <p style="color: #555;">Great news! We're pleased to inform you that your repair service has been successfully completed.</p>
        
        <div style="background-color: #f9f9f9; border-left: 4px solid #4CAF50; padding: 15px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Repair ID:</strong> ${jobId}</p>
            <p style="margin: 8px 0 0 0;"><strong>Product:</strong> ${product_name} ${model || ''}</p>
            <p style="margin: 8px 0 0 0;"><strong>Date Completed:</strong> ${moment().format('MMMM D, YYYY')}</p>
        </div>
        
        <p style="color: #555;">Your device is now ready for collection at our shop. Please bring your receipt or mention your repair ID when you visit.</p>
        
        <p style="color: #555;">If you have any questions about your repair or need assistance with your device after collection, our technical support team is available to help you.</p>
        
        <div style="margin: 25px 0; padding: 15px; background-color: #eff7ee; border-radius: 5px; text-align: center;">
            <p style="margin: 0; color: #4CAF50;"><strong>We'd love to hear your feedback!</strong></p>
            <p style="margin: 8px 0 0 0; color: #555;">Your opinion matters to us and helps improve our service.</p>
        </div>
        
        <p style="color: #555;">Thank you for choosing our repair services. We look forward to serving you again in the future.</p>
        
        <p style="color: #555;">Best regards,<br><strong>Repair Shop Team</strong></p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #999; text-align: center;">
            <p>If you need any assistance, please contact us at support@repairshop.com or call (123) 456-7890</p>
            <p>© ${new Date().getFullYear()} Repair Shop. All rights reserved.</p>
        </div>
    </div>
  `;
};

module.exports = repairCompletedTemplate;