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
        const rainGeo = new THREE.BufferGeometry();
        const positions = new Float32Array(this.rainCount * 3);
        for (let i = 0; i < this.rainCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 60;
            positions[i * 3 + 1] = Math.random() * 30;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 60;
        }
        rainGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const rainMat = new THREE.PointsMaterial({
            color: 0x90caf9,
            size: 0.18,
            transparent: true,
            opacity: 0.75
        });

        this.rainParticles = new THREE.Points(rainGeo, rainMat);
        this.rainParticles.visible = false;
        this.scene.add(this.rainParticles);
    }

    setRain(active, sceneLights) {
        this.isRaining = active;
        this.rainParticles.visible = active;
        window.soundManager.setRain(active);

        if (active) {
            // Darker ambient lighting & reduced tire traction
            this.player.tractionModifier = 0.74;
            if (sceneLights && sceneLights.directional) {
                sceneLights.directional.intensity = 0.55;
            }
            if (sceneLights && sceneLights.ambient) {
                sceneLights.ambient.color.setHex(0x556677);
            }
        } else {
            this.player.tractionModifier = 1.0;
            if (sceneLights && sceneLights.directional) {
                sceneLights.directional.intensity = 1.0;
            }
            if (sceneLights && sceneLights.ambient) {
                sceneLights.ambient.color.setHex(0xffffff);
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
                positions[i * 3 + 1] -= (28 + Math.random() * 8) * dt;
                if (positions[i * 3 + 1] < 0) {
                    positions[i * 3 + 1] = 25 + Math.random() * 5;
                    positions[i * 3] = playerPos.x + (Math.random() - 0.5) * 50;
                    positions[i * 3 + 2] = playerPos.z + (Math.random() - 0.5) * 50;
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

