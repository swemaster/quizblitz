import { Injectable, inject } from '@angular/core';
import { Question } from '@app/interfaces/game.model';
import { MOCK_QUESTIONS } from '@app/pages/page.constant';
import { ChatService } from '@app/services/chat.service';
import { PlayerService } from '@app/services/player.service';

@Injectable({
    providedIn: 'root',
})
export class SelectionsService {
    chatAsSocketService = inject(ChatService);
    playerService = inject(PlayerService);

    questions: Question[] = [];
    question: Question = MOCK_QUESTIONS[0];
    counter: number = 0;
    room: string = this.playerService.getRoom.toString();
    nbQuestions: number = 0;

    updateData(nbOfQuestions: number, question: Question) {
        this.nbQuestions = nbOfQuestions;
        this.question = question;
    }

    addQuestion() {
        this.questions.push(this.question);
        if (++this.counter === this.nbQuestions) {
            this.chatAsSocketService.sendSelections({ room: this.room, questions: this.questions, acknowledged: false });
        }
    }

    send(room: string) {
        this.chatAsSocketService.sendSelections({ room, questions: this.questions, acknowledged: false });
    }

    acknowledgeSelections() {
        this.chatAsSocketService.sendSelections({ room: '', questions: [], acknowledged: true });
        this.resetService();
    }

    resetService() {
        this.questions = [];
        this.counter = 0;
    }
}
