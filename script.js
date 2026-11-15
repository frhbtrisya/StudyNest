const $=id=>document.getElementById(id),KEY="studynest_design_v2",FILEDB="StudyNestFiles";
let data=JSON.parse(localStorage.getItem(KEY)||'{"users":[],"assignments":[],"submissions":[]}'),user=null,page="Dashboard";
const save=()=>localStorage.setItem(KEY,JSON.stringify(data));
// Classes and student enrolments (browser-local prototype data).
data.classes=data.classes||[];data.memberships=data.memberships||[];save();
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const message=s=>$("appMsg").textContent=s;
if(!data.users.some(u=>u.email==="lecturer@studynest.com")){data.users.push({name:"Lecturer",email:"lecturer@studynest.com",password:"lecturer123",role:"lecturer"});save();}
$("today").textContent=new Date().toLocaleDateString("en-GB",{weekday:"short",day:"2-digit",month:"short",year:"numeric"});
function openFiles(){return new Promise((resolve,reject)=>{let r=indexedDB.open(FILEDB,1);r.onupgradeneeded=()=>r.result.createObjectStore("files");r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
async function saveFile(k,f){let d=await openFiles();return new Promise((res,rej)=>{let t=d.transaction("files","readwrite");t.objectStore("files").put(f,k);t.oncomplete=res;t.onerror=()=>rej(t.error);});}
async function readFile(k){let d=await openFiles();return new Promise((res,rej)=>{let r=d.transaction("files").objectStore("files").get(k);r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);});}
$("logout").addEventListener("click", function (event) {
  event.preventDefault();
  sessionStorage.removeItem("studynestUser");
  window.location.replace("login.html");
});
function showApp(u){
user=u;
$("newAssignment").onclick=()=>go("Assignments");
page="Dashboard";$("logout").classList.remove("hidden");$("greeting").textContent="Hello, "+u.name+"!";$("topName").textContent=u.name;$("topRole").textContent=u.role==="lecturer"?"Lecturer account":"Student account";$("avatar").textContent=(u.name[0]||"S").toUpperCase();$("brandSub").textContent=u.role==="lecturer"?"LECTURER WORKSPACE":"STUDENT WORKSPACE";$("newAssignment").classList.toggle("hidden",u.role!=="lecturer");renderNav();render();}
function navItems(){return user.role==="lecturer"?["Dashboard","My Classes","Assignments","Monitor submissions"]:["Dashboard","My Classes","My Assignments","My Results"];}
function renderNav(){
let items=navItems();
// Student badge counts only assignments from classes the student has joined.
let joinedClassIds=data.memberships
  .filter(m=>m.studentEmail===user.email)
  .map(m=>m.classId);
let myAssignmentCount=data.assignments
  .filter(a=>joinedClassIds.includes(a.classId)).length;
$("nav").innerHTML=items.map((n,i)=>`<button class="nav-btn ${page===n?"active":""}" data-p="${n}"><span class="ico">${["▦","▣","▤","▧"][i]}</span>${n}${n==="My Assignments"?`<span class="count">${myAssignmentCount}</span>`:""}</button>`).join("");
document.querySelectorAll("[data-p]").forEach(b=>b.onclick=()=>go(b.dataset.p));
document.querySelectorAll("[data-page]").forEach(b=>b.onclick=()=>go("Profile"));
}
function go(p){page=p;$("crumb").textContent=p;renderNav();render();}
function st(a,s){if(s?.status==="Graded")return"Completed";if(s)return"In progress";if(a.due&&new Date(a.due+"T23:59:59")<new Date())return"Overdue";return"Upcoming";}
function stats(){
let classIds=user.role==="lecturer"?data.classes.filter(c=>c.lecturerEmail===user.email).map(c=>c.id):data.memberships.filter(m=>m.studentEmail===user.email).map(m=>m.classId);
let visibleAssignments=data.assignments.filter(a=>classIds.includes(a.classId));
let visibleIds=visibleAssignments.map(a=>a.id);
let mine=user.role==="lecturer"?data.submissions.filter(s=>visibleIds.includes(s.assignmentId)):data.submissions.filter(s=>s.email===user.email&&visibleIds.includes(s.assignmentId));
let complete=mine.filter(s=>s.status==="Graded").length,progress=mine.filter(s=>s.status==="Submitted").length;
let upcoming=visibleAssignments.filter(a=>new Date(a.due+"T23:59:59")>=new Date()).length;
return `<div class="stats"><div class="stat"><div class="stat-top">Total assignments <span class="stat-icon lav">▤</span></div><strong>${visibleAssignments.length}</strong><small>Assignments in your classes</small></div><div class="stat"><div class="stat-top">In progress <span class="stat-icon peach">⌛</span></div><strong>${progress}</strong><small>Work currently underway</small></div><div class="stat"><div class="stat-top">Completed <span class="stat-icon mint">✓</span></div><strong>${complete}</strong><small>Tasks you have finished</small></div><div class="stat"><div class="stat-top">Upcoming <span class="stat-icon butter">▣</span></div><strong>${upcoming}</strong><small>Upcoming deadlines</small></div></div>`;}
function dashboard(){
let dashboardClassIds=user.role==="lecturer"?data.classes.filter(c=>c.lecturerEmail===user.email).map(c=>c.id):data.memberships.filter(m=>m.studentEmail===user.email).map(m=>m.classId);
let dashboardAssignments=data.assignments.filter(a=>dashboardClassIds.includes(a.classId));
let dashboardAssignmentIds=dashboardAssignments.map(a=>a.id);
let mine=user.role==="lecturer"?data.submissions.filter(s=>dashboardAssignmentIds.includes(s.assignmentId)):data.submissions.filter(s=>s.email===user.email&&dashboardAssignmentIds.includes(s.assignmentId));
let prog=mine.filter(s=>s.status==="Submitted").length,done=mine.filter(s=>s.status==="Graded").length,total=Math.max(1,prog+done+Math.max(0,dashboardAssignments.length-mine.length));let pct=Math.round((done/total)*100);let joinedClassIds=data.memberships.filter(m=>m.studentEmail===user.email).map(m=>m.classId);let upcoming=data.assignments.filter(a=>(user.role==="lecturer"?data.classes.some(c=>c.id===a.classId&&c.lecturerEmail===user.email):joinedClassIds.includes(a.classId))&&new Date(a.due+"T23:59:59")>=new Date()).sort((a,b)=>a.due.localeCompare(b.due)).slice(0,4);
$("pageContent").innerHTML=stats()+`<div class="lower"><section class="box"><div class="box-head"><div><h3>${user.role==="lecturer"?"Submission progress":"Assignment progress"}</h3><p>A quick look at your current workload.</p></div><span class="tiny-tag">OVERVIEW</span></div><div class="chart-area chart-canvas-wrap"><canvas id="progressChart" aria-label="Assignment progress chart"></canvas></div><div class="legend"><span><i class="dot" style="background:var(--sand)"></i>To do</span><span><i class="dot" style="background:var(--rose)"></i>In progress</span><span><i class="dot" style="background:var(--green)"></i>Completed</span></div></section><section class="box"><div class="box-head"><div><h3>Coming up</h3><p>Your next deadlines.</p></div><a href="#" id="viewAll" style="color:var(--wine);font-weight:bold;text-decoration:none">View all</a></div><div class="upcoming-list">${upcoming.map(a=>`<div class="upcoming-item"><div class="datebox"><b>${new Date(a.due+"T12:00:00").getDate()}</b><small>${new Date(a.due+"T12:00:00").toLocaleString("en",{month:"short"}).toUpperCase()}</small></div><div><strong>${esc(a.title)}</strong><p>${esc(a.subject)} · ${new Date(a.due+"T12:00:00").toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})}</p></div></div>`).join("")||'<div class="empty">No upcoming deadlines.</div>'}</div></section></div>`;
if (window.studyNestChart) { window.studyNestChart.destroy(); }
const chartCanvas = $("progressChart");
if (chartCanvas && window.Chart) {
  const todo = Math.max(0, total - prog - done);
  window.studyNestChart = new Chart(chartCanvas, {
    type: "doughnut",
    data: {
      labels: ["To do", "In progress", "Completed"],
      datasets: [{
        data: [todo, prog, done],
        backgroundColor: ["#ddc9a8", "#bd8795", "#287b68"],
        borderWidth: 0,
        hoverOffset: 5
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "68%",
      plugins: { legend: { display: false } }
    }
  });
}
$("viewAll").onclick=e=>{e.preventDefault();go(user.role==="lecturer"?"Assignments":"My Assignments");};}
function assignmentsPage(){
let lecturerClassIds=data.classes.filter(c=>c.lecturerEmail===user.email).map(c=>c.id);
let lecturerAssignments=data.assignments.filter(a=>lecturerClassIds.includes(a.classId));
$("pageContent").innerHTML=`<section class="box formbox"><div class="box-head"><div><h3>New assignment</h3><p>Create a task for students to complete.</p></div></div><form id="createForm" class="formgrid"><div><label>Assignment title</label><input name="title" required></div><div><label>Class</label><select name="classId" required>${data.classes.filter(c=>c.lecturerEmail===user.email).map(c=>`<option value="${c.id}">${esc(c.name)} (${esc(c.code)})</option>`).join("")}</select></div><div><label>Subject / course</label><input name="subject" required></div><div><label>Due date</label><input name="due" type="date" required></div><div><label>Maximum marks</label><input name="max" type="number" min="1" value="100" required></div><div class="wide"><label>Description / instructions</label><textarea name="description" required></textarea></div><div class="wide"><button class="btn primary">＋ Publish assignment</button></div></form></section><div class="card-grid">${lecturerAssignments.map(a=>`<article class="card"><h3>${esc(a.title)}</h3><p>${esc(a.description)}</p><div class="meta">${esc(a.subject)} · ${esc(data.classes.find(c=>c.id===a.classId)?.name||"Class not set")} · Due ${esc(a.due)} · ${a.max} marks</div><button class="btn danger" data-del="${a.id}">Delete</button></article>`).join("")||'<div class="empty">No assignments created yet.</div>'}</div>`;
const assignmentClassSelect=$("createForm").elements.classId;
if(!lecturerClassIds.length){
  assignmentClassSelect.disabled=true;
  $("createForm").querySelector('button[type="submit"]').disabled=true;
  const notice=document.createElement("p");
  notice.className="empty";
  notice.textContent="Create a class in My Classes before publishing an assignment.";
  $("createForm").appendChild(notice);
}
$("createForm").onsubmit=e=>{e.preventDefault();let f=new FormData(e.target);if(!lecturerClassIds.includes(f.get("classId"))){message("Please select one of your own classes.");return;}data.assignments.unshift({id:Date.now().toString(),classId:f.get("classId"),title:f.get("title"),subject:f.get("subject"),due:f.get("due"),max:Number(f.get("max")),description:f.get("description")});save();render();message("Assignment published successfully.");};document.querySelectorAll("[data-del]").forEach(b=>b.onclick=()=>{if(confirm("Delete this assignment?")){data.assignments=data.assignments.filter(a=>a.id!==b.dataset.del);save();render();}});}
function studentAssignments(){let mine=data.submissions.filter(s=>s.email===user.email);let joinedIds=data.memberships.filter(m=>m.studentEmail===user.email).map(m=>m.classId);let visibleAssignments=data.assignments.filter(a=>joinedIds.includes(a.classId));$("pageContent").innerHTML=`<div class="card-grid">${visibleAssignments.map(a=>{let s=mine.find(x=>x.assignmentId===a.id),status=st(a,s);return `<article class="card"><h3>${esc(a.title)}</h3><span class="status ${status==="Completed"?"graded":status==="Overdue"?"overdue":""}">${status}</span><p>${esc(a.description)}</p><div class="meta">${esc(a.subject)} · Due ${esc(a.due)} · ${a.max} marks</div>${s?`<p class="muted">File: ${esc(s.fileName)}</p>`:""}${s?.status==="Graded"?`<p><b>Mark: ${s.marks} / ${a.max}</b></p><p>Feedback: ${esc(s.feedback)}</p>`:`<form class="upload" data-id="${a.id}"><label>Upload PDF, DOCX or PPTX (maximum 10 MB)</label><input type="file" accept=".pdf,.docx,.pptx" required><div class="actions"><button class="btn primary">${s?"Resubmit":"Submit assignment"}</button></div></form>`}</article>`;}).join("")||'<div class="empty">No assignments available.</div>'}</div>`;
document.querySelectorAll(".upload").forEach(f=>f.onsubmit=async e=>{e.preventDefault();let file=f.querySelector("input").files[0],ext=file.name.split(".").pop().toLowerCase();if(!["pdf","docx","pptx"].includes(ext)){message("Only PDF, DOCX and PPTX are accepted.");return;}if(file.size>10*1024*1024){message("File must be 10 MB or smaller.");return;}try{let key=user.email+"_"+f.dataset.id;await saveFile(key,file);let old=data.submissions.findIndex(s=>s.email===user.email&&s.assignmentId===f.dataset.id),item={id:key,assignmentId:f.dataset.id,name:user.name,email:user.email,fileName:file.name,status:"Submitted",marks:null,feedback:"",submittedAt:new Date().toLocaleString()};if(old>=0)data.submissions[old]=item;else data.submissions.push(item);save();render();message("Assignment submitted successfully.");}catch(err){message("Could not save file: "+err.message);}});}
function monitor(){let lecturerClassIds=data.classes.filter(c=>c.lecturerEmail===user.email).map(c=>c.id);let lecturerSubmissions=data.submissions.filter(s=>{let a=data.assignments.find(x=>x.id===s.assignmentId);return a&&lecturerClassIds.includes(a.classId);}); $("pageContent").innerHTML=`<div class="table-wrap"><table class="table"><thead><tr><th>Student</th><th>Assignment</th><th>Submission</th><th>Status</th><th>Marks & feedback</th></tr></thead><tbody>${lecturerSubmissions.map(s=>{let a=data.assignments.find(x=>x.id===s.assignmentId);return `<tr><td>${esc(s.name)}<br><span class="muted">${esc(s.email)}</span></td><td>${esc(a?.title||"Deleted assignment")}</td><td><button class="btn soft" data-file="${esc(s.id)}">${esc(s.fileName)}</button></td><td><span class="status ${s.status==="Graded"?"graded":""}">${s.status}</span></td><td><form class="grade-form" data-id="${esc(s.id)}"><input name="marks" type="number" min="0" max="${a?.max||100}" placeholder="Mark" value="${s.marks??""}" required><input name="feedback" placeholder="Feedback" value="${esc(s.feedback)}"><button class="btn primary">Save</button></form></td></tr>`;}).join("")||'<tr><td colspan="5">No submissions yet.</td></tr>'}</tbody></table></div>`;
document.querySelectorAll("[data-file]").forEach(b=>b.onclick=async()=>{let f=await readFile(b.dataset.file);if(!f){message("File not found in this browser.");return;}let url=URL.createObjectURL(f),a=document.createElement("a");a.href=url;a.download=f.name;a.click();URL.revokeObjectURL(url);});
document.querySelectorAll(".grade-form").forEach(f=>f.onsubmit=e=>{e.preventDefault();let s=data.submissions.find(x=>x.id===f.dataset.id),a=data.assignments.find(x=>x.id===s.assignmentId),d=new FormData(f),m=Number(d.get("marks"));if(m<0||m>a.max){message("Enter a mark between 0 and "+a.max);return;}s.marks=m;s.feedback=d.get("feedback");s.status="Graded";save();render();message("Marks and feedback saved.");});}
function results(){let joinedIds=data.memberships.filter(m=>m.studentEmail===user.email).map(m=>m.classId);let mine=data.submissions.filter(s=>s.email===user.email&&joinedIds.includes(data.assignments.find(a=>a.id===s.assignmentId)?.classId));$("pageContent").innerHTML=`<div class="card-grid">${mine.map(s=>{let a=data.assignments.find(x=>x.id===s.assignmentId);return `<article class="card"><h3>${esc(a?.title||"Assignment")}</h3><span class="status ${s.status==="Graded"?"graded":""}">${s.status}</span><p class="meta">Submitted: ${esc(s.submittedAt)}</p><h2>${s.status==="Graded"?`${s.marks} / ${a?.max}`:"Not graded yet"}</h2><p>${esc(s.feedback||"No feedback yet.")}</p></article>`;}).join("")||'<div class="empty">No results yet.</div>'}</div>`;}

function classesPage(){
  const mine = user.role==="lecturer"
    ? data.classes.filter(c=>c.lecturerEmail===user.email)
    : data.classes.filter(c=>data.memberships.some(m=>m.classId===c.id&&m.studentEmail===user.email));
  if(user.role==="lecturer"){
    $("pageContent").innerHTML=`<section class="box formbox"><div class="box-head"><div><h3>Create new class</h3><p>Create a class and share its code with your students.</p></div></div>
    <form id="classForm" class="formgrid">
      <div><label>Class name</label><input name="name" placeholder="e.g. Information Management" required></div>
      <div><label>Subject / course code</label><input name="subject" placeholder="e.g. IMD310" required></div>
      <div class="wide"><label>Description</label><textarea name="description" placeholder="Brief class description"></textarea></div>
      <div class="wide"><button class="btn primary" type="submit">＋ Create class</button></div>
    </form></section>
    <div class="card-grid">${mine.map(c=>`<article class="card"><h3>${esc(c.name)}</h3><p>${esc(c.description||"No description added.")}</p><div class="meta">${esc(c.subject)} · ${data.memberships.filter(m=>m.classId===c.id).length} students</div><p><b>Class code: ${esc(c.code)}</b></p><button class="btn soft" data-copy-code="${esc(c.code)}">Copy code</button> <button class="btn danger" data-remove-class="${c.id}">Delete class</button></article>`).join("")||'<div class="empty">No classes created yet.</div>'}</div>`;
    $("classForm").onsubmit=e=>{e.preventDefault();const f=new FormData(e.target);const code="SN"+Math.random().toString(36).slice(2,7).toUpperCase();data.classes.push({id:Date.now().toString(),name:f.get("name").trim(),subject:f.get("subject").trim(),description:f.get("description").trim(),code,lecturerEmail:user.email});save();render();message("Class created. Share the class code with your students.");};
    document.querySelectorAll("[data-copy-code]").forEach(b=>b.onclick=()=>{navigator.clipboard?.writeText(b.dataset.copyCode);message("Class code: "+b.dataset.copyCode);});
    document.querySelectorAll("[data-remove-class]").forEach(b=>b.onclick=()=>{if(confirm("Delete this class and its assignments?")){const id=b.dataset.removeClass;const assignmentIds=data.assignments.filter(a=>a.classId===id).map(a=>a.id);data.classes=data.classes.filter(c=>c.id!==id);data.memberships=data.memberships.filter(m=>m.classId!==id);data.assignments=data.assignments.filter(a=>a.classId!==id);data.submissions=data.submissions.filter(s=>!assignmentIds.includes(s.assignmentId));save();render();message("Class deleted.");}});
  } else {
    $("pageContent").innerHTML=`<section class="box formbox" style="max-width:650px"><div class="box-head"><div><h3>Join a class</h3><p>Enter the class code shared by your lecturer.</p></div></div><form id="joinClassForm" class="formgrid"><div class="wide"><label>Class code</label><input name="code" placeholder="e.g. SNABCDE" required></div><div class="wide"><button class="btn primary" type="submit">Join class</button></div></form></section>
    <div class="card-grid">${mine.map(c=>`<article class="card"><h3>${esc(c.name)}</h3><p>${esc(c.description||"No description added.")}</p><div class="meta">${esc(c.subject)} · Lecturer: ${esc(data.users.find(u=>u.email===c.lecturerEmail)?.name||"Lecturer")}</div><span class="status graded">Joined</span></article>`).join("")||'<div class="empty">You have not joined any classes yet.</div>'}</div>`;
    $("joinClassForm").onsubmit=e=>{e.preventDefault();const code=new FormData(e.target).get("code").trim().toUpperCase();const found=data.classes.find(c=>c.code.toUpperCase()===code);if(!found){message("Class code not found. Check with your lecturer.");return;}if(data.memberships.some(m=>m.classId===found.id&&m.studentEmail===user.email)){message("You have already joined this class.");return;}data.memberships.push({classId:found.id,studentEmail:user.email});save();render();message("You have joined "+found.name+".");};
  }
}

function profile(){
$("pageContent").innerHTML=`<section class="box formbox" style="max-width:650px">
<div class="box-head"><div><h3>Edit profile</h3><p>Update the name displayed on your StudyNest account.</p></div></div>
<form id="profileForm" class="formgrid">
<div class="wide"><label>Full name</label><input name="name" value="${esc(user.name)}" required></div>
<div class="wide"><label>Email address</label><input value="${esc(user.email)}" disabled></div>
<div class="wide"><label>Account type</label><input value="${esc(user.role)}" disabled></div>
<div class="wide"><button class="btn primary" type="submit">Save profile</button></div>
</form></section>`;
$("profileForm").onsubmit=e=>{
e.preventDefault();
const newName=new FormData(e.target).get("name").trim();
if(!newName){message("Please enter your name.");return;}
const account=data.users.find(u=>u.email===user.email);
if(!account){message("Account not found. Please log in again.");return;}
account.name=newName;
user=account;
data.submissions.forEach(s=>{if(s.email===user.email)s.name=newName;});
save();
$("greeting").textContent="Hello, "+user.name+"!";
$("topName").textContent=user.name;
$("avatar").textContent=(user.name[0]||"S").toUpperCase();
message("Your profile name has been updated.");
};
}
function render(){message("");$("crumb").textContent=page;$("eyebrow").textContent=page==="Dashboard"?"YOUR OVERVIEW":"STUDYNEST WORKSPACE";$("subheading").textContent=page==="Dashboard"?"Here is what's happening with your "+(user.role==="lecturer"?"students.":"studies."):"Manage your assignments and academic progress.";if(page==="Dashboard")dashboard();else if(page==="Assignments")assignmentsPage();else if(page==="My Assignments")studentAssignments();else if(page==="Monitor submissions")monitor();else if(page==="My Classes")classesPage();else if(page==="My Results")results();else profile();renderNav();}
// Responsive mobile navigation toggle.
const mobileMenuToggle = document.getElementById("mobileMenuToggle");
const studySidebar = document.getElementById("studySidebar");
if (mobileMenuToggle && studySidebar) {
  mobileMenuToggle.addEventListener("click", () => {
    const opened = studySidebar.classList.toggle("sidebar-open");
    mobileMenuToggle.setAttribute("aria-expanded", String(opened));
    mobileMenuToggle.textContent = opened ? "✕" : "☰";
  });
  studySidebar.addEventListener("click", (event) => {
    if (event.target.closest(".nav-btn")) {
      studySidebar.classList.remove("sidebar-open");
      mobileMenuToggle.setAttribute("aria-expanded", "false");
      mobileMenuToggle.textContent = "☰";
    }
  });
}
const activeUser=JSON.parse(sessionStorage.getItem("studynestUser")||"null");
if(!activeUser){window.location.href="login.html";}
else {const savedUser=data.users.find(u=>u.email===activeUser.email);if(savedUser)showApp(savedUser);else window.location.href="login.html";}
