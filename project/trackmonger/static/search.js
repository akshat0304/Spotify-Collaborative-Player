var last_update = new Date(1);
var last_refresh_home = last_update.toISOString();
var notPlaylist = false

var ready = false
var songChosen = false
var currSong = ""
var clicked = false
var playingFromCurr = false
var currPlaylist = ""

function formatState (state) {
		if (!state.image_url) {
			return state.text;
		}
		var $state = $(
				"<div style='display:inline-block;vertical-align:top;'> <img src='" + state.image_url + "' style='width:60px;height:60px'/> </div> <div style='display:inline-block;'> <div>" + state.text + "</div> "
			);

	

		return $state;
};

function formatState1 (state) {
    var $state = $(
        "<div style='display:inline-block;vertical-align:top;'> <img src='" + state.image_url + "' style='width:60px;height:60px'/> </div> <div style='display:inline-block;'> <div>" + state.text + "</div> "
      );

  

    return $state;
};

function getCSRFToken() {
    var cookies = document.cookie.split(";");
    for (var i = 0; i < cookies.length; i++) {
        c = cookies[i].trim();
        if (c.startsWith("csrftoken=")) {
            return c.substring("csrftoken=".length, c.length);
        }
    }
    return "unknown";
}

var token;

function getNewToken() {
  $.ajax({
            url: "getToken",
            type: "get", 
              success: function(data) {
                token = data["token"]
                }
            });
}

function submit() {
    var x = $("#searchBar").val();
    $.ajax({
            url: "addSongs",
            type: "post", 
            data: { 
                ids: x,
                playlist: document.location.pathname,
                csrfmiddlewaretoken: getCSRFToken()
            },
          success: function(data) {
            updatePlaylist(data)
            }
    });
    $('.searchBar').val(null).trigger('change');

}

function addCollab() {
    var x = $("#searchPeople").val();
    $.ajax({
            url: "addCollab",
            type: "post", 
            data: { 
                ids: x,
                playlist: document.location.pathname,
                csrfmiddlewaretoken: getCSRFToken()
            },
    });
    $('.searchPeople').val(null).trigger('change');
}

function getSongs() {
    $.ajax({
            url: "getSongs",
            type: "get", 
            data: { 
                playlist: document.location.pathname,
            },
          success: function(data) {
            updatePlaylist(data)
            }
    });
}

function upVoteClicked() {
   var up = document.getElementById("upvote");
  var down = document.getElementById("downvote")
   $.ajax({
            url: "upVotePlaylist",
            type: "post", 
            data: {
                playlist: document.location.pathname,
                csrfmiddlewaretoken: getCSRFToken()
            },
            success: function(data) {
              down.innerHTML = data["downvote"]
              up.innerHTML = data['upvote']
            }
    });
}
function downVoteClicked() {
  var up = document.getElementById("upvote");
  var down = document.getElementById("downvote")
   $.ajax({
            url: "downVotePlaylist",
            type: "post", 
            data: {
                playlist: document.location.pathname,
                csrfmiddlewaretoken: getCSRFToken()
            },
            success: function(data) {
              down.innerHTML = data["downvote"]
              up.innerHTML = data['upvote']
            }
    });
}
function unfollowClicked() {
  var elem = document.getElementById("checkButton")
  $.ajax({
            url:"unfollowPlaylist",
            type: "post",
            data: {
              playlist: document.location.pathname,
              csrfmiddlewaretoken: getCSRFToken()
            },
            success: function(data) {
              elem.innerHTML = data['con'];
            }
  });
}
function followClicked() {
  var elem = document.getElementById("checkButton")
  $.ajax({
            url:"followPlaylist",
            type: "post",
            data: {
              playlist: document.location.pathname,
              csrfmiddlewaretoken: getCSRFToken()
            },
            success: function(data) {
              elem.innerHTML = data['con'];
            }
  });
}
function deleteClicked(id) {
    var track = document.getElementById(id);
    var parent = document.getElementById("playlist")
    parent.removeChild(track)
    $.ajax({
            url: "deleteSong",
            type: "get", 
            data: {
                track: id,
                playlist: document.location.pathname,
            },
    });
}

function getPosts() {
 $.ajax({
            url: "getPosts",
            type: "get", 
            data: {
                playlist: document.location.pathname,
            },
            success: function(data) {
              up.innerHTML = data["upvote"]
              down.innerHTML = data["downvote"]
            }
    });
}

