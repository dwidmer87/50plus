document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch("/api/contacts/readContact.php", {
      credentials: "include"
    });
    const data = await response.json();

    if (!data.success) {
      alert(data.error || "Fehler beim Laden der Kontakte.");
      return;
    }

    const protectorsContainer = document.getElementById("my_protectors");
    const protectedContainer = document.getElementById("my_protected");
    
    // Duplikate nach Namen entfernen
    const uniqueProtectors = [...new Map(data.protector_contacts.map(c => [c.name, c])).values()];
    const uniqueProtected = [...new Map(data.protected_contacts.map(c => [c.name, c])).values()];
    
    protectorsContainer.innerHTML = uniqueProtectors.length
      ? uniqueProtectors.map(c => `<p>${c.name}</p>`).join("")
      : "<p><em>Aktuell keine Personen</em></p>";
    
    protectedContainer.innerHTML = uniqueProtected.length
      ? uniqueProtected.map(c => `<p>${c.name}</p>`).join("")
      : "<p><em>Aktuell keine Personen</em></p>";

  } catch (err) {
    console.error("Fehler beim Laden:", err);
    alert("Technischer Fehler beim Laden der Kontakte.");
  }
});
