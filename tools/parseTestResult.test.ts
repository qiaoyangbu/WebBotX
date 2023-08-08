import { readFilePromise } from '../utils/fileUtils';
import { truncateFilePath } from '../utils/stringUtil';

interface TestStatistics {
    passed: number;
    failed: number;
    skipped: number;
    total: number;
    passRate: number;
}
interface ParsedTestCase {
    author: string;
    testNumber: string;
    testTitle: string;
    restOfText: string;
    filepath: string;
    status: string;
    duration: number;
    ancestorTitles: string[] | string;
}
interface TestCaseResult {
    testFilePath: string; // 测试用例文件路径
    ancestorTitles: string[]; // 祖先测试套件标题
    duration: number; // 测试用例执行时长（毫秒）
    failureMessages: string; // 失败消息集合
    numPassingAsserts: number; // 通过的断言数量
    status: string; // 测试用例状态
    title: string; // 测试用例标题
}
interface TestReport {
    numFailingTests: number; // 失败的测试用例数量
    numPassingTests: number; // 通过的测试用例数量
    numPendingTests: number; // 挂起的测试用例数量
    numTodoTests: number; // 待完成的测试用例数量
    perfStats: {
        end: number; // 结束时间戳
        runtime: number; // 运行时间（毫秒）
        slow: boolean; // 是否运行缓慢
        start: number; // 开始时间戳
    };
    testFilePath: string; // 测试文件路径
    testResults: TestCaseResult[]; // 测试结果集
}
interface TestSummary {
    numFailedTestSuites: number; // 失败的测试套件数量
    numFailedTests: number; // 失败的测试用例数量
    numPassedTestSuites: number; // 通过的测试套件数量
    numPassedTests: number; // 通过的测试用例数量
    numPendingTestSuites: number; // 挂起的测试套件数量
    numPendingTests: number; // 挂起的测试用例数量
    numRuntimeErrorTestSuites: number; // 运行时错误的测试套件数量
    numTodoTests: number; // 待完成的测试用例数量
    numTotalTestSuites: number; // 总的测试套件数量
    numTotalTests: number; // 总的测试用例数量
    testResults: TestReport[]; // 测试套件集合
}

export async function parseTestResultTest() {
    try {
        // 文件路径
        const filePath = 'testResult/test-results.json';

        const fileData = await readFilePromise(filePath);

        const testResult: TestSummary = JSON.parse(fileData);
        const testCases = testResult.testResults.flatMap((result) => {
            // 在这里返回 result.filePath
            return result.testResults.map((testCase) => ({
                ...testCase,
                testFilePath: truncateFilePath(result.testFilePath, '\\'),
            }));
        });

        // 使用 Promise.all 并行处理所有测试用例结果
        const parsedTestResults: ParsedTestCase[] | null[] = await Promise.all(testCases.map((testCase) => parseTestCase(testCase)));
        // 过滤出非空结果并打印
        const validTestResults = parsedTestResults.filter((result) => result !== null);
        // console.log(countTestCases(validTestResults));
    } catch (error) {
        console.error('Error parsing test result:', error);
    }
}

export async function parseTestCase(data: TestCaseResult): Promise<ParsedTestCase | null> {
    const regex = /^(?<author>[^\s#]+)#(?<testNumber>\d+)(?:\s*【(?<testTitle>.+?)】)?(?<restOfText>.*)$/;
    const match = data.title.match(regex);

    if (!match) {
        return null;
    }
    const { testFilePath, status, ancestorTitles, duration } = data;
    const { author, testNumber, testTitle, restOfText } = match.groups;

    return { author, testNumber, testTitle, restOfText, filepath: testFilePath, status, duration, ancestorTitles };
}

// 统计测试用例
function countTestCases(testCases: ParsedTestCase[], targetAuthors?: string[]): Record<string, TestStatistics> {
    const authorStats: Record<string, TestStatistics> = {};

    for (const testCase of testCases) {
        const { author, status } = testCase;

        if (!targetAuthors || targetAuthors.includes(author)) {
            // 如果未提供 targetAuthors 或者当前 author 在 targetAuthors 数组中，则进行统计
            authorStats[author] = authorStats[author] || { passed: 0, failed: 0, skipped: 0, total: 0, passRate: 0 };
            authorStats[author].total++;
            if (status === 'passed') {
                authorStats[author].passed++;
            } else if (status === 'failed') {
                authorStats[author].failed++;
            } else if (status === 'skipped') {
                authorStats[author].skipped++;
            }
        }
    }

    // 计算所有用例的统计信息
    const all: TestStatistics = { passed: 0, failed: 0, skipped: 0, total: 0, passRate: 0 };

    for (const author of Object.keys(authorStats)) {
        all.passed += authorStats[author].passed;
        all.failed += authorStats[author].failed;
        all.skipped += authorStats[author].skipped;
        all.total += authorStats[author].total;
    }

    authorStats.all = all;

    // 计算每个作者的通过率并保留一位小数
    for (const author of Object.keys(authorStats)) {
        const { passed, total } = authorStats[author];
        authorStats[author].passRate = Number(((passed / total) * 100).toFixed(1));
    }

    return authorStats;
}

it('should ', async () => {
    await parseTestResultTest();
});

async function readFileAndParseData(filePath: string): Promise<TestSummary> {
    const fileData = await readFilePromise(filePath);
    if (!fileData) {
        throw new Error(`File ${filePath}`);
    }
    return JSON.parse(fileData);
}
