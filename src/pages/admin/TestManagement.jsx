import { useState, useEffect } from 'react';
import axios from 'axios';
import AdminSidebar from '../../components/AdminSidebar';
import TestResultsPDF from '../../components/TestResultsPDF';

const TestManagement = ({ onLogout }) => {
  const [tests, setTests] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('add');
  const [selectedTest, setSelectedTest] = useState(null);
  const [testResults, setTestResults] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  
  const [newTest, setNewTest] = useState({
    name: '',
    subject: 'Mathematics',
    class_level: '',
    date: new Date().toISOString().split('T')[0],
    max_marks: 100
  });

  const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology'];
  const classOptions = ['7th', '8th', '9th', '10th', '11th', '12th'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        // Fetch current class
        const classResponse = await axios.get('http://localhost:5000/api/admin/current-class', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (classResponse.data.selected_class) {
          setSelectedClass(classResponse.data.selected_class);
          setNewTest(prev => ({
            ...prev,
            class_level: classResponse.data.selected_class
          }));
          
          // Fetch class-specific tests
          const testsResponse = await axios.get('http://localhost:5000/api/admin/class-tests', {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          // Fetch class-specific students
          const studentsResponse = await axios.get('http://localhost:5000/api/admin/class-students', {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          setTests(testsResponse.data);
          setStudents(studentsResponse.data);
        } else {
          // Fetch all tests
          const testsResponse = await axios.get('http://localhost:5000/api/admin/tests', {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          // Fetch all students
          const studentsResponse = await axios.get('http://localhost:5000/api/admin/students', {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          setTests(testsResponse.data);
          setStudents(studentsResponse.data);
        }
      } catch (err) {
        setError('Failed to fetch data. Please try again later.');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleNewTestChange = (e) => {
    const { name, value } = e.target;
    setNewTest({
      ...newTest,
      [name]: name === 'max_marks' ? parseInt(value) : value
    });
  };

  const handleAddTest = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/admin/tests', newTest, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Add the new test to the list
      const newTestWithId = { ...newTest, id: response.data.test_id };
      setTests([...tests, newTestWithId]);
      
      setSuccess('Test added successfully!');
      
      // Reset form
      setNewTest({
        name: '',
        subject: 'Mathematics',
        class_level: selectedClass || '',
        date: new Date().toISOString().split('T')[0],
        max_marks: 100
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add test. Please try again.');
      console.error('Error adding test:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectTest = (test) => {
    setSelectedTest(test);
    
    // Initialize test results with all students
    const initialResults = students.map(student => ({
      student_id: student.id,
      marks_obtained: 0
    }));
    
    setTestResults(initialResults);
  };

  const handleMarksChange = (studentId, marks) => {
    setTestResults(prevResults => 
      prevResults.map(result => 
        result.student_id === studentId ? { ...result, marks_obtained: parseFloat(marks) } : result
      )
    );
  };

  const handleSubmitResults = async (e) => {
    e.preventDefault();
    
    if (!selectedTest) {
      setError('Please select a test first');
      return;
    }
    
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/admin/tests/${selectedTest.id}/results`, {
        results: testResults
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSuccess('Test results added successfully!');
      
      // Reset form
      setSelectedTest(null);
      setTestResults([]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add test results. Please try again.');
      console.error('Error adding test results:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-blue-50 overflow-hidden">
      <AdminSidebar onLogout={onLogout} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-md z-10">
          <div className="w-full mx-auto py-4 px-6 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <i className="fas fa-clipboard-list text-blue-600 mr-3"></i>
              Test Management
            </h1>
            <div className="text-sm text-gray-500 flex items-center">
              {selectedClass && (
                <span className="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">
                  Class: {selectedClass}
                </span>
              )}
              <i className="far fa-calendar-alt mr-2 text-blue-500"></i>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-auto p-6">
          <div className="mb-6">
            <div className="sm:hidden">
              <label htmlFor="tabs" className="sr-only">Select a tab</label>
              <select
                id="tabs"
                name="tabs"
                className="block w-full focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md"
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value)}
              >
                <option value="add">Add Test</option>
                <option value="results">Add Test Results</option>
                <option value="pdf">Generate PDF Reports</option>
                <option value="view">View Tests</option>
              </select>
            </div>
            <div className="hidden sm:block">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex" aria-label="Tabs">
                  <button
                    onClick={() => setActiveTab('add')}
                    className={`${
                      activeTab === 'add'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm`}
                  >
                    Add Test
                  </button>
                  <button
                    onClick={() => setActiveTab('results')}
                    className={`${
                      activeTab === 'results'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm`}
                  >
                    Add Test Results
                  </button>
                  <button
                    onClick={() => setActiveTab('pdf')}
                    className={`${
                      activeTab === 'pdf'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm`}
                  >
                    PDF Reports
                  </button>
                  <button
                    onClick={() => setActiveTab('view')}
                    className={`${
                      activeTab === 'view'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm`}
                  >
                    View Tests
                  </button>
                </nav>
              </div>
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
              <p className="ml-4 text-gray-600">Loading data...</p>
            </div>
          ) : (
            <>
              {activeTab === 'add' && (
                <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
                  <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Add New Test</h3>
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
                    
                    <form onSubmit={handleAddTest} className="space-y-4">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                            Test Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            id="name"
                            name="name"
                            value={newTest.name}
                            onChange={handleNewTestChange}
                            required
                            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            placeholder="e.g., Midterm Exam"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                            Subject <span className="text-red-500">*</span>
                          </label>
                          <select
                            id="subject"
                            name="subject"
                            value={newTest.subject}
                            onChange={handleNewTestChange}
                            required
                            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          >
                            {subjects.map(subject => (
                              <option key={subject} value={subject}>{subject}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label htmlFor="class_level" className="block text-sm font-medium text-gray-700 mb-1">
                            Class Level <span className="text-red-500">*</span>
                          </label>
                          <select
                            id="class_level"
                            name="class_level"
                            value={newTest.class_level}
                            onChange={handleNewTestChange}
                            required
                            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">-- Select Class --</option>
                            {classOptions.map(option => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                            Date <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="date"
                            id="date"
                            name="date"
                            value={newTest.date}
                            onChange={handleNewTestChange}
                            required
                            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="max_marks" className="block text-sm font-medium text-gray-700 mb-1">
                            Maximum Marks <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            id="max_marks"
                            name="max_marks"
                            value={newTest.max_marks}
                            onChange={handleNewTestChange}
                            required
                            min="1"
                            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={submitting}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200"
                        >
                          {submitting ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Adding...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-plus mr-2"></i> Add Test
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
              
              {activeTab === 'results' && (
                <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
                  <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Add Test Results</h3>
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
                    
                    <div className="mb-6">
                      <label htmlFor="test-select" className="block text-sm font-medium text-gray-700 mb-1">
                        Select Test <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="test-select"
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        value={selectedTest ? selectedTest.id : ''}
                        onChange={(e) => {
                          const testId = parseInt(e.target.value);
                          const test = tests.find(t => t.id === testId);
                          handleSelectTest(test);
                        }}
                      >
                        <option value="">-- Select a test --</option>
                        {tests.map(test => (
                          <option key={test.id} value={test.id}>
                            {test.name} - {test.subject} ({test.date})
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {selectedTest && (
                      <form onSubmit={handleSubmitResults}>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Student Name
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Admission Number
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Marks Obtained
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {students.map((student, index) => (
                                <tr key={student.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {student.name}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {student.admission_number}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <input
                                      type="number"
                                      min="0"
                                      max={selectedTest.max_marks}
                                      step="0.5"
                                      value={testResults.find(r => r.student_id === student.id)?.marks_obtained || 0}
                                      onChange={(e) => handleMarksChange(student.id, e.target.value)}
                                      className="w-20 shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    <span className="ml-2">/ {selectedTest.max_marks}</span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        
                        <div className="mt-6 flex justify-end">
                          <button
                            type="submit"
                            disabled={submitting}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200"
                          >
                            {submitting ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Saving...
                              </>
                            ) : (
                              <>
                                <i className="fas fa-save mr-2"></i> Save Results
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              )}
              
              {activeTab === 'pdf' && (
                <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
                  <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Generate Test Results PDF</h3>
                  </div>
                  <div className="p-6">
                    <div className="mb-6">
                      <label htmlFor="pdf-test-select" className="block text-sm font-medium text-gray-700 mb-1">
                        Select Test for PDF Generation <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="pdf-test-select"
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        value={selectedTest ? selectedTest.id : ''}
                        onChange={(e) => {
                          const testId = parseInt(e.target.value);
                          const test = tests.find(t => t.id === testId);
                          setSelectedTest(test);
                        }}
                      >
                        <option value="">-- Select a test --</option>
                        {tests.map(test => (
                          <option key={test.id} value={test.id}>
                            {test.name} - {test.subject} ({test.date})
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {selectedTest && (
                      <TestResultsPDF 
                        testId={selectedTest.id} 
                        testName={selectedTest.name} 
                        testSubject={selectedTest.subject}
                        classLevel={selectedTest.class_level}
                      />
                    )}
                  </div>
                </div>
              )}
              
              {activeTab === 'view' && (
                <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
                  <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">View Tests</h3>
                  </div>
                  <div className="p-6">
                    {tests.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-500">No tests found. Add a test to get started.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Name
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Subject
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Class
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Max Marks
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {tests.map((test, index) => (
                              <tr key={test.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {test.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {test.subject}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {test.class_level}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {test.date}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {test.max_marks}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
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

export default TestManagement;
