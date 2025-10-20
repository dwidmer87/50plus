//____________________________________________________________
// Verification Code laden und anzeigen
//____________________________________________________________

async function loadVerificationCode() {
  const url = '/api/contacts/createContact.php';

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include' // wichtig, damit die Session mitgesendet wird!
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    if (data.success && data.user && data.user.verification_code) {
      // Den Code in das HTML-Element schreiben
      document.getElementById('verification_code_box').textContent =
        data.user.verification_code;
    } else {
      throw new Error('Kein gültiger Verification Code erhalten.');
    }
  } catch (error) {
    console.error('Fehler beim Laden des Verification Codes:', error);
    document.getElementById('verification_code_box').textContent = 'Fehler';
  }
}

//____________________________________________________________
// Beim Laden der Seite ausführen
//____________________________________________________________
document.addEventListener('DOMContentLoaded', loadVerificationCode);
