
// In the following example, markers appear when the user clicks on the map.
// The markers are stored in an array.
// The user can then click an option to hide, show or delete the markers.
var map;
var markers = []; //It's core array and used to locate markers on the map
var DbMarkers = []; //It's temporary array and used to clear all db markers on the map
var MarkerArr = [];
var myArr = [];
var DbStatus = 0;
var dmlApiStatus = 0;

var dmlServer = document.location.protocol + "//" + document.location.host;
var infoWinimagePath = dmlServer + '/dmlmap/images/';

// Variables for distance between two points
var dmlDistLocation1_lat;
var dmlDistLocation1_lng;
var dmlDistLocation2_lat;
var dmlDistLocation2_lng;
var dmlDistStatus = 0;
var directionsDisplay; //will be used to clear distance route
var dmlDistmarker1; //will be used to clear distance marker1
var dmlDistmarker2; //will be used to clear distance marker2
var dmlDistline; //will be used to clear distance straight line
var newMarker = ""; //will be used to clear temporary marker

var inherits = function (childCtor, parentCtor) {
	/** @constructor */
	function tempCtor() { };
	tempCtor.prototype = parentCtor.prototype;
	childCtor.superClass_ = parentCtor.prototype;
	childCtor.prototype = new tempCtor();
	childCtor.prototype.constructor = childCtor;
};

$(document).ready(function () {
	var myLocation = $(location).attr('href');
	CallHandler(myLocation);
	if ($("#myMap1Edit").html() == 1) {
		var DmlSupportLinks = '<a href="https://codecanyon.net/item/dml-google-map-for-php/18859172" target="blank">Buy PRO Version</a> | <a href="http://googlemap.webmountain.net/documentation/php/documentation.html" target="blank">Documentation</a> | <a href="http://www.webmountain.net/open-ticket/" target="blank">Support</a>';
		$("#dmlsupportbuttons").html( DmlSupportLinks );
	} else {
		$("#dmlsupportbuttons").html();
	}

	// End of Document Ready

});

//****GET DATA AJAX START
function CallHandler(myLocation) {
	myArr = [];
	var mySaveString = dmlServer + "/dmlmap/dmlmapfunctions.php?SaveType=start&url=" + myLocation + "&CntID=1";
	var savecenter = {};
	savecenter.url = mySaveString;
	savecenter.type = "POST";
	savecenter.data = {};
	savecenter.cache = false;
	savecenter.processData = false;
	savecenter.success = function (result) {
		if (result == 1) {
			// There is table without data. So, shows API panel
			$("#dmlMapContainer").hide();
			$("#dmlApiDiv").show();
		} else if (result == 0) {
			alert("Unknown error");
		} else {
			myArr = $.parseJSON(result);
			console.log(myArr);
			var myLenght = myArr.length;
			if (myLenght == 0) {
				// There is table without data. So, shows API panel
				$("#dmlMapContainer").hide();
				$("#dmlApiDiv").show();
			} else {
				if (dmlApiStatus == 0) {
					LoadDmlMapApi(myArr[0].CntField3);
				} else {
					dmlLoadMap();
				}

				$("#dmlMapContainer").show();
				$("#dmlApiDiv").hide();
			}
		}
	};
	savecenter.error = function (err) { alert(err.statusText); };
	$.ajax(savecenter);
	event.preventDefault();
}
function LoadDmlMapApi(myApi) {
	var script = document.createElement("script");
	script.src = "https://maps.googleapis.com/maps/api/js?key=" + myApi + "&libraries=drawing&callback=dmlLoadMap";
	script.id = "dmlMapApi";
	//script.type = "text/javascript";
	document.getElementsByTagName("head")[0].appendChild(script);
	dmlApiStatus = 1;
}
function dmlLoadMap() {
	var myMapType = myArr[0].CntField5;
	if (myMapType == "1" || myMapType == "2" || myMapType == "3") {
		initMap(myMapType);
	} else {
		loadJSON2(myMapType);
	}
}
function loadJSON2(myStyleNu) {
	if (myStyleNu == 0) {
		var myStyleCode = myArr[0].CntField7;
		try {
			var c = $.parseJSON(myStyleCode);
			initMap(myStyleCode);
		}
		catch (err) {
			alert('Please reload the map. If you continue receiving this message, please refer to the documentation');
			initMap(1);
		}
		//initMap(myStyleCode);
	} else {
		var myStyleFile = dmlServer + "/dmlmap/styles/style" + myStyleNu + ".json";
		var xobj = new XMLHttpRequest();
		xobj.overrideMimeType("application/json");
		xobj.open('GET', myStyleFile, true); // Replace 'my_data' with the path to your file
		xobj.onreadystatechange = function () {
			if (xobj.readyState == 4 && xobj.status == "200") {
				initMap(xobj.responseText);
			}
		};
		xobj.send(null);
	}
}
function initMap(myStyle) {
	if (DbStatus == 0) {
		$("#map").attr('style', 'width: 100%; height: ' + myArr[0].CntField4 + 'px; margin: 0; padding: 0;');
		var haightAshbury = { lat: parseFloat(myArr[0].CntField1), lng: parseFloat(myArr[0].CntField2) };


		if (myStyle == "1" || myStyle == "2" || myStyle == "3") {
			map = new google.maps.Map(document.getElementById('map'), {
				zoom: parseInt(myArr[0].CntField8),
				center: haightAshbury,
				mapTypeId: google.maps.MapTypeId.ROADMAP,
			});

			// Determines map type
			if (myStyle == "1") {
				//Displays a normal, default 2D map
				map.setMapTypeId(google.maps.MapTypeId.ROADMAP);
			} else if (myStyle == "2") {
				//Displays a photographic map
				map.setMapTypeId(google.maps.MapTypeId.SATELLITE);
			} else if (myStyle == "3") {
				//Displays a map with mountains, rivers, etc.
				map.setMapTypeId(google.maps.MapTypeId.TERRAIN);
			}
		} else {
			map = new google.maps.Map(document.getElementById('map'), {
				zoom: parseInt(myArr[0].CntField8),
				center: haightAshbury,
				styles: JSON.parse(myStyle),
			});
		}

		DbStatus = 1;

		map.addListener('click', function (event) {
			addMarker(event.latLng);
		});

		// This event listener will call addMarker() when the map is clicked.
		if ($("#myMap1Edit").html() == 1) {

			$("#dmlmapaddressbar").show();

			document.getElementById('dmlmapSubmitAddress').addEventListener('click', function () {
				dml_Find_From_Address();
			});

		

		}

		//FILLING MAPHOLDER_ID
		$("#Map1idHolder").html(myArr[0].CntID + '_0_7_' + myArr[0].CntField3 + '_' + myArr[0].CntField4 + '_' + myArr[0].CntField5 + '_' + myArr[0].CntField6 + '_' + myArr[0].CntField8);

		//CLICK ON THE MAP WHEN LOGGEDIN
		google.maps.event.addListener(map, 'click', function (e) {
			$("#LblSonuc").html("");
			if ($("#myMap1Edit").html() == 1) {
				myDeger1 = e.latLng.lat();
				myDeger2 = e.latLng.lng();
				$("#Text1").val(myDeger1);
				$("#Text2").val(myDeger2);


				var position = $("#Repeater1Map").position();

				var y1 = position.top + 44;
				var x1 = position.left + 20;
				$("#BtnSettings").css({ position: "absolute", top: y1 + "px", left: x1 + "px" }).show();
				var y2 = position.top + 44;
				var x2 = position.left + 64;
				$("#BtnDmlMapRefresh").css({ position: "absolute", top: y2 + "px", left: x2 + "px" }).show();

				$("#idholder").html(myArr[0].CntID + "_0_7");
			}
		});
	}

	var dmlLayerStatusArr = [];
	dmlLayerStatusArr = myArr[0].CntField6.split("_");

	// Traffic layer activation
	if (dmlLayerStatusArr[0] == 1) {
		var trafficLayer = new google.maps.TrafficLayer();
		trafficLayer.setMap(map);
	}

	// Transit layer activation
	if (dmlLayerStatusArr[1] == 1) {
		var transitLayer = new google.maps.TransitLayer();
		transitLayer.setMap(map);
	}

	// Bicycle layer activation
	if (dmlLayerStatusArr[2] == 1) {
		var bikeLayer = new google.maps.BicyclingLayer();
		bikeLayer.setMap(map);
	}

	// Adds a markers and shaoes on the map.
	dml_add_Cluster_Markers();
}


