class AirGuitar {
	constructor(world, avatar, modalysChannel, sessionId, mirror, ID, fretboard) {
    this.fretboard = fretboard;
    this.ID = ID;
    if (this.mirror) {
      this.mirror = 1;
    }
    else {
      this.mirror = -1;
    }
    this.avatar = avatar;        
    this.sessionId = sessionId;
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
    this.inScene = false;
    this.createSoundSource();
    this.previousTime = Date.now();
    this.refreshTime = 200;
    this.previousUp = false;
    this.length = 0.6;
    this.createGuitar(); // create guitar
    this.createColorLine(); // create color cubes and texts
    // aggregate all to single group

    this.previousY = 0;
    this.modalysChannel = modalysChannel;
    this.sessionId = sessionId;
    this.value = [];
    for (var i = 0; i < 6; i++) //6: num of guitar strings
    {
        this.value[i] = 0.5; //0.5 before being plucked up, -0.5 before being plucked down.
    }
    this.fret = [ //preset fretboard positioning for each bendquanto
      [-1,0,2,2,2,0], //A major preset
      [0,2,2,1,0,0],  //E major preset
      [-1,-1,0,2,3,2],  //D major preset
      [-1,3,2,0,1,0],  //C major preset
      [3,2,0,0,3,3] //G major preset
    ];
  }

  createSoundSource() {
              var AudioContextFunc = window.AudioContext || window.webkitAudioContext;
              this.audioContext = new AudioContextFunc();

              this.player = new WebAudioFontPlayer();
              this.player.loader.decodeAfterLoading(this.audioContext, '_tone_0300_LesPaul_sf2');
  }

    //needs either a refreshGuitar method or some either/or dep. on whether the object has been initialized.
  refreshGuitar(data) {
        this.guitar.position.y = data.y+0.2;
        this.guitar.position.x = 0.1 + data.x * this.mirror;
        this.guitar.position.z = data.z - 1.8;

        this.textGroup.position.x = data.x * this.mirror + 0.08 + 0.1;
        this.textGroup.position.y = data.y - 0.1 + 0.1;
        this.textGroup.position.z = data.z - 1.82;

        this.colorGroup.position.x = data.x * this.mirror - 0.01 + 0.1 ;
        this.colorGroup.position.y = data.y + 0.02 + 0.1;
        this.colorGroup.position.z = data.z - 1.8;
  }

  
  addToScene() {
    if (!this.inScene) {
      this.world.scene.add(this.guitar);
      this.world.scene.add(this.colorGroup);
      this.world.scene.add(this.textGroup);    
      this.inScene = true;  
    }
  }
  
  removeFromScene() {
    if (this.inScene) {
      this.world.scene.remove(this.guitar);
      this.world.scene.remove(this.colorGroup);
      this.world.scene.remove(this.textGroup);
      this.inScene = false;      
    }
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
    this.guitar.overdraw = true;

  }

  createColorLine() {
    var num_segments = 5;

    var max_dist = this.length;

    var cube_height = max_dist/num_segments;
    var cube_depth = 0.1;
    var cube_length = 0.045;

    var i = 0;

    var geometry = new THREE.BoxGeometry( cube_length, cube_height, cube_depth );

    var colors = [0xFFFA0D,0xE8760C,0xFF00A4,0x0C19E8,0x00FFB5, 0xA211E8, 0x0692FF, 0xFF3906];
    var notes = ["E", "D", "B", "A", "G", "F", "G", "A"];

    var group = new THREE.Group();

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

    group.rotation.z = -56*Math.PI/180;
    this.colorGroup = group;


    var loader = new THREE.FontLoader();

    var that = this;
    console.log("A");
    loader.load('helvetiker_regular.typeface.json', function (font) {
      if (!that.notes) {
      var textGroup = new THREE.Group();
      console.log("B");
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
          text.position.z = -0.15;
          text.position.y = cube_height*i+0.02;
          textGroup.add(text);
          // that.world.scene.add(text);
        }        
      textGroup.rotation.z = -56*Math.PI/180;
      textGroup.position.y = 0.12;
      textGroup.position.x += 0.08;
        that.textGroup = textGroup;
      }

    });
  }
 
	refreshSound(data) {

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

      //var vol = Math.abs(0.04/zSB3DPos);
      var vol = Math.max(0.8*Math.abs(yRH3DPos - this.previousY),0.01);
      this.previousY = yRH3DPos;

      var max_dist = Math.abs(yN3DPos - ySB3DPos);
      var midposUD = ySB3DPos + max_dist / 6.0;
      // var guitar_angle = 56;

      // max_dist = max_dist/Math.cos(guitar_angle);

      var step = this.length/5;

      var lefthandpos = Math.sqrt(Math.pow(yLH3DPos - (ySB3DPos+0.02),2) + Math.pow(xLH3DPos - (xSB3DPos-0.01),2));

      // console.log(lefthandpos, step, Math.floor(lefthandpos/step));
      lefthandpos = Math.floor(lefthandpos/step);
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


        var bendQuanto = lefthandpos;


        var pentatonic = [0, 2, 4, 7, 9, 12];


        // var bendQuantoY = Math.ceil(6*LeftY); //hexatonic.

        // var bendQuanto = bendQuantoY;


        if (bendQuanto < 1 || bendQuanto > 6){ //accepted values are 1-5
          bendQuanto = 0;
          return;
        }
        
        $(`#bendQuanto_${this.ID}`).html(bendQuanto);     
         this.avatar.refreshHands(bendQuanto);        
        
        if (!play) {
          return;
        }
        


        if (Date.now() - this.previousTime < this.refreshTime) {
          return;
        }
        else {
          this.previousTime = Date.now();
        }

        if (bendQuanto == 1)
            console.log("A major");
        else if (bendQuanto == 2)
            console.log("E major");
        else if (bendQuanto == 3)
            console.log("D major");
        else if (bendQuanto == 4)
            console.log("C major");
        else if (bendQuanto == 5)
            console.log("G major");
        //To choose between modalys/non-modalys output, just activate the respective func + comment out the other one.
        //this.pluckAudiofont(bendQuanto); //AudioFont.
        this.PlayChord(bendQuanto); //Modalys.
    }

    PlayChord(bendQuanto)
    {
      this.fret = this.fretboard.fret;
      console.log(this.fret);
        var mc = this.modalysChannel;
        var id = this.sessionId;
        var pb = [];
        var val = [];
        for (var i = 0; i <6; i++)
        {
            pb[i] = this.fret[bendQuanto-1][i]*100; //array of desired pitchbends (100 per pos)
            if (pb[i] != -100)
            {
              this.value[i] = this.value[i]*(-1); //array of pluckup/down values.
              val[i] = this.value[i];
            }
        }

        window.setTimeout(function(){Pluck(1,pb[0],val[0],id,mc)},50); //pluck each chord, given a 50 ms interval between chords
        window.setTimeout(function(){Pluck(2,pb[1],val[1],id,mc)},100);
        window.setTimeout(function(){Pluck(3,pb[2],val[2],id,mc)},150);
        window.setTimeout(function(){Pluck(4,pb[3],val[3],id,mc)},200);
        window.setTimeout(function(){Pluck(5,pb[4],val[4],id,mc)},250);
        window.setTimeout(function(){Pluck(6,pb[5],val[5],id,mc)},300);

                function Pluck(string,pitchbend,dir,id,channel)
               {
                    if (pitchbend == -100)
                        return;
                    console.log("Plucking");
                    var data = {
                        "sessionId": id,
                        "parameters": [
                        {
                            "partId": string,
                            "name": "pitchbend",
                            "value": pitchbend
                        }]
                    };
                    channel.publish("updateParameter", data);
                    var data = {
                        "sessionId": id,
                        "parameters": [
                        { 
                            "partId": string,
                            "name": "position",
                            "value": dir,
                            "when": 0.05
                        }]
                    };
                    channel.publish("updateParameter", data);
                }
          //  }
        //}
        
    }
	   
}
