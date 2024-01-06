import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EMPTY, Observable, concatMap, from } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class SnackbarService {
    constructor(private snackBar: MatSnackBar) {}

    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    showSnackbar(message: string, duration: number = 2000): Observable<void> {
        return from(this.snackBar.open(message, 'Close', { duration }).onAction()).pipe(concatMap(() => EMPTY));
    }
}
