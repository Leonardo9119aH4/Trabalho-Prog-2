const form = document.getElementById('login-form');
const successOverlay = document.getElementById('login-success');
const contextAlert = document.getElementById('login-context');

function showSuccessAndRedirect() {
    if (!successOverlay) {
        window.location.href = '../chat/main.html';
        return;
    }
    successOverlay.classList.add('show');
    successOverlay.setAttribute('aria-hidden', 'false');
    // Aguarda a animação/progresso e redireciona
    setTimeout(() => {
        window.location.href = '../chat/main.html';
    }, 1700);
}

function showInlineError(message) {
    // cria um toast simples acima do formulário
    const old = document.querySelector('.login-error');
    if (old) old.remove();
    const el = document.createElement('div');
    el.className = 'login-error';
    el.textContent = message || 'Falha no login';
    el.style.background = '#fee2e2';
    el.style.border = '1px solid #fecaca';
    el.style.color = '#991b1b';
    el.style.padding = '10px 12px';
    el.style.borderRadius = '10px';
    el.style.margin = '0 0 12px 0';
    el.style.fontSize = '0.95rem';
    form.parentElement.insertBefore(el, form);
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        const result = await response.json();
        if (response.ok) {
            showSuccessAndRedirect();
        } else {
            showInlineError(result);
        }
    } catch (error) {
        showInlineError('Erro ao conectar com o servidor.');
    }
});

// Mostrar aviso se veio do chat ou ação protegida
(function showRedirectContext(){
    try {
        const params = new URLSearchParams(window.location.search);
        const reason = params.get('reason');
        if (!reason || !contextAlert) return;
        let msg = '';
        switch (reason) {
            case 'send-message':
                msg = 'Você precisa estar logado para enviar mensagens. Faça login ou crie uma conta para continuar.';
                break;
            case 'signup-success':
                msg = 'Conta criada com sucesso! Faça login para começar a usar o chat.';
                break;
            case 'protected':
                msg = 'Faça login para acessar esta página.';
                break;
            default:
                msg = 'Sessão necessária. Entre com sua conta para continuar.';
        }
        contextAlert.textContent = msg;
        contextAlert.hidden = false;
    } catch {}
})();

// Se já estiver autenticado, não permitir novo login: redireciona para a Home/Chat
(async function preventLoginIfAuthenticated(){
    try{
        const res = await fetch('/session');
        const data = await res.json();
        if(data && data.authenticated){
            // vai direto ao chat para não tentar logar novamente
            window.location.replace('../home/main.html');
        }
    }catch{}
})();