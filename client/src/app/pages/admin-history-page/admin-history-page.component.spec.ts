import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Historic } from '@app/interfaces/historic.model';
import { HistoryCommunicationService } from '@app/services/history.communication.service';
import { Observable, of } from 'rxjs';
import { AdminHistoryPageComponent } from './admin-history-page.component';

describe('AdminHistoryPageComponent', () => {
    let component: AdminHistoryPageComponent;
    let router: Router;
    let fixture: ComponentFixture<AdminHistoryPageComponent>;
    let historyService: jasmine.SpyObj<HistoryCommunicationService>;

    beforeEach(async () => {
        const historyServiceSpy = jasmine.createSpyObj('HistoryCommunicationService', ['getHistory', 'deleteHistory']);

        await TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [AdminHistoryPageComponent],
            providers: [{ provide: HistoryCommunicationService, useValue: historyServiceSpy }],
        }).compileComponents();

        historyService = TestBed.inject(HistoryCommunicationService) as jasmine.SpyObj<HistoryCommunicationService>;

        fixture = TestBed.createComponent(AdminHistoryPageComponent);
        component = fixture.componentInstance;
        router = TestBed.inject(Router);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load history on initialization', () => {
        const mockHistorics = [
            {
                id: '1',
                playDate: new Date(),
                gameName: 'test',
                players: 2,
                bestPoints: 50,
            },
            {
                id: '2',
                playDate: new Date(),
                gameName: 'test2',
                players: 3,
                bestPoints: 30,
            },
        ];
        historyService.getHistory.and.returnValue(of(mockHistorics));

        fixture.detectChanges();

        expect(historyService.getHistory).toHaveBeenCalled();
        expect(component.historics).toEqual(mockHistorics);
    });
    it('should throw error on initialization if getHistory fails', () => {
        historyService.getHistory.and.returnValue(
            new Observable((observer) => {
                observer.error(new HttpErrorResponse({ status: 404, statusText: 'Internal Server Error' }));
            }),
        );
        const messageNextSpy = spyOn(component.message, 'next');
        component.ngOnInit();
        expect(messageNextSpy).toHaveBeenCalledWith(jasmine.stringMatching('Le serveur ne répond pas et a retourné'));
    });

    it('should reset history', () => {
        const mockResponse = {
            status: 200,
            statusText: 'OK',
        };

        historyService.deleteHistory.and.returnValue(of(mockResponse as any));

        component.resetHistory();

        expect(historyService.deleteHistory).toHaveBeenCalled();
        expect(component.historics.length).toBe(0);
    });

    it('should handle error in resetHistory', () => {
        historyService.deleteHistory.and.returnValue(
            new Observable((observer) => {
                observer.error(new HttpErrorResponse({ status: 500, statusText: 'Internal Server Error' }));
            }),
        );
        const messageNextSpy = spyOn(component.message, 'next');
        component.resetHistory();
        expect(messageNextSpy).toHaveBeenCalledWith(jasmine.stringMatching('Le serveur ne répond pas et a retourné'));
    });

    it('should reset history if user confirms', () => {
        spyOn(window, 'confirm').and.returnValue(true);

        const resetHistorySpy = spyOn(component, 'resetHistory');

        component.confirmReset();

        expect(window.confirm).toHaveBeenCalled();
        expect(resetHistorySpy).toHaveBeenCalled();
    });

    it('should sort historics by name in ascending order', () => {
        const historics: Historic[] = [
            { id: '1', playDate: new Date(), gameName: 'Z', players: 2, bestPoints: 50 },
            { id: '2', playDate: new Date(), gameName: 'A', players: 3, bestPoints: 30 },
            { id: '3', playDate: new Date(), gameName: 'G', players: 4, bestPoints: 70 },
        ];
        component.historics = historics;

        component.sortByNameAsc();

        expect(component.historics[0].gameName).toBe('A');
        expect(component.historics[1].gameName).toBe('G');
        expect(component.historics[2].gameName).toBe('Z');
    });

    it('should sort historics by name in descending order', () => {
        const historics: Historic[] = [
            { id: '1', playDate: new Date(), gameName: 'Z', players: 2, bestPoints: 50 },
            { id: '2', playDate: new Date(), gameName: 'A', players: 3, bestPoints: 30 },
            { id: '3', playDate: new Date(), gameName: 'C', players: 4, bestPoints: 70 },
        ];
        component.historics = historics;

        component.sortByNameDesc();

        expect(component.historics[0].gameName).toBe('Z');
        expect(component.historics[1].gameName).toBe('C');
        expect(component.historics[2].gameName).toBe('A');
    });

    it('should sort historics by date in ascending order', () => {
        const now = new Date();
        const historics: Historic[] = [
            { id: '1', playDate: new Date(now.getTime() + 3000), gameName: 'A', players: 2, bestPoints: 50 },
            { id: '2', playDate: new Date(now.getTime() + 1000), gameName: 'B', players: 3, bestPoints: 30 },
            { id: '3', playDate: new Date(now.getTime() + 2000), gameName: 'C', players: 4, bestPoints: 70 },
        ];
        component.historics = historics;

        component.sortByDateAsc();

        expect(component.historics[0].playDate.getTime()).toBe(now.getTime() + 1000);
        expect(component.historics[1].playDate.getTime()).toBe(now.getTime() + 2000);
        expect(component.historics[2].playDate.getTime()).toBe(now.getTime() + 3000);
    });

    it('should sort historics by date in descending order', () => {
        const now = new Date();
        const historics: Historic[] = [
            { id: '1', playDate: new Date(now.getTime() + 1000), gameName: 'A', players: 2, bestPoints: 50 },
            { id: '2', playDate: new Date(now.getTime() + 2000), gameName: 'B', players: 3, bestPoints: 30 },
            { id: '3', playDate: new Date(now.getTime() + 3000), gameName: 'C', players: 4, bestPoints: 70 },
        ];
        component.historics = historics;

        component.sortByDateDesc();

        expect(component.historics[0].playDate.getTime()).toBe(now.getTime() + 3000);
        expect(component.historics[1].playDate.getTime()).toBe(now.getTime() + 2000);
        expect(component.historics[2].playDate.getTime()).toBe(now.getTime() + 1000);
    });

    it('should call the sortByNameAsc based on selected value nameAsc', () => {
        const mockEvent = new Event('change');

        Object.defineProperty(mockEvent, 'target', { value: { value: 'nameAsc' } });

        spyOn(component, 'sortByNameAsc');
        spyOn(component, 'sortByNameDesc');
        spyOn(component, 'sortByDateAsc');
        spyOn(component, 'sortByDateDesc');

        component.onSortChange(mockEvent);

        expect(component.sortByNameAsc).toHaveBeenCalled();
        expect(component.sortByNameDesc).not.toHaveBeenCalled();
        expect(component.sortByDateAsc).not.toHaveBeenCalled();
        expect(component.sortByDateDesc).not.toHaveBeenCalled();
    });

    it('should call the sortByNameDesc based on selected value nameDesc', () => {
        const mockEvent = new Event('change');
        Object.defineProperty(mockEvent, 'target', { value: { value: 'nameDesc' } });

        spyOn(component, 'sortByNameAsc');
        spyOn(component, 'sortByNameDesc');
        spyOn(component, 'sortByDateAsc');
        spyOn(component, 'sortByDateDesc');

        component.onSortChange(mockEvent);

        expect(component.sortByNameAsc).not.toHaveBeenCalled();
        expect(component.sortByNameDesc).toHaveBeenCalled();
        expect(component.sortByDateAsc).not.toHaveBeenCalled();
        expect(component.sortByDateDesc).not.toHaveBeenCalled();
    });

    it('should call the sortByDateAsc based on selected value dateAsc', () => {
        const mockEvent = new Event('change');
        Object.defineProperty(mockEvent, 'target', { value: { value: 'dateAsc' } });

        spyOn(component, 'sortByNameAsc');
        spyOn(component, 'sortByNameDesc');
        spyOn(component, 'sortByDateAsc');
        spyOn(component, 'sortByDateDesc');

        component.onSortChange(mockEvent);

        expect(component.sortByNameAsc).not.toHaveBeenCalled();
        expect(component.sortByNameDesc).not.toHaveBeenCalled();
        expect(component.sortByDateAsc).toHaveBeenCalled();
        expect(component.sortByDateDesc).not.toHaveBeenCalled();
    });

    it('should call the sortByDateDesc based on selected value dateDesc', () => {
        const mockEvent = new Event('change');
        Object.defineProperty(mockEvent, 'target', { value: { value: 'dateDesc' } });

        spyOn(component, 'sortByNameAsc');
        spyOn(component, 'sortByNameDesc');
        spyOn(component, 'sortByDateAsc');
        spyOn(component, 'sortByDateDesc');

        component.onSortChange(mockEvent);

        expect(component.sortByNameAsc).not.toHaveBeenCalled();
        expect(component.sortByNameDesc).not.toHaveBeenCalled();
        expect(component.sortByDateAsc).not.toHaveBeenCalled();
        expect(component.sortByDateDesc).toHaveBeenCalled();
    });

    it('should not call any sort function for an unknown value', () => {
        const mockEvent = new Event('change');
        Object.defineProperty(mockEvent, 'target', { value: { value: 'unknown' } });

        spyOn(component, 'sortByNameAsc');
        spyOn(component, 'sortByNameDesc');
        spyOn(component, 'sortByDateAsc');
        spyOn(component, 'sortByDateDesc');

        component.onSortChange(mockEvent);

        expect(component.sortByNameAsc).not.toHaveBeenCalled();
        expect(component.sortByNameDesc).not.toHaveBeenCalled();
        expect(component.sortByDateAsc).not.toHaveBeenCalled();
        expect(component.sortByDateDesc).not.toHaveBeenCalled();
    });

    it('should navigate back to admin page', () => {
        const routerSpy = spyOn(router, 'navigate');
        component.goBackToAdminPage();

        expect(routerSpy).toHaveBeenCalledWith(['/admin']);
    });
});
