<?php
	include_once "db_config.php";
	$con = mysqli_connect(HOST, USER, PASSWORD, DATABASE);
	
	$username = $_GET['username'];
	$long_num = $_GET['long_num'];
	
	$result1 = mysqli_query($con, 'SELECT username FROM session WHERE username LIKE "' . $username . '" AND LargeNum LIKE "' . $long_num . '"');
	if($result1)
	{
		$result2 = mysqli_query($con, 'SELECT password FROM users WHERE username LIKE "' . $username . '"');
		if($result2 && $row = mysqli_fetch_array($result2))
		{
			echo $row['password'];
		}else
		{
			echo "";
		}
	}else
	{
		echo "";
	}
?>