function Marker(options) {
	google.maps.Marker.apply(this, arguments);

	if (options.map_icon_label) {
		this.MarkerLabel = new MarkerLabel({
			map: this.map,
			marker: this,
			text: options.map_icon_label
		});
		this.MarkerLabel.bindTo('position', this, 'position');
	}
}
// 3.2 - Custom Marker SetMap
Marker.prototype.setMap = function () {
	google.maps.Marker.prototype.setMap.apply(this, arguments);
	(this.MarkerLabel) && this.MarkerLabel.setMap.apply(this.MarkerLabel, arguments);
};
// 3.3 - Marker Label Overlay
var MarkerLabel = function (options) {
	var self = this;
	this.setValues(options);

	// Create the label container
	this.div = document.createElement('div');
	this.div.className = 'map-icon-label';

	// Trigger the marker click handler if clicking on the label
	google.maps.event.addDomListener(this.div, 'click', function (e) {
		(e.stopPropagation) && e.stopPropagation();
		google.maps.event.trigger(self.marker, 'click');
	});
};
function dml_add_Cluster_Markers() {
	var infowindow = new google.maps.InfoWindow({});
	var marker, i;
	var imagePath = dmlServer + '/dmlmap/icons/';

	var dmlClusterArr = [];

	// Apply the inheritance
	inherits(Marker, google.maps.Marker);

	// Create MarkerLabel Object
	MarkerLabel.prototype = new google.maps.OverlayView;

	// Marker Label onAdd
	MarkerLabel.prototype.onAdd = function () {
		var pane = this.getPanes().overlayImage.appendChild(this.div);
		var self = this;

		this.listeners = [
			google.maps.event.addListener(this, 'position_changed', function () { self.draw(); }),
			google.maps.event.addListener(this, 'text_changed', function () { self.draw(); }),
			google.maps.event.addListener(this, 'zindex_changed', function () { self.draw(); })
		];
	};

	// Marker Label onRemove
	MarkerLabel.prototype.onRemove = function () {
		this.div.parentNode.removeChild(this.div);

		for (var i = 0, I = this.listeners.length; i < I; ++i) {
			google.maps.event.removeListener(this.listeners[i]);
		}
	};

	// Implement draw
	MarkerLabel.prototype.draw = function () {
		var projection = this.getProjection();
		var position = projection.fromLatLngToDivPixel(this.get('position'));
		var div = this.div;

		this.div.innerHTML = this.get('text').toString();

		div.style.zIndex = this.get('zIndex'); // Allow label to overlay marker
		div.style.position = 'absolute';
		div.style.display = 'block';
		div.style.left = (position.x - (div.offsetWidth / 2)) + 'px';
		div.style.top = (position.y - div.offsetHeight) + 'px';

	};

	for (var i = 0; i < myArr.length; i++) {
		if (myArr[i].CntField5 == "M") {
			dmlClusterArr.push({
				CntID: myArr[i].CntID,
				CntField1: myArr[i].CntField1,
				CntField2: myArr[i].CntField2,
				CntField3: myArr[i].CntField3,
				CntField4: myArr[i].CntField4,
				CntField6: myArr[i].CntField6,
				CntField7: myArr[i].CntField7,
				CntField8: myArr[i].CntField8,
				CntField9: myArr[i].CntField9,
				CntField10: myArr[i].CntField10
			});
		}
	}
	var markers = dmlClusterArr.map(function (location, i) {

		if (dmlClusterArr[i].CntField6 < 200) {
			marker = new google.maps.Marker({
				position: new google.maps.LatLng(dmlClusterArr[i].CntField1, dmlClusterArr[i].CntField2),
				map: map,
				icon: imagePath + dmlClusterArr[i].CntField6 + ".png"
			});
		} else {

			MarkerArr = dmlClusterArr[i].CntField6.split("_");
			marker = new Marker({
				map: map,
				position: new google.maps.LatLng(dmlClusterArr[i].CntField1, dmlClusterArr[i].CntField2),
				icon: {
					path: dml_Container_Path(MarkerArr[1]),
					fillColor: '#' + MarkerArr[2],
					fillOpacity: 1,
					strokeColor: '',
					strokeWeight: 0
				},
				map_icon_label: '<span id="' + dmlClusterArr[i].CntID + '_Label" class="map-icon i' + MarkerArr[0] + '"></span>'
			});
		}

		google.maps.event.addListener(marker, 'click', (function (marker, i) {
			return function () {
				if (jQuery("#myMap1Edit").html() == 1) {

					infowindow.setContent('<strong><span id="' + dmlClusterArr[i].CntID + '_H">' + dmlClusterArr[i].CntField3 + '</span></strong>' + dmlWriteInfoImageHelper(dmlClusterArr[i].CntID, dmlClusterArr[i].CntField7) + dmlWriteInfoVideoHelper(dmlClusterArr[i].CntID, dmlClusterArr[i].CntField10) + '<div id="' + dmlClusterArr[i].CntID + '_D" style="width:250px;">' + dmlClusterArr[i].CntField4 + '</div>' + dmlWriteInfoLink(dmlClusterArr[i].CntID, dmlClusterArr[i].CntField8, dmlClusterArr[i].CntField9) + '<br><div onclick="EditMarkerDescription(' + dmlClusterArr[i].CntID + ');" class="button btn btn-success btn-sm fontawesome-pencil"></div><div onclick="DeleteDbMarker(' + dmlClusterArr[i].CntID + ', 1);" class="btn btn-danger btn-sm fontawesome-trash" style="margin-left:2px;"></div><div onclick="FillMarkerSettings(' + dmlClusterArr[i].CntID + ', \'' + dmlClusterArr[i].CntField6 + '\');" class="btn btn-primary btn-sm fontawesome-picture" style="margin-left:2px;"></div><div class="btn btn-default btn-sm" style="display:none;"><span class="badge">' + dmlClusterArr[i].CntID + '</span></div><br /><div class="dmlselectdistancediv" style="color: blue; text-decoration: underline; cursor: pointer;"  onclick="dml_add_for_distance(' + dmlClusterArr[i].CntField1 + ', ' + dmlClusterArr[i].CntField2 + ');">Calculate distance</div>');

				} else {
					infowindow.setContent('<strong>' + dmlClusterArr[i].CntField3 + '</strong>' + dmlWriteInfoImageHelper(dmlClusterArr[i].CntID, dmlClusterArr[i].CntField7) + dmlWriteInfoVideoHelper(dmlClusterArr[i].CntID, dmlClusterArr[i].CntField10) + '<div style="width: 250px;">' + dmlClusterArr[i].CntField4 + '</div>' + dmlWriteInfoLink(dmlClusterArr[i].CntID, dmlClusterArr[i].CntField8, dmlClusterArr[i].CntField9) + '');
				}
				infowindow.open(map, marker);
			}
		})(marker, i));

		DbMarkers.push(marker);

		return marker;
	});

	var clusterStyles = [
		{
			textColor: 'black',
			url: dmlServer + '/dmlmap/icons/m1.png',
			height: 52,
			width: 53,
			textSize: 12
		},
		{
			textColor: 'black',
			url: dmlServer + '/dmlmap/icons/m2.png',
			height: 56,
			width: 55,
			textSize: 12
		},
		{
			textColor: 'black',
			url: dmlServer + '/dmlmap/icons/m3.png',
			height: 66,
			width: 65,
			textSize: 12
		}
	];
	var mcOptions = {
		gridSize: 50,
		styles: clusterStyles,
		maxZoom: 15
	};
	var markerCluster = new MarkerClusterer(map, markers, mcOptions);

	google.maps.event.addListener(map, "idle", function () {
		var myCount = 0;
		var myMarkerID;
		for (var i = 0; i < markers.length; i++) {
			var mrkr = markers[i];
			if (mrkr.getMap() != null) {
				//myCount++;
			}
			else {
				myCount++;
				myMarkerID = myMarkerID + '_' + dmlClusterArr[i].CntID;
				jQuery('#' + dmlClusterArr[i].CntID + '_Label').hide();
			}
		}
	});
}
function dml_Container_Path(myContainerName) {
	var myPath;
	//if (myContainerName == 'DmlMarkerSquarePin') {
	if (myContainerName == 191) {
		// 191 Marker Pin
		myPath = 'M0-48c-9.8 0-17.7 7.8-17.7 17.4 0 15.5 17.7 30.6 17.7 30.6s17.7-15.4 17.7-30.6c0-9.6-7.9-17.4-17.7-17.4z';
	} else if (myContainerName == 192) {
		// 192 Square Pin
		myPath = 'M22-48h-44v43h16l6 5 6-5h16z';
	} else if (myContainerName == 193) {
		// 193 Shield
		myPath = 'M18.8-31.8c.3-3.4 1.3-6.6 3.2-9.5l-7-6.7c-2.2 1.8-4.8 2.8-7.6 3-2.6.2-5.1-.2-7.5-1.4-2.4 1.1-4.9 1.6-7.5 1.4-2.7-.2-5.1-1.1-7.3-2.7l-7.1 6.7c1.7 2.9 2.7 6 2.9 9.2.1 1.5-.3 3.5-1.3 6.1-.5 1.5-.9 2.7-1.2 3.8-.2 1-.4 1.9-.5 2.5 0 2.8.8 5.3 2.5 7.5 1.3 1.6 3.5 3.4 6.5 5.4 3.3 1.6 5.8 2.6 7.6 3.1.5.2 1 .4 1.5.7l1.5.6c1.2.7 2 1.4 2.4 2.1.5-.8 1.3-1.5 2.4-2.1.7-.3 1.3-.5 1.9-.8.5-.2.9-.4 1.1-.5.4-.1.9-.3 1.5-.6.6-.2 1.3-.5 2.2-.8 1.7-.6 3-1.1 3.8-1.6 2.9-2 5.1-3.8 6.4-5.3 1.7-2.2 2.6-4.8 2.5-7.6-.1-1.3-.7-3.3-1.7-6.1-.9-2.8-1.3-4.9-1.2-6.4z';
	} else if (myContainerName == 194) {
		// 194 Square
		myPath = 'M-24-48h48v48h-48z';
	} else if (myContainerName == 195) {
		// 195 Route
		myPath = 'M24-28.3c-.2-13.3-7.9-18.5-8.3-18.7l-1.2-.8-1.2.8c-2 1.4-4.1 2-6.1 2-3.4 0-5.8-1.9-5.9-1.9l-1.3-1.1-1.3 1.1c-.1.1-2.5 1.9-5.9 1.9-2.1 0-4.1-.7-6.1-2l-1.2-.8-1.2.8c-.8.6-8 5.9-8.2 18.7-.2 1.1 2.9 22.2 23.9 28.3 22.9-6.7 24.1-26.9 24-28.3z';
	} else if (myContainerName == 196) {
		// 196 Square rounded
		myPath = 'M24-8c0 4.4-3.6 8-8 8h-32c-4.4 0-8-3.6-8-8v-32c0-4.4 3.6-8 8-8h32c4.4 0 8 3.6 8 8v32z';
	}

	return myPath;
}
function dmlShapeInfoWindowContent(myDescription, myImageUrl, myVideoCode, myLinkText, myLinkUrl) {
	var myResult = '<div style="width: 250px;">' + myDescription + '</div>' + dmlWriteShapeInfoImageHelper(myImageUrl) + dmlWriteShapeInfoVideoHelper(myVideoCode) + dmlWriteShapeInfoLink(myLinkText, myLinkUrl) + '';
	return myResult;
}
function dmlCircleInfoWindowContent(myDescription, myImageUrl, myLinkText, myLinkUrl) {
	var myResult = '<div style="width: 250px;">' + myDescription + '</div>' + dmlWriteShapeInfoImageHelper(myImageUrl) + '<br>' + dmlWriteShapeInfoLink(myLinkText, myLinkUrl) + '';
	return myResult;
}
function PutHashtags(myText) {
	myText = myText.replace("hashtag", "#");
	return myText;
}
function ClearAllDbMarkers() {
	for (var i = 0; i < DbMarkers.length; i++) {
		DbMarkers[i].setMap(null);
	}
	$('.map-icon').remove();

}

