/* ══════════════════════════════════════════════════════
   AquaCare – tracker.js
   Household Water Usage Tracker
   ══════════════════════════════════════════════════════ */

"use strict";

(function () {
  const AC = window.AquaCare;

  const REMINDERS = [
    { activity: "washing", threshold: 100, icon: "🚿", msg: "Shower usage is high. Try a 4-minute shower — save up to 40L per wash." },
    { activity: "gardening", threshold: 50, icon: "🌱", msg: "Gardening use is significant. Consider drip irrigation or watering at dusk to reduce evaporation." },
    { activity: "toilet", threshold: 60, icon: "🚽", msg: "Toilet flushing accounts for a large share. Installing a dual-flush cistern can halve water use." },
    { activity: "laundry", threshold: 80, icon: "👕", msg: "Laundry water use is high. Only run full loads and use a front-loading machine if possible (uses 40% less water)." },
    { activity: "cooking", threshold: 30, icon: "🍳", msg: "Cooking water use is notable. Reuse vegetable boiling water for plants — it contains nutrients!" },
  ];

  function saveLogs(logs) { AC.lsSet(AC.LS_KEYS.USAGE, logs); }

  function getTodayLogs() {
    return AC.lsGetUsageLogs().filter(l => l.date === AC.todayStr());
  }

  function getTodayTotal() {
    return getTodayLogs().reduce((s, l) => s + l.amount, 0);
  }

  function renderTodayLog() {
    const list  = document.getElementById("todayLogList");
    const total = document.getElementById("todayTotal");
    const logs  = getTodayLogs();

    if (!logs.length) {
      list.innerHTML = `<p class="empty-state">No logs for today yet. Start tracking above! 💧</p>`;
    } else {
      list.innerHTML = logs.map((log, i) => `
        <div class="log-item">
          <div class="log-item-left">
            <span class="log-item-icon">${AC.ACTIVITY_ICONS[log.activity] || "📦"}</span>
            <div>
              <span>${AC.ACTIVITY_LABELS[log.activity] || log.activity}</span>
              ${log.note ? `<span class="text-muted" style="font-size:0.78rem;display:block;">${log.note}</span>` : ""}
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:0.5rem;">
            <span class="log-item-amount">${log.amount.toFixed(1)} L</span>
            <button class="log-item-delete" data-allindex="${i}" title="Delete">🗑️</button>
          </div>
        </div>`).join("");

      // Wire delete buttons using the real index in all-logs array
      list.querySelectorAll(".log-item-delete").forEach(btn => {
        btn.addEventListener("click", () => {
          const allLogs = AC.lsGetUsageLogs();
          const todayLogs = allLogs.filter(l => l.date === AC.todayStr());
          const todayIdx  = parseInt(btn.dataset.allindex);
          const target    = todayLogs[todayIdx];
          if (!target) return;
          // Find and remove from allLogs
          const spliceIdx = allLogs.findIndex(l => l === target || (l.date === target.date && l.ts === target.ts));
          if (spliceIdx !== -1) allLogs.splice(spliceIdx, 1);
          saveLogs(allLogs);
          renderAll();
          AC.showToast("Log entry deleted.", "info");
        });
      });
    }

    total.textContent = `${getTodayTotal().toFixed(1)} L`;
  }

  function renderProgressBar() {
    const goal      = AC.lsGetGoal();
    const todayTotal = getTodayTotal();
    const pct       = Math.min((todayTotal / goal) * 100, 100);
    const bar       = document.getElementById("usageProgressBar");
    const label     = document.getElementById("progressLabel");
    const pctLabel  = document.getElementById("progressPct");
    const note      = document.getElementById("progressNote");

    bar.style.width = pct + "%";
    label.textContent = `${todayTotal.toFixed(1)} / ${goal} L`;
    pctLabel.textContent = `${pct.toFixed(0)}%`;

    if (pct >= 100) {
      bar.classList.add("over");
      note.textContent = `⚠️ Daily goal exceeded! You've used ${todayTotal.toFixed(1)} L — ${(todayTotal - goal).toFixed(1)} L over target.`;
      note.className = "progress-note text-danger";
    } else if (pct >= 75) {
      bar.classList.remove("over");
      note.textContent = `Getting close! ${(goal - todayTotal).toFixed(1)} L remaining. Consider reducing washing or toilet flushes.`;
      note.className = "progress-note text-warning";
    } else {
      bar.classList.remove("over");
      note.textContent = `${(goal - todayTotal).toFixed(1)} L remaining for today. Great pace! 💧`;
      note.className = "progress-note text-success";
    }
  }

  function renderWeeklyHistory() {
    const list = document.getElementById("weeklyLogList");
    const days = AC.last7Days();
    const allLogs = AC.lsGetUsageLogs();

    const rows = days.map(d => {
      const dayLogs  = allLogs.filter(l => l.date === d);
      const total    = dayLogs.reduce((s, l) => s + l.amount, 0);
      const isToday  = d === AC.todayStr();
      return { date: d, total, count: dayLogs.length, isToday };
    }).filter(r => r.count > 0);

    if (!rows.length) {
      list.innerHTML = `<p class="empty-state">No history yet.</p>`;
      return;
    }

    list.innerHTML = rows.map(r => `
      <div class="log-item">
        <div class="log-item-left">
          <span class="log-item-icon">📅</span>
          <span>${r.isToday ? "<strong>Today</strong>" : AC.formatDate(r.date)} (${r.count} entr${r.count === 1 ? "y" : "ies"})</span>
        </div>
        <span class="log-item-amount">${r.total.toFixed(1)} L</span>
      </div>`).join("");
  }

  function renderReminders() {
    const allLogs = AC.lsGetUsageLogs();
    const recent  = allLogs.filter(l => {
      const d = new Date(l.date + "T00:00:00");
      const diff = (Date.now() - d.getTime()) / 86400000;
      return diff <= 7;
    });

    const actTotals = {};
    recent.forEach(l => {
      actTotals[l.activity] = (actTotals[l.activity] || 0) + l.amount;
    });

    const triggered = REMINDERS.filter(r => (actTotals[r.activity] || 0) > r.threshold);
    const container = document.getElementById("remindersContent");

    if (!triggered.length) {
      container.innerHTML = `<p class="text-muted" style="font-size:0.88rem;">Your water usage looks balanced! Keep up the good habits. 🌟</p>`;
      return;
    }

    container.innerHTML = triggered.map(r => `
      <div class="reminder-item">
        <span style="font-size:1.3rem;">${r.icon}</span>
        <div>
          <strong>${AC.ACTIVITY_LABELS[r.activity]}</strong><br/>
          ${r.msg}
        </div>
      </div>`).join("");
  }

  function renderAll() {
    renderTodayLog();
    renderProgressBar();
    renderWeeklyHistory();
    renderReminders();
  }

  function initTracker() {
    const form       = document.getElementById("usageForm");
    const dateInput  = document.getElementById("activityDate");
    const goalInput  = document.getElementById("dailyGoal");
    const saveGoal   = document.getElementById("saveGoalBtn");
    const clearBtn   = document.getElementById("clearUsageBtn");

    // Set default date to today
    dateInput.value = AC.todayStr();
    goalInput.value = AC.lsGetGoal();

    form.addEventListener("submit", e => {
      e.preventDefault();
      const activity = document.getElementById("activityType").value;
      const amount   = parseFloat(document.getElementById("activityAmount").value);
      const note     = document.getElementById("activityNote").value.trim();
      const date     = document.getElementById("activityDate").value;

      if (!activity || isNaN(amount) || amount <= 0) {
        AC.showToast("Please fill in activity and a valid amount.", "error");
        return;
      }

      const logs = AC.lsGetUsageLogs();
      logs.push({ activity, amount, note, date, ts: Date.now() });
      saveLogs(logs);

      form.reset();
      dateInput.value = AC.todayStr();
      AC.showToast(`Logged ${amount.toFixed(1)} L for ${AC.ACTIVITY_LABELS[activity]}! 💧`, "success");
      renderAll();
      AC.refreshDashboard();
    });

    saveGoal.addEventListener("click", () => {
      const g = parseInt(goalInput.value);
      if (g > 0) {
        AC.lsSet(AC.LS_KEYS.GOAL, g);
        AC.showToast(`Daily goal set to ${g} L ✅`, "success");
        renderProgressBar();
      }
    });

    clearBtn.addEventListener("click", () => {
      if (confirm("Clear all water usage logs? This cannot be undone.")) {
        AC.lsSet(AC.LS_KEYS.USAGE, []);
        renderAll();
        AC.refreshDashboard();
        AC.showToast("All usage logs cleared.", "info");
      }
    });

    renderAll();
  }

  document.addEventListener("DOMContentLoaded", initTracker);
})();
