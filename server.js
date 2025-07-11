import { createServer } from "http";
import { Server } from "socket.io";
import { answerUser } from "./scriptGemini.js";

function setupServer(app) {
  const httpServer = createServer(app);
  const io = new Server(httpServer);

  // Armazenar usuários conectados
  const connectedUsers = new Map(); // socket.id -> username

  io.on("connection", socket => {
    console.log("🟢 Novo cliente conectado");

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

    socket.on("message", msg => {
      console.log(`💬 ${msg.username}: ${msg.message}`);
      io.emit("message", {
        username: msg.username,
        message: msg.message
      });
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

  httpServer.listen(3000, "0.0.0.0", () => {
    console.log(`✅ Servidor no ar: http://localhost:3000`);
  });
}

export { setupServer };

