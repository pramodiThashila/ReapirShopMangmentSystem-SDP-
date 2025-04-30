import React from 'react';
import {
  LayoutDashboard,
  Users,
  UserCog,
  Wrench,
  Package,
  Truck,
  LogOut,
  FileText,
  ClipboardList,
  ShoppingCart,
  BarChart2,
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext'; // Import useUser hook

interface SidebarProps {
  isCollapsed: boolean;
}

const menuItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/employees', icon: UserCog, label: 'Employees', subItems: [
      { path: '/employees', label: 'View Employees' },
      { path: '/employees/register', label: 'Add Employee' },
    ],
  },
  { path: '/jobs/view', icon: Wrench, label: 'Jobs', subItems: [
      { path: '/jobAndCustomer/register', label: 'Register Job' },
      { path: '/jobs/view', label: 'View Jobs' },
      {path: '/jobs/myJobs', label: 'My Jobs'},
      
    ],
  },
  { path: '/warranty-eligible-jobs', icon: Wrench, label: 'Warrenty claims', subItems: [
    { path: '/jobAndCustomer/register', label: 'Register Job' },
    {path: '/warranty-eligible-jobs', label: 'Warrenty Eligible Jobs'},

  ],
},
  { path: '/customer/view', icon: Users, label: 'Customer Details', subItems: [
      { path: '/customer/view', label: 'View Customers' },
      { path: '/jobAndCustomer/register', label: 'Add Customer And Job' },
    ],
  },
  { path: '/inventory/view', icon: Package, label: 'Inventory', subItems: [
      { path: '/inventory/view', label: 'View Inventory' },
      {path: '/inventory-purchases', label: 'View Inventory Purchases'},
      { path: '/inventoryItem/add', label: 'Add New Inventory Item' },
      { path: '/inventoryItem/batch/add', label: 'Add New Batch' },
    ],
  },
  { path: '/invoices', icon: FileText, label: 'Invoice', subItems: [
     { path: '/invoices', label: 'View Invoice' },
      { path: '/finalInvoice', label: 'Create Invoice' },
      {path: '/advance-invoices', label: 'view advance invoice'},
      
    ],
  },
  { path: '/supplier/view', icon: Truck, label: 'Supplier Details', subItems: [
      { path: '/supplier/view', label: 'View Suppliers' },
      { path: '/supplier/register', label: 'Add Supplier' },
    ],
  },
  { path: '/customer-feedback', icon: BarChart2, label: 'Customer Feedback' },
  { path: '/reports', icon: BarChart2, label: 'Reports' },
];

export default function Sidebar({ isCollapsed }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate(); // Add navigate hook
  const { logout } = useUser(); // Get logout function from context

  // Handle logout click
  const handleLogout = () => {
    logout(); // Call logout function from context
    navigate('/'); // Redirect to login page
  };

  return (
    <div
      className={`bg-gray-900 text-white  ${
        isCollapsed ? 'w-0 overflow-hidden' : 'w-64'
      } min-h-screen flex-shrink-0 transition-all duration-300 `}
    >
      {!isCollapsed && (
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-8">Bandu Electricals</h1>
          <nav>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              return (
                <div key={item.path} className="mb-4">
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </Link>
                  {item.subItems && isActive && (
                    <div className="ml-8 mt-2">
                      {item.subItems.map((subItem) => (
                        <Link
                          key={subItem.path}
                          to={subItem.path}
                          className="block text-gray-400 hover:text-white mb-2"
                        >
                          {subItem.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            {/* Updated logout button with onClick handler */}
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 w-full mt-8"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}