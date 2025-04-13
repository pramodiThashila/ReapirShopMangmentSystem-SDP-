import React, { useState } from 'react';
import axios from 'axios';

const InventoryItemAdd = () => {
    const [inventoryItem, setInventoryItem] = useState({
        item_name: '',
        outOfStockLevel: '',
    });
    const [message, setMessage] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setInventoryItem((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleReset = () => {
        setInventoryItem({
            item_name: '',
            outOfStockLevel: '',
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/inventory/addInventory', inventoryItem);
            setMessage('Inventory item added successfully');
            setInventoryItem({
                item_name: '',
                outOfStockLevel: '',
            });
        } catch (error: any) {
            setMessage('Error adding inventory item');
            console.error('Error adding inventory item:', error);
            if (error.response && error.response.data.errors) {
                setMessage(error.response.data.errors.map((e: any) => e.msg).join(', '));
            }
        }
    };

    return (
        <div className="max-w-md mx-auto bg-white-100 p-6 rounded-lg shadow-md mt-10">
            <h1 className="text-2xl font-bold text-center text-white-800 mb-6">Add New Inventory Items</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="item_name" className="block text-sm font-medium text-gray-700">
                        Item Name
                    </label>
                    <input
                        type="text"
                        id="item_name"
                        name="item_name"
                        value={inventoryItem.item_name}
                        onChange={handleChange}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="outOfStockLevel" className="block text-sm font-medium text-gray-700">
                        Out Of Stock Level
                    </label>
                    <input
                        type="number"
                        id="outOfStockLevel"
                        name="outOfStockLevel"
                        value={inventoryItem.outOfStockLevel}
                        onChange={handleChange}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                </div>
                <div className="flex justify-between gap-4 mt-6">
                    <button
                        type="reset"
                        onClick={handleReset}
                        className="w-full bg-gray-400 text-white py-2 px-4 rounded-lg hover:bg-gray-500 transition"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
                    >
                        Add
                    </button>
                </div>
                {message && (
                    <p
                        className={`mt-4 text-center font-medium ${
                            message.includes('successfully') ? 'text-green-500' : 'text-red-500'
                        }`}
                    >
                        {message}
                    </p>
                )}
            </form>
        </div>
    );
};

export default InventoryItemAdd;