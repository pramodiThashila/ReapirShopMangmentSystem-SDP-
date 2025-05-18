import React, { useState } from 'react';
import { Bell, User, X, Edit, LogOut } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import UserProfileDialog from './UserProfileDialog'; // Adjust the path as needed



interface NavbarProps {
  onToggleSidebar: () => void;
}

export default function Navbar({ onToggleSidebar }: NavbarProps) {
  const { user } = useUser();
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [employeeData, setEmployeeData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  const handleUserClick = async () => {
    if (!user?.employee_id) return;
    
    try {
      setIsLoading(true);
      setError('');
      const response = await axios.get(`http://localhost:5000/api/employees/${user.employee_id}`);
      setEmployeeData(response.data);
      setShowUserDialog(true);
    } catch (err) {
      console.error('Error fetching employee details:', err);
      setError('Failed to load employee details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditAccount = () => {
    setShowUserDialog(false);
    navigate('/edit-account');
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={onToggleSidebar}
            className="text-gray-500 hover:text-gray-600 focus:outline-none"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>
        <div className="flex items-center gap-4">
          {/* <button className="text-gray-500 hover:text-gray-600">
            <Bell size={20} />
          </button> */}
          <div 
            className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 rounded-full py-1 px-2 transition-colors"
            onClick={handleUserClick}
          >
            {/* Profile Picture with First Letter */}
            <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
              {user?.username?.charAt(0).toUpperCase() || <User size={20} />}
            </div>
            {/* Display Username */}
            <span className="text-sm font-medium text-gray-700">
              {user?.username || 'Guest'}
            </span>
          </div>
        </div>
      </div>

      {/* User Profile Dialog */}
      {showUserDialog && employeeData && (
        <UserProfileDialog 
          employee={employeeData} 
          onClose={() => setShowUserDialog(false)}
          onEdit={handleEditAccount}
        />
      )}
    </div>
  );
}