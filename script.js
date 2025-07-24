function getTodayDate() {
    const today = new Date();
    return today.toISOString().split("T")[0]; // YYYY-MM-DD
  }
  
  function saveMood(mood) {
    const date = getTodayDate();
    let moods = JSON.parse(localStorage.getItem("moods")) || {};
    moods[date] = mood;
    localStorage.setItem("moods", JSON.stringify(moods));
    document.getElementById("status").textContent = `Zapisano: ${mood}`;
    showStats(); // odśwież statystyki
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
  
    if (Object.keys(moods).length === 0) {
      container.textContent = "Brak zapisanych nastrojów.";
      return;
    }
  
    const entries = Object.entries(moods).sort().reverse();
    entries.forEach(([date, mood]) => {
      const div = document.createElement("div");
      div.className = "history-entry";
      div.textContent = `${date}: ${mood}`;
      container.appendChild(div);
    });
  }
  
  function showStats() {
    const statsContainer = document.getElementById("stats");
    if (!statsContainer) return;
  
    const moods = JSON.parse(localStorage.getItem("moods")) || {};
    const counts = { '😊': 0, '😐': 0, '😞': 0 };
  
    Object.values(moods).forEach(mood => {
      if (counts[mood] !== undefined) counts[mood]++;
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
  
    const firstDay = new Date(year, month, 1).getDay(); // 0-6
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
  
    // Puste komórki przed pierwszym dniem
    for (let i = 0; i < firstDay; i++) {
      const emptyCell = document.createElement("div");
      calendarGrid.appendChild(emptyCell);
    }
  
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const mood = moods[dateKey] || '';
      const cell = document.createElement("div");
      cell.style.border = "1px solid #ccc";
      cell.style.padding = "10px";
      cell.style.borderRadius = "6px";
      cell.style.textAlign = "center";
      cell.style.background = "#fafafa";
      cell.innerHTML = `<strong>${day}</strong><br>${mood}`;
      calendarGrid.appendChild(cell);
    }
  
    container.appendChild(calendarGrid);
  }
  
  // Uruchom odpowiednie funkcje w zależności od strony
  document.addEventListener("DOMContentLoaded", () => {
    showToday();
    showHistory();
    showStats();
    renderCalendar();
  });