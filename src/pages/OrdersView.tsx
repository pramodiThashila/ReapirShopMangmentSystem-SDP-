import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface Order {
  order_id: string;
  inventoryItem_id: string;
  item_name: string;
  supplier_id: string;
  supplier_name: string;
  quotation_id: string;
  needBeforeDate: string;
  unit_price: number;
  quantity: number;
  order_status: string;
  notes: string;
}

const OrdersView = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | null }>({ 
    text: '', 
    type: null 
  });
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const navigate = useNavigate();

  // Fetch all orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        console.log("Fetching all orders");
        const response = await axios.get('http://localhost:5000/api/inventoryOrder');
        console.log("API Response:", response.data);
        setOrders(response.data.orders);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders. Please try again later.');
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate total price
  const calculateTotal = (unitPrice: number, quantity: number) => {
    return (unitPrice * quantity).toFixed(2);
  };

  // Handle row selection
  const handleRowClick = (orderId: string) => {
    setSelectedOrderId(orderId === selectedOrderId ? null : orderId);
  };

  // Navigate to inventory batch form with selected order ID
  const handleProceedToInventory = () => {
    if (selectedOrderId) {
      navigate(`/inventoryItem/batch/add?orderId=${selectedOrderId}`);
    }
  };

  // Render status badge based on order status
  const renderStatusBadge = (status: string) => {
    switch(status.toLowerCase()) {
      case 'pending':
        return (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
            Pending
          </span>
        );
      case 'confirmed':
        return (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
            Confirmed
          </span>
        );
      case 'Shipped':
        return (
          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
            Shipped
          </span>
        );
      case 'received':
        return (
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
             Order Received
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="container mx-auto mt-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold"> Orders For Inventory </h2>
        <div className="flex gap-3">
          <button
            onClick={handleProceedToInventory}
            disabled={!selectedOrderId}
            className={`px-4 py-2 rounded-lg flex items-center ${
              selectedOrderId 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-blue-300 text-white cursor-not-allowed'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
            </svg>
            Process Selected Order to Inventory
          </button>
          
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            Back
          </button>
        </div>
      </div>

      {/* Instructions for user */}
      <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              Click on a row to select an order. Then click "Process Selected Order to Inventory" to add inventory batch details.
            </p>
          </div>
        </div>
      </div>

      {/* Alert Message */}
      {message.text && (
        <div className={`mb-4 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Order ID</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Item</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Supplier</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Need Before</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Unit Price</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Qty</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Total</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Supplier Confirmation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr 
                    key={order.order_id} 
                    className={`hover:bg-gray-50 cursor-pointer ${
                      selectedOrderId === order.order_id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                    }`}
                    onClick={() => handleRowClick(order.order_id)}
                  >
                    <td className="px-4 py-4 text-sm text-gray-700">{order.order_id}</td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      <div className="font-medium">{order.item_name}</div>
                      <div className="text-xs text-gray-500">ID: {order.inventoryItem_id}</div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">{order.supplier_name}</td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {order.needBeforeDate ? formatDate(order.needBeforeDate) : 'Not specified'}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      Rs. {parseFloat(order.unit_price.toString()).toFixed(2)}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">{order.quantity}</td>
                    <td className="px-4 py-4 text-sm font-medium">
                      Rs. {calculateTotal(order.unit_price, order.quantity)}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      {renderStatusBadge(order.order_status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {orders.length === 0 && (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
              <p className="mt-1 text-sm text-gray-500">
                There are no inventory orders available in the system.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default OrdersView;