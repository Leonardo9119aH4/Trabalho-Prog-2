import { createServer } from "http";
import { Server } from "socket.io";
import { answerUser } from "./scriptGemini.js";
import { connect } from "http2";

function setupServer(httpServer) {
  const io = new Server(httpServer);

  // Armazenar usuários conectados
  let connectedUsers = []; // socket.id -> username


  const processCommand = async (socket, username, message) => {
    const args = message.slice(1).split(' ');
    const command = args[0].toLowerCase();

    switch (command) {
      case 'help':
        socket.emit("message", {
          username: 'Sistema',
          message: "📋 **Comandos disponíveis:**\n" +
                   "• `/help` - Mostra esta mensagem\n" +
                   "• `/users` - Lista usuários online\n" +
                   "• `/time` - Mostra horário atual\n" +
                   "• `/clear` - Limpa seu chat\n" +
                   "• `/ia [mensagem]` - Conversa com a IA"
        });
        break;
        
      case 'users':
        const userList = Array.from(connectedUsers.values()).join(', ');
        socket.emit("message", {
          message: `👥 Usuários online (${connectedUsers.size}): ${userList}`
        });
        break;
        
      case 'time':
        const now = new Date().toLocaleString('pt-BR');
        socket.emit("message", {
          username: 'Sistema',
          message: `🕒 Horário atual: ${now}`
        });
        break;
      
      case 'clear':
        socket.emit("message", {
          username: 'Sistema',
          message: "🧹 Chat limpo! (apenas para você)"
        });
        socket.emit("clear-chat");
        break;
      
      case 'ia':
        // Extrair a mensagem após o comando /ia
        const userMessage = args.slice(1).join(' ');
        
        if (!userMessage.trim()) {
          socket.emit("message", {
            username: 'Sistema',
            message: "❌ Por favor, digite uma mensagem após o comando /ia\nExemplo: /ia Olá, como você está?"
          });
          return;
        }
        
        try {
          socket.emit("message", {
            username: 'Sistema',
            message: "🤖 Processando sua mensagem com a IA..."
          });
          
          const answer = await answerUser(userMessage);
          
          io.emit("message", {
            username: "🤖 IA",
            message: answer
          });
        } catch (error) {
          console.error("Erro ao processar comando /ia:", error);
          socket.emit("message", {
            username: 'Sistema',
            message: "❌ Erro ao processar sua mensagem. Tente novamente."
          });
        }
        break;
      
      default:
        socket.emit("message", {
          username: 'Sistema',
          message: `❌ Comando desconhecido: \`${command}\`\nDigite \`/help\` para ver os comandos disponíveis.`
        });
        break;
    };
    return;
  };

  io.on("connection", socket => {
    console.log("🟢 Novo cliente conectado");
    socket.on("connection", data => {
      io.emit("message", {
        username: 'Sistema',
        message: `👋 ${data.username} entrou no chat!`
      });
      connectedUsers.push(data.username);
      io.emit("user-joined", {
        users: connectedUsers,
      });
    });

    socket.on("message", msg => {

      if (msg.message.startsWith('/')){
        processCommand(socket, msg.username, msg.message);
        return;
      }

      console.log(`💬 ${msg.username}: ${msg.message}`);
      
      // Armazenar o usuário se ainda não estiver na lista
      if (!connectedUsers.has(socket.id)) {
        connectedUsers.set(socket.id, msg.username);
        console.log(`👤 Novo usuário registrado: ${msg.username}`);
      }
      
      io.emit("message", {
        username: msg.username,
        message: msg.message
      });
    });
    
    socket.on("disconnect", () => {
      const username = connectedUsers.find(user => user.socketId === socket.id)?.username;
      if (username) {
        connectedUsers = connectedUsers.filter(user => user.socketId !== socket.id);
        console.log(`🔴 Usuário desconectado: ${username}`);
      }
    });

    socket.on("typing", data => {
      if (data.isTyping) {
        console.log(`${data.username} está digitando...`);
        socket.broadcast.emit("typing", {
          username: data.username,
          isTyping: true
        });
      } else {
        socket.broadcast.emit("typing", {
          username: data.username,
          isTyping: false
        });
      }
    });
  });
};

export { setupServer };
