import React, { useState, useEffect } from 'react';
import axios from 'axios';

type BackendError = {
  msg: string;
  param: string;
  location: string;
};

const SupplierRegister = () => {
  const [supplier, setSupplier] = useState<{
    supplier_name: string;
    email: string;
    phone_number: string[];
    address: string;
    password: string;
  }>({
    supplier_name: '',
    email: '',
    phone_number: [],
    address: '',
    password: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Enhanced validation errors
  const [errors, setErrors] = useState<{
    supplier_name?: string;
    email?: string;
    phone_number?: string;
    address?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});

  // Add useEffect to clear messages after 4 seconds
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (message) {
      timer = setTimeout(() => {
        setMessage('');
      }, 4000); // 4 seconds
    }
    
    // Cleanup timer on component unmount or when message changes
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [message]);

  const validateField = (name: string, value: any): string | undefined => {
    switch (name) {
      case 'supplier_name':
        if (!value) return 'Supplier name is required';
        if (value.length > 100) return 'Supplier name should not exceed 100 characters';
        break;
      case 'email':
        if (!value) return 'Email is required';
        if (!/^\S+@\S+\.\S+$/.test(value)) return 'Invalid email format';
        break;
      case 'phone_number':
        if (!Array.isArray(value) || value.length === 0) return 'At least one phone number is required';
        for (let phone of value) {
          if (!/^(07|01|03)\d{8}$/.test(phone.trim())) {
            return 'Phone number should contain exactly 10 digits and start from 07, 03, or 01';
          }
        }
        break;
      case 'address':
        if (!value) return 'Address is required';
        if (value.length > 255) return 'Address should not exceed 255 characters';
        break;
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 6) return 'Password must be at least 6 characters long';
        break;
      case 'confirmPassword':
        if (value !== supplier.password) return 'Passwords do not match';
        break;
      default:
        return undefined;
    }
    return undefined;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Clear any backend errors for this field when user starts typing
    setErrors(prev => ({ ...prev, [name]: undefined }));

    if (name === 'phone_number') {
      const phoneArray = value.split(',').map((num) => num.trim());
      setSupplier((prev) => ({
        ...prev,
        phone_number: phoneArray,
      }));
      
      // Validate phone numbers
      const error = validateField('phone_number', phoneArray);
      setErrors(prev => ({ ...prev, phone_number: error }));
    } else {
      setSupplier((prev) => ({
        ...prev,
        [name]: value,
      }));
      
      // Validate the field
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;

    // Clear any backend errors for this field when user starts typing
    setErrors(prev => ({ ...prev, password: undefined }));

    setSupplier((prev) => ({
      ...prev,
      password: value,
    }));
    
    // Validate password
    const passwordError = validateField('password', value);
    // Also check confirm password match if it's already entered
    const confirmError = confirmPassword ? (confirmPassword !== value ? 'Passwords do not match' : undefined) : undefined;
    
    setErrors(prev => ({ 
      ...prev, 
      password: passwordError,
      confirmPassword: confirmError
    }));
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setConfirmPassword(value);
    
    // Clear any backend errors for this field when user starts typing
    setErrors(prev => ({ ...prev, confirmPassword: undefined }));
    
    // Validate confirm password
    const error = validateField('confirmPassword', value);
    setErrors(prev => ({ ...prev, confirmPassword: error }));
  };

  const validateForm = (): boolean => {
    const newErrors = {
      supplier_name: validateField('supplier_name', supplier.supplier_name),
      email: validateField('email', supplier.email),
      phone_number: validateField('phone_number', supplier.phone_number),
      address: validateField('address', supplier.address),
      password: validateField('password', supplier.password),
      confirmPassword: validateField('confirmPassword', confirmPassword)
    };
    
    setErrors(prev => ({ ...prev, ...newErrors }));
    
    // Check if there are any errors
    return !Object.values(newErrors).some(error => error !== undefined);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset messages and errors
    setMessage('');
    setIsSuccess(false);
    setErrors({});
    
    // Validate all fields before submission
    if (!validateForm()) {
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/suppliers/register', {
        ...supplier,
        password: supplier.password,
      });
      
      setIsSuccess(true);
      setMessage('Supplier registered successfully');
      setSupplier({
        supplier_name: '',
        email: '',
        phone_number: [],
        address: '',
        password: '',
      });
      setConfirmPassword('');
      setErrors({});
      
      // Alert will automatically disappear after 4 seconds due to the useEffect
      
    } catch (error: any) {
      setIsSuccess(false);
      console.error('Error registering supplier:', error);
      
      // Handle different types of backend errors
      if (error.response) {
        const responseData = error.response.data;
        
        // Handle validation errors from express-validator
        if (responseData.errors && Array.isArray(responseData.errors)) {
          const backendErrors: BackendError[] = responseData.errors;
          const newErrors: any = {};
          
          backendErrors.forEach(err => {
            newErrors[err.param] = err.msg;
          });
          
          setErrors(prev => ({ ...prev, ...newErrors }));
          setMessage('Please fix the validation errors');
        }
        // Handle specific error messages from the backend
        else if (responseData.message) {
          if (responseData.message.includes('email already exists')) {
            setErrors(prev => ({ ...prev, email: 'Supplier with this email already exists' }));
          } else if (responseData.message.includes('Phone number')) {
            setErrors(prev => ({ ...prev, phone_number: responseData.message }));
          } else {
            setMessage(responseData.message);
          }
        } 
        else {
          setMessage('Failed to register supplier. Please try again.');
        }
      } else {
        setMessage('Network error. Please check your connection and try again.');
      }
      
      // Alert will automatically disappear after 4 seconds due to the useEffect
    }
  };

  const handleReset = () => {
    setSupplier({
      supplier_name: '',
      email: '',
      phone_number: [],
      address: '',
      password: '',
    });
    setConfirmPassword('');
    setMessage('');
    setIsSuccess(false);
    setErrors({});
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-gray-100 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-center mb-6">Register Supplier</h1>
      
      {/* General error or success message with auto-dismiss after 4s */}
      {message && (
        <div className={`p-4 mb-4 rounded-md ${isSuccess ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'} transition-opacity duration-300`}>
          <p className="flex items-center">
            {isSuccess ? (
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
            {message}
          </p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Supplier Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Supplier Name</label>
          <input
            type="text"
            name="supplier_name"
            value={supplier.supplier_name}
            onChange={handleChange}
            className={`w-full mt-1 px-4 py-2 border ${errors.supplier_name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
            required
          />
          {errors.supplier_name && (
            <p className="text-red-600 text-sm mt-1">{errors.supplier_name}</p>
          )}
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Address</label>
          <input
            type="text"
            name="address"
            value={supplier.address}
            onChange={handleChange}
            className={`w-full mt-1 px-4 py-2 border ${errors.address ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
            required
          />
          {errors.address && (
            <p className="text-red-600 text-sm mt-1">{errors.address}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            value={supplier.email}
            onChange={handleChange}
            className={`w-full mt-1 px-4 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
            required
          />
          {errors.email && (
            <p className="text-red-600 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        {/* Phone Numbers */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Telephone Numbers 
          </label>
          <input
            type="text"
            name="phone_number"
            value={supplier.phone_number ? supplier.phone_number.join(', ') : ''}
            onChange={handleChange}
            className={`w-full mt-1 px-4 py-2 border ${errors.phone_number ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
            required
          />
          {errors.phone_number && (
            <p className="text-red-600 text-sm mt-1">{errors.phone_number}</p>
          )}
          <p className="text-gray-500 text-xs mt-1">
            Comma seperate for more than one phone Number ,Example: 0712345678, 0382345678, 0112345678
          </p>
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            name="password"
            value={supplier.password}
            onChange={handlePasswordChange}
            className={`w-full mt-1 px-4 py-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
            required
          />
          {errors.password && (
            <p className="text-red-600 text-sm mt-1">{errors.password}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
          <input
            type="password"
            name="confirm_password"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            className={`w-full mt-1 px-4 py-2 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
            required
          />
          {errors.confirmPassword && (
            <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex justify-between mt-6">
          <button
            type="button" // Changed from "reset" for better control
            onClick={handleReset}
            className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition duration-150"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-150"
          >
            Register
          </button>
        </div>
      </form>
    </div>
  );
};

export default SupplierRegister;