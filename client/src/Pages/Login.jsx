import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sphere from "../img/globe(2).png"
import { AuthContext } from '../context/authContext';
import BigSphere from "../img/globe(1).png"
import Loading from '../components/Loading';

const Login = (props) => {
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(true); // State to control form visibility
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const { setIsLoggedIn } = useContext(AuthContext);
  const { username, password } = formData;
  const navigate = useNavigate();

  const onChange = e =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:4000/login', { username, password });
      const { accessToken, refreshToken, user } = res.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('currentUser', JSON.stringify(user));
      toggleFormVisibility()
      setLoading(true);
      setIsLoggedIn(true);
      setTimeout(() => {
        navigate("/home");
        setLoading(false);
      }, 2000);
    } catch (err) {
      console.error('Login error:', err.response.data);
    }
  };

  // Function to toggle form visibility with shrinking effect
  const toggleFormVisibility = () => {
    setShowForm(false);
    // Optionally, you can add a delay before hiding the form completely
    setTimeout(() => {
      setShowForm(false);
    }, 1000); // Adjust the duration as needed
  };

  return (
    <div className='login-container'>
      <div className='centeredContentLeft'> 
        <span className='app-title'> Study Sphere</span>
        <img src={BigSphere} alt="Sphere" className='big-sphere'/> 
      </div>
      <div className='formContainer'>
        {loading ? (
          <div className='loading-login'>
            <Loading />
            <p style={{color:'#023E8A', fontWeight:'bold',}}>Logging you in....</p>
          </div>
        ) : (
          <div className='formWrapper'>
            <span className={`form-message ${showForm ? "visible" : "shrink"}`}>Welcome!</span>
            {showForm && (
              <form
                onSubmit={e => onSubmit(e)}
                className={showForm ? "visible" : "shrink"} // Apply CSS class for transition
              >
                <div className="inputWrapper">
                  <input
                    type="text"
                    id="username"
                    name='username'
                    value={username}
                    onChange={e => onChange(e)}
                    required
                    placeholder='Username'
                  />
                </div>
                <div className="inputWrapper">
                  <input
                    type="password"
                    id="password"
                    name='password'
                    value={password}
                    onChange={e => onChange(e)}
                    minLength='6'
                    required
                    placeholder='Password'
                  />
                </div>
                <button className="login-button" type='submit'>Login</button>
              </form>
            )}
            <p>
              <button onClick={() => navigate("/")}>Signup here</button> 
              <button>Forgot password</button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
