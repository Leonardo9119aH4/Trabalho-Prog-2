const socket = io();
const chat = document.getElementById("chat");
const form = document.getElementById("form");
const msgInput = document.getElementById("msg");

// Solicitar nome do usuário
let username = prompt("Digite seu nome:");
while (!username || username.trim() === "") {
    username = prompt("Por favor, digite um nome válido:");
}
username = username.trim();

// Registrar usuário no servidor
socket.emit("user-join", { username });

const appendMsg = (data, type = "normal") => {
    const div = document.createElement("div");
    
    if (type === "system") {
        div.textContent = `👤 ${data.message}`;
        div.classList.add("msg", "system-msg");
    } else {
        div.textContent = `> ${data.username}: ${data.message}`;
        div.classList.add("msg");
    }
    
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
};

form.addEventListener("submit", e => {
    e.preventDefault();
    if (msgInput.value.trim()) {
    socket.emit("message", {
        username: username,
        message: msgInput.value.trim()
    });
    msgInput.value = "";
    }
});

// Eventos do Socket.IO
socket.on("message", data => appendMsg(data));

socket.on("user-joined", data => {
    appendMsg(data, "system");
});

socket.on("user-left", data => {
    appendMsg(data, "system");
});