const form = document.getElementById('login-form');
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
            alert(result);
            // Redirecionar para página principal após login
            window.location.href = '../chat/main.html';
        } else {
            alert(result);
        }
    } catch (error) {
        alert('Erro ao conectar com o servidor.');
    }
});