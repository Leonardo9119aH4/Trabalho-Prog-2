import { createPartFromUri, GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const apiKey = process.env.API_KEY;
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
    const requestPayload = [{ role: "user", parts: content }];

    // Sistema de retry com backoff exponencial
    const maxRetries = 3;
    let retryCount = 0;
    
    while (retryCount < maxRetries) {
        try {
            console.log(`Tentativa ${retryCount + 1} de ${maxRetries} do Gemini`);
            
            // Enviando a solicitação ao modelo Gemini
            const response = await ai.models.generateContent({
                model: "gemini-2.0-flash-lite",
                contents: requestPayload,
            });

            console.log("Resposta recebida com sucesso!");
            const responseText = response.text;
            
            return responseText;
            
        } catch (error) {
            retryCount++;
            console.error(`Erro na tentativa ${retryCount}:`, error.message);
            
            if (error.status === 503 && retryCount < maxRetries) {
                // Modelo sobrecarregado - aguardar antes de tentar novamente
                const waitTime = Math.pow(2, retryCount) * 1000; // Backoff exponencial: 2s, 4s, 8s
                console.log(`Modelo sobrecarregado. Aguardando ${waitTime/1000}s antes da próxima tentativa...`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
                continue;
            } else if (error.status === 400) {
                // Erro de API key ou formato da requisição
                console.error("Erro de API key ou formato da requisição:", error.message);
                return "Desculpe, ocorreu um erro técnico. Tente novamente em alguns instantes.";
            } else if (retryCount >= maxRetries) {
                // Esgotou todas as tentativas
                console.error("Esgotadas todas as tentativas de retry");
                return "Desculpe, o serviço está temporariamente indisponível. Tente novamente em alguns minutos.";
            } else {
                // Outros erros
                console.error("Erro inesperado:", error.message);
                return "Desculpe, ocorreu um erro inesperado. Tente novamente.";
            }
        }
    }
    
    return "Desculpe, não foi possível processar sua mensagem no momento. Tente novamente mais tarde.";
};

console.log("Script Gemini inicializado");