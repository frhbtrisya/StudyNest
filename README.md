# StudyNest – Assignment Monitoring System

StudyNest is a small-scale academic web application prototype developed for the IMS566 Advanced Web Design Development and Content Management individual assignment. It provides a workspace for lecturers to manage assignments and review student submissions, while students can view tasks, submit files and check feedback.

## Features

### Lecturer
- Create and manage classes with unique class codes.
- Share class codes with students for enrolment.
- Lecturer login using demo credentials.
- Dashboard summary and assignment progress chart.
- Create and delete assignments.
- View and monitor student submissions.
- Download submitted files.
- Enter marks and feedback.
- Edit the lecturer display name.

### Student
- Join lecturer classes using a class code.
- View assignments belonging to joined classes.
- Student registration and login.
- View available assignments and due dates.
- Upload PDF, DOCX and PPTX submissions (prototype file-size limit applies).
- View submission status, marks and lecturer feedback.
- Edit the student display name.

## Test Login

**Lecturer demo**
- Email: `lecturer@studynest.com`
- Password: `lecturer123`

Additional lecturer demo accounts:
- `lecturer1@studynest.com` / `lecturer123`
- `lecturer2@studynest.com` / `lecturer456`
- `lecturer3@studynest.com` / `lecturer789`

Students can create an account using the Student Registration tab on the login page.

## Technologies and Libraries
- HTML5
- CSS3
- JavaScript
- Bootstrap 5.3.3 (responsive front-end framework)
- Chart.js (assignment progress doughnut chart)
- LocalStorage (prototype account, class, enrolment and assignment data)
- IndexedDB (prototype uploaded-file storage)

## Run Locally
1. Download or clone this repository.
2. Open the project folder in Visual Studio Code.
3. Open `login.html` with Live Server, or open it in Google Chrome.
4. Sign in using one of the lecturer demo accounts or register as a student.

## Deployment with GitHub Pages
1. Create a GitHub repository and upload all project files.
2. In the repository, open **Settings → Pages**.
3. Under **Build and deployment**, select **Deploy from a branch**.
4. Select the `main` branch and `/ (root)` folder, then save.
5. Wait for GitHub Pages to publish the site.
6. Open the generated live link and test it in Google Chrome on desktop and mobile.

## Prototype Limitations
StudyNest is a front-end prototype. LocalStorage and IndexedDB are stored in the current browser and device only. Data and uploaded files are not automatically shared between a lecturer's device and a student's device. Demo passwords are for coursework demonstration only and must not be used for real accounts or confidential information.

## Project Structure
```text
StudyNest/
├── login.html
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── auth.js
│   └── script.js
└── README.md
```

## Classes workflow
1. A lecturer opens **My Classes** and creates a class.
2. StudyNest generates a class code.
3. The lecturer shares the code with students.
4. A student opens **My Classes**, enters the code and joins.
5. The lecturer creates assignments and selects the relevant class.
6. Students who joined that class can view its assignments and submit their work.


## Class-based assignment access
- Lecturers create a class and share its class code.
- Students must join a class using that code before its assignments appear.
- Student assignment and results pages show only assignments belonging to classes they joined.
- Lecturer assignment and monitoring views are limited to classes created by that lecturer.
- A lecturer must create at least one class before publishing an assignment.

## Important prototype note
Class membership and assignment visibility are implemented in browser-side JavaScript. This is suitable for demonstrating the coursework prototype, but it is not secure access control for a real production system. LocalStorage and IndexedDB data are local to the browser/device and are not synchronized between different devices.
