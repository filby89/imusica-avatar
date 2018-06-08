class interactionWorld{
	
    constructor(parentDomNode){
        this.scene = {};
        this.camera = {};
        this.orbit = {};
        
		this.parentDomNode=parentDomNode;

		this.frameCounter = 0;
    }
	
	
	init(){
		//if ( ! Detector.webgl ) Detector.addGetWebGLMessage();
		
		
		this.scene = new THREE.Scene();
		this.scene.background = new THREE.Color( 0xfafafa );

		this.camera = new THREE.PerspectiveCamera( 60, this.parentDomNode.offsetWidth / this.parentDomNode.offsetHeight, 0.8, 1000 );
		this.renderer = new THREE.WebGLRenderer();
		this.renderer.setSize( this.parentDomNode.offsetWidth, this.parentDomNode.offsetHeight );
		console.log(this.parentDomNode.offsetWidth, this.parentDomNode.offsetHeight)
		this.parentDomNode.appendChild( this.renderer.domElement );
		
		this.camera.position.z = -5;
//		this.camera.position.x = 0;
		this.camera.position.y = 0;

		this.orbit = new THREE.OrbitControls( this.camera, this.renderer.domElement );

		var light = new THREE.PointLight( 0xc8aa8e, 2, 100 );
		light.position.set( 0, 2, -2 );
		this.scene.add( light )


		// floor
		var geometry = new THREE.PlaneGeometry( 5, 5);
		var material = new THREE.MeshLambertMaterial( {color: 0x726c6c, side: THREE.DoubleSide} );
		var floor = new THREE.Mesh( geometry, material );
		floor.material.side = THREE.DoubleSide;

		var rotX = (90 * Math.PI)/180;

		floor.rotation.x = rotX;
		floor.position.y = -1.1;
		this.scene.add( floor );

		//wall 1
		var geometry = new THREE.PlaneGeometry( 5, 3);
		var material = new THREE.MeshLambertMaterial( {color: 0xf3f3e2, side: THREE.DoubleSide} );

		var wall1 = new THREE.Mesh( geometry, material );
		var wall2 = new THREE.Mesh( geometry, material );
		var wall3 = new THREE.Mesh( geometry, material );

		wall1.position.x = -2.5;
		wall1.position.y = 0.4;
		wall1.rotation.y = (90*Math.PI)/180;

		wall2.position.x = 2.5;
		wall2.position.y = 0.4;
		wall2.rotation.y = (90*Math.PI)/180;

		wall3.position.z = 2.5;
		wall3.position.y = 0.4;

		this.scene.add( wall1 );
		this.scene.add( wall2 );
		this.scene.add( wall3 );


		window.addEventListener( 'resize', this.onWindowResize.bind(this));
//		this.addBox();
		var that=this;
		function animate() {
			requestAnimationFrame( animate );
			that.renderer.render( that.scene, that.camera );
		}
		animate();
	}

	// Create a test box
	addBox(){
		var geometry = new THREE.BoxGeometry( 1, 1, 1 );
		var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
		var cube = new THREE.Mesh( geometry, material );
		this.scene.add( cube );
	}
	

	// Window resize event listener
	onWindowResize() {
		this.camera.aspect = this.parentDomNode.offsetWidth / (this.parentDomNode.offsetHeight-10);
		this.camera.updateProjectionMatrix();
		//this.Three_renderer.setSize( window.innerWidth, window.innerHeight );
		this.renderer.setSize( this.parentDomNode.offsetWidth, this.parentDomNode.offsetHeight-10 );

	}
	
	

	// Function for adding lines to the scene
	createLine(vertices,material){
		if(material == null){
			var lineMat = new THREE.LineBasicMaterial({color: 0x0000ff, linewidth: 1 });	
		}
		else{
			var lineMat = material;
		}

		// var lineMat = new THREE.LineBasicMaterial({color: 0x0000ff, linewidth: 1 });
		var lineGeo = new THREE.Geometry();
		
		for (var i=0 ; i< vertices.length; i++){
//			lineGeo.vertices.push(new THREE.Vector3(vertices[i][0],vertices[i][1],vertices[i][2]));
			lineGeo.vertices.push(new THREE.Vector3(vertices[i].Xw,vertices[i].Yw,vertices[i].Zw));
		}
		
		var line = new THREE.Line(lineGeo, lineMat);
		
		return line;
	}


	// Function for removing the lines from the scene
	removeLines(lines){
		//console.log("This is removeLines:",lines);

		var lines_n = lines.length;
		for (var l=0;l<lines_n;l++){
			this.scene.remove(lines[l]);

		}
		// lines.forEach( function( item ) { 
		// 	this.scene.remove( item ) 
		// },this );
	}
	
	

	removeMeshObject(meshObject){

        if(meshObject.geometry)
            meshObject.geometry.dispose();
        if(meshObject.material)
            meshObject.material.dispose();
        if(meshObject.mesh)
            meshObject.mesh.dispose();
        if(meshObject.texture)
            meshObject.texture.dispose();

	}

}


