# Instruções de Completação de Código - WebSocket Chat

Este documento contém as instruções passo a passo para completar a implementação do servidor WebSocket do chat em tempo real.

## 🎯 Objetivo

Implementar funcionalidades completas do servidor WebSocket seguindo as instruções comentadas no código.

## 📝 Pré-requisitos

Antes de começar, certifique-se de que você instalou todas as dependências:

```bash
npm install
```

## 🔧 Passos de Implementação

### 1. Configuração Inicial do WebSocket

Comece copiando e colando o código abaixo e insira abaixo do comentário **"Comece por aqui"** no arquivo `server.js`:

```javascript
const io = new Server(httpServer);
io.use((socket, next)=>{
  sessionMiddleware(socket.request, {}, next);
});
```

### 2. Map de Usuários Conectados

Para poder identificar cada usuário online, salvar suas mensagens e permitir mensagens privadas, será necessário salvá-los em um Map. Note que eles serão identificados pelo socket id:

```javascript
let connectedUsers = new Map();
```

### 3. Configuração do Event Listener de Conexão

O `io.on("connection", [...])` é um escutador do evento "connection", que é enviado pelo cliente e é responsável por estabelecer a conexão WebSocket cliente-servidor. Dentro dele contém um código a ser executado quando a conexão é estabelecida.

### 4. Emissão de Mensagens do Sistema

O `io.emit` serve para enviar uma resposta ao cliente. Copie e cole o código abaixo dentro de `socket.on("connection", [...])`:

```javascript
io.emit("message", {
  username: 'Sistema',
  message: mensagemSistema
});
```

### 5. Salvamento de Mensagens no Banco

Note que é interessante salvar estas mensagens no banco de dados para quando outra pessoa entrar, ela consiga visualizar todas as mensagens já enviadas, e os registros de entrada e saída de usuários. Copie e cole o código abaixo:

```javascript
salvarMensagem("Sistema", mensagemSistema);
```

### 6. Gerenciamento de Usuários Conectados

Para que seja possível saber quais usuários estão conectados, é preciso salvá-lo quando ele conecta em uma array. **Descomente o código em I** (verifique o comentário ao lado do código).

### 7. Histórico de Mensagens

Para enviar o histórico de mensagens ao cliente, **descomente o código em II**. Note que o `socket.emit` é o responsável pelo envio da resposta ao cliente.

### 8. Event Listener para Mensagens

O segundo socket, **em III**, serve para receber o evento "message" que é a conexão que tem a mensagem enviada pelo cliente.

### 9. Verificação de Sessão

**Em IV**, há um verificador de sessão do usuário, que exige a autenticação e o login em uma conta. **Descomente este código**.

### 10. Processamento de Comandos

Para que os comandos de chat sejam 100% funcionais, copie e cole o código abaixo dentro do escutador `socket.on("message", [...])`, coloque-o depois do verificador de sessão:

```javascript
if (msg.message.startsWith('/')){
  processCommand(socket, msg.username, msg.message);
  return;
}
```

### 11. Retransmissão de Mensagens

Logo após o verificador de lista de usuário, **em V**, copie e cole o código:

```javascript
io.emit("message", {
  username: msg.username,
  message: msg.message
});
```

### 12. Incremento do Contador de Mensagens

**Descomente o código** que começa com `User.findOne...`, ele serve para incrementar o contador de mensagem, e salvar a mensagem enviada pelo usuário ao banco de dados.

### 13. Indicador de Digitação

**Em VI**, há um verificador de digitação por parte do usuário, **descomente aquele código**.

### 14. Detecção de Desconexão

Por fim, é preciso que o servidor detecte se o usuário desconectou-se. Copie o código abaixo e cole-o abaixo da função **em VI**:

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
    console.log(`🔴 Usuário desconectado: ${username}`);
  }
});
```

## 🎉 Conclusão

### Parabéns, você completou o código!

Agora ligue o servidor e acesse a url `localhost:3000/` para testar. Para ligar o servidor, execute os comandos abaixo no terminal:

```bash
npm start
```

## 🧪 Testes

Após completar a implementação, teste as seguintes funcionalidades:

1. ✅ **Conexão**: Múltiplos usuários conseguem se conectar
2. ✅ **Mensagens**: Mensagens são enviadas em tempo real
3. ✅ **Comandos**: Comandos especiais funcionam (/help, /users, etc.)
4. ✅ **Histórico**: Mensagens persistem no banco de dados
5. ✅ **Desconexão**: Sistema detecta quando usuários saem
6. ✅ **IA**: Integração com Gemini funciona (se configurada)

## 🐛 Solução de Problemas

### Problemas Comuns:

1. **Erro de conexão MongoDB**: Verifique se o MongoDB está rodando e a URI está correta
2. **API Gemini não funciona**: Verifique se a chave da API está configurada no `.env`
3. **Sessões não persistem**: Verifique se o middleware de sessão está configurado corretamente
4. **WebSocket não conecta**: Verifique se o Socket.IO está configurado corretamente

### Debugging:

Use `console.log()` para debuggar:
```javascript
console.log("🟢 Novo cliente conectado");
console.log("📝 Mensagem recebida:", msg);
console.log("connectedUsers:", connectedUsers);
```

## 📚 Recursos Adicionais

- [Documentação Socket.IO](https://socket.io/docs/)
- [Documentação Express.js](https://expressjs.com/)
- [Documentação MongoDB](https://docs.mongodb.com/)
- [Google Gemini API](https://developers.generativeai.google/)