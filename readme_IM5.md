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

  - **Kontakte hinzufügen, einsehen und löschen:**
  Die User erstellen sich eine Kontaktliste und unterscheiden dabei, von welchen Personen sie begleitet werden und für welche sie als Begleiter:innen in Frage kommen. Der "Contact-Adding-Prozess" wird immer von der Person gestartet, die sich begleiten lassen will. Dafür lässt sie einen 6-stelligen Code generieren, den sie auf ihrem bevorzugten Weg ihrer neuen Begleitperson ("protector") zukommen lässt. Diese wiederum verifiziert sich mit dem korrekten Code als neue Begleitung. Auf der persönlichen Kontaktseite ist ersichtlich, wen die User begleiten und von wem sie begleitet werden. Die Namen auf der Liste sind klickbar. Ein Popup zeigt an, wie lange der Kontakt schon besteht und ein Button dient zum löschen des Kontakts.
  *HTML:* [`contact.html`] / [`add-contact.html`] / [`newcontact.html`] / [`add-protector.html`] / [`add-protected.html`]
  *JS:* [`js/contact.js`] / [`js/add-protector.js`] / [`js/add-protected.js`]
  *PHP:* [api/contacts/createContact.php] / [api/contacts/readContact.php] / [api/contacts/updateContact.php] / [api/contacts/deleteContact.php]

  - **Update Matching-Prozess:**
  Der Matching-Prozess aus der Basisversion erfuhr ein Update: Neu können sich nur noch gegenseitig verifizierte Personen begleiten (gemäss obenstehender Logik). Dafür wurde der Matching eingeschränkt. Die PHP-Files "readOfferAll.php" und "readRequestAll.php" sind nun strenggenommen falsch benannt, da sie nicht mehr ALLE Angebote, bzw. Anfragen lesen, sondern nur noch jene von verifizierten Kontakten. Dies wurde mittels eines "INNER JOINs" erreicht.
  *PHP:* [api/requests_offers/readOfferAll.php] --> Zeilen 14-31 / [api/requests_offers/readRequestAll.php] --> Zeilen 14-32

## Weiterentwicklung
Das Update der Web-App "Sicher-Hei+" sorgt nun dafür, dass alle Funktionen der Ursprungs-Idee umgesetzt sind. Der nächste technische Entwicklungsschritt wäre, die Web-App so erscheinen zu lassen, dass sie eher wie eine App wirkt. Dies würde erreicht, indem alle html-pages mit Vanilla JS dynamisch in die Basis-Page geladen würden. So, wie das mit dem Footer bereits der Fall ist. Diese Weiterentwicklung würde auf einer anderen Domain passieren, um die bestehende Version der Web-App nicht zu zerstören. Herausforderungen dabei wären, dass die verschiedenen Verlinkungen weiterhin zuverlässig funktionieren und dass Funktionalität / Sicherheit immer gewährleistet ist, d. h. dass das aktuelle Session-Management nicht zerstört wird.
Mögliche inhaltliche Weiterentwicklungen würden sich in einem Live-Testing zeigen.

## Learnings
Die Weiterentwicklung der WebApp "Sicher-Hei+" war ein spannender, intensiver Prozess, bei dem ich Einiges lernen durfte. Ich nehme mit:

  - **automatisierter Mailversand:**
  Automatisiert Mails zu versenden via PHP-Mailer ist eine einfache Sache, solange einem die Darstellung der Mails am Arsch vorbei geht und man sich auf Mails in Text-Version beschränkt. Ich wollte jedoch professionell aussehnde Mails und erstellte dafür ein Mail-Template als HTML. Die korrekte Darstellung des Mails in den verschiedenen Clients stellte aber eine grosse Herausforderung dar. Ich habe gelernt, dass ich die gesamte Darstellung inline stylen muss, da die Mail-Clients nicht auf irgendwelche CSS-Files in der weiten Welt des Internets zugreifen. In meinem Fall testete ich den Mailversand mit meiner persönlichen Mail-Adresse und den von mir verwendeten Clients (Outlook online / Android / Outlook classic). Die Darstellung im Outlook-Classic-Client entpuppte sich als richtiger Pain mit der Folge, dass das Mailtemplate mit diversem "Exeption-Code" ausgestattet ist (<!--[if mso]> / <![endif]-->). Vorallem die korrekte Positionierung von Boxen und Bildern nahm viele Stunden in Anspruch. Teilweise handelte es sich um einen Versatz von wenigen Pixeln, aber eben sichtbar und damit störend.

  - **Update Matching-Prozess:**
  Es war spannend für mich zu entdecken, dass das Update nach korrekter Implementation des neuen Kontakte-Managements mit wenigen Zeilen zusätzlichem Code abgeschlossen war. Ein INNER JOIN in den richtigen PHP-Files und das ganze war erledigt. Ein gutes Beispiel dafür, wobei ich nich auf AI (siehe unten) setzen musste. Als Entwickler der Basisversion wusste ich selber relativ gut, welches File wofür zuständig ist. Dies korrekt und klar genug zu prompten wäre wahrscheinlich aufwändiger gewesen, als einmal auf die HI zurückzugreifen ;-).

  - **AI-Einsatz:**
  Ich nutzte Copilot im VSCode und ChatGPT für mein Projekt. Haupteinsatz der künstlichen Intelligenz war das Debugging. Häufig nahm ich für neue Funktionen ein bestehendes PHP, JS, HTML und editierte es, sodass es als Basisversion für die neue Funktion dienen konnten. Danach arbeitete ich mit der künstlichen Intelligenz zusammen, um Details (und wo steckt der Teufel...?) zu fixen. Mit klaren Prompts und gutem Debugging (z.B. via Konsolenoutputs) war dies eine sehr gelungene Zusammenarbeit.

**Demo:**  
Starte mit [`index.html`](index.html) und folge dem Login-Prozess.