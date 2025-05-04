import { Link } from 'react-router-dom';
import { Box, ShoppingBag, FileText, AlertTriangle, TrendingUp, UserPlus, LogIn } from 'lucide-react';
import { useState } from 'react';

const SupplierHomePage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container py-16 md:py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Supplier Portal
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Manage your inventory, track orders, and grow your business with Bandu Electronics.
            </p>
            <div className="flex flex-wrap gap-4">
              {isLoggedIn ? (
                <>
                  <Link to="/supplier/dashboard" className="btn bg-white text-blue-700 hover:bg-gray-100">
                    Go to Dashboard
                  </Link>
                  <Link to="/supplier/inventory" className="btn bg-blue-700 text-white border border-blue-500 hover:bg-blue-800">
                    Manage Inventory
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/supplier/login" className="btn bg-white text-blue-700 hover:bg-gray-100">
                    <LogIn className="w-4 h-4 mr-2" />
                    Login
                  </Link>
                  <Link to="/supplier/register" className="btn bg-blue-700 text-white border border-blue-500 hover:bg-blue-800">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Supplier Portal Features</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Everything you need to effectively manage your supply chain and grow your business with us.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature Card 1 */}
            <div className="card p-6 transition hover:shadow-md">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Inventory Management</h3>
              <p className="text-gray-600">
                Track your inventory in real-time, update stock levels, and receive notifications for low stock items.
              </p>
              <Link to="/supplier/inventory" className="text-blue-600 hover:underline inline-flex items-center mt-4">
                Manage Inventory <span className="ml-1">→</span>
              </Link>
            </div>

            {/* Feature Card 2 */}
            <div className="card p-6 transition hover:shadow-md">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Stock Alerts</h3>
              <p className="text-gray-600">
                View and manage out-of-stock items, set automatic reordering thresholds, and prioritize replenishment.
              </p>
              <Link to="/supplier/out-of-stock" className="text-blue-600 hover:underline inline-flex items-center mt-4">
                View Out-of-Stock Items <span className="ml-1">→</span>
              </Link>
            </div>

            {/* Feature Card 3 */}
            <div className="card p-6 transition hover:shadow-md">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mb-4">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Quotations</h3>
              <p className="text-gray-600">
                Create and send professional quotations, track responses, and convert quotes to orders seamlessly.
              </p>
              <Link to="/supplier/quotations" className="text-blue-600 hover:underline inline-flex items-center mt-4">
                Manage Quotations <span className="ml-1">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Partner With Us?</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Join hundreds of suppliers already growing their business through our platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="text-4xl font-bold text-blue-600 mb-2">500+</div>
              <p className="text-gray-600">Electronic Repair Shops Served</p>
            </div>

            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="text-4xl font-bold text-blue-600 mb-2">₹10M+</div>
              <p className="text-gray-600">Monthly Orders Processed</p>
            </div>

            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="text-4xl font-bold text-blue-600 mb-2">24hrs</div>
              <p className="text-gray-600">Average Order Fulfillment Time</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions Section */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-3xl font-bold mb-8 text-center">Quick Actions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link to="/supplier/inventory" className="p-6 bg-blue-50 hover:bg-blue-100 rounded-lg text-center transition">
              <Box className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold">Manage Inventory</h3>
            </Link>
            
            <Link to="/supplier/out-of-stock" className="p-6 bg-red-50 hover:bg-red-100 rounded-lg text-center transition">
              <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-3" />
              <h3 className="font-semibold">Out-of-Stock Items</h3>
            </Link>
            
            <Link to="/supplier/quotations/new" className="p-6 bg-green-50 hover:bg-green-100 rounded-lg text-center transition">
              <FileText className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold">Send Quotation</h3>
            </Link>
            
            <Link to="/supplier/analytics" className="p-6 bg-purple-50 hover:bg-purple-100 rounded-lg text-center transition">
              <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold">View Analytics</h3>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-700 text-white">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to streamline your supply operations?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join our supplier network today and grow your business with simplified inventory management and efficient order processing.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link to="/supplier/register" className="btn bg-white text-blue-700 hover:bg-gray-100">
              Sign Up Now
            </Link>
            <Link to="/supplier/tour" className="btn bg-transparent border border-white text-white hover:bg-blue-800">
              Take a Tour
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default SupplierHomePage;