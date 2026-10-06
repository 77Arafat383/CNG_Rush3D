/**
 * CNG Rush 3D - User Interface & HUD Controller
 */

class UIManager {
    constructor() {
        this.cacheDOM();
        this.setupEventListeners();
        this.floatingTextContainer = document.getElementById('floating-container');
        this.speechBubble = document.getElementById('speech-bubble');
        this.speechBubbleText = document.getElementById('speech-text');
        this.speechTimeout = null;
    }

    cacheDOM() {
        // Screens
        this.screenStart = document.getElementById('screen-start');
        this.screenHowTo = document.getElementById('modal-howto');
        this.screenPause = document.getElementById('modal-pause');
        this.screenLevelUp = document.getElementById('modal-levelup');
        this.screenGameOver = document.getElementById('modal-gameover');
        this.hud = document.getElementById('hud');

        // HUD elements
        this.elMoney = document.getElementById('hud-money');
        this.elScore = document.getElementById('hud-score');
        this.elLevel = document.getElementById('hud-level');
        this.elTimer = document.getElementById('hud-timer');
        this.elSpeed = document.getElementById('hud-speed');
        this.elConditionBar = document.getElementById('hud-condition-bar');
        this.elFuelBar = document.getElementById('hud-fuel-bar');
        this.elObjective = document.getElementById('hud-objective');
        this.elPickupPrompt = document.getElementById('hud-pickup-prompt');
        this.elRepairAlert = document.getElementById('hud-repair-alert');

        // Passenger Card
        this.cardPassenger = document.getElementById('hud-passenger-card');
        this.elPassAvatar = document.getElementById('card-avatar');
        this.elPassName = document.getElementById('card-name');
        this.elPassFare = document.getElementById('card-fare');
        this.elPatienceBar = document.getElementById('card-patience-bar');
        this.elPassNote = document.getElementById('card-note');

        // Audio toggle
        this.btnAudioToggle = document.getElementById('btn-audio-toggle');
    }

