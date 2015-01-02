var search_string = ""; //global for nutrition facts knowing the name, rather than querying for it.
var logged_in = false; //global for knowing if a user is logged in
var cur_user = ""; //global user_name
var cur_day = 0;
var diary_view = false;

//sets on click events and attempts to login off of a cookie.
$(document).ready(function(){	
	set_on_clicks();
	cookie_login_attempt();
});

//Reverts the page back to its original state, except performs a search on the global variable search_string.
function home(){
	$("#login").html('Login: <div id = "login_results"></div><input id = "username_login" type = "text" value = "username"/><input id = "password_login" type = "password" value = "password"/><button id = "login_button" onclick = "login(\'\', \'\')">Login</button><button id = "create_acc_button" onclick = "create_acc()">Create Account</button>');
	$("#Goals").html("");
	$("#Diary").html("");
	$("#search_field_div").html('<br><br>Search for a food:<br><input id = "search_field" type = "text" value = "Search for Food"/><button id = "search_button" onclick = "search(false)">Search</button>');
	$("#results").html("");
	set_on_clicks();
	cookie_login_attempt();
	search(search_string);
}

//Search function, ajax lookup for names of foods, paramater data used for coming back from nutrition facts(re-searching on the search_string IF back is pressed)
//data = true : re-search initiated from pressing back after viewing nutrition facts on an item.
//data = false : search from main page
function search(data){
	$("#results").css("color", "black");
	if(!data)
	{
		search_string = $("#search_field").val();
	}
	if (search_string=="" || search_string == "Search for Food") 
	{
    	$("#results").html("");
    	return;
  	} 
  	$.ajax({
  		method: 'GET',
  		url: '../PHP/search.php',
  		data:{	
  			'q' : search_string,
  			'k' : logged_in
  		},
  		success: function(data){
  			if(data === "No matches found.")
  			{
  				$("#results").css("color", "#BDFCC9");
  				$("#results").html(data);
  			}else
  			{
  				$("#results").css("color", "");
  				$("#results").html(data);
  			}
  		}
   	});
   	
 /* 	if (window.XMLHttpRequest)
  	{
    	// code for IE7+, Firefox, Chrome, Opera, Safari
    	xmlhttp=new XMLHttpRequest();
  	} else 
  	{ // code for IE6, IE5
    	xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
  	}
  	
  	xmlhttp.onreadystatechange=function() {
    	if(xmlhttp.readyState==4 && xmlhttp.status==200) 
    	{
      		document.getElementById("results").innerHTML=xmlhttp.responseText;
    	}
  	} //end of function
  	
  xmlhttp.open("GET","../PHP/search.php?q=" + search_string + "&k="+ logged_in,true);
  xmlhttp.send();
  */
  $("#search_field").val("Search for Food");
  set_on_clicks();
  $(".long_desc_data").css("width", "500px");
  $("#search_table > thead > tr").css("position", "relative");
  $("#search_table > thead > tr").css("display", "block");
  $("#search_table > tbody").css({
  "width": "700px",
  "height": "370px",
  "display": "block",
  "overflow": "auto"
  });
  $("#search_table").css("background-color", "#DDDDDD");
}

//login function, gets rid of cookie if there is one and reinstantiates a new cookie for this login.
function login(acc, pw){
	var username;
	var password;
	cur_day = 0;
	if(acc === "" || pw === "")
	{
		username = $("#username_login").val();
		password = $("#password_login").val();
	}else
	{
		username = acc;
		password = pw;
	}

	$.ajax({
		method: 'get',
		url: '../PHP/login.php',
		data: {
			'username' : username,
			'password' : password,
			'ajax' : true
		},
		success: function(data){
			var array = jQuery.parseJSON(data);
			if(array['status'] == "good")
			{
				logged_in = true;
				cur_user = array['username'];
				diary_view = false;
				diary_update();
				search(search_string);
				$("#notify").css("color", "blue");
				$("#notify").html("Logged in as "+ array['username'] + '.');
				$("#login").html('<button id = "logout_button" onclick = "logout()">Logout</button>');
				$("#Goals").html('<button id = "goals_button" onclick = "view_goals()">Goals</button>');
				$("#Diary").html("");
				$("#Graphs").html('<button id = "graphs_button" onclick = "view_graphs()">Progress Graphs</button><button id = "show_diary_button" onclick = "show_diary()">Show Diary</button>');
				$("#search_field_div").html("<br><br>Search for a food:<br><input id = 'search_field' type = 'text' value = 'Search for Food'/><button id = 'search_button' onclick = 'search(false)'>Search</button><button id = 'add_food_button' onclick = 'add_food()'>Add Food to DB</button>");
				set_on_clicks();
				document.cookie =  Math.floor(Math.random()*9223372036854775807) + '|' + array['username'];
				create_and_store_cookie();
			}else
			{
				$("#login_results").css("color", "orange");
				$("#login_results").html(array['text']);
			}
		}
	});
	
}

//Create account function, gets username and password from corresponding main_page.html fields, ajax to database to enter info.
function create_acc(){
	var username = $("#username_login").val();
	var password = $("#password_login").val();
	var p1_edit = false;
	var p2_edit = false;
	var acc_change = false;
	cur_day = 0;
	$("#results").html("");
	$("#login").html("");
	$("#Diary").html("<label style = 'font-weight:bold'>Create Account </label><br>");
	$("#Diary").append("<label>Account Name:</label><input id = 'account_name_field' type = 'text'></input><br>");
	$("#Diary").append("<label>Password:        </label><input id = 'password' type = 'password'></input><br>");
	$("#Diary").append("<label>Confirm Password:</label><input id = 'password2' type = 'password'></input><div id = 'pw_notify' style='color:orange'><br></div>");
	$("#Diary").append('<button id = "back_to_diary">Back</button><br>' + "<button id = 'create_account_submit_button'>Submit</button>");
	$("#back_to_diary").on("click", function(){
		home();
	});
	$("#search_field_div").html("");
	$("#create_account_submit_button").on("click.validate_submit", function(){
		validate_create_acc_field();
	});
	$("#account_name_field").change(function(){
		acc_change = true;
		if($("#account_name_field").val() == "" && acc_change == true)
		{
			$("#login_results").html("");
			$("#pw_notify").html("Account Name required for account creation.");
			$("#create_account_submit_button").unbind("click.good_submit");
		}else if(($("#account_name_field").val != "")&& ($("#password").val() != "") && ($("#password2").val() != ""))
		{
			$("#pw_notify").html("<br>");
			$("#results").html("");
			$("#results").css("color", "black");
			$("#create_account_submit_button").on("click.good_submit", function(){					
				create_acc_submit();
			});
		}
	});
	$("#account_name_field").keyup(function(){
		acc_change = true;
		if($("#account_name_field").val() == "" && acc_change == true)
		{
				$("#login_results").html("");
				$("#pw_notify").html("Account Name required for account creation.");
				$("#create_account_submit_button").unbind("click.good_submit");
		}else if(($("#account_name_field").val != "")&& ($("#password").val() != "") && ($("#password2").val() != ""))
		{
			$("#pw_notify").html("<br>");
			$("#results").html("");
			$("#results").css("color", "black");
			$("#create_account_submit_button").on("click.good_submit", function(){					
				create_acc_submit();
			});
		}
	});
	$("#password").change(function(){
		p1_edit = true;
		if(p1_edit && p2_edit)
		{
			validate_create_acc_field();
			if(($("#password").val() != $("#password2").val())  && ($("#account_name_field").val == "")&& ($("#password").val() != "") && ($("#password2").val() != ""))
			{
				$("#login_results").html("");
				$("#pw_notify").html("Account Name required for account creation.");
				$("#create_account_submit_button").unbind("click.good_submit");
			}else if(($("#password").val() != $("#password2").val()) && ($("#password").val() != "") && ($("#password2").val() != ""))
			{
				$("#login_results").html("");
				$("#pw_notify").html("Passwords do not match.");
				$("#create_account_submit_button").unbind("click.good_submit");
			}else if(($("#account_name_field").val != "")&& ($("#password").val() != "") && ($("#password2").val() != ""))
			{
				$("#pw_notify").html("<br>");
				$("#results").html("");
				$("#results").css("color", "black");
				$("#create_account_submit_button").on("click.good_submit", function(){					
					create_acc_submit();
				});
			}
		}
	});
	$("#password").keyup(function(){
		p1_edit = true;
		if(p1_edit && p2_edit)
		{
			validate_create_acc_field();
			if(($("#password").val() != $("#password2").val())  && ($("#account_name_field").val == "")&& ($("#password").val() != "") && ($("#password2").val() != ""))
			{
				$("#login_results").html("");
				$("#pw_notify").html("Account Name required for account creation.");
				$("#create_account_submit_button").unbind("click.good_submit");
			}else if(($("#password").val() != $("#password2").val()) && ($("#password").val() != "") && ($("#password2").val() != ""))
			{
				$("#login_results").html("");
				$("#pw_notify").html("Passwords do not match.");
				$("#create_account_submit_button").unbind("click.good_submit");
			}else if(($("#account_name_field").val != "")&& ($("#password").val() != "") && ($("#password2").val() != ""))
			{
				$("#pw_notify").html("<br>");
				$("#results").html("");
				$("#results").css("color", "black");
				$("#create_account_submit_button").on("click.good_submit", function(){					
					create_acc_submit();
				});
			}
		}
	});
	$("#password2").change(function(){
		p2_edit = true;
		if(p1_edit && p2_edit)
		{
			validate_create_acc_field();
			if((($("#password").val() != $("#password2").val())) && ($("#account_name_field").val == "")&& ($("#password").val() != "") && ($("#password2").val() != ""))
			{
				$("#login_results").html("");
				$("#pw_notify").html("Account Name required for account creation.");
				$("#create_account_submit_button").unbind("click.good_submit");
			}else if(($("#password").val() != $("#password2").val()) && ($("#password").val() != "") && ($("#password2").val() != ""))
			{
				$("#login_results").html("");
				$("#pw_notify").html("Passwords do not match.");
				$("#create_account_submit_button").unbind("click.good_submit");
			}else if(($("#account_name_field").val != "")&& ($("#password").val() != "") && ($("#password2").val() != ""))
			{
				$("#pw_notify").html("<br>");
				$("#results").html("");
				$("#results").css("color", "black");
				$("#create_account_submit_button").on("click.good_submit", function(){
					create_acc_submit();
				});
			}
		}
	});
	$("#password2").keyup(function(){
		p2_edit = true;
		if(p1_edit && p2_edit)
		{
			validate_create_acc_field();
			if((($("#password").val() != $("#password2").val())) && ($("#account_name_field").val == "")&& ($("#password").val() != "") && ($("#password2").val() != ""))
			{
				$("#login_results").html("");
				$("#pw_notify").html("Account Name required for account creation.");
				$("#create_account_submit_button").unbind("click.good_submit");
			}else if(($("#password").val() != $("#password2").val()) && ($("#password").val() != "") && ($("#password2").val() != ""))
			{
				$("#login_results").html("");
				$("#pw_notify").html("Passwords do not match.");
				$("#create_account_submit_button").unbind("click.good_submit");
			}else if(($("#account_name_field").val != "")&& ($("#password").val() != "") && ($("#password2").val() != ""))
			{
				$("#pw_notify").html("<br>");
				$("#results").html("");
				$("#results").css("color", "black");
				$("#create_account_submit_button").on("click.good_submit", function(){
					create_acc_submit();
				});
			}
		}
	});
}

//validation for create account fields.
function validate_create_acc_field()
{
	$("#create_account_submit_button").unbind("click.good_submit");
	if(($("#account_name_field").val() == "") && (($("#password").val() == "") || ($("#password2").val() == "")))
	{
		$("#pw_notify").css("color", "orange");
		$("#pw_notify").html("Account Name and Password required for account creation.");
		$("#login_results").html("");
		$("#create_account_submit_button").unbind("click.good_submit");
	}
	else if($("#account_name_field").val() == "")
	{
		$("#pw_notify").css("color", "orange");
		$("#pw_notify").html("Account Name required for account creation.");
		$("#login_results").html("");
		$("#create_account_submit_button").unbind("click.good_submit");
	}else if($("#password").val() == "")
	{
		$("#pw_notify").css("color", "orange");
		$("#pw_notify").html("Password required for account creation.");
		$("#login_results").html("");
		$("#create_account_submit_button").unbind("click.good_submit");
	}else if($("#password2").val() == "orange")
	{
		$("#pw_notify").css("color", "");
		$("#pw_notify").html("Please confirm your password.");
		$("#login_results").html("");
		$("#create_account_submit_button").unbind("click.good_submit");
	}

}

