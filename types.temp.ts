
export interface Mission {
    id: string;
    description: string;
    target: number;
    progress: number;
    completed: boolean;
    reward: number;
    type: 'SCORE' | 'STARS' | 'DISTANCE' | 'PHASE_SWITCH' | 'NO_GLITCH';
}

export interface UserProfile {
    uid: string;
    username: string;
    email: string;
    photoBase64?: string;
    highScore: number;
    stars: number;
    ownedThemes: string[];
    activeThemeId: string;
    missions: Mission[];
    lastLogin: string; // ISO Date string
}
