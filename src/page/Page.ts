import { By, Locator, until, WebDriver, WebElement } from 'selenium-webdriver';

/**
 * 页面元素配置的接口，用于定义页面元素的配置选项
 */
export interface PageElementConfiguration {
    // 元素定位重试次数
    retires?: number;
    // 元素定位超时时间（毫秒）
    timeout?: number;
    // 描述信息
    describe?: string;
    // 元素索引
    index?: number;
    // 预先提供的元素对象或者异步获取元素对象的 Promise
    element?: WebElement | Promise<WebElement>;
}

const DEFAULT_CONFIGURATION: PageElementConfiguration = {
    retires: 1,
    timeout: 5000,
    describe: '找不到定位元素',
    index: 0,
    element: undefined,
};

/**
 * Page 类是一个抽象类，作为其他页面类的基类，用于封装页面对象的通用操作和元素定位方法。
 * 通过继承 Page 类，可以创建具有相同通用操作和元素定位功能的页面类。
 *
 * 在 Page 类中，提供了多个方法来定位页面元素，使用了 CSS 选择器和 XPath 表达式。
 * 可以通过这些方法来创建 CSSPageElement 或 XpathPageElement 对象，用于操作页面元素。
 */
export abstract class Page {
    protected readonly driver: WebDriver;

    /**
     * 构造函数，用于创建 Page 类的实例。
     * @param driver WebDriver 对象，用于与页面进行交互。
     */
    protected constructor(driver: WebDriver) {
        this.driver = driver;
    }

    /**
     * 通过元素 id 进行定位
     * @param id 元素 id
     * @param config 配置对象，包含一些额外的配置选项（可选）
     */
    public findById(id: string, config?: PageElementConfiguration) {
        return new CSSPageElement(this.driver, `#${id}`, config);
    }

    /**
     * 通过元素类名进行定位
     * @param className 元素类名
     * @param config 配置对象，包含一些额外的配置选项（可选）
     */
    public findByClassName(className: string, config?: PageElementConfiguration) {
        return new CSSPageElement(this.driver, `.${className}`, config);
    }

    /**
     * 通过元素标签名进行定位
     * @param tag 元素标签名
     * @param config 配置对象，包含一些额外的配置选项（可选）
     */
    public findByTag(tag: string, config?: PageElementConfiguration) {
        return new CSSPageElement(this.driver, tag, config);
    }

    /**
     * 通过元素属性进行定位
     * @param key 属性名
     * @param value 属性值
     * @param config 配置对象，包含一些额外的配置选项（可选）
     */
    public attributes(key: string, value: string, config?: PageElementConfiguration) {
        return new CSSPageElement(this.driver).attributes(key, value, config);
    }

    /**
     * 通过 CSS 选择器进行定位
     * @param selector CSS 选择器
     * @param config 配置对象，包含一些额外的配置选项（可选）
     */
    public findByCss(selector: string, config?: PageElementConfiguration) {
        return new CSSPageElement(this.driver, selector, config);
    }

    /**
     * 通过 XPath 进行定位
     * @param selector XPath 表达式
     * @param config 配置对象，包含一些额外的配置选项（可选）
     */
    public findByXPath(selector: string, config?: PageElementConfiguration) {
        return new XpathPageElement(this.driver, selector, config);
    }
}

/**
 * PageElement 类是一个封装了页面元素操作的实用工具类。
 * 通过提供 WebDriver 对象和元素定位方式（Locator），该类允许定位和操作页面上的元素。
 *
 * 构造函数中传入的定位方式和配置选项将用于定位元素和配置元素操作。
 * 如果提供了元素定位方式和配置选项，则在调用方法时将使用这些定位方式和配置选项来定位和操作元素。
 * 如果没有提供定位方式和配置选项，则在调用方法时将进行元素定位和等待可见性操作。
 *
 * PageElement 类提供了多种操作方法，包括单击、右击、双击、悬停、输入文本、获取属性和文本内容等。
 * 在执行操作时，该类会捕获可能发生的异常，并提供详细的错误信息以便于排查问题。
 */
class PageElement {
    private readonly config: PageElementConfiguration;

    /**
     * 构造函数，用于创建PageElement对象
     * @param driver WebDriver对象
     * @param locator 元素定位方式，使用By对象表示
     * @param config 配置对象，包含一些额外的配置选项（可选）
     */
    constructor(readonly driver: WebDriver, readonly locator: Locator, config: PageElementConfiguration = DEFAULT_CONFIGURATION) {
        this.driver = driver;
        this.config = (<any>Object).assign({}, DEFAULT_CONFIGURATION, config);
    }

