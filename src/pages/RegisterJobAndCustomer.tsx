import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface Customer {
  customer_id: number;
  firstName: string;
  lastName: string;
  email: string;
  type: string;
  phone_number?: string[];
}

interface Product {
  product_id: number;
  product_name: string;
  model: string;
  model_no: string;
  product_image?: string;
}

const RegisterJobCustomerProduct = () => {
  const navigate = useNavigate();
  const errorRef = useRef<HTMLDivElement>(null);

  // State for main entity data
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
    receiveDate: new Date().toISOString().split('T')[0], // Default to today
    employeeID: "",
  });

  // State for phone verification workflow
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isPhoneValid, setIsPhoneValid] = useState(false);
  const [isCheckingPhone, setIsCheckingPhone] = useState(false);

  // State for existing customer & products workflow
  const [existingCustomer, setExistingCustomer] = useState<Customer | null>(null);
  const [showCustomerDialog, setShowCustomerDialog] = useState(false);
  const [useExistingCustomer, setUseExistingCustomer] = useState(false);

  const [customerProducts, setCustomerProducts] = useState<Product[]>([]);
  const [showProductsDialog, setShowProductsDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [useExistingProduct, setUseExistingProduct] = useState(false);

  // File and form state
  const [productImage, setProductImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [cloudinaryUrl, setCloudinaryUrl] = useState<string | null>(null);

  //  states
  const [employees, setEmployees] = useState<{ employee_id: string; first_name: string; last_name?: string }[]>([]);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [activeTab, setActiveTab] = useState<"customer" | "product" | "job">("customer");
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(true);
  const [isLoading, setIsLoading] = useState(false); //  loading state for products

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Add a new state for form-wide errors/alerts
  const [formAlert, setFormAlert] = useState<{
    type: "success" | "error";
    message: string;
    visible: boolean;
  }>({
    type: "error",
    message: "",
    visible: false
  });

  // Fetch employee list
  useEffect(() => {
    const fetchEmployees = async () => {
      setIsLoadingEmployees(true);
      try {
        console.log("Attempting to fetch employees...");
        const response = await axios.get("http://localhost:5000/api/employees/all");
        console.log("Employee data retrieved:", response.data);

        // Map the data
        const formattedEmployees = response.data.map((emp: any) => ({
          employee_id: emp.employee_id,
          first_name: emp.first_name,
          last_name: emp.last_name || ""
        }));

        setEmployees(formattedEmployees);
      } catch (error) {
        console.error("Error fetching employees:", error);

        //debugs
        setEmployees([
          { employee_id: "1", first_name: "John", last_name: "Doe" },
          { employee_id: "2", first_name: "Jane", last_name: "Smith" },
          { employee_id: "3", first_name: "Robert", last_name: "Johnson" }
        ]);
      } finally {
        setIsLoadingEmployees(false);
      }
    };

    fetchEmployees();
  }, []);

  // Validate phone number
  const validatePhoneNumber = (phone: string) => {
    return /^07\d{8}$/.test(phone);
  };

  // Handle phone number input
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPhoneNumber(value);
    setIsPhoneValid(validatePhoneNumber(value));

    // Clear error if exists
    if (errors.phoneNumbers) {
      setErrors(prev => ({ ...prev, phoneNumbers: "" }));
    }
  };

  // Check if customer exists with phone number
  const checkCustomerByPhone = async () => {
    if (!isPhoneValid) {
      setErrors(prev => ({ ...prev, phoneNumbers: "Please enter a valid phone number" }));
      setFormAlert({
        type: "error",
        message: "Invalid phone number format. Please check and try again.",
        visible: true
      });
      return;
    }

    setIsCheckingPhone(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/customers/phone/${phoneNumber}`);
      setExistingCustomer(response.data);
      setShowCustomerDialog(true);
    } catch (error: any) {
      if (error.response?.status === 404) {
        // No customer found with this phone, continue with manual entry
        setCustomer(prev => ({
          ...prev,
          phoneNumbers: phoneNumber,
        }));
      } else {
        // Get the error message from the backend response
        let errorMessage = "Error checking phone number";
        
        // Check for different error response formats
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response?.data?.error) {
          errorMessage = error.response.data.error;
        } else if (typeof error.response?.data === 'string') {
          errorMessage = error.response.data;
        }
        
        // Set both the inline error and the alert
        setErrors(prev => ({
          ...prev,
          phoneNumbers: errorMessage
        }));
        
        // Show error alert
        setFormAlert({
          type: "error",
          message: errorMessage,
          visible: true
        });
        
        // Log the error for debugging
        console.error("Phone number check error:", error.response?.data);
      }
    } finally {
      setIsCheckingPhone(false);
    }
  };

  // Fetch products for existing customer
  const fetchCustomerProducts = async (customerId: number) => {
    try {
      console.log("Fetching products for customer ID:", customerId);
      setIsLoading(true); // Add loading state for products

      const response = await axios.get(`http://localhost:5000/api/products/customer/${customerId}`);
      console.log("Products response:", response.data);


      // Check if we got products and properly format the data
      // Access the products array from the response object structure
      const products = response.data.products && Array.isArray(response.data.products)
        ? response.data.products
        : [];
      console.log("Fetched products:", products);
      setCustomerProducts(products);

      // Only show dialog if products exist
      console.log(customerProducts.length);
      if (products && products.length > 0) {
        setShowProductsDialog(true);
      } else {
        console.log("No products found for this customer");
        // If no products, simply go to product entry screen
        setActiveTab("product");
      }
    } catch (error) {
      console.error("Error fetching customer products:", error);
      setCustomerProducts([]);
      setActiveTab("product");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle existing customer dialog response
  const handleExistingCustomerSelection = (useExisting: boolean) => {
    setUseExistingCustomer(useExisting);
    setShowCustomerDialog(false);
  
    if (useExisting && existingCustomer) {
      // Populate form with existing customer data
      setCustomer({
        firstName: existingCustomer.firstName || "",
        lastName: existingCustomer.lastName || "",
        email: existingCustomer.email || "",
        phoneNumbers: phoneNumber,
        customerType: existingCustomer.type || "Normal",
      });
  
      // Fetch customer's products
      fetchCustomerProducts(existingCustomer.customer_id);
  
      // Move to the product tab
      setActiveTab("product");
    } else {
      // User chose not to use existing customer - Just clear the phone number field
      // Reset the customer form for a fresh start
      setCustomer(prev => ({
        ...prev,
        phoneNumbers: "", // Clear the phone number as it must be unique
      }));
      
      // Clear the phone number search field as well
      setPhoneNumber("");
      setIsPhoneValid(false);
      
      // Stay on customer tab for new customer entry
      setActiveTab("customer");
      
      // No error alert - just silently reset the form for a new customer
    }
  };
  

  // Handle existing product selection
  const handleProductSelection = (useExisting: boolean, product?: Product) => {
    setUseExistingProduct(useExisting);
    setShowProductsDialog(false);

    if (useExisting && product) {
      setSelectedProduct(product);

      // Populate form with existing product data
      setProduct({
        productName: product.product_name,
        model: product.model,
        modelNo: product.model_no,
      });

      // If product has an image, show it
      if (product.product_image) {
        setImagePreview(product.product_image);
      }

      // move to job tab
      setActiveTab("job");
    } else {
      // User chose to add a new product
      setActiveTab("product");
    }
  };

  // Handle form inputs
  const handleCustomerChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCustomer((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error specifically for phone numbers
    if (name === "phoneNumbers") {
      setErrors((prev) => ({ ...prev, phoneNumbers: "" }));
    }
    // Clear error for other fields
    else if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleProductChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProduct((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error
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

    // Clear error
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];

    setProductImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // Remove image
  const handleRemoveImage = () => {
    setProductImage(null);
    setImagePreview(null);
    setCloudinaryUrl(null);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Validation function for the entire form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Customer validation
    if (!useExistingCustomer) {
      if (!customer.firstName) newErrors.firstName = "First name is required";
      if (!customer.lastName) newErrors.lastName = "Last name is required";
      if (!customer.email) newErrors.email = "Email is required";
      if (!customer.phoneNumbers) newErrors.phoneNumbers = "Phone number is required";
      if (!customer.customerType) newErrors.customerType = "Customer type is required";
    }
    
    // Product validation
    if (!useExistingProduct) {
      if (!product.productName) newErrors.productName = "Product name is required";
      if (!product.model) newErrors.model = "Model is required";
      if (!product.modelNo) newErrors.modelNo = "Model number is required";
    }
    
    // Job validation
    if (!job.repairDescription) newErrors.repairDescription = "Repair description is required";
    if (!job.receiveDate) newErrors.receiveDate = "Receive date is required";
    if (!job.employeeID) newErrors.employeeID = "Employee is required";
    
    setErrors(newErrors);
    
    // Show error alert if there are errors
    if (Object.keys(newErrors).length > 0) {
      setFormAlert({
        type: "error",
        message: "Please fix the highlighted errors before submitting.",
        visible: true
      });
      
      // Scroll to error summary
      setTimeout(() => {
        errorRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      
      return false;
    }
    
    return true;
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate the form first
    if (!validateForm()) {
      return;
    }

    // Clear previous errors and show loading
    setErrors({});
    setImageUploading(true);
    setFormAlert({ ...formAlert, visible: false });

    try {
      let response;

      //  1: Existing customer and existing product
      if (useExistingCustomer && useExistingProduct && existingCustomer && selectedProduct) {
        // Only create job with existing customer and product IDs
        const jobData = {
          customer_id: existingCustomer.customer_id,
          product_id: selectedProduct.product_id,
          repairDescription: job.repairDescription,
          receiveDate: job.receiveDate,
          employeeID: job.employeeID
        };

        response = await axios.post(
          "http://localhost:5000/api/customerJobProductRegister/registerJobWithExisting",
          jobData
        );
      }
      //  2: Existing customer but new product
      else if (useExistingCustomer && existingCustomer) {
        const formData = new FormData();

        // Add customer ID
        formData.append("customer_id", existingCustomer.customer_id.toString());

        // Add product details
        formData.append("product_name", product.productName);
        formData.append("model", product.model);
        formData.append("model_no", product.modelNo);

        // Add job details
        formData.append("repairDescription", job.repairDescription);
        formData.append("receiveDate", job.receiveDate);
        formData.append("employeeID", job.employeeID);

        // Add product image if exists
        if (productImage) {
          formData.append("product_image", productImage);
        }

        response = await axios.post(
          "http://localhost:5000/api/customerJobProductRegister/registerJobProduct",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      }
      // 3: New customer and new product
      else {
        const formData = new FormData();

        // Add customer details
        formData.append("firstName", customer.firstName);
        formData.append("lastName", customer.lastName);
        formData.append("email", customer.email);
        formData.append("type", customer.customerType);


        const phoneNumbersArray = customer.phoneNumbers.split(",").map((phone) => phone.trim());


        phoneNumbersArray.forEach((phone) => {
          formData.append("phone_number[]", phone);
        });

        // Add product details
        formData.append("product_name", product.productName);
        formData.append("model", product.model);
        formData.append("model_no", product.modelNo);

        // Add job details
        formData.append("repairDescription", job.repairDescription);
        formData.append("receiveDate", job.receiveDate);
        formData.append("employeeID", job.employeeID);

        // Add product image if exists
        if (productImage) {
          formData.append("product_image", productImage);
        }

        // debugs
        console.log("Submitting registration with data:");
        for (let pair of formData.entries()) {
          console.log(pair[0] + ': ' + pair[1]);
        }

        try {
          response = await axios.post(
            "http://localhost:5000/api/customerJobProductRegister/registerAll",
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );
        } catch (error) {
          if (axios.isAxiosError(error) && error.response) {
            console.error("Registration error details:", error.response.data);
          } else {
            console.error("An unexpected error occurred:", error);
          }
          throw error;
        }
      }

      // Show success message
      setFormAlert({
        type: "success",
        message: response.data.message || "Registration successful!",
        visible: true
      });
      
      // Scroll to success message
      setTimeout(() => {
        errorRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);

      // Reset form
      resetForm();

      // Automatically hide success message and navigate after 2 seconds
      setTimeout(() => {
        setFormAlert({ ...formAlert, visible: false });
        navigate("/jobs/view");
      }, 2000);
    } catch (error: any) {
      handleApiError(error);
    } finally {
      setImageUploading(false);
    }
  };

  // Improved API error handling
const handleApiError = (error: any) => {
  console.log("Error response:", error.response?.data);
  
  if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
    // Handle array of error objects format (common in validation libraries)
    const backendErrors: Record<string, string> = {};
    
    error.response.data.errors.forEach((err: any) => {
      // Map backend field names to frontend field names if needed
      let fieldName = err.path;
      
      // Special mapping for phone_number to phoneNumbers
      if (fieldName === 'phone_number') {
        fieldName = 'phoneNumbers';
      }
      
      backendErrors[fieldName] = err.msg;
    });
    
    // Set the errors
    setErrors(backendErrors);
    
    // Get the first error message for the alert
    const firstError = error.response.data.errors[0];
    setFormAlert({
      type: "error",
      message: firstError.msg || "Please fix the errors highlighted below.",
      visible: true
    });
    
    // Scroll to field if possible or to error summary
    setTimeout(() => {
      errorRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  } 
  else if (error.response?.data?.error) {
    // Handle single error object format
    setFormAlert({
      type: "error",
      message: error.response.data.error,
      visible: true
    });
  }
  else {
    // Generic error handling
    setFormAlert({
      type: "error",
      message: error.response?.data?.message || "An error occurred while registering. Please try again.",
      visible: true
    });
  }
  
  // Scroll to error summary
  setTimeout(() => {
    errorRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, 100);
};

  // Reset form to initial state
  const resetForm = () => {
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
      receiveDate: new Date().toISOString().split('T')[0],
      employeeID: "",
    });
    setProductImage(null);
    setImagePreview(null);
    setCloudinaryUrl(null);
    setErrors({});
    setPhoneNumber("");
    setIsPhoneValid(false);
    setExistingCustomer(null);
    setUseExistingCustomer(false);
    setSelectedProduct(null);
    setUseExistingProduct(false);
    setActiveTab("customer");
  };

  // Change tab and validate previous steps
  const handleTabChange = (tab: "customer" | "product" | "job") => {
    const currentTabValid = validateTabFields(activeTab);

    if (tab === activeTab) return;

    // Going forward - validate current tab
    if (
      (activeTab === "customer" && tab === "product") ||
      (activeTab === "product" && tab === "job")
    ) {
      if (!currentTabValid) return;
    }

    // Always allow going backward
    setActiveTab(tab);
  };

  // Validate fields on current tab
  const validateTabFields = (tab: "customer" | "product" | "job"): boolean => {
    const newErrors: Record<string, string> = {};

    if (tab === "customer") {
      // If not using existing customer, validate customer fields
      if (!useExistingCustomer) {
        if (!customer.firstName) newErrors.firstName = "First name is required";
        if (!customer.lastName) newErrors.lastName = "Last name is required";
        if (!customer.email) newErrors.email = "Email is required";
        if (!customer.phoneNumbers) newErrors.phoneNumbers = "Phone number is required";
        if (!customer.customerType) newErrors.customerType = "Customer type is required";
      }
    } else if (tab === "product") {
      // If not using existing product, validate product fields
      if (!useExistingProduct) {
        if (!product.productName) newErrors.productName = "Product name is required";
        if (!product.model) newErrors.model = "Model is required";
        if (!product.modelNo) newErrors.modelNo = "Model number is required";
      }
    } else if (tab === "job") {
      if (!job.repairDescription) newErrors.repairDescription = "Repair description is required";
      if (!job.receiveDate) newErrors.receiveDate = "Receive date is required";
      if (!job.employeeID) newErrors.employeeID = "Employee is required";
    }

    setErrors(prev => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  // Add useEffect for auto-dismissing alerts
  useEffect(() => {
    if (formAlert.visible) {
      const timer = setTimeout(() => {
        setFormAlert(prev => ({ ...prev, visible: false }));
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [formAlert.visible]);

  return (
    <div className="max-w-5xl mx-auto bg-gray-100 p-6 sm:p-8 rounded-lg mt-8 shadow-lg mb-20">
      <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-8">
        Register New Repair Job
      </h1>

      {/* Alert Messages */}
      {formAlert.visible && (
        <div 
          ref={errorRef}
          className={`mb-6 p-4 rounded-lg ${
            formAlert.type === "success" 
              ? "bg-green-50 border border-green-200 text-green-800" 
              : "bg-red-50 border border-red-200 text-red-800"
          }`}
          role="alert"
        >
          <div className="flex items-center">
            <div className={`flex-shrink-0 w-5 h-5 mr-2 ${
              formAlert.type === "success" ? "text-green-600" : "text-red-600"
            }`}>
              {formAlert.type === "success" ? (
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                </svg>
              ) : (
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                </svg>
              )}
            </div>
            <div>
              <span className="font-medium">{formAlert.type === "success" ? "Success!" : "Error!"}</span>
              <p className="text-sm mt-1">{formAlert.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Success Message Dialog (keep for compatibility) */}
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

      {/* Existing Customer Dialog */}
      {showCustomerDialog && existingCustomer && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8 max-w-md w-full mx-4">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Customer Found</h3>
              <p className="text-gray-600 mt-2">
                A customer with this phone number already exists in our system:
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <p className="mb-2"><span className="font-semibold">Name:</span> {existingCustomer.firstName} {existingCustomer.lastName}</p>
              <p className="mb-2"><span className="font-semibold">Email:</span> {existingCustomer.email}</p>
              <p><span className="font-semibold">Type:</span> {existingCustomer.type}</p>
            </div>

            <p className="text-center text-gray-700 mb-6">
              Would you like to use this customer's information for the new job?
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                type="button"
                onClick={() => handleExistingCustomerSelection(true)}
                className="inline-flex justify-center items-center px-4 py-2 border border-transparent font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Yes, Use Existing Customer
              </button>
              <button
                type="button"
                onClick={() => handleExistingCustomerSelection(false)}
                className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                No, Create New
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Existing Products Dialog */}
      {showProductsDialog && customerProducts.length > 0 && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8 max-w-3xl w-full mx-4 overflow-y-auto max-h-[90vh]">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 0 002-2M9 7a2 2 0 012-2h2a2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Existing Products</h3>
              <p className="text-gray-600 mt-2">
                This customer has existing products. Would you like to select one for repair?
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {customerProducts.map((product) => (
                <div
                  key={product.product_id}
                  className={`border rounded-lg overflow-hidden cursor-pointer hover:border-blue-500 transition-colors ${selectedProduct?.product_id === product.product_id ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-200'
                    }`}
                  onClick={() => setSelectedProduct(product)}
                >
                  <div className="flex p-4">
                    {product.product_image && (
                      <div className="w-20 h-20 flex-shrink-0 rounded bg-gray-100 mr-4 overflow-hidden">
                        <img
                          src={product.product_image}
                          alt={product.product_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">{product.product_name}</h4>
                      <p className="text-sm text-gray-600">Model: {product.model}</p>
                      <p className="text-sm text-gray-600">Model #: {product.model_no}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                type="button"
                onClick={() => selectedProduct && handleProductSelection(true, selectedProduct)}
                disabled={!selectedProduct}
                className="inline-flex justify-center items-center px-4 py-2 border border-transparent font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed"
              >
                Use Selected Product
              </button>
              <button
                type="button"
                onClick={() => handleProductSelection(false)}
                className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Add New Product
              </button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Registration Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-gray-700">Registration Progress</h2>
            {(useExistingCustomer || useExistingProduct) && (
              <div className="flex items-center space-x-2">
                {useExistingCustomer && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Existing Customer
                  </span>
                )}
                {useExistingProduct && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Existing Product
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: "100%" }}></div>
          </div>
        </div>

        {/* CUSTOMER SECTION */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-gray-700 mb-6 flex items-center">
            <svg className="w-6 h-6 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
            1. Customer Details
          </h2>

          {/* Phone verification step comes first */}
          {!useExistingCustomer && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
              <h3 className="text-blue-800 font-medium mb-2">Customer Lookup</h3>
              <p className="text-blue-700 text-sm mb-4">
                Enter a phone number to check if the customer already exists in our system.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Phone Number</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={phoneNumber}
                      onChange={handlePhoneChange}
                      className={`w-full px-4 py-2 border ${errors.phoneNumbers
                          ? "border-red-500"
                          : isPhoneValid
                            ? "border-green-500"
                            : "border-gray-300"
                        } rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                      placeholder="07XXXXXXXX"
                    />
                    {isPhoneValid && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Format: 07XXXXXXXX (10 digits starting with 07)</p>
                  {errors.phoneNumbers && <p className="text-red-500 text-sm mt-1">{errors.phoneNumbers}</p>}
                </div>

                <div className="self-end">
                  <button
                    type="button"
                    onClick={checkCustomerByPhone}
                    disabled={!isPhoneValid || isCheckingPhone}
                    className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:bg-blue-300 disabled:cursor-not-allowed"
                  >
                    {isCheckingPhone ? (
                      <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Checking...
                      </div>
                    ) : (
                      "Check"
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Customer form fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Phone number field */}
            <div>
              <label className="block text-sm font-medium text-gray-600">Phone Numbers</label>
              <input
                type="text"
                name="phoneNumbers"
                value={customer.phoneNumbers}
                onChange={handleCustomerChange}
                readOnly={useExistingCustomer}
                className={`w-full mt-1 px-4 py-2 border ${errors.phoneNumbers
                    ? "border-red-500"
                    : useExistingCustomer
                      ? "bg-gray-100 border-gray-300"
                      : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                placeholder="Enter phone numbers (comma-separated)"
              />
              {errors.phoneNumbers && <p className="text-red-500 text-sm mt-1">{errors.phoneNumbers}</p>}
              {!errors.phoneNumbers && (
                <p className="text-xs text-gray-500 mt-1">Separate multiple numbers with commas</p>
              )}
            </div>

            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-600">First Name</label>
              <input
                type="text"
                name="firstName"
                value={customer.firstName}
                onChange={handleCustomerChange}
                readOnly={useExistingCustomer}
                className={`w-full mt-1 px-4 py-2 border ${errors.firstName
                    ? "border-red-500"
                    : useExistingCustomer
                      ? "bg-gray-100 border-gray-300"
                      : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                placeholder="Enter first name"
                maxLength={10}
              />
              {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
              {!errors.firstName && <p className="text-xs text-gray-500 mt-1">Maximum 10 characters</p>}
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-600">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={customer.lastName}
                onChange={handleCustomerChange}
                readOnly={useExistingCustomer}
                className={`w-full mt-1 px-4 py-2 border ${errors.lastName
                    ? "border-red-500"
                    : useExistingCustomer
                      ? "bg-gray-100 border-gray-300"
                      : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                placeholder="Enter last name"
                maxLength={20}
              />
              {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
              {!errors.lastName && <p className="text-xs text-gray-500 mt-1">Maximum 20 characters</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-600">Email</label>
              <input
                type="email"
                name="email"
                value={customer.email}
                onChange={handleCustomerChange}
                readOnly={useExistingCustomer}
                className={`w-full mt-1 px-4 py-2 border ${errors.email
                    ? "border-red-500"
                    : useExistingCustomer
                      ? "bg-gray-100 border-gray-300"
                      : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                placeholder="Enter email address"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            {/* Customer Type */}
            <div>
              <label className="block text-sm font-medium text-gray-600">Customer Type</label>
              <select
                name="customerType"
                value={customer.customerType}
                onChange={handleCustomerChange}
                disabled={useExistingCustomer}
                className={`w-full mt-1 px-4 py-2 border ${errors.customerType
                    ? "border-red-500"
                    : useExistingCustomer
                      ? "bg-gray-100 border-gray-300"
                      : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}
              >
                <option value="">Select Type</option>
                <option value="Regular">Regular</option>
                <option value="Normal">Normal</option>
              </select>
              {errors.customerType && <p className="text-red-500 text-sm mt-1">{errors.customerType}</p>}
            </div>
          </div>
        </div>

        {/* PRODUCT SECTION */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-gray-700 mb-6 flex items-center">
            <svg className="w-6 h-6 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 0 002-2M9 7a2 2 0 012-2h2a2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"></path>
            </svg>
            2. Product Details
          </h2>

          {/* Product selection button - modified to handle product switching properly */}
          {useExistingCustomer && customerProducts.length > 0 && (
            <div className="flex justify-between items-center mb-6">
              {useExistingProduct ? (
                <div className="flex items-center">
                  <div className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full mr-2">
                    Selected Product
                  </div>
                  <span className="text-sm">{selectedProduct?.product_name}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setUseExistingProduct(false);
                      setSelectedProduct(null);
                      setShowProductsDialog(true);
                    }}
                    className="ml-3 text-xs text-blue-600 hover:text-blue-800 underline"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowProductsDialog(true)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
                  </svg>
                  View Previous Products ({customerProducts.length})
                </button>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium text-gray-600">Product Name</label>
              <input
                type="text"
                name="productName"
                value={product.productName}
                onChange={handleProductChange}
                readOnly={useExistingProduct}
                className={`w-full mt-1 px-4 py-2 border ${errors.productName
                    ? "border-red-500"
                    : useExistingProduct
                      ? "bg-gray-100 border-gray-300"
                      : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                placeholder="Enter product name"
              />
              {errors.productName && <p className="text-red-500 text-sm mt-1">{errors.productName}</p>}
            </div>

            {/* Model */}
            <div>
              <label className="block text-sm font-medium text-gray-600">Model</label>
              <input
                type="text"
                name="model"
                value={product.model}
                onChange={handleProductChange}
                readOnly={useExistingProduct}
                className={`w-full mt-1 px-4 py-2 border ${errors.model
                    ? "border-red-500"
                    : useExistingProduct
                      ? "bg-gray-100 border-gray-300"
                      : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                placeholder="Enter model"
              />
              {errors.model && <p className="text-red-500 text-sm mt-1">{errors.model}</p>}
            </div>

            {/* Model Number */}
            <div>
              <label className="block text-sm font-medium text-gray-600">Model Number</label>
              <input
                type="text"
                name="modelNo"
                value={product.modelNo}
                onChange={handleProductChange}
                readOnly={useExistingProduct}
                className={`w-full mt-1 px-4 py-2 border ${errors.modelNo
                    ? "border-red-500"
                    : useExistingProduct
                      ? "bg-gray-100 border-gray-300"
                      : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                placeholder="Enter model number"
              />
              {errors.modelNo && <p className="text-red-500 text-sm mt-1">{errors.modelNo}</p>}
            </div>

            {/* Improved Image Upload with Remove Button */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Product Image</label>
              <div className="flex flex-col space-y-2">
                {/* Image Preview */}
                {imagePreview && (
                  <div className="relative w-full h-40 border border-gray-300 rounded-lg overflow-hidden">
                    <img
                      src={imagePreview}
                      alt="Product Preview"
                      className="w-full h-full object-contain"
                    />

                    {/* Remove Button */}
                    {!useExistingProduct && (
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                      </button>
                    )}
                  </div>
                )}

                {/* File Input (show only if not existing product or no preview) */}
                {!useExistingProduct && !imagePreview && (
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                        </svg>
                        <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                        <p className="text-xs text-gray-500">PNG, JPG or JPEG (MAX. 2MB)</p>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        onChange={handleImageChange}
                        accept="image/*"
                      />
                    </label>
                  </div>
                )}

                {/* File input button if there's a preview */}
                {!useExistingProduct && imagePreview && (
                  <div className="flex justify-center">
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      onChange={handleImageChange}
                      accept="image/*"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Change Image
                    </button>
                  </div>
                )}
              </div>
              {errors.product_image && <p className="text-red-500 text-sm mt-1">{errors.product_image}</p>}
            </div>
          </div>
        </div>

        {/* JOB SECTION */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-gray-700 mb-6 flex items-center">
            <svg className="w-6 h-6 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
            </svg>
            3. Job Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Repair Description */}
            <div className="md:col-span-2">
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

            {/* Receive Date */}
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

            {/* Assigned Employee */}
            <div>
              <label className="block text-sm font-medium text-gray-600">Assigned Employee</label>
              <select
                name="employeeID"
                value={job.employeeID}
                onChange={handleJobChange}
                className={`w-full mt-1 px-4 py-2 border ${errors.employeeID ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${isLoadingEmployees ? "bg-gray-100" : ""
                  }`}
                disabled={isLoadingEmployees}
              >
                <option value="">
                  {isLoadingEmployees ? "Loading employees..." : "Select Employee"}
                </option>
                {employees.map((employee) => (
                  <option key={employee.employee_id} value={employee.employee_id}>
                    {employee.first_name} {employee.last_name}
                  </option>
                ))}
              </select>
              {isLoadingEmployees && (
                <p className="text-sm text-blue-500 mt-1">
                  <span className="inline-block animate-pulse mr-1">⋯</span>
                  Loading employee list...
                </p>
              )}
              {errors.employeeID && (
                <p className="text-red-500 text-sm mt-1">{errors.employeeID}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={resetForm}
            className="px-6 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
            disabled={imageUploading}
          >
            {imageUploading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Registering...
              </div>
            ) : (
              "Register Job"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegisterJobCustomerProduct;