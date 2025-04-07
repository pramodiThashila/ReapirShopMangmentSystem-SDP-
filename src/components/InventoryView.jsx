import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';
import moment from "moment";
import { useNavigate } from 'react-router-dom';

const inventoryTable = () => {
    const [inventory, setinventory] = useState([]);
    const [search, setSearch] = useState('');
    const [open, setOpen] = useState(false);
    const [selectedInventoryId, setselectedInventoryId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchInventory = async () => {
            try {
                const response = await axios.get(' http://localhost:5000/api/inventory/allBatchcount');
                setinventory(response.data);
            } catch (error) {
                console.error('Error fetching employees:', error);
            }
        };

        fetchInventory();
    }, []);

    const handleUpdateClick = (id) => {
        navigate(`/inventoryItemUpdate/${id}`);
    };

    const handleViewClick = (id) => {
        navigate(`/inventoryBatchDetails/${id}`);
    };

    // const handleDeleteClick = (id) => {
    //     setselectedInventoryId(id);
    //     setOpen(true); // Open the confirmation dialog
    // };

    // const confirmDelete = async () => {
    //     try {
    //         await axios.delete(`http://localhost:5000/api/employees/${selectedEmployeeId}`);
    //         setinventory(inventory.filter(inventory => inventory.inventoryItem_id !== selectedInventoryId));
    //         setOpen(false); // Close the dialog
    //     } catch (error) {
    //         console.error('Error deleting employee:', error);
    //     }
    // };

    // const handleClose = () => {
    //     setOpen(false); // Close the dialog without deleting
    // };

    const filteredinventory = inventory.filter(inventory =>
        (inventory.item_name?.toLowerCase().includes(search.toLowerCase()) || '') 
    );

    return (
        <div className="container mt-4">
            <h2 className="text-center mb-4">View Inventory Details</h2>
            <div className="row mb-3">
                <div className="col-md-6">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search inventory Items"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                {/* <div className="col-md-6 text-end">
                    <button className="btn btn-primary">Sort by Name</button>
                </div> */}
            </div>
            <div className="table-responsive">
                <table className="table table-bordered table-hover">
                    <thead className="table-light">
                        <tr>
                            <th className="text-center">Inventory ID</th>
                            <th className="text-center">Item Name</th>
                            <th className="text-center">Total quantity</th>
                            <th className="text-center">Out Of Stock Level</th>
                            <th className="text-center">Stock Status</th>
                            <th className="text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredinventory.map((inventory) => (
                            <tr key={inventory.inventoryItem_id}>
                                <td className="text-center">{inventory.inventoryItem_id}</td>
                                <td className="text-center">{inventory.item_name}</td>
                                <td className="text-center">{inventory.total_quantity}</td>
                                <td className="text-center">{inventory.outOfStockLevel}</td>
                                <td className="text-center">{inventory.status}</td>
                                
                               
                                <td className="text-center width-50">
                                    <button
                                        className="btn btn-sm btn-info me-2"
                                        onClick={() => handleViewClick(inventory.inventoryItem_id)}
                                    >
                                        view 
                                    </button>
                                    <button
                                        className="btn btn-sm btn-info me-2"
                                        onClick={() => handleUpdateClick(inventory.inventoryItem_id)}
                                    >
                                        Update
                                    </button>
                                    {/* <button
                                        className="btn btn-sm btn-danger mt-2"
                                        onClick={() => handleDeleteClick(inventory.inventoryItem_id)}
                                    >
                                        Delete
                                    </button> */}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Confirmation Dialog
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this employee? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={confirmDelete} color="secondary">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog> */}
        </div>
    );
};

export default inventoryTable;