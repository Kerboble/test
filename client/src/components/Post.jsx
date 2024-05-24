import React, { useContext, useEffect, useState, useRef } from 'react';
import { PostContext } from '../context/postContext';
import { CohortContext } from '../context/cohortContext';
import axios from 'axios';
import { Navigate, useNavigate, useOutletContext } from 'react-router-dom';
import { AuthContext } from '../context/authContext';
import { Modal, Button } from 'react-bootstrap';
import more from "../img/more.png"

function Post() {
    const { post } = useContext(PostContext);
    const { cohort } = useContext(CohortContext);
    const { currentUser } = useContext(AuthContext);
    const [targetedPost, setTargetedPost] = useState(null);
    const [commentText, setCommentText] = useState('');
    const [error, setError] = useState(null);
    const [refresh, setRefresh] = useState(false);
    const [isCommenting, setIsCommenting] = useState(false);
    const commentInputRef = useRef(null); // Create a ref for the textarea element
    const [replyContent, setReplyContent] = useState('');
    const [moreOptions, setMoreOptions] = useState(false)
    const [selectedCommentId, setSelectedCommentId] = useState(null);
    const [editingComment, setEditingComment] = useState(false);
    const [switchEdit, setSwitchEdit] = useState();

    
    // State to manage the visibility of replies for each comment
    const [showReplies, setShowReplies] = useState({});

    // State to manage modal visibility for each comment
    const [modalState, setModalState] = useState({});

    // Function to toggle the visibility of replies for a specific comment
    const toggleReplies = (commentID) => {
        setShowReplies(prevState => ({
            [commentID]: !prevState[commentID] // Toggle the value of showReplies for the specified comment ID
        }));
    };

    // Function to open a specific modal
    const handleModalOpen = (commentID) =>{
        setModalState({[commentID]: true})
    };

    // Function to close a specific modal
    const handleModalClose = (commentID) =>{
        setModalState({[commentID]: false})
    };

    // Function to toggle the "more options" for a specific comment
    const toggleMoreOptions = (commentID) => {
        setSelectedCommentId(commentID === selectedCommentId ? null : commentID);
    };

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const res = await axios.get("http://localhost:4000/get-post", {
                    params: {
                        _id: post
                    }
                });
                setTargetedPost(res.data.post);
                setError(null);
            } catch (error) {
                console.error('Error fetching post:', error);
                setError('Error fetching post');
            }
        };

        fetchPost();
    }, [refresh]);

    useEffect(() => {
        if (isCommenting) {
            commentInputRef.current.focus(); // Focus the textarea when isCommenting becomes true
        }
    }, [isCommenting]);

    

    const handleCommentSubmit = async () => {
        if(commentText.length <= 0){
           return alert('please write your comment')
        }

        try {
            const res = await axios.post("http://localhost:4000/add-comment", {
                _id: targetedPost._id,
                comment: commentText,
                profilePicture: currentUser.profilePicture,
                username: currentUser.username
            });
            setTargetedPost(res.data.post);
            setCommentText('');
            setError(null);
            setRefresh(!refresh);
            setIsCommenting(false); // Reset to input mode after submitting comment
        } catch (error) {
            console.error('Error adding comment:', error);
            setError('Error adding comment');
        }
    };

    const replyToComment = async (replierName, replierPicture, postID, commentID) => {
        if (replyContent.length === 0) {
            // Show an error message or prevent submission if the reply is empty
            return console.error('Reply content cannot be empty');
        }
    
        if (replyContent.length > 1000 ) {
            // Show an error message or prevent submission if the reply exceeds the maximum length
            return console.error('Reply content is too long');
        }
    
        try {
            const res = await axios.post("http://localhost:4000/reply", { replierName, replierPicture, _id: postID, commentID, replyContent });
            const updatedPost = res.data.post;
            setTargetedPost(updatedPost)
            handleModalClose(commentID); // Close the modal
        } catch (error) {
            console.log(error);
        }
    };;

    const deleteComment = async (_id, comment) => {
        console.log(_id, comment);
        try {
            const res = await axios.delete("http://localhost:4000/delete-comment", {
                data: { _id, comment}
            });
            const updatedPost = res.data.post
            toggleMoreOptions(comment._id)
            setTargetedPost(updatedPost)
        } catch (error) {
            console.error(error);
        }
    };

    const changeEdit = () => {
        setSwitchEdit(!switchEdit)
    }

    const handleEditComment = (comment) => {
        changeEdit()
        setEditingComment(!editingComment);
        setSelectedCommentId(editingComment ? null : comment._id);
    };

    const saveEditedComment = async (_id, commentID, content) => {
        try {
            const res = await axios.post("http://localhost:4000/edit-comment", { _id, commentID, content });
            handleEditComment(commentID)
        } catch (error) {
            console.error(error);
        }
    };
    
    
    
    
    
   

    return (
        <div className='selected-post-container'>
            {targetedPost && (
                <div className='selected-post-wrapper'>
                    <div className='owner-of-post'>
                        <img src={targetedPost.ownerPicture} alt="" />
                        <h1>{targetedPost.title}</h1>
                        <p>{targetedPost.content}</p>
                        <hr style={{ width: "90%" }} />
                    </div>
                    {isCommenting ? (
                        <div className='text-area'>
                            <textarea
                                ref={commentInputRef} // Set the ref to the textarea element
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder="Add a comment..."
                                style={{
                                    padding: "10px",
                                    borderRadius: "5px",
                                    border: "1px solid #ccc",
                                    width: "100%",
                                    marginBottom: "10px"
                                }}
                            />
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <button className='btn btn-danger' onClick={() => setIsCommenting(false)} >Cancel</button>
                                <button className={commentText.length <= 0 ? 'btn btn-secondary' : 'btn btn-primary'}onClick={handleCommentSubmit} >Submit</button>
                            </div>
                        </div>
                    ) : (
                        <div className='text-area'>
                            <input
                                type="text"
                                placeholder="Add a comment..."
                                onClick={() => setIsCommenting(true)}
                                style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc", width: "100%", marginBottom: "10px", cursor: "text", textAlign: "center" }}
                            />
                        </div>
                    )}
                    <div className='comments-container'>
                        {targetedPost.comments && targetedPost.comments.length > 0 ? (
                            targetedPost.comments.map((comment, index) => (
                                <div className='comment-wrapper' key={comment._id}>
                                    <div className='comment' value={comment._id}>
                                        <div className='comment-owner-info'>
                                            <img src={comment.ownerPicture} alt="" />
                                            <div className='comment-content'>
                                                <span>{comment.ownerName}</span>
                                                <p  className={editingComment && selectedCommentId === comment._id ? 'selected-comment' : ''} contentEditable={editingComment && selectedCommentId === comment._id && currentUser.profilePicture === comment.ownerPicture}>{comment.content}</p>
                                                {editingComment &&  selectedCommentId === comment._id &&<button onClick={() => saveEditedComment(targetedPost._id, comment._id, document.querySelector('.selected-comment').innerText)} className='reply-btn'>Save</button>}
                                                <button className='reply-btn' onClick={() => handleModalOpen(comment._id)}>Reply</button>
                                                <img 
                                                    onClick={() => toggleMoreOptions(comment._id)} 
                                                    className="more" 
                                                    src={more} 
                                                    alt="" 
                                                />
                                               { selectedCommentId === comment._id && currentUser.profilePicture === comment.ownerPicture && 
                                                    <div className='more-options' >
                                                        <div className='more-options-edit' onClick={() => handleEditComment(comment)}>
                                                            {switchEdit ? <p>Cancel</p> : <p>Edit</p>}
                                                        </div>
                                                        <div onClick={() => deleteComment(targetedPost._id, comment._id)} className='more-options-delete'>Delete</div>
                                                    </div>
                                               }
                                                { selectedCommentId === comment._id && currentUser.profilePicture !== comment.ownerPicture && 
                                                    <div className='more-options' >
                                                        <div className='flag-option' >Flag</div>
                                                    </div>
                                               }
                                            </div>
                                        </div>
                                    </div>
                                    <Modal className="modal-container" show={modalState[comment._id]} onHide={() => handleModalClose(comment._id)}>
                                        <Modal.Header closeButton>
                                            <Modal.Title>Reply to {comment.ownerName}'s comment</Modal.Title>
                                        </Modal.Header>
                                        <Modal.Body className="modal-content">
                                            <textarea name="reply" id="reply" cols="30" rows="10" onChange={(e) => setReplyContent(e.target.value)}></textarea>
                                            <p>{replyContent.length} / 1000 characters</p> {/* Display character count */}
                                        </Modal.Body>
                                        <Modal.Footer>
                                            <button className="btn btn-primary" onClick={() => replyToComment(currentUser.username, currentUser.profilePicture, targetedPost._id, comment._id)}>Reply</button>
                                            <button onClick={() => handleModalClose(comment._id)} className='btn btn-secondary'> Cancel</button>
                                        </Modal.Footer>
                                    </Modal>
                                    {/* Replies */}
                                    <div className='replies'>
                                        <p className='replies-toggle' onClick={() => toggleReplies(comment._id)}>Replies</p>
                                        { showReplies[comment._id] && comment.replies.length > 0 ? comment.replies.map(reply => {
                                            return(
                                                <div className='reply'>
                                                    <img style={{ height: "25px", width: "25px" }} src={reply.ownerPicture} alt="" />
                                                    <div className='reply-owner-info'>
                                                        <p>{reply.ownerName}</p>
                                                        <p>{reply.content}</p>
                                                    </div>
                                                </div>
                                            )
                                        })
                                            :
                                            null
                                        }
                                   </div>
                                </div>
                            ))
                        ) : (
                            <p>No comments yet.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Post;