function create_acc_submit()
{
	var username = $("#account_name_field").val();
	var password = $("#password").val();
	$.ajax({
		method: 'get',
		url: '../PHP/create_acc.php',
		data: {
			'username' : username,
			'password' : password,
			'ajax' : true
		},
		success: function(data){
			var array = jQuery.parseJSON(data);
			$("#login").html("<div id = 'login_results'></div>");
			if(array['status'] == "good")
			{
				$("#login_results").css("color", "green");
				login(username,password);
				$("#login").html("Login: <div id = 'login_results'></div><input id = 'username_login' type = 'text' value = 'username'/><input id = 'password_login' type = 'password' value = 'password'/><button id = 'login_button' onclick = 'login()'>Login</button><button id = 'create_acc_button' onclick = 'create_acc()'>Create Account</button>'");
				$("#search_field_div").html("<br><br>Search for a food:<br><input id = 'search_field' type = 'text' value = 'Search for Food'/><button id = 'search_button' onclick = 'search(false)'>Search</button><button id = 'add_food_button' onclick = 'add_food()'>Add Food to DB</button>");
				set_on_clicks();
				$("#login_results").html(array['text']);
				cur_day = 0;
			}else
			{
				$("#login_results").css("color", "");
				$("#pw_notify").html(array['text']);
			}
			
		},
		error: function(data){
			//$("results").html("something fucked up in php");
		}
	});
	
	
}

//Logout Function, gets rid of cookie in database
function logout()
{
	results = document.cookie.split('|');
	var username = results[1];
	var long_num = results[0];
	cur_day = 0;
	$.ajax({
		method: 'get',
		url: '../PHP/cookie_logout.php',
		data: {
			'username' : username,
			'long_num' : long_num
		}
	});
	logged_in = false;
	cur_user = "";
	diary_view = false;
	diary_update();
	$("#results").html("");
	$("#notify").html("");
	$("#login").html('Login: <div id = "login_results"></div><input id = "username_login" type = "text" value = "username"/><input id = "password_login" type = "password" value = "password"/><button id = "login_button" onclick = "login(\'\',\'\')">Login</button><button id = "create_acc_button" onclick = "create_acc()">Create Account</button>');
	$("#Diary").html("");
	$("#Goals").html("");
	$("#Graphs").html("");
	$("#Daily_Intake_Table").html("");
	$("#search_field_div").html("<br><br>Search for a food:<br><input id = 'search_field' type = 'text' value = 'Search for Food'/><button id = 'search_button' onclick = 'search(false)'>Search");
	document.cookie = "";
	set_on_clicks();
}

//creates and stores a cookie in the database.
function create_and_store_cookie()
{
	var cookie = document.cookie;
	$.ajax({
		method: 'get',
		url: '../PHP/store_cookie.php',
		data: {
			'cookie' : cookie
		}
	});
}

//attempts to login with the document.cookie, should be called from document.ready only(when the user first loads the page)
function cookie_login_attempt()
{
	$("#results").html("");
	results = document.cookie.split('|');
	var username = results[1];
	var long_num = results[0];
	//$("#results2").html(username + " " + long_num);
	$.ajax({
		method: 'get',
		url: '../PHP/cookie_login.php',
		data: {
			'username' : username,
			'long_num' : long_num,
			'day' : cur_day
		},
		success: function(data){
			var array = jQuery.parseJSON(data);
			if(array['status'] == "good")
			{
				logged_in = true;
				cur_user = array['username'];
				diary_update();
				$("#notify").css("color", "blue");
				$("#notify").html("Logged in as "+ array['username'] + '.');
				$("#login").html('<button id = "logout_button" onclick = "logout()">Logout</button>');
				$("#Goals").html('<button id = "goals_button" onclick = "view_goals()">Goals</button>');
				$("#Graphs").html('<button id = "graphs_button" onclick = "view_graphs()">Progress Graphs</button><button id = "show_diary_button" onclick = "show_diary()">Show Diary</button>');
				diary_view = false;
				$("#Diary").html("");
				$("#Diary").remove("table");
				$("#graphs_button").css("width", "200px");
				$("#show_diary_button").css("width", "200px");
				$("#search_field_div").html("<br><br>Search for a food:<br><input id = 'search_field' type = 'text' value = 'Search for Food'/><button id = 'search_button' onclick = 'search(false)'>Search</button><button id = 'add_food_button' onclick = 'add_food()'>Add Food to DB</button>");
				set_on_clicks();
			}
			
		}
	});
}

//info will return the nutrition facts of the item of which the "Nutrition" button was pressed, will fill html "#results" and add a back button to call search on the previous search params
function info(food_NDB_No, weight)
{
	$.ajax({
		method: 'get',
		url: '../PHP/food_data_lookup.php',
		data: {
			'NDB_No' : food_NDB_No,
			'logged_in': logged_in,
			'weight' : weight
		},
		success: function(data){
			var back_to_search = "<button onclick = 'search(" + true + ")'>Back</button>";
			$("#results").html(back_to_search + data);
			$("#Food_Amount").change(function(){
				nutrition_update(food_NDB_No, $("#Food_Amount").val());
			});
		}
	});
	
}

function add_entry(food_NDB_No)
{
	var weight = $("#Food_Amount").val();
	if(!weight)
	{
		weight = '0';
	}
	$.ajax({
		method: 'get',
		url: '../PHP/add_entry.php',
		data: {
			'NDB_No' : food_NDB_No,
			'username': cur_user,
			'weight' : weight,
			'day' : cur_day
		},
		success: function(data){			
			if(data)
			{
				diary_update();	
			}
		}
	});
}

function diary_update()
{
	if(cur_user !== "")
	{
		$.ajax({
			method: 'get',
			url: '../PHP/update_diary.php',
			data: {
				'username' : cur_user,
				'day' : cur_day
			},
			success: function(data){
				if(diary_view)
				{
					show_diary();
					//search(search_string);
				}else
				{
					$("#Diary").html(data);
				}
			}
		});
	}else
	{
		$("#Diary").html("");
	}
	$("#Diary_Entries_Table").css("height", "200px");
	$("#Diary_Entries_Table").css("width", "100px");
	$("#Diary_Entries_Table").children("tbody").css("display", "block");
	$("#Diary_Entries_Table").children("tbody").css("width", "400px");
	$("#Diary_Entries_Table").children("tbody").css("height", "400px");
	$("#Diary_Entries_Table").children("tbody").css("overflow", "auto");
}

