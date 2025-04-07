import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, TextField, Button, Typography, Box } from '@mui/material';

const InventoryItemUpdate = () => {
    const { id } = useParams();
    const [inventoryItem, setInventoryItem] = useState(null);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchInventoryItem = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/inventory/${id}`);
                setInventoryItem(response.data);
            } catch (error) {
                console.error('Error fetching employee:', error);
            }
        };

        fetchInventoryItem();
    }, [id]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        console.log('Updating inventory item:', inventoryItem); // Debug log
        try {
           

            await axios.put(`http://localhost:5000/api/inventory/${id}`, inventoryItem);
            setMessage('Inventory Item updated successfully');
            navigate('/inventory/view');
        } catch (error) {
            setMessage('Error updating inventory item');
            console.error('Error updating inventory item:', error);
            if (error.response) {
                // Log server error response
                console.error("Server Response:", error.response.data);
                setMessage(error.response.data.errors.map(e => e.msg).join(', ')); // Show error messages
            }
        }
    };

    // const handleChange = (e) => {
    //   const { name, value } = e.target;
    //   setEmployee({ ...employee, [name]: value });
    // };

    const handleChange = (e) => {
        const { name, value } = e.target; // Destructure the 'name' and 'value' properties from the event target (input field).
    
        setInventoryItem((prev) => ({
            ...prev, // Spread the previous state of the 'inventoryItem' object to matche existing values.
            [name]: name === 'outOfStockLevel' 
                ? parseInt(value, 10) || 0 // 10 means base 10 (decimal). If the value is not a number, default to 0.
                : value, // For all other fields, directly use the input value as a string.
        }));
    };

    if (!inventoryItem) return <div>Loading...</div>;

    return (
        <Container maxWidth="sm">
            <Typography variant="h4" gutterBottom>
                Update Inventory Items
            </Typography>
            <Box component="form" onSubmit={handleUpdate}>
                <TextField
                    label="Item Name"
                    name="item_name"
                    value={inventoryItem.item_name}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                />
                
                <TextField
                    label="Out of stock level"
                    name="outOfStockLevel"
                    value={inventoryItem.outOfStockLevel}
                    type='number'
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                />
                
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: 2, // Adds spacing between buttons
                        mt: 2 // Adds top margin
                    }}
                >
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        sx={{ flex: 1 }} // Ensures both buttons have equal width
                    >
                        Update
                    </Button>
                    <Button
                        type="reset"
                        variant="contained"
                        color="gray"
                        sx={{ flex: 1 }} // Ensures both buttons have equal width
                    >
                        Cancel
                    </Button>
                </Box>
            </Box>
            {message && <Typography color="error">{message}</Typography>}
        </Container>
    );
};

export default InventoryItemUpdate;
