export class Engine{
constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.widgets=[];
const resize=()=>{canvas.width=innerWidth;canvas.height=innerHeight;};resize();addEventListener('resize',resize);
requestAnimationFrame(()=>this.draw());}
load(layout){this.widgets=layout;}
draw(){this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
for(const w of this.widgets){w.draw(this.ctx);}
requestAnimationFrame(()=>this.draw());}}