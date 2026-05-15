/* scripts/auth.js */

// 1. SIGN UP (Create new user)
function handleSignup() {
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value.trim();
    const errorEl = document.getElementById('error-msg');

    if (!user || !pass) {
        showError("נא למלא את כל השדות");
        return;
    }

    // Check if user exists
    const usersDB = JSON.parse(localStorage.getItem('blindTyping_users')) || {};

    if (usersDB[user]) {
        showError("שם המשתמש כבר קיים");
        return;
    }

    // Create user
    usersDB[user] = { password: pass };
    localStorage.setItem('blindTyping_users', JSON.stringify(usersDB));

    // Auto login
    completeLogin(user);
}

// 2. LOGIN (Check existing user)
function handleLogin() {
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value.trim();

    const usersDB = JSON.parse(localStorage.getItem('blindTyping_users')) || {};

    if (!usersDB[user] || usersDB[user].password !== pass) {
        showError("שם משתמש או סיסמה שגויים");
        return;
    }

    completeLogin(user);
}

// 3. COMPLETE LOGIN & REDIRECT
function completeLogin(username) {
    // Save who is currently using the computer
    localStorage.setItem('blindTyping_currentUser', username);
    // Go to game
    window.location.href = 'index.html';
}

function showError(msg) {
    const el = document.getElementById('error-msg');
    el.innerText = msg;
    el.style.display = 'block';
}