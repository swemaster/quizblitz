import { TestBed } from '@angular/core/testing';
import { Question } from '@app/interfaces/game.model';
import { MOCK_QUESTIONS } from '@app/pages/page.constant';
import { ChatService } from '@app/services/chat.service';
import { PlayerService } from '@app/services/player.service';
import { SelectionsService } from '@app/services/selections.service';

describe('SelectionsService', () => {
    let service: SelectionsService;
    let chatServiceSpy: jasmine.SpyObj<ChatService>;
    let playerServiceSpy: jasmine.SpyObj<PlayerService>;

    beforeEach(() => {
        const chatServiceSpyObj = jasmine.createSpyObj('ChatService', ['sendSelections']);
        const playerServiceSpyObj = jasmine.createSpyObj('PlayerService', ['getRoom']);

        TestBed.configureTestingModule({
            providers: [
                SelectionsService,
                { provide: ChatService, useValue: chatServiceSpyObj },
                { provide: PlayerService, useValue: playerServiceSpyObj },
            ],
        });

        service = TestBed.inject(SelectionsService);
        chatServiceSpy = TestBed.inject(ChatService) as jasmine.SpyObj<ChatService>;
        playerServiceSpy = TestBed.inject(PlayerService) as jasmine.SpyObj<PlayerService>;

        // if player service getRoom is every called, return 'room1'
        playerServiceSpy.getRoom.and.returnValue('room1');
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('updateData', () => {
        it('should update nbQuestions and question', () => {
            const nbOfQuestions = 5;
            const question: Question = MOCK_QUESTIONS[0];

            service.updateData(nbOfQuestions, question);

            expect(service.nbQuestions).toBe(nbOfQuestions);
            expect(service.question).toBe(question);
        });
    });

    describe('addQuestion', () => {
        it('should add the question to the questions array', () => {
            const question: Question = MOCK_QUESTIONS[0];
            service.question = question;

            service.addQuestion();

            expect(service.questions).toContain(question);
        });

        it('should call sendSelections if counter equals nbQuestions', () => {
            const question: Question = MOCK_QUESTIONS[0];
            service.question = question;
            service.nbQuestions = 3;
            service.counter = 2;

            service.addQuestion();

            expect(chatServiceSpy.sendSelections).toHaveBeenCalledWith({
                room: service.room,
                questions: service.questions,
                acknowledged: false,
            });
        });
    });

    describe('send', () => {
        it('should call sendSelections with the provided room', () => {
            const room = 'room1';

            service.send(room);

            expect(chatServiceSpy.sendSelections).toHaveBeenCalledWith({
                room,
                questions: service.questions,
                acknowledged: false,
            });
        });
    });

    describe('acknowledgeSelections', () => {
        it('should call sendSelections with an empty room and empty questions array', () => {
            service.acknowledgeSelections();

            expect(chatServiceSpy.sendSelections).toHaveBeenCalledWith({
                room: '',
                questions: [],
                acknowledged: true,
            });
        });

        it('should call resetService', () => {
            spyOn(service, 'resetService');

            service.acknowledgeSelections();

            expect(service.resetService).toHaveBeenCalled();
        });
    });

    describe('resetService', () => {
        it('should reset the questions array and counter', () => {
            service.questions = [
                /* create some mock questions */
            ];
            service.counter = 5;

            service.resetService();

            expect(service.questions).toEqual([]);
            expect(service.counter).toBe(0);
        });
    });
});
