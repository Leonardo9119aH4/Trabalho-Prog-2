# Web Socket - como programar<
Para poder criar um servidor web socket com conexão em tempo real, primeiro é necessário configurar e criar o servidor, de form análoga com o que acontece com o Express
Antes de tudo copie e execute o comando abaixo no terminal para instalar as bibliotecas necessárias para o funcionamento deste código
```bash
npm install
```
Começe copiando e colando o código abaixo e insira abaixo do comentário "Comece por aqui"
```javascript
const io = new Server(httpServer);
  io.use((socket, next)=>{
    sessionMiddleware(socket.request, {}, next);
  });
```
Para poder identificar cada usuário online, salvar suas mensagens e permitir mensagens privadas, será necessário salvá-los em um Map, note que eles serão identificados pelo socket id
Copie e cole o código abaixo
```javascript
let connectedUsers = new Map();
```
O "io.on("connection", [...])" é um escutador do evento "connection", que é enviado pelo cliente e é responsável por estabelecer a conexão web socket cliente-servidor. Dentro dele contém um código a ser executado quando a conexõa é estabelecida.
O "io.emit" serve para enviar uma resposta ao cliente, copie e cole o código abaixo dentro de "socket.on("connection", [...])":
```javascript
io.emit("message", {
      username: 'Sistema',
      message: mensagemSistema
    });
```
Note que é interessante salvar estas mensagens no banco de dados para quando outra pessoa entrar, ela consiga visualizar todas as mensages já enviadas, e os registros de entrada e saída de usuários. Copie e cole o código abaixo:
```javascript
salvarMensagem("Sistema", mensagemSistema);
```
Para que seja possível saber quais usuários estão conectados, é preciso salvá-lo quando ele conecta em uma array. Descomente o código em I (verifique o comentário ao lado do código).

Para enviar o histórico de mensagens ao cliente, descomente o código em II. Note que o "socket.emit" é o responsável pelo envio da resposta ao cliente.

O segundo socket, em III serve para receber o evento "message" que é a conexão que tem a mensagem enviada pelo cliente. Em IV, há um verificador de sessão do usuário, que exige a autenticação e o login em uma conta. Descomente este código.

Para que os comandos de chat sejam 100% funcionais, copie e cole o código abaixo dentro do escutador "socket.on("message", [...])", coloque-o depois do verificador de sessão.
```javascript
if (msg.message.startsWith('/')){
    processCommand(socket, msg.username, msg.message);
    return;
  }
```
Logo após o verificador de lista de usuário, em V, copie e cole o código:
```javascript
io.emit("message", {
  username: msg.username,
  message: msg.message
});
```
Descomente o código que começa com "User.findOne...", ele serve para incrementar o contador de mensagem, e salvar a mensagem enviada pelo usuário ao banco de dados.

Em VI, há um verificador de digitação por parte do usuário, descomente aquele código.

Por fim, é preciso que o servidor detecte se o usuário desconectou-se, copie o código abaixo e cole-o abaixo da função em VI.
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
# Parabéns, você completou o código
Agora ligue o servidor e acesse a url "localhost:3000/" para testar, para ligar o servidor, execute os comandos abaixo no terminal:
```bash
npm run start
```