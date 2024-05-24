import React, { useContext, useState } from 'react';
import { CohortContext } from '../context/cohortContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function EditCohort() {
  const { cohort } = useContext(CohortContext);  
  console.log(cohort)

  const [formValues, setFormValues] = useState({
    cohortName: cohort.cohortName || '',
    cohortSubject: cohort.cohortSubject || '',
    startDate: cohort.dateRange.startDate || '',
    endDate: cohort.dateRange.endDate || '',
    adminID: cohort.adminID || '',
    instructorID: cohort.instructorID || '',
    providerID: cohort.providerID || '',
    isLive: cohort.isLive || false,
  });
  const { cohortName, cohortSubject, startDate, endDate, adminID, instructorID, providerID, isLive} = formValues;
  
  const Navigate =useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const submit = async (e) => {
    e.preventDefault();
    const cohortID = cohort._id;
  
    try {
      const response = await axios.put("http://localhost:4000/edit-cohort", {
        cohortName, cohortSubject, adminID, instructorID, providerID, isLive, cohortID, startDate, endDate
      });
  
      console.log(response.data); // Assuming the server sends back a response message
  
      // Check if the update was successful
      if (response.status === 200) {
        // Navigate to the admin cohorts page
        Navigate('../admincohorts');
      } else {
        // Handle unsuccessful update
        console.error("Update failed:", response.data.message);
      }
    } catch (error) {
      console.error("An error occurred while updating the cohort:", error);
    }
  };
  


  return (
    <div className="edit-cohort-container">
      <h2>Edit Cohort</h2>
      <form onSubmit={submit}>
        <div className="mb-2">
          <label htmlFor="cohortName" className="form-label">Cohort Name:</label>
          <input type="text" className="form-control" id="cohortName" name="cohortName" value={formValues.cohortName} onChange={handleChange} />
        </div>
        <div className="mb-2">
          <label htmlFor="cohortSubject" className="form-label">Cohort Subject:</label>
          <input type="text" className="form-control" id="cohortSubject" name="cohortSubject" value={formValues.cohortSubject} onChange={handleChange} />
        </div>
        <div className="row mb-2">
          <div className="col">
            <label htmlFor="startDate" className="form-label">Start Date:</label>
            <input type="date" className="form-control" id="startDate" name="startDate" value={formValues.startDate} onChange={handleChange} />
          </div>
          <div className="col">
            <label htmlFor="endDate" className="form-label">End Date:</label>
            <input type="date" className="form-control" id="endDate" name="endDate" value={formValues.endDate} onChange={handleChange} />
          </div>
        </div>
        <div className="mb-2">
          <label htmlFor="adminID" className="form-label">Admin ID:</label>
          <input type="text" className="form-control" id="adminID" name="adminID" value={formValues.adminID} onChange={handleChange} />
        </div>
        <div className="mb-2">
          <label htmlFor="instructorID" className="form-label">Instructor ID:</label>
          <input type="text" className="form-control" id="instructorID" name="instructorID" value={formValues.instructorID} onChange={handleChange} />
        </div>
        <div className="mb-2">
          <label htmlFor="providerID" className="form-label">Provider ID:</label>
          <input type="text" className="form-control" id="providerID" name="providerID" value={formValues.providerID} onChange={handleChange} />
        </div>
        <div className="mb-2">
          <label htmlFor="isLive" className="form-label">Is Live:</label>
          <select className="form-select" id="isLive" name="isLive" value={formValues.isLive} onChange={handleChange}>
            <option value={true}>Active</option>
            <option value={false}>Inactive</option>
          </select>
        </div>
        <div className="text-center">
          <button type="submit" className="btn btn-primary">Save Changes</button>
        </div>
      </form>
    </div>
  );
}

export default EditCohort;
