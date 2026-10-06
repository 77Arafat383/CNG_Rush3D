========================================================================
                       CNG RUSH 3D
         Dhaka Urban Transportation Arcade & Simulation
========================================================================

Game Title:
CNG Rush 3D

Genre:
3D Driving / Arcade / Passenger Management Simulation

Technology Stack:
HTML5, CSS3, JavaScript (ES6+), Three.js (r128), WebGL, Web Audio API

No Backend, No Python, No Node.js server requirement, No Database, No External APIs.
Completely self-contained and playable 100% offline.


------------------------------------------------------------------------
OBJECTIVE
------------------------------------------------------------------------
Step into the shoes of a Dhaka CNG auto-rickshaw driver!
Find waiting passengers along the bustling streets, pick them up, 
navigate heavy city traffic (buses, cycle-rickshaws, cars, and other CNGs),
choose between safer main roads or risky pothole-filled shortcuts,
manage passenger patience, fuel, and vehicle durability, dodge pedestrians 
and monsoon rains, refuel at filling stations (৳25) and repair at garages (৳20), 
and drive through Dhaka Elevated Expressway signboard gates to advance through levels!


------------------------------------------------------------------------
CONTROLS
------------------------------------------------------------------------
  W  /  ↑ (Up Arrow)     : Accelerate
  S  /  ↓ (Down Arrow)   : Brake / Reverse
  A  /  ← (Left Arrow)   : Steer Left
  D  /  → (Right Arrow)  : Steer Right
  C  /  V                : Toggle Driver (First-Person Cockpit) & Chase View
  SPACE                  : Electric Horn (Alert traffic & pedestrians)
  P  /  ESC              : Pause / Resume Game
  R                      : Quick Restart (After Game Over / Day Complete)
  Camera Icon (Top-Right): Switch Camera View (Chase / Cockpit)
  Pause Icon (Top-Right) : Pause Game (Resume / Restart / Exit to Menu)
  Speaker Icon (Top-Right): Mute / Unmute Audio


------------------------------------------------------------------------
KEY GAMEPLAY MECHANICS & SYSTEMS
------------------------------------------------------------------------
1. Authentic Low-Poly Bangladeshi Aesthetics:
   - Green CNG auto-rickshaw with safety mesh, Dhaka metro license plate,
     fare meter box, rolling wheels, and damaged exhaust smoke.
   - Colorful Dhaka city buses, decorated cycle-rickshaws (রিকশা), cars.
   - Roadside tea stalls (টং দোকান) with tin roof and kettle, shops, 
     Bengali signboards ("ভাই ভাই এন্টারপ্রাইজ"), utility poles, and palm trees.

2. 4 Unique Passenger Personalities:
   - Student in a Hurry (🎓): Short patience, high speed demand, big tip.
   - Elderly Passenger (👴): Sensitive to bumps & potholes, rewards smooth rides.
   - Family with Luggage (🧳): Heavy baggage slows down CNG acceleration & steering.
   - Office-goer (💼): Values quiet driving, hates unnecessary horn honking.

3. Dynamic Target Retargeting System:
   - Missed Passenger: Driving past a waiting passenger without slowing down 
     causes the pedestrian to react verbally, and the target immediately 
     re-routes to the next passenger waiting ahead.
   - Missed Drop Station: Overshooting the drop-off zone triggers dialogue 
     from the passenger, applies a minor patience penalty, and automatically 
     relocates the drop target to the next station down the road.
   - Proximity HUD Alert: Advance reminder appears when within 30m of the destination.

4. Refuel & Repair Economy with Balance Verification:
   - CNG Refueling Station (৳25): Fills the tank to 100% and resets the 4-minute 
     fuel timer. If the driver has less than ৳25, refueling will not happen!
   - Roadside Repair Garage (মা মটরস — ৳20): Restores durability to 100% and 
     extinguishes smoke. If the driver has less than ৳20, repair will not happen!

5. Dhaka Elevated Expressway Level Signboard Gates:
   - Level 1 starts directly on open road (Normal Day tutorial).
   - Fulfilling level trip requirements spawns a physical 3D overhead 
     expressway gantry signboard gate ahead.
   - Equipped with steel trusses, crash barriers, hazard beacons, authority 
     signboards, and electronic green LED lane status indicators (⬇ open arrows).
   - Driving through the gate seamlessly advances to the next level without modal popups.

6. 4 Escalating Challenge Levels:
   - Level 1: Normal Day (Clear skies, light traffic, pickup tutorial)
   - Level 2: Busy Road (More buses & rickshaws, route choices, pedestrian events)
   - Level 3: Rainy Day (Monsoon showers, slippery traction, potholes & puddles)
   - Level 4: Rush Hour (Peak traffic congestion, tight patience, full challenge)

7. 100% Self-Contained Procedural Web Audio:
   - Dynamic engine hum tracking speed and RPM.
   - Iconic Dhaka auto-rickshaw dual-frequency electric horn.
   - Metallic collision crunches, pothole thuds, water splashes,
     passenger pickup arpeggios, and cash coin chimes.


------------------------------------------------------------------------
TEAM MEMBERS & RESPONSIBILITIES
------------------------------------------------------------------------
Member 1: [TEAM MEMBER 1]
- Arcade Vehicle Physics & CNG Controller (js/player.js)
- Chase Camera & Screen Shake (js/camera.js)
- Refuel & Repair Economy Logic (js/player.js)

Member 2: [TEAM MEMBER 2]
- 3D Environment & Procedural Models (js/models.js)
- Modular Recyclable Infinite Road System (js/road.js)
- Expressway Gantry Signboard Gates (js/models.js, js/road.js)
- Dhaka Traffic AI & Object Pooling (js/traffic.js)

Member 3: [TEAM MEMBER 3]
- Passenger System & Dynamic Retargeting (js/passenger.js)
- UI/UX Glassmorphic Design & HUD (index.html, css/style.css, js/ui.js)
- Procedural Web Audio Sound Synthesizer (js/audio.js)
- Scoring, Level Progression & High Scores (js/scoring.js, js/levels.js)


------------------------------------------------------------------------
HOW TO RUN LOCALLY
------------------------------------------------------------------------
Method A (Direct Browser Launch):
1. Double-click or open 'index.html' in any modern web browser 
   (Google Chrome, Microsoft Edge, Mozilla Firefox, Brave).
2. Click "START SHIFT (PLAY)" to begin playing immediately.

Method B (VS Code Live Server / Local Static Server):
1. Open the project folder in VS Code.
2. Right click 'index.html' and select "Open with Live Server".
3. The game will launch at http://127.0.0.1:5500/index.html.

Note: No Node.js, Python, or server-side software is needed.
All libraries (Three.js r128 in libs/three.min.js) and assets are local.
No internet connection is required during gameplay.
========================================================================
