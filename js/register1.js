document.getElementById("register_submit").addEventListener("click", async () => {
  const email = document.getElementById("register_email").value.trim();
  if (!email) return alert("Bitte E-Mail eingeben.");

  try {
    const res = await fetch("/api/register/request.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    const data = await res.json();

    if (data.success) {
      alert("E-Mail mit Bestätigungslink wurde gesendet.");
    } else {
      alert(data.error || "Fehler beim Senden der E-Mail.");
    }
  } catch (err) {
    alert("Serverfehler.");
    console.error(err);
  }
});