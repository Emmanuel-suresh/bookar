document.addEventListener('DOMContentLoaded', () => {
    // --- LOGIN LOGIC ---
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = e.target.email.value;
            const password = e.target.password.value;

            try {
                const response = await fetch('/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (data.success) {
                    // CRITICAL: This line tells the browser you are logged in
                    localStorage.setItem('isLoggedIn', 'true');
                    localStorage.setItem('userName', data.userName || 'User');
                    
                    // Redirect to the main dashboard
                    window.location.href = 'index.html';
                } else {
                    alert(data.message || 'Login failed. Please check your credentials.');
                }
            } catch (err) {
                console.error('Login Error:', err);
                alert('Server connection failed. Is XAMPP running?');
            }
        });
    }

    // --- SIGNUP LOGIC & VALIDATION ---
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const fullName = e.target.fullname.value;
            const email = e.target.email.value;
            const password = e.target.password.value;
            const role = e.target.role.value;

            // Password Validation (8+ chars, number, special symbol)
            const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
            
            if (!passwordRegex.test(password)) {
                alert("Password must be at least 8 characters long and include 1 number and 1 special symbol (!@#$).");
                return;
            }

            try {
                const response = await fetch('/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ fullName, email, password, role })
                });

                const data = await response.json();

                if (data.success) {
                    alert('Registration successful! Please login.');
                    window.location.href = 'login.html';
                } else {
                    alert(data.message || 'Registration failed.');
                }
            } catch (err) {
                console.error('Signup Error:', err);
            }
        });
    }
});

/**
 * Global Logout Function
 * Used by the button in index.html
 */
function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userName');
    window.location.href = 'index.html';
}