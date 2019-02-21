import { Component, OnInit, Input } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { toastAnimation } from '../../../animations/sub-components';
@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss'],
  animations: [
  	toastAnimation
  ]
})
export class ToastComponent implements OnInit {
	@Input() toastType: string;
	@Input() color: string;
  @Input() error: any;
  @Input() process: any;

	toastState = {
		isActive:false,
    isError:false,
		isLoading: false,
		message:'',
		color: '',
    type:''
	}

  constructor(public auth: AuthService) { }

  ngOnInit() { }

  dismiss(): void {
    this.toastState = {
      isActive:false,
      isError:false,
      isLoading: false,
      message:'',
      color: '',
      type:''
    }
  }

  nameToHEX(colorName: string): string {
  	if (colorName == 'white') {
  		return '#fff';
  	} else if (colorName == 'red') {
  		return '#e21b3b'
  	} else {
  		console.error('No color stored for that parameter for the toast.');
  	}
  }
}
