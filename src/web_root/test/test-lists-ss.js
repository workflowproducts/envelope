function createTestDataRequest(rowPrefix, intCount) {
	var test = rowPrefix + (arguments.length > 2 && arguments[2] === false ? '' : '{{test_random}}') + '{{i}}\ttestset;akldsjf;lkasjdf;kljasjdf;lkasjdfkljdfgl;kjad;flkgjadg\t;alksjdf;lkasjdf;lkasjdf;lkasdjf;laskdjf;laskdjfa;lsdkfja;lskdfj\n', strRet = '';
	for (var i = intCount; i > 0; i -= 1) {
		strRet += test.replace('{{i}}', i.toString());
	}
	return strRet;
}
function createTestDataResponse(rowPrefix, intCount) {
	var test = rowPrefix + (arguments.length > 2 && arguments[2] === false ? '' : '{{test_random}}') + '{{i}}\ttestset;akldsjf;lkasjdf;kljasjdf;lkasjdfkljdfgl;kjad;flkgjadg\t;alksjdf;lkasjdf;lkasjdf;lkasdjf;laskdjf;laskdjfa;lsdkfja;lskdfj\n', arrRet = [], temp = '';
	for (var i = 1; i < intCount; i += 10) {
		temp = '';
		for (var j = i; j < (i + 10); j += 1) {
			temp += test.replace('{{i}}', j.toString());
		}
		arrRet.push(temp);
	}
	arrRet.push('TRANSACTION COMPLETED');
	return arrRet;
}

