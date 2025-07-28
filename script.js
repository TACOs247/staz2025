let selectedMood = null;

function getTodayDate() {
  const today = new Date();
  return today.toISOString().split("T")[0]; // YYYY-MM-DD
}

function selectMood(mood) {
  selectedMood = mood;
  document.getElementById("status").textContent = `Wybrano: ${mood}`;
}

function submitMood() {
  if (!selectedMood) {
    alert("Wybierz nastrój!");
    return;
  }

  const comment = document.getElementById("comment").value;
  const date = getTodayDate();
  const moodData = JSON.parse(localStorage.getItem("moods") || "{}");

  moodData[date] = {
    mood: selectedMood,
    comment: comment
  };

  localStorage.setItem("moods", JSON.stringify(moodData));
  document.getElementById("status").textContent = `Zapisano nastrój: ${selectedMood}`;
  document.getElementById("comment").value = "";
  selectedMood = null;
  showStats();
}

function showStats() {
  const stats = document.getElementById("stats");
  if (!stats) return;

  const moodData = JSON.parse(localStorage.getItem("moods") || "{}");
  const counts = { '😊': 0, '😐': 0, '😞': 0 };

  Object.values(moodData).forEach(entry => {
    if (entry && entry.mood && counts[entry.mood] !== undefined) {
      counts[entry.mood]++;
    }
  });

  stats.innerHTML = `
    😊: ${counts['😊']}<br>
    😐: ${counts['😐']}<br>
    😞: ${counts['😞']}
  `;
}

function showToday() {
  const today = getTodayDate();
  const todayElement = document.getElementById("today");
  if (todayElement) todayElement.textContent = `Dziś: ${today}`;
}

document.addEventListener("DOMContentLoaded", () => {
  showToday();
  showStats();
});


  
