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
  
  // State for styled alerts
  const [alert, setAlert] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({
    show: false,
    message: '',
    type: 'info'
  });

  useEffect(() => {
    fetchJobData();
    fetchEmployees();
  }, []);

  // Auto-hide alert after 5 seconds
  useEffect(() => {
    if (alert.show) {
      const timer = setTimeout(() => {
        setAlert({ ...alert, show: false });
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [alert]);

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
      // Show success alert
      setAlert({
        show: true,
        message: response.data.message || "Warranty job registered successfully!",
        type: 'success'
      });
      // Redirect after a brief delay to allow the user to see the success message
      setTimeout(() => {
        navigate("/jobs/view");
      }, 2000);
    } catch (err: any) {
      console.error("Error registering warranty job:", err);
      // Show error alert
      setAlert({
        show: true,
        message: err.response?.data?.message || "Failed to register warranty job.",
        type: 'error'
      });
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
      
      {/* Styled Alert */}
      {alert.show && (
        <div className={`mb-6 p-4 rounded-lg shadow-sm flex items-center justify-between ${
          alert.type === 'success' ? 'bg-green-100 border-l-4 border-green-500 text-green-700' :
          alert.type === 'error' ? 'bg-red-100 border-l-4 border-red-500 text-red-700' :
          'bg-blue-100 border-l-4 border-blue-500 text-blue-700'
        }`}>
          <div className="flex items-center">
            <div className="mr-3">
              {alert.type === 'success' && (
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                </svg>
              )}
              {alert.type === 'error' && (
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                </svg>
              )}
              {alert.type === 'info' && (
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 8a1 1 0 00-1-1h.01a1 1 0 100 2h-.01a1 1 0 001-1z" clipRule="evenodd"></path>
                </svg>
              )}
            </div>
            <span>{alert.message}</span>
          </div>
          <button 
            onClick={() => setAlert({ ...alert, show: false })} 
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
            </svg>
          </button>
        </div>
      )}

      {jobData && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Job Details</h2>
          <div className="flex items-center space-x-4">
            {jobData.product_image && (
              <img
                src={jobData.product_image}
                alt={jobData.product_name}
                className="w-20 h-20 object-cover rounded-lg border"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI2VlZWVlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMThweCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==";
                }}
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