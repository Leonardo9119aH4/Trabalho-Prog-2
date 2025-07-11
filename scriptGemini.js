import { createPartFromUri, GoogleGenAI } from "@google/genai";
dotenv.config();
const apiKey = process.env.API_KEY;
import dotenv from "dotenv";

const ai = new GoogleGenAI({ apiKey: apiKey});

export async function answerUser(userQuestion){
    console.log(userQuestion);

    const prompt = `Você é uma assistente virtual amigável que conversa com usuários por meio de um chat em tempo real.

    ✅ Seu objetivo é responder com rapidez, simpatia e clareza às mensagens dos usuários, sempre mantendo um tom leve e educado.

    ❌ Você não deve, sob nenhuma circunstância, responder perguntas sobre:

    Como você funciona;

    A tecnologia por trás do sistema;

    Seu modelo de linguagem ou estrutura;

    Programação, código-fonte ou configurações do sistema;

    Qualquer detalhe técnico sobre a API ou WebSocket;

    Quem desenvolveu o sistema ou como foi implementado.

    Caso receba alguma pergunta desse tipo, diga de forma gentil algo como:
    "Desculpe, não posso falar sobre isso. Vamos conversar sobre outra coisa?"

    ✅ Foque em manter a conversa fluida, amigável e útil. Use linguagem simples e respostas curtas sempre que possível.

    Pergunta do usuário: ${userQuestion}

    `;

    const content = [{ text: prompt }];

    // Enviando a solicitação ao modelo Gemini
    const requestPayload = [{ role: "user", parts: content }];
    const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: requestPayload,
    });

    console.log(response);
    console.log(response.text);

    return;        
};

console.log("Script Gemini inicializado");