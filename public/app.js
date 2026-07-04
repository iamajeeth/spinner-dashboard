const loginContainer = document.getElementById("loginContainer");

const dashboard = document.getElementById("dashboard");

const loginButton = document.getElementById("loginButton");

const logoutButton = document.getElementById("logoutButton");

const logoutButton2 = document.getElementById("logoutButton2");

const password = document.getElementById("password");

const error = document.getElementById("error");

loginButton.onclick = () => {
  if (password.value === "Selvam@2026") {
    sessionStorage.setItem("dashboardLogin", "true");

    showDashboard();
  } else {
    error.textContent = "Invalid Password";
  }
};

function showDashboard() {
  loginContainer.style.display = "none";

  dashboard.style.display = "block";
}

function logout() {
  sessionStorage.clear();

  location.reload();
}

logoutButton.onclick = logout;

logoutButton2.onclick = logout;

if (sessionStorage.getItem("dashboardLogin")) {
  showDashboard();
}

document.querySelectorAll(".tab").forEach((tab) => {
  tab.onclick = () => {
    document
      .querySelectorAll(".tab")
      .forEach((t) => t.classList.remove("active"));

    tab.classList.add("active");

    document
      .querySelectorAll(".tabContent")
      .forEach((t) => (t.style.display = "none"));

    document.getElementById(tab.dataset.tab + "Tab").style.display = "block";
  };
});
