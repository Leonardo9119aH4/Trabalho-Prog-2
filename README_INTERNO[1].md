# Socket Chat — Instruções internas (turma)

Este documento contém o passo a passo detalhado para deixar o projeto 100% funcional, incluindo pontos específicos onde você deve descomentar trechos e colar blocos de código. Não compartilhe este arquivo publicamente.

## 1) Instalação

Execute na raiz do projeto:

```bash
npm install
```

## 1.1) Configuração do arquivo `.env`

Crie um arquivo chamado `.env` na raiz do projeto e preencha as variáveis necessárias:

```
DB_CLUSTER
DB_USER
DB_PASS
```

Ajuste os valores conforme seu ambiente. Certifique-se de que o arquivo `.env` não seja compartilhado publicamente.

## 2) Inicialização do Socket.IO

No arquivo `server.js`, abaixo do comentário "Comece por aqui", adicione:

```javascript
const io = new Server(httpServer);
io.use((socket, next)=>{
  sessionMiddleware(socket.request, {}, next);
});
```

## 3) Estrutura para usuários conectados

Ainda em `server.js`, crie a estrutura para rastrear usuários online (mapeados por `socket.id`):

```javascript
let connectedUsers = new Map();
```

## 4) Evento de conexão

O `io.on("connection", ...)` atende a uma nova conexão WebSocket. Dentro dele, use o `socket.on("connection", ...)` emitido pelo cliente para registrar a entrada do usuário e notificar todos:

```javascript
socket.on("connection", data => {
  const mensagemSistema = `👋 ${data.username} entrou no chat!`;
  io.emit("message", {
    username: 'Sistema',
    message: mensagemSistema
  });
  // Salva a mensagem do sistema no banco
  salvarMensagem("Sistema", mensagemSistema);
  connectedUsers.set(socket.id, data.username);
  io.emit("user-joined", JSON.stringify(Object.fromEntries(connectedUsers)));
});
```


## 5) Lista de conexão de usuários (I) e histórico de mensagens (II)

em I -> descomente a linha
```javascript
connectedUsers.set(socket.id, data.username);
```

Logo após registrar o usuário, envie as mensagens salvas do banco para o cliente atual. Descomente o bloco:

```javascript
Message.find().sort({ time: 1 }).limit(50).then(messages => {
  messages.forEach(msg => {
    socket.emit("message", {
      username: msg.username,
      message: msg.message
    });
  });
}).catch(err => {
  console.error("Erro ao buscar mensagens:", err);
});
```

## 6) Receber mensagens (III) + verificação de sessão (IV)

No handler do evento `message`, garanta a verificação de sessão e o suporte a comandos:

```javascript
socket.on("message", msg => {
  if (!socket.request.session || !socket.request.session.user) {
    socket.emit("unauthorized");
    return;
  }
  if (msg.message.startsWith('/')){
    processCommand(socket, msg.username, msg.message);
    return;
  }

  io.emit("message", {
    username: msg.username,
    message: msg.message
  });

  // Atualizar estatística do usuário (descomentar)
  User.findOneAndUpdate(
    { username: msg.username },
    { $inc: { messagesSent: 1 } },
    { new: true }
  );

  // Salvar no banco
  salvarMensagem(msg.username, msg.message);
});
```

## 7) Indicador de digitação (VI)

Ative o indicador de digitação no servidor:

```javascript
socket.on("typing", data => {
  if (data.isTyping) {
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
```

No cliente (`pages/chat/script.js`), emita `typing` no input, e oculte após 500ms sem digitar.

## 8) Desconexão do usuário

Adicione o handler para atualizar os usuários conectados e registrar a saída:

```javascript
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
  }
});
```

## 9) Função `salvarMensagem`

Implemente para persistir mensagens do sistema e do usuário:

```javascript
async function salvarMensagem(usuario, mensagem) {
  const message = new Message({ username: usuario, message: mensagem });
  await message.save();
}
```

## 10) Dicas

- Garanta que `sessionMiddleware` está sendo usado tanto no Express quanto no Socket.IO.
- Sempre valide `socket.request.session.user` no servidor antes de aceitar mensagens.
- No cliente, redirecione para login/registro quando `fetch('/user')` retornar 401.

## 11) Como executar

```bash
npm install
npm run start
```

Acesse: http://localhost:3000/
