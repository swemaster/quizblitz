import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-admin-password-page',
    templateUrl: './admin-password-page.component.html',
    styleUrls: ['./admin-password-page.component.scss'],
})
export class AdminPasswordComponent {
    password: string = '';
    correctPassword: string = 'admin';
    incorrectPassword: boolean = false;

    constructor(private router: Router) {}

    onSubmit() {
        if (this.password === this.correctPassword) {
            sessionStorage.setItem('isAdminAuthenticated', 'true');
            this.router.navigate(['/admin']);
        } else {
            sessionStorage.setItem('isAdminAuthenticated', 'false');
            this.incorrectPassword = true;
        }
    }
}
