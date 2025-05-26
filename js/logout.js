// logout.js

async function logout() {
  try {
    const res = await fetch('/logout.php', { method: 'POST', credentials: 'include' });
    const data = await res.json();
    if (data.status === 'success') {
      window.location.href = 'logout.html';
    } else {
      console.error("Logout failed");
      alert("Logout failed. Please try again.");
    }
  } catch (error) {
    console.error("Logout error:", error);
    alert("Something went wrong during logout!");
  }
}

document.getElementById("logoutBtn").addEventListener("click", (e) => {
  e.preventDefault();
  logout();
});
