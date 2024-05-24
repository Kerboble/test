
import {React, useContext, useEffect, useState} from 'react'
import student from "../img/reading.png"
import { useOutletContext } from "react-router-dom";
import teacher from "../img/teacher.png"
import cohort from "../img/teamwork.png"
import event from "../img/event.png"
import LineGraph from './LineGraph';
import axios from 'axios';




function AdminDashboard() {

  const [users, refreshData, cohorts] = useOutletContext();

  const students = users ? users.filter(user => user.role === "student") : [];
  const teachers = users ? users.filter(user => user.role === "teacher") : [];
  
  


  
      

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard-header">
        <h2>
          Super Admin Dashboard
        </h2>
        <button  type="button" className="btn btn-primary">+ New Admission</button>
      </div>
        <div className="admin-dashboard-body">
          <div className="top-portion">
            <div className="statistics">
              <div className="info">
                <p>{students.length}</p>
                <p>Total Students</p>
              </div>
              <div className="stats-picture">
                <img  src={student} alt="" />
              </div>
            </div>
            <div className="statistics">
              <div className="info">
                <p>{teachers.length}</p>
                <p>Total Teachers</p>
              </div>
              <div className="stats-picture">
                <img  src={teacher} alt="" />
              </div>
            </div>
            <div className="statistics">
              <div className="info">
                <p>{cohorts.length}</p>
                <p>Total Cohorts</p>
              </div>
              <div className="stats-picture">
                <img  src={cohort} alt="" />
              </div>
            </div>
            <div className="statistics">
              <div className="info">
                <p>0</p>
                <p>Total Events</p>
              </div>
              <div className="stats-picture">
                <img  src={event} alt="" />
              </div>
            </div>
          </div>
        </div>
        <div className="middle-portion" style={{ width: '98%', height: '20vh' }}>
          <LineGraph 
          refreshData={refreshData}
          />
        </div>
    </div>
  )
}

export default AdminDashboard