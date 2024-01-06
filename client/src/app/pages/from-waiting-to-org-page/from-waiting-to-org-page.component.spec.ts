import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { FromWaitingToOrgPageComponent } from './from-waiting-to-org-page.component';
import { GameSocketService } from '@app/services/game-socket.service';


describe('FromWaitingToOrgPageComponent', () => {
  let component: FromWaitingToOrgPageComponent;
  let fixture: ComponentFixture<FromWaitingToOrgPageComponent>;
  let mockSocketService = {
    receiveChronoValues: () => of(10)
  };
  let mockActivatedRoute = {
    params: of({ accessCode:  '7222'})
  };
  let mockRouter = {
    navigate: jasmine.createSpy('orggame:/7222')
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FromWaitingToOrgPageComponent],
      providers: [
        { provide: GameSocketService, useValue: mockSocketService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: Router, useValue: mockRouter},
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FromWaitingToOrgPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
