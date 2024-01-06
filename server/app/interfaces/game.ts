export interface Choice {
    text: string;
    isCorrect: boolean;
}

export interface Question {
    id: string;
    // QCM ou QRL
    type: string;
    text: string;
    // each question has a value between [10,100] and is also a multiple of 10
    points: number;
    choices: Choice[];
    textZone: string;
    // QCM: at position 0 is the number of selections for the 1st option, at position 1 is the number of selections for the 2nd option, etc.
    // QRL: position 0 is 0, pos 1 is 50, pos 2 is 100
    selections: number[];
}

export interface Game {
    id: string;
    title: string;
    isVisible: boolean;
    lastModification: Date;
    // 10 to 60 seconds, the set time is the same for all the questions
    duration: number;
    description: string;
    questions: Question[];
}
