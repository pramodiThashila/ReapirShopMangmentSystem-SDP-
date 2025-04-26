import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './InvoicePrint.css'; 
import html2pdf from 'html2pdf.js';

interface Invoice {
  Invoice_Id: number;
  job_id: number;
  repair_description: string;
  repair_status: string;
  customer_id: number;
  customer_name: string;
  customer_email: string;
  employee_id: string;
  employee_name: string;
  employee_role: string;
  product_id: number;
  product_name: string;
  model: string;
  model_no: string;
  product_image: string | null;
  TotalCost_for_Parts: number;
  Labour_Cost: number;
  Total_Amount: number;
  warranty: string;
  warranty_exp_date: string | null;
  invoice_date: string;
  Created_By: string;
  AdvanceInvoice_Id: number | null;
  advance_payment: number;
  balance_due: number;
  warranty_status: string;
}

interface InventoryItem {
  item_name: string;
  quantity: number;
  unitprice: number;
  total: number;
}

const InvoiceDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [usedItems, setUsedItems] = useState<InventoryItem[]>([]);
  
  // Updated company branding information
  const companyInfo = {
    name: "Bandu Electronic",
    address: "Mallwatte Road, Petta, Colombo 3",
    phone: "0718956147",
    email: "info@banduelectronic.com"
  };

  // Format currency values
  const formatCurrency = (value: any): string => {
    if (value === null || value === undefined) return "0.00";
    const numValue = typeof value === 'string' ? Number(value) : value;
    return isNaN(numValue) ? "0.00" : numValue.toFixed(2);
  };

  // Format date
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Fetch invoice details
  useEffect(() => {
    const fetchInvoiceDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/api/invoice/all');
        
        const foundInvoice = response.data.invoices.find(
          (inv: any) => inv.Invoice_Id === parseInt(id || '0')
        );
        
        if (foundInvoice) {
          const processedInvoice = {
            ...foundInvoice,
            Total_Amount: parseFloat(foundInvoice.Total_Amount) || 0,
            TotalCost_for_Parts: parseFloat(foundInvoice.TotalCost_for_Parts) || 0,
            Labour_Cost: parseFloat(foundInvoice.Labour_Cost) || 0,
            advance_payment: parseFloat(foundInvoice.advance_payment || 0) || 0,
            balance_due: parseFloat(foundInvoice.balance_due || 0) || 0
          };
          
          setInvoice(processedInvoice);
          
          // Fetch the used inventory items
          if (processedInvoice.job_id) {
            fetchUsedInventory(processedInvoice.job_id);
          }
        } else {
          setError('Invoice not found');
        }
      } catch (err: any) {
        console.error('Error details:', err);
        setError(err.response?.data?.error || 'Failed to fetch invoice details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchInvoiceDetails();
    }
  }, [id]);

  // Fetch used inventory items
  const fetchUsedInventory = async (jobId: number) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/jobusedInventory/usedinventory/${jobId}`);
      if (response.data && response.data.items && Array.isArray(response.data.items)) {
        setUsedItems(response.data.items);
      }
    } catch (err) {
      console.error('Error fetching used inventory:', err);
    }
  };

  const generatePDF = () => {
    const element = document.querySelector('.invoice-container');
    const opt = {
      margin: 10,
      filename: `Invoice-${invoice?.Invoice_Id || 'document'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(element).save();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-pulse flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600 mb-3"></div>
          <p className="text-gray-600">Loading invoice details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto mt-8 p-6 bg-red-50 border border-red-200 rounded-lg">
        <h2 className="text-xl font-bold text-red-700 mb-4">Error</h2>
        <p className="text-red-600">{error}</p>
        <button 
          onClick={() => navigate('/invoices')}
          className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          Back to Invoices
        </button>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="max-w-4xl mx-auto mt-8 p-6 bg-gray-50 border border-gray-200 rounded-lg">
        <h2 className="text-xl font-bold text-gray-700 mb-4">Invoice Not Found</h2>
        <p className="text-gray-600">The requested invoice could not be found.</p>
        <button 
          onClick={() => navigate('/invoices')}
          className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          Back to Invoices
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto my-10 px-4 print:p-0">
      {/* Navigation controls - add print-hidden class */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center print-hidden gap-3">
        <button 
          onClick={() => navigate('/invoices')}
          className="bg-gray-200 text-gray-700 py-2 px-4 rounded hover:bg-gray-300 flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Invoices
        </button>
        <div className="flex gap-3 mt-3 sm:mt-0">
          <button 
            onClick={() => window.print()}
            className="bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print Invoice
          </button>
          <button 
            onClick={generatePDF}
            className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download PDF
          </button>
        </div>
      </div>

      {/* Invoice Document - add invoice-container and invoice-document classes */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden invoice-container invoice-document">
        {/* Invoice Header with Company Info */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-start">
            <div className="mb-6 md:mb-0">
              <h1 className="text-2xl font-bold text-gray-800">{companyInfo.name}</h1>
              <p className="text-gray-600 text-sm">{companyInfo.address}</p>
              <p className="text-gray-600 text-sm">Phone: {companyInfo.phone}</p>
            </div>
            <div className="text-right">
              <h1 className="text-2xl font-bold text-gray-800">INVOICE</h1>
              <p className="text-xl text-gray-600">#{invoice.Invoice_Id}</p>
              <p className="text-gray-600 mt-1">Date: {formatDate(invoice.invoice_date)}</p>
            </div>
          </div>
        </div>

        {/* Invoice Body */}
        <div className="p-6">
          {/* Job and Customer Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-2">Job Details</h2>
              <div className="bg-gray-50 p-4 rounded">
                <p><span className="font-medium">Job ID:</span> {invoice.job_id}</p>
                <p><span className="font-medium">Warranty:</span> {
                  invoice.warranty_status === 'Active' ? 'Available' : 'Not Available'
                }</p>
                {invoice.warranty_exp_date && (
                  <p><span className="font-medium">Warranty End Date:</span> {formatDate(invoice.warranty_exp_date)}</p>
                )}
              </div>
            </div>
            
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-2">Customer Information</h2>
              <div className="bg-gray-50 p-4 rounded">
                <p className="font-medium text-gray-800">{invoice.customer_name}</p>
                <p className="text-gray-600">{invoice.customer_email}</p>
                <p className="text-gray-600">Customer ID: {invoice.customer_id}</p>
                <p className="text-gray-600 mt-1">
                  <span className="font-medium">Technician:</span> {invoice.employee_name} ({invoice.employee_role})
                </p>
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Product Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 p-4 rounded">
              <div className="col-span-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium">{invoice.product_name}</p>
                    <p className="text-gray-600">Model: {invoice.model} {invoice.model_no}</p>
                    <p className="text-gray-600">Product ID: {invoice.product_id}</p>
                  </div>
                  <div>
                    <p className="font-medium">Repair Description:</p>
                    <p className="text-gray-600 text-sm">{invoice.repair_description}</p>
                  </div>
                </div>
              </div>
              {invoice.product_image && (
                <div>
                  <div className="h-24 w-full bg-white rounded border overflow-hidden">
                    <img 
                      src={invoice.product_image} 
                      alt={invoice.product_name} 
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Used Inventory Items */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Used Parts</h2>
            {usedItems.length > 0 ? (
              <div className="overflow-hidden rounded border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                      <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                      <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {usedItems.map((item, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-2 text-sm text-gray-700">{item.item_name}</td>
                        <td className="px-4 py-2 text-sm text-gray-700 text-center">{item.quantity}</td>
                        <td className="px-4 py-2 text-sm text-gray-700 text-right">Rs {formatCurrency(item.unitprice)}</td>
                        <td className="px-4 py-2 text-sm text-gray-700 text-right">Rs {formatCurrency(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 bg-gray-50 p-4 text-center rounded">No parts were used for this repair</p>
            )}
          </div>

          {/* Invoice Summary */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Invoice Summary</h2>
            <div className="overflow-hidden rounded border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-3 text-sm text-gray-700">Parts Cost</td>
                    <td className="px-6 py-3 text-sm text-gray-700 text-right">Rs {formatCurrency(invoice.TotalCost_for_Parts)}</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-3 text-sm text-gray-700">Labour Cost</td>
                    <td className="px-6 py-3 text-sm text-gray-700 text-right">Rs {formatCurrency(invoice.Labour_Cost)}</td>
                  </tr>
                  {invoice.AdvanceInvoice_Id && (
                    <tr>
                      <td className="px-6 py-3 text-sm text-gray-700">Advance Payment</td>
                      <td className="px-6 py-3 text-sm text-green-600 text-right">-Rs {formatCurrency(invoice.advance_payment)}</td>
                    </tr>
                  )}
                  <tr className="bg-gray-50">
                    <td className="px-6 py-3 text-sm font-medium text-gray-800">Total Amount</td>
                    <td className="px-6 py-3 text-sm font-medium text-gray-800 text-right">Rs {formatCurrency(invoice.Total_Amount)}</td>
                  </tr>
                  <tr className="bg-gray-100">
                    <td className="px-6 py-3 text-sm font-medium text-gray-800">Balance Due</td>
                    <td className="px-6 py-3 text-sm font-medium text-gray-800 text-right">Rs {formatCurrency(invoice.balance_due)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Invoice Footer */}
          <div className="text-center border-t border-gray-200 pt-6 text-sm text-gray-500">
            <p>Created by: {invoice.Created_By} on {formatDate(invoice.invoice_date)}</p>
            <p className="mt-2">{companyInfo.name} | {companyInfo.phone}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetails;