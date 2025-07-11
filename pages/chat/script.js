document.addEventListener('DOMContentLoaded', function() {
    const socket = io();
    const messagesBox = document.getElementById('messages-box');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const typingIndicator = document.getElementById('typing-indicator');
    const currentUsernameElement = document.getElementById('current-username');
    const statusElement = document.getElementById('status');
    
    // Variável para controlar timeout de digitação
    let typingTimeout;
    
    // Solicitar nome do usuário
    let username = prompt("Digite seu nome:");
    while (!username || username.trim() === "") {
        username = prompt("Por favor, digite um nome válido:");
    }
    username = username.trim();
    
    // Mostrar nome do usuário no topo
    currentUsernameElement.textContent = username;
    
    // Registrar usuário no servidor
    socket.emit("user-join", { username });
    
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
        } else {
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
    function sendMessage() {
        const message = messageInput.value.trim();
        if (message) {
            socket.emit("message", {
                username: username,
                message: message
            });
            messageInput.value = "";
            
            // Notificar que parou de digitar
            socket.emit('typing', false);
        }
    }
    
    // Detectar quando o usuário está digitando
    messageInput.addEventListener('input', () => {
        socket.emit('typing', true);
        
        // Resetar o timeout
        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => {
            socket.emit('typing', false);
        }, 2000);
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
    socket.on("user-joined", data => appendMessage(data, "system"));
    socket.on("user-left", data => appendMessage(data, "system"));
    
    // Receber notificação de digitação
    socket.on('typing', (data) => {
        if (data.isTyping && data.username !== username) {
            typingIndicator.textContent = `${data.username} está digitando...`;
            typingIndicator.style.display = 'block';
        } else {
            typingIndicator.style.display = 'none';
        }
        messagesBox.scrollTop = messagesBox.scrollHeight;
    });
});