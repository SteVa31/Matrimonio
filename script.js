// ✅ Countdown SOLO nella Home (index.html)
document.addEventListener("DOMContentLoaded", function () {
    if (document.getElementById('countdown')) { 
        function updateCountdown() {
            const weddingDate = new Date('July 31, 2025 16:00:00').getTime();
            const now = new Date().getTime();
            const gap = weddingDate - now;

            if (gap <= 0) {
                document.getElementById('countdown').innerText = "Il grande giorno è arrivato!";
                return;
            }

            const monthsEl = document.getElementById('months');
            const daysEl = document.getElementById('days');
            const hoursEl = document.getElementById('hours');
            const secondsEl = document.getElementById('seconds');

            if (monthsEl && daysEl && hoursEl && secondsEl) {
                const months = Math.floor(gap / (1000 * 60 * 60 * 24 * 30));
                const days = Math.floor((gap % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24));
                const hours = Math.floor((gap % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const seconds = Math.floor((gap % (1000 * 60)) / 1000);

                monthsEl.innerText = months;
                daysEl.innerText = days;
                hoursEl.innerText = hours;
                secondsEl.innerText = seconds % 10;
            }
        }

        setInterval(updateCountdown, 1000);
        updateCountdown();
    }
});

// ✅ Definiamo `setAttendance` in modo GLOBALE per evitare errori
function setAttendance(choice) {
    sessionStorage.setItem('attendance', choice);
    
    // Evidenzia il pulsante selezionato
    document.querySelectorAll('.btn').forEach(btn => btn.classList.remove('selected'));
    let selectedButton = document.querySelector(`button[onclick="setAttendance('${choice}')"]`);
    if (selectedButton) {
        selectedButton.classList.add('selected');
    }
}

// ✅ RSVP Form SOLO nella pagina RSVP (rsvp.html)
document.addEventListener("DOMContentLoaded", function () {
    if (document.getElementById('rsvpForm')) {
        let nomeInput = document.getElementById("nome");
        let cognomeInput = document.getElementById("cognome");
        let emailInput = document.getElementById("email");

        function checkInputs() {
            if (nomeInput.value.trim().length > 0 && cognomeInput.value.trim().length > 0) {
                emailInput.style.display = "block";
                emailInput.setAttribute("required", "true");
            } else {
                emailInput.style.display = "none";
                emailInput.removeAttribute("required");
            }
        }

        nomeInput.addEventListener("input", checkInputs);
        cognomeInput.addEventListener("input", checkInputs);

        document.getElementById('rsvpForm').addEventListener('submit', function (e) {
            e.preventDefault();

            let nome = nomeInput.value.trim();
            let cognome = cognomeInput.value.trim();
            let email = emailInput.value.trim();
            let partecipazione = sessionStorage.getItem("attendance") || "Non specificato";
            let preferenze = Array.from(document.querySelectorAll(".preferences input:checked"))
                .map(el => el.value).join(", ");

            if (!nome || !cognome || !email || partecipazione === "Non specificato") {
                alert("Inserisci tutti i dati: Nome, Cognome, Email e seleziona Sì o No!");
                return;
            }

            let dati = {
                nome: nome,
                cognome: cognome,
                email: email,
                partecipazione: partecipazione,
                preferenze: preferenze
            };

            console.log("Dati inviati:", dati);

            fetch("https://script.google.com/macros/s/AKfycbzxPah8CH--mFf3EZSx5MifYuoqLT_oPNLt8Rvfo-N5j5b6zYQmZbNGckgGrcP4Xb1E/exec", {
                method: "POST",
                mode: "no-cors",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dati)
            }).then(() => {
// ✅ Evita duplicazione del messaggio e lo rimuove dopo 3 secondi
                let messageContainer = document.getElementById("rsvpMessage");

                if (!messageContainer) {
                    messageContainer = document.createElement("p");
                    messageContainer.id = "rsvpMessage";
                    document.querySelector(".container").appendChild(messageContainer);
                }

                messageContainer.innerText = "Ci vediamo al matrimonio!";
                messageContainer.style.color = "#4CAF50";
                messageContainer.style.fontSize = "1.5em";
                messageContainer.style.marginTop = "20px";

                // Nasconde il messaggio dopo 3 secondi
                setTimeout(() => {
                    messageContainer.innerText = "";
                }, 3000);

                document.getElementById("rsvpForm").reset();
                sessionStorage.removeItem("attendance");
                document.querySelectorAll('.btn').forEach(btn => btn.classList.remove('selected'));
                emailInput.style.display = "none";
            }).catch(err => console.error("Errore nel fetch:", err));
        });
    }
});
