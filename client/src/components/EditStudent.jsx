import React, { useState, useContext } from 'react';
import { StudentContext } from '../context/studentContext';
import user from "../img/user(2).png";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import transfer from "../img/transfer-file.gif"
import { AuthContext } from '../context/authContext';
import { useOutletContext } from 'react-router-dom';

function EditStudent() {
    const { student, setStudent } = useContext(StudentContext);
    const [users, setRefreshData] = useOutletContext();
    const {setCurrentUser, setRefreshUserData, currentUser} = useContext(AuthContext);
    const [avatar, setAvatar] = useState('');
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        dob: '',
        email: '',
        phoneNumber: '',
        address: '',
        profilePicture: null, // Initialize profilePicture as null
        role: 'student' // Default role is 'student'
    });
    const id = student._id;
    const Navigate = useNavigate();
    const { firstName, lastName, dob, email, phoneNumber, address, profilePicture, role } = formData;
    const [transferring, setTransferring] = useState(false)

    const onFileChange = (e) => {
        const file = e.target.files[0];
        setFormData({ ...formData, profilePicture: file }); // Set the file itself in formData
        const reader = new FileReader();
        reader.onload = () => {
            setAvatar(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const removeFile = () => {
        setFormData({ ...formData, profilePicture: null });
        setAvatar(null);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setTransferring(true);
    
        try {
            if (profilePicture === null) {
                // Update user without profile picture
                const res = await axios.put('http://localhost:4000/edit-user-no-photo', { 
                    firstName, 
                    lastName, 
                    dob, 
                    email, 
                    phoneNumber, 
                    address, 
                    role, 
                    id 
                });
                
                if (currentUser.role !== 'SuperAdmin') {
                    setCurrentUser(res.data.user);
                    localStorage.setItem('currentUser', JSON.stringify(res.data.user));
                }
    
                await updateUserInCohorts(id, firstName, lastName, null);
                await updateMyContacts(id, firstName, lastName, null);
            } else {
                // Update user with profile picture
                const formDataToSend = new FormData();
                formDataToSend.append('firstName', firstName);
                formDataToSend.append('lastName', lastName);
                formDataToSend.append('dob', dob);
                formDataToSend.append('email', email);
                formDataToSend.append('phoneNumber', phoneNumber);
                formDataToSend.append('address', address);
                formDataToSend.append('profilePicture', profilePicture);
                formDataToSend.append('role', role);
                formDataToSend.append('id', student._id);
    
                const res = await axios.put('http://localhost:4000/edit-user', formDataToSend, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
    
                if (currentUser.role !== 'SuperAdmin') {
                    setCurrentUser(res.data.user);
                    localStorage.setItem('currentUser', JSON.stringify(res.data.user));
                }
    
                const profilePictureUrl = res.data.user.profilePicture; // Assuming the response contains the updated profilePicture URL
    
                await updateUserInCohorts(id, firstName, lastName, profilePictureUrl);
                await updateMyContacts(id, firstName, lastName, profilePictureUrl);
                await updateParticipantInfo(id, firstName, lastName, profilePictureUrl);
            }
    
            setTransferring(false);
            setTimeout(() => {
                setTransferring(false);
            }, 1000);
    
        } catch (error) {
            console.error('Error updating user:', error);
            setTransferring(false);
        }
    };
    
    const updateUserInCohorts = async (id, firstName, lastName, profilePicture) => {
        try {
            await axios.put('http://localhost:4000/updateUserInCohorts', {
                id,
                firstName,
                lastName,
                profilePicture
            });
        } catch (error) {
            console.error('Error updating user in cohorts:', error);
        }
    };
    
    const updateMyContacts = async (id, firstName, lastName, profilePicture) => {
        try {
            await axios.put('http://localhost:4000/update-my-contact-info', {
                id,
                firstName,
                lastName,
                photo: profilePicture
            });
        } catch (error) {
            console.error('Error updating user data in contacts:', error);
        }
    };

    const updateParticipantInfo = async (id, firstName, lastName, profilePicture) => {
        try {
            await axios.put('http://localhost:4000/update-participant-info', {
                id,
                firstName,
                lastName,
                photo: profilePicture
            });
        } catch (error) {
            console.error('Error updating user data in contacts:', error);
        }
    };
    
    
    
        

    return (
        <div className='edit-student-container'>
            <div className="edit-student-wrapper">
            <button onClick={() => {Navigate(-1)}} className='btn btn-success'>Done</button>
                {transferring && <img className='transferring' src={transfer}/> }
                {!transferring && 
                <>
                <div className="add-photo">
                    <input onChange={onFileChange} type="file" name="file" id="file" />
                    {avatar && <img src={avatar} />}
                    {!avatar && student.profilePicture && <img src={student.profilePicture} alt="" />}
                    {!avatar && !student.profilePicture && <img src={user} alt="" />}
                    <div className="photo-buttons">
                        <label htmlFor='file' className='btn btn-primary' >Choose file</label>
                        <button onClick={() => removeFile()} className='btn btn-danger'>Remove</button>
                    </div>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="input-container">
                        <div className="row">
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label htmlFor="firstName">First Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="firstName"
                                        name="firstName"
                                        placeholder="Enter First Name"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label htmlFor="lastName">Last Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="lastName"
                                        name="lastName"
                                        placeholder="Enter Last Name"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label htmlFor="dob">Date of Birth</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        id="dob"
                                        name="dob"
                                        value={formData.dob}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label htmlFor="email">Email</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        id="email"
                                        name="email"
                                        placeholder="Enter Email"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label htmlFor="phoneNumber">Phone Number</label>
                                    <input
                                        type="tel"
                                        className="form-control"
                                        id="phoneNumber"
                                        name="phoneNumber"
                                        placeholder="Enter Phone Number"
                                        value={formData.phoneNumber}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-12">
                                <div className="form-group">
                                    <label htmlFor="address">Address</label>
                                    <textarea
                                        className="form-control"
                                        id="address"
                                        name="address"
                                        rows="3"
                                        placeholder="Enter Address"
                                        value={formData.address}
                                        onChange={handleChange}
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary">Submit</button>
                    </div>
                </form>
                </>
                }
            </div>
        </div>
    );
}

export default EditStudent;
