import React, { createContext, useState } from 'react';

const TeacherContext = createContext();

const TeacherContextProvider = ({ children }) => {
    const storedTeacher = JSON.parse(localStorage.getItem('teacher'));
    const [teacher, setTeacher] = useState(storedTeacher ? storedTeacher : null);
    return (
        <TeacherContext.Provider value={{ teacher, setTeacher }}>
            {children}
        </TeacherContext.Provider>
    );
};

export { TeacherContext, TeacherContextProvider };
