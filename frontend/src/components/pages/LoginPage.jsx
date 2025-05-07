import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setUser } from '../../store/userSlice'; // Import the action to set user in Redux
import { useNavigate } from 'react-router-dom';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import { MdVisibility, MdVisibilityOff } from 'react-icons/md';
import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from "../../firebase";
import axios from 'axios';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  // Handle manual login
  const handleManualLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post('http://localhost:7000/api/auth/manual-login', {
        email,
        password,
      });

      if (res.data.success) {
        // Store the token in localStorage
        localStorage.setItem('token', res.data.token);

        // Dispatch user data to Redux store
        dispatch(setUser({
          email: res.data.user.email,
          role: res.data.user.role,
        }));

        // Navigate based on user role
        if (res.data.user.role === "admin") {
          navigate('/admindashboard');
        } else if (res.data.user.role === "faculty") {
          navigate('/facultydashboard');
        } else {
          navigate('/');
        }
      } else {
        alert(res.data.message || 'Invalid credentials');
      }
    } catch (err) {
      console.error('Error during manual login:', err);
      alert('Login failed. Please check your credentials and try again.');
    }
  };

  // Handle Google login
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const res = await axios.post('http://localhost:7000/api/auth/check-user', {
        email: user.email,
      });

      if (res.data.exists) {
        // Store the token in localStorage
        localStorage.setItem('token', res.data.token);

        // Dispatch user data to Redux store
        dispatch(setUser({
          email: user.email,
          name: user.displayName,
          role: res.data.role,
          course_code: res.data.course_code,
          photoURL: user.photoURL,
        }));

        // Navigate based on role
        if (res.data.role === 'admin') {
          navigate('/admindashboard');
        } else if (res.data.role === 'faculty') {
          navigate('/facultydashboard');
        }
      } else {
        alert('You are not registered. Please contact the administrator.');
      }
    } catch (error) {
      console.error("Google sign-in error:", error);
      alert('Google login failed. Please try again.');
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    dispatch(setUser({})); // Clear user data from Redux
    navigate('/login');
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white rounded-2xl shadow-lg flex flex-col items-center w-full max-w-lg py-10 px-6 mt-10 mb-10">
        <img className="w-full h-20 object-contain rounded-full mb-6" src="/bitbanner.png" alt="BIT LOGO" />

        <div className="mt-8 flex flex-col items-center gap-4 w-full">
          <h1 className="font-bold text-xl">Welcome Back..</h1>

          <div
            className="flex flex-row justify-center gap-4 text-base items-center border-2 rounded-lg w-full h-[55px] border-gray-300 mt-2 px-6 cursor-pointer hover:shadow-md"
            onClick={handleGoogleLogin}
          >
            <img className="w-8 h-8" src="/google.png" alt="Google Logo" />
            <h2 className="font-semibold">Sign in with Google</h2>
          </div>

          <div className="flex items-center w-full my-4">
            <hr className="flex-grow border-t border-black" />
            <span className="px-4 text-black font-semibold">OR</span>
            <hr className="flex-grow border-t border-black" />
          </div>
        </div>

        <form className="flex flex-col gap-4 w-full" onSubmit={handleManualLogin}>
          <input
            type="text"
            className="border-2 border-gray-300 w-full p-3 rounded-lg"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              className="border-2 border-gray-300 w-full p-3 pr-12 rounded-lg"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

          <Tooltip title="Click to log in" enterDelay={500} leaveDelay={200}>
            <button type="submit" className="bg-blue-500 w-full p-3 rounded-lg text-white mt-2">Login</button>
          </Tooltip>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
