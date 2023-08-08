/**
 * 截取给定文件路径，仅保留指定关键字之后的部分。
 * 如果文件路径中不存在指定关键字，或者文件路径或关键字为空或 undefined，则抛出错误。
 * @param filePath 完整的文件路径。
 * @param keyword 要保留的关键字，函数将截取关键字之后的部分。
 * @returns 截取后的文件路径，仅保留指定关键字之后的部分。
 * @throws Error 如果文件路径或关键字为空或 undefined，或者关键字未在文件路径中找到。
 */
export function truncateFilePath(filePath: string, keyword: string): string {
    if (!filePath || !keyword) {
        throw new Error('File path and keyword must be provided.');
    }

    let temp = filePath.split(keyword);
    if (temp.length === 1) {
        throw new Error('Keyword not found in the file path.');
    }

    return temp[temp.length - 1];
}