// **** POPUP FUNCTIONS
// Fills settings popup
function EditMarkerDescription(myMarkerID) {
	// Clears content of panel
	$("#EssSettingsModalBody").html("");
	$("#dmlPnlSettingsTitle").html("Marker Edit Panel");
	$("#BtnSettingsSave").val("Save Text");
	$("#BtnReset").hide();
	//Creates two texboxes for text
	var newElement1 = $(document.createElement('h2')).attr('id', 'dmlMarkerDescription').attr('class', 'modal-title');
	newElement1.after().html("<div id='dmlEditMarkerId' style='display:none;'></div><div class='input-group'><span class='input-group-addon' id='dmlMarkerTitle'>Title</span><input id='dmlMarkerTitleValue' type='text' class='form-control StngElement' aria-describedby='dmlMarkerTitle'></div><div class='input-group'><span class='input-group-addon' id='dmlMarkerImageLabel'>Image</span><input type='text' id='dmlMarkerImageValue' placeholder='Paste image link. It can be left blank' class='form-control StngElement' aria-describedby='dmlMarkerImageLabel'></div><div class='input-group'><span class='input-group-addon' id='dmlMarkerVideoLabel'>Video</span><input type='text' id='dmlMarkerVideoValue' placeholder='Paste just YouTube video code not link. It can be left blank' class='form-control StngElement' aria-describedby='dmlMarkerVideoLabel'></div><div class='input-group'><span class='input-group-addon' id='dmlMarkerLinkText'>Link Text</span><input id='dmlMarkerLinkValue' placeholder='It can be left blank' type='text' class='form-control StngElement' aria-describedby='dmlMarkerLinkText'></div><div class='input-group'><span class='input-group-addon' id='dmlMarkerLinkUrl'>Link Url</span><input id='dmlMarkerLinkUrlValue' type='text' placeholder='e.g. http://www.sitename.com It can be left blank' class='form-control StngElement' aria-describedby='dmlMarkerLinkUrl'></div><div class='input-group'><span class='input-group-addon' id='dmlMarkerDesc'>Desc.</span><textarea id='dmlMarkerDescValue' class='form-control StngElement' aria-describedby='dmlMarkerDesc'></div><br />");
	newElement1.appendTo("#EssSettingsModalBody");
	$("#dmlEditMarkerId").html(myMarkerID);
	$("#dmlMarkerTitleValue").val($("#" + myMarkerID + "_H").html());
	$("#dmlMarkerDescValue").val($("#" + myMarkerID + "_D").html());
	$("#dmlMarkerImageValue").val(dmlMarkerShowEmptyHelper($("#" + myMarkerID + "_IMG").html()));
	$("#dmlMarkerVideoValue").val(dmlMarkerShowEmptyHelper($("#" + myMarkerID + "_VID").html()));
	$("#dmlMarkerLinkValue").val(dmlMarkerShowEmptyHelper($("#" + myMarkerID + "_LT").html()));
	$("#dmlMarkerLinkUrlValue").val(dmlMarkerShowEmptyHelper($("#" + myMarkerID + "_LU").html()));
	$("#mySettings").modal("toggle");
}
function FillSettings() {
	if ($("#ModalTitle1").length == 0) {
		// Clears content of panel
		$("#EssSettingsModalBody").html("");
		$("#dmlPnlSettingsTitle").html("Settings Panel");
		$("#BtnSettingsSave").val("Save Settings");
		$("#BtnReset").val("Reset Map");
		var mySettings = $("#Map1idHolder").html();

		//CREATE NEW TEXTBOX
		var newElement1 = $(document.createElement('h5')).attr('id', 'ModalTitle1').attr('class', 'modal-title');
		newElement1.after().html("<div class='input-group'><span class='input-group-addon' id='basic-addon1'>API code (pure code)</span><input id='dmlMapApinput' type='text' class='form-control StngElement' aria-describedby='basic-addon1'></div>");
		newElement1.appendTo("#EssSettingsModalBody");

		var newElement2 = $(document.createElement('h5')).attr('id', 'ModalTitle2').attr('class', 'modal-title');
		newElement2.after().html("<div class='input-group'><span class='input-group-addon' id='basic-addon2'>Map height (numbers)</span><input id='dmlMapHeight' type='number' class='form-control StngElement' aria-describedby='basic-addon2'></div>");
		newElement2.appendTo("#EssSettingsModalBody");

		var newElement3 = $(document.createElement('h5')).attr('id', 'ModalTitle6').attr('class', 'modal-title');
		newElement3.after().html("<div class='input-group'><span class='input-group-addon' id='basic-addon6'>Map zoom (numbers)</span><input id='dmlMapZoom' type='number' class='form-control StngElement' aria-describedby='basic-addon6'></div>");
		newElement3.appendTo("#EssSettingsModalBody");

		var newElement5 = $(document.createElement('div')).attr('id', 'ModalTitle7').attr('class', 'StngElement');
		newElement5.after().html("<div class='input-group'><span class='input-group-addon' id='basic-addon6'>Map Style</span><select id='dmlMapTypeOptions' onchange='dmlChangeMapType(this.value);'  class='form-control StngElement' aria-describedby='basic-addon7'></select></div><div id='dmlSelectedStyleThmb'></div><div id='dmlSelectedStyleHolder' style='display:none;'></div>");
		newElement5.appendTo("#EssSettingsModalBody");

		for (var i = 1; i < 31; i++) {
			$('#dmlMapTypeOptions').append($("<option />").val(i).text("Style " + i).attr("id", "dmlOpt" + i));
		}

		var newElementResult = $(document.createElement('div')).attr('id', 'SettingsResult');
		newElementResult.after().html("<div style='clear: both;'></div><div id='LblSettingsSonuc'></div><div id='LblControlType' style='display:none;'></div>");
		newElementResult.appendTo("#EssSettingsModalBody");

		var newElement5 = $(document.createElement('div')).attr('id', 'ModalTitle8').attr('class', 'StngElement');
		newElement5.after().html("<div class='row'><div class='col-sm-4'><input type='checkbox' id='dmlTrafficChb' name='dmlTrafficChb' value='1'> Traffic layer</div><div class='col-sm-4'><input type='checkbox' id='dmlTransportChb' name='dmlTransportChb' value='1'> Transport layer</div><div class='col-sm-4'><input type='checkbox' id='dmlBcycleChb' name='dmlBcycleChb' value='1'> Bicycle layer</div></div>");
		newElement5.appendTo("#EssSettingsModalBody");

		//PASS SETTINGS PARAMETERS TO THE #BtnSettings BUTTON
		var mySettingsParams = mySettings.split("_");
		$("#dmlMapApinput").val(mySettingsParams[3]).show();
		$("#dmlMapHeight").val(mySettingsParams[4]).show();
		$("#dmlMapZoom").val(myArr[0].CntField8).show();
		var mySelectedStyle = mySettingsParams[5];
		$("#dmlOpt" + mySelectedStyle).attr("selected", "selected");
		$("#dmlSelectedStyleHolder").html(mySelectedStyle);
		//$("#dmlSelectedStyleThmb").html("<div class='input-group'><img src='" + dmlServer + "/dmlmap/styles/thmbs/" + mySelectedStyle + ".png' /></div>");
		$("#dmlSelectedStyleThmb").html(dmlMapTypeString(mySelectedStyle));

		// Binding layer checkboxes
		var dmlLayerStatusArr = [];
		dmlLayerStatusArr = myArr[0].CntField6.split("_");
		if (dmlLayerStatusArr[0] == 1) {
			$("#dmlTrafficChb").attr('checked', true);
		}
		if (dmlLayerStatusArr[1] == 1) {
			$("#dmlTransportChb").attr('checked', true);
		}
		if (dmlLayerStatusArr[2] == 1) {
			$("#dmlBcycleChb").attr('checked', true);
		}

	}
}
function FillMarkerSettings(myMarkerId, myMarkerIcon) {
	$("#dmlSelectedIconMarkerId").html(myMarkerId);

	$("#EssSettingsModalBody").html("");
	$("#dmlPnlSettingsTitle").html("Icon Update Panel");
	$("#BtnSettingsSave").val("Change Icon");
	$("#BtnReset").hide();

	//Creates two texboxes for text
	var newElement1 = $(document.createElement('h2')).attr('id', 'dmlMarkerDescription').attr('class', 'modal-title');
	newElement1.after().html("<img id='con191' onclick='dml_Select_Icon_Container(191)' class='dmlMarkerContainersList' src='" + dmlServer + "/dmlmap/icons/191.png'></img><img id='con192' onclick='dml_Select_Icon_Container(192)' class='dmlMarkerContainersList' src='" + dmlServer + "/dmlmap/icons/192.png'></img><img  id='con193' class='dmlMarkerContainersList' onclick='dml_Select_Icon_Container(193)' src='" + dmlServer + "/dmlmap/icons/193.png'></img><img id='con194' class='dmlMarkerContainersList' onclick='dml_Select_Icon_Container(194)' src='" + dmlServer + "/dmlmap/icons/194.png'></img><img id='con195' class='dmlMarkerContainersList' onclick='dml_Select_Icon_Container(195)' src='" + dmlServer + "/dmlmap/icons/195.png'></img><img id='con196' onclick='dml_Select_Icon_Container(196)' class='dmlMarkerContainersList' src='" + dmlServer + "/dmlmap/icons/196.png'></img><div style='width: 100%;><div class='input-group'><input id='dmlMarkerContainerColor' type='color' onchange='dml_Select_Icon_Container_Color()' class='form-control StngElement'></input></div><div id='dmlIconList' style='width: 100%; height: 120px; overflow-y : scroll;'></div><div id='dmlMySelectediconContainer' style='display:none;'></div><div id='dmlMySelectediconID' style='display:none;'></div><div id='dml_Icon_Container_Color_Text' style='font-size: 14px; display: none;'></div>");
	newElement1.appendTo("#EssSettingsModalBody");

	//var myiconTempList;
	for (var i = 201; i < 376; i++) {
		jQuery('#dmlIconList').append("<span id='maricon" + i + "' onclick='dml_Select_One_icon(" + i + ");' class='map-icon i" + i + " dmlMarkerIconsList' title='" + i + "' />");
	}
	$("#mySettings").modal("toggle");

	// Binds Value 
	var myMarkerArray = myMarkerIcon.split("_");

	if (myMarkerArray.length > 1) {
		// Determines container 
		dml_Select_Icon_Container(myMarkerArray[1]);

		// Determines container color 
		var myColorCode = '#' + myMarkerArray[2];
		jQuery("#dmlMarkerContainerColor").val(myColorCode);
		dml_Select_Icon_Container_Color();

		//Icon 
		dml_Select_One_icon(myMarkerArray[0]);
	}
}
function dml_Select_Icon_Container(myId) {
	jQuery(".dmlMarkerContainersList").css("border", "solid 2px white");
	var myConId = '#con' + myId;
	jQuery(myConId).css("border", "solid 2px red");
	jQuery("#dmlMySelectediconContainer").html(myId);
}
function dml_Select_Icon_Container_Color() {
	var myContainerColor = jQuery("#dmlMarkerContainerColor").val();
	jQuery("#dml_Icon_Container_Color_Text").html(myContainerColor);
}
function dml_Select_One_icon(myId) {
	jQuery(".dmlMarkerIconsList").css("border", "solid 2px white");
	var mySelectedIconId = '#maricon' + myId;
	jQuery(mySelectedIconId).css("border", "solid 2px red");
	jQuery("#dmlMySelectediconID").html(myId);
}
function dmlChangeMapType(myStyleNu) {

	$("#dmlSelectedStyleHolder").html(myStyleNu);
	$("#dmlSelectedStyleThmb").html(dmlMapTypeString(myStyleNu));
	myArr[0].CntField5 = myStyleNu;
}
function dmlMapTypeString(dmlMapStyleNo) {
	var myString;
	if (dmlMapStyleNo == 0) {
		myString = "<div class='input-group'><textarea id='dmlCustomStyleCode' class='form-control'></textarea>";
	} else {
		myString = "<div class='input-group'><img src='" + dmlServer + "/dmlmap/styles/thmbs/" + dmlMapStyleNo + ".png' /></div>";
	}
	return myString;
}

