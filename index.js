// webdriver
var webdriver = require("selenium-webdriver"),
    By = webdriver.By,
    until = webdriver.until;
var driver = new webdriver.Builder().forBrowser("firefox").build();
driver.manage().timeouts().setScriptTimeout(10000);

// dependencies
var fs = require('fs');

// Pages
const LoginPage = require("./lib/LoginPage");
const MemberIllustPage = require("./lib/MemberIllustPage");

// args
const argv = require("argv");
const myId = argv.run().targets[0];
const password = argv.run().targets[1];
const targetUser = argv.run().targets[2];

// login
var loginPage = new LoginPage(driver);
loginPage.login(myId, password);

// afeter login
loginPage.callAfeterLogin(function() {
    getIllusts();
});

var i = 1;

function getIllusts() {
    var memberIllustPage = new MemberIllustPage(driver, targetUser, 1);
    memberIllustPage
        .clickThumbnail(i++)
        .clickLayoutThumbnail()
        .getOriginalIllustSrc(function(src) {
            var host = src.match(/^http.*pixiv.net\//);
            driver.get(host[0]).then(function() {
                driver.executeAsyncScript(
                    get_image, src
                ).then(function(response) {
                    var fileName = src.match(/\d+_p0.*$/);
                    var dir = './download';
                    if (!fs.existsSync(dir)) {
                        fs.mkdirSync(dir);
                    }
                    fs.writeFile(dir + "/" + fileName[0], Buffer.from(response, 'base64'));
                });
            });
        });
}

function get_image(url) {
    var callback = arguments[arguments.length - 1];
    var xhreq = new XMLHttpRequest();
    xhreq.open("GET", url, true);
    xhreq.responseType = "arraybuffer";
    xhreq.withCredentials = true;
    xhreq.onload = function(e) {
        console.log("success");
        setTimeout(function() {
            var s = arrayBufferToBase64(xhreq.response);
            callback(s);
        }, 3000);
    };
    xhreq.onreadystatechange = function() {
        console.log("xhreq.readyState = " + xhreq.readyState + ", xhreq.status = " + xhreq.status);
    };
    xhreq.onerror = function(e) {
        console.log("error");
        console.log(e);
    }
    xhreq.send();

    function arrayBufferToBase64(buffer) {
        var binary = '';
        var bytes = new Uint8Array(buffer);
        var len = bytes.byteLength;
        for (var i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }
}

function base64ToArrayBuffer(base64) {
    var binary_string = atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}
