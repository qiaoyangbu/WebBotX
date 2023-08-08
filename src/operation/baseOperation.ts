import { Builder, WebDriver } from 'selenium-webdriver';
import { Options as ChromeOptions, ServiceBuilder } from 'selenium-webdriver/chrome';
import { downloadDir, rootDir } from '../config/testConfig';
import * as path from 'path';

/**
 * 获取 WebDriver 实例的方法
 * @returns WebDriver 实例
 */
export const getDriver = async (): Promise<WebDriver> => {
    const Preferences = {
        // 禁用下载弹窗
        'profile.default_content_settings.popups': 0,
        'download.prompt_for_download': false,
        // 配置下载地址
        'download.default_directory': `${downloadDir}`,
        // 运行多文件下载
        'profile.default_content_settings_value.automatic_downloads': 1,
    };

    // 创建 ChromeDriver 的服务
    const service = new ServiceBuilder(path.join(rootDir, 'chrome/chromedriver'));

    // 创建 ChromeOptions 对象，可配置 Chrome 的选项
    const chromeOptions = new ChromeOptions().setChromeBinaryPath(path.join(rootDir, 'chrome/chrome.exe')).setUserPreferences(Preferences);

    // 创建并返回 WebDriver 实例
    return new Builder().forBrowser('chrome').setChromeService(service).setChromeOptions(chromeOptions).build();
};
