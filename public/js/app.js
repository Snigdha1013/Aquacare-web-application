/* ══════════════════════════════════════════════════════
   AquaCare – app.js
   Core: Navigation, localStorage helpers, Dashboard,
         Charts (Chart.js), Water-Stress Alerts
   ══════════════════════════════════════════════════════ */

"use strict";

// ── Constants ──────────────────────────────────────────────
const LS_KEYS = {
  USAGE:     "aquacare_usage",
  GOAL:      "aquacare_goal",
  HYGIENE:   "aquacare_hygiene",
  ISSUES:    "aquacare_issues",
  HARVEST:   "aquacare_harvest",
  DAILY_TIP: "aquacare_daily_tip",
};

const ACTIVITY_ICONS = {
  drinking: "🥤", cooking: "🍳", washing: "🚿",
  laundry: "👕", gardening: "🌱", toilet: "🚽", other: "📦"
};

const ACTIVITY_LABELS = {
  drinking: "Drinking", cooking: "Cooking", washing: "Washing/Bathing",
  laundry: "Laundry", gardening: "Gardening", toilet: "Toilet", other: "Other"
};

// ── LocalStorage helpers ────────────────────────────────────
function lsGet(key, fallback = null) {
  try {
    const v = localStorage.getItem(key);
    return v !== null ? JSON.parse(v) : fallback;
  } catch { return fallback; }
}

function lsSet(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { console.warn("LS write fail:", e); }
}

function lsGetUsageLogs() { return lsGet(LS_KEYS.USAGE, []); }
function lsGetHygieneLogs() { return lsGet(LS_KEYS.HYGIENE, []); }
function lsGetIssues() { return lsGet(LS_KEYS.ISSUES, []); }
function lsGetGoal() { return lsGet(LS_KEYS.GOAL, 150); }

function todayStr() { return new Date().toISOString().slice(0, 10); }

function formatDate(str) {
  const d = new Date(str + "T00:00:00");
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function last7Days() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

function showToast(msg, type = "info", duration = 2800) {
  let container = document.getElementById("toastContainer");
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container";
    container.id = "toastContainer";
    document.body.appendChild(container);
  }
  const t = document.createElement("div");
  t.className = `toast ${type}`;
  t.textContent = msg;
  container.appendChild(t);
  setTimeout(() => t.remove(), duration);
}

// ── Navigation / SPA Router ────────────────────────────────
function initNavigation() {
  const sections  = document.querySelectorAll(".page-section");
  const navLinks  = document.querySelectorAll(".nav-link");
  const navToggle = document.getElementById("navToggle");
  const mainNav   = document.getElementById("mainNav");

  function activateSection(id) {
    sections.forEach(s => s.classList.toggle("active", s.id === id));
    navLinks.forEach(l => l.classList.toggle("active", l.dataset.section === id));
    mainNav.classList.remove("open");
    window.scrollTo({ top: 0, behavior: "smooth" });
    // Trigger section-specific refresh
    if (id === "dashboard") refreshDashboard();
  }

  navLinks.forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      activateSection(link.dataset.section);
    });
  });

  navToggle.addEventListener("click", () => mainNav.classList.toggle("open"));

  // Handle hash on load
  const hash = window.location.hash.replace("#", "") || "dashboard";
  const validIds = Array.from(sections).map(s => s.id);
  activateSection(validIds.includes(hash) ? hash : "dashboard");
}

// ── Charts ─────────────────────────────────────────────────
let chartInstances = {};

function destroyChart(id) {
  if (chartInstances[id]) { chartInstances[id].destroy(); delete chartInstances[id]; }
}

function buildUsageChart(days, data) {
  destroyChart("usageChart");
  const ctx = document.getElementById("usageChart").getContext("2d");
  chartInstances.usageChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: days.map(formatDate),
      datasets: [{
        label: "Water Used (L)",
        data,
        backgroundColor: data.map(v => v > 250 ? "rgba(220,38,38,0.65)" : "rgba(6,182,212,0.65)"),
        borderColor: data.map(v => v > 250 ? "#dc2626" : "#0891b2"),
        borderWidth: 2,
        borderRadius: 6,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ` ${ctx.raw} L` } } },
      scales: {
        y: { beginAtZero: true, ticks: { callback: v => v + "L" }, grid: { color: "#e0f2fe" } },
        x: { grid: { display: false } }
      }
    }
  });
}

function buildHygieneChart(days, data) {
  destroyChart("hygieneChart");
  const ctx = document.getElementById("hygieneChart").getContext("2d");
  chartInstances.hygieneChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: days.map(formatDate),
      datasets: [{
        label: "Hygiene Score (%)",
        data,
        borderColor: "#0d9488",
        backgroundColor: "rgba(13,148,136,0.12)",
        borderWidth: 2.5,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "#0d9488",
        pointRadius: 5,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ` ${ctx.raw}%` } } },
      scales: {
        y: { beginAtZero: true, max: 100, ticks: { callback: v => v + "%" }, grid: { color: "#e0f2fe" } },
        x: { grid: { display: false } }
      }
    }
  });
}

function buildActivityChart(activityTotals) {
  destroyChart("activityChart");
  const ctx = document.getElementById("activityChart").getContext("2d");
  const keys = Object.keys(activityTotals).filter(k => activityTotals[k] > 0);
  if (!keys.length) {
    destroyChart("activityChart");
    return;
  }
  const colors = ["#0ea5e9","#06b6d4","#0d9488","#16a34a","#84cc16","#f59e0b","#6366f1"];
  chartInstances.activityChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: keys.map(k => ACTIVITY_LABELS[k] || k),
      datasets: [{ data: keys.map(k => activityTotals[k]), backgroundColor: colors.slice(0, keys.length), borderWidth: 2, borderColor: "#fff" }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: "right", labels: { font: { size: 11 }, padding: 8 } } }
    }
  });
}

