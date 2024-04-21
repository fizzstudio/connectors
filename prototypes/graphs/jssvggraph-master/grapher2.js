function Graph( canvas_name, width, height ) {
	this.svg = "http://www.w3.org/2000/svg";
	this.canvas = document.getElementById(canvas_name);
	this.width = width;
	this.height = height;
	this.canvas.style.width = width + "px";
	this.canvas.style.height = height + "px";
	this.nodes = {};
	this.force_x = {};
	this.force_y = {};
	this.stepsize = 0.0005;
	this.iteration = 0;
	this.task = null;

	// tunables to adjust the layout
	this.repulsion = 200000; // repulsion constant, adjust for wider/narrower spacing
	this.spring_length = 20; // base resting length of springs
}

Graph.prototype.create_node = function( name, color ) { // TODO: should support separate id and name 
	// create an SVG rectangle, attach additional attributed to it
	var node = document.createElementNS(this.svg, "rect");
	if( color === undefined ) {
		color = "#222";
	}
	node.setAttribute("style", "fill: "+color+"; stroke-width: 1px;");
	node.setAttribute("rx", "10px"); // round the connectors
	// random placement with a 10% margin at the connectors
	node.pos_x = Math.random() * (this.width * 0.8) + (this.width * 0.1);
	node.pos_y = (Math.random() * (this.height * 0.8)) + (this.height * 0.1);
	node.setAttribute("x", node.pos_x );
	node.setAttribute("y", node.pos_y );
	node.connectors = new Array();
	this.canvas.appendChild(node);
	
	// text label
	node.name = name;
	node.textLabel = document.createElementNS(this.svg, "text");
	node.textLabel.setAttribute("style", "fill: #fff; stroke-width: 1px;");
	node.textLabel.appendChild( document.createTextNode( name ) );	
	this.canvas.appendChild( node.textLabel );
	
	// get the size of the rectangle from the text label's bounding box
	node.h = node.textLabel.getBBox().height + 10;
	node.w = node.textLabel.getBBox().width + 10;
	node.setAttribute("height", node.h + "px");
	node.setAttribute("width", node.w + "px");

	this.nodes[name] = node;

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

	var start = null;
	var element = document.getElementById('SomeElementYouWantToAnimate');
	element.style.position = 'absolute';

	function step(timestamp) {
	  if (!start) start = timestamp;
	  var progress = timestamp - start;
	  element.style.left = Math.min(progress / 10, 200) + 'px';
	  if (progress < 2000) {
	    window.requestAnimationFrame(step);
	  }
	}

	window.requestAnimationFrame(step);
}


Graph.prototype.update_layout = function() {
	for (node_1 in this.nodes) {
		this.force_x[node_1] = 0;
		this.force_y[node_1] = 0;
		for (node_2 in this.nodes) {
			if( node_1 !== node_2 ) {
				// using rectangle's center, bounding box would be better
				var deltax = this.nodes[node_2].pos_x - this.nodes[node_1].pos_x;
				var deltay = this.nodes[node_2].pos_y - this.nodes[node_1].pos_y;
				var distance_2 = (deltax * deltax) + (deltay * deltay);

				// add some jitter if distance^2 is very small
				if( 0.01 > distance_2 ) {
          deltax = 0.1 * Math.random() + 0.1;
          deltay = 0.1 * Math.random() + 0.1;
					distance_2 = deltax * deltax + deltay * deltay;
        }

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
		this.nodes[node_1].pos_x += this.force_x[node_1] * this.stepsize;
		this.nodes[node_1].pos_y += this.force_y[node_1] * this.stepsize;
		this.nodes[node_1].setAttribute("x", this.nodes[node_1].pos_x );
		this.nodes[node_1].setAttribute("y", this.nodes[node_1].pos_y );
		// update labels
		this.nodes[node_1].textLabel.setAttribute("x", this.nodes[node_1].pos_x + 5 + "px");
		this.nodes[node_1].textLabel.setAttribute("y", this.nodes[node_1].pos_y + (2*this.nodes[node_1].h/3 )+ "px");
		// update connectors
		for (node_2 in this.nodes[node_1].connectors) {
			this.nodes[node_1].connectors[node_2].line.setAttribute("d", 
				"M"+(this.nodes[node_1].pos_x+(this.nodes[node_1].w/2))
					+","+(this.nodes[node_1].pos_y+(this.nodes[node_1].h/2))
				+" L"+(this.nodes[this.nodes[node_1].connectors[node_2].dest].pos_x
					+(this.nodes[this.nodes[node_1].connectors[node_2].dest].w/2))
				+" "+(this.nodes[this.nodes[node_1].connectors[node_2].dest].pos_y
					+(this.nodes[this.nodes[node_1].connectors[node_2].dest].h/2)));
		}
	}
	this.iteration++;

	if( this.iteration > 300 ) {
		// TODO: should watch for rest state, not just quit after N iterations
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