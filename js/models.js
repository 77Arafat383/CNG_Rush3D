/**
 * CNG Rush 3D - Procedural 3D Low-Poly Model Generators
 * Authentic Bangladeshi urban aesthetics built entirely with Three.js primitives.
 */

const ModelFactory = {
    // Shared materials for performance & batching
    materials: {
        cngGreen: new THREE.MeshLambertMaterial({ color: 0x1b7e3f }),
        cngDarkGreen: new THREE.MeshLambertMaterial({ color: 0x0f5127 }),
        cngRoof: new THREE.MeshLambertMaterial({ color: 0x222222 }),
        cngMesh: new THREE.MeshLambertMaterial({ color: 0x111111, wireframe: true }),
        yellowMeter: new THREE.MeshLambertMaterial({ color: 0xf39c12 }),
        glass: new THREE.MeshLambertMaterial({ color: 0x88ccff, transparent: true, opacity: 0.6 }),
        tire: new THREE.MeshLambertMaterial({ color: 0x1a1a1a }),
        rim: new THREE.MeshLambertMaterial({ color: 0xcccccc }),
        headlight: new THREE.MeshBasicMaterial({ color: 0xfffae0 }),
        taillight: new THREE.MeshBasicMaterial({ color: 0xff2222 }),
        chrome: new THREE.MeshLambertMaterial({ color: 0xdddddd }),
        leather: new THREE.MeshLambertMaterial({ color: 0x8b4513 }),
        asphalt: new THREE.MeshLambertMaterial({ color: 0x2c3035 }),
        roadMarking: new THREE.MeshBasicMaterial({ color: 0xffffff }),
        yellowMarking: new THREE.MeshBasicMaterial({ color: 0xffd200 }),
        potholeMat: new THREE.MeshLambertMaterial({ color: 0x151719 }),
        waterMat: new THREE.MeshLambertMaterial({ color: 0x3377aa, transparent: true, opacity: 0.75 })
    },

    createCNG() {
        const cng = new THREE.Group();

        // 1. Lower Chassis (Green)
        const chassisGeo = new THREE.BoxGeometry(1.6, 0.7, 2.7);
        const chassis = new THREE.Mesh(chassisGeo, this.materials.cngGreen);
        chassis.position.y = 0.65;
        chassis.castShadow = true;
        cng.add(chassis);

        // Angled front nose
        const noseGeo = new THREE.BoxGeometry(1.3, 0.6, 0.8);
        const nose = new THREE.Mesh(noseGeo, this.materials.cngGreen);
        nose.position.set(0, 0.6, 1.45);
        nose.rotation.x = -0.15;
        cng.add(nose);

        // 2. Cabin Roof & Curved Canopy (Classic Black/Dark Roof)
        const roofGeo = new THREE.BoxGeometry(1.56, 0.15, 2.3);
        const roof = new THREE.Mesh(roofGeo, this.materials.cngRoof);
        roof.position.set(0, 1.85, -0.1);
        cng.add(roof);

        // Curved front canopy bevel
        const canopyBevelGeo = new THREE.CylinderGeometry(0.78, 0.78, 1.56, 8, 1, false, 0, Math.PI);
        const canopyBevel = new THREE.Mesh(canopyBevelGeo, this.materials.cngRoof);
        canopyBevel.rotation.z = Math.PI / 2;
        canopyBevel.position.set(0, 1.8, 1.0);
        cng.add(canopyBevel);

        // Roof pillars
        const pillarMat = this.materials.cngDarkGreen;
        const pillarGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.1);
        const p1 = new THREE.Mesh(pillarGeo, pillarMat);
        p1.position.set(-0.72, 1.3, 0.95);
        const p2 = new THREE.Mesh(pillarGeo, pillarMat);
        p2.position.set(0.72, 1.3, 0.95);
        const p3 = new THREE.Mesh(pillarGeo, pillarMat);
        p3.position.set(-0.72, 1.3, -1.25);
        const p4 = new THREE.Mesh(pillarGeo, pillarMat);
        p4.position.set(0.72, 1.3, -1.25);
        cng.add(p1, p2, p3, p4);

        // 3. Side Wire Mesh / Grilles (Iconic Dhaka safety gate)
        const meshGeo = new THREE.PlaneGeometry(0.8, 0.9);
        const leftMesh = new THREE.Mesh(meshGeo, this.materials.cngMesh);
        leftMesh.position.set(-0.76, 1.25, -0.15);
        leftMesh.rotation.y = Math.PI / 2;
        const rightMesh = new THREE.Mesh(meshGeo, this.materials.cngMesh);
        rightMesh.position.set(0.76, 1.25, -0.15);
        rightMesh.rotation.y = -Math.PI / 2;
        cng.add(leftMesh, rightMesh);

        // 4. Front Windshield with wiper
        const windshieldGeo = new THREE.PlaneGeometry(1.3, 0.65);
        const windshield = new THREE.Mesh(windshieldGeo, this.materials.glass);
        windshield.position.set(0, 1.45, 1.15);
        windshield.rotation.x = -0.25;
        cng.add(windshield);

        const wiperGeo = new THREE.BoxGeometry(0.02, 0.45, 0.02);
        const wiper = new THREE.Mesh(wiperGeo, this.materials.cngRoof);
        wiper.position.set(0.1, 1.42, 1.2);
        wiper.rotation.z = 0.5;
        wiper.rotation.x = -0.25;
        cng.add(wiper);

        // 5. Driver Handlebar & Yellow Fare Meter Box
        const barGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.7);
        const bar = new THREE.Mesh(barGeo, this.materials.chrome);
        bar.rotation.z = Math.PI / 2;
        bar.position.set(0, 1.15, 0.9);
        cng.add(bar);

        // Fare meter box (classic yellow box with red LED display)
        const meterGeo = new THREE.BoxGeometry(0.2, 0.16, 0.12);
        const meter = new THREE.Mesh(meterGeo, this.materials.yellowMeter);
        meter.position.set(0.35, 1.15, 0.92);
        cng.add(meter);

        // Passenger Seats (Black/Brown leather)
        const seatGeo = new THREE.BoxGeometry(1.4, 0.25, 0.7);
        const seat = new THREE.Mesh(seatGeo, this.materials.leather);
        seat.position.set(0, 0.8, -0.65);
        const driverSeat = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.2, 0.4), this.materials.leather);
        driverSeat.position.set(0, 0.8, 0.45);
        cng.add(seat, driverSeat);

        // Rear Gas Cylinder Cage
        const cageGeo = new THREE.BoxGeometry(1.3, 0.45, 0.35);
        const cage = new THREE.Mesh(cageGeo, this.materials.cngMesh);
        cage.position.set(0, 0.75, -1.4);
        cng.add(cage);

        // 6. Lights
        const lightGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.1, 12);
        const headlight = new THREE.Mesh(lightGeo, this.materials.headlight);
        headlight.rotation.x = Math.PI / 2;
        headlight.position.set(0, 0.75, 1.85);
        cng.add(headlight);

        const tailGeo = new THREE.BoxGeometry(0.25, 0.1, 0.05);
        const leftTail = new THREE.Mesh(tailGeo, this.materials.taillight);
        leftTail.position.set(-0.6, 0.65, -1.37);
        const rightTail = new THREE.Mesh(tailGeo, this.materials.taillight);
        rightTail.position.set(0.6, 0.65, -1.37);
        cng.add(leftTail, rightTail);

        // 7. Wheels
        const tireGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.22, 14);
        tireGeo.rotateZ(Math.PI / 2);
        const rimGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.23, 10);
        rimGeo.rotateZ(Math.PI / 2);

        // Front steerable wheel assembly
        const frontWheelGroup = new THREE.Group();
        frontWheelGroup.position.set(0, 0.32, 1.45);
        const frontTire = new THREE.Mesh(tireGeo, this.materials.tire);
        const frontRim = new THREE.Mesh(rimGeo, this.materials.rim);
        frontWheelGroup.add(frontTire, frontRim);
        cng.add(frontWheelGroup);
        cng.userData.frontWheelGroup = frontWheelGroup;

        // Rear Wheels
        const rearLeftTire = new THREE.Mesh(tireGeo, this.materials.tire);
        const rearLeftRim = new THREE.Mesh(rimGeo, this.materials.rim);
        rearLeftTire.position.set(-0.82, 0.32, -0.75);
        rearLeftRim.position.copy(rearLeftTire.position);

        const rearRightTire = new THREE.Mesh(tireGeo, this.materials.tire);
        const rearRightRim = new THREE.Mesh(rimGeo, this.materials.rim);
        rearRightTire.position.set(0.82, 0.32, -0.75);
        rearRightRim.position.copy(rearRightTire.position);

        cng.add(rearLeftTire, rearLeftRim, rearRightTire, rearRightRim);
        cng.userData.wheels = [frontTire, rearLeftTire, rearRightTire];

        // Dhaka Metro Numberplate at rear
        const plateCanvas = document.createElement('canvas');
        plateCanvas.width = 128;
        plateCanvas.height = 48;
        const pctx = plateCanvas.getContext('2d');
        pctx.fillStyle = '#27ae60';
        pctx.fillRect(0, 0, 128, 48);
        pctx.strokeStyle = '#ffffff';
        pctx.lineWidth = 3;
        pctx.strokeRect(2, 2, 124, 44);
        pctx.fillStyle = '#ffffff';
        pctx.font = 'bold 13px sans-serif';
        pctx.textAlign = 'center';
        pctx.fillText('ঢাকা মেট্রো-থ', 64, 20);
        pctx.fillText('১১-৪২০', 64, 38);

        const plateTex = new THREE.CanvasTexture(plateCanvas);
        const plateGeo = new THREE.PlaneGeometry(0.5, 0.2);
        const plateMat = new THREE.MeshBasicMaterial({ map: plateTex });
        const plateMesh = new THREE.Mesh(plateGeo, plateMat);
        plateMesh.position.set(0, 0.45, -1.38);
        plateMesh.rotation.y = Math.PI;
        cng.add(plateMesh);

        return cng;
    },

    createBus() {
        const bus = new THREE.Group();

        // Dhaka colorful bus body (6.8m long, 2.2m wide, 2.4m tall)
        const bodyGeo = new THREE.BoxGeometry(2.3, 2.3, 7.0);
        // Vibrant colorful Dhaka bus livery
        const busColors = [0x2980b9, 0xe67e22, 0x27ae60, 0x8e44ad];
        const primaryColor = busColors[Math.floor(Math.random() * busColors.length)];
        const busMat = new THREE.MeshLambertMaterial({ color: primaryColor });
        const busBody = new THREE.Mesh(bodyGeo, busMat);
        busBody.position.y = 1.6;
        busBody.castShadow = true;
        bus.add(busBody);

        // Hand-painted side stripes
        const stripeGeo = new THREE.BoxGeometry(2.34, 0.35, 6.9);
        const stripeMat = new THREE.MeshLambertMaterial({ color: 0xf1c40f });
        const stripe = new THREE.Mesh(stripeGeo, stripeMat);
        stripe.position.y = 1.35;
        bus.add(stripe);

        // Windows (long strip)
        const windowGeo = new THREE.BoxGeometry(2.35, 0.7, 5.8);
        const win = new THREE.Mesh(windowGeo, this.materials.glass);
        win.position.set(0, 1.95, -0.3);
        bus.add(win);

        // Windshield
        const frontWinGeo = new THREE.BoxGeometry(2.1, 0.8, 0.2);
        const frontWin = new THREE.Mesh(frontWinGeo, this.materials.glass);
        frontWin.position.set(0, 1.95, 3.42);
        bus.add(frontWin);

        // Bumper
        const bumperGeo = new THREE.BoxGeometry(2.4, 0.4, 0.3);
        const bumper = new THREE.Mesh(bumperGeo, this.materials.chrome);
        bumper.position.set(0, 0.65, 3.45);
        bus.add(bumper);

        // Headlights
        const hlGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.1, 8);
        hlGeo.rotateX(Math.PI / 2);
        const hl1 = new THREE.Mesh(hlGeo, this.materials.headlight);
        hl1.position.set(-0.85, 0.95, 3.52);
        const hl2 = new THREE.Mesh(hlGeo, this.materials.headlight);
        hl2.position.set(0.85, 0.95, 3.52);
        bus.add(hl1, hl2);

        // Roof Carrier with Low-Poly Luggage
        const rackGeo = new THREE.BoxGeometry(1.8, 0.2, 4.5);
        const rack = new THREE.Mesh(rackGeo, this.materials.cngMesh);
        rack.position.set(0, 2.85, -0.5);
        bus.add(rack);

        // Luggage boxes
        const lugGeo = new THREE.BoxGeometry(0.8, 0.4, 0.9);
        const lugMat = new THREE.MeshLambertMaterial({ color: 0x95a5a6 });
        const lug = new THREE.Mesh(lugGeo, lugMat);
        lug.position.set(0.2, 3.05, -0.4);
        bus.add(lug);

        // 6 Heavy Wheels
        const wGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.3, 12);
        wGeo.rotateZ(Math.PI / 2);
        const wheelPositions = [
            [-1.15, 0.48, 2.2], [1.15, 0.48, 2.2], // front
            [-1.15, 0.48, -1.6], [1.15, 0.48, -1.6], // rear 1
            [-1.15, 0.48, -2.4], [1.15, 0.48, -2.4]  // rear 2
        ];
        bus.userData.wheels = [];
        wheelPositions.forEach(pos => {
            const w = new THREE.Mesh(wGeo, this.materials.tire);
            w.position.set(pos[0], pos[1], pos[2]);
            bus.add(w);
            bus.userData.wheels.push(w);
        });

        return bus;
    },

    createRickshaw() {
        const r = new THREE.Group();

        // 3 thin spoked wheels
        const wGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.08, 12);
        wGeo.rotateZ(Math.PI / 2);
        const rTireMat = this.materials.tire;

        const fw = new THREE.Mesh(wGeo, rTireMat);
        fw.position.set(0, 0.38, 1.2);
        const rw1 = new THREE.Mesh(wGeo, rTireMat);
        rw1.position.set(-0.6, 0.38, -0.6);
        const rw2 = new THREE.Mesh(wGeo, rTireMat);
        rw2.position.set(0.6, 0.38, -0.6);
        r.add(fw, rw1, rw2);

        // Cycle frame
        const frameMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
        const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.6), frameMat);
        bar.rotation.x = Math.PI / 4;
        bar.position.set(0, 0.65, 0.5);
        r.add(bar);

        // Decorated Canopy (Vibrant Bangladeshi Folk Art Colors)
        const canopyColors = [0xe74c3c, 0xf39c12, 0x1abc9c, 0x9b59b6];
        const hoodMat = new THREE.MeshLambertMaterial({ color: canopyColors[Math.floor(Math.random() * canopyColors.length)] });
        const hoodGeo = new THREE.CylinderGeometry(0.6, 0.6, 1.05, 8, 1, false, 0, Math.PI);
        hoodGeo.rotateZ(Math.PI / 2);
        hoodGeo.rotateX(-0.3);
        const hood = new THREE.Mesh(hoodGeo, hoodMat);
        hood.position.set(0, 1.45, -0.7);
        r.add(hood);

        // Seat
        const seat = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.15, 0.5), this.materials.leather);
        seat.position.set(0, 0.75, -0.5);
        r.add(seat);

        // Puller figure
        const pullerBody = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.5, 0.25), new THREE.MeshLambertMaterial({ color: 0x34495e }));
        pullerBody.position.set(0, 1.05, 0.25);
        const pullerHead = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), new THREE.MeshLambertMaterial({ color: 0xd35400 }));
        pullerHead.position.set(0, 1.4, 0.25);
        // lungi
        const lungi = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 0.45), new THREE.MeshLambertMaterial({ color: 0x16a085 }));
        lungi.position.set(0, 0.65, 0.2);
        r.add(pullerBody, pullerHead, lungi);

        return r;
    },

    createCar() {
        const car = new THREE.Group();
        const carColors = [0xecf0f1, 0x34495e, 0xbdc3c7, 0x2c3e50, 0x7f8c8d];
        const carMat = new THREE.MeshLambertMaterial({ color: carColors[Math.floor(Math.random() * carColors.length)] });

        // Lower body
        const lowerGeo = new THREE.BoxGeometry(1.8, 0.65, 4.2);
        const lower = new THREE.Mesh(lowerGeo, carMat);
        lower.position.y = 0.55;
        lower.castShadow = true;
        car.add(lower);

        // Cabin
        const cabinGeo = new THREE.BoxGeometry(1.6, 0.6, 2.2);
        const cabin = new THREE.Mesh(cabinGeo, carMat);
        cabin.position.set(0, 1.15, -0.2);
        car.add(cabin);

        // Windshields & Windows
        const winMat = this.materials.glass;
        const frontWin = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.45, 0.05), winMat);
        frontWin.position.set(0, 1.15, 0.95);
        frontWin.rotation.x = -0.35;
        car.add(frontWin);

        // Headlights & Taillights
        const hl1 = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.15, 0.05), this.materials.headlight);
        hl1.position.set(-0.65, 0.65, 2.12);
        const hl2 = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.15, 0.05), this.materials.headlight);
        hl2.position.set(0.65, 0.65, 2.12);
        car.add(hl1, hl2);

        // Wheels
        const wGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.22, 12);
        wGeo.rotateZ(Math.PI / 2);
        const wPos = [[-0.9, 0.36, 1.25], [0.9, 0.36, 1.25], [-0.9, 0.36, -1.25], [0.9, 0.36, -1.25]];
        car.userData.wheels = [];
        wPos.forEach(p => {
            const w = new THREE.Mesh(wGeo, this.materials.tire);
            w.position.set(p[0], p[1], p[2]);
            car.add(w);
            car.userData.wheels.push(w);
        });

        return car;
    },

    createOtherCNG() {
        const cng = this.createCNG();
        // Give slightly different shade of green or registration
        return cng;
    },



    createPedestrian(charType = 'general') {
        const ped = new THREE.Group();
        const skinMat = new THREE.MeshLambertMaterial({ color: 0x9c6644 });

        let shirtColor = 0x2980b9;
        let pantsColor = 0x2c3e50;

        if (charType === 'student') {
            shirtColor = 0x27ae60; // Green polo/uniform
            pantsColor = 0x34495e;
        } else if (charType === 'elderly') {
            shirtColor = 0xecf0f1; // White kurta
            pantsColor = 0xbdc3c7;
        } else if (charType === 'office') {
            shirtColor = 0x3498db; // Formal shirt
            pantsColor = 0x1a252f; // Dark trousers
        }

        const shirtMat = new THREE.MeshLambertMaterial({ color: shirtColor });
        const pantsMat = new THREE.MeshLambertMaterial({ color: pantsColor });

        // Head
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), skinMat);
        head.position.y = 1.62;
        ped.add(head);

        // Torso
        const torso = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.58, 0.28), shirtMat);
        torso.position.y = 1.25;
        ped.add(torso);

        // Backpack / Briefcase for special types
        if (charType === 'student') {
            const bag = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.4, 0.16), new THREE.MeshLambertMaterial({ color: 0xc0392b }));
            bag.position.set(0, 1.25, -0.2);
            ped.add(bag);
        } else if (charType === 'office') {
            const briefcase = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.28, 0.35), new THREE.MeshLambertMaterial({ color: 0x111111 }));
            briefcase.position.set(0.35, 0.8, 0);
            ped.add(briefcase);
        } else if (charType === 'family') {
            const suitcase = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.5, 0.55), new THREE.MeshLambertMaterial({ color: 0x8e44ad }));
            suitcase.position.set(0.45, 0.3, 0);
            ped.add(suitcase);
        }

        // Two Legs for walking animation
        const legGeo = new THREE.BoxGeometry(0.16, 0.65, 0.16);
        const leftLeg = new THREE.Mesh(legGeo, pantsMat);
        leftLeg.position.set(-0.13, 0.6, 0);
        const rightLeg = new THREE.Mesh(legGeo, pantsMat);
        rightLeg.position.set(0.13, 0.6, 0);

        // Arms for walking and hailing gestures
        const armGeo = new THREE.BoxGeometry(0.12, 0.55, 0.12);
        const leftArm = new THREE.Mesh(armGeo, shirtMat);
        leftArm.position.set(-0.31, 1.22, 0);
        const rightArm = new THREE.Mesh(armGeo, shirtMat);
        rightArm.position.set(0.31, 1.22, 0);

        ped.add(leftLeg, rightLeg, leftArm, rightArm);
        ped.userData.leftLeg = leftLeg;
        ped.userData.rightLeg = rightLeg;
        ped.userData.leftArm = leftArm;
        ped.userData.rightArm = rightArm;

        return ped;
    },

    createTeaStall() {
        const stall = new THREE.Group();
        // Wooden frame / tong shop (টং দোকান)
        const woodMat = new THREE.MeshLambertMaterial({ color: 0x795548 });
        const tinMat = new THREE.MeshLambertMaterial({ color: 0x90a4ae });

        // Stall base / counter
        const base = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.1, 1.8), woodMat);
        base.position.y = 0.55;
        stall.add(base);

        // Tin roof canopy
        const roof = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.1, 2.4), tinMat);
        roof.position.set(0, 2.3, 0.2);
        roof.rotation.x = -0.15;
        stall.add(roof);

        // 4 pillars
        const pGeo = new THREE.CylinderGeometry(0.04, 0.04, 2.2);
        [[-1.3, 1.1, 0.8], [1.3, 1.1, 0.8], [-1.3, 1.1, -0.8], [1.3, 1.1, -0.8]].forEach(p => {
            const pole = new THREE.Mesh(pGeo, woodMat);
            pole.position.set(p[0], p[1], p[2]);
            stall.add(pole);
        });

        // Kettle (aluminum)
        const kettle = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.35, 8), this.materials.chrome);
        kettle.position.set(0.4, 1.25, 0.2);
        stall.add(kettle);

        // Tong Bench for customers
        const bench = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.4, 0.45), woodMat);
        bench.position.set(0, 0.25, 1.4);
        stall.add(bench);

        // Bengali Signboard: "মামার চা স্টল" (Mama's Tea Stall)
        const signCanvas = document.createElement('canvas');
        signCanvas.width = 256;
        signCanvas.height = 64;
        const sctx = signCanvas.getContext('2d');
        sctx.fillStyle = '#b71c1c';
        sctx.fillRect(0, 0, 256, 64);
        sctx.strokeStyle = '#ffeb3b';
        sctx.lineWidth = 4;
        sctx.strokeRect(2, 2, 252, 60);
        sctx.fillStyle = '#ffffff';
        sctx.font = 'bold 22px sans-serif';
        sctx.textAlign = 'center';
        sctx.fillText('মামার স্পেশাল চা স্টল', 128, 40);

        const signTex = new THREE.CanvasTexture(signCanvas);
        const signMesh = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.55), new THREE.MeshBasicMaterial({ map: signTex }));
        signMesh.position.set(0, 2.05, 1.15);
        stall.add(signMesh);

        return stall;
    },

    createShopBuilding() {
        const b = new THREE.Group();
        const colors = [0xd35400, 0x2980b9, 0x16a085, 0x8e44ad, 0x2c3e50, 0xd4ac0d];
        const col = colors[Math.floor(Math.random() * colors.length)];
        const bMat = new THREE.MeshLambertMaterial({ color: col });

        const width = 4 + Math.random() * 2;
        const height = 4 + Math.random() * 4;
        const depth = 5;

        const body = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), bMat);
        body.position.y = height / 2;
        body.castShadow = true;
        b.add(body);

        // Ground floor shutter / shop entrance
        const shutterMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
        const shutter = new THREE.Mesh(new THREE.BoxGeometry(width * 0.75, 2.2, 0.1), shutterMat);
        shutter.position.set(0, 1.1, depth / 2 + 0.05);
        b.add(shutter);

        // Windows on upper floors
        if (height > 5) {
            const winMat = this.materials.glass;
            const w1 = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.0, 0.1), winMat);
            w1.position.set(-width * 0.25, height * 0.65, depth / 2 + 0.05);
            const w2 = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.0, 0.1), winMat);
            w2.position.set(width * 0.25, height * 0.65, depth / 2 + 0.05);
            b.add(w1, w2);
        }

        // Fictional Dhaka store names
        const names = ['ভাই ভাই এন্টারপ্রাইজ', 'নিউ ঢাকা ফার্মেসি', 'বিক্রমপুর মিষ্টান্ন ভান্ডার', 'মায়ের দোয়া টেলিকম', 'জনতা স্টোর'];
        const name = names[Math.floor(Math.random() * names.length)];

        const c = document.createElement('canvas');
        c.width = 256;
        c.height = 64;
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#0f2027';
        ctx.fillRect(0, 0, 256, 64);
        ctx.strokeStyle = '#00e676';
        ctx.lineWidth = 4;
        ctx.strokeRect(2, 2, 252, 60);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(name, 128, 40);

        const tex = new THREE.CanvasTexture(c);
        const sign = new THREE.Mesh(new THREE.PlaneGeometry(width * 0.75, 0.7), new THREE.MeshBasicMaterial({ map: tex }));
        sign.position.set(0, 2.65, depth / 2 + 0.07);
        b.add(sign);

        return b;
    },

    createTree() {
        const tree = new THREE.Group();
        const trunkMat = new THREE.MeshLambertMaterial({ color: 0x5d4037 });
        const foliageMat = new THREE.MeshLambertMaterial({ color: 0x2e7d32 });

        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.35, 3.5), trunkMat);
        trunk.position.y = 1.75;
        tree.add(trunk);

        // Layered foliage (neem/banyan style)
        const f1 = new THREE.Mesh(new THREE.SphereGeometry(1.6, 6, 6), foliageMat);
        f1.position.y = 4.2;
        const f2 = new THREE.Mesh(new THREE.SphereGeometry(1.2, 5, 5), foliageMat);
        f2.position.set(0.5, 4.8, -0.4);
        tree.add(f1, f2);

        return tree;
    },

    createUtilityPole() {
        const pole = new THREE.Group();
        const concreteMat = new THREE.MeshLambertMaterial({ color: 0x78909c });
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 7.5), concreteMat);
        post.position.y = 3.75;
        pole.add(post);

        // Crossarms with insulators
        const arm = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.12, 0.12), concreteMat);
        arm.position.set(0, 6.8, 0);
        pole.add(arm);

        const insMat = new THREE.MeshLambertMaterial({ color: 0x37474f });
        const ins1 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.25), insMat);
        ins1.position.set(-0.8, 7.0, 0);
        const ins2 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.25), insMat);
        ins2.position.set(0.8, 7.0, 0);
        pole.add(ins1, ins2);

        return pole;
    },

    createPothole(size = 'small') {
        const radius = size === 'large' ? 1.4 : 0.85;
        const geo = new THREE.CircleGeometry(radius, 8);
        geo.rotateX(-Math.PI / 2);
        const pothole = new THREE.Mesh(geo, this.materials.potholeMat);
        pothole.position.y = 0.02; // Just above road plane
        pothole.userData.radius = radius;
        pothole.userData.severity = size;
        return pothole;
    },

    createFloodPatch(width = 8, length = 15) {
        const geo = new THREE.PlaneGeometry(width, length);
        geo.rotateX(-Math.PI / 2);
        const patch = new THREE.Mesh(geo, this.materials.waterMat);
        patch.position.y = 0.03;
        patch.userData.isWater = true;
        return patch;
    },

    createRoadBlockade() {
        const group = new THREE.Group();
        const barMat = new THREE.MeshLambertMaterial({ color: 0xd32f2f });
        const postMat = new THREE.MeshLambertMaterial({ color: 0x333333 });

        // Heavy police / construction barrier
        const barGeo = new THREE.BoxGeometry(4.0, 0.6, 0.15);
        const bar = new THREE.Mesh(barGeo, barMat);
        bar.position.y = 0.8;
        group.add(bar);

        // Yellow reflective stripes
        const stripeGeo = new THREE.BoxGeometry(0.4, 0.62, 0.17);
        const yellowMat = new THREE.MeshBasicMaterial({ color: 0xffeb3b });
        [-1.4, -0.6, 0.2, 1.0].forEach(x => {
            const s = new THREE.Mesh(stripeGeo, yellowMat);
            s.position.set(x, 0.8, 0);
            group.add(s);
        });

        // Feet
        const pGeo = new THREE.BoxGeometry(0.2, 1.1, 0.8);
        const p1 = new THREE.Mesh(pGeo, postMat);
        p1.position.set(-1.8, 0.55, 0);
        const p2 = new THREE.Mesh(pGeo, postMat);
        p2.position.set(1.8, 0.55, 0);
        group.add(p1, p2);

        return group;
    },

    createOverheadGantry(leftText = 'MAIN ROAD (SAFE)', rightText = 'SHORTCUT (POTHOLES)') {
        const gantry = new THREE.Group();
        const metalMat = new THREE.MeshLambertMaterial({ color: 0x455a64 });

        // Two side pillars
        const pGeo = new THREE.CylinderGeometry(0.18, 0.22, 6.5);
        const lp = new THREE.Mesh(pGeo, metalMat);
        lp.position.set(-8.5, 3.25, 0);
        const rp = new THREE.Mesh(pGeo, metalMat);
        rp.position.set(8.5, 3.25, 0);
        gantry.add(lp, rp);

        // Overhead truss
        const truss = new THREE.Mesh(new THREE.BoxGeometry(17.4, 0.4, 0.4), metalMat);
        truss.position.set(0, 6.2, 0);
        gantry.add(truss);

        // Left Sign (Green background)
        const leftCanvas = document.createElement('canvas');
        leftCanvas.width = 256;
        leftCanvas.height = 128;
        const lctx = leftCanvas.getContext('2d');
        lctx.fillStyle = '#1b5e20';
        lctx.fillRect(0, 0, 256, 128);
        lctx.strokeStyle = '#ffffff';
        lctx.lineWidth = 6;
        lctx.strokeRect(4, 4, 248, 120);
        lctx.fillStyle = '#ffffff';
        lctx.font = 'bold 22px sans-serif';
        lctx.textAlign = 'center';
        lctx.fillText('⇦ ' + leftText, 128, 55);
        lctx.font = '16px sans-serif';
        lctx.fillStyle = '#a5d6a7';
        lctx.fillText('Smoother • Traffic', 128, 90);

        const leftTex = new THREE.CanvasTexture(leftCanvas);
        const leftSign = new THREE.Mesh(new THREE.PlaneGeometry(5.5, 2.2), new THREE.MeshBasicMaterial({ map: leftTex }));
        leftSign.position.set(-4.2, 5.0, 0.05);
        gantry.add(leftSign);

        // Right Sign (Amber/Warning background)
        const rightCanvas = document.createElement('canvas');
        rightCanvas.width = 256;
        rightCanvas.height = 128;
        const rctx = rightCanvas.getContext('2d');
        rctx.fillStyle = '#b71c1c';
        rctx.fillRect(0, 0, 256, 128);
        rctx.strokeStyle = '#ffffff';
        rctx.lineWidth = 6;
        rctx.strokeRect(4, 4, 248, 120);
        rctx.fillStyle = '#ffffff';
        rctx.font = 'bold 22px sans-serif';
        rctx.textAlign = 'center';
        rctx.fillText(rightText + ' ⇨', 128, 55);
        rctx.font = '16px sans-serif';
        rctx.fillStyle = '#ffccbc';
        rctx.fillText('Faster • Risky Bumps', 128, 90);

        const rightTex = new THREE.CanvasTexture(rightCanvas);
        const rightSign = new THREE.Mesh(new THREE.PlaneGeometry(5.5, 2.2), new THREE.MeshBasicMaterial({ map: rightTex }));
        rightSign.position.set(4.2, 5.0, 0.05);
        gantry.add(rightSign);

        return gantry;
    },

    createRepairShop() {
        const garage = new THREE.Group();
        const wallMat = new THREE.MeshLambertMaterial({ color: 0x1976d2 });
        const roofMat = new THREE.MeshLambertMaterial({ color: 0x37474f });
        const floorMat = new THREE.MeshLambertMaterial({ color: 0x455a64 });

        // Garage Workshop building
        const building = new THREE.Mesh(new THREE.BoxGeometry(7.0, 4.5, 6.0), wallMat);
        building.position.set(0, 2.25, 0);
        garage.add(building);

        // Open garage bay cutout / shutter
        const bayShutter = new THREE.Mesh(new THREE.BoxGeometry(5.2, 3.2, 0.2), new THREE.MeshLambertMaterial({ color: 0x212121 }));
        bayShutter.position.set(0, 1.6, -2.95);
        garage.add(bayShutter);

        // Garage Canopy overhang
        const canopy = new THREE.Mesh(new THREE.BoxGeometry(8.0, 0.3, 3.5), roofMat);
        canopy.position.set(0, 4.2, -3.8);
        garage.add(canopy);

        // Bengali Signboard: "মা মটরস — সিএনজি সার্ভিসিং ও মেরামত (৳২০)"
        const sCanvas = document.createElement('canvas');
        sCanvas.width = 512;
        sCanvas.height = 140;
        const sctx = sCanvas.getContext('2d');
        sctx.fillStyle = '#ff6f00';
        sctx.fillRect(0, 0, 512, 140);
        sctx.strokeStyle = '#ffffff';
        sctx.lineWidth = 8;
        sctx.strokeRect(6, 6, 500, 128);
        sctx.fillStyle = '#ffffff';
        sctx.font = 'bold 36px sans-serif';
        sctx.textAlign = 'center';
        sctx.fillText('🔧 মা মটরস — সিএনজি মেরামত', 256, 55);
        sctx.font = 'bold 30px sans-serif';
        sctx.fillStyle = '#fffde7';
        sctx.fillText('REPAIR CNG HERE: ৳20 (100% HEALTH)', 256, 105);

        const sTex = new THREE.CanvasTexture(sCanvas);
        const sign = new THREE.Mesh(new THREE.PlaneGeometry(6.8, 1.8), new THREE.MeshBasicMaterial({ map: sTex }));
        sign.position.set(0, 4.3, -4.5);
        garage.add(sign);

        // Tall Glowing Wrench Beacon visible from afar
        const beaconPillar = new THREE.Mesh(
            new THREE.CylinderGeometry(0.7, 1.2, 14, 16),
            new THREE.MeshBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.35 })
        );
        beaconPillar.position.set(0, 7.0, -3.8);
        garage.add(beaconPillar);

        // 3D Floating Wrench Signboard above bay
        const wCanvas = document.createElement('canvas');
        wCanvas.width = 256;
        wCanvas.height = 80;
        const wctx = wCanvas.getContext('2d');
        wctx.fillStyle = '#00e5ff';
        wctx.roundRect(4, 4, 248, 72, 14);
        wctx.fill();
        wctx.fillStyle = '#0b0f19';
        wctx.font = 'bold 26px sans-serif';
        wctx.textAlign = 'center';
        wctx.fillText('🔧 REPAIR ৳20', 128, 48);

        const wTex = new THREE.CanvasTexture(wCanvas);
        const wSign = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 1.1), new THREE.MeshBasicMaterial({ map: wTex, side: THREE.DoubleSide }));
        wSign.position.set(0, 5.8, -3.8);
        garage.add(wSign);

        // Repair Bay Tarmac Marking on road edge
        const bayMarking = new THREE.Mesh(
            new THREE.PlaneGeometry(4.8, 8.0),
            new THREE.MeshLambertMaterial({ color: 0x263238 })
        );
        bayMarking.rotateX(-Math.PI / 2);
        bayMarking.position.set(0, 0.02, -3.8);
        garage.add(bayMarking);

        return garage;
    },

    createWarningBarricade(width = 3.6) {
        const group = new THREE.Group();
        const barMat = new THREE.MeshLambertMaterial({ color: 0xd32f2f });
        const postMat = new THREE.MeshLambertMaterial({ color: 0x212121 });

        // Barrier crossbeams
        const barGeo = new THREE.BoxGeometry(width, 0.45, 0.15);
        const bar1 = new THREE.Mesh(barGeo, barMat);
        bar1.position.y = 0.9;
        const bar2 = new THREE.Mesh(barGeo, barMat);
        bar2.position.y = 0.4;
        group.add(bar1, bar2);

        // Yellow reflective hazard stripes
        const stripeGeo = new THREE.BoxGeometry(0.35, 0.47, 0.17);
        const yellowMat = new THREE.MeshBasicMaterial({ color: 0xffeb3b });
        const numStripes = Math.floor(width / 0.7);
        for (let i = 0; i < numStripes; i++) {
            const sx = - (width / 2) + 0.45 + i * 0.7;
            const s1 = new THREE.Mesh(stripeGeo, yellowMat);
            s1.position.set(sx, 0.9, 0);
            const s2 = new THREE.Mesh(stripeGeo, yellowMat);
            s2.position.set(sx, 0.4, 0);
            group.add(s1, s2);
        }

        // Two support posts
        const pGeo = new THREE.BoxGeometry(0.2, 1.3, 0.9);
        const p1 = new THREE.Mesh(pGeo, postMat);
        p1.position.set(-width / 2 + 0.15, 0.65, 0);
        const p2 = new THREE.Mesh(pGeo, postMat);
        p2.position.set(width / 2 - 0.15, 0.65, 0);
        group.add(p1, p2);

        // Flashing amber hazard lights on top of posts
        const lampGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.22, 8);
        const lampMat = new THREE.MeshBasicMaterial({ color: 0xffa000 });
        const l1 = new THREE.Mesh(lampGeo, lampMat);
        l1.position.set(-width / 2 + 0.15, 1.35, 0);
        const l2 = new THREE.Mesh(lampGeo, lampMat);
        l2.position.set(width / 2 - 0.15, 1.35, 0);
        group.add(l1, l2);

        group.userData.width = width;
        return group;
    },

    createLaneBlocker(stripeStyle = 'hazard') {
        const group = new THREE.Group();

        // 1. Concrete / Heavy Plastic Jersey Barrier Base
        const barrierMat = new THREE.MeshLambertMaterial({ color: 0x37474f });
        const baseGeo = new THREE.BoxGeometry(0.72, 0.55, 2.3);
        const base = new THREE.Mesh(baseGeo, barrierMat);
        base.position.y = 0.275;
        base.castShadow = true;
        group.add(base);

        // Sloped upper barrier section
        const topGeo = new THREE.BoxGeometry(0.44, 0.45, 2.25);
        const top = new THREE.Mesh(topGeo, barrierMat);
        top.position.y = 0.725;
        top.castShadow = true;
        group.add(top);

        // 2. High-visibility diagonal hazard stripes (Yellow & Black)
        const stripeYellowMat = new THREE.MeshBasicMaterial({ color: 0xffd600 });
        const stripeBlackMat = new THREE.MeshBasicMaterial({ color: 0x181818 });
        const numStripes = 6;
        const stripeLen = 2.2 / numStripes;

        for (let i = 0; i < numStripes; i++) {
            const mat = (i % 2 === 0) ? stripeYellowMat : stripeBlackMat;
            const zOffset = -1.1 + i * stripeLen + stripeLen / 2;

            // Left side stripe plate
            const leftStripe = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.42, stripeLen * 0.95), mat);
            leftStripe.position.set(-0.23, 0.725, zOffset);
            // Right side stripe plate
            const rightStripe = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.42, stripeLen * 0.95), mat);
            rightStripe.position.set(0.23, 0.725, zOffset);

            group.add(leftStripe, rightStripe);
        }

        // 3. Reflective Amber & Red Cat-Eye Markers at ends
        const catEyeGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.05, 8);
        catEyeGeo.rotateX(Math.PI / 2);
        const catEyeFrontMat = new THREE.MeshBasicMaterial({ color: 0xff3d00 });
        const catEyeBackMat = new THREE.MeshBasicMaterial({ color: 0xffab00 });

        const frontEye = new THREE.Mesh(catEyeGeo, catEyeFrontMat);
        frontEye.position.set(0, 0.45, -1.16);
        const backEye = new THREE.Mesh(catEyeGeo, catEyeBackMat);
        backEye.position.set(0, 0.45, 1.16);
        group.add(frontEye, backEye);

        // 4. Flexible Delineator Warning Pylon on top
        const pylonPoleGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.85, 10);
        const pylonMat = new THREE.MeshLambertMaterial({ color: 0xff6d00 }); // Traffic Safety Orange
        const pylon = new THREE.Mesh(pylonPoleGeo, pylonMat);
        pylon.position.set(0, 1.35, 0);
        group.add(pylon);

        // Reflective white safety collars on pylon
        const collarGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.16, 10);
        const whiteCollarMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const c1 = new THREE.Mesh(collarGeo, whiteCollarMat);
        c1.position.set(0, 1.45, 0);
        const c2 = new THREE.Mesh(collarGeo, whiteCollarMat);
        c2.position.set(0, 1.25, 0);
        group.add(c1, c2);

        // Top warning cap
        const capGeo = new THREE.SphereGeometry(0.08, 8, 8);
        const capMat = new THREE.MeshBasicMaterial({ color: 0xffd600 });
        const cap = new THREE.Mesh(capGeo, capMat);
        cap.position.set(0, 1.78, 0);
        group.add(cap);

        group.userData.isLaneBlocker = true;
        return group;
    },

    createLevelGate(levelInfo, isVictory = false, isIntro = false) {
        const gate = new THREE.Group();

        // 1. Heavy Industrial Steel Towers (Left & Right)
        const steelMat = new THREE.MeshLambertMaterial({ color: 0x1e293b }); // Deep structural steel
        const trussMat = new THREE.MeshLambertMaterial({ color: 0x334155 });
        const concreteMat = new THREE.MeshLambertMaterial({ color: 0x94a3b8 });
        const hazardYellowMat = new THREE.MeshBasicMaterial({ color: 0xffd600 });
        const hazardBlackMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });

        [-8.6, 8.6].forEach(x => {
            // Concrete Impact Crash Barrier / Pedestal
            const pedestal = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.5, 1.8), concreteMat);
            pedestal.position.set(x, 0.75, 0);
            pedestal.castShadow = true;
            gate.add(pedestal);

            // Reflectorized Chevron Hazard Stripes on Pedestal
            for (let s = 0; s < 5; s++) {
                const sMat = (s % 2 === 0) ? hazardYellowMat : hazardBlackMat;
                const stripe = new THREE.Mesh(new THREE.BoxGeometry(1.64, 0.24, 1.84), sMat);
                stripe.position.set(x, 0.2 + s * 0.28, 0);
                gate.add(stripe);
            }

            // Dual Heavy Tubular Steel Columns
            const col1 = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 6.6, 12), steelMat);
            col1.position.set(x - 0.38, 4.3, 0);
            const col2 = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 6.6, 12), steelMat);
            col2.position.set(x + 0.38, 4.3, 0);
            gate.add(col1, col2);

            // Diagonal Lattice Bracing between columns
            for (let b = 0; b < 6; b++) {
                const brace = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.08, 0.08), trussMat);
                brace.position.set(x, 1.6 + b * 1.0, 0);
                brace.rotation.z = (b % 2 === 0) ? 0.38 : -0.38;
                gate.add(brace);
            }

            // Flashing Amber Hazard Beacon Strobe on top of tower
            const strobeBase = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.22, 8), steelMat);
            strobeBase.position.set(x, 7.7, 0);
            const strobeLens = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.32, 10), new THREE.MeshBasicMaterial({ color: 0xff9100 }));
            strobeLens.position.set(x, 7.95, 0);
            gate.add(strobeBase, strobeLens);
        });

        // 2. Overhead Heavy Steel Gantry Truss
        const mainBeam = new THREE.Mesh(new THREE.BoxGeometry(18.4, 0.38, 0.38), steelMat);
        mainBeam.position.set(0, 7.5, 0);
        const lowerBeam = new THREE.Mesh(new THREE.BoxGeometry(18.4, 0.38, 0.38), steelMat);
        lowerBeam.position.set(0, 4.9, 0);
        gate.add(mainBeam, lowerBeam);

        // Truss vertical & diagonal web members
        for (let tx = -7.8; tx <= 7.8; tx += 1.3) {
            const vWeb = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.6, 0.08), trussMat);
            vWeb.position.set(tx, 6.2, 0);
            gate.add(vWeb);
        }

        // 3. High-Definition Highway Expressway Overhead Signboard (1400x380)
        const canvas = document.createElement('canvas');
        canvas.width = 1400;
        canvas.height = 380;
        const ctx = canvas.getContext('2d');

        // Highway Signboard Background Gradient (Dhaka Expressway Green / Victory Royal Gold)
        const grad = ctx.createLinearGradient(0, 0, 1400, 380);
        if (isVictory) {
            grad.addColorStop(0, '#78350f');
            grad.addColorStop(0.3, '#b45309');
            grad.addColorStop(0.7, '#d97706');
            grad.addColorStop(1, '#78350f');
        } else {
            grad.addColorStop(0, '#02381f');
            grad.addColorStop(0.3, '#045d33');
            grad.addColorStop(0.7, '#02532c');
            grad.addColorStop(1, '#02381f');
        }
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 1400, 380);

        // Reflective Triple Highway Sign Borders
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 14;
        ctx.strokeRect(10, 10, 1380, 360);
        ctx.lineWidth = 4;
        ctx.strokeStyle = isVictory ? '#fde047' : '#ffd700';
        ctx.strokeRect(22, 22, 1356, 336);

        // Top Header Banner
        ctx.textAlign = 'center';
        ctx.fillStyle = isVictory ? '#fef08a' : '#facc15';
        ctx.font = 'bold 28px "Segoe UI", Arial, sans-serif';
        const authorityHeader = isVictory ? '★ DHAKA CITY CHAMPION • ঢাকা সিটি চ্যাম্পিয়ন ★' : 'DHAKA ELEVATED EXPRESSWAY • ঢাকা এলিভেটেড এক্সপ্রেসওয়ে';
        ctx.fillText(authorityHeader, 700, 62);

        // Thin Separator line under Header
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(140, 76);
        ctx.lineTo(1260, 76);
        ctx.stroke();

        // Left Badge: Highway Route Shield
        const lvlNum = levelInfo ? levelInfo.id : (isVictory ? '★' : '1');
        ctx.save();
        ctx.fillStyle = isVictory ? '#fbbf24' : '#f59e0b';
        ctx.beginPath();
        ctx.roundRect(50, 110, 150, 160, 20);
        ctx.fill();
        ctx.lineWidth = 5;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();

        ctx.fillStyle = '#0f172a';
        ctx.textAlign = 'center';
        ctx.font = 'bold 22px "Segoe UI", sans-serif';
        ctx.fillText('LEVEL', 125, 155);
        ctx.font = 'bold 64px "Segoe UI", Arial Black, sans-serif';
        ctx.fillText(`${lvlNum}`, 125, 230);
        ctx.restore();

        // Right Badge: Speed & Clearance Specs
        ctx.save();
        ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
        ctx.beginPath();
        ctx.roundRect(1200, 110, 150, 160, 20);
        ctx.fill();
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();

        ctx.fillStyle = '#f8fafc';
        ctx.textAlign = 'center';
        ctx.font = 'bold 20px "Segoe UI", sans-serif';
        ctx.fillText('MAX SPEED', 1275, 145);
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 44px "Segoe UI", Arial Black, sans-serif';
        ctx.fillText('60', 1275, 195);
        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 18px "Segoe UI", sans-serif';
        ctx.fillText('KM/H • 4.5M', 1275, 235);
        ctx.restore();

        // Main Center Content
        ctx.textAlign = 'center';
        if (isVictory) {
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 62px "Segoe UI", "Arial Black", sans-serif';
            ctx.fillText('ALL LEVELS COMPLETED! VICTORY!', 700, 160);

            ctx.fillStyle = '#fde047';
            ctx.font = 'bold 48px "Segoe UI", sans-serif';
            ctx.fillText('★ ঢাকা বিজয়ী চ্যাম্পিয়ন ড্রাইভার ★', 700, 240);

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 26px "Segoe UI", sans-serif';
            ctx.fillText('⮟ DRIVE THROUGH FOR FINAL REWARD • পুরষ্কার গ্রহণ করতে এগিয়ে যান ⮟', 700, 315);
        } else {
            const englishTitle = levelInfo ? levelInfo.title.toUpperCase() : 'NEXT LEVEL';
            const bengaliTitle = levelInfo ? levelInfo.bengaliTitle : 'পরবর্তী লেভেল';

            ctx.fillStyle = '#ffd700';
            ctx.font = 'bold 60px "Segoe UI", "Arial Black", sans-serif';
            ctx.fillText(englishTitle, 700, 155);

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 46px "Segoe UI", sans-serif';
            ctx.fillText(bengaliTitle, 700, 235);

            ctx.fillStyle = '#67e8f9';
            ctx.font = 'bold 26px "Segoe UI", sans-serif';
            ctx.fillText('➤ ➤ DRIVE THROUGH TO ENTER NEXT LEVEL • প্রবেশ করতে এগিয়ে যান ➤ ➤', 700, 315);
        }

        const tex = new THREE.CanvasTexture(canvas);
        const signMat = new THREE.MeshBasicMaterial({ map: tex });

        // Signboard Mesh (Double-sided)
        const signGeo = new THREE.PlaneGeometry(15.4, 2.7);
        const frontSign = new THREE.Mesh(signGeo, signMat);
        frontSign.position.set(0, 6.2, 0.35);
        gate.add(frontSign);

        const backSign = new THREE.Mesh(signGeo, signMat);
        backSign.rotation.y = Math.PI;
        backSign.position.set(0, 6.2, -0.35);
        gate.add(backSign);

        // Signboard Metal Backing Frame
        const frameBox = new THREE.Mesh(new THREE.BoxGeometry(15.6, 2.85, 0.65), steelMat);
        frameBox.position.set(0, 6.2, 0);
        gate.add(frameBox);

        // 4. Electronic Overhead LED Lane Status Indicators (Lane 1 & Lane 2)
        const ledBoxMat = new THREE.MeshLambertMaterial({ color: 0x0a0a0a });
        const ledGreenMat = new THREE.MeshBasicMaterial({ color: 0x00e676 });

        [-3.2, 3.2].forEach(laneX => {
            // LED Housing Box mounted under the lower beam
            const ledBox = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.6, 0.4), ledBoxMat);
            ledBox.position.set(laneX, 4.4, 0);

            // Glowing Down-Arrow / Open Symbol
            const ledFace = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.45), ledGreenMat);
            ledFace.position.set(laneX, 4.4, 0.22);

            const ledFaceBack = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.45), ledGreenMat);
            ledFaceBack.position.set(laneX, 4.4, -0.22);
            ledFaceBack.rotation.y = Math.PI;

            gate.add(ledBox, ledFace, ledFaceBack);
        });

        // 5. Overhead Floodlights illuminating the sign
        const lampMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        [-5.5, -1.8, 1.8, 5.5].forEach(lx => {
            const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.8), steelMat);
            arm.position.set(lx, 7.8, 0.7);
            arm.rotation.x = Math.PI / 4;
            const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.18, 0.3), lampMat);
            lamp.position.set(lx, 8.0, 0.95);
            gate.add(arm, lamp);
        });

        gate.userData.isLevelGate = true;
        return gate;
    }
};

window.ModelFactory = ModelFactory;
