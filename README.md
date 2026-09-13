# 🌊 AquaCare – Smart Water & Sanitation Awareness System

> A student sustainability project for the **1M1B initiative**, aligned with **UN SDG 6 — Clean Water and Sanitation**  
> Theme: *Technology for social impact and sustainability*

---

## 📋 About

AquaCare is an educational and awareness web application that helps students, local communities, and households:

- Track daily household water consumption
- Calculate rainwater harvesting potential
- Log community water issues
- Build sanitation and hygiene habits
- Access water conservation tips and educational resources
- Get AI-powered guidance from the Gemini-powered AquaCare Assistant

> ⚠️ **Disclaimer:** AquaCare is an educational and awareness tool. It does not replace professional lab water testing or municipal water safety reports. Always consult local authorities for water quality emergencies.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Backend | Node.js + Express |
| AI | Google Gemini API (`gemini-2.0-flash`) |
| Charts | Chart.js (CDN) |
| Storage | Browser localStorage |

---

## 🚀 Setup & Installation

### Prerequisites
- **Node.js** v18 or higher — [Download here](https://nodejs.org)
- A free **Google Gemini API key** — [Get it here](https://aistudio.google.com/app/apikey)

### Step 1 — Clone / Download the project

```bash
# If you downloaded a zip, extract it, then open a terminal in the aquacare folder
cd aquacare
```

### Step 2 — Install dependencies

```bash
npm install
```

### Step 3 — Configure your API key

```bash
# Copy the example env file
cp .env.example .env
```

Open `.env` in any text editor and replace `your_gemini_api_key_here` with your actual Gemini API key:

```
GEMINI_API_KEY=AIzaSy...your_real_key_here
PORT=3000
```

### Step 4 — Start the server

```bash
npm start
```

You should see:

```
🌊 AquaCare server running at http://localhost:3000
   Gemini model: gemini-2.0-flash
   API key configured: ✅ Yes
```

### Step 5 — Open in browser

Navigate to **http://localhost:3000**

---

## 🔥 Development Mode (auto-restart on save)

```bash
npm run dev
```

*(Requires nodemon — it's included as a dev dependency)*

---

## 📁 Project Structure

```
aquacare/
├── .env.example          # Environment variable template
├── .env                  # Your local env (DO NOT commit to git)
├── package.json
├── README.md
├── server/
│   └── server.js         # Express server + Gemini API proxy
└── public/
    ├── index.html        # Main SPA shell
    ├── css/
    │   └── style.css     # Blue/cyan water theme
    └── js/
        ├── app.js        # Dashboard + charts + localStorage core
        ├── tracker.js    # Water usage tracker
        ├── harvesting.js # Rainwater harvesting calculator
        ├── community.js  # Community water issue logger
        ├── sanitation.js # Sanitation & hygiene tracker
        ├── tips.js       # Action library + awareness hub
        └── ai.js         # Chat widget + daily tip (Gemini)
```

---

## 🌟 Features

| # | Feature |
|---|---------|
| 1 | **Dashboard** — Cards + Chart.js charts for 7-day overview |
| 2 | **Water Usage Tracker** — Log drinking/cooking/washing/gardening |
| 3 | **Rainwater Calculator** — Roof area × rainfall = savings estimate |
| 4 | **Community Issue Logger** — Log & view local water problems |
| 5 | **Hygiene Tracker** — Daily checklist with hygiene score |
| 6 | **Water-Saving Tips Library** — Filterable cards by category |
| 7 | **Awareness Hub** — Articles on purification, sanitation rights |
| 8 | **AI Chat Assistant** — Gemini-powered, safety-scoped chatbot |
| 9 | **AI Daily Tip** — Personalized nudge based on your usage data |
| 10 | **Water-Stress Alerts** — Auto flags for high consumption patterns |

---

## 🔒 Security Notes

- The Gemini API key lives **only in `.env`** on the server — it is never sent to the browser.
- All AI requests go through `/api/chat` and `/api/daily-tip` on your local Express server.
- Add `.env` to `.gitignore` before pushing to any public repository.

---

## 🌍 SDG 6 Alignment

This project supports **UN Sustainable Development Goal 6** — *Ensure availability and sustainable management of water and sanitation for all* — by:

- Raising awareness about water consumption and conservation
- Empowering communities to report and track water issues
- Educating users on low-cost purification and sanitation practices
- Providing AI-guided, accessible water literacy tools

---

## 📄 License

MIT — Free to use, modify, and distribute for educational purposes.
