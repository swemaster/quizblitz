import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AdminPasswordComponent } from './admin-password-page.component';

describe('AdminPasswordComponent', () => {
    let component: AdminPasswordComponent;
    let fixture: ComponentFixture<AdminPasswordComponent>;
    let router: Router;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [AdminPasswordComponent],
            imports: [RouterTestingModule], // Add RouterTestingModule for testing routes
        });

        fixture = TestBed.createComponent(AdminPasswordComponent);
        component = fixture.componentInstance;
        router = TestBed.inject(Router); // Inject Router for testing navigation
    });

    // Expect a component to be truthy? What does that mean?
    // Maybe expect a component to NOT be undefined would make sense, but whatever.
    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should navigate to /admin if password is correct', () => {
        const navigateSpy = spyOn(router, 'navigate');
        component.password = 'admin';
        component.onSubmit();
        expect(navigateSpy).toHaveBeenCalledWith(['/admin']);
    });

    it('should set incorrectPassword to true if password is incorrect', () => {
        component.password = 'wrongpassword';
        component.onSubmit();
        expect(component.incorrectPassword).toBe(true);
    });
});
