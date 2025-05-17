import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { useUser } from '../context/UserContext';
import ReportBranding from '../components/ReportBranding';
import { printReport } from '../utils/ReportPrinter';
import { PrinterIcon, RefreshCwIcon, FilterIcon } from 'lucide-react';

interface IncomeInvoice {
  invoice_id: number;
  Date: string;
  total_amount: string;
  repair_description: string;
}

interface Report {
  invoices: IncomeInvoice[];
  totalinfo: {
    totalInvoiceCount: number;
    totalincome: string;
  };
}

const IncomeReport: React.FC = () => {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [filterApplied, setFilterApplied] = useState<boolean>(false);
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  
  const reportRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();

  // Get available years for filtering (last 5 years)
  const availableYears = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 6 }, (_, i) => currentYear - i);
  };
  
  // Get months for filtering
  const months = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];
    const generateReport = async () => {
    try {
      setLoading(true);
      let url = 'http://localhost:5000/api/report/income-report';
      
      // Backend filter has an issue: it's using req.params instead of req.query
      // We'll implement client-side filtering instead
      const response = await axios.get(url);
      setReport(response.data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching income report:', err);
      setError(err.response?.data?.error || 'Failed to generate report');
      setReport(null);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    generateReport();
  }, []);
  
  const handlePrint = () => {
    printReport(reportRef.current, {
      title: 'Income Report',
      orientation: 'portrait', // Setting to portrait for this report
      companyName: 'Bandu Electricals',
      companyAddress: '123 Main Street, Colombo, Sri Lanka',
      companyContact: 'Tel: (94) 11-123-4567 • Email: info@bandu.com',
      creator: user?.username || 'System User',
      dateRange: filterApplied ? { startDate, endDate } : undefined
    });
  };
  
  // Format currency
  const formatCurrency = (amount: number): string => {
    return amount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };
  
  // Format date
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMM dd, yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  };
    const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Apply client-side filtering instead of sending to backend
    // Backend filter has an issue: it uses req.params instead of req.query
    if (startDate && endDate) {
      setFilterApplied(true);
    } else {
      setFilterApplied(false);
      generateReport(); // Only refresh data if we're clearing filters
    }
  };
    const resetFilters = () => {
    setStartDate('');
    setEndDate('');
    setSelectedYear('');
    setSelectedMonth('');
    setFilterApplied(false);
    // Just reload the data without filters
    generateReport();
  };
    // Handle year and month filter changes
  useEffect(() => {
    if (selectedYear && selectedMonth) {
      const year = parseInt(selectedYear);
      const month = parseInt(selectedMonth);
      
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0);
      
      setStartDate(format(start, 'yyyy-MM-dd'));
      setEndDate(format(end, 'yyyy-MM-dd'));
      // Auto-apply filter when year/month selection changes
      setFilterApplied(true);
    } else if (selectedYear && !selectedMonth) {
      const year = parseInt(selectedYear);
      const start = new Date(year, 0, 1);
      const end = new Date(year, 11, 31);
      
      setStartDate(format(start, 'yyyy-MM-dd'));
      setEndDate(format(end, 'yyyy-MM-dd'));
      // Auto-apply filter when year selection changes
      setFilterApplied(true);
    }
  }, [selectedYear, selectedMonth]);
  
  // Client-side filter function for date filtering
  const getFilteredInvoices = () => {
    if (!report || !report.invoices) return [];
    
    if (!startDate || !endDate) return report.invoices;
    
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    
    return report.invoices.filter(invoice => {
      const invoiceDate = new Date(invoice.Date);
      return invoiceDate >= start && invoiceDate <= end;
    });
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-4xl mx-auto mt-8 p-6 bg-red-50 border border-red-200 rounded-lg">
        <h2 className="text-xl font-bold text-red-700 mb-4">Error Generating Report</h2>
        <p className="text-red-600">{error}</p>
        <button
          onClick={generateReport}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }
  if (!report || !report.totalinfo || !report.invoices) {
    return (
      <div className="max-w-4xl mx-auto mt-8 p-6 bg-gray-50 border border-gray-200 rounded-lg">
        <h2 className="text-xl font-medium text-gray-700 mb-4">No report data available</h2>
        <button
          onClick={generateReport}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }
  
  const filteredInvoices = getFilteredInvoices();
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Report Controls - These won't be included in the print */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print">
        <h1 className="text-2xl font-bold text-gray-800">Income Report</h1>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PrinterIcon size={18} className="mr-2" />
            Print Report
          </button>
          
          <button
            onClick={resetFilters}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            <RefreshCwIcon size={18} className="mr-2" />
            Reset Filters
          </button>
        </div>
      </div>
      
      {/* Date Range Filter - Won't be printed */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm no-print">
        <h2 className="text-lg font-medium text-gray-700 mb-3 flex items-center">
          <FilterIcon size={18} className="mr-2" />
          Filter Report
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Filter by Year/Month</h3>
            <div className="flex gap-2">
              <select
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(e.target.value);
                  if (e.target.value === '') setSelectedMonth('');
                }}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">Select Year</option>
                {availableYears().map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                disabled={!selectedYear}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-400"
              >
                <option value="">All Months</option>
                {months.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Custom Date Range</h3>
            <form onSubmit={handleFilterSubmit} className="flex flex-wrap items-end gap-2">
              <div className="flex-1">
                <input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              
              <span className="text-gray-500">to</span>
              
              <div className="flex-1">
                <input
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </form>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={handleFilterSubmit}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Apply Filters
          </button>
        </div>
      </div>
      
      {/* Printable Report Content */}
      <div ref={reportRef} className="bg-white shadow-md rounded-lg p-6">
        {/* Report Branding - Using our reusable component */}
        <div className="hidden print:block">
          <ReportBranding 
            title="Income Report" 
            dateRange={filterApplied ? { startDate, endDate } : undefined} 
            showBranding={false}
          />
        </div>
        
        {/* Web view branding - visible only on screen */}
        <div className="block print:hidden">
          <ReportBranding 
            title="Income Report" 
            dateRange={filterApplied ? { startDate, endDate } : undefined} 
          />
        </div>          {/* Report Summary - This WILL be printed */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <h3 className="text-xs font-semibold text-blue-800 uppercase tracking-wide mb-2">
              Total Invoices
            </h3>
            <p className="text-2xl font-bold text-blue-900">
              {filterApplied ? getFilteredInvoices().length : report?.totalinfo?.totalInvoiceCount || 0}
              {filterApplied && (
                <span className="text-sm text-blue-600 ml-1">
                  (filtered from {report?.totalinfo?.totalInvoiceCount || 0})
                </span>
              )}
            </p>
          </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
            <h3 className="text-xs font-semibold text-green-800 uppercase tracking-wide mb-2">
              Total Income
            </h3>
            <p className="text-2xl font-bold text-green-900">
              {filterApplied 
                ? formatCurrency(getFilteredInvoices().reduce((sum, inv) => sum + parseFloat(inv.total_amount || '0'), 0)) 
                : formatCurrency(parseFloat(report?.totalinfo?.totalincome || '0'))}
              {filterApplied && (
                <span className="text-sm text-green-600 ml-1">
                  (filtered from {formatCurrency(parseFloat(report?.totalinfo?.totalincome || '0'))})
                </span>
              )}
            </p>
          </div>
        </div>
        
        {/* Income Invoices Table */}
        <div className="mt-6 overflow-x-auto">
          <h3 className="text-lg font-medium text-gray-800 mb-4">
            Income Invoices
            {filterApplied && (
              <span className="ml-2 text-sm bg-blue-100 text-blue-800 rounded-full px-3 py-1">
                Filtered: {format(new Date(startDate), 'MMM dd, yyyy')} - {format(new Date(endDate), 'MMM dd, yyyy')}
              </span>
            )}
          </h3>
          <table className="min-w-full divide-y divide-gray-200">            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Repair Description
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInvoices?.map((invoice) => (
                <tr key={invoice.invoice_id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {invoice.invoice_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(invoice.Date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(parseFloat(invoice.total_amount))}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {invoice.repair_description}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan={2} className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                  Total:
                </td>                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                  {filterApplied 
                  ? formatCurrency(filteredInvoices.reduce((sum, inv) => sum + parseFloat(inv.total_amount || '0'), 0))
                  : formatCurrency(parseFloat(report?.totalinfo?.totalincome || '0'))}
                </td>
                <td className="px-6 py-4 whitespace-nowrap"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default IncomeReport;