function getVotes() {
  var up = document.getElementById("upvote");
  var down = document.getElementById("downvote")
  $.ajax({
            url: "getVotes",
            type: "get", 
            data: {
                playlist: document.location.pathname,
            },
            success: function(data) {
              up.innerHTML = data["upvote"]
              down.innerHTML = data["downvote"]
            }
    });

}

function getViews() {
  var views = document.getElementById("views");
  $.ajax({
            url: "getViews",
            type: "get", 
            data: {
                playlist: document.location.pathname,
            },
            success: function(data) {
              views.innerHTML = data["views"]
            }
    });
}

function updatePlaylist(data) {
    var urls = data['info']
    var parent = document.getElementById("playlist");
    for (var i = 0; i < urls.length; i++) {
        res = '<div id="' + urls[i]['uri'] + '" class = "container mt-2" style = "background:linear-gradient(to right, #c31432, #240b36); border-radius:25px"> \
        <div class = "row"><div class = "col-lg-1 col-md-1 col-sm-1 col-xs-1" style="margin-top:10px;""><button class="play_button" id="' + urls[i]['uri'] + 'p" onclick = "clickedHere(this)"></button> \
          </div><div class = "col-lg-8 col-md-8 col-sm-8 col-xs-8"><div class = "container mt-2 mb-2 pr-2"> \
          <div style="display:inline-block;vertical-align:top;width:800px;""> <img src="' + urls[i]['image'] + '" align="left" style="width:60px;height:60px"/> <div style="margin-left:70px;">' + urls[i]['name'] + '<br>' + urls[i]['artist'] + '</div> </div> </div> </div>  <div class = "col-lg-1 col-md-1 col-sm-1 col-xs-1" style="float: right;width:100%; margin-top:20px"><button style="background-color: Transparent; border: None"><i id="' + urls[i]['uri'] + '" onclick="deleteClicked(this.id)" class="fas fa-trash-alt fa-2x" style="color:white;"> </i> </button> </div> \
        </div> \
      </div> ' 
        
	var newItem = document.createElement('div');
	var musicBtn = document.getElementById('play-music')
	var state = (musicBtn.className == "play_button") ? true : false;
        newItem.id = urls[i]['uri']
        newItem.innerHTML = res
        
	parent.append(newItem)
	var btn = document.getElementById(newItem.id + 'p')
              if (state && newItem.id == currSong && currPlaylist == document.location.pathname) {
                $(btn).toggleClass("paused")
              }
    }

}

function clickedHere(event) {
  playingFromCurr = true
  id = event.id.slice(0, event.id.length - 1)
  var music_button = document.getElementById("play-music");

  $(event).toggleClass("paused");
  if (ready && id != currSong) {
    if (currSong != "") {
      btn_id = currSong + 'p'
      var btn = document.getElementById(btn_id)
      if (btn != null && currPlaylist == document.location.pathname) {
        if (btn.className == "play_button paused") {
          $(btn).toggleClass("paused")
        }
      }
    }
    currPlaylist = document.location.pathname
    currSong = id;
    playNewSong(id, true);
    if (music_button.className == "play_button") {
      $(music_button).toggleClass("paused");
    }
  }
  else if (ready && id == currSong) {
    if (currPlaylist != document.location.pathname) {
      currPlaylist = document.location.pathname
      currSong = id;
      playNewSong(id, true);
    if (music_button.className == "play_button") {
      $(music_button).toggleClass("paused");
    }
    }
    else if (event.className == "play_button") {
      player.pause().then(() => {
      console.log("paused");
      });
      $(music_button).toggleClass("paused")
    }
    else {
      $(music_button).toggleClass("paused")
       player.resume().then(() => {
        console.log("resumed");
      });
    }
  }
}

function upvoteClicked() {
}
function pauseClicked() {
  player.pause().then(() => {
    console.log("paused");
  });
}
function playNewSong(uri, pause) {
  

  isUpdate = true;
  play({
              playerInstance: player,
              spotify_uri: uri,
            });
  if (!pause) {
    return;
  }

  $.ajax({
            url: "addArtistGenre",
            type: "post", 
            data: { 
                songPlaying: currSong,
                playlist: document.location.pathname,
                csrfmiddlewaretoken: getCSRFToken()
            },
    });
  
}

