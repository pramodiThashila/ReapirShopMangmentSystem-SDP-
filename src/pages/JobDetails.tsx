import React, { useState, useEffect } from 'react';
import axios from 'axios';
import UpdateJobAndProduct from "./UpdateJobAndProduct";
import { useNavigate } from 'react-router-dom';
import { Tooltip as ReactTooltip } from 'react-tooltip';

const JobDetails = () => {
  // Keep all existing state variables
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
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  const [inventoryItems, setInventoryItems] = useState<{ inventoryItem_id: string; item_name: string }[]>([]);
  const [batches, setBatches] = useState<{ batch_no: string; unitprice: number; quantity: number; supplier_name: string }[]>([]);
  const [selectedInventory, setSelectedInventory] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [quantityUsed, setQuantityUsed] = useState('');
  const [errorMessages, setErrorMessages] = useState<string[]>([]); 
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [alertMessage, setAlertMessage] = useState<string>("");
  const [alertType, setAlertType] = useState<"success" | "error" | "warning" | "info">("info");
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const navigate = useNavigate();

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

  const handleCancelInventoryUpdate = () => {
    setSelectedInventory('');
    setSelectedBatch('');
    setQuantityUsed('');
    setErrorMessages([]);
    setIsInventoryModalOpen(false);
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

  //  handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  //  filtering logic 
  const filteredJobs = searchQuery
    ? jobs.filter(job =>
      job.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (job.employee_name && job.employee_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      job.job_id.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.repair_status.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : jobs;

  //  handle advance invoice button click
  const handleAdvanceInvoiceClick = () => {
    if (!selectedJob) {
      // Show alert if no job is selected
      setAlertMessage("Please select a job first.");
      setAlertType("warning");
      setShowAlert(true);

      // Auto hide alert after 3 seconds
      setTimeout(() => {
        setShowAlert(false);
      }, 3000);
      return;
    }

    navigate(`/advance-payment-invoice?jobId=${selectedJob.job_id}`);
  };

  const handleNavigateToUsedInventory = () => {
    if (!selectedJob) {
      alert('Please select a job first.');
      return;
    }
    navigate(`/jobs/${selectedJob.job_id}/used-inventory`);
  };

  return (
    // Main container with fixed height to prevent page scrolling
    <div className="max-w-6xl mx-auto h-[calc(100vh-100px)] mt-4 p-6 bg-gray-100 rounded-lg shadow-md flex flex-col">
      {/* Alert message display */}
      {showAlert && (
        <div className={`mb-4 p-4 rounded-lg ${alertType === "success" ? "bg-green-100 text-green-800" :
            alertType === "error" ? "bg-red-100 text-red-800" :
              alertType === "warning" ? "bg-yellow-100 text-yellow-800" :
                "bg-blue-100 text-blue-800"
          }`}>
          {alertMessage}
        </div>
      )}

      {/* Job Table - Fixed Header Section */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Fixed header and action buttons */}
        <div className="flex-shrink-0">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <h1 className="text-2xl font-bold">JOB Details</h1>

            <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
              <button
                onClick={handleAdvanceInvoiceClick}
                className={`px-4 py-2 text-white rounded-lg shadow-sm flex items-center ${selectedJob ? "bg-blue-500 hover:bg-blue-600" : "bg-blue-300 cursor-not-allowed"
                  } transition-colors`}
                disabled={!selectedJob}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
                Create Advance Invoice
              </button>

              <button
                onClick={handleInventoryUpdateClick}
                className={`px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors shadow-sm flex items-center ${selectedJob ? "" : "bg-yellow-300 cursor-not-allowed"
                  }`}
                disabled={!selectedJob}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Add Used Inventory
              </button>

              <button
                onClick={handleNavigateToUsedInventory}
                data-tip={!selectedJob ? 'Please select a job first' : ''}
                className={`px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors shadow-sm flex items-center ${selectedJob ? '' : 'bg-purple-300 cursor-not-allowed'
                  }`}
                disabled={!selectedJob}
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  ></path>
                </svg>
                Used Inventory
              </button>
              <ReactTooltip anchorSelect="[data-tip]" place="top" />
            </div>
          </div>

          {/* Search Bar - fixed position */}
          <div className="flex justify-end mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search by product or employee"
            />
          </div>
        </div>

        {/* Table container with fixed header and scrollable body */}
        <div className="flex-1 overflow-hidden border border-gray-200 rounded-lg shadow-md bg-white">
          {/* Table header - fixed */}
          <div className="bg-gray-100 shadow-sm">
            <div className="grid grid-cols-7">
              <div className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Job ID</div>
              <div className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Repair Description</div>
              <div className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Product Name</div>
              <div className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Product Image</div>
              <div className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Assigned Employee</div>
              <div className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Repair Status</div>
              <div className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Actions</div>
            </div>
          </div>

          {/* Table body - scrollable */}
          <div className="overflow-y-auto" style={{ height: "calc(100% - 44px)" }}>
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => (
                <div
                  key={job.job_id}
                  onClick={() => handleRowClick(job)}
                  className={`grid grid-cols-7 border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors ${
                    selectedJob?.job_id === job.job_id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="px-4 py-3 text-sm text-gray-700">{job.job_id}</div>
                  <div className="px-4 py-3 text-sm text-gray-700 truncate">{job.repair_description}</div>
                  <div className="px-4 py-3 text-sm text-gray-700">{job.product_name}</div>
                  <div className="px-4 py-3">
                    <img
                      src={job.product_image}
                      alt="Product"
                      className="w-16 h-16 object-cover rounded-md border border-gray-200 shadow-sm"
                    />
                  </div>
                  <div className="px-4 py-3 text-sm text-gray-700">
                    {job.employee_name ||
                      <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                        Unassigned
                      </span>
                    }
                  </div>
                  <div className="px-4 py-3">
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      job.repair_status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      job.repair_status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                      job.repair_status === 'Completed' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {job.repair_status}
                    </span>
                  </div>
                  <div className="px-4 py-3 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateClick(job.job_id);
                      }}
                      className="px-3 py-1 text-sm text-white bg-green-500 rounded-lg hover:bg-green-600 transition-colors"
                    >
                      View & Edit
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
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
        </div>
      </div>

      {/* Update Inventory Modal */}
      {isInventoryModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
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
                <label className="block text-sm font-medium mb-1">Inventory Item</label>
                <select
                  value={selectedInventory}
                  onChange={handleInventoryChange}
                  className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                <label className="block text-sm font-medium mb-1">Batch</label>
                <select
                  value={selectedBatch}
                  onChange={(e) => setSelectedBatch(e.target.value)}
                  className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                <label className="block text-sm font-medium mb-1">Quantity Used</label>
                <input
                  type="number"
                  value={quantityUsed}
                  onChange={(e) => setQuantityUsed(e.target.value)}
                  className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter quantity used"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCancelInventoryUpdate}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  Save
                </button>
              </div>
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