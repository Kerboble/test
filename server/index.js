const authenticateToken = require('./middleware/authMiddleware');
const bcrypt = require('bcryptjs'); // Importing bcrypt for password hashing
const bodyParser = require('body-parser'); // Middleware for parsing request bodies
const cors = require('cors'); // Middleware for enabling CORS
const express = require('express'); // Importing Express.js framework
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose'); // Importing Mongoose for MongoDB interactions
const nodemailer = require('nodemailer');
const multer = require('multer');
const { ObjectId } = require('mongodb');
require('dotenv').config();
const { Server } = require('socket.io');
const { createServer } = require('node:http');
const { time } = require('node:console');
const http = require('http');
const socketIo = require('socket.io');
const axios = require('axios');



const app = express(); // Creating an Express application
app.use(cors()); // Using CORS middleware to enable cross-origin requests
app.use(bodyParser.json({ limit: '50mb' })); //had to increase the payload amount to accommodate the size of avatar photos
const server = createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: '*',
  }
});

const userSocketMap = new Map();

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('A user connected');

  // Handle authentication event from client
  socket.on('authenticate', (data) => {
    console.log('User authenticated:', data.userId);
    userSocketMap.set(data.userId, socket);
  });

  // Handle registration event from client
  socket.on('registration', (userId) => {
    console.log('User registered:', userId);
    // Associate the socket connection with the user's ID
    userSocketMap.set(userId, socket);
  });

  socket.on('chatMessage', async (message) => {
    const{chatId, senderId, content} = message;

    // Save the message using the HTTP endpoint
    try {
        const res = await axios.put('http://localhost:4000/send-message', {chatId, senderId, content});
        console.log('Message stored successfully:', res.data);
    } catch (error) {
        console.error('Error storing message:', error);
    }

    // Send the message to the receiver if they are online
    const receiverSocket = userSocketMap.get(message.receiverId);
    if (receiverSocket) {
        receiverSocket.emit('message', message);
    }
});

  // Disconnect event
  socket.on('disconnect', () => {
    console.log('A user disconnected');
    // Remove the user's socket connection from the map upon disconnection
    userSocketMap.forEach((value, key) => {
      if (value === socket) {
        userSocketMap.delete(key);
      }
    });
  });
});







//cloudinary for users to upload photos of themselves
const cloudinary = require('cloudinary').v2;
          
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

// Create multer instance with configured storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') // Specify the directory where uploaded files will be stored
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname) // Rename the uploaded file to avoid naming conflicts
  }
});

// Create multer instance with configured storage
const upload = multer({ storage: storage });


// Setting up email to send for email verification
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'fiendsauthentication@gmail.com',
    pass: process.env.EMAIL_PASS
  }
})



const EMAIL_SECRET = process.env.EMAIL_SECRET;


// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_LINK, {
  useNewUrlParser: true, // MongoDB connection options
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected')) // Log successful MongoDB connection
.catch(err => console.error('MongoDB connection error:', err)); // Log MongoDB connection error

// Define User Schema
const UserSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  dob: String,
  address: String,
  username: String,
  password: String,
  refreshToken: { 
    type: String, 
    default: '' 
  },
  email: String,
  phoneNumber: String,
  profilePicture: { 
    type: String,
    default: ''
  },
  role: { 
    type: String, 
    default: 'student' 
  },
  isEmailConfirmed: { // Whether or not the user has verified their email
    type: Boolean,
    default: false
  },
  contacts: [{
    contact:{
      id: String,
      photo: String,
      firstName: String, 
      lastName: String
    }
  }],
  online: {
    type: Boolean,
    default: false
  }
});

const User = mongoose.model('User', UserSchema); // Creating a User model based on the UserSchema

