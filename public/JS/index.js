var resetChartZoom;


// Chart area ------------------------------------------------------------------------------------

function chart(dataPoints){

console.log(dataPoints.time);
console.log(dataPoints.vBat);
console.log(dataPoints.temp);

	
	
const zoomOptions = {
  limits: {
    x: {min: 0, max: dataPoints.temp.length, minRange: 10},
    y: {min: 0, max: 500, minRange: 10}
  },
  pan: {
    enabled: true,
    onPanStart({chart, point}) {
 
    },
    mode: 'xy',
  },
  zoom: {
    wheel: {
      enabled: true,
    },
    pinch: {
      enabled: true
    },
  }
};	
	
	
const ctx = $('#myChart');

const myChart = new Chart(ctx, {
	
    type: 'line',
    data: {
		//labels: ["2021-12-6 0:30","2021-12-6 0:35","2021-12-6 0:40","2021-12-6 0:45","2021-12-6 0:50","2021-12-6 0:55","2021-12-6 0:60"],
		labels: dataPoints.time,
        datasets:[
        
        {	
        label: 'Battery voltage [V]',
        //data: [65, 59, 80, 81, 56, 55, 40],
        data: dataPoints.vBat,
        fill: false,
        borderColor: 'black',
        backgroundColor: 'black',
        tension: 0.1,
        pointRadius:1,
        yAxisID: 'y',
        //color: 'red',
        },
        
        
        {	
        label: 'Temperature [°C]',
        //data: [65, 59, 80, 81, 56, 55, 40],
        data: dataPoints.temp,
        fill: false,
        borderColor: '#5aa897',
        backgroundColor: '#5aa897',
        tension: 0.1,
        pointRadius:1,
        yAxisID: 'y1',
        }
        ]
        
    },
  
    options: {
		
	animation: false,
		
	scales: {
           y: {
               beginAtZero: true,
               position:'left',
               ticks: {
                       color: "black",
                       font:{
						   // weight: 'bold',
						    size: 14
						   }
                      }
              },
           y1:{
               beginAtZero: true,
               position:'right',
               ticks: {
                       color: "#5aa897",
                       font:{
						   // weight: 'bold',
						    size: 14
						   }
                      }
              },  
              
              
           },	
	
    plugins: {
      zoom: zoomOptions,
      legend: {
                labels: {
              
                    font: {
                        size: 20
                    }
                }
            }
    }
    
    
  }
 
});

function resetZoom(){
	   myChart.resetZoom(); 
	}
resetChartZoom= resetZoom;

}



function chartPointSize(){
console.log("This is the point size function");
console.log($(".numberOfPoints").val());
	}




// this function is called from index.html

function resetZ(){
    resetChartZoom();	
	}
	
	
// Chart area ------------------------------------------------------------------------------------



// GET chart data when the page is loaded.
  $.ajax({                       
          traditional: true,
          url: '/chart',
          type: 'GET',
         // contentType: 'application/json',
         // dataType: 'json',
          success: function(dataPoints){
		  dataPoints=JSON.parse(dataPoints);
		  console.log(dataPoints);
		  chart(dataPoints);
		  }	  	  
  });
  
  
// GET request when the page is load to initialize the value of the buttons
  $.ajax({                       
          traditional: true,
          url: '/initAtReset',
          type: 'GET',
         // contentType: 'application/json',
         // dataType: 'json',
          success: function(getData){
		  dataFromServer=JSON.parse(getData);	   
		  console.log(getData);
		  evaluateState(getData);
		  }
  } );

        

// The JSON sendData is posted to app.js
function sendData(dataFromServer){
	
	  $.ajax({                       
          traditional: true,
          url: '/app',
          type: 'POST',
          contentType: 'application/json',
          data: JSON.stringify(dataFromServer),
          dataType: 'json',
          success: function(response){ 
		  console.log(response);
		  evaluateState(response);		  
		  }
		  });
		  }

 
// The function is executed when a buttorn/ range is clicked/changed. 	           
 function index(){                       
   console.log("Hello");
// Click source is identify based on the button ID e.g btn1, btn2..etc 
  switch(event.srcElement.id)                                
  {
 
  case "gpioPin12": dataFromServer.gpioPin12^= true;
  break;
  case "gpioPin11": dataFromServer.gpioPin11^= true;
  break;
  case "gpioPin10": dataFromServer.gpioPin10^= true;
  break;
  case "gpioPin09": dataFromServer.gpioPin09^= true;
  break; 
  case "BLDCslider": dataFromServer.motorSpeed= $(".slider").val();
  break;
  case "stopMotor": dataFromServer.motorSpeed= 1000;
  break;
  default: dataFromServer.ERR= true;
  } 
  sendData(dataFromServer);
}


// This function update the HTML, CSS based on the actual state of the button, slider.
function evaluateState(state){
	state= JSON.parse(state);
	
if(state.gpioPin12==1)
	{
		$("#gpioPin12").html("Led is On");
		$("#gpioPin12").css("background-color", "#5aa897");
		$("#gpioPin12").css("color", "white");
		
    }
    else{
		$("#gpioPin12").html("Led is Off");
		$("#gpioPin12").css("background-color", "WhiteSmoke");
		$("#gpioPin12").css("color", "black");  
	}
	
		
		
if(state.gpioPin11==1)
	{
		$("#gpioPin11").html("Inverter is On");
		$("#gpioPin11").css("background-color", "#5aa897");
		$("#gpioPin11").css("color", "white");
		
    }
    else{
		$("#gpioPin11").html("Inverter is Off");
		$("#gpioPin11").css("background-color", "WhiteSmoke");
		$("#gpioPin11").css("color", "black");  
	}
	
	
if(state.gpioPin10==1)
	{
		$("#gpioPin10").html("Port 10 is On");
		$("#gpioPin10").css("background-color", "#5aa897");
		$("#gpioPin10").css("color", "white");
		

    }
    else{
		$("#gpioPin10").html("Port 10 is Off");
		$("#gpioPin10").css("background-color", "WhiteSmoke");
		$("#gpioPin10").css("color", "black");  
	}
	
if(state.gpioPin09==1)
	{
		$("#gpioPin09").html("Port 09 is On");
		$("#gpioPin09").css("background-color", "#5aa897");
		$("#gpioPin09").css("color", "white");
		

    }
    else{
		$("#gpioPin09").html("Port 09 is Off");
		$("#gpioPin09").css("background-color", "WhiteSmoke");
		$("#gpioPin09").css("color", "black");  
	}
	
	$(".slider").val(state.motorSpeed);
	};
	
	
