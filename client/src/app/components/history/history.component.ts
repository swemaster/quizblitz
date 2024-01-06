import { Component, Input } from '@angular/core';
import { Historic } from '@app/interfaces/historic.model';

@Component({
    selector: 'app-history',
    templateUrl: './history.component.html',
    styleUrls: ['./history.component.scss'],
})
export class HistoryComponent {
    @Input() historic: Historic;
}
