import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthFunnel } from './auth-funnel';

describe('AuthFunnel', () => {
  let component: AuthFunnel;
  let fixture: ComponentFixture<AuthFunnel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthFunnel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuthFunnel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
