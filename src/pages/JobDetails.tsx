import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import UpdateJobAndProduct from "./UpdateJobAndProduct";
import { useNavigate } from 'react-router-dom';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import {
  Search,
  AlertTriangle,
  Clock,
  FileText,
  CheckCircle,
  Edit2,
  Briefcase,
  Plus,
  Package,
  ClipboardList,
  ChevronRight,
  Eye,
  DollarSign
} from 'lucide-react';

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
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
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
  const [loading, setLoading] = useState(true);
  const tableRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Fetch all jobs
  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/jobs/all');
      setJobs(response.data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
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
      showNotification("Please select a job first", "warning");
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

  const showNotification = (message: string, type: "success" | "error" | "warning" | "info") => {
    setAlertMessage(message);
    setAlertType(type);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
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
      setErrorMessages(['Please select a batch and enter a quantity.']);
      return;
    }

    try {
      await axios.post(
        `http://localhost:5000/api/jobusedInventory/add/${selectedJob?.job_id}/${selectedInventory}/${selectedBatch}`,
        { Quantity_Used: quantityUsed }
      );

      showNotification("Used inventory updated successfully!", "success");
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

  // Add this constant at the top of your component
const fallbackImageBase64 = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI2VlZWVlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMThweCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==";

  const handleViewClick = (job: any) => {
    setSelectedJob(job);
    setIsViewModalOpen(true);
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
      showNotification("Please select a job first.", "warning");
      return;
    }

    navigate(`/advance-payment-invoice?jobId=${selectedJob.job_id}`);
  };

  // Handle create final invoice button click
  const handleCreateInvoiceClick = () => {
    if (!selectedJob) {
      showNotification("Please select a job first.", "warning");
      return;
    }

    if (selectedJob.repair_status.toLowerCase() !== 'completed') {
      showNotification("Only completed jobs can be invoiced.", "warning");
      return;
    }

    navigate(`/finalInvoice?jobId=${selectedJob.job_id}`);
  };

  const handleNavigateToUsedInventory = () => {
    if (!selectedJob) {
      showNotification("Please select a job first.", "warning");
      return;
    }
    navigate(`/jobs/${selectedJob.job_id}/used-inventory`);
  };

  // Calculate job statistics
  const pendingJobs = Array.isArray(jobs) ? jobs.filter(job =>
    job.repair_status.toLowerCase() === 'pending').length : 0;

  const inProgressJobs = Array.isArray(jobs) ? jobs.filter(job =>
    job.repair_status.toLowerCase() === 'on progress' ||
    job.repair_status.toLowerCase() === 'in progress').length : 0;

  const completedJobs = Array.isArray(jobs) ? jobs.filter(job =>
    job.repair_status.toLowerCase() === 'completed').length : 0;

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Alert notification */}
      {showAlert && (
        <div
          className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 flex items-center ${alertType === "success" ? "bg-green-100 text-green-800 border-l-4 border-green-500" :
            alertType === "error" ? "bg-red-100 text-red-800 border-l-4 border-red-500" :
              alertType === "warning" ? "bg-yellow-100 text-yellow-800 border-l-4 border-yellow-500" :
                "bg-blue-100 text-blue-800 border-l-4 border-blue-500"
            }`}
        >
          {alertType === "success" ? <CheckCircle className="h-5 w-5 mr-2" /> :
            alertType === "error" ? <AlertTriangle className="h-5 w-5 mr-2" /> :
              alertType === "warning" ? <AlertTriangle className="h-5 w-5 mr-2" /> :
                <AlertTriangle className="h-5 w-5 mr-2" />}
          <span>{alertMessage}</span>
        </div>
      )}

      <div className="p-6 pb-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <Briefcase className="h-6 w-6 mr-2 text-blue-600" />
            Job Details
          </h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
            <div className="flex items-center">
              <div className="rounded-full bg-blue-100 p-3">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Jobs</p>
                <p className="text-2xl font-bold text-gray-800">{jobs.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
            <div className="flex items-center">
              <div className="rounded-full bg-yellow-100 p-3">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-gray-800">{pendingJobs}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-indigo-500">
            <div className="flex items-center">
              <div className="rounded-full bg-indigo-100 p-3">
                <FileText className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">In Progress</p>
                <p className="text-2xl font-bold text-gray-800">{inProgressJobs}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
            <div className="flex items-center">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Completed</p>
                <p className="text-2xl font-bold text-gray-800">{completedJobs}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
          <div className="w-full md:w-auto flex flex-col sm:flex-row gap-2">
            <button
              onClick={handleAdvanceInvoiceClick}
              className={`px-4 py-2 rounded-lg transition-colors shadow-sm flex items-center justify-center
                ${selectedJob
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-blue-200 text-blue-400 cursor-not-allowed'}`}
              disabled={!selectedJob}
            >
              <FileText className="w-5 h-5 mr-2" />  Create Advance Invoice
            </button>

            <button
              onClick={handleCreateInvoiceClick}
              className={`px-4 py-2 rounded-lg transition-colors shadow-sm flex items-center justify-center
                ${selectedJob && selectedJob.repair_status.toLowerCase() === 'completed'
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-green-200 text-green-400 cursor-not-allowed'}`}
              disabled={!selectedJob || selectedJob.repair_status.toLowerCase() !== 'completed'}
            >
              
              Create Final Invoice
            </button>

            <button
              onClick={handleInventoryUpdateClick}
              className={`px-4 py-2 rounded-lg transition-colors shadow-sm flex items-center justify-center
              ${selectedJob && selectedJob.repair_status.toLowerCase() !=='completed'
                  ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                  : 'bg-yellow-200 text-yellow-400 cursor-not-allowed'}`}
              disabled={!selectedJob || selectedJob.repair_status.toLowerCase() !== 'completed'}
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Used Inventory
            </button>

            <button
              onClick={handleNavigateToUsedInventory}
              disabled={!selectedJob}
              className={`px-4 py-2 rounded-lg transition-colors shadow-sm flex items-center justify-center
                ${selectedJob
                  ? 'bg-purple-600 text-white hover:bg-purple-700'
                  : 'bg-purple-200 text-purple-400 cursor-not-allowed'}`}
            >
              <ClipboardList className="w-5 h-5 mr-2" />
              View Used Inventory
            </button>
          </div>

          <div className="relative w-full md:w-64 flex items-center">
            <Search className="absolute left-3 text-gray-400 h-5 w-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search jobs..."
            />
          </div>
        </div>
      </div>

      {/* Table Container - This is the scrollable area */}
      <div className="px-6 pb-6 flex-1 overflow-hidden">
        <div
          ref={tableRef}
          className="bg-white rounded-lg shadow-md h-full overflow-y-auto"
        >
          {loading ? (
            <div className="h-full flex items-center justify-center p-6">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {filteredJobs.length > 0 ? (
                <table className="min-w-full">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredJobs.map((job) => (
                      <tr
                        key={job.job_id}
                        onClick={() => handleRowClick(job)}
                        className={`hover:bg-gray-50 transition-colors ${selectedJob?.job_id === job.job_id ? 'bg-blue-50' : ''
                          }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{job.job_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">

                              <img
                                className="h-10 w-10 rounded-full object-cover border border-gray-200"
                                src={job.product_image}
                                alt="Product"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = fallbackImageBase64;
                                }}
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{job.product_name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-700 max-w-xs truncate">{job.repair_description}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${job.repair_status.toLowerCase() === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              job.repair_status.toLowerCase() === 'on progress' || job.repair_status.toLowerCase() === 'in progress' ? 'bg-blue-100 text-blue-800' :
                                job.repair_status.toLowerCase() === 'completed' ? 'bg-green-100 text-green-800' :
                                  'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {job.repair_status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {job.employee_name ||
                            <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                              Unassigned
                            </span>
                          }
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewClick(job);
                              }}
                              title="View job details"
                              className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-100 transition-colors"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateClick(job.job_id);
                              }}
                              title="Edit job"
                              className="text-green-600 hover:text-green-900 p-1 rounded-full hover:bg-green-100 transition-colors"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            {/* <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleNavigateToUsedInventory();
                              }}
                              title="View used inventory"
                              className="text-purple-600 hover:text-purple-900 p-1 rounded-full hover:bg-purple-100 transition-colors"
                            >
                              <ClipboardList className="h-4 w-4" />
                            </button> */}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 p-6">
                  <div className="rounded-full bg-gray-100 p-3 mb-4">
                    <Briefcase className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {searchQuery ? "No matching jobs found" : "No jobs found"}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchQuery ? "Try adjusting your search query" : "There are no jobs available at the moment"}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* View Modal */}
      {isViewModalOpen && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-800">Job Details</h2>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Job ID</p>
                  <p className="font-semibold">#{selectedJob.job_id}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${selectedJob.repair_status.toLowerCase() === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      selectedJob.repair_status.toLowerCase() === 'on progress' || selectedJob.repair_status.toLowerCase() === 'in progress' ? 'bg-blue-100 text-blue-800' :
                        selectedJob.repair_status.toLowerCase() === 'completed' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {selectedJob.repair_status}
                  </span>
                </div>

                <div className="sm:col-span-2">
                  <p className="text-sm font-medium text-gray-500">Product Name</p>
                  <p className="font-semibold">{selectedJob.product_name}</p>
                </div>

                <div className="sm:col-span-2">
                  <p className="text-sm font-medium text-gray-500">Repair Description</p>
                  <p className="text-sm text-gray-700">{selectedJob.repair_description}</p>
                </div>

                <div className="sm:col-span-2">
                  <p className="text-sm font-medium text-gray-500">Product Image</p>
                  <div className="mt-2">
                    <img
                      src={selectedJob.product_image}
                      alt="Product"
                      className="w-full h-40 object-contain bg-gray-50 rounded border"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150';
                      }}
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <p className="text-sm font-medium text-gray-500">Assigned to</p>
                  <p className="font-semibold">{selectedJob.employee_name || 'Unassigned'}</p>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Modal */}
      {isInventoryModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-800">Add Used Inventory</h2>
              <button
                onClick={handleCancelInventoryUpdate}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>

            <div className="p-6">
              {errorMessages.length > 0 && (
                <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
                  <ul className="list-disc list-inside">
                    {errorMessages.map((msg, index) => (
                      <li key={index}>{msg}</li>
                    ))}
                  </ul>
                </div>
              )}

              <form onSubmit={handleInventorySubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Inventory Item</label>
                  <select
                    value={selectedInventory}
                    onChange={handleInventoryChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
                  <select
                    value={selectedBatch}
                    onChange={(e) => setSelectedBatch(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    disabled={!selectedInventory}
                  >
                    <option value="">Select Batch</option>
                    {batches.map((batch) => (
                      <option key={batch.batch_no} value={batch.batch_no}>
                        Batch #{batch.batch_no} - Price: Rs.{batch.unitprice} - Qty: {batch.quantity}
                      </option>
                    ))}
                  </select>
                  {selectedBatch && batches.find(b => b.batch_no === selectedBatch) && (
                    <p className="mt-1 text-xs text-gray-500">
                      Supplier: {batches.find(b => b.batch_no === selectedBatch)?.supplier_name}
                    </p>
                  )}
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity Used</label>
                  <input
                    type="number"
                    value={quantityUsed}
                    onChange={(e) => setQuantityUsed(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter quantity used"
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={handleCancelInventoryUpdate}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <UpdateJobAndProduct
        jobId={selectedJobId}
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        refreshData={fetchJobs}
      />
    </div>
  );
};

export default JobDetails;