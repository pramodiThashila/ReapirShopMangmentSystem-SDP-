import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Eye } from 'lucide-react';

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

const AdvanceInvoiceList: React.FC = () => {
  const [invoices, setInvoices] = useState<AdvanceInvoice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdvanceInvoices = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/api/advance-invoice');
        console.log(response.data); // Debugging: Log the API response

        // Map the response to match the frontend field names
        const mappedInvoices = response.data.map((invoice: any) => ({
          ...invoice,
          advance_amount: parseFloat(invoice.Advance_Amount), // Map Advance_Amount to advance_amount
        }));

        setInvoices(mappedInvoices);
      } catch (err: any) {
        console.error("Error fetching advance invoices:", err);
        setError(err.response?.data?.error || 'Failed to fetch advance invoices');
      } finally {
        setLoading(false);
      }
    };

    fetchAdvanceInvoices();
  }, []);

  // Format date
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return 'Invalid date';
    }
  };

  // Format currency
  const formatCurrency = (amount: number | null | undefined): string => {
    if (amount === undefined || amount === null) return "0.00";
    return amount.toFixed(2);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-pulse flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600 mb-3"></div>
          <p className="text-gray-600">Loading advance invoices...</p>
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
          onClick={() => navigate('/dashboard')}
          className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Advance Invoices</h1>
        {/* <button
          onClick={() => navigate('/dashboard')}
          className="bg-gray-200 text-gray-700 py-2 px-4 rounded hover:bg-gray-300 flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </button> */}
      </div>

      {invoices.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <p className="text-gray-500">No advance invoices found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Job
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoices.map((invoice) => (
                <tr key={invoice.AdvanceInvoice_Id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{invoice.AdvanceInvoice_Id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(invoice.Date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {invoice.firstName} {invoice.lastName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div>
                      <span className="font-medium text-gray-900">Job #{invoice.job_id}</span>
                      <p className="truncate max-w-xs mt-1">
                        {invoice.repair_description.length > 30
                          ? invoice.repair_description.substring(0, 30) + '...'
                          : invoice.repair_description}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      {invoice.product_image && (
                        <img 
                          src={invoice.product_image} 
                          alt="Product" 
                          className="h-10 w-10 rounded-full mr-3 object-cover"
                        />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">{invoice.product_name}</div>
                        <div className="text-sm text-gray-500">{invoice.model}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    <span className="font-medium">Rs {formatCurrency(invoice.advance_amount)}</span>
                  </td>                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                    <button
                      onClick={() => navigate(`/advance-invoice/${invoice.AdvanceInvoice_Id}`)}
                      title="View invoice details"
                      className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-100 transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdvanceInvoiceList;