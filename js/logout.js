// logout.js

async function logout() {
  try {
    const res = await fetch('/logout.php', { method: 'POST', credentials: 'include' });
    const data = await res.json();
    if (data.status === 'success') {
      window.location.href = 'logout.html';
    } else {
      console.error("Logout failed");
      alert("Logout fehlgeschlagen. Versuchen Sie es erneut.");
    }
  } catch (error) {
    console.error("Logout error:", error);
    alert("Während des Logout-Vorgangs ist ein Fehler aufgetreten!");
  }
}

document.getElementById("logoutBtn").addEventListener("click", (e) => {
  e.preventDefault();
  logout();
});
