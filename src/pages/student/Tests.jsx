import { useState, useEffect } from 'react';
import axios from 'axios';
import StudentSidebar from '../../components/StudentSidebar';
import { API_URL } from '../../utils/api';

const Tests = ({ onLogout }) => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');

  const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology'];

  useEffect(() => {
    const fetchTests = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/api/student/tests`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Sort by date (newest first)
        const sortedTests = [...response.data].sort((a, b) => 
          new Date(b.date) - new Date(a.date)
        );
        
        setTests(sortedTests);
      } catch (err) {
        setError('Failed to fetch test results. Please try again later.');
        console.error('Error fetching test results:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, []);

  // Filter tests by subject if selected
  const filteredTests = selectedSubject
    ? tests.filter(test => test.subject === selectedSubject)
    : tests;

  // Group tests by subject for the summary
  const testsBySubject = tests.reduce((groups, test) => {
    if (!groups[test.subject]) {
      groups[test.subject] = [];
    }
    
    groups[test.subject].push(test);
    return groups;
  }, {});

  // Calculate average score for each subject
  const subjectAverages = Object.entries(testsBySubject).map(([subject, subjectTests]) => {
    const totalPercentage = subjectTests.reduce((sum, test) => 
      sum + ((test.marks_obtained / test.max_marks) * 100), 0
    );
    const averagePercentage = totalPercentage / subjectTests.length;
    
    return {
      subject,
      average: Math.round(averagePercentage)
    };
  });

  return (
    <div className="flex h-screen bg-gray-100">
      <StudentSidebar onLogout={onLogout} />
      
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900">Test Results</h1>
          </div>
        </header>
        
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          ) : tests.length === 0 ? (
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6 text-center text-gray-500">
                No test results available yet
              </div>
            </div>
          ) : (
            <>
              {/* Performance Summary */}
              <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Performance Summary
                  </h3>
                </div>
                
                <div className="border-t border-gray-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
                    {subjectAverages.map(({ subject, average }) => (
                      <div key={subject} className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-700">{subject}</h4>
                        <div className="mt-2 flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className={`h-2.5 rounded-full ${
                                average >= 75 ? 'bg-green-600' : 
                                average >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                              }`} 
                              style={{ width: `${average}%` }}
                            ></div>
                          </div>
                          <span className="ml-2 text-sm font-medium text-gray-700">{average}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Filter by Subject */}
              <div className="mb-6">
                <label htmlFor="subject-filter" className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Subject
                </label>
                <select
                  id="subject-filter"
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="block w-full sm:w-64 py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">All Subjects</option>
                  {subjects.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Test Results Table */}
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Detailed Test Results
                  </h3>
                </div>
                
                <div className="border-t border-gray-200">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Test Name
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Subject
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Marks
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Percentage
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredTests.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                              No test results found for {selectedSubject}
                            </td>
                          </tr>
                        ) : (
                          filteredTests.map((test, index) => {
                            const percentage = Math.round((test.marks_obtained / test.max_marks) * 100);
                            
                            return (
                              <tr key={index}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {test.test_name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {test.subject}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {new Date(test.date).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {test.marks_obtained} / {test.max_marks}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    percentage >= 75 ? 'bg-green-100 text-green-800' : 
                                    percentage >= 60 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                                  }`}>
                                    {percentage}%
                                  </span>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Tests;
