import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ApprovalForm from '../pages/QuotationApprovalForm';

interface Quotation {
  quotation_id: string;
  inventoryItem_id: string;
  item_name: string;
  supplier_id: string;
  supplier_name: string;
  unit_price: number;
  notes: string;
  quatationR_date: string;
  qutation_status: string;
}

const QuotationView = () => {
  const { inventoryItem_id } = useParams<{ inventoryItem_id: string }>();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [itemName, setItemName] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | null }>({ 
    text: '', 
    type: null 
  });
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [quotationToReject, setQuotationToReject] = useState<string | null>(null);
  const [showApprovalForm, setShowApprovalForm] = useState(false);
  const [quotationToApprove, setQuotationToApprove] = useState<Quotation | null>(null);
  const navigate = useNavigate();

  // Fetch quotations for the specified inventory item
  useEffect(() => {
    const fetchQuotations = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/inventoryQuotation/quotations/${inventoryItem_id}`);
        setQuotations(response.data.quotations);
        console.log("API Response:", response.data);

        
        
        // Set item name from the first quotation if available
        if (response.data.quotations.length > 0) {
          setItemName(response.data.quotations[0].item_name);
        }
        
        setError(null);
      } catch (err: any) {
        console.error('Error fetching quotations:', err);
        if (err.response?.status === 404) {
          setError('No quotations found for this inventory item.');
        } else {
          setError('Failed to load quotations. Please try again later.');
        }
        setQuotations([]);
      } finally {
        setLoading(false);
      }
    };

    if (inventoryItem_id) {
      fetchQuotations();
    }
  }, [inventoryItem_id]);

  // Show approval form
  const openApprovalForm = (quotation: Quotation) => {
    setQuotationToApprove(quotation);
    setShowApprovalForm(true);
  };

  // Handle successful approval
  const handleApprovalSuccess = async () => {
    setMessage({
      text: 'Quotation approved successfully!',
      type: 'success'
    });
    
    // Refresh quotations from the database to get updated status
    if (inventoryItem_id) {
      try {
        const response = await axios.get(`http://localhost:5000/api/inventoryQuotation/quotations/${inventoryItem_id}`);
        setQuotations(response.data.quotations);
      } catch (err) {
        console.error('Error refreshing quotations:', err);
      }
    }
    
    // Close the form
    setShowApprovalForm(false);
    setQuotationToApprove(null);
  };

  // Show confirmation dialog for rejection
  const confirmReject = (quotationId: string) => {
    setQuotationToReject(quotationId);
    setShowConfirmDialog(true);
  };

  // Handle actual rejection after confirmation
  const handleRejectQuotation = async () => {
    if (!quotationToReject) return;
    
    try {
      await axios.put(`http://localhost:5000/api/inventoryQuotation/quotations/reject/${quotationToReject}`);
      
      setMessage({
        text: 'Quotation rejected successfully!',
        type: 'success'
      });
      
      // Refresh quotations from the database to get updated status
    const response = await axios.get(`http://localhost:5000/api/inventoryQuotation/quotations/${inventoryItem_id}`);
    setQuotations(response.data.quotations);
      
    } catch (err) {
      console.error('Error rejecting quotation:', err);
      setMessage({
        text: 'Failed to reject quotation. Please try again.',
        type: 'error'
      });
    } finally {
      // Close the dialog and reset the quotation to reject
      setShowConfirmDialog(false);
      setQuotationToReject(null);
    }
  };

  // Cancel rejection
  const cancelReject = () => {
    setShowConfirmDialog(false);
    setQuotationToReject(null);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="container mx-auto mt-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">
          Quotations for {itemName || 'Inventory Item'} ({inventoryItem_id})
        </h2>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
        >
          Back to Inventory
        </button>
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
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Quotation ID</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Supplier</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Unit Price</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Notes</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {quotations.map((quotation) => (
                  <tr key={quotation.quotation_id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 text-sm text-gray-700">{quotation.quotation_id}</td>
                    <td className="px-4 py-4 text-sm text-gray-700">{quotation.supplier_name}</td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      ${parseFloat(quotation.unit_price.toString()).toFixed(2)}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {formatDate(quotation.quatationR_date)}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700 max-w-xs truncate">
                      {quotation.notes || 'No notes provided'}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      {quotation.qutation_status === 'approved' && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          Approved
                        </span>
                      )}
                      {quotation.qutation_status === 'rejected' && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                          Rejected
                        </span>
                      )}
                      {quotation.qutation_status === 'pending' && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-center">
                      {quotation.qutation_status === 'pending' ? (
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => openApprovalForm(quotation)}
                            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => confirmReject(quotation.quotation_id)}
                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <div className="text-gray-500 text-xs italic">
                          {quotation.qutation_status === 'approved' ? 'Quotation approved' : 'Quotation rejected'}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {quotations.length === 0 && (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No quotations found</h3>
              <p className="mt-1 text-sm text-gray-500">
                There are no quotations available for this inventory item.
              </p>
            </div>
          )}
        </>
      )}

      {/* Confirmation Dialog for Rejection */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Rejection</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to reject this quotation? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelReject}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectQuotation}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approval Form Modal */}
      {showApprovalForm && quotationToApprove && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Approve Quotation</h3>
              <button 
                onClick={() => {
                  setShowApprovalForm(false);
                  setQuotationToApprove(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                </svg>
              </button>
            </div>
            <ApprovalForm 
              quotation={quotationToApprove} 
              onSuccess={handleApprovalSuccess}
              onCancel={() => {
                setShowApprovalForm(false);
                setQuotationToApprove(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default QuotationView;