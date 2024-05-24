import React, { createContext, useState, useEffect } from 'react';



const CohortContext = createContext();

const CohortContextProvider = ({ children }) => {
    const storedCohort = JSON.parse(localStorage.getItem('cohort'));
    const [cohort, setCohort] = useState(storedCohort ? storedCohort : null);
    return (
        <CohortContext.Provider value={{ cohort, setCohort }}>
            {children}
        </CohortContext.Provider>
    );
};

export { CohortContext, CohortContextProvider };