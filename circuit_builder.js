var canvas = document.getElementById('myCanvas');
var context = canvas.getContext('2d');
var x = 100;
var y = 100;

var s = 32; //size

function drawAnd(context, x, y)
{
	context.save();
	context.translate(x-s/2,y-s/2);
	context.beginPath();
	context.moveTo(0,0);
	context.lineTo(s/2,0);
	//context.arc(s/2,s/2,s/2,-Math.PI/2,Math.PI/2);
	//context.moveTo(s/2,s);
	context.arcTo(s,0,s,s,s/2);
	context.arcTo(s,s,0,s,s/2);
	context.lineTo(0,s);
	context.lineTo(0,0);

	context.fill();
	context.stroke();
	//context.translate(s/2-x,s/2-y);
	context.restore();
}

function drawOr(context, x, y)
{
	context.save();
	context.translate(x-s/2,y-s/2);
	context.beginPath();
	context.moveTo(0,0);
    context.lineTo(s/4,0);
    context.quadraticCurveTo(0.71*s, 0, s, s/2);
    context.quadraticCurveTo(0.71*s,s,s/4,s);
    context.lineTo(0,s);
    context.quadraticCurveTo(s/4,s/2,0,0);
	
	context.fill();
	context.stroke();
	//context.translate(s/2-x,s/2-y);
	context.restore();
}

function drawBuf(context, x, y)
{
	context.save();
	context.translate(x-s/2,y-s/2);
	context.beginPath();
	context.moveTo(0,0);
	context.lineTo(s,s/2);
	context.lineTo(0,s);
	context.lineTo(0,0);

	context.fill();
	context.stroke();
	//context.translate(s/2-x,s/2-y);
	context.restore();
}

function drawXor(context, x, y)
{
	drawOr(context,x,y);
	context.save();
	context.translate(x-s/2,y-s/2);
	context.beginPath();
	context.moveTo(-s/8,0);
	context.quadraticCurveTo(s/8,s/2,-s/8,s);
    //context.quadraticCurveTo(s/8,s/2,-s/8,0);
	
	context.stroke();
	//context.translate(s/2-x,s/2-y);
	context.restore();
}

var lastTime = 0;//time of last frame from start of program in ms
var deltaFrames = 0; //number of frames that have passed
var deltaTime = 0; //in seconds
var MS_PER_FRAME = 17; //60 FPS

function update(timestamp)
{
	deltaTime = (timestamp - lastTime) / 1000.0;
	deltaFrames = (timestamp - lastTime) / MS_PER_FRAME;
	lastTime = timestamp;
	//console.log(timestamp);
	requestAnimationFrame(update);
	var scale = 2;
	context.save();
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
	context.restore();
	x+=deltaFrames;
	y+=deltaFrames;
}

context.fillStyle = "#88F2A0"
update(0.0);
//var timer = setInterval(update,17);
