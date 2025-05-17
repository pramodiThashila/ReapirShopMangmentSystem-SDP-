import { Link } from 'react-router-dom';
import { Users, Briefcase, ArrowRight } from 'lucide-react';
import { useState } from 'react';

const LandingPage = () => {
  const [hoveredCustomer, setHoveredCustomer] = useState(false);
  const [hoveredSupplier, setHoveredSupplier] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm py-4">
        <div className="container flex justify-between items-center">
          <div className="flex items-center">
            {/* Replace placeholder with simple text logo */}
            <div className="h-10 w-10 bg-primary-600 text-white flex items-center justify-center rounded-md font-bold">
              BE
            </div>
            <span className="ml-2 text-xl font-bold text-gray-800">Bandu Electronics</span>
          </div>
          <div className="flex gap-4">
            {/* <Link to="/about" className="text-gray-600 hover:text-primary-600">About</Link>
            <Link to="/contact" className="text-gray-600 hover:text-primary-600">Contact</Link> */}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center p-6 bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="text-center mb-12 max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">Welcome to Bandu Electronics</h1>
          <p className="text-xl text-gray-600">
            Please select how you'd like to proceed with our services
          </p>
        </div>

        <div className="container grid md:grid-cols-2 gap-8 max-w-5xl">
          {/* Customer Card */}
          <Link 
            to="/home" 
            className={`relative overflow-hidden bg-white rounded-xl shadow-lg transition-all duration-300 ${
              hoveredCustomer ? 'shadow-xl transform -translate-y-1' : ''
            }`}
            onMouseEnter={() => setHoveredCustomer(true)}
            onMouseLeave={() => setHoveredCustomer(false)}
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 to-primary-700"></div>
            <div className="p-8 md:p-10">
              <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mb-6">
                <Users className="w-8 h-8 text-primary-600" />
              </div>
              <h2 className="text-2xl font-bold mb-3 text-gray-900">Customer Portal</h2>
              <p className="text-gray-600 mb-6">
                Access repair services, check job status, track orders, and submit feedback.
              </p>
              <ul className="mb-8 space-y-2">
                <li className="flex items-center text-gray-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-500 mr-2"></div>
                  Electronics repair services
                </li>
                <li className="flex items-center text-gray-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-500 mr-2"></div>
                  Track repair status
                </li>
                <li className="flex items-center text-gray-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-500 mr-2"></div>
                  Submit feedback
                </li>
              </ul>
              <div className="flex justify-between items-center">
                <span className="text-primary-600 font-medium">Continue as Customer</span>
                <ArrowRight className={`w-5 h-5 text-primary-600 transition-transform duration-300 ${
                  hoveredCustomer ? 'transform translate-x-1' : ''
                }`} />
              </div>
            </div>
          </Link>

          {/* Supplier Card */}
          <Link 
            to="/supplier" 
            className={`relative overflow-hidden bg-white rounded-xl shadow-lg transition-all duration-300 ${
              hoveredSupplier ? 'shadow-xl transform -translate-y-1' : ''
            }`}
            onMouseEnter={() => setHoveredSupplier(true)}
            onMouseLeave={() => setHoveredSupplier(false)}
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-700"></div>
            <div className="p-8 md:p-10">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-6">
                <Briefcase className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold mb-3 text-gray-900">Supplier Portal</h2>
              <p className="text-gray-600 mb-6">
                Manage inventory, track orders, and send quotations to grow your business.
              </p>
              <ul className="mb-8 space-y-2">
                <li className="flex items-center text-gray-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2"></div>
                  Inventory management
                </li>
                <li className="flex items-center text-gray-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2"></div>
                  Out-of-stock alerts
                </li>
                <li className="flex items-center text-gray-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2"></div>
                  Send quotations
                </li>
              </ul>
              <div className="flex justify-between items-center">
                <span className="text-blue-600 font-medium">Continue as Supplier</span>
                <ArrowRight className={`w-5 h-5 text-blue-600 transition-transform duration-300 ${
                  hoveredSupplier ? 'transform translate-x-1' : ''
                }`} />
              </div>
            </div>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 py-8">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center">
            {/* <div className="mb-4 md:mb-0">
              <p>&copy; {new Date().getFullYear()} Bandu Electronics. All rights reserved.</p>
            </div>
            <div className="flex gap-6">
              <Link to="/privacy" className="hover:text-white">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-white">Terms of Service</Link>
              <Link to="/contact" className="hover:text-white">Contact</Link>
            </div> */}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;