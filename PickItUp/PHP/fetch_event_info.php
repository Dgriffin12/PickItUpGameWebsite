<?php
	include_once "db_config.php";
	$con = mysqli_connect(HOST, USER, PASSWORD, DATABASE);
	
	$title = $_GET['title'];
	$date = $_GET['date'];
	$user = $_GET['user'];
	$fromAll = $_GET['fromAll'];
	$result = mysqli_query($con, "SELECT * FROM events WHERE title = '" . $title . "' AND date = '" . $date . "'");
	$attending = false; //for deciding whether or not to add an "I will attend" button.
	if($result)
	{
		$row = mysqli_fetch_assoc($result);
		echo "<div id = 'event_info_div'>";
		echo "<br>";
		echo "<h2>" . $row['title'] . "</h2>";
		echo "<br>";
		echo "Date: " . $row['date'];
		echo "<br>";
		echo "Start Time: " . $row['time'];
		echo "<br>";
		echo "End Time: " . $row['end_time'];
		echo "<br>";
		echo "Number Attending: " . $row['attending'];
		echo "<br>";
		echo "Who's attending: ";
		$result1 = mysqli_query($con, "SELECT username FROM users WHERE events_attended LIKE '%" . $row['title'] . '|' . $row['date'] . "%'");
		while($result1 && $row1 = mysqli_fetch_assoc($result1))
		{
			echo $row1['username'] . ", ";
			if($user === $row1['username'])
			{
				$attending = true;
			}
		}
		echo "<br>";
		echo "<p>Description: " . $row['description'] . "</p>";
		echo "</div>";
		$title_pipe_date = $title . "|" . $date;
		if(!$attending)
		{
			echo "<button onclick = 'attend(\"" . $title . "\", \"" . $date . "\", " . $fromAll . ")'>Attend Event</button>";
		}else
		{
			echo "<button onclick = 'unattend(\"" . $title . "\", \"" . $date . "\",  " . $fromAll . ")'>Stop Attending</button>";
		}
	}else
	{
		//Should never occur. 
		echo "No event data.";
	}
	 
?>