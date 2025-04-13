import React, { useState, useEffect } from 'react';
import axios from 'axios';

const InventoryBatchAdd = () => {
  const [inventoryItemBatch, setInventoryItemBatch] = useState({
    item_name: '',
    inventoryItem_id: '',
    quantity: '',
    unitprice: '',
    Purchase_Date: '',
    supplier_name: '',
    supplier_id: '',
  });
  const [itemList, setItemList] = useState<{ inventoryItem_id: number; item_name: string }[]>([]);
  const [supplierList, setSupplierList] = useState<{ supplier_id: number; supplier_name: string }[]>([]);
  const [message, setMessage] = useState('');

  // Fetch inventory items and suppliers
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/inventory/all');
        setItemList(response.data);
      } catch (error) {
        console.error('Error fetching inventory items:', error);
      }
    };

    const fetchSuppliers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/suppliers/all');
        setSupplierList(response.data);
      } catch (error) {
        console.error('Error fetching suppliers:', error);
      }
    };

    fetchItems();
    fetchSuppliers();
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('');
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'item_name') {
      const selectedItem = itemList.find((item) => item.item_name === value);
      setInventoryItemBatch((prev) => ({
        ...prev,
        item_name: value,
        inventoryItem_id: selectedItem ? String(selectedItem.inventoryItem_id) : '',
      }));
    } else if (name === 'supplier_name') {
      const selectedSupplier = supplierList.find((supplier) => supplier.supplier_name === value);
      setInventoryItemBatch((prev) => ({
        ...prev,
        supplier_name: value,
        supplier_id: selectedSupplier ? String(selectedSupplier.supplier_id) : '',
      }));
    } else {
      setInventoryItemBatch((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { item_name, inventoryItem_id, quantity, unitprice, Purchase_Date, supplier_name, supplier_id } =
      inventoryItemBatch;

    if (!item_name || !inventoryItem_id || !quantity || !unitprice || !supplier_name || !supplier_id) {
      setMessage('Please fill in all required fields.');
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/inventoryBatch/add', {
        inventoryItem_id: parseInt(inventoryItem_id, 10),
        supplier_id: parseInt(supplier_id, 10),
        quantity: parseInt(quantity, 10),
        unitprice: parseFloat(unitprice),
        Purchase_Date: Purchase_Date || null,
      });

      setMessage('Inventory batch added successfully');
      setInventoryItemBatch({
        item_name: '',
        inventoryItem_id: '',
        quantity: '',
        unitprice: '',
        Purchase_Date: '',
        supplier_name: '',
        supplier_id: '',
      });
    } catch (error) {
      setMessage('Error adding inventory batch');
      console.error('Error adding inventory batch:', error);
    }
  };

  const handleReset = () => {
    setInventoryItemBatch({
      item_name: '',
      inventoryItem_id: '',
      quantity: '',
      unitprice: '',
      Purchase_Date: '',
      supplier_name: '',
      supplier_id: '',
    });
  };

  return (
    <div className="max-w-3xl mx-auto mt-8 p-6 bg-gray-100 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-center mb-6">Add New Inventory Batch</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Item Name Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Item Name</label>
          <select
            name="item_name"
            value={inventoryItemBatch.item_name}
            onChange={handleChange}
            className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select an item</option>
            {itemList.map((item) => (
              <option key={item.inventoryItem_id} value={item.item_name}>
                {item.item_name}
              </option>
            ))}
          </select>
        </div>

        {/* Item ID (Read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Item ID</label>
          <input
            type="text"
            name="inventoryItem_id"
            value={inventoryItemBatch.inventoryItem_id}
            readOnly
            className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
          />
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Quantity</label>
          <input
            type="number"
            name="quantity"
            value={inventoryItemBatch.quantity}
            onChange={handleChange}
            className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Unit Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Unit Price</label>
          <input
            type="number"
            name="unitprice"
            value={inventoryItemBatch.unitprice}
            onChange={handleChange}
            className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Purchase Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Purchase Date</label>
          <input
            type="date"
            name="Purchase_Date"
            value={inventoryItemBatch.Purchase_Date}
            onChange={handleChange}
            className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Supplier Name Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Supplier Name</label>
          <select
            name="supplier_name"
            value={inventoryItemBatch.supplier_name}
            onChange={handleChange}
            className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select a supplier</option>
            {supplierList.map((supplier) => (
              <option key={supplier.supplier_id} value={supplier.supplier_name}>
                {supplier.supplier_name}
              </option>
            ))}
          </select>
        </div>

        {/* Supplier ID (Read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Supplier ID</label>
          <input
            type="text"
            name="supplier_id"
            value={inventoryItemBatch.supplier_id}
            readOnly
            className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-between mt-6">
          <button
            type="reset"
            onClick={handleReset}
            className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add
          </button>
        </div>
      </form>

      {/* Message */}
      {message && (
        <p
          className={`mt-4 text-center ${
            message.includes('successfully') ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default InventoryBatchAdd;