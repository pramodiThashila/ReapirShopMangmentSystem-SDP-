import React, { useState } from 'react';
import axios from 'axios';

const EmployeeRegister = () => {
    const [employee, setEmployee] = useState<{
        first_name: string;
        last_name: string;
        nic: string;
        role: string;
        dob: string;
        email: string;
        username: string;
        password: string;
        phone_number: string[];
    }>({
        first_name: '',
        last_name: '',
        nic: '',
        role: '',
        dob: '',
        email: '',
        username: '',
        password: '',
        phone_number: [],
    });
    const [message, setMessage] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        if (name === "phone_number") {
            setEmployee((prev) => ({
                ...prev,
                phone_number: value.split(",").map((num) => num.trim()),
            }));
        } else {
            setEmployee((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/employees/register', employee);
            setMessage('Employee registered successfully');
            setEmployee({
                first_name: '',
                last_name: '',
                nic: '',
                role: '',
                dob: '',
                email: '',
                username: '',
                password: '',
                phone_number: [],
            });
        } catch (error) {
            setMessage('Error registering employee');
            console.error('Error registering employee:', error);
            if (axios.isAxiosError(error) && error.response && error.response.data.errors) {
                if (axios.isAxiosError(error) && error.response && error.response.data.errors) {
                    if (axios.isAxiosError(error) && error.response && error.response.data.errors) {
                        setMessage(error.response.data.errors.map((e: { msg: string }) => e.msg).join(', '));
                    }
                }
            }
        }
    };

    return (
        <div className="max-w-lg mx-auto bg-gray-100 p-8 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Register Employee</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="text"
                    name="first_name"
                    value={employee.first_name}
                    onChange={handleChange}
                    placeholder="First Name"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                />
                <input
                    type="text"
                    name="last_name"
                    value={employee.last_name}
                    onChange={handleChange}
                    placeholder="Last Name"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                />
                <input
                    type="text"
                    name="nic"
                    value={employee.nic}
                    onChange={handleChange}
                    placeholder="NIC"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                />
                <input
                    type="text"
                    name="role"
                    value={employee.role}
                    onChange={handleChange}
                    placeholder="Role"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                />
                <input
                    type="date"
                    name="dob"
                    value={employee.dob}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                />
                <input
                    type="email"
                    name="email"
                    value={employee.email}
                    onChange={handleChange}
                    placeholder="Email"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                />
                <input
                    type="text"
                    name="phone_number"
                    value={employee.phone_number ? employee.phone_number.join(", ") : ""}
                    onChange={handleChange}
                    placeholder="Telephone Numbers (comma-separated)"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                />
                <input
                    type="text"
                    name="username"
                    value={employee.username}
                    onChange={handleChange}
                    placeholder="Username"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                />
                <input
                    type="password"
                    name="password"
                    value={employee.password}
                    onChange={handleChange}
                    placeholder="Password"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                />
                <div className="flex justify-between gap-4 mt-4">
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition"
                    >
                        Register
                    </button>
                    <button
                        type="reset"
                        className="w-full bg-gray-400 text-white py-2 px-4 rounded-lg hover:bg-gray-500 transition"
                        onClick={() => setEmployee({
                            first_name: '',
                            last_name: '',
                            nic: '',
                            role: '',
                            dob: '',
                            email: '',
                            username: '',
                            password: '',
                            phone_number: [],
                        })}
                    >
                        Cancel
                    </button>
                </div>
            </form>
            {message && (
                <p
                    className={`mt-4 text-center font-medium ${
                        message.includes('successfully') ? 'text-green-500' : 'text-red-500'
                    }`}
                >
                    {message}
                </p>
            )}
        </div>
    );
};

export default EmployeeRegister;