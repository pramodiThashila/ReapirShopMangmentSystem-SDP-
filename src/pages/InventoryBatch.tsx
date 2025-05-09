import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

const InventoryBatchAdd = () => {
  const [inventoryItemBatch, setInventoryItemBatch] = useState({
    item_name: '',
    inventoryItem_id: '',
    quantity: '',
    unitprice: '',
    Purchase_Date: '',
    supplier_name: '',
    supplier_id: '',
    order_id: '',
  });
  const [itemList, setItemList] = useState<{ inventoryItem_id: number; item_name: string }[]>([]);
  const [supplierList, setSupplierList] = useState<{ supplier_id: number; supplier_name: string }[]>([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFromOrder, setIsFromOrder] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [touched, setTouched] = useState<{[key: string]: boolean}>({});
  
  const messageRef = useRef<HTMLDivElement>(null);
  
  // Get URL parameters
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const orderId = queryParams.get('orderId');

  // Fetch inventory items and suppliers
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/inventory/all');
        setItemList(response.data);
      } catch (error) {
        console.error('Error fetching inventory items:', error);
      }
    };

    const fetchSuppliers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/suppliers/all');
        setSupplierList(response.data);
      } catch (error) {
        console.error('Error fetching suppliers:', error);
      }
    };

    fetchItems();
    fetchSuppliers();
  }, []);

  // Fetch order details if orderId is provided
  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) return;
      
      setIsLoading(true);
      try {
        const response = await axios.get(`http://localhost:5000/api/inventoryOrder/orderDetails/${orderId}`);
        const orderData = response.data;
        
        if (orderData) {
          setIsFromOrder(true);
          
          // Set inventory batch with order data
          setInventoryItemBatch({
            item_name: orderData.item_name || '',
            inventoryItem_id: orderData.inventoryItem_id?.toString() || '',
            quantity: orderData.quantity?.toString() || '',
            unitprice: orderData.unit_price?.toString() || '', 
            Purchase_Date: new Date().toISOString().split('T')[0], 
            supplier_name: orderData.supplier_name || '',
            supplier_id: orderData.supplier_id?.toString() || '',
            order_id: orderId,
          });
        }
      } catch (error) {
        console.error('Error fetching order details:', error);
        setMessage('Failed to load order details');
        setIsFromOrder(false);
      } finally {
        setIsLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  // Scroll to message when it appears
  useEffect(() => {
    if (message && messageRef.current) {
      messageRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    if (message) {
      const timer = setTimeout(() => {
        setMessage('');
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [message]);

  // Validate individual fields
  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'inventoryItem_id':
        if (!value) return 'Inventory Item is required';
        if (!/^\d+$/.test(value)) return 'Inventory ID must be an integer';
        return '';
        
      case 'supplier_id':
        if (!value) return 'Supplier is required';
        if (!/^\d+$/.test(value)) return 'Supplier ID must be an integer';
        return '';
        
      case 'quantity':
        if (!value) return 'Quantity is required';
        const qty = parseInt(value);
        if (isNaN(qty)) return 'Quantity must be a number';
        if (qty < 1 || qty > 9999) return 'Quantity must be a positive number';
        return '';
        
      case 'unitprice':
        if (!value) return 'Unit price is required';
        const price = parseFloat(value);
        if (isNaN(price)) return 'Unit price must be a number';
        if (price < 0.01) return 'Unit price must be positive and greater than 0.01';
        return '';
        
      case 'Purchase_Date':
        if (!value) return 'Purchase date is required';
        const purchaseDate = new Date(value);
        const now = new Date();
        // Reset hours to compare just the dates
        now.setHours(0, 0, 0, 0);
        purchaseDate.setHours(0, 0, 0, 0);
        
        if (purchaseDate > now) return 'Purchase date cannot be in the future';
        return '';
        
      default:
        return '';
    }
  };

  // Handle input changes and validate
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;

    // Mark field as touched
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    if (name === 'item_name') {
      const selectedItem = itemList.find((item) => item.item_name === value);
      const newInventoryItemId = selectedItem ? String(selectedItem.inventoryItem_id) : '';
      
      setInventoryItemBatch(prev => ({
        ...prev,
        item_name: value,
        inventoryItem_id: newInventoryItemId
      }));
      
      // Validate inventory ID
      setErrors(prev => ({
        ...prev,
        inventoryItem_id: validateField('inventoryItem_id', newInventoryItemId)
      }));
      
    } else if (name === 'supplier_name') {
      const selectedSupplier = supplierList.find((supplier) => supplier.supplier_name === value);
      const newSupplierId = selectedSupplier ? String(selectedSupplier.supplier_id) : '';
      
      setInventoryItemBatch(prev => ({
        ...prev,
        supplier_name: value,
        supplier_id: newSupplierId
      }));
      
      // Validate supplier ID
      setErrors(prev => ({
        ...prev,
        supplier_id: validateField('supplier_id', newSupplierId)
      }));
      
    } else {
      setInventoryItemBatch(prev => ({
        ...prev,
        [name]: value
      }));
      
      // Validate the field
      setErrors(prev => ({
        ...prev,
        [name]: validateField(name, value)
      }));
    }
  };

  // Handle field blur for validation
  const handleBlur = (e: React.FocusEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    // Validate the field on blur
    setErrors(prev => ({
      ...prev,
      [name]: validateField(name, inventoryItemBatch[name as keyof typeof inventoryItemBatch] as string)
    }));
  };

  // Validate entire form
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    let isValid = true;
    
    // Validate all fields
    Object.entries(inventoryItemBatch).forEach(([key, value]) => {
      if (key !== 'order_id' && key !== 'item_name' && key !== 'supplier_name') {
        const error = validateField(key, value as string);
        if (error) {
          newErrors[key] = error;
          isValid = false;
          
          // Mark field as touched if it has an error
          setTouched(prev => ({
            ...prev,
            [key]: true
          }));
        }
      }
    });
    
    setErrors(prev => ({
      ...prev,
      ...newErrors
    }));
    
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate all fields first
    if (!validateForm()) {
      setMessage('Please correct the errors before submitting');
      return;
    }

    const { 
      inventoryItem_id, 
      quantity, 
      unitprice, 
      Purchase_Date, 
      supplier_id,
      order_id
    } = inventoryItemBatch;

    setIsLoading(true);
    try {
      const payload = {
        inventoryItem_id: parseInt(inventoryItem_id, 10),
        supplier_id: parseInt(supplier_id, 10),
        quantity: parseInt(quantity, 10),
        unitprice: parseFloat(unitprice),
        Purchase_Date,
        order_id: order_id || null,
      };

      await axios.post('http://localhost:5000/api/inventoryBatch/add', payload);

      setMessage('Inventory batch added successfully');
      
      // If this was from an order, update the order status
      if (isFromOrder && order_id) {
        try {
          await axios.put(`http://localhost:5000/api/inventoryOrder/orders/complete/${order_id}`);
          setTimeout(() => {
            navigate('/inventory-orders');
          }, 2000);
        } catch (error: any) {
          console.error('Error updating order status:', error);
          setMessage(error.response?.data?.message || 'Error updating order status');
        }
      } else {
        // Reset the form for manual entry
        setInventoryItemBatch({
          item_name: '',
          inventoryItem_id: '',
          quantity: '',
          unitprice: '',
          Purchase_Date: '',
          supplier_name: '',
          supplier_id: '',
          order_id: '',
        });
        setTouched({});
        setErrors({});
      }
    } catch (error: any) {
      console.error('Error adding inventory batch:', error);
      
      // Handle backend validation errors
      if (error.response?.data?.errors) {
        const backendErrors = error.response.data.errors;
        const formattedErrors: {[key: string]: string} = {};
        
        // Format backend errors to match our state structure
        backendErrors.forEach((err: any) => {
          formattedErrors[err.param] = err.msg;
          
          // Mark fields with errors as touched
          setTouched(prev => ({
            ...prev,
            [err.param]: true
          }));
        });
        
        setErrors(prev => ({
          ...prev,
          ...formattedErrors
        }));
        setMessage('Please correct the errors in the form');
      } else {
        setMessage(error.response?.data?.error || 'Error adding inventory batch');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    if (isFromOrder) {
      navigate('/inventory-orders');
    } else {
      setInventoryItemBatch({
        item_name: '',
        inventoryItem_id: '',
        quantity: '',
        unitprice: '',
        Purchase_Date: '',
        supplier_name: '',
        supplier_id: '',
        order_id: '',
      });
      setErrors({});
      setTouched({});
      setMessage('');
    }
  };

  // Helper to determine if field error should be shown
  const showError = (field: string) => touched[field] && errors[field];
  
  // Get field class based on validation state
  const getFieldClass = (field: string) => {
    return `w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
      showError(field)
        ? 'border-red-300 focus:ring-red-500'
        : 'border-gray-300 focus:ring-blue-500'
    }`;
  };

  if (isLoading && orderId) {
    return (
      <div className="max-w-3xl mx-auto mt-8 p-6 bg-gray-100 rounded-lg shadow-md">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-3">Loading order details...</span>
        </div>
      </div>
    );
  }

  // Keeping most of your existing code unchanged, focusing on UI enhancement

  // Return section with enhanced UI
  return (
    <div className="max-w-5xl mx-auto mt-8 mb-8">
      {/* Page header with breadcrumb navigation */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {isFromOrder ? 'Complete Inventory Order' : 'Add New Inventory Batch'}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Inventory Management / {isFromOrder ? 'Process Order' : 'Add Batch'}
        </p>
      </div>
      
      {/* Messages at the top of the page */}
      {message && (
        <div 
          ref={messageRef}
          className={`mb-6 p-4 rounded-md shadow-sm ${
            message.includes('successfully') ? 'bg-green-50 border-l-4 border-green-500' : 'bg-red-50 border-l-4 border-red-500'
          }`}
        >
          <div className="flex items-center">
            {message.includes('successfully') ? (
              <svg className="h-5 w-5 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="h-5 w-5 text-red-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
            <p className={`text-sm font-medium ${message.includes('successfully') ? 'text-green-800' : 'text-red-800'}`}>
              {message}
            </p>
          </div>
        </div>
      )}
      
      {/* Main content with card design */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        {/* Card header for order information */}
        {isFromOrder && (
          <div className="bg-blue-50 p-5 border-b border-blue-100">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Order Information</h3>
                <p className="mt-1 text-sm text-blue-700">
                  This form has been pre-filled with Order #{orderId} details. Please verify the information before submitting.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Form section */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Two-column layout for desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              {/* Left column */}
              <div className="space-y-5">
                {/* Item Name Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Item Name</label>
                  <select
                    name="item_name"
                    value={inventoryItemBatch.item_name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={getFieldClass('item_name')}
                    required
                    disabled={isFromOrder}
                  >
                    <option value="">Select an item</option>
                    {itemList.map((item) => (
                      <option key={item.inventoryItem_id} value={item.item_name}>
                        {item.item_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Item ID (Read-only) - without icon */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Item ID</label>
                  <div>
                    <input
                      type="text"
                      name="inventoryItem_id"
                      value={inventoryItemBatch.inventoryItem_id}
                      readOnly
                      className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    />
                  </div>
                  {showError('inventoryItem_id') && (
                    <p className="mt-1 text-xs text-red-600">{errors.inventoryItem_id}</p>
                  )}
                </div>

                {/* Quantity - without icon */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Quantity <span className="text-xs text-gray-500">(Enter a Positive Number)</span>
                  </label>
                  <div>
                    <input
                      type="number"
                      name="quantity"
                      value={inventoryItemBatch.quantity}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={getFieldClass('quantity')}
                      required
                      min="1"
                      max="9999"
                      disabled={isFromOrder}
                    />
                  </div>
                  {showError('quantity') && (
                    <p className="mt-1 text-xs text-red-600">{errors.quantity}</p>
                  )}
                </div>
                
                {/* Purchase Date - without icon */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Purchase Date <span className="text-xs text-gray-500">(Cannot be a Future Date)</span>
                  </label>
                  <div>
                    <input
                      type="date"
                      name="Purchase_Date"
                      value={inventoryItemBatch.Purchase_Date}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={getFieldClass('Purchase_Date')}
                      required
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  {showError('Purchase_Date') && (
                    <p className="mt-1 text-xs text-red-600">{errors.Purchase_Date}</p>
                  )}
                </div>
              </div>
              
              {/* Right column */}
              <div className="space-y-5">
                {/* Supplier Name Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Supplier Name</label>
                  <select
                    name="supplier_name"
                    value={inventoryItemBatch.supplier_name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={getFieldClass('supplier_name')}
                    required
                    disabled={isFromOrder}
                  >
                    <option value="">Select a supplier</option>
                    {supplierList.map((supplier) => (
                      <option key={supplier.supplier_id} value={supplier.supplier_name}>
                        {supplier.supplier_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Supplier ID (Read-only) - without icon */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Supplier ID</label>
                  <div>
                    <input
                      type="text"
                      name="supplier_id"
                      value={inventoryItemBatch.supplier_id}
                      readOnly
                      className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    />
                  </div>
                  {showError('supplier_id') && (
                    <p className="mt-1 text-xs text-red-600">{errors.supplier_id}</p>
                  )}
                </div>

                {/* Unit Price - without currency icon, using standard label instead */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Unit Price (Rs.) <span className="text-xs text-gray-500">(Should be Positive)</span>
                  </label>
                  <div>
                    <input
                      type="number"
                      name="unitprice"
                      value={inventoryItemBatch.unitprice}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={getFieldClass('unitprice')}
                      required
                      min="0.01"
                      step="0.01"
                      disabled={isFromOrder}
                    />
                  </div>
                  {showError('unitprice') && (
                    <p className="mt-1 text-xs text-red-600">{errors.unitprice}</p>
                  )}
                </div>
                
                {/* Order ID (Hidden) */}
                {orderId && (
                  <input
                    type="hidden"
                    name="order_id"
                    value={inventoryItemBatch.order_id}
                  />
                )}
                
                {/* Empty div for alignment */}
                <div></div>
              </div>
            </div>
            
            {/* Total price calculation - Preview */}
            <div className="mt-4 py-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Total Amount:</span>
                <span className="text-lg font-bold text-gray-900">
                  Rs. {
                    inventoryItemBatch.quantity && inventoryItemBatch.unitprice 
                      ? (parseFloat(inventoryItemBatch.quantity) * parseFloat(inventoryItemBatch.unitprice)).toFixed(2) 
                      : '0.00'
                  }
                </span>
              </div>
            </div>

            {/* Form actions */}
            <div className="pt-5 border-t border-gray-200 flex justify-between items-center">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
              >
                {isFromOrder ? 'Cancel' : 'Reset Form'}
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors flex items-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    {isFromOrder ? (
                      <>
                        <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>Complete Order</span>
                      </>
                    ) : (
                      <>
                        <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        <span>Add Inventory Batch</span>
                      </>
                    )}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InventoryBatchAdd;