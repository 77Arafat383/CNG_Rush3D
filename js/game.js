/**
 * CNG Rush 3D - Main Game Engine & Loop Orchestrator
 */

class GameEngine {
    constructor() {
        this.state = 'MENU'; // 'MENU' | 'PLAYING' | 'PAUSED' | 'LEVEL_COMPLETE' | 'DAY_COMPLETE' | 'GAME_OVER'
        this.container = document.getElementById('canvas-container');

        this.initThree();
        this.initEntities();
        this.setupResize();

        this.lastTime = performance.now();
        this.refueling = false;
        this.repairServicing = false;
        this.isNightMode = false;

        // Start animation loop
        requestAnimationFrame((t) => this.loop(t));

        // Present Start Screen
        window.ui.showStartScreen();
    }

    initThree() {
        // Scene with Dhaka afternoon fog
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xb0bec5);
        this.scene.fog = new THREE.FogExp2(0xb0bec5, 0.007);

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            600
        );

        // WebGL Renderer with graceful fallback
        try {
            this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            this.container.appendChild(this.renderer.domElement);
        } catch (e) {
            console.error('WebGL not supported:', e);
            document.body.innerHTML = '<div style="color:white;padding:40px;font-family:sans-serif;text-align:center;"><h2>WebGL Not Supported</h2><p>Your browser or graphics hardware does not support the required 3D features. Please enable hardware acceleration or try a modern browser.</p></div>';
            return;
        }

        // Lighting
        this.lights = {
            ambient: new THREE.AmbientLight(0xffffff, 0.75),
            directional: new THREE.DirectionalLight(0xfffaed, 0.85)
        };
        this.lights.directional.position.set(25, 45, 30);
        this.lights.directional.castShadow = true;
        this.lights.directional.shadow.mapSize.width = 1024;
        this.lights.directional.shadow.mapSize.height = 1024;
        this.lights.directional.shadow.camera.near = 10;
        this.lights.directional.shadow.camera.far = 120;
        this.lights.directional.shadow.camera.left = -25;
        this.lights.directional.shadow.camera.right = 25;
        this.lights.directional.shadow.camera.top = 25;
        this.lights.directional.shadow.camera.bottom = -25;

        this.scene.add(this.lights.ambient, this.lights.directional);
    }

    setNightMode(active) {
        this.isNightMode = active;

        if (active) {
            this.scene.background.setHex(0x0a1122);
            this.scene.fog.color.setHex(0x0a1122);
            this.scene.fog.density = 0.008;

            this.lights.ambient.color.setHex(0x223355);
            this.lights.ambient.intensity = 0.35;

            this.lights.directional.color.setHex(0x4466aa);
            this.lights.directional.intensity = 0.35;

            if (this.player && this.player.setHeadlights) {
                this.player.setHeadlights(true);
            }
            window.ui.showFloatingText('🌙 NIGHT MODE ACTIVATED', '#64b5f6');
        } else {
            const isRain = this.events && this.events.isRaining;
            const skyColor = isRain ? 0x607d8b : 0xb0bec5;
            this.scene.background.setHex(skyColor);
            this.scene.fog.color.setHex(skyColor);
            this.scene.fog.density = 0.007;

            this.lights.ambient.color.setHex(isRain ? 0x556677 : 0xffffff);
            this.lights.ambient.intensity = isRain ? 0.55 : 0.75;

            this.lights.directional.color.setHex(0xfffaed);
            this.lights.directional.intensity = isRain ? 0.55 : 0.85;

            if (this.player && this.player.setHeadlights) {
                this.player.setHeadlights(false);
            }
            window.ui.showFloatingText('☀️ DAY MODE ACTIVATED', '#ffd54f');
        }

        if (window.ui && window.ui.updateNightButton) {
            window.ui.updateNightButton(this.isNightMode);
        }
    }

    toggleNightMode() {
        this.setNightMode(!this.isNightMode);
    }

    initEntities() {
        this.player = new PlayerCNG(this.scene);
        window.player = this.player;

        this.chaseCamera = new ChaseCamera(this.camera, this.player);
        this.road = new RoadManager(this.scene);
        this.traffic = new TrafficManager(this.scene);
        this.passengers = new PassengerManager(this.scene, this.player);
        this.events = new EventManager(this.scene, this.player);

        // Level setup
        this.traffic.setLevelDensity(window.levelManager.getCurrentLevel().trafficDensity);
    }

    setupResize() {
        const handleResize = () => {
            if (!this.camera || !this.renderer) return;
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('orientationchange', () => {
            setTimeout(handleResize, 150);
        });
    }

    startGame() {
        window.soundManager.resume();
        window.scoring.reset();
        window.levelManager.reset();

        this.player.reset(0);
        this.road.initRoad();
        this.traffic.clear();
        this.passengers.reset();
        this.events.clear();

        const currentLvl = window.levelManager.getCurrentLevel();
        this.player.setLevelSpeed(currentLvl.topSpeedKmh || 60);
        this.traffic.setLevelDensity(currentLvl.trafficDensity);
        this.events.setRain(currentLvl.hasRain, this.lights);

        this.chaseCamera.reset();
        this.gameOverTriggered = false;
        this.gameOverTimer = 0;
        this.gameOverReason = '';
        this.refueling = false;
        this.repairServicing = false;
        this.state = 'PLAYING';
        window.ui.hideStartScreen();
        window.ui.hideAllModals();

        // Spawn first waiting passenger ahead
        this.passengers.spawnWaitingPassenger(this.player.position.z);

        window.ui.showFloatingText('DAY STARTED! DRIVE SMART!', '#00e676');
    }

    pauseGame() {
        if (this.state !== 'PLAYING') return;
        this.state = 'PAUSED';
        window.soundManager.updateEngine(0, false);
        window.ui.showPauseMenu();
    }

    resumeGame() {
        if (this.state !== 'PAUSED') return;
        this.state = 'PLAYING';
        window.soundManager.resume();
        window.ui.hidePauseMenu();
        this.lastTime = performance.now();
    }

    restartGame() {
        this.startGame();
    }

    toggleCameraView() {
        if (!this.chaseCamera) return 'CHASE';
        return this.chaseCamera.toggleView();
    }

    showMenu() {
        this.state = 'MENU';
        window.soundManager.updateEngine(0, false);
        this.player.reset(0);
        this.road.initRoad();
        this.traffic.clear();
        this.passengers.reset();
        this.events.clear();
        this.chaseCamera.setView('CHASE');
        this.chaseCamera.reset();
        window.ui.showStartScreen();
    }

    continueNextLevel() {
        window.ui.hideModal('modal-levelup');
        this.state = 'PLAYING';

        const currentLvl = window.levelManager.getCurrentLevel();
        this.traffic.setLevelDensity(currentLvl.trafficDensity);
        this.events.setRain(currentLvl.hasRain, this.lights);
        this.player.setLevelSpeed(currentLvl.topSpeedKmh || 60);

        window.ui.showFloatingText(`NOW ENTERING: ${currentLvl.title.toUpperCase()}!`, '#ffd700');
        this.lastTime = performance.now();
    }

    loop(timestamp) {
        requestAnimationFrame((t) => this.loop(t));

        const dt = Math.min((timestamp - this.lastTime) / 1000, 0.1);
        this.lastTime = timestamp;

        if (this.state === 'MENU') {
            this.updateMenuScene(dt);
            this.renderer.render(this.scene, this.camera);
            return;
        }

        if (this.state === 'PLAYING') {
            this.updateGame(dt);
        }

        this.renderer.render(this.scene, this.camera);
    }

    updateMenuScene(dt) {
        // Slow cinematic orbit around showcase CNG in menu
        const time = Date.now() * 0.0006;
        this.camera.position.x = Math.sin(time) * 6.5;
        this.camera.position.z = Math.cos(time) * 6.5;
        this.camera.position.y = 2.4;
        this.camera.lookAt(0, 1.0, 0);
    }

    updateGame(dt) {
        // 1. Update Player & Physics
        const playerStatus = this.player.update(dt);

        // 2. Handle Horn Actions
        if (playerStatus.honked) {
            window.scoring.recordHornUse();
            this.traffic.handlePlayerHorn(this.player.position);
            this.passengers.onHornUsed();
        }

        // 3. Update Camera
        this.chaseCamera.update(dt);

        // Sync directional shadow light to follow player
        this.lights.directional.position.set(
            this.player.position.x + 25,
            45,
            this.player.position.z + 30
        );
        this.lights.directional.target = this.player.mesh;

        // 4. Update Recyclable Road Segments & Passerby Pedestrians
        this.road.recycleBehindPlayer(this.player.position.z);
        this.road.updatePedestrians(dt);

        // 5. Environmental interactions: Potholes
        const potholeHit = this.road.checkPotholeHit(this.player.position);
        if (potholeHit) {
            window.soundManager.playPothole();
            this.chaseCamera.shake(potholeHit.severity === 'large' ? 0.45 : 0.25);
            window.scoring.applyPotholePenalty(potholeHit.severity === 'large' ? 12 : 6);
            this.player.takeDamage(potholeHit.severity === 'large' ? 10 : 5);
            this.passengers.onPothole(potholeHit.severity);
            window.ui.showFloatingText('POTHOLE! -Bump', '#ff9800');
        }

        // Flooded water puddle check
        const inWater = this.road.checkInWater(this.player.position);
        if (inWater && !this.player.inWater) {
            window.soundManager.playWaterSplash();
            window.ui.showFloatingText('SPLASH! FLOODED ROAD!', '#29b6f6');
        }
        this.player.inWater = inWater;

        // Road obstacle collision check (median blocks, barricades, construction hazards, lane blockers)
        const obstacleHit = this.road.checkObstacleCollision(this.player.collider, this.player.position);
        if (obstacleHit) {
            const isMedianBlock = obstacleHit.obstacle.type === 'median_block';
            const isLaneBlocker = obstacleHit.obstacle.type === 'lane_blocker';
            const isGatePillar = obstacleHit.obstacle.type === 'gate_pillar';
            const isBuilding = obstacleHit.obstacle.type === 'roadside_building';

            window.soundManager.playCrash(isGatePillar || isMedianBlock || isBuilding ? 'heavy' : (isLaneBlocker ? 'medium' : 'heavy'));
            this.chaseCamera.shake(isBuilding ? 0.6 : (isLaneBlocker ? 0.42 : 0.55));

            if (isMedianBlock) {
                this.player.speed *= 0.35; // Friction jolt against median concrete barrier
            } else if (isBuilding) {
                this.player.speed = -4.5; // Strong bounce off solid concrete/brick building
            } else {
                this.player.speed = -4.0; // Rebound bounce
            }

            this.player.takeDamage(obstacleHit.damage);
            window.scoring.applyCollisionPenalty(obstacleHit.penalty);
            this.passengers.onCollision('heavy', obstacleHit.penalty);

            if (isBuilding) {
                const buildingShouts = [
                    '🏢 ওরে ভাই! দোকানের দেয়ালে মেরে দিলেন?!',
                    '🏢 আরে সিএনজি ভাই! দেয়াল ভেঙে ভেতরে ঢুকবেন নাকি?!',
                    '🏢 দেখে চালান! দোকানপাটের ক্ষতি করবেন না!'
                ];
                const shout = buildingShouts[Math.floor(Math.random() * buildingShouts.length)];
                window.ui.showSpeechBubble(shout, 2.8);
            }

            const label = isBuilding ? 'CRASHED INTO ROADSIDE BUILDING!' : (isMedianBlock ? 'HIT MEDIAN DIVIDER BLOCK!' : (isGatePillar ? 'HIT GATE PILLAR!' : (isLaneBlocker ? 'HIT LANE BLOCKER!' : 'HIT OBSTACLE!')));
            window.ui.showFloatingText(`💥 ${label} -${obstacleHit.damage}% HP (-৳${obstacleHit.penalty})`, '#ff1744');
        }

        // Roadside property boundary / building wall collision check
        if (playerStatus.buildingHitDamage > 0) {
            window.soundManager.playCrash('heavy');
            this.chaseCamera.shake(0.55);
            const penalty = 25;
            window.scoring.applyCollisionPenalty(penalty);
            this.passengers.onCollision('heavy', penalty);

            const buildingShouts = [
                '🏢 ওরে ভাই! দোকানের দেয়ালে মেরে দিলেন?!',
                '🏢 আরে সিএনজি ভাই! দেয়াল ভেঙে ভেতরে ঢুকবেন নাকি?!',
                '🏢 দেখে চালান! দোকানপাটের ক্ষতি করবেন না!'
            ];
            const shout = buildingShouts[Math.floor(Math.random() * buildingShouts.length)];
            window.ui.showSpeechBubble(shout, 2.8);
            window.ui.showFloatingText(`💥 CRASHED INTO ROADSIDE BUILDING! -${playerStatus.buildingHitDamage}% HP (-৳${penalty})`, '#ff1744');
        }

        // Sidewalk / Roadside Pedestrians collision check (people outside the road)
        const sidewalkPedHit = this.road.checkSidewalkPedestrianHit(this.player.collider, this.player.position);
        if (sidewalkPedHit) {
            window.soundManager.playCrash('medium');
            this.chaseCamera.shake(0.38);
            this.player.speed *= 0.35; // Sudden jolt slowdown
            this.player.takeDamage(sidewalkPedHit.damage);
            window.scoring.applyCollisionPenalty(sidewalkPedHit.penalty);
            this.passengers.onCollision('heavy', sidewalkPedHit.penalty);

            const bengaliShouts = [
                '🚶 আরে ভাই! ফুটপাতে গাড়ি তুললেন ক্যান?!',
                '🚶 এই সিএনজিওয়ালা! দেখে চালান! মানুষ মারবেন নাকি?!',
                '🚶 ওরে বাবারে! ফুটপাতেও সিএনজি হামলা!'
            ];
            const shout = bengaliShouts[Math.floor(Math.random() * bengaliShouts.length)];
            window.ui.showSpeechBubble(shout, 2.8);
            window.ui.showFloatingText(`💥 HIT PEDESTRIAN OUTSIDE ROAD! -${sidewalkPedHit.damage}% HP (-৳${sidewalkPedHit.penalty})`, '#ff1744');
        }

        // Check Level Gate Passing (Automatic level transition without modal)
        const passedGate = this.road.checkLevelGate(this.player.position.z);
        if (passedGate) {
            if (passedGate.isIntro) {
                window.soundManager.playNotificationChime();
                window.ui.showFloatingText(`🚀 WELCOME TO ${passedGate.level ? passedGate.level.title.toUpperCase() : 'LEVEL 1'}!`, '#00e676');
            } else if (passedGate.isVictory) {
                this.state = 'DAY_COMPLETE';
                window.soundManager.playFanfare();
                window.ui.showGameOverModal(true);
            } else {
                // Advance level automatically without popup modal!
                const newLevel = window.levelManager.advanceToNextLevel();
                if (newLevel) {
                    this.traffic.setLevelDensity(newLevel.trafficDensity);
                    this.events.setRain(newLevel.hasRain, this.lights);
                    this.player.setLevelSpeed(newLevel.topSpeedKmh || 60);

                    window.soundManager.playFanfare();
                    window.ui.showFloatingText(`🎉 ${newLevel.title.toUpperCase()}! ⚡ TOP SPEED: ${newLevel.topSpeedKmh} KM/H!`, '#ffd700');
                    window.ui.showSpeechBubble(`স্বাগতম! ${newLevel.bengaliTitle} শুরু হয়েছে! সর্বোচ্চ গতি এখন ${newLevel.topSpeedKmh} km/h!`, 3.5);
                }
            }
        }

        // Fuel Station Refueling check (costs ৳25, resets 4-minute timer to 0 and refuels to 100%)
        const atGasStation = this.road.checkFuelStation(this.player.position);
        if (atGasStation && Math.abs(this.player.speed) < 3.5) {
            if (!this.refueling) {
                const fuelResult = this.player.refuel(25);
                if (fuelResult.refueled) {
                    this.refueling = true;
                    window.soundManager.playNotificationChime();
                    window.ui.showFloatingText(`⛽ CNG TANK FULL (100%)! (-৳${fuelResult.cost})`, '#00e676');
                } else if (fuelResult.reason === 'insufficient_funds') {
                    this.refueling = true;
                    window.soundManager.playEngineStall();
                    window.ui.showFloatingText(`⚠️ NOT ENOUGH MONEY! REFUEL COSTS ৳${fuelResult.cost}`, '#ff1744');
                    window.ui.showSpeechBubble(`পাম্প কর্মী: "ভাই, গ্যাস নিতে ২৫ টাকা লাগবে! আপনার কাছে যথেষ্ট টাকা নেই!"`, 3.0);
                } else if (fuelResult.reason === 'already_full') {
                    this.refueling = true;
                    window.ui.showFloatingText('⛽ TANK IS ALREADY 100% FULL!', '#00e5ff');
                }
            }
        } else {
            this.refueling = false;
        }

        // Repair Shop Check (costs ৳20 to repair/recover CNG condition to 100%)
        const atRepairShop = this.road.checkRepairShop(this.player.position);
        if (atRepairShop && Math.abs(this.player.speed) < 3.5) {
            if (!this.repairServicing) {
                const repResult = this.player.repair(20);
                if (repResult) {
                    if (repResult.repaired) {
                        this.repairServicing = true;
                        window.ui.showFloatingText(`🔧 CNG REPAIRED TO 100%! (-৳${repResult.cost})`, '#00e676');
                    } else if (repResult.reason === 'insufficient_funds') {
                        this.repairServicing = true;
                        window.soundManager.playCrash('small');
                        window.ui.showFloatingText(`⚠️ NOT ENOUGH MONEY! REPAIR COSTS ৳${repResult.cost}`, '#ff1744');
                        window.ui.showSpeechBubble(`গ্যারেজ মিস্ত্রি: "ভাই, মেরামত করতে ২০ টাকা লাগবে! আপনার কাছে টাকা নেই!"`, 3.0);
                    } else if (repResult.reason === 'already_full') {
                        this.repairServicing = true;
                        window.ui.showFloatingText('🔧 VEHICLE IS ALREADY IN 100% HEALTH!', '#00e5ff');
                    }
                }
            }
        } else {
            this.repairServicing = false;
        }

        // Notification if repair shop is in front
        const upcomingRepair = this.road.getUpcomingRepairShop(this.player.position, 110);
        if (upcomingRepair && upcomingRepair.distance <= 75) {
            if (!upcomingRepair.zone.notified) {
                upcomingRepair.zone.notified = true;
                window.soundManager.playNotificationChime();
                const sideText = upcomingRepair.side === 'Right' ? 'ডানপাশে' : 'বামপাশে';
                window.ui.showSpeechBubble(`🔧 সামনে ${upcomingRepair.distance}m দূরে গ্যারেজ আছে! রাস্তা থেকে ${sideText} নামুন (৳২০ মেরামত)।`);
                window.ui.showFloatingText(`🔔 REPAIR SHOP IN FRONT: ${upcomingRepair.distance}m!`, '#00e5ff');
            }
        }

        // Fuel Notifications & Stalling
        if (playerStatus.lowFuelWarning) {
            window.soundManager.playLowFuelBeep();
            window.ui.showFloatingText('⚠️ LOW FUEL! (1 MINUTE REMAINING!) Find CNG Station!', '#ff9100');
            window.ui.showSpeechBubble('⚠️ ভাইজান, গ্যাস প্রায় শেষ! আর ১ মিনিট চলবে! জলদি পাম্পে যান!');
        }

        if (playerStatus.justRanOutOfFuel) {
            window.soundManager.playEngineStall();
            window.ui.showFloatingText('⛽ OUT OF FUEL! Engine stalled!', '#f44336');
            window.ui.showSpeechBubble('🚫 সিএনজির গ্যাস শেষ! গাড়ি বন্ধ হয়ে গেছে!');
        }

        // 6. Update Traffic & Check Vehicle Collisions
        this.traffic.update(dt, this.player.position, this.player.speed, this.player.collider);
        const trafficHit = this.traffic.checkCollisions(this.player.collider, this.player.speed, this.player.position);
        if (trafficHit) {
            window.soundManager.playCrash(trafficHit.severity);
            this.chaseCamera.shake(trafficHit.severity === 'heavy' ? 0.6 : 0.35);

            window.scoring.applyCollisionPenalty(trafficHit.penalty);
            this.player.takeDamage(trafficHit.damage);
            this.passengers.onCollision(trafficHit.severity, trafficHit.penalty);

            // Rebound bounce
            this.player.speed = -3.5;

            window.ui.showFloatingText(`COLLISION! -৳${trafficHit.penalty}`, '#f44336');
        }

        // 7. Update Passengers (Pickup / In-transit / Delivery)
        const nearWaiting = this.passengers.waitingPassenger &&
            Math.hypot(this.player.position.x - this.passengers.waitingPassenger.x, this.player.position.z - this.passengers.waitingPassenger.z) < 18;

        if (nearWaiting) {
            this.passengers.checkPickup(this.player.position, playerStatus.speedKmh);
        }

        const tripUpdate = this.passengers.update(dt, this.player.position, playerStatus.speedKmh);
        if (tripUpdate && tripUpdate.status === 'completed') {
            // Check if level requirements are fulfilled
            const checkResult = window.levelManager.onTripCompleted(tripUpdate.result.total);
            if (checkResult && checkResult.levelComplete) {
                setTimeout(() => {
                    if (this.state !== 'PLAYING') return;
                    if (checkResult.isLastLevel) {
                        this.road.spawnLevelGate(this.player.position.z, null, true, false);
                        window.soundManager.playNotificationChime();
                        window.ui.showFloatingText('🏁 ALL TRIPS COMPLETE! DRIVE THROUGH THE VICTORY GATE AHEAD!', '#ffd700');
                    } else {
                        this.road.spawnLevelGate(this.player.position.z, checkResult.nextLevel, false, false);
                        window.soundManager.playNotificationChime();
                        window.ui.showFloatingText(`🚪 GATE AHEAD: ${checkResult.nextLevel.title.toUpperCase()}! DRIVE THROUGH!`, '#00e5ff');
                    }
                }, 1800);
            }
        }

        // 8. Update Random Events (Cow Crossing, Pedestrians, Rain)
        this.events.update(dt, this.player.position, playerStatus.speedKmh, window.levelManager.getCurrentLevel().id);

        // 9. Update Elapsed Shift Time (no time limit)
        window.scoring.update(dt);

        // 10. Check CNG Condition / Out-of-Fuel / Game Over
        if (this.player.condition <= 0) {
            if (!this.gameOverTriggered) {
                this.gameOverTriggered = true;
                this.gameOverReason = 'CNG BROKE DOWN! 💥 Vehicle took too much road obstacle damage.';
                window.soundManager.playCrash('heavy');
            }
        } else if (this.player.outOfFuel && Math.abs(this.player.speed) < 0.6) {
            if (!this.gameOverTriggered) {
                this.gameOverTriggered = true;
                this.gameOverReason = 'OUT OF FUEL! ⛽ Driven 4 minutes without refueling.';
                window.soundManager.playEngineStall();
            }
        }

        if (this.gameOverTriggered) {
            this.gameOverTimer += dt;
            if (this.gameOverTimer >= 1.2) {
                this.state = 'GAME_OVER';
                window.soundManager.playGameOver();
                window.ui.showGameOverModal(false, this.gameOverReason);
                return;
            }
        }

        // 11. Update HUD
        window.ui.updateHUD({
            money: window.scoring.money,
            score: window.scoring.score,
            level: window.levelManager.getCurrentLevel(),
            formattedTime: window.scoring.getFormattedTime(),
            speedKmh: playerStatus.speedKmh,
            condition: this.player.condition,
            fuel: this.player.fuel,
            fuelTimer: this.player.fuelTimer,
            nearRepairShop: atRepairShop,
            upcomingRepair: upcomingRepair,
            nearFuelStation: atGasStation,
            showPickupPrompt: nearWaiting && !this.passengers.currentPassenger,
            waitingInfo: tripUpdate.waiting,
            tripStatus: tripUpdate.status,
            passenger: tripUpdate.passenger,
            destination: tripUpdate.destination,
            distRemaining: tripUpdate.distRemaining,
            isOvershot: tripUpdate.isOvershot,
            needsPullToSide: tripUpdate.needsPullToSide,
            patiencePct: tripUpdate.patiencePct,
            fare: tripUpdate.fare
        });
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.game = new GameEngine();
});