function remove_entry(iddiary_entry)
{
	$.ajax({
		method: 'get',
		url: '../PHP/remove_entry.php',
		data: {
			'id' : iddiary_entry,
			'day' : cur_day
		},
		success:function(data){
			if(data)
			{
				diary_update();
			}
		}
	});
}

function nutrition_update(food_NDB_No, food_weight)
{
	var multiplier = food_weight / 100; //food_weight in grams divided by 100g(which is what the nut_vals are based upon)
	$.ajax({
		method: 'get',
		url: '../PHP/nutrition_update.php',
		data: {
			'NDB_No' : food_NDB_No
		},
		success:function(data){
			var array = jQuery.parseJSON(data);
			$("#calories").html((array['calories']*multiplier).toFixed(2));
			$("#total_fat").html((array['total_fat']*multiplier).toFixed(2) + "g");
			$("#sat_fat").html((array['sat_fat']*multiplier).toFixed(2) + "g");
			$("#trans_fat").html((array['trans_fat']*multiplier).toFixed(2) + "g");
			$("#mono_fat").html((array['mono_fat']*multiplier).toFixed(2) + "g");
			$("#poly_fat").html((array['poly_fat']*multiplier).toFixed(2) + "g");
			$("#cholesterol").html((array['cholesterol']*multiplier).toFixed(2) + "mg");
			$("#sodium").html((array['sodium']*multiplier).toFixed(2) + "mg");
			$("#carbs").html((array['carbs']*multiplier).toFixed(2) + "g");
			$("#fiber").html((array['fiber']*multiplier).toFixed(2) + "g");
			$("#sugar").html((array['sugar']*multiplier).toFixed(2) + "g");
			$("#protein").html((array['protein']*multiplier).toFixed(2) + "g");
		}
	});
}

function view_goals()
{
	$("#results").html("");
	$("#Goals").html('<button id = "goals_button" onclick = "view_goals()">Goals</button>');
	$("#goals_button").attr('onclick', 'cookie_login_attempt()');
	$("#goals_button").text('Main Page');
	$.ajax({
		method: 'get',
		url: '../PHP/fetch_goals.php',
		data: {
			'cur_user' : cur_user
		},
		success: function(data){
			$("#Diary").html(cur_user + "'s Goals: <br>" + data);
			$("#Diary").append("<div id = 'updated_goals_notify'><br></div>");
			$("#Diary").append("<div id = 'validate_goals_div'></div>");
			set_goal_on_clicks();
			if(($("#goal_calories").val() != "No Goal Set.") && ($("#goal_protein").val() != "No Goal Set.") && ($("#goal_fat").val() != "No Goal Set.") && ($("#goal_carbs").val() != "No Goal Set."))
			{
					validate_goals();
			}
		}
	});

}
function validate_goals()
{
	var checker = $("#goal_calories").val() - ($("#goal_protein").val()*4 + $("#goal_fat").val()*9 + $("#goal_carbs").val()*4);
	//alert($("#goal_calories").val() + " - " + $("#goal_protein").val()*4 + " + " + $("#goal_fat").val()*9 + " + " + $("#goal_carbs").val()*4 + " = " + checker);
			if(-50 > checker || checker > 50)
			{
				$("#updated_goals_notify").html("");
				$("#validate_goals_div").css("color", "red");
				$("#validate_goals_div").css("display", "inline");
				$("#validate_goals_div").css("text-shadow", "none");
				$("#validate_goals_div").css("background-color", "white");
				$("#validate_goals_div").html("Goals for protein, fat, and carbohydrates do not add up to total calories. (If this is intentional, please ignore this message.)");
			}else
			{
				$("#validate_goals_div").css("background-color", "");
				$("#validate_goals_div").html("");
			}
}

function set_goal_on_clicks()
{
	$("#goal_calories").on("click", function(){
		$(this).val("");
	});
	
	$("#goal_carbs").on("click", function(){
		$(this).val("");
	});
	
	$("#goal_fat").on("click", function(){
		$(this).val("");
	});
	
	$("#goal_protein").on("click", function(){
		$(this).val("");
	});
	
}
function set_protein_goal(number_in_grams)
{
	$.ajax({
		method: 'get',
		url: '../PHP/update_goals.php',
		data: {
			'type' : "protein",
			'goal' : number_in_grams,
			'user' : cur_user
		},
		success: function(data){
			var array = jQuery.parseJSON(data);
			if(array['status'] == "good")
			{
				$("#updated_goals_notify").css("color", "green");
				$("#updated_goals_notify").html("Successfully updated protein goal.");
				$("#updated_goals_notify").html();
				if(array['percentage'])
				{
					$("#goal_protein").val(array['updated_goal']);
				}
				if(($("#goal_calories").val() != "No Goal Set.") && ($("#goal_protein").val() != "No Goal Set.") && ($("#goal_fat").val() != "No Goal Set.") && ($("#goal_carbs").val() != "No Goal Set."))
				{
					validate_goals();
				}
			}else
			{
				$("#updated_goals_notify").css("color", "");
				$("#updated_goals_notify").html("Failed to update protein goal.");
			}
		}
	});
}

function set_carb_goal(number_in_grams)
{
	$.ajax({
		method: 'get',
		url: '../PHP/update_goals.php',
		data: {
			'type' : "carbs",
			'goal' : number_in_grams,
			'user' : cur_user
		},
		success: function(data){
			var array = jQuery.parseJSON(data);
			if(array['status'] == "good")
			{
				$("#updated_goals_notify").css("color", "green");
				$("#updated_goals_notify").html("Successfully updated carbohydrate goal.");
				if(array['percentage'])
				{
					$("#goal_carbs").val(array['updated_goal']);
				}
				if(($("#goal_calories").val() != "No Goal Set.") && ($("#goal_protein").val() != "No Goal Set.") && ($("#goal_fat").val() != "No Goal Set.") && ($("#goal_carbs").val() != "No Goal Set."))
				{
					validate_goals();
				}
			}else
			{
				$("#updated_goals_notify").css("color", "");
				$("#updated_goals_notify").html("Failed to update carbohydrate goal.");
			}
		}
	});
}

