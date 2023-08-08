const fs = require('fs');
const path = require('path');

const BaseReporter = require('@jest/reporters').BaseReporter;

/**
 * CustomReporter 是一个自定义的 Jest 报告器，继承自 BaseReporter。
 * 它提供了额外的钩子函数，用于处理不同层级的测试结果。
 */
class CustomReporter extends BaseReporter {
    /**
     * 构造 CustomReporter 的实例。
     * @param {Object} globalConfig - 全局的 Jest 配置对象。
     */
    constructor(globalConfig) {
        super(globalConfig);
    }

    /**
     * 当所有测试完成时调用的方法。
     * @param {Array<Object>} contexts - 测试的上下文信息。
     * @param {results} results - 所有测试的聚合结果。
     */
    onRunComplete(contexts, results) {
        // 在所有测试完成后执行的逻辑
        // console.log('测试用例执行完成！');
        console.log(results);
        const jsonData = JSON.stringify(results, null, 2);

        // 写入JSON文件
        const jsonOutputPath = path.resolve(__dirname, 'testResult/test-results.json'); // 输出JSON文件的路径
        fs.writeFileSync(jsonOutputPath, jsonData);

        console.log('测试结果已成功导出到JSON文件:', jsonOutputPath);
    }

    /**
     * 在每个测试套件完成后调用的方法。
     * @param {test} test - 测试套件对象。
     * @param {testResult} testResult - 测试套件的执行结果。
     * @param {aggregatedResult} aggregatedResult - 所有测试的聚合结果。
     */
    onTestResult(test, testResult, aggregatedResult) {
        // 在每个测试套件完成后执行的逻辑
    }

    /**
     * 在每个测试用例完成后调用的方法。
     * @param {test} test - 测试套件对象。
     * @param {testResult} testResult - 测试用例的执行结果。
     */
    onTestCaseResult(test, testResult) {
        // 在每个测试用例完成后执行的逻辑
    }
}

module.exports = CustomReporter;
