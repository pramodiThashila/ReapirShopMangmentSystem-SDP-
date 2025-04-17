import React from 'react';
import { Bell, User } from 'lucide-react';
import { useUser } from '../context/UserContext'; // Import the UserContext

interface NavbarProps {
  onToggleSidebar: () => void;
}

export default function Navbar({ onToggleSidebar }: NavbarProps) {
  const { user } = useUser(); // Access the logged-in user details

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
          <button className="text-gray-500 hover:text-gray-600">
            <Bell size={20} />
          </button>
          <div className="flex items-center gap-2">
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
    </div>
  );
}