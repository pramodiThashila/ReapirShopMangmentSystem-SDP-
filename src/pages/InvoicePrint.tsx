// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import logo from '../assets/logo.png'; // Add your company logo to assets folder

// interface Invoice {
//   Invoice_Id: number;
//   job_id: number;
//   repair_description: string;
//   repair_status: string;
//   customer_id: number;
//   customer_name: string;
//   customer_email: string;
//   employee_id: string;
//   employee_name: string;
//   employee_role: string;
//   product_id: number;
//   product_name: string;
//   model: string;
//   model_no: string;
//   product_image: string | null;
//   TotalCost_for_Parts: number;
//   Labour_Cost: number;
//   Total_Amount: number;
//   warranty: string;
//   warranty_exp_date: string | null;
//   invoice_date: string;
//   Created_By: string;
//   AdvanceInvoice_Id: number | null;
//   advance_payment: number;
//   balance_due: number;
//   warranty_status: string;
// }

// const InvoicePrint: React.FC = () => {
//   const { id } = useParams<{ id: string }>();
//   const navigate = useNavigate();
//   const [invoice, setInvoice] = useState<Invoice | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);

//   // Helper function for formatting currency
//   const formatCurrency = (value: any): string => {
//     if (value === null || value === undefined) return "0.00";
//     const numValue = parseFloat(value);
//     return isNaN(numValue) ? "0.00" : numValue.toFixed(2);
//   };

//   // Auto-print when page loads
//   useEffect(() => {
//     if (invoice && !loading && !error) {
//       // Short delay to ensure everything is rendered
//       const timer = setTimeout(() => {
//         window.print();
//       }, 500);
//       return () => clearTimeout(timer);
//     }
//   }, [invoice, loading, error]);

//   useEffect(() => {
//     const fetchInvoiceDetails = async () => {
//       try {
//         setLoading(true);
//         const response = await axios.get('http://localhost:5000/api/invoice/all');
        
//         // Find the specific invoice by ID
//         const foundInvoice = response.data.invoices.find(
//           (inv: any) => inv.Invoice_Id === parseInt(id || '0')
//         );
        
//         if (foundInvoice) {
//           // Process numeric fields
//           const processedInvoice = {
//             ...foundInvoice,
//             Total_Amount: parseFloat(foundInvoice.Total_Amount) || 0,
//             TotalCost_for_Parts: parseFloat(foundInvoice.TotalCost_for_Parts) || 0,
//             Labour_Cost: parseFloat(foundInvoice.Labour_Cost) || 0,
//             advance_payment: parseFloat(foundInvoice.advance_payment || 0) || 0,
//             balance_due: parseFloat(foundInvoice.balance_due || 0) || 0
//           };
          
//           setInvoice(processedInvoice);
//         } else {
//           setError('Invoice not found');
//         }
//       } catch (err: any) {
//         setError(err.response?.data?.error || 'Failed to fetch invoice details');
//         console.error('Error fetching invoice:', err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (id) {
//       fetchInvoiceDetails();
//     }
//   }, [id]);

//   // Format date string
//   const formatDate = (dateString: string) => {
//     const options: Intl.DateTimeFormatOptions = {
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric'
//     };
//     return new Date(dateString).toLocaleDateString(undefined, options);
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center min-h-screen print:hidden">
//         <div className="animate-pulse flex flex-col items-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-3"></div>
//           <p className="text-gray-600">Preparing invoice for printing...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="max-w-4xl mx-auto mt-8 p-6 bg-red-50 border border-red-200 rounded-lg print:hidden">
//         <h2 className="text-xl font-bold text-red-700 mb-4">Error</h2>
//         <p className="text-red-600">{error}</p>
//         <button 
//           onClick={() => navigate('/invoices')}
//           className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//         >
//           Back to Invoices
//         </button>
//       </div>
//     );
//   }

