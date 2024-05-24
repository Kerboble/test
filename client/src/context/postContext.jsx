import React, { createContext, useState } from 'react';

const PostContext = createContext();

const PostContextProvider = ({ children }) => {
    const storedPostID = localStorage.getItem('storedPostId')
    const [post, setPost] = useState(storedPostID ? storedPostID : null);

    return (
        <PostContext.Provider value={{ post, setPost }}>
            {children}
        </PostContext.Provider>
    );
};

export { PostContext, PostContextProvider };
