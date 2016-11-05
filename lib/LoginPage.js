var webdriver = require('selenium-webdriver'),
    By = webdriver.By,
    until = webdriver.until;

var LoginPage = function(driver) {
    this.driver = driver;
    driver.get('https://accounts.pixiv.net/login?lang=ja&source=pc&view_type=page&ref=wwwtop_accounts_index');
}

LoginPage.prototype.login = function(userID, password) {
    var container = this.driver.findElement(By.id('container-login'));
    // userid
    var useridElement = container.findElement(By.xpath(".//input[@type='text']"));
    useridElement.clear();
    useridElement.sendKeys(userID);
    // login
    var passwordElement = container.findElement(By.xpath(".//input[@type='password']"));
    passwordElement.clear();
    passwordElement.sendKeys(password);
    // submit
    var button = container.findElement(By.xpath(".//button"));
    button.click();

}

LoginPage.prototype.callAfeterLogin = function(callback) {
    // wait until login success
    this.driver.wait(until.elementLocated(By.id('suggest-container')), 30 * 1000).then(function(elm) {
    	callback();
    });
}

module.exports = LoginPage;
