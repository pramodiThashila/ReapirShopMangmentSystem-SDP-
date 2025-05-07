import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import {
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Package2,
  ClipboardList,
  AlertCircle,
  Loader2,
  ThumbsUp,
  FileText
} from 'lucide-react';

interface Quotation {
  quotation_id: number;
  inventoryItem_id: number;
  item_name: string;
  supplier_id: number;
  supplier_name: string;
  unit_price: number;
  notes: string | null;
  quatationR_date: string;
  qutation_status: string;

}

interface Order {
  order_id: number;
  inventoryItem_id: number;
  supplier_id: number;
  quotation_id: number;
  needBeforeDate: string;
  quantity: number;
  order_status: string;
  notes: string | null;
}

const QuotationListPage = () => {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const navigate = useNavigate();

  const fetchQuotations = async () => {
    setLoading(true);
    try {
      const supplierData = localStorage.getItem('supplierData');

      if (!supplierData) {
        throw new Error('Supplier data not found. Please log in again.');
      }

      const parsedData = JSON.parse(supplierData);
      const supplierId = parsedData.supplier_id;

      if (!supplierId) {
        throw new Error('Invalid supplier ID. Please log in again.');
      }

      const response = await axios.get(`http://localhost:5000/api/inventoryQuotation/supplier/${supplierId}`);
      setQuotations(response.data.quotations);
    } catch (error) {
      console.error('Error fetching quotations:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Failed to fetch quotations. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchApprovedQuotations = async () => {
    try {
      const supplierData = localStorage.getItem('supplierData');
  
      if (!supplierData) {
        throw new Error('Supplier data not found. Please log in again.');
      }
  
      const parsedData = JSON.parse(supplierData);
      const supplierId = parsedData.supplier_id;
  
      if (!supplierId) {
        throw new Error('Invalid supplier ID. Please log in again.');
      }
  
      const response = await axios.get(`http://localhost:5000/api/inventoryOrder/bysupplier/${supplierId}`);
      console.log('Order API response:', response.data);
  
      // The response structure is { count: number, orders: Order[] }
      if (response.data && response.data.orders) {
        setOrders(response.data.orders);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      // Don't set error state to avoid UI disruption if only orders fail but quotations succeed
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
    fetchApprovedQuotations();
  }, []);

  const handleConfirmOrder = async (quotationId: number) => {
    try {
      // Get the matching order ID for the quotation
      const matchingOrder = getMatchingOrder(quotationId);
      
      if (!matchingOrder) {
        console.error('No matching order found for quotation:', quotationId);
        return;
      }
      
      // Use the order_id instead of quotationId for the API call
      
      await axios.put(`http://localhost:5000/api/inventoryOrder/order/supplier/approve/${quotationId}`);
      
      // Update the orders state to reflect confirmation
      setOrders(orders.map(order => 
        order.quotation_id === quotationId 
          ? { ...order, order_status: 'confirmed' } 
          : order
      ));
      
      setShowConfirmModal(false);
      
      // Optional: Show success notification
      alert('Order confirmed successfully!');
      
    } catch (error) {
      console.error('Error confirming order:', error);
      // Handle error
      alert('Failed to confirm order. Please try again.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock size={12} className="mr-1" />
            Pending
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle size={12} className="mr-1" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle size={12} className="mr-1" />
            Rejected
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <ThumbsUp size={12} className="mr-1" />
            Confirmed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'LKR'
    }).format(price);
  };

  const getMatchingOrder = (quotationId: number) => {
    return orders.find(order => order.quotation_id === quotationId);
  };

  if (loading) {
    return (
      <div className="container py-12 flex justify-center items-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
          <p className="text-gray-600">Loading your quotations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-12">
        <div className="max-w-3xl mx-auto">
          <div className="card p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Failed to Load Quotations</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-sm text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              onClick={() => fetchQuotations()}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">My Quotations</h1>
            <p className="text-gray-600 mt-1">
              Track and manage all your submitted quotations
            </p>
          </div>
          <button
            className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-sm text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            onClick={() => navigate('/supplier/new-quotation')}
          >
            Submit New Quotation
          </button>
        </div>

        {quotations.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-12 text-center">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">No Quotations Yet</h2>
            <p className="text-gray-600 mb-6">You haven't submitted any quotations yet. Start by submitting a new quotation.</p>
            <button
              className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-sm text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              onClick={() => navigate('/supplier/new-quotation')}
            >
              Submit Your First Quotation
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {quotations.map((quotation) => (
              <div
                key={quotation.quotation_id}
                className={`bg-white shadow rounded-lg p-6 ${quotation.qutation_status.toLowerCase() === 'approved' ? 'border-2 border-green-500' : ''}`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4">
                  <div>
                    <div className="flex items-center mb-2">
                      <h3 className="text-xl font-semibold mr-3">{quotation.item_name}</h3>
                      {getStatusBadge(quotation.qutation_status)}
                    </div>
                    <p className="text-gray-500 text-sm">
                      Quotation #{quotation.quotation_id} • Submitted on {formatDate(quotation.quatationR_date)}
                    </p>
                  </div>
                  <div className="mt-3 lg:mt-0">
                    <span className="text-2xl font-bold text-blue-600">{formatPrice(quotation.unit_price)}</span>
                    <span className="text-gray-500 text-sm ml-1">per unit</span>
                  </div>
                </div>

                {quotation.notes && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Notes: </span>
                      {quotation.notes}
                    </p>
                  </div>
                )}

                {/* Additional information for approved quotations */}
                {quotation.qutation_status.toLowerCase() === 'approved' && (
                  <div className="mt-4 bg-green-50 p-4 rounded-md border border-green-200">
                    <h4 className="font-semibold text-green-800 mb-3">Order Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <div className="flex items-center text-green-700">
                          <Package2 size={16} className="mr-2" />
                          <span className="text-sm font-medium">Quantity Needed</span>
                        </div>
                        <p className="ml-6 mt-1 text-black font-semibold">
                          {/* Find matching order by quotation_id and display its quantity */}
                          {getMatchingOrder(quotation.quotation_id)?.quantity || 'N/A'} units
                        </p>
                      </div>
                      <div>
                        <div className="flex items-center text-green-700">
                          <Calendar size={16} className="mr-2" />
                          <span className="text-sm font-medium">Needed By</span>
                        </div>
                        <p className="ml-6 mt-1 text-black font-semibold">
                          {/* Find matching order and display its needBeforeDate */}
                          {getMatchingOrder(quotation.quotation_id)?.needBeforeDate
                            ? formatDate(getMatchingOrder(quotation.quotation_id)!.needBeforeDate)
                            : 'As soon as possible'}
                        </p>
                      </div>
                      <div>
                        <div className="flex items-center text-green-700">
                          <ClipboardList size={16} className="mr-2" />
                          <span className="text-sm font-medium">Total Order Value</span>
                        </div>
                        <p className="ml-6 mt-1 text-black font-semibold">
                          {/* Calculate total value using the matching order's quantity */}
                          {formatPrice(quotation.unit_price * (getMatchingOrder(quotation.quotation_id)?.quantity || 0))}
                        </p>
                      </div>
                    </div>

                    {getMatchingOrder(quotation.quotation_id)?.notes && (
                      <div className="mt-3 p-3 bg-white rounded border border-green-200">
                        <p className="text-sm text-gray-700">
                          <span className="font-semibold">Special Instructions: </span>
                          {getMatchingOrder(quotation.quotation_id)?.notes}
                        </p>
                      </div>
                    )}

                    {/* Only show confirm button if order status is NOT confirmed or rejected */}
                    {(() => {
                      const matchingOrder = getMatchingOrder(quotation.quotation_id);
                      const orderStatus = matchingOrder?.order_status?.toLowerCase();
                      
                      if (orderStatus !== 'confirmed' && orderStatus !== 'rejected') {
                        return (
                          <div className="mt-4 flex justify-end">
                            <button
                              className="inline-flex items-center px-4 py-2 bg-green-600 border border-transparent rounded-md font-semibold text-sm text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                              onClick={() => {
                                setSelectedQuotation(quotation);
                                setShowConfirmModal(true);
                              }}
                            >
                              <ThumbsUp size={16} className="mr-2" />
                              Confirm Order
                            </button>
                          </div>
                        );
                      }
                      
                      // If order is already confirmed, show a badge
                      if (orderStatus === 'confirmed') {
                        return (
                          <div className="mt-4 flex justify-end">
                            <span className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-blue-100 text-blue-800">
                              <ThumbsUp size={14} className="mr-1" />
                              Confirmed for Supply
                            </span>
                          </div>
                        );
                      }
                      
                      return null;
                    })()}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && selectedQuotation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6" style={{
            animation: 'fadeIn 0.2s ease-out',
          }}>
            <h3 className="text-lg font-semibold mb-4">Confirm Order</h3>
            <p className="mb-6">
              Are you sure you want to confirm this order for <strong>{getMatchingOrder(selectedQuotation.quotation_id)?.quantity || 'N/A'} units</strong> of <strong>{selectedQuotation.item_name}</strong> at <strong>{formatPrice(selectedQuotation.unit_price)}</strong> per unit?
            </p>
            <div className="bg-gray-50 p-3 rounded mb-6">
              <p className="text-sm text-gray-700 mb-2">
                <span className="font-semibold">Total Order Value: </span>
                {formatPrice(selectedQuotation.unit_price * (getMatchingOrder(selectedQuotation.quotation_id)?.quantity || 0))}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Delivery Deadline: </span>
                {getMatchingOrder(selectedQuotation.quotation_id)?.needBeforeDate
                  ? formatDate(getMatchingOrder(selectedQuotation.quotation_id)!.needBeforeDate)
                  : 'As soon as possible'}
              </p>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md font-semibold text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                onClick={() => setShowConfirmModal(false)}
              >
                Cancel
              </button>
              <button
                className="inline-flex items-center px-4 py-2 bg-green-600 border border-transparent rounded-md font-semibold text-sm text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                onClick={() => handleConfirmOrder(selectedQuotation.quotation_id)}
              >
                Confirm Order
              </button>
            </div>
            <style jsx>{`
              @keyframes fadeIn {
                from {
                  opacity: 0;
                  transform: translateY(-10px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
            `}</style>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuotationListPage;