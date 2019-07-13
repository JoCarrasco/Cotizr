import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-edition-dropdown',
  templateUrl: './edition-dropdown.component.html',
  styleUrls: ['./edition-dropdown.component.scss']
})
export class EditionDropdownComponent implements OnInit {
  @Input() title = 'Nuevo Cuadro Desplegable';
  @Input() color = 'white';

  constructor() { }

  ngOnInit() {
  }

}
