import {Widget} from './Widget.js';
export class TextTile extends Widget{
constructor(text,x,y){super(x,y);this.text=text;}
draw(ctx){
ctx.fillStyle='#63e6ff';
ctx.font='24px sans-serif';
ctx.fillText(this.text,this.x,this.y);
}}