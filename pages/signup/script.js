function redirectIfNotLogged() {
fetch('/user')
    .then(response => {
        if (response.status === 401) {
            window.location.href = '../signup/main.html';
        }
    });
}


const form = document.getElementById('signup-form');
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
            window.location.href = '../login/main.html';
        } else {
            alert(result);
        }
    } catch (error) {
        alert('Erro ao conectar com o servidor.');
    }
});