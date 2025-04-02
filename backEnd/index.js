import express from "express";
import cors from "cors";
import path from "path";
import url, { fileURLToPath } from "url";
import mongoose from "mongoose";
import Chat from "./models/chat.js";
import UserChats from "./models/userChats.js";
import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";
import dotenv from "dotenv";

dotenv.config();

// Get port from environment or use fallback
const port = process.env.PORT || 3000;
// Get client URL from environment or use fallback for local development
let clientURL = process.env.CLIENT_URL || "http://localhost:5173";

// If CLIENT_URL doesn't have a protocol, add https://
if (clientURL && !clientURL.startsWith('http')) {
  clientURL = `https://${clientURL}`;
}

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure CORS based on environment
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? clientURL  // In production, only allow the specified client URL
    : '*',       // In development, allow all origins
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json());

// Health check endpoint for Render
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

const connect = async () => {
  try {
    const mongoURI = process.env.MONGO;
    
    if (!mongoURI) {
      console.error("MongoDB connection string not found in environment variables");
      process.exit(1);
    }
    
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000, // Keep trying to connect for 5 seconds
      maxPoolSize: 10 // Maintain up to 10 socket connections
    });
    
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    // Don't exit immediately, as Render might retry
    throw err;
  }
};

app.post("/api/chats", ClerkExpressRequireAuth(), async (req, res) => {
  const userId = req.auth.userId;
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: "Text is required" });
  }

  try {
    // CREATE A NEW CHAT
    const newChat = new Chat({
      userId: userId,
      history: [{ role: "user", parts: [{ text }] }],
    });

    const savedChat = await newChat.save();

    // CHECK IF THE USERCHATS EXISTS
    const userChats = await UserChats.find({ userId: userId });

    // IF DOESN'T EXIST CREATE A NEW ONE AND ADD THE CHAT IN THE CHATS ARRAY
    if (!userChats.length) {
      const newUserChats = new UserChats({
        userId: userId,
        chats: [
          {
            _id: savedChat._id,
            title: text.substring(0, 40),
          },
        ],
      });

      await newUserChats.save();
    } else {
      // IF EXISTS, PUSH THE CHAT TO THE EXISTING ARRAY
      await UserChats.updateOne(
        { userId: userId },
        {
          $push: {
            chats: {
              _id: savedChat._id,
              title: text.substring(0, 40),
            },
          },
        }
      );
    }

    res.status(201).json(savedChat._id);
  } catch (err) {
    console.error("Error creating chat:", err);
    res.status(500).json({ error: "Error creating chat" });
  }
});

app.get("/api/userchats", ClerkExpressRequireAuth(), async (req, res) => {
  const userId = req.auth.userId;

  try {
    const userChats = await UserChats.find({ userId });
    
    if (!userChats || userChats.length === 0) {
      return res.status(200).json([]);
    }
    
    res.status(200).json(userChats[0].chats);
  } catch (err) {
    console.error("Error fetching userchats:", err);
    res.status(500).json({ error: "Error fetching userchats" });
  }
});

app.get("/api/chats/:id", ClerkExpressRequireAuth(), async (req, res) => {
  const userId = req.auth.userId;

  try {
    const chat = await Chat.findOne({ _id: req.params.id, userId });
    
    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }
    
    res.status(200).json(chat);
  } catch (err) {
    console.error("Error fetching chat:", err);
    res.status(500).json({ error: "Error fetching chat" });
  }
});

app.put("/api/chats/:id", ClerkExpressRequireAuth(), async (req, res) => {
  const userId = req.auth.userId;
  const { question, answer } = req.body;

  if (!answer) {
    return res.status(400).json({ error: "Answer is required" });
  }

  const newItems = [
    ...(question ? [{ role: "user", parts: [{ text: question }] }] : []),
    { role: "model", parts: [{ text: answer }] },
  ];

  try {
    const result = await Chat.updateOne(
      { _id: req.params.id, userId },
      {
        $push: {
          history: {
            $each: newItems,
          },
        },
      }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Chat not found" });
    }
    
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Error updating chat:", err);
    res.status(500).json({ error: "Error updating chat" });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' 
      ? "Internal server error" 
      : err.message || "Something went wrong"
  });
});

// In production (like on Render), setup differs based on deployment type
if (process.env.NODE_ENV === "production") {
  // Check if RENDER environment variable is set (Render sets this automatically)
  if (process.env.RENDER) {
    // On Render, frontend and backend are separate services
    // Only setup API routes, no static file serving needed
    console.log("Running on Render with separate frontend service");
  } else {
    // For other production environments (e.g., local Docker), serve static files
    const staticPath = path.join(__dirname, "../build");
    app.use(express.static(staticPath));
    
    app.get("*", (req, res) => {
      // Only serve HTML for non-API routes
      if (!req.path.startsWith('/api/')) {
        res.sendFile(path.join(staticPath, "index.html"));
      }
    });
  }
}

// Connect to database when server starts
connect()
  .then(() => {
    const server = app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });

    // Handle graceful shutdown
    const gracefulShutdown = (signal) => {
      console.log(`${signal} signal received: closing HTTP server`);
      server.close(() => {
        console.log('HTTP server closed');
        // Close MongoDB connection
        mongoose.connection.close(false)
          .then(() => {
            console.log('MongoDB connection closed');
            process.exit(0);
          })
          .catch(err => {
            console.error('Error closing MongoDB connection', err);
            process.exit(1);
          });
      });
    };

    // Listen for termination signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  })
  .catch(err => {
    console.error("Failed to connect to MongoDB:", err);
    // Exit with error code so Render will retry, but wait a moment
    // to prevent immediate restarts causing a restart loop
    setTimeout(() => {
      process.exit(1);
    }, 3000);
  });