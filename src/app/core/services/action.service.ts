import { Injectable } from '@angular/core';
import { ActionType, ResponseStatusInfo } from 'src/app/shared';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ActionService {
  action = new BehaviorSubject<{ type: ActionType; message: string; }>(undefined);

  constructor() { }

  // load() {
  //   this.updateAction(ActionType.Loading, 'Cargando por favor espere.');
  // }

  error(errorMessage: string, status: number) {
    this.updateAction(ActionType.Error, `ERROR: ${status}: ${ResponseStatusInfo[status].message}\n${errorMessage}`);
  }


  // download() {
  //   this.updateAction(ActionType.w);
  // }

  load(message: string) {
    this.updateAction(ActionType.Loading, `${message}. Por favor espere`);
  }

  success(message) {
    this.updateAction(ActionType.Message, `${message}`);
  }

  // register() {
  //   this.updateAction(ActionType.Register);
  // }

  // storing() {
  //   this.updateAction(ActionType.Storing);
  // }

  // logout() {
  //   this.updateAction(ActionType.Logout);
  // }

  updateAction(actionType: ActionType, message: string) {
    let counter = 0;
    this.action.next({
      type: actionType,
      message: message
    });

    if (actionType === ActionType.Message) {
      const interval = setInterval(() => {
        if (counter === 3) {
          clearInterval(interval);
          this.stop();
        }
        counter++;
      }, 2000);
    }
  }

  stop() {
    this.action.next(undefined);
  }
}
