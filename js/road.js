/**
 * CNG Rush 3D - Modular Recyclable Infinite Road System
 * Handles road segments, scenery, route choices, potholes, flooded zones, and roadside stations.
 */

class RoadManager {
    constructor(scene) {
        this.scene = scene;
        this.segmentLength = 80;
        this.roadWidth = 15; // 4 lanes (~3.75m each)
        this.sidewalkWidth = 4.5;
        this.numSegments = 8; // Visible distance ~640 units

        this.segments = [];
        this.potholes = [];
        this.floodedZones = [];
        this.fuelZones = [];
        this.repairZones = [];
        this.obstacles = [];
        this.roadBlocks = [];

        this.furthestZ = 0;
        this.currentSegmentIndex = 0;
        this.levelGate = null;

        // Shared geometries for performance
        this.initGeometries();
        this.initRoad();
    }

    initGeometries() {
        this.roadGeo = new THREE.PlaneGeometry(this.roadWidth, this.segmentLength);
        this.roadGeo.rotateX(-Math.PI / 2);

        this.sidewalkGeo = new THREE.BoxGeometry(this.sidewalkWidth, 0.35, this.segmentLength);
        this.sidewalkMat = new THREE.MeshLambertMaterial({ color: 0x9e9e9e });
        this.curbMat = new THREE.MeshLambertMaterial({ color: 0x546e7a });

        // Lane divider dashed lines
        this.dashMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        this.yellowDividerMat = new THREE.MeshBasicMaterial({ color: 0xf1c40f });

        // Grassy / dirt ground outside sidewalks
        this.groundGeo = new THREE.PlaneGeometry(60, this.segmentLength);
        this.groundGeo.rotateX(-Math.PI / 2);
        this.groundMat = new THREE.MeshLambertMaterial({ color: 0x3d5431 });
    }

    createSegment(type, zPosition) {
        const seg = new THREE.Group();
        seg.position.z = zPosition;
        seg.userData = {
            type: type,
            z: zPosition,
            potholes: [],
            floods: [],
            fuelPumps: [],
            repairZones: [],
            obstacles: [],
            blockades: []
        };

        // 1. Asphalt Road Surface
        const road = new THREE.Mesh(this.roadGeo, ModelFactory.materials.asphalt);
        road.position.y = 0;
        road.receiveShadow = true;
        seg.add(road);

        // Ground terrain flanking road
        const leftGround = new THREE.Mesh(this.groundGeo, this.groundMat);
        leftGround.position.set(- (this.roadWidth / 2 + this.sidewalkWidth + 30), -0.05, 0);
        const rightGround = new THREE.Mesh(this.groundGeo, this.groundMat);
        rightGround.position.set((this.roadWidth / 2 + this.sidewalkWidth + 30), -0.05, 0);
        seg.add(leftGround, rightGround);

        // 2. Sidewalks & Curbs
        const leftWalk = new THREE.Mesh(this.sidewalkGeo, this.sidewalkMat);
        leftWalk.position.set(- (this.roadWidth / 2 + this.sidewalkWidth / 2), 0.175, 0);
        const rightWalk = new THREE.Mesh(this.sidewalkGeo, this.sidewalkMat);
        rightWalk.position.set((this.roadWidth / 2 + this.sidewalkWidth / 2), 0.175, 0);
        seg.add(leftWalk, rightWalk);

        // 3. Lane Markings
        // Center double yellow line
        const centerLineGeo = new THREE.PlaneGeometry(0.2, this.segmentLength);
        centerLineGeo.rotateX(-Math.PI / 2);
        const centerLine = new THREE.Mesh(centerLineGeo, this.yellowDividerMat);
        centerLine.position.set(0, 0.015, 0);
        seg.add(centerLine);

        // White dashed lane markings
        const numDashes = 10;
        const dashLen = 3.5;
        const dashSpacing = this.segmentLength / numDashes;
        const dashGeo = new THREE.PlaneGeometry(0.18, dashLen);
        dashGeo.rotateX(-Math.PI / 2);

        [-3.6, 3.6].forEach(laneX => {
            for (let i = 0; i < numDashes; i++) {
                const dash = new THREE.Mesh(dashGeo, this.dashMat);
                dash.position.set(laneX, 0.015, -this.segmentLength / 2 + i * dashSpacing + dashLen / 2);
                seg.add(dash);
            }
        });

        // 4. Scenery Props (Trees, Shops, Utility Poles, Tea Stalls)
        this.populateScenery(seg, type);

        // 5. Specialized Content by Segment Type
        if (type === 'fork') {
            // Overhead Route Decision Sign
            const gantry = ModelFactory.createOverheadGantry('MAIN ROAD (SAFE)', 'SHORTCUT (POTHOLES)');
            gantry.position.set(0, 0, -10);
            seg.add(gantry);

            // Add concrete island / median divider separating left and right lanes
            const divider = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.55, 35), this.curbMat);
            divider.position.set(0, 0.275, 12);
            seg.add(divider);

