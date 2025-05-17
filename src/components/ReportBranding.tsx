import React from 'react';
import { format } from 'date-fns';
import { useUser } from '../context/UserContext';


interface ReportBrandingProps {
  title: string;
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  showBranding?: boolean;
}

const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return format(date, 'MMM dd, yyyy');
  } catch (e) {
    return 'Invalid date';
  }
};

const ReportBranding: React.FC<ReportBrandingProps> = ({ 
  title, 
  dateRange, 
  showBranding = true
}) => {
  const { user } = useUser();
  const currentDate = new Date();
  
  return (
    <div className={`mb-8 ${showBranding ? '' : 'print:block hidden'}`}>
      <div className="flex justify-between items-center border-b border-gray-300 pb-4">
        <div className="flex items-center">
          <div className="mr-4">
            {/* <img 
              src={Logo} 
              alt="Bandu Electricals" 
              className="h-16 w-auto" 
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            /> */}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-blue-800">Bandu Electricals</h1>
            <p className="text-gray-600">123 Main Street, Colombo, Sri Lanka</p>
            <p className="text-gray-600">Tel: (94) 11-123-4567 • Email: info@bandu.com</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          <p className="text-gray-600">Generated: {format(currentDate, 'PPpp')}</p>
          <p className="text-gray-600">By: {user?.username || 'System User'}</p>
          {dateRange && (
            <p className="text-gray-600 mt-1">
              Period: {formatDate(dateRange.startDate)} - {formatDate(dateRange.endDate)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportBranding;