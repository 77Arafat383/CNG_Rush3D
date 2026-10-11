/**
 * CNG Rush 3D - Passenger System & Destination Management
 * Supports 4 distinct passenger types, dynamic fares, patience, tips, speech reactions, and drop-offs.
 */

const PASSENGER_TYPES = [
    {
        id: 'student',
        name: 'Student in a Hurry',
        bengaliName: 'পরীক্ষার্থী ছাত্র',
        avatar: '🎓',
        initialPatience: 55, // seconds
        baseFare: 200,
        tipPotential: 45,
        speedDemanding: true,
        desc: 'Short patience, pays high tip for fast driving!'
    },
    {
        id: 'elderly',
        name: 'Elderly Passenger',
        bengaliName: 'বৃদ্ধ যাত্রী',
        avatar: '👴',
        initialPatience: 80,
        baseFare: 190,
        tipPotential: 50,
        bumpSensitive: true,
        desc: 'Very sensitive to bumps & potholes! Rewards smooth driving.'
    },
    {
        id: 'family',
        name: 'Family with Luggage',
        bengaliName: 'মালপত্রসহ পরিবার',
        avatar: '🧳',
        initialPatience: 75,
        baseFare: 230,
        tipPotential: 35,
        heavyLoad: true,
        desc: 'Heavy luggage! Slows CNG acceleration and makes steering heavier.'
    },
    {
        id: 'office',
        name: 'Office-goer',
        bengaliName: 'চাকরিজীবী',
        avatar: '💼',
        initialPatience: 65,
        baseFare: 210,
        tipPotential: 40,
        hornSensitive: true,
        desc: 'Values quiet professional driving. Hates horn spamming!'
    }
];

const DESTINATIONS = [
    { name: 'ঢাকা বিশ্ববিদ্যালয় (DU Campus)', dist: 520 },
    { name: 'মতিঝিল বাণিজ্যিক এলাকা (Motijheel CBD)', dist: 640 },
    { name: 'ফার্মগেট মোড় (Farmgate Junction)', dist: 580 },
    { name: 'ধানমন্ডি লেক (Dhanmondi Lake)', dist: 600 },
    { name: 'শাহবাগ মোড় (Shahbagh Square)', dist: 500 },
    { name: 'মিরপুর ১০ গোলচত্বর (Mirpur 10 Circle)', dist: 700 }
];

class PassengerManager {
    constructor(scene, player) {
        this.scene = scene;
        this.player = player;

        // Current passenger & trip state
        this.currentPassenger = null;  // When boarded
        this.waitingPassenger = null;  // Waiting on sidewalk
        this.destination = null;

        // Trip metrics
        this.tripPatience = 100;
        this.maxPatience = 100;
        this.fare = 200;
        this.baseFare = 200;
        this.tripHornCount = 0;
        this.tripCollisionCount = 0;
        this.tripPotholeCount = 0;
        this.tripSlowTime = 0;
        this.tripDistanceTraveled = 0;
        this.spawnTimer = null;

        // Pickup / Destination visual markers
        this.initMarkers();
    }

