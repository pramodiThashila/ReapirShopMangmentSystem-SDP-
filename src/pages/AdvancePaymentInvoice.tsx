import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useUser } from '../context/UserContext';

const AdvancePaymentInvoice = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const jobId = new URLSearchParams(location.search).get('jobId');
  const { user } = useUser();
  
  const [isLoading, setIsLoading] = useState(false);
  const [invoice, setInvoice] = useState({
    date: new Date().toISOString().split('T')[0],
    jobId: jobId || '',
    advanceAmount: 0,
    createdBy: user?.username || 'Unknown Employee'
  });
  
  const [jobDetails, setJobDetails] = useState({
    productName: '',
    modelNumber: '',
    repairDescription: '',
  });
  
  const [customerInfo, setCustomerInfo] = useState({
    customerName: '',
    phoneNumber: '',
    email: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertType, setAlertType] = useState<'success' | 'error' | 'warning'>('success');

  // Add a ref for the alert element
  const alertRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (jobId) {
      fetchJobDetails();
    }
  }, [jobId]);

  const fetchJobDetails = async () => {
    setIsLoading(true);
    try {
      const jobResponse = await axios.get(`http://localhost:5000/api/jobs/eachjob/${jobId}`);
      const jobData = jobResponse.data;
      
      setJobDetails({
        productName: jobData.product_name || '',
        modelNumber: jobData.model_no || '',
        repairDescription: jobData.repair_description || '',
      });
      
      if (jobData.customer_id) {
        const customerResponse = await axios.get(`http://localhost:5000/api/customers/${jobData.customer_id}`);
        const customerData = customerResponse.data;
        
        setCustomerInfo({
          customerName: `${customerData.firstName || ''} ${customerData.lastName || ''}`.trim(),
          phoneNumber: customerData.phone_number?.length > 0 ? customerData.phone_number[0] : '',
          email: customerData.email || '',
        });
      } else {
        setCustomerInfo({
          customerName: jobData.customer_name || '',
          phoneNumber: '',
          email: '',
        });
      }
      
      setInvoice(prev => ({
        ...prev,
        jobId: jobId || ''
      }));
    } catch (error) {
      console.error('Error fetching job details:', error);
      showAlert('Failed to fetch job details', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInvoice(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!invoice.jobId) {
      newErrors.jobId = 'Job ID is required';
    } else if (isNaN(Number(invoice.jobId))) {
      newErrors.jobId = 'Job ID must be a number';
    }
    
    if (!invoice.advanceAmount) {
      newErrors.advanceAmount = 'Advance amount is required';
    } else if (Number(invoice.advanceAmount) <= 0) {
      newErrors.advanceAmount = 'Advance amount must be a positive number';
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      showAlert('Please fix the errors in the form', 'error');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const jobResponse = await axios.get(`http://localhost:5000/api/jobs/eachjob/${jobId}`);
      const jobData = jobResponse.data;  
      const customerResponse = await axios.get(`http://localhost:5000/api/customers/${jobData.customer_id}`);
      const customerId = customerResponse.data.customer_id;
      
      const employeeId = user?.employee_id;
      
      if (!employeeId) {
        showAlert('Employee ID not available. Please log in again.', 'error');
        setIsLoading(false);
        return;
      }
      
      const payload = {
        job_id: Number(invoice.jobId),
        customer_id: customerId,
        employee_id: employeeId,
        advance_amount: Number(invoice.advanceAmount),
        date: invoice.date
      };

      console.log(payload);
      
      const response = await axios.post('http://localhost:5000/api/advance-invoice/create', payload);
      
      if (response.status === 201 || response.status === 200) {
        if (response.data && response.data.message) {
          showAlert(response.data.message, 'success');
        } else {
          showAlert('Advance payment invoice created successfully', 'success');
        }
        
        // Delay navigation to allow user to see the alert
        setTimeout(() => {
          navigate('/jobs/view');
        }, 2000);
      } else {
        showAlert('Operation completed but server response was unexpected', 'warning');
      }
    } catch (error: any) {
      console.error('Error creating advance invoice:', error);
      
      if (error.response) {
        if (error.response.data && error.response.data.errors) {
          const serverErrors = error.response.data.errors;
          const formattedErrors: Record<string, string> = {};
          
          serverErrors.forEach((err: any) => {
            const field = err.param.replace('_', '');
            formattedErrors[field] = err.msg;
          });
          
          setErrors(formattedErrors);
          showAlert('Please fix the errors in the form', 'error');
        } else if (error.response.data && error.response.data.error) {
          showAlert(error.response.data.error, 'error');
        } else {
          showAlert(`Server error: ${error.response.status}`, 'error');
        }
      } else if (error.request) {
        showAlert('No response from server. Please check your connection.', 'error');
      } else {
        showAlert('Failed to create advance payment invoice', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Modify the showAlert function to also scroll to the alert
  const showAlert = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setAlertMessage(message);
    setAlertType(type);
    
    // Scroll to the alert after a brief delay to ensure the DOM is updated
    setTimeout(() => {
      if (alertRef.current) {
        alertRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    }, 100);
    
    // Auto-hide alert after 3 seconds
    setTimeout(() => {
      setAlertMessage(null);
    }, 3000);
  };

  // Add an effect to scroll to the alert when it appears
  useEffect(() => {
    if (alertMessage && alertRef.current) {
      alertRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  }, [alertMessage]);

  return (
    <div className="max-w-4xl mx-auto my-10 px-4">
      {/* Alert Box - Add ref */}
      {alertMessage && (
        <div 
          ref={alertRef}
          className={`mb-6 p-4 rounded-lg ${
            alertType === 'success' ? 'bg-green-100 text-green-800 border border-green-200' :
            alertType === 'error' ? 'bg-red-100 text-red-800 border border-red-200' :
            'bg-yellow-100 text-yellow-800 border border-yellow-200'
          }`}
        >
          {alertMessage}
        </div>
      )}
      
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
          <h1 className="text-2xl font-bold text-white">Advance Payment Invoice</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Top section - Date & Created By */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                name="date"
                value={invoice.date}
                onChange={handleChange}
                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Created By</label>
              <input
                type="text"
                name="createdBy"
                value={invoice.createdBy}
                readOnly
                className="w-full px-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg"
              />
            </div>
          </div>
          
          {/* Job Details */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Job Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Job ID</label>
                <input
                  type="text"
                  value={invoice.jobId}
                  onChange={handleChange}
                  name="jobId"
                  onBlur={fetchJobDetails}
                  className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Enter Job ID"
                />
                {errors.jobId && <p className="text-red-500 text-sm mt-1">{errors.jobId}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Product</label>
                <input
                  type="text"
                  value={jobDetails.productName}
                  readOnly
                  className="w-full px-4 py-2 text-sm bg-gray-100 border border-gray-200 rounded-lg"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-600 mb-1">Repair Description</label>
                <textarea
                  value={jobDetails.repairDescription}
                  readOnly
                  className="w-full px-4 py-2 text-sm bg-gray-100 border border-gray-200 rounded-lg"
                  rows={2}
                />
              </div>
            </div>
          </div>
          
          {/* Customer Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Customer Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Customer Name</label>
                <input
                  type="text"
                  value={customerInfo.customerName}
                  readOnly
                  className="w-full px-4 py-2 text-sm bg-gray-100 border border-gray-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={customerInfo.phoneNumber}
                  readOnly
                  className="w-full px-4 py-2 text-sm bg-gray-100 border border-gray-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                <input
                  type="email"
                  value={customerInfo.email}
                  readOnly
                  className="w-full px-4 py-2 text-sm bg-gray-100 border border-gray-200 rounded-lg"
                />
              </div>
            </div>
          </div>
          
          {/* Advance Amount - Simplified Payment Section */}
          <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-100">
            <h2 className="text-lg font-semibold text-blue-800 mb-3">Advance Payment</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Advance Amount</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  name="advanceAmount"
                  value={invoice.advanceAmount}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full pl-7 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="0.00"
                  required
                />
              </div>
              {errors.advanceAmount && <p className="text-red-500 text-sm mt-1">{errors.advanceAmount}</p>}
            </div>
          </div>
          
          {/* Buttons */}
          <div className="flex justify-end gap-4 pt-2">
            <button
              type="button"
              onClick={() => navigate('/jobs')}
              className="px-5 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-400"
            >
              {isLoading ? 'Processing...' : 'Create Invoice'}
            </button>
          </div>
        </form>
      </div>
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default AdvancePaymentInvoice;