// **** MARKER FUNCTIONS
// Adds a marker to the map and push to the array.
function addMarker(location) {
	//1) Firstly clears all temporary markers
	deleteMarkers();
	//2) Adds a new marker to the map
	var newMarker = new google.maps.Marker({
		position: location,
		map: map
	});
	//3)Push new marker to the array
	markers.push(newMarker);
	//4) Adds info window for newMarker if user loggedin
	if ($("#myMap1Edit").html() == 1) {
		var newinfowindow = new google.maps.InfoWindow({});
		google.maps.event.addListener(newMarker, 'click', (function (newMarker) {
			return function () {
				newinfowindow.setContent('<div onclick="CenterMap(' + location.lat() + ', ' + location.lng() + ');" class="btn btn-success fontawesome-screenshot buttonhover" style="margin-left:2px;"></div><div id="Map1AddMarkerBtn" onclick="CreateNewMarker(' + location.lat() + ', ' + location.lng() + ', 1, 1);" class="btn btn-primary fontawesome-map-marker" style="margin-left:2px;"></div><div id="dmlClearTempMarker" onclick="deleteMarkers();" class="btn btn-danger fontawesome-trash" style="margin-left:2px;"></div><br/><div class="dmlselectdistancediv" style="color: blue; text-decoration: underline; cursor: pointer;"  onclick="dml_add_for_distance(' + location.lat() + ', ' + location.lng() + ');">Calculate distance</div>');
				newinfowindow.open(map, newMarker);
			}
		})(newMarker));
	} else {
		var newinfowindow = new google.maps.InfoWindow({});
		google.maps.event.addListener(newMarker, 'click', (function (newMarker) {
			return function () {
				newinfowindow.setContent('<div class="dmlselectdistancediv" style="color: blue; text-decoration: underline; cursor: pointer;"  onclick="dml_add_for_distance(' + location.lat() + ', ' + location.lng() + ');">Calculate distance</div>');
				newinfowindow.open(map, newMarker);
			}
		})(newMarker));
	}
}
function dml_Find_From_Address() {

	var geocoder = new google.maps.Geocoder(); // creating a new geocode object
	var location1;

	// getting the address valuE
	address1 = jQuery("#dmlmapAddressInput").val();

	if (!address1) {
		alert("Please enter the address!");
	} else {
		// finding out the coordinates
		if (geocoder) {
			geocoder.geocode({ 'address': address1 }, function (results, status) {
				if (status == google.maps.GeocoderStatus.OK) {
					//location of first address (latitude + longitude)
					location1 = results[0].geometry.location;
					//alert(location1.lat() + " 1");
					map.setCenter({ lat: parseFloat(location1.lat()), lng: parseFloat(location1.lng()) });
					addMarker(location1);
				} else {
					alert("Geocode was not successful for the following reason: " + status);
				}
			});
		}
	}
}
function CenterMap(myLat, myLng) {
	// Centers map according to location of newMarker
	var r = confirm("Do you want to center map according to this location?");
	if (r == true) {
		//1) Updates database
		var myCntID = myArr[0].CntID;
		var myField1 = "CntField1";
		var myDeger1 = myLat;
		var myField2 = "CntField2";
		var myDeger2 = myLng;
		var mySaveString = dmlServer + "/dmlmap/dmlmapfunctions.php?SaveType=2&CntID=" + myCntID + "&myField1=" + myField1 + "&myDeger1=" + myDeger1 + "&myField2=" + myField2 + "&myDeger2=" + myDeger2 + " ";
		//2) calls AJAX method to update database
		var savecenter = {};
		savecenter.url = mySaveString;
		savecenter.type = "POST";
		savecenter.data = {};
		savecenter.processData = false;
		savecenter.success = function (result) {
			//3) Update map array myArr center coordinates
			myArr[0].CntField1 = myLat;
			myArr[0].CntField2 = myLng;
			//4) Centers map
			map.setCenter({ lat: parseFloat(myLat), lng: parseFloat(myLng) });
			//5) Ckears marker
			deleteMarkers();
		};
		savecenter.error = function (err) { alert(err.statusText); };
		$.ajax(savecenter);
		event.preventDefault();
	}
}
function CreateNewMarker(myLat, myLng, myShapeID, myMarkerType) {
	//1) Adds new marker record to the database
	var myUrl = $(location).attr('href');
	var myiconUrl;
	var myCornerType;
	var myString;
	if (myMarkerType == 1) {
		//Adds marker icon
		myiconUrl = "0";
		myCornerType = "M";
		myString = dmlServer + "/dmlmap/dmlmapfunctions.php?SaveType=ins&CntID=1&p2=" + myUrl + "&p3=" + myLat + "&p4=" + myLng + "&p5=Place Name&p6=Place Description&p7=" + myCornerType + "&p8=" + myiconUrl + "&p9=.&p10=.&p11=.";
	} else if (myMarkerType == 2) {
		var myNewLat;
		var myNewLng;
		for (var i = 0; i < myArr.length; i++) {
			if (myArr[i].CntID == myShapeID) {
				myNewLat = myArr[i].CntField1 + "_" + myLat;
				myNewLng = myArr[i].CntField2 + "_" + myLng;
			}
		}
		myString = dmlServer + "/dmlmap/dmlmapfunctions.php?SaveType=2&CntID=" + myShapeID + "&myField1=CntField1&myDeger1=" + myNewLat + "&myField2=CntField2&myDeger2=" + myNewLng + " ";
	}

	// 2) Calls AJAX method to update database
	var addMarker = {};
	addMarker.url = myString;
	addMarker.type = "POST";
	addMarker.data = {};
	addMarker.processData = false;
	addMarker.success = function (result) {
		ClearAllDbMarkers();
		var myLocation = $(location).attr('href');
		CallHandler(myLocation);
		//5) Clears marker
		deleteMarkers();
		if (myMarkerType != 1) {
			$("#mySettings").modal("toggle");
		}
	};
	addMarker.error = function (err) { alert(err.statusText); };
	$.ajax(addMarker);
	event.preventDefault();
}
function CreateNewShape(myLat, myLng, myMarkerType, myRadius) {
	//1) Adds marker icon
	var myUrl = $(location).attr('href')
	var myString;
	if (myMarkerType == 1) {
		//Creates new line
		myString = dmlServer + "/dmlmap/dmlmapfunctions.php?SaveType=ins&CntID=1&p2=" + myUrl + "&p3=" + myLat + "&p4=" + myLng + "&p5=Line description&p6=.&p7=L&p8=.&p9=.&p10=.&p11=hashtagFE2E2E";
	} else if (myMarkerType == 2) {
		//Creates new polygon
		myString = dmlServer + "/dmlmap/dmlmapfunctions.php?SaveType=ins&CntID=1&p2=" + myUrl + "&p3=" + myLat + "&p4=" + myLng + "&p5=Polygon description&p6=.&p7=P&p8=.&p9=hashtag2E2EFE&p10=.&p11=hashtagFE2E2E";
	} else if (myMarkerType == 3) {
		//Creates new circle
		myString = dmlServer + "/dmlmap/dmlmapfunctions.php?SaveType=ins&CntID=1&p2=" + myUrl + "&p3=" + myLat + "&p4=" + myLng + "&p5=Circle description&p6=" + myRadius + "&p7=C&p8=.&p9=hashtag2E2EFE&p10=.&p11=hashtagFE2E2E";
	}

	//2) Calls AJAX method to update database
	var addMarker = {};
	addMarker.url = myString;
	addMarker.type = "POST";
	addMarker.data = {};
	addMarker.processData = false;
	addMarker.success = function (result) {
		// Clears all DB markers from the map
		ClearAllDbMarkers();
		var myLocation = $(location).attr('href');
		CallHandler(myLocation);
		//5) Clears marker
		deleteMarkers();
	};
	addMarker.error = function (err) { alert(err.statusText); };
	$.ajax(addMarker);
	event.preventDefault();
}
function SaveSettingsPanel() {
	var myMapID = myArr[0].CntID;
	var myMapApi = $("#dmlMapApinput").val();
	var myMapHeight = $("#dmlMapHeight").val();
	var myMapType = myArr[0].CntField5;
	var dmlMapCustomCode;
	if (myMapType == 0) {
		dmlMapCustomCode = $("#dmlCustomStyleCode").val();
	} else {
		dmlMapCustomCode = '.';
	}
	var myMapZoom = $("#dmlMapZoom").val();

	var dmlTrafficLayerVal = 0;
	var dmlTransportLayerVal = 0;
	var dmlBicycleLayerVal = 0;
	if ($("#dmlTrafficChb").is(':checked') == true) {
		dmlTrafficLayerVal = 1;
	}
	if ($("#dmlTransportChb").is(':checked') == true) {
		dmlTransportLayerVal = 1;
	}
	if ($("#dmlBcycleChb").is(':checked') == true) {
		dmlBicycleLayerVal = 1;
	}
	var dmlLayerStatusToDb = dmlTrafficLayerVal + '_' + dmlTransportLayerVal + '_' + dmlBicycleLayerVal;

	if (!myMapID || !myMapApi || !myMapHeight || !myMapType || !myMapZoom || !dmlMapCustomCode) {
		alert("Missing data. All areas are required.");
	} else if (!$.isNumeric(myMapHeight) || !$.isNumeric(myMapZoom)) {
		alert("Please enter numeric value for Map Height and Zoom fields.");
	} else {
		DbStatus = 0; // Map will be reloaded

		if (myMapType == 0) {
			dmlCheckColumnDataType(myMapID, dmlMapCustomCode);
		}

		var myMapSaveSettings = dmlServer + "/dmlmap/dmlmapfunctions.php?SaveType=5&CntID=" + myMapID + "&myField1=CntField3&myDeger1=" + myMapApi + "&myField2=CntField4&myDeger2=" + myMapHeight + "&myField3=CntField5&myDeger3=" + myMapType + "&myField4=CntField8&myDeger4=" + myMapZoom + "&myField5=CntField6&myDeger5=" + dmlLayerStatusToDb + " ";
		CallSaveHandler(myMapSaveSettings, 1);

	}

}
function dmlCheckColumnDataType(myMapID, dmlMapCustomCode) {
	$.ajax({
		url: dmlServer + "/dmlmap/dmlmapfunctions.php?SaveType=coltype",
		type: 'POST',
		data: {},
		success: function (result) {
			console.log(result);

			if (result == 1) {
				dmlSaveJsonCustomMapStyle(myMapID, dmlMapCustomCode);
			} else {
				alert("There is an error. To fix it please change the type of the CntField7 column in tbldmlmapcontent table into MEDIUMTEXT and thn try again.");
			}
		}
	});
}
function dmlSaveJsonCustomMapStyle(myID, myData) {
	$.ajax({
		url: dmlServer + "/dmlmap/dmlmapfunctions.php?SaveType=postjson",
		type: 'POST',
		data: { CntID: myID, myField1: 'CntField7', myDeger1: myData },
		success: function (result) {
			ClearAllDbMarkers();
			var myLocation = $(location).attr('href');
			CallHandler(myLocation);
			deleteMarkers();
		}
	});
}