// Defining Cohort Schema
const CohortSchema = new mongoose.Schema({
  cohortName: String,
  cohortSubject: String,
  adminID: String, // Auto set to _id of current user
  cohortPhoto: String,
  instructorID: String,
  instructorName: String,
  instructorProfilePhoto: String,
  description: String,
  tags: Array,
  dateRange: {
    startDate: Date,
    endDate: Date
  },
  cohortFiles: {
    readingMaterial: Array,
    assignments: Array,
    tests: Array
  },
  providerID: String, // Providers are like schools
  isLive: { // Check if cohort has been approved by us to be live for users
    type: Boolean, 
    default: false
  },
  students: [{
    student: {
      id:String,
      firstName: String,
      lastName: String,
      profilePicture:String,
      username:String
    }
  }]
});

const Cohort = mongoose.model('Cohort', CohortSchema); // Cohort model like the User model

const discussionPostSchema = new mongoose.Schema({
  title: String,
  ownerName: String,
  content: String,
  ownerPicture:String,
  postType: String,
  comments: [{
    ownerPicture: String,
    ownerName: String,
    content: String,
    replies: [{
      ownerPicture: String,
      ownerName: String,
      content: String
    }]
  }],
  cohort: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cohort' // Reference to the Cohort model
  }
});



const DiscussionPost = mongoose.model('DiscussionPost', discussionPostSchema);


const photoSchema = new mongoose.Schema({
  photoPath: String
});

const Photo = mongoose.model('Photo', photoSchema);




// Define the chat schema with messages embedded directly
const chatSchema = new mongoose.Schema({
  participants: [{
    id: String,
    picture: String,
    firstName: String,
    lastName: String
  }], // Array of strings for participants
  title: String, // String for the chat title
  messages: [{
    sender: String, // String for the sender
    content: String, // String for the content of the message
    timestamp: { type: Date, default: Date.now }, // Date with a default value of the current date and time
    read:{
      type: Boolean,
      default: false
    }
  }]
}, { timestamps: true }); // Automatically add createdAt and updatedAt fields

// Create the Chat model
const Chat = mongoose.model('Chat', chatSchema);