    private async findElement(): Promise<WebElement> {
        let elem: WebElement;

        const { retires: retires = 1, timeout = 5000, describe } = this.config;

        if (retires !== undefined) {
            // 循环尝试定位元素
            for (let i = 0; i < retires; i++) {
                try {
                    // 等待元素定位
                    elem = await this.driver.wait(until.elementLocated(this.locator), timeout, describe);
                    break; // 找到元素后退出循环
                } catch (err) {
                    if (i === retires - 1) {
                        const errMsg: string = `Failed to find element using ${this.locator}, describe: ${describe}`;
                        throw new Error(errMsg);
                    }
                }
            }
            // 循环尝试等待元素可见性
            for (let i = 0; i <= retires; i++) {
                try {
                    // 等待元素可见
                    await this.driver.wait(until.elementIsVisible(elem), timeout, `Element is not visible: ${describe}`);
                    break; // 元素可见后退出循环
                } catch (error) {
                    if (i === retires - 1) {
                        throw new Error(`Element is not visible: ${describe}`);
                    }
                }
            }
        }

        return elem;
    }

    /**
     * 获取页面元素的方法
     * @returns Promise<WebElement> 返回一个 Promise 对象，异步返回 WebElement 实例
     */
    public async getElement(): Promise<WebElement> {
        let elem: WebElement;

        if (this.config.element !== undefined) {
            // 如果已经提供了元素对象，则直接返回
            elem = await this.config.element;
        } else {
            // 否则进行元素定位和等待可见性
            elem = await this.findElement();
        }
        return elem;
    }

    public getElements() {
        return new PageElements(this.driver, this.locator);
    }

    /**
     * 执行单击操作，单击指定的元素
     * @throws {Error} 如果单击操作失败，则抛出错误
     */
    public async click(): Promise<void> {
        let elem = await this.getElement();
        try {
            await elem.click();
        } catch (error) {
            throw new Error(`Failed to click on element: ${this.locator}\n ${error}`);
        }
    }

    /**
     * 执行右击操作，右击指定的元素
     * @throws {Error} 如果右击操作失败，则抛出错误
     */
    public async contextClick(): Promise<void> {
        let elem = await this.getElement();

        try {
            await this.driver.actions().contextClick(elem).perform();
        } catch (error) {
            throw new Error(`Failed to perform right-click on element: ${this.locator}\n ${error}`);
        }
    }

    /**
     * 执行双击操作，双击指定的元素
     * @throws {Error} 如果双击操作失败，则抛出错误
     */
    public async doubleClick(): Promise<void> {
        let elem = await this.getElement();

        try {
            await this.driver.actions().doubleClick(elem).perform();
        } catch (error) {
            throw new Error(`Failed to perform doubleClick on element: ${this.locator}\n ${error}`);
        }
    }

    /**
     * 悬停到页面元素的方法
     * @returns Promise<void> 返回一个 Promise 对象，表示异步操作的结果
     * @throws Error 如果悬停操作失败，将抛出一个 Error 异常
     */
    public async hover(): Promise<void> {
        let elem = await this.getElement();

        try {
            await this.driver.actions().move({ origin: elem }).perform();
        } catch (error) {
            throw new Error(`Failed to hover over element: ${this.locator}\n${error}`);
        }
    }

    /**
     * 向页面元素发送按键事件的方法
     * @param text 要发送的文本内容
     * @returns Promise<void> 返回一个 Promise 对象，表示异步操作的结果
     * @throws Error 如果发送按键事件失败，将抛出一个 Error 异常
     */
    public async sendKeys(text: string): Promise<void> {
        let elem = await this.getElement();

        try {
            await elem.sendKeys(text);
        } catch (error) {
            throw new Error(`Failed to send keys to element: ${this.locator}\n${error}`);
        }
    }

    /**
     * 清空页面元素的方法
     * @returns Promise<void> 返回一个 Promise 对象，表示异步操作的结果
     * @throws Error 如果清空元素失败，将抛出一个 Error 异常
     */
    public async clear(): Promise<void> {
        let elem = await this.getElement();

        try {
            await elem.clear();
        } catch (error) {
            throw new Error(`Failed to clear element: ${this.locator}\n${error}`);
        }
    }

    /**
     * 获取页面元素属性的方法
     * @param attributeName 属性名称
     * @returns Promise<string> 返回一个 Promise 对象，表示异步操作的结果，包含指定属性的值
     * @throws Error 如果获取属性失败，将抛出一个 Error 异常
     */
    public async getAttribute(attributeName: string): Promise<string> {
        let elem = await this.getElement();
        try {
            return await elem.getAttribute(attributeName);
        } catch (error) {
            throw new Error(`Failed to get attribute "${attributeName}" from element: ${this.locator}\n${error}`);
        }
    }

