var sleep = require('sleep-async')();

var webdriver = require('selenium-webdriver'),
    By = webdriver.By,
    until = webdriver.until;

const url = "http://www.pixiv.net/member_illust.php";

const timeout = 5000;

/**
 * constructor
 */
var MemberIllustPage = function(driver, memberId, page) {
    this.driver = driver;
    this.memberId = memberId;
    this.page = page;
    driver.get(url + "?id=" + memberId + "&type=all&p=" + page);
}

/**
 * click Thumbnail
 */
MemberIllustPage.prototype.clickThumbnail = function(index) {
    this.driver.wait(until.elementLocated(By.xpath("(//img[@class='_thumbnail'])[" + index + "]")), timeout).then(function(e) {
        e.click();
    });
    return this;
}

/**
 * click Layout Thumbnail
 */
MemberIllustPage.prototype.clickLayoutThumbnail = function() {
    var d = this.driver;
    d.wait(until.elementLocated(By.xpath("//div[@class='_layout-thumbnail ui-modal-trigger']")), timeout).then(function(e) {
        sleep.sleep(3000, function() {
            e.click();
        });
    }, function(err) {
        // multiple pics
        d.wait(until.elementLocated(By.xpath("//a[@class=' _work multiple ']")), timeout).then(function(e) {
            sleep.sleep(3000, function() {
                e.click();
            });
        }, function(err) {
            // manga pics
            d.wait(until.elementLocated(By.xpath("//a[@class=' _work manga multiple ']")), timeout).then(function(e) {
                sleep.sleep(3000, function() {
                    e.click();
                });
            });
        });
    });
    return this;
}

/**
 * get illust src
 */
MemberIllustPage.prototype.getOriginalIllustSrc = function(callback) {
    var d = this.driver;
    d.wait(until.elementLocated(By.xpath("//img[@class='original-image']")), timeout).then(function(e) {
        sleep.sleep(3000, function() {
            e.getAttribute("src").then(function(src) {
                sleep.sleep(3000, function() {
                    callback(src);
                });
            });
        });
    }, function(err) {
        // for multi pics or manga view
        d.getAllWindowHandles().then(function(handles) {
            // switch to new tab
            d.switchTo().window(handles[handles.length - 1]);
            d.wait(until.elementLocated(By.xpath("//img[@class='image ui-scroll-view'][@data-index='0']")), timeout).then(function(e) {
                sleep.sleep(3000, function() {
                    e.getAttribute("src").then(function(src) {
                        sleep.sleep(3000, function() {
                            // close old tab
                            d.switchTo().window(handles[0]);
                            d.close();
                            // callback
                            d.switchTo().window(handles[handles.length - 1]);
                            callback(src);
                        });
                    });
                });
            });

        });

    });
}

module.exports = MemberIllustPage;
