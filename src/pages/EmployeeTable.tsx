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
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/employees/all');
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
    setShowUpdateModal(true);
  };

  const handleDeleteClick = (id: number) => {
    setSelectedEmployeeId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/employees/${selectedEmployeeId}`);
      setEmployees(employees.filter((employee) => employee.employee_id !== selectedEmployeeId));
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error deleting employee:', error);
    }
  };

  const handleUpdateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'phone_number') {
      setSelectedEmployee((prev) => ({
        ...prev!,
        phone_number: value.split(',').map((num) => num.trim()),
      }));
    } else {
      setSelectedEmployee((prev) => ({
        ...prev!,
        [name]: value,
      }));
    }
  };

  const handleUpdateSubmit = async () => {
    try {
      console.log("Submitting update for employee:", selectedEmployee);
      console.log("Employee ID:", selectedEmployee?.employee_id);

      await axios.put(
        `http://localhost:5000/api/employees/${selectedEmployee?.employee_id}`,
        selectedEmployee
      );

      setEmployees((prev) =>
        prev.map((employee) =>
          employee.employee_id === selectedEmployee?.employee_id ? selectedEmployee : employee
        )
      );

      setShowUpdateModal(false);
      setUpdateError(null); // Clear any previous errors
    } catch (error: any) {
      console.error("Error updating employee:", error);

      if (error.response && error.response.data.errors) {
        // Capture validation errors from the backend
        const errorMessages = error.response.data.errors.map((err: any) => err.msg).join(', ');
        setUpdateError(errorMessages);
      } else {
        setUpdateError("An unexpected error occurred. Please try again.");
      }
    }
  };

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
                <td className="px-4 py-2 text-sm text-gray-700">{employee.phone_number.join(', ')}</td>
                <td className="px-4 py-2 text-center">
                  <button
                    onClick={() => handleUpdateClick(employee)}
                    className="px-3 py-1 text-sm text-white bg-green-500 rounded-lg hover:bg-green-600 mr-2"
                  >
                    Update
                  </button>
                  <button
                    onClick={() => handleDeleteClick(employee.employee_id)}
                    className="px-3 py-1 text-sm text-white bg-red-500 rounded-lg hover:bg-red-600"
                  >
                    Delete
                  </button>
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
                  className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                <input
                  type="text"
                  name="last_name"
                  value={selectedEmployee.last_name}
                  onChange={handleUpdateChange}
                  className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* NIC */}
              <div>
                <label className="block text-sm font-medium text-gray-700">NIC</label>
                <input
                  type="text"
                  name="nic"
                  value={selectedEmployee.nic}
                  onChange={handleUpdateChange}
                  className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <input
                  type="text"
                  name="role"
                  value={selectedEmployee.role}
                  onChange={handleUpdateChange}
                  className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                <input
                  type="date"
                  name="dob"
                  value={moment(selectedEmployee.dob).format('YYYY-MM-DD')}
                  onChange={handleUpdateChange}
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
                  value={selectedEmployee.email}
                  onChange={handleUpdateChange}
                  className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Phone Numbers */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Phone Numbers (comma-separated)</label>
                <input
                  type="text"
                  name="phone_number"
                  value={selectedEmployee.phone_number.join(', ')}
                  onChange={handleUpdateChange}
                  className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </form>

            {/* Buttons */}
            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setShowUpdateModal(false)}
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