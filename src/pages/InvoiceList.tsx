import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaSearch, FaFileDownload, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';

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

const InvoiceList: React.FC = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortField, setSortField] = useState<keyof Invoice>('invoice_date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  // Helper function for formatting currency
  const formatCurrency = (value: any): string => {
    if (value === null || value === undefined) return "0.00";
    const numValue = parseFloat(value);
    return isNaN(numValue) ? "0.00" : numValue.toFixed(2);
  };

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/api/invoice/all');

        // Process data to ensure proper types
        const processedInvoices = response.data.invoices.map((inv: any) => ({
          ...inv,
          // Convert string values to numbers
          Total_Amount: parseFloat(inv.Total_Amount) || 0,
          TotalCost_for_Parts: parseFloat(inv.TotalCost_for_Parts) || 0,
          Labour_Cost: parseFloat(inv.Labour_Cost) || 0,
          advance_payment: parseFloat(inv.advance_payment || 0) || 0,
          balance_due: parseFloat(inv.balance_due || 0) || 0
        }));

        setInvoices(processedInvoices);
      } catch (err: any) {
        console.error("Error fetching invoices:", err);
        setError(err.response?.data?.error || 'Failed to fetch invoices');
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  // Handle sorting
  const handleSort = (field: keyof Invoice) => {
    if (field === sortField) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to descending for dates, ascending for others
      setSortField(field);
      setSortDirection(field === 'invoice_date' ? 'desc' : 'asc');
    }
  };

  // Get sort icon
  const getSortIcon = (field: keyof Invoice) => {
    if (field !== sortField) return <FaSort className="inline ml-1" />;
    return sortDirection === 'asc' ?
      <FaSortUp className="inline ml-1 text-blue-600" /> :
      <FaSortDown className="inline ml-1 text-blue-600" />;
  };

  // Filter and sort invoices
  const filteredAndSortedInvoices = useMemo(() => {
    // First filter
    const filtered = invoices.filter(invoice => {
      const searchLower = searchTerm.toLowerCase();
      return (
        invoice.Invoice_Id.toString().includes(searchLower) ||
        invoice.customer_name.toLowerCase().includes(searchLower) ||
        invoice.product_name.toLowerCase().includes(searchLower) ||
        invoice.repair_status.toLowerCase().includes(searchLower) ||
        invoice.invoice_date.includes(searchLower) ||
        invoice.warranty_status.toLowerCase().includes(searchLower)
      );
    });

    // Then sort
    return [...filtered].sort((a, b) => {
      // Handle different field types
      if (sortField === 'Total_Amount' || sortField === 'balance_due') {
        // Sort numbers
        return sortDirection === 'asc'
          ? a[sortField] - b[sortField]
          : b[sortField] - a[sortField];
      } else if (sortField === 'invoice_date') {
        // Sort dates
        const dateA = new Date(a[sortField]);
        const dateB = new Date(b[sortField]);
        return sortDirection === 'asc'
          ? dateA.getTime() - dateB.getTime()
          : dateB.getTime() - dateA.getTime();
      } else {
        // Sort strings
        const stringA = String(a[sortField]).toLowerCase();
        const stringB = String(b[sortField]).toLowerCase();
        return sortDirection === 'asc'
          ? stringA.localeCompare(stringB)
          : stringB.localeCompare(stringA);
      }
    });
  }, [invoices, searchTerm, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedInvoices.length / itemsPerPage);
  const currentInvoices = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedInvoices.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedInvoices, currentPage]);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Handle export to CSV
  const exportToCSV = () => {
    // Headers
    const headers = [
      'Invoice ID', 'Date', 'Customer', 'Product', 'Parts Cost',
      'Labour Cost', 'Advance Payment', 'Total Amount', 'Balance', 'Status', 'Warranty'
    ];

    // Convert invoices to CSV rows
    const rows = filteredAndSortedInvoices.map(invoice => [
      invoice.Invoice_Id,
      invoice.invoice_date,
      invoice.customer_name,
      invoice.product_name,
      formatCurrency(invoice.TotalCost_for_Parts),
      formatCurrency(invoice.Labour_Cost),
      formatCurrency(invoice.advance_payment),
      formatCurrency(invoice.Total_Amount),
      formatCurrency(invoice.balance_due),
      invoice.repair_status,
      invoice.warranty_status
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `invoices_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-pulse flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-3"></div>
          <p className="text-gray-600">Loading invoices...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto mt-8 p-6 bg-red-50 border border-red-200 rounded-lg">
        <h2 className="text-xl font-bold text-red-700 mb-4">Error</h2>
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto mt-8 mb-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Invoices</h1>
          <p className="mt-1 text-sm text-gray-500">
            {filteredAndSortedInvoices.length} invoice{filteredAndSortedInvoices.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full"
            />
          </div>
          <button
            onClick={exportToCSV}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <FaFileDownload className="mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('Invoice_Id')}
                >
                  <span className="flex items-center">
                    Invoice # {getSortIcon('Invoice_Id')}
                  </span>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('job_id')}
                >
                  <span className="flex items-center">
                    Job # {getSortIcon('job_id')}
                  </span>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('invoice_date')}
                >
                  <span className="flex items-center">
                    Date {getSortIcon('invoice_date')}
                  </span>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('customer_name')}
                >
                  <span className="flex items-center">
                    Customer {getSortIcon('customer_name')}
                  </span>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('product_name')}
                >
                  <span className="flex items-center">
                    Product {getSortIcon('product_name')}
                  </span>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('Total_Amount')}
                >
                  <span className="flex items-center">
                    Amount {getSortIcon('Total_Amount')}
                  </span>
                </th>
                {/* <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('balance_due')}
                >
                  <span className="flex items-center">
                    Balance {getSortIcon('balance_due')}
                  </span>
                </th> */}
                {/* <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('repair_status')}
                >
                  <span className="flex items-center">
                    Status {getSortIcon('repair_status')}
                  </span>
                </th> */}
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('warranty_status')}
                >
                  <span className="flex items-center">
                    Warranty {getSortIcon('warranty_status')}
                  </span>
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentInvoices.length > 0 ? (
                currentInvoices.map((invoice) => (
                  <tr key={invoice.Invoice_Id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{invoice.Invoice_Id}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{invoice.job_id}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                      {invoice.invoice_date}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                      <div className="font-medium">{invoice.customer_name}</div>
                      <div className="text-xs text-gray-500">{invoice.customer_email}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                      <div>{invoice.product_name}</div>
                      <div className="text-xs text-gray-500">{invoice.model}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Rs.{formatCurrency(invoice.Total_Amount)}
                    </td>
                    {/* <td className="px-4 py-4 whitespace-nowrap text-sm">
                      {Number(invoice.balance_due) > 0 ? (
                        <span className="text-red-600 font-medium">Rs.{formatCurrency(invoice.balance_due)}</span>
                      ) : (
                        <span className="text-green-600 font-medium">Paid</span>
                      )}
                    </td> */}
                    {/* <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        invoice.repair_status === 'Completed' 
                          ? 'bg-green-100 text-green-800' 
                          : invoice.repair_status === 'In Progress'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                      }`}>
                        {invoice.repair_status}
                      </span>
                    </td> */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${invoice.warranty_status === 'Active'
                        ? 'bg-green-100 text-green-800'
                        : invoice.warranty_status === 'Expired'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                        }`}>
                        {invoice.warranty_status}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/invoice/${invoice.job_id}`}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        View & Print
                      </Link>
                      {/* <Link
                        to={`/invoice/print/${invoice.job_id}`}
                        className="text-green-600 hover:text-green-900"
                      >
                        Print
                      </Link> */}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                    {searchTerm ? (
                      <div>
                        <p className="text-lg font-medium">No invoices match your search</p>
                        <p className="text-sm mt-1">Try adjusting your search criteria</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-lg font-medium">No invoices found</p>
                        <p className="text-sm mt-1">When invoices are created, they'll appear here.</p>
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
            <span className="font-medium">
              {Math.min(currentPage * itemsPerPage, filteredAndSortedInvoices.length)}
            </span>{' '}
            of <span className="font-medium">{filteredAndSortedInvoices.length}</span> results
          </div>
          <div className="flex space-x-1">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 border rounded ${currentPage === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-blue-600 hover:bg-blue-50'
                }`}
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index + 1)}
                className={`px-3 py-1 border rounded ${currentPage === index + 1
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-blue-600 hover:bg-blue-50'
                  }`}
              >
                {index + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 border rounded ${currentPage === totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-blue-600 hover:bg-blue-50'
                }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceList;