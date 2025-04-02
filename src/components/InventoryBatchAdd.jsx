import React, { useState } from 'react';
import { Container, TextField, Button, Typography, Box, MenuItem } from '@mui/material';

const InventoryItembatchAdd = () => {
    const [inventoryItemBatch, setInventoryItemBatch] = useState({
        item_name: '',
        inventoryItem_id: '',
        quantity: '',
        unitprice: '',
        Purchase_Date: '',
        supplier_name: '',
        supplier_id: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setInventoryItemBatch((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Inventory Item Submitted:', inventoryItemBatch);
        // Add your API call logic here
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
                Add New Inventory Items
            </Typography>
            <Box component="form" onSubmit={handleSubmit} sx={{ marginTop: '2rem' }}>
                <TextField
                    label="Item Name"
                    name="item_name"
                    value={inventoryItem.item_name}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    required
                />
                <TextField
                    label="Quantity"
                    name="inventoryItem_id"
            
                    value={inventoryItem.inventoryItem_id}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    required
                />
                <TextField
                    label="Quantity"
                    name="quantity"
                    type="number"
                    value={inventoryItem.quantity}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    required
                />
                <TextField
                    label="Purchased Price"
                    name="unitprice"
                    type="number"
                    value={inventoryItem.unitprice}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    required
                />
                <TextField
                    label="Purchase Date"
                    name="Purchase_Date"
                    type="date"
                    value={inventoryItem.Purchase_Date}
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
                    value={inventoryItem.supplier_name}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    select
                    required
                >
                    {/* Add supplier options here */}
                    <MenuItem value="Supplier A">Supplier A</MenuItem>
                    <MenuItem value="Supplier B">Supplier B</MenuItem>
                    <MenuItem value="Supplier C">Supplier C</MenuItem>
                </TextField>
                <TextField
                    label="Supplier ID"
                    name="supplier_id"
                    value={inventoryItem.supplier_id}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    required
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
            </Box>
        </Container>
    );
};

export default InventoryItemAdd;