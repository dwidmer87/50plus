document.addEventListener("DOMContentLoaded", () => {
  const inputs = document.querySelectorAll(".pin-input");
  const btn = document.getElementById("submit_verification_code_button");

  // Fokus auf erstes Feld
  inputs[0].focus();

  // Eventlistener für jedes Eingabefeld
  inputs.forEach((input, index) => {
    input.addEventListener("input", (e) => {
      const value = e.target.value.replace(/\D/g, ""); // nur Ziffern
      e.target.value = value; // sicherstellen, dass nur eine Ziffer bleibt

      // Wenn eine Zahl eingegeben wurde -> weiter zum nächsten Feld
      if (value !== "" && index < inputs.length - 1) {
        inputs[index + 1].focus();
      }

      // Wenn alle Felder gefüllt -> Button aktivieren
      const allFilled = Array.from(inputs).every(inp => inp.value.length === 1);
      btn.disabled = !allFilled;
    });

    input.addEventListener("keydown", (e) => {
      // Rücksprung mit Backspace, wenn Feld leer
      if (e.key === "Backspace" && input.value === "" && index > 0) {
        inputs[index - 1].focus();
      }

      // Wenn Pfeil links/rechts gedrückt wird → Navigation ermöglichen
      if (e.key === "ArrowLeft" && index > 0) {
        inputs[index - 1].focus();
      }
      if (e.key === "ArrowRight" && index < inputs.length - 1) {
        inputs[index + 1].focus();
      }
    });

    // Eingabe auf eine Ziffer beschränken (optional)
    input.addEventListener("keypress", (e) => {
      if (!/[0-9]/.test(e.key)) {
        e.preventDefault();
      }
    });
  });

  // Absenden des Codes
  btn.addEventListener("click", async (event) => {
    event.preventDefault();

    const verification_code = Array.from(inputs).map(i => i.value).join("");

    if (verification_code.length !== 6) {
      alert("Bitte alle 6 Ziffern eingeben.");
      return;
    }

    try {
      const response = await fetch("/api/contacts/updateContact.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ verification_code })
      });

      const text = await response.text(); // raw lesen, falls kein JSON
      console.log("Server-Response:", text);

      let result;
      try {
        result = JSON.parse(text);
      } catch {
        throw new Error("Keine gültige JSON-Antwort vom Server");
      }

      if (result.success) {
        alert("Verifizierung erfolgreich! Sie wurden als Begleitperson hinzugefügt.");
        inputs.forEach(i => i.value = "");
        inputs[0].focus();
        window.location.href = "contact.html";
      } else {
        alert("Fehler: " + (result.error || "Ungültiger Code."));
      }
    } catch (error) {
      console.error("Fehler beim Absenden des Codes:", error);
      alert("Technischer Fehler beim Senden des Codes.");
    }
  });
});
