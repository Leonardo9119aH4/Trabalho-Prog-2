import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

app.use(express.static("public")); // coloque o HTML em /public

// Armazenar usuários conectados
const connectedUsers = new Map(); // socket.id -> username

io.on("connection", socket => {
  console.log("🟢 Novo cliente conectado");

  // Evento para quando o usuário se registra
  socket.on("user-join", data => {
    const { username } = data;
    connectedUsers.set(socket.id, username);
    
    // Enviar mensagem de entrada para todos os outros usuários
    socket.broadcast.emit("user-joined", {
      username: username,
      message: `${username} entrou no chat`
    });
    
    console.log(`👤 ${username} entrou no chat`);
  });

  socket.on("message", msg => {
    console.log(`💬 ${msg.username}: ${msg.message}`);
    io.emit("message", {
      username: msg.username,
      message: msg.message
    });
  });

  socket.on("disconnect", () => {
    const username = connectedUsers.get(socket.id);
    if (username) {
      // Enviar mensagem de saída para todos os outros usuários
      socket.broadcast.emit("user-left", {
        username: username,
        message: `${username} saiu do chat`
      });
      
      connectedUsers.delete(socket.id);
      console.log(`🔴 ${username} saiu do chat`);
    } else {
      console.log("🔴 Cliente desconectado");
    }
  });
});

httpServer.listen(3000, "0.0.0.0", () => {
  console.log(`✅ Servidor no ar: http://localhost:3000`);
});