//making a chat
app.post('/make-chat', async (req, res) => {
  const { senderId, receiverId, senderPhoto, receiverPhoto, receiverFirstName, receiverLastName, senderFirstName, senderLastName } = req.body;

  if (!senderId || !receiverId) {
    return res.status(400).json({ error: 'Sender ID and Receiver ID are required.' });
  }

  try {
    // // Check if a chat already exists with the same participants
    // const existingChat = await Chat.findOne({ 
    //   participants: { $all: [senderId, receiverId] }
    // });

    // if (existingChat) {
    //   return res.status(200).json(existingChat); // Return existing chat instead of error
    // }

    // Create a new chat if one doesn't already exist
    const newChat = new Chat({ 
      participants: [
        { id: senderId, picture: senderPhoto, firstName:senderFirstName, lastName:senderLastName }, 
        { id: receiverId, picture: receiverPhoto, firstName:receiverFirstName, lastName:receiverLastName }
      ]
    });

    await newChat.save();
    res.status(201).json(newChat); // Send back the newly created chat
  } catch (error) {
    console.error('Error creating chat:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});




//get chats
app.get('/get-chats', async (req, res) => {
  try {
    const { senderId } = req.query;

    if (!senderId) {
      return res.status(400).json({ error: 'Sender ID is required.' });
    }

    // Query the Chat model to find chats involving the specified senderId
    const chats = await Chat.find({ 'participants.id': senderId });

    res.json(chats);
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//update message 
app.put('/add-contact', async (req, res) => {
  const { id, picture, userId, lastName, firstName} = req.body;

  if (!userId || !id || !picture) {
    return res.status(400).send('Invalid request body');
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send('User not found');
    }

    // Check if the contact already exists
    // const contactExists = user.contacts.some(contact => contact.contact.id === id);
    // if (contactExists) {
    //   return res.status(400).send('Contact already exists');
    // }

    user.contacts.push({ contact: { id, photo: picture, lastName, firstName } });
    await user.save();
    res.status(200).send(user);
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});


//making a message 
app.put('/send-message', async (req, res) => {
  try {
    const { chatId, senderId, content, timestamp } = req.body;

    // Validate input
    if (!chatId || !senderId || !content) {
      return res.status(400).json({ error: 'Chat ID, Sender ID, and content are required.' });
    }

    // Find the chat by ID
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found.' });
    }

    // Add the new message to the chat
    chat.messages.push({ sender: senderId, content, timestamp: timestamp });

    // Save the updated chat document
    await chat.save();

    // Respond with success
    res.status(200).json({chat});
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});




// add student to cohort 
app.post("/add-to-class", async (req, res) => {
  const { studentId, cohortId, profilePicture, username, firstName, lastName } = req.body;
  try {
    const cohort = await Cohort.findOne({ _id: cohortId });
    if (!cohort) {
      return res.status(404).json({ success: false, message: "Cohort not found." });
    }

    const checkIfUserIsInCohort = cohort.students.filter(studentObj => studentObj.student.id === studentId);
    if (checkIfUserIsInCohort.length > 0) {
      return res.status(400).json({ message: "User is already a part of this cohort" });
    }

    await Cohort.updateOne(
      { _id: cohortId },
      {
        $push: {
          students: {
            student: {
              id: studentId,
              profilePicture: profilePicture,
              username: username,
              firstName,
              lastName
            }
          }
        }
      }
    );

    res.status(200).json({ success: true, message: "Student added to cohort successfully." });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "An error occurred while adding the student to the cohort." });
  }
});


//gets teacher
app.post('/get-teacher', async (req, res) => {
  const { id } = req.body;
  try {
    const teacher = await User.findOne({ _id: id });
    if (teacher) {
      res.json(teacher);
    } else {
      res.status(404).json({ message: 'Teacher not found' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

//delete user from cohort based on id
app.delete('/remove-user', async (req, res) => {
  const { id, cohortID } = req.body; // Extracting id and cohortID from query parameters
  try {
    // Use $pull to remove the student from the students array based on their ID
    const updatedCohort = await Cohort.findByIdAndUpdate(cohortID, { $pull: { students: { 'student.id': id } } }, { new: true });
    
    if (updatedCohort) {
      console.log('Student removed successfully');
      res.status(200).json({ message: 'Student removed successfully', cohort: updatedCohort });
    } else {
      console.log('Cohort not found');
      res.status(404).json({ error: 'Cohort not found' });
    }
  } catch (error) {
    console.error('Error removing student:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//get student data 
app.get("/get-user", async (req, res) => {
  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ success: false, message: "ID parameter is missing." });
  }

  try {
    const student = await User.findOne({ _id: id });
    if (!student) {
      return res.status(404).json({ success: false, message: "user not found." });
    }
    res.json(student);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "An error occurred while fetching the user." });
  }
});



app.post('/upload', upload.single('profilePicture'), async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path);
    const photo = new Photo({ photoPath: result.secure_url });
    await photo.save();
    res.status(201).json({ message: 'Photo uploaded successfully', photo });
  } catch (error) {
    console.error('Error uploading photo:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// User Registration
app.post('/register', upload.single('profilePicture'), async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path);
    const { username, email,  phoneNumber, password, refreshToken, role, profilePicture, firstName, lastName} = req.body;
    const existingUser = await User.findOne({
      $or: [
          { username: username },
          { email: email }
      ]
  });
  
  // Check if the username or email is already in use
  if (existingUser) {
    if(existingUser.username === username) {
      return res.status(400).send('Username is already in use.')}
    if (existingUser.email === email) { // If user already exists, return error
      return res.status(400).send('Email is already in use.');
    }
  }
  
    
    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password using bcrypt
    const newUser = new User({ username, email,  phoneNumber, password: hashedPassword, refreshToken, profilePicture:result.secure_url, role, isEmailConfirmed:false, firstName, lastName}); // Create a new User document
    await newUser.save(); // Save the new user to the database

    // Setting up user for confirmation
    jwt.sign(
      {userId: newUser._id.toString()},
      EMAIL_SECRET,
      {expiresIn: '1d'}, // Token that expires in a day, special to each user
      (err, emailToken) =>{

        const url = `http://localhost:5173/confirmation/${emailToken}`; //Creating individualized url for confirmation with custom emailToken
    
        transporter.sendMail({
          to: newUser.email,
          subject: 'Welcome to Study Sphere!',
          html: `Click the following link to activate your account to use: <a href='${url}'>${url}</a>`
        });
      }
    );

    res.status(201).send('User registered successfully'); // Send success response
  } catch (error) {
    console.error('Error registering user:', error); // Log registration error
    res.status(500).send('Error registering user'); // Send error response
  }
});

//admin student add shortcut
app.post('/register-admin', async (req, res) => {
  try {
    const { username, email,  phoneNumber, password, refreshToken, role} = req.body;
    const existingUser = await User.findOne({
      $or: [
          { username: username },
          { email: email }
      ]
  });
  
  // Check if the username or email is already in use
  if (existingUser) {
    if(existingUser.username === username) {
      return res.status(400).send('Username is already in use.')}
    if (existingUser.email === email) { // If user already exists, return error
      return res.status(400).send('Email is already in use.');
    }
  }
  
    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password using bcrypt
    const newUser = new User({ username, email,  phoneNumber, password: hashedPassword, refreshToken,  role, isEmailConfirmed:true}); // Create a new User document
    await newUser.save(); // Save the new user to the database

    // Setting up user for confirmation
    jwt.sign(
      {userId: newUser._id.toString()},
      EMAIL_SECRET,
      {expiresIn: '1d'}, // Token that expires in a day, special to each user
      (err, emailToken) =>{

        const url = `http://localhost:5173/confirmation/${emailToken}`; //Creating individualized url for confirmation with custom emailToken
    
        transporter.sendMail({
          to: newUser.email,
          subject: 'Welcome to Study Sphere!',
          html: `Click the following link to activate your account to use: <a href='${url}'>${url}</a>`
        });
      }
    );

    res.status(201).send('User registered successfully'); // Send success response
  } catch (error) {
    console.error('Error registering user:', error); // Log registration error
    res.status(500).send('Error registering user'); // Send error response
  }
});

//when user refreshes userAuth will check for refresh token/ update one if necessary and then return user data
app.post('/userData', authenticateToken, async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const user = await User.findOne({ refreshToken });
    if (!user) {
      return res.status(404).send('User not found');
    }
    res.send(user);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});


// Revised generateAccessToken function with longer expiry time
function generateAccessToken(user) {
    const payload = {
        id: user._id,
        username: user.username 
    };
    return jwt.sign(payload, "secret_value", { expiresIn: '60min' }); // Expires in 15 minutes
};


// Revised /login endpoint with refreshToken
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).send('User not found');
        }
        if (!user.isEmailConfirmed) {
          return res.status(401).send('Please confirm email.') // If you haven't confirmed your email, do it
        }
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).send('Invalid password');
        }
        const accessToken = generateAccessToken(user.toObject());
        const refreshToken = jwt.sign({ id: user._id }, "secret_value"); // Only store user id in refresh token
        await User.updateOne({ _id: user._id }, { $set: { refreshToken: refreshToken } }); // Update refreshToken field
        res.json({ accessToken, refreshToken, user });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).send('Error logging in');
    }
});

