/************************************************************
*															*
* PHP JS CSS Image Slider v1.0.0							*
*															*
* Copyright 2016, PedroHenriques 							*
* http://www.pedrojhenriques.com 							*
* https://github.com/PedroHenriques 						*
*															*
* Free to use under the MIT license.			 			*
* http://www.opensource.org/licenses/mit-license.php 		*
*															*
************************************************************/

// CUSTOMIZABLE VARIABLES
/**************************************************************************/
// total horizontal space, in pixels, to leave as margin on each slider
width_buffer_ = 30;
// total vertical space, in pixels, to leave as margin on each slider
height_buffer_ = 30;
// minimum width, in pixels, for the slider
min_width_ = 450;
// minimum height, in pixels, for the slider
min_height_ = 450;
/**************************************************************************/


// this function is called when the page is loaded
// sets the global variables, sizes for auto resizing sliders and starts the timer on auto sliders
function sliderInit() {
	// global variable used to store the image list for each slider in this page
	sliders_data_ = new Object;

	// local variable used to store the names of the sliders on this page
	var slider_names = new Array;

	// local variable used to store the names of the automatic sliders on this page
	var auto_slider_names = new Array;

	// find all the sliders on this webpage
	var sliders = document.querySelectorAll(".slider");

	// loop through each of the sliders and process them
	for (var i = 0; i < sliders.length; i++) {
		// determine this slider's name
		var slider_name = sliders[i].id.slice(0, -"slider".length);

		// check if we have this slider's entry in the slider data global variable
		if (!sliders_data_.hasOwnProperty(slider_name)) {
			// we don't, so define it
			Object.defineProperty(sliders_data_, slider_name, {
				value: {
					"image_list": null,
					"image_list_count" : null,
					"image_elems": null,
					"image_directory" : null,
					"interval_delay" : null,
					"interval_id" : null,
					"cur_button_id" : 1,
					"switch_duration" : null
				},
				writable: true,
				enumerable: true
			});

			// grab a reference to the image HTML wrapper and its children
			var images_elem = document.getElementById(slider_name + "images");
			var image_elems = images_elem.children;
			// store the image list into the global slider data object
			sliders_data_[slider_name]["image_elems"] = image_elems;

			// find and store the path to this slider's image directory
			var regexp_matches = getCurrentImageURL(slider_name, sliders_data_[slider_name]["image_elems"][0]);
			if (regexp_matches == null) {
				// couldn't find the directory, so continue
				continue;
			}
			sliders_data_[slider_name]["image_directory"] = regexp_matches[1];

			// check if this slider is going to automaticaly switch images
			var interval_delay = sliders[i].getAttribute("data-auto-interval");
			if (interval_delay != null) {
				// type cast the value to an integer
				interval_delay = parseFloat(interval_delay);

				// if the delay is valid, store it
				if (interval_delay !== NaN && interval_delay > 0) {
					// store the delay to be used, in milliseconds
					sliders_data_[slider_name]["interval_delay"] = interval_delay;

					// store this name in the auto sliders array
					auto_slider_names.push(slider_name);
				}
			}

			// store this name in the slider names array
			slider_names.push(slider_name);
		}
	}

	// if no valid sliders exist, bail out
	if (slider_names.length == 0) {
		return;
	}

	// call the function that sets the sliders dimensions
	setSlidersDimensions();

	// loop through the automatic sliders and start them
	for (var i = 0; i < auto_slider_names.length; i++) {
		// get the slider's name
		var slider_name = auto_slider_names[i];

		// if this slider isn't automatic, nothing else is needed
		if (sliders_data_[slider_name]["interval_delay"] == null) {
			continue;
		}

		// at this point this slider is automatic -> start the timer
		startAutoSlider(slider_name);

		// grab a reference to this slider
		var slider_elem = document.getElementById(slider_name + "slider");

		// set the event listeners to stop and restart the timer when the mouse enters and leaves the slider
		if (slider_elem.addEventListener) {
			slider_elem.addEventListener("mouseenter", function(e) {stopAutoSlider(e.target.id.slice(0, -"slider".length));}, false);
			slider_elem.addEventListener("mouseleave", function(e) {startAutoSlider(e.target.id.slice(0, -"slider".length));}, false);
		}else if (slider_elem.attachEvent){
			slider_elem.attachEvent("onmouseenter", function(e) {stopAutoSlider(e.target.id.slice(0, -"slider".length));});
			slider_elem.attachEvent("onmouseleave", function(e) {startAutoSlider(e.target.id.slice(0, -"slider".length));});
		}
	}

	// loop through all the sliders, get their image list and adjust the
	// background-size property, if needed, to avoid stretching and pixelating the current image
	slidersGetImageList(slider_names);

	// add the event listener for window resizing to readjust the slider's dimensions
	window.onresize = function() {setSlidersDimensions();};
}

