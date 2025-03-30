import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminSidebar from '../../components/AdminSidebar';

const AddStudent = ({ onLogout }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    school_name: '',
    class_level: ''
  });
  const [admissionForm, setAdmissionForm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [credentials, setCredentials] = useState(null);
  const [selectedClass, setSelectedClass] = useState('');

  const classOptions = [
    '7th', '8th', '9th', '10th', '11th', '12th'
  ];

  useEffect(() => {
    const fetchCurrentClass = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/admin/current-class', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.selected_class) {
          setSelectedClass(response.data.selected_class);
          setFormData(prev => ({
            ...prev,
            class_level: response.data.selected_class
          }));
        }
      } catch (err) {
        console.error('Error fetching current class:', err);
      }
    };

    fetchCurrentClass();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFileChange = (e) => {
    setAdmissionForm(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    setCredentials(null);

    try {
      const token = localStorage.getItem('token');
      
      const data = new FormData();
      data.append('name', formData.name);
      data.append('email', formData.email);
      data.append('phone', formData.phone);
      data.append('school_name', formData.school_name);
      data.append('class_level', formData.class_level);
      
      if (admissionForm) {
        data.append('admission_form', admissionForm);
      }

      const response = await axios.post('http://localhost:5000/api/admin/students', data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess('Student added successfully!');
      setCredentials({
        admission_number: response.data.admission_number,
        username: response.data.username,
        password: response.data.password
      });
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        school_name: '',
        class_level: selectedClass || ''
      });
      setAdmissionForm(null);
      
      // Reset file input
      const fileInput = document.getElementById('admission-form');
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add student. Please try again.');
      console.error('Error adding student:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-blue-50 overflow-hidden">
      <AdminSidebar onLogout={onLogout} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-md z-10">
          <div className="w-full mx-auto py-4 px-6 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <i className="fas fa-user-plus text-blue-600 mr-3"></i>
              Add New Student
            </h1>
            <div className="text-sm text-gray-500 flex items-center">
              <i className="far fa-calendar-alt mr-2 text-blue-500"></i>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
            <div className="p-6">
              {error && (
                <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md flex items-center" role="alert">
                  <i className="fas fa-exclamation-circle text-red-500 mr-3 text-lg"></i>
                  <span className="block">{error}</span>
                </div>
              )}
              
              {success && (
                <div className="mb-6 bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-md flex items-center" role="alert">
                  <i className="fas fa-check-circle text-green-500 mr-3 text-lg"></i>
                  <span className="block">{success}</span>
                </div>
              )}
              
              {credentials && (
                <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 rounded-md" role="alert">
                  <div className="flex items-center mb-2">
                    <i className="fas fa-info-circle text-blue-500 mr-3 text-lg"></i>
                    <p className="font-bold">Student Credentials</p>
                  </div>
                  <div className="ml-8">
                    <p className="mb-1"><span className="font-semibold">Admission Number:</span> <span className="font-mono bg-blue-100 px-2 py-1 rounded">{credentials.admission_number}</span></p>
                    <p className="mb-1"><span className="font-semibold">Username:</span> <span className="font-mono bg-blue-100 px-2 py-1 rounded">{credentials.username}</span></p>
                    <p className="mb-3"><span className="font-semibold">Password:</span> <span className="font-mono bg-blue-100 px-2 py-1 rounded">{credentials.password}</span></p>
                    <p className="text-sm flex items-center">
                      <i className="fas fa-bell mr-2"></i>
                      Please share these credentials with the student.
                    </p>
                  </div>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i className="fas fa-user text-gray-400"></i>
                      </div>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter student's full name"
                        className="pl-10 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i className="fas fa-envelope text-gray-400"></i>
                      </div>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="student@example.com"
                        className="pl-10 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i className="fas fa-phone text-gray-400"></i>
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        id="phone"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Enter phone number"
                        className="pl-10 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="school_name" className="block text-sm font-medium text-gray-700 mb-1">
                      School Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i className="fas fa-school text-gray-400"></i>
                      </div>
                      <input
                        type="text"
                        name="school_name"
                        id="school_name"
                        required
                        value={formData.school_name}
                        onChange={handleChange}
                        placeholder="Enter school name"
                        className="pl-10 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="class_level" className="block text-sm font-medium text-gray-700 mb-1">
                      Class Level <span className="text-red-500">*</span>
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i className="fas fa-graduation-cap text-gray-400"></i>
                      </div>
                      <select
                        name="class_level"
                        id="class_level"
                        required
                        value={formData.class_level}
                        onChange={handleChange}
                        className="pl-10 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      >
                        <option value="">-- Select Class --</option>
                        {classOptions.map((option) => (
                          <option key={option} value={option}>
                            {option} Class
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="sm:col-span-2">
                    <label htmlFor="admission-form" className="block text-sm font-medium text-gray-700 mb-1">
                      Admission Form (PDF)
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-blue-400 transition-colors duration-200">
                      <div className="space-y-1 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="flex text-sm text-gray-600">
                          <label htmlFor="admission-form" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                            <span>Upload a file</span>
                            <input 
                              id="admission-form" 
                              name="admission-form" 
                              type="file" 
                              accept=".pdf"
                              onChange={handleFileChange}
                              className="sr-only" 
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          PDF up to 10MB
                        </p>
                        {admissionForm && (
                          <p className="text-sm text-green-600 font-medium">
                            <i className="fas fa-check-circle mr-1"></i>
                            {admissionForm.name}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => navigate('/admin/students')}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                  >
                    <i className="fas fa-arrow-left mr-2"></i> Back to Students
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center px-6 py-3 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Adding Student...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-user-plus mr-2"></i> Add Student
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

export default AddStudent;
