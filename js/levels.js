/**
 * CNG Rush 3D - Level Progression System (Levels 1 to 4)
 */

const LEVELS = [
    {
        id: 1,
        title: 'Level 1: Normal Day',
        bengaliTitle: 'লেভেল ১: শান্ত সকাল',
        description: 'Light traffic, sunny weather, straightforward passenger delivery. Learn controls and pickup.',
        trafficDensity: 1,
        hasRain: false,
        tripsRequired: 2,
        targetEarnings: 380,
        unlockedPassengerTypes: ['student', 'elderly']
    },
    {
        id: 2,
        title: 'Level 2: Busy Road',
        bengaliTitle: 'লেভেল ২: ব্যস্ত রাজপথ',
        description: 'Buses, cycle rickshaws, route choices (shortcuts vs safe road), and pedestrian crossing.',
        trafficDensity: 2,
        hasRain: false,
        tripsRequired: 3,
        targetEarnings: 600,
        unlockedPassengerTypes: ['student', 'elderly', 'office']
    },
    {
        id: 3,
        title: 'Level 3: Rainy Day',
        bengaliTitle: 'লেভেল ৩: বৃষ্টিভেজা ঢাকা',
        description: 'Monsoon showers, slippery roads, flooded patches, and hazardous potholes.',
        trafficDensity: 3,
        hasRain: true,
        tripsRequired: 3,
        targetEarnings: 650,
        unlockedPassengerTypes: ['student', 'elderly', 'office', 'family']
    },
    {
        id: 4,
        title: 'Level 4: Rush Hour',
        bengaliTitle: 'লেভেল ৪: অফিস ছুটির পিক আওয়ার',
        description: 'Dense traffic jams, road construction blockades, busy junctions, and impatient passengers.',
        trafficDensity: 4,
        hasRain: false,
        tripsRequired: 4,
        targetEarnings: 800,
        unlockedPassengerTypes: ['student', 'elderly', 'office', 'family']
    }
];

class LevelManager {
    constructor() {
        this.currentLevelIndex = 0;
        this.levelTrips = 0;
        this.levelEarnings = 0;
        this.levelReadyToAdvance = false;
    }

    getCurrentLevel() {
        return LEVELS[this.currentLevelIndex];
    }

    getNextLevel() {
        if (this.currentLevelIndex < LEVELS.length - 1) {
            return LEVELS[this.currentLevelIndex + 1];
        }
        return null;
    }

    isLastLevel() {
        return this.currentLevelIndex >= LEVELS.length - 1;
    }

    reset() {
        this.currentLevelIndex = 0;
        this.levelTrips = 0;
        this.levelEarnings = 0;
        this.levelReadyToAdvance = false;
    }

    onTripCompleted(totalEarned) {
        this.levelTrips++;
        this.levelEarnings += totalEarned;

        const current = this.getCurrentLevel();
        // Check if level requirements are fulfilled
        if (this.levelTrips >= current.tripsRequired) {
            this.levelReadyToAdvance = true;
            return {
                levelComplete: true,
                isLastLevel: this.isLastLevel(),
                nextLevel: this.getNextLevel()
            };
        }
        return {
            levelComplete: false,
            tripsProgress: this.levelTrips,
            tripsRequired: current.tripsRequired
        };
    }

    advanceToNextLevel() {
        if (this.currentLevelIndex < LEVELS.length - 1) {
            this.currentLevelIndex++;
            this.levelTrips = 0;
            this.levelEarnings = 0;
            this.levelReadyToAdvance = false;
            return this.getCurrentLevel();
        }
        return null;
    }

    advanceLevel() {
        return this.advanceToNextLevel();
    }
}

window.levelManager = new LevelManager();

