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