// Saving functions
function dmlMarkerImgVidLinkHelper(myDeger) {
	var myResult;
	if (myDeger == '' || myDeger == 'null') {
		myResult = '.';
	} else {
		myResult = myDeger;
	}
	return myResult;
}
function dmlMarkerLinkHelper(myDeger) {
	var myResult;
	if (myDeger == '' || myDeger == 'null') {
		myResult = '.';
	} else {
		myResult = myDeger;
	}
	return myResult;
}

// Show functions
function dmlMarkerShowEmptyHelper(myDeger) {
	var myResult;
	if (myDeger == '' || myDeger == 'null' || myDeger == '.') {
		myResult = '';
	} else {
		myResult = myDeger;
	}
	return myResult;
}

// InfoWindow functions
function dmlWriteInfoImageHelper(myId, myValue) {
	var myResult;
	if (myValue == '.') {
		myResult = '<br><span id="' + myId + '_IMG" style="display: none;">' + myValue + '</span><br>';
	} else {
		myResult = '<br><span id="' + myId + '_IMG" style="display: none;">' + myValue + '</span><image width="250" height="150" src="' + myValue + '" /><br>';
	}
	return myResult;
}
function dmlWriteInfoVideoHelper(myId, myValue) {
	var myResult;
	if (myValue == '.') {
		myResult = '<span id="' + myId + '_VID" style="display: none;">' + myValue + '</span>';
	} else {
		myResult = '<span id="' + myId + '_VID" style="display: none;">' + myValue + '</span><iframe width="250" height="150" src="https://www.youtube.com/embed/' + myValue + '" frameborder="0" allowfullscreen=""></iframe><br>';
	}
	return myResult;
}
function dmlWriteInfoLink(myId, myLinkText, myLinkUrl) {
	var myResult;
	if (myLinkText == '.' || myLinkUrl == '.') {
		myResult = '<span id="' + myId + '_LT" style="display: none;">' + myLinkText + '</span><span id="' + myId + '_LU" style="display: none;">' + myLinkUrl + '</span>';
	} else {
		myResult = '<span id="' + myId + '_LT" style="display: none;">' + myLinkText + '</span><span id="' + myId + '_LU" style="display: none;">' + myLinkUrl + '</span><a href="' + myLinkUrl + '" target="blank">' + myLinkText + '</a><br>';
	}
	return myResult;
}
function dmlWriteShapeInfoImageHelper(myValue) {
	var myResult;
	if (myValue == '.') {
		myResult = '<br>';
	} else {
		myResult = '<br><image width="250" height="150" src="' + myValue + '" /><br>';
	}
	return myResult;
}
function dmlWriteShapeInfoVideoHelper(myValue) {
	var myResult;
	if (myValue == '.') {
		myResult = '';
	} else {
		myResult = '<iframe width="250" height="150" src="https://www.youtube.com/embed/' + myValue + '" frameborder="0" allowfullscreen=""></iframe><br>';
	}
	return myResult;
}
function dmlWriteShapeInfoLink(myLinkText, myLinkUrl) {
	var myResult;
	if (myLinkText == '.' || myLinkUrl == '.') {
		myResult = '';
	} else {
		myResult = '<a href="' + myLinkUrl + '" target="blank">' + myLinkText + '</a><br>';
	}
	return myResult;
}

