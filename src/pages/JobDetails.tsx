import React, { useState, useEffect } from 'react';
import axios from 'axios';
import UpdateJobAndProduct from "./UpdateJobAndProduct";

const JobDetails = () => {
  const [jobs, setJobs] = useState<{ 
    job_id: string; 
    repair_description: string; 
    product_name: string;
    product_image: string; 
    employee_name?: string; 
    repair_status: string; 
  }[]>([]);
  const [selectedJob, setSelectedJob] = useState<{
    job_id: string;
    repair_description: string;
    product_name: string;
    product_image: string;
    employee_name?: string;
    repair_status: string;
  } | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  const [inventoryItems, setInventoryItems] = useState<{ inventoryItem_id: string; item_name: string }[]>([]);
  const [batches, setBatches] = useState<{ batch_no: string; unitprice: number; quantity: number; supplier_name: string }[]>([]);
  const [selectedInventory, setSelectedInventory] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [quantityUsed, setQuantityUsed] = useState('');
  const [errorMessages, setErrorMessages] = useState<string[]>([]); // State for error messages
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(''); // Add this state variable
  const [alertMessage, setAlertMessage] = useState<string>("");
  const [alertType, setAlertType] = useState<"success" | "error" | "warning" | "info">("info");
  const [showAlert, setShowAlert] = useState<boolean>(false);

  // Fetch all jobs
  const fetchJobs = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/jobs/all');
      setJobs(response.data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // Fetch inventory items
  useEffect(() => {
    const fetchInventoryItems = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/inventory/all');
        setInventoryItems(response.data);
      } catch (error) {
        console.error('Error fetching inventory items:', error);
      }
    };

    fetchInventoryItems();
  }, []);

  // Fetch batches for the selected inventory item
  const fetchBatches = async (inventoryId: string) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/inventoryBatch/getInventoryItemBatch/${inventoryId}`);
      setBatches(response.data);
    } catch (error) {
      console.error('Error fetching batches:', error);
    }
  };

  // Handle row selection
  const handleRowClick = (job: { 
    job_id: string; 
    repair_description: string; 
    product_name: string;
    product_image: string; 
    employee_name?: string; 
    repair_status: string; 
  }) => {
    setSelectedJob(job);
  };

  // Handle "Update Used Inventory" button click
  const handleInventoryUpdateClick = () => {
    if (!selectedJob) {
      alert('No job was selected');
      return;
    }
    setIsInventoryModalOpen(true);
  };

  // Handle inventory item selection
  const handleInventoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const inventoryId = e.target.value;
    setSelectedInventory(inventoryId);
    setSelectedBatch(''); // Reset batch selection
    fetchBatches(inventoryId);
  };

  // Handle form submission for updating used inventory
  const handleInventorySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessages([]); // Clear previous error messages

    if (!selectedBatch || !quantityUsed) {
      alert('Please select a batch and enter a quantity.');
      return;
    }

    try {
      await axios.post(
        `http://localhost:5000/api/jobusedInventory/add/${selectedJob?.job_id}/${selectedInventory}/${selectedBatch}`,
        { Quantity_Used: quantityUsed }
      );
      alert('Used inventory updated successfully!');
      setIsInventoryModalOpen(false);
      setQuantityUsed('');
      setSelectedInventory('');
      setSelectedBatch('');
    } catch (error: any) {
      console.error('Error updating used inventory:', error);

      // Extract error messages from the backend response
      if (error.response && error.response.data.errors) {
        const messages = error.response.data.errors.map((err: { msg: string }) => err.msg);
        setErrorMessages(messages);
      } else if (error.response && error.response.data.message) {
        setErrorMessages([error.response.data.message]);
      } else {
        setErrorMessages(['Failed to update used inventory.']);
      }
    }
  };

  const handleUpdateClick = (jobId: string) => {
    setSelectedJobId(jobId);
    setIsUpdateModalOpen(true);
  };

  // Add this function to handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Add this filtering logic before the return statement
  const filteredJobs = searchQuery
    ? jobs.filter(job => 
        job.product_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (job.employee_name && job.employee_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        job.job_id.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.repair_status.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : jobs;

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6 bg-gray-100 rounded-lg shadow-md">
    

      {/* Job Table with Improved UI */}
      <div className="container mx-auto mt-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">JOB Details</h1>
          
          <button
            onClick={handleInventoryUpdateClick}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors shadow-sm flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Update Used Inventory
          </button>
        </div>

        {/* Search Bar - Now with functionality */}
        <div className="flex justify-end mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search by product or employee"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Job ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Repair Description</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Product Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Product Image</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Assigned Employee</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Repair Status</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.map((job) => ( // Change jobs to filteredJobs
                <tr
                  key={job.job_id}
                  onClick={() => handleRowClick(job)}
                  className={`border-t border-gray-200 hover:bg-gray-50 transition-colors ${
                    selectedJob?.job_id === job.job_id ? 'bg-blue-50' : ''
                  }`}
                >
                  <td className="px-4 py-3 text-sm text-gray-700">{job.job_id}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 max-w-xs truncate">{job.repair_description}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{job.product_name}</td>
                  <td className="px-4 py-3">
                    <img 
                      src={job.product_image} 
                      alt="Product" 
                      className="w-16 h-16 object-cover rounded-md border border-gray-200 shadow-sm"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {job.employee_name || 
                      <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                        Unassigned
                      </span>
                    }
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      job.repair_status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      job.repair_status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                      job.repair_status === 'Completed' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {job.repair_status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsViewModalOpen(true);
                      }}
                      className="px-3 py-1 text-sm text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors mr-2"
                    >
                      View
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateClick(job.job_id);
                      }}
                      className="px-3 py-1 text-sm text-white bg-green-500 rounded-lg hover:bg-green-600 transition-colors"
                    >
                      Update
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty state - Updated to handle search results */}
        {filteredJobs.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow border border-gray-200">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {searchQuery ? "No matching jobs found" : "No jobs found"}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery ? "Try adjusting your search query." : "No jobs available to display."}
            </p>
          </div>
        )}
      </div>

      {/* View Modal */}
      {isViewModalOpen && selectedJob && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
            <h2 className="text-xl font-bold mb-4">Job Details</h2>
            <p><strong>Job ID:</strong> {selectedJob.job_id}</p>
            <p><strong>Repair Description:</strong> {selectedJob.repair_description}</p>
            <p><strong>Product Name:</strong> {selectedJob.product_name}</p>
            <p><strong>Product Image:</strong></p>
            <p><strong>Repair Status:</strong> {selectedJob.repair_status}</p>
            <p><strong>Assigned Employee:</strong> {selectedJob.employee_name || 'Unassigned'}</p>
            <button
              onClick={() => setIsViewModalOpen(false)}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Update Inventory Modal */}
{isInventoryModalOpen && (
  <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
    <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
      <h2 className="text-xl font-bold mb-4">Update Used Inventory</h2>

      {/* Display Error Messages */}
      {errorMessages.length > 0 && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          <ul>
            {errorMessages.map((msg, index) => (
              <li key={index}>{msg}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleInventorySubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium">Inventory Item</label>
          <select
            value={selectedInventory}
            onChange={handleInventoryChange}
            className="w-full px-4 py-2 border rounded"
          >
            <option value="">Select Inventory Item</option>
            {inventoryItems.map((item) => (
              <option key={item.inventoryItem_id} value={item.inventoryItem_id}>
                {item.item_name}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium">Batch</label>
          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            className="w-full px-4 py-2 border rounded"
            disabled={!selectedInventory}
          >
            <option value="">Select Batch</option>
            {batches.map((batch) => (
              <option key={batch.batch_no} value={batch.batch_no}>
                Batch #{batch.batch_no} - Price: {batch.unitprice} - Quantity: {batch.quantity} - Supplier: {batch.supplier_name}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium">Quantity Used</label>
          <input
            type="number"
            value={quantityUsed}
            onChange={(e) => setQuantityUsed(e.target.value)}
            className="w-full px-4 py-2 border rounded"
            placeholder="Enter quantity used"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Save
        </button>
        <button
          type="button"
          onClick={() => setIsInventoryModalOpen(false)}
          className="ml-2 px-4 py-2 bg-red-500 text-white rounded"
        >
          Cancel
        </button>
      </form>
    </div>
  </div>
)}
      <UpdateJobAndProduct
        jobId={selectedJobId}
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        refreshData={fetchJobs} // Function to refresh job data
      />
    </div>
  );
};

export default JobDetails;