describe('测试用例套件', function () {
    describe('内部嵌套测试用例00', function () {
        test('ZGL#00001 【测试】testCase1', function () {
            let app = 'baidu';
            expect(app).toEqual('baidu');
        });

        test('ZGL#00002 【测试】testCase2', function () {
            let app = 'baidu';
            expect(app).toEqual('baidu');
        });
    });

    describe('内部嵌套测试用例01', function () {
        test('WH#00003 【测试】testCase3', function () {
            let app = 'baidu';
            expect(app).toEqual('baidu');
        });

        test('XL#00004【测试】内部嵌套测试用例02', function () {
            let app = 'baidu';
            expect(app).toEqual('baidu1');
        });
    });
});
