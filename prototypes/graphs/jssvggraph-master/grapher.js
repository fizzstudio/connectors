function Graph( canvas_name, width, height ) {
  this.svg = "http://www.w3.org/2000/svg";
  this.canvas = document.getElementById(canvas_name);
  this.width = width;
  this.height = height;
  this.canvas.style.width = width + "px";
  this.canvas.style.height = height + "px";
  this.nodes = {};
  this.node_count = 0;
  this.force_x = {};
  this.force_y = {};
  this.stepsize = 0.0005;
  this.iteration = 0;
  this.task = null;

  // tunables to adjust the layout
  this.repulsion = 200000; // repulsion constant, adjust for wider/narrower spacing
  this.spring_length = 20; // base resting length of springs
}

Graph.prototype.create_node = function( name, box_style, text_style, x, y ) { // TODO: should support separate id and name 
  // create an SVG rectangle, attach additional attributed to it
  var node = document.createElementNS(this.svg, "rect");

  if (!box_style) {
  	box_style = "fill: #222; stroke-width: 1px;";
  }

  node.setAttribute("style", box_style );
  node.setAttribute("rx", "10px"); // round the connectors
  // random placement with a 10% margin at the connectors
  node.pos_x = Math.random() * (this.width * 0.8) + (this.width * 0.1);
  if ( x ) {
  	// console.info("x:", x);
  	node.pos_x = x;
  }

  node.pos_y = (Math.random() * (this.height * 0.8)) + (this.height * 0.1);
  if ( y ) {
  	// console.info("y:", y);
  	node.pos_y = y;
  }

  // node.pos_x = 0.5 * (this.width * 0.8) + (this.width * 0.1);
  // node.pos_y = (0.5 * (this.height * 0.8)) + (this.height * 0.1);
  node.prev_x = node.pos_x;
  node.prev_y = node.pos_y;
  node.setAttribute("x", node.pos_x );
  node.setAttribute("y", node.pos_y );
  node.connectors = new Array();
  this.canvas.appendChild(node);
  
  // text label
  if (!text_style) {
  	text_style = "fill: #fff; stroke-width: 1px;";
  }
  node.name = name;
  node.textLabel = document.createElementNS(this.svg, "text");
  node.textLabel.setAttribute("style", text_style);
  node.textLabel.appendChild( document.createTextNode( name ) );  
  this.canvas.appendChild( node.textLabel );
  
  // get the size of the rectangle from the text label's bounding box
  node.h = node.textLabel.getBBox().height + 10;
  node.w = node.textLabel.getBBox().width + 10;
  node.setAttribute("height", node.h + "px");
  node.setAttribute("width", node.w + "px");

  this.nodes[name] = node;
  this.node_count++;

  return node;
}

Graph.prototype.create_connector = function( a, b, style ) {
  var line = document.createElementNS(this.svg, "path");
  if( style === undefined ) {
    style = "stroke: #444; stroke-width: 3px;";
  }
  line.setAttribute("style", style);
  this.canvas.insertBefore(line, this.canvas.firstChild);
  this.nodes[a].connectors[b] = { "dest" : b, "line": line };
  this.nodes[b].connectors[a] = { "dest" : a, "line": line };
}

Graph.prototype.update_layout = function() {
  var stable = true;
  // var stable = false;
  var stability_tolerance = 0.25; // might want to make this a percentage, or increase if there are many nodes
  var max_iterations = this.node_count * 30; // might want to make this a multiple of the number of nodes
  
  for (node_1 in this.nodes) {
    this.force_x[node_1] = 0;
    this.force_y[node_1] = 0;
    for (node_2 in this.nodes) {
      if( node_1 !== node_2 ) {
        // using rectangle's center, bounding box would be better
        var deltax = this.nodes[node_2].pos_x - this.nodes[node_1].pos_x;
        var deltay = this.nodes[node_2].pos_y - this.nodes[node_1].pos_y;
        var distance_2 = (deltax * deltax) + (deltay * deltay);

        // // add some jitter if distance^2 is very small
        // if( 0.01 > distance_2 ) {
        //   deltax = 0.1 * Math.random() + 0.1;
        //   deltay = 0.1 * Math.random() + 0.1;
        //   distance_2 = deltax * deltax + deltay * deltay;
        // }

        // Coulomb's law: repulsion varies inversely with square of distance
        this.force_x[node_1] -= (this.repulsion / distance_2) * deltax;
        this.force_y[node_1] -= (this.repulsion / distance_2) * deltay;

        // spring force along connectors, follows Hooke's law
        if( this.nodes[node_1].connectors[node_2] ) {
          var distance = Math.sqrt(distance_2);
          this.force_x[node_1] += (distance - this.spring_length) * deltax;
          this.force_y[node_1] += (distance - this.spring_length) * deltay;
        }
      }
    }
  }

  for (node_1 in this.nodes) {
    // update rectangles
    var each_node = this.nodes[node_1];
    each_node.pos_x += this.force_x[node_1] * this.stepsize;
    each_node.pos_y += this.force_y[node_1] * this.stepsize;
    each_node.setAttribute("x", each_node.pos_x );
    each_node.setAttribute("y", each_node.pos_y );
    // update labels
    each_node.textLabel.setAttribute("x", each_node.pos_x + 5 + "px");
    each_node.textLabel.setAttribute("y", each_node.pos_y + (2*each_node.h/3 )+ "px");

    // the graph is considered stable if no node has shifted more than 
    //   the stability tolerance distance on an iteration
    var x_diff = Math.abs( each_node.prev_x - each_node.pos_x );
    var y_diff = Math.abs( each_node.prev_y - each_node.pos_y );
    // console.info(x_diff, y_diff)
    if ( ( stability_tolerance < x_diff)
      || ( stability_tolerance < y_diff) ) {
      each_node.prev_x = each_node.pos_x;
      each_node.prev_y = each_node.pos_y;
      stable = false;
    }

    // update connectors
    for (node_2 in each_node.connectors) {
      each_node.connectors[node_2].line.setAttribute("d", 
        "M"+(each_node.pos_x+(each_node.w/2))
          +","+(each_node.pos_y+(each_node.h/2))
        +" L"+(this.nodes[each_node.connectors[node_2].dest].pos_x
          +(this.nodes[each_node.connectors[node_2].dest].w/2))
        +" "+(this.nodes[each_node.connectors[node_2].dest].pos_y
          +(this.nodes[each_node.connectors[node_2].dest].h/2)));
    }
  }
  this.iteration++;

  // if graph is stable, or is still not stable after N iterations, stop layout
  if( stable || max_iterations < this.iteration ) {
    console.info(stable, this.iteration)
    this.quit();
  } 
}

Graph.prototype.go = function() {
  // already running
  if (this.task) {
    return;
  }
  obj = this;
  this.iteration = 0;
  this.task = window.setInterval(function(){ obj.update_layout(); }, 1);
}

Graph.prototype.quit = function() {
  window.clearInterval(this.task);
  this.task = null;
}