﻿$.tests = {
	_http_auth: {
		 tests: [
 			['Login Fail 1', 'ajax', 500, '/env/auth', 'action=login&username=doesntexist&password=password',
 				ml(function () {/*FATAL
[28000] [Microsoft][SQL Server Native Client 11.0][SQL Server]Login failed for user 'doesntexist'.(18456)
*/ })],
 			['Login Fail 2', 'ajax', 500, '/env/auth', 'action=login&username=' + encodeURIComponent('test"test') +
 						'&password=' + encodeURIComponent('asdfasdfasdfasdfasdf'),
 				ml(function () {/*FATAL
[28000] [Microsoft][SQL Server Native Client 11.0][SQL Server]Login failed for user '"test""test"'.(18456)
*/ })],
 			['Login Fail 3', 'ajax', 500, '/env/auth', 'action=login&username=' + encodeURIComponent('test"tes\'t2') +
 						'&password=' + encodeURIComponent('asdfasdfasdfasdfasdf'),
 				ml(function () {/*FATAL
[28000] [Microsoft][SQL Server Native Client 11.0][SQL Server]Login failed for user '"test""tes't2"'.(18456)
*/ })],
 			['Login Fail 4', 'ajax', 500, '/env/auth', 'action=login&username=' + encodeURIComponent('test"test3') +
 						'&password=' + encodeURIComponent('asdfasdf\'asdf"asdfasdf'),
 				ml(function () {/*FATAL
[28000] [Microsoft][SQL Server Native Client 11.0][SQL Server]Login failed for user '"test""test3"'.(18456)
*/ })],
 			['Login Fail 5', 'ajax', 500, '/env/auth', 'action=login&password=' + encodeURIComponent('asdfasdf\'asdf"asdfasdf'),
 				ml(function () {/*FATAL
no username*/ })],
 			['Login Fail 6', 'ajax', 500, '/env/auth', 'action=login&username=&password=',
			ml(function () {/*FATAL
no username*/ })],
 			['Login Fail 7', 'ajax', 500, '/env/auth', 'action=login&username=&password=',
			ml(function () {/*FATAL
no username*/ })],
 			['Login Fail 8', 'ajax', 500, '/env/auth', '',
 				ml(function () {/*Not a valid action.*/ })],
 			['Login Fail 9', 'ajax', 500, '/env/auth', 'action=login',
			ml(function () {/*FATAL
no username*/ })],
 			['Login Fail 10', 'ajax', 500, '/env/auth', 'action=login&username=postgres&password=fasdf',
 				ml(function () {/*FATAL
[28000] [Microsoft][SQL Server Native Client 11.0][SQL Server]Login failed for user 'postgres'.(18456)
*/ })],
 			['Login Fail 11', 'ajax', 500, '/env/auth', 'action=login&username=postgres&password=' + encodeURIComponent('test!@#$%^&*()|<>?,./:+-*/=ƒ©˙∆test'),
			ml(function () {/*FATAL
[28000] [Microsoft][SQL Server Native Client 11.0][SQL Server]Login failed for user 'postgres'.(18456)
*/ })],
 			['Login Fail 12', 'ajax', 500, '/env/auth', 'action=login&username=' + encodeURIComponent('test!@#$%^&*()|<>?,./:+-/*=ƒ©˙∆test') + '&password=testtest',
 				ml(function () {/*FATAL
[28000] [Microsoft][SQL Server Native Client 11.0][SQL Server]Login failed for user 'test!@#$%^&*()|<>?,./:+-/*=ƒ©˙∆test'.(18456)
*/ })],
 			['Login Fail 13', 'ajax', 500, '/env/auth', 'action=' + encodeURIComponent('loginπ'),
				ml(function () {/*Not a valid action.*/ })],
 			['Login Fail 14', 'ajax', 500, '/env/auth', 'action=loginbasdf',
				ml(function () {/*Not a valid action.*/ })],
 			['Login Fail 15', 'ajax', 404, '/env/authasdf', '',
 				ml(function () {/*The file you are requesting is not here.*/ })],
 			['Login Fail 16', 'ajax', 500, '/env/auth', 'test=test&a@&#=te=st',
				ml(function () {/*Not a valid action.*/ })],
 			['Logout before login *', 'ajax spam', 200, '/env/auth', 'action=logout', ''],
			['ACCEPTNC FAIL 1', 'ajax', 500, '/env/dbo.acceptnc_testing1', 'testingnitset', ml(function () {/*FATAL
db_framework_odbc/db_framework.c:db_exec_query_cb: SQLExecDirect Failed!
DB_exec failed:
[42000] [Microsoft][SQL Server Native Client 11.0][SQL Server]Could not find stored procedure 'dbo.acceptnc_testing1'.(2812)
*/})],
			['ACCEPTNC FAIL 2', 'ajax', 500, '/env/dbo.acceptnc_testing;', 'testingnitset', ml(function () {/*FATAL
../common/common_util_sql.c:query_is_safe: SQL Injection detected!
SQL Injection detected*/})],
			['ACCEPTNC', 'ajax', 200, '/env/dbo.acceptnc_testing', 'testingnitset', 'testingnitset'],

			['ACTIONNC FAIL 1', 'ajax', 500, '/env/dbo.actionnc_testing1', 'testingnitset', ml(function () {/*FATAL
db_framework_odbc/db_framework.c:db_exec_query_cb: SQLExecDirect Failed!
DB_exec failed, res->status == 5:
[42000] [Microsoft][SQL Server Native Client 11.0][SQL Server]Could not find stored procedure 'dbo.actionnc_testing1'.(2812)
*/})],
			['ACTIONNC FAIL 2', 'ajax', 500, '/env/dbo.actionnc_testing;', 'testingnitset', ml(function () {/*FATAL
../common/common_util_sql.c:query_is_safe: SQL Injection detected!
SQL Injection detected*/})],
			['ACTIONNC', 'ajax', 200, '/env/dbo.actionnc_testing', 'testingnitset', '{"stat":true, "dat": "testingnitset"}'],
 			['Login 1', 'ajax', 200, '/env/auth', 'action=login&username=test1&password=456456',
 				ml(function () {/*{"stat": true, "dat": "/env/app/all/index.html"}*/ })],
 			[
 				'Login 2',
 				'ajax',
 				200,
 				'/env/auth',
 				new Blob(['action=login&username=test1&password=456456'], {type: 'text/plain'}),
 				ml(function () {/*{"stat": true, "dat": "/env/app/all/index.html"}*/ })
 			],
 			[
 				'Login 3',
 				'ajax',
 				200,
 				'/env/auth',
 				new Blob(['action=login&username=test1&password=456456'], {type: 'application/octet-binary'}),
 				ml(function () {/*{"stat": true, "dat": "/env/app/all/index.html"}*/ })
 			],
 			[
 				'Login 4',
 				'ajax',
 				200,
 				'/env/auth',
 				new Blob(['action=login&username=test1&password=456456'], {type: 'application/x-binary'}),
 				ml(function () {/*{"stat": true, "dat": "/env/app/all/index.html"}*/ })
 			],
			['Download Fail', 'ajax', 404, '/postage/1/download/test_doesnt_exist.sql', '',
				ml(function () {/*The file you are requesting is not here.*/})],
 			[
 				'Login 5 *',
 				'ajax spam',
 				200,
 				'/env/auth',
 				'action=login&username=test1&password=456456',
 				ml(function () {/*{"stat": true, "dat": "/env/app/all/index.html"}*/ })
 			],

			['Change Password', 'ajax', 200, '/env/auth', 'action=change_pw&password_old=456456&password_new=test1',
				ml(function () {/*{"stat": true, "dat": "OK"}*/})],
			['Change Password Fail', 'ajax', 500, '/env/auth', 'action=change_pw&password_old=test&password_new=test',
				ml(function () {/*FATAL
Old password does not match.*/})],
			['Change Password', 'ajax', 200, '/env/auth', 'action=change_pw&password_old=test1&password_new=456456',
				ml(function () {/*{"stat": true, "dat": "OK"}*/})],
		 ]
	},
    http_file: {
        tests: [
            ['File Read Fail 1', 'ajax', 404, '/test200.txt', '',
		        ml(function () {/*The file you are requesting is not here.*/
		        })],
	        ['File Read 1', 'ajax', 200, '/test.txt', '',
		        ml(function () {/*πππøˆ¨¥†ƒ©√˙∫˚∆¨¥†ƒç©˙∆√˙˚∫∆¨¥ˆ†∂®†®∂¥†®´∑œ£™¢∞§¶•ª¶¥†¶•∞§¢´£¢™§¶§¢•∞‡ﬁ‡´ﬁﬂ‹›Œ„´‰ÁˇÎ¨ÁÏÓ˝ÔÏÇÓ˛˝ÏÎÍ¸‰´ˇÁˇ¨ÁÏˆ˝ØÓ¨ÒÁ¨ˆÁØ‡°ˇ°‰ﬂﬁ´›ﬁ‹€ﬁ„‹†´®ß©≈˙ƒ∆˙©∆˚˚136789864512321
*/
		        })],
	        ['File Read If-Modified-Since', 'ajax', 304, '/test.txt?if_modified_since=true', '',
	            ml(function () {/**/
	            })],
            ['File Read Fail 2', 'ajax', 500, '/test//index.html', '',
			    ml(function () {/*FATAL
../util/util_canonical.c:canonical: test//index.html is a bad path. Path contains invalid characters.

Bad file path*/
			    })],
		    ['File Read Fail 3', 'ajax', 404, '/asdf/asdf/asdf/asdf/asdf/asdf/asdf/asdf/asdf/asdf/asdf/asdf/asdf/asdf/asdf/index.html', '',
		        ml(function () {/*The file you are requesting is not here.*/
		        })],
		    ['File Read 3', 'ajax', 200, '/env/app/all/index.html', '',
		        ''],
		    ['File Read Fail 4', 'ajax', 500, '/env/app/alla/index.html', '',
		        ml(function () {/*FATAL
You don't have the necessary permissions for this folder.*/
		        })],
		    ['File Read Fail 5', 'ajax', 500, '/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/index.html', '',
			    ml(function () {/*FATAL
../util/util_canonical.c:canonical: ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/ASDF/index.html is a bad path. Path exceeds maximum length.

Bad file path*/
			    })],
		    ['File Read 4', 'ajax', 200, '/test.txt', '',
			    ml(function () {/*πππøˆ¨¥†ƒ©√˙∫˚∆¨¥†ƒç©˙∆√˙˚∫∆¨¥ˆ†∂®†®∂¥†®´∑œ£™¢∞§¶•ª¶¥†¶•∞§¢´£¢™§¶§¢•∞‡ﬁ‡´ﬁﬂ‹›Œ„´‰ÁˇÎ¨ÁÏÓ˝ÔÏÇÓ˛˝ÏÎÍ¸‰´ˇÁˇ¨ÁÏˆ˝ØÓ¨ÒÁ¨ˆÁØ‡°ˇ°‰ﬂﬁ´›ﬁ‹€ﬁ„‹†´®ß©≈˙ƒ∆˙©∆˚˚136789864512321
*/
			    })],
		    ['File Read 5', 'ajax', 200, '/test.txt', '',
			    ml(function () {/*πππøˆ¨¥†ƒ©√˙∫˚∆¨¥†ƒç©˙∆√˙˚∫∆¨¥ˆ†∂®†®∂¥†®´∑œ£™¢∞§¶•ª¶¥†¶•∞§¢´£¢™§¶§¢•∞‡ﬁ‡´ﬁﬂ‹›Œ„´‰ÁˇÎ¨ÁÏÓ˝ÔÏÇÓ˛˝ÏÎÍ¸‰´ˇÁˇ¨ÁÏˆ˝ØÓ¨ÒÁ¨ˆÁØ‡°ˇ°‰ﬂﬁ´›ﬁ‹€ﬁ„‹†´®ß©≈˙ƒ∆˙©∆˚˚136789864512321
*/
			    })],
		    ['File Read Fail 6', 'ajax', 404, '/index.htm', '',
		        ml(function () {/*The file you are requesting is not here.*/
		        })],
		    ['File Read Fail 7', 'ajax', 500, '/index.π', '',
			    ml(function () {/*FATAL
../util/util_canonical.c:canonical: index.π is a bad path. Path contains invalid characters.

Bad file path*/
			    })],
		    ['File Read Fail 8', 'ajax', 404, '/index.php', '',
		        ml(function () {/*The file you are requesting is not here.*/
		        })],
		    ['File Read Fail 9', 'ajax', 404, '/index.php', '',
		        ml(function () {/*The file you are requesting is not here.*/
		        })],
		    ['File Read Fail 10', 'ajax', 500, '/π', '',
			    ml(function () {/*FATAL
../util/util_canonical.c:canonical: π is a bad path. Path contains invalid characters.

Bad file path*/
			    })],
		    ['File Read 6', 'ajax', 200, '/' + ml(function () {/*env/app/all/index.html?view=home&test=!@#$%^&*()<>?:"{}|,./;'[]\=/*-+.~`œ∑´®†¥¨ˆøπåßƒ©˙∆˚¬Ω≈√∫˜µŒ„´‰ˇÁ¨ˆØ∏ÅÍÎÏ˝ÓÔÒ¸˛Ç◊ı˜Â*/
                }), '',
                ml(function () {/**/
                })],
		    ['File Read 7', 'ajax', 200, '/test.txt?test=test/postage/index.html?test=test', '',
			    ml(function () {/*πππøˆ¨¥†ƒ©√˙∫˚∆¨¥†ƒç©˙∆√˙˚∫∆¨¥ˆ†∂®†®∂¥†®´∑œ£™¢∞§¶•ª¶¥†¶•∞§¢´£¢™§¶§¢•∞‡ﬁ‡´ﬁﬂ‹›Œ„´‰ÁˇÎ¨ÁÏÓ˝ÔÏÇÓ˛˝ÏÎÍ¸‰´ˇÁˇ¨ÁÏˆ˝ØÓ¨ÒÁ¨ˆÁØ‡°ˇ°‰ﬂﬁ´›ﬁ‹€ﬁ„‹†´®ß©≈˙ƒ∆˙©∆˚˚136789864512321
*/
			    })],
		    ['File Read Fail 11', 'ajax', 404, '/postag', '',
		        ml(function () {/*The file you are requesting is not here.*/
		        })],
		    ['File Read 8', 'ajax', 200, '/env/role/all/test.txt', '',
			    ml(function () {/*πππøˆ¨¥†ƒ©√˙∫˚∆¨¥†ƒç©˙∆√˙˚∫∆¨¥ˆ†∂®†®∂¥†®´∑œ£™¢∞§¶•ª¶¥†¶•∞§¢´£¢™§¶§¢•∞‡ﬁ‡´ﬁﬂ‹›Œ„´‰ÁˇÎ¨ÁÏÓ˝ÔÏÇÓ˛˝ÏÎÍ¸‰´ˇÁˇ¨ÁÏˆ˝ØÓ¨ÒÁ¨ˆÁØ‡°ˇ°‰ﬂﬁ´›ﬁ‹€ﬁ„‹†´®ß©≈˙ƒ∆˙©∆˚˚136789864512321
*/
			    })],
		    ['File Read 9', 'ajax', 200, '/env/app/all/test.txt', '',
			    ml(function () {/*πππøˆ¨¥†ƒ©√˙∫˚∆¨¥†ƒç©˙∆√˙˚∫∆¨¥ˆ†∂®†®∂¥†®´∑œ£™¢∞§¶•ª¶¥†¶•∞§¢´£¢™§¶§¢•∞‡ﬁ‡´ﬁﬂ‹›Œ„´‰ÁˇÎ¨ÁÏÓ˝ÔÏÇÓ˛˝ÏÎÍ¸‰´ˇÁˇ¨ÁÏˆ˝ØÓ¨ÒÁ¨ˆÁØ‡°ˇ°‰ﬂﬁ´›ﬁ‹€ﬁ„‹†´®ß©≈˙ƒ∆˙©∆˚˚136789864512321
*/
			    })],
        ]
    },
	http_action: {
		tests: [
			['ACCEPT FAIL 1', 'ajax', 500, '/env/dbo.accept_testing1', 'testingnitset', ml(function () {/*FATAL
db_framework_odbc/db_framework.c:db_exec_query_cb: SQLExecDirect Failed!
DB_exec failed:
[42000] [Microsoft][SQL Server Native Client 11.0][SQL Server]Could not find stored procedure 'dbo.accept_testing1'.(2812)
*/ })],
			['ACCEPT FAIL 2', 'ajax', 500, '/env/dbo.accept_testing;', 'testingnitset', ml(function () {/*FATAL
../common/common_util_sql.c:query_is_safe: SQL Injection detected!
SQL Injection detected*/})],
			['ACCEPT 1', 'ajax', 200, '/env/dbo.accept_testing', 'testingnitset', 'testingnitset'],
			['ACCEPT 2', 'ajax', 200, '/env/dbo.accept_testing', 'company_name=AA-TULSA&company_name_exact=0&type=Passenger&type_anywhere=-1&engine_mfg=Pratt %26 Whitney&engine_mfg_exact=0&engine_model=J57-P&engine_model_exact=0&country=&country_exact=0&continent=&continent_exact=0&overhaul_center=&overhaul_center_exact=0&on_order=undefined&stored=undefined', 'company_name=AA-TULSA&company_name_exact=0&type=Passenger&type_anywhere=-1&engine_mfg=Pratt %26 Whitney&engine_mfg_exact=0&engine_model=J57-P&engine_model_exact=0&country=&country_exact=0&continent=&continent_exact=0&overhaul_center=&overhaul_center_exact=0&on_order=undefined&stored=undefined'],
			['ACCEPT 3', 'ajax', 200, '/env/dbo.accept_testing/test', 'testingnitset', 'testingnitset&path=/test'],
			['ACCEPT 4', 'ajax', 500, '/env/dbo.accept_testing_return_null', '', "FATAL\nFunction returned null:\n"],
			['ACCEPTNC FAIL 1', 'ajax', 500, '/env/dbo.acceptnc_testing1', 'testingnitset', ml(function () {/*FATAL
db_framework_odbc/db_framework.c:db_exec_query_cb: SQLExecDirect Failed!
DB_exec failed:
[42000] [Microsoft][SQL Server Native Client 11.0][SQL Server]Could not find stored procedure 'dbo.acceptnc_testing1'.(2812)
*/})],
			['ACCEPTNC FAIL 2', 'ajax', 500, '/env/dbo.acceptnc_testing;', 'testingnitset', ml(function () {/*FATAL
../common/common_util_sql.c:query_is_safe: SQL Injection detected!
SQL Injection detected*/})],
			['ACCEPTNC', 'ajax', 200, '/env/dbo.acceptnc_testing', 'testingnitset', 'testingnitset'],
			['ACTION FAIL 1', 'ajax', 500, '/env/dbo.action_testing1', 'testingnitset', ml(function () {/*FATAL
db_framework_odbc/db_framework.c:db_exec_query_cb: SQLExecDirect Failed!
DB_exec failed, res->status == 5:
[42000] [Microsoft][SQL Server Native Client 11.0][SQL Server]Could not find stored procedure 'dbo.action_testing1'.(2812)
*/ })],
			['ACTION FAIL 2', 'ajax', 500, '/env/dbo.action_testing;', 'testingnitset', ml(function () {/*FATAL
../common/common_util_sql.c:query_is_safe: SQL Injection detected!
SQL Injection detected*/})],
			['ACTION 1', 'ajax', 200, '/env/dbo.action_testing', 'testingnitset', '{"stat":true, "dat": "testingnitset"}'],
			['ACTION 2', 'ajax', 200, '/env/dbo.action_testing_return_null', 'testingnitset', '{"stat":true, "dat": null}'],
			['ACTIONNC FAIL 1', 'ajax', 500, '/env/dbo.actionnc_testing1', 'testingnitset', ml(function () {/*FATAL
db_framework_odbc/db_framework.c:db_exec_query_cb: SQLExecDirect Failed!
DB_exec failed, res->status == 5:
[42000] [Microsoft][SQL Server Native Client 11.0][SQL Server]Could not find stored procedure 'dbo.actionnc_testing1'.(2812)
*/ })],
			['ACTIONNC FAIL 2', 'ajax', 500, '/env/dbo.actionnc_testing;', 'testingnitset', ml(function () {/*FATAL
../common/common_util_sql.c:query_is_safe: SQL Injection detected!
SQL Injection detected*/})],
			['ACTIONNC', 'ajax', 200, '/env/dbo.actionnc_testing', 'testingnitset', '{"stat":true, "dat": "testingnitset"}'],
			['action_info', 'ajax', 200, '/env/action_info', '', '']
		]
	},
	ws_action: {
		tests: [
			['SOCKET OPEN', 'websocket start'],

			['ACTION FAIL 1', 'websocket', '', ml(function () {/*ACTION	dbo	action_testing1	testingnitset
*/}),
["[42000] [Microsoft][SQL Server Native Client 11.0][SQL Server]Could not find stored procedure 'dbo.action_testing1'.(2812)\n"]],
			['ACTION FAIL 2', 'websocket', '', ml(function () {/*ACTION	dbo	actiont_testing1	testingnitset
*/}),
			["Invalid action name, action function names must begin with \"action_\" or \"actionnc_\""]],
			['ACTION FAIL 3', 'websocket', '', ml(function () {/*ACTION	actiont_testing1	testingnitset
*/}),
			["Invalid action name, action function names must begin with \"action_\" or \"actionnc_\""]],
			['ACTION FAIL 4', 'websocket', '', ml(function () {/*ACTION	dbo actiont_testing1	testingnitset
*/}),
			["Invalid action name, action function names must begin with \"action_\" or \"actionnc_\""]],
			['ACTION FAIL 5', 'websocket', '', ml(function () {/*ACTION	dbo action_testing;	testingnitset
*/}),
			["Invalid action name, action function names must begin with \"action_\" or \"actionnc_\""]],
			['ACTION', 'websocket', '', ml(function () {/*ACTION	dbo	action_testing	testingnitset
*/}),
			["\"testingnitset\"","TRANSACTION COMPLETED"]],

		    ['SOCKET CLOSE', 'websocket end']
		]
	},
	ws_info: {
		tests: [
			['SOCKET OPEN', 'websocket start'],

			['INFO', 'websocket', '', ml(function () {/*INFO
*/}),
			["ANYTHING", "TRANSACTION COMPLETED"]],

		    ['SOCKET CLOSE', 'websocket end']
		]
	},
	ws_select: {
		tests: [
			['SOCKET OPEN', 'websocket start'],
			['SELECT FAIL 1', 'websocket', '', ml(function () {/*SELECT	rtesting_table
RETURN	id	test_name	test_full

ORDER BY
id DESC
*/
			}),
			["db_framework_odbc/db_framework.c:db_column_types_query_cb: SQLPrepare Failed!\nQuery failed:\n[42S22] [Microsoft][SQL Server Native Client 11.0][SQL Server]Invalid column name 'test_full'.(207)\n[42000] [Microsoft][SQL Server Native Client 11.0][SQL Server]Statement(s) could not be prepared.(8180)\n"]],
			['SELECT FAIL 2', 'websocket', '', ml(function () {/*SELECT	*/}) + ml(function () {/*
RETURN	*

ORDER BY	LIMIT
1 ASC	10
*/
			}),
			["db_framework_odbc/db_framework.c:db_column_types_query_cb: SQLPrepare Failed!\nQuery failed:\n[42000] [Microsoft][SQL Server Native Client 11.0][SQL Server]An object or column name is missing or empty. For SELECT INTO statements, verify each column has a name. For other statements, look for empty alias names. Aliases defined as \"\" or [] are not allowed. Change the alias to a valid name.(1038)\n[42000] [Microsoft][SQL Server Native Client 11.0][SQL Server]Statement(s) could not be prepared.(8180)\n"]],
			['SELECT FAIL 3', 'websocket', '', ml(function () {/*SELECT
RETURN	*

ORDER BY	LIMIT
1 ASC	10
*/
			}),
			["../common/common_util_sql.c:get_table_name: Invalid request\nQuery failed:\nFATAL\nerror_detail\tERROR: Failed to get table name from query.\n"]],
			['SELECT FAIL 4', 'websocket', '', ml(function () {/*SELECT	rtesting_table
RETURN	*/}) + ml(function () {/*

ORDER BY	LIMIT
1 ASC	10
*/
}),
["db_framework_odbc/db_framework.c:db_column_types_query_cb: SQLPrepare Failed!\nQuery failed:\n[42000] [Microsoft][SQL Server Native Client 11.0][SQL Server]An object or column name is missing or empty. For SELECT INTO statements, verify each column has a name. For other statements, look for empty alias names. Aliases defined as \"\" or [] are not allowed. Change the alias to a valid name.(1038)\n[42000] [Microsoft][SQL Server Native Client 11.0][SQL Server]Statement(s) could not be prepared.(8180)\n"]],
			['SELECT FAIL 5', 'websocket', '', ml(function () {/*SELECT	rtesting_table
RETURN

ORDER BY	LIMIT
1 ASC	10
*/
			}),
			["../common/common_util_sql.c:get_return_columns: strstr failed\nFailed to get return columns from query"]],
			['SELECT FAIL 6', 'websocket', '', ml(function () {/*SELECT	rtesting_table
RETURN	*/}) + ml(function () {/*

ORDER BY	LIMIT
1 ASC	10
*/
}),
["db_framework_odbc/db_framework.c:db_column_types_query_cb: SQLPrepare Failed!\nQuery failed:\n[42000] [Microsoft][SQL Server Native Client 11.0][SQL Server]An object or column name is missing or empty. For SELECT INTO statements, verify each column has a name. For other statements, look for empty alias names. Aliases defined as \"\" or [] are not allowed. Change the alias to a valid name.(1038)\n[42000] [Microsoft][SQL Server Native Client 11.0][SQL Server]Statement(s) could not be prepared.(8180)\n"]],
			['SELECT FAIL 7', 'websocket', '', new Blob([ml(function () {/*SELECT	rtesting_table
RETURN	*/
			}) + ml(function () {/*

ORDER BY	LIMIT
1 ASC	10
*/
            })], {type: 'application/x-binary'}),
			["db_framework_odbc/db_framework.c:db_column_types_query_cb: SQLPrepare Failed!\nQuery failed:\n[42000] [Microsoft][SQL Server Native Client 11.0][SQL Server]An object or column name is missing or empty. For SELECT INTO statements, verify each column has a name. For other statements, look for empty alias names. Aliases defined as \"\" or [] are not allowed. Change the alias to a valid name.(1038)\n[42000] [Microsoft][SQL Server Native Client 11.0][SQL Server]Statement(s) could not be prepared.(8180)\n"]],
			['SELECT FAIL 8', 'websocket', '', ml(function () {/*SELECT	(SELECT * FROM rtesting_table) em) TO STDOUT; --
RETURN	*/
			}) + ml(function () {/*

ORDER BY	LIMIT
1 ASC	10
*/
            }),
			["../common/common_util_sql.c:query_is_safe: SQL Injection detected!\nSQL Injection detected"]],
			['BEGIN', 'websocket', '', 'BEGIN', ['OK']],
			['INSERT RECORDS', 'websocket', '', ml(function () {/*INSERT	rtesting_table
RETURN	id	test_name	test_name2
PK	id
SEQ	*/
}) + ml(function () {/*
ORDER BY	id ASC

id	test_name	test_name2
*/
			}) + createTestDataRequest('9{{test_random1}}', 100, false), createTestDataResponse('9{{test_random1}}', 100, false)],
			['SELECT 1', 'websocket', '', ml(function () {/*SELECT	rtesting_table
RETURN	id	test_name	test_name2

ORDER BY	WHERE
id ASC	id > 100
*/ }),
			["id\ttest_name\ttest_name2\nint\tvarchar(150)\tvarchar(150)\n"].concat(createTestDataResponse('9{{test_random1}}', 100, false))],
			['ROLLBACK', 'websocket', '', 'ROLLBACK', ['OK']],
		    ['SOCKET CLOSE', 'websocket end']
        ]
    },
    ws_insert: {
        tests: [
			['SOCKET OPEN', 'websocket start'],
			['BEGIN', 'websocket', '', 'BEGIN', ['OK']],
			['INSERT FAIL 1', 'websocket', '', ml(function () {/*INSERT	ttesting_view
RETURN	id	test_name
PK	id
SEQ

id	test_name
{{test_random}}1	Bob
{{test_random}}2	Alice
{{test_random}}3	Eve
*/
			}),
			["db_framework_odbc/db_framework.c:db_exec_query_cb: SQLExecDirect Failed!\nDB_exec failed:\n[42000] [Microsoft][SQL Server Native Client 11.0][SQL Server]Cannot update the view or function 'ttesting_view' because it contains aggregates, or a DISTINCT or GROUP BY clause, or PIVOT or UNPIVOT operator.(4403)\n"]],
			['ROLLBACK', 'websocket', '', 'ROLLBACK', ['OK']],

			['BEGIN', 'websocket', '', 'BEGIN', ['OK']],
			['INSERT FAIL 2', 'websocket', '', ml(function () {/*INSERTRETURN	id	test_name
PK	id
SEQ	id

id	test_name
{{test_random}}1	Bob
{{test_random}}2	Alice
{{test_random}}3	Eve
*/
			}),
			["Invalid Request Type \"INSERTRETURN\"\n"]],
			['ROLLBACK', 'websocket', '', 'ROLLBACK', ['OK']],

			['BEGIN', 'websocket', '', 'BEGIN', ['OK']],
			['INSERT FAIL 3', 'websocket', '', ml(function () {/*INSERT	*/ }) + ml(function () {/*
RETURN	id	test_name
PK	id
SEQ	id

id	test_name
{{test_random}}1	Bob
{{test_random}}2	Alice
{{test_random}}3	Eve
*/
			}),
			["db_framework_odbc/db_framework.c:db_exec_query_cb: SQLExecDirect Failed!\nDB_exec failed:\n[42000] [Microsoft][SQL Server Native Client 11.0][SQL Server]An object or column name is missing or empty. For SELECT INTO statements, verify each column has a name. For other statements, look for empty alias names. Aliases defined as \"\" or [] are not allowed. Change the alias to a valid name.(1038)\n"]],
			['ROLLBACK', 'websocket', '', 'ROLLBACK', ['OK']],

			['BEGIN', 'websocket', '', 'BEGIN', ['OK']],
			['INSERT FAIL 4', 'websocket', '', ml(function () {/*INSERT
RETURN	id	test_name
PK	id
SEQ	id

id	test_name
{{test_random}}1	Bob
{{test_random}}2	Alice
{{test_random}}3	Eve
*/
			}),
			["../common/common_util_sql.c:get_table_name: Invalid request\nQuery failed:\nFATAL\nerror_detail\tERROR: Failed to get table name from query.\n", "../common/common_util_sql.c:get_table_name: Invalid request\nQuery failed:\nFATAL\nerror_detail\tERROR: Failed to get table name from query.\n"]],
			['ROLLBACK', 'websocket', '', 'ROLLBACK', ['OK']],

			['BEGIN', 'websocket', '', 'BEGIN', ['OK']],
			['INSERT FAIL 5', 'websocket', '', ml(function () {/*INSERT	rtesting_table
RETURN	*/
			}) + ml(function () {/*
PK	id
SEQ

id	test_name
{{test_random}}1	Bob
{{test_random}}2	Alice
{{test_random}}3	Eve
*/
			}),
			["db_framework_odbc/db_framework.c:db_exec_query_cb: SQLExecDirect Failed!\nDB_exec failed:\n[42000] [Microsoft][SQL Server Native Client 11.0][SQL Server]An object or column name is missing or empty. For SELECT INTO statements, verify each column has a name. For other statements, look for empty alias names. Aliases defined as \"\" or [] are not allowed. Change the alias to a valid name.(1038)\n"]],
			['ROLLBACK', 'websocket', '', 'ROLLBACK', ['OK']],

			['BEGIN', 'websocket', '', 'BEGIN', ['OK']],
			['INSERT FAIL 6', 'websocket', '', ml(function () {/*INSERT	rtesting_table
RETURN
PK	id
SEQ

id	test_name
{{test_random}}1	Bob
{{test_random}}2	Alice
{{test_random}}3	Eve
*/
			}),
			["../common/common_util_sql.c:get_return_columns: strstr failed\nFailed to get return columns from query"]],
			['ROLLBACK', 'websocket', '', 'ROLLBACK', ['OK']],

			['BEGIN', 'websocket', '', 'BEGIN', ['OK']],
			['INSERT FAIL 7', 'websocket', '', ml(function () {/*INSERT	rtesting_table
PK	id
SEQ

id	test_name
{{test_random}}1	Bob
{{test_random}}2	Alice
{{test_random}}3	Eve
*/
			}),
			["../common/common_util_sql.c:get_return_columns: strstr failed\nFailed to get return columns from query"]],
			['ROLLBACK', 'websocket', '', 'ROLLBACK', ['OK']],

			['BEGIN', 'websocket', '', 'BEGIN', ['OK']],
			['INSERT FAIL 8', 'websocket', '', ml(function () {/*INSERT	rtesting_table
RETURN	test_name
SEQ

id	test_name
{{test_random}}1	Bob
{{test_random}}2	Alice
{{test_random}}3	Eve
*/
			}),
			["could not find \"PK\", malformed request?"]],
			['ROLLBACK', 'websocket', '', 'ROLLBACK', ['OK']],

			['BEGIN', 'websocket', '', 'BEGIN', ['OK']],
			['INSERT FAIL 9', 'websocket', '', ml(function () {/*INSERT	rtesting_table
RETURN	test_name
PK	id

id	test_name
{{test_random}}1	Bob
{{test_random}}2	Alice
{{test_random}}3	Eve
*/
			}),
			["could not find \"SEQ\", malformed request?"]],
			['ROLLBACK', 'websocket', '', 'ROLLBACK', ['OK']],

			['BEGIN', 'websocket', '', 'BEGIN', ['OK']],
			['INSERT FAIL 10', 'websocket', '', ml(function () {/*INSERT	rtesting_table
RETURN	test_name
PK	id
SEQ

*/
			}),
			["No column names"]],
			['ROLLBACK', 'websocket', '', 'ROLLBACK', ['OK']],

			['BEGIN', 'websocket', '', 'BEGIN', ['OK']],
			['INSERT FAIL 11', 'websocket', '', ml(function () {/*INSERT	rtesting_table
RETURN	test_name
PK	id
SEQ

id	test_name
*/
			}),
			["No insert data:\n"]],
			['ROLLBACK', 'websocket', '', 'ROLLBACK', ['OK']],

			['BEGIN', 'websocket', '', 'BEGIN', ['OK']],
			['INSERT FAIL 12', 'websocket', '', ml(function () {/*INSERT	rtesting_table
RETURN	test_name
PK	id
SEQ

id	test_name*/
			}),
			["No insert data"]],
			['ROLLBACK', 'websocket', '', 'ROLLBACK', ['OK']],

			['BEGIN', 'websocket', '', 'BEGIN', ['OK']],
			['INSERT FAIL 13', 'websocket', '', ml(function () {/*INSERT	rtesting_table
RETURN	test_name
PK	id
SEQ

iπd	test_name
2	rest*/
			}),
			["db_framework_odbc/db_framework.c:db_exec_query_cb: SQLExecDirect Failed!\nDB_exec failed:\n[42S22] [Microsoft][SQL Server Native Client 11.0][SQL Server]Invalid column name 'iπd'.(207)\n"]],
			['ROLLBACK', 'websocket', '', 'ROLLBACK', ['OK']],

			['BEGIN', 'websocket', '', 'BEGIN', ['OK']],
			['INSERT FAIL 14', 'websocket', '', new Blob([ml(function () {/*INSERT	rtesting_table
RETURN	test_name
PK	id
SEQ

iπd	test_name
{{test_random}}2	rest*/
			})]),
			["db_framework_odbc/db_framework.c:db_exec_query_cb: SQLExecDirect Failed!\nDB_exec failed:\n[42S22] [Microsoft][SQL Server Native Client 11.0][SQL Server]Invalid column name 'iπd'.(207)\n"]],
			['ROLLBACK', 'websocket', '', 'ROLLBACK', ['OK']],

			['BEGIN', 'websocket', '', 'BEGIN', ['OK']],
			['INSERT 1', 'websocket', '', ml(function () {/*INSERT	rtesting_table
RETURN	id	test_name
PK	id
SEQ	*/
}) + ml(function () {/*
ORDER BY	id ASC

id	test_name
{{test_random}}1	Bob
{{test_random}}2	Alice
{{test_random}}3	Eve
*/
			}),
  			['{{test_random}}1\tBob\n{{test_random}}2\tAlice\n{{test_random}}3\tEve\n', 'TRANSACTION COMPLETED']],
			['ROLLBACK', 'websocket', '', 'ROLLBACK', ['OK']],

			['BEGIN', 'websocket', '', 'BEGIN', ['OK']],
			['INSERT 2', 'websocket', '', ml(function () {/*INSERT	rtesting_table
RETURN	id	test_name
PK	id
SEQ	*/
}) + ml(function () {/*
ORDER BY	id ASC

id	test_name
{{test_random}}1	Bob
{{test_random}}2	Alice
{{test_random}}3	Eve
*/
			}),
			['{{test_random}}1\tBob\n{{test_random}}2\tAlice\n{{test_random}}3\tEve\n', 'TRANSACTION COMPLETED']],
			['ROLLBACK', 'websocket', '', 'ROLLBACK', ['OK']],

			['BEGIN', 'websocket', '', 'BEGIN', ['OK']],
			[
                'INSERT 3',
                'websocket',
                '',
                ml(function () {/*INSERT	rtesting_table
RETURN	id	select
PK	id
SEQ	*/
}) + ml(function () {/*
ORDER BY	id ASC

id	select
{{test_random}}70	Bob
{{test_random}}71	Alice
{{test_random}}72	Eve
*/
                }),
			    [
                    '{{test_random}}70\tBob\n{{test_random}}71\tAlice\n{{test_random}}72\tEve\n',
                    'TRANSACTION COMPLETED'
			    ]
			],
			['ROLLBACK', 'websocket', '', 'ROLLBACK', ['OK']],

			['BEGIN', 'websocket', '', 'BEGIN', ['OK']],
			['INSERT 4', 'websocket send from', '', ml(function () {/*INSERT	rtesting_table
RETURN	id	test_name	test_name2
PK	id
SEQ	*/
}) + ml(function () {/*
ORDER BY	id ASC

id	test_name	test_name2
*/
			}) + createTestDataRequest('', 500), createTestDataResponse('', 500)],
		    ['SOCKET CLOSE', 'websocket end']
        ]
    },
    ws_update: {
        tests: [
			['SOCKET OPEN', 'websocket start'],

			['BEGIN', 'websocket', '', 'BEGIN', ['OK']],
			['INSERT RECORDS 1', 'websocket', '', ml(function () {/*INSERT	rtesting_table
RETURN	id
PK	id
SEQ	*/
}) + ml(function () {/*
ORDER BY	id ASC

id	test_name
1{{test_random}}1	Bob
1{{test_random}}2	Alice
*/}),
			['1{{test_random}}1\n1{{test_random}}2\n', 'TRANSACTION COMPLETED']],
			['COMMIT', 'websocket', '', 'COMMIT', ['OK']],

			['BEGIN', 'websocket', '', 'BEGIN', ['OK']],
			['UPDATE FAIL 1', 'websocket', '', ml(function () {/*UPDATE	rtesting_table
RETURN	id	tes_name

pk	set
id	test_name
1{{test_random}}1	Bobby
1{{test_random}}2	Alicia
*/
			}),
			["[42S22] [Microsoft][SQL Server Native Client 11.0][SQL Server]Invalid column name 'tes_name'.(207)\n[42S22] [Microsoft][SQL Server Native Client 11.0][SQL Server]Invalid column name 'tes_name'.(207)\n"]],
			['ROLLBACK', 'websocket', '', 'ROLLBACK', ['OK']],

			['BEGIN', 'websocket', '', 'BEGIN', ['OK']],
			['UPDATE FAIL 2', 'websocket', '', ml(function () {/*UPDATE	ttesting_view
RETURN	id	test_name

pk	set
id	test_name
1{{test_random}}1	Bobby
1{{test_random}}2	Alicia
*/
			}),
			["db_framework_odbc/db_framework.c:db_exec_query_cb: SQLExecDirect Failed!\nDB_exec failed:\n[42000] [Microsoft][SQL Server Native Client 11.0][SQL Server]Cannot update the view or function 'ttesting_view' because it contains aggregates, or a DISTINCT or GROUP BY clause, or PIVOT or UNPIVOT operator.(4403)\n"]],
			['ROLLBACK', 'websocket', '', 'ROLLBACK', ['OK']],

			['BEGIN', 'websocket', '', 'BEGIN', ['OK']],
			['UPDATE FAIL 3', 'websocket', '', ml(function () {/*UPDATE
RETURN	id	test_name

pk	set
id	test_name
1{{test_random}}1	Bobby
1{{test_random}}2	Alicia
*/
			}),
			["../common/common_util_sql.c:get_table_name: Invalid request\nQuery failed:\nFATAL\nerror_detail\tERROR: Failed to get table name from query.\n", "../common/common_util_sql.c:get_table_name: Invalid request\nQuery failed:\nFATAL\nerror_detail\tERROR: Failed to get table name from query.\n"]],
			['ROLLBACK', 'websocket', '', 'ROLLBACK', ['OK']],

			['BEGIN', 'websocket', '', 'BEGIN', ['OK']],
			['UPDATE FAIL 4', 'websocket', '', ml(function () {/*UPDATE	rtesting_table

pk	set
id	test_name
1{{test_random}}1	Bobby
1{{test_random}}2	Alicia
*/
			}),
			["../common/common_util_sql.c:get_return_columns: strstr failed\nFailed to get return columns from query"]],
			['ROLLBACK', 'websocket', '', 'ROLLBACK', ['OK']],

			['BEGIN', 'websocket', '', 'BEGIN', ['OK']],
			['UPDATE FAIL 5', 'websocket', '', ml(function () {/*UPDATE	rtesting_table
RETURN	id	test_name

pk	set	hash
id	test_name	hash
1{{test_random}}1	Bobby	notreallyahashbutitdoesntmatter
1{{test_random}}2	Alicia	notreallyahashbutitdoesntmatter
*/
			}),
			["Hashes supplied, but columns unknown"]],
			['ROLLBACK', 'websocket', '', 'ROLLBACK', ['OK']],

			['BEGIN', 'websocket', '', 'BEGIN', ['OK']],
			['UPDATE FAIL 6', 'websocket', '', ml(function () {/*UPDATE	rtesting_table
RETURN	id	test_name

*/
			}),
			["Could not find end of column purpose headers"]],
			['ROLLBACK', 'websocket', '', 'ROLLBACK', ['OK']],

			['BEGIN', 'websocket', '', 'BEGIN', ['OK']],
			['UPDATE FAIL 7', 'websocket', '', ml(function () {/*UPDATE	rtesting_table
RETURN	id	test_name

pk	set
*/
			}),
			["Could not find end of column name headers"]],
			['ROLLBACK', 'websocket', '', 'ROLLBACK', ['OK']],

			['BEGIN', 'websocket', '', 'BEGIN', ['OK']],
			['UPDATE FAIL 8', 'websocket', '', ml(function () {/*UPDATE	rtesting_table
RETURN	id	test_name

pk	set
id	test_name
*/
			}),
			["No update data:\n"]],
			['ROLLBACK', 'websocket', '', 'ROLLBACK', ['OK']],

			['BEGIN', 'websocket', '', 'BEGIN', ['OK']],
			['UPDATE FAIL 9', 'websocket', '', ml(function () {/*UPDATE	rtesting_table
RETURN	id	test_name

pk	set	set
id	test_name	id
1{{test_random}}2	test
*/
			}),
			["db_framework_odbc/db_framework.c:db_copy_in_query_cb: SQLExecDirect Failed!\nDB_exec failed:\n[07002] [Microsoft][SQL Server Native Client 11.0]COUNT field incorrect or syntax error(0)\n"]],
			['ROLLBACK', 'websocket', '', 'ROLLBACK', ['OK']],

			['BEGIN', 'websocket', '', 'BEGIN', ['OK']],
			['UPDATE FAIL 10', 'websocket', '', ml(function () {/*UPDATE	rtesting_table
RETURN	id	test_name

pk	set
id	test_name	id
1{{test_random}}2	test
*/
			}),
			["Extra column name"]],
			['ROLLBACK', 'websocket', '', 'ROLLBACK', ['OK']],

			['BEGIN', 'websocket', '', 'BEGIN', ['OK']],
			['UPDATE FAIL 11', 'websocket', '', ml(function () {/*UPDATE	rtesting_table
RETURN	id	test_name

pk	set	set
id	test_name
1{{test_random}}2	test
*/
			}),
			["Extra column purpose"]],
			['ROLLBACK', 'websocket', '', 'ROLLBACK', ['OK']],

			['BEGIN', 'websocket', '', 'BEGIN', ['OK']],
			['UPDATE FAIL 12', 'websocket', '', ml(function () {/*UPDATE	rtesting_table
RETURN	id	test_name

pk	set	set
id	test_name
1{{test_random}}2	test
*/
			}),
			["Extra column purpose"]],
			['ROLLBACK', 'websocket', '', 'ROLLBACK', ['OK']],

			['BEGIN', 'websocket', '', 'BEGIN', ['OK']],
			['UPDATE FAIL 13', 'websocket', '', ml(function () {/*UPDATE	rtesting_table
RETURN	id	test_name

pk	set	asdf
id	test_name	id
1{{test_random}}2	test	2
*/
			}),
			["Invalid column purpose 'asdf'"]],
			['ROLLBACK', 'websocket', '', 'ROLLBACK', ['OK']],

			['BEGIN', 'websocket', '', 'BEGIN', ['OK']],
			['UPDATE FAIL 14', 'websocket', '', ml(function () {/*UPDATE	rtesting_table
RETURN	id	test_name	testset

pk	set
id	test_name
1{{test_random}}2	test
*/
			}),
			["[42S22] [Microsoft][SQL Server Native Client 11.0][SQL Server]Invalid column name 'testset'.(207)\n[42S22] [Microsoft][SQL Server Native Client 11.0][SQL Server]Invalid column name 'testset'.(207)\n"]],
			['ROLLBACK', 'websocket', '', 'ROLLBACK', ['OK']],

			['BEGIN', 'websocket', '', 'BEGIN', ['OK']],
			['UPDATE FAIL 15', 'websocket', '', ml(function () {/*UPDATE	rtesting_table
RETURN	id	test_name
HASH	id

pk	set	hash
id	test_name	hash
1{{test_random}}2	test	2lkujh1234klj5hlk13j4h5lk
*/
			}),
			["Someone updated this record before you.:\n"]],
			['ROLLBACK', 'websocket', '', 'ROLLBACK', ['OK']],

			['BEGIN', 'websocket', '', 'BEGIN', ['OK']],
			['UPDATE FAIL 16', 'websocket', '', ml(function () {/*UPDATE	rtesting_table
RETURN	id	test_name

pk	set	set
id	test_name	testset
1{{test_random}}2	test	2lkujh1234klj5hlk13j4h5lk
*/
			}),
    		["db_framework_odbc/db_framework.c:db_exec_query_cb: SQLExecDirect Failed!\nDB_exec failed:\n[42S22] [Microsoft][SQL Server Native Client 11.0][SQL Server]Invalid column name 'testset'.(207)\n"]],
			['ROLLBACK', 'websocket', '', 'ROLLBACK', ['OK']],

			['BEGIN', 'websocket', '', 'BEGIN', ['OK']],
			['UPDATE FAIL 17', 'websocket', '', ml(function () {/*UPDATE	rtesting_table
RETURN	id	test_name
HASH	id

pk	set	hash
id	test_name	hash
1{{test_random}}2	test	π∂ƒ©˙∆˚
*/
			}),
			["Someone updated this record before you.:\n"]],
			['ROLLBACK', 'websocket', '', 'ROLLBACK', ['OK']],

			['BEGIN', 'websocket', '', 'BEGIN', ['OK']],
			['UPDATE FAIL 18', 'websocket', '', ml(function () {/*UPDATE*/ }),
			["../common/common_util_sql.c:get_table_name: Invalid request\nQuery failed:\nFATAL\nerror_detail\tERROR: Failed to get table name from query.\n"]],
			['ROLLBACK', 'websocket', '', 'ROLLBACK', ['OK']],

			['BEGIN', 'websocket', '', 'BEGIN', ['OK']],
			['UPDATE FAIL 19', 'websocket', '', ml(function () {/*UPDATE	rtesting_table
RETURN	id	test_name

pk	set
id	test_name
1{{test_random}}2	test
test
*/
			}),
			["db_framework_odbc/db_framework.c:db_copy_in_query_cb: SQLExecDirect Failed!\nDB_exec failed:\n[22018] [Microsoft][SQL Server Native Client 11.0][SQL Server]Conversion failed when converting the varchar value 'test' to data type int.(245)\n"]],
			['ROLLBACK', 'websocket', '', 'ROLLBACK', ['ANYTHING']],

			['BEGIN', 'websocket', '', 'BEGIN', ['OK']],
			['UPDATE 1', 'websocket', '', ml(function () {/*UPDATE	rtesting_table
RETURN	id	test_name
ORDER BY	id ASC


pk	set
id	test_name
1{{test_random}}1	Bobby
1{{test_random}}2	Alicia
*/
			}),
			['1{{test_random}}1\tBobby\n1{{test_random}}2\tAlicia\n', 'TRANSACTION COMPLETED']],
			['COMMIT', 'websocket', '', 'COMMIT', ['OK']],

			['BEGIN', 'websocket', '', 'BEGIN', ['OK']],
			['UPDATE 2', 'websocket', '', ml(function () {/*UPDATE	rtesting_table
RETURN	id	unicode_test

pk	set
id	unicode_test
1{{test_random}}2	π∂ƒ©˙∆˚
*/
			}),
			['ANYTHING', 'TRANSACTION COMPLETED']],
			['COMMIT', 'websocket', '', 'COMMIT', ['OK']],

			['BEGIN', 'websocket', '', 'BEGIN', ['OK']],
			['UPDATE 3', 'websocket', '', ml(function () {/*UPDATE	rtesting_table
RETURN	id	test_name
ORDER BY	id ASC

pk	set
id	test_name
1{{test_random}}1	Bobbie
1{{test_random}}2	Aliciay
*/
			}),
			['1{{test_random}}1\tBobbie\n1{{test_random}}2\tAliciay\n', 'TRANSACTION COMPLETED']],
			['COMMIT', 'websocket', '', 'COMMIT', ['OK']],

			['BEGIN', 'websocket', '', 'BEGIN', ['OK']],
			['UPDATE 4', 'websocket', '', ml(function () {/*UPDATE	rtesting_table
RETURN	id	test_name
ORDER BY	id ASC

pk	set
id	test_name
1{{test_random}}1	Bobbie
1{{test_random}}2	Aliciay
*/
			}),
  			['1{{test_random}}1\tBobbie\n1{{test_random}}2\tAliciay\n', 'TRANSACTION COMPLETED']],
			['COMMIT', 'websocket', '', 'COMMIT', ['OK']],

			['BEGIN', 'websocket', '', 'BEGIN', ['OK']],
			['UPDATE 5', 'websocket', '', ml(function () {/*UPDATE	rtesting_table
RETURN	id	select
ORDER BY	id ASC

pk	set
id	select
1{{test_random}}1	Bobbie
1{{test_random}}2	Alicia
*/
            }),
			["1{{test_random}}1\tBobbie\n1{{test_random}}2\tAlicia\n", "TRANSACTION COMPLETED"]],
			['COMMIT', 'websocket', '', 'COMMIT', ['OK']],

			['BEGIN', 'websocket', '', 'BEGIN', ['OK']],
			['UPDATE 6', 'websocket', '', ml(function () {/*UPDATE	rtesting_table
RETURN	id	test_name

pk	set
id	id
1{{test_random}}1	1{{test_random}}4
*/
            }),
			["1{{test_random}}4\tBobbie\n", "TRANSACTION COMPLETED"]],
			['COMMIT', 'websocket', '', 'COMMIT', ['OK']],

			['BEGIN', 'websocket', '', 'BEGIN', ['OK']],
			['INSERT RECORDS 2', 'websocket', '', ml(function () {/*INSERT	rtesting_table
RETURN	id	test_name	test_name2
PK	id
SEQ	*/
}) + ml(function () {/*
ORDER BY	id ASC

id	test_name	test_name2
*/
			}) + createTestDataRequest('10', 500), createTestDataResponse('10', 500)],
			['COMMIT', 'websocket', '', 'COMMIT', ['OK']],

			['BEGIN', 'websocket', '', 'BEGIN', ['OK']],
			['UPDATE 7', 'websocket send from', '', ml(function () {/*UPDATE	rtesting_table
RETURN	id	test_name	test_name2
ORDER BY	id ASC

pk	set	set
id	test_name	test_name2
*/
			}) + createTestDataRequest('10', 500), createTestDataResponse('10', 500)],

		    ['SOCKET CLOSE', 'websocket end']
        ]
    },
    ws_delete: {
        tests: [
			['SOCKET OPEN', 'websocket start'],

			['BEGIN', 'websocket', '', 'BEGIN', ['OK']],
			['INSERT RECORDS 1', 'websocket', '', ml(function () {/*INSERT	rtesting_table
RETURN	id
PK	id
SEQ	*/
}) + ml(function () {/*
ORDER BY	id ASC

id	test_name
2{{test_random}}1	Bob
2{{test_random}}2	Alice
2{{test_random}}3	Eve
*/}),
			['2{{test_random}}1\n2{{test_random}}2\n2{{test_random}}3\n', 'TRANSACTION COMPLETED']],
			['COMMIT', 'websocket', '', 'COMMIT', ['OK']],

			['BEGIN', 'websocket', '', 'BEGIN', ['OK']],
			['DELETE FAIL 1', 'websocket', '', ml(function () {/*DELETE rtesting_table
pk
id
2{{test_random}}1
2{{test_random}}2
2{{test_random}}3
*/}),
			[
				"../common/common_util_sql.c:get_table_name: Invalid request\nQuery failed:\nFATAL\nerror_detail\tERROR: Failed to get table name from query.\n"
			]],
			['ROLLBACK', 'websocket', '', 'ROLLBACK', ['OK']],

			['BEGIN', 'websocket', '', 'BEGIN', ['OK']],
			['DELETE FAIL 2', 'websocket', '', ml(function () {/*DELETE	ttesting_view

pk
id
2{{test_random}}1
2{{test_random}}2
2{{test_random}}3
*/}),
			["db_framework_odbc/db_framework.c:db_exec_query_cb: SQLExecDirect Failed!\nDB_exec failed:\n[42000] [Microsoft][SQL Server Native Client 11.0][SQL Server]Cannot update the view or function 'ttesting_view' because it contains aggregates, or a DISTINCT or GROUP BY clause, or PIVOT or UNPIVOT operator.(4403)\n"]],
			['ROLLBACK', 'websocket', '', 'ROLLBACK', ['OK']],

			['BEGIN', 'websocket', '', 'BEGIN', ['OK']],
			['DELETE FAIL 3', 'websocket', '', ml(function () {/*DELETE
pk
id
2{{test_random}}1
2{{test_random}}2
2{{test_random}}3
*/}),
			["../common/common_util_sql.c:get_table_name: Invalid request\nQuery failed:\nFATAL\nerror_detail\tERROR: Failed to get table name from query.\n"]],
			['ROLLBACK', 'websocket', '', 'ROLLBACK', ['OK']],

			['BEGIN', 'websocket', '', 'BEGIN', ['OK']],
			['DELETE FAIL 4', 'websocket', '', ml(function () {/*DELETE	ttest@XXX	tpaste

pk
id
2{{test_random}}1
2{{test_random}}2
2{{test_random}}3
*/}),
			["db_framework_odbc/db_framework.c:db_exec_query_cb: SQLExecDirect Failed!\nDB_exec failed:\n[42S02] [Microsoft][SQL Server Native Client 11.0][SQL Server]Invalid object name 'ttest@XXX.tpaste'.(208)\n"]],
			['ROLLBACK', 'websocket', '', 'ROLLBACK', ['OK']],

			['BEGIN', 'websocket', '', 'BEGIN', ['OK']],
			['DELETE FAIL 5', 'websocket', '', ml(function () {/*DELETE	public	tpaste@XXX

pk
id
2{{test_random}}1
2{{test_random}}2
2{{test_random}}3
*/}),
			["db_framework_odbc/db_framework.c:db_exec_query_cb: SQLExecDirect Failed!\nDB_exec failed:\n[42S02] [Microsoft][SQL Server Native Client 11.0][SQL Server]Invalid object name 'public.tpaste@XXX'.(208)\n"]],
			['ROLLBACK', 'websocket', '', 'ROLLBACK', ['OK']],

			['BEGIN', 'websocket', '', 'BEGIN', ['OK']],
			['DELETE FAIL 6', 'websocket', '',
                ml(function () {/*DELETE	rtesting_table
HASH	id	tes

pk	hash
id	hash
2{{test_random}}1	abc
2{{test_random}}2	abc
2{{test_random}}3	abc
*/}),
			["db_framework_odbc/db_framework.c:db_exec_query_cb: SQLExecDirect Failed!\nDB_exec failed:\n[42S22] [Microsoft][SQL Server Native Client 11.0][SQL Server]Invalid column name 'tes'.(207)\n[42S22] [Microsoft][SQL Server Native Client 11.0][SQL Server]Invalid column name 'tes'.(207)\n"]],
			['ROLLBACK', 'websocket', '', 'ROLLBACK', ['OK']],

			['BEGIN', 'websocket', '', 'BEGIN', ['OK']],
			['DELETE FAIL 7', 'websocket', '',
                //two tabs right next to each other in the HASH columns
                ml(function () {/*DELETE	rtesting_table
HASH	id		test_name

pk	hash
id	hash
2{{test_random}}1	abc
2{{test_random}}2	abc
2{{test_random}}3	abc
*/}),
			["db_framework_odbc/db_framework.c:db_exec_query_cb: SQLExecDirect Failed!\nDB_exec failed:\n[42000] [Microsoft][SQL Server Native Client 11.0][SQL Server]An object or column name is missing or empty. For SELECT INTO statements, verify each column has a name. For other statements, look for empty alias names. Aliases defined as \"\" or [] are not allowed. Change the alias to a valid name.(1038)\n"]],
			['ROLLBACK', 'websocket', '', 'ROLLBACK', ['OK']],

			['BEGIN', 'websocket', '', 'BEGIN', ['OK']],
			['DELETE FAIL 8', 'websocket', '',
                //no HASH columns
                ml(function () {/*DELETE	rtesting_table

pk	hash
id	hash
2{{test_random}}1	abc
2{{test_random}}2	abc
2{{test_random}}3	abc
*/}),
			    ["Hashes supplied, but columns unknown"]
            ],
			['ROLLBACK', 'websocket', '', 'ROLLBACK', ['OK']],

			['BEGIN', 'websocket', '', 'BEGIN', ['OK']],
			['DELETE FAIL 9', 'websocket', '', ml(function () {/*DELETE	rtesting_table
HASH	id	test_name
pk	hash
id	hash
2{{test_random}}1	abc
2{{test_random}}2	abc
2{{test_random}}3	abc
*/}),
			    ["Someone updated this record before you.:\n"]
            ],
			['ROLLBACK', 'websocket', '', 'ROLLBACK', ['OK']],

			['BEGIN', 'websocket', '', 'BEGIN', ['OK']],
			['DELETE FAIL 10', 'websocket', '', ml(function () {/*DELETE	rtesting_table
HASH	id	test_name
pk	hash
id	hash
2{{test_random}}1	abc
2{{test_random}}2	abc
2{{test_random}}3	abc
*/}),
			    ["Someone updated this record before you.:\n"]
            ],
			['ROLLBACK', 'websocket', '', 'ROLLBACK', ['OK']],

			['BEGIN', 'websocket', '', 'BEGIN', ['OK']],
			['DELETE FAIL 11', 'websocket', '',
                // no column types in data
                ml(function () {/*DELETE	rtesting_table
HASH	id	test_name

id	hash
2{{test_random}}1	abc
*/}),
			    ["Too many hashes"]
            ],
			['ROLLBACK', 'websocket', '', 'ROLLBACK', ['OK']],

			['BEGIN', 'websocket', '', 'BEGIN', ['OK']],
			['DELETE FAIL 12', 'websocket', '',
                // no column names in data
                ml(function () {/*DELETE	rtesting_table
HASH	id	test_name

pk	hash
2{{test_random}}1	abc
*/}),
			["db_framework_odbc/db_framework.c:db_exec_query_cb: SQLExecDirect Failed!\nDB_exec failed:\n[42S22] [Microsoft][SQL Server Native Client 11.0][SQL Server]Invalid column name '2{{test_random}}1'.(207)\n[42S22] [Microsoft][SQL Server Native Client 11.0][SQL Server]Invalid column name '2{{test_random}}1'.(207)\n"]],
			['ROLLBACK', 'websocket', '', 'ROLLBACK', ['OK']],

			['BEGIN', 'websocket', '', 'BEGIN', ['OK']],
			['DELETE FAIL 13', 'websocket', '',
                // no data
                ml(function () {/*DELETE	rtesting_table
HASH	id	test_name

pk	hash
id	hash
*/}),
			["No Data.:\n"]],
			['ROLLBACK', 'websocket', '', 'ROLLBACK', ['OK']],

			['BEGIN', 'websocket', '', 'BEGIN', ['OK']],
			['DELETE FAIL 14', 'websocket', '',
                // extra column name in data
                ml(function () {/*DELETE	rtesting_table
HASH	id	test_name

pk	hash
id	hash	id
2{{test_random}}1	abc
*/}),
			["Extra column name"]],
			['ROLLBACK', 'websocket', '', 'ROLLBACK', ['OK']],

			['BEGIN', 'websocket', '', 'BEGIN', ['OK']],
			['DELETE FAIL 15', 'websocket', '',
                // extra column type in data
                ml(function () {/*DELETE	rtesting_table
HASH	id	test_name

pk	hash	pk
id	hash
2{{test_random}}1	abc
*/}),
			["Extra column purpose"]],
			['ROLLBACK', 'websocket', '', 'ROLLBACK', ['OK']],

			['BEGIN', 'websocket', '', 'BEGIN', ['OK']],
			['DELETE FAIL 16', 'websocket', '',
                // empty hash in data 
                ml(function () {/*DELETE	rtesting_table
HASH	id	test_name

pk	hash
id	hash
2{{test_random}}1	*/
}),
			["db_framework_odbc/db_framework.c:db_copy_in_query_cb: SQLExecDirect Failed!\nDB_copy_in failed:\n[07002] [Microsoft][SQL Server Native Client 11.0]COUNT field incorrect or syntax error(0)\n"]],
			['ROLLBACK', 'websocket', '', 'ROLLBACK', ['OK']],

			['BEGIN', 'websocket', '', 'BEGIN', ['OK']],
			['DELETE FAIL 17', 'websocket', '',
                // tab between HASH line and data
                ml(function () {/*DELETE	rtesting_table
HASH	id	test_name
	*/
}) + ml(function () {/*
pk	hash
id	hash
2{{test_random}}1
*/}),
			    ["Too many hashes"]
            ],
			['ROLLBACK', 'websocket', '', 'ROLLBACK', ['OK']],

			['BEGIN', 'websocket', '', 'BEGIN', ['OK']],
			['DELETE 1', 'websocket', '', ml(function () {/*DELETE	rtesting_table

pk
id
2{{test_random}}1
*/}),
			    ['Rows Affected\n1\n', 'TRANSACTION COMPLETED']
            ],
			['ROLLBACK', 'websocket', '', 'ROLLBACK', ['OK']],

			['BEGIN', 'websocket', '', 'BEGIN', ['OK']],
			['DELETE 2', 'websocket', '', ml(function () {/*DELETE	rtesting_table

pk
select
asdf
*/}),
			    [
                    'Some of these records have already been deleted.:\n'
                ]
            ],
			['ROLLBACK', 'websocket', '', 'ROLLBACK', ['OK']],

			['BEGIN', 'websocket', '', 'BEGIN', ['OK']],
			['DELETE 3', 'websocket', '', ml(function () {/*DELETE	rtesting_table

pk
id
2{{test_random}}2
2{{test_random}}3
*/}),
			    ['Rows Affected\n2\n', 'TRANSACTION COMPLETED']
			],
			['ROLLBACK', 'websocket', '', 'ROLLBACK', ['OK']],

			['BEGIN', 'websocket', '', 'BEGIN', ['OK']],
			['INSERT RECORDS 2', 'websocket', '', ml(function () {/*INSERT	rtesting_table
RETURN	id	test_name	test_name2
PK	id
SEQ	*/
}) + ml(function () {/*
ORDER BY	id ASC

id	test_name	test_name2
*/
			}) + createTestDataRequest('10', 500), createTestDataResponse('10', 500)],
			['COMMIT', 'websocket', '', 'COMMIT', ['OK']],

			['BEGIN', 'websocket', '', 'BEGIN', ['OK']],
			['DELETE 4', 'websocket', '', ml(function () {/*DELETE	rtesting_table

pk
id
*/}) + createTestDataRequest('10', 500),
			    ['Rows Affected\n500\n', 'TRANSACTION COMPLETED']
			],
			['COMMIT', 'websocket', '', 'COMMIT', ['OK']],

			['SOCKET CLOSE', 'websocket end']
        ]
    },
    ws_file_app: {
        tests: [
			['SOCKET OPEN', 'websocket start'],

			['APP DOWNLOAD FAIL', 'ajax', 404, '/env/app/download/all/test{{test_random1}}.sql', '',
				ml(function () {/*The file you are requesting is not here.*/})],
			['APP UPLOAD FAIL 1', 'ajax', 500, '/env/upload', '',
				ml(function () {/*FATAL
../util/util_request.c:get_sun_upload: Cannot find boundary for request
get_sun_upload failed*/})],
			['APP UPLOAD', 'upload', 200, '/env/upload', '/app/all/test{{test_random1}}.sql',
				ml(function () {/*Upload Succeeded
*/})],
			['APP UPLOAD FAIL 2', 'upload', 500, '/env/upload', '/app/all/test{{test_random1}}.sql',
				ml(function () {/*FATAL
File already exists.*/})],

			['APP DOWNLOAD', 'ajax', 200, '/env/app/download/all/test{{test_random1}}.sql', '',
				'SELECT \'This is \0some\n\n tesr\r\n\r\nt \r\rsql\';'],

			['APP UPLOAD CLEANUP', 'websocket', '', 'FILE	DELETE	/app/all/test{{test_random1}}.sql',
			['OK']],

			['APP FILE LIST', 'websocket', '', 'FILE\tLIST\t/',
				['ANYTHING', 'TRANSACTION COMPLETED']],
			['APP FILE LIST', 'websocket', '', 'FILE\tLIST\t/app',
				['ANYTHING', 'TRANSACTION COMPLETED']],
			['APP FILE LIST', 'websocket', '', 'FILE\tLIST\t/app/',
				['ANYTHING', 'TRANSACTION COMPLETED']],
			['APP FILE WRITE 1', 'websocket', '', 'FILE\tWRITE\t/app/all/test10.txt\t0\nTESTING\n',
				['ANYTHING', 'TRANSACTION COMPLETED']],
			['APP FILE READ TO PREPARE', 'websocket', '', 'FILE\tREAD\t/app/all/test10.txt\n',
				['ANYTHING', 'TRANSACTION COMPLETED']],
			['APP FILE WRITE 1', 'websocket', '', 'FILE\tWRITE\t/app/all/test10.txt\t{{CHANGESTAMP}}\nThis is a test1\n',
				['ANYTHING', 'TRANSACTION COMPLETED']],
			['APP FILE WRITE 2', 'websocket', '', 'FILE\tWRITE\t/app/all/test10.txt\t{{CHANGESTAMP}}\nThis is a test2\n',
				['ANYTHING', 'TRANSACTION COMPLETED']],
			['APP FILE WRITE FAIL 1', 'websocket', '', 'FILE\tWRITE\t/app/all/test10.txt\t{{test_change_stamp2}}\nThis is a test2\n',
				['Someone updated this file before you.']],
			['APP FILE READ TO PREPARE', 'websocket', '', 'FILE\tREAD\t/app/all/test10.txt\n',
				['ANYTHING', 'TRANSACTION COMPLETED']],
			['APP FILE WRITE 3', 'websocket', '', 'FILE\tWRITE\t/app/all/test10.txt\t{{CHANGESTAMP}}\nπππøˆ¨¥†ƒ©√˙∫˚∆¨¥†ƒç©˙∆√˙˚∫∆¨¥ˆ†∂®†®∂¥†®´∑œ£™¢∞§¶•ª¶¥†¶•∞§¢´£¢™§¶§¢•∞‡ﬁ‡´ﬁﬂ‹›Œ„´‰ÁˇÎ¨ÁÏÓ˝ÔÏÇÓ˛˝ÏÎÍ¸‰´ˇÁˇ¨ÁÏˆ˝ØÓ¨ÒÁ¨ˆÁØ‡°ˇ°‰ﬂﬁ´›ﬁ‹€ﬁ„‹†´®ß©≈˙ƒ∆˙©∆˚˚136789864512321\n',
				['ANYTHING', 'TRANSACTION COMPLETED']],
			['APP FILE READ TO PREPARE', 'websocket', '', 'FILE\tREAD\t/app/all/test10.txt\n',
				['ANYTHING', 'TRANSACTION COMPLETED']],
			['APP FILE WRITE FAIL 2', 'websocket', '', 'FILE\tWRITE\t/app/all/test10.txtπ\t{{CHANGESTAMP}}\nThis is a test1\n',
				["../util/util_canonical.c:canonical: all/test10.txtπ is a bad path. Path contains invalid characters.\n\nFailed to get canonical path: >/home/super/Repos/envelope/envelope/app|all/test10.txtπ<"]
			],
			['APP FILE WRITE FAIL 3', 'websocket', '', 'FILE\tWRITE\t/app/all/test10.txt\t',
				["Someone updated this file before you."]],
			['APP FILE WRITE FAIL 4', 'websocket', '', 'FILE\tWRITE\t/app/all/test10.txt',
				["Invalid Request"]],
			['APP FILE WRITE FAIL 5', 'websocket', '', 'FILE\tWRITE\t/app/all/test10.txtπ\tCHANGESTAMP\nThis is a test1\n',
				["../util/util_canonical.c:canonical: all/test10.txtπ is a bad path. Path contains invalid characters.\n\nFailed to get canonical path: >/home/super/Repos/envelope/envelope/app|all/test10.txtπ<"]
			],
			['APP FILE WRITE FAIL 6', 'websocket', '', 'FILE\tWRITE\t/app/all/test10.txtπ\t\'2016-8-8 11:15:46\'\nThis is a test1\n',
				["../util/util_canonical.c:canonical: all/test10.txtπ is a bad path. Path contains invalid characters.\n\nFailed to get canonical path: >/home/super/Repos/envelope/envelope/app|all/test10.txtπ<"]
			],
			['APP FILE WRITE 4', 'websocket', '', 'FILE\tWRITE\t/app/all/test1.txt\t10000000000000\nThis is a test\n',
				['ANYTHING', 'TRANSACTION COMPLETED']],
			['APP FILE WRITE FAIL 8', 'websocket', '', 'FILE\tWRITE\t/app/all/test1.txt 10000000000000\nThis is a test\n',
				["Invalid Request","TRANSACTION COMPLETED"]],
			['APP FILE WRITE 5', 'websocket', '', 'FILE\tWRITE\t/app/all/test1/test.txt\t{{test_change_stamp2}}\nThis is a test\n',
				['ANYTHING', 'TRANSACTION COMPLETED']],
			['APP FILE WRITE 6', 'websocket', '', 'FILE\tWRITE\t/app/all/test1/test2/test.txt\t{{test_change_stamp2}}\nThis is a test\n',
				['ANYTHING', 'TRANSACTION COMPLETED']],
			['APP FILE WRITE 7', 'websocket', '', 'FILE\tWRITE\t/app/all/test3/test.txt\t{{test_change_stamp2}}\nThis is a test\n',
				['ANYTHING', 'TRANSACTION COMPLETED']],
			['APP FILE WRITE 8', 'websocket', '', 'FILE\tWRITE\t/app/all/test1/test2/test2.txt\t{{test_change_stamp2}}\nThis is a test\n',
				['ANYTHING', 'TRANSACTION COMPLETED']],
			['APP FILE READ PREPARE (WRITE 1)', 'websocket', '', 'FILE\tWRITE\t' +
				WS.encodeForTabDelimited('/app/trusted_g/test.txt') + '\t0\n' +
				'This is a test' + ' of the search. (test line #1)' + '\n' +
				'This is a test' + ' of the bran muffin. (test line #2)' + '\n' +
				'This is a test' + ' of the tv. (test line #3)' + '\n' +
				'This is a test' + ' of the envelope. (test line #4)',
				['ANYTHING', 'TRANSACTION COMPLETED']],
			['APP FILE READ PREPARE (WRITE 2)', 'websocket', '', 'FILE\tWRITE\t' +
				WS.encodeForTabDelimited('/app/trusted_g/test2.txt') + '\t0\n' +
				'This is a test' + ' of the search. (test line #1)' + '\n' +
				'This is a test' + ' of the bran muffin. (test line #2)' + '\n' +
				'This is a test' + ' of the tv. (test line #3)' + '\n' +
				'This is a test' + ' of the envelope. (test line #4)',
				['ANYTHING', 'TRANSACTION COMPLETED']],
			['APP FILE READ FAIL 1', 'websocket', '', 'FILE\tREAD\t/appp/all/test10.txt',
				["../common/common_util_sql.c:canonical_full_start: Starting path not recognized.\nInvalid Path"]
			],
			['APP FILE READ FAIL 2', 'websocket', '', 'FILE\tREAD\t/ap/all/test10.txt',

				["../common/common_util_sql.c:canonical_full_start: Starting path not recognized.\nInvalid Path"]
			],
			['APP FILE READ FAIL 3', 'websocket', '', 'FILE\tREAD\t' + WS.encodeForTabDelimited('/role/trusted_g/test.txt > /role/trusted_g/test2.txt'),
				["../util/util_canonical.c:canonical: trusted_g/test.txt > /role\/trusted_g/test2.txt is a bad path. Path contains invalid characters.\n\nFailed to get canonical path: >/home/super/Repos/envelope/envelope/role|trusted_g/test.txt > /role/trusted_g/test2.txt<"]
			],
			['APP FILE READ FAIL 4', 'websocket', '', 'FILE\tREAD\t' + WS.encodeForTabDelimited(''),
				["../common/common_util_sql.c:canonical_full_start: Starting path not recognized.\nInvalid Path"]
			],
			['APP FILE READ FAIL 5', 'websocket', '', 'FILE\tREAD\t' + WS.encodeForTabDelimited('../'),
				["../common/common_util_sql.c:canonical_full_start: Starting path not recognized.\nInvalid Path"]
			],
			['APP FILE READ FAIL 6', 'websocket', '', 'FILE\tREAD\t' + WS.encodeForTabDelimited('π'),
				["../common/common_util_sql.c:canonical_full_start: Starting path not recognized.\nInvalid Path"]
			],
			['APP FILE READ 1', 'websocket', '', 'FILE\tREAD\t/app/all/test10.txt',
				['ANYTHING', 'TRANSACTION COMPLETED']],
			['APP FILE READ 2', 'websocket', '', 'FILE\tREAD\t' + WS.encodeForTabDelimited('/role/trusted_g/test.txt'),
				['ANYTHING', 'TRANSACTION COMPLETED']],
			['APP FILE READ END 1', 'websocket', '', 'FILE\tDELETE\t/app/trusted_g/test.txt',
				['OK', 'TRANSACTION COMPLETED']],
			['APP FILE READ END 2', 'websocket', '', 'FILE\tDELETE\t/app/trusted_g/test2.txt',
				['OK', 'TRANSACTION COMPLETED']],
			['APP FILE MOVE FAIL 1', 'websocket', '', 'FILE\tMOVE\t' +
				WS.encodeForTabDelimited('/test.txt') + '\t' +
				WS.encodeForTabDelimited('/test2.txt') + '\n',
				[
					"../common/common_util_sql.c:canonical_full_start: Starting path not recognized.\nInvalid Path",
					"TRANSACTION COMPLETED"
				]
			],
			['APP FILE MOVE FAIL 2', 'websocket', '', 'FILE\tMOVE\t' +
				WS.encodeForTabDelimited('') + '\t' +
				WS.encodeForTabDelimited('/app/all/test2.txt') + '\n',
				[
					"../common/common_util_sql.c:canonical_full_start: Starting path not recognized.\nInvalid Path",
					"TRANSACTION COMPLETED"
				]
			],
			['APP FILE MOVE FAIL 3', 'websocket', '', 'FILE\tMOVE\t' +
				WS.encodeForTabDelimited('/app/all/test10.txt') + '\t' +
				WS.encodeForTabDelimited('') + '\n',
				[
					"../common/common_util_sql.c:canonical_full_start: Starting path not recognized.\nInvalid Path",
					"TRANSACTION COMPLETED"
				]
			],
			['APP FILE MOVE FAIL 4', 'websocket', '', 'FILE\tMOVE\t' +
				WS.encodeForTabDelimited('/app/all/test10.txt') + '\n',
				["Invalid Request","TRANSACTION COMPLETED"]],
			['APP FILE MOVE FAIL 5', 'websocket', '', 'FILE\tMOVE\t' +
				WS.encodeForTabDelimited('/app/all/test10.txt'),
				["Invalid Request","TRANSACTION COMPLETED"]],
			['APP FILE MOVE FAIL 6', 'websocket', '', 'FILE\tMOVE\t' +
				WS.encodeForTabDelimited('../') + '\t' +
				WS.encodeForTabDelimited('/') + '\n',
				[
					"../common/common_util_sql.c:canonical_full_start: Starting path not recognized.\nInvalid Path",
					"TRANSACTION COMPLETED"
				]
			],
			['APP FILE MOVE FAIL 7', 'websocket', '', 'FILE\tMOVE\t' +
				WS.encodeForTabDelimited('/') + '\t' +
				WS.encodeForTabDelimited('../') + '\n',
				[
					"../common/common_util_sql.c:canonical_full_start: Starting path not recognized.\nInvalid Path",
					"TRANSACTION COMPLETED"
				]
			],
			['APP FILE MOVE FAIL 8', 'websocket', '', 'FILE\tMOVE\t' +
				WS.encodeForTabDelimited('/') + '\t' +
				WS.encodeForTabDelimited('../'),
				[
					"../common/common_util_sql.c:canonical_full_start: Starting path not recognized.\nInvalid Path",
					"TRANSACTION COMPLETED"
				]
			],
			['APP FILE MOVE', 'websocket', '', 'FILE\tMOVE\t/app/all/test10.txt\t/app/all/test2.txt',
				['ANYTHING', 'TRANSACTION COMPLETED']],
			['APP FILE COPY FAIL', 'websocket', '', 'FILE\tCOPY\t/test2.txt\t/app/all/test1.txt',
				['ANYTHING', 'TRANSACTION COMPLETED']],
			['APP FILE COPY', 'websocket', '', 'FILE\tCOPY\t/app/all/test2.txt\t/app/all/test10.txt',
				['ANYTHING', 'TRANSACTION COMPLETED']],
			['APP FILE CREATE_FOLDER FAIL 1', 'websocket', '', 'FILE\tCREATE_FOLDER\t/test/\n',
				["../common/common_util_sql.c:canonical_full_start: Starting path not recognized.\nInvalid Path"]
			],
			['APP FILE CREATE_FOLDER FAIL 2', 'websocket', '', 'FILE\tCREATE_FOLDER\t' + WS.encodeForTabDelimited('/app/trusted_g/test-test--test-test') + '\n',
				["../util/util_canonical.c:canonical: trusted_g/test-test--test-test is a bad path. Path contains invalid characters.\n\nFailed to get canonical path: >/home/super/Repos/envelope/envelope/app|trusted_g/test-test--test-test<"]
			],
			['APP FILE CREATE_FOLDER FAIL 3', 'websocket', '', 'FILE\tCREATE_FOLDER',
				["Invalid Request","TRANSACTION COMPLETED"]],
			['APP FILE CREATE_FOLDER FAIL 4', 'websocket', '', 'FILE\tCREATE_PI',
				["Invalid Request","TRANSACTION COMPLETED"]],
			['APP FILE CREATE_FOLDER FAIL 5', 'websocket', '', 'FILE\tCREATE_FOLDER\t' + WS.encodeForTabDelimited('/app/trusted_g///////') + '\n',
				["../util/util_canonical.c:canonical: trusted_g\\\\\\\\\\\\/ is a bad path. Path contains invalid characters.\n\nFailed to get canonical path: >/home/super/Repos/envelope/envelope/app|trusted_g\\\\\\\\\\\\/<"]
			],
			['APP FILE CREATE_FOLDER FAIL 6', 'websocket', '', 'FILE\tCREATE_FOLDER\t' + WS.encodeForTabDelimited('/role/trusted_g/ > /opt/test') + '\n',
				["../util/util_canonical.c:canonical: trusted_g/ > /opt/test is a bad path. Path contains invalid characters.\n\nFailed to get canonical path: >/home/super/Repos/envelope/envelope/role|trusted_g/ > /opt/test<"]
			],
			['APP FILE CREATE_FOLDER FAIL 7', 'websocket', '', 'FILE\tCREATE_FOLDER\t' + WS.encodeForTabDelimited('/role/trusted_g/ > /opt/test'),
				["../util/util_canonical.c:canonical: trusted_g/ > /opt/test is a bad path. Path contains invalid characters.\n\nFailed to get canonical path: >/home/super/Repos/envelope/envelope/role|trusted_g/ > /opt/test<"]
			],
			['APP FILE CREATE_FOLDER FAIL 8', 'websocket', '', 'FILE\tCREATE_FOLDER\t' + WS.encodeForTabDelimited('/role/trusted_g/π'),
				["../util/util_canonical.c:canonical: trusted_g/π is a bad path. Path contains invalid characters.\n\nFailed to get canonical path: >/home/super/Repos/envelope/envelope/role|trusted_g/π<"]
			],
			['APP FILE CREATE_FOLDER', 'websocket', '', 'FILE\tCREATE_FOLDER\t/app/all/test3/test4/',
				['ANYTHING', 'TRANSACTION COMPLETED']],

			['APP FILE CREATE_FILE FAIL 1', 'websocket', '', 'FILE\tCREATE_FILE\t/test.txt' +
				WS.encodeForTabDelimited('/') + '\t' +
				WS.encodeForTabDelimited('../') + '\n',
				["../common/common_util_sql.c:canonical_full_start: Starting path not recognized.\nInvalid Path"]
			],
			['APP FILE CREATE_FILE FAIL 2', 'websocket', '', 'FILE\tCREATE_FILE',
				["Invalid Request","TRANSACTION COMPLETED"]],
			['APP FILE CREATE_FILE FAIL 3', 'websocket', '', 'FILE\tCREATE_FILE\t',
				["../common/common_util_sql.c:canonical_full_start: Starting path not recognized.\nInvalid Path",]
			],
			['APP FILE CREATE_FILE FAIL 4', 'websocket', '', 'FILE\tCREATE_FILE\n',
				["Invalid Request","TRANSACTION COMPLETED"]],
			['APP FILE CREATE_FILE FAIL 5', 'websocket', '', 'FILE\tCREATE_FILEA\t' +
				WS.encodeForTabDelimited('/app/trusted_g/test.txt'),
				["Unknown FILE request type CREATE_FILEA","TRANSACTION COMPLETED"]],
			['APP FILE CREATE_FILE FAIL 6', 'websocket', '', 'FILE\tCREATE_FILEA\t' +
				WS.encodeForTabDelimited('/app/trusted_g/test.txt') + '\n',
				["Unknown FILE request type CREATE_FILEA","TRANSACTION COMPLETED"]],
			['APP FILE CREATE_FILE', 'websocket', '', 'FILE\tCREATE_FILE\t' +
				WS.encodeForTabDelimited('/app/trusted_g/test.txt') + '\n',
				['ANYTHING', 'TRANSACTION COMPLETED']],
			['APP FILE CREATE_FILE FAIL 7', 'websocket', '', 'FILE\tCREATE_FILE\t' +
				WS.encodeForTabDelimited('/app/trusted_g/test.txt') + '\n',
				["File already exists."]
			],
			['APP FILE CREATE_FILE FAIL 8', 'websocket', '', 'FILE\tCREATE_FILE\t' +
				WS.encodeForTabDelimited('/app/trusted_g/test.txt'),
				["File already exists."]
			],
			['APP FILE CREATE_FILE FAIL 9', 'websocket', '', 'FILE\tCREATE_FILE\t' +
				WS.encodeForTabDelimited('/app/trusted_g/test.π'),
				["../util/util_canonical.c:canonical: trusted_g/test.π is a bad path. Path contains invalid characters.\n\nFailed to get canonical path: >/home/super/Repos/envelope/envelope/app|trusted_g/test.π<"]
			],
			['APP FILE CREATE_FILE', 'websocket', '', 'FILE\tCREATE_FILE\t' +
				WS.encodeForTabDelimited('/app/all/test3.txt'),
				['ANYTHING', 'TRANSACTION COMPLETED']],

			['APP FILE DELETE FAIL 1', 'websocket', '', 'FILE\tDELETE\t/test.txt',
				["../common/common_util_sql.c:canonical_full_start: Starting path not recognized.\nInvalid Path"]
			],
			['APP FILE DELETE FAIL 2', 'websocket', '', 'FILE\tDELETE\t' + WS.encodeForTabDelimited('../'),
				["../common/common_util_sql.c:canonical_full_start: Starting path not recognized.\nInvalid Path"]
			],
			['APP FILE DELETE FAIL 3', 'websocket', '', 'FILE\tDELETE\t' + WS.encodeForTabDelimited('π'),
				["../common/common_util_sql.c:canonical_full_start: Starting path not recognized.\nInvalid Path"]
			],
			['APP FILE DELETE FAIL 4', 'websocket', '', 'FILE\tDELETE',
				["Invalid Request","TRANSACTION COMPLETED"]],
			['APP FILE DELETE FAIL 5', 'websocket', '', 'FILE\tDELETE   ',
				["Invalid Request","TRANSACTION COMPLETED"]],
			['APP FILE DELETE 2', 'websocket', '', 'FILE\tDELETE\t/app/all/test1',
				['OK', 'TRANSACTION COMPLETED']],
			['APP FILE RECURSIVE COPY FAIL', 'websocket', '', 'FILE\tCOPY\t/app/all/test1/',
				['Invalid Request', 'TRANSACTION COMPLETED']],
			['APP FILE RECURSIVE COPY', 'websocket', '', 'FILE\tCOPY\t/app/all/test3/\t/app/all/test5/',
				['ANYTHING', 'TRANSACTION COMPLETED']],
			['APP FILE DELETE 3', 'websocket', '', 'FILE\tDELETE\t/app/all/test3/',
				['OK', 'TRANSACTION COMPLETED']],
			['APP FILE DELETE 4', 'websocket', '', 'FILE\tDELETE\t/app/all/test5/',
				['OK', 'TRANSACTION COMPLETED']],
			['APP FILE DELETE 5', 'websocket', '', 'FILE\tDELETE\t/app/all/test2.txt',
				['OK', 'TRANSACTION COMPLETED']],
			['APP FILE DELETE 6', 'websocket', '', 'FILE\tDELETE\t/app/all/test3.txt',
				['OK', 'TRANSACTION COMPLETED']],
			['APP FILE DELETE 7', 'websocket', '', 'FILE\tDELETE\t/app/all/test1.txt',
				['OK', 'TRANSACTION COMPLETED']],
			['APP FILE SEARCH PREPARE (WRITE 1)', 'websocket', '', 'FILE\tWRITE\t' +
				WS.encodeForTabDelimited('/app/trusted_g/test.txt') + '\t0\n' +
				'This is a test' + ' of the search. (test line #1)' + '\n' +
				'This is a test' + ' of the bran muffin. (test line #2)' + '\n' +
				'This is a test' + ' of the tv. (test line #3)' + '\n' +
				'This is a test' + ' of the envelope. (test line #4)',
				['ANYTHING', 'TRANSACTION COMPLETED']],
			['APP FILE SEARCH PREPARE (WRITE 2)', 'websocket', '', 'FILE\tWRITE\t' +
				WS.encodeForTabDelimited('/app/trusted_g/test/test.txt') + '\t0\n' +
				'This is a test' + ' of the search. (test line #1)' + '\n' +
				'This is a test' + ' of the bran muffin. (test line #2)' + '\n' +
				'This is a test' + ' of the tv. (test line #3)' + '\n' +
				'This is a test' + ' of the envelope. (test line #4)',
				['ANYTHING', 'TRANSACTION COMPLETED']],
			['APP FILE SEARCH FAIL 1', 'websocket', '', 'FILE\tSEARCH\t/ap/\tgs-page > gs-header,\nRECURSIVE\n',
				["../common/common_util_sql.c:canonical_full_start: Starting path not recognized.\nInvalid Path"]
			],
			['APP FILE SEARCH FAIL 2', 'websocket', '', 'FILE\tSEARCH\t/app/nonexisitant/\tgs-page > gs-header,\nRECURSIVE\n',
				["../util/util_canonical.c:canonical: read_dir: /home/super/Repos/envelope/envelope/app/|nonexisitant/ is a bad path. Path does not exist.\n\nFailed to get canonical path: >/home/super/Repos/envelope/envelope/app|nonexisitant/<"]
			],
			['APP FILE SEARCH FAIL 3', 'websocket', '', 'FILE\tSEARCH\t/app/\tThis is a test of the [search|bran|envelope,\nREGEX\n',
				["regcomp failed: 7 (Missing ']')"]],
			['APP FILE SEARCH FAIL 4', 'websocket', '', 'FILE\tSEARCH\t' +
				WS.encodeForTabDelimited('/app/trust_g/') + '\t' +
				WS.encodeForTabDelimited('This....a test' + ' of the search') + '\n' +
				'INSENSITIVE\tREGEX' + '\n',
				["../util/util_canonical.c:canonical: read_dir: /home/super/Repos/envelope/envelope/app/|trust_g/ is a bad path. Path does not exist.\n\nFailed to get canonical path: >/home/super/Repos/envelope/envelope/app|trust_g/<"]
			],
			['APP FILE SEARCH FAIL 5', 'websocket', '', 'FILE\tSEARCH\t' +
				WS.encodeForTabDelimited('../../') + '\t' +
				WS.encodeForTabDelimited('This is a test' + ' of the search') + '\n' +
				'INSENSITIVE' + '\n',
				["../common/common_util_sql.c:canonical_full_start: Starting path not recognized.\nInvalid Path"]
			],
			['APP FILE SEARCH 1', 'websocket', '', 'FILE\tSEARCH\t/app/trusted_g/\tbran muffin\nRECURSIVE\n',
				[
					"/test.txt:2:This is a test" + " of the bran muffin. (test line #2)\n",
					"/test/test.txt:2:This is a test" + " of the bran muffin. (test line #2)\n",
					"TRANSACTION COMPLETED"
				]
			],
			['APP FILE SEARCH 2', 'websocket', '', 'FILE\tSEARCH\t/app/trusted_g/\tBrAn mUfFiN\nINSENSITIVE\n',
				[
					"/test.txt:2:This is a test" + " of the bran muffin. (test line #2)\n",
					"TRANSACTION COMPLETED"
				]
			],
			['APP FILE SEARCH 3', 'websocket', '', 'FILE\tSEARCH\t/app/trusted_g/\tbran muffin\nREGEX\n',
				[
					"/test.txt:2:This is a test" + " of the bran muffin. (test line #2)\n",
					"TRANSACTION COMPLETED"
				]
			],
			['APP FILE SEARCH 4', 'websocket', '', 'FILE\tSEARCH\t' +
				WS.encodeForTabDelimited('/app/') + '\t' +
				WS.encodeForTabDelimited('This is a test of the [search|bran|envelope]') + '\n' +
				'INSENSITIVE\tREGEX\tRECURSIVE' + '\n',
				[
					"/trusted_g/test.txt:1:This is a test" + " of the search. (test line #1)\n",
					"/trusted_g/test.txt:2:This is a test" + " of the bran muffin. (test line #2)\n",
					"/trusted_g/test.txt:4:This is a test" + " of the envelope. (test line #4)",
					"/trusted_g/test/test.txt:1:This is a test" + " of the search. (test line #1)\n",
					"/trusted_g/test/test.txt:2:This is a test" + " of the bran muffin. (test line #2)\n",
					"/trusted_g/test/test.txt:4:This is a test" + " of the envelope. (test line #4)",
					"TRANSACTION COMPLETED"
				]
			],
			['APP FILE SEARCH 5', 'websocket', '', 'FILE\tSEARCH\t' +
				WS.encodeForTabDelimited('/app/trusted_g/') + '\t' +
				WS.encodeForTabDelimited('This is a test of the [search|bran|envelope]') + '\n' +
				'INSENSITIVE\tREGEX' + '\n',
				[
					"/test.txt:1:This is a test" + " of the search. (test line #1)\n",
					"/test.txt:2:This is a test" + " of the bran muffin. (test line #2)\n",
					"/test.txt:4:This is a test" + " of the envelope. (test line #4)",
					"TRANSACTION COMPLETED"
				]
			],
			['APP FILE SEARCH 6', 'websocket', '', 'FILE\tSEARCH\t' +
				WS.encodeForTabDelimited('/app/trusted_g/') + '\t' +
				WS.encodeForTabDelimited('This....a test of the search') + '\n' +
				'INSENSITIVE\tREGEX' + '\n',
				[
					"/test.txt:1:This is a test" + " of the search. (test line #1)\n",
					"TRANSACTION COMPLETED"
				]
			],
			['APP FILE SEARCH 7', 'websocket', '', 'FILE\tSEARCH\t' +
				WS.encodeForTabDelimited('/app/trusted_g/') + '\t' +
				WS.encodeForTabDelimited('This is a test' + ' of the search'),
				[
					"/test.txt:1:This is a test" + " of the search. (test line #1)\n",
					"TRANSACTION COMPLETED"
				]
			],
			['APP FILE SEARCH 8', 'websocket', '', 'FILE\tSEARCH\t' +
				WS.encodeForTabDelimited('/app/trusted_g/') + '\t' +
				WS.encodeForTabDelimited('This....a test' + ' of the search') + '\n' +
				'INSENSITIVE\tREGEX' + '\n',
				[
					"/test.txt:1:This is a test" + " of the search. (test line #1)\n",
					"TRANSACTION COMPLETED"
				]
			],
			['APP FILE SEARCH END', 'websocket', '', 'FILE\tDELETE\t/app/trusted_g/',
				['OK', 'TRANSACTION COMPLETED']],

			['SOCKET CLOSE', 'websocket end']
		]
	},
	ws_file_role: {
		tests: [
		]
	},
	ws_file_web_root: {
		tests: [
		]
	}
};

