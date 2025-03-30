import { useState, useEffect } from 'react';
import axios from 'axios';
import StudentSidebar from '../../components/StudentSidebar';
import { API_URL } from '../../utils/api';

const Notes = ({ onLogout }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');

  const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology'];

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        const url = selectedSubject 
          ? `${API_URL}/api/notes?subject=${selectedSubject}`
          : `${API_URL}/api/notes`;
          
        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Sort by upload date (newest first)
        const sortedNotes = [...response.data].sort((a, b) => 
          new Date(b.upload_date) - new Date(a.upload_date)
        );
        
        setNotes(sortedNotes);
      } catch (err) {
        setError('Failed to fetch notes. Please try again later.');
        console.error('Error fetching notes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [selectedSubject]);

  // Group notes by subject
  const groupedNotes = notes.reduce((groups, note) => {
    if (!groups[note.subject]) {
      groups[note.subject] = [];
    }
    
    groups[note.subject].push(note);
    return groups;
  }, {});

  return (
    <div className="flex h-screen bg-gray-100">
      <StudentSidebar onLogout={onLogout} />
      
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900">Study Materials</h1>
          </div>
        </header>
        
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
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
          
          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          ) : notes.length === 0 ? (
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6 text-center text-gray-500">
                No notes available for {selectedSubject || 'any subject'}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {selectedSubject ? (
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {selectedSubject}
                    </h3>
                  </div>
                  
                  <div className="border-t border-gray-200">
                    <ul className="divide-y divide-gray-200">
                      {notes.map((note) => (
                        <li key={note.id} className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <i className="fas fa-file-pdf text-blue-600"></i>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{note.title}</div>
                                <div className="text-sm text-gray-500">Uploaded on {new Date(note.upload_date).toLocaleDateString()}</div>
                              </div>
                            </div>
                            <div>
                              <button
                                onClick={() => {
                                  const token = localStorage.getItem('token');
                                  window.open(`${API_URL}/api/notes/${note.id}/download?token=${token}`, '_blank');
                                }}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                              >
                                <i className="fas fa-download mr-1.5"></i> Download
                              </button>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                Object.entries(groupedNotes).map(([subject, subjectNotes]) => (
                  <div key={subject} className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        {subject}
                      </h3>
                    </div>
                    
                    <div className="border-t border-gray-200">
                      <ul className="divide-y divide-gray-200">
                        {subjectNotes.map((note) => (
                          <li key={note.id} className="px-4 py-4 sm:px-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                  <i className="fas fa-file-pdf text-blue-600"></i>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{note.title}</div>
                                  <div className="text-sm text-gray-500">Uploaded on {new Date(note.upload_date).toLocaleDateString()}</div>
                                </div>
                              </div>
                              <div>
                                <button
                                  onClick={() => {
                                    const token = localStorage.getItem('token');
                                    window.open(`${API_URL}/api/notes/${note.id}/download?token=${token}`, '_blank');
                                  }}
                                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                  <i className="fas fa-download mr-1.5"></i> Download
                                </button>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Notes;
