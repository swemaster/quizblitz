import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { Game, Question } from '@app/interfaces/game.model';
import { MAX_CHOICE_LENGTH, MAX_DURATION, MAX_POINTS, MIN_CHOICE_LENGTH, MIN_DURATION, MIN_POINTS } from '@app/pages/page.constant';
import { CommunicationService } from '@app/services/communication.service';
import { QuestionService } from '@app/services/question.service';
import * as gameSchema from '@assets/quiz-schema.json';
import Ajv from 'ajv';
import { BehaviorSubject, Subscription } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class GameValidationService implements OnDestroy {
    games: Game[] = [];
    message: BehaviorSubject<string> = new BehaviorSubject<string>('');
    importedGame: BehaviorSubject<Game | undefined> = new BehaviorSubject<Game | undefined>(undefined);
    private subscriptions: Subscription[] = [];

    constructor(
        private questionService: QuestionService,
        private communicationService: CommunicationService,
        private ajv: Ajv,
    ) {
        this.subscriptions.push(
            this.communicationService.getGames().subscribe({
                next: (games) => {
                    this.games = games;
                },
            }),
        );
    }

    validateGame(game: Game) {
        const errors: string[] = [];
        const isValid = this.ajv.validate(gameSchema, game);
        if (!isValid) {
            errors.push(this.ajv.errorsText());
        }
        this.checkQuestions(game, errors);

        return errors;
    }

    checkQuestions(game: Game, errors: string[]): void {
        if (game.questions.length === 0) {
            errors.push('Le jeu doit contenir au moins une question.');
        } else {
            this.checkQuestionTimes(game, errors);
            game.questions.forEach((question, index) => {
                const questionNumber = index + 1;
                this.checkQuestionPoints(question, errors, questionNumber);
                if (question.type === 'QCM') {
                    this.checkQCMQuestion(question, errors, questionNumber);
                }
            });
        }
    }

    checkQCMQuestion(question: Question, errors: string[], questionNumber: number): void {
        const hasCorrectChoice = question.choices.some((choice) => choice.isCorrect);
        const hasIncorrectChoice = question.choices.some((choice) => !choice.isCorrect);

        if (!hasCorrectChoice || !hasIncorrectChoice) {
            errors.push(`Question ${questionNumber}: Les questions QCM doivent contenir au moins un bon et un mauvais choix.`);
        }
        if (question.choices.length < MIN_CHOICE_LENGTH || question.choices.length > MAX_CHOICE_LENGTH) {
            errors.push(`Question ${questionNumber}: Les questions QCM doivent contenir entre 2 et 4 choix de réponse inclusivement.`);
        }
    }

    checkQuestionPoints(question: Question, errors: string[], questionNumber: number): void {
        if (
            !Number.isInteger(question.points) ||
            question.points < MIN_POINTS ||
            question.points > MAX_POINTS ||
            question.points % MIN_POINTS !== 0
        ) {
            errors.push(`Question ${questionNumber}: Chaque question doit valoir entre 10 et 100 points, multiple de 10.`);
        }
    }

    checkQuestionTimes(game: Game, errors: string[]): void {
        const qmcQuestions = game.questions.filter((question) => question.type === 'QCM');
        if (qmcQuestions.length > 0 && (game.duration < MIN_DURATION || game.duration > MAX_DURATION)) {
            errors.push('Le temps pour chaque question QCM doit être entre 10 et 60 secondes.');
        }
    }

    async readFileAsText(file: File): Promise<string | null> {
        const reader = new FileReader();

        return new Promise((resolve) => {
            reader.onload = (e) => {
                resolve(e.target?.result as string | null);
            };
            reader.readAsText(file);
        });
    }

    async parseFile(file: File, fileInput: HTMLInputElement): Promise<Game | undefined> {
        const importedData = await this.readFileAsText(file);
        if (!importedData) return undefined;
        try {
            return JSON.parse(importedData) as Game;
        } catch (error) {
            window.alert("Erreur lors de l'analyse du fichier JSON");
            fileInput.value = '';
            return undefined;
        }
    }

    async validateAndCorrectGame(importedGame: Game, fileInput: HTMLInputElement): Promise<Game | undefined> {
        const gameToValidate = importedGame;
        while (this.isNameExists(gameToValidate.title)) {
            const newName = prompt('Ce nom existe déjà. Veuillez choisir un nouveau nom:');
            if (newName) {
                gameToValidate.title = newName;
            } else {
                fileInput.value = '';
                return undefined;
            }
        }

        const errors = this.validateGame(gameToValidate);
        if (errors.length > 0) {
            const errorMessage = `Jeu invalide:\n${errors.join('\n')}`;
            window.alert(errorMessage);
            fileInput.value = '';
            return undefined;
        }

        this.correctGameAttributes(gameToValidate);
        return gameToValidate;
    }

    correctGameAttributes(game: Game): void {
        game.id = this.questionService.generateNewId();
        game.isVisible = false;
        let questionCounter = 1;
        game.questions.forEach((question) => {
            question.id = `q${questionCounter}`;
            question.textZone = '';
            questionCounter++;
        });
    }

    async saveGame(game: Game, fileInput: HTMLInputElement): Promise<Game | undefined> {
        return new Promise((resolve) => {
            this.communicationService.gamePost(game).subscribe({
                next: () => {
                    this.games.push(game);
                    this.importedGame.next(game);
                    resolve(game);
                },
                error: (err: HttpErrorResponse) => {
                    const responseString = `Le serveur ne répond pas et a retourné : ${err.message}`;
                    this.message.next(responseString);
                    resolve(undefined);
                },
            });
            fileInput.value = '';
        });
    }

    ngOnDestroy() {
        this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    }

    private isNameExists(title: string): boolean {
        return this.games.some((game) => game.title === title);
    }
}
