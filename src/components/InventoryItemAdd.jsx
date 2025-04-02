import React, { useState } from 'react';
import axios from 'axios';
import { Container, TextField, Button, Typography, Box } from '@mui/material';

const InventoryItemAdd = () => {
    const [inventoryItem, setInventoryItem] = useState({
        item_name: '',
        outOfStockLevel: '',
    });
    const [message, setMessage] = useState('');

    const handleChange = (e) => {
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/inventory/addInventory', inventoryItem);
            setMessage('Inventory item added successfully');
            setInventoryItem({
                item_name: '',
                outOfStockLevel: '',
            });
        } catch (error) {
            setMessage('Error adding inventory item');
            console.error('Error adding inventory item:', error);
            if (error.response && error.response.data.errors) {
                setMessage(error.response.data.errors.map((e) => e.msg).join(', '));
            }
        }
    };

    return (
        <Container maxWidth='xs' sx={{ backgroundColor: '#f5f7fa', padding: '2rem', borderRadius: '8px',marginTop: '2rem',justifyContent: 'center', alignItems: 'center', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h5" gutterBottom sx={{ textAlign: 'center', fontWeight: 'bold', color: '#000' }}>
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
                    label="Out Of Stock Level"
                    name="outOfStockLevel"
                    value={inventoryItem.outOfStockLevel}
                    type="number"
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

export default InventoryItemAdd;