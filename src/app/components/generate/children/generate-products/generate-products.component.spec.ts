import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateProductsComponent } from './generate-products.component';

describe('GenerateProductsComponent', () => {
  let component: GenerateProductsComponent;
  let fixture: ComponentFixture<GenerateProductsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GenerateProductsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GenerateProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
