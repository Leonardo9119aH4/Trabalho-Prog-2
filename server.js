import { Server } from "socket.io";
import { answerUser } from "./scriptGemini.js";
import { User, Message } from './database.js';

function setupServer(httpServer, sessionMiddleware) {
  const io = new Server(httpServer);
  //Disponibiliza a sessão para o socket
  io.use((socket, next)=>{
    sessionMiddleware(socket.request, {}, next);
  });

  // Armazenar usuários conectados (socket.id -> username)
  const connectedUsers = new Map();

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
                   "• `/ia [mensagem]` - Conversa com a IA\n" +
                   "• `/tell [usuário] [mensagem]` - Envia uma mensagem privada para outro usuário\n"
        });
        break;
        
      case 'users':
        const uniqueUsers = Array.from(new Set(connectedUsers.values()));
        const userList = uniqueUsers.join(', ');
        socket.emit("message", {
          message: `👥 Usuários online (${uniqueUsers.length}): ${userList}`
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
      case 'tell':
        if (args.length < 3) {
          socket.emit("message", {
            username: 'Sistema',
            message: "❌ Uso incorreto do comando /tell. Exemplo: `/tell usuário mensagem`"
          });
          return;
        }
        const targetUsername = args[1];
        const messageToSend = args.slice(2).join(' ');
        // pega o id do socket do usuário alvo
        const targetSocketId = Array.from(connectedUsers.entries()).find(([_, user]) => user === targetUsername)?.[0];
        if (!targetSocketId) {
          socket.emit("message", {
            username: 'Sistema',
            message: `❌ Usuário ${targetUsername} não está online ou não existe.`
          });
          return;
        }
        io.to(targetSocketId).emit("message", {
          username: username + " (privado)",
          message: `(privado): ${messageToSend}`
        });
        socket.emit("message", {
          username: 'Sistema',
          message: `✅ Mensagem enviada para ${targetUsername}: ${messageToSend}`
        });
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
      // Salva a mensagem do sistema no banco de dados
      const message = new Message({
        username: "Sistema",
        message: `👋 ${data.username} entrou no chat!`
      });
      message.save().catch(err => {
        console.error("Erro ao salvar mensagem:", err);
      });
      // Deduplica por nome: remove sockets antigos do mesmo usuário
      for (const [id, name] of connectedUsers) {
        if (name === data.username && id !== socket.id) {
          connectedUsers.delete(id);
        }
      }
      connectedUsers.set(socket.id, data.username);
      console.log('connectedUsers:', connectedUsers);
      io.emit("user-joined", JSON.stringify(Object.fromEntries(connectedUsers)));
    });

    // Enviar mensagens salvas do banco de dados
    Message.find().sort({ time: 1 }).limit(50).then(messages => {
      messages.forEach(msg => {
        socket.emit("message", {
          username: msg.username,
          message: msg.message
        });
      });
    }).then(() => {
      console.log("Mensagens recuperadas do banco de dados e enviadas ao cliente");
    }).catch(err => {
      console.error("Erro ao buscar mensagens:", err);
    });

    socket.on("message", msg => {
      if (!socket.request.session || !socket.request.session.user) { // Verfifica se o usuário está logado
        socket.emit("unauthorized");
        return;
      }
      if (msg.message.startsWith('/')){
        processCommand(socket, msg.username, msg.message);
        return;
      }

      console.log(`💬 ${msg.username}: ${msg.message}`);
      
      io.emit("message", {
        username: msg.username,
        message: msg.message
      });

      // Incrementar o contador de mensagens enviadas
      User.findOneAndUpdate(
        { username: msg.username },
        { $inc: { messagesSent: 1 } },
        { new: true }
      ).catch(err => {
        console.error("Erro ao atualizar mensagens enviadas:", err);
      });

      // Salvar a mensagem no banco de dados
      const message = new Message({
        username: msg.username,
        message: msg.message
      });
      message.save().catch(err => {
        console.error("Erro ao salvar mensagem:", err);
      });
    });

    // Limpa otimisticamente no 'disconnecting' (página recarregando)
    socket.on("disconnecting", () => {
      const username = connectedUsers.get(socket.id);
      if (!username) return;
      connectedUsers.delete(socket.id);
      io.emit("user-joined", JSON.stringify(Object.fromEntries(connectedUsers)));
    });

    socket.on("disconnect", (reason) => {
      const username = connectedUsers.get(socket.id);
      // Pode já ter sido removido no 'disconnecting'
      if (username) {
        connectedUsers.delete(socket.id);
      }

      const who = username || `socket ${socket.id}`;

      // Mensagem de saída para todos (apenas se sabermos o usuário)
      if (username) {
        io.emit("message", {
          username: "Sistema",
          message: `👋 ${username} saiu do chat!`
        });

        // Atualiza lista de usuários online para todos
        io.emit("user-joined", JSON.stringify(Object.fromEntries(connectedUsers)));

        // Salva a saída no banco
        const message = new Message({ username: "Sistema", message: `👋 ${username} saiu do chat!` });
        message.save().catch(err => {
          console.error("Erro ao salvar mensagem:", err);
        });
      }

      console.log(`🔴 Desconectado: ${who} (motivo: ${reason})`);
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