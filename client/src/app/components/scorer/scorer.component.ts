import { Component, Input } from '@angular/core';
import { faTrophy } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-scorer',
    templateUrl: './scorer.component.html',
    styleUrls: ['./scorer.component.scss'],
})
export class ScorerComponent {
    @Input() score: number;
    faTrophy = faTrophy;
}
