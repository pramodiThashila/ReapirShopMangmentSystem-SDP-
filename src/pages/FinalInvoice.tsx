import React, { useState } from 'react';
import axios from 'axios';

const InvoiceForm = () => {
  const [jobId, setJobId] = useState('');
  const [jobDetails, setJobDetails] = useState({
    productName: '',
    modelNumber: '',
    repairDescription: '',
    warrantyEligibility: '',
  });
  const [spareParts, setSpareParts] = useState<Array<{ itemName: string; quantity: number }>>([]);
  const [customerInfo, setCustomerInfo] = useState({
    customerId: '',
    customerName: '',
    email: '',
    telephone: '',
  });
  const [billingInfo, setBillingInfo] = useState({
    totalPartsCost: 0,
    labourCost: 0,
    advancePayment: 0,
    totalPayment: 0,
  });

  const fetchJobDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/jobs/${jobId}`);
      const { job, spareParts, customer } = response.data;

      setJobDetails({
        productName: job.productName,
        modelNumber: job.modelNumber,
        repairDescription: job.repairDescription,
        warrantyEligibility: job.warrantyEligibility,
      });

      setSpareParts(spareParts.map((part: { itemName: string; quantity: number }) => ({ itemName: part.itemName, quantity: part.quantity })));

      setCustomerInfo({
        customerId: customer.customerId,
        customerName: customer.customerName,
        email: customer.email,
        telephone: customer.telephone,
      });
    } catch (error) {
      console.error('Error fetching job details:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6 mt-8">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Invoice</h1>

      {/* Job Details Section */}
      <div>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Job Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600">Job ID</label>
            <input
              type="text"
              value={jobId}
              onChange={(e) => setJobId(e.target.value)}
              onBlur={fetchJobDetails}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter Job ID"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Product Name</label>
            <input
              type="text"
              value={jobDetails.productName}
              readOnly
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Model Number</label>
            <input
              type="text"
              value={jobDetails.modelNumber}
              readOnly
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Repair Description</label>
            <textarea
              value={jobDetails.repairDescription}
              readOnly
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
              rows={2}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Warranty Eligibility</label>
            <input
              type="text"
              value={jobDetails.warrantyEligibility}
              readOnly
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
            />
          </div>
        </div>
      </div>

      <hr className="my-6 border-gray-300" />

      {/* Used Spare Parts Section */}
      <div>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Used Spare Parts</h2>
        <table className="w-full border border-gray-300 rounded-lg">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Item Name</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Quantity</th>
            </tr>
          </thead>
          <tbody>
            {spareParts.map((part, index) => (
              <tr key={index} className="border-t border-gray-300">
                <td className="px-4 py-2 text-sm text-gray-700">{part.itemName}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{part.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <hr className="my-6 border-gray-300" />

      {/* Customer Information Section */}
      <div>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Customer Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600">Customer ID</label>
            <input
              type="text"
              value={customerInfo.customerId}
              readOnly
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Customer Name</label>
            <input
              type="text"
              value={customerInfo.customerName}
              readOnly
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Email</label>
            <input
              type="email"
              value={customerInfo.email}
              readOnly
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Telephone Number</label>
            <input
              type="text"
              value={customerInfo.telephone}
              readOnly
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
            />
          </div>
        </div>
      </div>

      <hr className="my-6 border-gray-300" />

      {/* Billing Information Section */}
      <div>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Billing Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600">Total Cost For Parts Used</label>
            <input
              type="number"
              value={billingInfo.totalPartsCost}
              onChange={(e) => setBillingInfo({ ...billingInfo, totalPartsCost: parseFloat(e.target.value) })}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Labour Cost and Other Expenses</label>
            <input
              type="number"
              value={billingInfo.labourCost}
              onChange={(e) => setBillingInfo({ ...billingInfo, labourCost: parseFloat(e.target.value) })}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Advance Payment</label>
            <input
              type="number"
              value={billingInfo.advancePayment}
              onChange={(e) => setBillingInfo({ ...billingInfo, advancePayment: parseFloat(e.target.value) })}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Total Payment</label>
            <input
              type="number"
              value={billingInfo.totalPayment}
              onChange={(e) => setBillingInfo({ ...billingInfo, totalPayment: parseFloat(e.target.value) })}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      <hr className="my-6 border-gray-300" />

      {/* Buttons */}
      <div className="flex justify-between">
        <button className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500">Cancel</button>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save Invoice</button>
      </div>
    </div>
  );
};

export default InvoiceForm;