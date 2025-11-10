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

    // Listen erzeugen
    protectorsContainer.innerHTML = uniqueProtectors.length
      ? uniqueProtectors.map(c => `<p class="contact-item" data-type="protector" data-id="${c.id_protector}" data-name="${c.name}" data-updated-at="${c.updated_at}">${c.name}</p>`).join("")
      : "<p><em>Aktuell keine Personen</em></p>";

    protectedContainer.innerHTML = uniqueProtected.length
      ? uniqueProtected.map(c => `<p class="contact-item" data-type="protected" data-id="${c.id_protected}" data-name="${c.name}" data-updated-at="${c.updated_at}">${c.name}</p>`).join("")
      : "<p><em>Aktuell keine Personen</em></p>";

    // Klick auf Kontakt
    document.querySelectorAll(".contact-item").forEach(item => {
      item.addEventListener("click", () => {
        openContactPopup(item.dataset);
      });
    });

  } catch (err) {
    console.error("Fehler beim Laden:", err);
    alert("Technischer Fehler beim Laden der Kontakte.");
  }
});


//____________________________________________________________
// Popup-Logik
//____________________________________________________________

function openContactPopup({ id, name, type, contactSince }) {
  const updated_at = contactSince || null;
  const popup = document.getElementById("contact-popup");
  if (!popup) return;

  // Datum lesbar formatieren (z. B. "12. Oktober 2024")
  let sinceText = "– keine Angabe –";
  if (updated_at) {
    const date = new Date(updated_at);
    sinceText = date.toLocaleDateString("de-CH", {
      year: "numeric",
      month: "long",
      day: "numeric"
      });
    }

  // Inhalt einsetzen
  popup.innerHTML = `
    <div class="popup-content">
      <span class="popup-close">&times;</span>
      <h3>${name}</h3>
      <p><strong>Kontakt besteht seit:</strong> <span id="contactSince">${sinceText}</span></p>
      <button id="delete-contact-btn" class="delete-btn">Kontakt löschen</button>
    </div>
  `;

  // Popup sichtbar machen
  popup.classList.add("active");

  // Schliessen bei Klick auf X oder Overlay
  popup.querySelector(".popup-close").addEventListener("click", closeContactPopup);
  popup.addEventListener("click", e => {
    if (e.target === popup) closeContactPopup();
  });

  // Lösch-Button
  const deleteBtn = document.getElementById("delete-contact-btn");
  deleteBtn.addEventListener("click", async () => {
    if (!confirm(`Möchten Sie den Kontakt mit ${name} wirklich löschen?`)) return;

    try {
      const url = type === "protector"
        ? "/api/contacts/deleteProtectorContact.php"
        : "/api/contacts/deleteProtectedContact.php";

      const formData = new FormData();
      if (type === "protector") {
        formData.append("id_protector", String(id));
      } else {
        formData.append("id_protected", String(id));
      }

      console.log("Lösche Kontakt mit ID:", id, "Typ:", type);

      const response = await fetch(url, {
        method: "POST",
        body: formData,
        credentials: "include"
      });

      const result = await response.json();

      if (result.success) {
        alert("Kontakt wurde gelöscht.");
        closeContactPopup();
        location.reload();
      } else {
        alert("Fehler: " + (result.error || "Löschen nicht möglich."));
      }
    } catch (err) {
      console.error("Fehler beim Löschen:", err);
      alert("Technischer Fehler beim Löschen des Kontakts.");
    }
  });
}

function closeContactPopup() {
  const popup = document.getElementById("contact-popup");
  if (popup) popup.classList.remove("active");
}
