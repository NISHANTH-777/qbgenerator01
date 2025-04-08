import React from 'react';
import LoginPage from './components/pages/LoginPage';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Admindashboard from './components/pages/admin/AdminDashboard';
import FacultyList from './components/pages/admin/FacultyList';
import GenerateQB from './components/pages/admin/GenerateQB';
import QuestionDetails from './components/pages/admin/QuestionDetails';

const App = () => {
  return (
   <Router>
    <Routes>
      <Route path="/" element={<LoginPage/>} />
      <Route path="/admindashboard" element={<Admindashboard/>} />
      <Route path="/facultylist" element={<FacultyList />} />
      <Route path="/generateqb" element={<GenerateQB />} />
      <Route path="/qbdetails" element={<QuestionDetails/>} />
    </Routes>
   </Router>
  )
}

export default App