// Garden data
let gardens = {
  "KwaMashu Community Garden":    { shape: "Rectangle", length: 20, width: 15, status: "Healthy", tasks: [], soilMoisture: 36 },
  "Ulundi Veg Plot":              { shape: "Oval",      length: 13, width: 11, status: "Moderate", tasks: [], soilMoisture: 28 },
  "Pietermaritzburg Rooftop":     { shape: "Triangle",  length: 16, width: 10, status: "Dry",     tasks: [], soilMoisture: 22 },
  "Port Shepstone Circle":        { shape: "Circle",    length: 9,  width: 9,  status: "Excellent", tasks: [], soilMoisture: 44 },
  "Richards Bay School Patch":    { shape: "Rectangle", length: 10, width: 6,  status: "Wet",     tasks: [], soilMoisture: 78 }
};
let activeGarden = Object.keys(gardens)[0];

// List of site tabs
const tabs = ['homeTab', 'dashboardTab', 'gardenCalcTab', 'productsTab', 'weatherTab', 'aboutTab',
  'contactTab', 'recommendTab', 'droneTab', 'newsTab', 'levelsTab', 'tasksTab', 'loginTab'];

// Tab switching
function showTab(tabId) {
  tabs.forEach(id => {
    document.getElementById(id).classList.toggle('active', id === tabId);
    let btn = document.getElementById(id + "Btn");
    if (btn) btn.classList.toggle('active', id === tabId);
  });
  updateGardenViews();
}

// Garden selector and management
const gardenSelect = document.getElementById('gardenSelect');
function updateGardenSelector() {
  gardenSelect.innerHTML = '';
  Object.keys(gardens).forEach(name => {
    let op = document.createElement('option');
    op.value = name; op.textContent = name;
    gardenSelect.appendChild(op);
  });
  gardenSelect.value = activeGarden;
}
function switchGarden() {
  activeGarden = gardenSelect.value;
  updateGardenViews();
}
function addGarden() {
  let gname = prompt("Enter new garden name:");
  if (!gname) return;
  if (gardens[gname]) { alert("Garden already exists!"); return; }
  let sh = prompt("Shape? (Rectangle/Oval/Triangle/Circle)", "Rectangle");
  let len = parseFloat(prompt("Length (meters)", "10"));
  let wid = parseFloat(prompt("Width (meters)", "7"));
  if (!sh || isNaN(len) || isNaN(wid)) { alert("Invalid values!"); return; }
  gardens[gname] = { shape: sh, length: len, width: wid, status: "New", tasks: [], soilMoisture: 35 };
  activeGarden = gname;
  updateGardenSelector(); updateGardenViews();
}
function deleteGarden() {
  if (Object.keys(gardens).length <= 1) { alert("At least 1 garden required."); return; }
  if (confirm("Delete garden '" + activeGarden + "'?")) {
    delete gardens[activeGarden];
    activeGarden = Object.keys(gardens)[0];
    updateGardenSelector(); updateGardenViews();
  }
}
function updateGardenNames() {
  document.getElementById('gardenNameDash').textContent = activeGarden;
  document.getElementById('gardenNameCalc').textContent = activeGarden;
  document.getElementById('gardenNameTasks').textContent = activeGarden;
  document.getElementById('gardenNameWeather').textContent = activeGarden;
}

// Dashboard
function updateDashboard() {
  const g = gardens[activeGarden];
  const area = calculateArea(g.length,g.width,g.shape);
  let soilVol = Math.max(area * 0.3, 1).toFixed(1); // cubic meters for 30cm bed
  let soilKg = (soilVol * 1200).toFixed(0); // 1.2 t/m3, loam soil
  let fert = Math.round(area*((g.shape!=="Triangle")?50:35));
  let water = Math.round(area * 40); // liters per irrigation event
  let html = `
    <div><b>Location:</b> <span>${activeGarden}</span></div>
    <div><b>Shape:</b> <span>${g.shape}</span></div>
    <div><b>Dimension:</b> <span>${g.length}m x ${g.width}m</span></div>
    <div><b>Area:</b> <span class="key-num">${area.toFixed(2)}</span> m²</div>
    <div><b>Total Soil Needed:</b> <span class="key-num">${soilKg}</span> kg (30cm raised bed)</div>
    <div><b>Initial Fertilizer:</b> <span class="key-num">${fert}</span> g Urea (est.)</div>
    <div><b>Recommended Water Each Time:</b> <span class="key-num">${water}</span> liters</div>
    <div><b>Recent Soil Moisture:</b> <span class="key-num">${g.soilMoisture}</span>%</div>
  `;
  document.getElementById('dashboardCurrent').innerHTML = html;
  document.getElementById('dashboardStatus').textContent = g.status;
}

