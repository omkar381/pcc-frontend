import { useState } from 'react';
import api, { API_URL } from '../utils/api';

const TestResultsPDF = ({ testId, testName, testSubject, classLevel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [whatsappLink, setWhatsappLink] = useState('');
  const [whatsappShareLink, setWhatsappShareLink] = useState('');
  const [retries, setRetries] = useState(0);

  const handleGeneratePDF = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    setPdfUrl('');
    setWhatsappLink('');
    setWhatsappShareLink('');

    try {
      // Increment retry count
      setRetries(prev => prev + 1);
      
      console.log(`Attempting to generate PDF for test ${testId} (attempt ${retries + 1})`);
      const response = await api.post(`/api/admin/generate-test-results-pdf/${testId}`);

      if (response.data && response.data.pdf_url) {
        const fullPdfUrl = `${API_URL}${response.data.pdf_url}`;
        console.log(`PDF URL: ${fullPdfUrl}`);
        setSuccess('PDF generated successfully!');
        setPdfUrl(fullPdfUrl);
        // Reset retries on success
        setRetries(0);
      } else {
        setError('Invalid response from server');
      }
    } catch (err) {
      console.error('Error generating PDF:', err);
      
      // Extract the most helpful error message
      let errorMessage = 'Failed to generate PDF. Please try again.';
      
      if (err.response) {
        if (err.response.status === 500) {
          errorMessage = `Server error (500): ${err.response.data?.message || 'Internal server error'}`;
          if (retries < 3) {
            errorMessage += '. Retrying may help...';
          }
        } else if (err.response.data) {
          if (typeof err.response.data === 'string' && err.response.data.includes('<!doctype html>')) {
            // This is an HTML error page, likely a 500 error
            errorMessage = `Server error (${err.response.status}). Please contact support.`;
          } else if (err.response.data.message) {
            errorMessage = err.response.data.message;
          }
        }
      } else if (err.request) {
        // Request was made but no response received
        errorMessage = 'No response from server. Please check your network connection.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = (e) => {
    console.log(`Attempting to download PDF from ${pdfUrl}`);
    // Let the default link behavior handle the download
  };

  const handleShareWhatsApp = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log(`Attempting to share test ${testId} on WhatsApp`);
      const response = await api.get(`/api/admin/share-results-whatsapp/${testId}`);

      if (response.data) {
        setSuccess('Results ready to share on WhatsApp!');
        setWhatsappLink(response.data.whatsapp_link || '');
        setWhatsappShareLink(response.data.whatsapp_share_link || '');
      } else {
        setError('Invalid response from server');
      }
    } catch (err) {
      console.error('Error preparing WhatsApp sharing:', err);
      
      // Extract the most helpful error message
      let errorMessage = 'Failed to prepare WhatsApp sharing. Please try again.';
      
      if (err.response && err.response.data) {
        if (typeof err.response.data === 'string' && err.response.data.includes('<!doctype html>')) {
          // This is an HTML error page, likely a 500 error
          errorMessage = `Server error (${err.response.status}). Please check if PDF was generated first.`;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200 mt-6">
      <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-purple-100 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <i className="fas fa-file-pdf text-purple-600 mr-2"></i>
          Test Results PDF and Sharing
        </h3>
      </div>
      
      <div className="p-6">
        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md flex items-center">
            <i className="fas fa-exclamation-circle text-red-500 mr-3"></i>
            <span>{error}</span>
          </div>
        )}
        
        {success && (
          <div className="mb-4 bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-md flex items-center">
            <i className="fas fa-check-circle text-green-500 mr-3"></i>
            <span>{success}</span>
          </div>
        )}
        
        <div className="bg-purple-50 rounded-lg p-4 mb-6 border border-purple-100">
          <h4 className="font-medium text-purple-800 mb-2">Test Information</h4>
          <p className="text-sm text-gray-700 mb-1"><span className="font-medium">Name:</span> {testName}</p>
          <p className="text-sm text-gray-700 mb-1"><span className="font-medium">Subject:</span> {testSubject}</p>
          <p className="text-sm text-gray-700"><span className="font-medium">Class:</span> {classLevel}</p>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
          <button
            onClick={handleGeneratePDF}
            disabled={loading}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 transition-all duration-200"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              <>
                <i className="fas fa-file-pdf mr-2"></i> Generate PDF
              </>
            )}
          </button>
          
          {pdfUrl && (
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleDownloadPDF}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
            >
              <i className="fas fa-download mr-2"></i> Download PDF
            </a>
          )}
          
          <button
            onClick={handleShareWhatsApp}
            disabled={loading || !pdfUrl}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-all duration-200"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Preparing...
              </>
            ) : (
              <>
                <i className="fab fa-whatsapp mr-2"></i> Share on WhatsApp
              </>
            )}
          </button>
        </div>
        
        {whatsappLink && (
          <div className="mt-6 bg-green-50 p-4 rounded-lg border border-green-100">
            <h4 className="font-medium text-green-800 mb-2 flex items-center">
              <i className="fab fa-whatsapp text-green-600 mr-2"></i>
              WhatsApp Sharing Options
            </h4>
            <p className="text-sm text-gray-700 mb-3">
              Choose how you want to share the results:
            </p>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
              >
                <i className="fab fa-whatsapp mr-2"></i> Join WhatsApp Group
              </a>
              
              {whatsappShareLink && (
                <a
                  href={whatsappShareLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
                >
                  <i className="fab fa-whatsapp mr-2"></i> Share Directly
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestResultsPDF;
