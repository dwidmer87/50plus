//________________________________________
// Auth check: Ist der User eingeloggt?
//________________________________________

async function checkAuth() {
  try {
    const response = await fetch("api/home.php", {
      credentials: "include",
    });

    if (response.status === 401) {
      window.location.href = "/login.html";
      return;
    }

    const userInfo = await response.json();
    loadProfile(); // Falls eingeloggt → Profildaten laden
  } catch (error) {
    console.error("Auth check failed:", error);
    //window.location.href = "/login.html";
  }
  
}
//________________________________________
// Profildaten laden und in DOM einfügen
//________________________________________

async function loadProfile() {
  try {
    const response = await fetch("api/profile/readProfileLow.php", {
      credentials: "include"
    });
    const result = await response.json();
    console.log("Profilantwort:", result);

    if (result.success === true) {
      const firstNameEl = document.getElementById("firstName");
      const lastNameEl = document.getElementById("lastName");

      if (firstNameEl && lastNameEl) {
        firstNameEl.textContent = result.first_name;
        lastNameEl.textContent = result.last_name;
      } else {
        console.warn("DOM-Elemente für Namen nicht gefunden");
      }
    } else {
      console.warn("Profildaten konnten nicht geladen werden:", result.message);
    }
  } catch (error) {
    console.error("Fehler beim Laden der Profildaten:", error);
  }
}

//________________________________________
// Beim Laden der Seite: Auth check durchführen
//________________________________________

window.addEventListener("load", checkAuth);

function formatDate(dateString) {
  const options = { day: "numeric", month: "long", year: "numeric" };
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isSameDay = (d1, d2) =>
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear();

  if (isSameDay(date, today)) return "heute";
  if (isSameDay(date, tomorrow)) return "morgen";
  if (isSameDay(date, yesterday)) return "gestern";

  return date.toLocaleDateString("de-DE", options);
}

function createActivityCard(activity, actualUserId) {
  const dateFormatted = formatDate(activity.date_time_start);
  const isProtected = activity.id_protected === "actualUser";
  const isProtector = activity.id_protector === "actualUser";
  const otherPerson = isProtected ? activity.id_protector : activity.id_protected;
  let label = "";
  
  switch (activity.status) {
    case "approved":
      label = isProtector ? `begleite: ${otherPerson}` : `werde begleitet von: ${otherPerson}`;
      break;
    case "dismissed":
      if (otherPerson !== "actualUser") {
        label = `keine Begleitung von: ${otherPerson}`;
      }
      break;
    case "ready":
      if (otherPerson !== "actualUser") {
        label = `bereit, Sie zu begleiten: ${otherPerson}`;
        label = `<a href="offers-available.html">Angebot von ${otherPerson} beantworten</a>`;
      }
      break;
    case "phone_yes":
    case "phone_unclear":
      if (isProtected) label = `Telefon mit: ${otherPerson}`;
      else {
        label = `<a href="requests-available.html">Anfrage von ${otherPerson} beantworten</a>`;
      }
      break;
    case "message_yes":
    case "message_unclear":
      if (isProtected) label = `Nachricht an: ${otherPerson}`;
      label = `<a href="requests-available.html">Anfrage von ${otherPerson} beantworten</a>`;
      break;
    default:
      return null;
  }

  const card = document.createElement("div");
  card.classList.add("activity-card"); // Style-Klasse

  card.innerHTML = `
    <div class="activity-title"><strong>${dateFormatted}</strong></div>
    <div class="activity-label">${label}</div>
    <div class="activity-place">Ort: ${activity.place}</div>
  `;
  return card;
}

async function loadLastActivities() {
  try {
    const response = await fetch("api/matches_activities/readActivity.php", {
      credentials: "include",
    });

    if (!response.ok) {
      console.error("Fehler beim Laden der Aktivitäten:", response.statusText);
      return;
    }

    const data = await response.json();
    const container = document.getElementById("recentActivities");

    if (!container) {
      console.warn("#recentActivities nicht gefunden.");
      return;
    }

    const { activity, activitiesRest } = data;

    const allCards = [];
    activity.forEach((act) => {
      const card = createActivityCard(act);
      if (card) allCards.push(card);
    });

    allCards.forEach((card) => container.appendChild(card));

    if (activitiesRest && activitiesRest.length > 0) {
      const showMoreBtn = document.createElement("button");
      showMoreBtn.textContent = "alle anzeigen";
      showMoreBtn.classList.add("show-all-btn");

      showMoreBtn.addEventListener("click", () => {
        activitiesRest.forEach((act) => {
          const card = createActivityCard(act);
          if (card) container.appendChild(card);
        });
        showMoreBtn.remove(); // Button ausblenden nach dem Klick
      });

      container.appendChild(showMoreBtn);
    }
  } catch (error) {
    console.error("Fehler beim Laden der Aktivitäten:", error);
  }
}

loadLastActivities();