function resetSlider() {
  slider.noUiSlider.reset();
  var check = parseInt(trackDuration/1000);
  slider.noUiSlider.updateOptions({
    range : {
      'min' : 0,
      'max' : check
    }
  });
}
function playClicked(event) {
  if (event.className == "play_button") {
    if (currSong != "") {
      $(event).toggleClass("paused")
      player.resume().then(() => {
        console.log("resumed");
      });
      if (currPlaylist == document.location.pathname) {
        btn_id = currSong + 'p'
        var btn = document.getElementById(btn_id)
        $(btn).toggleClass("paused")
    }

    }
  }
  else if (event.className == "play_button paused") {
    $(event).toggleClass("paused")
     player.pause().then(() => {
    if (currPlaylist == document.location.pathname) {
    btn_id = currSong + 'p'
    var btn = document.getElementById(btn_id)
     $(btn).toggleClass("paused")
   }
    });
  }
  // play({
  //             playerInstance: player,
  //             spotify_uri: 'spotify:track:37b1KAbfOZeBzeMB0LGO3g',
  //           });
}
function getUpdates() {
    var parent = document.getElementById("playlist");
    const list = parent.childNodes;
    $.ajax({
        url: "getSongs", 
        type: "get", 
        data: { 
          playlist: document.location.pathname,
        },
        success: function(data) {
          urls = data["info"]
	  if (!data["isCollaborating"]){
	var elem = document.getElementById("playlist");
	  var state = sortable.option("disabled");
	sortable.option("disabled", !state);
	//$('#playlist').sortable('disable');  
	}
          var i = 1;
          var j = 0;
          var remove = []
          while (i < list.length && j < urls.length) {
            if (list[i].id != urls[j]['uri']) {
              remove.push(list[i])
              i++;
            }
            else {
              i++;
              j++;
            }

          }

          if (i == list.length && j != urls.length) {
            for (var k = 0; k < remove.length; k++) {
              parent.removeChild(remove[k])
            }
            for (var m = j; m < urls.length; m++) {
              var newItem = document.createElement('div');
              newItem.id = urls[m]['uri']
              res = '<div id="' + urls[m]['uri'] + '" class = "container mt-2" style = "background:linear-gradient(to right, #c31432, #240b36); border-radius:25px"> \
        <div class = "row"><div class = "col-lg-1 col-md-1 col-sm-1 col-xs-1" style="margin-top:10px;""><button class="play_button" id="' + urls[m]['uri'] + 'p" onclick = "clickedHere(this)"></button> \
          </div><div class = "col-lg-8 col-md-8 col-sm-8 col-xs-8"><div class = "container mt-2 mb-2 pr-2"> \
          <div style="display:inline-block;vertical-align:top;width:800px;""> <img src="' + urls[m]['image'] + '" align="left" style="width:60px;height:60px"/> <div style="margin-left:70px;">' + urls[m]['name'] + '<br>' + urls[m]['artist'] + '</div> </div> </div> </div>  <div class = "col-lg-1 col-md-1 col-sm-1 col-xs-1" style="float: right;width:100%; margin-top:20px"><button style="background-color: Transparent; border: None"><i id="' + urls[m]['uri'] + '" onclick="deleteClicked(this.id)" class="fas fa-trash-alt fa-2x" style="color:white;"> </i> </button> </div> \
        </div> \
      </div> ' 
              newItem.innerHTML = res
              parent.append(newItem)
		var musicBtn = document.getElementById('play-music')
	var state = (musicBtn.className == "play_button") ? false : true;
		var btn = document.getElementById(newItem.id + 'p')
              if (state && newItem.id == currSong && currPlaylist == document.location.pathname) {
                $(btn).toggleClass("paused")
              }


              

            }
          }
          if (j == urls.length && i != list.length ){
            for (var m = i; m < list.length; m++) {
              remove.push(list[m])
            }
            for (var m = 0; m < remove.length; m++) {
              parent.removeChild(remove[m])
            }

          }
          if (j == urls.length && i == list.length) {
            for (var m = 0; m < remove.length; m++) {
              parent.removeChild(remove[m])
            }

          }

        }
    })
}
var slider;
var trackPosition;
var trackDuration;
var isUpdate;

function setTimeRemaining(position) {
  var time = document.getElementById("time-remaining");
  var rem = parseInt(trackDuration/1000) - parseInt(position);
  var  restime = parseInt(rem % 60);
  var finalmin;
  if (restime < 10) {
    finalmin = ":0" + restime; 
  }
  else {
    finalmin = ":" + restime;
  }  
  time.innerHTML = parseInt(rem/60) + finalmin;
}

function setSliderTimeVal(position) {

  setTimeRemaining(position/1000);
  slider.noUiSlider.set(position/parseFloat(1000));
}
function updateSliderVal() {
  if (isUpdate) {
  var val = slider.noUiSlider.get();
  setTimeRemaining(val);
  // var time = document.getElementById("time-remaining");
  // time.innerHTML = parseInt(trackDuration/1000) - val; 
  var add = parseFloat(100)/parseFloat(trackDuration/parseFloat(1000));
  var test = parseFloat(val) + parseFloat(1);
  slider.noUiSlider.set(test);
  if (trackDuration/1000 - test < 0.7) {
    findNextSong();
  }
}
}

