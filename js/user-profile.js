async function loadData() {
  const url = '/api/user-profile.php'; // mit korrekter API-URL ersetzen
  try {
      const response = await fetch(url);
      return await response.json();
  } catch (error) {
      console.error(error);
      return false;
  }
}

const data = await loadData();
console.log(data); // gibt die Daten der API oder false in der Konsole aus

const domfirstName = document.querySelector('#firstName');
const domlastName = document.querySelector('#lastName');

domfirstName.innerHTML = data.user.first_name;
domlastName.innerHTML = data.user.last_name;