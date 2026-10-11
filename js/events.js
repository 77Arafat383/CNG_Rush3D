/**
 * CNG Rush 3D - Environmental Events & Weather System
 * Implements Rain particle effects, Dhaka Cow Crossing event, and roadside pedestrians.
 */

class EventManager {
    constructor(scene, player) {
        this.scene = scene;
        this.player = player;

        // Rain System
        this.isRaining = false;
        this.rainParticles = null;
        this.rainCount = 1200;
        this.initRain();

        // Crossing Pedestrian
        this.crossingPed = null;
        this.pedActive = false;
        this.pedTimer = 25.0;
    }

    initRain() {
        this.rainCount = 2200;
        const rainGeo = new THREE.BufferGeometry();
        const positions = new Float32Array(this.rainCount * 3);
        for (let i = 0; i < this.rainCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 50;
            positions[i * 3 + 1] = Math.random() * 26;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 60;
        }
        rainGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        // Rain streak canvas texture for clear visual visibility
        const rCanvas = document.createElement('canvas');
        rCanvas.width = 16;
        rCanvas.height = 64;
        const rctx = rCanvas.getContext('2d');
        const grad = rctx.createLinearGradient(8, 0, 8, 64);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.0)');
        grad.addColorStop(0.3, 'rgba(180, 220, 255, 0.5)');
        grad.addColorStop(0.8, 'rgba(220, 240, 255, 0.95)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 1.0)');
        rctx.fillStyle = grad;
        rctx.fillRect(5, 0, 6, 64);
        const rainTex = new THREE.CanvasTexture(rCanvas);

        const rainMat = new THREE.PointsMaterial({
            color: 0xd0e8ff,
            size: 1.25,
            map: rainTex,
            transparent: true,
            opacity: 0.85,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        this.rainParticles = new THREE.Points(rainGeo, rainMat);
        this.rainParticles.frustumCulled = false; // Disables frustum culling so rain stays visible as player drives
        this.rainParticles.visible = false;
        this.scene.add(this.rainParticles);
    }

    setRain(active, sceneLights) {
        this.isRaining = active;
        this.rainParticles.visible = active;
        window.soundManager.setRain(active);

        if (active) {
            // Seed all rain particles immediately around player's current location!
            const positions = this.rainParticles.geometry.attributes.position.array;
            const px = this.player ? this.player.position.x : 0;
            const pz = this.player ? this.player.position.z : 0;
            for (let i = 0; i < this.rainCount; i++) {
                positions[i * 3] = px + (Math.random() - 0.5) * 50;
                positions[i * 3 + 1] = Math.random() * 26;
                positions[i * 3 + 2] = pz + (Math.random() - 0.5) * 60;
            }
            this.rainParticles.geometry.attributes.position.needsUpdate = true;

            // Darker ambient lighting & reduced tire traction
            this.player.tractionModifier = 0.74;
            if (sceneLights && sceneLights.directional) {
                sceneLights.directional.intensity = 0.5;
            }
            if (sceneLights && sceneLights.ambient) {
                sceneLights.ambient.color.setHex(0x556677);
            }
            if (window.game && !window.game.isNightMode) {
                this.scene.background.setHex(0x607d8b);
                this.scene.fog.color.setHex(0x607d8b);
            }
        } else {
            this.player.tractionModifier = 1.0;
            if (sceneLights && sceneLights.directional) {
                sceneLights.directional.intensity = 0.85;
            }
            if (sceneLights && sceneLights.ambient) {
                sceneLights.ambient.color.setHex(0xffffff);
            }
            if (window.game && !window.game.isNightMode) {
                this.scene.background.setHex(0xb0bec5);
                this.scene.fog.color.setHex(0xb0bec5);
            }
        }
    }

    triggerPedestrianCrossing(playerZ) {
        if (this.pedActive) return;

        if (!this.crossingPed) {
            this.crossingPed = ModelFactory.createPedestrian('general');
            this.scene.add(this.crossingPed);
        }

        // Spawn pedestrian crossing
        this.crossingPed.position.set(-8.0, 0.2, playerZ + 38);
        this.crossingPed.rotation.y = Math.PI / 2;
        this.crossingPed.visible = true;
        this.pedActive = true;

        window.ui.showFloatingText('🚶 PEDESTRIAN CROSSING!', '#ffd600');
    }

    update(dt, playerPos, playerSpeedKmh, levelId) {
        // 1. Update Rain Particles
        if (this.isRaining && this.rainParticles) {
            const positions = this.rainParticles.geometry.attributes.position.array;
            for (let i = 0; i < this.rainCount; i++) {
                positions[i * 3 + 1] -= (35 + Math.random() * 10) * dt;
                positions[i * 3 + 2] += 2.0 * dt; // slight forward slant
                if (positions[i * 3 + 1] < 0 || Math.abs(positions[i * 3 + 2] - playerPos.z) > 40 || Math.abs(positions[i * 3] - playerPos.x) > 25) {
                    positions[i * 3 + 1] = 20 + Math.random() * 6;
                    positions[i * 3] = playerPos.x + (Math.random() - 0.5) * 45;
                    positions[i * 3 + 2] = playerPos.z + (Math.random() - 0.5) * 60;
                }
            }
            this.rainParticles.geometry.attributes.position.needsUpdate = true;
        }

        // 2. Crossing Pedestrian Lifecycle
        this.pedTimer -= dt;
        if (this.pedTimer <= 0 && !this.pedActive) {
            this.pedTimer = 12 + Math.random() * 14;
            this.triggerPedestrianCrossing(playerPos.z);
        }

        if (this.pedActive && this.crossingPed) {
            this.crossingPed.position.x += 2.2 * dt;

            // Swing legs and arms
            const walkCycle = Math.sin(Date.now() * 0.01) * 0.45;
            if (this.crossingPed.userData.leftLeg && this.crossingPed.userData.rightLeg) {
                this.crossingPed.userData.leftLeg.rotation.x = walkCycle;
                this.crossingPed.userData.rightLeg.rotation.x = -walkCycle;
            }
            if (this.crossingPed.userData.leftArm && this.crossingPed.userData.rightArm) {
                this.crossingPed.userData.leftArm.rotation.x = -walkCycle;
                this.crossingPed.userData.rightArm.rotation.x = walkCycle;
            }

            // Collision check
            const pedDist = Math.hypot(playerPos.x - this.crossingPed.position.x, playerPos.z - this.crossingPed.position.z);
            if (pedDist < 1.6) {
                window.soundManager.playCrash('small');
                window.ui.showFloatingText('PEDESTRIAN JOLT! -৳15 Fine', '#e53935');
                window.ui.showSpeechBubble('🚶 ও ভাই! দেখে চালান না!', 2.2);
                window.scoring.applyTripPenalty(15);
                this.player.takeDamage(8);
                this.player.speed *= 0.4;
                this.pedActive = false;
                this.crossingPed.visible = false;
            } else if (this.crossingPed.position.x > 8.5) {
                this.pedActive = false;
                this.crossingPed.visible = false;
            }
        }
    }

    clear() {
        if (this.crossingPed) {
            this.crossingPed.visible = false;
            this.pedActive = false;
        }
        this.setRain(false);
    }
}

window.EventManager = EventManager;

