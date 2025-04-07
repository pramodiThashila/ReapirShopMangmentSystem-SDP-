import React, { useState, useEffect } from 'react';
import { Container, TextField, Button, Typography, Box, MenuItem } from '@mui/material';
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
    const [itemList, setItemList] = useState([]); 
    const [supplierList, setSupplierList] = useState([]); 
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

    const handleChange = (e) => {
        const { name, value } = e.target;

        // If item_name is selected, auto-fill inventoryItem_id
        if (name === 'item_name') {
            const selectedItem = itemList.find((item) => item.item_name === value);
            setInventoryItemBatch((prev) => ({
                ...prev,
                item_name: value,
                inventoryItem_id: selectedItem ? selectedItem.inventoryItem_id : '',
            }));
        }
        // If supplier_name is selected, auto-fill supplier_id
        else if (name === 'supplier_name') {
            const selectedSupplier = supplierList.find((supplier) => supplier.supplier_name === value);
            setInventoryItemBatch((prev) => ({
                ...prev,
                supplier_name: value,
                supplier_id: selectedSupplier ? selectedSupplier.supplier_id : '',
            }));
        } else {
            setInventoryItemBatch((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate required fields
        const { item_name, inventoryItem_id, quantity, unitprice, Purchase_Date, supplier_name, supplier_id } = inventoryItemBatch;
        if (!item_name || !inventoryItem_id || !quantity || !unitprice || !supplier_name || !supplier_id) {
            setMessage('Please fill in all required fields.');
            return;
        }

        try {
            const response = await axios.post('http://localhost:5000/api/inventoryBatch/add', {
                inventoryItem_id: parseInt(inventoryItem_id, 10), // Ensure it's an integer
                supplier_id: parseInt(supplier_id, 10), // Ensure it's an integer
                quantity: parseInt(quantity, 10), // Ensure it's an integer
                unitprice: parseFloat(unitprice), // Ensure it's a float
                Purchase_Date: Purchase_Date || null, // Optional field
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
        <Container maxWidth="md" sx={{ backgroundColor: '#f5f7fa', padding: '2rem', borderRadius: '8px' }}>
            <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', fontWeight: 'bold', color: '#000' }}>
                Add New Inventory Batch
            </Typography>
            <Box component="form" onSubmit={handleSubmit} sx={{ marginTop: '2rem' }}>
                <TextField
                    label="Item Name"
                    name="item_name"
                    value={inventoryItemBatch.item_name}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    select
                    required
                >
                    {itemList.map((item) => (
                        <MenuItem key={item.inventoryItem_id} value={item.item_name}>
                            {item.item_name}
                        </MenuItem>
                    ))}
                </TextField>
                <TextField
                    label="Item ID"
                    name="inventoryItem_id"
                    value={inventoryItemBatch.inventoryItem_id}
                    fullWidth
                    margin="normal"
                    disabled // Item ID is auto-filled and cannot be changed manually
                />
                <TextField
                    label="Quantity"
                    name="quantity"
                    type="number"
                    value={inventoryItemBatch.quantity}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    required
                />
                <TextField
                    label="Unit Price"
                    name="unitprice"
                    type="number"
                    value={inventoryItemBatch.unitprice}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    required
                />
                <TextField
                    label="Purchase Date"
                    name="Purchase_Date"
                    type="date"
                    value={inventoryItemBatch.Purchase_Date}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    InputLabelProps={{
                        shrink: true,
                    }}
                    required
                />
                <TextField
                    label="Supplier Name"
                    name="supplier_name"
                    value={inventoryItemBatch.supplier_name}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    select
                    required
                >
                    {supplierList.map((supplier) => (
                        <MenuItem key={supplier.supplier_id} value={supplier.supplier_name}>
                            {supplier.supplier_name}
                        </MenuItem>
                    ))}
                </TextField>
                <TextField
                    label="Supplier ID"
                    name="supplier_id"
                    value={inventoryItemBatch.supplier_id}
                    fullWidth
                    margin="normal"
                    disabled // Supplier ID is auto-filled and cannot be changed manually
                />
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginTop: '2rem',
                    }}
                >
                    <Button
                        type="reset"
                        variant="contained"
                        onClick={handleReset}
                        sx={{
                            backgroundColor: '#b0b0b0',
                            color: '#fff',
                            '&:hover': { backgroundColor: '#a0a0a0' },
                            flex: 1,
                            marginRight: '1rem',
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        sx={{
                            backgroundColor: '#000',
                            color: '#fff',
                            '&:hover': { backgroundColor: '#333' },
                            flex: 1,
                        }}
                    >
                        Add
                    </Button>
                </Box>
                {message && (
                    <Typography
                        color={message.includes('successfully') ? 'primary' : 'error'}
                        sx={{ marginTop: '1rem' }}
                    >
                        {message}
                    </Typography>
                )}
            </Box>
        </Container>
    );
};

export default InventoryBatchAdd;