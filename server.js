
import { Server } from "socket.io";
import { answerUser } from "./scriptGemini.js";
import { User, Message } from './database.js';
import session from "express-session";

function setupServer(httpServer, sessionMiddleware) {
  // Criação do servidor socket
  const io = new Server(httpServer);
  io.use((socket, next)=>{
    sessionMiddleware(socket.request, {}, next);
  });

  // Mapa de usuários conectados
  let connectedUsers = new Map();
  const processCommand = async (socket, username, message) => {
    const args = message.slice(1).split(' ');
    const command = args[0].toLowerCase();
    switch (command) {               // Comandos que o Usuário pode fazer
      case 'help':
        socket.emit("message", {           // Mensagem de comandos do Sistema  
          username: 'Sistema',
          message: "📋 **Comandos disponíveis:**\n" +
                   "• `/help` - Mostra esta mensagem\n" +
                   "• `/users` - Lista usuários online\n" +
                   "• `/time` - Mostra horário atual\n" +
                   "• `/clear` - Limpa seu chat\n" +
                   "• `/ia [mensagem]` - Conversa com a IA" +
                   "• `/tell [usuário] [mensagem]` - Envia uma mensagem privada para outro usuário\n"
        });
        break;
        
      case 'users':                  // Números de usuários online
        const userList = Array.from(connectedUsers.values()).join(', ');
        socket.emit("message", {
          message: `👥 Usuários online (${connectedUsers.size}): ${userList}`
        });
        break;
        
      case 'time':                    // Horário atual   
        const now = new Date().toLocaleString('pt-BR');
        socket.emit("message", {
          username: 'Sistema',
          message: `🕒 Horário atual: ${now}`
        });
        break;
      
      case 'clear':                  //  Limpar as mensagens da conversa (Limpa apenas o seu chat, não apaga a conversa para os outros)
        socket.emit("message", {
          username: 'Sistema',
          message: "🧹 Chat limpo! (apenas para você)"
        });
        socket.emit("clear-chat");
        break;
      
      case 'ia':
        // Extrair a mensagem após o comando /ia
        const userMessage = args.slice(1).join(' ');
        
        if (!userMessage.trim()) {          // Mensagem de erro caso o comando IA esteja escrito errado
          socket.emit("message", {
            username: 'Sistema',
            message: "❌ Por favor, digite uma mensagem após o comando /ia\nExemplo: /ia Olá, como você está?"
          });
          return;
        }
        try {                              // Mensagem correta do comando
          socket.emit("message", {
            username: 'Sistema',
            message: "🤖 Processando sua mensagem com a IA..."
          });
          
          const answer = await answerUser(userMessage);  // Definindo a variavel e guardando a resposta da IA
          
          io.emit("message", {
            username: "🤖 IA",
            message: answer              // Aqui entrega a mensagem da IA
          });
        } catch (error) {                // Caso a IA não entenda ou aconteça algum erro ao entender a pergunta 
          console.error("Erro ao processar comando /ia:", error);
          socket.emit("message", {
            username: 'Sistema',
            message: "❌ Erro ao processar sua mensagem. Tente novamente."
          });
        }
        break;
      case 'tell':        // Comando de Mensagem para apenas um usuário 
        if (args.length < 3) {    // Caso de erro
          socket.emit("message", {
            username: 'Sistema',
            message: "❌ Uso incorreto do comando /tell. Exemplo: `/tell usuário mensagem`"
          });
          return;
        }
        const targetUsername = args[1];
        const messageToSend = args.slice(2).join(' ');
        // Pega o id do socket do usuário alvo
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

  const salvarMensagem = async(usuario, mensagem)=>{
    try {
      const message = new Message({
        username: usuario,
        message: mensagem
      });
      message.save();
    }
    catch(er){
      console.log(er);
    }
  };

  // Escutador de conexão
  io.on("connection", socket => {
    console.log("🟢 Novo cliente conectado");
    socket.on("connection", data => {
      const mensagemSistema = `👋 ${data.username} entrou no chat!`;
      // Mensagem de entrada do usuário
      io.emit("message", {
        username: 'Sistema',
        message: mensagemSistema
      });
      salvarMensagem("Sistema", mensagemSistema);
      // Salva usuário conectado
      connectedUsers.set(socket.id, data.username);
      console.log('connectedUsers:', connectedUsers);
      io.emit("user-joined", JSON.stringify(Object.fromEntries(connectedUsers)));
      // Envia histórico de mensagens
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
    });

    // Evento de mensagem
    socket.on("message", msg => {
      // Verifica sessão
      if (!socket.request.session || !socket.request.session.user) {
        socket.emit("unauthorized");
        return;
      }

      // Comandos de chat
      if (msg.message.startsWith('/')){
        processCommand(socket, msg.username, msg.message);
        return;
      }

      console.log(`💬 ${msg.username}: ${msg.message}`);

      // Salva usuário se não estiver na lista
      if (!connectedUsers.has(socket.id)) {
        connectedUsers.set(socket.id, msg.username);
        console.log(`👤 Novo usuário registrado: ${msg.username}`);
      }

      // Envia mensagem para todos
      io.emit("message", {
        username: msg.username,
        message: msg.message
      });

      // Incrementa contador e salva mensagem
      User.findOneAndUpdate(
        { username: msg.username },
        { $inc: { messagesSent: 1 } },
        { new: true }
      ).catch(err => {
        console.error("Erro ao atualizar mensagens enviadas:", err);
      });
      salvarMensagem(msg.username, msg.message);
    });

    // Evento de digitação
    socket.on("typing", data => {
      if (data.isTyping) {
        console.log(`${data.username} está digitando...`);
        socket.broadcast.emit("typing", {
          username: data.username,
          isTyping: true
        });
      } 
      else {
        socket.broadcast.emit("typing", {
          username: data.username,
          isTyping: false
        });
      }
    });

    // Evento de desconexão
    socket.on("disconnect", () => {
      const username = connectedUsers.get(socket.id);
      if (username) {
        connectedUsers.delete(socket.id);
        salvarMensagem("Sistema", `${username} saiu do chat!`);
        io.emit("message", {
          username: 'Sistema',
          message: `👋 ${username} saiu do chat!`
        });
        io.emit("user-joined", JSON.stringify(Object.fromEntries(connectedUsers)));
        console.log(`🔴 Usuário desconectado: ${username}`);
      }
    });
  });
};

export { setupServer };
