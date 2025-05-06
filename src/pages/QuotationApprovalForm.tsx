import React, { useState } from 'react';
import axios from 'axios';

interface Quotation {
  quotation_id: string;
  inventoryItem_id: string;
  item_name: string;
  supplier_id: string;
  supplier_name: string;
  unit_price: number;
  notes: string;
  quatationR_date: string;
}

interface QuotationApprovalFormProps {
  quotation: Quotation;
  onSuccess: () => void;
  onCancel: () => void;
}

interface FormData {
  quantity: string;
  needByDate: string;
  specialNotes: string;
}

const QuotationApprovalForm: React.FC<QuotationApprovalFormProps> = ({ quotation, onSuccess, onCancel }) => {
  // Component implementation remains the same
  const [formData, setFormData] = useState<FormData>({
    quantity: '',
    needByDate: '',
    specialNotes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set tomorrow as the minimum date for the needByDate field
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.quantity || parseInt(formData.quantity) <= 0) {
      setError('Please enter a valid quantity');
      return;
    }

    if (!formData.needByDate) {
      setError('Please select a need-by date');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // Send the form data along with quotation details to the backend
      await axios.post('http://localhost:5000/api/inventoryQuotation/approve', {
        quotation_id: quotation.quotation_id,
        supplier_id: quotation.supplier_id,
        inventoryItem_id: quotation.inventoryItem_id,
        quantity: parseInt(formData.quantity),
        needByDate: formData.needByDate,
        specialNotes: formData.specialNotes,
        unit_price: quotation.unit_price
      });

      // Also make the API call to update the quotation status
      await axios.put(`http://localhost:5000/api/inventoryQuotation/quotations/approve/${quotation.quotation_id}`);

      onSuccess();
    } catch (err: any) {
      console.error('Error approving quotation:', err);
      setError(err.response?.data?.message || 'Failed to approve quotation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Display quotation information */}
      <div className="bg-gray-50 p-4 rounded-lg mb-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Supplier</p>
            <p className="font-medium">{quotation.supplier_name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Item</p>
            <p className="font-medium">{quotation.item_name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Quotation ID</p>
            <p className="font-medium">{quotation.quotation_id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Unit Price</p>
            <p className="font-medium">${parseFloat(quotation.unit_price.toString()).toFixed(2)}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Quantity Needed <span className="text-red-600">*</span>
        </label>
        <input
          type="number"
          name="quantity"
          value={formData.quantity}
          onChange={handleChange}
          min="1"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Need By Date <span className="text-red-600">*</span>
        </label>
        <input
          type="date"
          name="needByDate"
          value={formData.needByDate}
          onChange={handleChange}
          min={minDate}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Special Notes (Optional)
        </label>
        <textarea
          name="specialNotes"
          value={formData.specialNotes}
          onChange={handleChange}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Add any special instructions or notes..."
        ></textarea>
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className={`px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
          disabled={isSubmitting}
        >
          {isSubmitting && (
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {isSubmitting ? 'Processing...' : 'Approve Order'}
        </button>
      </div>
    </form>
  );
};

export default QuotationApprovalForm;