import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

app.use(express.static("public")); // coloque o HTML em /public

io.on("connection", socket => {
  console.log("🟢 Novo cliente conectado");

  socket.on("message", msg => {
    console.log(`💬 ${msg.username}: ${msg.message}`);
    io.emit("message", {
      username: msg.username,
      message: msg.message
    });
  });

  socket.on("disconnect", () => {
    console.log("🔴 Cliente desconectado");
  });
});

httpServer.listen(3000, "0.0.0.0", () => {
  console.log(`✅ Servidor no ar: http://localhost:3000`);
});