var role_tests = JSON.parse(JSON.stringify($.tests.ws_file_app.tests));
var i, len = role_tests.length;
for (i = 0; i < len; i++) {
	role_tests[i][0] = role_tests[i][0].replace(/APP/g, 'ROL');
	role_tests[i][3] = role_tests[i][3] ? role_tests[i][3].replace(/app/gi, 'role') : role_tests[i][3];
	if (typeof (role_tests[i][4]) === 'string') {
		role_tests[i][4] = role_tests[i][4].replace(/app/gi, 'role');
	} else if (typeof (role_tests[i][4]) === 'object') {
		var role_i, role_len = role_tests[i][4].length;
		for (role_i = 0; role_i < role_len; role_i++) {
			role_tests[i][4][role_i] = role_tests[i][4][role_i].replace(/app/gi, 'role');
		}
	}
}
console.log('test6');

var web_root_tests = JSON.parse(JSON.stringify($.tests.ws_file_app.tests));
var i, len = web_root_tests.length;
for (i = 0; i < len; i++) {
	web_root_tests[i][0] = web_root_tests[i][0].replace(/APP/g, 'WRT');
	web_root_tests[i][3] = web_root_tests[i][3] ? web_root_tests[i][3].replace('/env/app/download/all', '/download') : web_root_tests[i][3];
	web_root_tests[i][3] = web_root_tests[i][3] ? web_root_tests[i][3].replace(/env\/app\/all\//gi, '') : web_root_tests[i][3];
	web_root_tests[i][3] = web_root_tests[i][3] ? web_root_tests[i][3].replace(/app/gi, 'web_root') : web_root_tests[i][3];
	web_root_tests[i][3] = web_root_tests[i][3] ? web_root_tests[i][3].replace(/all\//gi, '') : web_root_tests[i][3];
	if (typeof (web_root_tests[i][4]) === 'string') {
		web_root_tests[i][4] = web_root_tests[i][4].replace(/env\/app\/all\//gi, '');
		web_root_tests[i][4] = web_root_tests[i][4].replace(/app/gi, 'web_root');
		web_root_tests[i][4] = web_root_tests[i][4].replace(/all\//gi, '');
	} else if (typeof (web_root_tests[i][4]) === 'object') {
		var web_root_i, web_root_len = web_root_tests[i][4].length;
		for (web_root_i = 0; web_root_i < web_root_len; web_root_i++) {
			web_root_tests[i][4][web_root_i] = web_root_tests[i][4][web_root_i].replace(/env\\app\\all\\/gi, '');
			web_root_tests[i][4][web_root_i] = web_root_tests[i][4][web_root_i].replace(/env\/app\/all\//gi, '');
			web_root_tests[i][4][web_root_i] = web_root_tests[i][4][web_root_i].replace(/app/gi, 'web_root');
			web_root_tests[i][4][web_root_i] = web_root_tests[i][4][web_root_i].replace(/all\\/gi, '');
			web_root_tests[i][4][web_root_i] = web_root_tests[i][4][web_root_i].replace(/all\//gi, '');
		}
	}
}
console.log('test7');

$.tests.ws_file_role.tests.push.apply($.tests.ws_file_role.tests, role_tests);
$.tests.ws_file_web_root.tests.push.apply($.tests.ws_file_web_root.tests, web_root_tests);
console.log('test8');

$.ajax('/index.html', '', 'GET', function (data) {
    for (var i = 0, len = $.tests._http_auth.tests.length; i < len; i += 1) {
        if ($.tests._http_auth.tests[i][0] === 'Logout before login *') {
            $.tests._http_auth.tests[i][5] = data;
        }
    }
});
var req = $.ajax('/test.txt?anticache=' + Math.random().toString().substring(2), '', 'GET', function (data) {
    $.if_modified_since_changestamp = req.getResponseHeader('Last-Modified');
});
$.ajax('/env/auth', 'action=login&username=test1&password=456456', 'POST', function (data) {
    $.ajax('/env/app/all/index.html', '', 'GET', function (data) {
        for (var i = 0, len = $.tests.http_file.tests.length; i < len; i += 1) {
            if ($.tests.http_file.tests[i][0] === 'File Read 3' || $.tests.http_file.tests[i][0] === 'File Read 6') {
                $.tests.http_file.tests[i][5] = data;
            }
        }
    });
    $.ajax('/env/action_info', '', 'GET', function (data) {
        for (var i = 0, len = $.tests.http_action.tests.length; i < len; i += 1) {
            if ($.tests.http_action.tests[i][0] === 'action_info') {
                $.tests.http_action.tests[i][5] = data;
            }
        }
    });
});
