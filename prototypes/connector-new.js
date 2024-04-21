/*
SVG Connector Script Libarary

Available under the MIT License:

Copyright (c) 2009, Doug Schepers

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

var root = null;
var svgns = 'http://www.w3.org/2000/svg';
var xlinkns = 'http://www.w3.org/1999/xlink';

var TrueCoords = null;
var GrabPoint = null;
var DragTarget = null;
var drag = null;

var connectorArray = [];
var nodeArray = [];

/*
* initialize
*/
window.onload = function () {
  root = document.documentElement;

  var connectors = root.getElementsByTagName("connector");
  for ( var i = 0, iLen = connectors.length; iLen > i; i++ ) {
    var eachEl = connectors[i];
    var c = new Connector(eachEl);
    c.init();
    connectorArray.push( c );
    c.draw();
  }

  var drag = new DragDrop();
  drag.init( document.getElementById("nodes") );
};

/*
* drag & drop functions
*/
function DragDrop () {
  this.dragEl       = null;
  this.targetEl     = null;
  this.m            = null;
  this.p            = null;
  this.offset       = null;
  this.t            = null;
  this.backdrop = document.querySelector("backdrop");
  this.root = document.documentElement;
  this.coords = null;
};

DragDrop.prototype.toString = function() { return "[DragDrop Object]"; };

DragDrop.prototype.init = function( draggable ) {
  var dragdrop = this;

  draggable.addEventListener("mousedown", function( event ){ dragdrop.grab( event ); }, false);
  document.documentElement.addEventListener("mousemove", function( event ){ dragdrop.drag( event ); }, false);
  document.documentElement.addEventListener("mouseup", function( event ){ dragdrop.drop( event ); }, false);

  this.p = document.documentElement.createSVGPoint();
  this.offset = document.documentElement.createSVGPoint();
  this.t = document.documentElement.createSVGPoint();
};

DragDrop.prototype.grab = function( event ) {
  if ( event.altKey ) {
    alert(0)
    return;
  }
  this.coords = localCoords(event, this.backdrop, this.root);
 
  this.dragEl = event.target;
    // alert(event.target)
  if ( this.dragEl.correspondingUseElement ) {
    this.dragEl = this.dragEl.correspondingUseElement;
  }
    // alert(0)

  if( this.dragEl ) {
    this.dragEl.parentNode.appendChild( this.dragEl );
    this.dragEl.setAttribute( "pointer-events", "none");
    
    this.m = document.documentElement.getScreenCTM();

    this.p.x = this.coords.x;
    this.p.y = this.coordsevent.clientY;

    this.p = this.p.matrixTransform( this.m.inverse() );
    
    var ctm = this.dragEl.getCTM();
    this.offset.x = this.p.x - parseInt( ctm.e );
    this.offset.y = this.p.y - parseInt( ctm.f );
    // alert(1)
  }
};

DragDrop.prototype.drag = function( event ) {
  if( this.dragEl ) {
    // alert("drag");
    this.m = document.documentElement.getScreenCTM();

    this.p.x = event.clientX;
    this.p.y = event.clientY;

    this.p = this.p.matrixTransform( this.m.inverse() );
    this.p.x -= this.offset.x;
    this.p.y -= this.offset.y;

    this.t.x = this.p.x;
    this.t.y = this.p.y;
    this.dragEl.setAttribute("transform", "translate(" + this.p.x + "," + this.p.y + ")");

    var node = nodeArray[ this.dragEl.id ];
    node.t.x = this.p.x;
    node.t.y = this.p.y;
    var connectors = node.connectors;
    for ( var i = 0, iLen = connectors.length; iLen > i; i++ ) {
      var eachC = connectors[i];
      eachC.draw();
    }
  }
};

DragDrop.prototype.drop = function() {
    // alert("drop");
  var att = "transform: " + this.dragEl.getAttribute("transform")
          + "\nx: " + this.dragEl.getAttribute("x")
          + "\ny: " + this.dragEl.getAttribute("y");
  // alert(att)        
  this.dragEl.setAttribute( "pointer-events", "all");
  this.dragEl = null;
};