// this function will set the width and height for the sliders in the page
// it will also calculate the font-size for the arrows (for the sliders that have them)
function setSlidersDimensions() {
	// grab information about the viewport's dimensions
	var viewport_height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
	var viewport_width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

	// determine the vertical scrollbar's width
	var scrollbar_width = getScrollBarWidth();

	// loop through each of the sliders and process them
	for (var slider_name in sliders_data_) {
		// grab a reference to this slider
		var slider_elem = document.getElementById(slider_name + "slider");

		// if this slider is NOT to be auto resized, continue
		var data_max_width = slider_elem.getAttribute("data-max-width");
		var data_max_height = slider_elem.getAttribute("data-max-height");
		if (data_max_width == null || data_max_height == null) {
			continue;
		}

		// calculate the this slider's coordinates and dimensions
		var slider_rect = slider_elem.getBoundingClientRect();

		// grab a reference to the images element and it's styles
		var images_elem = document.getElementById(slider_name + "images");
		var images_styles = images_elem.currentStyle || window.getComputedStyle(images_elem);

		// calculate the slider's image width percentage, in relation to the slider's width
		var images_width_perc = parseFloat(images_styles.width) / slider_rect.width;

		// calculate the available width for this slider's image
		var images_usable_width = Math.max(viewport_width - scrollbar_width - slider_rect.left - width_buffer_, min_width_) * images_width_perc;

		// calculate the slider's image height percentage, in relation to the slider's height
		var images_height_perc = parseFloat(images_styles.height) / slider_rect.height;

		// calculate the available height for this slider's image
		var images_usable_height = Math.max(viewport_height - height_buffer_, min_height_) * images_height_perc;

		// grab the info about this slider's image max width and height
		var images_max_width = data_max_width.split(":");
		var images_max_height = data_max_height.split(":");

		// determine if the usable width and height are enought
		if (images_usable_width >= images_max_width[0]) {
			var enought_width = true;
		}else{
			var enought_width = false;
		}
		if (images_usable_height >= images_max_height[1]) {
			var enought_height = true;
		}else{
			var enought_height = false;
		}

		// auxiliary variable to store calculation results
		var calc_aux = new Object;
		// variable used to store the dimension that is restricting factor, if any
		var rf_dimension = ""; // by default there is no restricting factor

		// calculate slider dimensions, based on the dimensions that are restricting factors
		if (!enought_width || !enought_height) {
			// 1 or both dimensions are restricting factors

			// set the necessary fields to store the calculation results
			calc_aux = {
				"width_rf" : {
					"max_width" : {
						"w" : images_usable_width,
						"h" : 0,
						"delta" : 0
					},
					"max_height" : {
						"w" : images_usable_width,
						"h" : 0,
						"delta" : 0
					}
				},
				"height_rf" : {
					"max_width" : {
						"w" : 0,
						"h" : images_usable_height,
						"delta" : 0
					},
					"max_height" : {
						"w" : 0,
						"h" : images_usable_height,
						"delta" : 0
					}
				}
			};

			// if width is a restricting factor, make the necessary calculations
			if (!enought_width) {
				// assume all images will be set to the width of images_usable_width -> what would be their height?
				calc_aux["width_rf"]["max_width"]["h"] = parseFloat(images_usable_width * images_max_width[1] / images_max_width[0]);
				calc_aux["width_rf"]["max_height"]["h"] = parseFloat(images_usable_width * images_max_height[1] / images_max_height[0]);
				calc_aux["width_rf"]["max_width"]["delta"] = calc_aux["width_rf"]["max_width"]["w"] - images_usable_width + calc_aux["width_rf"]["max_width"]["h"] - images_usable_height;
				calc_aux["width_rf"]["max_height"]["delta"] = calc_aux["width_rf"]["max_height"]["w"] - images_usable_width + calc_aux["width_rf"]["max_height"]["h"] - images_usable_height;

				// do the images fit?
				if (calc_aux["width_rf"]["max_width"]["h"] <= images_usable_height && calc_aux["width_rf"]["max_height"]["h"] <= images_usable_height) {
					// they do
					rf_dimension = "w";
				}
			}

			// if height is a restricting factor AND we still haven't found a valid configuration
			// make the necessary calculations
			if (!enought_height && rf_dimension === "") {
				// assume all images will be set to the height of images_usable_height -> what would be their width?
				calc_aux["height_rf"]["max_width"]["w"] = parseFloat(images_usable_height * images_max_width[0] / images_max_width[1]);
				calc_aux["height_rf"]["max_height"]["w"] = parseFloat(images_usable_height * images_max_height[0] / images_max_height[1]);
				calc_aux["height_rf"]["max_width"]["delta"] = calc_aux["height_rf"]["max_width"]["w"] - images_usable_width + calc_aux["height_rf"]["max_width"]["h"] - images_usable_height;
				calc_aux["height_rf"]["max_height"]["delta"] = calc_aux["height_rf"]["max_height"]["w"] - images_usable_width + calc_aux["height_rf"]["max_height"]["h"] - images_usable_height;

				// do the images fit?
				if (calc_aux["height_rf"]["max_width"]["w"] <= images_usable_width && calc_aux["height_rf"]["max_height"]["w"] <= images_usable_width) {
					// they do
					rf_dimension = "h";
				}
			}

			// above we treated each dimension independently
			// if we didn't find a valid configuration, look at both dimensions together
			if (rf_dimension === "") {
				// none of them alone work, so check which dimension has the lower deviation and go with it
				var delta_width_rf = calc_aux["width_rf"]["max_width"]["delta"] + calc_aux["width_rf"]["max_height"]["delta"];
				var delta_height_rf = calc_aux["height_rf"]["max_width"]["delta"] + calc_aux["height_rf"]["max_height"]["delta"];
				if (Math.abs(delta_width_rf) < Math.abs(delta_height_rf)) {
					rf_dimension = "w";
				}else if (Math.abs(delta_width_rf) > Math.abs(delta_height_rf)) {
					rf_dimension = "h";
				}else if (delta_width_rf < delta_height_rf) {
					rf_dimension = "w";
				}else{
					rf_dimension = "h";
				}
			}
		}

		// set this slider's new width and height values, based on the restricting factor
		switch (rf_dimension) {
			case "w":
				// width is the restricting factor
				slider_elem.style.width = images_usable_width / images_width_perc + "px";
				slider_elem.style.height = Math.min(images_usable_height, Math.max(calc_aux["width_rf"]["max_width"]["h"], calc_aux["width_rf"]["max_height"]["h"])) / images_height_perc + "px";

				break;

			case "h":
				// height is the restricting factor
				slider_elem.style.width = Math.min(images_usable_width, Math.max(calc_aux["height_rf"]["max_width"]["w"], calc_aux["height_rf"]["max_height"]["w"])) / images_width_perc + "px";
				slider_elem.style.height = images_usable_height / images_height_perc + "px";
				break;

			default:
				// there is no restricting factor
				// use the minimum width and height to fit the largest images
				// (taking into account the slider minimum dimesnsions)
				slider_elem.style.width = Math.max(images_max_width[0] / images_width_perc, min_width_) + "px";
				slider_elem.style.height = Math.max(images_max_height[1] / images_height_perc, min_height_) + "px";

		}

		// if this slider has the previous/next arrows, calculate their font-size
		var prevarrow_elem = document.getElementById(slider_name + "prevarrow");
		var nextarrow_elem = document.getElementById(slider_name + "nextarrow");
		if (prevarrow_elem != null && nextarrow_elem != null) {
			// compute the arrow current width
			var arrow_styles = prevarrow_elem.currentStyle || window.getComputedStyle(prevarrow_elem);
			var arrow_fontsize = parseFloat(arrow_styles.width);

			// set the arrow's new font-size
			prevarrow_elem.style.fontSize = arrow_fontsize + "px";
			nextarrow_elem.style.fontSize = arrow_fontsize + "px";
		}
	}
}

