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

	var init = function() {
		var belgium = {
			lat: 50.5,
			lng: 4.2
		}

		this.map = new google.maps.Map(document.getElementById('map'), {
			center: belgium, //	Default location (belgium)
			scroll: false,
			zoom: 7
		});

		// Traffic colors (overlay)
		var trafficLayer = new google.maps.TrafficLayer();
		trafficLayer.setMap(this.map);

		// Recenter map on browser resize. credit: http://codepen.io/jamesnew/pen/HGnrw
		google.maps.event.addDomListener(window, "resize", function() {
			var center = map.mapsModule.map.getCenter();
			google.maps.event.trigger(map.mapsModule.map, "resize");
			map.mapsModule.map.setCenter(center);
		});

		// Initialize Directions service
		this.directionsService = new google.maps.DirectionsService();
		this.directionsRenderer = new google.maps.DirectionsRenderer();

		// Initialize Distance Matrix service
		this.distanceMatrixService = new google.maps.DistanceMatrixService;
		}

	var calculate = function() {
		var start = document.getElementById('start').value;
		var finish = document.getElementById('finish').value;
		var transport = document.getElementById('transport').value;
		var btnCalc = document.getElementById('btnCalc');
		var edit = document.getElementById('edit');
		
		btnCalc.addEventListener('click', function() {
			start = document.getElementById('start').value;
			finish = document.getElementById('finish').value;
			transport = document.getElementById('transport').value;
			localStorage.setItem('start', start);
			localStorage.setItem('finish', finish);
			localStorage.setItem('transport', transport);
			disableForm();
		});
		/*edit.addEventListener('click',function(){
			$("#edit").dialog({autoOpen : false, modal : true, show : "blind", hide : "blind"});
			enableForm();
		});*/
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

		function callback(value) {
		    if (value) {
		       enableForm();
		    } else {
		       disableForm();
		    }
		}

	}

	window.addEventListener("load", function () {
		loadFromStorage();
		calculate();
		init();
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