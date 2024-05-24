import React, { useContext, useState } from 'react';
import axios from 'axios';
import { Modal, Button, Form } from 'react-bootstrap';
import { useOutletContext, Navigate, useNavigate} from "react-router-dom";
import defaultPhoto from "../img/shark.png"
import { StudentContext } from '../context/studentContext';

function AdminStudents() {
    const {setStudent} = useContext(StudentContext);
    const [users, setRefreshData] = useOutletContext();
    const [showModal, setShowModal] = useState(false);
    const [showAddStudentModal, setShowAddStudentModal] = useState(false); // State for the second modal
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });

    const students = users ? users.filter(user => user.role === "student") : [];
    const {username, email, password} = formData;
    const Navigate = useNavigate();
    const toggleModal = (student) => {
        setShowModal(!showModal);
        setSelectedStudent(student);
    };

    const toggleAddStudentModal = () => {
        setShowAddStudentModal(!showAddStudentModal);
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const addStudent = async (e) => {
        e.preventDefault();
        console.log('hello')
        try {
            const res = await axios.post("http://localhost:4000/register-admin", { username, email, password });
            toggleAddStudentModal()
            setRefreshData(prev => prev + 1);
        } catch (error) {
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                alert(`Error: ${error.response.data.message}`);
            } else if (error.request) {
                // The request was made but no response was received
                alert('No response received from the server');
            } else {
                // Something happened in setting up the request that triggered an error
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
                localStorage.removeItem('cohort')
                setShowModal(false);
                console.log('User has been deleted:', res.data);
            } catch (error) {
                console.error('Error deleting user:', error);
            }
        } else {
            console.log('Deletion cancelled by user.');
        }
    };

    const filteredStudents = students.filter(student =>
        student.email.toLowerCase().includes(searchQuery.toLowerCase())
    ).sort((a, b) => a.username.localeCompare(b.username));

    return (
        <div className="student-container">
            <div className='students-header'>
                <div>
                    <p>Manage Students</p>
                    <h1>Students</h1>
                </div>
                <div style={{ display: "flex", flexDirection: "row", gap: "10px", alignSelf: "flex-end" }}>
                    <p>{students.length} Students</p>
                    <input
                        type="text"
                        placeholder='search email'
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button onClick={toggleAddStudentModal} type="button" className="btn btn-outline-primary btn-sm">+ ADD student</button>
                </div>
            </div>
            <hr />
            {filteredStudents.map(student => (
                <div key={student.id}>
                    <div className="student">
                        <div className="student-info">
                            <img className='student-img' src={student.profilePicture === '' ? defaultPhoto : student.profilePicture} alt="" />
                            <strong>{student.firstName} {student.lastName}</strong>
                            <p>{student.email}</p>
                        </div>
                        <div className="actions">
                            <button type="button" className="btn btn-secondary" onClick={() => toggleModal(student)}>Actions</button>
                        </div>
                    </div>
                    <hr />
                </div>
            ))}
            <Modal show={showModal} onHide={() => setShowModal(false)} className="modal-container">
                <Modal.Header closeButton>
                    <Modal.Title>Actions</Modal.Title>
                </Modal.Header>
                <Modal.Body className='modal-content'>
                    {selectedStudent && (
                        <>
                            <div className="modal-student-info">
                                <img className='logo' src={selectedStudent.profilePicture} alt="" style={{width:"100px", height:"100px"}}/>
                                <div>
                                    <strong>Username: {selectedStudent.username}</strong>
                                    <p>Email: {selectedStudent.email}</p>
                                    <p>Phone Number: {selectedStudent.phoneNumber}</p>
                                    <p>ID: {selectedStudent._id}</p>
                                    <p>Role: {selectedStudent.role}</p>
                                </div>
                            </div>
                        </>
                    )}
                    <div className="modal-footer">
                        <Button onClick={() => {
                            Navigate('../studentprofile')
                            localStorage.setItem('student', JSON.stringify(selectedStudent))
                            setStudent(selectedStudent)
                            }} variant="primary">View Profile</Button>
                        <Button variant="primary">Message</Button>
                        <Button onClick={() => deleteUser(selectedStudent.email)} variant="danger">Delete</Button>
                    </div>
                </Modal.Body>
            </Modal>

            {/* Second Modal for Adding Student */}
            <Modal show={showAddStudentModal} onHide={toggleAddStudentModal} className="modal-container">
                <Modal.Header closeButton>
                    <Modal.Title>Add Student</Modal.Title>
                </Modal.Header>
                <Modal.Body className="modal-content">
                    <Form onSubmit={(e) => addStudent(e)}>
                        <Form.Group controlId="formUsername">
                            <Form.Label>Username</Form.Label>
                            <Form.Control type="text" placeholder="Enter username" name="username" value={formData.username} onChange={handleInputChange} required />
                        </Form.Group>
                        <Form.Group controlId="formEmail">
                            <Form.Label>Email</Form.Label>
                            <Form.Control type="email" placeholder="Enter email" name="email" value={formData.email} onChange={handleInputChange} required />
                        </Form.Group>
                        <Form.Group controlId="formPassword">
                            <Form.Label>Password</Form.Label>
                            <Form.Control type="password" placeholder="Enter password" name="password" value={formData.password} onChange={handleInputChange} required />
                        </Form.Group>
                        <div className="modal-footer">
                            <Button
                                variant="secondary"
                                className="button secondary-button"
                                onClick={toggleAddStudentModal}
                            >
                                Close
                            </Button>
                            <Button
                                variant="primary"
                                type="submit"
                                className="button primary-button"
                            >
                                Add Student
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>

        </div>
    );
}

export default AdminStudents;