/*
* output current layout
*/
document.onkeydown = function (event) {
  var keyCode = null;
  if( event == null ) {
    keyCode = window.event.keyCode;
  }
  else {
     keyCode = event.keyCode;
  }
  // alert(keyCode)

  if ( 80 == keyCode ) {
    var output = "";
    for ( var id in nodeArray ) {
      var eachNode = nodeArray[id];
      output += id + " (" 
             + "x: " + (eachNode.x + eachNode.t.x)+ ", "
             + "y: " + (eachNode.y + eachNode.t.y)
             + ")\n";
    }
    alert(output)
  }
};

function Point ( el ) {
  this.id           = null;
  this.el           = el;
  this.parent       = null;
  this.x            = 0;
  this.y            = 0;
  this.role         = null;
  return this.init();
};

Point.prototype.toString = function(){ return 'Point'; };

Point.prototype.init = function() {
  this.id = this.el.getAttribute("id");

  this.x += parseFloat( this.el.getAttribute("x") );
  this.y += parseFloat( this.el.getAttribute("y") );
  this.role = this.el.getAttribute("role");
  
  this.parent = this.el.parent;
  if ( "use" == this.el.localName ) {
    // do something about 'use' elements here?
  }
};

function Node( id ) {
  this.id           = null;
  this.el           = null;
  this.role         = null;
  this.title        = null;
  this.desc         = null;
  this.port         = null;
  this.ports       = [];

  this.connectors   = [];
  this.x            = 0;
  this.y            = 0;
  this.t           = 0;
  return this.init( id );
};

Node.prototype.toString = function(){ return 'Node: ' + this.id ;};

Node.prototype.init = function( id ) {
  var node = nodeArray[id];
  if ( !node ) {
    this.el = document.getElementById( id );
    var centroid = GetCentroid(this.el);
    this.x = centroid.x;
    this.y = centroid.y;
    this.t = document.documentElement.createSVGPoint();

    var ctm = this.el.getCTM();
    this.t.x = parseInt( ctm.e );
    this.t.y = parseInt( ctm.f );
    
    // alert( "this.t.x: " + this.t.x + "\nthis.t.y: " + this.t.y )

    nodeArray[id] = this;
    node = this;
    
    this.role = this.el.getAttribute("role");
    
    var t = this.el.getElementsByTagName("title")[0];
    if ( null != t ) {
      this.title = t.textContent;
    }

    var d = this.el.getElementsByTagName("desc")[0];
    if ( null != d ) {
      this.desc = d.textContent;
    }
    
    /// issue: fix for 'use' case
    var points = this.el.getElementsByTagName("point");
    for ( var p = 0, pLen = points.length; pLen > p; p++ ) {
      var eachPoint = points[ p ];
      // alert(eachPoint)
      var port = new Point( eachPoint );
      this.ports.push( port );
      // ShowPort( port, this.t.x, this.t.y );
      // ShowPort( port );
    }

    // this.el.addEventListener("focus", this.showNavOptions, false);
  }

  return node;
};


Node.prototype.showNavOptions = function( event ) {
  var node = nodeArray[this.id];
  // alert(node);
  var navOptions = "";
  if ( node.title || node.desc ) {
    if ( node.title ) {
      navOptions += node.title;
    }
  
    if ( node.desc ) {
      navOptions += ": " + node.desc;
    }
    navOptions += "\n\n";
  }
  navOptions += "Navigation Options:\n";

  var connectors =  node.connectors;
  for ( var i = 0, iLen = connectors.length; iLen > i; i++ ) {
    var eachC = connectors[i];
    navOptions += "  " + eachC.title + ": " + eachC.desc + "\n";
  }
  // alert(navOptions);
};

function Connector( el ) {
  this.id           = null;
  this.el           = el;
  this.path         = null;
  this.points       = [];
  this.title        = null;
  this.desc         = null;

  this.n1           = null;
  this.n2           = null;
  this.directed     = "false";
  this.n1port       = null; 
  this.n2port       = null;

  this.firstPoint   = null; // the first point in the connectors list
  this.lastPoint    = null; // the last point in the connectors list
  this.n1p          = null; // the current n1 port the connector starts from
  this.n2p          = null; // the current n2 port the connector ends at

};

Connector.prototype.toString = function(){ return 'Connector';};

