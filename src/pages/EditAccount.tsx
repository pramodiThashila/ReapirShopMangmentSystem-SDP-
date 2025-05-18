import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import axios from 'axios';
import moment from 'moment';
import { X, Plus, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

interface EmployeeData {
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string[];
  nic: string;
  role: string;
  username: string;
  dob: string;
}

const EditAccount: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordUpdating, setIsPasswordUpdating] = useState(false);
  const [isDetailsUpdating, setIsDetailsUpdating] = useState(false);
  const [formData, setFormData] = useState<EmployeeData | null>(null);
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [updateSuccess, setUpdateSuccess] = useState({
    details: false,
    password: false
  });
  const [updateError, setUpdateError] = useState({
    details: '',
    password: ''
  });
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });

  useEffect(() => {
    const fetchEmployeeData = async () => {
      if (!user?.employee_id) {
        navigate('/');
        return;
      }

      try {
        setIsLoading(true);
        const response = await axios.get(`http://localhost:5000/api/employees/${user.employee_id}`);
        setFormData(response.data);
        setPhoneNumbers(response.data.phone_number || []);
      } catch (error) {
        console.error('Error fetching employee data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployeeData();
  }, [user, navigate]);

  // Auto-hide success messages after 3 seconds
  useEffect(() => {
    if (updateSuccess.details) {
      const timer = setTimeout(() => {
        setUpdateSuccess(prev => ({ ...prev, details: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [updateSuccess.details]);

  useEffect(() => {
    if (updateSuccess.password) {
      const timer = setTimeout(() => {
        setUpdateSuccess(prev => ({ ...prev, password: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [updateSuccess.password]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => prev ? { ...prev, [name]: value } : null);
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePhoneChange = (index: number, value: string) => {
    const updatedPhones = [...phoneNumbers];
    updatedPhones[index] = value;
    setPhoneNumbers(updatedPhones);
    
    // Clear phone number errors
    if (errors[`phone_${index}`]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`phone_${index}`];
        return newErrors;
      });
    }
  };

  const addPhoneNumber = () => {
    setPhoneNumbers([...phoneNumbers, '']);
  };

  const removePhoneNumber = (index: number) => {
    const updatedPhones = [...phoneNumbers];
    updatedPhones.splice(index, 1);
    setPhoneNumbers(updatedPhones);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswords(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const validatePersonalDetails = () => {
    const newErrors: Record<string, string> = {};
    
    // First name validation
    if (formData?.first_name) {
      if (!/^[a-zA-Z']+$/.test(formData.first_name)) {
        newErrors.first_name = "First name should only contain letters and ' symbol";
      } else if (formData.first_name.length > 50) {
        newErrors.first_name = "First name should not exceed 50 characters";
      }
    }

    // Last name validation
    if (formData?.last_name) {
      if (!/^[a-zA-Z']+$/.test(formData.last_name)) {
        newErrors.last_name = "Last name should only contain letters and ' symbol";
      } else if (formData.last_name.length > 50) {
        newErrors.last_name = "Last name should not exceed 50 characters";
      }
    }

    // Email validation
    if (formData?.email) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "Invalid email format";
      } else if (formData.email.length > 100) {
        newErrors.email = "Email should not exceed 100 characters";
      }
    }

    // Phone validation - match exactly the backend pattern
    phoneNumbers.forEach((phone, index) => {
      if (phone && !/^07\d{8}$/.test(phone)) {
        newErrors[`phone_${index}`] = "Telephone number should contain 10 digits and start with 07";
      }
    });

    // Date of birth validation
    if (formData?.dob) {
      const dateOnly = formData.dob.split('T')[0];
      const dateOfBirth = moment(dateOnly, 'YYYY-MM-DD');
      const now = moment();
      const age = now.diff(dateOfBirth, 'years');
      
      if (!dateOfBirth.isValid()) {
        newErrors.dob = "Invalid date";
      } else if (dateOfBirth.isAfter(now)) {
        newErrors.dob = "Date of birth cannot be a future date";
      } else if (age < 18) {
        newErrors.dob = "Employee must be at least 18 years old";
      }
    }

    setErrors(prevErrors => ({ ...prevErrors, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!passwords.currentPassword) {
      newErrors.currentPassword = 'Please enter your current password';
    }
    
    if (!passwords.newPassword) {
      newErrors.newPassword = 'Please enter a new password';
    } else if (passwords.newPassword.length < 6) {
      newErrors.newPassword = 'Password should be at least 6 characters';
    }
    
    if (!passwords.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (passwords.newPassword !== passwords.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(prevErrors => ({ ...prevErrors, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePersonalDetails() || !formData) return;
    
    try {
      setIsDetailsUpdating(true);
      setUpdateSuccess(prev => ({ ...prev, details: false }));
      setUpdateError(prev => ({ ...prev, details: '' }));
      
      // Make sure we're only sending fields that were updated and extract date part from dob
      const updateData: Partial<EmployeeData & { phone_number: string[] }> = {};
      
      if (formData.first_name) updateData.first_name = formData.first_name;
      if (formData.last_name) updateData.last_name = formData.last_name;
      if (formData.email) updateData.email = formData.email;
      
      // Filter out empty phone numbers
      if (phoneNumbers.length > 0) {
        updateData.phone_number = phoneNumbers.filter(p => p.trim() !== '');
      }
      
      if (formData.dob) {
        // Extract only the date part as required by backend
        updateData.dob = formData.dob.split('T')[0];
      }
      
      await axios.patch(
        `http://localhost:5000/api/employees/update-details/${formData.employee_id}`, 
        updateData
      );
      
      setUpdateSuccess(prev => ({ ...prev, details: true }));
      
    } catch (error: any) {
      console.error('Error updating employee details:', error);
      
      // Handle validation errors from the backend
      if (error.response?.data?.errors) {
        const backendErrors: Record<string, string> = {};
        error.response.data.errors.forEach((err: any) => {
          const field = err.param || 'general';
          backendErrors[field] = err.msg;
        });
        setErrors(prev => ({ ...prev, ...backendErrors }));
      } else {
        setUpdateError(prev => ({
          ...prev,
          details: error.response?.data?.message || 'Failed to update account details. Please try again.'
        }));
      }
    } finally {
      setIsDetailsUpdating(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePasswordForm() || !formData) return;
    
    try {
      setIsPasswordUpdating(true);
      setUpdateSuccess(prev => ({ ...prev, password: false }));
      setUpdateError(prev => ({ ...prev, password: '' }));
      
      await axios.put(
        `http://localhost:5000/api/employees/update-password/${formData.employee_id}`, 
        {
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
          confirmPassword: passwords.confirmPassword
        }
      );
      
      setUpdateSuccess(prev => ({ ...prev, password: true }));
      
      // Reset password fields
      setPasswords({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Auto collapse password section after successful update
      setTimeout(() => {
        setShowPasswordSection(false);
      }, 3000);
      
    } catch (error: any) {
      console.error('Error updating password:', error);
      
      if (error.response?.data?.errors) {
        const backendErrors: Record<string, string> = {};
        error.response.data.errors.forEach((err: any) => {
          const field = err.param || 'general';
          backendErrors[field] = err.msg;
        });
        setErrors(prev => ({ ...prev, ...backendErrors }));
      } else {
        setUpdateError(prev => ({
          ...prev,
          password: error.response?.data?.message || 'Failed to update password. Please try again.'
        }));
      }
    } finally {
      setIsPasswordUpdating(false);
    }
  };

  if (isLoading && !formData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!formData) {
    return <div className="text-center py-10">Unable to load account details.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Account</h1>
      
      {/* Personal Information Section */}
      <div className="mb-8">
        <form onSubmit={handleUpdateDetails} className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
          
          {updateSuccess.details && (
            <div className="mb-4 p-3 bg-green-100 border-l-4 border-green-500 text-green-700 flex items-center">
              <CheckCircle className="mr-2" size={18} />
              Personal details updated successfully!
            </div>
          )}
          
          {updateError.details && (
            <div className="mb-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700 flex items-center">
              <AlertCircle className="mr-2" size={18} />
              {updateError.details}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md ${errors.first_name ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.first_name && <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md ${errors.last_name ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.last_name && <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">NIC</label>
              <input
                type="text"
                name="nic"
                value={formData.nic}
                disabled // NIC shouldn't be editable
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                disabled // Username typically shouldn't be editable
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              <input
                type="date"
                name="dob"
                value={formData.dob ? moment(formData.dob).format('YYYY-MM-DD') : ''}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md ${errors.dob ? 'border-red-500' : 'border-gray-300'}`}
                max={moment().subtract(18, 'years').format('YYYY-MM-DD')} // Set max date to 18 years ago
              />
              {errors.dob && <p className="text-red-500 text-sm mt-1">{errors.dob}</p>}
            </div>
          </div>
          
          {/* Phone Numbers Section */}
          <div className="mt-6">
            <h3 className="text-md font-medium mb-3">Phone Numbers</h3>
            
            {phoneNumbers.map((phone, index) => (
              <div key={index} className="flex items-center gap-2 mb-3">
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => handlePhoneChange(index, e.target.value)}
                  placeholder="07XXXXXXXX"
                  className={`flex-1 px-3 py-2 border rounded-md ${errors[`phone_${index}`] ? 'border-red-500' : 'border-gray-300'}`}
                />
                {phoneNumbers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePhoneNumber(index)}
                    className="p-2 text-red-500 hover:text-red-700"
                  >
                    <X size={20} />
                  </button>
                )}
                {errors[`phone_${index}`] && (
                  <p className="text-red-500 text-sm">{errors[`phone_${index}`]}</p>
                )}
              </div>
            ))}
            
            {phoneNumbers.length < 3 && (
              <button
                type="button"
                onClick={addPhoneNumber}
                className="flex items-center text-blue-600 hover:text-blue-800 mt-2"
              >
                <Plus size={16} className="mr-1" /> Add Phone Number
              </button>
            )}
          </div>
          
          {/* Submit Button for Personal Details */}
          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={isDetailsUpdating}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 flex items-center"
            >
              {isDetailsUpdating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : 'Save Personal Details'}
            </button>
          </div>
        </form>
      </div>
      
      {/* Password Section - Separate Form */}
      <div className="mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Change Password</h2>
            <button
              type="button"
              onClick={() => setShowPasswordSection(!showPasswordSection)}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              {showPasswordSection ? 'Cancel Password Change' : 'Change Password'}
            </button>
          </div>
          
          {updateSuccess.password && (
            <div className="mb-4 p-3 bg-green-100 border-l-4 border-green-500 text-green-700 flex items-center">
              <CheckCircle className="mr-2" size={18} />
              Password updated successfully!
            </div>
          )}
          
          {updateError.password && (
            <div className="mb-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700 flex items-center">
              <AlertCircle className="mr-2" size={18} />
              {updateError.password}
            </div>
          )}
          
          {showPasswordSection && (
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <div className="relative">
                  <input
                    type={showPassword.current ? 'text' : 'password'}
                    name="currentPassword"
                    value={passwords.currentPassword}
                    onChange={handlePasswordChange}
                    className={`w-full px-3 py-2 border rounded-md ${errors.currentPassword ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('current')}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400"
                  >
                    {showPassword.current ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.currentPassword && <p className="text-red-500 text-sm mt-1">{errors.currentPassword}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword.new ? 'text' : 'password'}
                    name="newPassword"
                    value={passwords.newPassword}
                    onChange={handlePasswordChange}
                    className={`w-full px-3 py-2 border rounded-md ${errors.newPassword ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('new')}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400"
                  >
                    {showPassword.new ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.newPassword && <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showPassword.confirm ? 'text' : 'password'}
                    name="confirmPassword"
                    value={passwords.confirmPassword}
                    onChange={handlePasswordChange}
                    className={`w-full px-3 py-2 border rounded-md ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('confirm')}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400"
                  >
                    {showPassword.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isPasswordUpdating}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 flex items-center"
                >
                  {isPasswordUpdating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Updating...
                    </>
                  ) : 'Update Password'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
      
     
    </div>
  );
};

export default EditAccount;