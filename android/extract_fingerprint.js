const fs = require('fs');
const crypto = require('crypto');

// Alternatively, let's just parse the keytool output properly
const { execSync } = require('child_process');
try {
    const stdout = execSync('keytool -list -v -keystore e:/native/AppFashion/android/app/debug.keystore -alias androiddebugkey -storepass android -keypass android', { encoding: 'utf8' });
    const sha1Match = stdout.match(/SHA1:\s*([0-9A-F:]+)/i);
    const sha256Match = stdout.match(/SHA256:\s*([0-9A-F:]+)/i);
    console.log("SHA1:", sha1Match ? sha1Match[1] : "not found");
    console.log("SHA256:", sha256Match ? sha256Match[1] : "not found");
    fs.writeFileSync('e:/native/AppFashion/android/fingerprints.txt', `SHA-1: ${sha1Match ? sha1Match[1] : ''}\nSHA-256: ${sha256Match ? sha256Match[1] : ''}\n`);
} catch (e) {
    console.error("Error running keytool:", e.message);
}