    setupEventListeners() {
        // Start screen buttons
        document.getElementById('btn-start-play').addEventListener('click', () => {
            window.soundManager.playClick();
            window.game.startGame();
        });

        document.getElementById('btn-start-howto').addEventListener('click', () => {
            window.soundManager.playClick();
            this.showModal('modal-howto');
        });

        document.getElementById('btn-close-howto').addEventListener('click', () => {
            window.soundManager.playClick();
            this.hideModal('modal-howto');
        });

        const startExitBtn = document.getElementById('btn-start-exit');
        if (startExitBtn) {
            startExitBtn.addEventListener('click', () => {
                window.soundManager.playClick();
                if (confirm('Are you sure you want to exit?')) {
                    window.close();
                    this.showFloatingText('You can now safely close this browser tab.', '#f87171');
                }
            });
        }

        // HUD View & Pause Toggle buttons
        const btnCameraToggle = document.getElementById('btn-camera-toggle');
        if (btnCameraToggle) {
            btnCameraToggle.addEventListener('click', () => {
                window.soundManager.playClick();
                const mode = window.game.toggleCameraView();
                this.showFloatingText(mode === 'DRIVER' ? '🎥 DRIVER COCKPIT VIEW' : '🎥 CHASE VIEW', '#00e5ff');
            });
        }

        const btnPauseToggle = document.getElementById('btn-pause-toggle');
        if (btnPauseToggle) {
            btnPauseToggle.addEventListener('click', () => {
                window.soundManager.playClick();
                if (window.game.state === 'PLAYING') {
                    window.game.pauseGame();
                } else if (window.game.state === 'PAUSED') {
                    window.game.resumeGame();
                }
            });
        }

        // Pause menu buttons
        document.getElementById('btn-pause-resume').addEventListener('click', () => {
            window.soundManager.playClick();
            window.game.resumeGame();
        });

        const btnPauseCamera = document.getElementById('btn-pause-camera');
        if (btnPauseCamera) {
            btnPauseCamera.addEventListener('click', () => {
                window.soundManager.playClick();
                const mode = window.game.toggleCameraView();
                this.showFloatingText(mode === 'DRIVER' ? '🎥 DRIVER COCKPIT VIEW' : '🎥 CHASE VIEW', '#00e5ff');
            });
        }

        document.getElementById('btn-pause-restart').addEventListener('click', () => {
            window.soundManager.playClick();
            window.game.restartGame();
        });

        document.getElementById('btn-pause-menu').addEventListener('click', () => {
            window.soundManager.playClick();
            window.game.showMenu();
        });

        // Level Up & Game Over buttons
        document.getElementById('btn-next-level').addEventListener('click', () => {
            window.soundManager.playClick();
            window.game.continueNextLevel();
        });

        document.getElementById('btn-gameover-restart').addEventListener('click', () => {
            window.soundManager.playClick();
            window.game.restartGame();
        });

        // Audio toggle button
        this.btnAudioToggle.addEventListener('click', () => {
            const isMuted = window.soundManager.toggleMute();
            this.btnAudioToggle.innerText = isMuted ? '🔇' : '🔊';
        });

        // Keyboard shortcuts (Pause, Restart, Camera View Toggle)
        window.addEventListener('keydown', (e) => {
            if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
                if (window.game.state === 'PLAYING') {
                    window.game.pauseGame();
                } else if (window.game.state === 'PAUSED') {
                    window.game.resumeGame();
                }
            }
            if (e.key === 'c' || e.key === 'C' || e.key === 'v' || e.key === 'V') {
                if (window.game.state === 'PLAYING' || window.game.state === 'PAUSED') {
                    const mode = window.game.toggleCameraView();
                    this.showFloatingText(mode === 'DRIVER' ? '🎥 DRIVER COCKPIT VIEW' : '🎥 CHASE VIEW', '#00e5ff');
                }
            }
            if ((e.key === 'r' || e.key === 'R') && (window.game.state === 'GAME_OVER' || window.game.state === 'DAY_COMPLETE' || window.game.state === 'PAUSED')) {
                window.game.restartGame();
            }
        });
    }

    showStartScreen() {
        this.screenStart.classList.remove('hidden');
        this.hud.classList.add('hidden');
        this.hideAllModals();

        // Update high scores on start screen
        document.getElementById('start-best-score').innerText = window.scoring.bestScore.toLocaleString();
        document.getElementById('start-best-earnings').innerText = '৳' + window.scoring.bestEarnings.toLocaleString();
    }

    hideStartScreen() {
        this.screenStart.classList.add('hidden');
        this.hud.classList.remove('hidden');
    }

    showModal(modalId) {
        document.getElementById(modalId).classList.remove('hidden');
    }

    hideModal(modalId) {
        document.getElementById(modalId).classList.add('hidden');
    }

    hideAllModals() {
        this.screenHowTo.classList.add('hidden');
        this.screenPause.classList.add('hidden');
        this.screenLevelUp.classList.add('hidden');
        this.screenGameOver.classList.add('hidden');
    }

    showPauseMenu() {
        this.screenPause.classList.remove('hidden');
    }

    hidePauseMenu() {
        this.screenPause.classList.add('hidden');
    }

    showLevelUpModal(levelInfo) {
        document.getElementById('levelup-title').innerText = levelInfo.title;
        document.getElementById('levelup-desc').innerText = levelInfo.description;
        document.getElementById('levelup-earnings').innerText = '৳' + window.scoring.money.toLocaleString();
        document.getElementById('levelup-trips').innerText = window.scoring.tripsCompleted;
        this.showModal('modal-levelup');
    }

    showGameOverModal(isVictory = false, customReason = null) {
        const titleEl = document.getElementById('gameover-title');
        const subtitleEl = document.getElementById('gameover-subtitle');

        if (isVictory) {
            titleEl.innerText = 'DAY COMPLETE! 🎉';
            titleEl.style.color = '#00e676';
            subtitleEl.innerText = 'Outstanding shift! You conquered the streets of Dhaka!';
        } else {
            titleEl.innerText = 'DAY OVER 🛑';
            titleEl.style.color = '#ff5252';
            subtitleEl.innerText = customReason || (window.player && window.player.condition <= 0 ? 'CNG broke down from severe road damage! 💥' : 'Shift concluded.');
        }

        document.getElementById('go-final-earnings').innerText = '৳' + window.scoring.money.toLocaleString();
        document.getElementById('go-final-score').innerText = window.scoring.score.toLocaleString();
        document.getElementById('go-trips-done').innerText = window.scoring.tripsCompleted;
        document.getElementById('go-rating').innerText = window.scoring.getAverageRating() + ' ★';
        document.getElementById('go-collisions').innerText = window.scoring.collisionsCount;
        document.getElementById('go-horns').innerText = window.scoring.hornUses;
        document.getElementById('go-high-score').innerText = window.scoring.bestScore.toLocaleString();

        this.showModal('modal-gameover');
    }

    showFloatingText(text, color = '#ffffff') {
        const item = document.createElement('div');
        item.className = 'floating-feedback';
        item.innerText = text;
        item.style.color = color;
        this.floatingTextContainer.appendChild(item);

        setTimeout(() => {
            item.remove();
        }, 1600);
    }

    showSpeechBubble(text, duration = 3.0) {
        if (this.speechTimeout) clearTimeout(this.speechTimeout);
        this.speechBubbleText.innerText = text;
        this.speechBubble.classList.remove('hidden');

        this.speechTimeout = setTimeout(() => {
            this.speechBubble.classList.add('hidden');
        }, duration * 1000);
    }

    updateHUD(data) {
        // Money & Score
        this.elMoney.innerText = '৳' + data.money.toLocaleString();
        this.elScore.innerText = data.score.toLocaleString();
        this.elLevel.innerText = data.level.title;
        this.elTimer.innerText = data.formattedTime;
        this.elSpeed.innerText = data.speedKmh + ' km/h';

        // CNG Condition
        const condPct = Math.max(0, data.condition);
        this.elConditionBar.style.width = condPct + '%';
        if (condPct < 30) {
            this.elConditionBar.style.backgroundColor = '#f44336';
        } else if (condPct < 60) {
            this.elConditionBar.style.backgroundColor = '#ff9800';
        } else {
            this.elConditionBar.style.backgroundColor = '#00e676';
        }

        // Fuel & 4-Minute Fuel Timer
        const fuelPct = Math.max(0, data.fuel);
        this.elFuelBar.style.width = fuelPct + '%';
        if (fuelPct <= 25 || (data.fuelTimer && data.fuelTimer >= 180)) {
            this.elFuelBar.style.backgroundColor = '#ff1744';
            this.elFuelBar.style.boxShadow = '0 0 10px #ff1744';
        } else if (fuelPct <= 50) {
            this.elFuelBar.style.backgroundColor = '#ff9800';
            this.elFuelBar.style.boxShadow = 'none';
        } else {
            this.elFuelBar.style.backgroundColor = '#00e5ff';
            this.elFuelBar.style.boxShadow = 'none';
        }

        // Roadside facility prompts (Repair Shop & Gas Station)
        if (data.nearRepairShop) {
            if (data.condition < 100) {
                if (data.money >= 20) {
                    this.elPickupPrompt.innerText = '🔧 CNG REPAIR SHOP: STOP (< 4 km/h) TO REPAIR TO 100% (৳20)';
                    this.elPickupPrompt.style.background = 'linear-gradient(135deg, rgba(0, 230, 118, 0.95), rgba(0, 150, 136, 0.95))';
                } else {
                    this.elPickupPrompt.innerText = `⚠️ NOT ENOUGH MONEY TO REPAIR! NEEDS ৳20 (YOU HAVE ৳${data.money})`;
                    this.elPickupPrompt.style.background = 'linear-gradient(135deg, rgba(229, 57, 53, 0.95), rgba(183, 28, 28, 0.95))';
                }
            } else {
                this.elPickupPrompt.innerText = '🔧 CNG REPAIR SHOP: VEHICLE IS IN 100% PERFECT HEALTH';
                this.elPickupPrompt.style.background = 'linear-gradient(135deg, rgba(33, 150, 243, 0.9), rgba(0, 188, 212, 0.9))';
            }
            this.elPickupPrompt.classList.remove('hidden');
        } else if (data.nearFuelStation) {
            if (data.fuel < 100) {
                if (data.money >= 25) {
                    this.elPickupPrompt.innerText = '⛽ CNG STATION: STOP (< 4 km/h) TO REFUEL TANK (৳25)';
                    this.elPickupPrompt.style.background = 'linear-gradient(135deg, rgba(255, 152, 0, 0.95), rgba(255, 87, 34, 0.95))';
                } else {
                    this.elPickupPrompt.innerText = `⚠️ NOT ENOUGH MONEY TO REFUEL! NEEDS ৳25 (YOU HAVE ৳${data.money})`;
                    this.elPickupPrompt.style.background = 'linear-gradient(135deg, rgba(229, 57, 53, 0.95), rgba(183, 28, 28, 0.95))';
                }
            } else {
                this.elPickupPrompt.innerText = '⛽ CNG STATION: FUEL TANK IS ALREADY 100% FULL';
                this.elPickupPrompt.style.background = 'linear-gradient(135deg, rgba(33, 150, 243, 0.9), rgba(0, 188, 212, 0.9))';
            }
            this.elPickupPrompt.classList.remove('hidden');
        } else {
            this.elPickupPrompt.style.background = '';
        }

        // Upcoming Repair Shop In-Front Notification Banner
        if (this.elRepairAlert) {
            if (data.upcomingRepair && data.upcomingRepair.distance <= 85 && !data.nearRepairShop) {
                this.elRepairAlert.classList.remove('hidden');
                const side = data.upcomingRepair.side.toUpperCase();
                if (data.condition < 100) {
                    this.elRepairAlert.classList.add('damaged');
                    this.elRepairAlert.innerHTML = `⚠️ CNG DAMAGED (${data.condition}%)! REPAIR SHOP IN FRONT: ${data.upcomingRepair.distance}m (${side} SIDE) ➔ ৳20`;
                } else {
                    this.elRepairAlert.classList.remove('damaged');
                    this.elRepairAlert.innerHTML = `🔧 REPAIR SHOP IN FRONT: ${data.upcomingRepair.distance}m ON ${side} SIDE (৳20 GARAGE)`;
                }
            } else {
                this.elRepairAlert.classList.add('hidden');
            }
        }

        // Active passenger card & objective navigation
        if (data.tripStatus === 'in_progress' && data.passenger) {
            if (data.distRemaining < 30 && data.distRemaining > 0) {
                this.elPickupPrompt.innerText = 'SLOW DOWN (< 18 km/h) TO DROP OFF PASSENGER!';
                this.elPickupPrompt.style.background = '';
                this.elPickupPrompt.classList.remove('hidden');
            } else if (!data.nearRepairShop && !data.nearFuelStation) {
                this.elPickupPrompt.classList.add('hidden');
            }
            this.cardPassenger.classList.remove('hidden');
            this.elPassAvatar.innerText = data.passenger.avatar;
            this.elPassName.innerText = data.passenger.name;
            this.elPassFare.innerText = '৳' + data.fare;
            this.elPassNote.innerText = data.passenger.desc;

            this.elPatienceBar.style.width = Math.max(0, data.patiencePct) + '%';
            if (data.patiencePct < 25) {
                this.elPatienceBar.style.backgroundColor = '#f44336';
            } else if (data.patiencePct < 55) {
                this.elPatienceBar.style.backgroundColor = '#ff9800';
            } else {
                this.elPatienceBar.style.backgroundColor = '#00e676';
            }

            this.elObjective.innerHTML = `📍 <strong>${data.destination.name}</strong> • ${data.distRemaining}m away`;
        } else {
            this.cardPassenger.classList.add('hidden');
            if (data.waitingInfo) {
                const arrow = data.waitingInfo.side === 'Right' ? '➔' : '⬅';
                this.elObjective.innerHTML = `🙋 <strong>${data.waitingInfo.type.avatar} ${data.waitingInfo.type.name}</strong>: ${data.waitingInfo.dist}m ahead on <strong>${data.waitingInfo.side} Sidewalk</strong> ${arrow}`;

                if (data.waitingInfo.dist < 24) {
                    this.elPickupPrompt.innerText = 'SLOW DOWN (< 18 km/h) TO PICK UP PASSENGER!';
                    this.elPickupPrompt.style.background = '';
                    this.elPickupPrompt.classList.remove('hidden');
                } else if (!data.nearRepairShop && !data.nearFuelStation) {
                    this.elPickupPrompt.classList.add('hidden');
                }
            } else {
                if (!data.nearRepairShop && !data.nearFuelStation) {
                    this.elPickupPrompt.classList.add('hidden');
                }
                this.elObjective.innerHTML = '🔍 Driving through Dhaka... Looking for waiting passengers';
            }
        }
    }
}

window.ui = new UIManager();
