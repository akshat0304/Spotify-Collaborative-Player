$(document).ready(function() {
	$('.searchBar').select2({
		placeholder: "Search for People",
		allowClear: true,
		width: 'resolve', 
		//templateResult: formatState,
		// ajax: {
		// 	url: "searchSongs",
		// 	type: "get",
		// 	processResults: function(data) {
		// 		// console.log(data)
		// 		return {
  //           		results: $.map(data.results, function (item) {
  //           			console.log(item.url)
  //               		return {
  //                   		text: item.name, 
  //                   		id: item.id, 
  //                   		image_url: item.url
  //               		}
  //           		})
  //       		};
		// 	}
		// },
	


	});
}),