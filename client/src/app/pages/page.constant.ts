import { Question } from '@app/interfaces/game.model';
import { Historic } from '@app/interfaces/historic.model';
import { Match } from '@app/interfaces/match.model';
import { Player } from '@app/interfaces/player.model';
import { Selections } from '@app/interfaces/selections.model';
import { SocketIoConfig } from 'ngx-socket-io';
import { environment } from 'src/environments/environment';
export const ZERO = 0;
export const INITIAL_SCORE = 0;
export const DEFAULT_GAME_ID = '0';
export const INITIAL_INDEX = 0;
export const TIME_ANSWERS_SHOW = 3;
export const TIME_WAITING_GAME = 5;
export const BONUS_MESSAGE = 'You have a 20% bonus !';
export const EXIT_GAME = 'Exited the game';
export const SNACKBAR_DURATION_EXIT = 3000;
export const SNACKBAR_DURATION_UNAVAILABLE = 3000;
export const SNACKBAR_DURATION_BONUS = 3000;
export const SNACKBAR_DURATION_LOCK = 3000;
export const TAKEN_MESSAGE = 'Ce nom est déjà pris.';
export const INVALID_MESSAGE = 'Au moins une question na pas de bonne réponse ou na pas de mauvaise réponse';
export const NO_TITLE_MESSAGE = 'Au moins une question na pas de titre';
/* eslint-disable */
export const UNAVAILABLE_MESSAGE = "Le mode panique n'est pas disponible en ce moment";
export const DURATION_INTERVAL = 1000;
export const DURATION_INTERVAL_PANIC = 250;
export const PAGE_BODY_CLASS = 'mat-typography';
export const ENTER_BUTTON_CLASS = 'enter-button';
export const CHOICE_BUTTON_UNSELECTED_CLASS = 'choice-button selected';
export const CHOICE_BUTTON_SELECTED_CLASS = 'choice-button';
export const ENTER_KEY = 'Enter';
export const RESULT_PAGE_PATH = '/results';
export const CREATE_GAME_PAGE_PATH = '/creategame';
export const HOME_PAGE_PATH = '/home';
export const MAX_CHOICE_LENGTH = 4;
export const MIN_CHOICE_LENGTH = 2;
export const MAX_POINTS = 100;
export const PERCENTAGE = 100;
export const STEP = 10;
export const MIN_POINTS = 10;
export const MAX_DURATION = 60;
export const MIN_DURATION = 10;
export const DEFAULT_DURATION = 30;
export const TIME_LEFT_QCM = 10;
export const TIME_LEFT_QRL = 20;
export const MAX_HIST_HEIGHT = 5000;
export const QRL_TYPE = 'QRL';
export const QCM_TYPE = 'QCM';
export const BASE_QUESTION = {
    id: 'q1',
    type: QCM_TYPE,
    text: '',
    points: 20,
    choices: [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: true },
        { text: '', isCorrect: false },
    ],
    textZone: '',
    selections: [],
};
export const ORGANIZER = 'Organisateur' || 'organisateur';
export const BONUS_MULTIPLIER = 1.2;
export const TIME_OVER = 0;
export const INDEX = -1;
export const GAME_START = {
    id: '1',
    title: 'Game',
    description: 'Description of Game',
    isVisible: true,
    lastModification: new Date(),
    duration: 10,
    questions: [
        {
            id: 'q1',
            type: QCM_TYPE,
            text: 'Question',
            points: 20,
            choices: [
                { text: 'Bonne réponse', isCorrect: true },
                { text: 'Mauvaise réponse', isCorrect: false },
            ],
            textZone: '',
            selections: [],
        },
        {
            id: 'q2',
            type: QRL_TYPE,
            text: 'Question',
            points: 20,
            choices: [],
            textZone: '',
            selections: [],
        },
    ],
};
export const BASE_GAME = {
    id: '1',
    title: 'Game',
    description: 'Description of Game',
    isVisible: true,
    lastModification: new Date(),
    duration: 10,
    questions: [
        {
            id: 'q7',
            type: QCM_TYPE,
            text: 'Quel est le meilleur type de poulie?',
            points: 20,
            choices: [
                { text: 'Poulie simple fixe', isCorrect: false },
                { text: 'Poulies composées', isCorrect: false },
                { text: 'Palan composé de deux moufles', isCorrect: true },
                { text: 'Poulie triple', isCorrect: false },
            ],
            textZone: '',
            selections: [],
        },
        {
            id: 'q8',
            type: QCM_TYPE,
            text: 'Quelle est la meilleure lettre??',
            points: 30,
            choices: [
                { text: 'R', isCorrect: true },
                { text: 'C', isCorrect: false },
            ],
            textZone: '',
            selections: [],
        },
    ],
};
export const PLAYER_BASE: Player[] = [
    {
        name: 'Organisateur',
        points: 0,
        status: 'active',
        selection: [],
        bonuses: 0,
    },
];
export const MATCH_BASE: Match = {
    game: BASE_GAME,
    canBeAccessed: true,
    startDate: new Date(),
    questionId: '',
    players: PLAYER_BASE,
    time: 0,
    messages: [],
    accessCode: '1234',
    creator: 'Organisateur',
    nomsBannis: [],
};
export const BASE_HISTORY: Historic = {
    id: '1',
    gameName: 'Game Name',
    playDate: new Date(),
    players: 0,
    bestPoints: 0,
};
export const PERCENT_SCORE = 1.2;
export const HISTOGRAM_DATA_BASE = [0, 0];
export const MAX_RANDOM_CODE = 9000;
export const MIN_RANDOM_CODE = 1000;
export const DISCONNECT = 'disconnected';
export const IDLE = 'idle';
export const MATCH_ID_BASE = '1234';
export const TARGET_FONT_FACTOR = 4;
export const QRL_COLORS = ['#c20602', '#802f7e', '#103fab'];
export const QRL_SCORES = ['0%', '50%', '100%'];
export const NEW_QCM: Question = {
    id: 'q1',
    text: 'Question ',
    type: QCM_TYPE,
    points: 50,
    choices: [],
    textZone: '',
    selections: [],
};
export const NEW_QRL: Question = {
    id: 'q1',
    text: 'Question ',
    type: QRL_TYPE,
    points: 50,
    choices: [],
    textZone: '',
    selections: [],
};
export const MOCK_HISTORY: Historic[] = [
    {
        id: '1',
        gameName: 'A game name',
        playDate: new Date('2023-11-01T08:00:00'),
        players: 4,
        bestPoints: 80,
    },
    {
        id: '2',
        gameName: 'Best game',
        playDate: new Date('2023-05-02T09:45:48'),
        players: 3,
        bestPoints: 95,
    },
    {
        id: '3',
        gameName: 'Some game',
        playDate: new Date('2022-11-02T09:30:00'),
        players: 6,
        bestPoints: 60,
    },
    {
        id: '4',
        gameName: 'Another Game',
        playDate: new Date('2023-11-02T09:30:00'),
        players: 3,
        bestPoints: 100,
    },
];
export const MAX_QRL_TEXT_LENGTH = 200;
export const MOCK_DATA = [
    [0, 2, 7, 2],
    [0, 1, 3, 4],
    [0, 2, 7, 18],
    [4, 0, 9],
];
const CONSTANT_PATH_END_CHAR = -3;
export const CONFIG: SocketIoConfig = { url: environment.serverUrl.slice(0, CONSTANT_PATH_END_CHAR), options: {} };
export const MESSAGE_LIMIT = 200;
export const EMPTY_STRING = '';
export const TIME_FORMAT = 'en-US';
export const PLAYER_NAME = 'PLAYER_NAME';
export const ACTIVE_STATUS = 'active';
export const API = 'api';
export const API_LENGTH = 3;
export const ZERO_POINTS = 0;
export const HALF_POINTS = 50;
export const ZERO_POINTS_INDEX = 0;
export const HALF_POINTS_INDEX = 1;
export const MAX_POINTS_INDEX = 2;
export const MOCK_QUESTIONS = [
    {
        id: '1',
        type: 'QCM',
        text: 'What is the capital of France?',
        points: 50,
        choices: [
            { text: 'Paris', isCorrect: true },
            { text: 'London', isCorrect: false },
            { text: 'Berlin', isCorrect: false },
            { text: 'Madrid', isCorrect: false },
        ],
        textZone: '',
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        selections: [5, 4, 3, 2],
    },
    {
        id: '2',
        type: 'QCM',
        text: 'What is the largest country in the world by land area?',
        points: 100,
        choices: [
            { text: 'Russia', isCorrect: true },
            { text: 'Canada', isCorrect: false },
            { text: 'China', isCorrect: false },
            { text: 'United States', isCorrect: false },
        ],
        textZone: '',
        selections: [1],
    },
];
export const MOCK_SELECTIONS: Selections = {
    room: 'test',
    questions: MOCK_QUESTIONS,
    acknowledged: false,
};
