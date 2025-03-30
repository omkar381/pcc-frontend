import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../utils/api';

const ClassSelection = ({ onClassSelected }) => {
  const [classLevel, setClassLevel] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentClass, setCurrentClass] = useState(null);

  const classOptions = [
    '7th', '8th', '9th', '10th', '11th', '12th'
  ];

  useEffect(() => {
    const fetchCurrentClass = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/api/admin/current-class`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setCurrentClass(response.data.selected_class);
        if (response.data.selected_class) {
          setClassLevel(response.data.selected_class);
        }
      } catch (err) {
        console.error('Error fetching current class:', err);
      }
    };

    fetchCurrentClass();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/admin/select-class`, 
        { class_level: classLevel },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      setCurrentClass(classLevel);
      if (onClassSelected) {
        onClassSelected(classLevel);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to select class. Please try again.');
      console.error('Error selecting class:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 max-w-md mx-auto mt-8 border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <i className="fas fa-chalkboard-teacher text-blue-600 mr-3"></i>
        Class Selection
      </h2>
      
      {currentClass && (
        <div className="mb-4 bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 rounded-md">
          <p className="font-medium">Currently Selected: {currentClass}</p>
        </div>
      )}
      
      {error && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md">
          <p>{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="classLevel" className="block text-sm font-medium text-gray-700 mb-2">
            Select Class
          </label>
          <select
            id="classLevel"
            value={classLevel}
            onChange={(e) => setClassLevel(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">-- Select Class --</option>
            {classOptions.map((option) => (
              <option key={option} value={option}>
                {option} Class
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || !classLevel}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                <i className="fas fa-check-circle mr-2"></i> Select Class
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ClassSelection;