// Area calculation for common shapes
function calculateArea(len,wid,shape) {
  if(shape=="Rectangle") return len*wid;
  if(shape=="Circle") return Math.PI*len*len/4;
  if(shape=="Oval") return Math.PI*(len/2)*(wid/2);
  if(shape=="Triangle") return (len*wid)/2;
  return len*wid;
}

// Calculator tab
function updateCalculatorTab() {
  const g = gardens[activeGarden];
  document.getElementById('gardenShape').textContent = g.shape;
  document.getElementById('gardenLength').value = g.length;
  document.getElementById('gardenWidth').value = g.width;
  document.getElementById('gardenAreaResult').textContent = "";
  document.getElementById('fertilizerResult').textContent = "";
}
function calculateGardenSpace() {
  const len = parseFloat(document.getElementById('gardenLength').value);
  const wid = parseFloat(document.getElementById('gardenWidth').value);
  const g = gardens[activeGarden];
  const area = calculateArea(len, wid, g.shape);
  gardens[activeGarden].length = len;
  gardens[activeGarden].width = wid;
  document.getElementById('gardenAreaResult').textContent = `Total area: ${area.toFixed(2)} m²`;
}
function calculateFertilizerNeeded() {
  const len = parseFloat(document.getElementById('gardenLength').value);
  const wid = parseFloat(document.getElementById('gardenWidth').value);
  const g = gardens[activeGarden];
  const crop = document.getElementById('fertilizerCrop').value;
  const fertType = document.getElementById('fertilizerType').value;
  const area = calculateArea(len,wid,g.shape);
  let rate = (crop==="maize") ? (fertType==="standard"?55:120):(crop==="tomato"? (fertType==="standard"?30:90):(fertType==="standard"?25:80));
  let need = area * rate;
  document.getElementById('fertilizerResult').textContent = `Fertilizer for ${crop}: ${need.toFixed(0)}g (${fertType==="standard"?"Urea":"Organic Compost"})`;
}

// Task scheduler
function renderTasks() {
  const list = document.getElementById('taskList');
  list.innerHTML = "";
  gardens[activeGarden].tasks.forEach((task,idx)=>{
    let li = document.createElement('li');
    li.innerHTML = `${task.date} - ${task.desc}
      <span>
        <button onclick="editTask(${idx})">Edit</button>
        <button onclick="deleteTask(${idx})">Delete</button>
      </span>`;
    list.appendChild(li);
  });
}
function addTask() {
  const dateVal = document.getElementById('taskDate').value;
  const descVal = document.getElementById('taskDescription').value.trim();
  if(!dateVal || !descVal) { alert('Fill in both date and description.'); return; }
  const selDate = new Date(dateVal); const today = new Date(); today.setHours(0,0,0,0);
  if(selDate < today) { alert("You cannot schedule a past date."); return; }
  gardens[activeGarden].tasks.push({date: selDate.toLocaleDateString(), desc: descVal});
  renderTasks();
  document.getElementById('taskDate').value = "";
  document.getElementById('taskDescription').value = "";
}
function editTask(idx) {
  let t = gardens[activeGarden].tasks[idx];
  let ndesc = prompt("Edit task description:", t.desc);
  if(ndesc!==null) { gardens[activeGarden].tasks[idx].desc= ndesc.trim(); renderTasks(); }
}
function deleteTask(idx) {
  if(confirm("Delete this task?")) { gardens[activeGarden].tasks.splice(idx,1); renderTasks(); }
}

// Weather
function generateWeatherForecast() {
  const elem = document.getElementById('weatherForecast'); elem.innerHTML = "";
  const icons =["☀️","🌤️","⛅","🌧️","🌦️","🌩️","🌬️","🌨️"];
  const today = new Date();
  for(let i=0;i<7;i++) {
    let d = new Date(today); d.setDate(today.getDate()+i);
    let day = d.toLocaleDateString(undefined, {weekday:'short'});
    let icon= icons[Math.floor(Math.random()*icons.length)];
    let temp = (Math.random()*8+19).toFixed(1);
    let rain = Math.floor(Math.random()*70)+10;
    const card = document.createElement('div');
    card.className="weather-card";
    card.innerHTML = `<div><b>${day}</b><br>${icon}</div>
                      <div>Temp: ${temp}°C</div>
                      <div>Rain: ${rain}%</div>`;
    elem.appendChild(card);
  }
}
generateWeatherForecast();

// Moisture status
function checkSoilMoisture() {
  const val = parseFloat(document.getElementById('moistureInput').value);
  if(isNaN(val)||val<0||val>100){ showAlert('Enter valid value.'); dashboardUpdate(null); return; }
  gardens[activeGarden].soilMoisture = val;
  if(val<30) showAlert('Warning: LOW. Watering recommended.','alert-low'), dashboardUpdate('Low');
  else if(val<=70) showAlert('Ideal range!','alert-ok'), dashboardUpdate('OK');
  else showAlert('High. Avoid watering.','alert-ok'), dashboardUpdate('Wet');
  updateDashboard();
}
function showAlert(text,cl){const m=document.getElementById('moistureAlert');m.textContent=text;m.className=cl||'';}