function set_fat_goal(number_in_grams)
{
	$.ajax({
		method: 'get',
		url: '../PHP/update_goals.php',
		data: {
			'type' : "fat",
			'goal' : number_in_grams,
			'user' : cur_user
		},
		success: function(data){
			var array = jQuery.parseJSON(data);
			if(array['status'] == "good")
			{
				$("#updated_goals_notify").css("color", "green");
				$("#updated_goals_notify").html("Successfully updated fat goal.");
				if(array['percentage'])
				{
					$("#goal_fat").val(array['updated_goal']);
				}
				if(($("#goal_calories").val() != "No Goal Set.") && ($("#goal_protein").val() != "No Goal Set.") && ($("#goal_fat").val() != "No Goal Set.") && ($("#goal_carbs").val() != "No Goal Set."))
				{
					validate_goals();
				}
			}else
			{
				$("#updated_goals_notify").css("color", "");
				$("#updated_goals_notify").html("Failed to update fat goal.");
			}
		}
	});
}

function set_cal_goal(number)
{
	$.ajax({
		method: 'get',
		url: '../PHP/update_goals.php',
		data: {
			'type' : "calories",
			'goal' : number,
			'user' : cur_user
		},
		success: function(data){
			var array = jQuery.parseJSON(data);
			if(array['status'] == "good")
			{
				$("#updated_goals_notify").css("color", "green");
				$("#updated_goals_notify").html("Successfully updated calorie goal.");
				if(($("#goal_calories").val() != "No Goal Set.") && ($("#goal_protein").val() != "No Goal Set.") && ($("#goal_fat").val() != "No Goal Set.") && ($("#goal_carbs").val() != "No Goal Set."))
				{
					validate_goals();
				}
			}else
			{
				$("#updated_goals_notify").css("color", "");
				$("#updated_goals_notify").html("Failed to update calorie goal.");
			}
		}
	});
}

function add_food()
{
	var cal_changed = false;
	var fat_changed = false;
	var carb_changed = false;
	var protein_changed = false;
	var serv_changed = false;
	var unit_changed = false;
	
	$("#Goals").html('<button id = "goals_button" onclick = "view_goals()">Goals</button><button id = "diary_button" onclick = "cookie_login_attempt()">Diary</button>');
	$("#Diary").html("<label>Food Name: </label><input id = 'food_name' class = 'check_val_add' style = 'color:' type = 'text' value = 'Name of Food'></input><br>");
	$("#Diary").append("<label>Calories: </label><input id = 'calories_field' class = 'check_val_add' style = 'color:' type = 'text' value = 'Calories'></input><br>");
	$("#Diary").append("<label>Fat: </label><input id = 'fat_field' class = 'check_val_add' style = 'color:' type = 'text' value = 'Fat in grams'></input><br>");
	$("#Diary").append("<label>Carbohydrates: </label><input id = 'carbohydrates_field' class = 'check_val_add' style = 'color:' type = 'text' value = 'Carbohydrates in grams'></input><br>");
	$("#Diary").append("<label>Sugars: </label><input id = 'sugars_field' class = 'check_val_add' type = 'text' style = 'color:' value = 'Sugar in grams'></input><br>");
	$("#Diary").append("<label>Protein: </label><input id = 'protein_field' class = 'check_val_add' style = 'color:' type = 'text' value = 'Protein in grams'></input><br>");
	$("#Diary").append("<label>Number of Servings: </label><input id = 'serving_field' class = 'check_val_add' style = 'color:' type = 'text' value = '# of Servings'></input><br>");
	$("#Diary").append("<label>Serving Size Unit: </label><input id = 'unit_field' class = 'check_val_add' style = 'color:' type = 'text' value = 'Serving(Cup, tbsp, etc.)'></input><br>");
	$("#Diary").append("<button id = 'submit_add_food' onclick = 'add_food_submit()' type = 'button'>Submit</button><div id = 'submit_add_food_notify' style = 'color:'></div><br>");
	$("#search_field_div").html("");
	$("#results").html("");
	$("#results").css("color", "");
	
	$(".check_val_add").on("focus", function(){
		$(this).val("");
		$(this).css("color", "black");
	});
	
	$("#food_name").on("click", function(){
			$(this).val("");
			$(this).css("color", "black");
	});
	$("#calories_field").on("click", function(){
			$(this).val("");
			$(this).css("color", "black");
	});
	
	$("#calories_field").on("change", function(){
		
		var checker = $("#calories_field").val() - ((($("#protein_field").val())*4)+(($("#carbohydrates_field").val())*4)+(($("#fat_field").val())*9));
		if(-50 > checker || checker > 50)
		{
			$("#results").css("color", "red");
			$("#results").css("text-shadow", "none");
			$("#results").html("Warning: Calories do not match Fat, Protein and Carbohydrate Values!<br> Calories(" + $("#calories_field").val() + ") does not equal the sum of Fat(" + $("#fat_field").val()*9 + "), Carbohydrates(" + $("#carbohydrates_field").val()*4 + "), and Protein(" + $("#protein_field").val()*4 + ")");
			
		}else
		{
			$("#results").html("");
		}
	});
	
	$("#fat_field").on("click", function(){
			$(this).val("");
			$(this).css("color", "black");
	});
	
	$("#fat_field").on("change", function(){
		var checker = $("#calories_field").val() - ((($("#protein_field").val())*4)+(($("#carbohydrates_field").val())*4)+(($("#fat_field").val())*9));
		if(-50 > checker || checker > 50)
		{
			$("#results").css("color", "red");
			$("#results").css("text-shadow", "none");
			$("#results").html("Warning: Calories do not match Fat, Protein and Carbohydrate Values!<br> Calories(" + $("#calories_field").val() + ") does not equal the sum of Fat(" + $("#fat_field").val()*9 + "), Carbohydrates(" + $("#carbohydrates_field").val()*4 + "), and Protein(" + $("#protein_field").val()*4 + ")");
		}else
		{
			$("#results").html("");
		}
	});
	
	$("#carbohydrates_field").on("click", function(){
			$(this).val("");
			$(this).css("color", "black");
	});
	
	$("#carbohydrates_field").on("change", function(){		
		var checker = $("#calories_field").val() - ((($("#protein_field").val())*4)+(($("#carbohydrates_field").val())*4)+(($("#fat_field").val())*9));
		if(-50 > checker || checker > 50)
		{
				$("#results").css("color", "red");
				$("#results").css("text-shadow", "none");
				$("#results").html("Warning: Calories do not match Fat, Protein and Carbohydrate Values!<br> Calories(" + $("#calories_field").val() + ") does not equal the sum of Fat(" + $("#fat_field").val()*9 + "), Carbohydrates(" + $("#carbohydrates_field").val()*4 + "), and Protein(" + $("#protein_field").val()*4 + ")");
		}else
		{
			$("#results").html("");
		}
			
	});
	$("#sugars_field").on("click", function(){
			$(this).val("");
			$(this).css("color", "black");
	});
	$("#protein_field").on("click", function(){
			$(this).val("");
			$(this).css("color", "black");
	});
	
	$("#protein_field").on("change", function(){
			var checker = $("#calories_field").val() - ((($("#protein_field").val())*4)+(($("#carbohydrates_field").val())*4)+(($("#fat_field").val())*9));
			if(-50 > checker || checker > 50)
			{
				$("#results").css("color", "red");
				$("#results").css("text-shadow", "none");
				$("#results").html("Warning: Calories do not match Fat, Protein and Carbohydrate Values!<br> Calories(" + $("#calories_field").val() + ") does not equal the sum of Fat(" + $("#fat_field").val()*9 + "), Carbohydrates(" + $("#carbohydrates_field").val()*4 + "), and Protein(" + $("#protein_field").val()*4 + ")");
			}else
			{
				$("#results").html("");
			}	
	});
	
	$("#serving_field").on("click", function(){
			$(this).val("");
			$(this).css("color", "black");
	});
	
	$("#serving_field").on("change", function(){
		var checker = $("#calories_field").val() - ((($("#protein_field").val())*4)+(($("#carbohydrates_field").val())*4)+(($("#fat_field").val())*9));
		if(-50 > checker || checker > 50)
		{
			$("#results").css("color", "red");
			$("#results").css("text-shadow", "none");
			$("#results").html("Warning: Calories do not match Fat, Protein and Carbohydrate Values!<br> Calories(" + $("#calories_field").val() + ") does not equal the sum of Fat(" + $("#fat_field").val()*9 + "), Carbohydrates(" + $("#carbohydrates_field").val()*4 + "), and Protein(" + $("#protein_field").val()*4 + ")");
		}else
		{
			$("#results").html("");
		}
	});
	
	$("#unit_field").on("click", function(){
		$(this).val("");
		$(this).css("color", "black");
		
	});
	
	$("#unit_field").on("change", function(){
		var checker = $("#calories_field").val() - ((($("#protein_field").val())*4)+(($("#carbohydrates_field").val())*4)+(($("#fat_field").val())*9));
		if(-50 > checker || checker > 50)
		{
			$("#results").css("color", "red");
			$("#results").css("text-shadow", "none");
			$("#results").html("Warning: Calories do not match Fat, Protein and Carbohydrate Values!<br> Calories(" + $("#calories_field").val() + ") does not equal the sum of Fat(" + $("#fat_field").val()*9 + "), Carbohydrates(" + $("#carbohydrates_field").val()*4 + "), and Protein(" + $("#protein_field").val()*4 + ")");
		}else
		{
			$("#results").html("");
		}
	});
	
	
}

