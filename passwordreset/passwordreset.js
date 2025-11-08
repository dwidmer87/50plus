document.getElementById("reset_submit").addEventListener("click", async (e) => {
  e.preventDefault();

  const email = document.getElementById("reset_email").value.trim();
  if (!email) {
    alert("Bitte E-Mail eingeben.");
    return;
  }

  // Trash-Mail-Domains blockieren
  let trashMailDomains = [];
  try {
    const trashRes = await fetch("../api/register/readTrashmail.php");
    if (!trashRes.ok) throw new Error("Netzwerkfehler beim Laden der Trash-Mail-Domains.");
    const trashData = await trashRes.json();
    trashMailDomains = trashData.trashmail_domains || [];
  } catch (err) {
    console.error("Fehler beim Laden der Trash-Mail-Domains:", err);
  }

  const isTrashMail = trashMailDomains.some(domain =>
    email.toLowerCase().endsWith(domain)
  );

  if (isTrashMail) {
    alert("Wegwerf-E-Mail-Adressen sind nicht erlaubt. Bitte verwenden Sie eine gültige E-Mail-Adresse.");
    return;
  }

  try {
    const res = await fetch("/api/passwordreset/resetRequest.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });

    const text = await res.text();
    let data;

    try {
      data = JSON.parse(text);
    } catch {
      alert("Fehlerhafte Serverantwort.");
      return;
    }

    if (data.success) {
      alert("E-Mail mit Link zum Zurücksetzen des Passworts wurde gesendet.");
    } else {
      alert(data.error || "Fehler beim Senden der E-Mail.");
    }

  } catch {
    alert("Serverfehler. Bitte versuchen Sie es später erneut.");
  }
});
