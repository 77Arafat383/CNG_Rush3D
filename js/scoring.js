/**
 * CNG Rush 3D - Scoring & Economic System
 * Tracks earnings in Taka (৳), tips, penalties, rating, day timer, and local storage.
 */

class ScoringManager {
    constructor() {
        this.money = 0;             // Total net money in ৳
        this.score = 0;             // Arcade score
        this.tripsCompleted = 0;
        this.perfectTrips = 0;
        this.totalTips = 0;
        this.totalPenalties = 0;
        this.collisionsCount = 0;
        this.potholesCount = 0;
        this.hornUses = 0;

        // Shift Timer: tracks elapsed time (no time limit - endless shift)
        this.shiftTimeElapsed = 0;
        this.isDayComplete = false;

        // Ratings pool (1 to 5 stars)
        this.ratings = [];

        // Load High Score from localStorage
        this.loadSavedData();
    }

    reset() {
        this.money = 0;
        this.score = 0;
        this.tripsCompleted = 0;
        this.perfectTrips = 0;
        this.totalTips = 0;
        this.totalPenalties = 0;
        this.collisionsCount = 0;
        this.potholesCount = 0;
        this.hornUses = 0;
        this.shiftTimeElapsed = 0;
        this.isDayComplete = false;
        this.ratings = [];
    }

    recordTripSuccess(totalEarned, fare, tip, isPerfect) {
        this.money += totalEarned;
        this.totalTips += tip;
        this.tripsCompleted++;

        if (isPerfect) {
            this.perfectTrips++;
            this.ratings.push(5.0);
            this.score += 500;
        } else if (tip > 0) {
            this.ratings.push(4.5 + Math.random() * 0.4);
            this.score += 300;
        } else {
            this.ratings.push(3.5 + Math.random() * 0.5);
            this.score += 150;
        }

        this.score += Math.round(totalEarned * 2);
        this.checkSaveHighScore();
    }

    applyCollisionPenalty(amount = 10) {
        this.collisionsCount++;
        this.totalPenalties += amount;
        this.money = Math.max(0, this.money - amount);
        this.score = Math.max(0, this.score - 50);
        this.ratings.push(2.5);
    }

    applyPotholePenalty(amount = 8) {
        this.potholesCount++;
        this.totalPenalties += amount;
        this.money = Math.max(0, this.money - amount);
        this.score = Math.max(0, this.score - 30);
    }

    applyTripPenalty(amount = 30) {
        this.totalPenalties += amount;
        this.money = Math.max(0, this.money - amount);
        this.score = Math.max(0, this.score - 100);
        this.ratings.push(1.0);
    }

    recordHornUse() {
        this.hornUses++;
    }

    getAverageRating() {
        if (this.ratings.length === 0) return 5.0;
        const sum = this.ratings.reduce((a, b) => a + b, 0);
        return (sum / this.ratings.length).toFixed(1);
    }

    update(dt) {
        // Continuous elapsed shift timer with NO time limit cutoff
        this.shiftTimeElapsed += dt;
        return false;
    }

    getFormattedTime() {
        const m = Math.floor(this.shiftTimeElapsed / 60);
        const s = Math.floor(this.shiftTimeElapsed % 60);
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }

    loadSavedData() {
        try {
            this.bestScore = parseInt(localStorage.getItem('cngRushBestScore') || '0', 10);
            this.bestEarnings = parseInt(localStorage.getItem('cngRushBestEarnings') || '0', 10);
            this.bestTrips = parseInt(localStorage.getItem('cngRushBestTrips') || '0', 10);
        } catch (e) {
            this.bestScore = 0;
            this.bestEarnings = 0;
            this.bestTrips = 0;
        }
    }

    checkSaveHighScore() {
        let isNewHigh = false;
        try {
            if (this.score > this.bestScore) {
                this.bestScore = this.score;
                localStorage.setItem('cngRushBestScore', this.bestScore.toString());
                isNewHigh = true;
            }
            if (this.money > this.bestEarnings) {
                this.bestEarnings = this.money;
                localStorage.setItem('cngRushBestEarnings', this.bestEarnings.toString());
            }
            if (this.tripsCompleted > this.bestTrips) {
                this.bestTrips = this.tripsCompleted;
                localStorage.setItem('cngRushBestTrips', this.bestTrips.toString());
            }
        } catch (e) {
            // LocalStorage disabled or unavailable
        }
        return isNewHigh;
    }
}

window.scoring = new ScoringManager();