Connector.prototype.init = function() {
  this.id = this.el.getAttribute("id");
  var n1id = this.el.getAttribute("n1").replace("#","");
  this.n1 = new Node( n1id );
  this.n1.connectors.push( this );

  var n2id = this.el.getAttribute("n2").replace("#","");
  this.n2 = new Node( n2id );
  this.n2.connectors.push( this );
  
  this.n1port = this.el.getAttribute("n1port");
  this.n2port = this.el.getAttribute("n2port");
  
  var points = this.el.getElementsByTagName("point");
  for ( var p = 0, pLen = points.length; pLen > p; p++ ) {
    var eachPoint = points[ p ];
    // alert(eachPoint)
    var point = new Point( eachPoint );
    this.points.push( point );
    
    if ( 0 == p ) {
      this.firstPoint = point;
      this.lastPoint = point;
    }
    else if ( pLen == p + 1 ) {
      this.lastPoint = point;
    } 
  }
  
  this.directed = this.el.getAttribute("directed");
  
  var t = this.el.getElementsByTagName("title")[0];
  if ( null != t ) {
    this.title = t.textContent;
  }
  
  var d = this.el.getElementsByTagName("desc")[0];
  if ( null != d ) {
    this.desc = d.textContent;
  }
};

Connector.prototype.draw = function() {
  this.findClosestPoints();
  var points = "";
  for ( var p = 0, pLen = this.points.length; pLen > p; p++ ) {
    var eachPoint = this.points[ p ];
    points += "L" + eachPoint.x + "," + eachPoint.y + " ";
    // alert(points)
  }
  
  var n1x = this.n1.x + this.n1.t.x;
  var n1y = this.n1.y + this.n1.t.y;
  if ( this.n1p ) {
    n1x += this.n1p.x;
    n1y += this.n1p.y;
  }

  var n2x = this.n2.x + this.n2.t.x;
  var n2y = this.n2.y + this.n2.t.y;
  if ( this.n2p ) {
    n2x += this.n2p.x;
    n2y += this.n2p.y;
  }

  var d = "M" + n1x + "," + n1y + " "
        + points
        + "L" + n2x + "," + n2y;

  if ( !this.path ) {
    this.path = document.createElementNS(svgns, "path");
    this.path.setAttribute( "fill", "none" );

    // copy the stroke and marker attributes of the connector element to the path element
    for ( a in this.el.attributes ) {
      var attr = this.el.attributes[ a ].name;
      if ( attr && (-1 != attr.indexOf("stroke") || -1 != attr.indexOf("marker")) ) {
        var attrVal = this.el.attributes[ a ].value;
        // alert( "attr: " + attr + "\nattrVal: " + attrVal )
        this.path.setAttribute( attr, attrVal );
      }
    }
    
    if ( !this.el.parentNode.getAttribute("stroke") ) {
      this.path.setAttribute( "stroke", "#000000" );
    }

    this.el.parentNode.appendChild( this.path );
  
    // if ( "true" == this.directed ) {
    //   this.path.setAttribute( "marker-end", "url(#arrow)" );
    // }
  }
  this.path.setAttribute( "d", d );
};


// find which combination of ports and connector attractors are
//   closest to each other
Connector.prototype.findClosestPoints = function() {
  var n1x = this.n1.x + this.n1.t.x;
  var n1y = this.n1.y + this.n1.t.y;
  var n2x = this.n2.x + this.n2.t.x;
  var n2y = this.n2.y + this.n2.t.y;
  
  var n1ports = [];
  if ( null == this.n1port ) {
    n1ports = this.n1.ports;
  }
  else {
    // filter candidate ports based on @n1port
    for ( var p = 0, pLen = this.n1.ports.length; pLen > p; p++ ) {
      var port = this.n1.ports[ p ];
      if ( port.role && -1 != port.role.indexOf( this.n1port ) ) {
        n1ports.push( port );
      }
    }
  }
  
  var n2ports = [];
  if ( null == this.n2port ) {
    n2ports = this.n2.ports;
  }
  else {
    // filter candidate ports based on @n2port
    for ( var p = 0, pLen = this.n2.ports.length; pLen > p; p++ ) {
      var port = this.n2.ports[ p ];
      if ( port.role && -1 != port.role.indexOf( this.n2port ) ) {
        n2ports.push( port );
      }
    }
  }
  
  var targetx = n2x;
  var targety = n2y;
  var targetports = n2ports;
  // if there is an initial point in the connector, that point should be
  //   the relevant point for determining the n1 port
  if ( this.firstPoint ) {
    targetports = [ this.firstPoint ];
    targetx = 0;
    targety = 0;
  }
  
  // var ports = this.findPort( sourceports, sourcex, sourcey, targetports, targetx, targety );
  var ports = this.findPort( n1ports, n1x, n1y, targetports, targetx, targety );
  this.n1p = ports[ 0 ];
  this.n2p = ports[ 1 ];
  
  
  // if there is a point in the connector, then find the nearest target
  //   port to that point
  if ( this.lastPoint ) {
    var ports = this.findPort( [ this.lastPoint ], 0, 0, n2ports, n2x, n2y );
    this.n2p = ports[ 1 ];
  }
};


