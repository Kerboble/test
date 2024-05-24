import React, { useState, useContext, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useSocket } from '../context/socketContext';
import { AuthContext } from '../context/authContext';
import axios from 'axios';

function Messages() {
  const [users, setRefreshData, cohorts, messages] = useOutletContext();
  const [content, setContent] = useState('');
  const { currentUser } = useContext(AuthContext);
  const socket = useSocket();
  const [receiverID, setReceiverID] = useState('');
  const [messageSent, setMessageSent] = useState(false);
  const [chats, setChats] = useState('');

  const handleSendMessage = () => {
    const senderId = currentUser._id; // Replace with actual sender ID
    const receiverId = receiverID; // Replace with actual receiver ID

    if (content.trim() === '') return; // Prevent sending empty messages

    const messageData = {
      senderId,
      receiverId,
      content,
    };

    socket.emit('message', messageData, (response) => {
      if (response.success) {
        setMessageSent(true);
        setContent('');
        setReceiverID('');
      } else {
        // Handle message sending failure
        console.error('Failed to send message:', response.error);
      }
    });
  };

  const displayUsers = users
    ? users.map((user, index) => {
        if (currentUser._id === user._id) return null;
        return (
          <div key={index}>
            <img onClick={() => setReceiverID(user._id)} src={user.profilePicture} alt="" />
          </div>
        );
      })
    : null;


      console.log(receiverID)
      console.log(currentUser._id)


  return (
   <div className="message-container">
      <div className="left-side">
        <div className="left-side-wrapper">
          <div className="search-contacts">
              <input onChange={(e) => setContent(e.target.value)} placeholder='search here...' type="text"  />
              <button onClick={() =>handleSendMessage() }>send</button>
          </div>
          <div className="contacts">
            <div className="header">
              <h3>Contacts</h3>
              <p>VIEW ALL</p>
            </div>
            <div className="contact-pictures">
              {displayUsers}
            </div>
          </div>
          <div className="group-chats">

          </div>
          <div className="chats">
            {messages}
          </div>
        </div>
      </div>
      <div className="right-side">
            
      </div>
   </div>
  );
}

export default Messages;
