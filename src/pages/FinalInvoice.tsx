import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const FinalInvoice = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useUser();
  const jobId = new URLSearchParams(location.search).get('jobId') || '';
  const alertRef = useRef<HTMLDivElement>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertType, setAlertType] = useState<'success' | 'error' | 'warning'>('success');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [invoice, setInvoice] = useState({
    jobId: jobId,
    date: new Date().toISOString().split('T')[0],
    createdBy: user?.username || 'Unknown Employee',
    totalPartsCost: 0,
    labourCost: 0,
    advancePayment: 0,
    totalPayment: 0,
    duePayment: 0
  });
  
  const [jobDetails, setJobDetails] = useState({
    productName: '',
    modelNumber: '',
    repairDescription: '',
    warrantyEligibility: 'No',
    assignedEmployee: '', // Add this line
    assignedEmployeeId: 0, // Add this line
  });
  
  const [spareParts, setSpareParts] = useState<Array<{ itemName: string; quantity: number; cost: number }>>([]);
  
  const [customerInfo, setCustomerInfo] = useState({
    customerId: '',
    customerName: '',
    email: '',
    phoneNumber: '',
  });

  const [invoiceEligibility, setInvoiceEligibility] = useState<{
    canCreateInvoice: boolean;
    message: string;
    jobStatus?: string;
    invoiceId?: string;
  } | null>(null);

  useEffect(() => {
    if (jobId) {
      fetchJobDetails();
    }
  }, [jobId]);
  
  // Calculate due payment whenever relevant values change
  useEffect(() => {
    const total = invoice.totalPartsCost + invoice.labourCost;
    const due = total - invoice.advancePayment;
    
    setInvoice(prev => ({
      ...prev,
      totalPayment: total,
      duePayment: due
    }));
  }, [invoice.totalPartsCost, invoice.labourCost, invoice.advancePayment]);

  const fetchJobDetails = async () => {
    // Don't proceed if job ID is empty
    if (!invoice.jobId) {
      setErrors(prev => ({
        ...prev,
        jobId: 'Job ID is required'
      }));
      return;
    }
    
    setIsLoading(true);
    try {
      // First check if invoice can be created for this job
      try {
        const eligibilityResponse = await axios.get(`http://localhost:5000/api/invoice/check/${invoice.jobId}`);
        const eligibilityData = eligibilityResponse.data;
        
        setInvoiceEligibility({
          canCreateInvoice: eligibilityData.canCreateInvoice,
          message: eligibilityData.message,
          jobStatus: eligibilityData.jobStatus,
          invoiceId: eligibilityData.invoiceId
        });
        
        // If invoice cannot be created, show alert and return
        if (!eligibilityData.canCreateInvoice) {
          showAlert(eligibilityData.message, 'warning');
          setIsLoading(false);
          return;
        }
      } catch (error) {
        console.error('Error checking invoice eligibility:', error);
        showAlert('Failed to check invoice eligibility', 'error');
      }
      
      // Continue with fetching job details if invoice can be created
      const url = `http://localhost:5000/api/jobs/eachjob/${invoice.jobId}`;
      //console.log("API URL:", url);
      
      // Fetch job and product details
      const jobResponse = await axios.get(url);
      const jobData = jobResponse.data;
      console.log("Job data received:", jobData);
      
      setJobDetails({
        productName: jobData.product_name || '',
        modelNumber: jobData.model_no || '',
        repairDescription: jobData.repair_description || '',
        warrantyEligibility: jobData.warranty_status || 'No',
        assignedEmployee: jobData.employee_name || 'Not assigned',
        assignedEmployeeId: jobData.employee_id || 0, 
      });
      
      // Fetch customer details
      if (jobData.customer_id) {
        const customerResponse = await axios.get(`http://localhost:5000/api/customers/${jobData.customer_id}`);
        const customerData = customerResponse.data;
        
        setCustomerInfo({
          customerId: customerData.customer_id || '',
          customerName: `${customerData.firstName || ''} ${customerData.lastName || ''}`.trim(),
          phoneNumber: customerData.phone_number?.length > 0 ? customerData.phone_number[0] : '',
          email: customerData.email || '',
        });
      }
      
      // Fetch used spare parts if available
      try {
        console.log("Fetching used inventory for job ID:", invoice.jobId);
        const partsResponse = await axios.get(`http://localhost:5000/api/jobusedInventory/usedinventory/${invoice.jobId}`);
        const partsData = partsResponse.data;
        console.log("Used parts data received:", partsData);
        
        if (partsData && partsData.items && Array.isArray(partsData.items)) {
          // Convert string values to numbers in the mapping
          const formattedParts = partsData.items.map((item: any) => ({
            itemName: item.item_name || '',
            quantity: Number(item.quantity) || 0,
            cost: Number(item.unitprice) || 0,
            total: Number(item.total) || 0
          }));
          
          setSpareParts(formattedParts);
          
          // Convert totalAmount to number
          setInvoice(prev => ({
            ...prev,
            totalPartsCost: Number(partsData.totalAmount) || 0
          }));
          
          console.log("Loaded used parts:", formattedParts);
        } else {
          setSpareParts([]);
          console.log("No used inventory items found");
        }
      } catch (error) {
        console.error("Error fetching used inventory:", error);
        setSpareParts([]);
      }
      
      // Fetch advance payment if any
      try {
        const advanceResponse = await axios.get(`http://localhost:5000/api/advance-invoice/job/${invoice.jobId}`);
        if (advanceResponse.data && advanceResponse.data.Advance_Amount) {
          setInvoice(prev => ({
            ...prev,
            advancePayment: advanceResponse.data.Advance_Amount
          }));
        }
      } catch (error) {
        console.log("No advance payment data available");
      }
      
      // Show success message only if invoice can be created
      if (invoiceEligibility?.canCreateInvoice) {
        showAlert(`Job #${invoice.jobId} details loaded successfully. Ready to create invoice.`, 'success');
      }
      
    } catch (error: any) {
      console.error('Error fetching details:', error);
      
      // Add more specific error messages based on the response
      if (error.response) {
        if (error.response.status === 404) {
          showAlert(`Job #${invoice.jobId} not found. Please check the job ID.`, 'error');
        } else {
          showAlert(`Error (${error.response.status}): ${error.response.data?.message || 'Failed to fetch job details'}`, 'error');
        }
      } else if (error.request) {
        showAlert('No response from server. Please check your connection.', 'error');
      } else {
        showAlert(`Error: ${error.message}`, 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setInvoice(prev => ({
      ...prev,
      [name]: name === 'jobId' ? value : parseFloat(value) || 0
    }));
  };

  const handleWarrantyChange = (value: string) => {
    setJobDetails(prev => ({
      ...prev,
      warrantyEligibility: value
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!invoice.jobId) {
      newErrors.jobId = 'Job ID is required';
    }
    
    if (!invoiceEligibility?.canCreateInvoice) {
      newErrors.jobId = invoiceEligibility?.message || 'Cannot create invoice for this job';
    }
    
    if (invoice.labourCost < 0) {
      newErrors.labourCost = 'Labour cost cannot be negative';
    }
    
    if (invoice.totalPayment <= 0) {
      newErrors.totalPayment = 'Total payment must be greater than zero';
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
      const payload = {
        job_id: Number(invoice.jobId),
        customer_id: Number(customerInfo.customerId),
        employee_id: jobDetails.assignedEmployeeId , 
        invoice_date: invoice.date,
        parts_cost: invoice.totalPartsCost,
        labour_cost: invoice.labourCost,
        advance_payment: invoice.advancePayment,
        total_amount: invoice.totalPayment,
        balance_due: invoice.duePayment,
        created_by: invoice.createdBy,
        warranty_eligible: jobDetails.warrantyEligibility === 'Yes'
      };
      
      console.log("Submitting invoice:", payload);
      
      const response = await axios.post('http://localhost:5000/api/invoice/add', payload);
      
      if (response.status === 201 || response.status === 200) {
        const createdInvoiceId = response.data.Invoice_Id; 
        showAlert(response.data?.message || 'Invoice created successfully', 'success');
        
        setTimeout(() => {
          navigate(`/invoice/${invoice.jobId}`);
        }, 2000);
      }
    } catch (error: any) {
      console.error('Error creating invoice:', error);
      showAlert(error.response?.data?.error || 'Failed to create invoice', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const showAlert = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setAlertMessage(message);
    setAlertType(type);
    
    setTimeout(() => {
      if (alertRef.current) {
        alertRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
    
    setTimeout(() => {
      setAlertMessage(null);
    }, 3000);
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4">
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
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-white">Final Invoice</h1>
              <div className="text-white text-sm bg-white/20 rounded-lg px-4 py-2">
                {invoice.date}
              </div>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Left column - Job details */}
              <div className="md:col-span-2 space-y-6">
                <div>
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                      <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800">Job Information</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Job ID</label>
                      <div className="relative tooltip">
                        <input
                          type="text"
                          name="jobId"
                          value={invoice.jobId}
                          onChange={handleChange}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              fetchJobDetails();
                            }
                          }}
                          className={`w-full pl-10 pr-4 py-2 border ${
                            invoiceEligibility && !invoiceEligibility.canCreateInvoice 
                              ? 'border-red-500' 
                              : errors.jobId 
                                ? 'border-red-500' 
                                : invoiceEligibility?.canCreateInvoice 
                                  ? 'border-green-500' 
                                  : 'border-gray-300'
                          } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none`}
                          placeholder="Enter Job ID"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500">#</span>
                        </div>
                        <button 
                          type="button"
                          onClick={fetchJobDetails}
                          className="absolute inset-y-0 right-0 px-3 flex items-center bg-indigo-50 rounded-r-lg border-l border-gray-300 hover:bg-indigo-100 transition-colors"
                        >
                          <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </button>
                        
                        {/* Add tooltips for different stages */}
                        {!invoice.jobId && (
                          <span className="tooltiptext">
                            Enter a job ID and click search to load job details
                          </span>
                        )}
                        {invoice.jobId && !invoiceEligibility && (
                          <span className="tooltiptext">
                            Click search to check if this job is eligible for invoice creation
                          </span>
                        )}
                      </div>
                      {errors.jobId && <p className="mt-1 text-sm text-red-600">{errors.jobId}</p>}
                      
                      {/* Status indicator */}
                      {invoiceEligibility && (
                        <div className={`mt-2 text-sm ${invoiceEligibility.canCreateInvoice ? 'text-green-600' : 'text-amber-600'} flex items-center`}>
                          {invoiceEligibility.canCreateInvoice ? (
                            <>
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Ready to create invoice
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                              {invoiceEligibility.message}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Created By</label>
                      <input
                        type="text"
                        name="createdBy"
                        value={invoice.createdBy}
                        readOnly
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-600 mb-1">Product Name</label>
                      <input
                        type="text"
                        value={jobDetails.productName}
                        readOnly
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Model Number</label>
                      <input
                        type="text"
                        value={jobDetails.modelNumber}
                        readOnly
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Repaired By</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={jobDetails.assignedEmployee}
                          readOnly
                          className="w-full pl-9 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">Warranty Eligibility</label>
                      <div className="flex space-x-4">
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name="warrantyEligibility"
                            value="Yes"
                            checked={jobDetails.warrantyEligibility === 'Yes'}
                            onChange={() => handleWarrantyChange('Yes')}
                            className="form-radio h-4 w-4 text-indigo-600"
                          />
                          <span className="ml-2 text-gray-700">Yes</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name="warrantyEligibility"
                            value="No"
                            checked={jobDetails.warrantyEligibility === 'No'}
                            onChange={() => handleWarrantyChange('No')}
                            className="form-radio h-4 w-4 text-indigo-600"
                          />
                          <span className="ml-2 text-gray-700">No</span>
                        </label>
                      </div>
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-600 mb-1">Repair Description</label>
                      <textarea
                        value={jobDetails.repairDescription}
                        readOnly
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800">Customer Information</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Customer Name</label>
                      <input
                        type="text"
                        value={customerInfo.customerName}
                        readOnly
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Customer ID</label>
                      <input
                        type="text"
                        value={customerInfo.customerId}
                        readOnly
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                      <input
                        type="email"
                        value={customerInfo.email}
                        readOnly
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Phone Number</label>
                      <input
                        type="text"
                        value={customerInfo.phoneNumber}
                        readOnly
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right column - Cost summary */}
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Cost Summary</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Parts Cost</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">Rs.</span>
                      </div>
                      <input
                        type="number"
                        name="totalPartsCost"
                        value={invoice.totalPartsCost}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Labour Cost</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">Rs.</span>
                      </div>
                      <input
                        type="number"
                        name="labourCost"
                        value={invoice.labourCost}
                        onChange={handleChange}
                        className={`w-full pl-12 pr-4 py-2 border ${errors.labourCost ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none`}
                      />
                    </div>
                    {errors.labourCost && <p className="mt-1 text-sm text-red-600">{errors.labourCost}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Advance Payment</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">Rs.</span>
                      </div>
                      <input
                        type="number"
                        name="advancePayment"
                        value={invoice.advancePayment}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200">
                    <label className="block text-sm font-medium text-gray-600 mb-1">Total Amount</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">Rs.</span>
                      </div>
                      <input
                        type="number"
                        name="totalPayment"
                        value={invoice.totalPayment}
                        readOnly
                        className={`w-full pl-12 pr-4 py-2 bg-gray-50 border ${errors.totalPayment ? 'border-red-500' : 'border-gray-300'} rounded-lg`}
                      />
                    </div>
                    {errors.totalPayment && <p className="mt-1 text-sm text-red-600">{errors.totalPayment}</p>}
                  </div>
                  
                  <div className="pb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Due Payment</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">Rs.</span>
                      </div>
                      <input
                        type="number"
                        name="duePayment"
                        value={invoice.duePayment}
                        readOnly
                        className="w-full pl-12 pr-4 py-2 bg-indigo-50 border border-indigo-200 rounded-lg font-semibold text-indigo-700"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Spare Parts Table */}
            {spareParts.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                    <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800">Used Inventory Items</h2>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 text-gray-700">
                      <tr>
                        <th className="py-3 px-4 text-left text-sm font-medium">Item Name</th>
                        <th className="py-3 px-4 text-left text-sm font-medium">Quantity</th>
                        <th className="py-3 px-4 text-left text-sm font-medium">Unit Price</th>
                        <th className="py-3 px-4 text-left text-sm font-medium">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {spareParts.map((part, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="py-3 px-4 text-sm text-gray-800">{part.itemName}</td>
                          <td className="py-3 px-4 text-sm text-gray-800">{part.quantity}</td>
                          <td className="py-3 px-4 text-sm text-gray-800">
                            Rs. {typeof part.cost === 'number' ? part.cost.toFixed(2) : Number(part.cost).toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-800">
                            Rs. {(part.quantity * part.cost).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-gray-100">
                        <td colSpan={3} className="py-3 px-4 text-sm font-semibold text-gray-800 text-right">Total Parts Cost:</td>
                        <td className="py-3 px-4 text-sm font-semibold text-gray-800">Rs. {invoice.totalPartsCost.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Show message when no spare parts are found */}
            {spareParts.length === 0 && (
              <div className="mb-8">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                    <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800">Used Inventory Items</h2>
                </div>
                
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center text-gray-600">
                  No inventory items were used for this job.
                </div>
              </div>
            )}
            
            {/* Actions */}
            <div className="flex justify-end space-x-4 mt-8">
              <button
                type="button"
                onClick={() => navigate('/jobs')}
                className="px-6 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              
              {/* Conditionally render ONLY ONE button based on eligibility */}
              {invoiceEligibility?.canCreateInvoice ? (
                // Eligible - show enabled button
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    'Save Invoice'
                  )}
                </button>
              ) : (
                // Not eligible - show disabled button with tooltip
                <div className="tooltip">
                  <button
                    type="button" 
                    disabled={true}
                    className="px-6 py-2.5 bg-indigo-300 text-white font-medium rounded-lg cursor-not-allowed flex items-center"
                  >
                    Save Invoice
                  </button>
                  <span className="tooltiptext">
                    {invoiceEligibility?.message || 'Enter a valid job ID to check eligibility'}
                  </span>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    
      <style>{`
        .tooltip {
          position: relative;
          display: inline-block;
        }
        
        .tooltip .tooltiptext {
          visibility: hidden;
          width: 250px;
          background-color: #555;
          color: #fff;
          text-align: center;
          border-radius: 6px;
          padding: 5px;
          position: absolute;
          z-index: 1;
          bottom: 125%;
          left: 50%;
          margin-left: -125px;
          opacity: 0;
          transition: opacity 0.3s;
          font-size: 11px;
        }
        
        .tooltip:hover .tooltiptext {
          visibility: visible;
          opacity: 1;
        }
      `}</style>
    </div>
  );
};

export default FinalInvoice;