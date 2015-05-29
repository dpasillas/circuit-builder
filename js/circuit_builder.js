var gb = window.globals;


var loadCB = function(){
	var ui = gb.user_input;
    //new gb.LogicGate({});
	//globals
	var canvas = view.element;
	var s = 32;
	var x = 100;
	var y = 100;

	//styling attributes
	Styles = {
	    Default:        {strokeColor:'black',
		                strokeScaling: true,
		                fillColor: 'white',
		                strokeWidth: 2,
		                dashArray: undefined},
	    Selected:       {strokeColor: new Color('#3399FF'),
		                strokeScaling: true,
		                fillColor: new Color(0.25,0.75,1.0,0.5),
		                strokeWidth: 2,
		                dashArray: [4, 4]},
	    PinDefault:     {strokeColor:'black',
		                strokeScaling: true,
		                fillColor: 'white',
		                strokeWidth: 2,
		                dashArray: undefined},
	    PinSelected:    {strokeColor: new Color('#800000'),
		                strokeScaling: true,
		                fillColor: new Color(1.0,0.0,0.0,0.5),
		                strokeWidth: 2,
		                dashArray: [4, 4]},
	    Selector:       {strokeColor: new Color(0.525,0.675,0.850),
		                strokeScaling: false,
		                fillColor: new Color(0.65,0.75,0.88,0.5),
		                strokeWidth: 1,
		                dashArray: undefined
		            }
	};
	gb.Styles = Styles;

	//separate groups so we can toggle visibility
	gb.mainGroup = new ItemGroup();
	gb.connectionsGroup = new ItemGroup();
	gb.gridGroup = new ItemGroup();

	gb.selected = new ItemGroup();
	gb.selected.onRemove = function(item){
	    gb.setStyle(item,Styles.Default);
	};
	gb.selected.onAdd = function(item){
	    gb.setStyle(item,Styles.Selected); 
	};

	createGates();

	//console.log(view.element.style);

	//create symbols for logic gate primitives
	function createAnd(x,y){
	    var AND = new Path(Styles.Default);
	    AND.moveTo(0,0);
	    AND.lineTo(s/2,0);
	    AND.arcTo(new Point(s,s/2), new Point(s/2,s));
	    AND.lineTo(0,s);
	    AND.closePath(true);
	    AND.translate(new Point(x-s/2,y-s/2));

	    gb.mainGroup.addChild(AND);

	    return AND;
	}

	function createOr(x,y){
	    var OR = new Path(Styles.Default);
	    OR.moveTo(0,0);
	    OR.lineTo(s/4,0);
	    OR.quadraticCurveTo(new Point(0.71*s, 0), new Point(s, s/2));
	    OR.quadraticCurveTo(new Point(0.71*s,s), new Point(s/4,s));
	    OR.lineTo(0,s);
	    OR.quadraticCurveTo(new Point(s/4,s/2), new Point(0,0));
	    OR.closePath(true);
	    OR.translate(new Point(x-s/2, y-s/2));

	    gb.mainGroup.addChild(OR);

	    return OR;
	}

	function createXor(x,y){
	    var XOR = new CompoundPath(Styles.Default);
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

	    gb.mainGroup.addChild(XOR);

	    return XOR;
	}

	function createBuf(x,y){
	    var BUF = new Path(Styles.Default);
	    BUF.moveTo(new Point(0,0));
	    BUF.lineTo(new Point(s,s/2));
	    BUF.lineTo(new Point(0,s));
	    BUF.closePath(true);
	    BUF.translate(new Point(x-s/2,y-s/2));

	    gb.mainGroup.addChild(BUF);
	    
	    return BUF;
	}

	function setStyle(item,style){
	    for(attribute in style){
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

	canvas.onwheel = ui.onwheel;
    var tool = new Tool();
	tool.onMouseDown = ui.onMouseDown;
	tool.onMouseDrag = ui.onMouseDrag;
	tool.onMouseUp = ui.onMouseUp;
	tool.onKeyDown = ui.onKeyDown;
}

gb.tryLoad(loadCB,2);
