var gb = window.globals;
gb.user_input = {};
var ui = window.globals.user_input;


var lastP = new Point();
var selectionRect = null;
var rubberBand = false;
var hit = null;
var alreadySelected = false;

ui.onMouseDown = function(event){
    lastP = view.projectToView(event.point);

    hit = gb.mainGroup.hitTest(event.point,{stroke:false, fill:true});
    if(hit){
        if(!gb.selected.contains(hit) && !event.modifiers.shift)
            gb.selected.removeChildren();
        
        alreadySelected = !gb.selected.addChild(hit);

        gb.selected.bringToFront();
    }
    else{
        alreadySelected = false;
        if(!event.modifiers.shift)
            gb.selected.removeChildren();

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

var prevIntersectedObjs = [];
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
            
            // get an array of intersected items that intersect with the selection box
            intersectedObjs = gb.mainGroup.getIntersections(selectionRect);
            
            /* //  Print id of selected items for debugging
            for(var i = 0; i < selectedObjs.length; ++i){
                console.log(selectedObjs[i].id);
            }
            */
            
        }else{
            gb.selected.translate(delta);
        }
    }
};

ui.onMouseUp = function(event){
    if(event.downPoint.equals(event.point))
        ui.onClick(event);
    if(selectionRect){
        selectionRect.remove();
        selectionRect = null;
    }
    rubberBand = false;
    alreadySelected = false;
    prevIntersectedObjs = [];
};

ui.onClick = function(event){
    if(alreadySelected && hit && event.modifiers.shift && gb.selected.contains(hit)){
        gb.selected.removeChild(hit);
        hit = null;
    }
}

ui.onKeyDown = function(event){
    switch(event.key){
        case 'space':
            gb.selected.rotate(45);
            return false;
            break;
        default:
    }
    return true;
}

gb.setStyle = function (item,style){
    for(attribute in style){
        item[attribute] = style[attribute];
    }
};

gb.ready[0] = true;
