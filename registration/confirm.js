document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");
  const fullnameInput = document.getElementById("fullname");
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
  fetch("/api/register/confirm.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token })
  })
  .then(res => res.json())
  .then(data => {
    if (!data.success) {
      alert(data.error || "Ungültiger oder abgelaufener Link.");
      form.style.display = "none";
    } else {
      console.log("Token gültig für:", data.email);
    }
  })
  .catch(() => {
    alert("Verbindungsfehler. Bitte versuchen Sie es später erneut.");
    form.style.display = "none";
  });

  // ----------------------------------------------------------
  // 2️⃣ Formular absenden → Passwort + Name an Backend senden
  // ----------------------------------------------------------
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const fullname = fullnameInput.value.trim();
    const password = passwordInput.value.trim();
    const passwordRepeat = passwordRepeatInput.value.trim();

    if (!fullname || !password || !passwordRepeat) {
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

    // Vorname & Nachname aufteilen
    const nameParts = fullname.split(" ");
    const firstName = nameParts.slice(0, -1).join(" ") || fullname;
    const lastName = nameParts.slice(-1).join(" ") || "";

    try {
        console.log("Sende an Backend:", {
            token,
            password,
            first_name: firstName,
            last_name: lastName
        });

        const response = await fetch("/api/register/confirm.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
            token,
            password,
            first_name: firstName,
            last_name: lastName
            })
        });

        console.log("Response-Status:", response.status);

        const text = await response.text();
        console.log("Roh-Response:", text);

        let result;
        try {
            result = JSON.parse(text);
        } catch (e) {
            throw new Error("Keine gültige JSON-Antwort vom Server");
        }

        if (result.success) {
            alert("Registrierung erfolgreich! Sie können sich jetzt einloggen.");
            window.location.href = "login.html";
        } else {
            alert(result.error || "Fehler bei der Registrierung.");
        }

        } catch (err) {
        console.error("Fehler:", err);
        alert("Technischer Fehler beim Senden der Registrierung: " + err.message);
        }

  });
});
