<?php
	include_once "db_config.php";
	
	$con = mysqli_connect(HOST, USER, PASSWORD, DATABASE);

	$long_num = $_GET['long_num'];
	$username = $_GET['username'];
	
	$result = mysqli_query($con,'DELETE FROM session WHERE LargeNum LIKE ' . $long_num . ' AND username LIKE "' . $username . '"');
	
	if($result)
	{
		echo "success";
	}else
	{
		echo "failure";
	}
?>