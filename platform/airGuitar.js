class AirGuitar {
	constructor(world, avatar) {
    this.avatar = avatar;        

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

    function swap(json){
      var ret = {};
      for(var key in json){
        ret[json[key]] = key;
      }
      return ret;
    }

    this.inverseJointType = swap(this.JointType);

    this.world = world;

    this.createGuitar();
    this.createSoundSource();
    this.previousTime = Date.now();
    this.refreshTime = 200;
    this.previousUp = false;
  }

  createSoundSource() {
              var AudioContextFunc = window.AudioContext || window.webkitAudioContext;
              this.audioContext = new AudioContextFunc();

              this.player = new WebAudioFontPlayer();
              this.player.loader.decodeAfterLoading(this.audioContext, '_tone_0300_LesPaul_sf2');
  }

  createGuitar() {
              var img = new THREE.MeshBasicMaterial({ //CHANGED to MeshBasicMaterial
                  map:THREE.ImageUtils.loadTexture('guitar_3.png'),
                  transparent: true,
                  opacity: 0.8
              });
              img.crossOrigin = "anonymous";

              img.map.needsUpdate = true; //ADDED

              // plane
              this.guitar = new THREE.Mesh(new THREE.PlaneGeometry(3, 2),img);
              this.guitar.rotation.x = Math.PI;
              this.guitar.rotation.z = Math.PI;
              this.guitar.position.x = -0.1;
              this.guitar.position.z = -0.1;
              this.guitar.position.y = 0.05;
              this.guitar.overdraw = true;

        // var line_material = new THREE.LineBasicMaterial({
        //   color: 0xff0000
        // });

        // var line_geometry = new THREE.Geometry();
        // var angle = 34*Math.PI/180;
        // var length = 0.65;
        // line_geometry.vertices.push(
        //   new THREE.Vector3( 0, 0, -0.1 ),
        //   new THREE.Vector3( 0+length*Math.cos(angle), 0+length*Math.sin(angle), -0.1 )
        // );

        // var line = new THREE.Line( line_geometry, line_material );
        // this.world.scene.add( line )
        this.createColorLine()
  }

  createColorLine() {
    var num_segments = 5;

    var max_dist = 0.6;

    var cube_height = max_dist/num_segments;
    var cube_depth = 0.1;
    var cube_length = 0.045;

    var i = 0;

    var geometry = new THREE.BoxGeometry( cube_length, cube_height, cube_depth );

    var colors = [0xFFFA0D,0xE8760C,0xFF00A4,0x0C19E8,0x00FFB5, 0xA211E8, 0x0692FF, 0xFF3906];
    var notes = ["A", "B", "C", "D", "E", "F", "G", "A"];

    var group = new THREE.Group();

    if (!this.colorLines) {
      this.colorLines = [];
  
      for (i=0;i<num_segments;i++) {
        // add box
        var material = new THREE.MeshBasicMaterial( {transparent: true, opacity: 0.7, color: colors[i]} );
        this.colorLines.push(new THREE.Mesh( geometry, material));
        this.colorLines[i].position.x = -0.04;
        this.colorLines[i].position.z = -0.1;
        this.colorLines[i].position.y = i*cube_height + cube_height/2;
        group.add(this.colorLines[i]);
        // add note

        // var line_material = new THREE.LineBasicMaterial({
        //   color: 0x0000ff
        // });

        // var line_geometry = new THREE.Geometry();
        // line_geometry.vertices.push(
        //   new THREE.Vector3( -0.2, 0, 0.1 ),
        //   new THREE.Vector3( -0.2, cube_height, 0.1 )
        // );

        // var line = new THREE.Line( line_geometry, line_material );
        // this.world.scene.add( line )

      }
    }
    group.rotation.z = 56*Math.PI/180;
    this.world.scene.add(group);


    var loader = new THREE.FontLoader();

    var that = this;

    loader.load('helvetiker_regular.typeface.json', function (font) {
      if (!that.notes) {
        that.notes = 5;
        for (i=0;i<num_segments;i++) {

          var textGeometry = new THREE.TextGeometry( notes[i], {
            font: font,
            size: 0.04,
            height: 0.04
          } );
          var text = new THREE.Mesh(textGeometry,  new THREE.MeshBasicMaterial( {color: 0x000000} ));
          text.scale.x = -1;
          text.position.x = -0.17;
          text.position.z = -0.2;
          text.position.y = cube_height*i+0.02;
          that.world.scene.add(text);
        }        
      }

    });



  }
  
  add_to_world() {
    if (!this.inWorld) {
      this.world.scene.add(this.guitar);
      this.inWorld = true;      
    }
  }
  
  remove_from_world() {
    if (this.inWorld) {
      this.world.scene.remove(this.guitar);
      this.inWorld = false;      
    }
  }
  

	refresh(data) {

      var xLH3DPos = data.joints[this.inverseJointType["HandLeft"]].x;
      var yLH3DPos = data.joints[this.inverseJointType["HandLeft"]].y;
      var zLH3DPos = data.joints[this.inverseJointType["HandLeft"]].z;


      var xRH3DPos = data.joints[this.inverseJointType["HandRight"]].x;
      var yRH3DPos = data.joints[this.inverseJointType["HandRight"]].y;
      var zRH3DPos = data.joints[this.inverseJointType["HandRight"]].z;
      

      var xLEH3DPos = data.joints[this.inverseJointType["ElbowLeft"]].x;
      var yLEH3DPos = data.joints[this.inverseJointType["ElbowLeft"]].y;
      var zLEH3DPos = data.joints[this.inverseJointType["ElbowLeft"]].z;

      var xSB3DPos = data.joints[this.inverseJointType["SpineBase"]].x;
      var ySB3DPos = data.joints[this.inverseJointType["SpineBase"]].y;
      var zSB3DPos = data.joints[this.inverseJointType["SpineBase"]].z;

      var xSM3DPos = data.joints[this.inverseJointType["SpineMid"]].x;
      var ySM3DPos = data.joints[this.inverseJointType["SpineMid"]].y;
      var zSM3DPos = data.joints[this.inverseJointType["SpineMid"]].z;

      var xH3DPos = data.joints[this.inverseJointType["Head"]].x;
      var yH3DPos = data.joints[this.inverseJointType["Head"]].y;
      var zH3DPos = data.joints[this.inverseJointType["Head"]].z;
       
      var xN3DPos = data.joints[this.inverseJointType["Neck"]].x;
      var yN3DPos = data.joints[this.inverseJointType["Neck"]].y;
      var zN3DPos = data.joints[this.inverseJointType["Neck"]].z;

      var max_dist = Math.abs(yN3DPos - ySB3DPos);
      var midposUD = ySB3DPos + max_dist / 3.0;
      var guitar_angle = 45;
      max_dist = max_dist/Math.cos(guitar_angle);
      var lefthandposY = (Math.abs(yLH3DPos - ySB3DPos) / max_dist);
      var lefthandposX = (Math.abs(xLH3DPos - xSB3DPos) / (5.0*max_dist));

//      var rightVel = Math.abs(rightYprev - yRH3DPos);

      var lefthandpos = Math.sqrt(Math.pow(yLH3DPos - ySB3DPos,2) + Math.pow(xLH3DPos - xSB3DPos,2)) / max_dist;

      // check if we passed the midpoint
      var play = false;
      if (yRH3DPos < midposUD)
      {
        if (this.previousUp == true)
          {
            play = true;
          }
          this.previousUp = false;
      }
      else if (yRH3DPos > midposUD)
      {
        if (this.previousUp == false)
        {
          play = true;
        }
        this.previousUp = true;
      }


        var RightX = yRH3DPos - midposUD;
//        var RightXVel = rightVel;
        var LeftX = lefthandposX;
        var LeftY = lefthandpos;
        var headX = xH3DPos;
        var headY = yH3DPos;
        var rightHandX = xRH3DPos;
        var rightHandY = yRH3DPos;


        var pentatonic = [0, 2, 4, 7, 9, 12];


        var bendQuantoY = Math.round(LeftY/0.2);
        var bendQuantoX = Math.round(LeftX);

        var bendQuanto = bendQuantoY;

        if (LeftY >= 0 && LeftY <=0.2) {
          bendQuanto = 1;
        }
         else if (LeftY <= 0.4) {
          bendQuanto = 2;
        }
        else if (LeftY <= 0.6) {
          bendQuanto = 3;
        }
        else if (LeftY <= 0.8) {
          bendQuanto = 4;
        }
        else if (LeftY <= 1.0) {
          bendQuanto = 5;
        }


        // var bendQuantoY = Math.round(LeftY/0.166);
        // var bendQuantoX = Math.round(LeftX);

        // var bendQuanto = bendQuantoY;

        // if (LeftY >= 0 && LeftY <=0.15) {
        //   bendQuanto = 1;
        // }
        //  else if (LeftY <= 0.3) {
        //   bendQuanto = 2;
        // }
        // else if (LeftY <= 0.45) {
        //   bendQuanto = 3;
        // }
        // else if (LeftY <= 0.6) {
        //   bendQuanto = 4;
        // }
        // else if (LeftY <= 0.75) {
        //   bendQuanto = 5;
        // }
        // else if (LeftY <= 0.9) {
        //   bendQuanto = 6;
        // }
        // //


        if (bendQuanto < 0 || bendQuanto > 6){
          bendQuanto = 0;
        }
        

              //   document.getElementById("RightX").innerHTML = RightX.toPrecision(4);
              //   document.getElementById("LeftX").innerHTML = LeftX.toPrecision(4);
              //   document.getElementById("LeftY").innerHTML = LeftY.toPrecision(4);
              //   document.getElementById("GestureDirection").innerHTML = GestureDirection;

              // document.getElementById("bendQuanto").innerHTML = bendQuanto;     

    this.avatar.refreshHands(bendQuanto);        

        if (Date.now() - this.previousTime < this.refreshTime) {
          return;
        }
        else {
          this.previousTime = Date.now();
        }
        
        if (!play) {
          return;
        }
        
        var audio = null;

        if (bendQuanto == 6) {
          this.player.queueWaveTable(this.audioContext, this.audioContext.destination
            , _tone_0300_LesPaul_sf2, 0, 12*4+2, 1);
        }
        else if (bendQuanto == 5) {
          this.player.queueWaveTable(this.audioContext, this.audioContext.destination
            , _tone_0300_LesPaul_sf2, 0, 12*4+5, 1);
        }
        else if (bendQuanto == 4) {
          this.player.queueWaveTable(this.audioContext, this.audioContext.destination
            , _tone_0300_LesPaul_sf2, 0, 12*4+7, 1);
        }
        else if (bendQuanto == 3) {
          this.player.queueWaveTable(this.audioContext, this.audioContext.destination
            , _tone_0300_LesPaul_sf2, 0, 12*4+8, 1);
        }
        else if (bendQuanto == 2) {
        }
        else if (bendQuanto == 1) {
        }
      }
}
