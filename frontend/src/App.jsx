import React from 'react';
import LoginPage from './components/pages/LoginPage';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Admindashboard from './components/pages/admin/AdminDashboard';
import FacultyList from './components/pages/admin/FacultyList';
import GenerateQB from './components/pages/admin/GenerateQB';
import QuestionDetails from './components/pages/admin/QuestionDetails';
import FacultyDashboard from './components/pages/faculty/FacultyDashboard';
import ManageQB from './components/pages/faculty/ManageQB';
import QBDetails from './components/pages/faculty/QBDetails';

const App = () => {
  return (
   <Router>
    <Routes>
      <Route path="/" element={<LoginPage/>} />
      <Route path="/admindashboard" element={<Admindashboard/>} />
      <Route path="/facultylist" element={<FacultyList />} />
      <Route path="/generateqb" element={<GenerateQB />} />
      <Route path="/qbdetails" element={<QuestionDetails/>} />
      <Route path='/facultydashboard' element={<FacultyDashboard />}/>
      <Route path='/manageqb' element={<ManageQB />} />
      <Route path="/qbdetailsf" element={<QBDetails />} />
    </Routes>
   </Router>
  )
}

export default App