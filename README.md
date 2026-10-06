# 🛺 CNG Rush 3D
### *Dhaka Urban Transportation Arcade & Simulation*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Technology](https://img.shields.io/badge/Technology-Three.js%20%7C%20WebGL%20%7C%20HTML5-00e676.svg)]()
[![Offline Ready](https://img.shields.io/badge/Offline-100%25%20Self--Contained-00e5ff.svg)]()

A lightweight 3D driving, passenger-management, traffic-dodging, and route-selection browser game inspired by the vibrant, unpredictable everyday CNG auto-rickshaw transportation experience in Dhaka, Bangladesh.

Built for university game-development presentations — completely self-contained with **no backend, no Node.js server, no Python, and zero external runtime dependencies**.

---

## 🎮 Game Overview

Step into the shoes of a Dhaka CNG auto-rickshaw driver!
- 🚏 **Find & Pick Up Passengers**: Locate waiting commuters along Dhaka sidewalks.
- 🚗 **Navigate Heavy Traffic**: Dodge colorful Dhaka city buses, cycle-rickshaws (রিকশা), private cars, and fellow CNGs.
- 🛣️ **Choose Routes**: Decide between the **Safe Main Road** (dense traffic) or the **Risky Shortcut** (faster, but riddled with potholes).
- 🚧 **Hazard Barricades & Breakdowns**: Avoid road construction obstacles — severe collisions inflict 25% damage; after multiple hits, the CNG breaks down!
- 🔧 **Roadside Repair Shops (গ্যারেজ)**: Pull over into roadside garages to repair vehicle health to 100% for **৳20**, with advance in-front alert notifications.
- ⛽ **4-Minute Fuel Timer**: Stop at CNG filling stations before the 4-minute timer expires (alert warning sounded at 3 minutes).
- 🐄 **Cultural Events**: React to sudden road-crossing cows (*গরু*), monsoon rainstorms (*বৃষ্টি*), and flooded road puddles.
- 💰 **Earn Bangladeshi Taka (৳)**: Manage passenger patience, minimize horn spam, and aim for the **"PERFECT TRIP!" (+৳50)** bonus.

---

## ⌨️ Controls

| Key | Action |
| :--- | :--- |
| <kbd>W</kbd> / <kbd>↑</kbd> | Accelerate forward |
| <kbd>S</kbd> / <kbd>↓</kbd> | Brake / Reverse |
| <kbd>A</kbd> / <kbd>←</kbd> | Steer Left |
| <kbd>D</kbd> / <kbd>→</kbd> | Steer Right |
| <kbd>C</kbd> / <kbd>V</kbd> | **Toggle Camera View** (First-Person Cockpit 🎥 / Third-Person Chase) |
| <kbd>SPACE</kbd> | **Electric Horn** (Alerts nearby traffic & crossing pedestrians) |
| <kbd>P</kbd> / <kbd>ESC</kbd> | **Pause / Resume Game** |
| <kbd>R</kbd> | **Quick Restart** (during Pause or after Game Over) |
| **HUD Icons** (Top-Right) | Clickable controls for Camera Toggle, Pause Menu, and Audio Mute |

---

## 🌟 Key Gameplay Mechanics & Features

### 1. Authentic Dhaka Urban Environment
- **Detailed Low-Poly 3D CNG**: Green Dhaka auto-rickshaw with safety mesh cage, front wheel fork, Dhaka Metro license plate, fare meter console, and dynamic exhaust smoke.
- **Local Traffic**: Colorful Dhaka local buses, cycle-rickshaws with painted tin plates, private sedans, and rival CNGs.
- **Dhaka Street Life**: Roadside tea stalls (*টং দোকান*) with boiling kettle, sidewalk shops (*"ভাই ভাই এন্টারপ্রাইজ"*, *"নিউ ঢাকা ফার্মেসি"*), utility poles, palm trees, and animated pedestrians walking along both sidewalks.

### 2. 4 Unique Passenger Personalities
Each passenger features tailored behaviors, patience thresholds, and tipping criteria:
- 🎓 **Student in a Hurry**: Short patience, high speed requirement; rewards fast delivery with a huge tip.
- 👴 **Elderly Passenger**: Sensitive to bumps and potholes; penalizes rough driving and rewards smooth rides.
- 🧳 **Family with Luggage**: Heavy luggage noticeably affects CNG acceleration and steering weight.
- 💼 **Office-Goer**: Values quiet, professional driving; dislikes horn spamming and rewards horn discipline.

### 3. Obstacles, Durability & Breakdown
- **Road Obstacles & Collisions**: Construction barricades with yellow hazard stripes and flashing amber lamps inflict **25% damage** and bounce the vehicle back.
- **Vehicle Breakdown**: If condition drops to 0%, the engine stalls, dense black smoke billows, and the vehicle breaks down, ending the game.

### 4. Roadside Repair Shop (মা মটরস — ৳২০)
- **Repair Bay**: Roadside garages with Bengali signage (*"মা মটরস — সিএনজি মেরামত ও গ্যারেজ"*) and a cyan guidance beacon.
- **Advance In-Front Notification**: Audio chime, floating notification, and dynamic HUD distance banner alert the driver when a garage is 75m ahead.
- **20 Taka Service**: Pull into the bay (< 4 km/h) to restore vehicle health to 100% for **৳20**.

### 5. 4-Minute Fuel Timer & Refueling
- **Active Fuel Timer**: 4 minutes (240s) of active driving per tank.
- **3-Minute Alert (180s)**: Warning beep sound, pulsing red HUD fuel gauge, and Bengali speech bubble alert (*"⚠️ ভাইজান, গ্যাস প্রায় শেষ!"*).
- **Engine Stall**: Car stalls and shuts down at 4 minutes if not refueled.
- **Refueling**: Stopping at roadside CNG gas stations fills the tank to 100% and resets the 4-minute timer.

### 6. 4 Escalating Challenge Levels
1. **Level 1 — Normal Day**: Clear afternoon, gentle traffic, passenger pickup & delivery tutorial.
2. **Level 2 — Busy Road**: Denser traffic, cow crossings (*গরু*), and route choice gantries.
3. **Level 3 — Rainy Day**: Monsoon storm particle rain, wet asphalt reflections, reduced traction, potholes, and flooded puddles.
4. **Level 4 — Rush Hour**: Peak Dhaka congestion, tight passenger patience, aggressive traffic, and multi-obstacle hazards.

### 7. Procedural Web Audio Engine
100% synthesized in real-time via the Web Audio API (zero external `.mp3` or `.wav` dependencies):
- Dynamic engine hum responding to speed and throttle.
- Dual-frequency Dhaka electric auto-rickshaw horn.
- Mechanical ratchet clicks and repair completion chimes.
- Fuel alert warning beeps and engine stall splutters.
- Metal crunches, pothole thuds, water splashes, cow moos, and cash chimes.

---

## 📁 Project Structure

```
CNG Rush 2/
├── index.html           # Main game entry point & UI overlay modals
├── README.md            # Complete game documentation & guide
├── css/
│   └── style.css        # Responsive glassmorphic UI, animations & HUD styling
├── js/
│   ├── game.js          # Core game loop, scene management & state controller
│   ├── player.js        # CNG arcade vehicle physics, fuel timer & damage handling
│   ├── models.js        # Low-poly 3D models (CNG, Bus, Rickshaw, Garage, Barricades)
│   ├── road.js          # Modular infinite recyclable road & obstacle system
│   ├── traffic.js       # Dhaka traffic AI, lane management & vehicle pooling
│   ├── passengers.js    # Passenger generation, patience timers & delivery logic
│   ├── camera.js        # Dual-mode camera (Cockpit Driver View & Chase View)
│   ├── audio.js         # Procedural Web Audio API sound synthesizer
│   ├── events.js        # Random events (Cow crossing, rainstorm, flooded road)
│   ├── scoring.js       # Fare calculations, tip economy, fines & localStorage
│   └── levels.js        # 4-stage level progression & traffic difficulty scaling
└── libs/
    └── three.min.js     # Bundled local Three.js (r128) library
```

---

## 👥 Team Members & Responsibilities

| Member | Focus Area | Key Modules |
| :--- | :--- | :--- |
| **Member 1** | Vehicle Physics & Collision System | [`js/player.js`](file:///e:/Projects/CNG%20Rush%202/js/player.js), [`js/camera.js`](file:///e:/Projects/CNG%20Rush%202/js/camera.js) |
| **Member 2** | 3D Environment & Traffic Management | [`js/models.js`](file:///e:/Projects/CNG%20Rush%202/js/models.js), [`js/road.js`](file:///e:/Projects/CNG%20Rush%202/js/road.js), [`js/traffic.js`](file:///e:/Projects/CNG%20Rush%202/js/traffic.js), [`js/events.js`](file:///e:/Projects/CNG%20Rush%202/js/events.js) |
| **Member 3** | UI/UX, Passenger Economy & Audio Engine | [`js/game.js`](file:///e:/Projects/CNG%20Rush%202/js/game.js), [`js/ui.js`](file:///e:/Projects/CNG%20Rush%202/js/ui.js), [`js/audio.js`](file:///e:/Projects/CNG%20Rush%202/js/audio.js), [`js/passengers.js`](file:///e:/Projects/CNG%20Rush%202/js/passengers.js), [`js/scoring.js`](file:///e:/Projects/CNG%20Rush%202/js/scoring.js) |

---

## 🚀 How to Run Locally

### Method 1: Direct Browser Launch
1. Double-click or open [`index.html`](file:///e:/Projects/CNG%20Rush%202/index.html) directly in any modern desktop browser (Chrome, Edge, Firefox, Brave, Safari).
2. Click **START SHIFT (PLAY)** to begin driving immediately.

### Method 2: VS Code Live Server / Local Web Server
1. Open the project folder in Visual Studio Code.
2. Right-click [`index.html`](file:///e:/Projects/CNG%20Rush%202/index.html) and select **"Open with Live Server"**.
3. Access the game at `http://127.0.0.1:5500/index.html`.

> [!NOTE]
> No backend, Python, Node.js server, or external downloads are required. The entire game runs 100% offline from local files.
