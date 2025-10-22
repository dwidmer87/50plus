document
  .getElementById("registerForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const fullName = document.getElementById("fullname").value.trim();
    const parts = fullName.split(" ");
    const first_name = parts[0];
    const last_name = parts.slice(1).join(" ") || null; // Fallback, falls kein Nachname existiert
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const passwordRepeat = document.getElementById("password_repeat").value.trim();

    // Passwort-Wiederholung
    if (password.trim() !== passwordRepeat.trim()) {
      alert("Die Passwörter stimmen nicht überein.");
      return;
    }
console.log(first_name, last_name, email, password);
    
    try {
      const response = await fetch("api/profile/register.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ first_name, last_name, email, password }),
      });
      const result = await response.json();

      if (result.status === "success") {
        alert("Registration successful! You can now log in.");
        window.location.href = "login.html";
      } else {
        alert(result.message || "Registration failed.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong!");
    }
  });
