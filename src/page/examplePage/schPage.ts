import { Page } from '../Page';
import { WebDriver } from 'selenium-webdriver';

export class examplePage extends Page {
    constructor(readonly driver: WebDriver) {
        super(driver);
    }

    // 搜索框
    searchInput = this.findById('kw');

    // 搜索按钮
    searchButton = this.findById('su1');
}

export class exampleOptions {
    private page: examplePage;
    constructor(readonly driver: WebDriver) {
        this.driver = driver;
        this.page = new examplePage(this.driver);
    }

    async search(keyword: string) {
        await this.page.searchInput.sendKeys(keyword);
        await this.page.searchButton.click();
    }
}
