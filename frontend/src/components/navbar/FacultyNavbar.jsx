import React from 'react';
import { NavLink } from 'react-router-dom';
import { MdDashboard, MdDescription, MdLogout, MdLibraryBooks } from 'react-icons/md';
import Logo from '../images/bitlogo.png';

const FacultyNavbar = () => {
  const navItems = [
    { to: '/facultydashboard', label: 'Dashboard', icon: <MdDashboard size={20} /> },
    { to: '/qbdetailsf', label: 'QB Details', icon: <MdDescription size={20} /> },
    { to: '/manageqb', label: 'Manage QB', icon: <MdLibraryBooks size={20} /> },
  ];

  return (
    <nav className="w-64 h-screen fixed bg-white shadow-lg flex flex-col p-5 gap-10">
      <div>
        <img className="w-32 h-32 ml-10" src={Logo} alt="BIT LOGO" />
      </div>

      <ul className="flex flex-col font-semibold text-gray-500 gap-4 text-left pl-4">
        {navItems.map((item) => (
          <NavLink
            to={item.to}
            key={item.to}
            className={({ isActive }) =>
              `px-4 py-2 rounded-md transition-all duration-200 flex items-center gap-3 ${
                isActive ? 'bg-blue-500 text-white' : 'hover:bg-blue-500 hover:text-white'
              }`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </ul>

      <NavLink
        to="/"
        className="font-semibold text-gray-500 hover:text-black mt-auto flex items-center gap-3 pl-4 ml-8"
      >
        <MdLogout size={20} />
        Logout
      </NavLink>
    </nav>
  );
};

export default FacultyNavbar;
