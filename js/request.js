document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("requestForm");
  const btn = document.getElementById("btnRequest");

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


  btn.addEventListener("click", async (event) => {
    event.preventDefault(); // Verhindert Formular-Reload
//____________________________________________________________________________
// 1. Formulardaten einsammeln
//____________________________________________________________________________

    const start = document.getElementById("date_start_request").value;
    const duration = document.getElementById("date_end_request").value;
    const pickup = document.getElementById("location_pickup_request").value;
    const destination = document.getElementById("location_destination_request").value;
    const transport = document.getElementById("transport_request").value;
    const compensationRaw = document.getElementById("compensation_accepted").value;

    const isRequiredFieldMissing = !start || !duration || !pickup || !transport;
    const isCompensationInvalid = compensationRaw !== "compensation_accepted_yes" && compensationRaw !== "compensation_accepted_no";

    if (isRequiredFieldMissing || isCompensationInvalid) {
      alert("Bitte alle erforderlichen Felder ausfüllen.");
      return;
    }

//____________________________________________________________________________
// 2. Dauer parsen & Endzeit berechnen
//____________________________________________________________________________

  function formatLocalDateTime(date) {
    const pad = n => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
         `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}


const dateStart = start + ":00"; // z.B. "2025-05-14T14:00"
const dateStartObj = new Date(dateStart);
const durationMs = parseISODuration(duration); // z. B. PT30M => 1800000 ms
const dateEndObj = new Date(dateStartObj.getTime() + durationMs);

const dateStartFormatted = formatLocalDateTime(dateStartObj);
const dateEndFormatted = formatLocalDateTime(dateEndObj);

//____________________________________________________________________________
// 3. Compensation boolean ableiten
//____________________________________________________________________________

    const compensationAccepted = compensationRaw === "compensation_accepted_yes";

//____________________________________________________________________________
// 4. Anfrage absenden
//____________________________________________________________________________

    const requestData = {
        type: "request",
        id_protected: userId,
        date_time_start: dateStartFormatted,
        date_time_end: dateEndFormatted,
        place: pickup,
        destination: destination,
        transport: transport,
        status: "open",
        compensation_accepted: compensationAccepted
    };

    try {
      const response = await fetch("/api/requests_offers/createRequest.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(requestData)
      });

      const result = await response.json();

      if (result.success) {
        alert("Ihre Anfrage wurde erfolgreich gespeichert.");
        form.reset();
      } else {
        alert("Fehler: " + (result.error || "Unbekannter Fehler"));
      }
    } catch (error) {
      console.error("Fehler beim Absenden der Anfrage:", error);
      alert("Technischer Fehler beim Senden der Anfrage.");
    }
  });
});

// Hilfsfunktion zur Umrechnung von ISO 8601 Duration in Millisekunden
function parseISODuration(duration) {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return 0;

  const hours = parseInt(match[1]) || 0;
  const minutes = parseInt(match[2]) || 0;

  return (hours * 60 + minutes) * 60 * 1000;
}