//   if (!invoice) {
//     return (
//       <div className="max-w-4xl mx-auto mt-8 p-6 bg-gray-50 border border-gray-200 rounded-lg print:hidden">
//         <h2 className="text-xl font-bold text-gray-700 mb-4">Invoice Not Found</h2>
//         <p className="text-gray-600">The requested invoice could not be found.</p>
//         <button 
//           onClick={() => navigate('/invoices')}
//           className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//         >
//           Back to Invoices
//         </button>
//       </div>
//     );
//   }

//   return (
//     <>
//       {/* Print Controls - Only visible on screen */}
//       <div className="max-w-4xl mx-auto mt-8 mb-8 flex justify-between items-center print:hidden">
//         <button 
//           onClick={() => navigate('/invoices')}
//           className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
//         >
//           Back to Invoices
//         </button>
//         <button 
//           onClick={() => window.print()}
//           className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//         >
//           Print Invoice
//         </button>
//       </div>

//       {/* Invoice Document - Optimized for printing */}
//       <div className="max-w-4xl mx-auto bg-white mb-8 p-8 shadow-lg rounded-lg print:shadow-none print:p-0 print:max-w-none">
//         {/* Header */}
//         <div className="flex justify-between items-start mb-8">
//           <div className="flex items-center">
//             <img src={logo} alt="Company Logo" className="h-16 mr-4" />
//             <div>
//               <h1 className="text-2xl font-bold text-gray-800">TechFix Solutions</h1>
//               <p className="text-gray-600">123 Repair Street, Tech City</p>
//               <p className="text-gray-600">Phone: (123) 456-7890</p>
//               <p className="text-gray-600">Email: support@techfix.com</p>
//             </div>
//           </div>
//           <div className="text-right">
//             <h2 className="text-2xl font-bold text-blue-700">INVOICE</h2>
//             <p className="text-lg font-semibold text-gray-700 mt-1">#{invoice.Invoice_Id}</p>
//             <p className="text-gray-600 mt-1">Date: {formatDate(invoice.invoice_date)}</p>
//             <p className="text-gray-600">Job ID: {invoice.job_id}</p>
//           </div>
//         </div>

//         {/* Divider */}
//         <hr className="border-gray-300 my-6" />

//         {/* Customer and Employee Info */}
//         <div className="grid grid-cols-2 gap-6 mb-8">
//           <div>
//             <h3 className="text-lg font-semibold text-gray-800 mb-3">Bill To:</h3>
//             <p className="font-medium text-gray-800">{invoice.customer_name}</p>
//             <p className="text-gray-700">{invoice.customer_email}</p>
//             <p className="text-gray-700">Customer ID: {invoice.customer_id}</p>
//           </div>
//           <div>
//             <h3 className="text-lg font-semibold text-gray-800 mb-3">Service Details:</h3>
//             <p className="text-gray-700"><span className="font-medium">Technician:</span> {invoice.employee_name}</p>
//             <p className="text-gray-700"><span className="font-medium">Role:</span> {invoice.employee_role}</p>
//             <p className="text-gray-700"><span className="font-medium">Status:</span> {invoice.repair_status}</p>
//           </div>
//         </div>