function add_food_submit()
{
	var desc = $("#food_name").val();
	var cals = $("#calories_field").val();
	var fats = $("#fat_field").val();
	var carbs = $("#carbohydrates_field").val();
	var sugars = $("#sugars_field").val();
	var protein = $("#protein_field").val();
	var amount = $("#serving_field").val();
	var serving = $("#unit_field").val();
	//alert($("#food_name").val() + $("#calories_field").val() + $("#fat_field").val() + $("#carbohydrates_field").val() + $("#sugars_field").val() + $("#protein_field").val() + $("#serving_field").val() + $("#unit_field").val());
	var d_set = false;
	var c_set = false;
	var f_set = false;
	var car_set = false;
	var s_set = false;
	var p_set = false;
	var serv_set = false;
	var unit_set = false;
	$("#results").html("");
	$("#results").css("color", "black");
	if(desc === "Name of Food" || desc.length === 0  || desc === "Required Field" )
	{
		$("#food_name").css("color","");
		$("#food_name").val("Required Field");
		$("#food_name").on("click", function(){
			$(this).val("");
			$(this).css("color", "black");
		});
		$("#food_name").on("focus", function(){
			$(this).val("");
			$(this).css("color", "black");
		});
		d_set = false;
	}else if(desc.length != 0)
	{
		d_set = true;
	}
	if(cals === "Calories" || cals === "Required Field"  || cals.length === 0 || cals < 0)
	{
		$("#calories_field").css("color","");
		$("#calories_field").val("Required Field");
		$("#calories_field").on("click", function(){
			$(this).val("");
			$(this).css("color", "black");
		});
		$("#calories_field").on("focus", function(){
			$(this).val("");
			$(this).css("color", "black");
		});
		c_set = false;
	}else if (cals.length != 0)
	{
		c_set = true;
	}
	if(fats === "Fat in grams" || fats.length === 0 || fats < 0)
	{
		$("#fat_field").css("color","");
		$("#fat_field").val("Required Field");
		$("#fat_field").on("click", function(){
			$(this).val("");
			$(this).css("color", "black");
		});
		$("#fat_field").on("focus", function(){
			$(this).val("");
			$(this).css("color", "black");
		});
		f_set = false;
	}else if(fats.length != 0)
	{
		f_set = true;
	}
	if(carbs === "Carbohydrates in grams" || carbs === "Required Field"  || carbs.length === 0 || carbs < 0)
	{
		$("#carbohydrates_field").css("color","");
		$("#carbohydrates_field").val("Required Field");
		$("#carbohydrates_field").on("click", function(){
			$(this).val("");
			$(this).css("color", "black");
		});
		$("#carbohydrates_field").on("focus", function(){
			$(this).val("");
			$(this).css("color", "black");
		});
		car_set = false;
	}else if(carbs.length != 0)
	{
		car_set = true;
	}
	if(sugars === "Sugar in grams" || sugars === "Required Field"  || sugars.length === 0 || sugars < 0)
	{
		$("#sugars_field").css("color","");
		$("#sugars_field").val("Required Field");
		$("#sugars_field").on("click", function(){
			$(this).val("");
			$(this).css("color", "black");
		});
		$("#sugars_field").on("focus", function(){
			$(this).val("");
			$(this).css("color", "black");
		});
		s_set = false;
	}else if($("#sugars_field").val.length !== 0)
	{
		s_set = true;
	}
	if(protein === "Protein in grams" || protein === "Required Field" || protein.length === 0 || protein < 0)
	{
		$("#protein_field").css("color","");
		$("#protein_field").val("Required Field");
		$("#protein_field").on("click", function(){
			$(this).val("");
			$(this).css("color", "black");
		});
		$("#protein_field").on("focus", function(){
			$(this).val("");
			$(this).css("color", "black");
		});
		p_set = false;
	}else if($("#protein_field").val().length !== 0)
	{
		p_set = true;
	}
	if(amount === "# of Servings" || amount === "Required Field"  || amount.length === 0)
	{
		$("#serving_field").css("color","");
		$("#serving_field").val("Required Field");
		$("#serving_field").on("click", function(){
			$(this).val("");
			$(this).css("color", "black");
		});
		$("#serving_field").on("focus", function(){
			$(this).val("");
			$(this).css("color", "black");
		});
		serv_set = false;
	}else if(amount <= 0)
	{
		$("#serving_field").css("color","");
		$("#serving_field").val("# must be > 0");
		$("#serving_field").on("click", function(){
			$(this).val("");
			$(this).css("color", "black");
		});
		$("#serving_field").on("focus", function(){
			$(this).val("");
			$(this).css("color", "black");
		});
		serv_set = false;
	}else if(amount.length != 0) 
	{
		serv_set = true;
	}
	if(serving === "Serving(Cup, tbsp, etc.)"  || serving === "Required Field" || serving.length === 0)
	{
		$("#unit_field").css("color","");
		$("#unit_field").val("Required Field");
		$("#unit_field").on("click", function(){
			$(this).val("");
			$(this).css("color", "black");
		});
		$("#unit_field").on("focus", function(){
			$(this).val("");
			$(this).css("color", "black");
		});
		unit_set = false;
	}else if (serving.length != 0)
	{
		unit_set = true;
	}
	if((d_set && c_set && f_set && car_set && s_set && p_set && serv_set && unit_set) == true)
	{
			$.ajax({
				method: 'get',
				url: '../PHP/add_food.php',
				data: {
					'description' : desc,
					'calories' : $("#calories_field").val(),
					'fat' : $("#fat_field").val(),
					'carbs' : $("#carbohydrates_field").val(),
					'sugars' : $("#sugars_field").val(),
					'protein' : $("#protein_field").val(), 
					'amount' : $("#serving_field").val(),
					'serving' : $("#unit_field").val()
				},
				success: function(data){
					//$("#results").html(data);
					if(data)
					{
						$("#results").html("");
						$("#results").css("text-shadow", "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000");
						$("#results").css("color", "#BDFCC9");
						cookie_login_attempt();
						info(data, 0);
					}else
					{
						$("#results").css("color", "red");
						$("#results").css("text-shadow", "none");
						$("#results").html("Failed to insert food.");
					}
				}
			});
	}else
	{
		$("#results").css("color", "red");
		$("#results").css("text-shadow", "none");
		$("#results").html("Please fill out the form before hitting submit");
	}
}

