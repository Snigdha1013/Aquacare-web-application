/* ══════════════════════════════════════════════════════
   AquaCare – community.js
   Community Water Issue Logger & Report Board
   ══════════════════════════════════════════════════════ */

"use strict";

(function () {
  const AC = window.AquaCare;

  const ISSUE_ICONS = {
    pipe_leak:     "🔧",
    contamination: "⚗️",
    no_supply:     "🚫",
    drainage:      "🌊",
    sanitation:    "🚽",
    flooding:      "🌧️",
    other:         "📌",
  };

  const ISSUE_LABELS = {
    pipe_leak:     "Pipe Leak / Burst",
    contamination: "Contaminated Water",
    no_supply:     "No Water Supply",
    drainage:      "Poor Drainage",
    sanitation:    "Broken Sanitation",
    flooding:      "Flood / Waterlogging",
    other:         "Other",
  };

  const SEVERITY_LABELS = { low: "🟢 Low", medium: "🟡 Medium", high: "🔴 High" };

  let currentFilter = "all";

  function saveIssues(issues) { AC.lsSet(AC.LS_KEYS.ISSUES, issues); }

  function renderBoard() {
    const board  = document.getElementById("issueBoard");
    const issues = AC.lsGetIssues();
    const filtered = currentFilter === "all" ? issues : issues.filter(i => i.severity === currentFilter);

    if (!filtered.length) {
      board.innerHTML = `<p class="empty-state">${issues.length ? "No issues match this filter." : "No community issues reported yet. Be the first to report! 🗺️"}</p>`;
      return;
    }

    board.innerHTML = filtered.map((issue, i) => {
      const realIdx = issues.indexOf(issue);
      return `
        <div class="issue-card ${issue.severity}" data-idx="${realIdx}">
          <div class="issue-card-header">
            <span class="issue-type-badge">${ISSUE_ICONS[issue.type] || "📌"} ${ISSUE_LABELS[issue.type] || issue.type}</span>
            <span class="issue-severity ${issue.severity}">${SEVERITY_LABELS[issue.severity]}</span>
          </div>
          <div class="issue-location">📍 ${issue.location}</div>
          <div class="issue-desc">${escapeHtml(issue.description)}</div>
          <div class="issue-meta">
            <span>🧑 ${escapeHtml(issue.reporter || "Anonymous")} · ${formatTimestamp(issue.ts)}</span>
            <button class="issue-delete" data-idx="${realIdx}" title="Delete report">🗑️ Delete</button>
          </div>
        </div>`;
    }).join("");

    board.querySelectorAll(".issue-delete").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.dataset.idx);
        const issues = AC.lsGetIssues();
        issues.splice(idx, 1);
        saveIssues(issues);
        renderBoard();
        AC.refreshDashboard();
        AC.showToast("Report removed.", "info");
      });
    });
  }

  function escapeHtml(str) {
    const el = document.createElement("div");
    el.textContent = str;
    return el.innerHTML;
  }

  function formatTimestamp(ts) {
    if (!ts) return "Unknown date";
    const d = new Date(ts);
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) +
           " " + d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  }

  function initCommunity() {
    const form       = document.getElementById("issueForm");
    const filterBtns = document.querySelectorAll(".board-filters .filter-btn");
    const clearBtn   = document.getElementById("clearIssuesBtn");

    form.addEventListener("submit", e => {
      e.preventDefault();
      const type        = document.getElementById("issueType").value;
      const location    = document.getElementById("issueLocation").value.trim();
      const severity    = document.getElementById("issueSeverity").value;
      const description = document.getElementById("issueDescription").value.trim();
      const reporter    = document.getElementById("reporterName").value.trim() || "Anonymous";

      if (!type || !location || !description) {
        AC.showToast("Please fill in all required fields.", "error");
        return;
      }

      const issues = AC.lsGetIssues();
      issues.unshift({ type, location, severity, description, reporter, ts: Date.now() });
      saveIssues(issues);
      form.reset();
      renderBoard();
      AC.refreshDashboard();
      AC.showToast(`Issue reported: ${ISSUE_LABELS[type]} at ${location} 🗺️`, "success");
    });

    filterBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        filterBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentFilter = btn.dataset.filter;
        renderBoard();
      });
    });

    clearBtn.addEventListener("click", () => {
      if (confirm("Clear ALL community issue reports? This cannot be undone.")) {
        saveIssues([]);
        renderBoard();
        AC.refreshDashboard();
        AC.showToast("All community reports cleared.", "info");
      }
    });

    renderBoard();
  }

  document.addEventListener("DOMContentLoaded", initCommunity);
})();
