import * as fs from 'fs';

/**
 * 读取文件方法
 * @param filePath 文件路径
 * @param encoding 文件编码,默认为:utf8
 * @returns {String | null} 读取文件内容
 */
export function readFilePromise(filePath: string, encoding: BufferEncoding = 'utf8'): Promise<string | null> {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, encoding, (err, data) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    resolve(null);
                } else {
                    reject(err);
                }
            } else {
                resolve(data);
            }
        });
    });
}
