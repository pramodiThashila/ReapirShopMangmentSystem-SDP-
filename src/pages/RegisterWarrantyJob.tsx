import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const RegisterWarrantyJob: React.FC = () => {
  const { id: jobId } = useParams<{ id: string }>(); // Get job ID from URL
  const navigate = useNavigate();

  const [jobData, setJobData] = useState<{
    repair_description: string;
    employee_id: string;
    employee_name: string;
    customer_id: string;
    product_id: string;
    product_name: string;
    product_image?: string;
    model_no: string;
    model: string;
  } | null>(null);

  const [employees, setEmployees] = useState<{ employee_id: string; first_name: string }[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [repairDescription, setRepairDescription] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchJobData();
    fetchEmployees();
  }, []);

  const fetchJobData = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/jobs/eachjob/${jobId}`);
      const job = response.data;

      setJobData(job);
      setRepairDescription(job.repair_description);
      setSelectedEmployee(job.employee_id);
    } catch (err: any) {
      console.error("Error fetching job data:", err);
      setError(err.response?.data?.message || "Failed to fetch job data.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/employees/all");
      setEmployees(response.data);
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!jobData) return;

    const payload = {
      oldjobid: jobId,  
      employee_id: selectedEmployee,
      customer_id: jobData.customer_id,
      product_id: jobData.product_id,
      repair_description: repairDescription,
      receive_date: new Date().toISOString().split("T")[0], // Current date
    };

    try {
      const response = await axios.post("http://localhost:5000/api/jobs/registerWarrantyJob", payload);
      alert(response.data.message || "Warranty job registered successfully!");
      navigate("/jobs/view"); // Redirect to jobs view page
    } catch (err: any) {
      console.error("Error registering warranty job:", err);
      alert(err.response?.data?.message || "Failed to register warranty job.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-gray-100 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Register Warranty Job</h1>

      {jobData && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Job Details</h2>
          <div className="flex items-center space-x-4">
            {jobData.product_image && (
              <img
                src={jobData.product_image}
                alt={jobData.product_name}
                className="w-20 h-20 object-cover rounded-lg border"
              />
            )}
            <div>
              <p>
                <strong>Product:</strong> {jobData.product_name} (Model: {jobData.model}, Model No: {jobData.model_no})
              </p>
              <p>
                <strong>Customer ID:</strong> {jobData.customer_id}
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="repairDescription" className="block text-sm font-medium text-gray-700">
            Repair Description
          </label>
          <textarea
            id="repairDescription"
            value={repairDescription}
            onChange={(e) => setRepairDescription(e.target.value)}
            className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            rows={4}
            required
          ></textarea>
        </div>

        <div>
          <label htmlFor="employee" className="block text-sm font-medium text-gray-700">
            Assigned Employee
          </label>
          <select
            id="employee"
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          >
            <option value="">Select Employee</option>
            {employees.map((employee) => (
              <option key={employee.employee_id} value={employee.employee_id}>
                {employee.first_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="receiveDate" className="block text-sm font-medium text-gray-700">
            Receive Date
          </label>
          <input
            type="date"
            id="receiveDate"
            value={new Date().toISOString().split("T")[0]} // Current date
            readOnly
            className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg shadow-sm bg-gray-100 focus:outline-none"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Register Job
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegisterWarrantyJob;