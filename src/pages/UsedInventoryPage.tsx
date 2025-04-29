import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface UsedInventoryItem {
  job_id: string;
  inventoryItem_id: string;
  item_name: string;
  batch_no: string;
  quantity: number;
  total: string;
  unitprice: number;
}

const UsedInventoryPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [usedInventory, setUsedInventory] = useState<UsedInventoryItem[]>([]);
  const [totalAmount, setTotalAmount] = useState<string | number>('0');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<UsedInventoryItem | null>(null);
  const [newQuantity, setNewQuantity] = useState<string>('');

  useEffect(() => {
    if (jobId) {
      fetchUsedInventory();
    }
  }, [jobId]);

  const fetchUsedInventory = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`http://localhost:5000/api/jobusedInventory/usedinventory/${jobId}`);
      setUsedInventory(response.data.items);
      setTotalAmount(response.data.totalAmount);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch used inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (item: UsedInventoryItem) => {
    setEditItem(item);
    setNewQuantity(item.quantity.toString());
  };

  const handleCancelEdit = () => {
    setEditItem(null);
    setNewQuantity('');
  };

  const handleSaveEdit = async () => {
    if (!editItem || !newQuantity) return;

    try {
      await axios.put(
        `http://localhost:5000/api/jobusedInventory/update/${jobId}/${editItem.inventoryItem_id}/${editItem.batch_no}`,
        { Quantity_Used: parseInt(newQuantity, 10) }
      );
      fetchUsedInventory();
      handleCancelEdit();
    } catch (err) {
      alert('Failed to update used inventory. Please try again.');
    }
  };

  const handleDelete = async (item: UsedInventoryItem) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) return;

    try {
      await axios.delete(
        `http://localhost:5000/api/jobusedInventory/delete/${jobId}/${item.inventoryItem_id}/${item.batch_no}`
      );
      fetchUsedInventory();
    } catch (err) {
      alert('Failed to delete used inventory. Please try again.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6 bg-gray-100 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Used Inventory for Job #{jobId}</h1>

      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <>
          <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Item Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Batch No</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Unit Price</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Quantity Used</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Total</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {usedInventory.map((item) => (
                <tr key={`${item.inventoryItem_id}-${item.batch_no}`} className="border-t border-gray-200">
                  <td className="px-4 py-3 text-sm text-gray-700">{item.item_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.batch_no}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">Rs.{Number(item.unitprice).toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {editItem && editItem.inventoryItem_id === item.inventoryItem_id && editItem.batch_no === item.batch_no ? (
                      <input
                        type="number"
                        value={newQuantity}
                        onChange={(e) => setNewQuantity(e.target.value)}
                        className="w-20 px-2 py-1 border rounded"
                        min="1"
                      />
                    ) : (
                      item.quantity
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">Rs.{parseFloat(item.total).toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm">
                    {editItem && editItem.inventoryItem_id === item.inventoryItem_id && editItem.batch_no === item.batch_no ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={handleSaveEdit}
                          className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEditClick(item)}
                          className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 mr-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 font-semibold">
              <tr>
                <td colSpan={4} className="px-4 py-3 text-right text-sm">Total Amount:</td>
                <td className="px-4 py-3 text-sm">Rs.{parseFloat(String(totalAmount)).toFixed(2)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Back
          </button>
        </>
      )}
    </div>
  );
};

export default UsedInventoryPage;