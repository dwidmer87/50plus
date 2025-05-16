//____________________________________________________________
// User-Angebote laden
//____________________________________________________________

async function loadOffers() {
  const url = '/api/requests_offers/readOfferUser.php';
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (!data.success || !Array.isArray(data.user)) {
      throw new Error("Daten nicht im erwarteten Format");
    }
    return data.user;
  } catch (error) {
    console.error("Fehler beim Laden der Angebote:", error);
    return [];
  }
}

//____________________________________________________________
// Alle Begleitanfragen laden
//____________________________________________________________

async function loadRequests() {
  const url = '/api/requests_offers/readRequestAll.php';
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (!data.success || !Array.isArray(data.requests)) {
      throw new Error("Daten nicht im erwarteten Format");
    }
    return data.requests;
  } catch (error) {
    console.error("Fehler beim Laden der Anfragen:", error);
    return [];
  }
}

//____________________________________________________________
// Matching-Logik
//____________________________________________________________

function findMatchingRequests(offers, requests) {
  const matched = [];

  for (const offer of offers) {
    const offerStart = new Date(offer.date_time_start);
    const offerEnd = new Date(offer.date_time_end);

    const transportOffered = offer.transport.split(',').map(s => s.trim());
    const wantsMoney = offer.compensation_required === 1;

    for (const request of requests) {
      const requestStart = new Date(request.date_time_start);
      const requestEnd = new Date(request.date_time_end);

      const requestTransport = request.transport.split(',').map(s => s.trim());
      const wouldPay = request.compensation_accepted === 1;

      const isWithinTime =
        requestStart >= offerStart && requestEnd <= offerEnd;

      const transportMatch = transportOffered.some(t =>
        requestTransport.includes(t)
      );

      const compensationMatch = !wantsMoney || wouldPay;

      if (isWithinTime && transportMatch && compensationMatch) {
        matched.push({
          offer,
          request
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

function renderRequests(matches) {
  const container = document.getElementById("avilableRequests");
  container.innerHTML = ""; // Leeren vor dem Rendern

  matches.forEach(match => {
    const request = match.request;

    const card = document.createElement("div");
    card.classList.add("offer-card");

    const name = document.createElement("h4");
    name.textContent = request.name || "Unbekannter Name";

    const requestedLabelStart = document.createElement("p");
    requestedLabelStart.innerHTML = `<strong>Wann?</strong> ${formatDateTime(request.date_time_start)}`;
    
    const requestedLabelEnd = document.createElement("p");
    requestedLabelEnd.innerHTML = `<strong>Wie lange?</strong> ${formatDuration(request.date_time_start, request.date_time_end)}`;

    const location = document.createElement("p");
    location.innerHTML = `<strong>Ort:</strong> ${request.place}`;

    const destination = document.createElement("p");
    destination.innerHTML = `<strong>Wohin?:</strong> ${request.destination}`;

    const transport = document.createElement("p");
    transport.innerHTML = `<strong>Verkehrsmittel:</strong> ${formatTransport(request.transport)}`;

    const acceptBtn = document.createElement("button");
    acceptBtn.textContent = "ZUSAGEN";

    const rejectBtn = document.createElement("button");
    rejectBtn.textContent = "ABLEHNEN";

    card.appendChild(name);
    card.appendChild(requestedLabelStart);
    card.appendChild(requestedLabelEnd);
    card.appendChild(location);
    card.appendChild(destination);
    card.appendChild(transport);
    card.appendChild(acceptBtn);
    card.appendChild(rejectBtn);

    container.appendChild(card);
  });
}

// Datum formatieren
function formatDateTime(dateStr) {
    if (!dateStr) return "Unbekannt";

    const isoStr = dateStr.replace(" ", "T"); // SQL -> ISO
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

// Zeitdauer formatieren
function formatDuration(startStr, endStr) {
    if (!startStr || !endStr) return "Unbekannt";

    const start = new Date(startStr.replace(" ", "T"));
    const end = new Date(endStr.replace(" ", "T"));

    if (isNaN(start.getTime()) || isNaN(end.getTime())) return "Unbekannt";

    const duration = Math.abs(end - start);
    const hours = Math.floor((duration % 86400000) / 3600000);
    const minutes = Math.round(((duration % 86400000) % 3600000) / 60000);

    if (minutes === 15) {
        return `15 Minuten oder weniger`;
    }
    if (minutes === 30) {
        return `30 Minuten`;
    }
    if (minutes === 45) {
        return `45 Minuten`;
    }
    if (hours === 2) {
        return `1 Stunde oder länger`;
    }
}

// Verkehrsmittel formatieren
function formatTransport(transportStr) {
    if (!transportStr) return "Unbekannt";

    const transportArray = transportStr.split(',').map(t => t.trim());
    const transportMap = {
        'car': 'Auto',
        'bicycle': 'Velo',
        'train': 'Zugfahrt',
        'on_foot': 'zu Fuss'
    };

    return transportArray.map(t => transportMap[t] || t).join(', ');
}
//____________________________________________________________
// Hauptfunktion
//____________________________________________________________

(async function () {
  const dataOfferUser = await loadOffers();
  const dataRequestsAll = await loadRequests();

  console.log("Angebote des Users:", dataOfferUser);
  console.log("Alle offenen Anfragen:", dataRequestsAll);

  const matches = findMatchingRequests(dataOfferUser, dataRequestsAll);
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

  // Anfragen anzeigen
  renderRequests(matches);
})();