    /**
     * 获取页面元素文本内容的方法
     * @returns Promise<string> 返回一个 Promise 对象，表示异步操作的结果，包含元素的文本内容
     * @throws Error 如果获取文本内容失败，将抛出一个 Error 异常
     */
    public async getText(): Promise<string> {
        let elem = await this.getElement();

        try {
            return await elem.getText();
        } catch (error) {
            throw new Error(`Failed to get text from element: ${this.locator}\n${error}`);
        }
    }

    /**
     * 获取页面元素的标签名的方法
     * @returns Promise<string> 返回一个 Promise 对象，表示异步操作的结果，包含元素的标签名
     * @throws Error 如果获取标签名失败，将抛出一个 Error 异常
     */
    public async getTagName(): Promise<string> {
        let elem = await this.getElement();

        try {
            return await elem.getTagName();
        } catch (error) {
            throw new Error(`Failed to get tag name of element: ${this.locator}\n${error}`);
        }
    }

    /**
     * 获取文本区域（textarea）元素的文本内容的方法
     * @returns Promise<string> 返回一个 Promise 对象，表示异步操作的结果，包含文本区域的文本内容
     * @throws Error 如果获取文本内容失败，将抛出一个 Error 异常
     */
    public async getTextarea(): Promise<string> {
        let elem = await this.getElement();

        try {
            return await elem.getAttribute('value');
        } catch (error) {
            throw new Error(`Failed to get text from textarea element: ${this.locator}\n${error}`);
        }
    }

    /**
     * 检查元素是否可用（启用）的方法
     * @returns Promise<boolean> 返回一个 Promise 对象，表示异步操作的结果，包含一个布尔值，表示元素是否可用
     * @throws Error 如果检查元素是否可用失败，将抛出一个 Error 异常
     */
    public async isEnabled(): Promise<boolean> {
        let elem = await this.getElement();

        try {
            return await elem.isEnabled();
        } catch (error) {
            throw new Error(`Failed to check if element is enabled: ${this.locator}\n${error}`);
        }
    }

    /**
     * 检查元素是否被选中的方法
     * @returns Promise<boolean> 返回一个 Promise 对象，表示异步操作的结果，包含一个布尔值，表示元素是否被选中
     * @throws Error 如果检查元素是否被选中失败，将抛出一个 Error 异常
     */
    public async isSelected(): Promise<boolean> {
        let elem = await this.getElement();

        try {
            return await elem.isSelected();
        } catch (error) {
            throw new Error(`Failed to check if element is selected: ${this.locator}\n${error}`);
        }
    }

    /**
     * 判断元素是否显示的方法
     * @returns Promise<boolean> 返回一个 Promise 对象，表示异步操作的结果，包含一个布尔值，表示元素是否显示
     * @throws Error 如果判断元素显示状态失败，将抛出一个 Error 异常
     */
    public async isDisplayed(): Promise<boolean> {
        let elem = await this.getElement();

        try {
            return await elem.isDisplayed();
        } catch (error) {
            throw new Error(`Failed to check if element is displayed: ${this.locator}\n${error}`);
        }
    }
}

/**
 * PageElements 表示一组位于网页上的元素，使用给定的定位器进行定位。
 * 该类提供了多种方法来与元素进行交互和操作。
 */
class PageElements {
    private readonly locator: Locator;
    private readonly driver: WebDriver;

    /**
     * 构造函数，用于创建PageElements对象
     * @param driver WebDriver对象
     * @param locator 定位器，用于定位一组元素
     */
    constructor(driver: WebDriver, locator: Locator) {
        this.driver = driver;
        this.locator = locator;
    }

    /**
     * 获取一组元素
     * @returns  Promise<WebElement[]> 包含一组元素的数组
     */
    public async elements(): Promise<WebElement[]> {
        try {
            return this.driver.findElements(this.locator);
        } catch (err) {
            throw new Error(`Error occurred while finding elements:${err}`);
        }
    }

    /**
     * 获取元素的数量
     * @returns Promise<number> 元素的数量
     */
    public async length(): Promise<number> {
        const elements = await this.elements();
        return elements.length;
    }

    /**
     * 根据索引获取指定元素
     * @param index 元素的索引
     * @returns Promise<WebElement> 包含指定元素的WebElement对象
     * @throws Error 如果索引超出元素数组的长度，则抛出错误
     */
    public async findByIndex(index: number): Promise<WebElement> {
        const elements = await this.elements();

        if (index >= elements.length) {
            throw new Error(`Element not found at index ${index}`);
        }
        return elements[index];
    }

    /**
     * 获取一组元素中的第一个元素
     * @returns Promise<WebElement> 第一个元素的WebElement对象
     * @throws Error 如果元素数组为空，则抛出错误
     */
    public async first(): Promise<WebElement> {
        const elements = await this.elements();
        if (elements.length === 0) {
            throw new Error(`No elements found`);
        }
        return elements[0];
    }

