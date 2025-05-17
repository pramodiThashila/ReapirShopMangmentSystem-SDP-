import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, ShoppingCart, Loader2 } from 'lucide-react';
import axios from 'axios';

interface InventoryItem {
  inventoryItem_id: number;
  item_name: string;
  total_quantity: number;
  outOfStockLevel: number;
  specification: string;
  status: 'Out of Stock' | 'Limited stock';
}

const OutOfStockPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInventoryItems = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/api/inventory/lowStock');
        setInventoryItems(response.data.items);
        setError(null);
      } catch (err: any) {
        console.error("Failed to fetch inventory items:", err);
        setError(err.response?.data?.error || "Failed to fetch inventory items");
      } finally {
        setLoading(false);
      }
    };

    fetchInventoryItems();
  }, []);
  
  // Filter inventory items based on search term and status filter
  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = item.item_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  // Function to render urgency badge based on stock status
  const renderUrgencyBadge = (status: string) => {
    // Map status to urgency level
    const urgency = status === 'Out of Stock' ? 'High' : 'Medium';
    
    const colorMap = {
      'Medium': 'bg-yellow-100 text-yellow-800',
      'High': 'bg-red-100 text-red-800',
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorMap[urgency as 'Medium' | 'High']}`}>
        {urgency}
      </span>
    );
  };

  return (
    <div className="container py-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Out of Stock Products</h1>
            <p className="text-gray-600">
              Browse our current out-of-stock items and submit quotations for products you can supply.
            </p>
          </div>
          
        </div>
        
        <div className="card p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative col-span-1 md:col-span-3 mb-2">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </div>
            
            {/* Status Filter */}
            <div>
              <label className="label" htmlFor="statusFilter">
                Filter by Status
              </label>
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input"
              >
                <option value="all">All Status</option>
                <option value="Limited stock">Limited Stock</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
            </div>
            
            {/* Clear Filters */}
            <div className="flex items-end">
              <button
                className="btn-secondary w-full"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
              >
                <Filter className="mr-2 h-4 w-4" />
                Clear Filters
              </button>
            </div>
          </div>
        </div>
        
        {/* Loading and Error States */}
        {loading && (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary-600" />
            <p className="mt-2 text-gray-600">Loading inventory items...</p>
          </div>
        )}
        
        {error && (
          <div className="card p-6 text-center bg-red-50">
            <p className="text-red-700">{error}</p>
            <button 
              className="btn-primary mt-4"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        )}
        
        {/* Products List */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <div key={item.inventoryItem_id} className="card overflow-hidden transition hover:shadow-md">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold">{item.item_name}</h3>
                      {renderUrgencyBadge(item.status)}
                    </div>
                    <p className="text-sm text-gray-600 mb-4">{item.specification}</p>
                    <div className="flex justify-between items-center mb-4 mt-4">
                      <span className="text-sm text-gray-500">
                        Status: <span className={item.status === 'Out of Stock' ? 'text-red-600 font-medium' : 'text-yellow-600 font-medium'}>
                          {item.status}
                        </span>
                      </span>
                      <span className="text-sm text-gray-500">
                        Current Stock: <span className="font-medium">{item.total_quantity}</span>
                      </span>
                    </div>
                    <Link
                      to={`/supplier/quotation?product=${encodeURIComponent(item.item_name)}&id=${item.inventoryItem_id}&specification=${encodeURIComponent(item.specification)}`}
                      className="btn-primary w-full"
                    >
                      Submit Quotation
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-12">
                <p className="text-lg text-gray-600">No products match your search criteria. Please try different filters.</p>
                <button
                  className="btn-secondary mt-4"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                  }}
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OutOfStockPage;