/**
** Script for project JS
** @author Maliek Meersschaert 2ICT3
**/

(function() {

	var map;

	//Load data from localStorage into their inputs
	var loadFromStorage = function() {
		document.getElementById('start').value = localStorage.getItem('start');
		document.getElementById('finish').value = localStorage.getItem('finish');
		document.getElementById('transport').value = localStorage.getItem('transport');
	}

	var calculate = function() {

		var directionsService = new google.maps.DirectionsService();
		var directionsDisplay = new google.maps.DirectionsRenderer();
		var distanceService = new google.maps.DistanceMatrixService();

		var start = document.getElementById('start').value;
		var finish = document.getElementById('finish').value;
		var transport = document.getElementById('transport').value;
		var btnCalc = document.getElementById('btnCalc');
		var edit = document.getElementById('edit');

		//centers the map on belgium by default
		map = new google.maps.Map(document.getElementById('map'), {
			zoom: 7,
			center: {lat: 50.43, lng: 4.36}
		});
		directionsDisplay.setMap(map);
		// add trafic layer to the map
		var trafficLayer = new google.maps.TrafficLayer();
		trafficLayer.setMap(map);

		
		btnCalc.addEventListener('click', function() {
			start = document.getElementById('start').value;
			finish = document.getElementById('finish').value;
			transport = document.getElementById('transport').value;

			localStorage.setItem('start', start);
			localStorage.setItem('finish', finish);
			localStorage.setItem('transport', transport);

			disableForm();

			calculateAndDisplayRoute(directionsService, directionsDisplay, start, finish, transport,function(expected){
				/**
				 * only if the the mode is driving, it's worthwile to send a diferent request
				 * In all other cases you can use the distance returend by calculateAndDisplayRoute
				 */
				if (transport === 'DRIVING') {
					durationInTraffic(start, finish, transport, function(exp){
						if (exp) {
							setExpected(exp);
						} else {
							//notice('Directions in traffic didn\'t work on this system.');
							setExpected(expected);
						}
					});
				} else {
					setExpected(expected);
				}
			});
		});

		var setExpected = function(expected) {
			var googleTravelTime = parseInt(expected / 60,10);
			document.querySelector('.result').innerHTML = googleTravelTime;
			disableForm();
		}

		function fnOpenNormalDialog() {
		$("#dialog-confirm").html("Are you sure you want to edit the data?");

		// Define the Dialog and its properties.
		$("#dialog-confirm").dialog({
			dialogClass: "no-close",
			resizable: false,
			modal: true,
			title: "Edit Data",
			height: 100,
			width: 500,
			buttons: {
			    "Yes": function () {
			        $(this).dialog('close');
			        callback(true);
			    },
			        "No": function () {
			        $(this).dialog('close');
			        callback(false);
			    }
			}
		});
		}
		$('#edit').click(fnOpenNormalDialog);
	}

	function callback(value) {
		if (value) {
			enableForm();
		} else {
			disableForm();
		}
	}

	var durationInTraffic = function(start, finish, transport, callback) {
		var params = 'start='+start+'&finish='+finish+'&transport='+transport;
		var address = './distance.php';
		var req = new XMLHttpRequest();
		req.addEventListener('load', function(){
		try {
			callback(JSON.parse(this.responseText).rows[0].elements[0].duration_in_traffic.value);
		} catch (e) {
			callback(false);
		}
		});
		req.open('POST',address);
		req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
		req.send(params);
	}

	var calculateAndDisplayRoute = function(directionsService, directionsDisplay, start, finish, transport, callback) {
		directionsService.route({
			origin: start,
			destination: finish,
			travelMode: transport
		}, function(response, status) {
			if (status === google.maps.DirectionsStatus.OK) {
				directionsDisplay.setDirections(response);				
			}	callback(response.routes[0].legs[0].duration.value);
			
		});
	}
		

	window.addEventListener("load", function () {
		loadFromStorage();
		calculate();
	});

	var disableForm = function() {
		document.getElementById('start').disabled = true;
		document.getElementById('finish').disabled = true;
		document.getElementById('transport').disabled = true;
	}

	var enableForm = function() {
		document.getElementById('start').disabled = false;
		document.getElementById('finish').disabled = false;
		document.getElementById('transport').disabled = false;
	}
})();