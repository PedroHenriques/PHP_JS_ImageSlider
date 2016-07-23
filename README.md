# PHP JS CSS Image Slider - Dynamic and Highly Customizable

An easy to use Image Slider, built in PHP, JS and CSS, that will be dynamically resized and is highly customizable by you.

The code will create an image slider that will be automatically resized to always fit the viewport and will cycle through the slider's images on a timer.
The slider supports different styles and a description for each images.
The code is **customizable** allowing you to manipulate a series of options to control the slider's behavior and style.

You can find a **DEMO** at [www.pedrojhenriques.com/samples/PHP_JS_ImageSlider](http://www.pedrojhenriques.com/samples/PHP_JS_ImageSlider/).

## Instructions

### Setup

- **Code files placement:**  
	1. Copy the `imageslider.css` and `imageslider.js` files into your project, or their respective minimized versions.
	2. Add a link to the CSS file inside the `<head></head>` tags, on the webpages you wish to use the image sliders, using `<link rel='stylesheet' type='text/css' href='path/to/imageslider.css'/>`.
	3. Add a link to the JS file and call the starting function before the `</body>` tag, on the webpages you wish to use the image sliders, using `<script type='text/javascript' src='path/to/imageslider.js'></script>
	<script>sliderInit();</script>`.
	4. Copy the `imageslider.php` file into your project and reference it on the webpages you wish to use the image sliders using, for example, `require_once("path/to/imageslider.php")`.

- **Images placement:**  

	The code assumes that each slider will have its images inside a folder named the same as the corresponding slider's name and that all slider image folders are inside a common directory.  
	For example, a slider named `smallimgs` expects its images to be inside a folder named `smallimgs`.  

	The order of the images inside a slider's folder will be the order they will be added to the slider.  
	If you want to have absolute control over the order the images are added to the slider, naming them numbers is the ideal way.

	It's required that the absolute path to the common directory, where all the slider image folders are placed, be specified in the `imageslider.php` file on the variable `$path_images_abs`, located at the start of the `createImgSlider()` function.

- **Data file placement:**  

	The code expects there to be a JSON file, by default named `imageslider.json`, somewhere in the project. This file contains the text for each slider's buttons and image descriptions.  
	If such a file doesn't exist, then all sliders will be displayed with no button or description text.  

	It's required that the absolute path to the JSON file be specified in the `imageslider.php` file on the variable `$path_json_abs`, located at the start of the `createImgSlider()` function.  

	The syntax for this JSON file is:
	```
	{
		"slider 1 name" : {
			"1" : {
				"button" : "this is the text for the 1st image's button",
				"description" : "this is the text for the 1st image's description"
			},

			"2" : {
				"button" : "this is the text for the 2nd image's button",
				"description" : "this is the text for the 2nd image's description"
			}
		},

		"slider 2 name" : {
			"1" : {
				"button" : "this is the text for the 1st image's button",
				"description" : "this is the text for the 1st image's description"
			},

			"2" : {
				"button" : "this is the text for the 2nd image's button",
				"description" : "this is the text for the 2nd image's description"
			}
		}
	}
	```
	If a slider doesn't have any text to display it doesn't require an empty entry in the JSON file. In the same logic, if a specific image doesn't have a button and/or description text it also doesn't require an empty entry.

- **Other setup steps:**  

	It's required that the absolute path to the server's public directory (usually named "public_html" or "www") be specified in the `imageslider.php` file on the variable `$path_public_abs`, located at the start of the `createImgSlider()` function.  

	If needed, adjust the values of the default variables at the start of the `createImgSlider()` function, as well as adjusting/adding the styles' behavior in the variable `$style_config`, located at the start of the `createImgSlider()` function.  

	If needed, adjust the values of the default variables at the start of the `imageslider.js` file.

### Using the Image Slider

In order to create an image slider echo the return value of the **createImgSlider** function where you want the slider to be positioned in the webpage.  

The syntax for the PHP funtion is `createImgSlider(name[, opts])`, where `name` is a string with the desired slider name and `opts` is an optional array allowing a slider by slider customization.  
The function returns a string with the HTML for the slider.  

The options array supports the following key-value pairs:  

Key | Value | Value Type | Meaning
--- | --- | --- | ---
above_images | any combination of `button` `description` `arrow`, separated by semi-colons(;) | string | defines which parts of the slider should be treated as being on top of the images. These parts will be subject to the `visibility` option for how they will behave.
arrow | `true` or `false` | boolean | defines if the slider will have previous and next arrows or not.
auto | `false` or `number in milliseconds` | mixed | if set to `false` makes the slider not automatically cycle through the images. If set to a `float` or `integer` defines the number of milliseconds to wait between an automatic image switch.
button | `true` or `false` | boolean | defines if the slider will have buttons or not.
button_class | whitespace separated CSS classes | string | these CSS classes will be added to each button. Use this option to add CSS classes related to the style the slider will be using.
button_misc_class | whitespace separated CSS classes | string | these CSS classes will be added to each button. Use this option to add custom CSS classes not related to the sliders styles.
button_text | any combination of `button` `description`, separated by semi-colons(;) | string | defines which text should be written to the buttons. If more than 1 part is given, a line break will be used to separate each part's text.
button_width | currently only supports `equal%` | string | defines the width of each button. `equal%` will make all buttons have the same width and together will span the entire width allocated to the button parent element.
description | `true` or `false` | boolean | defines if the slider will have descriptions or not.
description_class | whitespace separated CSS classes | string | these CSS classes will be added to the descriptions. Use this option to add CSS classes related to the style the slider will be using.
description_misc_class | whitespace separated CSS classes | string | these CSS classes will be added to the descriptions. Use this option to add custom CSS classes not related to the sliders styles.
description_text | any combination of `button` `description`, separated by semi-colons(;) | string | defines which text should be written to the descriptions. If more than 1 part is given, a line break will be used to separate each part's text.
event | one of the supported DOM events | string | defines the event, applied to the slider buttons, that triggers a manual image switch.
image_fill | `white` or `black` | string | defines the CSS class that specifies the color to use as fill if an image is smaller than the slider dimension.
size | `auto` or `dimension` in the format `width:height` | string | if this option is not set, the slider will automatically be resized to always fit the viewport (respecting the minimum size). If it is set, then it defines the dimension, absolute or relative, for this slider's width and/or height.
style | one of the existing keys of the `$style_config` variable | string | defines the style to be used for this slider.
switch_type | `slide` or `opacity` | string | defines the way image switching will be transitioned/animated.
visibility | `visible` or `hidden` | string | defines if the elements set as `above_images` should be always visible or only when the mouse hovers over the slider.

If no options are passed to the `createImgSlider()` function, i.e., the slider created by `echo(createImgSlider("slider name"));` will be:  

- **Style:** The slider will use the style named "ImgFocus".

- **Automatic:** The slider will automatically cycle through its images. If the mouse enters the slider the automatic switching will stop, being resumed when the mouse leaves the sliders.

- **Arrows:** The slider will have a previous and next arrows that will become visible when the mouse enters the slider.

- **Buttons and Descriptions:** The slider will have buttons and descriptions ON, both of which will be considered "above_images" and will become visible when the mouse enters the slider.

- **Event:** The event triggering a manual image switch is the "click" on one of the slider's buttons.

- **Size:** The slider will be automatically resized to fit the viewport.

- **Switch Type:** The switch of an image will use the "slide" transition.

### Customizing the Image Slider

There are 3 ways to customize the slider behavior with the following hierarchy:
1. **Options parameter** of the `createImgSlider()` PHP function
2. The slider's **style configuration**, stored in the `$style_config` variable inside the `createImgSlider()` PHP function
3. The **default variables** inside the `createImgSlider()` PHP function

In general each option has an equivalent style configuration and a default variable, following a specific naming convention.  
For an option named "optname" the equivalent style configuration will be named "optname" and the default variable will be named "$default_optname".  

The values in the **options parameter** will be used for that specific slider, allowing a slider by slider customization.  
The values in the **style configuration** will be applied to all sliders using that style.  
The values in the **default variables** will be applied to all sliders as a fall back.  

- **Adding Styles**  

	To add more styles follow these steps:

	- Add the CSS for the new style to the project, following the format used in the styles that come with this repository

	- Add the desired name for the new style to the `$style_config` variable inside the `createImgSlider()` PHP function. There must be an entry in the `$style_config` variable for a style to be usable, even if an empty array is it's value

### Notes

- In order to have the slider be restricted to a parent element, use the `size` option with measurements in %.  
EX: `echo(createImgSlider("slider name", ["size"=>"100%:100%"]));` will create a slider that will have the same dimensions as the parent element and will not be automatically resized to fit the viewport.

### Demo

A demo can be found at [www.pedrojhenriques.com/samples/PHP_JS_ImageSlider](http://www.pedrojhenriques.com/samples/PHP_JS_ImageSlider/).

## Technical Information

### Size of the Image Slider

Sliders that will be automatically resized will have their size calculated according to the following considerations:

- minimum size defined in the `imageslider.js` file

- width and height buffers defined in the `imageslider.js` file

- viewport's size

- size and aspect ratio of the images used in that slider

In the cases where the images used in the slider require less dimension than the available viewport, the slider will have the width and height necessary for all of it's images to fit.  
The calculations will accommodate images of different sizes and aspect ratios in the same slider. However, with the interest of keeping the code as "light" as possible, the algorithm for calculating the slider's dimensions can, in extreme cases, leave an image trimmed. This will happen if the images on a slider have extremely different aspect ratios.  

In the cases where all the images are smaller than the available viewport, the slider will be as big as necessary to fit all images.  

### Resizing of the Images

Any images that have different dimensions to the slider will be resized downwards keeping their aspect ratio intact, and will not be resized upwards to avoid pixellation of the image.
