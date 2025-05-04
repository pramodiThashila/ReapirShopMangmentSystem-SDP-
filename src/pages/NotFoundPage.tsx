import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="container min-h-[70vh] flex flex-col items-center justify-center py-12 text-center">
      <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">404</h1>
      <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-6">Page Not Found</h2>
      <p className="text-lg text-gray-600 mb-8 max-w-md">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link to="/" className="btn-primary">
        <Home className="mr-2 h-5 w-5" />
        Back to Home
      </Link>
    </div>
  );
};

export default NotFoundPage;