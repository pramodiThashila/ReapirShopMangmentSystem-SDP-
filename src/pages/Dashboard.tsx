import React from 'react';
import { Users, Wrench, Package, UserCog } from 'lucide-react';
import DashboardCard from '../components/DashboardCard';

export default function Dashboard() {
  const stats = [
    {
      title: 'Total Customers',
      value: 256,
      icon: Users,
      color: 'bg-blue-600',
    },
    {
      title: 'Active Repairs',
      value: 42,
      icon: Wrench,
      color: 'bg-green-600',
    },
    {
      title: 'Total Inventory',
      value: 89,
      icon: Package,
      color: 'bg-purple-600',
    },
    {
      title: 'Employees',
      value: 15,
      icon: UserCog,
      color: 'bg-orange-600',
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <DashboardCard key={index} {...stat} />
        ))}
      </div>
      
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Recent Repair Jobs
          </h2>
          {/*recent repairs list  */}
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Low Stock Products
          </h2>
          {/* low stock products list  */}
        </div>
      </div>
    </div>
  );
}