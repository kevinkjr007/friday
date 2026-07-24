import {Widget} from './Widget.js';
export class RadialGauge extends Widget{
constructor(x,y,r,v=0){super(x,y);this.r=r;this.value=v;}
draw(ctx){
ctx.beginPath();
ctx.arc(this.x,this.y,this.r,-Math.PI/2,-Math.PI/2+Math.PI*2*(this.value/100));
ctx.strokeStyle='#63e6ff';
ctx.lineWidth=8;
ctx.stroke();
}}