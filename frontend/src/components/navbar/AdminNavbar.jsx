import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MdDashboard, MdPeople, MdDescription, MdLibraryBooks, MdLogout, MdHistory, } from 'react-icons/md';
import { useDispatch } from 'react-redux';
import { removeUser } from '../../store/userSlice'; 
import Logo from '../images/bitlogo.png';

const AdminNavbar = () => {
  const location = useLocation();
  const dispatch = useDispatch();

  const navItems = [
    { to: '/admindashboard', label: 'Dashboard', icon: <MdDashboard size={20} /> },
    { to: '/facultylist', label: 'Faculty List', icon: <MdPeople size={20} /> },
    { to: '/add-task', label: 'Add Task', icon: <MdLibraryBooks size={20} /> },
    { to: '/qbdetails', label: 'QB Details', icon: <MdDescription size={20} /> },
    { to: '/generateqb', label: 'Generate QB', icon: <MdLibraryBooks size={20} /> },
    { to: '/qbhistory', label: 'QB History', icon: <MdHistory size={20} /> },
    { to: '/vettingtask', label: 'Vetting Assign', icon: <MdDescription size={20} /> },
  ];

  const handleLogout = () => {
    localStorage.removeItem('user');
    dispatch(removeUser());
  };

  return (
    <nav className="w-64 h-screen fixed bg-white shadow-lg flex flex-col p-5 gap-10">
      <div>
        <img className="w-32 h-32 ml-10" src={Logo} alt="BIT LOGO" />
      </div>

      <div className="flex flex-col gap-6">
        <ul className="flex flex-col font-semibold text-gray-500 gap-4 text-left">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={`px-4 py-2 rounded-md transition-all duration-200 flex items-center gap-3 ${
                    isActive ? 'bg-blue-500 text-white' : 'hover:bg-blue-500 hover:text-white'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-auto pl-4 ml-4">
        <Link
          to="/"
          onClick={handleLogout}
          className="font-semibold text-gray-500 hover:text-black flex items-center gap-3"
        >
          <MdLogout size={20} />
          <span>Logout</span>
        </Link>
      </div>
    </nav>
  );
};

export default AdminNavbar;