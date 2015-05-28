/*		<script type="text/javascript" src="js/paper-full.js"></script>
		<script type="text/javascript" src="js/data_structures.js"></script>
		<script type="text/paperscript" src="js/user_input.js" canvas="myCanvas"></script>
		<script type="text/paperscript" src="js/circuit_builder.js" canvas="myCanvas"></script>	*/
var js = "text/javascript";
var ps = "text/paperscript";
var mc = "myCanvas";

sources = [
	{type:js, src:"js/paper-full.js"},
	{type:js, src:"js/data_structures.js"},
	{type:ps, src:"js/user_input.js", canvas:mc},
	{type:ps, src:"js/circuit_builder.js", canvas:mc}
];

function load(index){
	var script = document.createElement("script");
	for(attribute in sources[index]){
		script[attribute] = sources[index][attribute];
		console.log(attribute, "->", sources[index][attribute]);
	}
	//script.onload = function(){
				if(sources[index+1])
					load(index+1);
	//	};
	document.body.appendChild(script);
}

window.onload = function(){load(0);};
