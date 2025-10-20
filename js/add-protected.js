document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("submit_verification_code_button");
  const input = document.getElementById("verification_code_input");

  btn.addEventListener("click", async (event) => {
    event.preventDefault();

    //____________________________________________________________
    // 1. Eingabe prüfen
    //____________________________________________________________
    const verification_code = input.value.trim();

    if (!verification_code || verification_code.length !== 6 || isNaN(verification_code)) {
      alert("Bitte einen gültigen 6-stelligen Verifizierungscode eingeben.");
      return;
    }

    //____________________________________________________________
    // 2. Request absenden
    //____________________________________________________________
    const requestData = { verification_code };

    try {
      const response = await fetch("/api/contacts/updateContact.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(requestData)
      });

      const result = await response.json();

      if (result.success) {
        alert("Verifizierung erfolgreich! Sie wurden als Begleitperson hinzugefügt.");
        input.value = "";
      } else {
        alert("Fehler: " + (result.error || "Ungültiger Code."));
      }
    } catch (error) {
      console.error("Fehler beim Absenden des Codes:", error);
      alert("Technischer Fehler beim Senden des Codes.");
    }
  });
});