function dashboardUpdate(msg){
  document.getElementById('dashboardStatus').textContent = msg||gardens[activeGarden].status;
}

// Simulate dashboard
function fetchSoilMoistureFromApi(){
  return new Promise(r=>setTimeout(()=>r(Math.floor(Math.random()*60)+20),900));
}
async function updateDashboardFromApi(){
  const moist = await fetchSoilMoistureFromApi();
  gardens[activeGarden].soilMoisture = moist;
  document.getElementById('moistureInput').value = moist;
  checkSoilMoisture();
}
setInterval(updateDashboardFromApi, 7000);

// Drone
function simulateDroneDataUpload() {
  const el = document.getElementById('droneDataStatus');
  el.textContent = "Uploading drone data...";
  setTimeout(()=> {
    el.textContent="Drone data uploaded. Aerial analysis available.";
    gardens[activeGarden].status = "Drone surveyed";
    updateDashboard();
  }, 2400);
}

// Auth Tabs: Show/hide login/signup/forgot panes
function showAuthTab(tab) {
  let ids = ["login","signup","forgot"];
  ids.forEach(id=>{
    document.getElementById(id+"Form").classList.toggle("active",tab===id);
    document.getElementById(id+"TabSmallBtn").classList.toggle("active",tab===id);
  });
  // Clear messages
  ["login","signup","forgot"].forEach(x=>{let el=document.getElementById(x+"Status"); if(el) el.textContent="";});
}
function handleLogin(e) {
  e.preventDefault();
  let u = document.getElementById('userName').value.trim();
  let p = document.getElementById('userPass').value.trim();
  let status = document.getElementById('loginStatus');
  if(u==="214522748"&&p==="@AgriD1"){status.style.color="#0c8800"; status.textContent="Login successful!";}
  else{status.style.color="red"; status.textContent="Login failed. Use username: 214522748, password: @AgriD1";}
  return false;
}
function handleSignup(e) {
  e.preventDefault();
  let name = document.getElementById('signupName').value.trim();
  let surname = document.getElementById('signupSurname').value.trim();
  let uname = document.getElementById('signupUsername').value.trim();
  let email = document.getElementById('signupEmail').value.trim();
  let address = document.getElementById('signupAddress').value.trim();
  let status = document.getElementById('signupStatus');
  if(name && surname && uname && email && address){
    status.style.color="#0c8800"; status.textContent="Welcome, "+name+"! Account created. You may login.";
    setTimeout(()=>showAuthTab('login'), 1500);
  } else { status.style.color="red"; status.textContent="Please fill all fields.";}
  return false;
}
function handleForgotPassword(e) {
  e.preventDefault();
  let email = document.getElementById('forgotEmail').value.trim();
  let status = document.getElementById('forgotStatus');
  if(email){
    status.style.color="#0c8800"; status.textContent="If the email exists, a reset link has been sent.";
    setTimeout(()=>showAuthTab('login'),1800);
  } else{ status.style.color="red"; status.textContent="Please enter your email.";}
  return false;
}

// Contact/Signup non-auth (contact us, signup tab in nav)
function submitContactForm(e){
  e.preventDefault();
  let n=document.getElementById('contactName').value.trim(),
      em=document.getElementById('contactEmail').value.trim(),
      m=document.getElementById('contactMessage').value.trim();
  let st=document.getElementById('contactStatus');
  if(n&&em&&m){st.textContent=`Thank you, ${n}! Message sent.`;e.target.reset();}else{st.textContent="Please fill in all fields.";}
}
function submitSignupForm(e){
  e.preventDefault();
  let n=document.getElementById('signupName').value.trim(),
      em=document.getElementById('signupEmail').value.trim();
  let st=document.getElementById('signupStatus');
  if(n&&em){st.textContent=`Thank you for signing up, ${n}!`;e.target.reset();}else{st.textContent="Please provide name and email.";}
}

// Back to top
const backToTopBtn=document.getElementById("backToTopBtn");
window.onscroll=function(){scrollFunction();};
function scrollFunction(){
  if(document.body.scrollTop>300||document.documentElement.scrollTop>300)
    backToTopBtn.style.display="block";
  else
    backToTopBtn.style.display="none";
}
function topFunction(){window.scrollTo({top:0,behavior:'smooth'});}

// Main update
function updateGardenViews() {
  updateGardenNames();
  updateDashboard();
  updateCalculatorTab();
  renderTasks();
  generateWeatherForecast();
}

window.onload = ()=>{
  updateGardenSelector();
  updateGardenNames();
  showTab('dashboardTab'); // or 'homeTab'
  updateGardenViews();
  showAuthTab('login');
};