document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("offerForm");
  const btn = document.getElementById("btnOffer");

  let userId = null;

  //____________________________________________________________________________
  // Beim Laden die User-ID vom Server holen
  //____________________________________________________________________________

  fetch("/api/requests_offers/request.php", {
    credentials: "include"
  })
    .then(res => res.json())
    .then(data => {
      if (data.success && data.user_id) {
        userId = data.user_id;
      } else {
        console.error("Fehler beim Laden der User-ID:", data.error);
      }
    })
    .catch(err => console.error("Fehler beim Laden der User-ID:", err));

  //____________________________________________________________________________
  // Dynamisches Anzeigen/Verstecken der Kostenbeschreibung
  //____________________________________________________________________________

  const compensationSelect = document.getElementById("compensation_required");
  const compensationDetailsContainer = document.getElementById("compensation_details_container");
  const compensationTextarea = document.getElementById("compensation_description");

  compensationSelect.addEventListener("change", () => {
    if (compensationSelect.value === "compensation_required_yes") {
      compensationDetailsContainer.style.display = "block";
    } else {
      compensationDetailsContainer.style.display = "none";
      compensationTextarea.value = "";
    }
  });

  //____________________________________________________________________________
  // Klick auf Button => Formular absenden
  //____________________________________________________________________________

  btn.addEventListener("click", async (event) => {
    event.preventDefault(); // Verhindert Formular-Reload

    //____________________________________________________________________________
    // 1. Formulardaten einsammeln
    //____________________________________________________________________________

    const start = document.getElementById("date_start_offer").value;
    const end = document.getElementById("date_end_offer").value;
    const place = document.getElementById("location_offer").value;
    const transport = Array.from(document.querySelectorAll('input[name="transport_offer"]:checked'))
      .map(cb => cb.value)
      .join(", ");
    const compensationRaw = document.getElementById("compensation_required").value;
    const compensationDetails = compensationTextarea.value.trim();

    const isRequiredFieldMissing = !start || !end || !place || !transport;
    const isCompensationInvalid = compensationRaw !== "compensation_required_yes" && compensationRaw !== "compensation_required_no";
    const isDetailsMissing = (compensationRaw === "compensation_required_yes" && !compensationDetails);

    if (isRequiredFieldMissing || isCompensationInvalid || isDetailsMissing) {
      alert("Bitte alle erforderlichen Felder ausfüllen.");
      return;
    }

    //____________________________________________________________________________
    // 2. Compensation boolean ableiten
    //____________________________________________________________________________

    const compensationRequired = compensationRaw === "compensation_required_yes";

    //____________________________________________________________________________
    // 3. Angebot absenden
    //____________________________________________________________________________

    const offerData = {
      type: "offer",
      id_protected: userId,
      date_time_start: start,
      date_time_end: end,
      place: place,
      transport: transport,
      compensation_required: compensationRequired,
      compensation_details: compensationRequired ? compensationDetails : ""
    };

    try {
      const response = await fetch("/api/requests_offers/createOffer.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(offerData)
      });

      const result = await response.json();

      if (result.success) {
        alert("Ihr Angebot wurde erfolgreich gespeichert.");
        form.reset();
        window.location.href = "requests-available.html";
      } else {
        alert("Fehler: " + (result.error || "Unbekannter Fehler"));
      }
    } catch (error) {
      console.error("Fehler beim Absenden des Angebots:", error);
      alert("Technischer Fehler beim Senden des Angebots.");
    }
  });
});
