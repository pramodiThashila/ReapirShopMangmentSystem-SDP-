import React, { useState, useEffect } from "react";
import axios from "axios";

const RegisterJobCustomerProduct = () => {
  const [customer, setCustomer] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumbers: "",
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
  });

  const [productImage, setProductImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [employees, setEmployees] = useState<{ employee_id: string; first_name: string; last_name?: string }[]>([]);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({}); // State to store field-specific errors

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

  const handleCustomerChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCustomer((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear the error for the specific field when the user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleProductChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProduct((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear the error for the specific field when the user starts typing
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

    // Clear the error for the specific field when the user starts typing
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("firstName", customer.firstName);
    formData.append("lastName", customer.lastName);
    formData.append("email", customer.email);
    formData.append("type", customer.customerType);

    const phoneNumbersArray = customer.phoneNumbers.split(",").map((phone) => phone.trim());
    phoneNumbersArray.forEach((phone) => formData.append("phone_number[]", phone));

    formData.append("product_name", product.productName);
    formData.append("model", product.model);
    formData.append("model_no", product.modelNo);
    formData.append("repairDescription", job.repairDescription);
    formData.append("receiveDate", job.receiveDate);
    formData.append("employeeID", job.employeeID);

    if (productImage) {
      formData.append("product_image", productImage);
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/customerJobProductRegister/registerAll",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setMessage(response.data.message); // Set success message
      setErrors({}); // Clear errors on success

      // Clear the form fields
      setCustomer({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumbers: "",
        customerType: "",
      });
      setProduct({
        productName: "",
        model: "",
        modelNo: "",
      });
      setJob({
        repairDescription: "",
        receiveDate: "",
        employeeID: "",
      });
      setProductImage(null);
      setImagePreview(null);

      // Automatically hide the success message after 0.5 seconds
      setTimeout(() => {
        setMessage("");
      }, 1000);
    } catch (error: any) {
      if (error.response && error.response.data.errors) {
        // Parse backend errors and map them to the `errors` state
        const backendErrors = error.response.data.errors.reduce((acc: any, err: any) => {
          acc[err.path] = err.msg; // Map the error message to the field name
          return acc;
        }, {});
        setErrors(backendErrors);
      } else {
        setMessage("An error occurred while registering. Please try again.");
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto bg-gray-100 p-8 rounded-lg mt-8 shadow-lg">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
        Register Customer & Job
      </h1>

      {/* Success Message */}
      {message && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50"
          role="alert"
        >
          <div
            className="flex flex-col items-center p-6 text-lg text-green-800 border border-green-300 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400 dark:border-green-800 max-w-md w-full"
          >
            <svg
              className="w-8 h-8 mb-3"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 1 1 1 1v4h1a1 1 0 0 1 0 2Z" />
            </svg>
            <div className="text-center">
              <span className="font-bold text-xl">Success!</span>
              <p className="mt-2">{message}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Customer Details Section */}
        <div>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Customer Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600">First Name</label>
              <input
                type="text"
                name="firstName"
                value={customer.firstName}
                onChange={handleCustomerChange}
                className={`w-full mt-1 px-4 py-2 border ${errors.firstName ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                placeholder="Enter first name"
              />
              {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={customer.lastName}
                onChange={handleCustomerChange}
                className={`w-full mt-1 px-4 py-2 border ${errors.lastName ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                placeholder="Enter last name"
              />
              {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Email</label>
              <input
                type="email"
                name="email"
                value={customer.email}
                onChange={handleCustomerChange}
                className={`w-full mt-1 px-4 py-2 border ${errors.email ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                placeholder="Enter email address"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Phone Numbers</label>
              <input
                type="text"
                name="phoneNumbers"
                value={customer.phoneNumbers}
                onChange={handleCustomerChange}
                className={`w-full mt-1 px-4 py-2 border ${errors.phone_number ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                placeholder="Enter phone numbers (comma-separated)"
              />
              {errors.phone_number && (
                <p className="text-red-500 text-sm mt-1">{errors.phone_number}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Customer Type</label>
              <select
                name="customerType"
                value={customer.customerType}
                onChange={handleCustomerChange}
                className={`w-full mt-1 px-4 py-2 border ${errors.type ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}
              >
                <option value="">Select Type</option>
                <option value="Regular">Regular</option>
                <option value="Normal">Normal</option>
              </select>
              {errors.type && (
                <p className="text-red-500 text-sm mt-1">{errors.type}</p>
              )}
            </div>
          </div>
        </div>

        <hr className="my-6 border-gray-300" />

        {/* Product Details Section */}
        <div>
          <h2 className="text-xl font-semibold text-gray-700 mb-4"> Repair Product Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600">Product Name</label>
              <input
                type="text"
                name="productName"
                value={product.productName}
                onChange={handleProductChange}
                className={`w-full mt-1 px-4 py-2 border ${errors.productName ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                placeholder="Enter product name"
              />
              {errors.product_name && (
                <p className="text-red-500 text-sm mt-1">{errors.product_name}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Model</label>
              <input
                type="text"
                name="model"
                value={product.model}
                onChange={handleProductChange}
                className={`w-full mt-1 px-4 py-2 border ${errors.model ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                placeholder="Enter model"
              />
              {errors.model && <p className="text-red-500 text-sm mt-1">{errors.model}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Model Number</label>
              <input
                type="text"
                name="modelNo"
                value={product.modelNo}
                onChange={handleProductChange}
                className={`w-full mt-1 px-4 py-2 border ${errors.model_no ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                placeholder="Enter model number"
              />
              {errors.model_no && <p className="text-red-500 text-sm mt-1">{errors.model_no}</p>}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600">Product Image</label>
          <div className="flex items-center gap-4">
            {/* Image Preview */}
            <div className="w-32 h-32 border border-gray-300 rounded-lg flex items-center justify-center overflow-hidden">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Product Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-400">No Image</span>
              )}
            </div>
            {/* File Input */}
            <input
              type="file"
              onChange={handleImageChange}
              className={`block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 ${errors.product_image ? "border-red-500" : "border-gray-300"
                }`}
            />
          </div>
          {/* Error Message */}
          {errors.product_image && (
            <p className="text-red-500 text-sm mt-1">{errors.product_image}</p>
          )}
        </div>








        <hr className="my-6 border-gray-300" />

        {/* Job Details Section */}
        <div>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Job Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600">Repair Description</label>
              <textarea
                name="repairDescription"
                value={job.repairDescription}
                onChange={handleJobChange}
                className={`w-full mt-1 px-4 py-2 border ${errors.repairDescription ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                rows={3}
                placeholder="Enter repair description"
              ></textarea>
              {errors.repairDescription && (
                <p className="text-red-500 text-sm mt-1">{errors.repairDescription}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Receive Date</label>
              <input
                type="date"
                name="receiveDate"
                value={job.receiveDate}
                onChange={handleJobChange}
                className={`w-full mt-1 px-4 py-2 border ${errors.receiveDate ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}
              />
              {errors.receiveDate && (
                <p className="text-red-500 text-sm mt-1">{errors.receiveDate}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Assigned Employee</label>
              <select
                name="employeeID"
                value={job.employeeID}
                onChange={handleJobChange}
                className={`w-full mt-1 px-4 py-2 border ${errors.employeeID ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}
              >
                <option value="">Select Employee</option>
                {employees.map((employee) => (
                  <option key={employee.employee_id} value={employee.employee_id}>
                    {employee.first_name} {employee.last_name || ""}
                  </option>
                ))}
              </select>
              {errors.employeeID && (
                <p className="text-red-500 text-sm mt-1">{errors.employeeID}</p>
              )}
            </div>
          </div>
        </div>

        <hr className="my-6 border-gray-300" />

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => setMessage("")}
            className="px-6 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Register
          </button>
        </div>
      </form>


    </div>
  );
};

export default RegisterJobCustomerProduct;