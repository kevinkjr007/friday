const c=document.getElementById('hud');
const x=c.getContext('2d');
function r(){c.width=innerWidth;c.height=innerHeight;}
addEventListener('resize',r);r();
function draw(){
x.clearRect(0,0,c.width,c.height);
const t=new Date();
x.strokeStyle='#39d5ff';
x.lineWidth=2;
x.strokeRect(20,20,c.width-40,c.height-40);
x.font='28px Arial';
x.fillStyle='#7ee9ff';
x.fillText('FRIDAY',40,60);
x.font='20px Arial';
x.fillText(t.toLocaleTimeString(),c.width-180,60);
x.beginPath();
x.arc(180,220,70,-Math.PI/2,-Math.PI/2+Math.PI*1.55);
x.stroke();
x.font='18px Arial';
x.fillText('WHOOP Recovery',110,320);
x.fillText('Home Assistant: Connecting...',40,c.height-60);
requestAnimationFrame(draw);
}
draw();