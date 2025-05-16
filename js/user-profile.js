(async function () {
  const domInputFullName = document.querySelector('#inputFullName');
  const domInputEmail = document.querySelector('#inputEmail');
  const domInputPassword = document.querySelector('#inputPassword');
  const domInputPasswordRepeat = document.querySelector('#inputPasswordRepeat');
  const btnSave = document.querySelector('#btnSaveChanges');

  //_________________________________________________________
  // Profildaten laden
  //_________________________________________________________

  async function loadData() {
    const url = '/api/profile/readProfile.php';
    try {
      const response = await fetch(url);
      return await response.json();
    } catch (error) {
      console.error("Fehler beim Laden der Profildaten:", error);
      return false;
    }
  }

    //________________________________________________________
    // Profildaten als Platzhalter in die Input-Felder einfügen
    //________________________________________________________
    
  const data = await loadData();

  if (data && data.user) {
    domInputFullName.placeholder = `${data.user.first_name} ${data.user.last_name}`;
    domInputEmail.placeholder = data.user.email;
  }

  //_________________________________________________________
  // Änderungen speichern
  //_________________________________________________________

  btnSave.addEventListener('click', async (event) => {
    event.preventDefault();
    const full_name = domInputFullName.value.trim();
    const email = domInputEmail.value.trim();
    const password = domInputPassword.value.trim();
    const passwordRepeat = domInputPasswordRepeat.value.trim();

    // Validierung
    if (password !== passwordRepeat) {
      alert("Die Passwörter stimmen nicht überein.");
      return;
    }

    if (!full_name || !email) {
      alert("Bitte vollständigen Namen und E-Mail angeben.");
      return;
    }

    const payload = {
      full_name,
      email,
      password
    };

    try {
      const response = await fetch('/api/profile/updateProfile.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.status === 'success') {
      window.location.href = "changes-saved.html";
      } else {
      alert(result.message || "Fehler beim Speichern.");
      }
    } catch (error) {
      console.error("Fehler beim Senden der Daten:", error);
      alert("Ein Fehler ist aufgetreten.");
    }
  });
})();
