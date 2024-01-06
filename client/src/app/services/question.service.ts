import { Injectable } from '@angular/core';
import { Game, Question } from '@app/interfaces/game.model';
import { NEW_QCM, NEW_QRL } from '@app/pages/page.constant';
import { v4 as uuidv4 } from 'uuid';
@Injectable({
    providedIn: 'root',
})
export class QuestionService {
    getQuestionsForGame(game: Game) {
        return game.questions;
    }

    setQuestionsForGame(questions: Question[], game: Game) {
        game.questions = questions;
        return questions;
    }

    generateNewId(): string {
        return uuidv4();
    }

    createNewQCMQuestion(): Question {
        const newQuestion = NEW_QCM;
        newQuestion.id = this.generateNewId();
        return newQuestion;
    }
    createNewQRLQuestion(): Question {
        const newQuestion = NEW_QRL;
        newQuestion.id = this.generateNewId();
        return newQuestion;
    }

    deleteQuestionsById(questionId: string, game: Game): void {
        const questions = this.getQuestionsForGame(game);
        const updatedQuestions = questions.filter((question) => question.id !== questionId);
        this.setQuestionsForGame(updatedQuestions, game);
    }
}
