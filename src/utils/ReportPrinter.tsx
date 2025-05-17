import { format } from 'date-fns';

interface PrintOptions {
  title: string;
  orientation?: 'portrait' | 'landscape';
  showBranding?: boolean;
  companyName?: string;
  companyLogo?: string;
  companyAddress?: string;
  companyContact?: string;
  creator?: string;
  dateRange?: {
    startDate: string;
    endDate: string;
  };
}

export const printReport = (contentElement: HTMLElement | null, options: PrintOptions) => {
  if (!contentElement) return;
  
  const {
    title,
    orientation = 'landscape',
    showBranding = true,
    companyName = 'Bandu Electricals',
    companyLogo,
    companyAddress = '123 Main Street, Colombo, Sri Lanka',
    companyContact = 'Tel: (94) 11-123-4567 • Email: info@bandu.com',
    creator,
    dateRange
  } = options;
  
  
  // Create a hidden iframe instead of opening a new window
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  document.body.appendChild(iframe);
  
  const currentDate = format(new Date(), 'PPpp');
  
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMM dd, yyyy');
    } catch {
      return 'Invalid date';
    }
  };
  
  // Create a deep clone of the element to avoid modifying the original
  const clonedContent = contentElement.cloneNode(true) as HTMLElement;
  
  // Remove any elements with the "no-print" class
  const noPrintElements = clonedContent.querySelectorAll('.no-print');
  noPrintElements.forEach(el => el.remove());
  
  // Remove any existing branding elements from the content
  // This prevents duplicate branding sections
  const existingBrandingElements = clonedContent.querySelectorAll(
    '.report-header, .company-info, .report-branding, .hidden.print\\:block, .report-title, .flex.justify-between, div[class*="branding"], div[class*="Bandu"], h1, h2:first-of-type'
  );
  existingBrandingElements.forEach(el => {
    const text = el.textContent?.toLowerCase() || '';
    // Check if this element contains the company name or header-like content
    if (text.includes('bandu') || 
        text.includes('electrical') || 
        text.includes('report') ||
        text.includes('generated') ||
        text.includes('summary information') ||
        (el.tagName === 'DIV' && el.querySelector('h1, h2'))) {
      el.remove();
    }
  });

  // Also remove any divs that might contain company info
  const allDivs = clonedContent.querySelectorAll('div');
  allDivs.forEach(div => {
    const text = div.textContent?.toLowerCase() || '';
    if (text.includes('bandu electricals') || 
        text.includes('colombo, sri lanka') ||
        text.includes('main street') ||
        text.includes('123-4567')) {
      div.remove();
    }
  });
  
  // Extract the actual content data we want to print
  const contentData = clonedContent.innerHTML;
  
  // Create the HTML content for printing
  const iframeDocument = iframe.contentDocument || iframe.contentWindow?.document;
  if (!iframeDocument) {
    console.error('Could not access iframe document');
    return;
  }
  
  iframeDocument.open();
  iframeDocument.write(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title} - ${format(new Date(), 'yyyy-MM-dd')}</title>
        <style>
          @media print {
            @page {
              size: ${orientation};
              margin: 0.5in;
            }
            
            body {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            
            .page-break {
              page-break-after: always;
            }
          }
          
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            margin: 0;
            padding: 0;
            color: #333;
            background-color: white;
          }
          
          .report-container {
            max-width: 100%;
            margin: 0 auto;
          }
          
          .report-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
            padding-bottom: 1rem;
            border-bottom: 2px solid #e0e0e0;
          }
          
          .company-info {
            display: flex;
            align-items: center;
          }
          
          .company-logo {
            max-width: 80px;
            max-height: 80px;
            margin-right: 1rem;
          }
          
          .company-details h1 {
            color: #2563eb;
            margin: 0 0 0.5rem 0;
            font-size: 1.8rem;
          }
          
          .company-details p {
            margin: 0.2rem 0;
            color: #4b5563;
            font-size: 0.9rem;
          }
          
          .report-info {
            text-align: right;
          }
          
          .report-info h2 {
            margin: 0 0 0.5rem 0;
            font-size: 1.5rem;
            color: #1f2937;
          }
          
          .report-info p {
            margin: 0.2rem 0;
            color: #4b5563;
            font-size: 0.9rem;
          }
          
          .report-content {
            margin-top: 1.5rem;
          }
          
          h3.section-heading {
            margin-top: 1.5rem;
            margin-bottom: 1rem;
            font-size: 1.2rem;
            color: #1f2937;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 0.5rem;
          }
          
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 1rem;
            margin-bottom: 2rem;
          }
          
          @media (max-width: 768px) {
            .summary-grid {
              grid-template-columns: repeat(2, 1fr);
            }
          }
          
          .card {
            padding: 1rem;
            border-radius: 0.375rem;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }
          
          .card h3 {
            margin-top: 0;
            margin-bottom: 0.5rem;
            font-size: 0.875rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            border-bottom: none;
            padding-bottom: 0;
          }
          
          .card p {
            margin: 0;
            font-size: 1.5rem;
            font-weight: bold;
          }
          
          /* Card colors */
          .blue-card {
            background-color: #eff6ff;
            border: 1px solid #bfdbfe;
          }
          .blue-card h3 { color: #1e40af; }
          .blue-card p { color: #1e3a8a; }
          
          .green-card {
            background-color: #ecfdf5;
            border: 1px solid #a7f3d0;
          }
          .green-card h3 { color: #065f46; }
          .green-card p { color: #064e3b; }
          
          .purple-card {
            background-color: #f5f3ff;
            border: 1px solid #ddd6fe;
          }
          .purple-card h3 { color: #5b21b6; }
          .purple-card p { color: #4c1d95; }
          
          .amber-card {
            background-color: #fffbeb;
            border: 1px solid #fef3c7;
          }
          .amber-card h3 { color: #92400e; }
          .amber-card p { color: #78350f; }
          
          /* Table styles */
          .data-table-container {
            margin-top: 2rem;
            margin-bottom: 2rem;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.9rem;
            border: 1px solid #e5e7eb;
          }
          
          th, td {
            padding: 0.75rem;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
          }
          
          th {
            background-color: #f9fafb;
            font-weight: 600;
            text-transform: uppercase;
            font-size: 0.75rem;
            letter-spacing: 0.05em;
            color: #374151;
            border-bottom: 2px solid #d1d5db;
          }
          
          tbody tr:nth-child(even) {
            background-color: #f9fafb;
          }
          
          .text-right {
            text-align: right;
          }
          
          /* Footer */
          .report-footer {
            margin-top: 2rem;
            padding-top: 1rem;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 0.875rem;
            display: flex;
            justify-content: space-between;
          }
          
          .report-footer p {
            margin: 0.2rem 0;
          }
        </style>
      </head>
      <body>
        <div class="report-container">
          ${showBranding ? `
            <div class="report-header">
              <div class="company-info">
                ${companyLogo ? `<img src="${companyLogo}" alt="${companyName}" class="company-logo">` : ''}
                <div class="company-details">
                  <h1>${companyName}</h1>
                  <p>${companyAddress}</p>
                  <p>${companyContact}</p>
                </div>
              </div>
              <div class="report-info">
                <h2>${title}</h2>
                <p>Generated: ${currentDate}</p>
                ${creator ? `<p>Generated by: ${creator}</p>` : ''}
                ${dateRange ? `<p>Period: ${formatDate(dateRange.startDate)} - ${formatDate(dateRange.endDate)}</p>` : ''}
              </div>
            </div>
          ` : ''}
          
          <div class="report-content">
            <h3 class="section-heading">Summary Information</h3>
            <div class="summary-details">
              ${contentData}
            </div>
          </div>
          
          <div class="report-footer">
            <div>
              <p>© ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
              <p>This is an official document.</p>
            </div>
            <div>
              <p>Page 1 of 1</p>
            </div>
          </div>
        </div>
        <script>
          window.onload = function() {
            // Apply proper structure to summary cards
            const cards = document.querySelectorAll('.bg-blue-50, .bg-green-50, .bg-purple-50, .bg-amber-50');
            if (cards.length > 0) {
              const cardContainer = cards[0].parentElement;
              if (cardContainer) {
                cardContainer.className = 'summary-grid';
              }
            }
            
            // Add heading for purchase details table
            const tables = document.querySelectorAll('table');
            tables.forEach((table, index) => {
              if (table.closest('.data-table-container')) return;
              
              const wrapper = document.createElement('div');
              wrapper.className = 'data-table-container';
              
              const heading = document.createElement('h3');
              heading.className = 'section-heading';
              heading.textContent = 'Purchase Details';
              
              table.parentNode.insertBefore(wrapper, table);
              wrapper.appendChild(heading);
              wrapper.appendChild(table);
            });
            
            // Clean up any "Summary Information" text that might still be in the document
            const allElements = document.querySelectorAll('*');
            allElements.forEach(el => {
              if (el.childNodes.length === 1 && el.childNodes[0].nodeType === 3) {
                if (el.textContent?.trim() === 'Summary Information') {
                  el.remove();
                }
              }
            });
            
            setTimeout(function() {
              window.print();
            }, 800);
          }
        </script>
      </body>
    </html>
  `);
  iframeDocument.close();
  
  // Wait for content to load then print
  setTimeout(() => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    
    // Remove the iframe after printing (or after a timeout)
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);
  }, 800);
};