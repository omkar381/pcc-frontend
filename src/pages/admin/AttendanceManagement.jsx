import { useState, useEffect } from 'react';
import axios from 'axios';
import AdminSidebar from '../../components/AdminSidebar';
import { API_URL } from '../../utils/api';

const AttendanceManagement = ({ onLogout }) => {
  const [students, setStudents] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/api/admin/students`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setStudents(response.data);
        
        // Initialize attendance array
        const initialAttendance = response.data.map(student => ({
          student_id: student.id,
          present: false
        }));
        
        setAttendance(initialAttendance);
      } catch (err) {
        setError('Failed to fetch students. Please try again later.');
        console.error('Error fetching students:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const handleAttendanceChange = (studentId, present) => {
    setAttendance(prevAttendance => 
      prevAttendance.map(item => 
        item.student_id === studentId ? { ...item, present } : item
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/admin/attendance`, {
        date,
        attendance
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSuccess('Attendance marked successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to mark attendance. Please try again.');
      console.error('Error marking attendance:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-blue-50 overflow-hidden">
      <AdminSidebar onLogout={onLogout} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-md z-10">
          <div className="max-w-full mx-auto py-4 px-6 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <i className="fas fa-calendar-check text-blue-600 mr-3"></i>
              Attendance Management
            </h1>
            <div className="text-sm text-gray-500 flex items-center">
              <i className="far fa-calendar-alt mr-2 text-blue-500"></i>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-full mx-auto bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
            <div className="p-6">
              {error && (
                <div className="mb-4 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md flex items-center" role="alert">
                  <i className="fas fa-exclamation-circle text-red-500 mr-3 text-lg"></i>
                  <span className="block">{error}</span>
                </div>
              )}
              
              {success && (
                <div className="mb-4 bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-md flex items-center" role="alert">
                  <i className="fas fa-check-circle text-green-500 mr-3 text-lg"></i>
                  <span className="block">{success}</span>
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                    Select Date for Attendance
                  </label>
                  <div className="relative max-w-xs">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="far fa-calendar text-gray-400"></i>
                    </div>
                    <input
                      type="date"
                      id="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="pl-10 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                    />
                  </div>
                </div>
                
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
                    <p className="mt-4 text-gray-600">Loading students data...</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto bg-white rounded-lg shadow">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr className="bg-gradient-to-r from-blue-50 to-indigo-50">
                          <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Admission Number
                          </th>
                          <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Name
                          </th>
                          <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Attendance
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {students.map((student, index) => {
                          const attendanceRecord = attendance.find(a => a.student_id === student.id);
                          const isPresent = attendanceRecord ? attendanceRecord.present : false;
                          
                          return (
                            <tr key={student.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-700">
                                {student.admission_number}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                                {student.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center space-x-6">
                                  <div className="flex items-center">
                                    <input
                                      id={`present-${student.id}`}
                                      name={`attendance-${student.id}`}
                                      type="radio"
                                      checked={isPresent}
                                      onChange={() => handleAttendanceChange(student.id, true)}
                                      className="focus:ring-blue-500 h-5 w-5 text-blue-600 border-gray-300 cursor-pointer"
                                    />
                                    <label htmlFor={`present-${student.id}`} className="ml-2 block text-sm text-gray-700 cursor-pointer">
                                      <span className="flex items-center">
                                        <i className="fas fa-check-circle text-green-500 mr-1"></i> Present
                                      </span>
                                    </label>
                                  </div>
                                  <div className="flex items-center">
                                    <input
                                      id={`absent-${student.id}`}
                                      name={`attendance-${student.id}`}
                                      type="radio"
                                      checked={!isPresent}
                                      onChange={() => handleAttendanceChange(student.id, false)}
                                      className="focus:ring-red-500 h-5 w-5 text-red-600 border-gray-300 cursor-pointer"
                                    />
                                    <label htmlFor={`absent-${student.id}`} className="ml-2 block text-sm text-gray-700 cursor-pointer">
                                      <span className="flex items-center">
                                        <i className="fas fa-times-circle text-red-500 mr-1"></i> Absent
                                      </span>
                                    </label>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
                
                <div className="mt-6 flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting || loading}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200 transform hover:-translate-y-1"
                  >
                    {submitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save mr-2"></i> Save Attendance
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AttendanceManagement;
