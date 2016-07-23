<?php

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

// this function receives the unique name of the slider we want to create and returns the HTML for that slider
function createImgSlider($name, $opts = []) {
	/*
		Variables used to configure this function
		Modify them to customize the code
	*/
	/* ***************************************************************************** */
	// absolute path to the public directory (usually named "public_html" or "www")
	$path_public_abs = "{$_SERVER["DOCUMENT_ROOT"]}";
	// absolute path to JSON file with button and description text for each image
	$path_json_abs = "{$path_public_abs}/demo/imageslider.json";
	// absolute path to folder with the images for this slider
	$path_images_abs = "{$path_public_abs}/demo/images/{$name}";
	// array with valid image file types
	$images_valid_types = array("png", "jpg", "jpeg", "gif", "bmp");
	// default style to be used. Must be one of the styles present in $style_config below
	$default_style = "ImgFocus";
	// default automatic behavior: false = is not automatic; number = delay between image switch, in milliseconds
	$default_auto = 2000;
	// default DOM event, applied to the slider buttons, that triggers a manual image switch
	$default_event = "click";
	// default button presence: this will only be used if no value is given in $opts for "button" AND the used style doesn't have a default "button" value
	$default_button = true;
	// default description presence: this will only be used if no value is given in $opts for "description" AND the used style doesn't have a default "description" value
	$default_description = true;
	// default arrow presence: this will only be used if no value is given in $opts for "arrow" AND the used style doesn't have a default "arrow" value
	$default_arrow = true;
	// default behavior for elements that are flagged as "above_images": either they are always visible or only when the slider is hovered over
	$default_visibility = "hidden"; // accepts either "visible" or "hidden"
	// default CSS class used to determine the color to fill any empty space around images
	$default_image_fill = "white"; // supported classes: white or black
	// default way images will switch
	$default_switch_type = "slide"; // accepts either "slide" or "opacity"
	/* ***************************************************************************** */

	// This array will define the supported styles and their configuration
	/* ***************************************************************************** */
	$style_config = array(
		"ImgFocus" => array(
			"description_text" => "button;description",
			"button" => true,
			"description" => true,
			"button_class" => "square", // accepts either "square" or "circle"
			"above_images" => "button;description;arrow",
			"visibility" => "hidden"
		),

		"ShowAll" => array(
			"button_text" => "button",
			"description_text" => "description",
			"button" => true,
			"description" => true,
			"button_width" => "equal%" // accepts "equal%"
		)
	);
	/* ***************************************************************************** */

	// if the options parameter isn't an array set it to an empty array
	if (!is_array($opts)) {
		$opts = array();
	}

	// array with all the configurations for this slider
	$slider_config = array();

	// process the "style" to be used
	if (isset($opts["style"]) && isset($style_config[$opts["style"]])) {
		$slider_config["style"] = $opts["style"];
	}else{
		$slider_config["style"] = $default_style;
	}

	// array with all the supported configuration options
	// not including "style" due it's special nature
	$config_keys = array("arrow", "auto", "button", "button_class", "button_misc_class", "description", "description_class",
	"description_misc_class", "event", "image_fill", "size", "switch_type", "visibility", "button_text",
	"description_text", "above_images", "button_width");

	// process the configuration for the slider, according to the hierarchy
	// $opts -> $style_config -> default variables
	foreach ($config_keys as $key) {
		// does this $key exist in $opts?
		if (isset($opts[$key])) {
			$slider_config[$key] = $opts[$key];
		// does this $key exist in $style_config?
		}elseif (isset($style_config[$slider_config["style"]][$key])) {
			$slider_config[$key] = $style_config[$slider_config["style"]][$key];
		// does this $key exist as a default variable?
		}elseif (isset(${"default_$key"})) {
			$slider_config[$key] = ${"default_$key"};
		}
	}

	// validate that the "size" $slider_config value, if present, has a valid format
	if (isset($slider_config["size"])) {
		$regex_str = "/^(\\d+(px|rem|em|%|vh|vw|vmin|vmax)|auto):(\\d+(px|rem|em|%|vh|vw|vmin|vmax)|auto)$/i";
		if (preg_match($regex_str, $slider_config["size"]) !== 1) {
			// the format is not valid, so remove this key to make the slider auto resize
			unset($slider_config["size"]);
		}
	}

	// open the JSON file with the button and content text
	if (file_exists($path_json_abs)) {
	    // grab the JSON file's content, decode it and convert to PHP array
	    $json_content = json_decode(file_get_contents($path_json_abs), true);
	}else{
	    // the JSON file with the text could not be found
		// no button or description text will be available for this slider
		$json_content = array();
	}

	// run each array element recursively and decode any HTML special characters
	$json_array = arrayHtmlSpecialCharsDecode($json_content[$name]);

	// search for this slider's images folder
	if (is_dir($path_images_abs)) {
		// grab all the contents of this slider's image folder
		$dir_contents = scandir($path_images_abs);

		// array used to store the names of the relevant images
		// this array will later be stored in a JSON file
		// the keys are the id number of the image and the values are the names
		$images_list = array();

		// variables used to store the width and height values of the image with
		// biggest width (and biggest width/height ratio) as well as the image with the
		// biggest height (and smallest width/height ratio)
		$max_width = array("w" => "", "h" => "");
		$max_height = array("w" => "", "h" => "");

		// loop through each item and count the valid images
		$images_count = 0;
		foreach ($dir_contents as $file_name) {
			// skip the "." and ".."
			if ($file_name === "." || $file_name === "..") {
				continue;
			}

			// find the file format
			$pos = strrpos($file_name, ".");
			$file_type = substr($file_name, $pos + 1);

			// check if it's a valid file type and the name is an expected name
			$regex_str = "/^[^\\\\\/\:\?\*\"\<\>\|]+\.(".implode($images_valid_types, "|").")$/i";
			if (in_array($file_type, $images_valid_types) && preg_match($regex_str, $file_name) === 1) {
				// it is, so increment the images counter
				$images_count++;

				// if no fixed size was given to this slider, make the necessary calculations
				// for the auto size JS code
				if (!isset($slider_config["size"])) {
					// grab this image's size
					$image_size = getimagesize("{$path_images_abs}/{$file_name}");

					// check if this image has the biggest width and biggest w/h ratio
					if ((int)$image_size[0] > (int)$max_width["w"]) {
						// has the biggest width so far
						$max_width["w"] = (int)$image_size[0];
						$max_width["h"] = (int)$image_size[1];
					}elseif ((int)$image_size[0] == (int)$max_width["w"] && (int)$image_size[0]/(int)$image_size[1] > (int)$max_width["w"]/(int)$max_width["h"]) {
						// has the same width, but bigger w/h ratio
						$max_width["w"] = (int)$image_size[0];
						$max_width["h"] = (int)$image_size[1];
					}

					// check if this image has the biggest height and smallest w/h ratio
					if ((int)$image_size[1] > (int)$max_height["h"]) {
						// has the biggest height so far
						$max_height["w"] = (int)$image_size[0];
						$max_height["h"] = (int)$image_size[1];
					}elseif ((int)$image_size[1] == (int)$max_height["h"] && (int)$image_size[0]/(int)$image_size[1] < (int)$max_height["w"]/(int)$max_height["h"]) {
						// has the same height, but smaller w/h ratio
						$max_height["w"] = (int)$image_size[0];
						$max_height["h"] = (int)$image_size[1];
					}
				}

				// store this image in the image list array
				$images_list[$images_count] = utf8_encode($file_name);
			}
		}
	}else{
		// could not find a directory inside the images folder with this slider's name
		// return an empty string which will echo nothing into the HTML
		return("");
	}

	// create the JSON file with the names of the images to be used in this slider
	if (file_put_contents("{$path_images_abs}/image_list.json", json_encode($images_list)) === false) {
		// something went wrong with the file creation
		// return an empty string which will echo nothing into the HTML
		return("");
	}

	// local variables used to store the HTML parts for the slider
	$buttons_html = "";
	$descriptions_html = "";
	$images_html = "";
	$slider_data_attr = "";
	$slider_styles = "";

	// build the buttons and the descriptions HTML
	for ($i = 1; $i <= $images_count; $i++) {
		// if this slider has buttons, prepare the button HTML
		if ((bool)$slider_config["button"]) {
			// prepare the button's style attribute, based on this slider's configuration
			$button_style_attr = "";
			if (isset($slider_config["button_width"]) && $slider_config["button_width"] !== "") {
				// there is a "width" style attribute for the buttons
				$button_style_attr .= "width:";

				if ($slider_config["button_width"] == "equal%") {
					$button_style_attr .= (1 / $images_count * 100)."%";
				}

				$button_style_attr .= ";";
			}

			// HTML for the button
		    $buttons_html .= "<span id='{$i}_{$name}button' class='slider_item_button".($i == 1 ? " active" : " inactive");
			// add any classes related to this style
			if (isset($slider_config["button_class"]) && $slider_config["button_class"] !== "") {
				$buttons_html .= " {$slider_config["button_class"]}";
			}
			// add any miscellaneous classes
			if (isset($slider_config["button_misc_class"])) {
				$buttons_html .= " {$slider_config["button_misc_class"]}";
			}
			$buttons_html .= "' style='{$button_style_attr}' on{$slider_config["event"]}='sliderEventHandler(this.id);'>";
			// add the necessary button text for the selected style
			if (isset($slider_config["button_text"]) && $slider_config["button_text"] !== "") {
				$slider_config_aux = explode(";", $slider_config["button_text"]);
				$count = 0;
				foreach ($slider_config_aux as $value) {
					// if no button text exists in the JSON file, the image number will be used
					$buttons_html .= ($count++ == 0 ? "" : "<br/>").(isset($json_array[$i]) && isset($json_array[$i][$value]) ? $json_array[$i][$value] : $i);
				}
			}
			$buttons_html .= "</span>";
		}

		// if this slider has descriptions, prepare the description HTML
		if ((bool)$slider_config["description"]) {
			// HTML for the description
	    	$descriptions_html .= "<span id='{$i}_{$name}description' class='slider_item_description".($i == 1 ? " visible" : " hidden");
			// add any classes related to this style
			if (isset($slider_config["description_class"]) && $slider_config["description_class"] !== "") {
				$descriptions_html .= " {$slider_config["description_class"]}";
			}
			// add any miscellaneous classes
			if (isset($slider_config["description_misc_class"])) {
				$descriptions_html .= " {$slider_config["description_misc_class"]}";
			}
			$descriptions_html .= "'>";
			// add the necessary description text for the selected style
			if (isset($slider_config["description_text"]) && $slider_config["description_text"] !== "") {
				$slider_config_aux = explode(";", $slider_config["description_text"]);
				$count = 0;
				foreach ($slider_config_aux as $value) {
					// if no description text exists in the JSON file, none will be used
					$descriptions_html .= ($count++ == 0 ? "" : "<br/>").(isset($json_array[$i]) ? $json_array[$i][$value] : "");
				}
			}
			$descriptions_html .= "</span>";
		}
	}

	// build the images HTML
	$images_html .= "<span id='1_{$name}image' class='slider_item_image front' style='background-image:url(\"".substr($path_images_abs, strlen($path_public_abs))."/".array_slice($images_list, 0, 1)[0]."\");'></span><span id='2_{$name}image' class='slider_item_image back'></span>";

	// build the necessary size data, depending on whether this slider will auto resize or not
	if (isset($slider_config["size"])) {
		// this slider will NOT auto resize, instead it will have a fixed size
		list($slider_width, $slider_height) = explode(":", $slider_config["size"]);
		$slider_styles .= "width:{$slider_width};height:{$slider_height};";
	}else{
		// build the slider's data attributes
		// add the biggest width and height image's dimension data
		$slider_data_attr = "data-max-width='{$max_width["w"]}:{$max_width["h"]}' data-max-height='{$max_height["w"]}:{$max_height["h"]}'";
	}

	// if this slider is an automatic slider, add the necessary data attribute
	if (isset($slider_config["auto"]) && $slider_config["auto"] !== false) {
		// type cast the value to a float
		$slider_config["auto"] = (float)$slider_config["auto"];

		// check that the timer is a positive number
		if ($slider_config["auto"] > 0) {
			// add the interval delay data
			$slider_data_attr .= " data-auto-interval='{$slider_config["auto"]}'";
		}
	}

	// local variables used to store the css classes for the slider, button, description and image main elements
	$slider_classes = "slider {$slider_config["style"]}";
	$buttons_classes = "slider_buttons";
	$descriptions_classes = "slider_descriptions";
	$images_classes = "slider_images with_transition forward";
	$arrows_classes = "";

	// add the class to images_classes to fill the background around images
	if (isset($slider_config["image_fill"])) {
		$images_classes .= " {$slider_config["image_fill"]}";
	}
	// add the class to images_classes to control how images switch
	if (isset($slider_config["switch_type"])) {
		$images_classes .= " switch_{$slider_config["switch_type"]}";
	}

	// add classes to these elements specific to the style and options of this slider
	// add the classes for the elements that are above the image
	if (isset($slider_config["above_images"]) && $slider_config["above_images"] !== "") {
		// decompose the string into it's parts
		$slider_config_aux = explode(";", $slider_config["above_images"]);

		// if there are arrows in this slider, find if they are above the image
		if ((bool)$slider_config["arrow"] && in_array("arrow", $slider_config_aux)) {
			$arrows_ontopimages = true;
		}else{
			$arrows_ontopimages = false;
		}

		foreach ($slider_config_aux as $value) {
			switch ($value) {
				case "button":
					// if this slider has buttons, add these classes
					if ((bool)$slider_config[$value]) {
						$buttons_classes .= ($arrows_ontopimages ? " adjust_arrows" : "").(isset($slider_config["visibility"]) ? " {$slider_config["visibility"]}" : "");
					}
					break;

				case "description":
					// if this slider has descriptions, add these classes
					if ((bool)$slider_config[$value]) {
						$descriptions_classes .= ($arrows_ontopimages ? " adjust_arrows" : "").(isset($slider_config["visibility"]) ? " {$slider_config["visibility"]}" : "");
					}
					break;

				case "arrow":
					// if this slider has arrows, add these classes
					if ((bool)$slider_config[$value]) {
						$arrows_classes .= ($arrows_ontopimages ? " adjust_arrows" : "").(isset($slider_config["visibility"]) ? " {$slider_config["visibility"]}" : "");
					}
					break;
			}
		}
	}

	// if this slider is using the arrows, add their elements to the images element
	if ((bool)$slider_config["arrow"]) {
		$images_html .= "<div id='{$name}prevarrow' class='arrow_prev {$arrows_classes}' onclick='processArrowEvents(this.id, -1);'><span>&lt;</span></div><div id='{$name}nextarrow' class='arrow_next {$arrows_classes}' onclick='processArrowEvents(this.id, 1);'><span>&gt;</span></div>";
	}

	// build the final HTML with the first image in the series visible
	$html = "<div id='{$name}slider' class='{$slider_classes}' {$slider_data_attr} style='{$slider_styles}'>";

	// if needed add the button HTML
	if ((bool)$slider_config["button"]) {
		$html .= "<div id='{$name}buttons' class='{$buttons_classes}'>{$buttons_html}</div>";
	}

	// if needed add the description HTML
	if ((bool)$slider_config["description"]) {
		$html .= "<div id='{$name}descriptions' class='{$descriptions_classes}'>{$descriptions_html}</div>";
	}

	// add the images HTML and slider closing tag
	$html .= "<div id='{$name}images' class='{$images_classes}'>{$images_html}</div></div>";

	return($html);
}

// this function receives an array and will run recursively through each of the items
// for each non-array item it will decode any HTML special characters
function arrayHtmlSpecialCharsDecode(&$input) {
    if (is_array($input)) {
        foreach ($input as $key => $value) {
            if (is_array($value)) {
            	$input[$key] = arrayHtmlSpecialCharsDecode($value);
            }else{
            	$input[$key] = htmlspecialchars_decode($value, ENT_NOQUOTES);
            }
        }

        return($input);
    }

    return(htmlspecialchars_decode($input, ENT_NOQUOTES));
}

?>
