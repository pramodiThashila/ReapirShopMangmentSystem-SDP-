import { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowLeft, Save, Eye, EyeOff, AlertCircle, Check, Plus, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

type SupplierData = {
  supplier_id: number;
  supplier_name: string;
  email: string;
  address: string;
  phone_number: string[];
  
};

type PasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

type AlertType = {
  type: 'success' | 'error';
  message: string;
};

const SupplierProfile = () => {
  const navigate = useNavigate();
  const [supplierData, setSupplierData] = useState<SupplierData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedData, setEditedData] = useState<SupplierData | null>(null);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [newPhoneNumber, setNewPhoneNumber] = useState('');
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [alert, setAlert] = useState<AlertType | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    // Check if logged in
    const isLoggedIn = localStorage.getItem('isSupplierLoggedIn') === 'true';
    
    if (!isLoggedIn) {
      navigate('/supplier/login');
      return;
    }

    // Get supplier data from localStorage
    const storedData = localStorage.getItem('supplierData');
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      // Initialize phone_number as array if not present
      if (!parsedData.phone_number) {
        parsedData.phone_number = [];
      }
      // Make sure phone_number is always an array
      else if (!Array.isArray(parsedData.phone_number)) {
        parsedData.phone_number = [parsedData.phone_number];
      }
      
      setSupplierData(parsedData);
      setEditedData(parsedData);
      setIsLoading(false);
      
      // Still fetch fresh data from API
      fetchSupplierData(parsedData.supplier_id);
    } else {
      // If data not in localStorage, redirect to login
      navigate('/supplier/login');
    }
  }, [navigate]);

  const fetchSupplierData = async (supplierId: number) => {
    try {
      setIsLoading(true);
      
      const response = await axios.get(`http://localhost:5000/api/suppliers/${supplierId}`);
      const data = response.data;
      
      // Ensure phone_number is always an array
      if (!data.phone_number) {
        data.phone_number = [];
      }
      
      setSupplierData(data);
      setEditedData(data);
      
      // Update localStorage with fresh data
      localStorage.setItem('supplierData', JSON.stringify(data));
    } catch (error) {
      console.error('Error fetching supplier data:', error);
      setAlert({
        type: 'error',
        message: 'Failed to load your profile. Please try again later.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (editedData) {
      setEditedData({
        ...editedData,
        [name]: value
      });
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm({
      ...passwordForm,
      [name]: value
    });
  };

  const toggleEditMode = () => {
    if (isEditMode && editedData !== supplierData) {
      if (!window.confirm('You have unsaved changes. Discard changes?')) {
        return;
      }
    }
    
    setIsEditMode(!isEditMode);
    // Reset edited data to original data when toggling off edit mode
    if (!isEditMode) {
      setEditedData(supplierData);
    } else {
      setShowPasswordSection(false);
    }
  };

  const addPhoneNumber = () => {
    if (!editedData) return;

    // Basic validation for 10-digit phone number
    if (!/^\d{10}$/.test(newPhoneNumber)) {
      setAlert({
        type: 'error',
        message: 'Phone number should contain exactly 10 digits',
      });
      return;
    }

    // Check for duplicate
    if (editedData.phone_number.includes(newPhoneNumber)) {
      setAlert({
        type: 'error',
        message: 'This phone number is already added',
      });
      return;
    }

    // Update the phone_number array in editedData
    setEditedData((prevData) => {
      if (!prevData) return null;
      return {
        ...prevData,
        phone_number: [...prevData.phone_number, newPhoneNumber],
      };
    });

    setNewPhoneNumber('');
  };

  const removePhoneNumber = (index: number) => {
    if (!editedData) return;
    
    const updatedPhoneNumbers = [...editedData.phone_number];
    updatedPhoneNumbers.splice(index, 1);
    
    setEditedData({
      ...editedData,
      phone_number: updatedPhoneNumbers
    });
  };

  const validateProfileData = () => {
    if (!editedData) return false;
    
    if (!editedData.supplier_name.trim()) {
      setAlert({
        type: 'error',
        message: 'Supplier name cannot be empty'
      });
      return false;
    }
    
    if (!editedData.email.trim() || !/\S+@\S+\.\S+/.test(editedData.email)) {
      setAlert({
        type: 'error',
        message: 'Please enter a valid email address'
      });
      return false;
    }
    
    return true;
  };

  const validatePasswordForm = () => {
    if (!passwordForm.currentPassword) {
      setAlert({
        type: 'error',
        message: 'Current password is required'
      });
      return false;
    }
    
    if (passwordForm.newPassword.length < 6) {
      setAlert({
        type: 'error',
        message: 'New password must be at least 6 characters'
      });
      return false;
    }
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setAlert({
        type: 'error',
        message: 'New passwords do not match'
      });
      return false;
    }
    
    return true;
  };

  const saveProfileChanges = async () => {
    if (!validateProfileData() || !editedData || !supplierData) return;

    try {
      setSavingProfile(true);
      setAlert(null);

      // Send updated profile data, including phone numbers, to the backend
      await axios.put(`http://localhost:5000/api/suppliers/update/${supplierData.supplier_id}`, {
        supplier_name: editedData.supplier_name,
        email: editedData.email,
        address: editedData.address,
        phone_number: editedData.phone_number, // Ensure this includes the newly added phone numbers
      });

      // Fetch updated data to ensure we have the latest state
      await fetchSupplierData(supplierData.supplier_id);

      setAlert({
        type: 'success',
        message: 'Profile updated successfully',
      });

      setIsEditMode(false);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setAlert({
        type: 'error',
        message: error.response?.data?.message || 'Failed to update profile',
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async () => {
    if (!validatePasswordForm() || !supplierData) return;
    
    try {
      setSavingPassword(true);
      setAlert(null);
      
      await axios.put(`http://localhost:5000/api/suppliers/updatePassword/${supplierData.supplier_id}`, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      
      setAlert({
        type: 'success',
        message: 'Password changed successfully'
      });
      
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setShowPasswordSection(false);
    } catch (error: any) {
      console.error('Error changing password:', error);
      
      // Handle specific error for incorrect current password
      if (error.response?.status === 401) {
        setAlert({
          type: 'error',
          message: 'Current password is incorrect'
        });
      } else {
        setAlert({
          type: 'error',
          message: error.response?.data?.message || 'Failed to change password'
        });
      }
    } finally {
      setSavingPassword(false);
    }
  };

  // Clear alert after 5 seconds
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => {
        setAlert(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [alert]);

  const togglePasswordVisibility = (field: keyof typeof showPassword) => {
    setShowPassword({
      ...showPassword,
      [field]: !showPassword[field]
    });
  };

  if (isLoading) {
    return (
      <div className="container py-12 flex justify-center">
        <div className="w-full max-w-3xl text-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-16 w-16 bg-blue-200 rounded-full mb-4"></div>
            <div className="h-6 w-48 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 w-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!supplierData) {
    return (
      <div className="container py-12">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-xl font-medium text-gray-900 mb-4">Profile not found</h2>
          <p className="text-gray-600 mb-6">Unable to load your profile information.</p>
          <Link to="/supplier" className="btn bg-blue-600 text-white hover:bg-blue-700">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 md:py-12">
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <Link to="/supplier" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Link>
        
        {/* Page header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Supplier Profile</h1>
            <p className="text-gray-600 mt-1">Manage your account information and settings</p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <button
              onClick={toggleEditMode}
              className={`btn ${
                isEditMode 
                  ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isEditMode ? 'Cancel Editing' : 'Edit Profile'}
            </button>
          </div>
        </div>
        
        {/* Alert message */}
        {alert && (
          <div 
            className={`mb-6 p-4 rounded-md ${
              alert.type === 'success' 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}
          >
            <div className="flex items-center">
              {alert.type === 'success' ? (
                <Check className="h-5 w-5 text-green-500 mr-3" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
              )}
              <p className={alert.type === 'success' ? 'text-green-700' : 'text-red-700'}>
                {alert.message}
              </p>
            </div>
          </div>
        )}
        
        {/* Profile Section */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="p-6 md:p-8 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 mb-1">Profile Information</h2>
            <p className="text-sm text-gray-500">Update your profile details</p>
          </div>
          
          <div className="p-6 md:p-8 space-y-6">
            {/* Supplier Name */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
              <label htmlFor="supplier_name" className="block text-sm font-medium text-gray-700 md:mt-2">
                Supplier Name
              </label>
              <div className="md:col-span-2">
                {isEditMode ? (
                  <input
                    type="text"
                    name="supplier_name"
                    id="supplier_name"
                    value={editedData?.supplier_name || ''}
                    onChange={handleInputChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <div className="text-gray-900">{supplierData.supplier_name}</div>
                )}
              </div>
            </div>
            
            {/* Email */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 md:mt-2">
                Email
              </label>
              <div className="md:col-span-2">
                {isEditMode ? (
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={editedData?.email || ''}
                    onChange={handleInputChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <div className="text-gray-900">{supplierData.email}</div>
                )}
              </div>
            </div>
            
            {/* Address */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 md:mt-2">
                Address
              </label>
              <div className="md:col-span-2">
                {isEditMode ? (
                  <textarea
                    name="address"
                    id="address"
                    rows={3}
                    value={editedData?.address || ''}
                    onChange={handleInputChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <div className="text-gray-900 whitespace-pre-line">{supplierData.address}</div>
                )}
              </div>
            </div>
            
            {/* Phone Numbers */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
              <label className="block text-sm font-medium text-gray-700 md:mt-2">
                Phone Numbers
              </label>
              <div className="md:col-span-2">
                {isEditMode ? (
                  <div className="space-y-3">
                    {/* List of current phone numbers */}
                    {editedData && editedData.phone_number.length > 0 ? (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {editedData.phone_number.map((phone, index) => (
                          <div key={index} className="flex items-center bg-gray-100 rounded-full px-3 py-1">
                            <span className="text-sm">{phone}</span>
                            <button
                              type="button"
                              onClick={() => removePhoneNumber(index)}
                              className="ml-2 text-gray-500 hover:text-red-500"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 mb-3">No phone numbers added</p>
                    )}
                    
                    {/* Add new phone number */}
                    <div className="flex">
                      <input
                        type="tel"
                        value={newPhoneNumber}
                        onChange={(e) => setNewPhoneNumber(e.target.value)}
                        placeholder="Add 10-digit phone number"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 rounded-r-none"
                      />
                      <button
                        type="button"
                        onClick={addPhoneNumber}
                        className="flex items-center justify-center bg-blue-600 text-white px-4 rounded-r-md hover:bg-blue-700"
                      >
                        <Plus className="h-5 w-5" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Phone number should contain exactly 10 digits
                    </p>
                  </div>
                ) : (
                  <div>
                    {supplierData.phone_number && supplierData.phone_number.length > 0 ? (
                      <div className="space-y-1">
                        {supplierData.phone_number.map((phone, index) => (
                          <div key={index} className="text-gray-900">{phone}</div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-gray-500">No phone numbers</div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            
            
            {/* Save profile button */}
            {isEditMode && (
              <div className="pt-4 flex justify-end">
                <button
                  onClick={saveProfileChanges}
                  disabled={savingProfile}
                  className="btn bg-blue-600 text-white hover:bg-blue-700 flex items-center"
                >
                  {savingProfile ? 'Saving...' : 'Save Changes'}
                  {!savingProfile && <Save className="ml-2 h-4 w-4" />}
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Password Section */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 md:p-8 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 mb-1">Change Password</h2>
            <p className="text-sm text-gray-500">Ensure your account is using a strong password</p>
          </div>
          
          <div className="p-6 md:p-8">
            {!showPasswordSection ? (
              <button
                onClick={() => setShowPasswordSection(true)}
                className="btn border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              >
                Change Password
              </button>
            ) : (
              <div className="space-y-6">
                {/* Current Password */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 md:mt-2">
                    Current Password
                  </label>
                  <div className="md:col-span-2">
                    <div className="relative">
                      <input
                        type={showPassword.current ? 'text' : 'password'}
                        name="currentPassword"
                        id="currentPassword"
                        value={passwordForm.currentPassword}
                        onChange={handlePasswordChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 pr-10"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                        onClick={() => togglePasswordVisibility('current')}
                      >
                        {showPassword.current ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* New Password */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 md:mt-2">
                    New Password
                  </label>
                  <div className="md:col-span-2">
                    <div className="relative">
                      <input
                        type={showPassword.new ? 'text' : 'password'}
                        name="newPassword"
                        id="newPassword"
                        value={passwordForm.newPassword}
                        onChange={handlePasswordChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 pr-10"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                        onClick={() => togglePasswordVisibility('new')}
                      >
                        {showPassword.new ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      Password must be at least 6 characters
                    </p>
                  </div>
                </div>
                
                {/* Confirm Password */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 md:mt-2">
                    Confirm Password
                  </label>
                  <div className="md:col-span-2">
                    <div className="relative">
                      <input
                        type={showPassword.confirm ? 'text' : 'password'}
                        name="confirmPassword"
                        id="confirmPassword"
                        value={passwordForm.confirmPassword}
                        onChange={handlePasswordChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 pr-10"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                        onClick={() => togglePasswordVisibility('confirm')}
                      >
                        {showPassword.confirm ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Password actions */}
                <div className="pt-4 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowPasswordSection(false)}
                    className="btn border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={changePassword}
                    disabled={savingPassword}
                    className="btn bg-blue-600 text-white hover:bg-blue-700"
                  >
                    {savingPassword ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierProfile;