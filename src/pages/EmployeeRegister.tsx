import React, { useState } from 'react';
import axios from 'axios';
import moment from 'moment';

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
        role: 'employee', // Default value
        dob: '',
        email: '',
        username: '',
        password: '',
        phone_number: [],
    });
    
    const [errors, setErrors] = useState<{
        first_name?: string;
        last_name?: string;
        nic?: string;
        role?: string;
        dob?: string;
        email?: string;
        username?: string;
        password?: string;
        phone_number?: string;
        general?: string;
    }>({});
    
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validateField = (name: string, value: any): string | undefined => {
        switch (name) {
            case 'first_name':
                if (!value) return 'First name is mandatory';
                if (!/^[a-zA-Z']+$/.test(value)) return "First name should only contain letters and ' symbol";
                if (value.length > 50) return 'First name should not exceed 50 characters';
                break;
                
            case 'last_name':
                if (!value) return 'Last name is mandatory';
                if (!/^[a-zA-Z']+$/.test(value)) return "Last name should only contain letters and ' symbol";
                if (value.length > 50) return 'Last name should not exceed 50 characters';
                break;
                
            case 'email':
                if (!value) return 'Email is mandatory';
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email format';
                if (value.length > 100) return 'Email should not exceed 100 characters';
                break;
                
            case 'phone_number':
                if (!Array.isArray(value) || value.length === 0) return 'At least one phone number is required';
                
                for (let phone of value) {
                    if (!/^07\d{8}$/.test(phone)) {
                        return "Phone numbers should contain 10 digits and start with 07";
                    }
                }
                break;
                
            case 'nic':
                if (!value) return 'NIC is mandatory';
                if (!/^(?:\d{9}[Vv]|\d{12})$/.test(value)) {
                    return 'Invalid NIC format. Should be 9 digits followed by V or 12 digits.';
                }
                break;
                
            case 'role':
                if (!value) return 'Role is mandatory';
                if (!['owner', 'employee'].includes(value)) {
                    return "Role should be either 'owner' or 'employee'";
                }
                break;
                
            case 'username':
                if (!value) return 'Username is mandatory';
                if (value.length < 5 || value.length > 50) {
                    return 'Username should be between 5 to 50 characters';
                }
                break;
                
            case 'password':
                if (!value) return 'Password is mandatory';
                if (value.length < 6) return 'Password should be at least 6 characters long';
                break;
                
            case 'dob':
                if (!value) return 'Date of birth is mandatory';
                if (!moment(value, 'YYYY-MM-DD', true).isValid()) return 'Invalid date format';
                
                const dateOfBirth = moment(value);
                const now = moment();
                
                if (dateOfBirth.isAfter(now)) {
                    return 'Date of birth cannot be a future date';
                }
                
                const age = now.diff(dateOfBirth, 'years');
                if (age < 18) {
                    return 'Employee must be at least 18 years old';
                }
                break;
        }
        
        return undefined;
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        let isValid = true;
        
        // Validate each field
        Object.entries(employee).forEach(([field, value]) => {
            const error = validateField(field, value);
            if (error) {
                newErrors[field] = error;
                isValid = false;
            }
        });
        
        setErrors(newErrors);
        return isValid;
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;

        if (name === "phone_number") {
            const phoneNumbers = value
                .split(",")
                .map((num) => num.trim())
                .filter(num => num); // Filter out empty strings
                
            setEmployee((prev) => ({
                ...prev,
                phone_number: phoneNumbers,
            }));
            
            // Validate phone numbers as they're entered
            const error = validateField('phone_number', phoneNumbers);
            setErrors(prev => ({ ...prev, phone_number: error }));
        } else {
            setEmployee((prev) => ({
                ...prev,
                [name]: value,
            }));
            
            // Validate the field as it's changed
            const error = validateField(name, value);
            setErrors(prev => ({ ...prev, [name]: error }));
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        // Clear previous messages
        setMessage('');
        
        // Validate the entire form
        if (!validateForm()) {
            return; // Stop submission if validation fails
        }
        
        setIsSubmitting(true);
        
        try {
            const response = await axios.post('http://localhost:5000/api/employees/register', employee);
            setMessage('Employee registered successfully');
            
            // Reset form
            setEmployee({
                first_name: '',
                last_name: '',
                nic: '',
                role: 'employee',
                dob: '',
                email: '',
                username: '',
                password: '',
                phone_number: [],
            });
            
            // Clear any errors
            setErrors({});
        } catch (error) {
            console.error('Error registering employee:', error);
            
            if (axios.isAxiosError(error) && error.response) {
                if (error.response.data.message) {
                    // Handle specific error messages from the server
                    const errorMessage = error.response.data.message;
                    
                    // Map specific error messages to fields
                    if (errorMessage.includes('Email already exists')) {
                        setErrors(prev => ({ ...prev, email: 'Email already exists' }));
                    } else if (errorMessage.includes('NIC already exists')) {
                        setErrors(prev => ({ ...prev, nic: 'NIC already exists' }));
                    } else if (errorMessage.includes('Username already exists')) {
                        setErrors(prev => ({ ...prev, username: 'Username already exists' }));
                    } else if (errorMessage.includes('Phone number')) {
                        setErrors(prev => ({ ...prev, phone_number: errorMessage }));
                    } else {
                        setMessage(errorMessage);
                    }
                } else if (error.response.data.errors) {
                    // Handle validation errors from the server
                    const serverErrors = error.response.data.errors;
                    const newErrors: Record<string, string> = {};
                    
                    serverErrors.forEach((err: { param: string; msg: string }) => {
                        newErrors[err.param] = err.msg;
                    });
                    
                    setErrors(prev => ({ ...prev, ...newErrors }));
                    setMessage('Please fix the validation errors');
                }
            } else {
                setMessage('Error registering employee');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-lg my-8">
            <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Register Employee</h1>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                        First Name
                    </label>
                    <input
                        id="first_name"
                        type="text"
                        name="first_name"
                        value={employee.first_name}
                        onChange={handleChange}
                        placeholder="Enter first name"
                        className={`w-full p-3 border ${
                            errors.first_name ? 'border-red-500' : 'border-gray-300'
                        } rounded-lg focus:outline-none focus:ring-2 ${
                            errors.first_name ? 'focus:ring-red-500' : 'focus:ring-blue-500'
                        }`}
                    />
                    {errors.first_name && (
                        <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>
                    )}
                </div>
                
                <div>
                    <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name
                    </label>
                    <input
                        id="last_name"
                        type="text"
                        name="last_name"
                        value={employee.last_name}
                        onChange={handleChange}
                        placeholder="Enter last name"
                        className={`w-full p-3 border ${
                            errors.last_name ? 'border-red-500' : 'border-gray-300'
                        } rounded-lg focus:outline-none focus:ring-2 ${
                            errors.last_name ? 'focus:ring-red-500' : 'focus:ring-blue-500'
                        }`}
                    />
                    {errors.last_name && (
                        <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>
                    )}
                </div>
                
                <div>
                    <label htmlFor="nic" className="block text-sm font-medium text-gray-700 mb-1">
                        NIC
                    </label>
                    <input
                        id="nic"
                        type="text"
                        name="nic"
                        value={employee.nic}
                        onChange={handleChange}
                        placeholder="e.g., 123456789V or 123456789012"
                        className={`w-full p-3 border ${
                            errors.nic ? 'border-red-500' : 'border-gray-300'
                        } rounded-lg focus:outline-none focus:ring-2 ${
                            errors.nic ? 'focus:ring-red-500' : 'focus:ring-blue-500'
                        }`}
                    />
                    {errors.nic && (
                        <p className="mt-1 text-sm text-red-600">{errors.nic}</p>
                    )}
                </div>
                
                <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                        Role
                    </label>
                    <select
                        id="role"
                        name="role"
                        value={employee.role}
                        onChange={handleChange}
                        className={`w-full p-3 border ${
                            errors.role ? 'border-red-500' : 'border-gray-300'
                        } rounded-lg focus:outline-none focus:ring-2 ${
                            errors.role ? 'focus:ring-red-500' : 'focus:ring-blue-500'
                        }`}
                    >
                        <option value="employee">Employee</option>
                        <option value="owner">Owner</option>
                    </select>
                    {errors.role && (
                        <p className="mt-1 text-sm text-red-600">{errors.role}</p>
                    )}
                </div>
                
                <div>
                    <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-1">
                        Date of Birth
                    </label>
                    <input
                        id="dob"
                        type="date"
                        name="dob"
                        value={employee.dob}
                        onChange={handleChange}
                        className={`w-full p-3 border ${
                            errors.dob ? 'border-red-500' : 'border-gray-300'
                        } rounded-lg focus:outline-none focus:ring-2 ${
                            errors.dob ? 'focus:ring-red-500' : 'focus:ring-blue-500'
                        }`}
                    />
                    {errors.dob && (
                        <p className="mt-1 text-sm text-red-600">{errors.dob}</p>
                    )}
                </div>
                
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        name="email"
                        value={employee.email}
                        onChange={handleChange}
                        placeholder="Enter email address"
                        className={`w-full p-3 border ${
                            errors.email ? 'border-red-500' : 'border-gray-300'
                        } rounded-lg focus:outline-none focus:ring-2 ${
                            errors.email ? 'focus:ring-red-500' : 'focus:ring-blue-500'
                        }`}
                    />
                    {errors.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                </div>
                
                <div>
                    <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Numbers
                    </label>
                    <input
                        id="phone_number"
                        type="text"
                        name="phone_number"
                        value={employee.phone_number.join(", ")}
                        onChange={handleChange}
                        placeholder="e.g., 0712345678, 0776543210"
                        className={`w-full p-3 border ${
                            errors.phone_number ? 'border-red-500' : 'border-gray-300'
                        } rounded-lg focus:outline-none focus:ring-2 ${
                            errors.phone_number ? 'focus:ring-red-500' : 'focus:ring-blue-500'
                        }`}
                    />
                    <p className="mt-1 text-xs text-gray-500">Enter multiple numbers separated by commas (format: 07XXXXXXXX)</p>
                    {errors.phone_number && (
                        <p className="mt-1 text-sm text-red-600">{errors.phone_number}</p>
                    )}
                </div>
                
                <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                        Username
                    </label>
                    <input
                        id="username"
                        type="text"
                        name="username"
                        value={employee.username}
                        onChange={handleChange}
                        placeholder="Choose a username (min 5 characters)"
                        className={`w-full p-3 border ${
                            errors.username ? 'border-red-500' : 'border-gray-300'
                        } rounded-lg focus:outline-none focus:ring-2 ${
                            errors.username ? 'focus:ring-red-500' : 'focus:ring-blue-500'
                        }`}
                    />
                    {errors.username && (
                        <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                    )}
                </div>
                
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                        Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        name="password"
                        value={employee.password}
                        onChange={handleChange}
                        placeholder="Enter password (min 6 characters)"
                        className={`w-full p-3 border ${
                            errors.password ? 'border-red-500' : 'border-gray-300'
                        } rounded-lg focus:outline-none focus:ring-2 ${
                            errors.password ? 'focus:ring-red-500' : 'focus:ring-blue-500'
                        }`}
                    />
                    {errors.password && (
                        <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                    )}
                </div>
                
                <div className="flex justify-between gap-4 mt-6">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full ${
                            isSubmitting 
                                ? 'bg-blue-300 cursor-not-allowed' 
                                : 'bg-blue-500 hover:bg-blue-600'
                        } text-white py-3 px-4 rounded-lg transition duration-200`}
                    >
                        {isSubmitting ? 'Registering...' : 'Register Employee'}
                    </button>
                    
                    <button
                        type="button"
                        className="w-full bg-gray-400 text-white py-3 px-4 rounded-lg hover:bg-gray-500 transition duration-200"
                        onClick={() => {
                            setEmployee({
                                first_name: '',
                                last_name: '',
                                nic: '',
                                role: 'employee',
                                dob: '',
                                email: '',
                                username: '',
                                password: '',
                                phone_number: [],
                            });
                            setErrors({});
                            setMessage('');
                        }}
                    >
                        Cancel
                    </button>
                </div>
            </form>
            
            {message && (
                <div 
                    className={`mt-4 p-3 rounded-lg ${
                        message.includes('successfully') 
                            ? 'bg-green-100 text-green-700 border border-green-200' 
                            : 'bg-red-100 text-red-700 border border-red-200'
                    }`}
                >
                    <p className="text-center font-medium">{message}</p>
                </div>
            )}
        </div>
    );
};

export default EmployeeRegister;