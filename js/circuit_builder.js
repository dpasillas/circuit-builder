//globals
var canvas = view.element;
var s = 32;
var x = 100;
var y = 100;
var gateStyle = {strokeColor:'black',
					strokeScaling: true,
					fillColor: 'white',
					strokeWidth: 2,
					dashArray: undefined
				};

var selectStroke = new Color('#3399FF');
var selectFill = new Color('#0080FF');
selectFill.alpha = 0.25;
var selectedStyle = {strokeColor: selectStroke,
						strokeScaling: true,
						fillColor: selectFill,
						strokeWidth: 2,
						dashArray: [4, 4]
					};
var mainLayer = project.activeLayer;
var gridLayer = new Layer();
mainLayer.activate();

var selected = new Group();

createGates();

//create symbols for logic gate primitives
function createAnd(x,y){
	var AND = new Path(gateStyle);
	AND.moveTo(0,0);
	AND.lineTo(s/2,0);
	AND.arcTo(new Point(s,s/2), new Point(s/2,s));
	AND.lineTo(0,s);
	AND.closePath(true);
	AND.translate(new Point(x-s/2,y-s/2));

	return AND;
}

function createOr(x,y){
	var OR = new Path(gateStyle);
	OR.moveTo(0,0);
    OR.lineTo(s/4,0);
    OR.quadraticCurveTo(new Point(0.71*s, 0), new Point(s, s/2));
    OR.quadraticCurveTo(new Point(0.71*s,s), new Point(s/4,s));
    OR.lineTo(0,s);
    OR.quadraticCurveTo(new Point(s/4,s/2), new Point(0,0));
	OR.closePath(true);
	OR.translate(new Point(x-s/2, y-s/2));

	return OR;
}

function createXor(x,y){
	var XOR = new CompoundPath(gateStyle);
	XOR.moveTo(0,0);
    XOR.lineTo(s/4,0);
    XOR.quadraticCurveTo(new Point(0.71*s, 0), new Point(s, s/2));
    XOR.quadraticCurveTo(new Point(0.71*s,s), new Point(s/4,s));
    XOR.lineTo(0,s);
    XOR.quadraticCurveTo(new Point(s/4,s/2),new Point(0,0));
	XOR.closePath(true);

	XOR.moveTo(new Point(-s/8,0));
	XOR.quadraticCurveTo(new Point(s/8,s/2), new Point(-s/8,s));
	XOR.quadraticCurveTo(new Point(s/8,s/2), new Point(-s/8,0));
	XOR.translate(new Point(x-s/2,y-s/2));

	return XOR;
}

function createBuf(x,y){
	var BUF = new Path(gateStyle);
	BUF.moveTo(new Point(0,0));
	BUF.lineTo(new Point(s,s/2));
	BUF.lineTo(new Point(0,s));
	BUF.closePath(true);
	BUF.translate(new Point(x-s/2,y-s/2));
	
	return BUF;
}

function setStyle(item,style){
	for(attribute in style){
		console.log(attribute);
		console.log(style[attribute]);
		item[attribute] = style[attribute];
	}
}

var AND, OR, XOR, BUF;
function createGates(){

	createAnd(x,y);
	createOr(x+100,y);
	createXor(x,y+100);
	createBuf(x+100,y+100);
}

canvas.onwheel = function(event){
	if(event.ctrlKey)
		zoomWithMouse(event);
	

	return false;
}
var lastP = new Point(0,0);
//implemented by paperjs, not standard
onMouseDown = function(event){
	lastP = view.projectToView(event.point);
	
	if(!event.modifiers.shift){
		var i;
		for(i = 0; i < selected.children.length; ++i){
			setStyle(selected.children[i],gateStyle);
		}

		selected.parent.addChildren(
			selected.removeChildren()
		);
		
	}

	var hits = mainLayer.hitTest(event.point);
	if(hits){
		selected.addChild(hits.item);
		setStyle(hits.item,selectedStyle);
	}
	else{
		console.log("nothing clicked!");
	}
}

onMouseDrag = function(event){
	console.log("what a drag!");
	var p = view.projectToView(event.point);
	var delta = (p - lastP) / view.zoom;
	lastP = p;
	if(event.modifiers.control)
		view.center -= delta;
	else{
		
		selected.translate(delta);
	}
}

function getZoom(oldZoom, delta){
	var scaleFactor = 1.03;	
	if(delta < 0)
		return oldZoom*scaleFactor;
	else
		return oldZoom/scaleFactor;
}

function zoomWithMouse(event){
	var limit = 4;
	var element = view.element;
	var z = project.view.zoom;
	var c = view.center;
	//calculate position of mouse relative to canvas
	var mouse = new Point(event.clientX - element.offsetLeft + window.pageXOffset,
							event.clientY - element.offsetTop + window.pageYOffset);
	var p = view.viewToProject(mouse);
	var nz = Math.min(4,Math.max(1/limit,getZoom(z,event.deltaY)));
	view.zoom = nz;	
	var offset = p-c;
	view.center = p - offset*(z/nz);
}

