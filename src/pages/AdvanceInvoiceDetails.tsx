import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface AdvanceInvoice {
  AdvanceInvoice_Id: number;
  job_id: number;
  customer_id: number;
  employee_id: string;
  Date: string;
  advance_amount: number;
  firstName: string;
  lastName: string;
  employee_name: string;
  repair_description: string;
  product_name: string;
  model: string;
  product_image: string | null;
}

const AdvanceInvoiceDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<AdvanceInvoice | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Company branding information
  const companyInfo = {
    name: "Bandu Electronic",
    address: "Mallwatte Road, Petta, Colombo 3",
    phone: "0718956147",
    email: "info@banduelectronic.com"
  };

  // Format currency values
  const formatCurrency = (value: number | null | undefined): string => {
    if (value === undefined || value === null) return "0.00";
    return value.toFixed(2);
  };

  // Format date
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return 'Invalid date';
    }
  };

  useEffect(() => {
    const fetchAdvanceInvoice = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/advance-invoice/${id}`);
        console.log(response.data); // Debugging: Log the API response

        // Map the response to match the frontend field names
        const mappedInvoice = {
          ...response.data,
          advance_amount: parseFloat(response.data.Advance_Amount), // Map Advance_Amount to advance_amount
        };

        setInvoice(mappedInvoice);
      } catch (err: any) {
        console.error('Error details:', err);
        setError(err.response?.data?.error || 'Failed to fetch advance invoice details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAdvanceInvoice();
    }
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-pulse flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600 mb-3"></div>
          <p className="text-gray-600">Loading advance invoice details...</p>
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
          onClick={() => navigate('/advance-invoices')}
          className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          Back to Advance Invoices
        </button>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="max-w-4xl mx-auto mt-8 p-6 bg-gray-50 border border-gray-200 rounded-lg">
        <h2 className="text-xl font-bold text-gray-700 mb-4">Advance Invoice Not Found</h2>
        <p className="text-gray-600">The requested advance invoice could not be found.</p>
        <button 
          onClick={() => navigate('/advance-invoices')}
          className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          Back to Advance Invoices
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto my-10 px-4">
      {/* Navigation controls - only visible on screen, hidden during print */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center print-hidden gap-3">
        <button 
          onClick={() => navigate('/advance-invoices')}
          className="bg-gray-200 text-gray-700 py-2 px-4 rounded hover:bg-gray-300 flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Advance Invoices
        </button>
        <button 
          onClick={handlePrint}
          className="bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 flex items-center mt-3 sm:mt-0"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print Invoice
        </button>
      </div>

      {/* Invoice Document */}
      <div className="invoice-container bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
        {/* Invoice Header with Company Info */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-start">
            <div className="mb-6 md:mb-0">
              <h1 className="text-2xl font-bold text-gray-800">{companyInfo.name}</h1>
              <p className="text-gray-600 text-sm">{companyInfo.address}</p>
              <p className="text-gray-600 text-sm">Phone: {companyInfo.phone}</p>
            </div>
            <div className="text-right">
              <h1 className="text-2xl font-bold text-gray-800">ADVANCE PAYMENT</h1>
              <p className="text-xl text-gray-600">#{invoice.AdvanceInvoice_Id}</p>
              <p className="text-gray-600 mt-1">Date: {formatDate(invoice.Date)}</p>
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
                <p className="mt-2"><span className="font-medium">Description:</span></p>
                <p className="text-gray-600 mt-1">{invoice.repair_description}</p>
              </div>
            </div>
            
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-2">Customer Information</h2>
              <div className="bg-gray-50 p-4 rounded">
                <p className="font-medium text-gray-800">{invoice.firstName} {invoice.lastName}</p>
                <p className="text-gray-600">Customer ID: {invoice.customer_id}</p>
                <p className="text-gray-600 mt-2">
                  <span className="font-medium">Technician:</span> {invoice.employee_name}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Payment Details</h2>
            <div className="bg-gray-50 p-6 rounded text-center">
              <div className="text-gray-700 mb-1">Advance Payment Amount:</div>
              <div className="text-3xl font-bold text-gray-800 mb-4">
                Rs {invoice?.advance_amount !== undefined ? formatCurrency(invoice.advance_amount) : "0.00"}
              </div>
              <div className="text-sm text-gray-600">
                This is an advance payment for the repair job.
              </div>
            </div>
          </div>

          {/* Invoice Footer */}
          <div className="text-center border-t border-gray-200 pt-6 text-sm text-gray-500">
            <p>Receipt Date: {formatDate(invoice.Date)}</p>
            <p>Created By: {invoice.employee_name}</p>
            <p className="mt-2">{companyInfo.name} | {companyInfo.phone}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvanceInvoiceDetails;