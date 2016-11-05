// webdriver
var webdriver = require("selenium-webdriver"),
    By = webdriver.By,
    until = webdriver.until;
var driver = new webdriver.Builder().forBrowser("firefox").build();
driver.manage().timeouts().setScriptTimeout(10000);

// dependencies

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
            console.log(src);

            // recrusive
            getIllusts();
        });
}
