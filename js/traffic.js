/**
 * CNG Rush 3D - Traffic System & Semi-Random Traffic AI
 * Spawns, updates, and pools Dhaka city traffic (Buses, Rickshaws, Cars, CNGs).
 */

class TrafficManager {
    constructor(scene) {
        this.scene = scene;
        this.vehicles = [];
        this.pool = {
            bus: [],
            rickshaw: [],
            car: [],
            cng: []
        };

        // 4 Lane centers (left to right in driving direction)
        // Standard Dhaka driving is left-hand side, but for 4-lane one-way / multi-lane city avenue:
        this.lanes = [-5.2, -1.8, 1.8, 5.2];

        // Active density config (set by current level)
        this.maxVehicles = 8;
        this.spawnDistanceMin = 50;
        this.spawnDistanceMax = 130;
        this.despawnDistanceBehind = 40;
        this.despawnDistanceAhead = 220;

        this.spawnTimer = 0;
        this.spawnInterval = 2.0; // Seconds between spawn attempts
    }

    setLevelDensity(densityLevel) {
        // densityLevel: 1 (normal) to 4 (rush hour)
        switch (densityLevel) {
            case 1:
                this.maxVehicles = 6;
                this.spawnInterval = 3.0;
                break;
            case 2:
                this.maxVehicles = 9;
                this.spawnInterval = 2.2;
                break;
            case 3:
                this.maxVehicles = 11;
                this.spawnInterval = 1.8;
                break;
            case 4:
                this.maxVehicles = 15;
                this.spawnInterval = 1.2;
                break;
            default:
                this.maxVehicles = 8;
                this.spawnInterval = 2.0;
        }
    }

    createPooledVehicle(type) {
        let mesh;
        let length = 3.5;
        let width = 1.6;
        let baseSpeed = 10;

        if (type === 'bus') {
            mesh = ModelFactory.createBus();
            length = 7.0;
            width = 2.3;
            baseSpeed = 9.0; // ~32 km/h
        } else if (type === 'rickshaw') {
            mesh = ModelFactory.createRickshaw();
            length = 2.4;
            width = 1.3;
            baseSpeed = 4.2; // ~15 km/h
        } else if (type === 'cng') {
            mesh = ModelFactory.createOtherCNG();
            length = 2.7;
            width = 1.6;
            baseSpeed = 9.5; // ~34 km/h
        } else {
            mesh = ModelFactory.createCar();
            length = 4.2;
            width = 1.8;
            baseSpeed = 13.0; // ~47 km/h
        }

        mesh.visible = false;
        this.scene.add(mesh);

        const v = {
            mesh: mesh,
            type: type,
            active: false,
            x: 0,
            z: 0,
            laneIndex: 0,
            targetLaneX: 0,
            speed: baseSpeed,
            baseSpeed: baseSpeed,
            width: width,
            length: length,
            collider: new THREE.Box3(),
            laneChangeTimer: 5 + Math.random() * 8,
            hornReactionTimer: 0
        };

        return v;
    }

    getVehicleFromPool(type) {
        let v = this.pool[type].find(item => !item.active);
        if (!v) {
            v = this.createPooledVehicle(type);
            this.pool[type].push(v);
        }
        return v;
    }

    spawnVehicle(playerZ) {
        if (this.vehicles.length >= this.maxVehicles) return;

        // Choose vehicle type based on weights
        const rand = Math.random();
        let type = 'car';
        if (rand < 0.28) type = 'rickshaw';
        else if (rand < 0.55) type = 'bus';
        else if (rand < 0.78) type = 'cng';
        else type = 'car';

        // Select lane: Rickshaws prefer outer lanes (-5.2 or 5.2), buses middle/left
        let availableLanes = [0, 1, 2, 3];
        if (type === 'rickshaw') {
            availableLanes = [0, 3];
        }
        const laneIndex = availableLanes[Math.floor(Math.random() * availableLanes.length)];
        const laneX = this.lanes[laneIndex];

        // Determine spawn Z
        const spawnZ = playerZ + this.spawnDistanceMin + Math.random() * (this.spawnDistanceMax - this.spawnDistanceMin);

        // Check if lane is already occupied near this Z
        const tooClose = this.vehicles.some(v => v.active && Math.abs(v.x - laneX) < 1.8 && Math.abs(v.z - spawnZ) < 18);
        if (tooClose) return;

        const v = this.getVehicleFromPool(type);
        v.active = true;
        v.x = laneX;
        v.z = spawnZ;
        v.targetLaneX = laneX;
        v.laneIndex = laneIndex;
        v.speed = v.baseSpeed * (0.85 + Math.random() * 0.3);
        v.laneChangeTimer = 4 + Math.random() * 8;
        v.hornReactionTimer = 0;

        v.mesh.position.set(v.x, 0, v.z);
        v.mesh.rotation.set(0, 0, 0);
        v.mesh.visible = true;

        this.vehicles.push(v);
    }

