const socket = io();

function redirectIfNotLogged() {
    fetch('/user')
        .then(response => {
            if (response.status === 401) {
                window.location.href = '../signup/main.html';
            }
        });
}

async function sla() {
    // Tenta obter usuário logado, se não, usa 'Usuário' como padrão
    let username = 'Usuário';
    try {
        const response = await fetch('/user');
        console.log("achou")
        if (response.ok) {
            const user = await response.json();
            if (user && user.username) {
                username = user.username;
                socket.emit("connection", { username });
            }
        }
    } catch (error) {
        // Ignora erro, mantém 'Usuário' como padrão
    }


    const messagesBox = document.getElementById('messages-box');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const typingIndicator = document.getElementById('typing-indicator');
    const currentUsernameElement = document.getElementById('current-username');
    const statusElement = document.getElementById('status');
    const userListElement = document.getElementById('users-list');
    
    // Variável para controlar timeout de digitação
    let typingTimeout;

    // Mostrar nome do usuário no topo
    currentUsernameElement.textContent = username;
    
    // Atualizar status da conexão
    socket.on('connect', () => {
        statusElement.textContent = 'Conectado';
        statusElement.classList.remove('text-warning');
        statusElement.classList.add('text-light');
    });
    
    socket.on('disconnect', () => {
        statusElement.textContent = 'Desconectado';
        statusElement.classList.remove('text-light');
        statusElement.classList.add('text-warning');
    });
    
    function appendMessage(data, type = "normal") {
        const messageContainer = document.createElement('div');
        
        if (type === "system") {
            // Mensagem do sistema (entrada/saída de usuários)
            const systemMsg = document.createElement('div');
            systemMsg.className = 'system-msg';
            systemMsg.textContent = `👤 ${data.message}`;
            messagesBox.appendChild(systemMsg);

        }else {
            // Determina se a mensagem é do usuário atual ou de outro
            const isCurrentUser = data.username === username;
            messageContainer.className = isCurrentUser ? 'message-container sent' : 'message-container received';
            
            // Adiciona o nome do remetente
            if (!isCurrentUser) {
                const senderElement = document.createElement('div');
                senderElement.className = 'message-sender';
                senderElement.textContent = data.username;
                messageContainer.appendChild(senderElement);
            }
            
            // Adiciona o conteúdo da mensagem
            const messageElement = document.createElement('div');
            messageElement.className = 'message';
            messageElement.textContent = data.message;
            messageContainer.appendChild(messageElement);
            
            messagesBox.appendChild(messageContainer);
        }
        
        messagesBox.scrollTop = messagesBox.scrollHeight;
    }
    
    // Enviar mensagem
    async function sendMessage() { 
        // Verifica autenticação antes de enviar mensagem
        try {
            const response = await fetch('/user');
            if (response.status === 401) {
                window.location.href = '../signup/main.html';
                return;
            }
        } catch (error) {
            window.location.href = '../signup/main.html';
            return;
        }
        const message = messageInput.value.trim();
        if (message) {
            socket.emit("message", {
                username: username,
                message: message
            });
            messageInput.value = "";
            // Notificar que parou de digitar (envia objeto consistente)
            socket.emit('typing', { username: username, isTyping: false });
        }
    }
    
    // Detectar quando o usuário está digitando
    messageInput.addEventListener('input', () => {
        // Notifica que está digitando
        socket.emit('typing', { username: username, isTyping: true });
        console.log(`${username} está digitando...`);

        // Resetar o timeout e notificar que parou de digitar após 500ms de inatividade
        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => {
            socket.emit('typing', { username: username, isTyping: false });
        }, 500);
    });

    // Garantir que, ao fechar/recargar a página, o status de digitação seja limpo no servidor
    window.addEventListener('beforeunload', () => {
        try {
            socket.emit('typing', { username: username, isTyping: false });
        } catch (e) {
            // ignore
        }
    });
    
    // Event listeners
    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // Eventos do Socket.IO
    socket.on("message", data => appendMessage(data));
    socket.on("user-left", data => appendMessage(data, "system"));
    
    // Receber notificação de digitação
    socket.on('typing', (data) => {
        let typingUsers = [];
        try {
            typingUsers = typeof data === 'string' ? JSON.parse(data) : data;
            if (!Array.isArray(typingUsers)) typingUsers = [];
        } catch (e) {
            typingUsers = [];
        }

        // Se não houver ninguém digitando, esconder o indicador
        if (typingUsers.length === 0) {
            typingIndicator.textContent = '';
            return;
        }

        // Formatar nomes e ajustar plural
        const names = typingUsers.join(', ');
        const verb = typingUsers.length > 1 ? 'estão' : 'está';
        typingIndicator.textContent = `${names} ${verb} digitando...`;
        messagesBox.scrollTop = messagesBox.scrollHeight;
    });

    socket.on('user-joined', usersPackage => {
        // Atualizar lista de usuários conectados
        userListElement.innerHTML = ''; // Limpar lista atual
        console.log(usersPackage)
        Object.values(JSON.parse(usersPackage)).forEach(userName => {
            const userItem = document.createElement('li');
            userItem.textContent = userName;
            userListElement.appendChild(userItem);
        });
    })
}
sla()