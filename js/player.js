/**
 * CNG Rush 3D - Player CNG Controller & Arcade Physics
 */

class PlayerCNG {
    constructor(scene) {
        this.scene = scene;
        this.mesh = ModelFactory.createCNG();
        this.scene.add(this.mesh);

        // Position & orientation
        this.position = this.mesh.position;
        this.position.set(0, 0, 0);
        this.rotation = this.mesh.rotation;

        // Arcade vehicle dynamics
        this.speed = 0;              // Current forward speed (units/s)
        this.maxSpeed = 22;          // ~65 km/h
        this.maxReverseSpeed = -6;   // ~18 km/h
        this.accel = 16;             // Base acceleration
        this.brakeForce = 28;        // Braking deceleration
        this.friction = 5.5;         // Natural coasting deceleration
        this.steerAngle = 0;         // Wheel steer angle
        this.maxSteerAngle = 0.55;   // ~31 degrees
        this.steerSpeed = 3.2;       // Steering responsiveness
        this.steerReturn = 4.5;      // Center return speed

        // Health & durability
        this.condition = 100;        // 100% condition

        // Fuel system (Exactly 4 minutes of fuel, warning at 3 minutes)
        this.fuelDuration = 240.0;   // 240 seconds = 4 minutes
        this.fuelTimer = 0.0;        // Time driven without refueling
        this.fuel = 100;             // Percentage (100% to 0%)
        this.lowFuelWarned = false;
        this.outOfFuel = false;

        // Modifiers
        this.massModifier = 1.0;     // Passenger weight impact (e.g. Family with Luggage = 1.3)
        this.tractionModifier = 1.0; // Weather impact (rain = 0.72)
        this.inWater = false;

        // Collision bounding box
        this.width = 1.5;
        this.length = 2.6;
        this.collider = new THREE.Box3();

        // Horn tracking
        this.hornCooldown = 0;
        this.hornActive = false;

        // Smoke particles when damaged
        this.initSmokeParticles();

        // Input state
        this.inputs = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            horn: false
        };

