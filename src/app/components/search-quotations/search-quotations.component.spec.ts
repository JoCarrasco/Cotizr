import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchQuotationsComponent } from './search-quotations.component';

describe('SearchQuotationsComponent', () => {
  let component: SearchQuotationsComponent;
  let fixture: ComponentFixture<SearchQuotationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchQuotationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchQuotationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
