import express from "express";
import session from "express-session";
import { User } from './database.js';

function routes(app){
    app.post('/signup', async (req, res) => {
        const { username, password } = req.body;
        const users = await User.find({ username });
        for(const user of users) {
            if (user.username === username) {
                return res.status(400).json('Usuário já existe');
            }
        }
        const user = new User({ username, password });
        await user.save();
        res.status(201).json('Usuário registrado com sucesso');
    });

    app.post('/login', async (req, res) => {
        const { username, password } = req.body;
        const user = await User.findOne({ username, password });
        if (user) {
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

    app.get('/user', (req, res) => {
        if (req.session.user) {
            res.status(200).json(req.session.user);
        }
        else {
            res.status(401).json('Usuário não autenticado');
        }
    });

    app.get('/admin', (req, res) => {
        if (req.session.user && req.session.user.isAdmin) {
            res.status(200).json('Bem-vindo ao painel de administração');
        }
        else {
            res.status(403).json('Acesso negado');
        }
    });

    app.post('/ban', async (req, res) => {
        if (!req.session.user || !req.session.user.isAdmin) {
            return res.status(403).json('Acesso negado');
        }
        const { username } = req.body;
        const user = await User.findOne({ username });
        if (user) {
            user.isBaned = true;
            await user.save();
            res.status(200).json('Usuário banido com sucesso');
        }
        else {
            res.status(404).json('Usuário não encontrado');
        }
    });

    app.post('/unban', async (req, res) => {
        if (!req.session.user || !req.session.user.isAdmin) {
            return res.status(403).json('Acesso negado');
        }
        const { username } = req.body;
        const user = await User.findOne({ username });
        if (user) {
            user.isBaned = false;
            await user.save();
            res.status(200).json('Usuário desbanido com sucesso');
        }
        else {
            res.status(404).json('Usuário não encontrado');
        }
    });
}

export { routes };