//update user online status 
app.put('/update-online-status', async (req, res) => {
  const { username } = req.body; // Assuming the username is sent in the request body
  try {
    // Find the user by their username
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user's online status to true
    user.online = !user.online;
    console.log(user)
    await user.save();

    return res.status(200).json({ message: 'User online status updated successfully' });
  } catch (error) {
    console.error('Error updating online status:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

//checking online statuses
app.get('/online-statuses', async (req, res) => {
  try {
    const users = await User.find({}, 'id online');
    const onlineStatuses = {};
    users.forEach(user => {
      onlineStatuses[user.id] = user.online;
    });
    res.status(200).json(onlineStatuses);
  } catch (error) {
    console.error('Error fetching online statuses:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



// Creating a cohort in the database
app.post('/newCohort', async (req, res) => {
  try {
    const { cohortName, cohortSubject, adminID, instructorID, dateRange, cohortFiles, providerID, isLive, description, tags} = req.body;
    const existingCohort = await Cohort.findOne({ cohortName }); // Check if user already exists in the database
    if (existingCohort) { // If cohort already exists, return error
      return res.status(400).send('Cohort already exists');
    }
    const newCohort = new Cohort({ cohortName, cohortSubject, adminID, instructorID, dateRange, cohortFiles, providerID, isLive, description, tags}); // Create a new User document
    await newCohort.save(); // Save the new cohort to the database
    res.status(201).send('Cohort successfully created'); // Send success response
  } catch (error) {
    console.error('Error creating cohort:', error); // Log registration error
    res.status(500).send('Error creating cohort'); // Send error response
  }
});

//Get cohort 
app.get('/cohorts', async (req, res) => {
  try {
    const cohorts = await Cohort.find();
    res.json(cohorts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Refresh token endpoint
app.post('/refresh-token', async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res.status(401).send('Refresh token not provided');
    }
    try {
        const decoded = jwt.verify(refreshToken, "secret_value");
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(404).send('User not found');
        }
        const newAccessToken = generateAccessToken(user.toObject());
        res.json({ accessToken: newAccessToken });
    } catch (error) {
        console.error('Error refreshing token:', error);
        res.status(401).send('Invalid refresh token');
    }
});

app.post('/confirmation', async (req, res) => {
  try {
    const { token } = req.body;
    const decoded = jwt.verify(token, EMAIL_SECRET);
    console.log('test')

    const user = await User.findByIdAndUpdate(decoded.userId, {isEmailConfirmed: true}, {new: true});
    
    if (!user) {
      return res.status(404).send('User not found.');
    }

    res.send('Email has been confirmed.');
  } catch (err) {
    res.status(400).send('Invalid or expired Token');
  }
});


//check username availability 
app.post('/checkUsername', async (req, res) => {
  console.log('ping')
  try {
    const { username } = req.body;
    const checkUsernameAvailability = await User.findOne({ username });
    if (checkUsernameAvailability) {
      res.send(false);
    } else {
      res.send(true);
    }
  } catch (error) {
    console.error('Error checking username availability:', error);
    res.status(500).send('Internal Server Error');
  }
});

//gets users for SuperAdmins 
app.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//this endpoint will allow us to pass in a user to make a super admin
app.post('/make-super-admin', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      await User.updateOne({ email }, { $set: { role: 'SuperAdmin' } });
      res.status(201).send('User has been upgraded to SuperAdmin');
    } else {
      res.status(404).send('User not found');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

//this endpoint will allow us to pass in a user to make a super admin
app.post('/set-role', async (req, res) => {
  try {
    const { email, role } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      await User.updateOne({ email }, { $set: { role: role } });
      res.status(201).send(`user role has been changed to ${role} `);
    } else {
      res.status(404).send('User not found');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.delete("/delete-cohort", async(req, res) => {
  console.log('ping')
  const {id} = req.body;
  try {
    // Validate input: Check if ID is a valid ObjectId, if necessary
    const cohort = await Cohort.findOne({ _id: id });
    if (!cohort) {
      return res.status(404).json({ error: "Cohort not found" });
    }

    await cohort.deleteOne();

    return res.status(200).json({ message: "Cohort successfully deleted" });
  } catch (error) {
    console.error("Error deleting cohort:", error);
    return res.status(500).json({ error: "An error occurred while deleting the cohort" });
  }
});

app.delete('/delete-user', async (req, res) => {
  const { email } = req.body;
  try {
    // Find the user by email
    const user = await User.findOne({ email });
    // If user doesn't exist, return error
    if (!user) {
      return res.status(404).send('User not found');
    }
    // Delete the user document
    await user.deleteOne();
    // Respond with success message
    res.status(200).send('User was successfully deleted');
  } catch (error) {
    // Handle errors
    console.error('Error deleting user:', error);
    res.status(500).send('An error occurred while deleting the user');
  }
});

//assigning teacher to cohort 
app.post("/assign-teacher", async (req, res) => {
  const { teacherID, cohortID} = req.body;
  try {
    const user = await User.findById({_id:teacherID})
    const cohort = await Cohort.findOne({ _id: cohortID });
    if (cohort) {
      await Cohort.updateOne({ _id: cohortID }, { $set: { instructorID: teacherID, instructorName:user.username, instructorProfilePhoto:user.profilePicture} });
      res.status(200).send("Teacher assigned successfully.");
    } else {
      res.status(404).send("Cohort not found.");
    }
  } catch (error) {
    console.error("Error assigning teacher:", error);
    res.status(500).send("Internal server error.");
  }
});


app.put("/edit-cohort", upload.single('profilePicture'), async (req, res) => {
  const { cohortName, cohortSubject, startDate, endDate, adminID, instructorID, providerID, isLive, cohortID } = req.body;
  try {
    const cohort = await Cohort.findById(cohortID);
    if (cohort) {
      await Cohort.updateMany({ _id: cohortID }, { $set: { cohortName, cohortSubject, adminID, instructorID, isLive, providerID, dateRange:{startDate, endDate}} });
      res.status(200).json({ message: "Cohort updated successfully" });
    } else {
      res.status(404).json({ message: "Cohort not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//edit users information 

app.put('/edit-user', upload.single('profilePicture'), async (req, res) => {
  const { firstName, lastName, dob, email, phoneNumber, address, role, id, profilePicture} = req.body;
  try {
    // Check if the user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Upload profile picture to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path);

    // Update user information
    const updatedUser = await User.findOneAndUpdate(
      { _id: id },
      { 
        firstName, 
        lastName, 
        dob, 
        email, 
        phoneNumber, 
        address, 
        profilePicture: result.secure_url, 
        role 
      },
      { new: true } // Return the updated user
    );

    res.status(200).json({ message: "User was successfully updated", user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//handle user-edit if no image is being uploaded
app.put('/edit-user-no-photo', async (req, res) => {
  const { firstName, lastName, dob, email, phoneNumber, address, role, id} = req.body;
  console.log(id)
  try {
    // Check if the user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Update user information
    const updatedUser = await User.findOneAndUpdate(
      { _id: id },
      { 
        firstName, 
        lastName, 
        dob, 
        email, 
        phoneNumber, 
        address, 
        role 
      },
      { new: true } // Return the updated user
    );
    res.status(200).json({ message: "User was successfully updated", user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//add post to discussion db but also passing in cohort id
app.post('/discussion-post', async (req, res) => {
  const { ownerOfPost, cohortId, postTitle, postContent, ownerOfPostPhoto, postType } = req.body;

  try {
    // Check if the cohort exists
    const cohort = await Cohort.findById(cohortId);
    if (!cohort) {
      return res.status(404).json({ error: 'Cohort not found' });
    }

    // Create a new discussion post
    const newPost = new DiscussionPost({
      title: postTitle,
      ownerName: ownerOfPost,
      content: postContent,
      cohort: cohortId, // Set the cohort reference
      ownerPicture: ownerOfPostPhoto,
      postType: postType
    });
   
    // Save the new pdsfost to the database
    await newPost.save();

    res.status(201).json({ message: 'Post created successfully', post: newPost });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


//adds a post to the discussion board of a given cohort

app.get('/discussion-posts', async (req, res) => {
  const { cohortId } = req.query; // Use req.query to access query parameters
  
  try {
    // Find all discussion posts belonging to the specified cohort
    const posts = await DiscussionPost.find({ cohort: cohortId });

    if (!posts || posts.length === 0) {
      return res.status(404).json({ message: 'No posts found for this cohort' });
    }

    res.status(200).json({ posts });
  } catch (error) {
    console.error('Error retrieving posts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//getting a post 
app.get('/get-post', async (req, res) => {
  const {_id} = req.query;
  try {
    const post = await DiscussionPost.findById({_id});

    if(post){
      res.status(200).json({post})
    }
  } catch (error) {
    console.error('Error retrieving posts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post("/add-comment", async (req, res) => {
  const { _id, comment, profilePicture, username } = req.body;
  try {
    const post = await DiscussionPost.findById(_id);
    if (post) {
      await DiscussionPost.updateOne(
        { _id },
        { $push: { comments: { content: comment, ownerName: username, ownerPicture:profilePicture } } }
      );
      res.status(200).json({post});
    } else {
      res.status(404).json({ message: "Post not found" });
    }
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//delte comment
app.delete("/delete-comment", async (req, res) => {
  const { _id, comment} = req.body;
  try {
      const updatedPost = await DiscussionPost.findByIdAndUpdate(
          _id,
          { $pull: { comments: { _id:comment } } },
          { new: true }
      );
      if (updatedPost) {
          res.status(200).json({ message: "Comment deleted", post: updatedPost });
      } else {
          res.status(404).json({ message: "Post not found" });
      }
  } catch (error) {
      console.error('Error deleting comment:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

//edit comment 
app.post("/edit-comment", async (req, res) => {
  const { _id, commentID, content } = req.body;
  try {
    const updatedPost = await DiscussionPost.findByIdAndUpdate(
      _id,
      { $set: { "comments.$[elem].content": content } },
      { new: true, arrayFilters: [{ "elem._id": commentID }] }
    );

    if (updatedPost) {
      res.status(200).json({ message: "Comment successfully edited", post: updatedPost });
    } else {
      res.status(404).json({ error: "Post or comment not found" });
    }
  } catch (error) {
    console.error('Error editing comment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});





//add a reply to comment
app.post("/reply", async (req, res) => {
  const { replierName, replierPicture, _id, commentID, replyContent } = req.body;
  try {
    const post = await DiscussionPost.findById(_id);
    if (post) {
      // Find the index of the comment within the comments array
      const commentIndex = post.comments.findIndex(comment => comment._id.toString() === commentID);
      if (commentIndex !== -1) {
        // Push the new reply into the replies array of the found comment
        post.comments[commentIndex].replies.push({ ownerName: replierName, ownerPicture: replierPicture, content:replyContent });
        // Save the updated post
        await post.save();
        res.status(200).json({ post });
      } else {
        res.status(404).json({ message: "Comment not found" });
      }
    } else {
      res.status(404).json({ message: "Post not found" });
    }
  } catch (error) {
    console.error('Error adding reply:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//delete a reply to a comment
app.post("/delete-reply", async (req, res) => {
  const { postId, commentId, replyId } = req.body;
  try {
    const post = await DiscussionPost.findById(postId);
    if (post) {
      const commentIndex = post.comments.findIndex(comment => comment._id.toString() === commentId);
      if (commentIndex !== -1) {
        const replyIndex = post.comments[commentIndex].replies.findIndex(reply => reply._id.toString() === replyId);
        if (replyIndex !== -1) {
          // Remove the reply from the replies array of the comment
          post.comments[commentIndex].replies.splice(replyIndex, 1);
          // Save the updated post
          await post.save();
          res.status(200).json({ message: "Reply deleted successfully" });
        } else {
          res.status(404).json({ message: "Reply not found" });
        }
      } else {
        res.status(404).json({ message: "Comment not found" });
      }
    } else {
      res.status(404).json({ message: "Post not found" });
    }
  } catch (error) {
    console.error('Error deleting reply:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



//delete a post from discussion board
app.delete("/delete-post", async (req, res) => {
  const { _id, cohortId } = req.body;
  try {
      const deletedPost = await DiscussionPost.findOneAndDelete({ _id });
      if (deletedPost) {
          const updatedPosts = await DiscussionPost.find({cohort: cohortId});
          res.status(200).json({ message: "Deleted post", posts: updatedPosts });
      } else {
          res.status(404).json({ message: "Post not found" });
      }
  } catch (error) {
      res.status(500).json({ message: "Server error" });
  }
});


//messaging 
app.put('/add-contact', async (req, res) => {
  const userId = req.params.userId;
  const { id, photo } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send('User not found');
    }

    user.contacts.push({ contact: { id, photo } });
    await user.save();
    res.status(200).send('Contact added successfully');
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});

//updating cohort with user data if they choose to edit theyre profile
app.put('/updateUserInCohorts', async (req, res) => {
  const { firstName, lastName, profilePicture, id } = req.body;

  try {
      // Fetch all cohorts where the user is a member
      const userCohorts = await Cohort.find({ 'students.student.id': id });

      // Update user data in each cohort
      await Promise.all(userCohorts.map(async (cohort) => {
          // Find the student entry for the user in the cohort
          const studentIndex = cohort.students.findIndex(student => student.student.id === id);
          if (studentIndex !== -1) {
              // Construct updated user data
              const updatedUserData = {
                  firstName,
                  lastName,
                  profilePicture
              };
              // Update user data in the cohort
              cohort.students[studentIndex].student = { ...cohort.students[studentIndex].student, ...updatedUserData };
              await cohort.save();
              console.log('cohorts updated')
          }
      }));

      res.status(200).json({ message: 'User data updated in all cohorts successfully' });
  } catch (error) {
      console.error('Error updating user data in cohorts:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

//update contacts when editing profile
app.put('/update-my-contact-info', async (req, res) => {
  const { id, firstName, lastName, photo } = req.body;
  console.log('Received ID:', id);

  try {
    // Find all users who have the specified user in their contacts
    const userContacts = await User.find({ 'contacts.contact.id': id });

    // Log the result of the find query
    console.log('User Contacts:', userContacts);

    // If no users are found, log a message and return
    if (userContacts.length === 0) {
      console.log('No users found with the specified contact ID.');
      return res.status(404).json({ message: 'No users found with the specified contact ID.' });
    }

    // Update user data in each contact list
    await Promise.all(userContacts.map(async (contact) => {
      const userIndex = contact.contacts.findIndex(user => user.contact.id === id);
      if (userIndex !== -1) {
        // Update contact information
        contact.contacts[userIndex].contact.firstName = firstName;
        contact.contacts[userIndex].contact.lastName = lastName;
        if (photo) {
          contact.contacts[userIndex].contact.photo = photo;
        }
        await contact.save();
      }
    }));

    res.status(200).json({ message: 'User contact info updated successfully in all contact lists' });
  } catch (error) {
    console.error('Error updating user contact info:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

   //update message to read
   app.get('/message-read', async (req, res) => {
    const { chatId, senderId } = req.query; // Retrieve chatId from req.query

    try {
        const chats = await Chat.updateMany(
            { _id: chatId, "messages.read": false },
            { $set: { "messages.$[elem].read": true } },
            { arrayFilters: [{ "elem.sender": { $ne: senderId } }] } // Update only if senderId is not equal to id
        );
        res.status(200).send('Messages marked as read');
    } catch (error) {
        res.status(500).send('Error marking messages as read');
    }
});


app.put('/update-participant-info', async (req, res) => {
  const { id, firstName, lastName, photo } = req.body;
  
  try {
    // Find all chats where the specified user is a participant
    const chats = await Chat.find({ 'participants.id': id });

    // Log the result of the find query
    console.log('Chats with the participant:', chats);

    // If no chats are found, log a message and return
    if (chats.length === 0) {
      console.log('No chats found with the specified participant ID.');
      return res.status(404).json({ message: 'No chats found with the specified participant ID.' });
    }

    // Update participant data in each chat
    await Promise.all(chats.map(async (chat) => {
      const participantIndex = chat.participants.findIndex(participant => participant.id === id);
      if (participantIndex !== -1) {
        // Update participant information
        chat.participants[participantIndex].firstName = firstName;
        chat.participants[participantIndex].lastName = lastName;
        if (photo) {
          chat.participants[participantIndex].picture = photo;
        }
        await chat.save();
      }
    }));

  
  

    res.status(200).json({ message: 'Participant info updated successfully in all chats' });
  } catch (error) {
    console.error('Error updating participant info:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});






io.listen(3000)
const PORT = process.env.PORT || 4000; // Define port for the server to listen on
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`); // Log server start message
});
