window.AudioContext = window.AudioContext || window.webkitAudioContext;

class AudioManager{

	constructor(audioContext){
		// if(audioContext == null){
		// 	this.audioContext = new AudioContext();
		// }
		// else
		// 	this.audioContext = audioContext;		

		this.audioContext = new AudioContext();

		console.log('this.audioContext : ',this.audioContext);
		this.finalAudioOut = this.audioContext.destination;
		this.mainAudioOut = this.audioContext.createGain();
		this.dummyAudioOut = this.audioContext.createGain();
		this.mainAudioOut.connect(this.finalAudioOut);
	}

	receiveAudioFromNode(audioInNode){
		audioInNode.connect(this.mainAudioOut);
		if(audioInNode.outNodes == null){
			audioInNode.outNodes = [];
		}
		audioInNode.outNodes.push(this.mainAudioOut);

	}
	sendAudioToNode(audioOutNode){
		this.mainAudioOut.connect(audioOutNode);

		if(audioOutNode.inNodes == null){
			audioOutNode.inNodes = [];
		}
		audioOutNode.inNodes.push(audioOutNode);
		
	}
	unplugAudioNode(audioNode){
		audioNode.disconnect(this.mainAudioOut);
	}

	getCurrentTime(){
		return this.audioContext.currentTime;
	}

	playBuffer(buff){
		var source = this.audioContext.createBufferSource();
		source.buffer = buff;
		source.connect(this.mainAudioOut);
		source.start(0);

	}

}