const os = require('os');

module.exports = {
    semi: true, // 使用分号
    singleQuote: true, // 使用单引号
    jsxSingleQuote: false, // JSX中不使用单引号
    printWidth: 300, // 每行代码的最大宽度为300个字符
    tabWidth: 4, // 使用4个空格缩进
    useTabs: false, // 不使用制表符进行缩进
    quoteProps: 'preserve', // 保留对象字面量中的引号样式
    endOfLine: os.platform() === 'win32' ? 'crlf' : 'lf', // 根据操作系统选择行尾符（Windows使用CRLF，其他系统使用LF）
};
