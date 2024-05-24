import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sphere from "../img/globe.png"
import { AuthContext } from '../context/authContext.jsx';
import { useOutletContext } from 'react-router-dom';

const NewCohort = () => {
  const { currentUser } = useContext(AuthContext)
  const navigate = useNavigate();
  const [users, setRefreshData, cohorts] = useOutletContext();


  const [cohortInfo, setCohortInfo] = useState({
    cohortName: '',
    cohortSubject: 'math',
    adminID: currentUser._id,
    cohortPhoto: '',
    instructorID: '',
    instructorName: '',
    instructorProfilePhoto: '',
    description: '',
    tags: [], // Initialize tags as an empty array
    dateRange: {
      startDate: '',
      endDate: ''
    },
    cohortFiles: {
      readingMaterial: [],
      assignments: [],
      tests: []
    },
    providerID: '',
    isLive: false,
    students: [] // Initialize students as an empty array
  });

  const { cohortName, cohortSubject, description, tags, dateRange, cohortFiles, providerID, isLive } = cohortInfo;

  const onChange = (e) => {
    if (e.target.name === 'tags') {
      const tagsArray = e.target.value.split(',').map(tag => tag.trim());
      setCohortInfo({ ...cohortInfo, tags: tagsArray });
    } else {
      setCohortInfo({ ...cohortInfo, [e.target.name]: e.target.value });
    }
  };

  const onChangeDate = (e) => {
    setCohortInfo(oldArr => ({
      ...oldArr,
      dateRange: {
        ...oldArr.dateRange, [e.target.name]: e.target.value
      }
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:4000/newCohort', cohortInfo);
      setRefreshData(prev => prev + 1)
    } catch (err) {
      console.error('Cohort creation error:', err.response);
    }
  };

  const onFileChange = (e) => {
    const reader = new FileReader();
    reader.onload = () => {
      setCohortInfo(oldArr => ({
        ...oldArr,
        cohortFiles: {
          ...oldArr.cohortFiles, readingMaterial: [...oldArr.cohortFiles.readingMaterial, reader.result]
        }
      }));
    };
    reader.readAsDataURL(e.target.files[0]);
  };

  return (
    <div className='new-cohort-container'>
      <div className='modal-content'>
        <div className='formWrapper'>
          <span >New Cohort</span>
          <form onSubmit={e => onSubmit(e)}>
            <div className="cohort-info">
              <div className="inputWrapper">
                <label htmlFor="cohortName">Cohort Name:</label>
                <input type="text" id="cohortName" name="cohortName" value={cohortName} onChange={e => onChange(e)} required />
              </div>
              <div className="inputWrapper">
                <label htmlFor="cohortSubject">Subject:</label>
                <select type="text" id="cohortSubject" name="cohortSubject" value={cohortSubject} onChange={e => onChange(e)} required>
                  <option value="math">Math</option>
                  <option value="science">Science</option>
                  <option value="english">English</option>
                  <option value="history">History</option>
                  <option value="tech">IT</option>
                </select>
              </div>
              <div className="inputWrapper">
                <label htmlFor="description">Description:</label>
                <textarea id="description" name="description" value={description} onChange={e => onChange(e)} required />
              </div>
              <div className="inputWrapper">
                <label htmlFor="tags">Tags (comma separated):</label>
                <input type="text" id="tags" name="tags" value={tags} onChange={e => onChange(e)} />
              </div>
            </div>
            <div className='inputWrapper'>
              <label htmlFor='file' className='files-input'> Cohort Files</label>
              <input
                type="file"
                id="file"
                name="CohortFiles"
                onChange={onFileChange}
                style={{ display: 'none', cursor: 'pointer' }}
              />
            </div>
            <div className="cohort-length">
              <div className="inputWrapper">
                <label htmlFor="startDate">Start Date:</label>
                <input type="date" id="startDate" name="startDate" value={dateRange.startDate} onChange={e => onChangeDate(e)} />
              </div>
              <div className="inputWrapper">
                <label htmlFor="endDate">End Date:</label>
                <input type="date" id="endDate" name="endDate" value={dateRange.endDate} onChange={e => onChangeDate(e)} />
              </div>
            </div>
            <div className="inputWrapper">
              <label htmlFor="provider">Provider ID:</label>
              <input type="text" id="providerID" name="providerID" value={providerID} onChange={e => onChange(e)} />
            </div>
            <button className="btn btn-primary">Create Cohort</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewCohort;
