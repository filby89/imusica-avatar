class PitchVolumeOrgan {
	constructor() {

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
            this.player2.loader.decodeAfterLoading(this.audioContext, '_tone_0130_FluidR3_GM_sf2_file');
            this.previousNoteL = [];
            this.previousNoteR = [];
	}
	refresh(data) {
            var offset = data.joints[this.inverseJointType["Head"]].y - data.joints[this.inverseJointType["Neck"]].y;
            var y_lowerbound = data.joints[this.inverseJointType["SpineBase"]].y - offset;
            var y_upperbound = data.joints[this.inverseJointType["Head"]].y - offset;

            var max_dist = data.joints[this.inverseJointType["Head"]].y + offset - (data.joints[this.inverseJointType["SpineBase"]].y - offset)
            var step = max_dist / 8;
            var LHbin = Math.floor((data.joints[this.inverseJointType["HandLeft"]].y - y_lowerbound)/step)
            var RHbin = Math.floor((data.joints[this.inverseJointType["HandRight"]].y - y_lowerbound)/step)
	
            LHbin = LHbin < 0 ? 0 : LHbin;
            LHbin = LHbin > 7 ? 7 : LHbin;

            RHbin = RHbin < 0 ? 0 : RHbin;
            RHbin = RHbin > 7 ? 7 : RHbin;

            var offsetVol = Math.abs(data.joints[this.inverseJointType["ShoulderRight"]].x  - data.joints[this.inverseJointType["ShoulderLeft"]].x);
            var max_distVol = offsetVol*4;
            var stepVol = max_distVol / 30
            var LHbinVol = Math.floor(Math.abs(data.joints[this.inverseJointType["HandLeft"]].x-data.joints[this.inverseJointType["SpineMid"]].x)/stepVol)
            var RHbinVol = Math.floor(Math.abs(data.joints[this.inverseJointType["HandRight"]].x-data.joints[this.inverseJointType["SpineMid"]].x)/stepVol)
            LHbinVol = LHbinVol < 0 ? 0 : LHbinVol;
            LHbinVol = LHbinVol > 15 ? 15 : LHbinVol;

            RHbinVol = RHbinVol < 0 ? 0 : RHbinVol;
            RHbinVol = RHbinVol > 15 ? 15 : RHbinVol;             
 


            var C4 = [60];
            var D4 = [62];
            var E4 = [64];
            var F4 = [65];
            var G4 = [67];
            var A4 = [69];
            var B4 = [71];
            var note = [];

            switch(LHbin) {
                case 1:
                    note = C4;
                    break;
                case 2:
                    note = D4;
                    break;
                case 3:
                    note = E4;
                    break;
                case 4:
                    note = F4;
                    break;
                case 5:
                    note = G4
                    break;
                case 6:
                    note = A4;
                    break;
                case 7:
                    note = B4;
                    break;
            } 
            var Rnote = [];
            switch(RHbin) {
                case 1:
                    Rnote = C4;
                    break;
                case 2:
                    Rnote = D4;
                    break;
                case 3:
                    Rnote = E4;
                    break;
                case 4:
                    Rnote = F4;
                    break;
                case 5:
                    Rnote = G4
                    break;
                case 6:
                    Rnote = A4;
                    break;
                case 7:
                    Rnote = B4;
                    break;

            } 


                        // var D4 = [50-12,57-12,62-12,67-12];
                        // var F4 = [53,36,28,45,41,36];
                        // var G4 = [31,35,55,47,43,38];

                        // var D4 = [54,50,45,38];
                        // var F4 = [53,48,45,41,36,30];
                        // var G4 = [55,47,43,38,35,31];
                        // var Gs4 = [56,51,48,44,39,32];

                  var duration = 10;

                  if (note.length > 0 && note[0] != this.previousNoteL[0])  {
                        console.log(this.player.envelopes)//.envelopes[0].cancel();
                        for (var i=0;i<this.player.envelopes.length;i++) {
                          this.player.envelopes[i].cancel();
                        }
                        this.player.queueChord(this.audioContext, this.audioContext.destination
                              , _tone_0300_LesPaul_sf2, 0, note, duration, LHbinVol*0.1);
                  }
                  if (Rnote.length > 0 && this.previousNoteR[0] != Rnote[0]) {
                        for (var i=0;i<this.player2.envelopes.length;i++) {
                          this.player2.envelopes[i].cancel();
                        }
                        this.player2.queueChord(this.audioContext, this.audioContext.destination
                              , _tone_0130_FluidR3_GM_sf2_file, 0, Rnote, duration, RHbinVol*0.1);
                  }
                  this.previousNoteL = note;
                  this.previousNoteR = Rnote;
      }
}
