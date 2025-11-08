document.getElementById("register_submit").addEventListener("click", async (e) => {
  e.preventDefault();
  const email = document.getElementById("register_email").value.trim();
  if (!email) return alert("Bitte E-Mail eingeben.");

  // Trash-Mail-Domains blockieren
  let trashMailDomains = [];
  try {
    const trashRes = await fetch("/../api/register/readTrashmail.php");
    if (!trashRes.ok) {
      throw new Error("Netzwerkantwort war nicht ok.");
    }
    const trashData = await trashRes.json();
    trashMailDomains = trashData.trashmail_domains || [];
  } catch (err) {
    console.error("Fehler beim Laden der Trash-Mail-Domains:", err);
  }

  const isTrashMail = trashMailDomains.some(domain => email.toLowerCase().endsWith(domain));
  
  if (isTrashMail) {
    return alert("Wegwerf-E-Mail-Adressen sind nicht erlaubt. Bitte verwenden Sie eine gültige E-Mail-Adresse.");
  }

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