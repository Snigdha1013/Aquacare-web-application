/* ══════════════════════════════════════════════════════
   AquaCare – sanitation.js
   Sanitation & Hygiene Tracker with daily checklist
   ══════════════════════════════════════════════════════ */

"use strict";

(function () {
  const AC = window.AquaCare;

  const CHECKLIST_ITEMS = [
    { id: "hw_morning",   title: "Morning Handwashing",        desc: "Washed hands with soap after waking up",                                pts: 10 },
    { id: "hw_toilet",    title: "Handwash After Toilet",      desc: "Washed hands with soap & water for 20+ seconds after toilet use",       pts: 15 },
    { id: "hw_food",      title: "Handwash Before Eating",     desc: "Washed hands before preparing or eating food",                          pts: 15 },
    { id: "safe_water",   title: "Safe Drinking Water",        desc: "Consumed only boiled, filtered, or treated water today",                pts: 15 },
    { id: "boil_filter",  title: "Water Treatment",            desc: "Boiled or filtered household water for drinking/cooking",               pts: 10 },
    { id: "food_hygiene", title: "Food & Utensil Hygiene",     desc: "Washed fruits/vegetables; used clean utensils",                         pts: 10 },
    { id: "waste_bin",    title: "Proper Waste Disposal",      desc: "Used a covered bin; no waste thrown near water sources",                pts: 10 },
    { id: "toilet_clean", title: "Clean Toilet/Latrine",       desc: "Toilet or latrine was clean and functional",                            pts: 10 },
    { id: "drain_clean",  title: "Clean Surroundings",         desc: "No stagnant water or open drains near home (mosquito prevention)",      pts: 10 },
    { id: "hw_evening",   title: "Evening Handwashing",        desc: "Washed hands before bed",                                              pts: 5  },
  ];

  const TOTAL_PTS = CHECKLIST_ITEMS.reduce((s, i) => s + i.pts, 0); // 110

  let checkedIds = new Set();

  function saveHygieneLogs(logs) { AC.lsSet(AC.LS_KEYS.HYGIENE, logs); }

  function getTodayHyg() {
    const logs = AC.lsGetHygieneLogs();
    return logs.find(h => h.date === AC.todayStr()) || null;
  }

  function calcScore() {
    const pts = CHECKLIST_ITEMS.filter(i => checkedIds.has(i.id)).reduce((s, i) => s + i.pts, 0);
    return Math.round((pts / TOTAL_PTS) * 100);
  }

  function updateScoreRing(score) {
    const circumference = 2 * Math.PI * 50; // r=50
    const dash = (score / 100) * circumference;
    document.getElementById("scoreCircle").setAttribute("stroke-dasharray", `${dash} ${circumference}`);
    document.getElementById("scoreText").textContent = `${score}%`;

    const label = document.getElementById("scoreLabel");
    if (score >= 90) { label.textContent = "🌟 Excellent hygiene today!"; label.className = "score-label text-success"; }
    else if (score >= 70) { label.textContent = "👍 Good job — almost there!"; label.className = "score-label"; }
    else if (score >= 40) { label.textContent = "💪 Keep going — check more habits!"; label.className = "score-label text-warning"; }
    else if (score > 0)   { label.textContent = "🔄 Just getting started…"; label.className = "score-label text-warning"; }
    else                  { label.textContent = "Start checking off habits!"; label.className = "score-label text-muted"; }
  }

  function renderChecklist() {
    const container = document.getElementById("hygieneChecklist");
    container.innerHTML = CHECKLIST_ITEMS.map(item => `
      <div class="checklist-item ${checkedIds.has(item.id) ? "checked" : ""}" data-id="${item.id}" role="checkbox" aria-checked="${checkedIds.has(item.id)}" tabindex="0">
        <div class="checklist-cb" aria-hidden="true"></div>
        <div class="checklist-text">
          <div class="checklist-title">${item.title}</div>
          <div class="checklist-desc">${item.desc}</div>
        </div>
        <span class="checklist-pts">+${item.pts}pts</span>
      </div>`).join("");

    container.querySelectorAll(".checklist-item").forEach(el => {
      const toggle = () => {
        const id = el.dataset.id;
        if (checkedIds.has(id)) { checkedIds.delete(id); el.classList.remove("checked"); el.setAttribute("aria-checked", "false"); }
        else { checkedIds.add(id); el.classList.add("checked"); el.setAttribute("aria-checked", "true"); }
        updateScoreRing(calcScore());
      };
      el.addEventListener("click", toggle);
      el.addEventListener("keydown", e => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); toggle(); } });
    });
  }

  function renderHistory() {
    const container = document.getElementById("hygieneHistory");
    const logs = AC.lsGetHygieneLogs().slice().reverse().slice(0, 14);

    if (!logs.length) {
      container.innerHTML = `<p class="empty-state">No history yet. Save today's score!</p>`;
      return;
    }

    container.innerHTML = logs.map(h => {
      const color = h.score >= 80 ? "var(--green)" : h.score >= 50 ? "var(--yellow)" : "var(--red)";
      return `<div class="hh-item">
        <span class="hh-date">${h.date === AC.todayStr() ? "Today" : AC.formatDate(h.date)}</span>
        <div style="display:flex;align-items:center;gap:0.75rem;">
          <div style="background:var(--border-soft);border-radius:999px;width:80px;height:8px;overflow:hidden;">
            <div style="width:${h.score}%;height:100%;background:${color};border-radius:999px;"></div>
          </div>
          <span class="hh-score" style="color:${color}">${h.score}%</span>
        </div>
      </div>`;
    }).join("");
  }

  function initSanitation() {
    const saveBtn = document.getElementById("saveHygieneBtn");

    // Load today's saved state if any
    const todayHyg = getTodayHyg();
    if (todayHyg && todayHyg.checked) {
      checkedIds = new Set(todayHyg.checked);
    }

    renderChecklist();
    updateScoreRing(calcScore());
    renderHistory();

    saveBtn.addEventListener("click", () => {
      const score = calcScore();
      const logs = AC.lsGetHygieneLogs().filter(h => h.date !== AC.todayStr());
      logs.push({ date: AC.todayStr(), score, checked: Array.from(checkedIds), ts: Date.now() });
      saveHygieneLogs(logs);
      AC.refreshDashboard();
      renderHistory();
      AC.showToast(`Hygiene score saved: ${score}% 🧼`, score >= 70 ? "success" : "info");
    });
  }

  document.addEventListener("DOMContentLoaded", initSanitation);
})();
