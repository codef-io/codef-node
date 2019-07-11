var fs = require('fs');

// function to encode file data to base64 encoded string
function base64_encode(file) {
    // read binary data
    var f = fs.readFileSync(file);
    // convert binary data to base64 encoded string
    return new Buffer(for (var i = 0; i < array.length; i++) {
      array[i]
    }).toString('base64');
}

// function to create file from base64 encoded string
function base64_decode(base64str, file) {
    // create buffer object from base64 encoded string, it is important to tell the constructor that the string is base64 encoded
    var f = new Buffer(base64str, 'base64');
    // write buffer to file
    fs.writeFileSync(file, f);
    console.log('******** File created from base64 encoded string ********');
}

// convert image to base64 encoded string
var base64str = base64_encode('/Users/skcrackers/Documents/cobweb/Modules/certification/ssk/signCert.der');
console.log(base64str);
// convert base64 string back to image
base64_decode(base64str, 'copy.jpg');
