function getTodayDate() {
  const today = new Date();
  return today.toISOString().split("T")[0]; // YYYY-MM-DD
}

function escapeHTML(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}


function handleMoodClick(button, mood) {
  // Usuń .selected ze wszystkich
  document.querySelectorAll(".mood-options button").forEach(btn => btn.classList.remove("selected"));
  button.classList.add("selected");
}

function saveMood(mood) {
  const date = getTodayDate();
  const comment = document.getElementById("comment")?.value || "";

  const moods = JSON.parse(localStorage.getItem("moods")) || {};
  moods[date] = { mood, comment };
  localStorage.setItem("moods", JSON.stringify(moods));

  document.getElementById("status").textContent = `Zapisano: ${mood}`;
  showStats();

  // Feedback UI
  const buttons = document.querySelectorAll(".mood-options button");
  buttons.forEach(btn => btn.classList.remove("selected"));
  const clicked = Array.from(buttons).find(b => b.textContent === mood);
  if (clicked) clicked.classList.add("selected");

  // Czyść komentarz
  const textarea = document.getElementById("comment");
  if (textarea) textarea.value = "";
}

function showToday() {
  const today = getTodayDate();
  const el = document.getElementById("today");
  if (el) el.textContent = `Dziś: ${today}`;
}

function showHistory() {
  const container = document.getElementById("history");
  const moods = JSON.parse(localStorage.getItem("moods")) || {};
  if (!container) return;

  container.innerHTML = "";

  if (Object.keys(moods).length === 0) {
    container.textContent = "Brak zapisanych nastrojów.";
    return;
  }

  const entries = Object.entries(moods).sort().reverse();
  entries.forEach(([date, entry]) => {
    const div = document.createElement("div");
    div.className = "history-entry";
    div.innerHTML = `
      <strong>${date}</strong>: ${entry.mood}<br />
      <input type="text" value="${escapeHTML(entry.comment || "")}" data-date="${date}" class="comment-input" />
      <button onclick="updateComment('${date}')">💾 Zapisz komentarz</button>
      <button onclick="deleteEntry('${date}')">🗑️ Usuń</button>
    `;
    container.appendChild(div);
  });
}

function updateComment(date) {
  const moods = JSON.parse(localStorage.getItem("moods")) || {};
  const input = document.querySelector(`input[data-date="${date}"]`);
  if (input && moods[date]) {
    moods[date].comment = input.value;
    localStorage.setItem("moods", JSON.stringify(moods));
    alert("Komentarz zaktualizowany.");
  }
}

function deleteEntry(date) {
  const moods = JSON.parse(localStorage.getItem("moods")) || {};
  if (moods[date]) {
    if (confirm(`Czy na pewno chcesz usunąć wpis z ${date}?`)) {
      delete moods[date];
      localStorage.setItem("moods", JSON.stringify(moods));
      showHistory();
      showStats();
    }
  }
}

function showStats() {
  const statsContainer = document.getElementById("stats");
  if (!statsContainer) return;

  const moods = JSON.parse(localStorage.getItem("moods")) || {};
  const counts = { '😊': 0, '😐': 0, '😞': 0 };

  Object.values(moods).forEach(entry => {
    if (entry && counts[entry.mood] !== undefined) counts[entry.mood]++;
  });

  statsContainer.innerHTML = `
    😊: ${counts['😊']} &nbsp;|&nbsp;
    😐: ${counts['😐']} &nbsp;|&nbsp;
    😞: ${counts['😞']}
  `;
}

function renderCalendar() {
  const container = document.getElementById("calendar");
  if (!container) return;

  const moods = JSON.parse(localStorage.getItem("moods")) || {};
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const firstDay = new Date(year, month, 1).getDay(); // 0 = Niedziela
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarGrid = document.createElement("div");
  calendarGrid.style.display = "grid";
  calendarGrid.style.gridTemplateColumns = "repeat(7, 1fr)";
  calendarGrid.style.gap = "10px";
  calendarGrid.style.marginTop = "20px";

  const weekdays = ['Nd', 'Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb'];
  weekdays.forEach(day => {
    const cell = document.createElement("div");
    cell.textContent = day;
    cell.style.fontWeight = "bold";
    cell.style.textAlign = "center";
    calendarGrid.appendChild(cell);
  });

  const offset = firstDay === 0 ? 6 : firstDay - 1; // Zaczynamy od poniedziałku
  for (let i = 0; i < offset; i++) {
    const emptyCell = document.createElement("div");
    calendarGrid.appendChild(emptyCell);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const entry = moods[dateKey] || {};
    const cell = document.createElement("div");
    cell.style.border = "1px solid #ccc";
    cell.style.padding = "10px";
    cell.style.borderRadius = "6px";
    cell.style.textAlign = "center";
    cell.style.background = "#fafafa";
    cell.innerHTML = `
      <strong>${day}</strong><br>
      ${entry.mood || ''}<br>
      <small>${escapeHTML(entry.comment || '')}</small>
    `;
    calendarGrid.appendChild(cell);
  }

  container.appendChild(calendarGrid);
}

document.addEventListener("DOMContentLoaded", () => {
  showToday();
  showHistory();
  showStats();
  renderCalendar();
  // Globalna zmienna do przechowywania wybranego nastroju
let selectedMood = null;

// Nasłuchuj kliknięć na emoji
document.querySelectorAll(".mood-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    // Usuń zaznaczenie ze wszystkich
    document.querySelectorAll(".mood-btn").forEach(b => b.classList.remove("selected"));
    // Dodaj zaznaczenie do klikniętego
    btn.classList.add("selected");
    // Zapamiętaj wybrany nastrój
    selectedMood = btn.textContent;
    // Wyczyść status
    document.getElementById("status").textContent = "";
  });
});

// Obsługa submit formularza
document.getElementById("mood-form").addEventListener("submit", e => {
  e.preventDefault(); // blokuj odświeżenie strony

  if (!selectedMood) {
    alert("Wybierz nastrój przed wysłaniem!");
    return;
  }

  const comment = document.getElementById("comment").value.trim();
  const date = getTodayDate();

  // Pobierz lub stwórz obiekt nastrojów
  const moods = JSON.parse(localStorage.getItem("moods")) || {};

  // Zapisz aktualny nastrój z komentarzem
  moods[date] = { mood: selectedMood, comment };

  // Zapisz w localStorage
  localStorage.setItem("moods", JSON.stringify(moods));

  // Pokaż status
  document.getElementById("status").textContent = `Zapisano: ${selectedMood}`;

  // Wyczyść formularz i zaznaczenie
  document.getElementById("comment").value = "";
  document.querySelectorAll(".mood-btn").forEach(b => b.classList.remove("selected"));
  selectedMood = null;

  // Odśwież statystyki i historię (zakładam, że masz te funkcje)
  showStats();
  showHistory();
});

  
document.getElementById("mood-form")?.addEventListener("submit", function (e) {
  e.preventDefault();

  // Sprawdź, czy jakiś przycisk z klasą "selected" został kliknięty
  const selectedBtn = document.querySelector(".mood-options button.selected");

  if (!selectedBtn) {
    alert("Wybierz swój nastrój przed wysłaniem.");
    return;
  }

  const mood = selectedBtn.textContent;
  saveMood(mood); // Zapisz nastrój + komentarz

  // Wyczyść formularz i odznacz nastrój
  document.getElementById("comment").value = "";
  selectedBtn.classList.remove("selected");

  // Odśwież historię
  showHistory();
});



