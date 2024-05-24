import React, { useContext, useState } from 'react';
import Calendar from 'react-calendar'; // Import Calendar component
import 'react-calendar/dist/Calendar.css'; // Import Calendar CSS
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import defaultCohortPhoto from "../img/coursephoto.jpg";
import { CohortContext } from '../context/cohortContext';
import { useOutletContext } from 'react-router-dom';
import { AuthContext } from '../context/authContext';
import ProgressBar from 'react-bootstrap/ProgressBar';
import arrow from "../img/right-arrow (2).png";
import defaultTeacherPhoto from "../img/shark.png";

function StudentCourses() {
  const { currentUser } = useContext(AuthContext);
  const [users, refreshData, cohorts] = useOutletContext();
  const { setCohort } = useContext(CohortContext);
  const Navigate = useNavigate();
  const instructor = [];
  const [selectedTag, setSelectedTag] = useState(null);
  const [calendarDate, setCalendarDate] = useState(new Date()); // State to manage calendar date

  const courseOverView = (cohort) => {
    localStorage.removeItem('cohort');
    localStorage.setItem('cohort', JSON.stringify(cohort));
    setCohort(cohort);
    Navigate("../cohortfiles");
  };

  const handleTagClick = (tag) => {
    setSelectedTag(tag);
  };

  const showMyCourses = cohorts
    ? cohorts.map((cohort) => {
        if (cohort.students && (!selectedTag || cohort.tags.includes(selectedTag))) {
          const studentIds = cohort.students.map((student) => student.student.id);
          if (studentIds.includes(currentUser._id)) {
            return (
              <div className="my-course" key={cohort._id}>
                <div className="left">
                  <div className="course-photo">
                    <img src={defaultCohortPhoto} alt="" />
                  </div>
                </div>
                <div className="right">
                  <div className="course-title">
                    <h2>{cohort.cohortName}</h2>
                  </div>
                  <div className="course-description">
                    <p>{cohort.description}</p>
                  </div>
                  <div className="course-footers">
                    <div className="course-tags">
                      {cohort.tags.map((tag) => (
                        <p
                          key={tag}
                          className="tags"
                        >
                          {tag}
                        </p>
                      ))}
                    </div>
                    <button onClick={() => courseOverView(cohort)} className='btn btn-primary'>
                      <img src={arrow} alt="" />
                    </button>
                  </div>
                </div>
              </div>
            );
          }
        }
        return null;
      })
    : null;

  const showTags = cohorts
    ? cohorts.reduce((uniqueTags, cohort) => {
        if (cohort.students) {
          const studentIds = cohort.students.map((student) => student.student.id);
          if (studentIds.includes(currentUser._id)) {
            cohort.tags.forEach((tag) => {
              if (!uniqueTags.includes(tag)) {
                uniqueTags.push(tag);
              }
            });
          }
        }
        return uniqueTags;
      }, [])
    : null;

  const showMyCoursesProgress = cohorts
    ? cohorts.map((cohort) => {
        if (cohort.students) {
          const studentIds = cohort.students.map((student) => student.student.id);
          if (studentIds.includes(currentUser._id)) {
            return (
              <div className='course-progress' key={cohort._id}>
                <strong>{cohort.cohortName}</strong>
                <ProgressBar striped variant="warning" now={60} style={{ marginBottom: "5px" }} />
              </div>
            );
          }
        }
        return null;
      })
    : null;

  const showMyInstructors = cohorts
    ? cohorts.map((cohort) => {
        if (cohort.students) {
          const studentIds = cohort.students.map((student) => student.student.id);
          if (studentIds.includes(currentUser._id) && !instructor.includes(cohort.instructorID)) {
            // Only render the instructor if currentUser._id is in studentIds and cohort.instructorID is not in instructor array
            instructor.push(cohort.instructorID);
            return (
              <React.Fragment key={cohort.instructorID}>
                <div className='instructor'>
                  {cohort.instructorProfilePhoto ? <img src={cohort.instructorProfilePhoto} alt="Instructor" /> : <img src={defaultTeacherPhoto} alt="Default Instructor" />}
                  <strong> {cohort.instructorName}</strong>
                </div>
                <hr />
              </React.Fragment>
            );
          }
        }
        return null;
      })
    : null;

  return (
    <div className='student-courses-container'>
      <div className='left-side'>
        <div className="courses-filter">
          <p className={selectedTag === null ? 'selected-tag' : ''} onClick={() => setSelectedTag(null)}>All</p>
          {showTags &&
            showTags.map((tag) => (
              <p
                key={tag}
                className={selectedTag === tag ? 'selected-tag' : ''}
                onClick={() => handleTagClick(tag)}
              >
                {tag}
              </p>
            ))}
        </div>
          <hr />
        <div className="courses">{showMyCourses}</div>
      </div>
      <div className="right-side">
        <h2>Instructors</h2>
        <div className="teachers">
          {showMyInstructors}
        </div>
        <h2>Learning Progress</h2>
        <div className="learning-progress">
          {showMyCoursesProgress}
        </div>
      </div>
    </div>
  );
}

export default StudentCourses;
