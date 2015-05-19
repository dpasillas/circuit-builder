//Array-based queue
function Queue(size) {
	this.data = [];
	this.reserved = 0;
	var count = (Number.isInteger(size) && size > 16 && size) || 32;
	this.reserve(count);
	//keep track of where we'll insert/remove items
	this.head = 0;
	this.tail = 0;
}

//dir enum
Dir = {
	NONE:0,
	LEFT:1,
	RIGHT:2,
	UP: 3,
	DOWN: 4,
	opposite:function(dir){
		switch(dir){
			case Dir.LEFT:
				return Dir.RIGHT;
			case Dir.RIGHT:
				return Dir.LEFT;
			case Dir.UP:
				return Dir.DOWN;
			case Dir.DOWN:
				return Dir.UP;
			default:
				return Dir.NONE;
		}
	},
	getDir: function(i){
		if(i < 0)
			return Dir.LEFT;
		if(i > 0)
			return Dir.RIGHT;
		return Dir.NONE;
	}
};

if(Object.freeze)
	Object.freeze(Dir);

Queue.prototype = {
	reserve: function(count){
		if(count < this.reserved)
			return;
		var nData = new Array(count);

		var i;
		for(i = 0; i < (this.tail-this.head)%this.reserved; ++i)
			nData[i] = this.data[(this.head+i)%this.reserved];
		this.head = 0;
		this.tail = (this.tail-this.head)%this.reserved;
		this.reserved = count;
	},
	enqueue: function(val){
		//make sure the queue doesn't get completely full, or we can't tell if it's full or empty.
		if( (this.tail - this.head) % this.reserved == this.reserved - 1)
			this.reserve(this.reserved*2);

		this.data[this.tail] = val;
		this.tail = (this.tail + 1) % this.reserved;
	},
	dequeue: function() {
		if(this.head == this.tail)
			throw "Can't dequeue when empty!";
		var val = this.data[this.head];
		this.head = (this.head+1)%this.reserved;
		return val;
	},
	isEmpty: function() {
		return this.head == this.tail;
	}
};

//Binary Tree with removeFirst
//	args: size, lessThan, equiv
function BinaryTree(args) {
	args = args || {};
	this.reserved = 0;
	this.data = [];
	this.left = [];
	this.right = [];
	//keep track of empty spaces we can use, so data is roughly contiguous in memory.
	this.free = new Queue(100);
	this.weight = [];
	var count = (Number.isInteger(args.size) && args.size > 31 && args.size) || 256;
	this.reserve(count);

	this.root = -1;
	// to determine rank	
	this.less = args.lessThan || function(a,b) { return a < b; };
	// to determine if data should be replaced
	this.equiv = args.equiv || function(a,b) {return a == b; };
	this.tail = 0;
}

BinaryTree.prototype = {
	_peek:function(index){
		if(this.left[index] >= 0)
			return this._peek(this.left[index]);
		else
			return this.data[index];
	},
	peek: function(){
		if(root < 0)
			return undefined;
		return _peek(root);
	},
	_doFunc: function(func,index){
		if(index < 0)
			return;
		
		this._doFunc(func,this.left[index]);
		func(this.data[index]);
		this._doFunc(func,this.right[index]);
	},	
	doFunc:function(func){
		this._doFunc(func,this.root);
	},
	isEmpty: function() {
		return this.root < 0;
	},
	nextFree: function(){
		var f = this.free;
		if(f.isEmpty())
			return this.tail++;
		else
			return f.dequeue();
	},
	getDir: function(i,val) {
		return this.less(val,this.data[i])?Dir.LEFT:Dir.RIGHT;
	},
	getChild: function(i,dir){
		if(i < 0)
			return -1;
		if(dir == Dir.LEFT)
			return this.left[i];
		else if(dir == Dir.RIGHT)
			return this.right[i];
		else throw "invalid direction, no child to get";
	},
	setChild: function(i,dir,child){
		if(i < 0)
			return;
		if(dir == Dir.LEFT)
			this.left[i] = child;
		else if(dir == Dir.RIGHT)
			this.right[i] = child;
		else throw "invalid direction, no child set";
			
	},
	store: function(val){
		var index = this.nextFree();
		this.data[index] = val;
		this.left[index] = -1;
		this.right[index] = -1;
		this.weight[index] = 1;
		this.tail = Math.max(this.tail,index);
		return index;
	},
	getWeight: function(index){
		if(index < 0)
			return 0;
		else
			return this.weight[index];
	},
	setWeight: function(index, d){
		if(index < 0)
			return;
		this.weight[index] = d;
	},
	reweigh: function(index){
		var l = this.left[index];
		var r = this.right[index];
		this.setWeight(index, Math.max(this.getWeight(l),this.getWeight(r))+1);
		return true;
	},
	blowAway: function(index){
		if(this.root === index)
			this.root = -1;
		this.left[index] = -1;
		this.right[index] = -1;
		this.data[index] = null;
		this.weight[index] = 0;
		this.free.enqueue(index);
	},
	_removeFirst: function(index, parent){
		if(this.left[index] != -1){
			var data = this._removeFirst(this.left[index],index);
			return this.reweigh(index) && this.balanceAt(index,parent,Dir.LEFT) && data;
		}
		//we are at the left-most of the current branch
		this.setChild(parent,Dir.LEFT,this.right[index]);
		if(index === this.root)
			this.root = this.right[index];
		var data = this.data[index];
		this.blowAway(index);
		return data;
	},
	removeFirst: function(){
		if(this.root < 0)
			return null;
		return this._removeFirst(this.root,-1);
		//TODO get right-most child of leftmost child
	},
	insert: function(val){
        console.log(val);
		if(this.tail == this.reserved){
			this.reserve(this.reserved*2);
		}
		
		if(this.root < 0) {
			this.root = this.store(val);
		}
		else {
			this.insertAt(this.root,val,-1,Dir.NONE);
		}
		
	},
	//i - current index
	//val - data to be stored
	//p - parent index
	insertAt: function(i,val,p,pd) {
		if(this.equiv(val,this.data[i])){
			this.data[i] = val;
			return false;
		}
		var dir = this.getDir(i,val);
		var child = this.getChild(i,dir);
		
		if(child == -1){
			var c = this.store(val);
			this.setChild(i,dir,c);
			return this.reweigh(i);
		}
		else {
			return this.insertAt(child,val,i,dir) && this.reweigh(i) && this.balanceAt(i,p,pd);
		}
	},
	balanceAt: function(i,p,pd){
		var lw = this.getWeight(this.left[i]);
		var rw = this.getWeight(this.right[i]);
		var d = Dir.getDir(rw-lw);
		var o = Dir.opposite(d);
		var diff = Math.abs(rw - lw);
		
		//we must maintain a weight difference of no more than 1
		if(diff > 1) {
			var child = this.getChild(i,d);
			lw = this.getWeight(this.getChild(child,Dir.LEFT));//child.left[i]);
			rw = this.getWeight(this.getChild(child,Dir.RIGHT));//child.right[i]);
			var dc = Dir.getDir(rw-lw);
			var oc = Dir.opposite(dc);
			diff = Math.abs(rw - lw);
			
			//if the child is heavier in the opposite side of the parent
			if(diff > 0 && dc === o)
				this.rotate(child,oc,i,d);
			this.rotate(i,o,p,pd);
				
		}
		return true;
	},
	rotate: function(i,dir,p,dp){
		var odir = Dir.opposite(dir);
		var top = i;
		var mid = this.getChild(i,odir);
		var bot = this.getChild(mid,dir);

		if(p == -1)
			this.root = mid;
		else
			this.setChild(p,dp,mid);
		this.setChild(mid,dir,top);
		this.setChild(top,odir,bot);

		var td = Math.max(this.getWeight(this.getChild(top,dir)), this.getWeight(bot))+1; 
		this.setWeight(top, td);
		this.setWeight(mid, Math.max(td, this.getWeight(this.getChild(mid,odir)))+1);
	},
	reserve: function(count){
		if(count < this.reserved)
			return;
		
		//chrome (and presumably other browsers) can optimize arrays
		//	as long as their size is static, so we create new arrays
		//	instead of growing existing ones.
		var nData = new Array(count);
		var nLeft = new Int32Array(count);
		var nRight = new Int32Array(count);
		var nWeight = new Int32Array(count);

		var i;
		for(i = 0; i < this.reserved; ++i){
			nData[i] = this.data[i];
			nLeft[i] = this.left[i];
			nRight[i] = this.right[i];
			nWeight[i] = this.weight[i];
			
		}
		for(i = this.reserved; i < count; ++i){
			nData[i] = null;
			nLeft[i] = -1;
			nRight[i] = -1;
			nWeight[i] = 0;
		}
		this.data = nData;
		this.left = nLeft;
		this.right = nRight;
		this.weight[i] = nWeight;
		this.reserved = count;
	}
};

//paperjs groups cannot ungroup without removing items from the project
//	this cause the items to be removed from all other groups as well.
function ItemGroup(){
	this.children = this._createTree();
}

ItemGroup.prototype = {
	_createTree: function(){
		var tree = new BinaryTree({
			lessThan: function(a,b){return a.id < b.id;},
			equiv: function(a,b){return a.id == b.id;}
		});
		return tree;
	},
	addChild: function(child){
		this.children.insert(child);
	},
	removeChildren: function(){
		this.children = new BinaryTree
	},
	translate: function(delta){
		this.children.doFunc(function(item){item.translate(delta);});
	},
	rotate: function(angle,pivot){
		pivot = pivot || this.getBounds().center;
		this.children.doFunc(function(item){item.rotate(angle,pivot);});
	},
	setVisible: function(visible){
		this.children.doFunc(function(item){item.visible = false;});
	},
	hitTest: function(point,options){
        var hits = [];
        this.children.doFunc(function(item){
            if(item.hitTest(point,options))
                hits.push(item);
        });
        hits.sort(function(a,b){return a.isBelow(b);});
        console.log(hits);
        console.log(hits[0]);
        return hits[0];
	},
    bringToFront: function(){
        this.children.doFunc(function(item){item.bringToFront();});   
    },
    restyle: function(style){
        this.children.doFunc(function(item){
            for(attribute in style){
                item[attribute] = style[attribute];
            }
        });
    }
};
