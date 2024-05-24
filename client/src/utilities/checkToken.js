// checkToken.js
import {jwtDecode } from 'jwt-decode';
import axios from 'axios';

export async function checkAndRenewToken() {
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
 
  if (!accessToken || !refreshToken) {
    // No tokens available, redirect to login
    return;
  }

  try {
    // Decode the access token to get the expiration time
    const decodedToken = jwtDecode (accessToken);
    const currentTime = Date.now() / 1000; // Convert milliseconds to seconds
  
    if (decodedToken.exp < currentTime) {
      // Access token has expired, renew it
      console.log('TOKEN WAS EXPIRED, A NEW TOKEN WAS GENERATED')
      const res = await axios.post('http://localhost:4000/refresh-token', { refreshToken });
      const newAccessToken = res.data.accessToken;
      localStorage.setItem('accessToken', newAccessToken);
    }
  } catch (error) {
    console.error('Token check and renew error:', error.response.data);
  }
};
