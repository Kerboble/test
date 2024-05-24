import React, { useContext, useState, useEffect } from 'react';
import { StudentContext } from '../context/studentContext';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios'
import { useNavigate } from 'react-router-dom';
import defaultCohortPhoto from "../img/teamwork(1).png"
import { CohortContext } from '../context/cohortContext';
import ProgressBar from 'react-bootstrap/ProgressBar';
import { AuthContext } from '../context/authContext';


function StudentProfile() {
    const { student } = useContext(StudentContext);
    const [users, refreshData, cohorts] = useOutletContext();
    const id = student._id;
    const profilePicture = student.profilePicture;
    const username = student.username;
    const firstName = student.firstName;
    const lastName = student.lastName;
    const Navigate = useNavigate();
    const [selectedCohort, setSelectedCohort] = useState(null);
    const {setCohort} = useContext(CohortContext);
    const {currentUser} = useContext(AuthContext);

    const listCohorts = cohorts ? cohorts.map(cohort => (
        <option key={cohort._id} value={cohort._id}>{cohort.cohortName}</option>
    )) : null;

    useEffect(() => {
        refreshData(prev => prev + 1)
        console.log('refreshed')
      }, [])

    const handleAddToCohort = async () => {
        try {
            const res = await axios.post("http://localhost:4000/add-to-class", {
                studentId: id,
                cohortId: selectedCohort,
                profilePicture,
                username,
                firstName,
                lastName
            });
            console.log("Response:", res.data);
            refreshData(prev => prev + 1)
            closeModal();
        } catch (error) {
            alert('User is already in selected cohort')
        }
    };
    
    const [modalVisible, setModalVisible] = useState(false);
    
    const openModal = () => {
        setModalVisible(true);
    };
    
    const closeModal = () => {
        setModalVisible(false);
    };
    

    const showMyCourses = cohorts
    ? cohorts.map(cohort => {
        if (cohort.students) {
          const studentIds = cohort.students.map(student => student.student.id);
          if (studentIds.includes(id)) {
            return (
                <div className="my-cohort">
                    <img src={defaultCohortPhoto} alt="" />
                    <p>{cohort.cohortName}</p>
                    <ProgressBar striped variant="warning" now={60} style={{marginBottom:"5px"}}/>
                    <button onClick={() => courseOverView(cohort)} className='btn btn-primary '>View</button>
                </div>
            );
          }
        }
        return null;
      })
    : null;

    const courseOverView = (cohort) => {
        localStorage.removeItem('cohort');
        localStorage.setItem('cohort', JSON.stringify(cohort));
        setCohort(cohort);
        Navigate("../cohortfiles")
        console.log(course)
    }

    
    
    return (
        <div className='student-profile-container'>
            <div className="student-information">
                <div className="top">
                    <img src={student.profilePicture} alt="" />
                    <h1>{student.firstName} {student.lastName}</h1>
                    <hr style={{width:"99%"}}/>
                </div>
                <div className="cohorts">
                    <strong style={{marginTop:"20px"}}>Institute</strong>
                    <p>BVT</p>
                    <hr style={{width:"99%"}}/>
                </div>
                <div className="bottom">
                    <strong>CURRENT ADDRESS</strong>
                    {/* Dummy data */}
                    <p>{student.address}</p>
                    <strong style={{marginTop:"20px"}}>PHONE NUMBER</strong>
                    <p>{student.phoneNumber}</p>
                    <strong style={{marginTop:"20px"}}>Email</strong>
                    <p>{student.email}</p>
                </div>
                <div style={{marginTop:"20px"}} className="add-to-cohort">
                    <button className="btn btn-primary" onClick={openModal}>Add to Cohort</button>
                    {(currentUser._id === student._id || currentUser.role === "SuperAdmin") && 
                    <button onClick={() => Navigate("../edit-student")} className='btn btn-secondary'>Edit</button>}
                    <button onClick={() => Navigate(-1)} className='btn btn-success'>Done</button>
                </div>
            </div>
            <div className="academic-stats">
                <h1></h1>
                <div className='display-cohorts'>
                        {showMyCourses}
                    </div>
            </div>
            {modalVisible && (
                <div className="modal" tabIndex="-1" role="dialog" style={{ display: 'block' }}>
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Select Cohort</h5>
                            </div>
                            <div className="modal-body">
                                <select className="form-control" onChange={(e) => setSelectedCohort(e.target.value)} value={selectedCohort}>
                                    <option value="">Select a cohort</option>
                                    {listCohorts}
                                </select>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={closeModal}>Close</button>
                                <button type="button" className="btn btn-primary" onClick={handleAddToCohort}>Add</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>

    );
}

export default StudentProfile;
