// webdriver
var webdriver = require("selenium-webdriver"),
    By = webdriver.By,
    until = webdriver.until;
var driver = new webdriver.Builder().forBrowser("firefox").build();
driver.manage().timeouts().setScriptTimeout(20000);

// dependencies
var fs = require('fs');
var request = require('request');

// Pages
const LoginPage = require("./lib/LoginPage");
const MemberIllustPage = require("./lib/MemberIllustPage");

// args
const argv = require("argv");
const myId = argv.run().targets[0];
const password = argv.run().targets[1];
const targetUser = argv.run().targets[2];

// make download directory
var dir = "./download";
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
}

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

            var host = src.match(/^http.*pixiv.net\//)[0];

            driver.manage().getCookies().then(function(cookies) {
                var cookieString = "";
                for (var i = 0; i < cookies.length; i++) {
                    cookieString += cookies[i].name;
                    cookieString += "=";
                    cookieString += cookies[i].value;
                    cookieString += ";"
                }
                var headers = {
                    "Content-Type": "arraybuffer",
                    Cookie: cookieString,
                    Referer: host
                }
                var options = {
                    url: src,
                    headers: headers,
                    encoding: "binary"
                };

                request.get(options, function(error, response, body) {
                    if (!error && response.statusCode == 200) {
                        var fileName = src.match(/\d+_p0.*$/);
                        // save picture
                        fs.writeFile(dir + "/" + fileName[0], body, "binary");
                        // call recursively
                        getIllusts();
                    } else {
                        console.log("error: " + response.statusCode);
                    }
                })
            });

        });
}
