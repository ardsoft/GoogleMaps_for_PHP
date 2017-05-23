<?php
// Start the session
session_start();
if(!isset($_SESSION['logged_in']) || (isset($_SESION['logged_in']) && $_SESSION['logged_in'] == 0)){
	$_SESSION['logged_in'] = 0;
}
?>
<!DOCTYPE html>

<html>
<head>
	<title>DML Google Map Plugin for PHP</title>
	<!---JQUERY MUST BE REFERENCED FOR DMLMAP---->
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<script src="http://code.jquery.com/jquery-latest.min.js" type="text/javascript"> </script>
	<!---JQUERY REFERENCE ENDS FOR DMLMAP---->
</head>

<body>
	<!-- TEXT STARTS -->
	<?php
		$output = 'Error';
	
		if (isset($_POST['dmlLogin'])) {
			$_SESSION['logged_in'] = 1;
		}
	
		if ($_SESSION['logged_in'] == 0){
			$output = '
				<div style="text-align: center;">
					<h2>DML Google Map plugin for PHP</h2>
					<p>You see the demo version of the plugin.</p>
					<p>You need to login to test features. Just click on the "Login and Test" button below. No username or password required.</p>
					<br />
					<p>
						<form method="post">
							<input type="submit" name="dmlLogin" value="Login and Test" class="btn btn-primary" />
						</form>
					</p>
				</div>
			';
		} elseif ($_SESSION['logged_in'] == 1){
			$output = '
				<div style="text-align: center;">
					<h2>You are logged in.</h2>
					<p>You see the demo version of the Control. Saving feature is disabled for DEMO.</p>
					<p>You can reach live video by clicking <a href="https://www.youtube.com/watch?v=lPW_fJcQUOo&feature=youtu.be" target="blank">here.</a></p>
					<br />
					<p>
                    	<a href="https://codecanyon.net/item/google-map-user-control-for-aspnet/17967139" target="_blank" class="btn btn-success">Buy Now!</a>
                    </p>
				</div>
			';
		}
		echo $output . "<hr />";
		echo '<div id="myMap1Edit" style="display: none;">' . $_SESSION['logged_in'] . '</div>';
	?>
	<!-- TEXT ENDS -->
	
	<div class="container">
	
	</div>
	<br /><br /><br />
	
	<!-- INCLUDES DML MAP STARTS-->
	<?php 
	//Be sure that you entered a valid relative path to the config file
	require_once("dmlmap/config.php");
	//now we can use our config file
	include(ROOT_PATH . "dmlmap/dmlmap.php");
	?>
	<!-- INCLUDES DML MAP ENDS-->

	<!---BOOTSTRAP REFERENCE STARTS FOR DMLMAP---->
	<link href="//netdna.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.css" rel="stylesheet" />
	<script src="<?php echo BASE_URL; ?>dmlmap/js/bootstrap.min.js" > </script>
	<!---DML MAP SCRIPTS---->
	<script src="<?php echo BASE_URL; ?>dmlmap/js/dmlmap.js"> </script>
	<script src="<?php echo BASE_URL; ?>dmlmap/js/markerclusterer.js"></script>
	<link href="<?php echo BASE_URL; ?>dmlmap/css/bootstrap.css" rel="stylesheet" type="text/css">
	<link href="dmlmap/css/map-icons.css" rel="stylesheet" type="text/css">
</body>
</html>