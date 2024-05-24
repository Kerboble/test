import React, { useContext, useState, useEffect } from 'react';
import coursePhoto from '../img/coursephoto.jpg';
import ProgressBar from 'react-bootstrap/ProgressBar';
import { useOutletContext } from 'react-router-dom';
import { AuthContext } from '../context/authContext';
import { CohortContext } from '../context/cohortContext';
import tests from '../img/exam.png';
import material from '../img/books.png';
import assignments from '../img/book.png';
import Calendar from 'react-calendar';
import presentation from "../img/certification (1).png"
import { useNavigate } from 'react-router-dom';

function StudentDashboard() {
  const [users, refreshData, cohorts] = useOutletContext();
  const { currentUser } = useContext(AuthContext);
  const [totalCourses, setTotalCourses] = useState([]);
  const [totalReadingAssignmentsCount, setTotalReadingAssignmentsCount] = useState([]);
  const [totalAssignmentCount, setTotalAssignmentCount] = useState([]);
  const [totalTestCount, setTotalTestCount] = useState([]);
  const { cohort } = useContext(CohortContext);
  const [calendarDate, setCalendarDate] = useState(new Date()); // State to manage calendar date
  const [activeButton, setActiveButton] = useState('Active'); // State to track active button
  const Navigate = useNavigate();

  useEffect(() => {
    if (cohorts) {
      const courses = cohorts.reduce((acc, cohort) => {
        if (cohort.students) {
          const studentIds = cohort.students.map((student) => student.student.id);
          if (studentIds.includes(currentUser._id)) {
            acc.push(cohort);
          }
        }
        return acc;
      }, []);
      setTotalCourses(courses);
    }
  }, [cohorts, currentUser]);

  useEffect(() => {
    if (totalCourses) {
      let readingAssignmentsCount = 0;
      let testCount = 0;
      let assignmentCount = 0;

      totalCourses.forEach((course) => {
        readingAssignmentsCount += course.cohortFiles.readingMaterial.length;
        testCount += course.cohortFiles.tests.length;
        assignmentCount += course.cohortFiles.assignments.length;
      });

      setTotalReadingAssignmentsCount(readingAssignmentsCount);
      setTotalTestCount(testCount);
      setTotalAssignmentCount(assignmentCount);
    }
  }, [totalCourses]);

  const displayCourses = totalCourses
    ? totalCourses.map((course) => {
        return (
          <div className="resume-class" key={course.cohortName}>
            <div className="course-photo">
              <img src={coursePhoto} alt="" />
            </div>
            <div className="course">
              <div className="course-title">
                <p>{course.cohortName}</p>
              </div>
              <ProgressBar striped variant="primary" now={60} style={{ marginBottom: '5px', width: '80%' }} />
            </div>
            <hr />
            <div className="resume-course-overview">
              <div className="lessons">
                <img src={material} alt="" />
                {course.cohortFiles.readingMaterial.length}
              </div>
              <div className="assignments">
                <img src={assignments} alt="" />
                {course.cohortFiles.assignments.length}
              </div>
              <div className="tests">
                <img src={tests} alt="" />
                {course.cohortFiles.tests.length}
              </div>
            </div>
          </div>
        );
      })
    : null;

  return (
    <div className="student-dashboard-container">
      <div className="student-dashboard-wrapper">
        <div className="student-dashboard-wrapper-left">
          {cohort && <div className="resume-class">
            <div className="course-photo">
              <img src={coursePhoto} alt="" />
            </div>
            <div className="course">
              <div className="course-title">
                <p>{cohort.cohortName}</p>
              </div>
              <ProgressBar striped variant="primary" now={60} style={{ marginBottom: '5px', width: '80%' }} />
            </div>
            <hr />
            <div className="resume-course-overview">
              <div className="lessons">
                <img src={material} alt="" />
                {cohort.cohortFiles.readingMaterial.length}
              </div>
              <div className="assignments">
                <img src={assignments} alt="" />
                {cohort.cohortFiles.assignments.length}
              </div>
              <div className="tests">
                <img src={tests} alt="" />
                {cohort.cohortFiles.tests.length}
              </div>
            </div>
            <button onClick={() => Navigate('../cohortfiles')} className='btn btn-primary'>Resume</button>
          </div>}
          <div className="course-statuses">
            <strong>Status</strong>
            <div className="lessons">
              <img src={material} alt="" />
              <h1>0</h1>
              <strong>Lessons</strong>
              <p>of {totalReadingAssignmentsCount} completed</p>
            </div>
            <div className="assignments">
              <img src={assignments} alt="" />
              <h1>0</h1>
              <strong>Assignments</strong>
              <p>of {totalAssignmentCount} completed</p>
            </div>
            <div className="tests">
              <img src={tests} alt="" />
              <h1>0</h1>
              <strong>Tests</strong>
              <p>of {totalTestCount} completed</p>
            </div>
          </div>
          <div className="my-courses">
            <div className="header">
              <strong>My Courses</strong>
              <div className="button">
                <button className={`btn btn-sm ${activeButton === 'Active' ? 'active' : ''}`} onClick={() => setActiveButton('Active')}>
                Active
                </button>
                <button className={`btn btn-sm ${activeButton === 'Completed' ? 'active' : ''}`} onClick={() => setActiveButton('Completed')}>
                  Completed
                </button>
              </div>
            </div>
            <hr />
            <div className="courses-container">{displayCourses}</div>
          </div>
        </div>
        <div className="student-dashboard-wrapper-right">
          <Calendar
            className="calander"
            value={calendarDate}
            onChange={setCalendarDate}
            showFixedNumberOfWeeks={true} // Display a fixed number of weeks
            tileClassName={({ date }) => (date.getDay() === new Date().getDay() ? 'today' : '')} // Highlight today's date
          />
          <div className="find-courses">
            <button className='btn btn-primary btn-lrg'>+ Course</button>
            <img src={presentation} alt="" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
