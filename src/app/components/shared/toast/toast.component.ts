import { Component, OnInit, Input } from '@angular/core';
import { toastAnimation } from '../../../animations/sub-components';
import { ActionService } from 'src/app/core';
import { ToastAction, ActionType } from 'src/app/shared';
@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss'],
  animations: [
    toastAnimation
  ]
})
export class ToastComponent implements OnInit {
  isLoading = false;
  backgroundColor = '#fff';
  color = '#1b1b1b';
  message: string;

  constructor(private actionService: ActionService) { }

  ngOnInit() {
    this.actionService.action.subscribe((action) => {
      this.backgroundColor = action ? ToastAction[action.type]['background-color'] : undefined;
      this.color = action ? ToastAction[action.type].color : undefined;
      this.message = action ? action.message : undefined;
      if (action) {
        this.isLoading = action.type === ActionType.Loading;
      }
    });
  }
}
