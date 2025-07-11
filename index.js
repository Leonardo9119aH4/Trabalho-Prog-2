import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
import {routes} from './routes.js';
import { database } from './database.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);
mongoose.connect('mongodb://localhost', { useNewUrlParser: true, useUnifiedTopology: true });

app.use('/pages', express.static(path.join(__dirname, 'pages')));
app.use('/public', express.static(path.join(__dirname, 'public')));

io.on("connection", socket => {
  console.log("🟢 Novo cliente conectado");

  socket.on("message", msg => {
    console.log(`💬 ${msg.username}: ${msg.message}`);
    io.emit("message", {
      username: msg.username,
      message: msg.message
    });
  });

  socket.on("disconnect", () => {
    console.log("🔴 Cliente desconectado");
  });
});

httpServer.listen(3000, "0.0.0.0", () => {
  console.log(`✅ Servidor no ar: http://localhost:3000`);
});
