import React from 'react'
import { useContext } from 'react'
import { TeacherContext } from '../context/teacherContext'
import { useNavigate } from 'react-router-dom'
import { useOutletContext } from 'react-router-dom'
import defaultCohortPhoto from "../img/teamwork(1).png"
import { CohortContext } from '../context/cohortContext'
import { AuthContext } from '../context/authContext'

function TeacherProfile() {
    const [users, refreshData, cohorts] = useOutletContext();
    const {teacher} = useContext(TeacherContext)
    console.log(teacher)
    const Navigate = useNavigate();
    const {setCohort} = useContext(CohortContext);
    const {currentUser} = useContext(AuthContext);

    const myCourses= cohorts ? cohorts.filter(cohort => cohort.instructorID === teacher._id) : null;
    console.log(myCourses)

    const displayMyCourses = myCourses ? myCourses.map(course => {
        return(
        <div className="my-cohort">
            <img src={defaultCohortPhoto} alt="" />
            <p>{course.cohortName}</p>
            <button onClick={() => courseOverView(course)} className='btn btn-primary '>Overview</button>
        </div>
        )
    }) 
    : null;

    const courseOverView = (course) => {
        localStorage.removeItem('cohort');
        localStorage.setItem('cohort', JSON.stringify(course));
        setCohort(course);
        Navigate("../cohortfiles")
        console.log(course)
    }
  return (
    <div className='teacher-profile-container'>
    <div className="teacher-information">
        <div className="top">
            <img src={teacher.profilePicture} alt="" />
            <h1>{teacher.username}</h1>
            <p style={{color:"gray"}}>ID: {teacher._id}</p>
            <hr style={{width:"99%"}}/>
        </div>
        <div className="cohorts">
            <strong>Courses</strong>
            <strong style={{marginTop:"20px"}}>Institute</strong>
            <p>BVT</p>
            <hr style={{width:"99%"}}/>
        </div>
        <div className="bottom">
            <strong>Office</strong>
            {/* Dummy data */}
            <p>987 Emmett Tunnel, West Kristopher, IL 70661</p>
            <strong style={{marginTop:"20px"}}>PHONE NUMBER</strong>
            <p>{teacher.phoneNumber}</p>
            <strong style={{marginTop:"20px"}}>Email</strong>
            <p>{teacher.email}</p>
        </div>
        <div style={{marginTop:"20px"}} className="add-to-cohort">
            {currentUser._id === teacher._id  || currentUser.role === "SuperAdmin" && <button onClick={() => Navigate('../edit-teacher')} className='btn btn-secondary'>Edit</button>}
            <button onClick={() => {
                localStorage.removeItem('teacher')
                Navigate(-1)}} 
                className='btn btn-success'>Done</button>
        </div>
    </div>
    <div className="academic-stats">
        <h1>Courses</h1>
        <div className='display-cohorts'>
            {displayMyCourses}
        </div>
    </div>
</div>
  )
}

export default TeacherProfile