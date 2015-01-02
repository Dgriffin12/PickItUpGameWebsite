<?php
	include_once 'db_config.php';
	
	$con = mysqli_connect(HOST, USER, PASSWORD, DATABASE);
	
	$username = $_GET['username'];
	
	$result = mysqli_query($con, 'SELECT * FROM events WHERE username LIKE "' . $username . '"');

	$long_string = "";
	for($i = 1; $result && $row = mysqli_fetch_array($result); $i++)
	{
		$long_string .= ($row['title'] . ' on ' . $row['date'] . ' at ' . $row['time'] . '<br>');
	}
	
	$result2 = mysqli_query($con, 'SELECT * FROM events');
	if($result2)
	{
		$title_ary = array();
		$date_ary = array();
		$start_ary = array();
		$end_ary = array();
		for($i = 0; $i < $result2->num_rows; $i++)
		{
			if($row = mysqli_fetch_assoc($result2))
			{
				array_push($title_ary, $row['title']);
				array_push($date_ary, $row['date']);
				array_push($start_ary, $row['time']);
				array_push($end_ary, $row['end_time']);
			}
		}
		$return_ary = array($long_string, $title_ary, $date_ary, $start_ary, $end_ary);
	}else
	{
		$return_ary = array($long_string);
	}
	
	echo json_encode($return_ary);
?>