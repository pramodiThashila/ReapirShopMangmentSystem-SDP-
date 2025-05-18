import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Edit2 } from 'lucide-react';

interface Customer {
  customer_id: number;
  firstName: string;
  lastName: string;
  email: string;
  type: 'Regular' | 'Normal';
  phone_number: string[];
}

const CustomerView = () => {
  // State variables
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<number | null>(null);
  const deleteModalRef = useRef<HTMLDivElement>(null);

  // Fetch customers on component mount
  useEffect(() => {
    fetchCustomers();
  }, []);

  // Close modal when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setOpenModal(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  //  click outside handler for the delete modal
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (deleteModalRef.current && !deleteModalRef.current.contains(event.target as Node)) {
        setDeleteModalOpen(false);
      }
    }
    
    if (deleteModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [deleteModalOpen]);

  // Auto-hide alerts after 3 seconds
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/customers/all');
      setCustomers(response.data);
    } catch (err) {
      setError('Failed to fetch customers');
      console.error('Error fetching customers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setOpenModal(true);
  };

  const handleUpdateChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (!selectedCustomer) return;

    setSelectedCustomer((prev) => {
      if (!prev) return null;
      return { ...prev, [name]: value };
    });
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedCustomer) return;
    
    // Split by commas and trim whitespace
    const phoneNumbers = e.target.value.split(',').map(num => num.trim());
    
    setSelectedCustomer({
      ...selectedCustomer,
      phone_number: phoneNumbers
    });
  };

  const validatePhoneNumbers = (phones: string[]): boolean => {
    for (const phone of phones) {
      if (!/^07\d{8}$/.test(phone)) {
        setError('Phone numbers must be 10 digits and start with 07');
        return false;
      }
    }
    return true;
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    // Validate phone numbers
    if (!validatePhoneNumbers(selectedCustomer.phone_number)) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.put(
        `http://localhost:5000/api/customers/${selectedCustomer.customer_id}`, 
        selectedCustomer
      );
      
      // Update local state
      setCustomers(prev => 
        prev.map(customer => 
          customer.customer_id === selectedCustomer.customer_id ? selectedCustomer : customer
        )
      );
      
      setSuccess(response.data.message || 'Customer updated successfully');
      setOpenModal(false);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update customer';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (customerId: number) => {
    setCustomerToDelete(customerId);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!customerToDelete) return;
    
    setIsLoading(true);
    try {
      console.log('Deleting customer with ID:', customerToDelete);
      const response = await axios.delete(`http://localhost:5000/api/customers/delete/${customerToDelete}`);
      
      // Remove customer from local state
      setCustomers(prev => prev.filter(customer => customer.customer_id !== customerToDelete));
      
      setSuccess(response.data.message || 'Customer deleted successfully');
    } catch (err) {
      setError('Failed to delete customer');
      console.error('Error deleting customer:', err);
    } finally {
      setIsLoading(false);
      setDeleteModalOpen(false);
      setCustomerToDelete(null);
    }
  };

  // Filter customers based on search term
  const filteredCustomers = customers.filter(customer => {
    const fullName = `${customer.firstName} ${customer.lastName}`.toLowerCase();
    return fullName.includes(search.toLowerCase()) || 
           customer.email.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="container mx-auto mt-8 px-4">
      <h2 className="text-2xl font-bold text-center mb-6">Customer Management</h2>

      {/* Alert Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}

      {/* Search Bar */}
      <div className="flex justify-center mb-6">
        <input
          type="text"
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Search by name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Customer Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">ID</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">First Name</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Last Name</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Email</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Type</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Phone Numbers</th>
              <th className="px-4 py-2 text-center text-sm font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && !customers.length ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">Loading customers...</td>
              </tr>
            ) : filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">No customers found</td>
              </tr>
            ) : (
              filteredCustomers.map((customer) => (
                <tr key={customer.customer_id} className="border-t border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm text-gray-700">{customer.customer_id}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{customer.firstName}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{customer.lastName}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{customer.email}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{customer.type}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{customer.phone_number.join(', ')}</td>                  <td className="px-4 py-2 text-center">
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => handleUpdateClick(customer)}
                        title="Update customer"
                        className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-100 transition-colors"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      {/* Uncomment if you need to implement delete functionality
                      <button
                        onClick={() => handleDeleteClick(customer.customer_id)}
                        title="Delete customer"
                        className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-100 transition-colors"
                      >
                        <Trash className="h-4 w-4" />
                      </button> */}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Update Modal */}
      {openModal && selectedCustomer && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div 
            ref={modalRef} 
            className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md"
          >
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Update Customer</h2>
            <form className="space-y-4" onSubmit={handleUpdateSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={selectedCustomer.firstName || ''}
                  onChange={handleUpdateChange}
                  maxLength={10}
                  className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Maximum 10 characters</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={selectedCustomer.lastName || ''}
                  onChange={handleUpdateChange}
                  maxLength={20}
                  className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Maximum 20 characters</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={selectedCustomer.email || ''}
                  onChange={handleUpdateChange}
                  className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Customer Type</label>
                <select
                  name="type"
                  value={selectedCustomer.type || 'Normal'}
                  onChange={handleUpdateChange}
                  className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="Regular">Regular</option>
                  <option value="Normal">Normal</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone Numbers (comma-separated)</label>
                <input
                  type="text"
                  name="phone_number"
                  value={selectedCustomer.phone_number.join(', ')}
                  onChange={handlePhoneChange}
                  className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Must be 10 digits starting with 07</p>
              </div>
              
              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setOpenModal(false)}
                  className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating...
                    </>
                  ) : (
                    'Update Customer'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div 
            ref={deleteModalRef} 
            className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md"
          >
            <div className="text-center">
              <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              
              <h2 className="text-xl font-bold text-gray-800 mb-4">Confirm Deletion</h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this customer? This action cannot be undone.
              </p>
              
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={isLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Deleting...
                    </>
                  ) : (
                    'Delete Customer'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerView;