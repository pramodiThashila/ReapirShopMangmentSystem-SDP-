import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Edit2 } from 'lucide-react';

const InventoryView = () => {
  interface InventoryItem {
    inventoryItem_id: string;
    item_name: string;
    total_quantity: number;
    outOfStockLevel: number;
    status: string;
  }

  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedRow, setSelectedRow] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/inventory/allBatchcount');
        setInventory(response.data);
      } catch (error) {
        console.error('Error fetching inventory:', error);
      }
    };

    fetchInventory();
  }, []);

  const handleUpdateClick = (item: InventoryItem) => {
    setSelectedItem(item);
    setShowUpdateModal(true);
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    try {
      await axios.put(`http://localhost:5000/api/inventory/${selectedItem.inventoryItem_id}`, selectedItem);
      setMessage('Inventory item updated successfully');
      setInventory((prev) =>
        prev.map((item) =>
          item.inventoryItem_id === selectedItem.inventoryItem_id ? selectedItem : item
        )
      );
      setShowUpdateModal(false);
    } catch (error: any) {
      setMessage('Error updating inventory item');
      console.error('Error updating inventory item:', error);
      if (error.response) {
        setMessage(error.response.data.errors.map((e: any) => e.msg).join(', '));
      }
    }
  };

  const handleUpdateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSelectedItem((prev) => ({
      ...prev!,
      [name]: name === 'outOfStockLevel' ? parseInt(value, 10) || 0 : value,
    }));
  };

  const handleRowClick = (itemId: string) => {
    setSelectedRow(selectedRow === itemId ? null : itemId);
  };

  const handleRestockClick = () => {
    if (!selectedRow) {
      alert('Please select an inventory item to restock');
      return;
    }
    
    navigate(`/restock/${selectedRow}`);
  };

  const filteredInventory = inventory.filter((item) =>
    item.item_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mx-auto mt-8 px-4">
      <h2 className="text-2xl font-bold text-center mb-6">View Inventory Details</h2>

      {/* Search Bar and Restock Button */}
      <div className="flex justify-between items-center mb-6">
        <div className="w-full max-w-md">
          <input
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search inventory items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          onClick={handleRestockClick}
          className={`px-4 py-2 ml-4 text-white rounded-lg ${
            selectedRow ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'
          }`}
          disabled={!selectedRow}
        >
          Restock
        </button>
      </div>

      {/* Table with fixed height for scrolling */}
      <div className="overflow-y-auto h-[500px] rounded-lg shadow-md border border-gray-200">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Inventory ID</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Item Name</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Total Quantity</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Out of Stock Level</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Stock Status</th>
              <th className="px-4 py-2 text-center text-sm font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInventory.map((item) => (
              <tr 
                key={item.inventoryItem_id}
                onClick={() => handleRowClick(item.inventoryItem_id)}
                className={`border-t border-gray-200 hover:bg-gray-50 cursor-pointer ${
                  selectedRow === item.inventoryItem_id ? 'bg-blue-50' : ''
                }`}
              >
                <td className="px-4 py-2 text-sm text-gray-700">{item.inventoryItem_id}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{item.item_name}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{item.total_quantity}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{item.outOfStockLevel}</td>
                <td
                  className={`px-4 py-2 text-sm font-semibold ${
                    item.status === 'In Stock'
                      ? 'text-green-600'
                      : item.status === 'Limited stock'
                      ? 'text-orange-500'
                      : 'text-red-600'
                  }`}
                >
                  {item.status === 'In Stock'
                    ? 'In Stock'
                    : item.status === 'Limited stock'
                    ? 'Limited Stock'
                    : 'Out of Stock'}
                </td>                <td className="px-4 py-2 text-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent row selection when clicking update
                      handleUpdateClick(item);
                    }}
                    title="Update inventory item"
                    className="text-green-600 hover:text-green-900 p-1 rounded-full hover:bg-green-100 transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* No Results Message */}
      {filteredInventory.length === 0 && (
        <div className="mt-4 text-center text-gray-500">No inventory items found.</div>
      )}

      {/* Update Modal */}
      {showUpdateModal && selectedItem && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Update Inventory Item</h2>
            {message && <div className="mb-4 text-sm text-red-600">{message}</div>}
            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Item Name</label>
                <input
                  type="text"
                  name="item_name"
                  value={selectedItem.item_name}
                  onChange={handleUpdateChange}
                  className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Out of Stock Level</label>
                <input
                  type="number"
                  name="outOfStockLevel"
                  value={selectedItem.outOfStockLevel}
                  onChange={handleUpdateChange}
                  className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowUpdateModal(false)}
                  className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryView;