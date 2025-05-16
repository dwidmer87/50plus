// login.js
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    const response = await fetch("api/login.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ email, password }),
    });
    const result = await response.json();

    if (result.status === "success") {
      alert("Login erfolgreich!");
      window.location.href = "home.html";
    } else {
      alert(result.message || "Login nicht erfolgreich. Bitte überprüfen Sie Ihre Anmeldedaten.");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Etwas ist schief gelaufen. Bitte versuchen Sie es später erneut.");
  }
});
