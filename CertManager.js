var fs = require('fs');

// function to encode file data to base64 encoded string
function base64_encode(file) {
    // read binary data
    var f = fs.readFileSync(file);
    // convert binary data to base64 encoded string
    return new Buffer(f).toString('base64');
}

// function to create file from base64 encoded string
function base64_decode(base64str, file) {
    // create buffer object from base64 encoded string, it is important to tell the constructor that the string is base64 encoded
    var f = new Buffer(base64str, 'base64');
    // write buffer to file
    fs.writeFileSync(file, f);
}

var derFileB64 = base64_encode('/Users/skcrackers/Documents/cobweb/Modules/certification/ssk/signCert.der')
var keyFileB64 = base64_encode('/Users/skcrackers/Documents/cobweb/Modules/certification/ssk/signPri.key')

console.log('derFileB64 = ' + derFileB64)
console.log('keyFileB64 = ' + keyFileB64)
