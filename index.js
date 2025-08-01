import express from "express";
import session from "express-session";
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose, { set } from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { dirname } from 'path';
dotenv.config();
import {routes} from './routes.js';
import { User, Message} from './database.js';
import { setupServer } from "./server.js";
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const httpServer = createServer(app);

httpServer.listen(3000, "0.0.0.0", () => {
    console.log(`✅ Servidor no ar: http://localhost:3000`);
});

mongoose.connect('mongodb://localhost:27017/programacao', { useNewUrlParser: true, useUnifiedTopology: true });
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: "abc",
  resave: false,
  saveUninitialized: true
}));

app.use('/pages', express.static(path.join(__dirname, 'pages'))); // Servir as páginas estáticas
//app.use('/public', express.static(path.join(__dirname, 'public'))); // Servir os arquivos públicos
app.get("/", (req, res) => {
  res.redirect("/pages/home/main.html");
});
routes(app);
setupServer(httpServer);