    handlePlayerHorn(playerPos) {
        // When player honks, nearby vehicles ahead react
        let reactedCount = 0;
        this.vehicles.forEach(v => {
            if (!v.active) return;
            const distAhead = v.z - playerPos.z;
            const distSide = Math.abs(v.x - playerPos.x);

            if (distAhead > 0 && distAhead < 35 && distSide < 4.0) {
                v.hornReactionTimer = 2.0; // React for 2 seconds
                reactedCount++;

                if (v.type === 'rickshaw') {
                    // Rickshaw yields towards nearest roadside curb
                    v.targetLaneX = v.x < 0 ? -6.2 : 6.2;
                } else if (v.type === 'car' || v.type === 'cng') {
                    // Car speeds up to get out of the way or shifts lane
                    v.speed = Math.min(v.baseSpeed * 1.45, 18);
                } else if (v.type === 'bus') {
                    // Bus maintains pace or gently yields
                    v.speed = Math.min(v.baseSpeed * 1.2, 14);
                }
            }
        });
        return reactedCount;
    }

    update(dt, playerZ) {
        this.spawnTimer += dt;
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnTimer = 0;
            this.spawnVehicle(playerZ);
        }

        for (let i = 0; i < this.vehicles.length; i++) {
            const v = this.vehicles[i];
            if (!v.active) continue;

            // Despawn if far behind or too far ahead
            if (v.z < playerZ - this.despawnDistanceBehind || v.z > playerZ + this.despawnDistanceAhead) {
                v.active = false;
                v.mesh.visible = false;
                this.vehicles.splice(i, 1);
                i--;
                continue;
            }

            // AI Navigation: Check for vehicles ahead in the same lane
            let vehicleAheadDist = 999;
            for (let j = 0; j < this.vehicles.length; j++) {
                if (i === j) continue;
                const other = this.vehicles[j];
                if (!other.active) continue;
                if (Math.abs(other.x - v.x) < 1.6 && other.z > v.z) {
                    const d = other.z - v.z;
                    if (d < vehicleAheadDist) {
                        vehicleAheadDist = d;
                    }
                }
            }

            // Slow down if tailgating
            if (vehicleAheadDist < 14) {
                v.speed = Math.max(2.0, v.speed - 8.0 * dt);
            } else if (v.hornReactionTimer <= 0) {
                // Return to base speed
                if (v.speed < v.baseSpeed) {
                    v.speed = Math.min(v.baseSpeed, v.speed + 3.0 * dt);
                }
            }

            if (v.hornReactionTimer > 0) {
                v.hornReactionTimer -= dt;
            }

            // Smooth lane changing
            if (Math.abs(v.x - v.targetLaneX) > 0.05) {
                const moveStep = Math.sign(v.targetLaneX - v.x) * 2.8 * dt;
                v.x += moveStep;
            } else {
                v.x = v.targetLaneX;
            }

            // Occasional natural lane changes for cars and CNGs
            v.laneChangeTimer -= dt;
            if (v.laneChangeTimer <= 0 && v.type !== 'rickshaw' && vehicleAheadDist < 25) {
                v.laneChangeTimer = 6 + Math.random() * 10;
                // Switch to adjacent lane if clear
                const possibleLanes = [v.laneIndex - 1, v.laneIndex + 1].filter(idx => idx >= 0 && idx < this.lanes.length);
                if (possibleLanes.length > 0) {
                    const newLane = possibleLanes[Math.floor(Math.random() * possibleLanes.length)];
                    v.laneIndex = newLane;
                    v.targetLaneX = this.lanes[newLane];
                }
            }

            // Advance vehicle forward
            v.z += v.speed * dt;
            v.mesh.position.set(v.x, 0, v.z);

            // Wheel rotation animation
            if (v.mesh.userData.wheels) {
                const rotDelta = (v.speed / 0.4) * dt;
                v.mesh.userData.wheels.forEach(w => w.rotation.x += rotDelta);
            }

            // Update bounding box collider
            v.collider.setFromCenterAndSize(
                new THREE.Vector3(v.x, 1.0, v.z),
                new THREE.Vector3(v.width, 2.0, v.length)
            );
        }
    }

    checkCollisions(playerCollider, playerSpeed) {
        for (let i = 0; i < this.vehicles.length; i++) {
            const v = this.vehicles[i];
            if (!v.active) continue;

            if (playerCollider.intersectsBox(v.collider)) {
                // Collision detected! Calculate severity based on relative speed and mass
                let severity = 'medium';
                let penalty = 10;
                let damage = 12;

                if (v.type === 'bus') {
                    severity = 'heavy';
                    penalty = 20;
                    damage = 25;
                } else if (v.type === 'rickshaw') {
                    severity = 'small';
                    penalty = 8;
                    damage = 8;
                } else if (v.type === 'car') {
                    severity = 'medium';
                    penalty = 12;
                    damage = 15;
                }

                // Bump vehicle away slightly
                v.speed *= 0.5;

                return {
                    vehicle: v,
                    severity: severity,
                    penalty: penalty,
                    damage: damage
                };
            }
        }
        return null;
    }

    clear() {
        this.vehicles.forEach(v => {
            v.active = false;
            v.mesh.visible = false;
        });
        this.vehicles = [];
    }
}

window.TrafficManager = TrafficManager;
