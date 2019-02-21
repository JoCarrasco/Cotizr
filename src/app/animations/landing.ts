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

export const listAnimation = 
  trigger('listAnimation', [
    transition('* => *', [
      query(':enter', style({ opacity:0 }), { optional: true }),
      query(':enter', stagger('300ms', [
        animate('1s ease-in', keyframes([
          style({ opacity: 0, transform: 'translateY(-75px)', offset: 0 }),
          style({ opacity: .5, transform: 'translateY(35px)', offset: .3 }),
          style({ opacity: 1, transform: 'translateY(0px)', offset: 1 }),
        ]))
      ]), { optional:true })
    ])
  ]);

export const explainerAnim = 
  trigger('explainerAnim', [
    transition('* => *', [
      query(':enter', style({ opacity: 0, transform: 'translateX(-40px)' }), { optional:true }),
      query(':enter', stagger('500ms', [
        animate('800ms 1.2s ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ]),  { optional:true })
    ])
  ])
