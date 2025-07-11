import express from "express";
import session from "express-session";

function routes(app){
    app.post('/signup', async (req, res) => {
        const { username, password } = req.body;
        const users = await User.find({ username });
        for(const user of users) {
            if (user.username === username) {
                return res.status(400).send('Usuário já existe');
            }
        }
        const user = new User({ username, password });
        await user.save();
        res.status(201).send('Usuário registrado com sucesso');
    });

    app.post('/login', async (req, res) => {
        const { username, password } = req.body;
        const user = await User.findOne({ username, password });
        if (user) {
            req.session.user = user;
            res.send('Login bem-sucedido');
        } else {
            res.status(401).send('Nome de usuário e/ou senha incorretos');
        }
    });
}

export { routes };