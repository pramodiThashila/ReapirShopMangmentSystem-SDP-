import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';

const EmployeeTable = () => {
  interface Employee {
    employee_id: number;
    first_name: string;
    last_name: string;
    nic: string;
    dob: string;
    role: string;
    email: string;
    phone_number: string[];
  }

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | null>>({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/employees/all');
        console.log("Fetched employees:", response.data);
        setEmployees(response.data);
      } catch (error) {
        console.error('Error fetching employees:', error);
      }
    };

    fetchEmployees();
  }, []);

  const handleViewClick = (id: number) => {
    navigate(`/employees/${id}`);
  };

  const handleUpdateClick = (employee: Employee) => {
    setSelectedEmployee(employee);
    setFieldErrors({}); // Clear previous field errors
    setUpdateError(null); // Clear any previous update error
    setShowUpdateModal(true);
  };

  const handleDeleteClick = (id: number) => {
    setSelectedEmployeeId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.put(`http://localhost:5000/api/employees/makeinactive/${selectedEmployeeId}`);
      setEmployees(employees.filter((employee) => employee.employee_id !== selectedEmployeeId));
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error deleting employee:', error);
    }
  };

  const handleUpdateChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'phone_number') {
      // Split the input by commas, trim whitespace, and filter out empty entries
      const phoneNumbers = value
        .split(',')
        .map((num) => num.trim())
        .filter((num) => num !== ''); // Remove empty strings

      setSelectedEmployee((prev) => ({
        ...prev!,
        phone_number: phoneNumbers, // Store as an array of strings
      }));

      // Validate phone numbers
      const phoneError = phoneNumbers.some((phone) => !/^07\d{8}$/.test(phone))
        ? "Each phone number must contain 10 digits and start with '07'."
        : null;
      setFieldErrors((prev) => ({ ...prev, phone_number: phoneError }));
    } else {
      setSelectedEmployee((prev) => ({
        ...prev!,
        [name]: value,
      }));

      // Validate other fields
      const error = validateField(name, value);
      setFieldErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const validateField = (name: string, value: any): string | null => {
    switch (name) {
      case 'first_name':
      case 'last_name':
        if (!value) return `${name.replace('_', ' ')} is mandatory.`;
        if (!/^[a-zA-Z']+$/.test(value)) return `${name.replace('_', ' ')} should only contain letters and ' symbol.`;
        if (value.length > 50) return `${name.replace('_', ' ')} should not exceed 50 characters.`;
        break;

      case 'email':
        if (!value) return 'Email is mandatory.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email format.';
        if (value.length > 100) return 'Email should not exceed 100 characters.';
        break;

      case 'nic':
        if (!value) return 'NIC is mandatory.';
        if (!/^(?:\d{9}[Vv]|\d{12})$/.test(value)) return 'Invalid NIC format. Should be 9 digits followed by V or 12 digits.';
        break;

      case 'role':
        if (!value) return 'Role is mandatory.';
        if (!['owner', 'employee'].includes(value)) return "Role should be either 'owner' or 'employee'.";
        break;

      case 'dob':
        if (!value) return 'Date of birth is mandatory.';
        if (!moment(value, 'YYYY-MM-DD', true).isValid()) return 'Invalid date format.';
        const age = moment().diff(moment(value, 'YYYY-MM-DD'), 'years');
        if (age < 18) return 'Employee must be at least 18 years old.';
        break;

      default:
        return null;
    }
    return null;
  };


  const handleUpdateSubmit = async () => {
    try {
      // Create a copy of the selected employee to avoid directly modifying state
      const employeeToUpdate = { ...selectedEmployee };

      // Format the date correctly using moment before sending to API
      if (employeeToUpdate?.dob) {
        employeeToUpdate.dob = moment(employeeToUpdate.dob).format('YYYY-MM-DD');
        console.log("Formatted date:", employeeToUpdate.dob);
      }

      // Ensure phone numbers are properly formatted as an array of strings
      if (employeeToUpdate?.phone_number) {
        // Split and clean phone numbers to ensure they are an array of strings
        const phoneArray = employeeToUpdate.phone_number.flatMap((phone) =>
          phone.includes(",")
            ? phone.split(",").map((num) => num.trim())
            : phone.trim()
        );

        // Filter out any empty strings
        employeeToUpdate.phone_number = phoneArray.filter((phone) => phone !== "");

        console.log("Phone numbers formatted for API:", employeeToUpdate.phone_number);
      }

      console.log("Submitting update for employee:", employeeToUpdate);

      // Send the formatted data to the API
      await axios.put(
        `http://localhost:5000/api/employees/${employeeToUpdate?.employee_id}`,
        employeeToUpdate
      );

      // Update the local state with the formatted data
      setEmployees((prev) =>
        prev.map((employee) =>
          employee.employee_id === selectedEmployee?.employee_id ? (employeeToUpdate as Employee) : employee
        )
      );

      setShowUpdateModal(false);
      setUpdateError(null); // Clear any previous errors
    } catch (error: any) {
      console.error("Error updating employee:", error);

      if (error.response && error.response.data.errors) {
        // Capture validation errors from the backend
        const errorMessages = error.response.data.errors.map((err: any) => err.msg).join(", ");
        setUpdateError(errorMessages);
      } else {
        setUpdateError("An unexpected error occurred. Please try again.");
      }
    }
  };

  // Add this function to clear errors when the modal is closed
  const handleCloseUpdateModal = () => {
    setShowUpdateModal(false);
    setFieldErrors({}); // Clear field errors
    setUpdateError(null); // Clear any update error message
  };

  // Add this useEffect to auto-dismiss the error message after 4 seconds
  useEffect(() => {
    if (updateError) {
      const timer = setTimeout(() => {
        setUpdateError(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [updateError]);

  const filteredEmployees = employees.filter(
    (employee) =>
      employee.first_name?.toLowerCase().includes(search.toLowerCase()) ||
      employee.last_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mx-auto mt-8 px-4">
      <h2 className="text-2xl font-bold text-center mb-6">View Employee Details</h2>

      {/* Search Bar */}
      <div className="flex justify-center mb-6">
        <input
          type="text"
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Search Employees"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Employee Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Employee ID</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">First Name</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Last Name</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">NIC</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">DOB</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Role</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Email</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Phone Number</th>
              <th className="px-4 py-2 text-center text-sm font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map((employee) => (
              <tr key={employee.employee_id} className="border-t border-gray-200 hover:bg-gray-50">
                <td className="px-4 py-2 text-sm text-gray-700">{employee.employee_id}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{employee.first_name}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{employee.last_name}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{employee.nic}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{moment(employee.dob).format('YYYY-MM-DD')}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{employee.role}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{employee.email}</td>
                <td className="px-4 py-2 text-sm text-gray-700">
                  {employee.phone_number.length > 0
                    ? employee.phone_number.map((phone, index) => (
                      <span key={index} className="block">
                        {phone}
                      </span>
                    ))
                    : "N/A"}
                </td>

                <td className="px-4 py-2 text-right text-sm font-medium">
                  <span
                    onClick={() => handleUpdateClick(employee)}
                    className="text-blue-600 hover:text-blue-900 cursor-pointer mr-4"
                  >
                    Update
                  </span>
                  <span
                    onClick={() => handleDeleteClick(employee.employee_id)}
                    className="text-red-600 hover:text-red-900 cursor-pointer"
                  >
                    Deactivate
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* No Results Message */}
      {filteredEmployees.length === 0 && (
        <div className="mt-4 text-center text-gray-500">No employees found.</div>
      )}

      {/* Update Modal */}
      {showUpdateModal && selectedEmployee && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Update Employee</h2>
            {updateError && (
              <div className="mb-4 text-sm text-red-600 bg-red-100 p-2 rounded">
                {updateError}
              </div>
            )}
            <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                <input
                  type="text"
                  name="first_name"
                  value={selectedEmployee.first_name}
                  onChange={handleUpdateChange}
                  className={`w-full mt-1 px-4 py-2 border ${fieldErrors.first_name ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:outline-none focus:ring-2 ${fieldErrors.first_name ? 'focus:ring-red-500' : 'focus:ring-blue-500'
                    }`}
                />
                {fieldErrors.first_name && <p className="mt-1 text-sm text-red-600">{fieldErrors.first_name}</p>}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                <input
                  type="text"
                  name="last_name"
                  value={selectedEmployee.last_name}
                  onChange={handleUpdateChange}
                  className={`w-full mt-1 px-4 py-2 border ${fieldErrors.last_name ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:outline-none focus:ring-2 ${fieldErrors.last_name ? 'focus:ring-red-500' : 'focus:ring-blue-500'
                    }`}
                />
                {fieldErrors.last_name && <p className="mt-1 text-sm text-red-600">{fieldErrors.last_name}</p>}
              </div>

              {/* NIC */}
              <div>
                <label className="block text-sm font-medium text-gray-700">NIC</label>
                <input
                  type="text"
                  name="nic"
                  value={selectedEmployee.nic}
                  onChange={handleUpdateChange}
                  className={`w-full mt-1 px-4 py-2 border ${fieldErrors.nic ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:outline-none focus:ring-2 ${fieldErrors.nic ? 'focus:ring-red-500' : 'focus:ring-blue-500'
                    }`}
                />
                {fieldErrors.nic && <p className="mt-1 text-sm text-red-600">{fieldErrors.nic}</p>}
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <select
                  name="role"
                  value={selectedEmployee.role}
                  onChange={handleUpdateChange}
                  className={`w-full mt-1 px-4 py-2 border ${fieldErrors.role ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:outline-none focus:ring-2 ${fieldErrors.role ? 'focus:ring-red-500' : 'focus:ring-blue-500'
                    }`}
                >
                  <option value="employee">Employee</option>
                  <option value="owner">Owner</option>
                </select>
                {fieldErrors.role && <p className="mt-1 text-sm text-red-600">{fieldErrors.role}</p>}
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                <input
                  type="date"
                  name="dob"
                  value={moment(selectedEmployee.dob).format('YYYY-MM-DD')}
                  onChange={handleUpdateChange}
                  className={`w-full mt-1 px-4 py-2 border ${fieldErrors.dob ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:outline-none focus:ring-2 ${fieldErrors.dob ? 'focus:ring-red-500' : 'focus:ring-blue-500'
                    }`}
                  required
                />
                {fieldErrors.dob && <p className="mt-1 text-sm text-red-600">{fieldErrors.dob}</p>}
                <p className="mt-1 text-xs text-gray-500">Format: YYYY-MM-DD</p>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={selectedEmployee.email}
                  onChange={handleUpdateChange}
                  className={`w-full mt-1 px-4 py-2 border ${fieldErrors.email ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:outline-none focus:ring-2 ${fieldErrors.email ? 'focus:ring-red-500' : 'focus:ring-blue-500'
                    }`}
                />
                {fieldErrors.email && <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>}
              </div>

              {/* Phone Numbers */}
              {/* Phone Numbers */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Phone Numbers (comma-separated)</label>
                <input
                  type="text"
                  name="phone_number"
                  value={selectedEmployee.phone_number.join(", ")} // Display as a comma-separated string
                  onChange={handleUpdateChange}
                  className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">Format: 0712345678, 0723456789</p>
              </div>
            </form>

            {/* Buttons */}
            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={handleCloseUpdateModal}
                type="button"
                className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateSubmit}
                type="button"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Confirm Delete</h2>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this employee? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm text-white bg-red-500 rounded-lg hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeTable;