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
        this.driverEyeOffset = new THREE.Vector3(0, 1.46, 0.48); // Cockpit eye position
        this.driverLookAhead = 25.0;

        // Smooth interpolation factors
        this.posLerpChase = 0.14;
        this.lookLerpChase = 0.18;
        this.posLerpDriver = 0.55; // Tighter tracking for cockpit
        this.lookLerpDriver = 0.45;

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
        } else {
            // First-person Driver cockpit view
            const eye = this.driverEyeOffset.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
            this.currentPos.copy(pPos).add(eye);
            this.currentLookAt.copy(this.currentPos).add(forward.clone().multiplyScalar(this.driverLookAhead));
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

        const pPos = this.target.position;
        const yaw = this.target.rotation.y;
        const forward = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw);

        let targetPos = new THREE.Vector3();
        let targetLookAt = new THREE.Vector3();
        let curPosLerp = this.posLerpChase;
        let curLookLerp = this.lookLerpChase;

        if (this.viewMode === 'CHASE') {
            // Adjust distance slightly with speed for dynamic feel
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
        } else {
            // DRIVER VIEW (First-Person Cockpit View)
            curPosLerp = this.posLerpDriver;
            curLookLerp = this.lookLerpDriver;

            const eye = this.driverEyeOffset.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
            targetPos.copy(pPos).add(eye);

            // Dynamic glance when steering
            const glanceAngle = yaw + this.target.steerAngle * 0.35;
            const glanceForward = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), glanceAngle);

            targetLookAt.copy(targetPos).add(glanceForward.multiplyScalar(this.driverLookAhead));
            targetLookAt.y = targetPos.y - 0.2; // Level horizon with slight road focus
        }

        // Smooth Lerp
        this.currentPos.lerp(targetPos, curPosLerp);
        this.currentLookAt.lerp(targetLookAt, curLookLerp);

        // Screen Shake calculation
        this.shakeOffset.set(0, 0, 0);
        if (this.shakeIntensity > 0.01) {
            this.shakeIntensity = Math.max(0, this.shakeIntensity - this.shakeDecay * dt);
            const rX = (Math.random() * 2 - 1) * this.shakeIntensity * 0.45;
            const rY = (Math.random() * 2 - 1) * this.shakeIntensity * 0.35;
            const rZ = (Math.random() * 2 - 1) * this.shakeIntensity * 0.3;
            this.shakeOffset.set(rX, rY, rZ);
        }

        // Subtle engine RPM vibration in cockpit view
        if (this.viewMode === 'DRIVER' && Math.abs(this.target.speed) > 0.1) {
            const vib = Math.sin(Date.now() * 0.06) * 0.012 * (Math.abs(this.target.speed) / this.target.maxSpeed);
            this.shakeOffset.y += vib;
        }

        // Apply final position & lookAt
        this.camera.position.copy(this.currentPos).add(this.shakeOffset);
        this.camera.lookAt(this.currentLookAt.clone().add(this.shakeOffset.clone().multiplyScalar(0.5)));
    }
}

window.ChaseCamera = ChaseCamera;
