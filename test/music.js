/*global jQuery:true, playerjs:true, $Player:true */
(function($, document, window){

    var URLS = [
      'https://soundcloud.com/smallenginerepair/serve-yourself-1'
    ];
    var IFRAMES = [
        '<iframe class="embedly-embed" src="//cdn.embedly.com/widgets/media.html?src=https%3A%2F%2Fw.soundcloud.com%2Fplayer%2F%3Fvisual%3Dtrue%26url%3Dhttps%253A%252F%252Fapi.soundcloud.com%252Ftracks%252F120422553%26show_artwork%3Dtrue&url=https%3A%2F%2Fsoundcloud.com%2Fsmallenginerepair%2Fserve-yourself-1&image=http%3A%2F%2Fi1.sndcdn.com%2Fartworks-000062914786-jz7eos-t500x500.jpg&key=internal&type=text%2Fhtml&schema=soundcloud" width="500" height="500" scrolling="no" frameborder="0" allow="autoplay; fullscreen" allowfullscreen="true"></iframe>'
    ]
    var t = '<iframe src="https://open.spotify.com/embed/track/3Q3myFA7q4Op95DOpHplaY" width="300" height="380" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>'
    var $tracks = $('#tracks'),
      players = [],
      count = 0,
      isReady = false;
  
    var start = function(){
      var index = 0;
  
      var multi = new $Player(players);
  
      // Set the callout.
      multi.on('active', function(index){
        $('.panel').removeClass('callout').eq(index).addClass('callout');
      });
  
      // Go to a track by clicking on it.
      $('.panel').on('click', function(){
        if (!isReady){
          return false;
        }
        var index = $('.panel').index(this);
        multi.play(index);
        return false;
      });
  
      isReady = true;
    };
  
    // We need to wait for all the players to be ready before we go.
    var onReady = function(){
      count++;
      if (count === URLS.length){
        start();
      }
    };
  
    $(document).on('ready', function(){
        const iframe = document.createElement('iframe');
        iframe.src = t;
        document.body.appendChild(iframe);
        var player = new playerjs.Player(iframe);
        players.push(player);
            player.on('ready', function(){
              player.unmute();
            //   onReady();
              player.on('play', () => {
                  console.log("play");
              })
              player.play();
            });
            

      // Go get all the URLS from embedly and then embed them.
    //   $.embedly.oembed(URLS, {query:{better: true} })
    //     .done(function(results){
    //       $.each(results, function(i, obj){
    //         $tracks.append(['<li class="track">',
    //           '<div class="panel">',
    //             '<div class="row">',
    //               '<div class="large-3 medium-3 small-3 columns">',
    //                 '<img src="'+obj.thumbnail_url+'" />',
    //               '</div>',
    //               '<div class="large-9 medium-9 small-9 columns">',
    //                 '<h4>'+obj.title+'</h4>',
    //                 '<p>'+obj.description+'</p>',
    //               '</div>',
    //             '</div>',
    //             '<div class="iframe">'+obj.html+'</div>',
    //           '</div>',
    //         '</li>'].join(' '));
    //       });
  
          // grab the iframes and create players from them.
        //   $(IFRAMES).each(function(i, e){
        //     var player = new playerjs.Player(e);
        //     players.push(player);
        //     player.on('ready', function(){
        //       player.unmute();
        //     //   onReady();
        //       player.on('play', () => {
        //           console.log("play");
        //       })
        //     });
        //   });
        // });
  
    });
  
  })(jQuery, document, window);