function findNextSong() {
  var name = ""
  var music_button = document.getElementById("play-music");

  if (playingFromCurr) {
    name = document.location.pathname
  }
  else {
    name = currPlaylist
  }
   $.ajax({
            url: "getSongs",
            type: "get", 
            data: { 
                playlist: name,
            },
          success: function(data) {
            var tracks = data["info"]
            var found = false;
            for (var i = 0; i < tracks.length; i++) {
              if (tracks[i]['uri'] == currSong) {
                console.log("found")
                found = true;
                break;
              }
            }
            var uri = ""
            if (found && i + 1 < tracks.length) {
              uri = tracks[i+1]['uri']
              var btn_id = uri + 'p'
              var btn = document.getElementById(btn_id)
 	      if (currPlaylist == document.location.pathname) {
		clickedHere(btn);
		return
	      }
		    
	      playClicked(music_button);
	      
              currSong = uri
              playNewSong(uri, true);
              playClicked(music_button);
              // clickedHere(btn)
            }
            else if (found && i + 1 >= tracks.length) {
              uri = tracks[0]['uri']
              var btn_id = uri + 'p'
              var btn = document.getElementById(btn_id)
	       if (currPlaylist == document.location.pathname) {
		clickedHere(btn);
		return
	       }
	      
	      
	      playClicked(music_button);
              
              currSong = uri
	      playNewSong(uri, true);
              playClicked(music_button);
              // clickedHere(btn)
            }
            
          }
    });
}


function getCurrentTrack() {
  var track = player.getCurrentState().then(state => {
  if (!state) {
    return null;
  }

  let {
    current_track,
    next_tracks: [next_track]
  } = state.track_window;

  return current_track;
});

  return track;
}

