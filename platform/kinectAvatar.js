class kinectAvatar{

	constructor(world){

		this.JointType = Object.freeze({
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

		this.lines_in_world = [];

		this.BoneLines = new Array();
		this.boneGeometry = new THREE.SphereGeometry(this.bonesRadius, this.bonesDetail, this.bonesDetail);
		this.meshPhongMaterial = new THREE.MeshPhongMaterial();

		this.bonesDetail = 5;
		this.bonesRadius = 5;
		this.head = null;

		this.limbsWidth = 0.03;
		this.bodyWidth = 0.05;
        // torso
        this.BoneLines.push({ jointStart: "Head",             jointEnd: "Neck", width: this.bodyWidth });
        this.BoneLines.push({ jointStart: "Neck",             jointEnd: "SpineShoulder", width: this.bodyWidth });
        this.BoneLines.push({ jointStart: "SpineShoulder",    jointEnd: "SpineMid", width: this.bodyWidth });
        this.BoneLines.push({ jointStart: "SpineMid",         jointEnd: "SpineBase", width: this.bodyWidth });
        this.BoneLines.push({ jointStart: "SpineShoulder",    jointEnd: "ShoulderRight", width: this.bodyWidth });
        this.BoneLines.push({ jointStart: "SpineShoulder",    jointEnd: "ShoulderLeft", width: this.bodyWidth });
        this.BoneLines.push({ jointStart: "SpineBase",        jointEnd: "HipRight", width: this.bodyWidth });
        this.BoneLines.push({ jointStart: "SpineBase",        jointEnd: "HipLeft", width: this.bodyWidth });

        // right arm    
        this.BoneLines.push({ jointStart: "ShoulderRight",    jointEnd: "ElbowRight", width: this.limbsWidth });
        this.BoneLines.push({ jointStart: "ElbowRight",       jointEnd: "WristRight", width: this.limbsWidth });
        this.BoneLines.push({ jointStart: "WristRight",       jointEnd: "HandRight", width: this.limbsWidth });
        this.BoneLines.push({ jointStart: "HandRight",        jointEnd: "HandTipRight", width: this.bodyWidth });
        this.BoneLines.push({ jointStart: "WristRight",       jointEnd: "ThumbRight", width: this.bodyWidth });

        // left arm
        this.BoneLines.push({ jointStart: "ShoulderLeft",     jointEnd: "ElbowLeft", width: this.limbsWidth });
        this.BoneLines.push({ jointStart: "ElbowLeft",        jointEnd: "WristLeft", width: this.limbsWidth });
        this.BoneLines.push({ jointStart: "WristLeft",        jointEnd: "HandLeft", width: this.limbsWidth });
        this.BoneLines.push({ jointStart: "HandLeft",         jointEnd: "HandTipLeft", width: this.bodyWidth });
        this.BoneLines.push({ jointStart: "WristLeft",        jointEnd: "ThumbLeft", width: this.bodyWidth });

        // right leg
        this.BoneLines.push({ jointStart: "HipRight",         jointEnd: "KneeRight", width: this.limbsWidth });
        this.BoneLines.push({ jointStart: "KneeRight",        jointEnd: "AnkleRight", width: this.limbsWidth });
        this.BoneLines.push({ jointStart: "AnkleRight",       jointEnd: "FootRight", width: this.bodyWidth });

        // left leg
        this.BoneLines.push({ jointStart: "HipLeft",          jointEnd: "KneeLeft", width: this.limbsWidth });
        this.BoneLines.push({ jointStart: "KneeLeft",         jointEnd: "AnkleLeft", width: this.limbsWidth });
        this.BoneLines.push({ jointStart: "AnkleLeft",        jointEnd: "FootLeft", width: this.bodyWidth });

		function swap(json){
		  var ret = {};
		  for(var key in json){
		    ret[json[key]] = key;
		  }
		  return ret;
		}

		this.inverseJointType = swap(this.JointType);

		this.counter = 0;
		this.bonesDetail = 5;
		this.bonesRadius = 5;
		this.leftHand = [];
		this.rightHand = [];
		this.body = [];
		this.leftLeg = [];
		this.rightLeg = [];
		this.headGeometry = new THREE.SphereGeometry(15, 20, 20);
		this.boneGeometry = new THREE.SphereGeometry(this.bonesRadius, this.bonesDetail, this.bonesDetail);
		this.blueMaterial = new THREE.MeshBasicMaterial( {color: 0xffff00} );
		this.greenMaterial = new THREE.MeshBasicMaterial( {color: 0x00ff00} );

		this.meshPhongMaterial = new THREE.MeshPhongMaterial();
		this.handRight = null;
		this.world = world;
		this.allMeshes = [];
		this.allLines = [];

		this.mesh = {};
		this.skeletonHelper = {};

		this.leftHandLine = [];
		this.rightHandLine = [];
		this.leftLegLine = [];
		this.rightLegLine = [];
		this.bodyLine = [];

		// Subscribe to the appropriate postal channel	
	}

	refresh(data){
		if(this.counter == 0){
			this.startTime = performance.now();
		}

		this.counter++;

		if(this.bodyLine){
			this.world.removeLines([this.bodyLine,this.leftLegLine,this.rightLegLine,this.leftHandLine,this.rightHandLine]);

		}
		if(this.counter % 1000 ==0){

			var t1 = performance.now();

			var frames_per_sec = this.counter*1000/(t1-this.startTime);

		}


		if (this.counter % 1000 == 0){
			console.log('this.body ',this.body);

			console.log('this.bodyLine ',this.bodyLine);
		}

		if (this.mesh) {
			this.world.scene.remove(this.mesh);
		}

		this.world.removeLines(this.lines_in_world);

		var material = new THREE.LineBasicMaterial({
			color: 0x0000ff,
			linewidth: 1
		});
		var i;

		function cylinderMesh(pointX, pointY, material, cylinderWidth) {
		    var direction = new THREE.Vector3().subVectors(pointY, pointX);
		    var orientation = new THREE.Matrix4();
		    orientation.lookAt(pointX, pointY, new THREE.Object3D().up);
		    var m = new THREE.Matrix4(); m.set(1,0,0,0,0,0,1,0,0,-1,0,0,0,0,0,1); orientation.multiply(m); 
		    var edgeGeometry = new THREE.CylinderGeometry(cylinderWidth, cylinderWidth, direction.length());
		    var edge = new THREE.Mesh(edgeGeometry, material);
		    edge.applyMatrix(orientation);
		    // position based on midpoints - there may be a better solution than this
		    edge.position.x = (pointY.x + pointX.x) / 2;
		    edge.position.y = (pointY.y + pointX.y) / 2;
		    edge.position.z = (pointY.z + pointX.z) / 2;
		    return edge;
		}

		for (i=0; i<this.BoneLines.length;i++) {
			var jointStart = this.BoneLines[i].jointStart;
			var jointEnd = this.BoneLines[i].jointEnd;
			var width = this.BoneLines[i].width;
			var pointX = new THREE.Vector3(data.joints[this.inverseJointType[jointStart]].Xw, data.joints[this.inverseJointType[jointStart]].Yw, data.joints[this.inverseJointType[jointStart]].Zw);
			var pointY = new THREE.Vector3(data.joints[this.inverseJointType[jointEnd]].Xw, data.joints[this.inverseJointType[jointEnd]].Yw, data.joints[this.inverseJointType[jointEnd]].Zw);

			var material = new THREE.MeshNormalMaterial();
			var cylinderWidth = 0.05;

			if (jointStart === "SpineMid" && jointEnd === "SpineBase") {
				material = new THREE.MeshToonMaterial({color: 0x5A6372});
			}

			if (jointStart === "SpineShoulder" && jointEnd === "SpineMid") {
				material = new THREE.MeshToonMaterial({color: 0x5A6372});
			}

			if (jointStart === "SpineShoulder" && jointEnd === "ShoulderRight") {
				material = new THREE.MeshToonMaterial({color: 0x5A6372});
			}

			if (jointStart === "SpineShoulder" && jointEnd === "ShoulderLeft") {
				material = new THREE.MeshToonMaterial({color: 0x5A6372});
			}

			if (jointStart === "SpineBase" && jointEnd === "HipRight") {
				material = new THREE.MeshToonMaterial({color: 0x000000});
			}

			if (jointStart === "SpineBase" && jointEnd === "HipLeft") {
				material = new THREE.MeshToonMaterial({color: 0x000000});
			}

			if (jointStart === "HipRight" && jointEnd === "KneeRight") {
				material = new THREE.MeshToonMaterial({color: 0x000000});
			}

			if (jointStart === "HipLeft" && jointEnd === "KneeLeft") {
				material = new THREE.MeshToonMaterial({color: 0x000000});
			}

			if (jointStart === "WristRight" && jointEnd === "ThumbRight") {
				continue
			}

			if (jointStart === "WristLeft" && jointEnd === "ThumbLeft") {
				continue
			}

			var cylinder = cylinderMesh(pointX, pointY, material, width);
/*			var geometry = new THREE.Geometry();
			geometry.vertices.push(
				new THREE.Vector3(data.joints[this.inverseJointType[jointStart]].Xw, data.joints[this.inverseJointType[jointStart]].Yw, data.joints[this.inverseJointType[jointStart]].Zw),
				new THREE.Vector3(data.joints[this.inverseJointType[jointEnd]].Xw, data.joints[this.inverseJointType[jointEnd]].Yw, data.joints[this.inverseJointType[jointEnd]].Zw)
			);
			var line = new THREE.Line( geometry, material );
*/
			// if (this.lines_in_world.constructor === Array && this.lines_in_world.length > 0 ) {
			// 	this.lines_in_world[i].				
			// }
			this.world.scene.add(cylinder);
			this.lines_in_world.push(cylinder);
		}

		// create head now
		// set up the sphere vars
		var radius = 0.15;
		// create the sphere's material
		var sphereMaterial = new THREE.MeshBasicMaterial( {color: 0xffff00} );

		    
		if (this.head != null) {

			this.head.position.set(data.joints[this.inverseJointType["Head"]].Xw, data.joints[this.inverseJointType["Head"]].Yw, data.joints[this.inverseJointType["Head"]].Zw);
		}
		else {
			console.log("adding head")
			this.head = new THREE.Mesh(
			   new THREE.SphereGeometry(radius),
			   new THREE.MeshNormalMaterial());

			this.head.position.set(data.joints[this.inverseJointType["Head"]].Xw, data.joints[this.inverseJointType["Head"]].Yw, data.joints[this.inverseJointType["Head"]].Zw);

			this.world.scene.add(this.head);
		}

		this.createHandRight(data);
		this.createHandLeft(data);


	}

	createHandRight(data) {
		var radius = 0.1;
		var sphereMaterial = new THREE.MeshNormalMaterial();

		if (this.handRight != null) {
			this.handRight.position.set(data.joints[this.inverseJointType["HandTipRight"]].Xw, data.joints[this.inverseJointType["HandTipRight"]].Yw, data.joints[this.inverseJointType["HandTipRight"]].Zw);
		}
		else {
			this.handRight = new THREE.Mesh(
			   new THREE.SphereGeometry(radius),
			   new THREE.MeshNormalMaterial());

			this.handRight.position.set(data.joints[this.inverseJointType["HandTipRight"]].Xw, data.joints[this.inverseJointType["HandTipRight"]].Yw, data.joints[this.inverseJointType["HandTipRight"]].Zw);

			// add the sphere to the scene
			this.world.scene.add(this.handRight);
		}

	}

	createHandLeft(data) {
		var radius = 0.1;
		var sphereMaterial = new THREE.MeshNormalMaterial();

		if (this.handLeft != null) {
			this.handLeft.position.set(data.joints[this.inverseJointType["HandTipLeft"]].Xw, data.joints[this.inverseJointType["HandTipLeft"]].Yw, data.joints[this.inverseJointType["HandTipLeft"]].Zw);
		}
		else {
			this.handLeft = new THREE.Mesh(
			   new THREE.SphereGeometry(radius),
			   new THREE.MeshNormalMaterial());

			this.handLeft.position.set(data.joints[this.inverseJointType["HandTipLeft"]].Xw, data.joints[this.inverseJointType["HandTipLeft"]].Yw, data.joints[this.inverseJointType["HandTipLeft"]].Zw);

			// add the sphere to the scene
			this.world.scene.add(this.handLeft);
		}

	}

	refreshHands(bendQuanto) {
		var color, material;
		if (bendQuanto == 1) { 
			color = 0x3333cc;
			material = new THREE.MeshBasicMaterial( {color: color} );
		}
		else if (bendQuanto == 2){
			color = 0x009933;
			material = new THREE.MeshBasicMaterial( {color: color} );
		}
		else if (bendQuanto == 3){
			color = 0xffff00;
			material = new THREE.MeshBasicMaterial( {color: color} );
		}
		else if (bendQuanto == 4){
			color = 0xff0066;
			material = new THREE.MeshBasicMaterial( {color: color} );
		}
		else if (bendQuanto == 5){
			color = 0xffffff;
			material = new THREE.MeshBasicMaterial( {color: color} );
		}
		else {
			material = new THREE.MeshNormalMaterial();
		}
		if (this.handLeft != null) {

			this.handLeft.material = material;
			material.needsUpdate = true;
		}
	}
}

