import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import apiRoutes from './routes/api.routes.js';
import { setupSocketHandlers } from './sockets/socket.handler.js';

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// API Routes
app.use('/api', apiRoutes);

// Socket.io Handlers
setupSocketHandlers(io);

const PORT = 3001;
httpServer.listen(PORT, () => {
  console.log(`Advanced server running at http://localhost:${PORT}`);
});
