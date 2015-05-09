var canvas = document.getElementById('myCanvas');
var context = canvas.getContext('2d');
var x = 100;
var y = 100;

function update(context)
{
	context.clearRect(0, 0, canvas.width, canvas.height);
	context.beginPath();
	context.moveTo(0,y);
	context.lineTo(x,0);
	context.stroke();
	x++;
	y++;
}


var timer = setInterval(update,1000/25, context);
