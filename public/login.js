const loginForm = document.getElementById('login-form');
const errorMessage = document.getElementById('error-message');

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/api/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            errorMessage.textContent = errorData.error || 'Login failed';
            return;
        }

        const { token } = await response.json();
        localStorage.setItem('token', token); // Сохраняем токен
        window.location.href = '/'; // Переход на страницу чата
    } catch (err) {
        console.error('Login error:', err);
        errorMessage.textContent = 'Something went wrong. Please try again.';
    }
});
