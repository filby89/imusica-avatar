class PitchVolumeOrgan {
	constructor(world, avatar, mirror, ID) {
    this.ID = ID;
    if (this.mirror) {
      this.mirror = 1;
    }
    else {
      this.mirror = -1;
    }
    this.avatar = avatar;

    this.world = world;
    this.scene = this.world.scene;
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
                  this.previousNote = null;
                  this.currentNote = null;


            function swap(json){
              var ret = {};
              for(var key in json){
                ret[json[key]] = key;
              }
              return ret;
            }

            this.inverseJointType = swap(this.JointType);

            var AudioContextFunc = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContextFunc();

            this.player = new WebAudioFontPlayer();
            this.player.loader.decodeAfterLoading(this.audioContext, '_tone_0300_LesPaul_sf2');
            this.player2 = new WebAudioFontPlayer();
            this.player2.loader.decodeAfterLoading(this.audioContext, '0430_SBLive_sf2');
            this.previousNoteL = [];
            this.previousNoteR = [];
            this.inScene = false;
            this.height = 0.8;
            this.num_segments = 8;
            this.createPitchLine();
	}

  refreshOrgan(data) {
      this.textGroupPitch.position.x = data.x * this.mirror - 0.2;
      this.textGroupPitch.position.y = data.y + 0.1;
      this.textGroupPitch.position.z = data.z - 1.82;

      this.colorGroupPitch.position.x = data.x * this.mirror - 0.4;
      this.colorGroupPitch.position.y = data.y + 0.07;
      this.colorGroupPitch.position.z = data.z - 1.81;    
  }


  addToScene() {
    if (!this.inScene) {
      this.world.scene.add(this.colorGroupPitch);
      this.world.scene.add(this.textGroupPitch);    
      this.inScene = true;  
    }
  }
  
  removeFromScene() {
    if (this.inScene) {
      this.world.scene.remove(this.colorGroupPitch);
      this.world.scene.remove(this.textGroupPitch);
      this.inScene = false;      
    }
  }
  

  createPitchLine() {

    var cube_height = this.height/this.num_segments;

    var cube_depth = 0.1;
    var cube_length = 0.11;

    var i = 0;

    var geometry = new THREE.BoxGeometry( cube_length, cube_height, cube_depth );

    var colors = [0xFFFA0D,0xE8760C,0xFF00A4,0x0C19E8,0x00FFB5, 0xA211E8, 0x0692FF, 0xFF3906];
    var notes = ["A", "B", "C", "D", "E", "F", "G", "A"];

    this.colorGroupPitch = new THREE.Group();

      this.colorLines = [];
      for (i=0;i<this.num_segments;i++) {
          // add box
          var material = new THREE.MeshBasicMaterial( {transparent: true, opacity: 0.7, color: colors[i]} );
          this.colorLines.push(new THREE.Mesh( geometry, material));
          this.colorLines[i].position.y = i*cube_height + cube_height/2;
          this.colorGroupPitch.add(this.colorLines[i]);
      }

    var loader = new THREE.FontLoader();

    this.textGroupPitch = new THREE.Group();

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
          that.textGroupPitch.add(text);
      }

    });
  }

	refreshSound(data) {
            // var offset = data.joints[this.inverseJointType["Head"]].y - data.joints[this.inverseJointType["Neck"]].y;
            // var y_lowerbound = data.joints[this.inverseJointType["SpineBase"]].y - offset;
            // var y_upperbound = data.joints[this.inverseJointType["Head"]].y - offset;

            // var max_dist = data.joints[this.inverseJointType["Head"]].y + offset - (data.joints[this.inverseJointType["SpineBase"]].y - offset)
            var y_lowerbound = data.joints[this.inverseJointType["SpineBase"]].y + 0.07; 
            var step = this.height / this.num_segments;
            var LHbin = Math.floor((data.joints[this.inverseJointType["HandLeft"]].y - y_lowerbound)/step)
            var RHbin = Math.floor((data.joints[this.inverseJointType["HandRight"]].y - y_lowerbound)/step)
	
            // LHbin = LHbin < 0 ? 0 : LHbin;
            // LHbin = LHbin > 7 ? 7 : LHbin;

            // RHbin = RHbin < 0 ? 0 : RHbin;
            // RHbin = RHbin > 7 ? 7 : RHbin;

            var offsetVol = Math.abs(data.joints[this.inverseJointType["ShoulderRight"]].x  - data.joints[this.inverseJointType["ShoulderLeft"]].x);
            var max_distVol = offsetVol*4;
            var stepVol = max_distVol / 30;
            var LHbinVol = Math.floor(Math.abs(data.joints[this.inverseJointType["HandLeft"]].x-data.joints[this.inverseJointType["SpineMid"]].x)/stepVol)
            var RHbinVol = Math.floor(Math.abs(data.joints[this.inverseJointType["HandRight"]].x-data.joints[this.inverseJointType["SpineMid"]].x)/stepVol)
            LHbinVol = LHbinVol < 0 ? 0 : LHbinVol;
            LHbinVol = LHbinVol > 10 ? 10 : LHbinVol;

            RHbinVol = RHbinVol < 0 ? 0 : RHbinVol;
            RHbinVol = RHbinVol > 10 ? 10 : RHbinVol;             
 
            var C4 = [60];
            var D4 = [62];
            var E4 = [64];
            var F4 = [65];
            var G4 = [67];
            var A4 = [69];
            var B4 = [71];
            var note = [];

            var X_notes = [48,50,52,53,55,57,59,60];


            var Lnote = X_notes[LHbin];
            var Rnote = X_notes[RHbin];
            this.avatar.refreshRightHand(RHbin+1);        
            this.avatar.refreshHands(LHbin+1);        
                  // var D4 = [50-12,57-12,62-12,67-12];
                  // var F4 = [53,36,28,45,41,36];
                  // var G4 = [31,35,55,47,43,38];

                  // var D4 = [54,50,45,38];
                  // var F4 = [53,48,45,41,36,30];
                  // var G4 = [55,47,43,38,35,31];
                  // var Gs4 = [56,51,48,44,39,32];

            var duration = 10;
            console.log(Lnote, Rnote);

            if (Lnote == undefined || Lnote < 0 || Lnote > 7 ) {
                  for (var i=0;i<this.player.envelopes.length;i++) {
                    this.player.envelopes[i].cancel();
                  }              
            }

            if (Rnote == undefined || Rnote < 0 || Rnote > 7 ) {
                  for (var i=0;i<this.player2.envelopes.length;i++) {
                    this.player2.envelopes[i].cancel();
                  }              
            }



            if (Lnote != undefined && Lnote != this.previousNoteL)  {
                  for (var i=0;i<this.player.envelopes.length;i++) {
                    this.player.envelopes[i].cancel();
                  }
                  this.player.queueChord(this.audioContext, this.audioContext.destination
                        , _tone_0300_LesPaul_sf2, 0, [Lnote], duration, LHbinVol*0.1);
            }
            if (Rnote != undefined && this.previousNoteR != Rnote) {
                  for (var i=0;i<this.player2.envelopes.length;i++) {
                    this.player2.envelopes[i].cancel();
                  }
                  this.player2.queueChord(this.audioContext, this.audioContext.destination
                        , _tone_0430_SBLive_sf2, 0, [Rnote], duration, RHbinVol*0.1);
            }
            this.previousNoteL = Lnote;
            this.previousNoteR = Rnote;
  }
}
