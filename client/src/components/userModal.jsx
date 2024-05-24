import React, { useState, useEffect } from 'react';
import axios from 'axios';

function UserModal({ isOpen, onClose }) {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [refresh, setRefresh] = useState(false); // State variable to trigger refresh

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('http://localhost:4000/users');
        setUsers(response.data);
      } catch (error) {
        setError(error);
      } finally {
        setIsLoading(false);
        setRefresh(false); // Reset refresh after fetching users
      }
    };

    if (isOpen || refresh) { // Trigger fetchUsers if isOpen or refresh is true
      fetchUsers();
    }
  }, [isOpen, refresh]); // Add refresh as a dependency

  const changeUserRole = async (email, role) => {
    try {
      const res = await axios.post('http://localhost:4000/make-super-admin', { email, role });
      console.log(`user was set to the role of ${role}`);
      setRefresh(true); // Trigger refresh after changing user role
    } catch (error) {
      console.error('was unable to set users role');
    }
  };

  const deleteUser = async (email) => {
    const confirmation = window.confirm(`Are you sure you want to delete user with the email: ${email}?`)
    if (confirmation) {
      try {
        const response = await axios.post('http://localhost:4000/delete-user', { email });

        if (response.status === 200) {
          console.log('User was deleted successfully');
          setRefresh(true); // Trigger refresh after deleting user
        } else {
          console.error('Failed to delete user:', response.data);
        }
      } catch (error) {
        console.error('An error occurred while deleting user:', error.message);
      }
    } else {
      console.log('cancelling deletion of user')
    }
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`modal fade ${isOpen ? 'show' : ''}`} style={{ display: isOpen ? 'block' : 'none' }}>
      <div className="modal-dialog modal-lg"> 
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">User List Modal</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body" style={{ maxHeight: '50vh', overflowY: 'auto' }}> 
            <input
              type="text"
              className="form-control mb-3"
              placeholder="Search users email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {filteredUsers.map(user => (
              <div className='all-users' key={user.email} style={{ gap: '10px' }}>
                <img className='modal-avatar' width={100} height={100} src={user.profilePicture} alt="" />
                <p> <strong>Username</strong>: {user.username}</p>
                <p> <strong>Email</strong>: {user.email}</p>
                <p> <strong>Current Role:</strong> {user.role}</p>
                <div className='modal-buttons'>
                  <div className='role-buttons'>
                    <button className="btn btn-warning btn-sm" onClick={() => changeUserRole(user.email, 'SuperAdmin')}>Make  SuperAdmin</button>
                    <button className="btn btn-dark btn-sm" onClick={() => changeUserRole(user.email, 'Admin')}>Make admin</button>
                    <button className="btn btn-primary btn-sm" onClick={() => changeUserRole(user.email, 'Teacher')}>Make Teacher</button>
                    <button className="btn btn-success btn-sm" onClick={() => changeUserRole(user.email, 'Student')}>Make Student</button>
                  </div>
                  <div className="delete-button">
                    <button className="btn btn-danger btn-sm" onClick={() => deleteUser(user.email)}>Delete</button>
                  </div>
                </div>
                <hr />
              </div>
            ))}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserModal;
