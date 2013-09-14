window.StoryController = {

  index: function () {
    steroids.view.navigationBar.show("Stories near Harrisburg, PA");
  },

  show: function () {

    // Fetch a value from query parameters ?id=x
    var showId = steroids.view.params["id"];
    var story = stories[showId];
    steroids.view.navigationBar.show(story.name);
    // Just to demonstrate the control flow of the application, hook your own code here
    $(function() {
      $("#story-title").text(story.name);
      $.each(story.text, function(i, e){
        $("#story-text").append($("<p>" + e + "</p>"));
      });
      $("#story-navigate").addClass("opensLayer");
      $("#story-navigate").attr("data-location", "/views/story/navigate.html?id=" + story.id);
    });
  },

  navigate: function() {
    var showId = steroids.view.params["id"];
    var story = stories[showId];
    steroids.view.navigationBar.show(story.pois[0].name);

    $(function(){

      var lat = story.pois[0].lat,
        lng = story.pois[0].lng,
        youPOI, destPOI;

      $("#navigate-text").text(story.pois[0].text);

      var locationSet = false;
      function geolocationDataReceived(position) {
          
          $('#navigate-distance').html(distance(position.coords.latitude, position.coords.longitude, lat, lng));

          if (locationSet === false) {
            locationSet = true;
            youPOI = new MQA.Poi( {lat:position.coords.latitude, lng:position.coords.longitude} );
            map.addShape(youPOI);
            map.bestFit();
          }

          youPOI.setLatLng({lat:position.coords.latitude, lng:position.coords.longitude});
      }

      function geolocationError(error) {
        alert('code: '    + error.code    + '\n' +
              'message: ' + error.message + '\n');
      }

      function distance(lon1, lat1, lon2, lat2) {
        var R = 6371; // Radius of the earth in km
        var dLat = (lat2-lat1).toRad();  // Javascript functions in radians
        var dLon = (lon2-lon1).toRad(); 
        var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) * 
                Math.sin(dLon/2) * Math.sin(dLon/2); 
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        var d = R * c; // Distance in km
        d = d * 0.621371 //Distance in miles 
        d = Math.round(d * 100) / 100 //Round to 2 decimal places
        return d;
      }

      /** Converts numeric degrees to radians */
      if (typeof(Number.prototype.toRad) === "undefined") {
        Number.prototype.toRad = function() {
          return this * Math.PI / 180;
        }
      }

      var $map = $('#map');
      $map.css('width', $(window).width() - 20 + 'px')

      var options={
         elt:$map[0],       /*ID of element on the page where you want the map added*/
         zoom:15,                                  /*initial zoom level of the map*/
         latLng:{lat:lat, lng:lng},                /*center of map in latitude/longitude */
         mtype:'map',                              /*map type (map)*/
         bestFitMargin:0,                          /*margin offset from the map viewport when applying a bestfit on shapes*/
         zoomOnDoubleClick:true                    /*zoom in when double-clicking on map*/
      };
   
      /*Construct an instance of MQA.TileMap with the options object*/
      window.map = new MQA.TileMap(options);
      destPOI = new MQA.Poi( {lat:lat, lng:lng} );
      map.addShape(destPOI);

      navigator.geolocation.watchPosition(geolocationDataReceived, geolocationError, { enableHighAccuracy: true });
    });    
  }
};


// Handle tap events on views

document.addEventListener("DOMContentLoaded", function() {

  $(".opensLayer").hammer().on("tap", function() {
    // Create a new WebView that...
    webView = new steroids.views.WebView({ location: this.getAttribute("data-location") });

    // ...is pushed to the navigation stack, opening on top of the current WebView.
    steroids.layers.push({ view: webView });
  });

});

var stories = {
  1: {
    id: 1
    , name: "Haunted Harrisburg"
    , text: ["Is this phantom Mrs. Maclay’s ghost?  What I can only describe as a phantom appeared directly in front of me… I can’t say it came as a surprise, I already experienced a cold spike and feeling of dread when I approached the Maclay Mansion."
             , "The Mansion was built in 1791 and was occupied by William Maclay, the first U.S. senator and his wife, Mary Harris Maclay.  The legend says Mr. Maclay disappeared during the night and returned at odd times.  Could this be the famed Mrs. Maclay waiting for her husband to come home?"]
    , pois: [
      {lat: 40.271695
       ,lng: -76.894598
       ,name: "Maclay Mansion"
       ,text: "The first point along this terrifying tail is the Maclay manor, make your way there to find out the grim fate of our beloved Mrs. Maclay."
      }
    ]         
  },

  2: {
    id: 2
    , name: "Someone stole my organs, a terror tail"  
    , text: ["I woke up one morning and my organs were gone."]
  }
}