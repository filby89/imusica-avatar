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
    this.refreshTime = 50;
    this.previousLeft = false;
              this.world = world;
  }

  createSoundSource() {
              var AudioContextFunc = window.AudioContext || window.webkitAudioContext;
              this.audioContext = new AudioContextFunc();

              this.player = new WebAudioFontPlayer();
              this.player.loader.decodeAfterLoading(this.audioContext, '_tone_0300_LesPaul_sf2');
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
              this.cello.position.x = 0;
              this.cello.position.z = -0.2;
              this.cello.overdraw = true;

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

      var yN3DPos = data.joints[this.inverseJointType["Neck"]].y;

      var max_dist = Math.abs(yN3DPos - ySB3DPos);

      var midposLR = xSB3DPos;

      var lefthandposY = (Math.abs(yLH3DPos - ySB3DPos) / max_dist);

      // check if we passed the midpoint
      var play = false;
      if (xRH3DPos < midposLR)
      {
        if (this.previousLeft == true)
          {
            play = true;
          }
          this.previousLeft = false;
      }
      else if (xRH3DPos > midposLR)
      {
        if (this.previousLeft == false)
        {
          play = true;
        }
        this.previousLeft = true;
      }


        var LeftY = lefthandposY;


        var pentatonic = [0, 2, 4, 7, 9, 12];
        var bendQuanto = Math.round(LeftY/0.166);

        if (LeftY >= 0 && LeftY <=0.15) {
          bendQuanto = 1;
        }
         else if (LeftY <= 0.3) {
          bendQuanto = 2;
        }
        else if (LeftY <= 0.45) {
          bendQuanto = 3;
        }
        else if (LeftY <= 0.6) {
          bendQuanto = 4;
        }
        else if (LeftY <= 0.75) {
          bendQuanto = 5;
        }
        else if (LeftY <= 0.9) {
          bendQuanto = 6;
        }
        //


        if (bendQuanto < 0 || bendQuanto > 6){
          bendQuanto = 0;
        }
        

//                 document.getElementById("RightX").innerHTML = RightX.toPrecision(4);
//                 document.getElementById("LeftX").innerHTML = LeftX.toPrecision(4);
//                 document.getElementById("LeftY").innerHTML = LeftY.toPrecision(4);
//                 document.getElementById("GestureDirection").innerHTML = GestureDirection;
// //                document.getElementById("RightXVel").innerHTML = RightXVel.toPrecision(4);

//               document.getElementById("bendQuanto").innerHTML = bendQuanto;     

    this.avatar.refreshHands(bendQuanto);        
    if (play && bendQuanto > 0 && bendQuanto < 6) {
      console.log("Bendquanto: ", bendQuanto);
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
          this.player.queueWaveTable(this.audioContext, this.audioContext.destination
            , _tone_0300_LesPaul_sf2, 0, 12*4+8, 1);        }
        else if (bendQuanto == 1) {
          this.player.queueWaveTable(this.audioContext, this.audioContext.destination
            , _tone_0300_LesPaul_sf2, 0, 12*4+8, 1);        }
      }
}
