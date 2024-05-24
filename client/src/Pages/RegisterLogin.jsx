import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/authContext';
import Globe from "../img/globe(2).png";
import loader from "../img/world-book-day.gif";

const LoginRegistration = () => {
  const { setIsLoggedIn } = React.useContext(AuthContext);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [isLoginForm, setIsLoginForm] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    confirmPassword: '',
    profilePicture: null,
    firstName: '',
    lastName: ''
  });

  const { username, password, email, confirmPassword, profilePicture, firstName, lastName } = formData;

  const toggleForm = () => {
    setIsLoginForm((prevIsLoginForm) => !prevIsLoginForm);
  };

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onFileChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, profilePicture: file });
  };

  const handleLogin = async () => {
    try {
      setLoading(true);
      const res = await axios.post('http://localhost:4000/login', { username, password });
      const { accessToken, refreshToken, user } = res.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('currentUser', JSON.stringify(user));
      setIsLoggedIn(true);
      
      // Update user's online status after successful login
      await axios.put('http://localhost:4000/update-online-status', { username });
  
      setTimeout(() => {
        navigate("/home");
        setLoading(false); // Set loading to false after the login process is complete
      }, 2000);
    } catch (err) {
      console.error('Login error:', err.response.data);
      setLoading(false); // Set loading to false if there's an error during login
    }
  };
  

  const handleRegistration = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      console.error('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('username', username);
      formDataToSend.append('email', email);
      formDataToSend.append('password', password);
      formDataToSend.append('profilePicture', profilePicture);
      formDataToSend.append('firstName', firstName);
      formDataToSend.append('lastName', lastName);
      
      setLoading(true);
      
      const res = await axios.post('http://localhost:4000/register', formDataToSend);
      toggleForm();
      setLoading(false);
    } catch (err) {
      console.error('Registration error:', err.response ? err.response.data : err.message);
      setLoading(false);
    }
  };

  return (
    <div className={`container ${isLoginForm ? '' : 'active'}`} id="container">
      <div className="form-container sign-up">
        <form onSubmit={handleRegistration}>
          <img className='login-logo' src={Globe} alt="" />
          <h1>Create Account</h1>
          <input type="text" name="firstName" value={firstName} onChange={onChange} placeholder="First Name" />
          <input type="text" name="lastName" value={lastName} onChange={onChange} placeholder="Last Name" />
          <input type="text" name="username" value={username} onChange={onChange} placeholder="Username" />
          <input type="email" name="email" value={email} onChange={onChange} placeholder="Email" />
          <input type="password" name="password" value={password} onChange={onChange} placeholder="Password" />
          <input type="password" name="confirmPassword" value={confirmPassword} onChange={onChange} placeholder="Confirm Password" />
          <input type="file" name="profilePicture" onChange={onFileChange} />
          <button>Sign Up</button>
        </form>
      </div>
      <div className="form-container sign-in">
        <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
          {loading && <img className='loading-gif' src={loader} alt="Loader" />}
          {!loading && (
            <>
              <img className='login-logo' src={Globe} alt="" />
              <h1>Sign In</h1>
              <input type="text" name="username" value={username} onChange={onChange} placeholder="Username" />
              <input type="password" name="password" value={password} onChange={onChange} placeholder="Password" />
              <a href="#">Forget Your Password?</a>
              <button type="submit">Sign in</button>
            </>
          )}
        </form>
      </div>
      <div className="toggle-container">
        <div className="toggle">
          <div className={`toggle-panel toggle-left ${isLoginForm ? 'active' : ''}`}>
            <h1>Already Have an account?</h1>
            <p>Enter your credentials to login</p>
            <button className="hidden" id="login" onClick={toggleForm}>Sign up here</button>
          </div>
          <div className={`toggle-panel toggle-right ${isLoginForm ? '' : 'active'}`}>
            <h1>Already Have Account?</h1>
            <p>Register with your personal details to use all of site features</p>
            <button className="hidden" id="register" onClick={toggleForm}>Sign In</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginRegistration;
