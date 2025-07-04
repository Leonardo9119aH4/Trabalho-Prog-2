const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv").config();
import {routes} from './routes.js';
import { database } from './database.js';
const app = express();

mongoose.connect('mongodb://localhost', { useNewUrlParser: true, useUnifiedTopology: true });
app.listen(3000, ()=>{
    console.log("Servidor rodando na porta 3000");
})
app.use('/pages', express.static(path.join(__dirname, 'pages')));
app.use('/public', express.static(path.join(__dirname, 'public')));
routes(app); //executa a função routes, onde as rotas estão