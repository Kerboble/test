import React, { useContext, useState, useEffect, useRef } from 'react';
import { ChatContext } from '../context/chatContext';
import { AuthContext } from '../context/authContext';
import axios from 'axios';
import { SocketContext } from '../context/socketContext';
import add from '../img/add.gif';
import { useOutletContext } from 'react-router-dom';

const Chat = ({ setMyChats }) => {
    const { chat, setChat, userOnline } = useContext(ChatContext);
    const { currentUser, setCurrentUser } = useContext(AuthContext);
    const [users, setRefreshData, cohorts] = useOutletContext();
    const { socket } = useContext(SocketContext);
    const [content, setContent] = useState('');
    const chatWrapperRef = useRef(null);
    const myContacts = currentUser.contacts ? currentUser.contacts.map(contact => contact.contact.id) : null;
    const [filteredMessages, setFilteredMessages] = useState(''); // State to hold filtered messages
    const senderId = currentUser._id;
    const chatId = chat._id;
    const participant = chat && chat.participants.find(p => p.id !== currentUser._id);
    const participantId = participant?.id;
    const participantPhoto = participant?.picture;
    const participantFirstName = participant?.firstName;
    const participantLastName = participant?.lastName;
    const [participantData, setParticipantData] = useState('')
    const addContact = myContacts ? myContacts.find(contact => contact === participantId) : null;

    const filtered = chat ? chat.messages.filter(message => message.content.toLowerCase().includes(filteredMessages.toLowerCase())) : null;
    

    const setAsContact = async (participantId, participantPhoto, participantFirstName, participantLastName) => {
        const id = participantId;
        const picture = participantPhoto;
        const firstName = participantFirstName;
        const lastName = participantLastName;
        const userId = currentUser._id;

        try {
            const res = await axios.put('http://localhost:4000/add-contact', { id, picture, userId, firstName, lastName });
            localStorage.removeItem('currentUser');
            setCurrentUser(res.data);
            localStorage.setItem('currentUser', JSON.stringify(res.data));
            console.log('Contact added successfully:', res.data);
        } catch (error) {
            console.error('Error adding contact:', error.response ? error.response.data : error.message);
        }
    };

    useEffect(() => {
        const fetch = async () => {
            const participant = await axios.get('http://localhost:4000/get-user', { params: { id: participantId } });
            setParticipantData(participant.data);
            console.log(participantData.profilePicture);
        };

        fetch();
    }, [chat]);

    useEffect(() => {
        if (socket) {
            socket.emit('join', currentUser._id);

            socket.on('message', (message) => {
                if (message.chatId === chatId) {
                    setChat(prevChat => ({
                        ...prevChat,
                        messages: [...prevChat.messages, message]
                    }));
                }
                updateChats();
            });

            return () => {
                socket.off('message');
            };
        }
    }, [socket, chatId, setChat, currentUser._id]);

    const updateChats = async () => {
        try {
            const response = await axios.get('http://localhost:4000/get-chats', {
                params: { senderId }
            });
            // Sort the chats based on the most recent message timestamp
            response.data.sort((a, b) => {
                const lastMessageA = a.messages[a.messages.length - 1];
                const lastMessageB = b.messages[b.messages.length - 1];
                return new Date(lastMessageB.timestamp) - new Date(lastMessageA.timestamp);
            });
            setMyChats(response.data);
        } catch (error) {
            console.error('Error fetching chats:', error);
        }
    };

    useEffect(() => {
        if (chatWrapperRef.current) {
            chatWrapperRef.current.scrollTo({
                top: chatWrapperRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [chat, filteredMessages.length === 0]);

    const sendMessage = async (content) => {
        const message = {
            chatId,
            senderId,
            content,
            receiverId: participantId,
            timestamp: new Date().toISOString(), // Include a correct timestamp
            read: true
        };
    
        if (userOnline) {
            socket.emit('chatMessage', message);
            setChat(prevChat => ({
                ...prevChat,
                messages: [...prevChat.messages, { ...message, sender: senderId}]
            }));
            setContent('');
        } else {
            try {
                const res = await axios.put('http://localhost:4000/send-message', message);
                setChat(res.data.chat);
                setContent('');
            } catch (error) {
                console.error('Error sending message:', error);
            }
        }
        updateChats();
    };
    
    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDate = (timestamp) => {
        return new Date(timestamp).toLocaleDateString([], {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const isSameDay = (d1, d2) => {
        const date1 = new Date(d1);
        const date2 = new Date(d2);
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    };

    
    useEffect(() => {
        if (chatId) {
            const readMessage = async () => {
                try {
                    const res = await axios.get('http://localhost:4000/message-read', {
                        params: { chatId, senderId } // Pass chatId as a parameter
                    });
                } catch (error) {
                    console.error('Error marking messages as read:', error);
                }
            }
            readMessage();
        }
    }, [chat, chatId]);
    
   


    const displayMessages = filtered ? filtered.map((message, index) => {
        const messageTimestamp = new Date(message.timestamp);
        const prevMessageTimestamp = index > 0 ? new Date(filtered[index - 1].timestamp) : null;

        const showDate = !prevMessageTimestamp || !isSameDay(messageTimestamp, prevMessageTimestamp);

        return (
            <React.Fragment key={message._id}>
                {showDate && (
                    <div style={{textAlign:'center', color:'gray'}} className="message-date">
                        {formatDate(message.timestamp)}
                    </div>
                )}
                {message.sender === currentUser._id ? (
                    <div className="message-owner">
                        <div className="content">
                            <strong>{currentUser.firstName} {currentUser.lastName}</strong>
                            <p>{message.content}</p>
                            <span className="timestamp">{formatTime(message.timestamp)}</span>
                        </div>
                        <img src={currentUser.profilePicture} alt="" />
                    </div>
                ) : (
                    <div className="received-message">
                        <img src={participantData.profilePicture} alt="" />
                        <div className="content">
                            <strong>{participantData.firstName} {participantData.lastName}</strong>
                            <p>{message.content}</p>
                            <span className="timestamp">{formatTime(message.timestamp)}</span>
                        </div>
                    </div>
                )}
            </React.Fragment>
        );
    }) : null;

    const receiverName = participantData ? (
        <div className="receiver-info">
            <div className="receiver-photo-wrapper">
                <img src={participantData.profilePicture} alt="" className="participant-photo" />
            </div>
            <div className="name-status-container">
                <h3>{participantData.firstName} {participantData.lastName}</h3>
                <div className="name-and-status">
                    <span className={`status-dot ${userOnline ? 'online' : 'offline'}`}></span>
                    <p>{userOnline ? "Online" : "Offline"}</p>
                </div>
            </div>
            {!addContact && <img src={add} onClick={() => setAsContact(participantId, participantPhoto, participantFirstName, participantLastName)} />}
        </div>
    ) : null;

    return (
        <div className='chat-container'>
            <div className="chat-header">
                {receiverName}
                <input
                    type="text"
                    onChange={(e) => setFilteredMessages(e.target.value)}
                    placeholder="Search conversation..."
                />
            </div>
            <hr />
            <div className="chat-wrapper" ref={chatWrapperRef}>
                {displayMessages}
                <div className="message-input">
                    <input
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        type="text"
                    />
                    <button className='btn btn-primary' onClick={() => sendMessage(content)}>Send</button>
                </div>
            </div>
        </div>
    );
};

export default Chat;
