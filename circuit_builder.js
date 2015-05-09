var canvas = document.getElementById('myCanvas');
var context = canvas.getContext('2d');
var x = 100;
var y = 100;

var s = 32; //size

function drawAnd(context, x, y)
{
	context.beginPath();
	context.translate(x-s/2,y-s/2);
	context.moveTo(0,0);
	context.lineTo(s/2,0);
	context.arc(s/2,s/2,s/2,-Math.PI/2,Math.PI/2);
	context.moveTo(s/2,s);
	context.lineTo(0,s);
	context.lineTo(0,0);
	context.stroke();
	context.translate(s/2-x,s/2-y);
}

function drawOr(context, x, y)
{
	context.translate(x-s/2,y-s/2);
	context.beginPath();
	context.moveTo(0,0);
    context.lineTo(s/4,0);
    context.quadraticCurveTo(0.71*s, 0, s, s/2);
    context.quadraticCurveTo(0.71*s,s,s/4,s);
    context.lineTo(0,s);
    context.quadraticCurveTo(s/4,s/2,0,0);
	context.stroke();
	context.translate(s/2-x,s/2-y);	
}

function drawBuf(context, x, y)
{
	context.translate(x-s/2,y-s/2);
	context.beginPath();
	context.moveTo(0,0);
	context.lineTo(s,s/2);
	context.lineTo(0,s);
	context.lineTo(0,0);
	context.stroke();
	context.translate(s/2-x,s/2-y);	
}

function drawXor(context, x, y)
{
	drawOr(context,x,y);
	context.translate(x-s/2,y-s/2);
	context.beginPath();
	context.moveTo(-s/8,0);
	context.quadraticCurveTo(s/8,s/2,-s/8,s);
    //context.quadraticCurveTo(s/8,s/2,-s/8,0);
	context.stroke();
	context.translate(s/2-x,s/2-y);	
}

function update(context)
{
	var scale = 2
	context.scale(scale,scale);
	context.clearRect(0, 0, canvas.width, canvas.height);
	drawAnd(context,100/scale,100/scale);
	drawOr(context,200/scale, 100/scale);
	drawXor(context,100/scale,200/scale);
	drawBuf(context,200/scale,200/scale);
	context.beginPath();
	context.moveTo(0,y);
	context.lineTo(x,0);
	context.stroke();
	context.scale(1/scale,1/scale);
	x++;
	y++;
}


var timer = setInterval(update,1000/25, context);
