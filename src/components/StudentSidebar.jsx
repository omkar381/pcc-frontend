import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

const StudentSidebar = ({ onLogout }) => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  
  const menuItems = [
    { path: '/student/dashboard', name: 'Dashboard', icon: 'fas fa-tachometer-alt' },
    { path: '/student/attendance', name: 'Attendance', icon: 'fas fa-calendar-check' },
    { path: '/student/notes', name: 'Notes', icon: 'fas fa-book' },
    { path: '/student/tests', name: 'Test Results', icon: 'fas fa-clipboard-list' },
  ];

  return (
    <div className={`bg-gradient-to-b from-blue-800 to-blue-900 text-white ${collapsed ? 'w-16' : 'w-64'} min-h-screen flex flex-col transition-all duration-300 shadow-xl z-10`}>
      <div className="p-4 border-b border-blue-700 flex justify-between items-center">
        {!collapsed && <h2 className="text-xl font-bold">PCC Student</h2>}
        <button 
          onClick={() => setCollapsed(!collapsed)} 
          className="p-1 rounded-full hover:bg-blue-700 focus:outline-none"
        >
          <i className={`fas ${collapsed ? 'fa-chevron-right' : 'fa-chevron-left'} text-white`}></i>
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-2 px-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center px-4 py-3 text-sm rounded-lg transition-all duration-200 ${
                  location.pathname === item.path
                    ? 'bg-blue-700 text-white shadow-md'
                    : 'text-blue-100 hover:bg-blue-700 hover:shadow-md'
                }`}
                title={collapsed ? item.name : ''}
              >
                <i className={`${item.icon} ${collapsed ? 'text-xl' : 'w-5 h-5 mr-3'}`}></i>
                {!collapsed && <span>{item.name}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-blue-700">
        <button
          onClick={onLogout}
          className="flex items-center text-blue-100 hover:text-white w-full rounded-lg px-4 py-2 hover:bg-blue-700 transition-all duration-200"
        >
          <i className={`fas fa-sign-out-alt ${collapsed ? 'text-xl' : 'w-5 h-5 mr-3'}`}></i>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default StudentSidebar;
