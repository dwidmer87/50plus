# Sicher-Hei+ – Begleitungsplattform

**Sicher-Hei+** ist eine Web-App, die Menschen (insbesondere über 50) dabei unterstützt, Begleitungen für verschiedene Anlässe zu finden oder selbst Begleitung anzubieten. Die Plattform bringt Suchende und Anbietende per Matching zusammen. Dieses readme beschreibt die Weiterentwicklung des Grundgerüsts aus IM4.

---

## neue Funktionen / Updates

### 1. Registrierungsprozess

- **verifizierte Registrierung:**
  Nutzer:innen registrieren sich mit einer gültigen E-Mail-Adresse in einem zweistufigen Verfahren mittels Token. Der generierte Token wird mit der Mailvorlage kombiniert, das Mail via PHPMailer versandt. Die User senden den Token via Link zurück an die Datenbank und verifizieren so ihre Mail-Adresse.
  *HTML:* [`registration/register.html`] / [`registration/confirm.html`]
  *JS:* [`registration/register.js`] / [`registration/confirm.js`]
  *PHP:* [`api/register/request.php`] / [`api/register/confirm.php`]
  *PHP-Mailer:* [`system/PHPMailer`]
  *Mail-Vorlage:* [registration/templates/registration-mail.html]

- **Sperrung von Trash-Mail-Adressen:**
  Mit einer Wegwerf-Mail-Adresse kann auf "Sicher-Hei+" kein Account erstellt werden. Die Datenbank "trashmail_domains", die manuell mit bekannten Wegwerf-Domains befüllt wird, sorgt dafür.
  *PHP:* [api/register/readTrashmail.php]

### 2. Funktion zum Zurücksetzen des Passworts
  Wer sein Passwort vergessen hat, kann sich per Mail-Verifizierung ein neues setzen. Der zweistufige Prozess ist ähnlich wie die Registrierung aufgebaut. Zusätzlich wird aber in der Datenbank "users" überprüft, ob der User überhaupt existiert.
  *HTML:* [`passwordreset/passwordreset.html`] / [`passwordreset/newpassword.html`]
  *JS:* [`passwordreset/passwordreset.js`] / [`passwordreset/newpassword.js`]
  *PHP:* [`api/passwordreset/resetRequest.php`] / [`api/passwordreset/resetConfirm.php`]
  *PHP-Mailer:* [`system/PHPMailer`]
  *Mail-Vorlage:* [passwordreset/templates/passwordreset-mail.html]

### 3. verifizierte Kontakte

  - **Kontakte hinzufügen und einsehen:**
  Die User erstellen sich eine Kontaktliste und unterscheiden dabei, von welchen Personen sie begleitet werden und für welche sie als Begleiter:innen in Frage kommen. Der "Contact-Adding-Prozess" wird immer von der Person gestartet, die sich begleiten lassen will. Dafür lässt sie einen 6-stelligen Code generieren, den sie auf ihrem bevorzugten Weg ihrer neuen Begleitperson ("protector") zukommen lässt. Diese wiederum verifiziert sich mit dem korrekten Code als neue Begleitung. Auf der persönlichen Kontaktseite ist ersichtlich, wen die User begleiten und von wem sie begleitet werden.
  *HTML:* [`contact.html`] / [`add-contact.html`] / [`newcontact.html`] / [`add-protector.html`] / [`add-protected.html`]
  *JS:* [`js/contact.js`] / [`js/add-protector.js`] / [`js/add-protected.js`]
  *PHP:* [api/contacts/createContact.php] / [api/contacts/readContact.php] / [api/contacts/updateContact.php]

  - **Update Matching-Prozess:**
  Der Matching-Prozess aus der Basisversion erfuhr ein Update: Neu können sich nur noch gegenseitig verifizierte Personen begleiten (gemäss obenstehender Logik). Dafür wurde der Matching eingeschränkt. Die PHP-Files "readOfferAll.php" und "readRequestAll.php" sind nun strenggenommen falsch benannt, da sie nicht mehr ALLE Angebote, bzw. Anfragen lesen, sondern nur noch jene von verifizierten Kontakten. Dies wurde mittels eines "INNER JOINs" erreicht.
  *PHP:* [api/requests_offers/readOfferAll.php] --> Zeilen 14-31 / [api/requests_offers/readRequestAll.php] --> Zeilen 14-32

## Learnings
tbd

**Demo:**  
Starte mit [`index.html`](index.html) und folge dem Login-Prozess.