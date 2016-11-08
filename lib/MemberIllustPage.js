var sleep = require('sleep-async')();

var webdriver = require('selenium-webdriver'),
    By = webdriver.By,
    until = webdriver.until;

var url = "http://www.pixiv.net/member_illust.php";

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
    var element = this.driver.wait(until.elementLocated(By.xpath("(//img[@class='_thumbnail'])[" + index + "]"))).then(function(e) {
        e.click();
    });
    return this;
}

/**
 * click Layout Thumbnail
 */
MemberIllustPage.prototype.clickLayoutThumbnail = function() {
    var element = this.driver.wait(until.elementLocated(By.xpath("//div[@class='_layout-thumbnail ui-modal-trigger']"))).then(function(e) {
        sleep.sleep(3000, function() {
            e.click();
        });
    });
    return this;
}

/**
 * get illust src
 */
MemberIllustPage.prototype.getOriginalIllustSrc = function(callback) {
    var element = this.driver.wait(until.elementLocated(By.xpath("//img[@class='original-image']"))).then(function(e) {
        sleep.sleep(3000, function() {
            e.getAttribute("src").then(function(src) {
                sleep.sleep(3000, function() {
                    callback(src);
                });
            });
        });
    });
}

module.exports = MemberIllustPage;
