import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Edit2 } from 'lucide-react';

const SupplierTable = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  interface Supplier {
    supplier_id: number;
    supplier_name: string;
    email: string;
    phone_number: string[];
    address: string;
  }

  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null); // Store selected supplier for update
  const [errors, setErrors] = useState<Record<string, string>>({}); // State for form validation errors

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/suppliers/all');
        setSuppliers(response.data);
      } catch (error) {
        console.error('Error fetching suppliers:', error);
      }
    };

    fetchSuppliers();
  }, []);

  const handleUpdateClick = (supplier: Supplier) => {
    setSelectedSupplier(supplier); // Set the selected supplier for update
    setErrors({}); // Clear any previous validation errors
    setOpen(true); // Open the update modal
  };

  const handleUpdateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSelectedSupplier((prev) => prev ? { ...prev, [name]: value } as Supplier : null);
  };

  const handleUpdateSubmit = async () => {
    // Perform client-side validation
    const newErrors: Record<string, string> = {};

    // Validate supplier_name
    if (selectedSupplier?.supplier_name && selectedSupplier.supplier_name.length > 100) {
      newErrors.supplier_name = "Supplier name should not exceed 100 characters";
    }

    // Validate email
    if (selectedSupplier?.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(selectedSupplier.email)) {
      newErrors.email = "Invalid email format";
    }

    // Validate address
    if (selectedSupplier?.address && selectedSupplier.address.length > 255) {
      newErrors.address = "Address should not exceed 255 characters";
    }

    // Validate phone numbers
    if (selectedSupplier?.phone_number) {
      const invalidPhones = selectedSupplier.phone_number.filter(
        (phone) => !/^(03|07|01)\d{8}$/.test(phone)
      );
      if (invalidPhones.length > 0) {
        newErrors.phone_number = "Phone numbers should contain exactly 10 digits and start with 07";
      }
    }

    // If there are validation errors, show them and stop submission
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      if (selectedSupplier) {
        await axios.put(
          `http://localhost:5000/api/suppliers/update/${selectedSupplier.supplier_id}`,
          selectedSupplier
        );
      }
      if (selectedSupplier) {
        setSuppliers((prev) =>
          prev.map((supplier) =>
            supplier.supplier_id === selectedSupplier.supplier_id ? selectedSupplier : supplier
          )
        );
      }
      setOpen(false); // Close the modal
    } catch (error) {
      console.error("Error updating supplier:", error);
    }
  };

  const handleClose = () => {
    setOpen(false); // Close the modal
    setErrors({}); // Clear any validation errors
  };
  const filteredSuppliers = suppliers.filter((supplier) =>
    supplier.supplier_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mx-auto mt-8 px-4">
      <h2 className="text-2xl font-bold text-center mb-6">View Supplier Details</h2>

      {/* Search Bar */}
      <div className="flex justify-center mb-6">
        <input
          type="text"
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Search Suppliers"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Supplier Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Supplier ID</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Supplier Name</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Email</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Phone Numbers</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Address</th>
              <th className="px-4 py-2 text-center text-sm font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSuppliers.map((supplier) => (
              <tr key={supplier.supplier_id} className="border-t border-gray-200 hover:bg-gray-50">
                <td className="px-4 py-2 text-sm text-gray-700">{supplier.supplier_id}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{supplier.supplier_name}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{supplier.email}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{supplier.phone_number.join(', ')}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{supplier.address}</td>                <td className="px-4 py-2 text-center">
                  <button
                    onClick={() => handleUpdateClick(supplier)}
                    title="Update supplier"
                    className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-100 transition-colors"
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
      {filteredSuppliers.length === 0 && (
        <div className="mt-4 text-center text-gray-500">No suppliers found.</div>
      )}

      {/* Update Modal */}
      {open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Update Supplier</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Supplier Name</label>
                <input
                  type="text"
                  name="supplier_name"
                  value={selectedSupplier?.supplier_name || ""}
                  onChange={handleUpdateChange}
                  className={`w-full mt-1 px-4 py-2 border ${errors.supplier_name ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:outline-none focus:ring-2 ${errors.supplier_name ? "focus:ring-red-500" : "focus:ring-blue-500"
                    }`}
                />
                {errors.supplier_name && <p className="mt-1 text-sm text-red-600">{errors.supplier_name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={selectedSupplier?.email || ""}
                  onChange={handleUpdateChange}
                  className={`w-full mt-1 px-4 py-2 border ${errors.email ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:outline-none focus:ring-2 ${errors.email ? "focus:ring-red-500" : "focus:ring-blue-500"
                    }`}
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Phone Numbers (comma-separated)</label>
                <input
                  type="text"
                  name="phone_number"
                  value={selectedSupplier?.phone_number?.join(", ") || ""}
                  onChange={(e) =>
                    setSelectedSupplier((prev) =>
                      prev
                        ? {
                          ...prev,
                          phone_number: e.target.value.split(",").map((num) => num.trim()),
                        }
                        : null
                    )
                  }
                  className={`w-full mt-1 px-4 py-2 border ${errors.phone_number ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:outline-none focus:ring-2 ${errors.phone_number ? "focus:ring-red-500" : "focus:ring-blue-500"
                    }`}
                />
                {errors.phone_number && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone_number}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <input
                  type="text"
                  name="address"
                  value={selectedSupplier?.address || ""}
                  onChange={handleUpdateChange}
                  className={`w-full mt-1 px-4 py-2 border ${errors.address ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:outline-none focus:ring-2 ${errors.address ? "focus:ring-red-500" : "focus:ring-blue-500"
                    }`}
                />
                {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={handleClose}
                  type="button"
                  className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateSubmit}
                  type="button"
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

export default SupplierTable;