import {
  trigger,
  animate,
  transition,
  style,
  query,
  stagger,
  state,
  keyframes,
  animateChild,
  group
} from '@angular/animations';

export const toastAnimation = 
    trigger('toastAnimation', [
        // ...
        state('active', style({
          transform: 'translateY(0)',
          opacity: 1,
        })),
        state('deactive', style({
          transform: 'translateY(75px)',
          opacity: 1,
        })),
        transition('open => closed', [
          animate('1s')
        ]),
        transition('closed => open', [
          animate('0.5s')
        ]),
      ]);