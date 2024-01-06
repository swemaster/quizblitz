import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Historic } from '@app/interfaces/historic.model';
import { HistoryCommunicationService } from '@app/services/history.communication.service';
import { BehaviorSubject, Subscription } from 'rxjs';

@Component({
    selector: 'app-admin-history-page',
    templateUrl: './admin-history-page.component.html',
    styleUrls: ['./admin-history-page.component.scss'],
})
export class AdminHistoryPageComponent implements OnInit, OnDestroy {
    historics: Historic[] = [];
    message: BehaviorSubject<string> = new BehaviorSubject<string>('');
    private subscriptions: Subscription[] = [];

    constructor(
        private router: Router,
        private historyService: HistoryCommunicationService,
    ) {}

    ngOnInit() {
        this.subscriptions.push(
            this.historyService.getHistory().subscribe({
                next: (historic) => {
                    this.historics = historic.map((item) => ({
                        ...item,
                        playDate: new Date(item.playDate),
                    }));
                },
                error: (err: HttpErrorResponse) => {
                    const responseString = `Le serveur ne répond pas et a retourné : ${err.message}`;
                    this.message.next(responseString);
                },
            }),
        );
    }

    onSortChange(event: Event) {
        const selectedValue = (event.target as HTMLSelectElement).value;

        switch (selectedValue) {
            case 'nameAsc':
                this.sortByNameAsc();
                break;
            case 'nameDesc':
                this.sortByNameDesc();
                break;
            case 'dateAsc':
                this.sortByDateAsc();
                break;
            case 'dateDesc':
                this.sortByDateDesc();
                break;
            default:
                break;
        }
    }

    sortByNameAsc() {
        this.historics.sort((a, b) => a.gameName.localeCompare(b.gameName));
    }
    sortByNameDesc() {
        this.historics.sort((a, b) => b.gameName.localeCompare(a.gameName));
    }
    sortByDateAsc() {
        this.historics.sort((a, b) => a.playDate.getTime() - b.playDate.getTime());
    }
    sortByDateDesc() {
        this.historics.sort((a, b) => b.playDate.getTime() - a.playDate.getTime());
    }

    goBackToAdminPage() {
        sessionStorage.setItem('isAdminAuthenticated', 'true');
        this.router.navigate(['/admin']);
    }

    resetHistory() {
        this.historyService.deleteHistory().subscribe({
            next: async (response) => {
                const responseString = `Le serveur a reçu la requête a retourné un code ${response.status} : ${response.statusText}`;
                this.message.next(responseString);
            },
            error: (err: HttpErrorResponse) => {
                const responseString = `Le serveur ne répond pas et a retourné : ${err.message}`;
                this.message.next(responseString);
            },
        });
        this.historics = [];
    }

    confirmReset() {
        const confirmed = window.confirm("Êtes-vous sûr de vouloir réinitialiser l'historique ?");
        if (confirmed) {
            this.resetHistory();
        }
    }

    ngOnDestroy() {
        this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    }
}
