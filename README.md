# Socket Chat — README público

Bem-vindo ao repositório exemplar do projeto “Socket Chat”. Este é um webapp de chat em tempo real construído com:

- Node.js + Express
- Socket.IO (tempo real)
- MongoDB/Mongoose (persistência)
- Bootstrap (UI)

## Como executar

1) Instale as dependências:

```bash
npm install
```

2) Inicie o servidor:

```bash
npm run start
```

3) Acesse no navegador: http://localhost:3000/

## Estrutura do projeto (resumo)

- `index.js`: inicialização do servidor HTTP/Express
- `server.js`: configuração do Socket.IO e eventos do chat
- `database.js`: modelos e integração com o banco
- `routes.js`: rotas HTTP auxiliares
- `pages/`: páginas estáticas (home, login, signup, chat)

## Observações

- Este README é público e contém apenas um panorama geral e passos básicos.
- As instruções detalhadas (com passos de implementação e pontos para “descomentar” trechos) estão no arquivo interno: `README_INTERNO.md`.
- Compartilhe o arquivo interno somente com a turma/avaliadores conforme orientação.