// this function will process image switch triggers coming from the previous and next arrows
function processArrowEvents(arrow_id, increment) {
	// sanity check
	if (!arrow_id || !increment) {
		return;
	}

	// find the slider name from the button id
	var regexp_name = new RegExp("^(.+)(prev|next)arrow$", "i");
	var regexp_matches = arrow_id.match(regexp_name);
	if (regexp_matches == null) {
		// couldn't find the slider name, so return
		return;
	}
	var slider_name = regexp_matches[1];

	// bail out if the sliders_data_ doesn't have this slider's info
	if (!sliders_data_.hasOwnProperty(slider_name)) {
		return;
	}

	// sanitize parameter
	increment = parseInt(increment);

	// the button id to use is the one before or after the currently active button
	// at this point it doesn't matter if the current button is the first or last one, that check will be made later
	// in the code and if it's the case it will go back to the last or first button
	sliderEventHandler((sliders_data_[slider_name]["cur_button_id"] + increment) + "_" + slider_name + "button");
}

// this function will be called everytime an image switch is triggered
// either manualy by the user or automaticaly by the timers
function sliderEventHandler(new_button_id) {
	// sanity check
	if (!new_button_id) {
		return;
	}
	new_button_id = escape(new_button_id);

	// find the number id of the desired image and the slider's name
	var regexp_name = new RegExp("^(\\d)_(.+)button$", "i");
	var regexp_matches = new_button_id.match(regexp_name);
	if (regexp_matches == null) {
		// couldn't find the number id, so return
		return;
	}
	var new_id = parseInt(regexp_matches[1]);
	var slider_name = regexp_matches[2];

	// if we don't have this slider's image element references in the slider data global variable, bail out
	if (sliders_data_[slider_name]["image_elems"] == null) {
		return;
	}

	// if we don't have the image list for this slider, bail out
	if (sliders_data_[slider_name]["image_list"] == null) {
		return;
	}

	// if the new button number id is the same as the currently active button, bail out
	if (new_id == sliders_data_[slider_name]["cur_button_id"]) {
		return;
	}

	// find the image element that is in the front and the one that is in the back
	var image_elem_key_front = -1;
	var image_elem_key_back = -1;
	for (var i = 0; i < sliders_data_[slider_name]["image_elems"].length; i++) {
		if (sliders_data_[slider_name]["image_elems"][i].classList.contains("front")) {
			image_elem_key_front = i;
		}else if (sliders_data_[slider_name]["image_elems"][i].classList.contains("back")) {
			image_elem_key_back = i;
		}
	}
	// sanity check
	if (image_elem_key_front == -1 || image_elem_key_back == -1) {
		return;
	}

	// find the currently visible image name and path to this slider's images on the server
	var regexp_matches = getCurrentImageURL(slider_name, sliders_data_[slider_name]["image_elems"][image_elem_key_front]);
	if (regexp_matches == null) {
		// couldn't find the number id, so return
		return;
	}

	// call the function that executes the image switch
	sliderProcessImageData(slider_name, regexp_matches[2], image_elem_key_front, image_elem_key_back, new_id);
}

// this function will process the image data to determine the currently visible image
// and the URL of the new image to be displayed
// once done it calls the function to load the new image
function sliderProcessImageData(slider_name, cur_image_name, image_elem_key_front, image_elem_key_back, new_id) {
	// sanity check
	if (slider_name === "" || new_id === "") {
		return;
	}

	// if the new_id is greater than the number of images, use the 1st one
	if (parseInt(new_id) > sliders_data_[slider_name]["image_list_count"]) {
		new_id = "1";
	// if the new_id is lower than the 1st image, use the last one
	}else if (parseInt(new_id) < 1) {
		new_id = sliders_data_[slider_name]["image_list_count"];
	}


	// find the number id of the currently visible image
	var cur_id = "-1";
	for (var key in sliders_data_[slider_name]["image_list"]) {
		// check if this is the current image
		if (sliders_data_[slider_name]["image_list"][key] === cur_image_name) {
			// it is, so store the key and exit loop
			cur_id = key;
			break;
		}
	}
	if (cur_id == "-1") {
		// couldn't find the number id, so return
		return;
	}

	// disable the transitions for the images element
	// this is to allow the back image element to reposition, if we're changing directions,
	// instantly, otherwise the transitions would merge and not work as intended
	var images_elem = document.getElementById(slider_name + "images");
	images_elem.classList.remove("with_transition");

	// determine if we're moving forwards or backwards in the image chain
	// and make the necessary class adjustments
	if (parseInt(new_id) - parseInt(cur_id) > 0) {
		// we're moving forwards, either to an image later in the chain or from the last one to the first
		if (!images_elem.classList.contains("forward")) {
			images_elem.classList.add("forward");
			images_elem.classList.remove("backward");
		}
	}else{
		// we're moving backwards, either to an image before in the chain or from the first one to the last
		if (!images_elem.classList.contains("backward")) {
			images_elem.classList.add("backward");
			images_elem.classList.remove("forward");
		}
	}

	// call for the load of the new image
	sliderLoadImage(true, slider_name, cur_id, new_id, image_elem_key_front, image_elem_key_back);
}

