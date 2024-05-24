import React, { useState, useContext } from 'react';
import axios from 'axios';
import { Modal, Button, Form } from 'react-bootstrap';
import { useOutletContext } from "react-router-dom";
import defaultPhoto from '../img/shark.png'
import { TeacherContext } from '../context/teacherContext';
import { useNavigate } from 'react-router-dom';
import { Prev } from 'react-bootstrap/esm/PageItem';


function AdminTeachers() {
    const [refresh, setRefresh] = useState(0);
    const [users, setRefreshData] = useOutletContext();
    const [showModal, setShowModal] = useState(false);
    const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'teacher'
    });
    const teachers = users ? users.filter(user => user.role === "teacher") : [];
    const { username, email, password, role } = formData;
    const Navigate = useNavigate();
    const {setTeacher} = useContext(TeacherContext)

    const toggleModal = (teacher) => {
        setShowModal(!showModal);
        setSelectedTeacher(teacher);
    };

    const toggleAddTeacherModal = () => {
        setShowAddTeacherModal(!showAddTeacherModal);
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const addTeacher = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post("http://localhost:4000/register-admin", { username, email, password, role });
            setRefreshData(prev => prev + 1)
            toggleAddTeacherModal()
        } catch (error) {
            if (error.response) {
                alert(`Error: ${error.response.data.message}`);
            } else if (error.request) {
                alert('No response received from the server');
            } else {
                alert('Error setting up the request');
            }
        }
    };

    const deleteUser = async (email) => {
        const confirmed = window.confirm(`Are you sure you want to delete the user with email: ${email}?`);
        if (confirmed) {
            try {
                const res = await axios.delete("http://localhost:4000/delete-user", { data:{email} });
                setRefreshData(prev => prev + 1)
                setShowModal(false);
                console.log('User has been deleted:', res.data);
            } catch (error) {
                console.error('Error deleting user:', error);
            }
        } else {
            console.log('Deletion cancelled by user.');
        }
    };

    const teachersPage = (selectedTeacher) => {
        setTeacher(selectedTeacher)
        localStorage.setItem('teacher', JSON.stringify(selectedTeacher));
        Navigate("../teacherprofile")
    };

    const filteredTeachers = teachers.filter(teacher =>
        teacher.email.toLowerCase().includes(searchQuery.toLowerCase())
    ).sort((a, b) => a.username.localeCompare(b.username));

    return (
        <div className="student-container">
            <div className='students-header'>
                <div>
                    <p>Manage Teachers</p>
                    <h1>Teachers</h1>
                </div>
                <div style={{ display: "flex", flexDirection: "row", gap: "10px", alignSelf: "flex-end" }}>
                    <p>{teachers.length} Teachers</p>
                    <input
                        type="text"
                        placeholder='search email'
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button onClick={toggleAddTeacherModal} type="button" className="btn btn-outline-primary btn-sm">+ ADD teacher</button>
                </div>
            </div>
            <hr />
            {filteredTeachers.map(teacher => (
                <div key={teacher.id}>
                    <div className="student">
                        <div className="student-info">
                            <img className='student-img' src={teacher.profilePicture === '' ? defaultPhoto : teacher.profilePicture} alt="" />
                            <strong>{teacher.username}</strong>
                            <p>{teacher.email}</p>
                        </div>
                        <div className="actions">
                            <button type="button" className="btn btn-secondary" onClick={() => toggleModal(teacher)}>Actions</button>
                        </div>
                    </div>
                    <hr />
                </div>
            ))}
            <Modal className="modal-container" show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Actions</Modal.Title>
                </Modal.Header>
                <Modal.Body className="modal-content">
                    {selectedTeacher && (
                        <>
                            <div className="modal-student-info">
                                <img className='logo' src={selectedTeacher.profilePicture} alt="" />
                                <strong>Username:{selectedTeacher.username}</strong>
                                <p>Email:{selectedTeacher.email}</p>
                                <p>Phone Number:{selectedTeacher.phoneNumber}</p>
                                <p>ID:{selectedTeacher._id}</p>
                                <p>Role: {selectedTeacher.role}</p>
                            </div>
                        </>
                    )}
                    <div className="modal-footer">
                        <Button onClick={() => teachersPage(selectedTeacher)} variant="primary">View Profile</Button>
                        <Button variant="primary">Message</Button>
                        <Button onClick={() => deleteUser(selectedTeacher.email)} variant="danger">Delete</Button>
                    </div>
                </Modal.Body>
            </Modal>


            {/* Second Modal for Adding Teacher */}
            <Modal show={showAddTeacherModal} onHide={toggleAddTeacherModal} className="modal-container">
                <Modal.Header closeButton>
                    <Modal.Title>Add Teacher</Modal.Title>
                </Modal.Header>
                <Modal.Body className="modal-content">
                    <Form onSubmit={(e) => addTeacher(e)}>
                        <Form.Group controlId="formUsername">
                            <Form.Label>Username</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter username"
                                name="username"
                                value={formData.username}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="formEmail">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="Enter email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="formPassword">
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Enter password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>
                        <div className="modal-footer">
                            <Button
                                variant="secondary"
                                className="button secondary-button"
                                onClick={toggleAddTeacherModal}
                            >
                                Close
                            </Button>
                            <Button
                                variant="primary"
                                type="submit"
                                className="button primary-button"
                            >
                                Add Teacher
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
}

export default AdminTeachers;
