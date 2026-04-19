# VenueIQ 🏟️

> **Your real-time smart companion for large-scale sporting venues.**

VenueIQ helps attendees navigate crowds, cut wait times, and stay safe — all through live coordination, an intelligent AI Assistant, and instant alerts, right from their phone.

---

## 🚨 The Problem

Large-scale sporting events are exciting — but they come with a familiar set of frustrations:

- Congested entry gates with no visibility into which lane is fastest
- Long, unpredictable queues at food stalls and restrooms
- No reliable way to receive real-time updates or emergency alerts
- Lack of an on-demand "smart companion" to answer venue-specific questions

VenueIQ fixes this by putting live, actionable venue intelligence directly in attendees' hands.

---

## ✨ Core Features

### 🤖 Venue AI Assistant (Powered by Google Gemini API)
A fully integrated, intelligent chat assistant powered by **Google Gemini 1.5 Pro**. The AI dynamically reads real-time stadium data (queues, crowd density, and active emergencies) to answer attendee questions instantly (e.g., "Where is the shortest food line?", "What is the current emergency?").

### 🗺️ Live Crowd Heatmap (Google Maps API)
An interactive Google Map centered on Wembley Stadium with dynamic, color-coded markers showing real-time crowd density at a glance:

| Color | Density |
|-------|---------|
| 🟢 Green | Low — move freely (< 40%) |
| 🟡 Yellow | Medium — moderate congestion (40-70%) |
| 🔴 Red | High — avoid or reroute (> 70%) |

### ⏱️ Queue Wait Time Tracker
Live wait time estimates for:
- **Entry Gates** — find the fastest way in
- **Food & Beverage Stalls** — grab a snack without missing the action
- **Restrooms** — plan your breaks smarter

### 🔔 Real-Time Alert System
A dynamic notification system that pushes instant announcements for operational updates, emergency alerts, and safety instructions.

---

## 🛡️ Enterprise-Grade Standards

To ensure a premium, production-ready experience, VenueIQ is built with strict adherence to industry standards:

- **Comprehensive Testing:** Fully tested component architecture using **Vitest** and **React Testing Library** to guarantee reliability.
- **Strict Accessibility (a11y):** Built with full Semantic HTML, ARIA labels, `aria-live` regions for screen readers, and full keyboard navigation support.
- **Hardened Security:** Deployed with rigorous Content Security Policy (CSP), X-Frame-Options, and Strict-Transport-Security headers to prevent XSS and clickjacking.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React, Vite, Custom Vanilla CSS |
| **Google Services** | Google Gemini API, Google Maps JavaScript API |
| **Testing** | Vitest, React Testing Library, JSDOM |
| **Hosting & Security**| Firebase Hosting (with custom CSP headers) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm
- Google Gemini API Key
- Google Maps API Key

### Run Locally

```bash
# 1. Navigate to the project directory
cd VenueIQ

# 2. Install dependencies
npm install

# 3. Configure Environment Variables
# Create a .env file in the root directory and add:
# VITE_GOOGLE_MAPS_API_KEY=your_maps_api_key
# VITE_GEMINI_API_KEY=your_gemini_api_key

# 4. Run automated tests (Optional)
npm run test

# 5. Start the development server
npm run dev
```

Then open your browser at **[http://localhost:5173](http://localhost:5173)**

---

## 🌐 Live Demo

👉 [**View Live Demo**](https://venueiq-d0ff7.web.app)

---

## 🏆 About

Built for the **PromptWars Virtual Hackathon** by [Hack2Skill](https://hack2skill.com). 
Designed to showcase advanced integration of Google AI Services, rigorous testing, and accessibility.

---

## 📄 License

This project is open-source. See [LICENSE](./LICENSE) for details.
