import { Link } from 'react-router-dom';
import { Cpu, Mail, Phone, MapPin, Facebook, Twitter, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <Cpu className="w-6 h-6 text-primary-500" />
              <span className="text-xl font-bold text-white">Bandu Electronics</span>
            </Link>
            <p className="mb-4 text-gray-400">
              Your trusted partner for electronic repairs and services since 2010.
              We specialize in fast, reliable repairs with genuine parts.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-primary-500 transition" aria-label="Facebook">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-500 transition" aria-label="Twitter">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-500 transition" aria-label="Instagram">
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
            <nav className="flex flex-col space-y-2">
              <Link to="/" className="text-gray-400 hover:text-primary-500 transition">Home</Link>
              <Link to="/job-status" className="text-gray-400 hover:text-primary-500 transition">Check Job Status</Link>
              <Link to="/feedback" className="text-gray-400 hover:text-primary-500 transition">Submit Feedback</Link>
              <Link to="/supplier/quotation" className="text-gray-400 hover:text-primary-500 transition">Submit Quotation</Link>
              <Link to="/supplier/out-of-stock" className="text-gray-400 hover:text-primary-500 transition">Out of Stock Products</Link>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Contact Us</h3>
            <div className="space-y-3">
              <p className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                <span>123 Tech Street, Electronics District, City, 12345</span>
              </p>
              <p className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-primary-500 flex-shrink-0" />
                <span>(123) 456-7890</span>
              </p>
              <p className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-primary-500 flex-shrink-0" />
                <span>info@banduelectronics.com</span>
              </p>
            </div>
          </div>
        </div>

        <div className="pt-8 mt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Bandu Electronics. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;