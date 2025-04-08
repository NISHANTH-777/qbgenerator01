import React, { useState } from 'react';
import Checkbox from '@mui/material/Checkbox';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import { MdVisibility, MdVisibilityOff } from 'react-icons/md';
import banner from '../images/bitbanner.png';
import google from '../images/google.png';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [clicked, setClicked] = useState(false);
  const navigate = useNavigate(); 

  const handlechangeclick = (e) => {
    e.preventDefault(); // prevent form reload
    setClicked(!clicked);
    navigate('/admindashboard'); 
  };

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white rounded-2xl shadow-lg flex flex-col items-center w-[500px] py-10 px-6 mt-10 mb-10">
        <div>
          <img className="w-[450px] h-20 rounded-full" src={banner} alt="BIT LOGO" />
        </div>

        <div className="mt-8 flex flex-col items-center gap-4 w-[400px]">
          <h1 className="font-bold text-xl">Welcome Back..</h1>
          <div className="flex flex-row justify-center gap-4 text-base items-center border-2 rounded-lg w-full h-[55px] border-gray-300 mt-2 px-6 cursor-pointer">
            <img className="w-8 h-8" src={google} alt="Google Logo" />
            <h2 className="font-semibold">Sign in with Google</h2>
          </div>

          <div className="flex items-center w-[400px] my-4">
            <hr className="flex-grow border-t border-black" />
            <span className="px-4 text-black font-semibold">OR</span>
            <hr className="flex-grow border-t border-black" />
          </div>
        </div>

        <form className="flex flex-col gap-4 w-[400px]" onSubmit={handlechangeclick}>
          <input
            type="text"
            className="border-2 border-gray-300 w-full p-3 rounded-lg"
            placeholder="Username"
            required
          />

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              className="border-2 border-gray-300 w-full p-3 pr-12 rounded-lg"
              placeholder="Password"
              required
            />
            <IconButton
              onClick={handleTogglePassword}
              className="!absolute top-1/2 right-2 transform -translate-y-1/2"
              size="small"
            >
              {showPassword ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}
            </IconButton>
          </div>

          <div className="flex items-center mt-1">
            <Checkbox />
            <span className="text-lg font-semibold text-black">Remember me</span>
          </div>

          <Tooltip title="CLICK HERE TO LOGIN" enterDelay={500} leaveDelay={300}>
            <button
              type="submit"
              className="bg-blue-500 w-full p-3 rounded-lg text-white mt-2 hover:bg-blue-700"
            >
              LOGIN
            </button>
          </Tooltip>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
