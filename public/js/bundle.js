(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// getUserMedia helper by @HenrikJoreteg
var func = (navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia ||
            navigator.msGetUserMedia);


module.exports = function (constraints, cb) {
    var options;
    var haveOpts = arguments.length === 2;
    var defaultOpts = {video: true, audio: true};
    var error;
    var denied = 'PERMISSION_DENIED';
    var notSatified = 'CONSTRAINT_NOT_SATISFIED';

    // make constraints optional
    if (!haveOpts) {
        cb = constraints;
        constraints = defaultOpts;
    }

    // treat lack of browser support like an error
    if (!func) {
        // throw proper error per spec
        error = new Error('NavigatorUserMediaError');
        error.name = 'NOT_SUPPORTED_ERROR';
        return cb(error);
    }

    func.call(navigator, constraints, function (stream) {
        cb(null, stream);
    }, function (err) {
        var error;
        // coerce into an error object since FF gives us a string
        // there are only two valid names according to the spec
        // we coerce all non-denied to "constraint not satisfied".
        if (typeof err === 'string') {
            error = new Error('NavigatorUserMediaError');
            if (err === denied) {
                error.name = denied;
            } else {
                error.name = notSatified;
            }
        } else {
            // if we get an error object make sure '.name' property is set
            // according to spec: http://dev.w3.org/2011/webrtc/editor/getusermedia.html#navigatorusermediaerror-and-navigatorusermediaerrorcallback
            error = err;
            if (!error.name) {
                // this is likely chrome which
                // sets a property called "ERROR_DENIED" on the error object
                // if so we make sure to set a name
                if (error[denied]) {
                    err.name = denied;
                } else {
                    err.name = notSatified;
                }
            }
        }

        cb(error);
    });
};

},{}],2:[function(require,module,exports){
var getUserMedia = require('getusermedia');

getUserMedia({video: true, audio: false}, function (err, stream) {
  if (err) {
    console.log('failed');
    console.log(err);
  } else {
    console.log('got a stream');
    var video = document.getElementById("video");

    // window.URL = window.URL || window.webkitURL || window.mozURL;
    var vendorURL = window.URL || window.webkitURL || window.mozURL;
    video.src = vendorURL.createObjectURL(stream);

    var canvas = document.getElementById("canvas"); 

    var i = 1;
      setInterval(function () {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        canvas.getContext('2d').drawImage(video, 0, 0);

        var imgData = canvas.toDataURL("image/png");

        imgData = imgData.replace('data:image/png;base64,', '');
  
        var postData = JSON.stringify({ imageData: imgData, index: i++ });

        $.ajax({
          url: "http://localhost:3011/api", 
          type: "POST",
          data: postData,
          contentType: "application/json"
        });

      }, 500);
    }
    video.play();
});

video.addEventListener('canplay', function (ev){
  var width = 200;
  var height = 0;
  if (!streaming) {
    height = video.videoHeight / (video.videoWidth/width);
  }
}, false);

},{"getusermedia":1}]},{},[2])