import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { QuotationService } from '../../services/quotation.service';
@Component({
  selector: 'app-user-quotations',
  templateUrl: './user-quotations.component.html',
  styleUrls: ['./user-quotations.component.scss']
})
export class UserQuotationsComponent implements OnInit {

  constructor(public auth: AuthService, public quotation:QuotationService) { }

  userQuotationState = {

  	isFullyLoaded:false,
  	user:{
  		id:0,
  		name:'',
  		email:''
  	},
    isModalActive:false,
    quotationPreview:null,
  	quotations:[]
  }

  ngOnInit() {
  	this.loadUserData();
  }

  private loadUserData(): void {
  	let userSub = this.auth.authState.appUser.subscribe((user) => {
  		if (user != undefined) {
        this.userQuotationState.user = {
        	id:user.id,
        	name:user.name,
        	email:user.email
       	}

       	this.loadUserQuotations(user, this.auth.getSession().type);
  		}
  	})
  }

  displayQuotation(quotation): void {
    this.userQuotationState.quotationPreview = quotation;
    this.userQuotationState.isModalActive = true
  }

  fromNumberToStatus(value): string {
    let result = '';
    if (value == 0) {
      result = 'Pendiente';
    } else if (value == 1) {
      result = 'Rechazada';
    } else if (value == 2) {
      result = 'Aprobada';
    }
    return result;
  }

  private loadUserQuotations(user, session): void {
  	console.log('Loading Quotations');
  	this.quotation.getUserQuotations(user, this.auth.getSession().type).subscribe((quotations) => {
      console.log('Listening to user quotations');
      console.log(quotations);
    	if (quotations != undefined) {
        if (quotations.length > 0) {
          quotations.sort((a,b) => b.id - a.id);
      		this.userQuotationState.quotations = quotations;
      		console.log(this.userQuotationState);
      		this.userQuotationState.isFullyLoaded = true; 
        } else {
          this.userQuotationState.quotations = quotations;
          console.log(this.userQuotationState);
          this.userQuotationState.isFullyLoaded = true; 
        }
    	} else {
        this.userQuotationState.quotations = [];
        console.log(this.userQuotationState);
        this.userQuotationState.isFullyLoaded = true; 
      }
    });
  }
}
