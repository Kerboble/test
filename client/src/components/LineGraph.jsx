
import React, { useState, useEffect } from 'react';
import { Line } from "react-chartjs-2";
import axios from "axios"; // Import axios for data fetching
import { useOutletContext } from 'react-router-dom';

// Import necessary Chart.js components
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";


ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);


function LineGraph({refreshData}) {
    const [studentData, setStudentData] = useState([0]); // Initialize with initial value
    const [teacherData, setTeacherData] = useState([0]); // Initialize with initial value
    const [cohortsData, setCohortsData] = useState([0]); // Initialize with initial value

    const options = {};
    const data = {
        labels: Array.from(
            { length: Math.max(studentData.length, teacherData.length, cohortsData.length) },
            (_, index) => index + 1
        ), // Generate labels dynamically
        datasets: [
            {
                label: "Students",
                data: studentData,
                borderColor: "rgb(75, 192, 192)"
            },
            {
                label: "Teachers",
                data: teacherData,
                borderColor: "rgb(100, 0, 100)"
            },
            {
                label: "Cohorts",
                data: cohortsData,
                borderColor: "rgb(100, 0, 0)"
            }
        ]
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch users data
                const usersResponse = await axios.get("http://localhost:4000/users");
                const studentsCount = usersResponse.data.filter(user => user.role === "student").length;
                const teachersCount = usersResponse.data.filter(user => user.role === "teacher").length;

                // Fetch cohorts data
                const cohortsResponse = await axios.get("http://localhost:4000/cohorts");
                const cohortsCount = cohortsResponse.data.length;

                // Update state variables with new values
                setStudentData(prevData => [...prevData, studentsCount]);
                setTeacherData(prevData => [...prevData, teachersCount]);
                setCohortsData(prevData => [...prevData, cohortsCount]);
            } catch (error) {
                console.error(error);
            }
        };

        // Fetch data initially
        fetchData();
    }, [refreshData]);

    return (
        <div className='graph' style={{height:"30vh"}}>
            <Line options={options} data={data} />
        </div>
    );
}

export default LineGraph;
