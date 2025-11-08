# Sicher-Hei+ – Begleitungsplattform

**Sicher-Hei+** ist eine Web-App, die Menschen (insbesondere über 50) dabei unterstützt, Begleitungen für verschiedene Anlässe zu finden oder selbst Begleitung anzubieten. Die Plattform bringt Suchende und Anbietende per Matching zusammen.

---

## Hauptfunktionen

### 1. Registrierung & Login

- **Registrierung:**  
  Nutzer:innen können sich mit Vor- und Nachnamen, E-Mail und Passwort registrieren.  
  *HTML:* [`register.html`](register.html)  
  *JS:* [`js/register.js`](js/register.js)  
  *PHP:* [`api/profile/register.php`](api/profile/register.php)

- **Login & Logout:**  
  Authentifizierung erfolgt per Session.  
  *HTML:* [`login.html`](login.html), [`logout.html`](logout.html)  
  *JS:* [`js/login.js`](js/login.js), [`js/logout.js`](js/logout.js)  
  *PHP:* [`api/login.php`](api/login.php), [`api/logout.php`](api/logout.php)

---

### 2. Profilverwaltung

- **Profil anzeigen & bearbeiten:**  
  Nutzer:innen können Name, E-Mail und Passwort ändern.  
  *HTML:* [`user-profile.html`](user-profile.html)  
  *JS:* [`js/user-profile.js`](js/user-profile.js)  
  *PHP:* [`api/profile/readProfile.php`](api/profile/readProfile.php), [`api/profile/updateProfile.php`](api/profile/updateProfile.php)

---

### 3. Begleitung anfragen & anbieten

- **Anfrage stellen:**  
  Nutzer:innen geben Startzeit, Dauer, Abhol- und Zielort, gewünschtes Verkehrsmittel und Zahlungsbereitschaft an. Abhol- und Zielort werden dabei manuell eingegeben. Die Zahlungsbereitschaft erfolgt nach dem true/false-Schema.
  *HTML:* [`request.html`](request.html)  
  *JS:* [`js/request.js`](js/request.js)  
  *PHP:* [`api/requests_offers/createRequest.php`](api/requests_offers/createRequest.php)

- **Angebot erstellen:**  
  Nutzer:innen geben zeitliche Verfügbarkeit, Standort (manuelle Eingabe), Verkehrsmittel und ggf. Kosten an.
  *HTML:* [`offer.html`](offer.html)  
  *JS:* [`js/offer.js`](js/offer.js)  
  *PHP:* [`api/requests_offers/createOffer.php`](api/requests_offers/createOffer.php)

---

### 4. Matching & Kommunikation

- **Automatisches Matching:**  
  Die App gleicht Anfragen und Angebote nach Zeit, Ort, Verkehrsmittel und Zahlungsbereitschaft ab.

  Matching bei Anfragen:
  *JS:* [`js/offers-available.js`](js/offers-available.js)
  *PHP:* [`api/requests_offers/readOfferUser.php] (api/requests_offers/readOfferUser.php) in Kombination mit [`api/requests_offers/readRequestAll.php] (api/requests_offers/readOfferUser.php)

  Matching bei Angeboten:
  *JS:* [`js/requests-available.js`](js/requests-available.js) 
  *PHP:* [`api/requests_offers/readRequestUser.php`](api/requests_offers/readRequestUser.php) in Kombination mit [`api/requests_offers/readOfferAll.php`](api/requests_offers/readOfferAll.php)
  
  Datenbankeintrag für Match (nur neue Matches):
  [`api/matches_activities/createMatch.php`](api/matches_activities/createMatch.php)

- **Antworten & Status:**  
  Nutzer:innen können Matches annehmen oder ablehnen. Statusänderungen werden gespeichert.  
  *JS:* [`js/offers-available.js`](js/offers-available.js), [`js/requests-available.js`](js/requests-available.js)
  *PHP:* [`api/matches_activities/updateMatch.php`](api/matches_activities/updateMatch.php)

---

### 5. Aktivitätenübersicht

