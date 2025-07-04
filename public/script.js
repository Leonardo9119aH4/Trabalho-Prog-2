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

const appendMsg = (data) => {
    const div = document.createElement("div");
    div.textContent = `> ${data.username}: ${data.message}`;
    div.classList.add("msg");
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

socket.on("message", appendMsg);