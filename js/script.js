// Elementos de la interfaz
const registerForm = document.getElementById("registerForm");
const loginForm = document.getElementById("loginForm");
const recoveryForm = document.getElementById("recoveryForm");
const voteLanding = document.getElementById("voteLanding");
const landingVoteForm = document.getElementById("landingVoteForm");
const resultsChart = document.getElementById("resultsChart");
const votesTableBody = document.getElementById("votesTableBody");
const logoutFromLanding = document.getElementById("logoutFromLanding");

// Mensajes
const registerMessage = registerForm.querySelector(".message");
const loginMessage = loginForm.querySelector(".message");
const recoveryMessage = recoveryForm.querySelector(".message");

// Inputs registro
const regName = document.getElementById("regName");
const regBirthDate = document.getElementById("regBirthDate");
const regCI = document.getElementById("regCI");
const regEmail = document.getElementById("regEmail");
const regPassword = document.getElementById("regPassword");
const regVoteDate = document.getElementById("regVoteDate");
const sendCodeBtn = document.getElementById("sendCodeBtn");
const verificationCodeInput = document.getElementById("verificationCode");
const labelVerificationCode = document.getElementById("labelVerificationCode");

// Inputs login
const loginCI = document.getElementById("loginCI");
const loginPassword = document.getElementById("loginPassword");

// Inputs recuperación
const recoveryCI = document.getElementById("recoveryCI");
const sendRecoveryCodeBtn = document.getElementById("sendRecoveryCodeBtn");
const recoveryCodeInput = document.getElementById("recoveryCode");
const labelRecoveryCode = document.getElementById("labelRecoveryCode");
const newPasswordContainer = document.getElementById("newPasswordContainer");
const newPasswordInput = document.getElementById("newPassword");
const resetPasswordBtn = document.getElementById("resetPasswordBtn");

// Botones navegación
const goToLoginBtns = document.querySelectorAll("#goToLogin, #goToLoginFromRecovery");
const goToRegisterBtn = document.getElementById("goToRegister");
const goToRecoveryBtns = document.querySelectorAll("#goToRecovery");

// Código temporal para verificación
let generatedCode = "";

// Mostrar sección deseada
function showSection(section) {
  [registerForm, loginForm, recoveryForm, voteLanding]
    .forEach(sec => sec.classList.add("hidden"));
  section.classList.remove("hidden");

  registerMessage.textContent = "";
  loginMessage.textContent = "";
  recoveryMessage.textContent = "";
}

// Código aleatorio de 6 dígitos
function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Validaciones
function validarCI(ci) {
  return /^[0-9]{1,8}[A-Z]{2}$/.test(ci);
}

function validarCorreo(correo) {
  return /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(correo);
}

function validarPassword(pass) {
  return /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/.test(pass);
}

// Mostrar/ocultar contraseñas
document.querySelectorAll(".toggle-password").forEach(icon => {
  icon.addEventListener("click", () => {
    const input = document.getElementById(icon.dataset.target);
    input.type = input.type === "password" ? "text" : "password";
  });
});

// Inicio: formulario de registro
showSection(registerForm);

// Navegación
goToLoginBtns.forEach(btn => btn.addEventListener("click", () => showSection(loginForm)));
goToRegisterBtn?.addEventListener("click", () => showSection(registerForm));
goToRecoveryBtns.forEach(btn => btn.addEventListener("click", () => showSection(recoveryForm)));

// Registro: envío de código
sendCodeBtn.addEventListener("click", () => {
  const ci = regCI.value.trim();
  const email = regEmail.value.trim();
  const pass = regPassword.value;

  if (!validarCI(ci)) {
    registerMessage.textContent = "C.I. inválido.";
    registerMessage.className = "message error";
    return;
  }
  if (!validarCorreo(email)) {
    registerMessage.textContent = "Correo inválido.";
    registerMessage.className = "message error";
    return;
  }
  if (!validarPassword(pass)) {
    registerMessage.textContent = "Contraseña insegura.";
    registerMessage.className = "message error";
    return;
  }

  generatedCode = generateCode();
  alert(`Código de verificación enviado: ${generatedCode}`);
  labelVerificationCode.classList.remove("hidden");
  verificationCodeInput.classList.remove("hidden");
  registerMessage.textContent = "Ingrese el código de verificación.";
  registerMessage.className = "message";
});

// Registro: envío del formulario
registerForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const code = verificationCodeInput.value.trim();
  if (!generatedCode) {
    registerMessage.textContent = "Debe solicitar el código de verificación.";
    registerMessage.className = "message error";
    return;
  }
  if (code !== generatedCode) {
    registerMessage.textContent = "Código incorrecto.";
    registerMessage.className = "message error";
    return;
  }

  const user = {
    name: regName.value,
    birthDate: regBirthDate.value,
    ci: regCI.value.trim(),
    email: regEmail.value.trim(),
    password: regPassword.value,
    voteDate: new Date().toISOString().split("T")[0],
    hasVoted: false,
    vote: null
  };

  let users = JSON.parse(localStorage.getItem("users")) || [];
  if (users.some(u => u.ci === user.ci)) {
    registerMessage.textContent = "Este C.I. ya está registrado.";
    registerMessage.className = "message error";
    return;
  }

  users.push(user);
  localStorage.setItem("users", JSON.stringify(users));

  regVoteDate.value = user.voteDate;
  registerMessage.textContent = "Registro exitoso. Redirigiendo...";
  registerMessage.className = "message success";

  setTimeout(() => {
    showSection(loginForm);
  }, 1500);
});

