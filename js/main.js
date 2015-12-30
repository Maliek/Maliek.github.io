/**
** Script for project JS
** @author Maliek Meersschaert 2ICT3
**/

(function() {

	var map;
	var graph;
	var timeGoogle;

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
			timeGoogle = parseInt(expected / 60,10);
			document.querySelector('.result').innerHTML = timeGoogle;
			disableForm();
		}

		function fnOpenNormalDialog() {
		clearLogs();
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

	//http://stackoverflow.com/questions/9713058/sending-post-data-with-a-xmlhttprequest
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

	var clearLogs = function() {
		localStorage.removeItem('data');
		localStorage.removeItem('start');
		localStorage.removeItem('finish');
		localStorage.removeItem('transport');
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

	//chart part (http://stackoverflow.com/questions/20801171/how-to-retrieve-the-data-from-localstorage-in-the-order-we-set-it)
	var getDataValues = function() {
		var data = [];
		var item = JSON.parse(localStorage.getItem('data'));
		item.forEach(function(key, val){
			data.push(key.value);
		});
		return data;
	};

	var getGoogleValues = function() {
		var data = [];
		var item = JSON.parse(localStorage.getItem('data'));
		item.forEach(function(key, val){
			data.push(key.google);
		});
		return data;
	};

	var getTime = function() {
		var data = [];
		var item = JSON.parse(localStorage.getItem('data'));
		item.forEach(function(key, val){
			var date = new Date(key.time),
				mm = date.getMonth() + 1,
				h = (date.getHours()<10?'0':'') + date.getHours(),
				m = (date.getMinutes()<10?'0':'') + date.getMinutes();			
			data.push(date.getDate() + "/" + mm + " - " + h  + ":" + m);
		});
		return data;
	};

	btnLog.addEventListener('click', function()  {
		var log = document.getElementById('timeLog').value;
		if (isNumber(log)) {
			var data = JSON.parse(localStorage.getItem('data')) || [];
			data.push({
				time: Date.now(),
				value: log,
				google: (timeGoogle ? timeGoogle : (data.length ? data[data.length-1].google : 0))
			});
			localStorage.setItem('data',JSON.stringify(data));
			createGraph();			
		} else {
			document.getElementById("errLog").innerHTML = "Please enter a number";
		}
	});

	//http://www.chartjs.org/docs/#line-chart
	var createGraph = function() {
		graph ? graph.destroy() : null;
		var canvas = document.getElementById('graph').getContext('2d');
		Chart.defaults.global.responsive = true;
		var data = {
			labels: getTime(),
			datasets: [
			{
				label: 'Your time',
				fillColor: "rgba(112,96,65,0.2)",
				strokeColor: "rgba(112,96,65,1)",
				pointColor: "rgba(112,96,65,1)",
				pointStrokeColor: "#fff",
				pointHighlightFill: "#fff",
				pointHighlightStroke: "rgba(112,96,65,1)",
				data: getDataValues()
			}, {
				label: 'Googles time',
				fillColor: "rgba(151,187,205,0.2)",
				strokeColor: "rgba(151,187,205,1)",
				pointColor: "rgba(151,187,205,1)",
				pointStrokeColor: "#fff",
				pointHighlightFill: "#fff",
				pointHighlightStroke: "rgba(151,187,205,1)",
				data: getGoogleValues()
			}
			]
		};
		var options = {
			scaleShowGridLines : true,
			scaleGridLineColor : "rgba(0,0,0,.05)",
			scaleGridLineWidth : 1,
			scaleShowHorizontalLines: true,
			scaleShowVerticalLines: true,
			bezierCurve : false,
			bezierCurveTension : 0.4,
			pointDot : true,
			pointDotRadius : 4,
			pointDotStrokeWidth : 1,
			pointHitDetectionRadius : 20,
			datasetStroke : true,
			datasetStrokeWidth : 2,
			datasetFill : true,
			multiTooltipTemplate: "<%= datasetLabel %>: <%= value %> minutes"
			};
		graph = new Chart(canvas).Line(data, options);
	};

	document.getElementById('btnSave').addEventListener('click', function() {
		var pablo_svg = Pablo(document.getElementById('graph').getElementsByTagName('svg')[0]);
		var data = pablo_svg.dataUrl();
		$.ajax({ 
			type: 'POST', 
			url: 'store.php',
			dataType: 'text',
			data: {
			base64data : data
		}
		}).done(function(resp) {
			var newImg = document.createElement('IMG');
			newImg.src = 'img/' + resp;
			document.getElementById('saved').appendChild(newImg);
		}).fail(function(resp) {
			console.log('error');
		});
	});

	function isNumber(n) {
		return !isNaN(parseFloat(n)) && isFinite(n);
	};

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