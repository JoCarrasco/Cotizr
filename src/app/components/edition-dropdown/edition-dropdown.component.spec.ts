import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditionDropdownComponent } from './edition-dropdown.component';

describe('EditionDropdownComponent', () => {
  let component: EditionDropdownComponent;
  let fixture: ComponentFixture<EditionDropdownComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditionDropdownComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditionDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
