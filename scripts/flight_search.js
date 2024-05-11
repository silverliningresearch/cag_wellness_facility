var flightRawList;
var flightList = [];
var flightShortList = [];
/************************************/
function getToDate() {
  var d = new Date();
      
  var month =  '' + (d.getMonth() + 1);
  var day = '' + d.getDate();
  var year = d.getFullYear();

  if (month.length < 2) 
      month = '0' + month;
  if (day.length < 2) 
      day = '0' + day;

  return [day, month, year].join('-');
}

function getTomorrow() {
  var d = new Date();
      
  var month = ''+ (d.getMonth() + 1);
  var day = '' + (d.getDate()+1);
  var year = d.getFullYear();

  if (month.length < 2) 
      month = '0' + month;
  if (day.length < 2) 
      day = '0' + day;

  return [day, month, year].join('-');
}

function flight_in_list_found(list, item) {
  item = item.toLowerCase();
  
  if (item) {
    if (item !== "") {
      // for (i = 0; i < list.length; i++) {
      //   if (list[i].Show.toLowerCase() === item) 
      //   {          
      //     $('.rt-btn.rt-btn-next').show(); 
      //     return true;
      //   }
      // }
    $('.rt-btn.rt-btn-next').show(); 
    return true;

    }
  }
  //$('.rt-btn.rt-btn-next').hide(); 
  return false;
}

function notDeparted_flight_search(flight_time) {
  var current_time = new Date().toLocaleString('en-SG', { timeZone: 'Asia/Singapore', hour12: false});
  //15:13:27
  var current_time_value  = current_time.substring(current_time.length-8,current_time.length-6) * 60;
  current_time_value += current_time.substring(current_time.length-5,current_time.length-3)*1;

  //Time: 0805    
  var flight_time_value = flight_time.substring(0,2) * 60 + flight_time.substring(2,4)*1;
  
  //plus  2 hour
  flight_time_value = flight_time_value + 120;

  var result = (flight_time_value > current_time_value);
  return (result);
}

function load_flight_list() {
  flightRawList = JSON.parse(cagAirHubFlightRawList);
  flightList = [];
  flightList.length = 0;
  
  for (i = 0; i < flightRawList.length; i++) {
    var flight = flightRawList[i];

    if(((flight.Date == getToDate()) 
    //&& (notDeparted_flight_search(flight.Time))
    )
    || ((flight.Date == getTomorrow()) //&& (parseInt(flight.Time)<300)
      ) //next date, only first 3 hours
      )
    {
      var Date = '"Date"' + ":" + '"' +  flightRawList[i].Date + '", ';
      var Time = '"Time"' + ":" + '"' +  flightRawList[i].Time + '", ';
      var DTerm = '"Time"' + ":" + '"' +  flightRawList[i].DTerm + '", ';
      var Flight = '"Flight"' + ":" + '"' +  flightRawList[i].Flight + '", ';
      var Airline = '"Airline"' + ":" + '"' +  flightRawList[i].Airline + '", '; //name
      var AirlineCode = '"AirlineCode"' + ":" + '"' +  flightRawList[i].AirlineCode + '", ';//code
      var Dest = '"Dest"' + ":" + '"' +  flightRawList[i].Dest + '", ';
      var Via = "";
      if (  flightRawList[i].Next && flightRawList[i].Next !="" && flightRawList[i].Next != flightRawList[i].Dest) {
        var Via = '"Via"' + ":" + '"' +  flightRawList[i].Next + '", ';
      }

      var Show = '"Show"' + ":" + '"' +  flightRawList[i].AirlineCode + " " + flightRawList[i].Flight + " (" + flightRawList[i].Airline + ", ";
      Show += flightRawList[i].Time.substring(0,2) +":" +  flightRawList[i].Time.substring(2,4) + " to " + flightRawList[i].Dest ;
      if (flightRawList[i].Next && flightRawList[i].Next !="" && flightRawList[i].Next != flightRawList[i].Dest) {
        Show += " via " +  flightRawList[i].Next ;
      }
      Show +=")";

      var str = '{' + Date + Time + DTerm + AirlineCode + Airline + Flight +  Dest + Via + Show + '"}';
    
      //console.log("str: ", str);

      flightList.push(JSON.parse(str));
    }
  }
  //console.log("flightList: ", flightList);
}

function update_drop_box_list() {
  var input = document.getElementById('inputFlightCodeID').value;
  var searchList = document.getElementById('flightDropBoxList');
  
  searchList.innerHTML = '';
  flightShortList = [];
  flightShortList.length = 0;

  input = input.toLowerCase();

  var count = 0;
  for (i = 0; i < flightList.length; i++) {
    let flight = flightList[i];
    var today = getToDate();
    
    var dTerminal = api.fn.answers().Terminal;

    //if ((today == flight.Date) && (dTerminal == flight.DTerm))
    //if (today == flight.Date)
    if(flight.Date == getToDate() || (flight.Date == getTomorrow()) )
    { 
      if (flight.Show.toLowerCase().includes(input)) {
        const elem = document.createElement("option");
        elem.value = flight.Show;
        searchList.appendChild(elem);
        flightShortList.push(flight);
        count++;
      }
    }
    
    if (count > 10) {
      break;
    }
  }

  if (flight_in_list_found(flightList, document.getElementById('inputFlightCodeID').value)) {
    console.log("Found ", document.getElementById('inputFlightCodeID').value);
  }
  else{
    console.log("Not found ", document.getElementById('inputFlightCodeID').value);
  }  
  
  console.log("search flight done!");
}

function select_flight() {
  var selectedFlight = document.getElementById('inputFlightCodeID').value;
  var flightDestinationValue;
  var found = false;
 //$('.rt-btn.rt-btn-next').hide(); 

  api.fn.answers({Flight: selectedFlight});
  api.fn.answers({urlVar20: selectedFlight});

  for (i = 0; i < flightShortList.length; i++) {
    var currentFlight = flightShortList[i];
    if (currentFlight.Show == selectedFlight) { 
      //store detail data here
      //Search engine to produce Flight no., Airline, Destination, Via - to be added later
      var airlineName = currentFlight.Airline; 
      api.fn.answers({Selected_Flight_Text:  selectedFlight});
      api.fn.answers({Airline:   airlineName}); //airline name
      api.fn.answers({Airline_Code:   currentFlight.AirlineCode}); //airline code
      api.fn.answers({Flight:   currentFlight.Flight});
      api.fn.answers({Dest:   currentFlight.Dest});
      if (currentFlight.Via && currentFlight.Via!=""){
        api.fn.answers({Via:   currentFlight.Via});
      }
      else
      {
        api.fn.answers({Via:""});
      }
      found = true;
      $('.rt-btn.rt-btn-next').show(); 
      break;
    }
  }
  if (!found) {
    alert("Please select a flight number from the list.");
  }
}

function show_flight_search_box() {
  load_flight_list();
/* 
  $('.rt-element.rt-text-container').append(`<input list="flightDropBoxList" onchange="select_flight()"  onkeyup="update_drop_box_list()" name="inputFlightCodeID" id="inputFlightCodeID" >
  <datalist id="flightDropBoxList"> </datalist>`); */

  $('.rt-element.rt-text-container').append(`<input list="flightDropBoxList" onchange="select_flight()"  onkeyup="update_drop_box_list()" name="inputFlightCodeID" id="inputFlightCodeID">
  <datalist id="flightDropBoxList"> </datalist>`);
 

  var currentValue  = api.fn.answers().Selected_Flight_Text;
  if (currentValue) {
    if (currentValue !== "") {
      document.getElementById('inputFlightCodeID').value = currentValue;
    }
  }

  if (flight_in_list_found(flightList, document.getElementById('inputFlightCodeID').value)) {
    console.log("Found ", document.getElementById('inputFlightCodeID').value);
  }
  else{
    console.log("Not found ", document.getElementById('inputFlightCodeID').value);
  }
  $('#inputFlightCodeID').show(); 
}


function hide_flight_search_box() {
  $('#inputFlightCodeID').hide();
  //var x = document.getElementById('inputFlightCodeID');
  //x.style.display = "none";
}