import React from 'react';
import { X, Edit, Mail, Phone, User, Calendar, Key, UserCheck } from 'lucide-react';
import moment from 'moment';

interface EmployeeData {
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string[];
  nic: string;
  role: string;
  username: string;
  dob: string;
}

interface UserProfileDialogProps {
  employee: EmployeeData;
  onClose: () => void;
  onEdit: () => void;
}

const UserProfileDialog: React.FC<UserProfileDialogProps> = ({ employee, onClose, onEdit }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Account Details</h2>
          <button onClick={onClose} className="text-white hover:text-gray-200 focus:outline-none">
            <X size={20} />
          </button>
        </div>

        {/* Profile section */}
        <div className="flex items-center gap-4 px-6 pt-6 pb-2">
          <div className="w-16 h-16 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-2xl">
            {employee.first_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-xl font-semibold">{`${employee.first_name} ${employee.last_name}`}</h3>
            <p className="text-gray-500 flex items-center gap-1">
              <UserCheck size={16} />
              <span className="capitalize">{employee.role}</span>
            </p>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* User details */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <User className="text-gray-400" size={16} />
              <div>
                <p className="text-sm text-gray-500">Username</p>
                <p className="font-medium">{employee.username}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Mail className="text-gray-400" size={16} />
              <div>
                <p className="text-sm text-gray-500">Email Address</p>
                <p className="font-medium">{employee.email}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Phone className="text-gray-400" size={16} />
              <div>
                <p className="text-sm text-gray-500">Phone Number(s)</p>
                {employee.phone_number.map((phone, index) => (
                  <p key={index} className="font-medium">{phone}</p>
                ))}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Calendar className="text-gray-400" size={16} />
              <div>
                <p className="text-sm text-gray-500">Date of Birth</p>
                <p className="font-medium">{moment(employee.dob).format('MMMM DD, YYYY')}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Key className="text-gray-400" size={16} />
              <div>
                <p className="text-sm text-gray-500">NIC</p>
                <p className="font-medium">{employee.nic}</p>
              </div>
            </div>
          </div>
          
          {/* Edit button */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <button 
              onClick={onEdit}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center justify-center gap-2 transition-colors"
            >
              <Edit size={16} />
              Edit Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileDialog;