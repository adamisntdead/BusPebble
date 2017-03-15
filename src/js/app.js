// Imports  -------------------------------------------------------------------------------------------
var ajax = require('ajax');
var UI = require('ui');
var Vector2 = require('vector2');

// Helper Functions -----------------------------------------------------------------------------------
var BASE_URL = 'https://data.dublinked.ie/cgi-bin/rtpi';
var favouriteStops = [{
  stop: 3787,
  notes: 'Home towards Skerries'
}, {
  stop: 7602
}];

function getRealtimeData(stopId, callback) {
    var requestUrl = BASE_URL + '/realtimebusinformation?stopid=' + stopId + '&format=json';

    ajax({
      url: requestUrl,
      type: 'json'
    }, callback);
}

function getAndDisplayRealtime(stopId) {
  getRealtimeData(stopId, function(data) {
    var items = data.results.map(function(item) {
      return {
        title: item.route,
        subtitle: 'Due in ' + item.departureduetime + ' minutes',
        dest: item.destination,
        out: item.origin
      }
    });

    if (items.length < 1) {
      var newCard = new UI.Card({
        title: 'No Buses are on the Realtime at the moment'
      });

      newCard.show();
    } else {
      var menu = new UI.Menu({
        sections: [{
          items: items
        }]
      });

      menu.on('select', function(e) {
        var busCard = new UI.Card({
          title: e.item.title + ' | ' + e.item.subtitle,
          body: 'Towards ' + e.item.dest + '\nOutbound from ' + e.item.out
        });

        busCard.show();
      });

      menu.show();
    }
  });
}

// Main App -------------------------------------------------------------------------------------------
var main = new UI.Card({
  title: '  Dublin Bus',
  subtitle: 'RTPI',
  icon: 'images/menu_icon.png',
  body: 'Press select to choose a stop from your favourites, or up to input a stop number.'
});

main.on('click', 'select', function(e) {
  var stopMenu = new UI.Menu({
    sections: [{
      items: favouriteStops.map(function(stop) {
        return {
          title: stop.stop,
          subtitle: stop.notes || '',
          stopNum: parseInt(stop.stop)
        }
      })
    }]
  });

  stopMenu.on('select', function(e) {
    getAndDisplayRealtime(e.item.stopNum);
  });

  stopMenu.show();
});

main.show();
