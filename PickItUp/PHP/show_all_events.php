<?php
	include_once "db_config.php";
	$con = mysqli_connect(HOST, USER, PASSWORD, DATABASE);
	
	$date = $_GET['date'];
	$user = $_GET['user'];
	
	$result = mysqli_query($con, "SELECT * FROM events WHERE date = '" . $date . "'");
	$attending = false; //for deciding whether or not to add an "I will attend" button.
	echo "<h3>" . $date . "'s Events:</h3>";
	if($result)
	{
		while($row = mysqli_fetch_assoc($result))
		{
			echo "<h2>" . $row['title'] . "</h2>";
			echo "<br>";
			echo "Start Time: " . $row['time'];
			echo "<br>";
			echo "End Time: " . $row['end_time'];
			echo "<br>";
			echo "<button onclick = 'showEvent(\"" . $row['title'] . "\", \"" . $date . "\", true)'>Event Info</button><br>";
		}

	}else
	{
		//Should never occur. 
		echo "No events on " . $date;
	}
	 
?>