function set_on_clicks()
{
	$("#username_login").on("click", function(){
			$(this).val("");
			$(this).css("color", "black");
			
	});
	$("#username_login").on("focus", function(){
			$(this).val("");
			$(this).css("color", "black");
			$(this).keypress(function(e){
			if(e.which == 13)
			{
				login("", "");
			}
		});
	});
	$("#password_login").on("click", function(){
			$(this).val("");
			$(this).css("color", "black");
	});
	$("#password_login").on("focus", function(){
			$(this).val("");
			$(this).css("color", "black");
			$(this).keypress(function(e){
			if(e.which == 13)
			{
				login("", "");
			}
		});
	});
	$("#search_field").on("click", function(){
			if($(this).val() === "Search for Food")
			{
				$(this).val("");
			}
			$(this).css("color", "black");
	});
	$("#search_field").focus(function(){
		if($(this).val() === "Search for Food")
		{
			$(this).val("");
		}
			$(this).css("color", "black");
		$(this).keypress(function(e){
			if(e.which == 13)
			{
				search();
			}
		});
	});
	$("#add_food_button").css("width", "140px");
}

function add_day()
{
	cur_day++;
	diary_update();
}

function subtract_day()
{
	cur_day--;	
	diary_update();
}

function view_graphs()
{
	$("#results").html("");
	$("#Goals").html('<button id = "goals_button" onclick = "view_goals()">Goals</button>');
	$("#goals_button").attr('onclick', 'cookie_login_attempt()');
	$("#goals_button").text('Main Page');
	$("#Diary").html("Weekly <input id = 'weekly' value = 'weekly' type = 'checkbox'>   Monthly <input id = 'monthly' value = 'monthly' type = 'checkbox'><br>");
	$("#Diary").append("Calories <input id = 'calorie_graph' value = 'calorie' type = 'checkbox'>		Fat <input id = 'fat_graph' value = 'fat' type = 'checkbox'>		Carbohydrates <input id = 'carbs_graph' value = 'carbs' type = 'checkbox'>		Protein <input id = 'protein_graph' value = 'protein' type = 'checkbox'>");
	$("#Diary").append("<br><button id = 'graph_submit' onclick = 'graph_validate()'>Graph</button>");
	$("#Diary").append("<br><div id = 'graph_error_time_scale'><br></div>");
	$("#Diary").append("<br><div id = 'graph_error_type'><br></div>");
	$("#Diary").append("<br><div id = 'graph_error'><br></div>");
	$("#Graphs").html("");
	$("#search_field_div").html("");
	
	
}

