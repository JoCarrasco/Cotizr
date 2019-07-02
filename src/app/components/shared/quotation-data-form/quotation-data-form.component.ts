import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Quotation } from 'src/app/core';

@Component({
  selector: 'app-quotation-data-form',
  templateUrl: './quotation-data-form.component.html',
  styleUrls: ['./quotation-data-form.component.scss']
})
export class QuotationDataFormComponent implements OnInit {
  public quotation = new FormGroup({
    username: new FormControl('', Validators.required),
    company_name: new FormControl('', Validators.required),
    company_address: new FormControl('', Validators.required),
    identification: new FormControl('', Validators.required),
    phone_number: new FormControl('', Validators.required)
  });

  @Output() quotationValue: EventEmitter<any> = new EventEmitter();
  @Output() valid: EventEmitter<boolean> = new EventEmitter();
  @Input() disableAll: boolean;

  constructor() { }

  public handleKbEvent(e) {
    this.valid.emit(this.quotation.valid);
    this.quotationValue.emit(this.quotation.value);
  }

  ngOnInit() {
    if (this.disableAll) {
      this.quotation.disable();
    }
    // console.log(this.disableAll);
  }

  public setValue(quotation: Quotation) {
    this.quotation.enable();
    this.quotation.patchValue({
      user: quotation.user,
      company_name: quotation.company_name,
      company_address: quotation.company_address,
      identification: quotation.identification,
      receiver: quotation.receiver,
      phone_number: quotation.phone_number
    });
  }
}