// loop through available ports and connector attractors to find closest match
Connector.prototype.findPort = function( sourceports, sourcex, sourcey, targetports, targetx, targety ) {
  var distance = null;
  var d = 0;

  var ports = [];
  for ( var p = 0, pLen = sourceports.length; pLen > p; p++ ) {
    var sourcePort = sourceports[ p ];
    for ( var t = 0, tLen = targetports.length; tLen > t; t++ ) {
      var targetPort = targetports[ t ];
      d = this.getDistance( (sourcePort.x + sourcex), (sourcePort.y + sourcey), (targetPort.x + targetx), (targetPort.y + targety) );
      if ( null == distance || d <= distance ) {
        // alert( this.id + "\n" + distance + "\n" + d + "\n" + sourcePort.id + " " + targetPort.id )
        distance = d;
        ports[0] = sourcePort;
        ports[1] = targetPort;
      }
    }
  }
  
  return ports;
};


Connector.prototype.getDistance = function( x1, y1, x2, y2 ) {
  // use Pythagorean theorem to find distance between points 
  return Math.sqrt( Math.pow( (x2 - x1), 2) + Math.pow( (y2 - y1), 2) );
};


function GetCentroid(el) {
  // note: this isn't really a centroid!
  var centroid = root.createSVGPoint();
  var bbox = el.getBBox();
  centroid.x = bbox.x + (bbox.width/2);
  centroid.y = bbox.y + (bbox.height/2);

  if ("use" == el.nodeName) {
    var x = 0;
    var xVal = el.getAttribute("x");
    if ( xVal ) {
      x = parseFloat( xVal );
    }
    
    var y = 0;
    var yVal = el.getAttribute("y");
    if ( yVal ) {
      y = parseFloat( yVal );
    }
    
    centroid.x += x;
    centroid.y += y;
  }

  // alert(el.id + "\nx: " + centroid.x + "\ny: " + centroid.y)

  return centroid;
};


function ShowPort( p, tx, ty ) {
  // alert(p);
  var el = document.createElementNS(svgns, "circle");
  el.setAttribute( "id", p.id  + ": " + p.x + ", " + p.y);
  el.setAttribute( "cx", p.x + tx );
  el.setAttribute( "cy", p.y + ty );
  el.setAttribute( "r", "5" );
  el.setAttribute( "fill", "yellow" );
  el.setAttribute( "stroke", "red" );
  el.addEventListener( "click", GetId, false );

  document.documentElement.appendChild( el );
};

function GetId(event) {
  alert(event.target.id);
}

function localCoords ( event, element, root ) {
  var p = root.createSVGPoint();
  // p.x = +event.clientX.toFixed(2);
  // p.y = +event.clientY.toFixed(2);
  p.x = +event.clientX;
  p.y = +event.clientY;
  p = p.matrixTransform(element.getScreenCTM().inverse());

  // NOTE: now we're looking at the numbers, so limiting the floats to precison 2 makes it easier
  // since SVG only works at one pixel of accuracy anyway
  // p.x = Math.round(p.x * 100)/100;
  // p.y = Math.round(p.y * 100)/100;
  // console.log("p: " + p.x + "," + p.y);
  p.x = +p.x.toFixed(2);
  p.y = +p.y.toFixed(2);
  return p;
}  

