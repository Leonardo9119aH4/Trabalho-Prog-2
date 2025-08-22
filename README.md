# Socket Chat - Chat em Tempo Real

Um aplicativo de chat em tempo real desenvolvido com Node.js, Socket.IO e MongoDB, com integração de IA para conversas interativas.

## 🚀 Características

- **Chat em tempo real** com WebSocket (Socket.IO)
- **Sistema de autenticação** com sessões
- **Integração com IA** (Google Gemini) para conversas inteligentes
- **Comandos especiais** do chat (/help, /users, /time, /clear, /ia, /tell)
- **Interface moderna** com design glassmorphism
- **Histórico de mensagens** persistente no MongoDB
- **Indicação de usuários online**
- **Mensagens privadas** entre usuários

## 🛠️ Tecnologias Utilizadas

- **Backend**: Node.js, Express.js
- **WebSocket**: Socket.IO
- **Banco de Dados**: MongoDB com Mongoose
- **IA**: Google Gemini API
- **Frontend**: HTML5, CSS3, JavaScript, Bootstrap 5
- **Autenticação**: Express Session

## 📋 Pré-requisitos

- Node.js (versão 16 ou superior)
- MongoDB (local ou MongoDB Atlas)
- Chave da API do Google Gemini (opcional, para funcionalidade de IA)

## ⚙️ Instalação

1. Clone o repositório:
```bash
git clone https://github.com/Leonardo9119aH4/Trabalho-Prog-2.git
cd Trabalho-Prog-2
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
Crie um arquivo `.env` na raiz do projeto e adicione:
```env
GEMINI_API_KEY=sua_chave_da_api_gemini_aqui
MONGODB_URI=sua_uri_do_mongodb
```

4. Inicie o servidor:
```bash
npm start
```

5. Acesse o aplicativo:
Abra seu navegador e vá para `http://localhost:3000`

## 🎮 Como Usar

1. **Registro/Login**: Crie uma conta ou faça login
2. **Chat**: Digite mensagens no campo de input e pressione Enter
3. **Comandos especiais**:
   - `/help` - Mostra todos os comandos disponíveis
   - `/users` - Lista usuários online
   - `/time` - Mostra horário atual
   - `/clear` - Limpa seu chat (apenas local)
   - `/ia [mensagem]` - Conversa com a IA
   - `/tell [usuário] [mensagem]` - Envia mensagem privada

## 📁 Estrutura do Projeto

```
├── pages/
│   ├── home/       # Página inicial
│   ├── login/      # Página de login
│   ├── signup/     # Página de cadastro
│   └── chat/       # Interface do chat
├── index.js        # Ponto de entrada da aplicação
├── server.js       # Configuração do servidor Socket.IO
├── routes.js       # Rotas da API
├── database.js     # Modelos do MongoDB
├── scriptGemini.js # Integração com IA
└── package.json    # Dependências e scripts
```

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença ISC. Veja o arquivo `LICENSE` para mais detalhes.

## 👨‍💻 Desenvolvedor

Leonardo - [@Leonardo9119aH4](https://github.com/Leonardo9119aH4)

---

<!--
CONTEÚDO ORIGINAL COMENTADO (Tutorial de implementação):

# Web Socket - como programar

Para poder criar um servidor web socket com conexão em tempo real, primeiro é necessário configurar e criar o servidor, de forma análoga ao que acontece com o Express.

Antes de tudo, copie e execute o comando abaixo no terminal para instalar as bibliotecas necessárias para o funcionamento deste código:

```bash
npm install
```

Comece copiando e colando o código abaixo e insira abaixo do comentário "Comece por aqui":

```javascript
const io = new Server(httpServer);
io.use((socket, next)=>{
  sessionMiddleware(socket.request, {}, next);
});
```

Para poder identificar cada usuário online, salvar suas mensagens e permitir mensagens privadas, será necessário salvá-los em um Map, note que eles serão identificados pelo socket id:

```javascript
let connectedUsers = new Map();
```

O `io.on("connection", [...])` é um escutador do evento "connection", que é enviado pelo cliente e é responsável por estabelecer a conexão web socket cliente-servidor. Dentro dele contém um código a ser executado quando a conexão é estabelecida.

O `io.emit` serve para enviar uma resposta ao cliente, copie e cole o código abaixo dentro de `socket.on("connection", [...])`:

```javascript
io.emit("message", {
  username: 'Sistema',
  message: mensagemSistema
});
```

Note que é interessante salvar estas mensagens no banco de dados para quando outra pessoa entrar, ela consiga visualizar todas as mensagens já enviadas, e os registros de entrada e saída de usuários. Copie e cole o código abaixo:

```javascript
salvarMensagem("Sistema", mensagemSistema);
```

Para que seja possível saber quais usuários estão conectados, é preciso salvá-lo quando ele conecta em uma array. Descomente o código em I (verifique o comentário ao lado do código).

Para enviar o histórico de mensagens ao cliente, descomente o código em II. Note que o `socket.emit` é o responsável pelo envio da resposta ao cliente.

O segundo socket, em III, serve para receber o evento "message" que é a conexão que tem a mensagem enviada pelo cliente. Em IV, há um verificador de sessão do usuário, que exige a autenticação e o login em uma conta. Descomente este código.

Para que os comandos de chat sejam 100% funcionais, copie e cole o código abaixo dentro do escutador `socket.on("message", [...])`, coloque-o depois do verificador de sessão.

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

Descomente o código que começa com `User.findOne...`, ele serve para incrementar o contador de mensagem, e salvar a mensagem enviada pelo usuário ao banco de dados.

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

Agora ligue o servidor e acesse a url `localhost:3000/` para testar. Para ligar o servidor, execute os comandos abaixo no terminal:

```bash
npm run start
```
-->