        this.setupKeyboard();
    }

    setupKeyboard() {
        window.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            if (key === 'w' || key === 'arrowup') this.inputs.forward = true;
            if (key === 's' || key === 'arrowdown') this.inputs.backward = true;
            if (key === 'a' || key === 'arrowleft') this.inputs.left = true;
            if (key === 'd' || key === 'arrowright') this.inputs.right = true;
            if (key === ' ' || e.code === 'Space') {
                e.preventDefault();
                this.inputs.horn = true;
            }
        });

        window.addEventListener('keyup', (e) => {
            const key = e.key.toLowerCase();
            if (key === 'w' || key === 'arrowup') this.inputs.forward = false;
            if (key === 's' || key === 'arrowdown') this.inputs.backward = false;
            if (key === 'a' || key === 'arrowleft') this.inputs.left = false;
            if (key === 'd' || key === 'arrowright') this.inputs.right = false;
            if (key === ' ' || e.code === 'Space') {
                this.inputs.horn = false;
                this.hornActive = false;
            }
        });
    }

    initSmokeParticles() {
        this.smokeParticles = [];
        const smokeGeo = new THREE.SphereGeometry(0.16, 4, 4);
        const smokeMat = new THREE.MeshBasicMaterial({ color: 0x444444, transparent: true, opacity: 0.6 });
        for (let i = 0; i < 15; i++) {
            const p = new THREE.Mesh(smokeGeo, smokeMat);
            p.visible = false;
            p.userData = { life: 0, maxLife: 0.8, vx: 0, vy: 0, vz: 0 };
            this.scene.add(p);
            this.smokeParticles.push(p);
        }
    }

    updateSmoke(dt) {
        if (this.condition < 40) {
            // Emit smoke from exhaust pipe
            const p = this.smokeParticles.find(part => !part.visible);
            if (p && Math.random() < 0.4) {
                p.visible = true;
                p.position.set(this.position.x - 0.4, 0.4, this.position.z - 1.4);
                p.userData.life = 0;
                p.userData.vy = 1.0 + Math.random() * 0.8;
                p.userData.vx = (Math.random() - 0.5) * 0.5;
                p.userData.vz = -this.speed * 0.4 - Math.random() * 0.8;
                p.scale.setScalar(0.7);
            }
        }

        this.smokeParticles.forEach(p => {
            if (p.visible) {
                p.userData.life += dt;
                if (p.userData.life >= p.userData.maxLife) {
                    p.visible = false;
                } else {
                    p.position.x += p.userData.vx * dt;
                    p.position.y += p.userData.vy * dt;
                    p.position.z += p.userData.vz * dt;
                    const progress = p.userData.life / p.userData.maxLife;
                    p.scale.setScalar(0.7 + progress * 2.2);
                    p.material.opacity = (1 - progress) * 0.6;
                }
            }
        });
    }

    reset(startZ = 0) {
        this.position.set(0, 0, startZ);
        this.rotation.set(0, 0, 0);
        this.speed = 0;
        this.steerAngle = 0;
        this.condition = 100;
        this.fuelTimer = 0;
        this.fuel = 100;
        this.lowFuelWarned = false;
        this.outOfFuel = false;
        this.massModifier = 1.0;
        this.tractionModifier = 1.0;
        this.inWater = false;
        this.smokeParticles.forEach(p => p.visible = false);
    }

    takeDamage(amount) {
        this.condition = Math.max(0, this.condition - amount);
        return this.condition;
    }

    refuel(cost = 25) {
        if (this.fuel >= 100 && this.fuelTimer <= 0) {
            return { refueled: false, reason: 'already_full', cost: 0 };
        }
        if (cost > 0) {
            if (window.scoring.money < cost) {
                return { refueled: false, reason: 'insufficient_funds', cost: cost, needed: cost - window.scoring.money };
            }
            window.scoring.money -= cost;
        }

        this.fuel = 100;
        this.fuelTimer = 0;
        this.lowFuelWarned = false;
        this.outOfFuel = false;
        return { refueled: true, cost: cost };
    }

    repair(cost = 20) {
        if (this.condition >= 100) {
            return { repaired: false, reason: 'already_full', cost: 0 };
        }
        if (cost > 0) {
            if (window.scoring.money < cost) {
                return { repaired: false, reason: 'insufficient_funds', cost: cost, needed: cost - window.scoring.money };
            }
            window.scoring.money -= cost;
        }

        this.condition = 100;
        this.smokeParticles.forEach(p => p.visible = false);
        window.soundManager.playRepair();
        return { repaired: true, cost: cost };
    }

    update(dt) {
        if (dt > 0.1) dt = 0.1; // Clamp delta time

        // 0. Update 4-Minute Fuel Timer & Out-of-Fuel Check
        let triggeredFuelWarning = false;
        let triggeredOutOfFuel = false;

        if (this.condition > 0 && !this.outOfFuel) {
            this.fuelTimer += dt;
            this.fuel = Math.max(0, (1.0 - (this.fuelTimer / this.fuelDuration)) * 100);

            // Warning after 3 minutes (180s) without refueling
            if (this.fuelTimer >= 180.0 && !this.lowFuelWarned) {
                this.lowFuelWarned = true;
                triggeredFuelWarning = true;
            }

            // Empty & stop after 4 minutes (240s) without refueling
            if (this.fuelTimer >= this.fuelDuration) {
                this.fuel = 0;
                this.outOfFuel = true;
                triggeredOutOfFuel = true;
            }
        }

        // Calculate dynamic limits
        const isBroken = this.condition <= 0;
        const canDrive = !this.outOfFuel && !isBroken;
        const effectiveAccel = (this.accel / this.massModifier) * (this.inWater ? 0.45 : 1.0);
        const effectiveMaxSpeed = this.maxSpeed * (this.inWater ? 0.55 : 1.0);
        const effectiveBrake = this.brakeForce * this.tractionModifier;

        // 1. Acceleration / Braking
        if (this.inputs.forward && canDrive) {
            if (this.speed < 0) {
                this.speed += effectiveBrake * dt;
            } else {
                this.speed = Math.min(effectiveMaxSpeed, this.speed + effectiveAccel * dt);
            }
        } else if (this.inputs.backward && canDrive) {
            if (this.speed > 0) {
                this.speed = Math.max(0, this.speed - effectiveBrake * dt);
            } else {
                this.speed = Math.max(this.maxReverseSpeed, this.speed - (effectiveAccel * 0.6) * dt);
            }
        } else {
            // Natural coasting deceleration / stall stop
            const decel = (isBroken || this.outOfFuel) ? this.friction * 2.2 : (this.friction / this.massModifier);
            if (this.speed > 0) {
                this.speed = Math.max(0, this.speed - decel * dt);
            } else if (this.speed < 0) {
                this.speed = Math.min(0, this.speed + decel * dt);
            }
        }

        // 2. Steering physics
        // Steering becomes slightly less responsive at high speed
        const speedRatio = Math.abs(this.speed) / this.maxSpeed;
        const speedSteerFactor = Math.max(0.65, 1.0 - speedRatio * 0.35);

        if (this.inputs.left) {
            this.steerAngle = Math.min(this.maxSteerAngle, this.steerAngle + this.steerSpeed * speedSteerFactor * dt);
        } else if (this.inputs.right) {
            this.steerAngle = Math.max(-this.maxSteerAngle, this.steerAngle - this.steerSpeed * speedSteerFactor * dt);
        } else {
            // Self-centering
            if (this.steerAngle > 0) {
                this.steerAngle = Math.max(0, this.steerAngle - this.steerReturn * dt);
            } else if (this.steerAngle < 0) {
                this.steerAngle = Math.min(0, this.steerAngle + this.steerReturn * dt);
            }
        }

        // 3. Apply vehicle yaw rotation based on speed and steer angle
        if (Math.abs(this.speed) > 0.05) {
            const turnRate = (this.speed / 2.7) * Math.tan(this.steerAngle) * this.tractionModifier;
            this.rotation.y += turnRate * dt;
        }

        // 4. Update position based on facing direction
        const forwardVector = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotation.y);
        this.position.x += forwardVector.x * this.speed * dt;
        this.position.z += forwardVector.z * this.speed * dt;

        // Lateral road & sidewalk boundaries (road is ±7.5, sidewalk extends to ±12.0)
        const isOffroad = Math.abs(this.position.x) > 7.5;
        if (isOffroad) {
            this.speed *= (1.0 - 0.12 * dt); // Rough curb & sidewalk friction
        }

        if (this.position.x < -10.8) {
            this.position.x = -10.8;
            this.speed *= 0.5; // Outer shop wall barrier
        } else if (this.position.x > 10.8) {
            this.position.x = 10.8;
            this.speed *= 0.5;
        }

        // 5. Visual Roll & Pitch (leans into turns, pitches on brake/gas)
        const targetRoll = -this.steerAngle * (this.speed / this.maxSpeed) * 0.15;
        this.rotation.z += (targetRoll - this.rotation.z) * 0.12;

        let targetPitch = 0;
        if (this.inputs.forward && this.speed < this.maxSpeed) targetPitch = -0.03;
        if (this.inputs.backward && this.speed > 0) targetPitch = 0.04;
        this.rotation.x += (targetPitch - this.rotation.x) * 0.1;

        // 6. Animate wheels
        if (this.mesh.userData.frontWheelGroup) {
            this.mesh.userData.frontWheelGroup.rotation.y = this.steerAngle;
        }
        if (this.mesh.userData.wheels) {
            const wheelRollSpeed = (this.speed / 0.32) * dt;
            this.mesh.userData.wheels.forEach(w => {
                w.rotation.x += wheelRollSpeed;
            });
        }

        // 7. Update Bounding Box
        this.collider.setFromCenterAndSize(
            new THREE.Vector3(this.position.x, 0.9, this.position.z),
            new THREE.Vector3(this.width, 1.8, this.length)
        );

        // 8. Update Smoke
        this.updateSmoke(dt);

        // 9. Update Engine Audio
        window.soundManager.updateEngine(Math.abs(this.speed) / this.maxSpeed, true);

        // 10. Horn handling
        if (this.hornCooldown > 0) {
            this.hornCooldown -= dt;
        }
        let justHonked = false;
        if (this.inputs.horn && !this.hornActive && this.hornCooldown <= 0) {
            this.hornActive = true;
            this.hornCooldown = 0.45;
            window.soundManager.playHorn();
            justHonked = true;
        }

        return {
            speedKmh: Math.round(Math.abs(this.speed) * 3.6),
            honked: justHonked,
            fuel: this.fuel,
            fuelTimer: this.fuelTimer,
            condition: this.condition,
            lowFuelWarning: triggeredFuelWarning,
            justRanOutOfFuel: triggeredOutOfFuel,
            outOfFuel: this.outOfFuel,
            isBroken: isBroken
        };
    }
}

window.PlayerCNG = PlayerCNG;
