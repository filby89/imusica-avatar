class AirCello {
	constructor(world, avatar, mirror, ID) {
    this.ID = ID;
    this.avatar = avatar;        
    if (this.mirror) {
      this.mirror = 1;
    }
    else {
      this.mirror = -1;
    }
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

    this.createSoundSource();
    this.appeared = false; //flag to denote the first time after creation of the object
    this.previousTime = Date.now();
    this.refreshTime = 200;
    this.previousLeft = false;
    this.world = world;
    this.inScene = false;
    this.colored  =false; //similarly, for the colorline creator.
    this.currentNote = null;

    this.direction = 0;

    this.previousX = 0;

    this.num_segments = 8;
    this.height = 0.8;

    this.createCello();
    this.createColorLine();

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
        opacity: 0.6
    });
    img.crossOrigin = "anonymous";

    img.map.needsUpdate = true; //ADDED

    this.cello = new THREE.Mesh(new THREE.PlaneGeometry(2, 2),img);
    this.cello.rotation.y = Math.PI;
  }

  refreshCello(data) {

    // spine base is the center!

    // var ySB3DPos = Math.abs(data.joints[this.inverseJointType["SpineBase"]].y-data.joints[this.inverseJointType["SpineBase"]].y);

    // var yH3DPos = Math.abs(data.joints[this.inverseJointType["Head"]].y- data.joints[this.inverseJointType["SpineBase"]].y);

    // var max_dist = Math.abs(yH3DPos - ySB3DPos);

      this.textGroup.position.x = data.x * this.mirror + 0.4;
      this.textGroup.position.y = data.y + 0.1;
      this.textGroup.position.z = data.z - 1.82;

      this.colorGroup.position.x = data.x * this.mirror + 0.2;
      this.colorGroup.position.y = data.y + 0.07;
      this.colorGroup.position.z = data.z - 1.81;

      this.cello.position.x = data.x * this.mirror + 0.2;
      this.cello.position.z = data.z - 1.8;
      this.cello.overdraw = true;
  }
  
  addToScene() {
    if (!this.inScene) {
      this.world.scene.add(this.cello);
      this.world.scene.add(this.colorGroup);
      this.world.scene.add(this.textGroup);    
      this.inScene = true;  
    }
  }
  
  removeFromScene() {
    if (this.inScene) {
      this.world.scene.remove(this.cello);
      this.world.scene.remove(this.colorGroup);
      this.world.scene.remove(this.textGroup);
      this.inScene = false;      
    }
  }
  

  createColorLine() {

    var cube_height = this.height/this.num_segments;

    var cube_depth = 0.1;
    var cube_length = 0.11;

    var i = 0;

    var geometry = new THREE.BoxGeometry( cube_length, cube_height, cube_depth );

    var colors = [0xFFFA0D,0xE8760C,0xFF00A4,0x0C19E8,0x00FFB5, 0xA211E8, 0x0692FF, 0xFF3906];
    var notes = ["A", "B", "C", "D", "E", "F", "G", "A"];

    this.colorGroup = new THREE.Group();

      this.colorLines = [];
      for (i=0;i<this.num_segments;i++) {
          // add box
          var material = new THREE.MeshBasicMaterial( {transparent: true, opacity: 0.7, color: colors[i]} );
          this.colorLines.push(new THREE.Mesh( geometry, material));
          this.colorLines[i].position.y = i*cube_height + cube_height/2;
          this.colorGroup.add(this.colorLines[i]);
      }

    var loader = new THREE.FontLoader();

    this.textGroup = new THREE.Group();

    var that = this;

    loader.load('helvetiker_regular.typeface.json', function (font) {
        for (i=0;i<that.num_segments;i++) {

          var textGeometry = new THREE.TextGeometry( notes[i], {
            font: font,
            size: 0.04,
            height: 0.04
          } );
          var text = new THREE.Mesh(textGeometry,  new THREE.MeshBasicMaterial( {color: 0x000000} ));
          text.scale.x = -1;
          text.position.x = -0.17;
          text.position.z = -0.2;
          text.position.y = cube_height*i;
          that.textGroup.add(text);
      }

    });

  }

	refreshSound(data) {

      var yLH3DPos = data.joints[this.inverseJointType["HandLeft"]].y;

      var xRH3DPos = data.joints[this.inverseJointType["HandRight"]].x;
      
      var xSB3DPos = data.joints[this.inverseJointType["SpineBase"]].x;

      var ySB3DPos = data.joints[this.inverseJointType["SpineBase"]].y;

      var yH3DPos = data.joints[this.inverseJointType["Head"]].y;

      // var max_dist = Math.abs(yH3DPos - ySB3DPos);

      var midposLR = xSB3DPos;

      var LeftY = ((yLH3DPos - (ySB3DPos + 0.07) ));

      var play = false;
      
      var velocity_x = xRH3DPos - this.previousX;
      this.previousX = xRH3DPos;
      // document.getElementById("GestureDirection").innerHTML = velocity_x.toPrecision(4);


      // note 
      var step = this.height/this.num_segments;

      var bendQuanto = Math.floor(LeftY/step)+1;

      $(`#bendQuanto_${this.ID}`).html(bendQuanto);     
      $(`#RH_x_vel_${this.ID}`).html(velocity_x.toPrecision(4));     

      this.avatar.refreshHands(bendQuanto, 8);        

      var audio = null;

      var notes = [48,50,52,53,55,57,59,60];

      var note_to_play = notes[bendQuanto-1];

      if (Math.abs(velocity_x) > 0.005) { //xamilo dn einai? apo oti thymamai apo diplo at least 
        if (this.direction == Math.sign(velocity_x)) {
          play = false;
        }
        else {
          this.direction = Math.sign(velocity_x);
          play = true;
        }
        if (note_to_play != this.currentNote) {
          play = true;
        }
      }
      else {
        if (this.envelope) {
          this.envelope.cancel();
        }
      }



      if (!play) {
        return;
      }
      
      if (Date.now() - this.previousTime < this.refreshTime) {
        return;
      }
      else {
        this.previousTime = Date.now();
      }
      

        var selectedPreset = _tone_0430_SBLive_sf2;

        for (var i = 0; i < selectedPreset.zones.length; i++) {
                selectedPreset.zones[i].ahdsr = [{
                    duration: 10,
                    volume: 1
                  }];
                }

          if (this.envelope) {
            this.envelope.cancel();
          }
          this.envelope = this.player.queueWaveTable(this.audioContext, this.audioContext.destination
            , selectedPreset, 0, note_to_play, 10);
          // console.log(this.envelope);
          this.currentNote = note_to_play;
      }

}
