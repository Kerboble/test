import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { checkAndRenewToken } from '../utilities/checkToken'


const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  let existingUser = localStorage.getItem('currentUser')
  const [currentUser, setCurrentUser] = useState(existingUser ? JSON.parse(existingUser) : null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const localRefreshToken = localStorage.getItem('refreshToken');
  const [refreshUserData, setRefreshUserData ] = useState(0);

  
  useEffect(() => {
    const fetchData = async () => {
      console.log('fetched user data again')
      if (currentUser !== null) {
        setIsLoggedIn(true);
      } else {
        await checkAndRenewToken();
        const accessToken = localStorage.getItem('accessToken');
        try {
          const res = await axios.post('http://localhost:4000/userData', { refreshToken: localRefreshToken }, {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          });
          localStorage.removeItem('currentUser')
          setCurrentUser(res.data);
          localStorage.setItem('currentUser', JSON.stringify(res.data));
          setIsLoggedIn(true);
        } catch (error) {
          console.error(error);
        }
      }
    };

    fetchData();
  }, [existingUser, refreshUserData]);


  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser, setIsLoggedIn, setRefreshUserData }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
