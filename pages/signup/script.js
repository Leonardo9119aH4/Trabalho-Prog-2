function redirectIfNotLogged() {
fetch('/user')
    .then(response => {
        if (response.status === 401) {
            window.location.href = '../signup/main.html';
        }
    });
}


const form = document.getElementById('signup-form');
const successOverlay = document.getElementById('signup-success');
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    try {
        const response = await fetch('/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        const result = await response.json();
        if (response.ok) {
            // Mostra animação de sucesso e redireciona para login
            if (successOverlay) {
                successOverlay.classList.add('show');
                successOverlay.setAttribute('aria-hidden', 'false');
                setTimeout(() => {
                    window.location.href = '../login/main.html?reason=signup-success';
                }, 1700);
            } else {
                window.location.href = '../login/main.html?reason=signup-success';
            }
        } else {
            alert(result);
        }
    } catch (error) {
        alert('Erro ao conectar com o servidor.');
    }
});

// Se já autenticado, evita exibir cadastro e redireciona
(async function preventSignupIfAuthenticated(){
    try{
        const res = await fetch('/session');
        const data = await res.json();
        if(data && data.authenticated){
            window.location.replace('../home/main.html');
        }
    }catch{}
})();