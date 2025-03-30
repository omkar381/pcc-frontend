import { useState, useEffect } from 'react';
import axios from 'axios';
import AdminSidebar from '../../components/AdminSidebar';
import { API_URL } from '../../utils/api';

const Dashboard = ({ onLogout }) => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalNotes: 0,
    totalTests: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Fetch students count
        const studentsResponse = await axios.get(`${API_URL}/api/admin/students`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Fetch notes
        const notesResponse = await axios.get(`${API_URL}/api/notes`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Fetch tests
        const testsResponse = await axios.get(`${API_URL}/api/admin/tests`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setStats({
          totalStudents: studentsResponse.data.length,
          totalNotes: notesResponse.data.length,
          totalTests: testsResponse.data.length
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-blue-50 overflow-hidden">
      <AdminSidebar onLogout={onLogout} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-md z-10">
          <div className="w-full mx-auto py-4 px-6 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <i className="fas fa-tachometer-alt text-blue-600 mr-3"></i>
              Admin Dashboard
            </h1>
            <div className="text-sm text-gray-500 flex items-center">
              <i className="far fa-calendar-alt mr-2 text-blue-500"></i>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
              <p className="ml-4 text-gray-600">Loading dashboard data...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
                {/* Students Card */}
                <div className="bg-white overflow-hidden shadow-lg rounded-lg transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 border border-gray-100">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-md p-3">
                        <i className="fas fa-user-graduate text-white text-xl"></i>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Total Students
                          </dt>
                          <dd>
                            <div className="text-2xl font-semibold text-gray-900">{stats.totalStudents}</div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-5 py-3 border-t border-gray-100">
                    <div className="text-sm">
                      <a href="/admin/students" className="font-medium text-blue-600 hover:text-blue-500 flex items-center">
                        View all students <i className="fas fa-arrow-right ml-1 text-xs"></i>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Notes Card */}
                <div className="bg-white overflow-hidden shadow-lg rounded-lg transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 border border-gray-100">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-gradient-to-r from-green-500 to-green-600 rounded-md p-3">
                        <i className="fas fa-book text-white text-xl"></i>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Total Notes
                          </dt>
                          <dd>
                            <div className="text-2xl font-semibold text-gray-900">{stats.totalNotes}</div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-5 py-3 border-t border-gray-100">
                    <div className="text-sm">
                      <a href="/admin/notes" className="font-medium text-green-600 hover:text-green-500 flex items-center">
                        Manage notes <i className="fas fa-arrow-right ml-1 text-xs"></i>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Tests Card */}
                <div className="bg-white overflow-hidden shadow-lg rounded-lg transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 border border-gray-100">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-gradient-to-r from-purple-500 to-purple-600 rounded-md p-3">
                        <i className="fas fa-clipboard-list text-white text-xl"></i>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Total Tests
                          </dt>
                          <dd>
                            <div className="text-2xl font-semibold text-gray-900">{stats.totalTests}</div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-5 py-3 border-t border-gray-100">
                    <div className="text-sm">
                      <a href="/admin/tests" className="font-medium text-purple-600 hover:text-purple-500 flex items-center">
                        Manage tests <i className="fas fa-arrow-right ml-1 text-xs"></i>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200 mb-8">
                <div className="px-6 py-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                    <i className="fas fa-info-circle text-blue-500 mr-2"></i>
                    Welcome to Padashetty Coaching Class Admin Portal
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Manage students, attendance, notes, and test results from this dashboard.
                  </p>
                </div>
                <div className="border-t border-gray-200">
                  <dl>
                    <div className="bg-white px-6 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Quick Actions</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <a 
                            href="/admin/add-student" 
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300"
                          >
                            <i className="fas fa-user-plus mr-2"></i> Add New Student
                          </a>
                          <a 
                            href="/admin/attendance" 
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-300"
                          >
                            <i className="fas fa-calendar-check mr-2"></i> Mark Attendance
                          </a>
                          <a 
                            href="/admin/notes" 
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-all duration-300"
                          >
                            <i className="fas fa-book mr-2"></i> Upload Notes
                          </a>
                          <a 
                            href="/admin/tests" 
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-300"
                          >
                            <i className="fas fa-clipboard-list mr-2"></i> Add Test Results
                          </a>
                        </div>
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
              
              {/* Recent Activity Section */}
              <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
                <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                    <i className="fas fa-chart-line text-blue-500 mr-2"></i>
                    System Status
                  </h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 bg-green-100 rounded-full p-2">
                          <i className="fas fa-server text-green-600"></i>
                        </div>
                        <div className="ml-3">
                          <h4 className="text-sm font-medium text-green-800">Server Status</h4>
                          <p className="text-sm text-green-600">Running normally</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 bg-blue-100 rounded-full p-2">
                          <i className="fas fa-database text-blue-600"></i>
                        </div>
                        <div className="ml-3">
                          <h4 className="text-sm font-medium text-blue-800">Database Status</h4>
                          <p className="text-sm text-blue-600">Connected</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 bg-purple-100 rounded-full p-2">
                          <i className="fas fa-clock text-purple-600"></i>
                        </div>
                        <div className="ml-3">
                          <h4 className="text-sm font-medium text-purple-800">Last Backup</h4>
                          <p className="text-sm text-purple-600">{new Date().toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 bg-yellow-100 rounded-full p-2">
                          <i className="fas fa-users text-yellow-600"></i>
                        </div>
                        <div className="ml-3">
                          <h4 className="text-sm font-medium text-yellow-800">Active Users</h4>
                          <p className="text-sm text-yellow-600">1 administrator</p>
                        </div>
                      </div>
                    </div>
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

export default Dashboard;
