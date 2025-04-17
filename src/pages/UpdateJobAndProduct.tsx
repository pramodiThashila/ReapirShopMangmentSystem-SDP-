import React, { useState, useEffect } from "react";
import axios from "axios";

interface UpdateJobCustomerProductProps {
  jobId: string | null;
  isOpen: boolean;
  onClose: () => void;
  refreshData: () => void;
}

const UpdateJobCustomerProduct: React.FC<UpdateJobCustomerProductProps> = ({
  jobId,
  isOpen,
  onClose,
  refreshData,
}) => {
  const [customer, setCustomer] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumbers: [],
    customerType: "",
  });

  const [product, setProduct] = useState({
    productName: "",
    model: "",
    modelNo: "",
  });

  const [job, setJob] = useState({
    repairDescription: "",
    receiveDate: "",
    employeeID: "",
    repairStatus: "",
  });

  const [productImage, setProductImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [employees, setEmployees] = useState<{ employee_id: string; first_name: string; last_name?: string }[]>([]);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({}); 

  // Fetch employee list
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/employees/all");
        setEmployees(response.data);
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };

    fetchEmployees();
  }, []);

  // Fetch job details by job ID
  useEffect(() => {
    if (jobId) {
      const fetchJobDetails = async () => {
        try {
          // Fetch job data
          const jobResponse = await axios.get(`http://localhost:5000/api/jobs/eachjob/${jobId}`);
          const jobData = jobResponse.data;

          setProduct({
            productName: jobData.product_name || "",
            model: jobData.model || "",
            modelNo: jobData.model_no || "",
          });

          setJob({
            repairDescription: jobData.repair_description || "",
            receiveDate: jobData.receive_date ? jobData.receive_date.split("T")[0] : "",
            employeeID: jobData.employee_id || "",
            repairStatus: jobData.repair_status || "pending",
          });

          setImagePreview(jobData.product_image || null);

          // Fetch customer data if customer_id is available
          if (jobData.customer_id) {
            try {
              console.log("Fetching customer details for ID:", jobData.customer_id);
              
              const customerResponse = await axios.get(`http://localhost:5000/api/customers/${jobData.customer_id}`);
              const customerData = customerResponse.data;
              
              console.log("Customer data received:", customerData);
              
              // Handle different field naming conventions and ensure proper data types
              setCustomer({
                firstName: customerData.firstName || customerData.first_name || "",
                lastName: customerData.lastName || customerData.last_name || "",
                email: customerData.email || "",
                phoneNumbers: Array.isArray(customerData.phone_number) 
                  ? customerData.phone_number 
                  : typeof customerData.phone_number === 'string'
                    ? [customerData.phone_number]
                    : [],
                customerType: customerData.type || customerData.customerType || "",
              });
            } catch (error) {
              console.error("Error fetching customer details:", error);
            }
          }
        } catch (error) {
          console.error("Error fetching details:", error);
        }
      };

      fetchJobDetails();
    }
  }, [jobId]);

  const handleProductChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProduct((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleJobChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setJob((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const file = e.target.files[0];
    setProductImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // Update the handleSubmit function to use the combined API
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");
    setErrors({});
    
    try {
      // Log what we're sending to help debug
      console.log("Submitting job data:", job);
      
      // Create a single FormData object containing both job and product data
      const formData = new FormData();
      
      // Job details - CHANGED TO MATCH BACKEND FIELD NAMES
      formData.append("repair_description", job.repairDescription);
      
      // Convert status to match backend's expected format
      const statusMap: Record<string, string> = {
        "pending": "pending",
        "on progress": "on Progress", 
        "complete": "completed"
      };
      formData.append("repair_status", statusMap[job.repairStatus] || job.repairStatus);
      
      formData.append("receive_date", job.receiveDate);
      formData.append("employee_id", job.employeeID);
      
      // Product details - these already match the backend field names
      formData.append("product_name", product.productName);
      formData.append("model", product.model);
      formData.append("model_no", product.modelNo);

      // Add image if selected
      if (productImage) {
        formData.append("product_image", productImage);
      }

      // Debug - print what we're sending
      console.log("FormData contents:");
      for (let pair of formData.entries()) {
        console.log(pair[0] + ": " + pair[1]);
      }

      // Make a single API call to update both job and product
      const response = await axios.put(
        `http://localhost:5000/api/jobProduct/updateJobAndProduct/${jobId}`, 
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            if (productImage) {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
              console.log(`Upload progress: ${percentCompleted}%`);
            }
          }
        }
      );

      console.log("Update successful:", response.data);
      setMessage("Details updated successfully!");
      refreshData();
      onClose();
    } catch (error: any) {
      // Error handling remains the same
      console.error("Update failed:", error);
      
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        const backendErrors = error.response.data.errors.reduce((acc: any, err: any) => {
          // Map API error paths to form field names
          const fieldMap: Record<string, string> = {
            "product_name": "productName",
            "model_no": "modelNo",
            "repair_description": "repairDescription",
            "receive_date": "receiveDate",
            "employee_id": "employeeID",
            "repair_status": "repairStatus",
            "product_image": "productImage"
          };
          
          const fieldName = fieldMap[err.path] || err.path;
          acc[fieldName] = err.msg;
          return acc;
        }, {});
        
        setErrors(backendErrors);
      } else {
        // Generic error message
        setMessage(error.response?.data?.message || "An error occurred while updating. Please try again.");
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white z-10 px-8 py-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold text-gray-800">Update Job & Product</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Customer Details Section (Read-only) */}
            <div className="bg-blue-50 p-6 rounded-xl shadow-sm">
              <h3 className="text-2xl font-bold text-blue-800 mb-4">Customer Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-lg font-medium text-gray-600">Full Name</p>
                  <p className="text-xl text-gray-900 mt-1">
                    {customer.firstName} {customer.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-600">Email</p>
                  <p className="text-xl text-gray-900 mt-1">
                    {customer.email || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-600">Phone Numbers</p>
                  <p className="text-xl text-gray-900 mt-1">
                    {customer.phoneNumbers.length > 0 
                      ? customer.phoneNumbers.join(", ") 
                      : "No phone numbers"}
                  </p>
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-600">Customer Type</p>
                  <p className="text-xl text-gray-900 mt-1">
                    {customer.customerType || "Not specified"}
                  </p>
                </div>
              </div>
            </div>

            {/* Product Details Section */}
            <div className="bg-green-50 p-6 rounded-xl shadow-sm">
              <h3 className="text-2xl font-bold text-green-800 mb-4">Product Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-lg font-medium text-gray-700">Product Name</label>
                  <input
                    type="text"
                    name="productName"
                    value={product.productName}
                    onChange={handleProductChange}
                    className="w-full mt-2 px-5 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-lg font-medium text-gray-700">Model</label>
                  <input
                    type="text"
                    name="model"
                    value={product.model}
                    onChange={handleProductChange}
                    className="w-full mt-2 px-5 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-lg font-medium text-gray-700">Model Number</label>
                  <input
                    type="text"
                    name="modelNo"
                    value={product.modelNo}
                    onChange={handleProductChange}
                    className="w-full mt-2 px-5 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-lg font-medium text-gray-700">Product Image</label>
                  <div className="flex flex-col md:flex-row md:items-center gap-4 mt-2">
                    <div className="flex-shrink-0">
                      {imagePreview && (
                        <img
                          src={imagePreview}
                          alt="Product Preview"
                          className="w-40 h-40 object-cover border rounded-lg bg-white shadow-sm"
                        />
                      )}
                      {!imagePreview && (
                        <div className="w-40 h-40 flex items-center justify-center bg-gray-100 border rounded-lg">
                          <span className="text-gray-400">No image</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-grow">
                      <label className="w-full flex flex-col items-center px-4 py-4 bg-white text-green-600 rounded-lg border-2 border-green-300 border-dashed cursor-pointer hover:bg-green-50">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                        </svg>
                        <span className="mt-2 text-base">Select new image</span>
                        <input type="file" onChange={handleImageChange} className="hidden" />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Job Details Section */}
            <div className="bg-purple-50 p-6 rounded-xl shadow-sm">
              <h3 className="text-2xl font-bold text-purple-800 mb-4">Job Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-lg font-medium text-gray-700">Repair Description</label>
                  <textarea
                    name="repairDescription"
                    value={job.repairDescription}
                    onChange={handleJobChange}
                    className="w-full mt-2 px-5 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    rows={4}
                  ></textarea>
                </div>
                <div>
                  <label className="block text-lg font-medium text-gray-700">Repair Status</label>
                  <select
                    name="repairStatus"
                    value={job.repairStatus}
                    onChange={handleJobChange}
                    className="w-full mt-2 px-5 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value="pending">Pending</option>
                    <option value="on progress">On Progress</option>
                    <option value="complete">Complete</option>
                  </select>
                </div>
                <div>
                  <label className="block text-lg font-medium text-gray-700">Receive Date</label>
                  <input
                    type="date"
                    name="receiveDate"
                    value={job.receiveDate}
                    onChange={handleJobChange}
                    className="w-full mt-2 px-5 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-lg font-medium text-gray-700">Assigned Employee</label>
                  <select
                    name="employeeID"
                    value={job.employeeID}
                    onChange={handleJobChange}
                    className="w-full mt-2 px-5 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value="">Select Employee</option>
                    {employees.map((employee) => (
                      <option key={employee.employee_id} value={employee.employee_id}>
                        {employee.first_name} {employee.last_name || ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="sticky bottom-0 bg-white pb-6 pt-4 flex justify-end gap-4">
              <button
                type="button"
                onClick={onClose}
                className="px-8 py-4 text-lg font-medium bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors shadow-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-8 py-4 text-lg font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                Update Job
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateJobCustomerProduct;