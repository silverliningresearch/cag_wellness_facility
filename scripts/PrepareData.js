var quota_data;
var interview_data;
var today_flight_list;
var this_month_flight_list;
var daily_plan_data;
var removed_ids_data;

var currentMonth;
var currentDate;
var nextDate;
var download_time;

var total_quota = 2500;
var total_completed;

var total_quota_completed;
var total_hard_quota;


/************************************/
function initCurrentTimeVars() {
  var d = new Date();
      
  var month = '' + (d.getMonth() + 1); //month start from 0;
  var day = '' + d.getDate();
  var year = d.getFullYear();

  if (month.length < 2) 
      month = '0' + month;
  if (day.length < 2) 
      day = '0' + day;

  currentMonth =[month,year].join('-')
  currentDate = [day, month,year].join('-');
  
  //next day
  var tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate()+1);
  var tomorrowMonth = '' + (tomorrow.getMonth() + 1); //month start from 0;
  var tomorrowDay = '' + tomorrow.getDate();
  var tomorrowYear = tomorrow.getFullYear();

  if (tomorrowMonth.length < 2) 
  tomorrowMonth = '0' + tomorrowMonth;
  if (tomorrowDay.length < 2) 
  tomorrowDay = '0' + tomorrowDay;
  nextDate  = [tomorrowDay, tomorrowMonth, tomorrowYear].join('-');

  //return [day, month,year].join('-');
  if (document.getElementById('year_month') && document.getElementById('year_month').value.length > 0)
  {
    if (document.getElementById('year_month').value != "current-month")
    {
      currentMonth = document.getElementById('year_month').value;
    }
  }
  console.log("currentMonth: ", currentMonth);  
}

function isCurrentMonth(interviewEndDate)
{
// Input: "2023-04-03 10:06:22 GMT"
  var interviewDateParsed = interviewEndDate.split("-")

  var interviewYear = (interviewDateParsed[0]);
  var interviewMonth =(interviewDateParsed[1]);
  
  var result = false;

  if ( currentMonth ==[interviewMonth,interviewYear].join('-'))
  {
    result = true;
  }

   return result;
}

function notDeparted(flight_time) {
  var current_time = new Date().toLocaleString('en-SG', { timeZone: 'Asia/Singapore', hour12: false});
  //15:13:27
  var current_time_value  = current_time.substring(current_time.length-8,current_time.length-6) * 60;
  current_time_value += current_time.substring(current_time.length-5,current_time.length-3)*1;

  //Time: 0805    
  var flight_time_value = flight_time.substring(0,2) * 60 + flight_time.substring(2,4)*1;
  var result = (flight_time_value > current_time_value);
  return (result);
}

function isvalid_id(id)
{
  valid = true;

  var i = 0;
  for (i = 0; i < removed_ids_data.length; i++) 
  { 
    if (removed_ids_data[i].removed_id == id)
    {
      valid = false;
    }
  }
  return valid;
}
function prepareInterviewData() {
  var quota_data_temp = JSON.parse(airport_airline_quota);
  removed_ids_data = JSON.parse(removed_ids);

  var interview_data_temp  = JSON.parse(interview_statistics);
  var flight_list_temp  = JSON.parse(cagAirHubFlightRawList);

  initCurrentTimeVars();			
  
  //get quota data
  quota_data = [];
  quota_data.length = 0;
  for (i = 0; i < quota_data_temp.length; i++) {
    var quota_month =  quota_data_temp[i].Month + "-"  + quota_data_temp[i].Year; 
    if ((quota_month== currentMonth) && (quota_data_temp[i].Quota>0))
    {
      quota_data.push(quota_data_temp[i]);
    }
  }

  //get relevant interview data
  //empty the list
  interview_data = [];
  interview_data.length = 0;

  download_time = interview_data_temp[0].download_time;
  for (i = 0; i < interview_data_temp.length; i++) {
    var interview = interview_data_temp[i];

    if (isCurrentMonth(interview.Interview_Date))
    {
      if (interview["Dest"] &&  interview["AirlineCode"]) 
      {
        var airport_code = interview["Dest"];
        var airline_code = interview["AirlineCode"];

        interview.Airport_Airline = airport_code + " - " + airline_code;
        interview.InterviewEndDate = interview["Interview_Date"] ;
        
        interview_data.push(interview);
      }
    }
  }

  //prepare flight list
    //empty the list
  today_flight_list = [];
  today_flight_list.length = 0;
  
  this_month_flight_list  = [];
  this_month_flight_list.length = 0;
  
  for (i = 0; i < flight_list_temp.length; i++) {
    let flight = flight_list_temp[i];

    var dtime = flight.Time;
													
      //airport_airline
      var airport_airline = flight.Dest + " - " + flight.AirlineCode; //code for compare

						 
      var airline_name = flight.Airline.split(" - ");; //name for display
      flight.airport_airline_name  = flight.Dest + " - " + airline_name[1]; //second part 
      flight.Flight = flight.AirlineCode + " " + flight.Flight;
      flight.Dtime = dtime;
      flight.Airport_Airline = airport_airline;
	  
    //only get today & not departed flight
    if (((currentDate == flight.Date) && notDeparted(dtime))
        || (nextDate == flight.Date)) 
    { 
      flight.Dtime = flight.Date + " " + dtime;
      today_flight_list.push(flight);
    }
    //currentMonth: 02-2023
    //flight.Date: 08-02-2023
    if (currentMonth == flight.Date.substring(3,10)) { 
      this_month_flight_list.push(flight);
    }				   
  }

  //add quota data
    //empty the list
  daily_plan_data = [];
  daily_plan_data.length = 0;
  
  for (i = 0; i < today_flight_list.length; i++) {
    let flight = today_flight_list[i];
    for (j = 0; j < quota_data.length; j++) {
      let quota = quota_data[j];
      if ((quota.Airport_Airline == flight.Airport_Airline) && (quota.Quota>0))
      {
        flight.Quota = quota.Quota;
        daily_plan_data.push(flight);
       }
    }
  }
}
