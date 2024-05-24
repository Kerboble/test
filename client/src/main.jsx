import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { AuthProvider } from './context/authContext.jsx';
import { CohortContextProvider } from './context/cohortContext.jsx'; // Import the CohortContextProvider
import './style.scss';
import { StudentContextProvider } from './context/studentContext.jsx';
import { TeacherContextProvider } from './context/teacherContext.jsx';
import { PostContextProvider } from './context/postContext';
import { ChatContextProvider } from './context/chatContext.jsx';
import { SocketContextProvider } from './context/socketContext.jsx';
import './login.scss'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <CohortContextProvider>
      <StudentContextProvider>
        <TeacherContextProvider>
          <PostContextProvider>
            <ChatContextProvider>
              <SocketContextProvider>
                <App />
              </SocketContextProvider>
            </ChatContextProvider>
          </PostContextProvider>
        </TeacherContextProvider>
      </StudentContextProvider>
      </CohortContextProvider>
    </AuthProvider>
  </React.StrictMode>
);
