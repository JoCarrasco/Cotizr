import { Component, OnInit } from '@angular/core';
import { QuotationService } from 'src/app/core';

@Component({
  selector: 'app-generate',
  templateUrl: './generate.component.html',
  styleUrls: ['./generate.component.scss']
})
export class GenerateComponent implements OnInit {

  constructor(public quotation: QuotationService) { }

  ngOnInit() {
  }

}