- **Letzte Aktivitäten:**  
  Auf der Startseite werden die letzten Matches und deren Status angezeigt.  
  *HTML:* [`home.html`](home.html)  
  *JS:* [`js/home.js`](js/home.js)  
  *PHP:* [`api/matches_activities/readActivity.php`](api/matches_activities/readActivity.php)

---

## Datenbankstruktur

- Nutzerverwaltung:
  `users` (E-Mail und gehashtes PW), `user_profiles` (Vor-und Nachname)
- Anfragen & Angebote:  
  `requests_offers`
- Matches & Aktivitäten:  
  `matches_activities`

Siehe [system/db.sql](system/db.sql) für das Grundschema.

---

## Weitere Hinweise

- **Frontend:** HTML/CSS, Vanilla JS  
- **Backend:** PHP (REST-API), MySQL  
- **Session-Handling:** PHP-Session  
- **Dynamische Navigation:** Footer wird per JS geladen ([`js/footer.js`](js/footer.js))

---

## Beispielablauf

1. Nutzer:in registriert sich und loggt ein.
2. Stellt eine Anfrage oder bietet Begleitung an.
3. System sucht passende Matches.
4. Beide Seiten können das Match annehmen oder ablehnen.
5. Aktivitäten werden im Dashboard angezeigt.

---

## Weiterentwicklung
Diese WebApp stellt die Grundfunktionen für Matches zur Verfügung und dient sozusagen als Basis für eine spätere Vollfunktion. In diese sollen folgende Funktionen integriert werden:

- Registrierung und Passwort vergessen:
Ein neues Konto kann nur via verifizierte E-Mail angelegt werden. Dafür wird vollautomatisch ein Verification-PIN an die angegebene Adresse geschickt. Dasselbe bei vergessenem Passwort.

- Kontaktverwaltung:
Matches entstehen nur zu verifizierten Kontakten. Nur eine Person, die via Verification-PIN zu den Kontakten der begeleiteten Person hinzugefügt wurde, erscheint in den Angeboten als mögliche:r Begleiter:in. Dafür wird eine weitere Datenbank "contacts" implementiert. Kontakte werden in einer Liste als "Ich werde begleitet von" und "Ich begleite" angezeigt und können selbstverständlich auch entfernt werden.

- Benachrichtigungen: Gibt es ein neues Angebot auf eine Begleitanfrage, wird der betreffende User benachrichtigt.

---

## Learnings
Die Entwicklung der WebApp "Sicher-Hei+" war ein spannender, intensiver Prozess, bei dem ich Einiges lernen durfte. Ich nehme mit:
- CRUD-Bausteine: Ein PHP für "Delete" kam zwar nicht zum Einsatz, die anderen drei dafür gleich in unterschiedlichen Varianten. Erst im Entwicklungsprozess wurde mir klar, dass es beispielsweise für die Datenbank "requests_offers" verschiedene "Reads" braucht, in meinem Fall readOfferAll.php, readOfferUser.php, readRequestAll.php und readRequestUser.php.
- Arbeit mit ChatGPT und Copilot: Die KI-Tool waren entscheidend, dass ich das Projekt finalisieren konnte. Ich habe penibel darauf geachtet, mein Anliegen oder eine gewünschte Funktion jeweils so detailliert wie möglich zu schildern, um damit einen Code zu erhalten, der das macht, was er soll. Häufig waren noch ein paar Zusatzschlaufen nötig, bei denen Bugs bereinigt wurden, aber am Ende hatte ich einen funktionierenden Code. Mir war dabei wichtig, den Code zu verstehen und ich liess mir Zeilen, bei denen dies nicht der Fall war, von der KI erklären. Etwas Interessantes konnte ich bei der Arbeit an offer.js und request.js feststellen: Obwohl die beiden Scripts plusminus dasselbe machen baute sie die KI komplett anders auf. Zwecks Wartbarkeit brachte ich die beiden Scripts deshalb im Nachhinien noch in einen analogen Aufbau.

**Demo:**  
Starte mit [`index.html`](index.html) und folge dem Login-Prozess.