//         {/* Product Details */}
//         <div className="mb-8">
//           <h3 className="text-lg font-semibold text-gray-800 mb-3">Product Information</h3>
//           <div className="bg-gray-50 p-4 rounded-lg">
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <p className="text-gray-700"><span className="font-medium">Product:</span> {invoice.product_name}</p>
//                 <p className="text-gray-700"><span className="font-medium">Model:</span> {invoice.model}</p>
//                 <p className="text-gray-700"><span className="font-medium">Model No:</span> {invoice.model_no}</p>
//               </div>
//               <div>
//                 <p className="text-gray-700"><span className="font-medium">Repair Description:</span></p>
//                 <p className="text-gray-700 mt-1">{invoice.repair_description}</p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Invoice Table */}
//         <div className="mb-8">
//           <h3 className="text-lg font-semibold text-gray-800 mb-3">Invoice Summary</h3>
//           <table className="min-w-full bg-white border border-gray-200">
//             <thead>
//               <tr className="bg-gray-100">
//                 <th className="py-3 px-4 text-left font-semibold text-gray-700">Description</th>
//                 <th className="py-3 px-4 text-right font-semibold text-gray-700">Amount</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200">
//               <tr>
//                 <td className="py-3 px-4 text-gray-700">Parts Cost</td>
//                 <td className="py-3 px-4 text-right text-gray-700">${formatCurrency(invoice.TotalCost_for_Parts)}</td>
//               </tr>
//               <tr>
//                 <td className="py-3 px-4 text-gray-700">Labour Cost</td>
//                 <td className="py-3 px-4 text-right text-gray-700">${formatCurrency(invoice.Labour_Cost)}</td>
//               </tr>
//               {invoice.AdvanceInvoice_Id && (
//                 <tr>
//                   <td className="py-3 px-4 text-gray-700">Advance Payment</td>
//                   <td className="py-3 px-4 text-right text-green-600">-${formatCurrency(invoice.advance_payment)}</td>
//                 </tr>
//               )}
//               <tr className="bg-gray-50 font-medium">
//                 <td className="py-3 px-4 text-gray-800">Total Amount</td>
//                 <td className="py-3 px-4 text-right text-gray-800">${formatCurrency(invoice.Total_Amount)}</td>
//               </tr>
//               <tr className="bg-blue-50 font-medium">
//                 <td className="py-3 px-4 text-blue-800">Balance Due</td>
//                 <td className="py-3 px-4 text-right text-blue-800">${formatCurrency(invoice.balance_due)}</td>
//               </tr>
//             </tbody>
//           </table>
//         </div>

//         {/* Warranty Information */}
//         <div className="mb-8 border p-4 rounded-lg">
//           <h3 className="text-lg font-semibold text-gray-800 mb-2">Warranty Information</h3>
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <p className="text-gray-700"><span className="font-medium">Warranty Type:</span> {invoice.warranty || 'None'}</p>
//               {invoice.warranty_exp_date && (
//                 <p className="text-gray-700"><span className="font-medium">Expiration Date:</span> {formatDate(invoice.warranty_exp_date)}</p>
//               )}
//             </div>
//             <div>
//               <p className="text-gray-700">
//                 <span className="font-medium">Warranty Status:</span> 
//                 <span className={`ml-2 inline-block px-2 py-1 rounded-full text-xs font-medium ${
//                   invoice.warranty_status === 'Active' 
//                     ? 'bg-green-100 text-green-800' 
//                     : invoice.warranty_status === 'Expired'
//                       ? 'bg-red-100 text-red-800'
//                       : 'bg-gray-100 text-gray-800'
//                 }`}>
//                   {invoice.warranty_status}
//                 </span>
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Payment Terms and Notes */}
//         <div className="grid grid-cols-2 gap-6 mb-8">
//           <div>
//             <h3 className="text-lg font-semibold text-gray-800 mb-2">Payment Terms</h3>
//             <p className="text-gray-700">Payment due upon receipt</p>
//             <p className="text-gray-700">Accept cash, credit card, or bank transfer</p>
//           </div>
//           <div>
//             <h3 className="text-lg font-semibold text-gray-800 mb-2">Notes</h3>
//             <p className="text-gray-700">Thank you for choosing TechFix Solutions for your repair needs.</p>
//             <p className="text-gray-700">For questions about this invoice, please contact our service desk.</p>
//           </div>
//         </div>

//         {/* Footer */}
//         <div className="mt-12 text-center border-t pt-6 border-gray-200">
//           <p className="text-sm text-gray-600">This invoice was prepared by {invoice.Created_By}</p>
//           <p className="text-sm text-gray-600 mt-1">Invoice generated on {new Date().toLocaleDateString()}</p>
//         </div>
//       </div>
//     </>
//   );
// };

// export default InvoicePrint;