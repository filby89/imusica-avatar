/**
* Executed when the page has finished loading.
*/
window.onload = function () {
    // Create a reference for the required DOM elements.
    //var nameView = document.getElementById("name-view");
    //var textView = document.getElementById("text-view");
    //var buttonSend = document.getElementById("send-button");
    
	var buttonStop = document.getElementById("stop-button");
	
    var label = document.getElementById("status-label");
	var status = document.getElementById("status");

	//var buttonVideo = document.getElementById("video-button");
	//var video = document.getElementById("video");
	//Changed by Bruce
	//var bodylabel = document.getElementById("body-label");
	//var buttonBody = document.getElementById("body-button");
	//canvas
	var canvas = document.getElementById("canvas");
	var context = canvas.getContext("2d");
			
	//var buttonColor = document.getElementById("color-button");
	//var buttonGestures = document.getElementById("gestures-button");
	
	var camera = new Image();
    camera.onload = function () {
        context.drawImage(camera, 0,0, canvas.width, canvas.height);
    }
	
	if (!window.WebSocket) {
        status.innerHTML = "Your browser does not support web sockets!";
        return;
    }

    status.innerHTML = "Connecting to server...";
	
    // Connect to the WebSocket server!
    var socket = new WebSocket("ws://localhost:8181");

    /**
    * WebSocket onopen event.
    */
    // Connection established.
    socket.onopen = function () {
		//socket.send("get-gestures") ;
        status.innerHTML = "Connection successful.";
		console.log("Connection successful.");
    };
	
     var joints_seq = {
	"AnkleLeft":	14, 	
	"AnkleRight":	18 ,
	"ElbowLeft":5 	,
	"ElbowRight":9 	,
	"FootLeft":15 	,
	"FootRight":19 	,
	"HandLeft":7 	,
	"HandRight":11 	,
	"HandTipLeft":21 ,	
	"HandTipRight":	23 ,
	"Head":	3 	,
	"HipLeft":	12, 	
	"HipRight":16 ,	
	"KneeLeft":13 ,	
	"KneeRight":17 ,	
	"Neck":2 	,
	"ShoulderLeft":	4 	,
	"ShoulderRight":	8, 	
	"SpineBase":0 	,
	"SpineMid":1 	,
	"SpineShoulder":20, 	
	"ThumbLeft":22 	,
	"ThumbRight":24 ,	
	"WristLeft":6 	,
	"WristRight":10 	
	}

    function draw_bone(ctx, joint1, joint2){
		ctx.beginPath();
		ctx.moveTo(parseFloat(joint1.x/2), parseFloat(joint1.y/2));
		ctx.lineTo(parseFloat(joint2.x/2), parseFloat(joint2.y/2));
		ctx.stroke();
    }

    function draw_body(ctx, joints){
		draw_bone(ctx, joints[joints_seq['Head']], joints_seq['Neck']);

    }

    /**
    * WebSocket onmessage event.
    */

    socket.onmessage = function (event) {				
		context.fillStyle= "#FFFFFF";
		context.fillRect(0,0,960,540);
		context.fill();
        if (typeof event.data === "string") {
			// Create a JSON object.
            var jsonObject = JSON.parse(event.data);
			
			console.log('Gestures Arrived! Hoorey!', jsonObject);	
			var RightX = jsonObject.RightX;
			var LeftY = jsonObject.LeftY;
			//var GestureDirection = jsonObject.GestureDirection;			
			var RightXVel = jsonObject.RightXVel;
			if (RightX!= null) {
				document.getElementById("RightX").innerHTML = RightX;
				document.getElementById("LeftY").innerHTML = LeftY;
				//document.getElementById("GestureDirection").innerHTML = GestureDirection;
				document.getElementById("RightXVel").innerHTML = RightXVel;
			}
			//console.log('right_hand_position', RightX);
			//console.log('left_hand_position', LeftY);
			
			//var dta = {};
			//dta["position1"] = 13.0*RH_pos;	
			
			var pentatonic = [0, 2, 4, 7, 9, 12];
			var bendQuanto = Math.floor((1 - LeftY)*(pentatonic.length - 1));
				console.log(" position bef= "+ LeftY + "; after= " + bendQuanto);
				if (bendQuanto < 0 || bendQuanto > 5){
					bendQuanto = 0;
				}
			document.getElementById("bendQuanto").innerHTML = bendQuanto;				
			
												
			
			 //Display the skeleton joints.
             for (var i = 0; i < jsonObject.skeletons.length; i++) {	
					for (var j = 0; j < jsonObject.skeletons[i].joints.length; j++) {
					var joint = jsonObject.skeletons[i].joints[j];
						
						if (joint.name == "HandRight") {
							var HR_x = joint.x;
							document.getElementById("HR_x").innerHTML = HR_x;
							var HR_y = joint.y;
							document.getElementById("HR_y").innerHTML = HR_y;
							
						}
						else if (joint.name == "HandLeft") {
							var HL_x = joint.x;
							document.getElementById("HL_x").innerHTML = HL_x;
							var HL_y = joint.y;
							document.getElementById("HL_y").innerHTML = HL_y;
														
							//var colorstyle = ["#3333cc", "#009933", "#ffff00", "#ff0066", "#ffffff", "#3333cc"];
							if (bendQuanto == 1) { 
								context.fillStyle = "#3333cc";
							}
							else if (bendQuanto == 2){
								context.fillStyle = "#009933";
							}
							else if (bendQuanto == 3){
								context.fillStyle = "#ffff00";
							}
							else if (bendQuanto == 4){
								context.fillStyle = "#ff0066";
							}
							else if (bendQuanto == 5){
								context.fillStyle = "#ffffff";
							}
							context.fillStyle = "#FF0000";
							context.beginPath();
						
							context.arc(parseFloat(joint.x/2), parseFloat(joint.y/2), 20, 0, Math.PI * 2, true);
							context.closePath();
							context.fill();	
						}
						// Draw!!!	
						if (joint.name != "HandLeft") {
						context.fillStyle = "#FF0000";
						context.beginPath();
						
				        context.arc(parseFloat(joint.x/2), parseFloat(joint.y/2), 10, 0, Math.PI * 2, true);
						//console.log(joint.name +"x= "+ (joint.x /2) + "; y= "+ (joint.y /2));
						context.closePath();
						context.fill();	

						}	
						draw_body(context, jsonObject.skeletons[i].joints);

					context.closePath();
					context.fill();							
                }
            } 
								
		
				
			// Inform the server about the update.
			//socket.send("Skeleton updated on: " + (new Date()).toDateString() + ", " + (new Date()).toTimeString());
			
        }
        else if (event.data instanceof Blob) {
		
		     // RGB FRAME DATA
            // 1. Get the raw data.
            var blob = event.data;

            // 2. Create a new URL for the blob object.
            window.URL = window.URL || window.webkitURL;
            var source = window.URL.createObjectURL(blob);

            // 3. Update the image source.
            camera.src = source;

            // 4. Release the allocated memory.
            window.URL.revokeObjectURL(source);
			
			//document.write("Got the bodies data as Blob");
        }
    }

    /**
    * WebSocket onclose event.
    */
	// Connection closed.
    socket.onclose = function (event) {
		console.log("Connection closed.");
		
        var code = event.code;
        var reason = event.reason;
        var wasClean = event.wasClean;		
		
        if (wasClean) {
            status.innerHTML = "Connection closed normally.";
        }
        else {
            status.innerHTML = "Connection closed with message: " + reason + " (Code: " + code + ")";
        }
    }
    /**
    * WebSocket onerror event.
    */
    socket.onerror = function (event) {
        status.innerHTML = "Error: " + event;
    }
	/**
    * Disconnect and close the connection.
    */
    buttonStop.onclick = function (event) {
        if (socket.readyState == WebSocket.OPEN) {
            socket.close();
        }
    }
	
}
