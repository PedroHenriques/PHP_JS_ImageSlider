<?php require_once("{$_SERVER["DOCUMENT_ROOT"]}/PHP/imageslider.php") ?>

<html>
	<head>
		<link href='/assets/CSS/imageslider.css' rel='stylesheet' type='text/css' />
	</head>

	<body>
		<?php echo(createImgSlider("autocal", ["auto"=>false, "style"=>"ShowAll", "arrow"=>true, "above_images"=>"arrow"])); ?>
		<br><br><br><br>
		<?php echo(createImgSlider("adminmode", ["image_fill"=>"white"])); ?>
		<br><br><br><br>
		<?php echo(createImgSlider("smallimgs", ["auto"=>false, "image_fill"=>"black", "description"=>false, "switch_type"=>"opacity"])); ?>

		<script src="/assets/JS/imageslider.js"></script>
		<script>sliderInit();</script>
	</body>
</html>
