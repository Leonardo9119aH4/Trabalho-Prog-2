
import express from "express";
import session from "express-session";
import { User } from './database.js';
import req from "express/lib/request.js";

// Middleware para verificar se o usuário está autenticado
async function requireLogin(req, res, next) {
    if(req.session && req.session.user){
        const user = await User.findById(req.session.user._id);
        if (user) {
           next();
           return;
        }
        res.status(401).json('Usuário não existe');
        return;
    }
    res.status(401).json("Usuário não autenticado");
    return;
}

function routes(app){
    app.post('/signup', async (req, res) => {
        const { username, password } = req.body;
        const userExists = await User.findOne({ username });
            if (userExists) {
                res.status(400).json('Usuário já existe');
                return;
            }
        const user = new User({ username, password });
        await user.save();
        res.status(201).json('Usuário registrado com sucesso');
    });

    app.post('/login', async (req, res) => {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (user && user.password === password) {
            req.session.user = user;
            res.status(200).json('Login bem-sucedido');
        }
        else {
            res.status(401).json('Nome de usuário e/ou senha incorretos');
        }
    });

    app.get('/logout', async (req, res) => {
        req.session.destroy(err => {
            if (err) {
                return res.status(500).json('Erro ao fazer logout');
            }
            res.status(200).json('Logout bem-sucedido');
        });
    });

    app.get('/user', requireLogin, async (req, res) => {
        res.status(200).json(req.session.user);
    });

    app.get('/userStats', requireLogin, async (req, res) => {
    try {
        const user = await User.findById(req.session.user._id);
        if (!user) {
            return res.status(400).json("Informações do usuário não foram encontradas.");
        }
        
        res.status(200).json({
            userName: user.username,
            userMessagesSent: user.messagesSent || 0,
            userWhenCreated: user.whenCreated
        });
    } catch {
        return res.status(400).json("Informações do usuário não foram encontradas.");
    }
});
}

export { routes };