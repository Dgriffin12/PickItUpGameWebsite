<?php
	include_once "db_config.php";
	$con = mysqli_connect(HOST, USER, PASSWORD, DATABASE);
	
	$title_pipe_date = $_GET['string'];
	$user = $_GET['user'];
	
	$result2 = mysqli_query($con, 'SELECT events_attended FROM users WHERE username LIKE "' . $user . '"');
	if($result2)
	{
		$row2 = mysqli_fetch_assoc($result2);
		if($row2 && $row2['events_attended'] !== '' && $row2['events_attended'] !== NULL)
		{
			$result3 = mysqli_query($con, 'UPDATE users SET events_attended = "' . $row2['events_attended'] . '|' . $title_pipe_date . '" WHERE username LIKE "' . $user . '"');
		}else
		{
			$result3 = mysqli_query($con, 'UPDATE users SET events_attended = "' . $title_pipe_date . '" WHERE username LIKE "' . $user . '"');
		}
	}
	$title_date_ary = explode("|", $title_pipe_date);
	$title = $title_date_ary[0];
	$date = $title_date_ary[1];
	$result_q = mysqli_query($con, "SELECT attending FROM events WHERE title LIKE '" . $title . "' AND date LIKE '" . $date . "'");
	if($result_q)
	{
		$row_q = mysqli_fetch_assoc($result_q);
		if($row_q !== NULL)
		{
			$num_attending = $row_q['attending'];
		}
		else
		{
			$num_attending = 0;
		}
	}else
	{
		$num_attending = 0;
	}
	
	$result = mysqli_query($con, "UPDATE events SET attending = '" . ($num_attending + 1) . "'");
?>