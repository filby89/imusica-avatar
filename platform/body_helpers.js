
    // handstate circle size
    var HANDSIZE = 20;

    // tracked bone line thickness
    var TRACKEDBONETHICKNESS = 4;

    // inferred bone line thickness
    var INFERREDBONETHICKNESS = 1;

    // thickness of joints
    var JOINTTHICKNESS = 10;

    // thickness of clipped edges
    var CLIPBOUNDSTHICKNESS = 5;

    // closed hand state color
    var HANDCLOSEDCOLOR = "red";

    // open hand state color
    var HANDOPENCOLOR = "green";

    // lasso hand state color
    var HANDLASSOCOLOR = "blue";

    // tracked joint color
    var TRACKEDJOINTCOLOR = "green";

    // inferred joint color
    var INFERREDJOINTCOLOR = "yellow";

    var bones = null; 

	var JointType = Object.freeze({
	  0: 'SpineBase',
	  1: 'SpineMid',
	  2: 'Neck',
	  3: 'Head',
	  4: 'ShoulderLeft',
	  5: 'ElbowLeft',
	  6: 'WristLeft',
	  7: 'HandLeft',
	  8: 'ShoulderRight',
	  9: 'ElbowRight',
	  10: 'WristRight',
	  11: 'HandRight',
	  12: 'HipLeft',
	  13: 'KneeLeft',
	  14: 'AnkleLeft',
	  15: 'FootLeft',
	  16: 'HipRight',
	  17: 'KneeRight',
	  18: 'AnkleRight',
	  19: 'FootRight',
	  20: 'SpineShoulder',
	  21: 'HandTipLeft',
	  22: 'ThumbLeft',
	  23: 'HandTipRight',
	  24: 'ThumbRight'
	});

	var HandState = Object.freeze({
	  0: 'Unknown',
	  1: 'NotTracked',
	  2: 'Open',
	  3: 'Closed',
	  4: 'Lasso'
	});

	var TrackingConfidence = Object.freeze({
	  0: 'Hight',
	  1: 'Low'
	});

	var TrackingState = Object.freeze({
	  0: 'NotTracked',
	  1: 'Inferred',
	  2: 'Tracked'
	});

    // Create a reference for the required DOM elements.
    function draw_skeletons(bodies, bendQuanto) { 
        for (var bodyIndex = 0; bodyIndex < bodies.length; ++bodyIndex) {                
            var body = bodies[bodyIndex];

            // look for tracked bodies
            // if (body.isTracked) {
                // get joints collection
                var joints = body.joints;
                // allocate space for storing joint locations
                // var jointPoints = createJointPoints();
                
                // call native component to map all joint locations to depth space
                // if (bodyImageProcessor.processJointLocations(joints, jointPoints)) {

                    // draw the body
                    drawBody(joints, bodyColors[bodyIndex]);

                    // // draw handstate circles
                    // updateHandState(body.handLeftState, jointPoints[kinect.JointType.handLeft]);
                    // updateHandState(body.handRightState, jointPoints[kinect.JointType.handRight]);

                    // // draw clipped edges if any
                    // drawClippedEdges(body);
                // }
            // }                    
        }
    }

    function search(nameKey, myArray){
        for (var i=0; i < myArray.length; i++) {
            if (myArray[i].name === nameKey) {
                return myArray[i];
            }
        }
    }
    // Draw a body
    var drawBody = function (joints, bodyColor, bendQuanto) {
        // draw all bones
        for (var boneIndex = 0; boneIndex < boneCount; ++boneIndex) {

            var boneStart = bones[boneIndex].jointStart;
            var boneEnd = bones[boneIndex].jointEnd;
            // console.log(bones);
            var joint0 = search(boneStart, joints);
            var joint1 = search(boneEnd, joints);

            // don't do anything if either joint is not tracked
            // if ((joint0.trackingState == TrackingState.notTracked) ||
            //     (joint1.trackingState == TrackingState.notTracked)) {
            //     return;
            // }

            // all bone lines are inferred thickness unless both joints are tracked
            // var boneThickness = INFERREDBONETHICKNESS;
            if ((joint0.trackingState == TrackingState.tracked) &&
                (joint1.trackingState == TrackingState.tracked)) {
                boneThickness = TRACKEDBONETHICKNESS;
            }

            drawBone(joint0, joint1, boneThickness, bodyColor);
        }

        // draw all joints
        var jointColor = null;
        for (var jointIndex = 0; jointIndex < jointCount; ++jointIndex) {
            // var trackingState = joints.lookup(jointIndex).trackingState;

            // only draw if joint is tracked or inferred
            // if (trackingState == TrackingState.tracked) {
                jointColor = TRACKEDJOINTCOLOR;
            // }
            // else if (trackingState == TrackingState.inferred) {
            //     jointColor = INFERREDJOINTCOLOR;
            // }
            var joint = joints[jointIndex];
            var thickness = TRACKEDBONETHICKNESS;
             if (joint.name == "HandRight") {
                 var HR_x = joint.x;
                 document.getElementById("HR_x").innerHTML = HR_x;
                 var HR_y = joint.y;
                 document.getElementById("HR_y").innerHTML = HR_y;
                 thickness = 20;
             }
             else if (joint.name == "HandLeft") {
                 var HL_x = joint.x;
                 document.getElementById("HL_x").innerHTML = HL_x;
                 var HL_y = joint.y;
                 document.getElementById("HL_y").innerHTML = HL_y;
                                                
                 if (bendQuanto == 1) { 
                     jointColor = "#3333cc";
                 }
                 else if (bendQuanto == 2){
                     jointColor = "#009933";
                 }
                 else if (bendQuanto == 3){
                     jointColor = "#ffff00";
                 }
                 else if (bendQuanto == 4){
                     jointColor = "#ff0066";
                 }
                 else if (bendQuanto == 5){
                     jointColor = "#ffffff";
                 }
                 jointColor = "#FF0000";
                
                 thickness = 20;
             }

            drawJoint(joints[jointIndex], jointColor, thickness);
        }
    }

    // Draw a joint circle on canvas
    var drawJoint = function (joint, jointColor, thickness) {
        bodyContext.beginPath();
        bodyContext.fillStyle = jointColor;
        bodyContext.arc(joint.x/2.0, joint.y/2.0, thickness, 0, Math.PI * 2, true);
        bodyContext.fill();
        bodyContext.closePath();
    }

    // Draw a bone line on canvas
    var drawBone = function (startPoint, endPoint, boneThickness, boneColor) {
        bodyContext.beginPath();
        bodyContext.strokeStyle = boneColor;
        bodyContext.lineWidth = boneThickness;
        bodyContext.moveTo(startPoint.x/2.0, startPoint.y/2.0);
        bodyContext.lineTo(endPoint.x/2.0, endPoint.y/2.0);
        bodyContext.stroke();
        bodyContext.closePath();
    }

    // Determine hand state
    var updateHandState = function (handState, jointPoint) {
        switch (handState) {
            case HandState.closed:
                drawHand(jointPoint, HANDCLOSEDCOLOR);
                break;

            case HandState.open:
                drawHand(jointPoint, HANDOPENCOLOR);
                break;

            case HandState.lasso:
                drawHand(jointPoint, HANDLASSOCOLOR);
                break;                
        }
    }

    var drawHand = function (jointPoint, handColor) {
        // draw semi transparent hand cicles
        bodyContext.globalAlpha = 0.75;
        bodyContext.beginPath();
        bodyContext.fillStyle = handColor;
        bodyContext.arc(jointPoint.x, jointPoint.y, HANDSIZE, 0, Math.PI * 2, true);
        bodyContext.fill();
        bodyContext.closePath();
        bodyContext.globalAlpha = 1;
    }

    // Draws clipped edges
    var drawClippedEdges = function (body) {

        var clippedEdges = body.clippedEdges;

        bodyContext.fillStyle = "red";

        if (hasClippedEdges(clippedEdges, FrameEdges.bottom)) {
            bodyContext.fillRect(0, bodyCanvas.height - CLIPBOUNDSTHICKNESS, bodyCanvas.width, CLIPBOUNDSTHICKNESS);
        }

        if (hasClippedEdges(clippedEdges, FrameEdges.top)) {
            bodyContext.fillRect(0, 0, bodyCanvas.width, CLIPBOUNDSTHICKNESS);
        }

        if (hasClippedEdges(clippedEdges, FrameEdges.left)) {
            bodyContext.fillRect(0, 0, CLIPBOUNDSTHICKNESS, bodyCanvas.height);
        }

        if (hasClippedEdges(clippedEdges, FrameEdges.right)) {
            bodyContext.fillRect(bodyCanvas.width - CLIPBOUNDSTHICKNESS, 0, CLIPBOUNDSTHICKNESS, bodyCanvas.height);
        }
    }

    // Checks if an edge is clipped
    var hasClippedEdges = function (edges, clippedEdge) {
        return ((edges & clippedEdge) != 0);
    }

    // Allocate space for joint locations
    var createJointPoints = function () {
        var jointPoints = new Array();

        for (var i = 0; i < jointCount; ++i) {
            jointPoints.push({ joint: 0, x: 0, y: 0 });
        }

        return jointPoints;
    }

    // Create array of bones
    var populateBones = function () {
        var bones = new Array();

        // torso
        bones.push({ jointStart: "Head",             jointEnd: "Neck" });
        bones.push({ jointStart: "Neck",             jointEnd: "SpineShoulder" });
        bones.push({ jointStart: "SpineShoulder",    jointEnd: "SpineMid" });
        bones.push({ jointStart: "SpineMid",         jointEnd: "SpineBase" });
        bones.push({ jointStart: "SpineShoulder",    jointEnd: "ShoulderRight" });
        bones.push({ jointStart: "SpineShoulder",    jointEnd: "ShoulderLeft" });
        bones.push({ jointStart: "SpineBase",        jointEnd: "HipRight" });
        bones.push({ jointStart: "SpineBase",        jointEnd: "HipLeft" });

        // right arm    
        bones.push({ jointStart: "ShoulderRight",    jointEnd: "ElbowRight" });
        bones.push({ jointStart: "ElbowRight",       jointEnd: "WristRight" });
        bones.push({ jointStart: "WristRight",       jointEnd: "HandRight" });
        bones.push({ jointStart: "HandRight",        jointEnd: "HandTipRight" });
        bones.push({ jointStart: "WristRight",       jointEnd: "ThumbRight" });

        // left arm
        bones.push({ jointStart: "ShoulderLeft",     jointEnd: "ElbowLeft" });
        bones.push({ jointStart: "ElbowLeft",        jointEnd: "WristLeft" });
        bones.push({ jointStart: "WristLeft",        jointEnd: "HandLeft" });
        bones.push({ jointStart: "HandLeft",         jointEnd: "HandTipLeft" });
        bones.push({ jointStart: "WristLeft",        jointEnd: "ThumbLeft" });

        // right leg
        bones.push({ jointStart: "HipRight",         jointEnd: "KneeRight" });
        bones.push({ jointStart: "KneeRight",        jointEnd: "AnkleRight" });
        bones.push({ jointStart: "AnkleRight",       jointEnd: "FootRight" });

        // left leg
        bones.push({ jointStart: "HipLeft",          jointEnd: "KneeLeft" });
        bones.push({ jointStart: "KneeLeft",         jointEnd: "AnkleLeft" });
        bones.push({ jointStart: "AnkleLeft",        jointEnd: "FootLeft" });

        return bones;
    }
    bones = populateBones();

    jointCount = 25;
    boneCount = bones.length;

    // get canvas objects
    bodyCanvas = document.getElementById("canvas");
    bodyCanvas.width = 960;
    bodyCanvas.height = 540;
    bodyContext = bodyCanvas.getContext("2d");

    // set body colors for each unique body
    bodyColors = [
        "red",
        "orange",
        "green",
        "blue",
        "indigo",
        "violet"
    ];

 

