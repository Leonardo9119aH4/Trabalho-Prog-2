import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { answerUser } from "./scriptGemini.js";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

app.use(express.static("public")); // coloque o HTML em /public

// Armazenar usuários conectados
const connectedUsers = new Map(); // socket.id -> username

const processCommand = async (socket, username, message) => {
  console.log('entrou no process')
  const args = message.slice(1).split(' ');
  const command = args[0].toLowerCase();

  switch (command) {
    case 'help':
      socket.emit("command-response", {
        message: "📋 Comandos disponíveis:\n/help - Mostra esta mensagem\n/users - Lista usuários online\n/time - Mostra horário atual\n/clear - Limpa seu chat\n/whisper [usuário] [mensagem] - Mensagem privada"
      });
      break;
      
    case 'users':
      const userList = Array.from(connectedUsers.values()).join(', ');
      socket.emit("command-response", {
        message: `👥 Usuários online (${connectedUsers.size}): ${userList}`
      });
      break;
      
    case 'time':
      const now = new Date().toLocaleString('pt-BR');
      socket.emit("command-response", {
        message: `🕒 Horário atual: ${now}`
      });
      break;
    
    case 'ia':
      const answer = await answerUser(message - args[0]);
      io.emit("message", {
        username: IA,
        message: answer
      });
      break;
  };
  return;
};

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

    if (msg.message.startsWith('/')){
      processCommand(socket, msg.username, msg.message);
      return;
    }

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
