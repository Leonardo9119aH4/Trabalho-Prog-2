<h1>Web Socket - como programar</h1>
<p>Para poder criar um servidor web socket com conexão em tempo real, primeiro é necessário configurar e criar o servidor, de form análoga com o que acontece com o Express</p>
<p>Começe copiando e colando o código abaixo e insira abaixo do comentário "Aqui que começa a completar</p>
```javascript
const io = new Server(httpServer);
  io.use((socket, next)=>{
    sessionMiddleware(socket.request, {}, next);
  });
```
<p>Para poder identificar cada usuário online, salvar suas mensagens e permitir mensagens privadas, será necessário salvá-los em um Map, note que eles serão identificados pelo socket id</p>
<p>Copie e cole o código abaixo</p>
```javascript
let connectedUsers = new Map();
```
A função 