// ****MAP CONTENT FUNCTIONS
function setMapOnAll(map) {
	// Sets the map on all markers in the array.
	for (var i = 0; i < markers.length; i++) {
		markers[i].setMap(map);
	}
}
function clearMarkers() {
	// Removes the markers from the map, but keeps them in the array.
	setMapOnAll(null);
	MarkerArr = [];
}
function showMarkers() {
	// Shows any markers currently in the array.
	setMapOnAll(map);
}
function deleteMarkers() {
	// Deletes all markers in the array by removing references to them.
	clearMarkers();
}


// Changes map type
function Map1ChangeType(myValue) {

	if (myValue == 1) {
		map.setMapTypeId(google.maps.MapTypeId.SATELLITE);
	}
	else if (myValue == 2) {
		map.setMapTypeId(google.maps.MapTypeId.ROADMAP);
	}
	else if (myValue == 3) {
		map.setMapTypeId(google.maps.MapTypeId.TERRAIN);
	}
	//UPDATING SETTING PARAMETERS
	myArr[0].CntField5 = myValue;
}

// ****DATABASE AJAX FUNCTIONS
function CallSaveHandler(mySaveString, myModalToggle) {
	if (myModalToggle == 1) {
		$("#mySettings").modal("toggle");
	}
	var choice = {};
	choice.url = mySaveString;
	choice.type = "POST";
	choice.data = {};
	choice.processData = false;
	choice.success = function (result) {
		ClearAllDbMarkers();
		var myLocation = $(location).attr('href');
		CallHandler(myLocation);
		deleteMarkers();
	};
	choice.error = function (err) { alert(err.statusText); };
	$.ajax(choice);
	event.preventDefault();
}
function SaveSettings() {
	var mySaveType = $("#BtnSettingsSave").val();
	if (mySaveType == "Save Settings") {
		SaveSettingsPanel();
	} else if (mySaveType == "Save Text") {
		var myID = $("#dmlEditMarkerId").html();
		var myTitle = $("#dmlMarkerTitleValue").val();
		var myDesc = $("#dmlMarkerDescValue").val();
		var myImageLink = dmlMarkerImgVidLinkHelper($("#dmlMarkerImageValue").val());
		var myVideoLink = dmlMarkerImgVidLinkHelper($("#dmlMarkerVideoValue").val());
		var myMarkerLinkText = dmlMarkerLinkHelper($("#dmlMarkerLinkValue").val());
		var myMarkerLinkUrl = dmlMarkerLinkHelper($("#dmlMarkerLinkUrlValue").val());
		if (!myID || !myTitle || !myDesc || !myImageLink || !myVideoLink || !myMarkerLinkText || !myMarkerLinkUrl) {
			alert("Missing data for save!");
		} else {
			var myColorSaveString = dmlServer + "/dmlmap/dmlmapfunctions.php?SaveType=6&CntID=" + myID + "&myField1=CntField3&myDeger1=" + myTitle + "&myField2=CntField4&myDeger2=" + myDesc + "&myField3=CntField7&myDeger3=" + myImageLink + "&myField4=CntField8&myDeger4=" + myMarkerLinkText + "&myField5=CntField9&myDeger5=" + myMarkerLinkUrl + "&myField6=CntField10&myDeger6=" + myVideoLink + "  ";
			CallSaveHandler(myColorSaveString, 1);
		}
	} else if (mySaveType == "Change Icon") {
		var mySelectedIconContainer = jQuery("#dmlMySelectediconContainer").html();
		var mySelectedIconContainerColor = jQuery("#dml_Icon_Container_Color_Text").html();
		var rawColorCode = mySelectedIconContainerColor.replace('#', '');
		var mySelectedIconNumber = jQuery("#dmlMySelectediconID").html();

		if (!mySelectedIconContainer) {
			alert("Please select a icon container");
		} else if (!mySelectedIconContainerColor) {
			alert("Please select container color");
		} else if (!mySelectedIconNumber) {
			alert("Please select an icon");
		} else {
			var myIconStringToDb = mySelectedIconNumber + '_' + mySelectedIconContainer + '_' + rawColorCode;
			var myNewIconMarkerId = jQuery("#dmlSelectedIconMarkerId").html();
			DbStatus = 0; //Map will be reloaded
			var myiconSaveString = dmlServer + "/dmlmap/dmlmapfunctions.php?SaveType=1&CntID=" + myNewIconMarkerId + "&myField1=CntField6&myDeger1=" + myIconStringToDb + " ";
			CallSaveHandler(myiconSaveString, 1);

		}
	}
}
function ClearHashtags(myText) {
	// Clears HASHTAGs before saving to database
	myText = myText.replace("#", "hashtag");
	return myText;
}
function DeleteDbMarker(myMarkerID) {
	var r = confirm("Do you want to delete this marker?");
	if (r == true) {
		myDeleteStr = dmlServer + "/dmlmap/dmlmapfunctions.php?SaveType=del1&CntID=" + myMarkerID + " ";
		CallSaveHandler(myDeleteStr, 0);

	}
}
function ResetControl() {
	var myButtonText = $("#BtnReset").val();
	var myDecisionText;
	var myResetStr;

	if (myButtonText == "Reset Map") {
		// Resets the control by deleting all data from database
		myDecisionText = "Do you want to reset the map for this page?";
		var myUrl = $(location).attr('href');
		myResetStr = dmlServer + "/dmlmap/dmlmapfunctions.php?SaveType=res&CntUsrCtrlID=1&url=" + myUrl + " ";
	} else if (myButtonText == "Delete Line") {
		// Deletes one record from the database based on the ID number
		var myLineID = $("#dmlLineSettingsIdValue").text();
		myDecisionText = "Do you want to delete line?";
		myResetStr = dmlServer + "/dmlmap/dmlmapfunctions.php?SaveType=del1&CntID=" + myLineID + " ";
	} else if (myButtonText == "Delete Polygon") {
		// Deletes one record from the database based on the ID number
		var myPolygonID = $("#dmlPolygonSettingsIdValue").text();
		myDecisionText = "Do you want to delete polygon?";
		myResetStr = dmlServer + "/dmlmap/dmlmapfunctions.php?SaveType=del1&CntID=" + myPolygonID + " ";
	} else if (myButtonText == "Delete Circle") {
		// Deletes one record from the database based on the ID number
		var myCircleID = $("#dmlCircleSettingsIdValue").text();
		myDecisionText = "Do you want to delete circle?";
		myResetStr = dmlServer + "/dmlmap/dmlmapfunctions.php?SaveType=del1&CntID=" + myCircleID + " ";
	}

	var r = confirm(myDecisionText);
	if (r == true) {
		CallSaveHandler(myResetStr, 1);
	}
}

