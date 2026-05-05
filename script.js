// 1. DOM Initialization for Aesthetic Homepage Greeting
document.addEventListener('DOMContentLoaded', () => {
    const userDisplay = document.getElementById('userDisplay');
    if (userDisplay) {
        // We check for both 'userId' and 'user_id' to be safe
        const name = localStorage.getItem('userName') || 'Guest';
        const id = localStorage.getItem('userId') || localStorage.getItem('user_id') || 'BMS-2026-0000';
        
        // Matches the "Hi, emmanuel (BMS-2026-XXXX)" aesthetic style
        userDisplay.innerHTML = `Hi, <strong>${name}</strong> <small style="opacity:0.7;">(${id})</small>`;
    }
});

// 2. Toggle Password Visibility
function togglePassword(id) {
    const input = document.getElementById(id);
    if (input) {
        input.type = input.type === "password" ? "text" : "password";
    }
}

// 3. Handle Login Submission
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = e.target.email.value;
        const password = e.target.password.value;
        const role = e.target.role.value;

        try {
            const response = await fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, role })
            });

            const data = await response.json();
            if (data.success) {
                // Ensure we save using 'userId' to match the display logic
                localStorage.setItem('userId', data.userId);
                localStorage.setItem('userName', data.userName);
                localStorage.setItem('role', data.role);

                alert(`Login Successful! Welcome ${data.userName}`);
                window.location.href = data.redirect; 
            } else {
                alert("Login Failed: " + data.message);
            }
        } catch (error) {
            console.error("Login Error:", error);
            alert("Server is not responding. Make sure server.js is running!");
        }
    });
}

// 4. Admin Security Field Toggle
function checkAdminRole() {
    const roleSelect = document.getElementById('roleSelect');
    const adminSection = document.getElementById('adminCodeSection');
    if (roleSelect && adminSection) {
        adminSection.style.display = roleSelect.value === 'admin' ? 'block' : 'none';
    }
}

// 5. Stay Duration Calculation for Bookings
if (document.getElementById('checkOut')) {
    const checkIn = document.getElementById('checkIn');
    const checkOut = document.getElementById('checkOut');
    const daysLabel = document.getElementById('daysCount');
    const totalLabel = document.getElementById('totalPrice');

    [checkIn, checkOut].forEach(input => input.addEventListener('change', () => {
        if (checkIn.value && checkOut.value) {
            const start = new Date(checkIn.value);
            const end = new Date(checkOut.value);
            
            if (end > start) {
                const diffTime = Math.abs(end - start);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                daysLabel.innerText = diffDays + " nights";
                totalLabel.innerText = "₹" + (diffDays * 4999);
            } else {
                daysLabel.innerText = "0 nights";
                totalLabel.innerText = "₹0";
            }
        }
    }));
}

// 6. Signup Submission with Admin Verification
const signupForm = document.getElementById('signupForm');
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(signupForm);
        const data = Object.fromEntries(formData);

        if (data.role === 'admin' && data.adminCode !== '123456789') {
            alert("Unauthorized: Incorrect Admin Security Code.");
            return;
        }

        const res = await fetch('http://localhost:3000/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await res.json();
        if (result.success) {
            alert(`Account Created! Your Unique ID is: ${result.userId}`);
            window.location.href = 'login.html';
        }
    });
}
async function loadAdminData() {
    const tableBody = document.getElementById('bookingsTableBody');
    if (!tableBody) return; // Only run if we are on the admin page

    try {
        const response = await fetch('http://localhost:3000/admin/bookings');
        const bookings = await response.json();

        tableBody.innerHTML = ''; // Clear existing rows

        bookings.forEach(bk => {
            const row = `
                <tr>
                    <td>${bk.user_id}</td>
                    <td>${bk.full_name}</td>
                    <td>${bk.room_id}</td>
                    <td>${new Date(bk.check_in).toLocaleDateString()}</td>
                    <td>${new Date(bk.check_out).toLocaleDateString()}</td>
                    <td>${bk.stay_days}</td>
                    <td><span class="status-pill">${bk.status || 'Confirmed'}</span></td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });
    } catch (error) {
        console.error("Failed to load bookings:", error);
    }
}

// Call the function on load
document.addEventListener('DOMContentLoaded', loadAdminData);

// 7. Logout
function logout() {
    localStorage.clear();
    window.location.href = 'index.html';
}