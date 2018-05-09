class AirCello {
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

    this.createCello();
    this.createSoundSource();
    this.previousTime = Date.now();
    this.refreshTime = 200;
    this.previousLeft = false;
    this.world = world;

    this.currentNote = null;

    this.previousX = 0;
  }

  createSoundSource() {
              var AudioContextFunc = window.AudioContext || window.webkitAudioContext;
              this.audioContext = new AudioContextFunc();

              this.player = new WebAudioFontPlayer();
              this.player.loader.decodeAfterLoading(this.audioContext, '0430_SBLive_sf2');
  }

  createCello() {
              var img = new THREE.MeshBasicMaterial({ //CHANGED to MeshBasicMaterial
                  map:THREE.ImageUtils.loadTexture('Cello.png'),
                  transparent: true,
                  opacity: 0.8
              });
              img.crossOrigin = "anonymous";

              img.map.needsUpdate = true; //ADDED

              // plane
              this.cello = new THREE.Mesh(new THREE.PlaneGeometry(2, 2),img);
              this.cello.rotation.y = Math.PI;
              this.cello.position.x = -0.2;
              this.cello.position.z = 0.2;
              this.cello.overdraw = true;

      this.direction = 0;

  }
  
  add_to_world() {
    if (!this.inWorld) {
      this.world.scene.add(this.cello);
      this.inWorld = true;      
    }
  }
  
  remove_from_world() {
    if (this.inWorld) {
      this.world.scene.remove(this.cello);
      this.inWorld = false;      
    }
  }
  

	refresh(data) {

      var yLH3DPos = data.joints[this.inverseJointType["HandLeft"]].y;

      var xRH3DPos = data.joints[this.inverseJointType["HandRight"]].x;
      
      var xSB3DPos = data.joints[this.inverseJointType["SpineBase"]].x;

      var ySB3DPos = data.joints[this.inverseJointType["SpineBase"]].y;

      var yH3DPos = data.joints[this.inverseJointType["Head"]].y;

      var max_dist = Math.abs(yH3DPos - ySB3DPos);

      var midposLR = xSB3DPos;

      var LeftY = (Math.abs(yLH3DPos - ySB3DPos) / max_dist);

      var play = false;
      

      this.createColorLine(data);

      var velocity_x = xRH3DPos - this.previousX;
      this.previousX = xRH3DPos;
      document.getElementById("GestureDirection").innerHTML = velocity_x.toPrecision(4);

      if (Math.abs(velocity_x) > 0.001) {
        if (this.direction == Math.sign(velocity_x)) {
          play = false;
        }
        else {
          this.direction = Math.sign(velocity_x);
          play = true;
        }
      }
      else {
        if (!this.envelope) {
          this.envelope.cancel();
        }
      }

      // if (xRH3DPos < midposLR)
      // {
      //   if (this.previousLeft == true)
      //     {
      //       play = true;
      //     }
      //     this.previousLeft = false;
      // }
      // else if (xRH3DPos > midposLR)
      // {
      //   if (this.previousLeft == false)
      //   {
      //     play = true;
      //   }
      //   this.previousLeft = true;
      // }

      var step = 1/8;



      var bendQuanto = Math.floor(LeftY/step)+1;

//                 document.getElementById("RightX").innerHTML = RightX.toPrecision(4);
//                 document.getElementById("LeftX").innerHTML = LeftX.toPrecision(4);
//                 document.getElementById("LeftY").innerHTML = LeftY.toPrecision(4);
//                 document.getElementById("GestureDirection").innerHTML = GestureDirection;
// //                document.getElementById("RightXVel").innerHTML = RightXVel.toPrecision(4);

              document.getElementById("bendQuanto").innerHTML = bendQuanto;     

        this.avatar.refreshHands(bendQuanto, 8);        
        if (play) {
          // console.log("Bendquanto: ", bendQuanto);
        }
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

        var notes = [48,50,52,53,55,57,59,60];
        // var notes = [60,62,64,65,67,69,71,72];
        var note_to_play = notes[bendQuanto-1];

        var selectedPreset = _tone_0430_SBLive_sf2;

        for (var i = 0; i < selectedPreset.zones.length; i++) {
                selectedPreset.zones[i].ahdsr = [{
                    duration: 10,
                    volume: 1
                  }];
                }

        if (note_to_play!=this.currentNote) {
          if (this.envelope) {
            this.envelope.cancel();
          }
          this.envelope = this.player.queueWaveTable(this.audioContext, this.audioContext.destination
            , selectedPreset, 0, note_to_play, 10);
          // console.log(this.envelope);
          this.currentNote = note_to_play;
        }
      }

  createColorLine(data) {
    var num_segments = 8;

    // spine base is the center!

    var ySB3DPos = Math.abs(data.joints[this.inverseJointType["SpineBase"]].y-data.joints[this.inverseJointType["SpineBase"]].y);

    var yH3DPos = Math.abs(data.joints[this.inverseJointType["Head"]].y- data.joints[this.inverseJointType["SpineBase"]].y);

    var max_dist = Math.abs(yH3DPos - ySB3DPos);
    var cube_height = max_dist/num_segments;

    var cube_depth = 0.1;
    var cube_length = 0.11;

    var i = 0;

    var geometry = new THREE.BoxGeometry( cube_length, cube_height, cube_depth );

    var colors = [0xFFFA0D,0xE8760C,0xFF00A4,0x0C19E8,0x00FFB5, 0xA211E8, 0x0692FF, 0xFF3906];
    var notes = ["A", "B", "C", "D", "E", "F", "G", "A"];


    if (!this.colorLines) {
      this.colorLines = [];
  
      for (i=0;i<8;i++) {
        // add box
        var material = new THREE.MeshBasicMaterial( {transparent: true, opacity: 0.7, color: colors[i]} );
        this.colorLines.push(new THREE.Mesh( geometry, material));
        this.colorLines[i].position.x = -0.2;
        this.colorLines[i].position.z = 0.2;
        this.colorLines[i].position.y = i*cube_height + cube_height/2;
        this.world.scene.add(this.colorLines[i]);
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
          text.position.z = 0.1;
          text.position.y = cube_height*i-0.03;
          // that.world.scene.add(text);
        }        
      }

    });



  }
}