// this function will load an image and execute a callback when the image is done loading
function sliderLoadImage(event_called, slider_name, cur_id, new_id, image_elem_key_front, image_elem_key_back) {
	// process the slider_name parameter, based on where we called this function
	if (!event_called) {
		// sanity check
		if (slider_name.length == 0) {
			return;
		}

		// make a copy of the names array
		var slider_names = slider_name;

		// grab and remove the last item in the array
		var slider_name = slider_names.pop();
	}

	// create an image object
	var image_obj = new Image();

	// build the new image's url
	var new_image_url = sliders_data_[slider_name]["image_directory"] + "/" + sliders_data_[slider_name]["image_list"][new_id];

	// set the callback for when the image is loaded
	image_obj.onload = function() {
		// if this image is smaller than its container, remove the "background-size: contain"
		// to avoid having the image scaled up and pixelated
		if (image_obj.width < sliders_data_[slider_name]["image_elems"][image_elem_key_back].clientWidth && image_obj.height < sliders_data_[slider_name]["image_elems"][image_elem_key_back].clientHeight) {
			sliders_data_[slider_name]["image_elems"][image_elem_key_back].style.backgroundSize = "initial";
		}else{
			// the image doesn't fit, so use the default value in the CSS file
			sliders_data_[slider_name]["image_elems"][image_elem_key_back].style.backgroundSize = "";
		}

		// determine the next step
		if (event_called) {
			// update the background-image style's url
			sliders_data_[slider_name]["image_elems"][image_elem_key_back].style.backgroundImage = "url('" + new_image_url + "')";

			// call the function to switch the image elements
			sliderUpdate(slider_name, cur_id, new_id, image_elem_key_front, image_elem_key_back);
		}else if (slider_names.length > 0) {
			// check the next slider
			slidersGetImageList(slider_names);
		}
	};

	// set the src attribute for the image object
	image_obj.src = new_image_url;
}

