
// ============================================
// STUDYNEST - LOGIN & STUDENT REGISTRATION
// ============================================

const KEY = "studynest_design_v2";

let data;

try {
    data = JSON.parse(
        localStorage.getItem(KEY) ||
        '{"users":[],"assignments":[],"submissions":[],"classes":[]}'
    );
} catch (error) {
    data = {
        users: [],
        assignments: [],
        submissions: [],
        classes: []
    };
}

// Pastikan semua data mempunyai array.
data.users = data.users || [];
data.assignments = data.assignments || [];
data.submissions = data.submissions || [];
data.classes = data.classes || [];

const $ = (id) => document.getElementById(id);

const save = () => {
    localStorage.setItem(KEY, JSON.stringify(data));
};

// Akaun lecturer untuk demonstrasi.
const lecturerAccounts = [
    {
        name: "Demo Lecturer",
        email: "lecturer@studynest.com",
        password: "lecturer123",
        role: "lecturer"
    },
    {
        name: "Lecturer 1",
        email: "lecturer1@studynest.com",
        password: "lecturer123",
        role: "lecturer"
    },
    {
        name: "Lecturer 2",
        email: "lecturer2@studynest.com",
        password: "lecturer456",
        role: "lecturer"
    },
    {
        name: "Lecturer 3",
        email: "lecturer3@studynest.com",
        password: "lecturer789",
        role: "lecturer"
    }
];

// Tambah akaun lecturer jika belum wujud.
let accountsUpdated = false;

lecturerAccounts.forEach((account) => {
    const exists = data.users.some(
        (user) =>
            user.email &&
            user.email.toLowerCase() === account.email.toLowerCase()
    );

    if (!exists) {
        data.users.push(account);
        accountsUpdated = true;
    }
});

if (accountsUpdated) {
    save();
}

// ============================================
// LOGIN PAGE ONLY
// Jangan jalankan fungsi login pada dashboard.
// ============================================

const loginForm = $("loginForm");
const regForm = $("regForm");
const loginTab = $("loginTab");
const regTab = $("regTab");
const authMsg = $("authMsg");

// Jika bukan halaman login, hentikan bahagian login sahaja.
if (loginForm && regForm && loginTab && regTab && authMsg) {

    // Tukar antara Login dan Student Registration.
    function switchTab(register) {
        loginForm.classList.toggle("hidden", register);
        regForm.classList.toggle("hidden", !register);

        loginTab.classList.toggle("active", !register);
        regTab.classList.toggle("active", register);

        authMsg.textContent = "";
    }

    loginTab.addEventListener("click", () => switchTab(false));
    regTab.addEventListener("click", () => switchTab(true));

    // LOGIN
    loginForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const email = $("loginEmail").value.trim().toLowerCase();
        const password = $("loginPassword").value;

        const account = data.users.find(
            (user) =>
                user.email &&
                user.email.toLowerCase() === email &&
                user.password === password
        );

        if (!account) {
            authMsg.textContent =
                "Email or password is incorrect. Please try again.";
            return;
        }

        sessionStorage.setItem(
            "studynestUser",
            JSON.stringify({ email: account.email })
        );

        window.location.href = "index.html";
    });

    // STUDENT REGISTRATION
    regForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const name = $("regName").value.trim();
        const email = $("regEmail").value.trim().toLowerCase();
        const password = $("regPassword").value;

        if (!name || !email || !password) {
            authMsg.textContent = "Please complete all fields.";
            return;
        }

        const emailExists = data.users.some(
            (user) =>
                user.email &&
                user.email.toLowerCase() === email
        );

        if (emailExists) {
            authMsg.textContent =
                "This email is already registered.";
            return;
        }

        const newStudent = {
            name: name,
            email: email,
            password: password,
            role: "student"
        };

        data.users.push(newStudent);
        save();

        sessionStorage.setItem(
            "studynestUser",
            JSON.stringify({ email: newStudent.email })
        );

        window.location.href = "index.html";
    });
}
