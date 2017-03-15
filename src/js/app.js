// Imports
// -------------------------------------------------------------------------
// ------------------
var ajax = require('ajax');
var UI = require('ui');
var Vector2 = require('vector2');
var Settings = require('settings');

// Helper Functions
// -------------------------------------------------------------------------
// ----------
var BASE_URL = 'https://data.dublinked.ie/cgi-bin/rtpi';
var favouriteStops = [
	{
		stop: 3787,
		notes: 'Home towards Skerries'
	}, {
		stop: 7602
	}
];

function getRealtimeData(stopId, callback) {
	var requestUrl = BASE_URL + '/realtimebusinformation?stopid=' + stopId + '&format=json';

	ajax({
		url: requestUrl,
		type: 'json'
	}, callback);
}

function getAndDisplayRealtime(stopId) {
	getRealtimeData(stopId, function(data) {
		var items = data
			.results
			.map(function(item) {
				return {
					title: item.route,
					subtitle: 'Due in ' + item.departureduetime + ' minutes',
					dest: item.destination,
					out: item.origin
				}
			});

		if (items.length < 1) {
			var newCard = new UI.Card({title: 'No Buses are on the Realtime at the moment'});

			newCard.show();
		} else {
			var menu = new UI.Menu({
				sections: [
					{
						items: items
					}
				]
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

// Settings in the pebble app, on the mobile device
Settings
	.config({
		url: 'http://adamisntdead.github.io/BusPebble/'
	}, function(e) {
		console.log('opened config');
	}, function(e) {
		console.log('Recieved settings!');
		var options = e.options;
		var firstName = options.firstname;
		var lastName = options.lastname;
		console.log(firstName + " " + lastName);
		localStorage.setItem(1, firstName);
		localStorage.setItem(2, lastName);
	});

// Main App
// -------------------------------------------------------------------------
// ------------------
var main = new UI.Card({
	title: '  Dublin Bus',
	subtitle: 'RTPI',
	icon: 'images/menu_icon.png',
	body: 'Press select to choose a stop from your favourites, or up to input a stop n' +
			'umber.'
});

main.on('click', 'up', function(e) {
	var first_name = localStorage.getItem(1);
  var last_name = localStorage.getItem(2);
  var card = new UI.Card({
    title: 'Welcome!',
    body: 'Welcome, ' + first_name + " " + last_name
  });
  card.show();
});

main.on('click', 'select', function(e) {
	var stopMenu = new UI.Menu({
		sections: [
			{
				items: favouriteStops.map(function(stop) {
					return {
						title: stop.stop,
						subtitle: stop.notes || '',
						stopNum: parseInt(stop.stop)
					}
				})
			}
		]
	});

	stopMenu.on('select', function(e) {
		getAndDisplayRealtime(e.item.stopNum);
	});

	stopMenu.show();
});

main.show();