            // Register concrete median divider block as obstacle so hitting it causes damage!
            const divCollider = new THREE.Box3().setFromCenterAndSize(
                new THREE.Vector3(0, 0.5, zPosition + 12),
                new THREE.Vector3(0.85, 1.2, 35.0)
            );
            seg.userData.obstacles.push({
                mesh: divider,
                collider: divCollider,
                x: 0,
                z: zPosition + 12,
                width: 0.85,
                length: 35.0,
                damage: 20,
                penalty: 15,
                hit: false,
                type: 'median_block'
            });

            // Right side (shortcut) has potholes
            const p1 = ModelFactory.createPothole('small');
            p1.position.set(3.8, 0.02, 10);
            seg.add(p1);
            seg.userData.potholes.push({ mesh: p1, worldZ: zPosition + 10, x: 3.8, radius: 0.9, severity: 'small' });

            const p2 = ModelFactory.createPothole('large');
            p2.position.set(5.2, 0.02, 22);
            seg.add(p2);
            seg.userData.potholes.push({ mesh: p2, worldZ: zPosition + 22, x: 5.2, radius: 1.4, severity: 'large' });
        } else if (type === 'pothole_stretch') {
            // Random potholes across different lanes
            const pConfigs = [
                { x: -3.5, zOff: -20, size: 'small' },
                { x: 1.8, zOff: -5, size: 'large' },
                { x: -1.5, zOff: 15, size: 'small' },
                { x: 4.5, zOff: 28, size: 'large' }
            ];
            pConfigs.forEach(cfg => {
                const pot = ModelFactory.createPothole(cfg.size);
                pot.position.set(cfg.x, 0.02, cfg.zOff);
                seg.add(pot);
                seg.userData.potholes.push({
                    mesh: pot,
                    worldZ: zPosition + cfg.zOff,
                    x: cfg.x,
                    radius: cfg.size === 'large' ? 1.4 : 0.85,
                    severity: cfg.size
                });
            });
        } else if (type === 'flooded') {
            // Shallow flood water patch covering two lanes
            const flood = ModelFactory.createFloodPatch(9, 24);
            flood.position.set(-1.5, 0.03, 5);
            seg.add(flood);
            seg.userData.floods.push({
                minX: -6.0,
                maxX: 3.0,
                minZ: zPosition + 5 - 12,
                maxZ: zPosition + 5 + 12
            });
        } else if (type === 'blockade') {
            // Construction barricades blocking lanes with warning lights
            const barricade1 = ModelFactory.createWarningBarricade(4.8);
            barricade1.position.set(-3.2, 0, 10);
            seg.add(barricade1);

            const col1 = new THREE.Box3().setFromCenterAndSize(
                new THREE.Vector3(-3.2, 0.8, zPosition + 10),
                new THREE.Vector3(4.8, 1.8, 1.5)
            );
            seg.userData.obstacles.push({
                mesh: barricade1,
                collider: col1,
                x: -3.2,
                z: zPosition + 10,
                damage: 25,
                penalty: 15,
                hit: false
            });

            // Second barricade down the stretch on opposite lane
            const barricade2 = ModelFactory.createWarningBarricade(4.2);
            barricade2.position.set(3.4, 0, 32);
            seg.add(barricade2);

            const col2 = new THREE.Box3().setFromCenterAndSize(
                new THREE.Vector3(3.4, 0.8, zPosition + 32),
                new THREE.Vector3(4.2, 1.8, 1.5)
            );
            seg.userData.obstacles.push({
                mesh: barricade2,
                collider: col2,
                x: 3.4,
                z: zPosition + 32,
                damage: 25,
                penalty: 15,
                hit: false
            });

            // Construction warning sign
            const cCanvas = document.createElement('canvas');
            cCanvas.width = 128;
            cCanvas.height = 64;
            const cctx = cCanvas.getContext('2d');
            cctx.fillStyle = '#ff9800';
            cctx.fillRect(0, 0, 128, 64);
            cctx.fillStyle = '#000000';
            cctx.font = 'bold 16px sans-serif';
            cctx.textAlign = 'center';
            cctx.fillText('কাজ চলছে', 64, 28);
            cctx.font = '12px sans-serif';
            cctx.fillText('ROAD WORK', 64, 48);

            const cMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.8), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cCanvas) }));
            cMesh.position.set(-3.2, 1.8, 9.9);
            seg.add(cMesh);
        } else if (type === 'repair_shop') {
            // Roadside CNG Repair Garage Workshop (re-conditions vehicle to 100% for ৳20)
            const garage = ModelFactory.createRepairShop();
            garage.position.set(this.roadWidth / 2 + 3.6, 0, 0);
            seg.add(garage);

            seg.userData.repairZones.push({
                x: this.roadWidth / 2 + 1.8,
                z: zPosition - 3.8,
                radius: 6.0
            });
        } else if (type === 'fuel_station') {
            // Roadside CNG Gas Station Bay
            const station = new THREE.Group();
            station.position.set(this.roadWidth / 2 + 3.2, 0, 0);

            // Canopy
            const canopy = new THREE.Mesh(new THREE.BoxGeometry(6, 0.3, 16), new THREE.MeshLambertMaterial({ color: 0x1e88e5 }));
            canopy.position.set(0, 4.0, 0);
            station.add(canopy);

            // Station Sign: "সিএনজি রিফুয়েলিং স্টেশন • ৳২৫"
            const fCanvas = document.createElement('canvas');
            fCanvas.width = 512;
            fCanvas.height = 128;
            const fctx = fCanvas.getContext('2d');
            fctx.fillStyle = '#1565c0';
            fctx.fillRect(0, 0, 512, 128);
            fctx.strokeStyle = '#ffd700';
            fctx.lineWidth = 6;
            fctx.strokeRect(6, 6, 500, 116);
            fctx.fillStyle = '#ffffff';
            fctx.font = 'bold 36px sans-serif';
            fctx.textAlign = 'center';
            fctx.fillText('সিএনজি রিফুয়েলিং স্টেশন', 256, 52);
            fctx.fillStyle = '#ffd700';
            fctx.font = 'bold 30px sans-serif';
            fctx.fillText('⛽ রিফুয়েল চার্জ: ৳২৫ (১০০%)', 256, 98);

            const fSign = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 1.3), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(fCanvas) }));
            fSign.position.set(0, 4.0, -8.1);
            station.add(fSign);

            // CNG Dispenser Pumps
            const pumpMat = new THREE.MeshLambertMaterial({ color: 0x43a047 });
            const pump = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.8, 0.8), pumpMat);
            pump.position.set(0, 0.9, 0);
            station.add(pump);

            seg.add(station);

            seg.userData.fuelPumps.push({
                x: this.roadWidth / 2 + 1.5,
                z: zPosition,
                radius: 4.8
            });
        }

        this.scene.add(seg);
        return seg;
    }

    populateScenery(seg, type) {
        // Place roadside elements along the segment
        const zPositions = [-30, -10, 10, 30];

        zPositions.forEach(zOffset => {
            // Left side
            if (Math.random() < 0.6) {
                const shop = ModelFactory.createShopBuilding();
                shop.position.set(- (this.roadWidth / 2 + this.sidewalkWidth + 2.5), 0, zOffset);
                seg.add(shop);
            } else if (Math.random() < 0.5) {
                const teaStall = ModelFactory.createTeaStall();
                teaStall.position.set(- (this.roadWidth / 2 + 2.0), 0, zOffset);
                teaStall.rotation.y = Math.PI / 2;
                seg.add(teaStall);
            } else {
                const tree = ModelFactory.createTree();
                tree.position.set(- (this.roadWidth / 2 + 2.2), 0, zOffset);
                seg.add(tree);
            }

            // Right side
            if (type !== 'fuel_station') {
                if (Math.random() < 0.5) {
                    const shop = ModelFactory.createShopBuilding();
                    shop.position.set(this.roadWidth / 2 + this.sidewalkWidth + 2.5, 0, zOffset);
                    shop.rotation.y = Math.PI;
                    seg.add(shop);
                } else {
                    const tree = ModelFactory.createTree();
                    tree.position.set(this.roadWidth / 2 + 2.2, 0, zOffset);
                    seg.add(tree);
                }
            }

            // Utility pole on left or right sidewalk
            if (Math.random() < 0.45) {
                const pole = ModelFactory.createUtilityPole();
                pole.position.set(this.roadWidth / 2 + 1.2, 0, zOffset + 5);
                seg.add(pole);
            }
        });

        // Add bustling Dhaka passerby pedestrians walking along both sidewalks
        seg.userData.pedestrians = [];
        const pedTypes = ['general', 'student', 'elderly', 'office', 'family'];

        [-26, -8, 12, 28].forEach(zOff => {
            // Left sidewalk walker
            if (Math.random() < 0.85) {
                const pType = pedTypes[Math.floor(Math.random() * pedTypes.length)];
                const ped = ModelFactory.createPedestrian(pType);
                const dir = Math.random() < 0.5 ? 1 : -1;
                ped.position.set(-8.2, 0.2, zOff);
                ped.rotation.y = dir === 1 ? 0 : Math.PI;
                ped.userData.walkDir = dir;
                ped.userData.walkSpeed = 1.0 + Math.random() * 0.9;
                seg.add(ped);
                seg.userData.pedestrians.push(ped);
            }

            // Right sidewalk walker
            if (Math.random() < 0.85) {
                const pType = pedTypes[Math.floor(Math.random() * pedTypes.length)];
                const ped = ModelFactory.createPedestrian(pType);
                const dir = Math.random() < 0.5 ? 1 : -1;
                ped.position.set(8.2, 0.2, zOff + 4);
                ped.rotation.y = dir === 1 ? 0 : Math.PI;
                ped.userData.walkDir = dir;
                ped.userData.walkSpeed = 1.0 + Math.random() * 0.9;
                seg.add(ped);
                seg.userData.pedestrians.push(ped);
            }
        });
    }

    updatePedestrians(dt) {
        this.segments.forEach(seg => {
            if (!seg.userData.pedestrians) return;
            seg.userData.pedestrians.forEach(ped => {
                // Move along sidewalk
                ped.position.z += ped.userData.walkDir * ped.userData.walkSpeed * dt;

                // Loop within segment boundaries
                if (ped.position.z > 38) {
                    ped.userData.walkDir = -1;
                    ped.rotation.y = Math.PI;
                } else if (ped.position.z < -38) {
                    ped.userData.walkDir = 1;
                    ped.rotation.y = 0;
                }

                // Animate walking legs and arms
                const swing = Math.sin(Date.now() * 0.007 * ped.userData.walkSpeed) * 0.45;
                if (ped.userData.leftLeg && ped.userData.rightLeg) {
                    ped.userData.leftLeg.rotation.x = swing;
                    ped.userData.rightLeg.rotation.x = -swing;
                }
                if (ped.userData.leftArm && ped.userData.rightArm) {
                    ped.userData.leftArm.rotation.x = -swing;
                    ped.userData.rightArm.rotation.x = swing;
                }
            });
        });
    }

    initRoad() {
        this.clear();
        this.furthestZ = 0;

        // Sequence of initial segments (ensuring repair shops, blockades, fuel stations appear regularly)
        const initialTypes = [
            'straight',
            'blockade',
            'repair_shop',
            'fork',
            'pothole_stretch',
            'fuel_station',
            'flooded',
            'repair_shop'
        ];

        for (let i = 0; i < this.numSegments; i++) {
            const z = i * this.segmentLength;
            const type = initialTypes[i % initialTypes.length];
            const seg = this.createSegment(type, z);
            this.segments.push(seg);
            this.furthestZ = z;
        }

        this.collectTriggers();
    }

    clear() {
        if (this.levelGate && this.levelGate.mesh) {
            this.scene.remove(this.levelGate.mesh);
            this.levelGate = null;
        }
        this.segments.forEach(seg => {
            this.scene.remove(seg);
        });
        this.segments = [];
        this.potholes = [];
        this.floodedZones = [];
        this.fuelZones = [];
        this.repairZones = [];
        this.obstacles = [];
        this.roadBlocks = [];
    }

    collectTriggers() {
        this.potholes = [];
        this.floodedZones = [];
        this.fuelZones = [];
        this.repairZones = [];
        this.obstacles = [];
        this.roadBlocks = [];

        this.segments.forEach(seg => {
            if (seg.userData.potholes) this.potholes.push(...seg.userData.potholes);
            if (seg.userData.floods) this.floodedZones.push(...seg.userData.floods);
            if (seg.userData.fuelPumps) this.fuelZones.push(...seg.userData.fuelPumps);
            if (seg.userData.repairZones) this.repairZones.push(...seg.userData.repairZones);
            if (seg.userData.obstacles) this.obstacles.push(...seg.userData.obstacles);
            if (seg.userData.blockades) this.roadBlocks.push(...seg.userData.blockades);
        });
    }

    spawnLevelGate(playerZ, nextLevel, isVictory = false, isIntro = false) {
        if (this.levelGate && this.levelGate.mesh) {
            this.scene.remove(this.levelGate.mesh);
            this.levelGate = null;
        }

        const targetZ = isIntro ? (playerZ + 25) : (playerZ + 80);
        const gateMesh = ModelFactory.createLevelGate(nextLevel, isVictory, isIntro);
        gateMesh.position.set(0, 0, targetZ);
        this.scene.add(gateMesh);

        // Add side pillar colliders
        const leftCol = new THREE.Box3().setFromCenterAndSize(
            new THREE.Vector3(-8.6, 3.5, targetZ),
            new THREE.Vector3(1.6, 7.0, 1.6)
        );
        const rightCol = new THREE.Box3().setFromCenterAndSize(
            new THREE.Vector3(8.6, 3.5, targetZ),
            new THREE.Vector3(1.6, 7.0, 1.6)
        );

        this.obstacles.push(
            { mesh: gateMesh, collider: leftCol, x: -8.6, z: targetZ, width: 1.6, length: 1.6, damage: 25, penalty: 15, hit: false, type: 'gate_pillar' },
            { mesh: gateMesh, collider: rightCol, x: 8.6, z: targetZ, width: 1.6, length: 1.6, damage: 25, penalty: 15, hit: false, type: 'gate_pillar' }
        );

        this.levelGate = {
            mesh: gateMesh,
            z: targetZ,
            level: nextLevel,
            isVictory: isVictory,
            isIntro: isIntro,
            passed: false
        };
        return this.levelGate;
    }

    checkLevelGate(playerZ) {
        if (this.levelGate && !this.levelGate.passed && playerZ >= this.levelGate.z) {
            this.levelGate.passed = true;
            return this.levelGate;
        }
        return null;
    }

    recycleBehindPlayer(playerZ) {
        // Recycle segments that are far behind player (> 100 units behind)
        if (this.segments.length === 0) return;
        const threshold = playerZ - 100;

        let recycledCount = 0;
        for (let i = 0; i < this.segments.length; i++) {
            const seg = this.segments[i];
            if (seg.userData.z + this.segmentLength < threshold) {
                // Remove old segment from scene
                this.scene.remove(seg);
                this.segments.splice(i, 1);
                i--;

                // Determine next segment type based on cycle including repair shop & blockades
                const pool = ['straight', 'pothole_stretch', 'blockade', 'repair_shop', 'fork', 'flooded', 'straight', 'fuel_station', 'blockade'];
                const nextType = pool[Math.floor(Math.random() * pool.length)];

                this.furthestZ += this.segmentLength;
                const newSeg = this.createSegment(nextType, this.furthestZ);
                this.segments.push(newSeg);
                recycledCount++;
            }
        }

        // Clean up passed level gate when far behind
        if (this.levelGate && this.levelGate.passed && playerZ > this.levelGate.z + 100) {
            if (this.levelGate.mesh) this.scene.remove(this.levelGate.mesh);
            this.levelGate = null;
        }

        if (recycledCount > 0) {
            this.collectTriggers();
        }
    }

    checkPotholeHit(playerPos) {
        for (let i = 0; i < this.potholes.length; i++) {
            const p = this.potholes[i];
            const dz = Math.abs(playerPos.z - p.worldZ);
            if (dz < 1.4) {
                const dx = Math.abs(playerPos.x - p.x);
                if (dx < p.radius + 0.6) {
                    // Pothole collision! Remove or mark handled so it doesn't trigger multiple times in one pass
                    const hit = { ...p };
                    this.potholes.splice(i, 1);
                    return hit;
                }
            }
        }
        return null;
    }

    checkInWater(playerPos) {
        for (let i = 0; i < this.floodedZones.length; i++) {
            const f = this.floodedZones[i];
            if (playerPos.z >= f.minZ && playerPos.z <= f.maxZ && playerPos.x >= f.minX && playerPos.x <= f.maxX) {
                return true;
            }
        }
        return false;
    }

    checkFuelStation(playerPos) {
        for (let i = 0; i < this.fuelZones.length; i++) {
            const f = this.fuelZones[i];
            const dist = Math.hypot(playerPos.x - f.x, playerPos.z - f.z);
            if (dist < f.radius) {
                return true;
            }
        }
        return false;
    }

    checkRepairShop(playerPos) {
        for (let i = 0; i < this.repairZones.length; i++) {
            const r = this.repairZones[i];
            const dist = Math.hypot(playerPos.x - r.x, playerPos.z - r.z);
            if (dist < r.radius) {
                return true;
            }
        }
        return false;
    }

    getUpcomingRepairShop(playerPos, maxDistance = 110) {
        let closest = null;
        let minDz = Infinity;

        for (let i = 0; i < this.repairZones.length; i++) {
            const r = this.repairZones[i];
            const dz = r.z - playerPos.z;
            // dz > 0 means it is ahead in front of the vehicle
            if (dz > -2 && dz <= maxDistance) {
                if (dz < minDz) {
                    minDz = dz;
                    closest = {
                        zone: r,
                        distance: Math.max(0, Math.round(dz)),
                        side: r.x > 0 ? 'Right' : 'Left',
                        x: r.x,
                        z: r.z
                    };
                }
            }
        }
        return closest;
    }

    checkObstacleCollision(playerCollider, playerPos) {
        const now = performance.now();
        for (let i = 0; i < this.obstacles.length; i++) {
            const obs = this.obstacles[i];

            // For continuous obstacles like the median divider block, allow re-hit after short cooldown
            if (obs.type === 'median_block') {
                if (obs.lastHitTime && (now - obs.lastHitTime < 900)) continue;
            } else if (obs.hit) {
                continue;
            }

            const dx = Math.abs(playerPos.x - obs.x);
            const dz = Math.abs(playerPos.z - obs.z);
            const halfW = (obs.width || 4.2) / 2 + 0.75;
            const halfL = (obs.length || 2.0) / 2 + 1.25;

            const isBoxHit = (dx < halfW && dz < halfL);
            const isColliderHit = (playerCollider && obs.collider && playerCollider.intersectsBox(obs.collider));

            if (isBoxHit || isColliderHit) {
                if (obs.type === 'median_block') {
                    obs.lastHitTime = now;
                    // Lateral deflection bounce away from median divider block
                    const bounceDir = (playerPos.x <= obs.x) ? -1 : 1;
                    playerPos.x = obs.x + bounceDir * (halfW + 0.2);
                } else {
                    obs.hit = true;
                }

                // Animate / tilt obstacle on impact
                if (obs.type === 'lane_blocker') {
                    obs.mesh.rotation.y += (Math.random() < 0.5 ? -0.4 : 0.4);
                    obs.mesh.position.x += (Math.random() < 0.5 ? -0.25 : 0.25);
                } else if (obs.type !== 'gate_pillar' && obs.type !== 'median_block') {
                    obs.mesh.rotation.z += (Math.random() < 0.5 ? -0.35 : 0.35);
                    obs.mesh.rotation.x = -0.3;
                    obs.mesh.position.y -= 0.15;
                }

                return {
                    damage: obs.damage || 20,
                    penalty: obs.penalty || 15,
                    obstacle: obs
                };
            }
        }
        return null;
    }

    checkSidewalkPedestrianHit(playerCollider, playerPos) {
        for (let s = 0; s < this.segments.length; s++) {
            const seg = this.segments[s];
            if (!seg.userData.pedestrians) continue;

            for (let i = 0; i < seg.userData.pedestrians.length; i++) {
                const ped = seg.userData.pedestrians[i];
                if (ped.userData.hit) continue;

                const worldPedZ = seg.position.z + ped.position.z;
                const worldPedX = ped.position.x;

                const dx = Math.abs(playerPos.x - worldPedX);
                const dz = Math.abs(playerPos.z - worldPedZ);

                // CNG width ~1.5 (half 0.75), Pedestrian radius ~0.6
                if (dx < 1.35 && dz < 1.7) {
                    ped.userData.hit = true;
                    ped.userData.walkSpeed = 0; // Stopped
                    // Knock sideways onto roadside terrain
                    ped.rotation.z = (worldPedX > 0 ? 0.75 : -0.75);
                    ped.position.x += (worldPedX > 0 ? 1.5 : -1.5);
                    ped.position.y = 0.05;

                    return {
                        damage: 12,
                        penalty: 25,
                        pedestrian: ped
                    };
                }
            }
        }
        return null;
    }
}

window.RoadManager = RoadManager;
