//____________________________________________________________
// User-Anfragen laden
//____________________________________________________________

async function loadRequests() {
  const url = '/api/requests_offers/readRequestUser.php';
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (!data.success || !Array.isArray(data.user)) {
      throw new Error("Daten nicht im erwarteten Format");
    }
    return data.user;
  } catch (error) {
    console.error("Fehler beim Laden der Anfragen:", error);
    return [];
  }
}

//____________________________________________________________
// Alle Begleitangebote laden
//____________________________________________________________

async function loadOffers() {
  const url = '/api/requests_offers/readOfferAll.php';
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (!data.success || !Array.isArray(data.offers)) {
      throw new Error("Daten nicht im erwarteten Format");
    }
    return data.offers;
  } catch (error) {
    console.error("Fehler beim Laden der Angebote:", error);
    return [];
  }
}

//____________________________________________________________
// Matching-Logik
//____________________________________________________________

function findMatchingOffers(requests, offers) {
  const matched = [];

  for (const request of requests) {

    const requestStart = new Date(request.date_time_start);
    const requestEnd = new Date(request.date_time_end);

    const transportNeeded = request.transport.split(',').map(s => s.trim());
    const requiresFree = request.compensation_accepted === 0;

    for (const offer of offers) {
      const offerStart = new Date(offer.date_time_start);
      const offerEnd = new Date(offer.date_time_end);

      const offerTransport = offer.transport.split(',').map(s => s.trim());
      const isFree = offer.compensation_required === 0;

      const isWithinTime =
        requestStart >= offerStart && requestEnd <= offerEnd;

      const transportMatch = transportNeeded.some(t =>
        offerTransport.includes(t)
      );

      const compensationMatch = !requiresFree || isFree;

      if (isWithinTime && transportMatch && compensationMatch) {
        matched.push({
          request,
          offer
        });
      }
    }
  }

  return matched;
}


//____________________________________________________________
// Match direkt in Datenbank speichern
//____________________________________________________________

async function createMatchInDB(match) {
  const payload = {
    id_protected: match.request.id_protected,
    id_protector: match.offer.id_protector,
    id_request: match.request.id
  };

  console.log("Payload für DB:", payload);

  try {
    const response = await fetch('/api/matches_activities/createMatch.php', {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    return result.success === true;
  } catch (error) {
    console.error("Fehler beim Speichern des Matches:", error);
    return false;
  }
}
//____________________________________________________________
// UI anzeigen
//____________________________________________________________

function renderOffers(matches) {
  const container = document.getElementById("avilableOffers");
  container.innerHTML = "";

  matches.forEach(match => {
    const offer = match.offer;

    const card = document.createElement("div");
    card.classList.add("offer-card");

    const name = document.createElement("h4");
    name.textContent = offer.name || "Unbekannter Name";

    const availableLabelStart = document.createElement("p");
    availableLabelStart.innerHTML = `<strong>verfügbar ab:</strong> ${formatDateTime(offer.date_time_start)}`;

    const availableLabelEnd = document.createElement("p");
    availableLabelEnd.innerHTML = `<strong>verfügbar bis:</strong> ${formatDateTime(offer.date_time_end)}`;

    const location = document.createElement("p");
    location.innerHTML = `<strong>Ort:</strong> ${offer.place}`;

    const compensation = document.createElement("p");
    const compensationText = offer.compensation_required === 0 
      ? "<strong>kostenlos</strong>" 
      : "<strong>Kosten: </strong>" + (offer.compensation_details ? offer.compensation_details.replace(/\n/g, "<br>") : "Keine Angabe");
    compensation.innerHTML = `${compensationText}`;

    const callBtn = document.createElement("button");
    callBtn.textContent = "ANRUF";

    const msgBtn = document.createElement("button");
    msgBtn.textContent = "NACHRICHT";

    const voiceBtn = document.createElement("button");
    voiceBtn.textContent = "SPRACHNACHRICHT";

    card.appendChild(name);
    card.appendChild(availableLabelStart);
    card.appendChild(availableLabelEnd);
    card.appendChild(location);
    card.appendChild(compensation);
    card.appendChild(callBtn);
    card.appendChild(msgBtn);
    card.appendChild(voiceBtn);

    container.appendChild(card);
  });
}

//____________________________________________________________
// Datum formatieren
//____________________________________________________________

function formatDateTime(dateStr) {
  if (!dateStr) return "Unbekannt";

  const isoStr = dateStr.replace(" ", "T");
  const dt = new Date(isoStr);

  if (isNaN(dt.getTime())) return "Unbekannt";

  const now = new Date();
  const isToday = dt.toDateString() === now.toDateString();
  const isTomorrow = dt.toDateString() === new Date(now.getTime() + 86400000).toDateString();

  const time = dt.toLocaleTimeString("de-CH", { hour: '2-digit', minute: '2-digit' });
  const day = dt.getDate().toString().padStart(2, '0');
  const month = (dt.getMonth() + 1).toString().padStart(2, '0');
  const year = dt.getFullYear();
  const weekday = dt.toLocaleDateString("de-CH", { weekday: 'long' });

  if (isToday) return `heute, ${time} Uhr`;
  if (isTomorrow) return `morgen, ${time} Uhr`;
  return `${weekday}, ${day}.${month}.${year} ${time}`;
}

//____________________________________________________________
// Hauptfunktion
//____________________________________________________________

(async function () {
  const dataRequestUser = await loadRequests();
  const dataOffersAll = await loadOffers();

  console.log("Anfragen des Users:", dataRequestUser);
  console.log("Alle offenen Angebote:", dataOffersAll);

  const matches = findMatchingOffers(dataRequestUser, dataOffersAll);
  console.log("Gefundene Matches:", matches);

  // Automatisch alle Matches in DB speichern
  for (const match of matches) {
    const success = await createMatchInDB(match);
    if (success) {
      console.log("Match gespeichert:", match);
    } else {
      console.warn("Fehler beim Speichern:", match);
    }
  }

  // Angebote anzeigen
  renderOffers(matches);
})();