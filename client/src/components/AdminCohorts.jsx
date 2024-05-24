import React, { useState, useContext } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useOutletContext, useNavigate, Navigate } from "react-router-dom";
import NewCohort from '../Pages/NewCohort';
import axios from 'axios';
import EditCohort from './EditCohort';
import { CohortContext } from '../context/cohortContext';

function AdminCohorts() {
    const [users, setRefreshData, cohorts] = useOutletContext();
    const [selectedCohort, setSelectedCohort] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [newCohortModal, setNewCohortModal] = useState(false);
    const [teacherModal, setTeacherModal] = useState(false);
    const [searchTeacherQuery, setSearchTeacherQuery] = useState('');
    const navigate = useNavigate();
    const { cohort, setCohort } = useContext(CohortContext);

    const teachers = users ?  users.filter(user => user.role === "teacher") : null;

    const activeCohort = {
        color: "green"
    };
    const inActiveCohort = {
        color: "red"
    };

    const toggleModal = (cohort) => {
        setShowModal(!showModal);
        setSelectedCohort(cohort);
    };

    const toggleNewCohortModal = () => {
        setNewCohortModal(!newCohortModal);
    };

    const toggleTeacherModal = () => {
        setTeacherModal(!teacherModal);
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleSearchTeacherChange = (e) => {
        setSearchTeacherQuery(e.target.value);
    };

    const filteredCohorts = cohorts.filter(cohort =>
        cohort.cohortName.toLowerCase().includes(searchQuery.toLowerCase())
    ).sort((a, b) => a.cohortName.localeCompare(b.cohortName));

    const filteredTeachers = teachers?.filter(teacher =>
        teacher.username.toLowerCase().includes(searchTeacherQuery.toLowerCase())
    );

    const displayCohort = filteredCohorts?.map(cohort => (
        <>
            <div className="cohort" key={cohort._id}>
                <p><strong>Name</strong>{cohort.cohortName}</p>
                <p><strong>Subject</strong> {cohort.cohortSubject}</p>
                <p><strong>Instructor</strong>{cohort.instructorID}</p>
                {cohort.isLive ? <p style={activeCohort}><strong>active</strong> </p> : <p style={inActiveCohort}><strong>inactive</strong> </p>}
                <div className="actions">
                    <button type="button" className="btn btn-secondary" onClick={() => toggleModal(cohort)}>Actions</button>
                </div>
            </div>
            <hr />
        </>
    ));

    const displayTeachers = filteredTeachers?.map(teacher => (
        <option key={teacher._id} value={teacher._id}>
             Username: {teacher.username}, ID: {teacher._id}
        </option>
    ));

    const deleteCohort = async (id) => {
        const confirmed = window.confirm(`Are you sure you want to delete the user with cohort: ${id}?`);
        if (confirmed) {
            try {
                const res = await axios.delete("http://localhost:4000/delete-cohort", {data:{id}});
                setShowModal(false);
                setRefreshData(prev => prev + 1)
                console.log('Cohort has been deleted:', res.data);
            } catch (error) {
                console.error('Error deleting cohort:', error);
            }
        } else {
            console.log('Deletion cancelled by user.');
        }
    };

    const assignTeacher = async (cohort) => {
        toggleTeacherModal();
    };

    const setTeacherToCohort = async (teacherID, cohortID) => {
        console.log(teacherID, cohortID);
        const confirmed = window.confirm(`Are you sure you want to set ${teacherID} to ${cohortID}?`);
        if (confirmed) {
            try {
                const res = await axios.post("http://localhost:4000/assign-teacher", { teacherID, cohortID });
                setTeacherModal(false)
                setRefreshData(prev => prev + 1)
                console.log(res.data);
            } catch (error) {
                console.error("Error setting teacher to cohort:", error);
            }
        } else {
            console.log("Operation cancelled by user.");
        }
    };

    const editCohort = (selectedCohort) => {
        setCohort(selectedCohort)
        navigate("../editCohort")
    };

    const viewFiles = (selectedCohort) => {
        const cohortJSON = JSON.stringify(selectedCohort); // Convert selectedCohort to JSON format
        localStorage.setItem('cohort', cohortJSON);
        setCohort(selectedCohort);
        navigate("../cohortfiles");
    };
    
    
    
    

    return (
        <div className="student-container">
            <div className='students-header'>
                <div>
                    <p>Manage Cohorts</p>
                    <h1>Cohorts</h1>
                </div>
                <div style={{ display: "flex", flexDirection: "row", gap: "10px", alignSelf: "flex-end" }}>
                    <p style={{ color: "gray" }}>{cohorts.length} Cohorts</p>
                    <input
                        type="text"
                        placeholder='Search cohort name'
                        value={searchQuery}
                        onChange={handleSearchChange}
                    />
                    <button type="button" className="btn btn-outline-primary btn-sm" onClick={toggleNewCohortModal}>+ Add Cohort</button>
                </div>
            </div>
            <hr />
            {displayCohort}
            <Modal className="modal-container" show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Actions</Modal.Title>
                </Modal.Header>
                <Modal.Body className="modal-content">
                    {selectedCohort && (
                        <>
                            <div className="modal-student-info">
                                <p>Name: {selectedCohort?.cohortName}</p>
                                <p>Subject: {selectedCohort?.cohortSubject}</p>
                                <p>ID: {selectedCohort?._id}</p>
                                <p>Admin ID: {selectedCohort?.adminID}</p>
                                <p>Instructor ID: {selectedCohort?.instructorID}</p>
                                <p>Start Date: {selectedCohort.dateRange.startDate ? selectedCohort.dateRange.startDate.slice(1, 10) : "N/A"}</p>
                                <p>End Date: {selectedCohort.dateRange.endDate ? selectedCohort.dateRange.endDate.slice(1, 10) : "N/A"}</p>
                            </div>
                        </>
                    )}
                    <div className="modal-footer">
                        <Button onClick={() => editCohort(selectedCohort)} variant="primary">Edit</Button>
                        <Button onClick={assignTeacher} variant="primary">Assign Teacher</Button>
                        <Button onClick={() => viewFiles(selectedCohort)} variant="primary">Overview</Button>
                        <Button onClick={() => deleteCohort(selectedCohort._id)} variant="danger">Delete</Button>
                    </div>
                </Modal.Body>
            </Modal>
            <Modal className="modal-container" show={newCohortModal} onHide={toggleNewCohortModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Add New Cohort</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <NewCohort />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={toggleNewCohortModal}>Close</Button>
                </Modal.Footer>
            </Modal>
            <Modal className="modal-container" show={teacherModal} onHide={toggleTeacherModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Assign Teacher</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="mb-3">
                        <label htmlFor="teacherSearch" className="form-label">Search Teacher:</label>
                        <input
                            type="text"
                            className="form-control"
                            id="teacherSearch"
                            placeholder="Search by teacher"
                            value={searchTeacherQuery}
                            onChange={handleSearchTeacherChange}
                        />
                    </div>
                    <form>
                        <div className="mb-3">
                            <label htmlFor="teacherSelect" className="form-label">Select Teacher:</label>
                            <select className="form-select" id="teacherSelect">
                                {displayTeachers}
                            </select>
                        </div>
                    </form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={toggleTeacherModal}>Close</Button>
                    <Button variant="primary" onClick={() => {
                        const selectedTeacher = document.getElementById("teacherSelect").value;
                        setTeacherToCohort(selectedTeacher, selectedCohort._id);
                    }}>Assign</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default AdminCohorts;
