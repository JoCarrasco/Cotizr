import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserQuotationsComponent } from './user-quotations.component';

describe('UserQuotationsComponent', () => {
  let component: UserQuotationsComponent;
  let fixture: ComponentFixture<UserQuotationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserQuotationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserQuotationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
