// ==========================================
//  COUNTDOWN  (solo su index.html)
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("countdown")) {
      function updateCountdown() {
        const weddingDate = new Date("July 31, 2025 16:00:00").getTime();
        const now         = Date.now();
        const gap         = weddingDate - now;
  
        if (gap <= 0) {
          document.getElementById("countdown").innerText =
            "Il grande giorno è arrivato!";
          return;
        }
  
        const monthsEl  = document.getElementById("months");
        const daysEl    = document.getElementById("days");
        const hoursEl   = document.getElementById("hours");
        const secondsEl = document.getElementById("seconds");
  
        if (monthsEl && daysEl && hoursEl && secondsEl) {
          const months  = Math.floor(gap / (1000 * 60 * 60 * 24 * 30));
          const days    = Math.floor((gap % (1000 * 60 * 60 * 24 * 30)) /
                                     (1000 * 60 * 60 * 24));
          const hours   = Math.floor((gap % (1000 * 60 * 60 * 24)) /
                                     (1000 * 60 * 60));
          const seconds = Math.floor((gap % (1000 * 60)) / 1000);
  
          monthsEl.innerText  = months;
          daysEl.innerText    = days;
          hoursEl.innerText   = hours;
          secondsEl.innerText = seconds % 10;
        }
      }
  
      updateCountdown();
      setInterval(updateCountdown, 1000);
    }
  });
  
  // ==========================================
  //  SELEZIONE PARTECIPAZIONE (globale)
  // ==========================================
  function setAttendance(choice) {
    sessionStorage.setItem("attendance", choice);
  
    document.querySelectorAll(".btn").forEach((btn) =>
      btn.classList.remove("selected")
    );
    const selected = document.querySelector(
      `button[onclick="setAttendance('${choice}')"]`
    );
    if (selected) selected.classList.add("selected");
  }
  
  // ==========================================
  //  TOAST di conferma
  //  (richiede in CSS il blocco #toastRSVP + #toastRSVP.show)
  // ==========================================
  function showToast(msg) {
    let toast = document.getElementById("toastRSVP");
  
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "toastRSVP";
      document.body.appendChild(toast);
    }
  
    toast.textContent = msg;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 3000);
  }
  
  // ==========================================
  //  RSVP  (solo su rsvp.html)
  // ==========================================
  document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("rsvpForm");
    if (!form) return; // siamo su un’altra pagina
  
    // ripristina scelta Sì/No se già salvata
    const saved = sessionStorage.getItem("attendance");
    if (saved) {
      const btn = document.querySelector(
        `button[onclick="setAttendance('${saved}')"]`
      );
      if (btn) btn.classList.add("selected");
    }
  
    // input di base
    const nome    = document.getElementById("nome");
    const cognome = document.getElementById("cognome");
    const email   = document.getElementById("email");
    const altro   = document.getElementById("altro");
  
    function toggleEmail() {
      const ok = nome.value.trim() && cognome.value.trim();
      email.style.display = ok ? "block" : "none";
      ok ? email.setAttribute("required", "true")
         : email.removeAttribute("required");
    }
    nome.addEventListener("input", toggleEmail);
    cognome.addEventListener("input", toggleEmail);
  
    // “Nessuna” vs altre preferenze (mutua esclusione)
    const prefInputs = document.querySelectorAll(".preferences input");
    prefInputs.forEach((cb) =>
      cb.addEventListener("change", function () {
        if (this.value === "Nessuna" && this.checked) {
          prefInputs.forEach((o) => {
            if (o.value !== "Nessuna") o.checked = false;
          });
        }
        if (this.value !== "Nessuna" && this.checked) {
          document.querySelector(
            '.preferences input[value="Nessuna"]'
          ).checked = false;
        }
      })
    );
  
    // submit
    form.addEventListener("submit", (e) => {
      e.preventDefault();
  
      const partecipazione =
        sessionStorage.getItem("attendance") || "Non specificato";
  
      let preferenze = Array.from(
        document.querySelectorAll(".preferences input:checked")
      )
        .map((el) => el.value)
        .join(", ");
      const altroVal = altro.value.trim();
      if (altroVal) preferenze += (preferenze ? ", " : "") + altroVal;
  
      // validazione minima
      if (
        !nome.value.trim() ||
        !cognome.value.trim() ||
        !email.value.trim() ||
        partecipazione === "Non specificato"
      ) {
        alert(
          "Inserisci tutti i dati: Nome, Cognome, Email e seleziona Sì o No!"
        );
        return;
      }
  
      const dati = {
        nome: nome.value.trim(),
        cognome: cognome.value.trim(),
        email: email.value.trim(),
        partecipazione,
        preferenze,
      };
      console.log("Dati inviati:", dati);
  
      fetch(
        "https://script.google.com/macros/s/AKfycbzxPah8CH--mFf3EZSx5MifYuoqLT_oPNLt8Rvfo-N5j5b6zYQmZbNGckgGrcP4Xb1E/exec",
        {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dati),
        }
      )
        .then(() => {
          // toast di conferma
          showToast(
            partecipazione === "Si"
              ? "-`♡´- Ci vediamo al matrimonio!"
              : "💌 Peccato, ci mancherai!"
          );
  
          // reset form & UI
          form.reset();
          email.style.display = "none";
          document
            .querySelectorAll(".btn")
            .forEach((btn) => btn.classList.remove("selected"));
          form
            .querySelector('button[type="submit"]')
            .classList.add("sent");
        })
        .catch((err) => console.error("Errore nel fetch:", err));
    });
  });
  