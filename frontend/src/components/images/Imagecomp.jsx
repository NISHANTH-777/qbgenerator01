import React, { useState, useEffect} from 'react';
import Profile from './profile.png';
import { useNavigate } from 'react-router-dom';

export const Imagecomp = () => {
const user = JSON.parse(localStorage.getItem('user'));   
  const [openProfileModal, setOpenProfileModal] = useState(false);
  const [clicked, setClicked] = useState(false);
  const navigate = useNavigate();
const handlechangeclick = () => {
    setClicked(!clicked);
    navigate('/');
  }; 
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
                              src={Profile}
                              alt="Profile"
                              className="w-24 h-24 rounded-full mx-auto mb-6 border-2 border-gray-300"
                            />
                            <div className="text-left text-base font-medium text-gray-800 space-y-3 leading-relaxed">
                              <p><span className="font-semibold">Name:</span> Daniel M</p>
                              <p><span className="font-semibold">Faculty ID:</span> 12345</p>
                              <p><span className="font-semibold">Subject:</span> F.O.C</p>
                              <p><span className="font-semibold">Department:</span> C.S.E</p>
                              <p><span className="font-semibold">Email ID:</span> danielm7708@bitsathy.ac.in</p>
                              <p><span className="font-semibold">Phone No:</span> 0123456789</p>
                            </div>
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
