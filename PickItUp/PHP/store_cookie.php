<?php
	include_once "db_config.php";
	$con=mysqli_connect(HOST, USER, PASSWORD, DATABASE);
	
	if (mysqli_connect_errno()) {
  		echo "Failed to connect to MySQL: " . mysqli_connect_error();
	}
	
	$cookie = $_GET['cookie'];
	
	if($cookie !== "")
	{
		list($large_num, $username) = explode('|', $cookie);
		$result = mysqli_query($con,'INSERT INTO session (LargeNum, username) VALUES (' . $large_num . ', "' . $username . '")');
	}
	
	if($result)
	{
		echo "successfully stored cookie";
	}else
	{
		echo "failed to store cookie";
	}
	

?>