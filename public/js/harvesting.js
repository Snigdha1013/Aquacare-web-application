/* ══════════════════════════════════════════════════════
   AquaCare – harvesting.js
   Rainwater Harvesting Calculator
   ══════════════════════════════════════════════════════ */

"use strict";

(function () {
  const AC = window.AquaCare;

  // Average monthly rainfall distribution (fraction of annual) as a rough template
  // Users provide one monthly average; we distribute across months with a seasonal curve
  const SEASONAL_WEIGHTS = [0.06, 0.05, 0.07, 0.08, 0.10, 0.12, 0.14, 0.13, 0.10, 0.09, 0.07, 0.06]; // ~tropical average

  function estimateMonthlyRain(avgMonthly) {
    // Scale weights so their average equals avgMonthly
    const avgWeight = SEASONAL_WEIGHTS.reduce((a, b) => a + b, 0) / 12;
    return SEASONAL_WEIGHTS.map(w => parseFloat(((w / avgWeight) * avgMonthly).toFixed(1)));
  }

  function calcHarvest(roofArea, efficiency, rainfall_mm) {
    // Volume (L) = Area(m²) × Rainfall(m) × Efficiency × 1000 L/m³
    return roofArea * (rainfall_mm / 1000) * efficiency * 1000;
  }

  function renderResults(roofArea, efficiency, rainfall, storage) {
    const container = document.getElementById("harvestResultContent");
    const monthlyRain = estimateMonthlyRain(rainfall);
    const monthlyHarvest = monthlyRain.map(r => parseFloat(calcHarvest(roofArea, efficiency, r).toFixed(0)));
    const totalAnnual = monthlyHarvest.reduce((a, b) => a + b, 0);
    const avgMonthly = totalAnnual / 12;
    const potentialSavings = Math.min(avgMonthly, storage || avgMonthly);

    // Tank fill days (how many days the avg monthly harvest fills the tank)
    const tankFillDays = storage > 0 ? (storage / (avgMonthly / 30)).toFixed(1) : null;

    // Household equivalency (avg person uses 150L/day)
    const personDays = Math.floor(totalAnnual / 150);

    container.innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1.25rem;">
        <div class="harvest-stat">
          <div class="harvest-stat-label">Monthly Average</div>
          <div class="harvest-stat-value">${Math.round(avgMonthly).toLocaleString()} <span class="harvest-stat-unit">L/month</span></div>
          <span class="harvest-badge ${avgMonthly > 1000 ? 'good' : 'limited'}">${avgMonthly > 1000 ? '✅ Good potential' : '⚡ Limited — conserve'}</span>
        </div>
        <div class="harvest-stat">
          <div class="harvest-stat-label">Annual Total</div>
          <div class="harvest-stat-value">${Math.round(totalAnnual).toLocaleString()} <span class="harvest-stat-unit">L/year</span></div>
          <span class="harvest-badge good">≈ ${personDays} person-days</span>
        </div>
        ${storage > 0 ? `
        <div class="harvest-stat">
          <div class="harvest-stat-label">Tank (${storage.toLocaleString()} L) Refill</div>
          <div class="harvest-stat-value">${tankFillDays} <span class="harvest-stat-unit">days avg</span></div>
        </div>` : ""}
        <div class="harvest-stat">
          <div class="harvest-stat-label">Monthly Peak</div>
          <div class="harvest-stat-value">${Math.max(...monthlyHarvest).toLocaleString()} <span class="harvest-stat-unit">L</span></div>
        </div>
      </div>

      <div class="divider"></div>

      <h4 style="font-size:0.88rem;color:var(--primary);margin-bottom:0.75rem;">📅 Monthly Harvest Breakdown (L)</h4>
      <div style="overflow-x:auto;">
        <table style="width:100%;font-size:0.82rem;border-collapse:collapse;">
          <thead>
            <tr style="background:var(--bg);">
              ${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map(m => `<th style="padding:0.4rem;text-align:right;font-weight:700;color:var(--text-muted);">${m}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            <tr>
              ${monthlyHarvest.map(v => `<td style="padding:0.4rem;text-align:right;font-weight:600;color:var(--primary-dark);">${v.toLocaleString()}</td>`).join("")}
            </tr>
          </tbody>
        </table>
      </div>

      <div class="divider"></div>

      <div style="background:var(--cyan-light);border-radius:8px;padding:0.85rem 1rem;font-size:0.85rem;color:var(--primary-dark);">
        <strong>💡 What can you do with ${Math.round(avgMonthly).toLocaleString()} L/month?</strong><br/>
        • Flush toilets: ~${Math.floor(avgMonthly / 8)} times (8L each)<br/>
        • Garden watering: ~${Math.floor(avgMonthly / 5)} sessions (5L each)<br/>
        • Laundry loads: ~${Math.floor(avgMonthly / 50)} loads (50L each)
      </div>

      <p style="font-size:0.75rem;color:var(--text-muted);margin-top:0.75rem;">
        ⚠️ Estimates use roof efficiency of ${(efficiency * 100).toFixed(0)}% and ${rainfall} mm/month average rainfall. Actual yield depends on local rainfall patterns, first-flush losses, and storage setup.
      </p>`;

    // Save for dashboard chart
    AC.lsSet(AC.LS_KEYS.HARVEST, {
      roofArea, efficiency, rainfall,
      monthlyRain, annualTotal: totalAnnual
    });

    AC.refreshDashboard();
    AC.showToast(`Harvest estimate calculated! ~${Math.round(avgMonthly).toLocaleString()} L/month 🌧️`, "success");
  }

  function initHarvesting() {
    const form = document.getElementById("harvestForm");

    form.addEventListener("submit", e => {
      e.preventDefault();
      const roofArea = parseFloat(document.getElementById("roofArea").value);
      const efficiency = parseFloat(document.getElementById("roofMaterial").value);
      const rainfall = parseFloat(document.getElementById("rainfallMonth").value);
      const storage = parseFloat(document.getElementById("storageCapacity").value) || 0;

      if (isNaN(roofArea) || roofArea <= 0 || isNaN(rainfall) || rainfall < 0) {
        AC.showToast("Please enter valid roof area and rainfall values.", "error");
        return;
      }

      renderResults(roofArea, efficiency, rainfall, storage);
    });

    // Restore last result if saved
    const saved = AC.lsGet(AC.LS_KEYS.HARVEST, null);
    if (saved) {
      document.getElementById("roofArea").value = saved.roofArea;
      document.getElementById("rainfallMonth").value = saved.rainfall;
      renderResults(saved.roofArea, saved.efficiency, saved.rainfall, 0);
    }
  }

  document.addEventListener("DOMContentLoaded", initHarvesting);
})();
