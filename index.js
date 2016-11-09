// webdriver
var webdriver = require("selenium-webdriver"),
    By = webdriver.By,
    until = webdriver.until;
var driver = new webdriver.Builder().forBrowser("firefox").build();
driver.manage().timeouts().setScriptTimeout(20000);

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
var page = 1;

function getIllusts() {
    if (i == 21) {
        i = 1;
        page++;
    }
    var memberIllustPage = new MemberIllustPage(driver, targetUser, page);
    memberIllustPage
        .clickThumbnail(i++)
        .clickLayoutThumbnail()
        .getOriginalIllustSrc(function(src) {
            var host = src.match(/^http.*pixiv.net\//);
            driver.get(host[0]).then(function() {
                driver.executeAsyncScript(
                    getImage, src
                ).then(function(response) {
                    // make download directory
                    var fileName = src.match(/\d+_p0.*$/);
                    var dir = './download';
                    if (!fs.existsSync(dir)) {
                        fs.mkdirSync(dir);
                    }
                    // save picture
                    fs.writeFile(dir + "/" + fileName[0], Buffer.from(response, 'base64'));
                    // recursively
                    getIllusts();
                });
            });
        });
}

/**
 * get image from browser
 */
function getImage(url) {
    var callback = arguments[arguments.length - 1];
    var xhreq = new XMLHttpRequest();
    xhreq.open("GET", url, true);
    xhreq.responseType = "arraybuffer";
    xhreq.withCredentials = true;
    xhreq.onload = function(e) {
        console.log("success");
        setTimeout(function() {
            callback(arrayBufferToBase64(xhreq.response));
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

    /**
     * to base64 for node.js
     */
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
