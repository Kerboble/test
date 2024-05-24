import React, { useContext, useEffect, useState } from 'react';
import { CohortContext } from '../context/cohortContext';
import axios from 'axios';
import exam from "../img/exam.png"
import book from "../img/book.png"
import books from "../img/network.png"
import quiz from "../img/megaphone.png"
import events from "../img/upcoming.png"
import defaultPhoto from "../img/shark.png"
import { useNavigate } from 'react-router-dom';
import { StudentContext } from '../context/studentContext';
import { TeacherContext } from '../context/teacherContext';
import { useOutletContext } from 'react-router-dom';
import { AuthContext } from '../context/authContext';

function CohortFiles() {
  const { cohort, setCohort } = useContext(CohortContext);
  const [teacher, _setTeacher] = useState(null);
  const Navigate = useNavigate();
  const {setStudent} = useContext(StudentContext);
  const {setTeacher} = useContext(TeacherContext)
  const [users, refreshData, cohorts] = useOutletContext();
  const {currentUser, setCurrentUser} = useContext(AuthContext);
  const userId = currentUser._id;

  const readingMaterials = cohort ? cohort.cohortFiles.readingMaterial : null;
  const readingAssignments = cohort ? cohort.cohortFiles.assignments : null;
  const tests = cohort ? cohort.cohortFiles.tests : null;
  const teacherID = cohort ? cohort.instructorID : null;

  useEffect(() => {
    refreshData(prev => prev + 1)
    console.log('refreshed')
  }, [])

  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        const response = await axios.post("http://localhost:4000/get-teacher", { id: teacherID });
        _setTeacher(response.data);
      } catch (error) {
        console.error("Error fetching teacher:", error);
      }
    };
    if (teacherID) {
      fetchTeacher();
    }
  }, [teacherID]);


  const removeFromCohort = async (id, cohortID) => {
    try {
      const response = await axios.delete("http://localhost:4000/remove-user", { data: { id, cohortID } });
      localStorage.removeItem('cohort');
      setCohort(response.data.cohort);
      localStorage.setItem('cohort', JSON.stringify(response.data.cohort));
      refreshData(prev => prev + 1)
    } catch (error) {
      console.error(error);
    }
  };
  

  const goToProfile = async (id) => {
    try {
        const res = await axios.get("http://localhost:4000/get-user", {
            params: {
                id: id
            }
        });
        setStudent(res.data);
        localStorage.setItem('student', JSON.stringify(res.data));
        Navigate('../studentprofile');
    } catch (error) {
        // Handle errors
        console.error(error);
    }
}

const teachersProfile = async(id) => {
  localStorage.removeItem('teacher')
  try {
    const res = await axios.get("http://localhost:4000/get-user", {
        params: {
            id: id
        }
    });
    setTeacher(res.data);
    localStorage.setItem('teacher', JSON.stringify(res.data));
    Navigate('../teacherprofile');
} catch (error) {
    // Handle errors
    console.error(error);
}
}


const setAsContact = async (student, userId) => {
  const id = student.student.id;
  const picture = student.student.profilePicture;
  const firstName = student.student.firstName
  const lastName = student.student.lastName
  try {
    const res = await axios.put('http://localhost:4000/add-contact', { id, picture, userId, firstName, lastName });
    localStorage.removeItem('currentUser')
    setCurrentUser(res.data);
    localStorage.setItem('currentUser', JSON.stringify(res.data));
    Navigate('../messages')
    console.log('Contact added successfully:', res.data);
  } catch (error) {
    console.error('Error adding contact:', error.response ? error.response.data : error.message);
  }
};


const displayReadingMaterials = readingMaterials
    ? readingMaterials.map((material, index) => <p key={index}>{material}</p>)
    : null;

  const displayAssignments = readingAssignments
    ? readingAssignments.map((assignment, index) => <p key={index}>{assignment}</p>)
    : null;

  const displayTests = tests
    ? tests.map((test, index) => <p key={index}>{test}</p>)
    : null;

  const displayStudents = cohort.students
    ? cohort.students.map((student, index) => (
      <>
       <div className='cohort-students' key={student.id}>
          <img src={student.student.profilePicture || defaultPhoto} alt={`Student ${index + 1}`} />
          <strong>{student.student.firstName} {student.student.lastName}</strong>
          <button onClick={() => goToProfile(student.student.id)} className='btn btn-primary btn-sm'>Profile</button>
          {currentUser.role === "SuperAdmin" && <button onClick={() => removeFromCohort(student.student.id, cohort._id)} className='btn btn-danger btn-sm' >Remove</button>}
          <button onClick={() => setAsContact(student, userId)} className='btn btn-success btn-sm'>Message</button>
        </div>
      </>
      ))
    : null;



  return (
    <div>
      <header className='files-header'>
        <h1 style={{ textAlign: "center", marginTop: "20px" }}>{cohort.cohortName}</h1>
        <button onClick={() => {Navigate(-1)}} className='btn btn-success btn-sm' style={{width:"100px", height:"35px",alignSelf:"center"}} >Done</button>
      </header>
      <div className='files-container'>
        <div className="files-wrapper">
          <div className='files reading-material' onClick={()=>{
            console.log('hello')
            Navigate('../discussionboard')}}>
            <img src={books} alt="" />
            <h4>Discussion Board</h4>
            {displayReadingMaterials.length}
          </div>
          <div className="files assignments">
            <img src={book} alt="" />
            <h4>Assignments</h4>
            {displayAssignments.length}
          </div>
          <div className="files tests">
            <img src={exam} alt="" />
            <h4>Exams</h4>
            {displayTests.length}
          </div>
          <div className="files quizzes">
            <img src={quiz} alt="" />
            <h4>Quizzes</h4>
            0
          </div>
          <div className="files events">
            <img src={events} alt="" />
            <h4>Events</h4>
            0
          </div>
        </div>
        <div className='users'>
        <div className="students">
          <h3 style={{color:""}}>Students</h3>
          <hr style={{width:"95%", textAlign:"center"}}/>
            {displayStudents}
        </div>
        {teacher && (
          <div className='teacher'>
            <h3>Instructor</h3>
            <p>{teacher.username}</p>
            <img  className='instructor-photo' src={teacher.profilePicture === "" ? defaultPhoto : teacher.profilePicture} alt="" />
            <div className="information">
              <p>Email:{teacher.email}</p>
              <p>Phone:{teacher.phoneNumber}</p>
            </div>
            <button onClick={() => teachersProfile(teacher._id)} className='btn btn-primary'>Profile</button>
          </div>
        )}

        </div>
      </div>
    </div>
  );
}

export default CohortFiles;