    /**
     * 获取一组元素中的最后一个元素
     * @returns Promise<WebElement> 最后一个元素的WebElement对象
     * @throws Error 如果元素数组为空，则抛出错误
     */
    public async last(): Promise<WebElement> {
        const elements = await this.elements();
        if (elements.length === 0) {
            throw new Error(`No elements found`);
        }
        return elements[elements.length - 1];
    }

    /**
     * 执行点击操作，点击一组元素中的所有元素
     * @returns Promise<void> 表示点击操作的完成状态
     * @throws Error 如果点击操作出现异常
     */
    public async clickAll(): Promise<void> {
        try {
            const elements = await this.elements();
            await Promise.all(
                elements.map(async (element, index) => {
                    try {
                        await element.click();
                    } catch (err) {
                        throw new Error(`点击元素失败，索引: ${index},${err}`);
                    }
                })
            );
        } catch (err) {
            // 处理异常情况，例如打印错误信息
            throw new Error(`点击元素失败: ${err}`);
        }
    }
}

/**
 * CSSPageElement 是一个封装了基于 CSS 选择器定位元素的 PageElement 的子类。
 * 通过提供 WebDriver 对象和 CSS 选择器，可以使用该类定位并操作网页上的元素。
 */
class CSSPageElement extends PageElement {
    /**
     * 构造函数，用于创建CSSPageElement对象
     * @param driver WebDriver对象
     * @param selector CSS选择器
     * @param config 配置对象，包含一些额外的配置选项（可选）
     */
    constructor(driver: WebDriver, readonly selector: string = '', config?: PageElementConfiguration) {
        // 调用父类构造函数，使用CSS选择器定位元素
        super(driver, By.css(selector), config);
    }

    /**
     * 根据id定位元素，并返回新的CSSPageElement对象
     * @param id 元素id
     * @param config 配置对象，包含一些额外的配置选项
     * @returns 返回新的CSSPageElement对象
     */
    id(id: string, config: PageElementConfiguration): CSSPageElement {
        return new CSSPageElement(this.driver, `${this.selector} #${id}`, config);
    }

    /**
     * 根据className定位元素，并返回新的CSSPageElement对象
     * @param className 元素的className
     * @param config 配置对象，包含一些额外的配置选项
     * @returns 返回新的CSSPageElement对象
     */
    className(className: string, config: PageElementConfiguration): CSSPageElement {
        return new CSSPageElement(this.driver, `${this.selector} .${className}`, config);
    }

    /**
     * 根据标签名定位元素，并返回新的CSSPageElement对象
     * @param tag 元素的标签名
     * @param config 配置对象，包含一些额外的配置选项
     * @returns 返回新的CSSPageElement对象
     */
    tag(tag: string, config: PageElementConfiguration): CSSPageElement {
        return new CSSPageElement(this.driver, `${this.selector} ${tag}`, config);
    }

    /**
     * 根据属性名和属性值定位元素，并返回新的CSSPageElement对象
     * @param key 元素的属性名
     * @param value 元素的属性值
     * @param config 配置对象，包含一些额外的配置选项
     * @returns 返回新的CSSPageElement对象
     */
    attributes(key: string, value: string, config: PageElementConfiguration): CSSPageElement {
        return new CSSPageElement(this.driver, `${this.selector} [${key}= '${value}']`, config);
    }

    /**
     * 根据CSS选择器定位元素，并返回新的CSSPageElement对象
     * @param css CSS选择器
     * @param config 配置对象，包含一些额外的配置选项
     * @returns 返回新的CSSPageElement对象
     */
    css(css: string, config: PageElementConfiguration): CSSPageElement {
        return new CSSPageElement(this.driver, `${this.selector} ${css}`, config);
    }
}

class XpathPageElement extends PageElement {
    /**
     * 构造函数，用于创建XpathPageElement对象
     * @param driver WebDriver对象
     * @param selector XPath选择器
     * @param config 配置对象，包含一些额外的配置选项（可选）
     */
    constructor(driver: WebDriver, readonly selector: string = '', config?: PageElementConfiguration) {
        // 调用父类构造函数，使用XPath选择器定位元素
        super(driver, By.xpath(selector), config);
    }

    /**
     * 根据XPath选择器定位元素，并返回新的XpathPageElement对象
     * @param selector XPath选择器
     * @param config 配置对象，包含一些额外的配置选项（可选）
     * @returns 返回新的XpathPageElement对象
     */
    xpath(selector: string, config?: PageElementConfiguration): XpathPageElement {
        return new XpathPageElement(this.driver, `${this.selector}${selector}`, config);
    }
}
