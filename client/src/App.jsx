// App.js
import React, {useContext, useEffect} from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { AuthContext } from './context/authContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import AdminStudents from './components/AdminStudents';
import AdminDashboard from './components/AdminDashboard';
import AdminCohorts from './components/AdminCohorts';
import AdminTeachers from './components/AdminTeachers'
import Home from './Pages/Home';
import EditCohort from './components/EditCohort';
import CohortFiles from './components/CohortFiles';
import StudentProfile from './components/StudentProfile';
import TeacherProfile from './components/TeacherProfile';
import DiscussionBoard from './components/DiscussionBoard';
import Post from './components/Post';
import StudentDashboard from './components/StudentDashboard';
import StudentCourses from './components/StudentCourses';
import LoginRegistration from './Pages/RegisterLogin';
import EditStudent from './components/EditStudent';
import EditTeacher from './components/EditTeacher';
import Messages from './components/Messages';
import { Socket, io } from 'socket.io-client';

const App = () => {
  const { currentUser, setIsLoggedIn } = useContext(AuthContext);
  const ProtectedRoute = ({ children }) => {
    if (!currentUser) {
      return <Navigate to="/" />;
    }
    return children;
  };

  const SuperAdminRoute = ({ children }) => {
    if(currentUser.role !== 'SuperAdmin'){
      return <Navigate to="/"/>;
    }
    return children
  };


  return (
    <BrowserRouter>
      <Routes>
        <Route path="/">
          <Route index element={<LoginRegistration/>} />
          <Route path="home" element={<ProtectedRoute><Home /></ProtectedRoute>}>
            <Route path="admindashboard" element={<SuperAdminRoute> <AdminDashboard /> </SuperAdminRoute>}/>  
            <Route path="adminstudents" element={<SuperAdminRoute><AdminStudents /></SuperAdminRoute>}/>
            <Route path="adminsteachers" element={<SuperAdminRoute><AdminTeachers /></SuperAdminRoute>}/>
            <Route path="admincohorts" element={<SuperAdminRoute><AdminCohorts /></SuperAdminRoute>}/>
            <Route path="editCohort" element={<EditCohort />}/>
            <Route path="studentprofile" element={<StudentProfile />} />
            <Route path="teacherprofile" element={<TeacherProfile />}/>
            <Route path="teacherprofile" element={<TeacherProfile />}/>
            <Route path="cohortfiles" element={<CohortFiles />}/>
            <Route path='discussionboard' element={<DiscussionBoard />}/> 
            <Route path='post' element={<Post />}/>
            <Route path="dashboard" element={<StudentDashboard />}/>
            <Route path="courses" element={<StudentCourses />}/>
            <Route path="edit-student" element={<EditStudent />} />
            <Route path="edit-teacher" element={<EditTeacher />} />
            <Route path="messages" element={<Messages />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
