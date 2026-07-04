const loginButton = document.getElementById("loginButton");

loginButton.addEventListener("click", () => {
  const password = document.getElementById("password").value;

  if (password === "Selvam@2026") {
    sessionStorage.setItem("loggedIn", "true");

    window.location.href = "index.html";
  } else {
    document.getElementById("error").textContent = "Invalid password";
  }
});
