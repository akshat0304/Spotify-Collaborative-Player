function formatState (state) {
		// console.log("pls")

		if (!state.image_url) {
			return state.text;
		}
		var $state = $(
				"<div style='display:inline-block;vertical-align:top;'> <img src='" + state.image_url + "' style='width:60px;height:60px'/> </div> <div style='display:inline-block;'> <div>" + state.text + "</div> "
			);

	

		return $state;
};

$(document).ready(function() {
	console.log("done")
	$('.js-example-basic-single').select2({
		placeholder: "Search for Song",
		allowClear: true,
		width: 'resolve', 
		templateResult: formatState,
		ajax: {
			url: "searchSongs",
			type: "get",
			processResults: function(data) {
				// console.log(data)
				return {
            		results: $.map(data.results, function (item) {
            			console.log(item.url)
                		return {
                    		text: item.name, 
                    		id: item.id, 
                    		image_url: item.url
                		}
            		})
        		};
			}
		},
	


	});
});