document.getElementById("offerForm").addEventListener("submit", function(e) {
  e.preventDefault();

  //____________________________________________________________________________
  // 1. Formulardaten einsammeln
  //____________________________________________________________________________

  const start = document.getElementById("date_start_offer").value;
  const end = document.getElementById("date_end_offer").value;
  const place = document.getElementById("location_offer").value;
  const transport = Array.from(document.querySelectorAll('input[name="transport_offer"]:checked'))
    .map(checkbox => checkbox.value)
    .join(", ");
  const compensationRaw = document.getElementById("compensation_required").value;
  const compensationDetails = document.getElementById("compensation_description").value.trim();

  const isRequiredFieldMissing = !start || !end || !place || !transport;
  const isCompensationInvalid = !compensationRaw;
  const isCompensationDetailsMissing = (compensationRaw === "compensation_required_yes" && !compensationDetails);

  if (isRequiredFieldMissing || isCompensationInvalid || isCompensationDetailsMissing) {
    alert("Bitte alle erforderlichen Felder ausfüllen.");
    return;
  }

  //____________________________________________________________________________
  // Alles valide – absenden
  //____________________________________________________________________________

  const data = {
    date_time_start: start,
    date_time_end: end,
    place: place,
    transport: transport,
    compensation_required: (compensationRaw === "compensation_required_yes") ? 1 : 0,
    compensation_details: compensationDetails
  };

  fetch("/api/requests_offers/createOffer.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })
  .then(response => {
    if (!response.ok) {
      return response.json().then(err => {
        throw new Error(err.error || "Unbekannter Fehler");
      });
    }
    return response.json();
  })
  .then(result => {
    if (result.success) {
      alert("Angebot erfolgreich gespeichert!");
    } else {
      alert("Fehler: " + result.message);
    }
  })
  .catch(error => {
    console.error("Fehler:", error.message);
    alert("Fehler: " + error.message);
  });
});

//____________________________________________________________________________
// Dynamisches Anzeigen/Verstecken der Kostenbeschreibung
//____________________________________________________________________________

document.getElementById("compensation_required").addEventListener("change", function () {
  const detailsContainer = document.getElementById("compensation_details_container");
  const textarea = document.getElementById("compensation_description");

  if (this.value === "compensation_required_yes") {
    detailsContainer.style.display = "block";
  } else {
    detailsContainer.style.display = "none";
    textarea.value = ""; // leeren, wenn "Nein"
  }
});
