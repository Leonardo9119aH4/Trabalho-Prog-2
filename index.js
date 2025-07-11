import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose, { set } from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { dirname } from 'path';
dotenv.config();
import {routes} from './routes.js';
import { User, Mensage } from './database.js';
import { setupServer } from "./server.js";
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
mongoose.connect('mongodb://localhost', { useNewUrlParser: true, useUnifiedTopology: true });

app.use('/pages', express.static(path.join(__dirname, 'pages'))); // Servir as páginas estáticas
app.use('/public', express.static(path.join(__dirname, 'public'))); // Servir os arquivos públicos
routes(app);
setupServer(app);
