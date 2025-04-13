import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import { useParams, useNavigate } from 'react-router-dom';

const InventoryBatchDetails = () => {
  const { inventoryItem_id } = useParams(); // Get the inventory item ID from the route
  const [batchDetails, setBatchDetails] = useState<{ batch_no: string; unitprice: number; quantity: number; Purchase_Date: string; supplier_name: string; }[]>([]);
  const [item_name, setItemName] = useState(''); // State to store the item name
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBatchDetails = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/inventoryBatch/getInventoryItemBatch/${inventoryItem_id}`
        );

        if (response.data.length > 0) {
          setBatchDetails(response.data); // Set the batch details
          setItemName(response.data[0]?.item_name || 'Unknown Item'); // Extract the item name
        } else {
          console.error('No batch details found for this inventory item.');
        }
      } catch (error) {
        console.error('Error fetching batch details:', error);
      }
    };

    fetchBatchDetails();
  }, [inventoryItem_id]);

  return (
    <div className="max-w-5xl mx-auto mt-8 p-6 bg-gray-100 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Batch Details for <span className="text-blue-600">{item_name}</span>
        </h2>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
        >
          Back
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Batch No</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Unit Price</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Current Quantity</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Purchase Date</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Supplier Name</th>
            </tr>
          </thead>
          <tbody>
            {batchDetails.map((batch) => (
              <tr key={batch.batch_no} className="border-t border-gray-200 hover:bg-gray-50">
                <td className="px-4 py-2 text-sm text-gray-700">{batch.batch_no}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{batch.unitprice}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{batch.quantity}</td>
                <td className="px-4 py-2 text-sm text-gray-700">
                  {moment(batch.Purchase_Date).format('YYYY-MM-DD')}
                </td>
                <td className="px-4 py-2 text-sm text-gray-700">{batch.supplier_name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {batchDetails.length === 0 && (
        <div className="mt-4 text-center text-gray-500">No batch details found for this item.</div>
      )}
    </div>
  );
};

export default InventoryBatchDetails;