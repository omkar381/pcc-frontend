import { useState, useEffect } from 'react';
import axios from 'axios';
import StudentSidebar from '../../components/StudentSidebar';
import { API_URL } from '../../utils/api';

const Dashboard = ({ onLogout }) => {
  const [studentInfo, setStudentInfo] = useState(null);
  const [attendanceStats, setAttendanceStats] = useState({
    totalClasses: 0,
    attended: 0,
    percentage: 0
  });
  const [recentTests, setRecentTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        // Fetch attendance
        const attendanceResponse = await axios.get(`${API_URL}/api/student/attendance`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Calculate attendance statistics
        const totalClasses = attendanceResponse.data.length;
        const attended = attendanceResponse.data.filter(a => a.present).length;
        const percentage = totalClasses > 0 ? Math.round((attended / totalClasses) * 100) : 0;
        
        setAttendanceStats({
          totalClasses,
          attended,
          percentage
        });
        
        // Fetch test results
        const testsResponse = await axios.get(`${API_URL}/api/student/tests`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Sort by date (newest first) and take the 3 most recent tests
        const sortedTests = [...testsResponse.data].sort((a, b) => 
          new Date(b.date) - new Date(a.date)
        ).slice(0, 3);
        
        setRecentTests(sortedTests);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="flex h-screen bg-gray-100">
      <StudentSidebar onLogout={onLogout} />
      
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
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
          ) : (
            <>
              <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
                <div className="px-4 py-5 sm:p-6">
                  <h2 className="text-lg leading-6 font-medium text-gray-900 mb-4">Welcome to Padashetty Coaching Class</h2>
                  <p className="text-sm text-gray-500">
                    Access your attendance records, download study materials, and view your test results.
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-6">
                {/* Attendance Card */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                        <i className="fas fa-calendar-check text-white text-xl"></i>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Attendance
                          </dt>
                          <dd>
                            <div className="text-lg font-medium text-gray-900">{attendanceStats.percentage}%</div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-5 py-3">
                    <div className="text-sm">
                      <a href="/student/attendance" className="font-medium text-blue-600 hover:text-blue-500">
                        View details
                      </a>
                    </div>
                  </div>
                </div>

                {/* Notes Card */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                        <i className="fas fa-book text-white text-xl"></i>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Study Materials
                          </dt>
                          <dd>
                            <div className="text-lg font-medium text-gray-900">Access Notes</div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-5 py-3">
                    <div className="text-sm">
                      <a href="/student/notes" className="font-medium text-green-600 hover:text-green-500">
                        View notes
                      </a>
                    </div>
                  </div>
                </div>

                {/* Tests Card */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                        <i className="fas fa-clipboard-list text-white text-xl"></i>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Test Results
                          </dt>
                          <dd>
                            <div className="text-lg font-medium text-gray-900">View Scores</div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-5 py-3">
                    <div className="text-sm">
                      <a href="/student/tests" className="font-medium text-purple-600 hover:text-purple-500">
                        View results
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Recent Test Results */}
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Recent Test Results
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Your most recent test performances
                  </p>
                </div>
                
                <div className="border-t border-gray-200">
                  {recentTests.length === 0 ? (
                    <div className="px-4 py-5 sm:px-6 text-center text-gray-500">
                      No test results available yet
                    </div>
                  ) : (
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
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {recentTests.map((test, index) => (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {test.test_name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {test.subject}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {test.date}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  (test.marks_obtained / test.max_marks) >= 0.75
                                    ? 'bg-green-100 text-green-800'
                                    : (test.marks_obtained / test.max_marks) >= 0.5
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {test.marks_obtained} / {test.max_marks}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
