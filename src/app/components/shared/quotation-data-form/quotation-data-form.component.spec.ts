import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuotationDataFormComponent } from './quotation-data-form.component';

describe('QuotationDataFormComponent', () => {
  let component: QuotationDataFormComponent;
  let fixture: ComponentFixture<QuotationDataFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuotationDataFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuotationDataFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
