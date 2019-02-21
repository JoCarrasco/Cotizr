import { Component, OnInit } from '@angular/core';
import { listAnimation, explainerAnim } from '../../../animations/landing';
@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
  animations: [
  	listAnimation,
  	explainerAnim
  ]
})
export class LandingComponent implements OnInit {
	quotationMockups = [
		{ price:134 },
		{ price:244 },
		{ price:340 },
		{ price:334 },
		{ price:450 },
		{ price:340 }
	];

  constructor() { }

  ngOnInit() {
  }

}
