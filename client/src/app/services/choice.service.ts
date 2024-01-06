import { Injectable } from '@angular/core';
import { Choice, Game } from '@app/interfaces/game.model';

@Injectable({
    providedIn: 'root',
})
export class ChoiceService {
    getChoicesForQuestionGame(questionId: string, game: Game) {
        const questions = game.questions;
        const choices = questions?.find((question) => question.id === questionId)?.choices;
        if (!choices) {
            return [];
        }
        return choices;
    }

    setChoicesForQuestionGame(choices: Choice[], questionId: string, game: Game) {
        game.questions.filter((question) => question.id === questionId)[0].choices = choices;
        return choices;
    }

    generateNewId(questionId: string, game: Game): number {
        return this.getChoicesForQuestionGame(questionId, game)?.length + 1;
    }

    initChoicesNewQuestion(newQuestion: string, game: Game) {
        return this.setChoicesForQuestionGame(
            [
                { text: 'Choix 1', isCorrect: false },
                { text: 'Choix 2', isCorrect: true },
            ],
            newQuestion,
            game,
        );
    }

    createNewChoice(questionId: string, game: Game) {
        if (this.getChoicesForQuestionGame(questionId, game).length > 3) {
            return;
        }

        const newId = this.generateNewId(questionId, game).toString();
        const newChoice: Choice = {
            text: 'Choix ' + newId,
            isCorrect: false,
        };
        return newChoice;
    }

    deleteChoicesById(questionId: string, game: Game, choiceIndex: number): void {
        const len = this.getChoicesForQuestionGame(questionId, game).length;
        if (len === 2) {
            return;
        }
        if (len >= choiceIndex) {
            this.getChoicesForQuestionGame(questionId, game).splice(choiceIndex, 1);
        }
    }

    updateIsCorrect(choice: Choice): void {
        choice.isCorrect = !choice.isCorrect;
    }
}
