<?php
	include_once "db_config.php";
	$con = mysqli_connect(HOST, USER, PASSWORD, DATABASE);
	
	$title = $_GET['title'];
	$desc = $_GET['desc'];
	$start_time = $_GET['start'];
	$end_time = $_GET['end'];
	$user = $_GET['user'];
	$date = $_GET['date'];
	
	$start_ary = split(":", $start_time);
	
	if(strlen($start_ary[0]) == 1)
		$start_ary[0] = '0' . $start_ary[0];
	if(strlen($start_ary[1]) == 1)
		$start_ary[1] = '0' . $start_ary[1];
		
	if(sizeof($start_ary) == 3)
	{
		if(strlen($start_ary[2]) == 1)
			$start_ary[2] = '0' . $start_ary[2];
		$start_time = $start_ary[0] . ":" . $start_ary[1] . ":" . $start_ary[2];	
	}else
	{
		$start_time = $start_ary[0] . ":" .  $start_ary[1] . ":00";
	}
	
	
	
	$end_ary = split(":", $end_time);
	
	
	if(strlen($end_ary[0]) == 1)
		$end_ary[0] = '0' . $end_ary[0];
	if(strlen($start_ary[1]) == 1)
		$end_ary[1] = '0' . $end_ary[1];
	if(sizeof($end_ary) == 3)
	{
		if(strlen($end_ary[2]) == 1)
			$end_ary[2] = '0' . $end_ary[2];
		$end_time = $end_ary[0] . ":" . $end_ary[1] . ":" . $end_ary[2];	
	}else
	{
		$end_time = $end_ary[0] . ":" . $end_ary[1] . ":00";
	}
	
	
	
	$seconds = strtotime($end_time) - strtotime($start_time);
	$hours = floor($seconds / 3600);
	$mins = floor(($seconds - ($hours*3600)) / 60);
	$secs = floor($seconds % 60);
	if(strlen($hours) == 1)
		$hours = '0' . $hours;
	if(strlen($mins) == 1)
		$mins = '0' . $mins;
	if(strlen($secs) == 1)
		$secs = '0' . $secs;
	$duration = $hours . ':' . $mins . ':' . $secs;
	$result1 = mysqli_query($con, 'INSERT INTO events (title,description,time,date, duration, username, end_time, attending) VALUES ("' . $title . '", "' . $desc . '", "' . $start_time . '", "' . $date . '", "' . $duration . '", "' . $user . '", "' . $end_time . '", "' . 1 . '")');
	$result2 = mysqli_query($con, 'SELECT events_attended FROM users WHERE username LIKE "' . $user . '"');
	if($result2)
	{
		$row2 = mysqli_fetch_assoc($result2);
		if($row2 && $row2['events_attended'] !== '' && $row2['events_attended'] !== NULL)
		{
			$result3 = mysqli_query($con, 'UPDATE users SET events_attended = "' . $row2['events_attended'] . '|' . $title . '|' . $date . '" WHERE username LIKE "' . $user . '"');
		}else
		{
			$result3 = mysqli_query($con, 'UPDATE users SET events_attended = "' . $title . '|' . $date . '" WHERE username LIKE "' . $user . '"');
		}
		
	}else
	{
		$result3 = mysqli_query($con, 'UPDATE users SET events_attended = "' . $title . '|' . $date . '" WHERE username LIKE "' . $user . '"');
	}
	
	if($result1)
	{
		$return_ary = array('success', $start_time);
		echo json_encode($return_ary);
	}
	else
	{
		$return_ary = array('fail', $start_time);
		echo json_encode($return_ary);
	}
?>