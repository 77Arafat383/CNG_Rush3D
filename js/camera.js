/**
 * CNG Rush 3D - Camera Controller with Chase & First-Person Driver Views
 */

class ChaseCamera {
    constructor(camera, target) {
        this.camera = camera;
        this.target = target; // PlayerCNG instance

        // View mode: 'CHASE' (third-person) or 'DRIVER' (first-person cockpit)
        this.viewMode = 'CHASE';

        // Chase Camera parameters
        this.distBehind = 5.8;
        this.heightAbove = 2.9;
        this.lookAtHeight = 1.3;
        this.lookAheadDistance = 6.0;

        // Driver Camera parameters (inside CNG cockpit)
        this.driverEyeOffset = new THREE.Vector3(0, 1.44, 0.50); // Cockpit eye position
        this.driverLookAhead = 28.0;
        this.smoothedGlance = 0; // Soft damped steering glance

        // Current actual position and look target
        this.currentPos = new THREE.Vector3();
        this.currentLookAt = new THREE.Vector3();

        // Screen shake parameters
        this.shakeIntensity = 0;
        this.shakeDecay = 4.5;
        this.shakeOffset = new THREE.Vector3();

        // Initialize positions
        this.reset();
    }

    toggleView() {
        this.viewMode = this.viewMode === 'CHASE' ? 'DRIVER' : 'CHASE';
        this.reset();
        return this.viewMode;
    }

    setView(mode) {
        if (mode === 'CHASE' || mode === 'DRIVER') {
            this.viewMode = mode;
            this.reset();
        }
    }

    reset() {
        if (!this.target) return;
        const pPos = this.target.position;
        const yaw = this.target.rotation.y;
        const forward = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
        this.smoothedGlance = 0;

        if (this.viewMode === 'CHASE') {
            this.currentPos.set(
                pPos.x - forward.x * this.distBehind,
                pPos.y + this.heightAbove,
                pPos.z - forward.z * this.distBehind
            );
            this.currentLookAt.set(
                pPos.x + forward.x * this.lookAheadDistance,
                pPos.y + this.lookAtHeight,
                pPos.z + forward.z * this.lookAheadDistance
            );
            this.camera.up.set(0, 1, 0);
        } else {
            // First-person Driver cockpit view
            const eye = this.driverEyeOffset.clone().applyEuler(this.target.rotation);
            this.currentPos.copy(pPos).add(eye);
            this.currentLookAt.copy(this.currentPos).add(forward.clone().multiplyScalar(this.driverLookAhead));
            this.camera.up.set(0, 1, 0);
        }

        this.camera.position.copy(this.currentPos);
        this.camera.lookAt(this.currentLookAt);
        this.shakeIntensity = 0;
    }

    shake(amount = 0.3) {
        this.shakeIntensity = Math.min(1.0, this.shakeIntensity + amount);
    }

    update(dt) {
        if (!this.target) return;
        if (dt > 0.1) dt = 0.1; // Clamp delta time spike

        const pPos = this.target.position;
        const yaw = this.target.rotation.y;
        const forward = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw);

        let targetPos = new THREE.Vector3();
        let targetLookAt = new THREE.Vector3();
        let posFactor = 0.15;
        let lookFactor = 0.18;

        if (this.viewMode === 'CHASE') {
            // Third-Person Chase Mode: Framerate-independent smooth tracking
            posFactor = 1.0 - Math.exp(-7.0 * dt);
            lookFactor = 1.0 - Math.exp(-9.0 * dt);

            // Dynamic distance slightly increases with speed
            const speedRatio = Math.max(0, this.target.speed / this.target.maxSpeed);
            const dynamicDist = this.distBehind + speedRatio * 0.8;
            const dynamicHeight = this.heightAbove + speedRatio * 0.3;

            targetPos.set(
                pPos.x - forward.x * dynamicDist,
                pPos.y + dynamicHeight,
                pPos.z - forward.z * dynamicDist
            );

            targetLookAt.set(
                pPos.x + forward.x * this.lookAheadDistance,
                pPos.y + this.lookAtHeight,
                pPos.z + forward.z * this.lookAheadDistance
            );

            // Keep upright
            this.camera.up.lerp(new THREE.Vector3(0, 1, 0), 1.0 - Math.exp(-10.0 * dt));
        } else {
            // DRIVER VIEW (Silky-Smooth First-Person Cockpit View)
            // Framerate-independent tight tracking
            posFactor = 1.0 - Math.exp(-22.0 * dt);
            lookFactor = 1.0 - Math.exp(-15.0 * dt);

            // Eye position locked directly to CNG chassis orientation (yaw, roll & pitch)
            const eye = this.driverEyeOffset.clone().applyEuler(this.target.rotation);
            targetPos.copy(pPos).add(eye);

            // Softly damped steering glance into turns (prevents jerky camera whiplash)
            const targetGlanceAngle = (this.target.steerAngle || 0) * 0.10;
            const glanceSmoothing = 1.0 - Math.exp(-5.5 * dt);
            this.smoothedGlance = THREE.MathUtils.lerp(this.smoothedGlance, targetGlanceAngle, glanceSmoothing);

            const glanceAngle = yaw + this.smoothedGlance;
            const glanceForward = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), glanceAngle);

            // Smooth pitch adjustment following road gradient and chassis pitch
            const pitchFactor = (this.target.rotation.x || 0) * 0.35 - 0.06;
            glanceForward.y += pitchFactor;

            targetLookAt.copy(targetPos).add(glanceForward.multiplyScalar(this.driverLookAhead));

            // Subtle, silky chassis banking tilt in cockpit view
            const bankAngle = -(this.target.rotation.z || 0) * 0.35;
            const targetUp = new THREE.Vector3(0, 1, 0).applyAxisAngle(new THREE.Vector3(0, 0, 1), bankAngle);
            this.camera.up.lerp(targetUp, 1.0 - Math.exp(-12.0 * dt));
        }

        // Apply framerate-independent smooth interpolation
        this.currentPos.lerp(targetPos, posFactor);
        this.currentLookAt.lerp(targetLookAt, lookFactor);

        // Screen Shake calculation (potholes & collisions only)
        this.shakeOffset.set(0, 0, 0);
        if (this.shakeIntensity > 0.01) {
            this.shakeIntensity = Math.max(0, this.shakeIntensity - this.shakeDecay * dt);
            const rX = (Math.random() * 2 - 1) * this.shakeIntensity * 0.35;
            const rY = (Math.random() * 2 - 1) * this.shakeIntensity * 0.25;
            const rZ = (Math.random() * 2 - 1) * this.shakeIntensity * 0.2;
            this.shakeOffset.set(rX, rY, rZ);
        }

        // Apply final smoothed position & lookAt
        this.camera.position.copy(this.currentPos).add(this.shakeOffset);
        this.camera.lookAt(this.currentLookAt.clone().add(this.shakeOffset.clone().multiplyScalar(0.4)));
    }
}

window.ChaseCamera = ChaseCamera;