//******INSERT STARTS*******
function dmlCreateMap() {
	var myApi = $("#dmlTxtApiKey").val();
	var myUrl = $(location).attr('href');
	var choice = {};
	choice.url = dmlServer + "/dmlmap/dmlmapfunctions.php?SaveType=cmap&api=" + myApi + "&url=" + myUrl;
	choice.type = "POST";
	choice.data = {};
	choice.processData = false;
	choice.success = function (result) {
		document.getElementById("dmlApiKeyError").innerHTML = "<h3>" + result + "</h3><p>Please click on the button below to activate your map.</p><br /><div id='dmlBtnActivateMap' onclick='FncDmlActivateMap();' class='btn btn-success'>Activate Map</div>";
		$("#dmlApiEnterPanel").hide();
	};
	choice.error = function (err) { alert(err.statusText + "KK"); };
	$.ajax(choice);
	event.preventDefault();
}

//******ACTIVATE MAPS STARTS*******
function FncDmlActivateMap() {
	location.reload();
}


//****** DISTANCE CALCULATING ******
function dml_add_for_distance(distLat, distLng) {
	jQuery("#BtnSettings").hide();
	if (dmlDistStatus == 0) {
		dmlDistLocation1_lat = distLat;
		dmlDistLocation1_lng = distLng;
		dmlDistStatus = 1;
		jQuery("#distance_road").html('<hr /><span class="dmlselectdistancediv" style="color: blue; text-decoration: underline; cursor: pointer;" onclick="dml_Reset_Distance_Elements();" >Reset calculation</span><br/>First location : ' + dmlDistLocation1_lat + ' - ' + dmlDistLocation1_lng);
		alert("Select a second location or a marker.");
	} else if (dmlDistStatus == 1) {
		//Checks if selected second point is the same with forst one
		if (dmlDistLocation1_lat == distLat && dmlDistLocation1_lng == distLng) {
			alert("Selected location is the same with the first one. Please select another location.");
		} else {
			dmlDistLocation2_lat = distLat;
			dmlDistLocation2_lng = distLng;
			dmlDistStatus = 2;
			dml_Compute_Distance();
		}
	} else {
		alert("You have selected 2 points. To compute new distance you have to clear current calculation.");
	}
}
function dml_Compute_Distance() {
	// show route between the points
	var directionsService = new google.maps.DirectionsService();
	directionsDisplay = new google.maps.DirectionsRenderer(
		{
			suppressMarkers: true,
			suppressInfoWindows: true
		});
	directionsDisplay.setMap(map);
	var dmlOriginLocation = { lat: parseFloat(dmlDistLocation1_lat), lng: parseFloat(dmlDistLocation1_lng) };
	var dmlDestinationLocation = { lat: parseFloat(dmlDistLocation2_lat), lng: parseFloat(dmlDistLocation2_lng) };
	var request = {
		origin: dmlOriginLocation,
		destination: dmlDestinationLocation,
		travelMode: google.maps.DirectionsTravelMode.DRIVING
	};
	directionsService.route(request, function (response, status) {
		if (status == google.maps.DirectionsStatus.OK) {
			directionsDisplay.setDirections(response);
			distance = '<hr /><span class="dmlselectdistancediv"  style="color: blue; text-decoration: underline; cursor: pointer;" onclick="dml_Reset_Distance_Elements();" >Reset calculation</span><br/>First location : ' + dmlDistLocation1_lat + ' - ' + dmlDistLocation1_lng + '<br />Second location : ' + dmlDistLocation2_lat + ' - ' + dmlDistLocation2_lng;
			distance += "<br/>The distance between the two points on the chosen route is: <b>" + response.routes[0].legs[0].distance.text + "</b>";
			distance += "<br/>The aproximative driving time is: <b>" + response.routes[0].legs[0].duration.text + "</b>";
			jQuery("#distance_road").html(distance);
		}
	});

	// show a line between the two points
	dmlDistline = new google.maps.Polyline({
		map: map,
		path: [dmlOriginLocation, dmlDestinationLocation],
		strokeWeight: 7,
		strokeOpacity: 0.8,
		strokeColor: "#FF0000"
	});

	// create the markers for the two locations		
	dmlDistmarker1 = new google.maps.Marker({
		map: map,
		position: dmlOriginLocation,
		title: "First location"
	});
	dmlDistmarker2 = new google.maps.Marker({
		map: map,
		position: dmlDestinationLocation,
		title: "Second location"
	});

	// compute distance between the two points
	var R = 6371;
	var myLatDegfor_toRoad = parseFloat(dmlDestinationLocation.lat) - parseFloat(dmlOriginLocation.lat);
	var myLngDegfor_toRoad = parseFloat(dmlDestinationLocation.lng) - parseFloat(dmlOriginLocation.lng);
	var dLat = dml_toRad(myLatDegfor_toRoad);
	var dLon = dml_toRad(myLngDegfor_toRoad);

	var dLat1 = dml_toRad(dmlOriginLocation.lat);
	var dLat2 = dml_toRad(dmlDestinationLocation.lat);

	var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(dLat1) * Math.cos(dLat1) *
		Math.sin(dLon / 2) * Math.sin(dLon / 2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	var d = R * c;

	jQuery("#distance_direct").html('The distance between the two points (in a straight line) is: <b>' + d + '</b>');
}
function dml_toRad(deg) {
	return deg * Math.PI / 180;
}
function dml_Reset_Distance_Elements() {
	var r = confirm("Do you want to clear calculations from the map?");
	if (r == true) {
		dmlDistStatus = 0;
		directionsDisplay.setMap(null);
		dmlDistmarker1.setMap(null);
		dmlDistmarker2.setMap(null);
		dmlDistline.setMap(null);
		jQuery("#distance_road").html("");
		jQuery("#distance_direct").html("");
		deleteMarkers();
	}
}