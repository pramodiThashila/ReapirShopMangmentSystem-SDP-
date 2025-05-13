import React, { useState } from 'react';
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
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext'; // Import useUser hook

interface SidebarProps {
  isCollapsed: boolean;
}

import { LucideIcon } from 'lucide-react'; // Ensure this import exists

interface MenuItem {
  path: string;
  icon: LucideIcon;
  label: string;
  roles?: string[];
  subItems?: { path: string; label: string; roles?: string[] }[];
}

const menuItems: MenuItem[] = [
  { path: '/dashboard',
    icon: LayoutDashboard, 
    label: 'Dashboard',
    roles: ['owner'] },

  { path: '/employees', icon: UserCog, label: 'Employees',roles: ['owner'], subItems: [
      { path: '/employees', label: 'View Employees',roles: ['owner'] },
      { path: '/employees/register', label: 'Add Employee',roles: ['employee','owner'] },
    ],
  },
  { path: '/jobs/view', icon: Wrench, label: 'Jobs',roles: ['employee','owner'], subItems: [
      { path: '/jobAndCustomer/register', label: 'Register Job' ,roles: ['owner']},
      { path: '/jobs/view', label: 'View Jobs',roles: ['owner'] },
      {path: '/jobs/myJobs', label: 'My Jobs',roles: ['employee','owner']},
    ],
  },
  { path: '/warranty-eligible-jobs', icon: Wrench, label: 'Warranty Claims',roles: ['owner'], subItems: [
    {path: '/warranty-eligible-jobs', label: 'Warranty Eligible Jobs',roles: ['owner']},
  ],
  },
  { path: '/customer/view', icon: Users, label: 'Customer Details',roles: ['employee','owner'], subItems: [
      { path: '/customer/view', label: 'View Customers' ,roles: ['employee','owner']},
      { path: '/jobAndCustomer/register', label: 'Add Customer And Job',roles: ['owner'] },
    ],
  },
  { path: '/inventory/view', icon: Package, label: 'Inventory',roles: ['employee','owner'], subItems: [
      { path: '/inventory/view', label: 'View Inventory',roles: ['employee','owner'] },
      {path: '/inventory-purchases', label: 'View Inventory Purchases',roles: ['owner']},
      { path: '/inventoryItem/add', label: 'Add New Inventory Item'  ,roles: ['owner']},
      { path: '/inventoryItem/batch/add', label: 'Add New Batch' ,roles: ['owner']},
      { path: '/inventory-orders', label: 'View Inventory Orders' ,roles: ['owner']},
    ],
  },
  { path: '/invoices', icon: FileText, label: 'Invoice',roles: ['employee','owner'], subItems: [
     { path: '/invoices', label: 'View Invoice' ,roles: ['employee','owner']},
      { path: '/finalInvoice', label: 'Create Invoice',roles: ['owner'] },
      {path: '/advance-invoices', label: 'View Advance Invoice',roles: ['employee','owner']},
    ],
  },
  { path: '/supplier/view', icon: Truck, label: 'Supplier Details',roles: ['owner'], subItems: [
      { path: '/supplier/view', label: 'View Suppliers',roles: ['owner'] },
      { path: '/supplier/register', label: 'Add Supplier',roles: ['owner'] },
    ],
  },
  { path: '/customer-feedback', icon: BarChart2, label: 'Customer Feedback',roles: ['owner'] },
  { path: '/reports', icon: BarChart2, label: 'Reports' ,roles: ['owner']},
];

export default function Sidebar({ isCollapsed }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useUser(); // Get user info from context
  const [expandedItems, setExpandedItems] = useState<{ [key: string]: boolean }>({});

  const userRole = user?.role || 'guest'; // Default to 'guest' if no role is found

  // Filter menu items based on the user's role
  const filteredMenuItems = menuItems.filter(item => 
    item.roles?.includes(userRole)
  ).map(item => ({
    ...item,
    subItems: item.subItems?.filter(subItem => subItem.roles?.includes(userRole))
  }));

  // Handle logout click
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Toggle menu item expansion
  const toggleExpand = (path: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };

  // Check if a menu item should be expanded
  const isExpanded = (item: MenuItem) => {
    if (location.pathname.startsWith(item.path)) {
      return true;
    }
    return !!expandedItems[item.path];
  };

  return (
    <aside
      className={`bg-gray-900 text-white ${
        isCollapsed ? 'w-0 overflow-hidden' : 'w-64'
      } fixed h-screen transition-all duration-300 shadow-lg z-10`}
    >
      {!isCollapsed && (
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-800">
            <h1 className="text-2xl font-bold text-blue-400">Bandu Electricals</h1>
          </div>
          
          <div className="overflow-y-auto flex-grow p-4 custom-scrollbar">
            <nav>
              {filteredMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname.startsWith(item.path);
                const hasSubItems = item.subItems && item.subItems.length > 0;
                const isItemExpanded = isExpanded(item);
                
                return (
                  <div key={item.path} className="mb-2">
                    <div 
                      className={`flex items-center justify-between gap-3 px-4 py-2 rounded-lg transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-300 hover:bg-gray-800'
                      }`}
                      onClick={() => hasSubItems ? toggleExpand(item.path) : navigate(item.path)}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={18} className={`${isActive ? 'text-white' : 'text-gray-400'}`} />
                        <span className="text-sm font-medium">{item.label}</span>
                      </div>
                      {hasSubItems && (
                        <span className="text-gray-400">
                          {isItemExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </span>
                      )}
                    </div>
                    
                    {hasSubItems && isItemExpanded && (
                      <div className="ml-7 mt-1 pl-4 border-l border-gray-700 space-y-1">
                        {item.subItems!.map((subItem) => {
                          const isSubActive = location.pathname === subItem.path;
                          
                          return (
                            <Link
                              key={subItem.path}
                              to={subItem.path}
                              className={`block py-1.5 px-2 text-xs rounded transition-colors ${
                                isSubActive 
                                  ? 'bg-blue-700/30 text-blue-300' 
                                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                              }`}
                            >
                              {subItem.label}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>
          
          <div className="mt-auto p-4 border-t border-gray-800">
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-300 hover:bg-red-800/30 hover:text-red-300 transition-colors w-full"
            >
              <LogOut size={18} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}