// Inicio de sesión
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const ci = loginCI.value.trim();
  const pass = loginPassword.value;

  let users = JSON.parse(localStorage.getItem("users")) || [];
  const user = users.find(u => u.ci === ci && u.password === pass);

  if (!user) {
    loginMessage.textContent = "C.I. o contraseña incorrectos.";
    loginMessage.className = "message error";
    return;
  }

  sessionStorage.setItem("activeUser", JSON.stringify(user));
  loginForm.reset();
  
  // Redirigir directamente a la landing page de votación
  showSection(voteLanding);
  initLandingPage();
});

// Recuperación: envío de código
sendRecoveryCodeBtn.addEventListener("click", () => {
  const ci = recoveryCI.value.trim();
  if (!validarCI(ci)) {
    recoveryMessage.textContent = "C.I. inválido.";
    recoveryMessage.className = "message error";
    return;
  }

  let users = JSON.parse(localStorage.getItem("users")) || [];
  if (!users.find(u => u.ci === ci)) {
    recoveryMessage.textContent = "Usuario no encontrado.";
    recoveryMessage.className = "message error";
    return;
  }

  generatedCode = generateCode();
  alert(`Código de recuperación enviado: ${generatedCode}`);
  labelRecoveryCode.classList.remove("hidden");
  recoveryCodeInput.classList.remove("hidden");
});

// Mostrar nueva contraseña si código es correcto
recoveryCodeInput.addEventListener("input", () => {
  if (recoveryCodeInput.value.trim() === generatedCode) {
    newPasswordContainer.classList.remove("hidden");
    resetPasswordBtn.classList.remove("hidden");
    recoveryMessage.textContent = "Código válido. Ingrese nueva contraseña.";
    recoveryMessage.className = "message success";
  } else {
    newPasswordContainer.classList.add("hidden");
    resetPasswordBtn.classList.add("hidden");
    recoveryMessage.textContent = "Código incorrecto.";
    recoveryMessage.className = "message error";
  }
});

// Restablecer contraseña
resetPasswordBtn.addEventListener("click", () => {
  const ci = recoveryCI.value.trim();
  const newPass = newPasswordInput.value;

  if (!validarPassword(newPass)) {
    recoveryMessage.textContent = "Contraseña insegura.";
    recoveryMessage.className = "message error";
    return;
  }

  let users = JSON.parse(localStorage.getItem("users")) || [];
  const index = users.findIndex(u => u.ci === ci);
  if (index === -1) return;

  users[index].password = newPass;
  localStorage.setItem("users", JSON.stringify(users));

  recoveryMessage.textContent = "Contraseña actualizada. Redirigiendo...";
  recoveryMessage.className = "message success";

  setTimeout(() => {
    showSection(loginForm);
  }, 1500);
});

// Landing page de votación
let chart;

function initLandingPage() {
  const user = JSON.parse(sessionStorage.getItem("activeUser"));
  if (!user) return;

  // Si el usuario ya votó, ocultar formulario
  if (user.hasVoted) {
    landingVoteForm.style.display = "none";
  } else {
    landingVoteForm.style.display = "block";
  }

  // Configurar gráfico
  const ctx = resultsChart.getContext('2d');
  if (chart) {
    chart.destroy();
  }

  // Obtener resultados de localStorage
  let users = JSON.parse(localStorage.getItem("users")) || [];
  const votes = {
    "MAS-IPSP": 0,
    "Comunidad Ciudadana": 0,
    "Creemos": 0
  };

  // Actualizar tabla y votos
  votesTableBody.innerHTML = "";
  users.forEach(u => {
    if (u.vote && votes[u.vote] !== undefined) {
      votes[u.vote]++;
      
      // Solo agregar a tabla si ya votó
      if (u.hasVoted) {
        const tr = document.createElement("tr");
        const tdVoter = document.createElement("td");
        tdVoter.textContent = u.ci;
        const tdVote = document.createElement("td");
        tdVote.textContent = u.vote;
        tr.appendChild(tdVoter);
        tr.appendChild(tdVote);
        votesTableBody.appendChild(tr);
      }
    }
  });

  // Crear gráfico
  chart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: Object.keys(votes),
      datasets: [{
        label: 'Votos',
        data: Object.values(votes),
        backgroundColor: ['#3366CC', '#DC3912', '#FF9900'],
        borderColor: '#fff',
        borderWidth: 2
      }]
    },
    options: {
      responsive: false,
      plugins: {
        legend: { position: 'bottom' },
        tooltip: { enabled: true }
      }
    }
  });
}

// Votar en landing page
landingVoteForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const formData = new FormData(landingVoteForm);
  const selectedParty = formData.get("party");
  
  const user = JSON.parse(sessionStorage.getItem("activeUser"));
  let users = JSON.parse(localStorage.getItem("users")) || [];
  
  const index = users.findIndex(u => u.ci === user.ci);
  if (index === -1) return;

  users[index].hasVoted = true;
  users[index].vote = selectedParty;
  
  localStorage.setItem("users", JSON.stringify(users));
  sessionStorage.setItem("activeUser", JSON.stringify(users[index]));
  
  initLandingPage();
});

// Cerrar sesión desde landing page
logoutFromLanding.addEventListener("click", () => {
  sessionStorage.removeItem("activeUser");
  showSection(loginForm);
});