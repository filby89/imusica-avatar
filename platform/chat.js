	
/**
* Executed when the page has finished loading.
*/
window.onload = function () {


  	var buttonStop = document.getElementById("stop-button");	
    var label = document.getElementById("status-label");
	var status = document.getElementById("status");

	var canvas = document.getElementById("canvas");
	var context = canvas.getContext("2d");
	
	var camera = new Image();

    camera.onload = function () {
        context.drawImage(camera, 0,0, canvas.width, canvas.height);
    }
	
	if (!window.WebSocket) {
        status.innerHTML = "Your browser does not support web sockets!";
        status.classList.add("text-danger");
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
        status.classList.add("text-success");
		console.log("Connection successful.");
    };
	
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
			console.log(jsonObject);
			// console.log('Gestures Arrived! Hoorey!', jsonObject);	
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
				// console.log(" position bef= "+ LeftY + "; after= " + bendQuanto);
				if (bendQuanto < 0 || bendQuanto > 5){
					bendQuanto = 0;
				}
			document.getElementById("bendQuanto").innerHTML = bendQuanto;				
			
												
			
			 //Display the skeleton joints.
			draw_skeletons(jsonObject.skeletons, bendQuanto);

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