const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const http = require('http');
const { Server } = require('socket.io');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Should be replaced with frontend URL in production
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/code', require('./routes/codeRoutes'));
app.use('/api/challenges', require('./routes/challengeRoutes'));
app.use('/api/forum', require('./routes/forumRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/leaderboard', require('./routes/leaderboardRoutes'));
app.use('/api/live-classes', require('./routes/liveClassRoutes'));

// Socket.IO
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  socket.on('join-class', (classId) => {
    socket.join(classId);
    console.log(`Socket ${socket.id} joined class ${classId}`);
  });

  socket.on('send-message', (data) => {
    io.to(data.classId).emit('receive-message', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
