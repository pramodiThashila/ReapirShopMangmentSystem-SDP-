import React, { useState } from 'react';
import axios from 'axios';

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
  const [passwordError, setPasswordError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'phone_number') {
      setSupplier((prev) => ({
        ...prev,
        phone_number: value.split(',').map((num) => num.trim()), // Convert to array
      }));
    } else {
      setSupplier((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setSupplier((prev) => ({
      ...prev,
      password: value,
    }));
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate password and confirm password
    if (supplier.password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    setPasswordError(''); // Clear any previous password error

    try {
      await axios.post('http://localhost:5000/api/suppliers/register', {
        ...supplier,
        password: supplier.password, // Send only the password to the backend
      });
      setMessage('Supplier registered successfully');
      setSupplier({
        supplier_name: '',
        email: '',
        phone_number: [],
        address: '',
        password: '',
      });
      setConfirmPassword('');
    } catch (error: any) {
      setMessage('Error registering supplier');
      console.error('Error registering supplier:', error);
      if (error.response && error.response.data.errors) {
        setMessage(error.response.data.errors.map((e: any) => e.msg).join(', ')); // Show error messages
      }
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
    setPasswordError('');
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-gray-100 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-center mb-6">Register Supplier</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Supplier Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Supplier Name</label>
          <input
            type="text"
            name="supplier_name"
            value={supplier.supplier_name}
            onChange={handleChange}
            className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Address</label>
          <input
            type="text"
            name="address"
            value={supplier.address}
            onChange={handleChange}
            className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            value={supplier.email}
            onChange={handleChange}
            className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Phone Numbers */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Telephone Numbers (comma-separated)</label>
          <input
            type="text"
            name="phone_number"
            value={supplier.phone_number ? supplier.phone_number.join(', ') : ''}
            onChange={handleChange}
            className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            name="password"
            value={supplier.password}
            onChange={handlePasswordChange}
            className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
          <input
            type="password"
            name="confirm_password"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          {passwordError && <p className="text-red-600 text-sm mt-1">{passwordError}</p>}
        </div>

        {/* Buttons */}
        <div className="flex justify-between mt-6">
          <button
            type="reset"
            onClick={handleReset}
            className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Register
          </button>
        </div>
      </form>

      {/* Message */}
      {message && (
        <p
          className={`mt-4 text-center ${
            message.includes('successfully') ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default SupplierRegister;