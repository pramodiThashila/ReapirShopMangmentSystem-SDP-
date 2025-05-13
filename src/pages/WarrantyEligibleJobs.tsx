import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface WarrantyJob {
  Invoice_Id: string;
  job_id: string;
  repair_description: string;
  repair_status: string;
  receive_date: string;
  handover_date: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  employee_id: string;
  employee_name: string;
  employee_role: string;
  product_id: string;
  product_name: string;
  model: string;
  model_no: string;
  total_cost_for_parts: number;
  labour_cost: number;
  total_amount: number;
  warranty_exp_date: string;
  warranty_status: string;
  Is_warranty_claimed:boolean;
  warranty_claim_status: string;
}

const WarrantyEligibleJobs: React.FC = () => {
  const [jobs, setJobs] = useState<WarrantyJob[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<WarrantyJob[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<WarrantyJob | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchWarrantyEligibleJobs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [jobs, searchQuery]);

  const fetchWarrantyEligibleJobs = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get('http://localhost:5000/api/jobs/get/warrantyEligibleJobs');
      const jobsData = Array.isArray(response.data.jobs) ? response.data.jobs : [];
      setJobs(jobsData);
      setFilteredJobs(jobsData);
    } catch (err: any) {
      console.error('Error fetching warranty-eligible jobs:', err);
      setError(err.response?.data?.message || 'Failed to fetch warranty-eligible jobs');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...jobs];

    if (searchQuery) {
      result = result.filter((job) =>
        job.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.job_id.toString().toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredJobs(result);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleClaimWarrantyClick = () => {
    if (!selectedJob) {
      alert('Please select a job first.');
      return;
    }
    navigate(`/jobs/register-warranty/${selectedJob.job_id}`);
  };

  const handleRowClick = (job: WarrantyJob) => {
    setSelectedJob(job);
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6 bg-gray-100 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Warranty Eligible Jobs</h1>

      <div className="flex justify-between mb-6">
        <div className="w-1/3">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            type="text"
            id="search"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search by product, customer, or job ID"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
        onClick={handleClaimWarrantyClick}
        className={`px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-sm ${
          !selectedJob || selectedJob.warranty_claim_status === 'warranty claimed' 
            ? 'bg-blue-300 cursor-not-allowed' 
            : ''
        }`}
        disabled={!selectedJob || selectedJob.warranty_claim_status === 'warranty claimed'}
      >
        Claim Warranty
      </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="text-center py-8 bg-red-50 rounded-lg">
          <p className="text-red-500">{error}</p>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow border border-gray-200">
          <h3 className="mt-2 text-sm font-medium text-gray-900">No warranty-eligible jobs found</h3>
          <p className="mt-1 text-sm text-gray-500">Try adjusting your search query.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Job ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Invoice ID</th> {/* Added Invoice ID */}
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Product</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Customer</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Employee</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Warranty Expiry</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Warranty Period Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Warranty Claim Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.map((job) => (
                <tr
                  key={job.job_id}
                  onClick={() => handleRowClick(job)}
                  className={`border-t border-gray-200 hover:bg-gray-50 transition-colors ${
                    selectedJob?.job_id === job.job_id ? 'bg-blue-50' : ''
                  }`}
                >
                  <td className="px-4 py-3 text-sm text-gray-700">{job.job_id}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{job.Invoice_Id}</td> {/* Display Invoice ID */}
                  <td className="px-4 py-3 text-sm text-gray-700">{job.product_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{job.customer_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{job.employee_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {new Date(job.warranty_exp_date).toLocaleDateString()}
                  </td>
                
                  <td
                    className={`px-4 py-3 text-sm font-semibold ${
                      job.warranty_status === 'Active' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {job.warranty_status}
                  </td>

                  <td
                    className={`px-4 py-3 text-sm font-semibold ${
                      job.warranty_claim_status === 'warranty claimed' ? 'text-red-600' : 'text-green-600'
                    }`}
                  >
                    {job.warranty_claim_status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default WarrantyEligibleJobs;