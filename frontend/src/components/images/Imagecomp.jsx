import React, { useState, useEffect} from 'react';
import Profile from './profile.png';
import { useNavigate } from 'react-router-dom';
import axios from "axios";

export const Imagecomp = () => {
const user = JSON.parse(localStorage.getItem('user'));   
  const [openProfileModal, setOpenProfileModal] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [facultyData, setFacultyData] = useState(null);
  const navigate = useNavigate();
  const handlechangeclick = () => {
      setClicked(!clicked);
      navigate('/');
      localStorage.removeItem('user')
    }; 
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.email) {
      axios
        .get(`http://localhost:7000/faculty-data?email=${user.email}`)
        .then((res) => {
          if (res.data.length > 0) {
            setFacultyData(res.data[0]);
          }
        })
        .catch((err) => console.error("Error fetching faculty data:", err));
    }
  }, []);
  
    return(
        <div>
              {user?.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt="Profile"
                          style={{ width: 60, height: 60, borderRadius: '50%', cursor: 'pointer' }}
                          onClick={() => setOpenProfileModal(true)}
                        />
                      ) : (
                        <img
                          src={Profile}
                          alt="ADMIN"
                          className="w-14 h-14 rounded-full cursor-pointer"
                          onClick={() => setOpenProfileModal(true)}
                        />
                      )}
            
            {openProfileModal && (
  <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm z-50 flex items-center justify-end">
    <div className="bg-white w-[360px] p-8 rounded-2xl relative shadow-xl text-center mr-10 animate-slide-in">
      <button
        className="absolute top-4 right-5 text-2xl text-gray-500 hover:text-black"
        onClick={() => setOpenProfileModal(false)}
      >
        ×
      </button>
      <img
         src={user.photoURL}
        alt="Profile"
        className="w-24 h-24 rounded-full mx-auto mb-6 border-2 border-gray-300"
      />
      {facultyData && (
        <div className="text-left text-base font-medium text-gray-800 space-y-3 leading-relaxed">
          <p><span className="font-semibold">Name:</span> {facultyData.faculty_name}</p>
          <p><span className="font-semibold">Faculty ID:</span> {facultyData.faculty_id}</p>
          <p><span className="font-semibold">Subject:</span> {facultyData.subject_name}</p>
          <p><span className="font-semibold">Course Code:</span> {facultyData.course_code}</p>
          <p><span className="font-semibold">Email ID:</span> {facultyData.email}</p>
          <p><span className="font-semibold">Phone No:</span> N/A</p>
        </div>
      )}
      <button
        className="mt-8 w-full bg-blue-500 text-white font-semibold py-3 rounded-md hover:bg-blue-600 transition"
        onClick={handlechangeclick}
      >
        LOGOUT
      </button>
    </div>
  </div>
)}

        </div>
    )
}
