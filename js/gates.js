var gb = window.globals;
var s = 32;//pixel size of gate

function loadGates(){
//var gate = new LogicGate({type:AND, bitWidth:4, inputCount});
    
    function Pin(args){
        this.value = args.value || 0;
        this.bitWidth = args.bitWidth || 1;
        this.stateX = args.stateX || 0;
        this.stateZ = args.stateZ || 0;
        this.type = args.type || function(){throw "Pin w/o type!";}();
        this.destination = (this.type === Pin.OUTPUT)
                                ?new BinaryTree(2)
                                :null;
        this.source = (this.type === PIN.INPUT)
                        ?(args.source || null)
                        :null;
        this.parent = args.parent || function(){throw "Pin w/o parent!"}();
        this.id = Pin._id++;
        this.alive = true;
    }
    
    Pin._id = 0;
    Pin.INPUT = 0;
    Pin.OUTPUT = 1;
    Pin.free_id = new Queue(32);
    
    Pin.prototype = {
        setValue: function(val,stateX,stateY){
            this.value = val;
            this.stateX = stateX;
            this.stateZ = stateZ;
            
            if(this.type === Pin.OUTPUT && this.destination)
                this.destination.doFunc(
                    function(pin){
                        pin.setValue(val,stateX,stateY);
                    }
                );
        },
        connect: function(other){
            if(this.bitWidth != other.bitWidth)
                return false;
            if(this.type === other.type)
                return false;
            if(this.type === PIN.INPUT)
                return other.connect(this);
            if(this.type === Pin.OUTPUT){
                if(other.source != this)
                    return other.disconnect();
                else
                    return false;
                this.destination.insert(other);
                other.source = this;
                other.setValue(this.value,this.stateX,this.stateY);
                other.propogate();
                return true;
            }
        },
        _clearDest: function(){
            this.destination = new BinaryTree(2);
        },
        reset: function(){
            this.setValue(0,0,0xFFFFFFFF);
        },
        disconnect: function(){
            
            if(this.source === this){
                var thisPin = this;
                this.destination.doFunc(
                    function(pin){
                        pin.source = 0;
                        if(pin == thispin)
                            return;
                        pin.reset();
                        pin.propogate();
                    }
                );
                this._clearDest();
                this.destination.insert(this);
                this.source = this;
                return;
            }
            if(this.type === Pin.OUTPUT && this.destination){
                var thisPin = this;
                this.destination.doFunc(
                    function(pin){
                        pin.source = 0;
                        pin.reset();
                        pin.propogate();
                    }
                );
                this._clearDest();
                return;
            }
            if(this.source){
                this.source.destination.remove(this);
                this.source = null;
                this.reset();
                if(alive)
                    pin.propogate();
            }
        },
        propogate: function(){
            var val = this.value;
            var sx = this.stateX;
            var sz = this.stateZ;
            
            switch(this.type){
            case Pin.INPUT:
                this.parent.operate(this);
                break;
            case Pin.OUTPUT:
                this.destination.doFunc(
                    function(pin){
                        pin.setValue(val,sx,sz);
                        pin.parent.operate(pin);
                    }
                );
                break;
            }
        }
    };
    
    function GraphicsPin(args){
        this.pin = new Pin(args);
        this.pos = args.pos || function(){throw "GPin w/o pos!";}();
        this.orientation = args.orientation || function(){throw "GPin w/o ori";}();
        this.not = args.not || false;
        this.parent = args.parent || function(){throw "GPin w/o parent!";}();
    }
    GraphicsPin.prototype = {
        connect: function(other){
            this.connect(other.pin);
        }
    };
    
    function LogicEvent(args){
        this.value = args.value || 0;
        this.stateX = args.stateX || 0;
        this.stateZ = args.stateZ || 0;
        this.time = args.time || function(){throw "LE with no target time!";}();
        this.pin = args.pin || function(){throw "LE with no target!";}();
    }
    
    LogicEvent.prototype = {
        compare: function(other){
            if(this.time === other.time)
                return this.pin.id - other.pin.id;
            else
                return this.time - other.time;
        },
        lessThan: function(other){
            return this.compare(other) < 0;
        }
    };
    
    var LogicGateProperties = {
        VariableShape:  0x00000001,
        IBussable:      0x00000002,
        OBussable:      0x00000004,
        SingleOutput:   0x00000008,
        MergingPins:    0x00000010,
        Mux:            0x00000020,
        Bussed:         0x00000040,
        DUMMY:          0x00000080
    };
    
    Object.freeze && Object.freeze(LogicGateProperties);
    
    function Component(args){
        this.properties = args.properties || 0;
        this.delay = 1;
        this.inputs = [];
        this.outputs = [];
        this.controls = [];
    }
    
    Component.prototype = {
        //value, stateX, stateZ, pin
        postEvent: function(args){
            gb.logicEvents.addChild(new LogicEvent(args));
        }
    };
    
    function LogicGate(args) {
        Component.call(this,args);
        this.bitWidth = args.bitWidth || 1;
        this.delay = args.delay || this.delay;
        this.point = args.point || function(){throw "No position given";}();
        this.type = args.type || function(){throw "Untyped gate";}();
        this.shape = this._getShape(this.type,this.point);
        this.selected = false;
        this._setup(args.type,args.inputCount);
    }

    var types = {
        AND: 0,
        NAND: 1,
        OR: 2,
        NOR: 3,
        XOR: 4,
        XNOR: 5,
        BUF: 6,
        NOT: 7,   
    }
    for(attr in types)
        LogicGate[attr] = types[attr];

    LogicGate.prototype = {
        _setup: function(type,count){
            switch(type){
            case LogicGate.AND:
            case LogicGate.NAND: 
            case LogicGate.OR:
            case LogicGate.NOR:
            case LogicGate.XOR:
            case LogicGate.XNOR: 
                this.inputCount = Math.min(4,Math.max(2,count));
                this._setupStandard(type,this.inputCount);
                break;
            case LogicGate.BUF:
            case LogicGate.NOT: 
                this._setupStandard();
                break;
            default:
                break;
            }
        },
        _setupStandard: function(i){
            var lgp = LogicGateProperties;
            properties = lgp.SingleOutput | lgp.IBussable | lgp.OBussable;
            
            outputs.push(
                new GraphicsPin(
                    {
                        pos: new Point(32.,16.),
                        orientation: Dir.RIGHT,
                        not: type%2,
                        parent: this,
                        type: Pin.OUTPUT
                    }
                )
            );
            
        },
        _getShape: function(type,point){
            var x = point.x;
            var y = point.y;
            switch(type){
                case LogicGate.AND:
                case LogicGate.NAND:
                    return this._createAnd(x,y);
                case LogicGate.OR:
                case LogicGate.NOR:
                    return this._createOr(x,y);
                case LogicGate.XOR:
                case LogicGate.XNOR:
                    return this._createXor(x,y);
                case LogicGate.BUF:
                case LogicGate.NOT:
                    return this._createBuf(x,y);
                    break;
                default:
                    throw "Invalid type";
            }
        },
        createAnd: function(x,y){
            var AND = new Path(Styles.Default);
            AND.moveTo(0,0);
            AND.lineTo(s/2,0);
            AND.arcTo(new Point(s,s/2), new Point(s/2,s));
            AND.lineTo(0,s);
            AND.closePath(true);
            AND.translate(new Point(x-s/2,y-s/2));

            gb.mainGroup.addChild(AND);

            return AND;
        },
        createOr: function(x,y){
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
        },
        createXor: function (x,y){
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
        },
        createBuf: function(x,y){
            var BUF = new Path(Styles.Default);
            BUF.moveTo(new Point(0,0));
            BUF.lineTo(new Point(s,s/2));
            BUF.lineTo(new Point(0,s));
            BUF.closePath(true);
            BUF.translate(new Point(x-s/2,y-s/2));

            gb.mainGroup.addChild(BUF);

            return BUF;
        }
    };
    gb.LogicGate = LogicGate;
}

gb.tryLoad(loadGates,1);