
var global_username = ""; //FROM COOKIE
var logged_in = false;

$(document).ready(function(){
	cookie_login();
});

//Sets on click listeners
function set_on_click_listeners()
{
	$("#username").keyup(function(){
		if(event.keyCode == 13)
			login('','');
	});
	$("#password").keyup(function(){
		if(event.keyCode == 13)
			login('','');
	});
}

//login function (FROM BUTTON)
function login(user, pass)
{
	var username = "";
	var password = "";
	if(user !== "" && pass !== "")
	{
		username = user;
		password = pass;
	}else
	{
		username = $("#username").val();
		password = $("#password").val();
	}
	
	$.ajax({
		method: 'get',
		url: '../PHP/secureLogin.php',
		data:
		{
			'username' : username,
			'password' : password
		},
		success: function(data){
			var array = jQuery.parseJSON(data);
			if(array['status'] == "good")
			{
				global_username = username;
				logged_in = true;
				$("#notify").css("color", "green");
				$("#notify").html(array['text']);
				document.cookie =  Math.floor(Math.random()*9223372036854775807) + '|' + array['username'];
				
				if($("#calendar").html() == "")
				{
					$("#calendar").fullCalendar({
						dayClick: function(date, jsEvent, view){
						clear_popup_form();
						date = date.toDate();
						var year = String(date.getFullYear());
						var month = String(date.getMonth()+1);
						if(month.length == 1)
							month = '0' + month;
						var day = String(date.getDate());
						if(day.length == 1)
							day = '0' + day;
						var mysql_date = year + '-' + month + '-' + day;
			
						show_popup(jsEvent, mysql_date); //displays popup form on mouse.
						}
					});
				}else
				{
					$("#calendar").show();
				}
				load_user_profile(username);
				store_session(username);
			}else
			{
				$("#notify").css("color", "orange");
				$("#notify").html(array['text']);
			}
			set_on_click_listeners();
		}
	});
}

//LOGOUT FUNCTION, FROM BUTTON
function logout()
{
	results = document.cookie.split('|');
	var username = results[1];
	var long_num = results[0];
	
	$.ajax({
		method: 'get',
		url: '../PHP/logout.php',
		data: {
			'username' : username,
			'long_num' : long_num
		},
		success: function(data)
		{
			if(data == "success")
			{
				logged_in = false;
				$("#login").html("<p class = 'U_P'>Username:</p> <input id = 'username' type = 'text' value = ''>");
				$("#login").append("<p class = 'U_P'>Password:</p> <input id = 'password' type = 'text' value = ''>")
				$("#login").append("<p> <button id = 'submit_login' class = 'U_P' onclick = 'login(\"\",\"\")'>Login</button> </p>");
				$("#notify").css("color", "green");
				$("#notify").html("Sucessfully Logged out.");
				$("#events").html("");
				$("#calendar").hide();
				global_username = "";
				//Reset Cookie
				document.cookie = "1";
				set_on_click_listeners();
			}
		}
	});
}

//LOADS USER'S PROFILE AFTER LOGIN
function load_user_profile(username)
{
	$("#login").html("<p><button id = 'logout' class = 'U_P' onclick = 'logout()'>Logout</button></p><br>");
	$.ajax({
		method : 'get',
		url : '../PHP/load_user_profile.php',
		data : {
			'username' : username
		},
		success: function(data){
			var data_array = jQuery.parseJSON(data);
			$("#events").html("<p class = 'U_P'>My Events</p>" + data_array[0]);
			$("#calendar").fullCalendar('removeEvents');
			if(data_array.length > 1)
			{
				for(var i = 1; i < data_array.length; i++)
				{
					var new_Event = new Object();
					new_Event.title = data_array[1][i];
					new_Event.start = "" + data_array[2][i] + "T" + data_array[3][i];
					new_Event.end = "" + data_array[2][i] + "T" + data_array[4][i];
					new_Event.allDay = false;
					$("#calendar").fullCalendar('renderEvent', new_Event);
				}
			}
		}
	});
}

//STORES SESSION BIGINT FOR COOKIE LOGIN
function store_session(username)
{
	var cookie = document.cookie;
	$.ajax({
		method: 'get',
		url: '../PHP/store_cookie.php',
		data: {
			'cookie' : cookie
		},
		success: function(data){
			//$("#temp_results").html(data);
		}
	});
}

//ATTEMPT TO LOGIN THROUGH COOKIE.
function cookie_login()
{
	var f_username = "";
	var f_long_num = "";
	var f_password;
	
	results = document.cookie.split('|');
	if(results.length > 1)
	{
		f_username = results[1];
		f_long_num = results[0];
	}
	
	
	if(f_username !== "" && f_long_num !== "")
	{
		$.ajax({
			method: 'get',
			url: '../PHP/cookie_login.php',
			data: {
				'username' : f_username,
				'long_num' : f_long_num
			},
			success: function(data){
				f_password = data;
				//$("#temp_results").html(f_username + " " + f_password);
				login(f_username, f_password);
			}
		});		
	}else
	{
		$("#login").html("<p class = 'U_P'>Username:</p> <input id = 'username' type = 'text' value = ''>");
		$("#login").append("<p class = 'U_P'>Password:</p> <input id = 'password' type = 'text' value = ''>");
		$("#login").append("<p> <button id = 'submit_login' class = 'U_P' onclick = 'login(\"\",\"\")'>Login</button> </p>");
		set_on_click_listeners();
	}
}

//Add event
function add_event(date)
{
	var title = $("#title").val();
	var description = $("#description").val();
	var start = $("#start").val();
	var end = $("#end").val();
	$.ajax({
		method: 'get',
		url: '../PHP/add_event.php',
		data: {
			'title' : title,
			'desc' : description,
			'start' : start,
			'end' : end,
			'user' : global_username,
			'date' : date
		},
		success: function(data){	
			var data_ary = jQuery.parseJSON(data);
			if(data_ary[0] == "success")
			{
				$("#popup_notify").html("");
				hide_popup();
				var new_Event = new Object();
				new_Event.title = title;
				new_Event.start = date;
				new_Event.allDay = false;
				$("#calendar").fullCalendar('renderEvent', new_Event);
				cookie_login();
			}else
			{
				$("#popup_notify").css("color", "red").html("Invalid Data Entered.");
				$("#temp_results").append("Data: <br> Title: " + title + "<br> Description: " + description + "<br> Start Time: " + start + "<br> End Time: " + end + "<br> Username: " + global_username + "<br> Date: " + date);
			}
			
		}
	});
	
	
}

//Show Event Popup
function show_popup(e, date)
{
	$("#calendar_popup").css({left: e.pageX + 20, top: e.pageY + 20}).show();
	$("#event_add").click(function(){
		add_event(date);
	});
}

//Hide Event Popup
function hide_popup()
{
	$("#calendar_popup").hide();
}

function clear_popup_form()
{
	$("#calendar_popup").children("div").children("input").val("");
	$("#calendar_popup").children("div").children("textarea").val("");
}
