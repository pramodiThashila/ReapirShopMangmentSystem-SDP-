import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { FaSearch, FaFileDownload } from 'react-icons/fa';

interface Purchase {
  purchase_id: number;
  item_name: string;
  batch_no: number;
  supplier_name: string;
  purchaseDate: string;
  quantity: number;
  unitprice: number;
  total: number;
}

const InventoryPurchases: React.FC = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [filteredPurchases, setFilteredPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortField, setSortField] = useState<keyof Purchase>('purchaseDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [yearFilter, setYearFilter] = useState<string>('');
  const [monthFilter, setMonthFilter] = useState<string>('');
  
  // Years for filter dropdown
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());
  
  // Months for filter dropdown
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

  // Format currency helper function
  const formatCurrency = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return "0.00";
    return value.toFixed(2);
  };

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/api/inventoryBatch/inventoryPurchases');
        const processedPurchases = response.data.purchases.map((purchase: any) => ({
          ...purchase,
          unitprice: parseFloat(purchase.unitprice), 
          total: parseFloat(purchase.total),       
        }));
        setPurchases(processedPurchases);
      } catch (err: any) {
        console.error('Error fetching inventory purchases:', err);
        setError('Failed to fetch inventory purchases');
      } finally {
        setLoading(false);
      }
    };

    fetchPurchases();
  }, []);

  // Handle sorting
  const handleSort = (field: keyof Purchase) => {
    if (field === sortField) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to descending for dates, ascending for others
      setSortField(field);
      setSortDirection(field === 'purchaseDate' ? 'desc' : 'asc');
    }
  };

  // Filter and sort purchases
  const filteredAndSortedPurchases = useMemo(() => {
    // First filter
    let filtered = [...purchases];
    
    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(purchase => 
        purchase.item_name.toLowerCase().includes(searchLower) ||
        purchase.supplier_name.toLowerCase().includes(searchLower) ||
        purchase.purchase_id.toString().includes(searchLower) ||
        purchase.batch_no.toString().includes(searchLower)
      );
    }
    
    // Apply year filter
    if (yearFilter) {
      filtered = filtered.filter(purchase => 
        purchase.purchaseDate.startsWith(yearFilter)
      );
    }
    
    // Apply month filter
    if (yearFilter && monthFilter) {
      filtered = filtered.filter(purchase => 
        purchase.purchaseDate.startsWith(`${yearFilter}-${monthFilter}`)
      );
    }
    
    // Then sort
    return [...filtered].sort((a, b) => {
      if (sortField === 'quantity' || sortField === 'unitprice' || sortField === 'total') {
        // Sort numbers
        return sortDirection === 'asc' 
          ? a[sortField] - b[sortField]
          : b[sortField] - a[sortField];
      } else if (sortField === 'purchaseDate') {
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
  }, [purchases, searchTerm, sortField, sortDirection, yearFilter, monthFilter]);

  // Update filtered purchases whenever the filtered and sorted list changes
  useEffect(() => {
    setFilteredPurchases(filteredAndSortedPurchases);
  }, [filteredAndSortedPurchases]);

  // Calculate totals
  const totalQuantity = useMemo(() => 
    filteredPurchases.reduce((sum, item) => sum + item.quantity, 0), 
    [filteredPurchases]
  );
  
  const totalAmount = useMemo(() => 
    filteredPurchases.reduce((sum, item) => sum + item.total, 0), 
    [filteredPurchases]
  );

  // Handle print
//   const handlePrint = () => {
//     const printContent = document.getElementById('printableTable');
//     const WinPrint = window.open('', '', 'width=900,height=650');
    
//     if (WinPrint && printContent) {
//       WinPrint.document.write(`
//         <html>
//           <head>
//             <title>Inventory Purchases Report</title>
//             <style>
//               body { font-family: Arial, sans-serif; }
//               table { width: 100%; border-collapse: collapse; margin-top: 20px; }
//               th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
//               th { background-color: #f2f2f2; }
//               .text-right { text-align: right; }
//               .report-header { text-align: center; margin-bottom: 20px; }
//               .summary { margin-top: 20px; font-weight: bold; }
//             </style>
//           </head>
//           <body>
//             <div class="report-header">
//               <h2>Inventory Purchases Report</h2>
//               <p>Generated on ${new Date().toLocaleDateString()}</p>
//             </div>
//             ${printContent.outerHTML}
//             <div class="summary">
//               <p>Total Quantity: ${totalQuantity}</p>
//               <p>Total Amount: Rs. ${formatCurrency(totalAmount)}</p>
//             </div>
//           </body>
//         </html>
//       `);
      
//       WinPrint.document.close();
//       WinPrint.focus();
//       WinPrint.print();
//       WinPrint.close();
//     }
//   };

  // Handle export to CSV
  const exportToCSV = () => {
    // Headers
    const headers = [
      'Purchase ID', 'Item Name', 'Batch No', 'Supplier Name', 
      'Purchase Date', 'Quantity', 'Unit Price (Rs)', 'Total (Rs)'
    ];
    
    // Convert purchases to CSV rows
    const rows = filteredPurchases.map(purchase => [
      purchase.purchase_id,
      purchase.item_name,
      purchase.batch_no,
      purchase.supplier_name,
      purchase.purchaseDate,
      purchase.quantity,
      formatCurrency(purchase.unitprice),
      formatCurrency(purchase.total)
    ]);
    
    // Add summary row
    rows.push([
      '', '', '', '', 'TOTAL', totalQuantity, '', formatCurrency(totalAmount)
    ]);
    
    // Combine headers and rows, properly escape values for CSV
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(value => {
        // If the value contains commas, quotes, or newlines, wrap it in quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          // Replace any double quotes with two double quotes
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `inventory_purchases_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setYearFilter('');
    setMonthFilter('');
    setSortField('purchaseDate');
    setSortDirection('desc');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-pulse flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-3"></div>
          <p className="text-gray-600">Loading inventory purchases...</p>
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
          <h1 className="text-2xl font-bold text-gray-800">Inventory Purchases</h1>
          <p className="mt-1 text-sm text-gray-500">
            {filteredPurchases.length} purchase{filteredPurchases.length !== 1 ? 's' : ''} found
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex flex-wrap gap-2">
          <button 
            onClick={exportToCSV}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <FaFileDownload className="mr-2" />
            Export CSV
          </button>
         
        </div>
      </div>

      {/* Search and filter controls */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search item or supplier name..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full"
              />
            </div>
          </div>
          
          {/* Year filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <select
              value={yearFilter}
              onChange={(e) => {
                setYearFilter(e.target.value);
                if (!e.target.value) {
                  setMonthFilter('');
                }
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Years</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          
          {/* Month filter - enabled only if year is selected */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              disabled={!yearFilter}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            >
              <option value="">All Months</option>
              {months.map(month => (
                <option key={month.value} value={month.value}>{month.label}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Clear filters */}
        <div className="mt-3 text-right">
          <button 
            onClick={clearFilters}
            className="text-sm text-gray-600 hover:text-blue-600"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-sm font-medium text-gray-500">Total Quantity</div>
          <div className="text-2xl font-bold text-gray-800 mt-1">{totalQuantity}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-sm font-medium text-gray-500">Total Purchase Amount</div>
          <div className="text-2xl font-bold text-gray-800 mt-1">Rs. {formatCurrency(totalAmount)}</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200" id="printableTable">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('purchase_id')}
                >
                  Purchase ID {sortField === 'purchase_id' && (sortDirection === 'asc' ? ' ▲' : ' ▼')}
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('item_name')}
                >
                  Item Name {sortField === 'item_name' && (sortDirection === 'asc' ? ' ▲' : ' ▼')}
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('batch_no')}
                >
                  Batch No {sortField === 'batch_no' && (sortDirection === 'asc' ? ' ▲' : ' ▼')}
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('supplier_name')}
                >
                  Supplier {sortField === 'supplier_name' && (sortDirection === 'asc' ? ' ▲' : ' ▼')}
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('purchaseDate')}
                >
                  Date {sortField === 'purchaseDate' && (sortDirection === 'asc' ? ' ▲' : ' ▼')}
                </th>
                <th 
                  className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('quantity')}
                >
                  Quantity {sortField === 'quantity' && (sortDirection === 'asc' ? ' ▲' : ' ▼')}
                </th>
                <th 
                  className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('unitprice')}
                >
                  Unit Price {sortField === 'unitprice' && (sortDirection === 'asc' ? ' ▲' : ' ▼')}
                </th>
                <th 
                  className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('total')}
                >
                  Total {sortField === 'total' && (sortDirection === 'asc' ? ' ▲' : ' ▼')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPurchases.length > 0 ? (
                filteredPurchases.map((purchase) => (
                  <tr key={purchase.purchase_id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{purchase.purchase_id}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                      {purchase.item_name}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                      {purchase.batch_no}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                      {purchase.supplier_name}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                      {purchase.purchaseDate}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 text-right">
                      {purchase.quantity}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 text-right">
                      Rs. {formatCurrency(purchase.unitprice)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                      Rs. {formatCurrency(purchase.total)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    {searchTerm || yearFilter || monthFilter ? (
                      <div>
                        <p className="text-lg font-medium">No purchases match your filters</p>
                        <p className="text-sm mt-1">Try adjusting your search or filter criteria</p>
                        <button
                          onClick={clearFilters}
                          className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                        >
                          Clear All Filters
                        </button>
                      </div>
                    ) : (
                      <div>
                        <p className="text-lg font-medium">No purchases found</p>
                        <p className="text-sm mt-1">When inventory purchases are recorded, they'll appear here.</p>
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan={5} className="px-4 py-3 text-sm font-bold text-gray-700 text-right">
                  Totals:
                </td>
                <td className="px-4 py-3 text-sm font-bold text-gray-700 text-right">
                  {totalQuantity}
                </td>
                <td className="px-4 py-3 text-sm font-bold text-gray-700 text-right">
                </td>
                <td className="px-4 py-3 text-sm font-bold text-gray-700 text-right">
                  Rs. {formatCurrency(totalAmount)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InventoryPurchases;