var sortable;
$(document).ready(function() {

  
  // slider = document.getElementById('slider');
  // window.setInterval(setSliderVal, 1000);
  // isUpdate = true;
  // noUiSlider.create(slider, {
  //     start: 0,
  //     connect: true,
  //     range: {
  //         'min': 0,
  //         'max': 100
  //     }
  // });
  // slider.noUiSlider.on('slide', function () {isUpdate = false});
  // slider.noUiSlider.on('change', function() {isUpdate = true});

//   slider = document.getElementById('slider');
//   window.setInterval(setSliderVal, 1000);

//   noUiSlider.create(slider, {
//       start: 0,
//       connect: true,
//       range: {
//           'min': 0,
//           'max': 100
//       }
//   });

//   $('#comments-container').comments({
//     getComments: function(success, error) {
//         var commentsArray = [{
//             id: 1,
//             created: '2015-10-01',
//             content: 'Lorem ipsum dolort sit amet',
//             fullname: 'Simon Powell',
//             enableReplying: false,
//             enableEditing: false,
//             enableDeleting: false
//         }];
//         success(commentsArray);
//     }
// });
	var sortablelist = document.getElementById('playlist');
	sortable = Sortable.create(sortablelist, {
        animation : 150,
        onMove: function(evt) {
		return evt.related.className.indexOf('disabled') === -1;
	},
	onSort: function(evt) {
            list = evt.to.childNodes;
            var req = []
            for (var i = 1; i < list.length; i++) {
              req.push(list[i].id)
            }
            $.ajax({
              url: "changedOrder", 
              type: "post", 
              data: { 
                order: req,
                playlist: document.location.pathname,
                csrfmiddlewaretoken: getCSRFToken()
              },
 	      success: function(data) {
            }})
        }
    });
	$('.searchBar').select2({
		placeholder: "Search for Song",
		allowClear: true,
		width: 'resolve', 
		templateResult: formatState,
		ajax: {
			url: "searchSongs",
			type: "get",
			processResults: function(data) {
				return {
            		results: $.map(data.results, function (item) {
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
  $('.searchPeople').select2({
    placeholder: "Search for People",
    allowClear: true,
    width: 'resolve', 
    ajax: {
      url: "searchPeople",
      type: "get",
      processResults: function(data) {
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
  $('.searchPeople').on('select2:select', function (e) {
    var data = e.params.data;
  });
  $('#upvote').click(function(event) {
  });
});


var player;
var play = ({
  spotify_uri,
  playerInstance: {
    _options: {
      getOAuthToken,
      id
    }
  }
}) => {
  getOAuthToken(access_token => {
    fetch(`https://api.spotify.com/v1/me/player/play?device_id=${id}`, {
      method: 'PUT',
      body: JSON.stringify({ uris: [spotify_uri] }),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`
      },
    });
  });
};
var prevTrack;

window.onSpotifyWebPlaybackSDKReady = () => {
            
          getNewToken();
          player = new Spotify.Player({
            name: 'Web Playback SDK Quick Start Player',
            volume : 1.0,
            getOAuthToken: cb => { cb(token); }
          });
    
          // Error handling
          player.addListener('initialization_error', ({ message }) => { console.error(message); });
          player.addListener('authentication_error', ({ message }) => { console.error(message); });
          player.addListener('account_error', ({ message }) => { console.error(message); });
          player.addListener('playback_error', ({ message }) => { console.error(message); });
    
          // Playback status updates
          player.addListener('player_state_changed', ({
          paused,
          position,
          duration,
          track_window: { current_track }}) => {
            console.log('Currently Playing', current_track);
            console.log('Position in Song', position);
            console.log('Duration of Song', duration);
            trackPosition = position;
            trackDuration = duration;
            console.log("check", trackPosition, trackDuration)
            if (prevTrack != current_track.uri) {
              resetSlider();
              isUpdate = true;
              prevTrack = current_track.uri;
              var thumb = document.getElementById("currently-playing-image");
              thumb.src = current_track.album.images[0].url;
              var title = document.getElementById("current-song");
              title.innerHTML = current_track.name + "<br>" + current_track.artists[0].name;
              // var music_button = document.getElementById("play-music");
              // $(music_button).toggleClass("paused")

            }
            else if (paused) {
              isUpdate = false;
              setSliderTimeVal(position);
            }
            else {
              isUpdate = true;
              setSliderTimeVal(position);
            }
          });
    
          // Ready
          var music_button = document.getElementById("play-music");

          player.addListener('ready', ({ device_id }) => {
            console.log('Ready with Device ID', device_id);
            var name = document.location.pathname
              notPlaylist = true
              $.ajax({
              url: "getCurrentSong",
              type: "get", 
            success: function(data) {
              currSong = data['uri'];
              if (currSong != "") {
                playNewSong(data['uri'], false);
		     
		     
		setTimeout(function(){ 
                 setSliderTimeVal(data['time'] * 1000)
		    
		    
                      player.seek(data['time'] * 1000).then(() => {
                 });}, 600);
		 setTimeout(function(){
			playClicked(music_button);
		},1000); 
	

		      
		      
        currPlaylist = data['currPlaylist']
		                
		if (!data['state']) {
			playClicked(music_button);
		}


		playingFromCurr = (currPlaylist == document.location.pathname) ? true : false;
                btn_id = currSong + 'p'
                var btn = document.getElementById(btn_id)
		
                if (data['state'] && btn != null && currPlaylist == document.location.pathname) {
                  if (btn.className == "play_button") {
                    //$(btn).toggleClass("paused")
                  }
                }
                
              }
          }
            
    });

            ready = true
          });
    
          // Not Ready
          player.addListener('not_ready', ({ device_id }) => {
            console.log('Device ID has gone offline', device_id);
          });
    
          // Connect to the player!
          player.connect();
          slider = document.getElementById('slider');
  window.setInterval(updateSliderVal, 1000);
  // window.setInterval(setTimeRemaining,1000);
  // isUpdate = true;
  noUiSlider.create(slider, {
      start: 0,
      connect: true,
      range: {
          'min': 0,
          'max': 100
      }
  });
  slider.noUiSlider.on('slide', function () {isUpdate = false});
  slider.noUiSlider.on('start', function () {isUpdate = false});
  slider.noUiSlider.on('change', function() {
    var currVal = slider.noUiSlider.get();
    player.seek(currVal * 1000).then(() => {
    })
  });
          

  };

window.onload = getSongs
window.setInterval(getUpdates, 5000)
window.setInterval(getVotes, 5000)
window.setInterval(getViews,5000)
window.setInterval(getNewToken, 10 * 60 * 1000)

window.onunload = function(event) { 
  var music_button = document.getElementById("play-music");
  var state = 1
  if (music_button.className == "play_button") {
  	state = 0
  }
  var name = ""
  if (playingFromCurr) {
    name = document.location.pathname
  }
  else {
    name = currPlaylist
  }
  $.ajax({
            url: "currentSong",
            type: "post", 
            data: {
                playlist: name,
                uri: currSong, 
                csrfmiddlewaretoken: getCSRFToken(),
                sliderVal: slider.noUiSlider.get(),
                status: state,
            },
    });
};



