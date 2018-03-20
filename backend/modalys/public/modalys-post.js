var Modalys = (function () {

  var contextClass = (window.AudioContext || window.webkitAudioContext);
  if (typeof(contextClass) === "undefined") {
    // Web Audio API is unavailable.
    return;
  }

  var _setSampleRate = Module.cwrap('SetSampleRate', 'void', ['number']);
  var _loadScriptFromString = Module.cwrap('LoadScriptFromString', 'number', ['string']);
  var _changeParameterValue = Module.cwrap('ChangeParameterValue', 'void', ['string', 'number']);
  var _changeParameterValueScheduled = Module.cwrap('ChangeParameterValueScheduled', 'void', ['string', 'number', 'number']);
  var _changeParameterVectorValueScheduled  = Module.cwrap('ChangeParameterVectorValueScheduled', 'int', ['string', 'number', 'number', 'number']);;  
  var _handleObjectMessage = Module.cwrap('HandleObjectMessage', 'number', ['string', 'string', 'number']);
  var _processAudio = Module.cwrap('ProcessAudio', 'number', ['number', 'number']);
  var _terminate = Module.cwrap('Terminate', 'void', []);

  function processAudio(outputBuffer) {
    var channelsNum = outputBuffer.numberOfChannels;
    var samplesNum = outputBuffer.length;

    var pointer = _processAudio(channelsNum, samplesNum);
    for (var channel = 0; channel < channelsNum; channel++) {
      var outputData = outputBuffer.getChannelData(channel);
      for (var i = 0; i < samplesNum; i++) {
        outputData[i] = Module.getValue(pointer + (i + channel * samplesNum) * 4, 'float');
      }
    }
  }

  var audioContext = new contextClass();
  _setSampleRate(audioContext.sampleRate);

  var scriptNode = audioContext.createScriptProcessor(512, 1, 1);
  scriptNode.onaudioprocess = function(audioEvent) {
    processAudio(audioEvent.outputBuffer);
  }

  function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  return {
    setSampleRate : _setSampleRate,
    loadScriptFromString : _loadScriptFromString,
    changeParameterValue : _changeParameterValue,
    changeParameterValueScheduled : _changeParameterValueScheduled,
    changeParameterVectorValueScheduled : _changeParameterVectorValueScheduled,
    handleObjectMessage : _handleObjectMessage,
    processAudio : processAudio,

    try : function(data) {
      // TODO : Implement
    },

    play : function(data) {
      // TODO : Handle instruments loading
      var xhr = new XMLHttpRequest();
      xhr.open("GET", "/instr/pluckedstringtemplate.mlys", true);
      xhr.onreadystatechange = function(event) {
        if (xhr.status === 200) {
          var script = xhr.responseText;
        
          var stringsNum = 4;
          var finalScript = "new()\nset_precision('FLOAT')\nset_message_level(3)\n";
          for (var i = 1; i <= stringsNum; i++) {
             var tmp = script.replace(/\$/g, i);
             finalScript += tmp;
          }
          _loadScriptFromString(finalScript);

          var stringLength = 1.0;
          for (var i = 1; i <= stringsNum; i++) {
             _changeParameterValue('length' + i, stringLength);
             stringLength *= 0.66666;
          }

          scriptNode.connect(audioContext.destination);
        }
      };
      xhr.send();
    },

    updateParameter : function(data) {
      for (var paramName in data) {
          if (data.hasOwnProperty(paramName)) {
              _changeParameterValue(paramName, data[paramName]);
          }
      }
    },

    updateParameterScheduled : function(data) {
      for (var paramName in data) {
          if (data.hasOwnProperty(paramName)) {
              _changeParameterValueScheduled(paramName, data[paramName][0], data[paramName][1]);
          }
      }        
    },

    pause : function(data) {
      scriptNode.disconnect();
    },

    resume : function(data) {
      scriptNode.connect(audioContext.destination);
    },

    terminate : function(data) {
      scriptNode.disconnect();
      _terminate();
    }
  };
})();

(function () {
  if (typeof(Modalys) === "undefined") {
    // Modalys is required :)
    return;
  }

  if (typeof(postal) === "undefined") {
    // postal.js is required.
    return;
  }

  postal.channel("modalys").subscribe("#", function(data, envelope) {
    var access = envelope.topic.split('.');
    var f = Modalys;
    while (f != null && access.length > 0) {
      var n = access.shift()
      if (f.hasOwnProperty(n)) {
        f = f[n];
      } else {
        f = null;
      }
    }
    if (f != null) {
        f(data);
    }
  });
})();
