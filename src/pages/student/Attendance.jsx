import { useState, useEffect } from 'react';
import axios from 'axios';
import StudentSidebar from '../../components/StudentSidebar';

const Attendance = ({ onLogout }) => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalClasses: 0,
    attended: 0,
    percentage: 0
  });

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/student/attendance', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Sort by date (newest first)
        const sortedAttendance = [...response.data].sort((a, b) => 
          new Date(b.date) - new Date(a.date)
        );
        
        setAttendance(sortedAttendance);
        
        // Calculate attendance statistics
        const totalClasses = sortedAttendance.length;
        const attended = sortedAttendance.filter(a => a.present).length;
        const percentage = totalClasses > 0 ? Math.round((attended / totalClasses) * 100) : 0;
        
        setStats({
          totalClasses,
          attended,
          percentage
        });
      } catch (err) {
        setError('Failed to fetch attendance data. Please try again later.');
        console.error('Error fetching attendance:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  // Group attendance by month
  const groupedAttendance = attendance.reduce((groups, record) => {
    const date = new Date(record.date);
    const month = date.toLocaleString('default', { month: 'long', year: 'numeric' });
    
    if (!groups[month]) {
      groups[month] = [];
    }
    
    groups[month].push(record);
    return groups;
  }, {});

  return (
    <div className="flex h-screen bg-gray-100">
      <StudentSidebar onLogout={onLogout} />
      
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900">Attendance Record</h1>
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
                  <h2 className="text-lg leading-6 font-medium text-gray-900 mb-4">Attendance Summary</h2>
                  
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                    <div className="bg-gray-50 overflow-hidden rounded-lg px-4 py-5 sm:p-6">
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Classes</dt>
                      <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalClasses}</dd>
                    </div>
                    
                    <div className="bg-gray-50 overflow-hidden rounded-lg px-4 py-5 sm:p-6">
                      <dt className="text-sm font-medium text-gray-500 truncate">Classes Attended</dt>
                      <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.attended}</dd>
                    </div>
                    
                    <div className="bg-gray-50 overflow-hidden rounded-lg px-4 py-5 sm:p-6">
                      <dt className="text-sm font-medium text-gray-500 truncate">Attendance Percentage</dt>
                      <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.percentage}%</dd>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <div className="relative pt-1">
                      <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                        <div 
                          style={{ width: `${stats.percentage}%` }} 
                          className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                            stats.percentage >= 75 ? 'bg-green-500' : 
                            stats.percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {attendance.length === 0 ? (
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6 text-center text-gray-500">
                    No attendance records available yet
                  </div>
                </div>
              ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Detailed Attendance Records
                    </h3>
                  </div>
                  
                  <div className="border-t border-gray-200">
                    {Object.entries(groupedAttendance).map(([month, records]) => (
                      <div key={month} className="border-b border-gray-200 last:border-b-0">
                        <div className="bg-gray-50 px-4 py-3">
                          <h4 className="text-sm font-medium text-gray-700">{month}</h4>
                        </div>
                        
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {records.map((record, index) => (
                              <tr key={index}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {new Date(record.date).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {record.present ? (
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                      Present
                                    </span>
                                  ) : (
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                      Absent
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Attendance;
