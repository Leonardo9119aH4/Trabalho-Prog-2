
import express from "express";
import session from "express-session";
import { User } from './database.js';

// Middleware para verificar se o usuário está autenticado
function requireLogin(req, res, next) {
    if (req.session && req.session.user) {
        next();
    } else {
        res.status(401).json('Usuário não autenticado');
    }
}

function routes(app){
    app.post('/signup', async (req, res) => {
        const { username, password } = req.body;
        const userExists = await User.findOne({ username });
            if (userExists) {
                return res.status(400).json('Usuário já existe');
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

    app.get('/logout', (req, res) => {
        req.session.destroy(err => {
            if (err) {
                return res.status(500).json('Erro ao fazer logout');
            }
            res.status(200).json('Logout bem-sucedido');
        });
    });

    app.get('/user', requireLogin, (req, res) => {
        res.status(200).json(req.session.user);
    });

    app.get('/admin', requireLogin, (req, res) => {
        if (req.session.user.isAdmin) {
            res.status(200).json('Bem-vindo ao painel de administração');
        } else {
            res.status(403).json('Acesso negado');
        }
    });

    app.post('/ban', requireLogin, async (req, res) => {
        if (!req.session.user.isAdmin) {
            return res.status(403).json('Acesso negado');
        }
        const { username } = req.body;
        const user = await User.findOne({ username });
        if (user) {
            user.isBaned = true;
            await user.save();
            res.status(200).json('Usuário banido com sucesso');
        } else {
            res.status(404).json('Usuário não encontrado');
        }
    });

    app.post('/unban', requireLogin, async (req, res) => {
        if (!req.session.user.isAdmin) {
            return res.status(403).json('Acesso negado');
        }
        const { username } = req.body;
        const user = await User.findOne({ username });
        if (user) {
            user.isBaned = false;
            await user.save();
            res.status(200).json('Usuário desbanido com sucesso');
        } else {
            res.status(404).json('Usuário não encontrado');
        }
    });
}

export { routes };