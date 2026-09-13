/* ══════════════════════════════════════════════════════
   AquaCare – ai.js
   AI Chat Widget + Daily Water Tip Generator
   (via /api/chat and /api/daily-tip on local Express server)
   ══════════════════════════════════════════════════════ */

"use strict";

(function () {
  const AC = window.AquaCare;

  // ── Chat State ────────────────────────────────────────────
  const chatHistory = []; // { role: "user"|"model", text: "" }
  let isBotTyping = false;

  // ── DOM refs ──────────────────────────────────────────────
  const chatWidget   = document.getElementById("chatWidget");
  const chatFab      = document.getElementById("chatFab");
  const chatToggle   = document.getElementById("chatToggleBtn");
  const chatMessages = document.getElementById("chatMessages");
  const chatInput    = document.getElementById("chatInput");
  const chatSendBtn  = document.getElementById("chatSendBtn");

  // ── Chat Widget Toggle ────────────────────────────────────
  chatFab.addEventListener("click", () => {
    chatWidget.classList.toggle("open");
    chatFab.style.display = chatWidget.classList.contains("open") ? "none" : "flex";
    if (chatWidget.classList.contains("open")) {
      chatInput.focus();
      scrollToBottom();
    }
  });

  chatToggle.addEventListener("click", () => {
    chatWidget.classList.remove("open");
    chatFab.style.display = "flex";
  });

  // ── Scroll helper ─────────────────────────────────────────
  function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // ── Render a message bubble ───────────────────────────────
  function appendMessage(role, text, isTyping = false) {
    const div = document.createElement("div");
    div.className = `chat-msg ${role}${isTyping ? " typing" : ""}`;
    const avatar = document.createElement("span");
    avatar.className = "msg-avatar";
    avatar.textContent = role === "bot" ? "💧" : "🧑";
    const bubble = document.createElement("div");
    bubble.className = "msg-bubble";
    bubble.textContent = text;
    div.appendChild(avatar);
    div.appendChild(bubble);
    chatMessages.appendChild(div);
    scrollToBottom();
    return div;
  }

  function appendBotHtml(html) {
    const div = document.createElement("div");
    div.className = "chat-msg bot";
    const avatar = document.createElement("span");
    avatar.className = "msg-avatar";
    avatar.textContent = "💧";
    const bubble = document.createElement("div");
    bubble.className = "msg-bubble";
    bubble.style.whiteSpace = "pre-wrap";
    bubble.innerHTML = html;
    div.appendChild(avatar);
    div.appendChild(bubble);
    chatMessages.appendChild(div);
    scrollToBottom();
  }

  // ── Send message to /api/chat ─────────────────────────────
  async function sendMessage(text) {
    if (!text.trim() || isBotTyping) return;
    isBotTyping = true;
    chatSendBtn.disabled = true;
    chatInput.disabled = true;

    appendMessage("user", text);
    chatHistory.push({ role: "user", text });

    const typingEl = appendMessage("bot", "Thinking…", true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: chatHistory.slice(0, -1), // send history minus current message
        }),
      });

      const data = await res.json();
      typingEl.remove();

      if (!res.ok || data.error) {
        const errMsg = data.error || "Sorry, the AI service is currently unavailable. Please check your server and API key.";
        appendBotHtml(`<span style="color:var(--red);">⚠️ ${errMsg}</span>`);
      } else {
        const reply = data.reply || "I'm sorry, I couldn't generate a response.";
        // Convert newlines and basic formatting to HTML
        const formatted = reply
          .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
          .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
          .replace(/\*(.*?)\*/g, "<em>$1</em>")
          .replace(/\n/g, "<br>");
        appendBotHtml(formatted);
        chatHistory.push({ role: "model", text: reply });
      }
    } catch (err) {
      typingEl.remove();
      appendBotHtml(`<span style="color:var(--red);">⚠️ Network error. Make sure the AquaCare server is running on port 3000.</span>`);
    }

    isBotTyping = false;
    chatSendBtn.disabled = false;
    chatInput.disabled = false;
    chatInput.focus();
  }

  chatSendBtn.addEventListener("click", () => {
    const text = chatInput.value.trim();
    if (text) { chatInput.value = ""; sendMessage(text); }
  });

  chatInput.addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const text = chatInput.value.trim();
      if (text) { chatInput.value = ""; sendMessage(text); }
    }
  });

  // ── Daily Tip Generator ───────────────────────────────────
  const TIP_CACHE_KEY  = "aquacare_daily_tip_cache";
  const TIP_DATE_KEY   = "aquacare_daily_tip_date";
  const FALLBACK_TIPS  = [
    "Try turning off the tap while you brush your teeth — this simple habit saves up to 12 litres of water every day. Small changes add up to a big impact! 💧",
    "Consider watering your garden at dawn or dusk to reduce evaporation by up to 50%. Your plants will thank you and so will the planet! 🌱",
    "Check all taps and pipes for drips today — a single dripping tap wastes over 10,000 litres per year. Fix it and make a real difference! 🔧",
    "Run your washing machine only on full loads. This can save 40–80 litres per wash cycle. Combine it with a cold-water setting to save energy too! 👕",
    "Keep a covered water bottle with you today. When you're conscious of how much you drink, you often waste less. Stay hydrated, stay aware! 🥤",
  ];

  function buildUsageSummary() {
    const logs = AC.lsGetUsageLogs();
    if (!logs.length) return null;

    const days = AC.last7Days();
    const daily = {};
    days.forEach(d => { daily[d] = 0; });
    logs.forEach(l => { if (daily.hasOwnProperty(l.date)) daily[l.date] += l.amount; });

    const values = Object.values(daily).filter(v => v > 0);
    if (!values.length) return null;

    const avg    = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);
    const max    = Math.max(...values).toFixed(1);
    const goal   = AC.lsGetGoal();
    const todayV = daily[AC.todayStr()] || 0;

    // Activity breakdown
    const actTotals = {};
    logs.slice(-50).forEach(l => {
      actTotals[l.activity] = (actTotals[l.activity] || 0) + l.amount;
    });
    const topActivity = Object.entries(actTotals).sort((a, b) => b[1] - a[1])[0];

    return `User's 7-day average water usage: ${avg} L/day (goal: ${goal} L/day). Peak day: ${max} L. Today so far: ${todayV.toFixed(1)} L. Highest-use activity: ${topActivity ? `${topActivity[0]} (${topActivity[1].toFixed(0)} L total over logged period)` : "not specified"}.`;
  }

  async function fetchDailyTip(force = false) {
    const tipTextEl = document.getElementById("dailyTipText");
    const today     = AC.todayStr();

    // Use cached tip if same day and not forced
    if (!force) {
      const cachedDate = localStorage.getItem(TIP_DATE_KEY);
      const cachedTip  = localStorage.getItem(TIP_CACHE_KEY);
      if (cachedDate === today && cachedTip) {
        tipTextEl.textContent = cachedTip;
        return;
      }
    }

    tipTextEl.textContent = "Generating your personalised tip…";

    try {
      const summary = buildUsageSummary();
      const res = await fetch("/api/daily-tip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usageSummary: summary }),
      });

      const data = await res.json();

      if (res.ok && data.tip) {
        tipTextEl.textContent = data.tip;
        localStorage.setItem(TIP_CACHE_KEY, data.tip);
        localStorage.setItem(TIP_DATE_KEY, today);
      } else {
        // Fallback tip
        const fallback = FALLBACK_TIPS[Math.floor(Math.random() * FALLBACK_TIPS.length)];
        tipTextEl.textContent = fallback;
      }
    } catch {
      const fallback = FALLBACK_TIPS[Math.floor(Math.random() * FALLBACK_TIPS.length)];
      tipTextEl.textContent = fallback;
    }
  }

  // Refresh tip button
  const refreshBtn = document.getElementById("refreshTipBtn");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", () => {
      refreshBtn.disabled = true;
      refreshBtn.textContent = "…";
      fetchDailyTip(true).finally(() => {
        refreshBtn.disabled = false;
        refreshBtn.textContent = "Refresh";
      });
    });
  }

  // ── Init ──────────────────────────────────────────────────
  document.addEventListener("DOMContentLoaded", () => {
    fetchDailyTip();
  });

})();
