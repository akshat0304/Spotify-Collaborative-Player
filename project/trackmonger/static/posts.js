var last_update = new Date(1);
var last_refresh = last_update.toISOString();

function getPosts() {
   
    $.ajax({
        url: "getPosts",
        type: "get", //send it through get method
        data: { 
        date: last_refresh, 
      },
      success: function(data) {
        now = new Date()
        last_refresh = now.toISOString()
        updatePosts(data)
        }
    });
}


function updatePosts(data) {
	console.log(data)
	posts = data['posts']
	for (var i = 0; i < posts.length; i++) {
		post = posts[i]
		console.log(post)
	
        var parent = document.getElementById("postarea");
                var newItem = document.createElement('div');
		 var d = new Date(post["time"]);
        	d = d.toString();
        	d = d.slice(0, 25);
                newItem.innerHTML = '<div class="card ml-4 mt-4 mr-4 shadow-lg" style = "background:linear-gradient(to right, #da4453, #89216b);"> \
				<div class = "row"> \
					<div class = "col-lg-2 col-md-2 col-sm-2 col-xs-2"> <img class = "d-inline float-left mt-1 ml-1 " src = "https://34.238.50.153/profileimage/' + post['user_id'] + '" style="width:110px;height:110px;"> \
					</div> \
					<div class = "col-lg-10 col-md-10 col-sm-10 col-xs-10">	\
						<div class="card-body"> \
							<div class = "row">	\
							<div class = "col-lg-8 col-md-8 col-sm-8 col-xs-8">	\
							<h6 class="card-title" style = "color:white;">New Playlist Posted by <a href = "https://34.238.50.153/profile/' + post['user_id'] +'">' + post['name'] + '</a></h6>	\
							</div>	\
							<div class = "col-lg-4 col-md-4 col-sm-4 col-xs-4">	\
							<h6 style = "color:white;"> '+ d + '</h6>	\
						</div>	\
							</div>	\
							<p class="card-text" style = "color:white;">' + post['content'] + '</p>	<div class="card shadow-lg rounded" style = "background:linear-gradient(to right, #000000, #434343);">	\
						<div class = "row"> \
							<div class ="col-lg-2 col-md-2 col-sm-2 col-xs-2"> \
								<img class = "d-inline float-left ml-1 mt-1 mb-1 " src = "https://34.238.50.153/photo/' + post['playlist_id'] + '" style="width:60px;height:60px;"> \
							</div> \
							<div class ="col-lg-4 col-md-4 col-sm-4 col-xs-4 mt-4" style = "color:white;">' + post['playlist_name'] + 
							'</div> \
							<a class = "col-lg-1 col-md-1 col-sm-1 col-xs-1" href="https://34.238.50.153/playlist/' + post['playlist_id'] + '"> <i class="fas fa-external-link-square-alt fa-2x mt-3" style = "color:white;"></i> \
							</a> \
							<div class = "col-lg-1 col-md-1 col-sm-1 col-xs-1"> \
								<i class="fas fa-arrow-up fa-2x mt-3" style = "color:green;"></i> \
							</div> \
							<div class = "col-lg-1 col-md-1 col-sm-1 col-xs-1"> \
								<h3 class = "mt-3" style = "color:green;">' + post['upvotes'] + '</h3> \
							</div> \
							<div class = "col-lg-1 col-md-1 col-sm-1 col-xs-1"> \
								<i class="fas fa-arrow-down fa-2x mt-3" style = "color:red;"></i> \
							</div> \
							<div class = "col-lg-1 col-md-1 col-sm-1 col-xs-1"> \
								<h3 class = "mt-3 mr-3" style = "color:red;">' + post['downvotes'] + '</h3> \
							</div> \
						</div> \
					</div> \
				</div>\
						</div>\
					</div> \
				</div> \
				<div class = "row"> \
					<div class = "col-lg-1 col-md-1 col-sm-1 col-xs-1"> \
					</div> \
					<div class = "col-lg-10 col-md-10 col-sm-10 col-xs-10"> \
				<div class = "col-lg-1 col-md-1 col-sm-1 col-xs-1"> \
					</div> \
				</div> \
			</div>' 
		parent.prepend(newItem);
    }

}

window.onload = getPosts
window.setInterval(getPosts, 5000);

function goToProfile() {
    var x = $("#searchPeople").val();
    console.log("here", x[0])
    window.location.replace("https://34.238.50.153/profile/" + x[0]);

    $('.searchPeople').val(null).trigger('change');
}

$(document).ready(function() {
  $('.searchPeople').select2({
    placeholder: "Search for People",
    allowClear: true,
    width: 'resolve', 
    ajax: {
      url: "searchPeople",
      type: "get",
      processResults: function(data) {
        // console.log(data)
        return {
                results: $.map(data.results, function (item) {
                  console.log(item.username)
                    return {
                        text: item.username, 
                        id: item.id
                    }
                })
            };
      }
    },
  });

});
