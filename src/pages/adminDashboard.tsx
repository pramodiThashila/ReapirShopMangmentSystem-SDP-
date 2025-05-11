import React, { useState, useEffect } from 'react';
import { Users, Wrench, Package, UserCog, Banknote, Wallet, Settings, PlusCircle, FileText, AlertTriangle } from 'lucide-react';
import DashboardCard from '../components/DashboardCard';
import { useUser } from '../context/UserContext';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

interface DashboardData {
  totalJobsRegistered: number;
  totalJobsCompleted: number;
  totalIncome: number;
  totalInventoryPurchases: {
    count: number;
    amount: number;
  };
  outOfStockProducts: number;
  employeeCount: number;
  activeRepairs: number;
  myIncompleteJobs: number;
  pendingJobs: number;
  completedJobs: number;
  cancelledJobs: number;
  onProgressJobs: number;
}

export default function Dashboard() {
  const { user } = useUser();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (!user?.employee_id) return;
        
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/dashboard/admin-dashboard/${user.employee_id}`);
        
        // Process API response to match our interface
        const data = response.data;
        
        // Extract values correctly from the nested structure
        setDashboardData({
          totalJobsRegistered: data.totalJobsRegistered?.[0]?.totalJobsRegistered || 0,
          totalJobsCompleted: data.totalJobsCompleted?.[0]?.totalJobsCompleted || 0,
          totalIncome: parseFloat(data.totalIncome?.[0]?.totalIncome || "0"),
          totalInventoryPurchases: {
            count: data.totalInventoryPurchases?.count?.[0]?.totalPurchases || 0,
            amount: parseFloat(data.totalInventoryPurchases?.amount?.[0]?.totalPurchaseAmount || "0"),
          },
          outOfStockProducts: data.outOfStockProducts?.[0]?.outOfStockCount || 0,
          employeeCount: data.employeeCount?.[0]?.employeeCount || 0,
          activeRepairs: data.activeRepairs?.[0]?.activeRepairs || 0,
          myIncompleteJobs: data.myIncompleteJobs?.[0]?.myIncompleteJobs || 0,
          pendingJobs: data.pendingJobs?.[0]?.pendingJobs || 0,
          completedJobs: data.completedJobs?.[0]?.completedJobs || 0,
          cancelledJobs: data.cancelledJobs?.[0]?.cancelledJobs || 0,
          onProgressJobs: data.onProgressJobs?.[0]?.onProgressJobs || 0,
        });
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?.employee_id]);

  // Prepare chart data
  const chartData = {
    labels: ['Pending Jobs', 'Completed Jobs', 'Cancelled Jobs', 'In Progress Jobs'],
    datasets: [
      {
        data: [
          dashboardData?.pendingJobs || 0,
          dashboardData?.completedJobs || 0,
          dashboardData?.cancelledJobs || 0,
          dashboardData?.onProgressJobs || 0,
        ],
        backgroundColor: ['#FCD34D', '#34D399', '#F87171', '#60A5FA'],
        borderColor: ['#F59E0B', '#10B981', '#EF4444', '#3B82F6'],
        borderWidth: 1,
      },
    ],
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          font: {
            size: 14,
          },
          padding: 20,
        },
      },
      tooltip: {
        bodyFont: {
          size: 14,
        },
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
  };

  // Dashboard cards data
  const getStats = () => [
    {
      title: 'Jobs Registered This Month',
      value: dashboardData?.totalJobsRegistered || 0,
      icon: Package,
      color: 'bg-blue-600',
      link: '/jobs/view', // You'll add this link manually
    },
    {
      title: 'This Month’s Job Handovers',
      value: dashboardData?.totalJobsCompleted || 0,
      icon: Wrench,
      color: 'bg-green-600',
      //link: '/completed-jobs',
    },
    {
      title: 'Monthly Income',
      value: `Rs.${(dashboardData?.totalIncome || 0).toLocaleString()}`,
      icon: Wallet,
      color: 'bg-emerald-600',
      link: '/income-report',
      isMonetary: true,
    },
    {
      title: 'Stock Purchases This Month',
      value: `${dashboardData?.totalInventoryPurchases.count || 0} (Rs.${(dashboardData?.totalInventoryPurchases.amount || 0).toLocaleString()})`,
      icon: Package,
      color: 'bg-purple-600',
      link: '/inventory-purchases',
      subtext: `Rs.${(dashboardData?.totalInventoryPurchases.amount || 0).toLocaleString()}`,
    },
    {
      title: 'Out of Stock Items',
      value: dashboardData?.outOfStockProducts || 0,
      icon: AlertTriangle,
      color: 'bg-red-600',
      link: '/inventory/view',
    },
    {
      title: 'Employees',
      value: dashboardData?.employeeCount || 0,
      icon: Users,
      color: 'bg-orange-600',
      link: '/employees',
    },
    {
      title: 'Active Repairs',
      value: dashboardData?.activeRepairs || 0,
      icon: Settings,
      color: 'bg-yellow-600',
      link: '/jobs/view',
    },
    {
      title: 'My Assigned Jobs',
      value: dashboardData?.myIncompleteJobs || 0,
      icon: UserCog,
      color: 'bg-pink-600',
      link: '/jobs/myJobs',
    },
  ];

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-medium">{error}</p>
          <button 
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const stats = getStats();

  return (
    <div className="p-6 bg-gray-50">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-2xl font-semibold text-gray-800">Dashboard Overview</h1>
        
        {/* Quick Action Buttons */}
        <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
          <Link to="/jobAndCustomer/register" className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow transition-colors">
            <PlusCircle className="w-5 h-5 mr-2" />
            Register Job
          </Link>
          <Link to="/finalInvoice" className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow transition-colors">
            <FileText className="w-5 h-5 mr-2" />
            Create Invoice
          </Link>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Link key={index} to={stat.link || "#"} className="transform transition-transform hover:scale-105">
            <DashboardCard 
              title={stat.title} 
              value={stat.value} 
              icon={stat.icon} 
              color={stat.color} 
              isMonetary={stat.isMonetary}
            />
          </Link>
        ))}
      </div>
      
      {/* Repair Status Pie Chart */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-6">This year Shop Perfomence</h2>
        <div className="h-[400px] flex items-center justify-center">
          <div className="w-full max-w-2xl h-full">
            <Pie data={chartData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}