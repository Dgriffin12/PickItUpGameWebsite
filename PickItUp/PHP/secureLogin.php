<?php
	include_once "db_config.php";
	$con = mysqli_connect(HOST, USER, PASSWORD, DATABASE);
	
	if (mysqli_connect_errno()) {
		$responseText = array('status' => "bad", 'text' =>'Could not connect to Database.');
  		echo json_encode($responseText);
	}
	
	$username = $_GET['username'];
	$password = $_GET['password'];
	
	$delete_result = mysqli_query($con,'DELETE FROM session WHERE user_name LIKE "' . $username . '"');
	$result = mysqli_query($con,'SELECT * FROM users WHERE (username LIKE "' . $username . '" AND password LIKE "' . $password . '")');
	
	if($username !== 'username' && $password !== 'password' && $username !== '' && $password !== '')
	{
		if($result && $row = mysqli_fetch_array($result))
		{
			$responseText = array('status' => "good", 'text' =>'Logged in as ' . $username . '', 'username' => $username);
			echo json_encode($responseText);
		}else
		{
			$responseText = array('status' => "bad", 'text' =>'No username and password combination found for given input.');
			echo json_encode($responseText);
		}
	}else
	{		
		$responseText = array('status' => "bad", 'text' =>'Please enter a username and password');
		echo json_encode($responseText);
	}
?>