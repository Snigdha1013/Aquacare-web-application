/* ══════════════════════════════════════════════════════
   AquaCare – tips.js
   Water-Saving Action Library + Educational Awareness Hub
   ══════════════════════════════════════════════════════ */

"use strict";

(function () {

  // ── Action Library Data ──────────────────────────────────
  const TIPS = [
    { icon: "🚿", category: "home",        title: "Take 4-Minute Showers",                impact: "Save 40–60 L/shower",   text: "Set a timer. A standard shower uses 10–15 L per minute. Cutting from 8 to 4 minutes halves your shower water use." },
    { icon: "🪥", category: "home",        title: "Turn Off Tap While Brushing",          impact: "Save up to 12 L/day",   text: "Running taps waste 6–8 L per minute. Turn it off while you brush and only rinse when ready." },
    { icon: "🍽️", category: "home",        title: "Fill a Washing Bowl — Don't Run Tap",  impact: "Save 15–30 L/wash",    text: "Use a bowl to wash dishes instead of leaving the tap running. Works equally well and uses a fraction of the water." },
    { icon: "🚽", category: "home",        title: "Install a Dual-Flush Toilet",          impact: "Save 50–80 L/day",     text: "Old single-flush toilets use 9–13 L per flush. A dual-flush model halves this with a half-flush option for liquid waste." },
    { icon: "🌧️", category: "home",        title: "Collect Rainwater for Plants",         impact: "Save 50+ L/week",      text: "Place buckets or barrels under downspouts during rain to collect water for garden irrigation. Free, clean, and effective." },
    { icon: "🔧", category: "home",        title: "Fix Leaking Taps Immediately",         impact: "Save 15–20 L/day",     text: "A tap dripping once per second wastes over 10,000 L per year. A simple washer replacement costs almost nothing." },
    { icon: "👚", category: "home",        title: "Run Full Laundry Loads Only",           impact: "Save 40–80 L/load",    text: "Every partial load wastes 30–40% of the water a full load uses. Wait until the drum is full before starting a wash." },
    { icon: "🪴", category: "home",        title: "Reuse Vegetable Boiling Water",         impact: "Save 2–5 L/meal",      text: "Cooled cooking water is rich in nutrients. Pour it on indoor plants or the garden instead of discarding it." },
    { icon: "🏫", category: "school",      title: "Water-Saving Champions Board",          impact: "Whole school habit",   text: "Start a weekly leaderboard in school tracking which class saved the most water. Peer motivation drives behaviour change." },
    { icon: "📋", category: "school",      title: "Appoint Water Monitors",               impact: "Reduce waste 20–30%",  text: "Assign student 'water monitors' per week. Their job: check taps are turned off, report drips, remind peers to conserve." },
    { icon: "🌿", category: "school",      title: "School Rainwater Garden",              impact: "Conserve 500+ L/month",text: "Set up a simple school rain barrel and use the water for a shared garden plot. Teaches harvesting and ecology together." },
    { icon: "🧑‍🏫", category: "school",   title: "Water Literacy Lessons",               impact: "Long-term awareness",  text: "Integrate water usage facts into science class. Students who understand water scarcity become more mindful at home." },
    { icon: "💧", category: "agriculture", title: "Use Drip Irrigation",                  impact: "Save 30–60% water",    text: "Drip irrigation delivers water directly to roots, reducing evaporation loss by 30–60% compared to sprinklers or flood irrigation." },
    { icon: "🌙", category: "agriculture", title: "Water Crops at Dusk or Dawn",          impact: "Reduce evaporation 50%",text: "Watering in the morning or evening avoids midday heat. Up to 50% less water evaporates compared to midday irrigation." },
    { icon: "🌾", category: "agriculture", title: "Mulching Reduces Soil Evaporation",    impact: "Cut watering frequency",text: "Applying 5–10 cm of organic mulch around plants slows soil moisture loss, meaning less frequent watering is needed." },
    { icon: "♻️", category: "agriculture", title: "Reuse Greywater for Irrigation",       impact: "Recycle 50–100 L/day", text: "Greywater from sinks and laundry (no toilet water) can safely irrigate non-edible plants after basic filtering." },
    { icon: "🧼", category: "sanitation",  title: "20-Second Handwashing Rule",           impact: "Prevent 40% of illness",text: "Lather soap on both sides of hands, between fingers, and under nails for at least 20 seconds. Rinse under clean water." },
    { icon: "🫙", category: "sanitation",  title: "Store Water in Covered Containers",    impact: "Prevent contamination", text: "Always cover stored water containers. Uncovered water breeds mosquitoes and bacteria within 24–48 hours." },
    { icon: "🔥", category: "sanitation",  title: "Boil Water When in Doubt",             impact: "Kill 99.9% pathogens",  text: "Boiling water for 1 minute (3 minutes at high altitude) kills virtually all bacteria, viruses, and protozoa that cause disease." },
    { icon: "☀️", category: "sanitation",  title: "SODIS — Solar Water Disinfection",     impact: "Free, zero-cost method",text: "Fill a clear PET bottle with water, place in direct sunlight for 6 hours (or 2 days if cloudy). UV radiation kills pathogens." },
  ];

  // ── Awareness Hub Data ───────────────────────────────────
  const AWARENESS_ARTICLES = [
    {
      icon: "☀️",
      title: "SODIS — Solar Disinfection of Water",
      tags: ["Purification", "Low-cost", "Rural"],
      summary: "SODIS (Solar Water Disinfection) is a free, equipment-free purification method ideal for communities without access to clean water infrastructure.",
      full: `How it works: Fill clear, colourless plastic PET bottles (1–2 L) with raw water. Lay them on a reflective surface (like a corrugated iron roof) in direct sunlight. Leave for 6 hours on sunny days, or 2 consecutive cloudy days. UV-A radiation and heat together destroy E. coli, Vibrio cholerae, and most other common waterborne pathogens.

Best practices:
• Use clear PET bottles — dark or scratched bottles block UV
• Water should not be too turbid (murky); turbidity above 30 NTU reduces effectiveness
• Label bottles and track treatment time
• SODIS is suitable for drinking and cooking water only
• Not effective against chemical contaminants

SODIS has been validated by WHO and is used in over 30 countries across Africa, Asia, and Latin America as a household water treatment method.`,
    },
    {
      icon: "🧪",
      title: "Household Water Filtration Methods",
      tags: ["Purification", "DIY", "Low-cost"],
      summary: "From sand filters to ceramic pot filters, learn the household filtration methods that make unsafe water safer to drink.",
      full: `Biosand Filters: A slow sand filter filled with fine sand and gravel that removes turbidity, bacteria, and some viruses through biological filtration (a live biofilm layer at the top). Can treat 20–60 L/day for a household.

Ceramic Pot Filters: Fired clay pots impregnated with colloidal silver. Water seeps through the pot over 1–3 hours. Removes 99.8% of bacteria and 91% of viruses. Used widely in Cambodia, Nepal, and Nigeria.

Cloth Filtration: Folding a clean cotton sari or cloth 4–8 times and filtering water through it reduces V. cholerae bacteria by over 99% — a simple emergency measure.

Activated Carbon Filters: Carbon granules adsorb chlorine, organic chemicals, and bad taste/odour. Less effective against bacteria alone; usually combined with other methods.

⚠️ Important: Household filtration significantly improves water safety but is not a substitute for municipal-grade treatment. Always combine methods (e.g., filtration + boiling or chemical treatment) for highest safety.`,
    },
    {
      icon: "🌍",
      title: "Your Right to Safe Water — SDG 6",
      tags: ["Rights", "Policy", "SDG 6"],
      summary: "The UN recognises access to safe water and sanitation as a basic human right. Learn what this means and how communities can advocate for it.",
      full: `In 2010, the United Nations General Assembly explicitly recognised the human right to water and sanitation. This means every person has the right to sufficient, safe, acceptable, physically accessible, and affordable water for personal and domestic use.

Key facts:
• 2 billion people globally still lack access to safely managed drinking water (WHO/UNICEF, 2023)
• 3.6 billion people lack safely managed sanitation
• Children under 5 are most vulnerable — diarrhoeal disease from unsafe water causes ~370,000 child deaths per year

SDG 6 Targets include:
• 6.1 — Universal access to safe and affordable drinking water by 2030
• 6.2 — End open defecation; provide adequate sanitation for all
• 6.3 — Reduce water pollution and increase recycling
• 6.b — Support community participation in water management

What can communities do?
• Form Water User Committees to maintain local water points
• Engage local government on leaking infrastructure
• Educate community members on water treatment
• Document and report water issues through tools like AquaCare`,
    },
    {
      icon: "💧",
      title: "Groundwater Protection",
      tags: ["Environment", "Groundwater", "Conservation"],
      summary: "Groundwater provides 40% of all drinking water worldwide. Learn how to protect this hidden resource from contamination and depletion.",
      full: `Groundwater is stored in underground aquifers — natural underground layers of rock, sand, and gravel that hold water. It is recharged slowly (over years to centuries) by rainfall soaking into the ground.

Key threats to groundwater:
• Over-extraction — pumping faster than recharge depletes aquifers permanently
• Agricultural runoff — fertilisers and pesticides seep into aquifers
• Untreated sewage — leaking septic tanks and open defecation contaminate wells
• Industrial waste — chemical leaching can make aquifers unsafe for generations
• Saltwater intrusion — coastal over-pumping draws in seawater

How to protect groundwater:
✅ Ensure latrines and septic tanks are at least 30m away from wells
✅ Don't dispose of chemicals, medicines, or oils near wells or ground
✅ Install well covers and sanitary seals
✅ Plant native vegetation to improve water infiltration and reduce erosion
✅ Practice rainwater harvesting to reduce aquifer dependence
✅ Reuse and recycle water to lower extraction pressure`,
    },
    {
      icon: "🚰",
      title: "Urban Water Conservation at Home",
      tags: ["Home", "Urban", "Conservation"],
      summary: "Urban households in cities use 3–5 times more water than rural households. Here are practical ways to significantly cut your household footprint.",
      full: `Average daily water use per person:
• High-income countries: 300–500 L/person/day
• Developing countries: 20–150 L/person/day
• WHO minimum for basic survival: 7.5 L/day
• WHO recommended comfortable living: 50–100 L/day

Top urban water wasters and fixes:
1. Shower/bath — Switch to 4-minute showers (saves 40L per shower)
2. Toilet flushing — Use dual-flush; "if it's yellow, let it mellow"
3. Washing machine — Run full loads only; choose cold wash
4. Garden irrigation — Drip, dawn/dusk watering, mulching
5. Tap running — Bowl dishes; turn off while brushing/shaving
6. Leaking fixtures — One dripping tap wastes 10,000 L per year
7. Car washing — Use a bucket instead of a running hose (saves 150L per wash)

A family of 4 implementing all these changes can reduce water use by 30–40%, saving money and supporting community water security.`,
    },
    {
      icon: "🌧️",
      title: "Rainwater Harvesting — A Community Guide",
      tags: ["Harvesting", "Community", "Rural"],
      summary: "Rainwater harvesting can meet 30–100% of a household's non-drinking water needs. Explore the methods and system design basics.",
      full: `Types of rainwater harvesting systems:

Roof-Top Collection: Most common household method. Gutters channel rain from roofs into storage tanks. Metal and concrete roofs are most efficient. Requires first-flush diverter to discard the first 25 L (which washes dirt and bird droppings).

Surface Runoff Harvesting: Earthen bunds, check dams, and farm ponds collect runoff from land. Used widely in dryland agriculture to recharge soil moisture.

Fog Collection: Mesh nets on hilltops in coastal areas condense fog into water. Used in Chile, Morocco, and South Africa.

Storage Systems:
• Ferrocement tanks (200–5,000 L) — durable and low-cost
• Plastic poly-tanks (500–10,000 L) — easy to install
• Underground cisterns — best for large volumes

Safety for drinking:
• Install a first-flush diverter
• Use a fine screen/mesh to prevent mosquito breeding
• Add 1 mg/L chlorine for stored water used for drinking
• Test annually for bacterial contamination

A 50m² corrugated iron roof in an area receiving 800 mm/year receives approximately 32,000 L of harvestable water annually — enough for toilet flushing and garden irrigation year-round.`,
    },
  ];

  function initTips() {
    const grid = document.getElementById("tipsGrid");
    const filterBtns = document.querySelectorAll(".tips-filter-bar .filter-btn");
    let currentCat = "all";

    function renderTips() {
      const filtered = currentCat === "all" ? TIPS : TIPS.filter(t => t.category === currentCat);
      grid.innerHTML = filtered.map(tip => `
        <div class="tip-card" data-category="${tip.category}">
          <div class="tip-card-icon">${tip.icon}</div>
          <div class="tip-card-category">${tip.category.charAt(0).toUpperCase() + tip.category.slice(1)}</div>
          <h3>${tip.title}</h3>
          <p>${tip.text}</p>
          <span class="tip-card-impact">💚 ${tip.impact}</span>
        </div>`).join("");
    }

    filterBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        filterBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentCat = btn.dataset.category;
        renderTips();
      });
    });

    renderTips();
  }

  function initAwareness() {
    const grid = document.getElementById("awarenessGrid");
    grid.innerHTML = AWARENESS_ARTICLES.map((art, i) => `
      <div class="awareness-card">
        <div class="awareness-card-header">
          <div class="awareness-card-icon">${art.icon}</div>
          <h3>${art.title}</h3>
        </div>
        <div class="awareness-card-body">
          <p>${art.summary}</p>
          <div>${art.tags.map(t => `<span class="awareness-tag">${t}</span>`).join("")}</div>
          <button class="awareness-expand-btn" data-idx="${i}">Read more ▼</button>
          <div class="awareness-extra" id="awareness-extra-${i}">
            ${art.full.split("\n").map(line => line.trim() ? `<p style="margin-bottom:0.5rem;">${line}</p>` : "").join("")}
          </div>
        </div>
      </div>`).join("");

    grid.querySelectorAll(".awareness-expand-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const extra = document.getElementById(`awareness-extra-${btn.dataset.idx}`);
        const isOpen = extra.classList.toggle("open");
        btn.textContent = isOpen ? "Read less ▲" : "Read more ▼";
      });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initTips();
    initAwareness();
  });

})();
