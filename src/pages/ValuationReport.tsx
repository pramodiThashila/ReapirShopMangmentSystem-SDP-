import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { useUser } from '../context/UserContext';
import ReportBranding from '../components/ReportBranding';
import { printReport } from '../utils/ReportPrinter';
import { PrinterIcon, RefreshCwIcon, FilterIcon } from 'lucide-react';

interface InventoryItem {
  inventoryItem_id: number;
  item_name: string;
  batch_no: string;
  quantity: number;
  unitprice: number;
  total_value: number;
}

interface Report {
  inventoryItems: InventoryItem[];
  totals: {
    itembatchCount: number;
    totalInventoryValue: number;
  };
}

const ValuationReport: React.FC = () => {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const reportRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();
  // Get available years for filtering (last 5 years)
  const generateReport = async () => {
    try {
      setLoading(true);
      let url = 'http://localhost:5000/api/report/valuation-report';
      
      const response = await axios.get(url);
      setReport(response.data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching inventory valuation report:', err);
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
      title: 'Inventory Valuation Report',
      orientation: 'landscape', // Set to landscape for this report
      companyName: 'Bandu Electricals',
      companyAddress: '123 Main Street, Colombo, Sri Lanka',
      companyContact: 'Tel: (94) 11-123-4567 • Email: info@bandu.com',
      creator: user?.username || 'System User'
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
  
  if (!report) {
    return (
      <div className="max-w-4xl mx-auto mt-8 p-6 bg-gray-50 border border-gray-200 rounded-lg">
        <h2 className="text-xl font-medium text-gray-700 mb-4">No report data available</h2>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Report Controls - These won't be included in the print */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print">        <h1 className="text-2xl font-bold text-gray-800">Inventory Valuation Report</h1>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PrinterIcon size={18} className="mr-2" />
            Print Report
          </button>
        </div>      </div>
      
      {/* Printable Report Content */}
      <div ref={reportRef} className="bg-white shadow-md rounded-lg p-6">
        {/* Report Branding - Using our reusable component */}
        <div className="hidden print:block">
          <ReportBranding 
            title="Inventory Valuation Report" 
            showBranding={false}
          />
        </div>
        
        {/* Web view branding - visible only on screen */}
        <div className="block print:hidden">
          <ReportBranding 
            title="Inventory Valuation Report" 
          />
        </div>
        
        {/* Report Summary - This WILL be printed */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 mb-8">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <h3 className="text-xs font-semibold text-blue-800 uppercase tracking-wide mb-2">
              Total Inventory Items
            </h3>
            <p className="text-2xl font-bold text-blue-900">
              {report.totals.itembatchCount}
            </p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg border border-green-100">
            <h3 className="text-xs font-semibold text-green-800 uppercase tracking-wide mb-2">
              Total Inventory Value
            </h3>
            <p className="text-2xl font-bold text-green-900">
              {formatCurrency(report.totals.totalInventoryValue)}
            </p>
          </div>
        </div>
        
        {/* Inventory Items Table */}
        <div className="mt-6 overflow-x-auto">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Inventory Items Valuation</h3>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Batch No
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit Price
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Value
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {report.inventoryItems.map((item, index) => (
                <tr key={`${item.inventoryItem_id}-${item.batch_no}-${index}`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.inventoryItem_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.item_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.batch_no}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(item.unitprice)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(item.total_value)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan={5} className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                  Total Inventory Value:
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                  {formatCurrency(report.totals.totalInventoryValue)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ValuationReport;