function buildHarvestChart() {
  destroyChart("harvestChart");
  const saved = lsGet(LS_KEYS.HARVEST, null);
  const ctx = document.getElementById("harvestChart").getContext("2d");
  if (!saved) {
    // Show placeholder chart
    chartInstances.harvestChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
        datasets: [{ label: "Potential Harvest (L)", data: Array(12).fill(0), backgroundColor: "rgba(6,182,212,0.3)", borderRadius: 4 }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true }, x: { grid: { display: false } } }
      }
    });
    return;
  }
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const monthlyRain = saved.monthlyRain || Array(12).fill(saved.rainfall || 0);
  const data = monthlyRain.map(r => Math.round(saved.roofArea * r * saved.efficiency));
  chartInstances.harvestChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: months,
      datasets: [{ label: "Harvest (L)", data, backgroundColor: "rgba(6,182,212,0.65)", borderColor: "#0891b2", borderWidth: 1.5, borderRadius: 5 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => ` ${c.raw.toLocaleString()} L` } } },
      scales: { y: { beginAtZero: true, ticks: { callback: v => v >= 1000 ? (v/1000).toFixed(1)+"k" : v } }, x: { grid: { display: false } } }
    }
  });
}

// ── Water Stress Alert Logic ───────────────────────────────
function checkWaterStressAlert(days, dailyUsage) {
  const alert = document.getElementById("waterStressAlert");
  const msg   = document.getElementById("waterStressMsg");
  const goal = lsGetGoal();

  // Check last 3 days (excluding today which may be partial)
  const recent = days.slice(-4, -1); // 3 days before today
  let highCount = 0;
  recent.forEach(d => {
    if ((dailyUsage[d] || 0) > 250) highCount++;
  });

  // Also check if today is above goal * 1.5
  const todayUsage = dailyUsage[todayStr()] || 0;
  const severeToday = todayUsage > (goal * 1.5);

  if (highCount >= 3) {
    alert.classList.remove("hidden");
    msg.textContent = `Your household water usage exceeded 250 L/day for ${highCount} consecutive days. Consider exploring water recycling, shorter showers, and drip irrigation to reduce consumption.`;
  } else if (severeToday && todayUsage > 300) {
    alert.classList.remove("hidden");
    msg.textContent = `You've already used ${todayUsage.toFixed(0)} L today — well above your ${goal} L goal. Try identifying the biggest usage source to cut back.`;
  } else {
    alert.classList.add("hidden");
  }
}

// ── Dashboard Refresh ──────────────────────────────────────
function refreshDashboard() {
  const days   = last7Days();
  const logs   = lsGetUsageLogs();
  const hygLogs = lsGetHygieneLogs();
  const issues  = lsGetIssues();

  // ── Build daily totals map
  const dailyUsage = {};
  const activityTotals = { drinking: 0, cooking: 0, washing: 0, laundry: 0, gardening: 0, toilet: 0, other: 0 };
  days.forEach(d => { dailyUsage[d] = 0; });

  logs.forEach(log => {
    if (dailyUsage.hasOwnProperty(log.date)) {
      dailyUsage[log.date] = (dailyUsage[log.date] || 0) + log.amount;
    }
    if (activityTotals.hasOwnProperty(log.activity)) {
      activityTotals[log.activity] += log.amount;
    }
  });

  const usageData   = days.map(d => parseFloat((dailyUsage[d] || 0).toFixed(1)));
  const avgUsage    = usageData.reduce((a, b) => a + b, 0) / usageData.filter(v => v > 0).length || 0;
  const todayUsage  = dailyUsage[todayStr()] || 0;

  // ── Stat Cards
  document.getElementById("statTodayUsage").textContent = `${todayUsage.toFixed(1)} L`;
  document.getElementById("statUsageNote").textContent =
    todayUsage === 0 ? "No logs yet today" : `${logs.filter(l => l.date === todayStr()).length} activit${logs.filter(l => l.date === todayStr()).length === 1 ? "y" : "ies"} logged`;
  document.getElementById("stat7DayAvg").textContent = avgUsage > 0 ? `${avgUsage.toFixed(1)} L` : "0 L";
  document.getElementById("statIssuesLogged").textContent = issues.length;

  // Hygiene score (today)
  const todayHyg = hygLogs.find(h => h.date === todayStr());
  document.getElementById("statHygieneScore").textContent = todayHyg ? `${todayHyg.score}%` : "—";

  // ── Hygiene data for chart
  const hygieneData = days.map(d => {
    const h = hygLogs.find(x => x.date === d);
    return h ? h.score : 0;
  });

  // ── Water stress alert
  checkWaterStressAlert(days, dailyUsage);

  // ── Build Charts
  buildUsageChart(days, usageData);
  buildHygieneChart(days, hygieneData);
  buildActivityChart(activityTotals);
  buildHarvestChart();
}

// ── Init ───────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  refreshDashboard();
});

// Expose helpers globally for other modules
window.AquaCare = {
  LS_KEYS,
  lsGet, lsSet,
  lsGetUsageLogs, lsGetHygieneLogs, lsGetIssues, lsGetGoal,
  todayStr, formatDate, last7Days, showToast,
  refreshDashboard,
  ACTIVITY_ICONS, ACTIVITY_LABELS,
};