function graph_validate()
{
	var time_scale_good = false;
	var type_good = false;
	//'graph($('#weekly').val(), $('#monthly').val(), $('#calorie_graph').val(), $('#fat_graph').val(), $('#carbs_graph').val(), $('#protein_graph').val())'>Graph</button>"
	if($("#weekly").is(':checked') && $("#monthly").is(':checked'))
	{
		$("#graph_error_time_scale").css("color", "#FFFF66");
		$("#graph_error_time_scale").html("Please pick between weekly OR monthly, cannot graph both.");
		time_scale_good = false;
	}else
	{
		$("#graph_error_time_scale").html("<br>");
		time_scale_good = true;
	}
	
	if(($("#calorie_graph").is(':checked') && ($("#fat_graph").is(':checked') || $("#carbs_graph").is(':checked') || $("#protein_graph").is(':checked'))) ||
	($("#fat_graph").is(':checked') && ($("#calorie_graph").is(':checked') || $("#carbs_graph").is(':checked') || $("#protein_graph").is(':checked'))) ||
	($("#carbs_graph").is(':checked') && ($("#calorie_graph").is(':checked') || $("#fat_graph").is(':checked') || $("#protein_graph").is(':checked'))) ||
	($("#protein_graph").is(':checked') && ($("#calorie_graph").is(':checked') || $("#fat_graph").is(':checked') || $("#carbs_graph").is(':checked'))))
	{
		$("#graph_error_type").css("color", "#FFFF66");
		$("#graph_error_type").html("Please select one type of nutrient to graph.");
		type_good = false;
	}else
	{
		$("#graph_error_type").html("<br>");
		var type_good = true;
	}
	
	if(type_good && time_scale_good && ($("#weekly").is(':checked') || $("#monthly").is(':checked')) && ( $("#calorie_graph").is(':checked') || $("#fat_graph").is(':checked') || $("#carbs_graph").is(':checked') || $("#protein_graph").is(':checked')) )
	{
		$("#graph_error").html("<br>");
		graph();
	}else
	{
		$("#graph_error").css("color", "#FFFF66");
		$("#graph_error").html("Please select a time scale and a nutrient to graph.");
	}
}

function graph()
{
	var time = "";
	var nutrient = "";
	
	if($("#weekly").is(":checked"))
	{
		time = "weekly";
	}else if ($("#monthly").is(':checked'))
	{
		time = "monthly";
	}
	if($("#calorie_graph").is(":checked"))
	{
		nutrient = "calories";
	}else if($("#fat_graph").is(":checked"))
	{
		nutrient = "fat";
	}else if($("#carbs_graph").is(":checked"))
	{
		nutrient = "carbs";
	}else if($("#protein_graph").is(":checked"))
	{
		nutrient = "protein";
	}
	//CREATE CANVAS BEFORE AJAX
	
	$("#Graphs").html('<canvas id = "nut_graph" width = "400" height = "400"></canvas>');
	
	$.ajax({
				method: 'get',
				url: '../PHP/get_graph_data.php',
				data: {
					'nutrient' : nutrient,
					'time_scale' : time,
					'username' : cur_user
				},
				success: function(data){
					var data_array = jQuery.parseJSON(data);		
					$("#graph_error").html("<br>");
					$("#graph_error_type").html("<br>");
					$("#graph_error_time_scale").html("<br>");
					if(time == "weekly")
					{
						var weekly_date_array = [data_array['Monday'], data_array['Tuesday'], data_array['Wednesday'], data_array['Thursday'], data_array['Friday'], data_array['Saturday'], data_array['Sunday'] ];
						var graph_data = {
							labels: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
							datasets: [
								{
									fillColor: "rgba(153,255,153,1.0)",
			           				strokeColor: "rgba(220,220,220,1)",
			           				pointColor: "rgba(220,220,220,1)",
			            			pointStrokeColor: "#fff",
			            			pointHighlightFill: "#fff",
			            			pointHighlightStroke: "rgba(220,220,220,1)",
			            			data: weekly_date_array
	            				}
	            			]
						};
						var ctx = $("#nut_graph").get(0).getContext("2d");
						$("#nut_graph").css("background-color", "white");
						var nutrient_chart = new Chart(ctx).Line(graph_data);
					}else if(time == "monthly")
					{
						var monthly_date_array = [data_array[0], data_array[1], data_array[2], data_array[3], data_array[4], data_array[5], data_array[6], data_array[7], data_array[8], data_array[9], data_array[10], data_array[11], data_array[12],
						data_array[13], data_array[14], data_array[15], data_array[16], data_array[17], data_array[18], data_array[19], data_array[20], data_array[21], data_array[22], data_array[23], data_array[24], data_array[25],
						data_array[26], data_array[27], data_array[28], data_array[29], data_array[30]];
						/*for(var i = 0; i < 31; i++)
						{
							if(monthly_date_array[i] != 0)
							{
								alert(i + ": " + monthly_date_array[i]);
							}
						}*/
						var graph_data = {
							labels: ["1","","","","5","","","","","10","","","","","15","","","","","20","","","","","25","","","","","30",""],
							datasets: [
								{
									fillColor: "rgba(153,255,153,1.0)",
			           				strokeColor: "rgba(220,220,220,1)",
			           				pointColor: "rgba(220,220,220,1)",
			            			pointStrokeColor: "#fff",
			            			pointHighlightFill: "#fff",
			            			pointHighlightStroke: "rgba(220,220,220,1)",
			            			data: monthly_date_array
	            				}
	            			],
	            			pointDot: false
						};
						var ctx = $("#nut_graph").get(0).getContext("2d");
						$("#nut_graph").css("background-color", "white");
						var nutrient_chart = new Chart(ctx).Line(graph_data, {pointDot:false, showTooltips:false});
					}
					
				}
			});
			
}

function show_diary()
{
	$("#results").html("");
	$("#Goals").html('<button id = "goals_button" onclick = "view_goals()">Goals</button>');
	$("#goals_button").attr('onclick', 'cookie_login_attempt()');
	$("#goals_button").text('Main Page');
	$("#search_field_div").html("");
	search_string = "";
	diary_view = true;
	if(cur_user !== "")
	{
		$.ajax({
			method: 'get',
			url: '../PHP/show_diary.php',
			data: {
				'username' : cur_user,
				'day' : cur_day
			},
			success: function(data){
				$("#Diary").html(data);
				$("#Diary_Entries_Table th").css("width", "100px");
			}
		});
	}else
	{
		$("#Diary").html("");
	}
	
}