// this function switches the image elements
function sliderUpdate(slider_name, cur_id, new_id, image_elem_key_front, image_elem_key_back) {
	// turn the currently active button  OFF and the new one ON
	var cur_button_elem = document.getElementById(cur_id + "_" + slider_name + "button");
	var new_button_elem = document.getElementById(new_id + "_" + slider_name + "button");
	if (cur_button_elem != null && new_button_elem != null) {
		cur_button_elem.classList.remove("active");
		cur_button_elem.classList.add("inactive");
		new_button_elem.classList.remove("inactive");
		new_button_elem.classList.add("active");
	}


	// turn the currently visible description OFF and the new one ON
	var cur_description_elem = document.getElementById(cur_id + "_" + slider_name + "description");
	var new_description_elem = document.getElementById(new_id + "_" + slider_name + "description");
	if (cur_description_elem != null && new_description_elem != null) {
		cur_description_elem.classList.remove("visible");
		cur_description_elem.classList.add("hidden");
		new_description_elem.classList.remove("hidden");
		new_description_elem.classList.add("visible");
	}

	// re-enable the transitions for the images element
	document.getElementById(slider_name + "images").classList.add("with_transition");

	// switch the image elements from front to back and vice-versa
	sliders_data_[slider_name]["image_elems"][image_elem_key_front].classList.remove("front");
	sliders_data_[slider_name]["image_elems"][image_elem_key_front].classList.add("middle");
	sliders_data_[slider_name]["image_elems"][image_elem_key_back].classList.remove("back");
	sliders_data_[slider_name]["image_elems"][image_elem_key_back].classList.add("front");

	// set the timer to later switch the middle to back classes
	window.setTimeout(function() {
		sliders_data_[slider_name]["image_elems"][image_elem_key_front].classList.remove("middle");
		sliders_data_[slider_name]["image_elems"][image_elem_key_front].classList.add("back");
	}, sliders_data_[slider_name]["switch_duration"]);

	// update the cur_button_id info in the sliders_data_ object
	sliders_data_[slider_name]["cur_button_id"] = parseInt(new_id);

	// if this slider is automatic preload the next image in the list
	if (sliders_data_[slider_name]["interval_delay"] != null) {
		loadNextImage(slider_name);
	}
}

// this function will call setInterval() for the specified slider
// the timer ID will be store in that slider's data object
function startAutoSlider(slider_name) {
	// bail out if the sliders_data_ doesn't have this slider's info OR this slider
	// is not supposed to be auto switching images
	if (!sliders_data_.hasOwnProperty(slider_name) || sliders_data_[slider_name]["interval_delay"] == null) {
		return;
	}

	// bail out if this slider already has a scheduled timer
	if (sliders_data_[slider_name]["interval_id"] != null) {
		return;
	}

	// start the timer and store the interval ID
	sliders_data_[slider_name]["interval_id"] = window.setInterval(function() {
		// the button id to use is the one after the currently active button
		// at this point it doesn't matter if the current button is the last one, that check will be made later
		// in the code and if it's the case it will go back to the first button
		sliderEventHandler((sliders_data_[slider_name]["cur_button_id"] + 1) + "_" + slider_name + "button");
	}, sliders_data_[slider_name]["interval_delay"]);
}

// this function will call clearInterval() for the specified slider
// the timer ID will be set to null in that slider's data object
function stopAutoSlider(slider_name) {
	// bail out if the sliders_data_ doesn't have this slider's info OR this slider
	// doesn't have a timer ID
	if (!sliders_data_.hasOwnProperty(slider_name) || sliders_data_[slider_name]["interval_id"] == null) {
		return;
	}

	// clear this slider's time
	window.clearInterval(sliders_data_[slider_name]["interval_id"]);

	// set this slider's timer ID to null
	sliders_data_[slider_name]["interval_id"] = null;
}

