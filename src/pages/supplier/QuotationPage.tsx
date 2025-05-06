import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useLocation } from 'react-router-dom';
import { DollarSign, Loader2, CheckCircle } from 'lucide-react';
import axios from 'axios'; // Import axios for API calls

const QuotationPage = () => {
  const location = useLocation();
  const [formData, setFormData] = useState({
    productName: '',
    supplierName: '',
    quotationPrice: '',
    email: '',
    phone: '',
    message: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Extract query parameters from the URL
    const params = new URLSearchParams(location.search);
    const productName = params.get('product') || '';
    const specification = params.get('specification') || '';

    // Prefill product name
    setFormData((prev) => ({
      ...prev,
      productName: `${productName} (${specification})`,
    }));

    // Get supplier data from localStorage or API
    const supplierData = localStorage.getItem('supplierData');
    if (supplierData) {
      const parsedData = JSON.parse(supplierData);
      setFormData((prev) => ({
        ...prev,
        supplierName: parsedData.supplier_name || '',
        email: parsedData.email || '',
        phone: parsedData.phone_number?.[0] || '', // Assuming the first phone number
      }));
    }
  }, [location.search]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validatePrice = (price: string): boolean => {
    return /^\d+(\.\d{1,2})?$/.test(price);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Validate form
    const newErrors: Record<string, string> = {};

    if (!formData.productName.trim()) {
      newErrors.productName = 'Product name is required';
    }

    if (!formData.supplierName.trim()) {
      newErrors.supplierName = 'Supplier name is required';
    }

    if (!formData.quotationPrice.trim()) {
      newErrors.quotationPrice = 'Quotation price is required';
    } else if (!validatePrice(formData.quotationPrice)) {
      newErrors.quotationPrice = 'Please enter a valid price';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Submit form
    setErrors({});
    setIsLoading(true);

    try {
      // Prepare data for API

      const supplierData = localStorage.getItem('supplierData');
      let supplierId: number | null = null;

      if (supplierData) {
        const parsedData = JSON.parse(supplierData);
        supplierId = parsedData.supplier_id;
      }

      const quotationData = {
        inventoryItem_id: parseInt(location.search.split('id=')[1], 10), // Extract and parse itemId from query params
        supplier_id: supplierId, // Parse supplierId from localStorage
        unit_price: parseFloat(formData.quotationPrice),
        notes: formData.message || null, // Allow notes to be null
      };

      // API call to store quotation
      console.log('Submitting quotation:', quotationData);
      const response = await axios.post('http://localhost:5000/api/inventoryQuotation/submitQuotation', quotationData);

      if (response.status === 201) {
        setIsSubmitted(true);
        // Reset form
        setFormData({
          productName: '',
          supplierName: '',
          quotationPrice: '',
          email: '',
          phone: '',
          message: '',
        });
      } else {
        setErrors({ apiError: 'Failed to submit quotation. Please try again.' });
      }
    } catch (error) {
      setErrors({ apiError: 'An error occurred while submitting the quotation.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Submit Quotation</h1>
        <p className="text-gray-600 mb-8">
          Interested in supplying products? Submit your quotation for our out-of-stock items.
        </p>

        {isSubmitted ? (
          <div className="card p-8 text-center">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">Quotation Submitted!</h2>
            <p className="text-gray-600 mb-6">
              Thank you for your quotation. Our team will review it and get back to you shortly.
            </p>
            <button
              onClick={() => setIsSubmitted(false)}
              className="btn-primary"
            >
              Submit Another Quotation
            </button>
          </div>
        ) : (
          <div className="card p-6">
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div className="border-b pb-4 mb-2">
                  <h3 className="text-lg font-medium">Product Information</h3>
                </div>

                <div>
                  <label className="label" htmlFor="productName">
                    Product Name
                  </label>
                  <input
                    type="text"
                    id="productName"
                    name="productName"
                    value={formData.productName}
                    readOnly
                    className="input bg-gray-100 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="label" htmlFor="message">
                    Additional Note (Optional)
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    placeholder="Include any additional information about your quotation..."
                    value={formData.message}
                    onChange={handleChange}
                    className="input resize-none"
                  ></textarea>
                </div>

                <div>
                  <label className="label" htmlFor="supplierName">
                    Supplier Name
                  </label>
                  <input
                    type="text"
                    id="supplierName"
                    name="supplierName"
                    value={formData.supplierName}
                    readOnly
                    className="input bg-gray-100 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="label" htmlFor="quotationPrice">
                    Quotation Price (USD)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="quotationPrice"
                      name="quotationPrice"
                      placeholder="0.00"
                      value={formData.quotationPrice}
                      onChange={handleChange}
                      className={`input pl-10 ${errors.quotationPrice ? 'border-red-500' : ''}`}
                    />
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  </div>
                  {errors.quotationPrice && <p className="mt-2 text-sm text-red-600">{errors.quotationPrice}</p>}
                </div>

                <div className="border-b pb-4 mb-2">
                  <h3 className="text-lg font-medium">Contact Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label" htmlFor="email">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      readOnly
                      className="input bg-gray-100 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="label" htmlFor="phone">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      readOnly
                      className="input bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-primary w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Quotation'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuotationPage;