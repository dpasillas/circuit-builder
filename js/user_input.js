var gb = window.globals;
gb.user_input = {};
var ui = window.globals.user_input;


var lastP = new Point();
var selectionRect = null;
var rubberBand = false;

ui.onMouseDown = function(event){
    lastP = view.projectToView(event.point);

    var hit = gb.mainGroup.hitTest(event.point,{stroke:false, fill:true});
    if(hit){
        gb.selected.addChild(hit);
        gb.setStyle(hit,Styles.Selected);
        gb.selected.bringToFront();
    }
    else{
        if(!event.modifiers.shift){
            gb.selected.restyle(Styles.Default);
            gb.selected.removeChildren();
        }

        selectionRect = new Path(Styles.Selector);
        selectionRect.add(event.point);
        selectionRect.add(event.point);
        selectionRect.add(event.point);
        selectionRect.add(event.point);
        selectionRect.closed = true;
        rubberBand = true;
    }
};
gb.getZoom = function (oldZoom, delta){
    var scaleFactor = 1.03;    
    if(delta < 0)
        return oldZoom*scaleFactor;
    else
        return oldZoom/scaleFactor;
};

gb.zoomWithMouse = function (event){
    var limit = 4;
    var element = view.element;
    var z = project.view.zoom;
    var c = view.center;
    //calculate position of mouse relative to canvas
    var mouse = new Point(event.clientX - element.offsetLeft + window.pageXOffset,
                            event.clientY - element.offsetTop + window.pageYOffset);
    var p = view.viewToProject(mouse);
    var nz = Math.min(4,Math.max(1/limit,gb.getZoom(z,event.deltaY)));
    view.zoom = nz;    
    var offset = p-c;
    view.center = p - offset*(z/nz);
}

ui.onwheel = function(event){
    if(event.ctrlKey)
        gb.zoomWithMouse(event);
    

    return false;
}

ui.onMouseDrag = function(event){
    //console.log("what a drag!");
    var p = view.projectToView(event.point);
    var delta = (p - lastP) / view.zoom;
    lastP = p;
    if(event.modifiers.control)
        view.center -= delta;
    else{
        if(rubberBand){
            selectionRect.segments[1].point += new Point(delta.x,0);
            selectionRect.segments[2].point += delta;
            selectionRect.segments[3].point += new Point(0,delta.y);
        }else{
            gb.selected.translate(delta);
        }
    }
};

ui.onMouseUp = function(event){
    if(selectionRect){
        selectionRect.remove();
        selectionRect = null;
    }
    rubberBand = false;
};

ui.onKeyDown = function(event){
    switch(event.key){
        case 'space':
            gb.selected.rotate(45);
            break;
        default:
    }
}

gb.setStyle = function (item,style){
    for(attribute in style){
        item[attribute] = style[attribute];
    }
};