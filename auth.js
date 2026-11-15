// ============================================
// STUDYNEST - LOGIN & STUDENT REGISTRATION
// ============================================

const KEY = "studynest_design_v2";

let data = JSON.parse(
    localStorage.getItem(KEY) ||
    '{"users":[],"assignments":[],"submissions":[]}'
);

const $ = (id) => document.getElementById(id);

const save = () => {
    localStorage.setItem(KEY, JSON.stringify(data));
};

// Lecturer accounts for demonstration.
// Add more lecturer accounts to this array when needed.
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

// Create the lecturer accounts if they do not exist yet.
let accountsUpdated = false;

lecturerAccounts.forEach((account) => {
    const accountExists = data.users.some(
        (user) => user.email.toLowerCase() === account.email.toLowerCase()
    );

    if (!accountExists) {
        data.users.push(account);
        accountsUpdated = true;
    }
});

if (accountsUpdated) {
    save();
}

// Switch between Login and Student Registration.
function switchTab(register) {
    $("loginForm").classList.toggle("hidden", register);
    $("regForm").classList.toggle("hidden", !register);

    $("loginTab").classList.toggle("active", !register);
    $("regTab").classList.toggle("active", register);

    $("authMsg").textContent = "";
}

$("loginTab").addEventListener("click", () => switchTab(false));
$("regTab").addEventListener("click", () => switchTab(true));

// Login for lecturers and students.
$("loginForm").addEventListener("submit", (event) => {
    event.preventDefault();

    const email = $("loginEmail").value.trim().toLowerCase();
    const password = $("loginPassword").value;

    const account = data.users.find(
        (user) =>
            user.email.toLowerCase() === email &&
            user.password === password
    );

    if (!account) {
        $("authMsg").textContent =
            "Email or password is incorrect. Please try again.";
        return;
    }

    sessionStorage.setItem(
        "studynestUser",
        JSON.stringify({ email: account.email })
    );

    window.location.href = "index.html";
});

// Student registration only.
// Students cannot register themselves as lecturers.
$("regForm").addEventListener("submit", (event) => {
    event.preventDefault();

    const name = $("regName").value.trim();
    const email = $("regEmail").value.trim().toLowerCase();
    const password = $("regPassword").value;

    const emailExists = data.users.some(
        (user) => user.email.toLowerCase() === email
    );

    if (emailExists) {
        $("authMsg").textContent =
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
