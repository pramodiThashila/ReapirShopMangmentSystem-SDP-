import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import { useParams, useNavigate } from 'react-router-dom';

const InventoryBatchDetails = () => {
    const { inventoryItem_id } = useParams(); // Get the inventory item ID from the route
    const [batchDetails, setBatchDetails] = useState([]);
    const [item_name, setItemName] = useState(''); // State to store the item name
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBatchDetails = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/inventoryBatch/getInventoryItemBatch/${inventoryItem_id}`);
                
                console.log(response.data); // Log the response to debug

                if (response.data.length > 0) {
                    setBatchDetails(response.data); // Set the batch details
                    setItemName(response.data[0]?.item_name || 'Unknown Item'); //  extract the item name
                } else {
                    console.error('No batch details found for this inventory item.');
                }
            } catch (error) {
                console.error('Error fetching batch details:', error);
            }
        };

        fetchBatchDetails();
    }, [inventoryItem_id]);

    return (
        <div className="container mt-4">
            <h2 className="text-center mb-4">Batch Details for {item_name}</h2>
            <button className="btn btn-secondary mb-3" onClick={() => navigate(-1)}>
                Back
            </button>
            <div className="table-responsive">
                <table className="table table-bordered table-hover">
                    <thead className="table-light">
                        <tr>
                            <th>Batch No</th>
                            <th>Unit Price</th>
                            <th>Current Quantity</th>
                            <th>Purchase Date</th>
                            <th>Supplier Name</th>
                        </tr>
                    </thead>
                    <tbody>
                        {batchDetails.map((batch) => (
                            <tr key={batch.batch_no}>
                                <td>{batch.batch_no}</td>
                                <td>{batch.unitprice}</td>
                                <td>{batch.quantity}</td>
                                <td>{moment(batch.Purchase_Date).format('YYYY-MM-DD')}</td>
                                <td>{batch.supplier_name}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default InventoryBatchDetails;