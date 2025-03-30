import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AdminSidebar from '../../components/AdminSidebar';
import { API_URL } from '../../utils/api';

const StudentsList = ({ onLogout }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/api/admin/students`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStudents(response.data);
      } catch (err) {
        setError('Failed to fetch students. Please try again later.');
        console.error('Error fetching students:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.admission_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUploadAdmissionForm = async (studentId, event) => {
    event.preventDefault();
    const fileInput = document.getElementById(`admission-form-${studentId}`);
    
    if (!fileInput.files[0]) {
      alert('Please select a file to upload');
      return;
    }

    const formData = new FormData();
    formData.append('admission_form', fileInput.files[0]);

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/admin/students/${studentId}/admission-form`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Update the student in the list
      setStudents(students.map(student => {
        if (student.id === studentId) {
          return { ...student, has_admission_form: true };
        }
        return student;
      }));
      
      alert('Admission form uploaded successfully');
    } catch (err) {
      alert('Failed to upload admission form');
      console.error('Error uploading admission form:', err);
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
      return;
    }
    
    setDeleteLoading(studentId);
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/admin/students/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Remove the student from the list
      setStudents(students.filter(student => student.id !== studentId));
      
      alert('Student deleted successfully');
    } catch (err) {
      alert('Failed to delete student: ' + (err.response?.data?.message || 'Unknown error'));
      console.error('Error deleting student:', err);
    } finally {
      setDeleteLoading(null);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar onLogout={onLogout} />
      
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900">Students List</h1>
          </div>
        </header>
        
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-4 sm:mb-0">
              <div className="relative rounded-md shadow-sm">
                <input
                  type="text"
                  placeholder="Search by name or admission number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:w-64 pr-10 sm:text-sm border-gray-300 rounded-md"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <i className="fas fa-search text-gray-400"></i>
                </div>
              </div>
            </div>
            <Link
              to="/admin/add-student"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <i className="fas fa-user-plus mr-2"></i> Add New Student
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          ) : (
            <div className="flex flex-col">
              <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                  <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Admission Number
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Contact
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Admission Date
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Admission Form
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredStudents.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                              No students found
                            </td>
                          </tr>
                        ) : (
                          filteredStudents.map((student) => (
                            <tr key={student.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{student.name}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{student.admission_number}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{student.email}</div>
                                <div className="text-sm text-gray-500">{student.phone}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{student.admission_date}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {student.has_admission_form ? (
                                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                    Uploaded
                                  </span>
                                ) : (
                                  <form onSubmit={(e) => handleUploadAdmissionForm(student.id, e)}>
                                    <div className="flex items-center">
                                      <input
                                        id={`admission-form-${student.id}`}
                                        type="file"
                                        accept=".pdf"
                                        className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                      />
                                      <button
                                        type="submit"
                                        className="ml-2 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                      >
                                        Upload
                                      </button>
                                    </div>
                                  </form>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <button
                                  onClick={() => handleDeleteStudent(student.id)}
                                  disabled={deleteLoading === student.id}
                                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                                >
                                  {deleteLoading === student.id ? (
                                    <span className="flex items-center">
                                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                      </svg>
                                      Deleting...
                                    </span>
                                  ) : (
                                    <span className="flex items-center">
                                      <i className="fas fa-trash-alt mr-1.5"></i> Delete
                                    </span>
                                  )}
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default StudentsList;
