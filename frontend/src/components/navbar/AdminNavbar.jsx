import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MdDashboard, MdPeople, MdDescription, MdLibraryBooks, MdLogout } from 'react-icons/md';
import Logo from '../images/bitlogo.png';

const AdminNavbar = () => {
  const location = useLocation();

  const navItems = [
    { to: '/admindashboard', label: 'Dashboard', icon: <MdDashboard size={20} /> },
    { to: '/facultylist', label: 'Faculty List', icon: <MdPeople size={20} /> },
    { to: '/qbdetails', label: 'QB Details', icon: <MdDescription size={20} /> },
    { to: '/generateqb', label: 'Generate Qb', icon: <MdLibraryBooks size={20} /> },
  ];

  return (
    <nav className="w-64 h-screen fixed bg-white shadow-lg flex flex-col p-5 gap-10">
      <div>
        <img className="w-32 h-32 ml-10" src={Logo} alt="BIT LOGO" />
      </div>

      <div className="flex flex-col gap-6">
        <ul className="flex flex-col font-semibold text-gray-500 gap-4 text-left pl-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <li
                key={item.to}
                className={`px-4 py-2 rounded-md transition-all duration-200 flex items-center gap-3 ${
                  isActive ? 'bg-blue-500 text-white' : 'hover:bg-blue-500 hover:text-white'
                }`}
              >
                {item.icon}
                <Link to={item.to}>{item.label}</Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="font-semibold text-gray-500 hover:black mt-56 flex items-center gap-3 pl-4 ml-8">
        <MdLogout size={20} />
        <Link to="/">Logout</Link>
      </div>
    </nav>
  );
};

export default AdminNavbar;
