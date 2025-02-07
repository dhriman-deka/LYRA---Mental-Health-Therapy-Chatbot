import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from 'dotenv';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import Chat from "./models/chat.js";
import UserChats from "./models/userChats.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));

const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGO);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.log("MongoDB connection error:", err);
  }
};

// Create new chat
app.post("/api/chats", ClerkExpressRequireAuth(), async (req, res) => {
  const userId = req.auth.userId;
  const { text } = req.body;

  if (!userId || !text) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const newChat = new Chat({
      userId,
      history: [{ 
        role: "user", 
        parts: [{ text }] 
      }],
    });

    const savedChat = await newChat.save();

    const userChats = await UserChats.findOne({ userId });
    
    if (!userChats) {
      await new UserChats({
        userId,
        chats: [{
          _id: savedChat._id,
          title: text.substring(0, 40),
          createdAt: new Date()
        }],
      }).save();
    } else {
      await UserChats.updateOne(
        { userId },
        {
          $push: {
            chats: {
              _id: savedChat._id,
              title: text.substring(0, 40),
              createdAt: new Date()
            }
          }
        }
      );
    }

    res.status(201).json(savedChat._id);
  } catch (err) {
    console.error("Error creating chat:", err);
    res.status(500).json({ error: "Error creating chat" });
  }
});

// Update chat
app.put("/api/chats/:id", ClerkExpressRequireAuth(), async (req, res) => {
  const userId = req.auth.userId;
  const { question, answer } = req.body;

  try {
    const chat = await Chat.findOne({ 
      _id: req.params.id, 
      userId 
    });

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    if (question) {
      chat.history.push({
        role: "user",
        parts: [{ text: question }]
      });
    }

    if (answer) {
      chat.history.push({
        role: "model",  // Changed from 'assistant' to 'model' to match schema
        parts: [{ text: answer }]
      });
    }

    await chat.save();

    // Update UserChats title if needed
    if (question) {
      await UserChats.updateOne(
        { userId, "chats._id": req.params.id },
        { 
          $set: { 
            "chats.$.title": question.substring(0, 40)
          }
        }
      );
    }

    res.status(200).json(chat);
  } catch (err) {
    console.error("Error updating chat:", err);
    res.status(500).json({ error: "Error updating chat" });
  }
});

// Get user chats
app.get("/api/userchats", ClerkExpressRequireAuth(), async (req, res) => {
  const userId = req.auth.userId;

  try {
    const userChats = await UserChats.findOne({ userId });
    if (!userChats) {
      return res.status(200).json([]);
    }
    res.status(200).json(userChats.chats);
  } catch (err) {
    console.error("Error fetching userchats:", err);
    res.status(500).json({ error: "Error fetching userchats" });
  }
});

// Get single chat
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

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(401).json({ error: 'Unauthenticated' });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  connect();
  console.log(`Server running on port ${port}`);
});

export default app;