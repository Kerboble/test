import React, { useState, useContext, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { AuthContext } from '../context/authContext';
import { ChatContext } from '../context/chatContext';
import axios from 'axios';
import Chat from './Chat';
import add from "../img/add.png"
import { SocketContext } from '../context/socketContext';
import unread from "../img/chat (1).gif"

function Messages() {
  const [users, setRefreshData, cohorts] = useOutletContext();
  const { currentUser } = useContext(AuthContext);
  const { setChat, setUserOnline, chat } = useContext(ChatContext);
  const senderId = currentUser._id;
  const senderPhoto = currentUser.profilePicture;
  const senderFirstName = currentUser.firstName;
  const senderLastName = currentUser.lastName;
  const [myChats, setMyChats] = useState([]);
  const [showAllUsers, setShowAllUsers] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState(null); // State for selected chat
  const [onlineStatuses, setOnlineStatuses] = useState({}); // State to store online statuses
  const { socket } = useContext(SocketContext);
  const [updateChat, setUpdateChat] = useState(0)



  socket ? socket.on('message', () => {
    setUpdateChat(prev => prev + 1)
  }) : null

  useEffect(() => {
    const fetchChats = async () => {
        console.log('fetching');
        try {
            const response = await axios.get('http://localhost:4000/get-chats', {
                params: { senderId }
            });
            setMyChats(response.data);
        } catch (error) {
            console.error('Error fetching chats:', error);
        }
    };

    // Fetch chats initially
    fetchChats();

    // Fetch online statuses of all users initially
    const fetchOnlineStatuses = async () => {
      try {
        const response = await axios.get('http://localhost:4000/online-statuses');
        setOnlineStatuses(response.data);
      } catch (error) {
        console.error('Error fetching online statuses:', error);
      }
    };

    fetchOnlineStatuses();

    // Cleanup function (empty, as there are no ongoing operations to cancel)
    return () => {};
}, [chat, updateChat]);

  const startChat = async (contact) => {
    const contactId = contact.id;
    const receiverPhoto = contact.photo;
    const receiverFirstName = contact.firstName;
    const receiverLastName = contact.lastName;

    try {
      await axios.post('http://localhost:4000/make-chat', {
        senderId,
        senderPhoto,
        receiverId: contactId,
        receiverPhoto,
        receiverFirstName,
        receiverLastName,
        senderFirstName,
        senderLastName
      });
    } catch (error) {
      console.error('Error starting chat:', error);
    }
  };

  const displayUsers = users
    ? users.slice(0, showAllUsers ? users.length : 8).map((user, index) => {
        if (currentUser._id === user._id) return null;
        return (
          <div key={index}>
            <img style={{ height: '5vh' }} src={user.profilePicture} onClick={() => startChat(user._id)} />
          </div>
        );
      })
    : null;

 const openChat = async (chat, isOnline) => {
    const chatId = chat._id;
    setUserOnline(isOnline);
    setChat(chat);
    setSelectedChatId(chatId); // Set the selected chat ID
    
    try {
        await axios.get('http://localhost:4000/message-read', {
            params: { chatId, senderId } // Pass chatId as a parameter
        });
        // Request succeeded, continue with any additional logic
    } catch (error) {
        console.error('Error marking messages as read:', error);
        // Handle the error (e.g., show an error message)
    }
};


  const showMyChats = myChats
  ? myChats
      .slice()
      .sort((a, b) => {
        // Get the timestamps of the last messages in each chat
        const lastMessageTimestampA = a.messages.length > 0 ? new Date(a.messages[a.messages.length - 1].timestamp) : new Date(0);
        const lastMessageTimestampB = b.messages.length > 0 ? new Date(b.messages[b.messages.length - 1].timestamp) : new Date(0);
        // Sort in descending order based on timestamp
        return lastMessageTimestampB - lastMessageTimestampA;
      })
      .map((chat, index) => {
        // Find the other participant
        const otherParticipant = chat.participants.find(p => p.id !== currentUser._id);

        // Get the online status from the state
        const isOnline = onlineStatuses[otherParticipant.id];

        // Get the first and last message
        const lastMessage = chat.messages.length > 0 ? chat.messages[chat.messages.length - 1].content.slice(0, 30) : 'No messages yet';

        const unreadMessages = chat.messages.filter(message => message.read === false && message.sender !== currentUser._id).length;
            

        return (
          <div
            key={index}
            onClick={() => openChat(chat, isOnline)}
            className={`chat-item ${selectedChatId === chat._id ? 'selected' : ''}`} // Apply conditional class
          >
            <div className="chat-item-container">
              <img src={otherParticipant.picture} alt={`${otherParticipant.firstName} ${otherParticipant.lastName}'s profile`} className="participant-photo" />
              <div className={`status-dot ${isOnline ? 'online' : 'offline'}`}></div> {/* Status dot */}
            </div>
            <div className="chat-info">
              <p className="participant-name">{`${otherParticipant.firstName} ${otherParticipant.lastName}`}</p>
              <p className="last-message">{lastMessage}</p>
            </div>
            {unreadMessages > 0 && <div className="unread-message">
              <p>{unreadMessages}</p>
              <img src={unread} alt="" />
            </div>}
          </div>
        );
      })
  : null;

  const displayContacts = currentUser.contacts && currentUser.contacts.length > 0
    ? currentUser.contacts.map(contact => (
        <img onClick={() => startChat(contact.contact)} key={contact.contact.id} className='contact-photo' src={contact.contact.photo} />
      ))
    : null;



  return (
    <div className="message-container">
      <div className="left-side">
        <div className="search-conversation">
          <input placeholder='Search here...' type="text" />
          <img src={add} alt="" />
        </div>
        <div className="contacts">
          <div className="header">
            <h3>Contacts</h3>
          </div>
          <div className="users">
            {displayContacts}
          </div>
        </div>
        <div className="chats">
          <div className="header">
            <h3>Chats</h3>
          </div>
          {showMyChats}
        </div>
      </div>
      <div className="right-side">
        <Chat setMyChats={setMyChats} />
      </div>
    </div>
  );
}

export default Messages;