    initMarkers() {
        // Pickup Marker (Prominent Glowing Green Beacon & Pillar)
        this.pickupMarker = new THREE.Group();

        // 1. Tall glowing light pillar visible from 150m away
        const pillarGeo = new THREE.CylinderGeometry(0.8, 1.4, 12, 16);
        const pillarMat = new THREE.MeshBasicMaterial({ color: 0x00e676, transparent: true, opacity: 0.35 });
        const pillar = new THREE.Mesh(pillarGeo, pillarMat);
        pillar.position.y = 6.0;
        this.pickupMarker.add(pillar);

        // 2. Concentric ground rings
        const ringGeo = new THREE.RingGeometry(1.5, 3.2, 24);
        ringGeo.rotateX(-Math.PI / 2);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x00e676, side: THREE.DoubleSide, transparent: true, opacity: 0.75 });
        const groundRing = new THREE.Mesh(ringGeo, ringMat);
        groundRing.position.y = 0.05;
        this.pickupMarker.add(groundRing);
        this.pickupMarker.userData.groundRing = groundRing;

        // 3. Floating 3D Text Billboard: [ 🙋 যাত্রী / PASSENGER ]
        const bCanvas = document.createElement('canvas');
        bCanvas.width = 512;
        bCanvas.height = 160;
        const bctx = bCanvas.getContext('2d');
        bctx.fillStyle = '#00e676';
        bctx.roundRect(10, 10, 492, 140, 24);
        bctx.fill();
        bctx.strokeStyle = '#ffffff';
        bctx.lineWidth = 8;
        bctx.roundRect(10, 10, 492, 140, 24);
        bctx.stroke();

        bctx.fillStyle = '#0b0f19';
        bctx.font = 'bold 44px sans-serif';
        bctx.textAlign = 'center';
        bctx.fillText('🙋 PICK UP PASSENGER', 256, 68);
        bctx.font = 'bold 36px sans-serif';
        bctx.fillStyle = '#1b5e20';
        bctx.fillText('এখানে যাত্রী অপেক্ষা করছেন', 256, 118);

        const bannerTex = new THREE.CanvasTexture(bCanvas);
        const bannerMesh = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 1.6), new THREE.MeshBasicMaterial({ map: bannerTex, side: THREE.DoubleSide }));
        bannerMesh.position.y = 4.2;
        this.pickupMarker.add(bannerMesh);
        this.pickupMarker.userData.banner = bannerMesh;

        // 4. Floating Diamond
        const diamondGeo = new THREE.OctahedronGeometry(0.7);
        const diamondMat = new THREE.MeshBasicMaterial({ color: 0x00e676 });
        const diamond = new THREE.Mesh(diamondGeo, diamondMat);
        diamond.position.y = 5.6;
        this.pickupMarker.add(diamond);
        this.pickupMarker.userData.diamond = diamond;

        this.pickupMarker.visible = false;
        this.scene.add(this.pickupMarker);

        // Destination Marker (Gold glowing beacon)
        this.destMarker = new THREE.Group();
        const dPillarGeo = new THREE.CylinderGeometry(1.2, 1.8, 14, 16);
        const dPillarMat = new THREE.MeshBasicMaterial({ color: 0xffd600, transparent: true, opacity: 0.38 });
        const dPillar = new THREE.Mesh(dPillarGeo, dPillarMat);
        dPillar.position.y = 7.0;
        this.destMarker.add(dPillar);

        const dRingGeo = new THREE.RingGeometry(2.0, 4.5, 24);
        dRingGeo.rotateX(-Math.PI / 2);
        const dMat = new THREE.MeshBasicMaterial({ color: 0xffd600, side: THREE.DoubleSide, transparent: true, opacity: 0.8 });
        const dRing = new THREE.Mesh(dRingGeo, dMat);
        dRing.position.y = 0.05;
        this.destMarker.add(dRing);

        const dStar = new THREE.OctahedronGeometry(1.0);
        const dStarMesh = new THREE.Mesh(dStar, new THREE.MeshBasicMaterial({ color: 0xffab00 }));
        dStarMesh.position.y = 5.2;
        this.destMarker.add(dStarMesh);
        this.destMarker.userData.star = dStarMesh;

        // Floating 3D Text Billboard: [ 🚏 ড্রপ-অফ / PASSENGER DROP-OFF ]
        const dCanvas = document.createElement('canvas');
        dCanvas.width = 512;
        dCanvas.height = 160;
        const dctx = dCanvas.getContext('2d');
        dctx.fillStyle = '#ffb300';
        dctx.roundRect(10, 10, 492, 140, 24);
        dctx.fill();
        dctx.strokeStyle = '#ffffff';
        dctx.lineWidth = 8;
        dctx.roundRect(10, 10, 492, 140, 24);
        dctx.stroke();

        dctx.fillStyle = '#0b0f19';
        dctx.font = 'bold 44px sans-serif';
        dctx.textAlign = 'center';
        dctx.fillText('🚏 PASSENGER DROP-OFF', 256, 68);
        dctx.font = 'bold 36px sans-serif';
        dctx.fillStyle = '#b71c1c';
        dctx.fillText('রোডের পাশে নামিয়ে দিন', 256, 118);

        const dBannerTex = new THREE.CanvasTexture(dCanvas);
        const dBannerMesh = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 1.6), new THREE.MeshBasicMaterial({ map: dBannerTex, side: THREE.DoubleSide }));
        dBannerMesh.position.y = 4.2;
        this.destMarker.add(dBannerMesh);
        this.destMarker.userData.banner = dBannerMesh;

        this.destMarker.visible = false;
        this.scene.add(this.destMarker);
    }

    spawnWaitingPassenger(playerZ, preferredType = null) {
        if (this.waitingPassenger) {
            this.clearWaiting();
        }

        // Select type
        const pType = preferredType ? PASSENGER_TYPES.find(t => t.id === preferredType) :
            PASSENGER_TYPES[Math.floor(Math.random() * PASSENGER_TYPES.length)];

        // Sidewalk side (right or left curb edge)
        const isRight = Math.random() < 0.5;
        const xPos = isRight ? 6.2 : -6.2;
        const zPos = playerZ + 40 + Math.random() * 20;

        // Create character mesh
        const pedMesh = ModelFactory.createPedestrian(pType.id);
        pedMesh.position.set(xPos, 0.2, zPos);
        pedMesh.rotation.y = isRight ? -Math.PI / 2 : Math.PI / 2;
        this.scene.add(pedMesh);

        this.waitingPassenger = {
            type: pType,
            mesh: pedMesh,
            x: xPos,
            z: zPos,
            isRight: isRight,
            radius: 9.5, // Generous pickup zone so player easily picks up forward or reverse
            overshotWarned: false
        };

        // Position Pickup Marker
        this.pickupMarker.position.set(xPos, 0.05, zPos);
        this.pickupMarker.visible = true;
    }

    clearWaiting() {
        if (this.waitingPassenger) {
            this.scene.remove(this.waitingPassenger.mesh);
            this.waitingPassenger = null;
        }
        this.pickupMarker.visible = false;
    }

    checkPickup(playerPos, playerSpeedKmh) {
        if (!this.waitingPassenger || this.currentPassenger) return false;

        const dist = Math.hypot(playerPos.x - this.waitingPassenger.x, playerPos.z - this.waitingPassenger.z);
        if (dist <= this.waitingPassenger.radius) {
            // Player is inside pickup zone
            if (playerSpeedKmh <= 18) {
                // Board passenger!
                this.boardPassenger();
                return true;
            }
        }
        return false;
    }

    boardPassenger() {
        if (!this.waitingPassenger) return;

        this.currentPassenger = this.waitingPassenger.type;
        window.soundManager.playPickup();

        // Clear waiting visual
        this.clearWaiting();

        // Apply passenger physical characteristics to player CNG
        if (this.currentPassenger.heavyLoad) {
            this.player.massModifier = 1.12; // Slight realistic weight without sluggishness
        } else {
            this.player.massModifier = 1.0;
        }

        // Initialize trip metrics
        this.maxPatience = this.currentPassenger.initialPatience;
        this.tripPatience = this.maxPatience;
        this.baseFare = this.currentPassenger.baseFare;
        this.fare = this.baseFare;
        this.tripHornCount = 0;
        this.tripCollisionCount = 0;
        this.tripPotholeCount = 0;
        this.tripSlowTime = 0;

        // Generate destination ahead on the side of the road (curb edge)
        const destTemplate = DESTINATIONS[Math.floor(Math.random() * DESTINATIONS.length)];
        const targetZ = this.player.position.z + destTemplate.dist;
        const isRight = Math.random() < 0.6; // Right curb standard or left curb
        const destX = isRight ? 5.8 : -5.8;

        this.destination = {
            name: destTemplate.name,
            targetZ: targetZ,
            x: destX,
            isRight: isRight,
            side: isRight ? 'Right' : 'Left',
            radius: 8.5,
            overshotWarned: false,
            wrongSideWarned: false
        };

        // Position destination marker at the side of the road
        this.destMarker.position.set(destX, 0.2, targetZ);
        this.destMarker.visible = true;

        // Initial dialogue
        let greeting = 'যাত্রা শুভ হোক!';
        if (this.currentPassenger.id === 'student') greeting = 'ভাই তাড়াতাড়ি চলুন! পরীক্ষা শুরু হবে!';
        else if (this.currentPassenger.id === 'elderly') greeting = 'বাবা, সাবধানে আর আস্তে চালাও...';
        else if (this.currentPassenger.id === 'family') greeting = 'পেছনে অনেক ভারি ব্যাগ আছে, খেয়াল রাখবেন!';
        else if (this.currentPassenger.id === 'office') greeting = 'অফিসে জরুরি মিটিং আছে, হর্ন কম বাজাবেন দয়া করে।';

        window.ui.showSpeechBubble(this.currentPassenger.avatar + ' ' + greeting, 3.5);
        window.ui.showFloatingText('PASSENGER ONBOARD!', '#00e676');
    }

    onHornUsed() {
        if (!this.currentPassenger) return;
        this.tripHornCount++;

        if (this.currentPassenger.hornSensitive) {
            this.tripPatience = Math.max(0, this.tripPatience - 4.5);
            window.ui.showFloatingText('HORN ANNOYED! -Patience', '#ff5722');
            window.ui.showSpeechBubble('💼 এত হর্ন বাজাচ্ছেন কেন?! মাথা ধরে গেল!', 2.2);
        }
    }

    onCollision(severity, penalty) {
        if (!this.currentPassenger) return;
        this.tripCollisionCount++;

        // Patience penalty
        const patienceLoss = this.currentPassenger.bumpSensitive ? 18 : 8;
        this.tripPatience = Math.max(0, this.tripPatience - patienceLoss);

        // Immediate fare penalty
        this.fare = Math.max(50, this.fare - penalty);

        if (this.currentPassenger.bumpSensitive) {
            window.ui.showSpeechBubble('👴 উফ্ আল্লাহ! কোমরটা ভেঙে গেল নাকি!', 2.5);
        } else {
            window.ui.showSpeechBubble(this.currentPassenger.avatar + ' সাবধানে চালান ভাই!', 2.0);
        }
    }

    onPothole(severity) {
        if (!this.currentPassenger) return;
        this.tripPotholeCount++;

        const loss = this.currentPassenger.bumpSensitive ? 14 : 5;
        this.tripPatience = Math.max(0, this.tripPatience - loss);
        this.fare = Math.max(50, this.fare - (severity === 'large' ? 15 : 8));

        if (this.currentPassenger.bumpSensitive) {
            window.ui.showSpeechBubble('👴 গর্ত দেখে চালান বাবা! বড্ড ঝাঁকুনি হচ্ছে...', 2.2);
        }
    }

    update(dt, playerPos, playerSpeedKmh) {
        // Animate pickup & destination markers
        if (this.pickupMarker.visible) {
            if (this.pickupMarker.userData.diamond) {
                this.pickupMarker.userData.diamond.rotation.y += 2.0 * dt;
            }
            if (this.pickupMarker.userData.banner) {
                // Dynamically face the player so the signboard text is never mirrored or reversed!
                const dx = playerPos.x - this.pickupMarker.position.x;
                const dz = playerPos.z - this.pickupMarker.position.z;
                this.pickupMarker.userData.banner.rotation.y = Math.atan2(dx, dz);
            }
            if (this.pickupMarker.userData.groundRing) {
                const s = 1.0 + Math.sin(Date.now() * 0.006) * 0.15;
                this.pickupMarker.userData.groundRing.scale.set(s, s, s);
            }
        }

        // Animate waiting passenger waving arm
        if (this.waitingPassenger && this.waitingPassenger.mesh && this.waitingPassenger.mesh.userData.rightArm) {
            const wave = Math.sin(Date.now() * 0.01) * 0.6;
            this.waitingPassenger.mesh.userData.rightArm.rotation.x = -Math.PI / 2 + wave;
            this.waitingPassenger.mesh.userData.rightArm.rotation.z = 0.35;
        }

        if (this.destMarker.visible) {
            if (this.destMarker.userData.star) {
                this.destMarker.userData.star.rotation.y += 1.8 * dt;
            }
            if (this.destMarker.userData.banner) {
                // Dynamically face the player so destination text is never mirrored or reversed!
                const dx = playerPos.x - this.destMarker.position.x;
                const dz = playerPos.z - this.destMarker.position.z;
                this.destMarker.userData.banner.rotation.y = Math.atan2(dx, dz);
            }
        }

        // Active Trip Logic
        if (this.currentPassenger && this.destination) {
            // No time limit: patience reflects driving quality (bumps, horn, potholes) rather than a ticking clock

            // Student reaction to slow driving (speech dialogue only, no timer penalty)
            if (this.currentPassenger.speedDemanding) {
                if (playerSpeedKmh < 18) {
                    this.tripSlowTime += dt;
                    if (this.tripSlowTime > 4.0) {
                        this.tripSlowTime = 0;
                        if (Math.random() < 0.4) {
                            window.ui.showSpeechBubble('🎓 ভাই সুযোগ পেলে আরেকটু স্পিড বাড়ান!', 2.2);
                        }
                    }
                } else {
                    this.tripSlowTime = 0;
                }
            }

            // Fare is stable and only reduced by collision/pothole penalties (no time decay)
            // 4. Check for patience expiration (only if heavy crashes/bumps occur)
            if (this.tripPatience <= 0) {
                this.failTrip();
                return { status: 'failed' };
            }

            // 5. Check Arrival at Destination or Missed Destination
            const distToDest = this.destination.targetZ - playerPos.z;
            const distZToDest = Math.abs(distToDest);
            const euclideanDist = Math.hypot(playerPos.x - this.destination.x, playerPos.z - this.destination.targetZ);

            // Is player near the destination longitudinally?
            const inLongitudinalZone = distZToDest <= this.destination.radius;

            // Side of road check:
            // Road is ±7.5 wide. Side of road means car pulled over to the side (|x| >= 3.4) on the side where the destination is
            const isPulledToSide = Math.abs(playerPos.x) >= 3.4 && ((this.destination.isRight && playerPos.x > 1.2) || (!this.destination.isRight && playerPos.x < -1.2));
            const inDropZone = (inLongitudinalZone && isPulledToSide) || (euclideanDist <= 5.8);

            if (inLongitudinalZone) {
                if (playerSpeedKmh <= 18) {
                    if (inDropZone) {
                        const result = this.completeTrip();
                        return { status: 'completed', result: result };
                    } else {
                        // Stopped in middle of road!
                        if (!this.destination.wrongSideWarned) {
                            this.destination.wrongSideWarned = true;
                            const sideTextBn = this.destination.isRight ? 'ডানপাশে' : 'বামপাশে';
                            window.ui.showSpeechBubble(`${this.currentPassenger.avatar} ভাই, রাস্তার মাঝখানে নামাবেন না! রোডের ${sideTextBn} সাইডে চাপান!`, 3.0);
                            window.ui.showFloatingText(`⚠️ PULL OVER TO THE ${this.destination.side.toUpperCase()} SIDE TO DROP OFF!`, '#ff9800');
                        }
                    }
                }
            } else if (distToDest > 20) {
                this.destination.wrongSideWarned = false;
            } else if (distToDest < -85.0) {
                // Player passed far beyond destination (> 85m past, moving to next area)
                this.onMissedDestination(playerPos.z);
            } else if (distToDest < -8.0 && !this.destination.overshotWarned) {
                // Gentle overshoot reminder once, keeping the destination available for reversing back!
                this.destination.overshotWarned = true;
                const bengaliReminders = {
                    student: '🎓 ও ভাইয়া! স্টপ পার হয়ে গেল, একটু পেছনে যান!',
                    elderly: '👴 ও বাবা! আমার নামার জায়গা পেছনে পড়ে রইল, একটু পিছিয়ে নাও...',
                    family: '🧳 ভাই স্টপ পার হয়ে আসছেন, একটু রিভার্স করে নামিয়ে দিন!',
                    office: '💼 আরে স্টপ তো ফেলে আসলেন! একটু পেছনে আসুন দয়া করে!'
                };
                const reminderMsg = bengaliReminders[this.currentPassenger.id] || 'স্টপ পার হয়ে গেছেন, একটু পিছিয়ে নামিয়ে দিন!';
                window.ui.showSpeechBubble(reminderMsg, 2.5);
                window.soundManager.playNotificationChime();
            }

            const isOvershot = distToDest < 0;
            return {
                status: 'in_progress',
                passenger: this.currentPassenger,
                destination: this.destination,
                distRemaining: Math.round(Math.abs(distToDest)),
                isOvershot: isOvershot,
                needsPullToSide: inLongitudinalZone && !isPulledToSide,
                patiencePct: (this.tripPatience / this.maxPatience) * 100,
                fare: this.fare
            };
        }

        // Check if player drove past waiting passenger
        if (!this.currentPassenger && this.waitingPassenger) {
            const distBehind = playerPos.z - this.waitingPassenger.z;
            if (distBehind > 85.0) {
                // Driven far ahead (> 85m past) - only now cycle to the next passenger ahead
                this.onMissedPickup(playerPos.z);
            } else if (distBehind > 8.0 && !this.waitingPassenger.overshotWarned) {
                // Gentle overshoot reminder once, keeping the passenger available for reversing back!
                this.waitingPassenger.overshotWarned = true;
                const msg = `${this.waitingPassenger.type.avatar} ও ভাই! একটু পেছনে আসুন, আমি দাঁড়িয়ে আছি!`;
                window.ui.showSpeechBubble(msg, 2.5);
                window.soundManager.playNotificationChime();
            }
        }

        // If no active trip and no waiting passenger, spawn one ahead
        if (!this.currentPassenger && !this.waitingPassenger) {
            this.spawnWaitingPassenger(playerPos.z);
        }

        // When waiting for passenger, report distance and side for HUD navigation
        let waitingInfo = null;
        if (this.waitingPassenger) {
            const rawDist = this.waitingPassenger.z - playerPos.z;
            const isBehind = rawDist < 0;
            waitingInfo = {
                dist: Math.round(Math.abs(rawDist)),
                isBehind: isBehind,
                side: this.waitingPassenger.isRight ? 'Right' : 'Left',
                type: this.waitingPassenger.type
            };
        }

        return { status: 'idle', waiting: waitingInfo };
    }

    onMissedPickup(playerZ) {
        if (!this.waitingPassenger) return;

        const missedPed = this.waitingPassenger;
        const msg = `${missedPed.type.avatar} ও ভাই সিএনজি! দাঁড়ালেন না কেন?! চলে গেলেন!`;
        window.ui.showSpeechBubble(msg, 2.5);
        window.soundManager.playNotificationChime();
        window.ui.showFloatingText('MISSED PASSENGER! TARGETING NEXT PASSENGER ❯❯', '#ff9800');

        // Clear the missed waiting passenger
        this.clearWaiting();

        // Immediately spawn the next waiting passenger ahead
        this.spawnWaitingPassenger(playerZ);
    }

    onMissedDestination(playerZ) {
        if (!this.currentPassenger || !this.destination) return;

        const bengaliReactions = {
            student: '🎓 ভাইয়া স্টপ ফেলে সামনে চলে আসলেন তো! সামনের স্টপে নামিয়ে দিন!',
            elderly: '👴 ও বাবা! আমার নামার জায়গা ফেলে এলে যে! সামনের স্টপে নামাও...',
            family: '🧳 ভাই স্টপ পার হয়ে আসলেন! সামনের স্টপেই নামিয়ে দিন তাড়াতাড়ি!',
            office: '💼 এ কি করলেন! আমার অফিস ফেলে আসলেন! পরের স্টপেই নামান!'
        };
        const msg = bengaliReactions[this.currentPassenger.id] || 'স্টপ পার হয়ে গেছেন! সামনের স্টপে নামান!';

        window.ui.showSpeechBubble(msg, 3.2);
        window.soundManager.playNotificationChime();

        // Minor patience consequence (keeps game fair while giving feedback)
        this.tripPatience = Math.max(15, this.tripPatience - 8);

        // Pick next destination station (different from current if possible)
        const currentName = this.destination.name;
        const availableDest = DESTINATIONS.filter(d => d.name !== currentName);
        const nextDestTemplate = availableDest[Math.floor(Math.random() * availableDest.length)] || DESTINATIONS[0];

        // Place next drop station ahead (260m - 340m ahead) on side of road
        const nextDist = 260 + Math.random() * 80;
        const newTargetZ = playerZ + nextDist;
        const isRight = Math.random() < 0.6;
        const destX = isRight ? 5.8 : -5.8;

        this.destination = {
            name: nextDestTemplate.name,
            targetZ: newTargetZ,
            x: destX,
            isRight: isRight,
            side: isRight ? 'Right' : 'Left',
            radius: 8.5,
            overshotWarned: false,
            wrongSideWarned: false
        };

        // Move destination beacon marker to side of road
        this.destMarker.position.set(destX, 0.2, newTargetZ);
        this.destMarker.visible = true;

        window.ui.showFloatingText(`MISSED DROP! NEXT STOP: ${this.destination.name.split(' ')[0]} ❯❯`, '#ff9800');
    }

    failTrip() {
        window.soundManager.playGameOver();
        window.ui.showFloatingText('PASSENGER LOST PATIENCE! -৳30', '#f44336');
        window.ui.showSpeechBubble(this.currentPassenger.avatar + ' বিরক্ত হয়ে নেমে গেলাম! কোনো ভাড়া পাবেন না!', 3.0);

        // Penalty
        window.scoring.applyTripPenalty(30);

        // Reset passenger
        this.currentPassenger = null;
        this.destination = null;
        this.destMarker.visible = false;
        this.player.massModifier = 1.0;

        // Spawn next passenger after brief delay
        if (this.spawnTimer) clearTimeout(this.spawnTimer);
        this.spawnTimer = setTimeout(() => {
            this.spawnTimer = null;
            if (!this.currentPassenger && !this.waitingPassenger) {
                this.spawnWaitingPassenger(this.player.position.z + 50);
            }
        }, 3000);
    }

    completeTrip() {
        window.soundManager.playDropOff();

        // Calculate Tip
        let tip = 0;
        let isPerfect = false;

        if (this.currentPassenger.id === 'student') {
            // Student gives tip if delivered with > 40% patience left
            if (this.tripPatience > this.maxPatience * 0.4) {
                tip = Math.round(this.currentPassenger.tipPotential * (this.tripPatience / this.maxPatience));
            }
        } else if (this.currentPassenger.id === 'elderly') {
            // Elderly gives tip if zero or few bumps
            if (this.tripCollisionCount === 0 && this.tripPotholeCount === 0) {
                tip = this.currentPassenger.tipPotential;
            } else if (this.tripCollisionCount <= 1 && this.tripPotholeCount <= 1) {
                tip = 15;
            }
        } else if (this.currentPassenger.id === 'office') {
            // Office-goer gives bonus for minimal horn
            if (this.tripHornCount <= 1) {
                tip = this.currentPassenger.tipPotential;
            } else if (this.tripHornCount <= 3) {
                tip = 15;
            }
        } else if (this.currentPassenger.id === 'family') {
            if (this.tripCollisionCount === 0) {
                tip = 25;
            }
        }

        // Check Perfect Trip Condition
        if (this.tripCollisionCount === 0 && this.tripPotholeCount === 0 && this.tripHornCount <= 2 && this.tripPatience > this.maxPatience * 0.3) {
            isPerfect = true;
            tip += 50;
            window.soundManager.playFanfare();
        }

        const totalEarned = this.fare + tip;
        window.scoring.recordTripSuccess(totalEarned, this.fare, tip, isPerfect);

        // Farewell reaction
        let farewell = 'ধন্যবাদ ভাই!';
        if (isPerfect) farewell = 'মাশাআল্লাহ! অসাধারণ চালিয়েছেন ভাই, এই নিন বকশিশ!';
        else if (tip > 0) farewell = 'খুব ভালো লেগেছে, বকশিশটা রাখুন!';
        window.ui.showSpeechBubble(this.currentPassenger.avatar + ' ' + farewell, 3.0);

        // Exactly ONE single consolidated trip completion notification
        if (isPerfect) {
            window.ui.showFloatingText(`★ PERFECT TRIP! +৳${totalEarned} (Fare: ৳${this.fare}, Tip: ৳${tip})`, '#ffd700');
        } else if (tip > 0) {
            window.ui.showFloatingText(`✓ TRIP COMPLETE! +৳${totalEarned} (Fare: ৳${this.fare}, Tip: ৳${tip})`, '#00e676');
        } else {
            window.ui.showFloatingText(`✓ TRIP COMPLETE! +৳${totalEarned}`, '#00e676');
        }

        const summary = {
            passenger: this.currentPassenger,
            fare: this.fare,
            tip: tip,
            isPerfect: isPerfect,
            total: totalEarned
        };

        // Reset
        this.currentPassenger = null;
        this.destination = null;
        this.destMarker.visible = false;
        this.player.massModifier = 1.0;

        // Spawn next passenger ahead
        if (this.spawnTimer) clearTimeout(this.spawnTimer);
        this.spawnTimer = setTimeout(() => {
            this.spawnTimer = null;
            if (!this.currentPassenger && !this.waitingPassenger) {
                this.spawnWaitingPassenger(this.player.position.z + 60);
            }
        }, 2500);

        return summary;
    }

    reset() {
        if (this.spawnTimer) {
            clearTimeout(this.spawnTimer);
            this.spawnTimer = null;
        }
        this.clearWaiting();
        this.currentPassenger = null;
        this.destination = null;
        this.destMarker.visible = false;
        this.pickupMarker.visible = false;
        this.player.massModifier = 1.0;
    }
}

window.PassengerManager = PassengerManager;
