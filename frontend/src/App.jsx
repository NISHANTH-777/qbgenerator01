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
import AddQuestions from './components/pages/faculty/AddQuestions';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children,role }) => {
  const user = localStorage.getItem('user');
  if ((user || user.role == role) ) {
    return children;
    }
    return <Navigate to="/" />
  };

 


const App = () => {
  return (
   <Router>
    <Routes>
      <Route path="/" element={<LoginPage/>} />
      <Route 
        path="/admindashboard" 
         element={
        <ProtectedRoute role="admin">
        <Admindashboard />
      </ProtectedRoute>
       } 
       />
      <Route
      path="/facultylist" 
      element={
        <ProtectedRoute role="admin">
        <FacultyList />
      </ProtectedRoute>
      } 
      />
      <Route
       path="/generateqb" 
       element={
        <ProtectedRoute role="admin">
        <GenerateQB />
      </ProtectedRoute>
       } 
       />
      <Route
       path="/qbdetails" 
       element={
        <ProtectedRoute role="admin">
        <QuestionDetails />
      </ProtectedRoute>
       } 
       />
      <Route
      path='/facultydashboard' 
      element={
        <ProtectedRoute role="faculty">
        <FacultyDashboard />
      </ProtectedRoute>
       } 
      />
      <Route 
      path='/manageqb' 
      element={
        <ProtectedRoute role="faculty">
        <ManageQB />
      </ProtectedRoute>
       }
      />
      <Route
       path="/qbdetailsf" 
       element={
        <ProtectedRoute role="faculty">
        <QBDetails />
      </ProtectedRoute>
       }
      />
      <Route 
      path='/addquestions' 
      element={
        <ProtectedRoute role="faculty">
        <AddQuestions />
      </ProtectedRoute>
       }
      />
    </Routes>
   </Router>
  )
}

export default App