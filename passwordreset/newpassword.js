document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("resetForm");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const passwordRepeatInput = document.getElementById("password_repeat");

  // Token aus der URL holen
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");

  if (!token) {
    alert("Fehler: Kein Bestätigungslink gefunden. Bitte prüfen Sie Ihre E-Mail.");
    form.style.display = "none";
    return;
  }

  // ----------------------------------------------------------
  // 1️⃣ Token validieren (prüfen, ob gültig & E-Mail zugeordnet)
  // ----------------------------------------------------------
fetch("/api/passwordreset/resetConfirm.php", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ token })
})
.then(res => {
  console.log("Response Status:", res.status); // 🔍 Debug
  console.log("Response OK:", res.ok); // 🔍 Debug
  
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  return res.json();
})
.then(data => {
  console.log("Response Data:", data); // 🔍 Debug
  
  if (!data.success) {
    alert(data.error || "Ungültiger oder abgelaufener Link.");
    form.style.display = "none";
  }
})
.catch((err) => {
  console.error("Fetch Error:", err); // 🔍 Debug - zeigt den genauen Fehler
  alert("Verbindungsfehler. Bitte versuchen Sie es später erneut.");
  form.style.display = "none";
});

  // ----------------------------------------------------------
  // 2️⃣ Formular absenden → Passwort an Backend senden
  // ----------------------------------------------------------
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const password = passwordInput.value.trim();
    const passwordRepeat = passwordRepeatInput.value.trim();

    if (!password || !passwordRepeat) {
      alert("Bitte füllen Sie alle Felder aus.");
      return;
    }

    if (password !== passwordRepeat) {
      alert("Die Passwörter stimmen nicht überein.");
      return;
    }

    if (password.length < 8) {
      alert("Das Passwort muss mindestens 8 Zeichen lang sein.");
      return;
    }

    try {
      const response = await fetch("/api/passwordreset/resetConfirm.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password })
      });

      const result = await response.json();

      if (result.success) {
        alert("Ihr Passwort wurde erfolgreich zurückgesetzt.");
        window.location.href = "login.html";
      } else {
        alert(result.error || "Fehler beim Zurücksetzen des Passworts.");
      }

    } catch {
      alert("Technischer Fehler beim Zurücksetzen des Passworts. Bitte versuchen Sie es später erneut.");
    }
  });
});
