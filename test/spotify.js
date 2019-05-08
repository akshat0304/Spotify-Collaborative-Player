//import { Draggable } from '@shopify/draggable';
// import { Sortable } from '@shopify/draggable';
// import 'jquery-sortablejs';
$(document).ready(function() {
	console.log("done");
	$("#playlist").sortable({
		handle : '.handle',
		animation : 150,
		onSort: function(evt) {
			console.log("Changed order");
			console.log(evt.to);
		}
	});
});

console.log("created");