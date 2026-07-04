// ===============================
// Login
// ===============================

const loginContainer = document.getElementById("loginContainer");
const dashboard = document.getElementById("dashboard");

const loginButton = document.getElementById("loginButton");
const passwordInput = document.getElementById("password");
const error = document.getElementById("error");

document.getElementById("refreshButton").onclick = refreshDashboard;

const logoutButton = document.getElementById("logoutButton");
const logoutButton2 = document.getElementById("logoutButton2");

// Temporary password
const PASSWORD = "Selvam@2026";

loginButton.onclick = async () => {
  error.textContent = "";

  try {
    const response = await fetch(DASHBOARD_CONFIG.functionUrl, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",

        apikey: DASHBOARD_CONFIG.publishableKey,
      },

      body: JSON.stringify({
        password: passwordInput.value,
        page: 1,
        pageSize: 10,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error ?? "Login Failed");
    }

    sessionStorage.setItem("dashboardPassword", passwordInput.value);

    sessionStorage.setItem("dashboardLogin", "true");

    window.dashboardData = data;

    showDashboard();
  } catch (e) {
    error.textContent = e.message;
  }
};

passwordInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    loginButton.click();
  }
});

function showDashboard() {
  loginContainer.style.display = "none";
  dashboard.style.display = "block";

  renderDashboard(window.dashboardData);
}

function renderDashboard(data) {
  document.getElementById("participantCount").textContent =
    data.participantCount ?? 0;

  document.getElementById("todayCount").textContent = data.todayCount ?? 0;

  if (data.lastSpin) {
    document.getElementById("lastSpin").textContent = new Date(
      data.lastSpin,
    ).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } else {
    document.getElementById("lastSpin").textContent = "--";
  }

  loadParticipants(data.participants ?? []);

  loadPrizeStats(data.prizeStats ?? []);
}

function logout() {
  sessionStorage.removeItem("dashboardLogin");

  location.reload();
}

logoutButton.onclick = logout;
logoutButton2.onclick = logout;

if (sessionStorage.getItem("dashboardLogin")) {
  passwordInput.value = sessionStorage.getItem("dashboardPassword");

  loginButton.click();
}

// ===============================
// Tabs
// ===============================

document.querySelectorAll(".tab").forEach((tab) => {
  tab.onclick = () => {
    document
      .querySelectorAll(".tab")
      .forEach((t) => t.classList.remove("active"));

    tab.classList.add("active");

    document
      .querySelectorAll(".tabContent")
      .forEach((c) => (c.style.display = "none"));

    document.getElementById(tab.dataset.tab + "Tab").style.display = "block";
  };
});

let currentPage = 1;

const pageSize = 10;

let participantRows = [];

function loadParticipants(rows) {
  participantRows = rows;

  renderParticipants();
}

function renderParticipants() {
  const tbody = document.getElementById("participantsBody");

  tbody.innerHTML = "";

  if (participantRows.length === 0) {
    tbody.innerHTML = "<tr><td colspan='4'>No data</td></tr>";

    return;
  }

  participantRows.forEach((row) => {
    const time = new Date(row.claimed_at).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    tbody.innerHTML += `
        <tr>
            <td>${row.mobile}</td>
            <td>${row.prize_title}</td>
            <td>${row.prize_code}</td>
            <td>${time}</td>
        </tr>`;
  });

  document.getElementById("pageNumber").textContent =
    `Page ${currentPage} of ${window.dashboardData.totalPages}`;
}

document.getElementById("nextPage").onclick = async () => {
  if (currentPage >= window.dashboardData.totalPages) return;

  currentPage++;

  await refreshDashboard();
};

document.getElementById("previousPage").onclick = async () => {
  if (currentPage <= 1) return;

  currentPage--;

  await refreshDashboard();
};

function loadPrizeStats(rows) {
  const tbody = document.getElementById("prizeBody");

  tbody.innerHTML = "";

  const total = rows.reduce((sum, row) => sum + Number(row.count), 0);

  if (rows.length === 0) {
    tbody.innerHTML = "<tr><td colspan='3'>No data</td></tr>";

    return;
  }

  rows.forEach((row) => {
    tbody.innerHTML += `

        <tr>

        <td>${row.prize_title}</td>

        <td>${row.count}</td>

        <td>${((row.count / total) * 100).toFixed(2)}%</td>

        </tr>

        `;
  });
}

async function refreshDashboard() {
  if (!sessionStorage.getItem("dashboardLogin")) return;

  try {
    const response = await fetch(DASHBOARD_CONFIG.functionUrl, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        apikey: DASHBOARD_CONFIG.publishableKey,
      },

      body: JSON.stringify({
        password: sessionStorage.getItem("dashboardPassword"),

        page: currentPage,

        pageSize: 10,
      }),
    });

    const data = await response.json();

    window.dashboardData = data;

    renderDashboard(data);
  } catch (err) {
    console.error(err);
  }
}

setInterval(refreshDashboard, 10000);