import React, { useState, useContext } from 'react';
import user from "../img/user(2).png";
import axios from 'axios';
import { TeacherContext } from '../context/teacherContext'
import transfer from "../img/transfer-file.gif"
import { useNavigate } from 'react-router-dom';


function EditTeacher() {
    const { teacher } = useContext(TeacherContext);
    const [avatar, setAvatar] = useState('');
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        dob: '',
        email: '',
        phoneNumber: '',
        address: '',
        profilePicture: null, // Initialize profilePicture as null
        role: 'teacher' // Default role is 'student'
    });
    const id = teacher._id;
    const [transferring, setTransferring] = useState(false)
    const Navigate = useNavigate()

    const { firstName, lastName, dob, email, phoneNumber, address, profilePicture, role } = formData;

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
        if  (profilePicture === null) {
            setTransferring(true)
            try {
                const res = await axios.put('http://localhost:4000/edit-user-no-photo', {firstName, lastName, dob, email, phoneNumber, address, role, id });
                if(currentUser.role !== 'SuperAdmin'){
                    setCurrentUser(res.data.user)
                    localStorage.removeItem('currentuser')
                    localStorage.setItem('currentuser', JSON.stringify(res.data.user));
                }
                setTimeout(() => {
                    setTransferring(false)
                }, 1000);
            } catch (error) {
                console.error('Error updating user without profile picture:', error);
            }
        } else {
            try {
                setTransferring(true)
                // Construct FormData for request with profilePicture
                const formDataToSend = new FormData();
                formDataToSend.append('firstName', firstName);
                formDataToSend.append('lastName', lastName);
                formDataToSend.append('dob', dob);
                formDataToSend.append('email', email);
                formDataToSend.append('phoneNumber', phoneNumber);
                formDataToSend.append('address', address);
                formDataToSend.append('profilePicture', profilePicture); // Append the profile picture file
                formDataToSend.append('role', role);
                formDataToSend.append('id', teacher._id);

                // Send formData to endpoint for update with profilePicture
                const res = await axios.put('http://localhost:4000/edit-user', formDataToSend, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                if(currentUser.role !== 'SuperAdmin'){
                    setCurrentUser(res.data.user)
                    localStorage.removeItem('currentuser')
                    localStorage.setItem('currentuser', JSON.stringify(res.data.user));
                }
                setTransferring(false)
            } catch (error) {
                console.error('Error updating user with profile picture:', error);
            }
        }
    };
    
        

    return (
        <div className='edit-student-container'>
            <div className="edit-student-wrapper">
            <button type='button' onClick={() => {Navigate(-1)}} className='btn btn-success'>Done</button>
                {transferring && <img className='transferring' src={transfer}/> }
                {!transferring && 
                <>
                <div className="add-photo">
                    <input onChange={onFileChange} type="file" name="file" id="file" />
                    {avatar && <img src={avatar} />}
                    {!avatar && teacher.profilePicture && <img src={teacher.profilePicture} alt="" />}
                    {!avatar && !teacher.profilePicture && <img src={user} alt="" />}
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

export default EditTeacher;
