import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, Cpu, User, ChevronDown } from 'lucide-react';

interface HeaderProps {
  isScrolled: boolean;
}

const Header = ({ isScrolled }: HeaderProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isSupplier, setIsSupplier] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [supplierData, setSupplierData] = useState<any>(null);
  const location = useLocation();

  useEffect(() => {
    // Check if current path starts with /supplier to determine if supplier view
    const checkIfSupplier = () => {
      const supplierRoute = location.pathname.startsWith('/supplier');
      setIsSupplier(supplierRoute);
    };

    // Check if supplier is logged in
    const checkIfLoggedIn = () => {
      const loggedIn = localStorage.getItem('isSupplierLoggedIn') === 'true';
      setIsLoggedIn(loggedIn);
      
      if (loggedIn) {
        const data = localStorage.getItem('supplierData');
        if (data) {
          setSupplierData(JSON.parse(data));
        }
      }
    };

    checkIfSupplier();
    checkIfLoggedIn();
  }, [location.pathname]);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `block py-2 px-3 transition ${
      isActive
        ? isSupplier ? 'text-blue-600 font-medium' : 'text-primary-600 font-medium'
        : 'text-gray-700 hover:text-' + (isSupplier ? 'blue' : 'primary') + '-600'
    }`;

  const handleLogout = () => {
    localStorage.removeItem('supplierData');
    localStorage.removeItem('isSupplierLoggedIn');
    window.location.href = '/supplier/login';
  };

  // Generate initials from supplier name
  const getInitials = (name: string) => {
    if (!name) return 'S';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md' : 'bg-white shadow-sm'
      }`}
    >
      <div className="container py-4">
        <div className="flex items-center justify-between">
          {/* Logo - links to different home pages based on user type */}
          <Link 
            to={isSupplier ? "/supplier" : "/home"} 
            className="flex items-center space-x-2" 
            onClick={closeMenu}
          >
            <Cpu className={`w-8 h-8 ${isSupplier ? 'text-blue-600' : 'text-primary-600'}`} />
            <span className="text-xl font-bold">
              {isSupplier ? "Supplier Portal" : "Bandu Electronics"}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-1">
            {isSupplier ? (
              // Supplier Navigation Links
              <>
                <NavLink to="/supplier" className={navLinkClass} end>
                  Home
                </NavLink>
                <NavLink to="/supplier/quotation" className={navLinkClass}>
                  Submit Quote
                </NavLink>
                <NavLink to="/supplier/out-of-stock" className={navLinkClass}>
                  Out of Stock
                </NavLink>
                {isLoggedIn && (
                  <div className="relative group">
                    <button className="flex items-center py-2 px-3 text-gray-700 hover:text-blue-600 rounded-full">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium mr-2">
                          {supplierData?.supplier_name ? getInitials(supplierData.supplier_name) : 'S'}
                        </div>
                        <span className="text-sm font-medium hidden lg:block">
                          {supplierData?.supplier_name || 'Supplier'}
                        </span>
                        <ChevronDown className="w-4 h-4 ml-1" />
                      </div>
                    </button>
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 hidden group-hover:block border border-gray-200">
                      <div className="px-4 py-3 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900">
                          {supplierData?.supplier_name || 'Supplier'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {supplierData?.email || ''}
                        </p>
                      </div>
                      <Link 
                        to="/supplier/profile" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Settings
                      </Link>
                      <Link 
                        to="/supplier/quotations" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        dashboard
                      </Link>
                      <button 
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
                {!isLoggedIn && (
                  <NavLink to="/supplier/login" className={navLinkClass}>
                    Login
                  </NavLink>
                )}
              </>
            ) : (
              // Customer Navigation Links
              <>
                <NavLink to="/home" className={navLinkClass} end>
                  Home
                </NavLink>
                <NavLink to="/job-status" className={navLinkClass}>
                  Check Status
                </NavLink>
                <NavLink to="/feedback" className={navLinkClass}>
                  Feedback
                </NavLink>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700 focus:outline-none"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {menuOpen && (
          <nav className="md:hidden py-4 space-y-2 border-t mt-4">
            {isSupplier ? (
              // Mobile Supplier Navigation
              <>
                {isLoggedIn && (
                  <div className="flex items-center py-2 px-3 mb-2 border-b border-gray-200 pb-4">
                    <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium mr-3">
                      {supplierData?.supplier_name ? getInitials(supplierData.supplier_name) : 'S'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{supplierData?.supplier_name || 'Supplier'}</p>
                      <p className="text-xs text-gray-500">{supplierData?.email || ''}</p>
                    </div>
                  </div>
                )}
                <NavLink to="/supplier" className={navLinkClass} onClick={closeMenu} end>
                  Home
                </NavLink>
                <NavLink to="/supplier/quotation" className={navLinkClass} onClick={closeMenu}>
                  Submit Quote
                </NavLink>
                <NavLink to="/supplier/out-of-stock" className={navLinkClass} onClick={closeMenu}>
                  Out of Stock
                </NavLink>
                {isLoggedIn ? (
                  <>
                    <NavLink to="/supplier/profile" className={navLinkClass} onClick={closeMenu}>
                      Profile
                    </NavLink>
                    <NavLink to="/supplier/settings" className={navLinkClass} onClick={closeMenu}>
                      Settings
                    </NavLink>
                    <button 
                      onClick={() => {
                        handleLogout();
                        closeMenu();
                      }}
                      className="block w-full text-left py-2 px-3 text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <NavLink to="/supplier/login" className={navLinkClass} onClick={closeMenu}>
                    Login
                  </NavLink>
                )}
              </>
            ) : (
              // Mobile Customer Navigation
              <>
                <NavLink to="/home" className={navLinkClass} onClick={closeMenu} end>
                  Home
                </NavLink>
                <NavLink to="/job-status" className={navLinkClass} onClick={closeMenu}>
                  Check Status
                </NavLink>
                <NavLink to="/feedback" className={navLinkClass} onClick={closeMenu}>
                  Feedback
                </NavLink>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;