// this function will preload the image after the currently visible one
// called for automatic sliders
function loadNextImage(slider_name) {
	// create an image object
	var image_obj = new Image();

	// find the next image's number id
	var new_id = (sliders_data_[slider_name]["cur_button_id"] == sliders_data_[slider_name]["image_list_count"] ? 1 : sliders_data_[slider_name]["cur_button_id"] + 1);

	// build the new image's url
	var new_image_url = sliders_data_[slider_name]["image_directory"] + "/" + sliders_data_[slider_name]["image_list"][new_id];

	// set the src attribute for the image object
	image_obj.src = new_image_url;
}

// this function will request the JSON file, from the server, with the list
// of images for the selected slider. Once the data has been acquired it will
// call the function to adjust the slider's current image background-size property
function slidersGetImageList(slider_names) {
	// grab the last item in the array
	var slider_name = slider_names[slider_names.length - 1];

	try{
		if (window.XMLHttpRequest) {
			// code for IE7+, Firefox, Chrome, Opera, Safari
			http_request = new XMLHttpRequest();
		}else{
			// code for IE6, IE5
			http_request = new ActiveXObject("Microsoft.XMLHTTP");
		}

		http_request.onreadystatechange = function() {
			if (http_request.readyState == 4 && http_request.status == 200) {
				// got the answer
				// parse the JSON answer
				try {
					var image_list = JSON.parse(http_request.responseText);
				}catch (e) {
					// the JSON parsing failed, so return
					return;
				}

				// store the image list, and it's count, into the global slider data object
				sliders_data_[slider_name]["image_list"] = image_list;
				sliders_data_[slider_name]["image_list_count"] = Object.keys(image_list).length;

				// call the function that will calculate the image's dimensions and adjust
				// the background-size property if needed
				sliderLoadImage(false, slider_names, "1", "1", 0, 0);
			}
		}
	}catch(e){
		return(false);
	}
	http_request.open("GET", sliders_data_[slider_name]["image_directory"] + "/image_list.json", true);
	http_request.send();
}

// helper function that deermines the number ID of the currently visible image
// based on the front image element's background-image URL attribute
function getCurrentImageURL(slider_name, images_front_elem) {
	var images_front_styles = images_front_elem.currentStyle || window.getComputedStyle(images_front_elem);

	// store this slider's image transition duration
	if (sliders_data_[slider_name]["switch_duration"] == null) {
		// run the regexp to grab the duration and it's measurement unit
		var regexp = new RegExp("^([\\d.]+)(\\D+)$", "i");
		var regexp_matches  = images_front_styles.transitionDuration.match(regexp);

		// convert the duration to milliseconds
		var transition_duration = parseFloat(regexp_matches[1]);
		if (regexp_matches[2] == "s") {
			transition_duration *= 1000;
		}

		sliders_data_[slider_name]["switch_duration"] = transition_duration;
	}

	var regexp = new RegExp("^url\\(\"(.*)\\/(.+)\"\\)$", "i");

	return(images_front_styles.backgroundImage.match(regexp));
}

// this function calculates the width of the vertical scroll bar in use by the browser
function getScrollBarWidth() {
	var inner = document.createElement('p');
	inner.style.width = "100%";
	inner.style.height = "200px";

	var outer = document.createElement('div');
	outer.style.position = "absolute";
	outer.style.top = "0px";
	outer.style.left = "0px";
	outer.style.visibility = "hidden";
	outer.style.width = "200px";
	outer.style.height = "150px";
	outer.style.overflow = "hidden";
	outer.appendChild(inner);

	document.body.appendChild(outer);
	var w1 = inner.offsetWidth;
	outer.style.overflow = 'scroll';
	var w2 = inner.offsetWidth;
	if (w1 == w2) {
		w2 = outer.clientWidth;
	}

	document.body.removeChild(outer);

	return(w1 - w2);
}
