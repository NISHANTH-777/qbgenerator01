import React, { useState } from 'react';
import Checkbox from '@mui/material/Checkbox';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import { MdVisibility, MdVisibilityOff } from 'react-icons/md';
import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from "../../firebase";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  // 🔐 Manual Login
  const handleManualLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post('http://localhost:7000/manual-login', {
        email,
        password
      });

      if (res.data.success) {
        localStorage.setItem('user', JSON.stringify(res.data.user));
        navigate('/admindashboard');
      } else {
        alert(res.data.message || 'Invalid credentials');
      }
    } catch (err) {
      console.error(err);
      alert('Login failed.');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const res = await axios.post('http://localhost:7000/check-user', {
        email: user.email
      });

      if (res.data.exists) {
        localStorage.setItem('user', JSON.stringify({
          email: user.email,
          name: user.displayName,
          role: res.data.role,
          course_code: res.data.course_code,
          photoURL: user.photoURL,
        }));
        navigate('/admindashboard');
      } else {
        alert('You are not registered.');
      }
    } catch (error) {
      console.error("Google sign-in error:", error);
      alert('Google login failed.');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white rounded-2xl shadow-lg flex flex-col items-center w-[500px] py-10 px-6 mt-10 mb-10">
        <img className="w-[450px] h-20 rounded-full"src="/bitbanner.png" alt="BIT LOGO" />

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
            placeholder="email"
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

          <div className="flex items-center gap-2 mt-1">
            <Checkbox />
            <span className="text-sm text-gray-600">Remember me</span>
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
