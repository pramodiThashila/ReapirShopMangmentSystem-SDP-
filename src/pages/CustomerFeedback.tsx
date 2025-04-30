import React, { useEffect, useState } from 'react';
import axios from 'axios';

const CustomerFeedback = () => {
  const [feedbacks, setFeedbacks] = useState<{
    job_id: string;
    product_name: string;
    customer_name: string;
    repair_description: string;
    product_image: string;
    employee_name: string;
    feedback: string;
    rating: number;
  }[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch feedback data
  const fetchFeedbacks = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/jobs/getallfeedbacks');
      setFeedbacks(response.data);
      setError(null); 
    } catch (err: any) {
      setError('Failed to fetch feedbacks. Please try again later.');
      console.error(err);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  // Star rating component
  const StarRating = ({ rating }: { rating: number }) => {
    if (!rating) return <span className="text-gray-500">No rating</span>;
    
    // Total stars to display
    const totalStars = 5;
    
    return (
      <div className="flex items-center">
        {[...Array(totalStars)].map((_, index) => {
          const starValue = index + 1;
          return (
            <svg 
              key={index} 
              className={`w-5 h-5 ${starValue <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
              fill="currentColor" 
              viewBox="0 0 20 20" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          );
        })}
        <span className="ml-2 text-gray-600">({rating})</span>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6 bg-gray-100 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Customer Feedbacks</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Job ID</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Product Name</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Customer Name</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Description</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Product Image</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Technician</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Feedback</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Rating</th>
            </tr>
          </thead>
          <tbody>
            {feedbacks.map((feedback) => (
              <tr key={feedback.job_id} className="border-t border-gray-200 hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-sm text-gray-700">{feedback.job_id}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{feedback.product_name}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{feedback.customer_name}</td>
                <td className="px-4 py-3 text-sm text-gray-700 max-w-xs truncate">{feedback.repair_description}</td>
                <td className="px-4 py-3">
                  <img
                    src={feedback.product_image}
                    alt="Product"
                    className="w-16 h-16 object-cover rounded-md border border-gray-200 shadow-sm"
                  />
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">{feedback.employee_name || 'Unassigned'}</td>
                <td className="px-4 py-3 text-sm text-gray-700 max-w-xs">
                  <div className="p-2 bg-gray-50 rounded border border-gray-200">
                    {feedback.feedback || 'No feedback provided'}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">
                  <StarRating rating={feedback.rating} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {feedbacks.length === 0 && !error && (
        <div className="text-center py-12 bg-white rounded-lg shadow border border-gray-200">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No feedbacks found</h3>
          <p className="mt-1 text-sm text-gray-500">There are no feedbacks available to display.</p>
        </div>
      )}
    </div>
  );
};

export default CustomerFeedback;