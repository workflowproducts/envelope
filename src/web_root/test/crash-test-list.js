function createTestDataRequest(rowPrefix, intCount) {
	var test = rowPrefix + (arguments.length > 2 && arguments[2] === false ? '' : '{{test_random}}') + '{{i}}\ttestset;akldsjf;lkasjdf;kljasjdf;lkasjdfkljdfgl;kjad;flkgjadg\t;alksjdf;lkasjdf;lkasjdf;lkasdjf;laskdjf;laskdjfa;lsdkfja;lskdfj\n', strRet = '';
	for (var i = intCount; i > 0; i -= 1) {
		strRet += test.replace('{{i}}', i.toString());
	}
	return strRet;
}
function createTestDataRequestOneColumn(rowPrefix, intCount) {
	var test = rowPrefix + (arguments.length > 2 && arguments[2] === false ? '' : '{{test_random}}') + '{{i}}\ttestset;akldsjf;lkasjdf;kljasjdf;lkasjdfkljdfgl;kjad;flkgjadg;alksjdf;lkasjdf;lkasjdf;lkasdjf;laskdjf;laskdjfa;lsdkfja;lskdfj\n', strRet = '';
	for (var i = intCount; i > 0; i -= 1) {
		strRet += test.replace('{{i}}', i.toString());
	}
	return strRet;
}
function createTestDataRequestNoId(rowPrefix, intCount) {
	var test = rowPrefix + 'testset;akldsjf;lkasjdf;kljasjdf;lkasjdfkljdfgl;kjad;flkgjadg\t;alksjdf;lkasjdf;lkasjdf;lkasdjf;laskdjf;laskdjfa;lsdkfja;lskdfj\n', strRet = '';
	for (var i = intCount; i > 0; i -= 1) {
		strRet += test;
	}
	return strRet;
}
function createTestDataResponse(rowPrefix, intCount) {
	var test = rowPrefix + (arguments.length > 2 && arguments[2] === false ? '' : '{{test_random}}') + '{{i}}\ttestset;akldsjf;lkasjdf;kljasjdf;lkasjdfkljdfgl;kjad;flkgjadg\t;alksjdf;lkasjdf;lkasjdf;lkasdjf;laskdjf;laskdjfa;lsdkfja;lskdfj\n', arrRet = [], temp = '';
	for (var i = intCount; i > 0; i -= 10) {
		temp = '';
		for (var j = i; j > (i - 10); j -= 1) {
			temp += test.replace('{{i}}', j.toString());
		}
		arrRet.push(temp);
	}
	arrRet.push('TRANSACTION COMPLETED');
	return arrRet;
}
function createTestDataResponseOneColumn(rowPrefix, intCount) {
	var test = rowPrefix + (arguments.length > 2 && arguments[2] === false ? '' : '{{test_random}}') + '{{i}}\ttestset;akldsjf;lkasjdf;kljasjdf;lkasjdfkljdfgl;kjad;flkgjadg;alksjdf;lkasjdf;lkasjdf;lkasdjf;laskdjf;laskdjfa;lsdkfja;lskdfj\n', arrRet = [], temp = '';
	for (var i = intCount; i > 0; i -= 10) {
		temp = '';
		for (var j = i; j > (i - 10); j -= 1) {
			temp += test.replace('{{i}}', j.toString());
		}
		arrRet.push(temp);
	}
	arrRet.push('TRANSACTION COMPLETED');
	return arrRet;
}
function createTestDataResponseWithStart(rowPrefix, intCount, intStart) {
	var test = rowPrefix + '{{i}}\ttestset;akldsjf;lkasjdf;kljasjdf;lkasjdfkljdfgl;kjad;flkgjadg\t;alksjdf;lkasjdf;lkasjdf;lkasdjf;laskdjf;laskdjfa;lsdkfja;lskdfj\n', arrRet = [], temp = '';
	for (var i = intCount + (intStart - 1); i > intStart; i -= 10) {
		temp = '';
		for (var j = i; j > (i - 10); j -= 1) {
			temp += test.replace('{{i}}', j.toString());
		}
		arrRet.push(temp);
	}
	arrRet.push('TRANSACTION COMPLETED');
	return arrRet;
}

$.tests = {
	crash: {
		tests: [
            // http_auth.c
			['Login Fail 1', 'ajax', 500, '/env/auth', '',
				ml(function () {/*FATAL
Not a valid action.*/ })] // http_auth
            , ['Login Fail 2', 'ajax', 500, '/env/auth', 'action=login&username=doesntexist&password=password',
				ml(function () {/*FATAL
Connect failed: FATAL:  password authentication failed for user "doesntexist"
*/ })] // http_auth_login_step2/http_auth_login_step15
			, ['Login Fail 3', 'ajax', 403, '/env/auth', 'action=login&username=envelopeuser&password=envelopeuserpassword',
				'{"stat": false, "dat": "You must login as a member of the group \'envelope_g\' to use Envelope"}'] // http_auth_login_step3
			, ['Logout before login *', 'ajax spam', 200, '/env/auth', 'action=logout', ''] // http_auth
			, ['Login', 'ajax', 200, '/env/auth', 'action=login&username=postgres&password=password',
				'{"stat": true, "dat": "2fa required"}'] // http_auth_login_step3
			, ['Login 2FA Fail', 'ajax', 500, '/env/auth', 'action=2fa&token=postgresasdf1234',
				'FATAL\nToken does not match'] // http_auth
			, ['Login 2FA', 'ajax', 200, '/env/auth', 'action=2fa&token=postgres1234',
				'{"stat": true, "dat": "/env/app/all/index.html"}'] // http_auth
			, ['Change Password', 'ajax', 200, '/env/auth', 'action=change_pw&password_old=password&password_new=test1',
				ml(function () {/*{"stat": true, "dat": "OK"}*/})] // http_auth_change_pw_step3
			, ['Change Password Fail', 'ajax', 500, '/env/auth', 'action=change_pw&password_old=test&password_new=test',
				ml(function () {/*FATAL
Old password does not match.*/})] // http_auth_change_pw_step2
			, ['Change Password', 'ajax', 200, '/env/auth', 'action=change_pw&password_old=test1&password_new=password',
				ml(function () {/*{"stat": true, "dat": "OK"}*/})] // http_auth_change_pw_step3

            // TODO: set-user test coverage


            // NC testing (common_auth.c
			, ['Login NC', 'ajax', 200, '/env/authnc', 'action=login',
				'{"stat": true, "dat": "/env/app/all/index.html"}']

			, ['ACCEPTNC', 'ajax', 200, '/env/public.acceptnc_testing', 'testingnitset', 'testingnitset']
			, ['ACTIONNC', 'ajax', 200, '/env/public.actionnc_testing', 'testingnitset', '{"stat":true, "dat": "testingnitset"}']

            // http_file.c
			, ['Login', 'ajax', 200, '/env/auth', 'action=login&username=test_user&password=password',
				'{"stat": true, "dat": "2fa required"}'] // http_auth_login_step3
			, ['Login 2FA', 'ajax', 200, '/env/auth', 'action=2fa&token=test_user1234',
				'{"stat": true, "dat": "/env/app/all/index.html"}'] // http_auth
            , ['File Read Fail 1', 'ajax', 404, '/test200.txt', '',
                ml(function () {/*The file you are requesting is not here.*/
                })] // http_file
            , ['File Read Fail 2', 'ajax', 403, '/env/role/thisgroupdoesntexist_g/test200.txt', '',
                "FATAL\nYou don't have the necessary permissions for this folder."] // http_file_step15_envelope
            , ['File Read If-Modified-Since', 'ajax', 304, '/test.txt?if_modified_since=true', '',
                ml(function () {/**/
                })] // http_file_step2
            , ['File Read 1', 'ajax', 200, '/test.txt', '',
                ml(function () {/*πππøˆ¨¥†ƒ©√˙∫˚∆¨¥†ƒç©˙∆√˙˚∫∆¨¥ˆ†∂®†®∂¥†®´∑œ£™¢∞§¶•ª¶¥†¶•∞§¢´£¢™§¶§¢•∞‡ﬁ‡´ﬁﬂ‹›Œ„´‰ÁˇÎ¨ÁÏÓ˝ÔÏÇÓ˛˝ÏÎÍ¸‰´ˇÁˇ¨ÁÏˆ˝ØÓ¨ÒÁ¨ˆÁØ‡°ˇ°‰ﬂﬁ´›ﬁ‹€ﬁ„‹†´®ß©≈˙ƒ∆˙©∆˚˚136789864512321
*/
                })] // http_file_step3

            // http_accept.c
			, ['Login', 'ajax', 200, '/env/auth', 'action=login&username=postgres&password=password',
				'{"stat": true, "dat": "2fa required"}'] // http_auth_login_step3
			, ['Login 2FA', 'ajax', 200, '/env/auth', 'action=2fa&token=postgres1234',
				'{"stat": true, "dat": "/env/app/all/index.html"}'] // http_auth
			, ['ACCEPT FAIL 1', 'ajax', 500, '/env/public.accept_testing;', 'testingnitset', ml(function () {/*FATAL
common_util_sql.c:query_is_safe: SQL Injection detected!
SQL Injection detected*/})] // http_accept
			, ['ACCEPT FAIL 2', 'ajax', 500, '/env/public.accept_testing1', 'testingnitset', ml(function () {/*FATAL
DB_exec failed:
FATAL
error_text	ERROR:  function public.accept_testing1(unknown) does not exist\nLINE 1: SELECT public.accept_testing1('testingnitset');\n               ^\nHINT:  No function matches the given name and argument types. You might need to add explicit type casts.\n
error_detail	*/ }) + ml(function () {/*
error_hint	No function matches the given name and argument types. You might need to add explicit type casts.
error_query	*/ }) + ml(function () {/*
error_context	*/ }) + ml(function () {/*
error_position	8
*/ })]
			, ['ACCEPT 1', 'ajax', 200, '/env/public.accept_testing', 'testingnitset', 'testingnitset'] // http_accept_step2
			, ['ACCEPT 2', 'ajax', 500, '/env/public.accept_testing_return_null', '', "FATAL\nFunction returned null:\nFATAL\nerror_text\t\nerror_detail\t\nerror_hint\t\nerror_query\t\nerror_context\t\nerror_position\t\n"]
			, ['ACCEPT 3', 'ajax', 200, '/env/public.accept_testing/test', 'testingnitset', 'testingnitset&path=/test'] // http_accept_step2 + some extra http_action stuff

            // http_action.c
			, ['ACTION FAIL 1', 'ajax', 500, '/env/public.action_testing;', 'testingnitset', ml(function () {/*FATAL
common_util_sql.c:query_is_safe: SQL Injection detected!
SQL Injection detected*/})] // http_action
			, ['ACTION FAIL 2', 'ajax', 500, '/env/public.action_testing1', 'testingnitset', ml(function () {/*FATAL
DB_exec failed, res->status == 5:
FATAL
error_text	ERROR:  function public.action_testing1(unknown) does not exist\nLINE 1: SELECT public.action_testing1('testingnitset');\n               ^\nHINT:  No function matches the given name and argument types. You might need to add explicit type casts.\n
error_detail	*/ }) + ml(function () {/*
error_hint	No function matches the given name and argument types. You might need to add explicit type casts.
error_query	*/ }) + ml(function () {/*
error_context	*/ }) + ml(function () {/*
error_position	8
*/ })] // http_action_step2
			, ['ACTION 1', 'ajax', 200, '/env/public.action_testing', 'testingnitset', '{"stat":true, "dat": "testingnitset"}'] // http_action_step2
			, ['ACTION 2', 'ajax', 200, '/env/public.action_testing_return_null', 'testingnitset', '{"stat":true, "dat": null}'] // http_action_step2

            // http_cgi.c
			, ['CGI FAIL 1', 'ajax', 500, '/env/public.cgi_testing;', 'testingnitset', ml(function () {/*FATAL
common_util_sql.c:query_is_safe: SQL Injection detected!
SQL Injection detected*/})] // http_cgi
			, ['CGI FAIL 2', 'ajax', 500, '/env/public.cgi_testing1', 'testingnitset', ml(function () {/*FATAL
DB_exec failed:
FATAL
error_text	ERROR:  function public.cgi_testing1(unknown) does not exist\nLINE 1: SELECT public.cgi_testing1('POST /env/public.cgi_testing1 HT...\n               ^\nHINT:  No function matches the given name and argument types. You might need to add explicit type casts.\n
error_detail	*/ }) + ml(function () {/*
error_hint	No function matches the given name and argument types. You might need to add explicit type casts.
error_query	*/ }) + ml(function () {/*
error_context	*/ }) + ml(function () {/*
error_position	8
*/ })] // http_cgi_step2
			, ['CGI', 'ajax', 200, '/env/public.cgi_testing', 'testingnitset', 'testingnitset'] // http_cgi_step2

            // http_select.c
			, ['DELETE', 'ajax', 200, '/env/action_delete', 'src=rtesting_table&id=-100', '{"stat": true, "dat": ""}']
			, ['INSERT', 'ajax', 200, '/env/action_insert', 'src=rtesting_table&data=' + encodeURIComponent('id=-100&test_name=askdjfhaksdjhf'), '{"stat": true, "dat": {"lastval": -100}}']
			, ['SELECT FAIL 1', 'ajax', 500, '/env/action_select', 'where=id%3D-100', 'FATAL\nFailed to get table name from query'] // http_select_step1
			, ['SELECT FAIL 2', 'ajax', 500, '/env/action_select', 'src=rtesting_table&where=id;%3D-100', 'FATAL\ncommon_util_sql.c:query_is_safe: SQL Injection detected!\nSQL Injection detected'] // http_select_step1
			, ['SELECT FAIL 3', 'ajax', 500, '/env/action_select', 'src=rtesting_table&where=id%3D-10]0', 
                ml(function () {/*FATAL
../db_framework_pq/db_framework.c:DB_get_column_types_for_query2: DB_get_column_types_for_query failed
Query failed:
FATAL
error_text	ERROR:  syntax error at or near "]"\nLINE 3: WHERE id=-10]0\n                    ^\n
error_detail	
error_hint	
error_query	
error_context	
error_position	100
*/})] // http_select_step2
			, ['SELECT FAIL 4', 'ajax', 500, '/env/action_select', 'src=rtesting_table&where=id%3D-100 AND public.raise_exception(\'test\') = \'test\'',
                ml(function () {/*FATAL
DB_exec failed:
FATAL
error_text	ERROR:  test\n
error_detail	
error_hint	
error_query	
error_context	
error_position	
*/})] // http_select_step3
			, ['SELECT', 'ajax', 200, '/env/action_select', 'src=rtesting_table&where=id%3D-100',
                '{"stat": true, "dat": {"arr_column": ["id","test_name","test_name2","select","test@test"], "dat": [[-100,"askdjfhaksdjhf",null,null,null]], "row_count": 1}}'] // http_select_step4
			

            // http_update.c
            , ['UPDATE FAIL 1', 'ajax', 500, '/env/action_update', 'where=id%3D-100&column=test_name&value=testingnitset', 'FATAL\nFailed to get table name from query'] // http_update_step1
            , ['UPDATE FAIL 2', 'ajax', 500, '/env/action_update', 'src=rtesting_table_doesnt_existwhere=id%3D-100&column=test_name&value=testingnitset',
                ml(function () {/*FATAL
../db_framework_pq/db_framework.c:DB_get_column_types_for_query2: DB_get_column_types_for_query failed
Query failed:
FATAL
error_text	ERROR:  syntax error at or near "="\nLINE 1: ..."test_name", * FROM rtesting_table_doesnt_existwhere=id=-100\n                                                               ^\n
error_detail	
error_hint	
error_query	
error_context	
error_position	60
*/})] // http_update_step2
            , ['UPDATE FAIL 3', 'ajax', 500, '/env/action_update', 'src=rtesting_table&where=id%3D-100 AND public.raise_exception(\'test\') = \'test\'&column=test_name&value=testingnitset',
                ml(function () {/*FATAL
Query failed:
FATAL
error_text	ERROR:  invalid input syntax for integer: "-100 AND public.raise_exception('test') = 'test'"\nLINE 1: ...FROM rtesting_table WHERE id IS NOT DISTINCT FROM '-100 AND ...\n                                                             ^\n
error_detail	
error_hint	
error_query	
error_context	
error_position	67
*/})] // http_update_step3
            , ['UPDATE FAIL 4', 'ajax', 500, '/env/action_update', 'src=rtesting_table&where=id%3D-100&column=test_name&value=testingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitset',
                ml(function () {/*FATAL
Query failed:
FATAL
error_text	ERROR:  value too long for type character varying(150)\n
error_detail	
error_hint	
error_query	
error_context	
error_position	
*/})]  // http_update_step4
            , ['UPDATE', 'ajax', 200, '/env/action_update', 'src=rtesting_table&where=id%3D-100&column=test_name&value=testingnitset', '{"stat": true, "dat": ["-100","testingnitset",null,null,null]}'] // http_update_step4

            // http_insert.c
			, ['DELETE', 'ajax', 200, '/env/action_delete', 'src=rtesting_table&id=-100', '{"stat": true, "dat": ""}']
			, ['INSERT FAIL 1', 'ajax', 500, '/env/action_insert', 'data=' + encodeURIComponent('id=-100&test_name=askdjfhaksdjhf'), 'FATAL\nFailed to get table name from query'] // http_insert_step1
			, ['INSERT FAIL 2', 'ajax', 500, '/env/action_insert', 'src=rtesting_table;%3D-100&data=' + encodeURIComponent('id=-100&test_name=askdjfhaksdjhf'), 'FATAL\ncommon_util_sql.c:query_is_safe: SQL Injection detected!\nSQL Injection detected:\n'] // http_insert_step2
			, ['INSERT FAIL 3', 'ajax', 500, '/env/action_insert', 'src=rtesting_table_doesnt_exist&data=' + encodeURIComponent('id=-100&test_name=askdjfhaksdjhf'),
                ml(function () {/*FATAL
../db_framework_pq/db_framework.c:DB_get_column_types_for_query2: DB_get_column_types_for_query failed
Query failed:
FATAL
error_text	ERROR:  relation "rtesting_table_doesnt_exist" does not exist\nLINE 2:    FROM rtesting_table_doesnt_exist;\n                ^\n
error_detail	
error_hint	
error_query	
error_context	
error_position	29
*/})] // http_insert_step3
			, ['INSERT FAIL 4', 'ajax', 500, '/env/action_insert', 'src=rtesting_table&data=' + encodeURIComponent('id=-100&test_name=testingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitset'),
                ml(function () {/*FATAL
DB_exec failed:
FATAL
error_text	ERROR:  value too long for type character varying(150)\n
error_detail	
error_hint	
error_query	
error_context	
error_position	
*/})] // http_insert_step4
			, ['INSERT FAIL 5', 'ajax', 500, '/env/action_insert', 'src=rtesting_table&data=' + encodeURIComponent('test_name=askdjfhaksdjhf'),
                ml(function () {/*FATAL
DB_exec failed:
FATAL
error_text	ERROR:  lastval is not yet defined in this session\n
error_detail	
error_hint	
error_query	
error_context	
error_position	
*/})] // http_insert_step5
			, ['INSERT', 'ajax', 200, '/env/action_insert', 'src=rtesting_table&data=' + encodeURIComponent('id=-100&test_name=askdjfhaksdjhf'), '{"stat": true, "dat": {"lastval": -100}}'] // http_insert_step6



			, ['DELETE FAIL 1', 'ajax', 500, '/env/action_delete', 'id=-100', 'FATAL\nFailed to get table name from query'] // http_delete_step1
			, ['DELETE FAIL 2', 'ajax', 500, '/env/action_delete', 'src=rtesting_table;&id=-100', 'FATAL\ncommon_util_sql.c:query_is_safe: SQL Injection detected!\nSQL Injection detected:\n'] // http_delete_step2
			, ['DELETE FAIL 3', 'ajax', 500, '/env/action_delete', 'src=rtesting_table_doesnt_exist&id=-100',
                ml(function () {/*FATAL
DB_exec failed:
FATAL
error_text	ERROR:  relation "rtesting_table_doesnt_exist" does not exist\nLINE 1: DELETE FROM rtesting_table_doesnt_exist WHERE id IN (-100);\n                    ^\n
error_detail	
error_hint	
error_query	
error_context	
error_position	13
*/})] // http_delete_step3
			, ['DELETE', 'ajax', 200, '/env/action_delete', 'src=rtesting_table&id=-100', '{"stat": true, "dat": ""}']
			, ['action_info', 'ajax', 200, '/env/action_info', '', '']

            // ws_action.c
			, ['SOCKET OPEN', 'websocket start']
			, ['ACTION FAIL 1', 'websocket', '', ml(function () {/*ACTION	public	actiont_testing1	testingnitset
*/}), ["Invalid action name, action function names must begin with \"action_\" or \"actionnc_\""]] // ws_action_step1
			, ['ACTION FAIL 2', 'websocket', '', ml(function () {/*ACTION	actiont_testing1	testingnitset
*/}), ["Invalid action name, action function names must begin with \"action_\" or \"actionnc_\""]] // ws_action_step1
			, ['ACTION FAIL 1', 'websocket', '', ml(function () {/*ACTION	public	action_testing1	testingnitset
*/}), [ml(function(){/*FATAL
error_text	ERROR:  function public.action_testing1(unknown) does not exist\nLINE 1: COPY (SELECT "public"."action_testing1"('testingnitset')) TOrtesting_table. You might need to add explicit type casts.\n
error_detail	
error_hint	No function matches the given name and argument types. You might need to add explicit type casts.
error_query	
error_context	
error_position	14
*/})]] // ws_copy_check_cb
			, ['ACTION', 'websocket', '', ml(function () {/*ACTION	public	action_testing	testingnitset
*/}), ["\"testingnitset\"\n", "TRANSACTION COMPLETED"]] // ws_copy_check_cb
			, ['ACTION', 'websocket', '', ml(function () {/*ACTION	public	action_delete_rows	1{{test_random}}
*/}), ["\"\"\n", "TRANSACTION COMPLETED"]] // ws_copy_check_cb
			, ['ACTION', 'websocket', '', ml(function () {/*ACTION	public	action_delete_rows	2{{test_random}}
*/}), ["\"\"\n", "TRANSACTION COMPLETED"]] // ws_copy_check_cb
			, ['ACTION', 'websocket', '', ml(function () {/*ACTION	public	action_delete_rows	3{{test_random}}
*/}), ["\"\"\n", "TRANSACTION COMPLETED"]] // ws_copy_check_cb

			, ['INFO', 'websocket', '', ml(function () {/*INFO
*/}), ["ANYTHING", "TRANSACTION COMPLETED"]]

            // ws_select.c
			, ['SELECT FAIL 1', 'websocket', '', ml(function () {/*SELECT
RETURN	*

ORDER BY	LIMIT
1 ASC	10
*/}), ["common_util_sql.c:get_table_name: Invalid request\nQuery failed:\nFATAL\nerror_detail\tERROR: Failed to get table name from query.\n"]] // ws_select_step1
			, ['SELECT FAIL 2', 'websocket', '', ml(function () {/*SELECT	rtesting_table_doesnt_exist
RETURN	*

ORDER BY	LIMIT
1 ASC	10
*/}), [ml(function () {/*../db_framework_pq/db_framework.c:DB_get_column_types_for_query2: DB_get_column_types_for_query failed
Query failed:
FATAL
error_text	ERROR:  relation "rtesting_table_doesnt_exist" does not exist\nLINE 2:    FROM (SELECT * FROM "rtesting_table_doesnt_exist") rtesting_table
error_detail	
error_hint	
error_query	
error_context	
error_position	33
*/})]] // ws_select_step2
			, ['SELECT FAIL 3', 'websocket', '', ml(function () {/*SELECT	pg_database
RETURN	datname	datistemplate

WHERE	ORDER BY	LIMIT
public.raise_exception('test') = 'test'	1 ASC	10
*/}), ["datname\tdatistemplate\nname\tboolean\n",ml(function () {/*FATAL
error_text	ERROR:  test\n
error_detail	
error_hint	
error_query	
error_context	
error_position	
*/})]] // ws_copy_check_cb
			, ['SELECT 1', 'websocket', '', ml(function () {/*SELECT	pg_database
RETURN	datname	datistemplate

ORDER BY	LIMIT
datname ASC	10
*/}), ["datname\tdatistemplate\nname\tboolean\n","postgres\tf\ntemplate0\tt\ntemplate1\tt\n","TRANSACTION COMPLETED"]] // ws_copy_check_cb

            // cancel test (common_client.c)
			, ['BEGIN', 'websocket', '', 'BEGIN', ['OK']]
			, ['INSERT RECORDS', 'websocket', '', ml(function () {/*INSERT	rtesting_table
RETURN	id	test_name	test_name2
PK	id
SEQ	*/
}) + ml(function () {/*
ORDER BY	id DESC

id	test_name	test_name2
*/
			}) + createTestDataRequest('9{{test_random1}}', 5000, false), createTestDataResponse('9{{test_random1}}', 5000, false)]
			, ['CANCEL SELECT', 'websocket cancel', '', ml(function () {/*SELECT	public	rtesting_table
RETURN	*

WHERE	ORDER BY
id::text ILIKE '9{{test_random1}}%'	id DESC
*/
			})]
			, ['ROLLBACK', 'websocket', '', 'ROLLBACK', ['OK']]

			, ['BEGIN', 'websocket', '', 'BEGIN', ['OK']]
			, ['INSERT RECORDS 1', 'websocket', '', ml(function () {/*INSERT	rtesting_table
RETURN	id
PK	id
SEQ	*/
}) + ml(function () {/*
ORDER BY	id ASC

id	test_name
1{{test_random}}1	Bob
1{{test_random}}2	Alice
*/}),
			['1{{test_random}}1\n1{{test_random}}2\n', 'TRANSACTION COMPLETED']]
			, ['COMMIT', 'websocket', '', 'COMMIT', ['OK']]

			, ['BEGIN', 'websocket', '', 'BEGIN', ['OK']]
			, ['INSERT RECORDS 2', 'websocket', '', ml(function () {/*INSERT	rtesting_table2
RETURN	id
PK	id
SEQ	*/
}) + ml(function () {/*
ORDER BY	id ASC

id	test_name
1{{test_random}}1	Bob{{test_random}}
1{{test_random}}2	Alice{{test_random}}
*/}),
			['1{{test_random}}1\n1{{test_random}}2\n', 'TRANSACTION COMPLETED']]
			, ['COMMIT', 'websocket', '', 'COMMIT', ['OK']]

            // ws_update.c
			, ['BEGIN', 'websocket', '', 'BEGIN', ['OK']]
			, ['UPDATE FAIL 1', 'websocket', '', ml(function () {/*UPDATE	rtesting_table

pk	set
id	test_name
1{{test_random}}1	Bobby
1{{test_random}}2	Alicia
*/}), ["common_util_sql.c:get_return_columns: strstr failed\nFailed to get return columns from query"]] // ws_update_step1
			, ['COMMIT', 'websocket', '', 'COMMIT', ['OK']]
			, ['BEGIN', 'websocket', '', 'BEGIN', ['OK']]
			, ['UPDATE FAIL 2', 'websocket', '', ml(function () {/*UPDATE	rtesting_table
RETURN	id	test_name22

pk	set
id	test_name22
1{{test_random}}1	Bobby
1{{test_random}}2	Alicia
*/}), [ml(function () {/*DB_exec failed:
FATAL
error_text	ERROR:  column "test_name22" does not exist\nLINE 1: rtesting_table...\n                                                             ^\nHINT:  Perhaps you meant to reference the column "rtesting_table.test_name2".\n
error_detail	
error_hint	Perhaps you meant to reference the column "rtesting_table.test_name2".
error_query	
error_context	
error_position	73
*/})]] // ws_update_step2
			, ['COMMIT', 'websocket', '', 'COMMIT', ['OK']]
			, ['BEGIN', 'websocket', '', 'BEGIN', ['OK']]
			, ['UPDATE FAIL 3', 'websocket', '', ml(function () {/*UPDATE	rtesting_table
RETURN	id	test_name
ORDER BY	id ASC


pk	set
id	test_name
1{{test_random}}1	testingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitset
1{{test_random}}2	Alicia
*/}), [ml(function () {/*DB_exec failed:
FATAL
error_text	ERROR:  value too long for type character varying(150)\nCONTEXT:  COPY rtesting_table..."
error_position	
*/})]] // ws_update_step3
			, ['COMMIT', 'websocket', '', 'COMMIT', ['OK']]
			, ['BEGIN', 'websocket', '', 'BEGIN', ['OK']]
			, ['UPDATE FAIL 4', 'websocket', '', ml(function () {/*UPDATE	rtesting_table
RETURN	id	test_name
HASH	id	test_name22

pk	set	hash
id	test_name	hash
1{{test_random}}1	Bobby	Bobby
1{{test_random}}2	Alicia	Alicia
*/}), [ml(function () {/*DB_exec failed:
FATAL
error_text	ERROR:  column "test_name22" does not exist\nLINE 1: rtesting_table...\n                                                             ^\nHINT:  Perhaps you meant to reference the column "rtesting_table.test_name2".\n
error_detail	
error_hint	Perhaps you meant to reference the column "rtesting_table.test_name2".
error_query	
error_context	
error_position	219
*/})]] // ws_update_step4
			, ['COMMIT', 'websocket', '', 'COMMIT', ['OK']]
			, ['BEGIN', 'websocket', '', 'BEGIN', ['OK']]
			, ['UPDATE FAIL 5', 'websocket', '', ml(function () {/*UPDATE	rtesting_table2
RETURN	id	test_name

set	pk
id	test_name
1{{test_random}}1	Bob{{test_random}}
1{{test_random}}1	Alice{{test_random}}
*/}), [ml(function () {/*DB_exec failed:
FATAL
error_text	ERROR:  duplicate key value violates unique constraint "rtesting_table2_pk"\nDETAIL:  Key (id)=(1{{test_random}}1) already exists.\n
error_detail	Key (id)=(1{{test_random}}1) already exists.
error_hint	
error_query	
error_context	
error_position	
*/})]] // ws_update_step5
			, ['COMMIT', 'websocket', '', 'COMMIT', ['OK']]
			, ['BEGIN', 'websocket', '', 'BEGIN', ['OK']]
			, ['UPDATE', 'websocket', '', ml(function () {/*UPDATE	rtesting_table
RETURN	id	test_name
ORDER BY	id ASC


pk	set
id	test_name
1{{test_random}}1	Bobby
1{{test_random}}2	Alicia
*/}), ["1{{test_random}}1	Bobby\n1{{test_random}}2	Alicia\n", "TRANSACTION COMPLETED"]] // ws_copy_check_cb
			, ['COMMIT', 'websocket', '', 'COMMIT', ['OK']]

            // ws_insert.c
			, ['BEGIN', 'websocket', '', 'BEGIN', ['OK']]
			, ['INSERT FAIL 1', 'websocket', '', ml(function () {/*INSERT
RETURN	id	test_name
PK	id
SEQ	id

id	test_name
{{test_random}}1	Bob
{{test_random}}2	Alice
{{test_random}}3	Eve
*/}), [ml(function () {/*common_util_sql.c:get_table_name: Invalid request
Query failed:
FATAL
error_detail	ERROR: Failed to get table name from query.
*/})]] // ws_insert_step1
			, ['ROLLBACK', 'websocket', '', 'ROLLBACK', ['OK']]

			, ['BEGIN', 'websocket', '', 'BEGIN', ['OK']]
			, ['INSERT FAIL 2', 'websocket', '', ml(function () {/*INSERT	rtesting_table_doesnt_exist
RETURN	id	test_name
PK	id
SEQ	id

id	test_name
{{test_random}}1	Bob
{{test_random}}2	Alice
{{test_random}}3	Eve
*/}), [ml(function () {/*DB_exec failed:
FATAL
error_text	ERROR:  relation "rtesting_table_doesnt_exist" does not exist\nLINE 2: SELECT "id","test_name" FROM "rtesting_table_doesnt_exist" L...\n                                     ^\n
error_detail	
error_hint	
error_query	
error_context	
error_position	78
*/})]] // ws_insert_step2
			, ['ROLLBACK', 'websocket', '', 'ROLLBACK', ['OK']]

			, ['BEGIN', 'websocket', '', 'BEGIN', ['OK']]
			, ['INSERT FAIL 3', 'websocket', '', ml(function () {/*INSERT	rtesting_table
RETURN	id	test_name
PK	id
SEQ	id

id	test_name
{{test_random}}1	testingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitset
{{test_random}}2	Alice
{{test_random}}3	Eve
*/}), [ml(function () {/*DB_exec failed:
FATAL
error_text	ERROR:  value too long for type character varying(150)\nCONTEXT:  COPY rtesting_table..."
error_position	
*/})]] // ws_insert_step3
			, ['ROLLBACK', 'websocket', '', 'ROLLBACK', ['OK']]

// 			, ['BEGIN', 'websocket', '', 'BEGIN', ['OK']]
// 			, ['INSERT FAIL 4', 'websocket', '', ml(function () {/*INSERT	rtesting_table
// RETURN	id	test_name
// PK	id
// SEQ	id

// id	test_name
// {{test_random}}1	Bob
// {{test_random}}2	Alice
// {{test_random}}3	Eve
// */}), [ml(function () {/*DB_exec failed:
// FATAL
// error_text	ERROR:  value too long for type character varying(150)\nCONTEXT:  COPY rtesting_table..."
// error_position	
// */})]] // ws_insert_step4
// 			, ['ROLLBACK', 'websocket', '', 'ROLLBACK', ['OK']]

// 			, ['BEGIN', 'websocket', '', 'BEGIN', ['OK']]
// 			, ['INSERT FAIL 5', 'websocket', '', ml(function () {/*INSERT	rtesting_table
// RETURN	id	test_name
// PK	id
// SEQ	id

// id	test_name
// {{test_random}}1	testingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitset
// {{test_random}}2	Alice
// {{test_random}}3	Eve
// */}), [ml(function () {/*DB_exec failed:
// FATAL
// error_text	ERROR:  value too long for type character varying(150)\nCONTEXT:  COPY rtesting_table..."
// error_position	
// */})]] // ws_insert_view_step1
// 			, ['ROLLBACK', 'websocket', '', 'ROLLBACK', ['OK']]

// 			, ['BEGIN', 'websocket', '', 'BEGIN', ['OK']]
// 			, ['INSERT FAIL 6', 'websocket', '', ml(function () {/*INSERT	rtesting_table
// RETURN	id	test_name
// PK	id
// SEQ	id

// id	test_name
// {{test_random}}1	testingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitset
// {{test_random}}2	Alice
// {{test_random}}3	Eve
// */}), [ml(function () {/*DB_exec failed:
// FATAL
// error_text	ERROR:  value too long for type character varying(150)\nCONTEXT:  COPY rtesting_table..."
// error_position	
// */})]] // ws_insert_view_step2
// 			, ['ROLLBACK', 'websocket', '', 'ROLLBACK', ['OK']]

            // ws_insert_view_step1
            // ws_insert_view_step2
            // ws_insert_view_step3
            // ws_insert_view_step4
            // ws_insert_table_step1
            // ws_insert_table_step2
            // ws_insert_table_step3

            // ws_delete.c
			, ['BEGIN', 'websocket', '', 'BEGIN', ['OK']]
			, ['DELETE FAIL 1', 'websocket', '', ml(function () {/*DELETE
pk
id
1{{test_random}}1
1{{test_random}}2
*/}), [ml(function () {/*common_util_sql.c:get_table_name: Invalid request
Query failed:
FATAL
error_detail	ERROR: Failed to get table name from query.
*/})]] // ws_delete_step1
			, ['ROLLBACK', 'websocket', '', 'ROLLBACK', ['OK']]

			, ['BEGIN', 'websocket', '', 'BEGIN', ['OK']]
			, ['DELETE FAIL 2', 'websocket', '', ml(function () {/*DELETE	rtesting_table_doesnt_exist
pk
id
1{{test_random}}1
1{{test_random}}2
*/}), [ml(function () {/*DB_exec failed:
FATAL
error_text	ERROR:  relation "rtesting_table_doesnt_exist" does not exist\nLINE 1: rtesting_table...\n                                                             ^\n
error_detail	
error_hint	
error_query	
error_context	
error_position	77
*/})]] // ws_delete_step2
			, ['ROLLBACK', 'websocket', '', 'ROLLBACK', ['OK']]

			, ['BEGIN', 'websocket', '', 'BEGIN', ['OK']]
			, ['DELETE FAIL 3', 'websocket', '', ml(function () {/*DELETE	rtesting_table
pk
test_name
testingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitsettestingnitset
*/}), [ml(function () {/*DB_copy_in failed:
FATAL
error_text	ERROR:  value too long for type character varying(150)\nCONTEXT:  COPY rtesting_table..."
error_position	
*/})]] // ws_delete_step3
			, ['ROLLBACK', 'websocket', '', 'ROLLBACK', ['OK']]

			, ['BEGIN', 'websocket', '', 'BEGIN', ['OK']]
			, ['DELETE FAIL 4', 'websocket', '', ml(function () {/*DELETE	rtesting_table
HASH	test_name

pk	hash
id	hash
1{{test_random}}1	hash
1{{test_random}}2	hash
*/}), [ml(function () {/*Someone updated this record before you.:
FATAL
error_text	
error_detail	
error_hint	
error_query	
error_context	
error_position	
*/})]] // ws_delete_step4
			, ['ROLLBACK', 'websocket', '', 'ROLLBACK', ['OK']]

			, ['BEGIN', 'websocket', '', 'BEGIN', ['OK']]
			, ['DELETE FAIL 5', 'websocket', '', ml(function () {/*DELETE	ttesting_view
pk
id
1{{test_random}}1
1{{test_random}}2
*/}), [ml(function () {/*DB_exec failed:
FATAL
error_text	ERROR:  cannot delete from view "ttesting_view"\nDETAIL:  Views that do not select from a single table or view are not automatically updatable.\nHINT:  To enable deleting from the view, provide an INSTEAD OF DELETE trigger or an unconditional ON DELETE DO INSTEAD rule.\n
error_detail	Views that do not select from a single table or view are not automatically updatable.
error_hint	To enable deleting from the view, provide an INSTEAD OF DELETE trigger or an unconditional ON DELETE DO INSTEAD rule.
error_query	
error_context	
error_position	
*/})]] // ws_delete_step5
			, ['ROLLBACK', 'websocket', '', 'ROLLBACK', ['OK']]

			, ['BEGIN', 'websocket', '', 'BEGIN', ['OK']]
			, ['DELETE', 'websocket', '', ml(function () {/*DELETE	rtesting_table
pk
id
1{{test_random}}1
1{{test_random}}2
*/}), [ml(function () {/*Rows Affected
2
*/}), "TRANSACTION COMPLETED"]] // ws_delete_step5
			, ['ROLLBACK', 'websocket', '', 'ROLLBACK', ['OK']]

            // ws_file.c
			, ['SOCKET CLOSE', 'websocket end']
			, ['Login', 'ajax', 200, '/env/auth', 'action=login&username=test_user&password=password',
				'{"stat": true, "dat": "2fa required"}'] // http_auth_login_step3
			, ['Login 2FA', 'ajax', 200, '/env/auth', 'action=2fa&token=test_user1234',
				'{"stat": true, "dat": "/env/app/all/index.html"}'] // http_auth
			, ['SOCKET OPEN', 'websocket start']
			, ['APP FILE FAIL', 'websocket', '', 'FILE\tLISTS\t/',
				[ml(function () {/*Unknown FILE request type LISTS*/})]] // ws_file_step1
			, ['APP FILE LIST FAIL 1', 'websocket', '', 'FILE\tLIST\t/app/all/index.html',
				[ml(function () {/*util_canonical.c:canonical: read_dir: /home/super/Repos/envelope/src/app/|all/index.html is a bad path. Path is not a folder.

Failed to get canonical path: >/home/super/Repos/envelope/src/app|all/index.html<*/})]] // ws_file_step1
			, ['APP FILE LIST FAIL 2', 'websocket', '', 'FILE\tLIST\t/role/thisgroupdoesntexist_g/',
				[ml(function () {/*You don't have the necessary permissions for this folder.*/})]] // ws_file_list_step2
			, ['APP FILE LIST', 'websocket', '', 'FILE\tLIST\t/role/all/',
				[ml(function () {/*test.txt	file
test10.txt	file
*/}), "TRANSACTION COMPLETED"]] // ws_file_list_step2

			, ['APP FILE READ FAIL 1', 'websocket', '', 'FILE\tREAD\t/role/all/testasdf',
				[ml(function () {/*util_canonical.c:canonical: read_file: /home/super/Repos/envelope/src/role/|all/testasdf is a bad path. Path does not exist.

Failed to get canonical path: >/home/super/Repos/envelope/src/role|all/testasdf<*/})]] // ws_file_step1
			, ['APP FILE READ FAIL 2', 'websocket', '', 'FILE\tREAD\t/role/thisgroupdoesntexist_g/test',
				[ml(function () {/*You don't have the necessary permissions for this folder.*/})]] // ws_file_read_step2
			// ws_file_read_step3
			// ws_file_read_step4
			, ['APP FILE READ', 'websocket', '', 'FILE\tREAD\t/role/all/test.txt',
				["ANYTHING", "TRANSACTION COMPLETED"]] // ws_file_read_step4

			, ['APP FILE WRITE FAIL 1', 'websocket', '', 'FILE\tWRITE\t/role/all/\t0\nasdfasdf',
				[ml(function () {/*util_canonical.c:canonical: /home/super/Repos/envelope/src/role|all/ is a bad path. Path is not a file.

Failed to get canonical path: >/home/super/Repos/envelope/src/role|all/<*/})]] // ws_file_step1
			, ['APP FILE WRITE FAIL 2', 'websocket', '', 'FILE\tWRITE\t/role/thisgroupdoesntexist_g/test\t0\nasdfasdf',
				[ml(function () {/*You don't have the necessary permissions for this folder.*/})]] // ws_file_write_step2
			// ws_file_write_step3
			// ws_file_write_step4
			, ['APP FILE WRITE', 'websocket', '', 'FILE\tWRITE\t/role/all/test.txt\t0\nπππøˆ¨¥†ƒ©√˙∫˚∆¨¥†ƒç©˙∆√˙˚∫∆¨¥ˆ†∂®†®∂¥†®´∑œ£™¢∞§¶•ª¶¥†¶•∞§¢´£¢™§¶§¢•∞‡ﬁ‡´ﬁﬂ‹›Œ„´‰ÁˇÎ¨ÁÏÓ˝ÔÏÇÓ˛˝ÏÎÍ¸‰´ˇÁˇ¨ÁÏˆ˝ØÓ¨ÒÁ¨ˆÁØ‡°ˇ°‰ﬂﬁ´›ﬁ‹€ﬁ„‹†´®ß©≈˙ƒ∆˙©∆˚˚136789864512321\n',
				["ANYTHING", "TRANSACTION COMPLETED"]] // ws_file_write_step2

			// ws_file_move_step2
			// ws_file_move_step3
			// ws_file_copy_step4
			// ws_file_copy_step5

			, ['APP FILE DELETE FAIL 1', 'websocket', '', 'FILE\tDELETE\t/role/all/asdf/asdf/a +$sdf/',
				[ml(function () {/*util_canonical.c:canonical: all/asdf/asdf/a +$sdf/ is a bad path. Path contains invalid characters.

Failed to get canonical path: >/home/super/Repos/envelope/src/role|all/asdf/asdf/a +$sdf/<*/})]] // ws_file_step1
			, ['APP FILE DELETE FAIL 2', 'websocket', '', 'FILE\tDELETE\t/role/all/asdf/asdf/asdf/',
				[ml(function () {/*util_canonical.c:canonical: read_dir: /home/super/Repos/envelope/src/role/|all/asdf/asdf/asdf/ is a bad path. Path does not exist.

canonical failed*/})]] // ws_file_delete_step2
			, ['APP FILE WRITE', 'websocket', '', 'FILE\tWRITE\t/role/all/test/test.txt\t0\nπππøˆ¨¥†ƒ©√˙∫˚∆¨¥†ƒç©˙∆√˙˚∫∆¨¥ˆ†∂®†®∂¥†®´∑œ£™¢∞§¶•ª¶¥†¶•∞§¢´£¢™§¶§¢•∞‡ﬁ‡´ﬁﬂ‹›Œ„´‰ÁˇÎ¨ÁÏÓ˝ÔÏÇÓ˛˝ÏÎÍ¸‰´ˇÁˇ¨ÁÏˆ˝ØÓ¨ÒÁ¨ˆÁØ‡°ˇ°‰ﬂﬁ´›ﬁ‹€ﬁ„‹†´®ß©≈˙ƒ∆˙©∆˚˚136789864512321\n',
				["ANYTHING", "TRANSACTION COMPLETED"]] // ws_file_write_step2
			, ['APP FILE DELETE', 'websocket', '', 'FILE\tDELETE\t/role/all/test/',
				["OK", "TRANSACTION COMPLETED"]] // ws_file_delete_step4

			// ws_file_delete_step3
			// ws_file_delete_step4

			// ws_file_create_step2
			, ['APP FILE CREATE_FOLDER FAIL 1', 'websocket', '', 'FILE\tCREATE_FOLDER\t/role/all/tes +$t/\n',
				[ml(function () {/*util_canonical.c:canonical: all/tes +$t/ is a bad path. Path contains invalid characters.

Failed to get canonical path: >/home/super/Repos/envelope/src/role|all/tes +$t/<*/}), "TRANSACTION COMPLETED"]] // ws_file_step1
			, ['APP FILE CREATE_FOLDER FAIL 2', 'websocket', '', 'FILE\tCREATE_FOLDER\t/role/all/\n',
				[ml(function () {/*util_canonical.c:canonical: create_dir: /home/super/Repos/envelope/src/role/|all/ is a bad path. Path already exists.

canonical failed*/}), "TRANSACTION COMPLETED"]] // ws_file_create_step2
			, ['APP FILE CREATE_FOLDER', 'websocket', '', 'FILE\tCREATE_FOLDER\t/role/all/test/\n',
				["ANYTHING", "TRANSACTION COMPLETED"]] // ws_file_create_step2
			, ['APP FILE CREATE_FILE FAIL 1', 'websocket', '', 'FILE\tCREATE_FILE\t/role/all/tes +$t/test.txt\n',
				[ml(function () {/*util_canonical.c:canonical: all/tes +$t/test.txt is a bad path. Path contains invalid characters.

Failed to get canonical path: >/home/super/Repos/envelope/src/role|all/tes +$t/test.txt<*/}), "TRANSACTION COMPLETED"]] // ws_file_step1
			, ['APP FILE CREATE_FILE', 'websocket', '', 'FILE\tCREATE_FILE\t/role/all/test/test.txt\n',
				["ANYTHING", "TRANSACTION COMPLETED"]] // ws_file_write_step2
			, ['APP FILE DELETE', 'websocket', '', 'FILE\tDELETE\t/role/all/test/',
				["OK", "TRANSACTION COMPLETED"]] // ws_file_delete_step4

			// ws_file_search_step2
			// ws_file_search_step3
			// ws_file_search_step4
			// ws_file_search_step5

			, ['SOCKET CLOSE', 'websocket end']
			// , ['Login', 'ajax', 200, '/env/auth', 'action=login&username=postgres&password=password',
			// 	'{"stat": true, "dat": "2fa required"}'] // http_auth_login_step3
			// , ['Login 2FA', 'ajax', 200, '/env/auth', 'action=2fa&token=postgres1234',
			// 	'{"stat": true, "dat": "/env/app/all/index.html"}'] // http_auth
			// , ['SOCKET OPEN', 'websocket start']
			// , ['SOCKET CLOSE', 'websocket end']

         ]
    }, crash_old: {
		tests: [
			['SOCKET OPEN', 'websocket start'],

			['APP DOWNLOAD FAIL', 'ajax', 404, '/env/app/download/all/test{{test_random1}}.sql', 'asdf',
				ml(function () {/*The file you are requesting is not here.*/})],
			['APP UPLOAD FAIL 1', 'ajax', 500, '/env/upload', '',
                "FATAL\nutil_request.c:get_sun_upload: boundary is null\nget_sun_upload failed"],
			['APP UPLOAD', 'upload', 200, '/env/upload', '/app/all/test{{test_random1}}.sql',
				ml(function () {/*Upload Succeeded
*/})],
			['APP UPLOAD FAIL 2', 'upload', 500, '/env/upload', '/app/all/test{{test_random1}}.sql',
				ml(function () {/*FATAL
File already exists.*/})],

			['APP DOWNLOAD', 'ajax', 200, '/env/app/download/all/test{{test_random1}}.sql', '',
            binaryArray
        ],

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
				["util_canonical.c:canonical: all/test10.txtπ is a bad path. Path contains invalid characters.\n\nFailed to get canonical path: >/home/super/Repos/envelope/src/app|all/test10.txtπ<"]
			],
			['APP FILE WRITE FAIL 3', 'websocket', '', 'FILE\tWRITE\t/app/all/test10.txt\t',
				["Someone updated this file before you."]],
			['APP FILE WRITE FAIL 4', 'websocket', '', 'FILE\tWRITE\t/app/all/test10.txt',
				["Invalid Request"]],
			['APP FILE WRITE FAIL 5', 'websocket', '', 'FILE\tWRITE\t/app/all/test10.txtπ\tCHANGESTAMP\nThis is a test1\n',
				["util_canonical.c:canonical: all/test10.txtπ is a bad path. Path contains invalid characters.\n\nFailed to get canonical path: >/home/super/Repos/envelope/src/app|all/test10.txtπ<"]
			],
			['APP FILE WRITE FAIL 6', 'websocket', '', 'FILE\tWRITE\t/app/all/test10.txtπ\t\'2016-8-8 11:15:46\'\nThis is a test1\n',
				["util_canonical.c:canonical: all/test10.txtπ is a bad path. Path contains invalid characters.\n\nFailed to get canonical path: >/home/super/Repos/envelope/src/app|all/test10.txtπ<"]
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
				["common_util_sql.c:canonical_full_start: Starting path not recognized.\nInvalid Path"]
			],
			['APP FILE READ FAIL 2', 'websocket', '', 'FILE\tREAD\t/ap/all/test10.txt',

				["common_util_sql.c:canonical_full_start: Starting path not recognized.\nInvalid Path"]
			],
			['APP FILE READ FAIL 3', 'websocket', '', 'FILE\tREAD\t' + WS.encodeForTabDelimited('/role/trusted_g/test.txt > /role/trusted_g/test2.txt'),
				["util_canonical.c:canonical: trusted_g/test.txt > /role\/trusted_g/test2.txt is a bad path. Path contains invalid characters.\n\nFailed to get canonical path: >/home/super/Repos/envelope/src/role|trusted_g/test.txt > /role/trusted_g/test2.txt<"]
			],
			['APP FILE READ FAIL 4', 'websocket', '', 'FILE\tREAD\t' + WS.encodeForTabDelimited(''),
				["common_util_sql.c:canonical_full_start: Starting path not recognized.\nInvalid Path"]
			],
			['APP FILE READ FAIL 5', 'websocket', '', 'FILE\tREAD\t' + WS.encodeForTabDelimited('../'),
				["common_util_sql.c:canonical_full_start: Starting path not recognized.\nInvalid Path"]
			],
			['APP FILE READ FAIL 6', 'websocket', '', 'FILE\tREAD\t' + WS.encodeForTabDelimited('π'),
				["common_util_sql.c:canonical_full_start: Starting path not recognized.\nInvalid Path"]
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
					"common_util_sql.c:canonical_full_start: Starting path not recognized.\nInvalid Path",
					"TRANSACTION COMPLETED"
				]
			],
			['APP FILE MOVE FAIL 2', 'websocket', '', 'FILE\tMOVE\t' +
				WS.encodeForTabDelimited('') + '\t' +
				WS.encodeForTabDelimited('/app/all/test2.txt') + '\n',
				[
					"common_util_sql.c:canonical_full_start: Starting path not recognized.\nInvalid Path",
					"TRANSACTION COMPLETED"
				]
			],
			['APP FILE MOVE FAIL 3', 'websocket', '', 'FILE\tMOVE\t' +
				WS.encodeForTabDelimited('/app/all/test10.txt') + '\t' +
				WS.encodeForTabDelimited('') + '\n',
				[
					"common_util_sql.c:canonical_full_start: Starting path not recognized.\nInvalid Path",
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
					"common_util_sql.c:canonical_full_start: Starting path not recognized.\nInvalid Path",
					"TRANSACTION COMPLETED"
				]
			],
			['APP FILE MOVE FAIL 7', 'websocket', '', 'FILE\tMOVE\t' +
				WS.encodeForTabDelimited('/') + '\t' +
				WS.encodeForTabDelimited('../') + '\n',
				[
					"common_util_sql.c:canonical_full_start: Starting path not recognized.\nInvalid Path",
					"TRANSACTION COMPLETED"
				]
			],
			['APP FILE MOVE FAIL 8', 'websocket', '', 'FILE\tMOVE\t' +
				WS.encodeForTabDelimited('/') + '\t' +
				WS.encodeForTabDelimited('../'),
				[
					"common_util_sql.c:canonical_full_start: Starting path not recognized.\nInvalid Path",
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
				["common_util_sql.c:canonical_full_start: Starting path not recognized.\nInvalid Path"]
			],
			['APP FILE CREATE_FOLDER FAIL 2', 'websocket', '', 'FILE\tCREATE_FOLDER\t' + WS.encodeForTabDelimited('/app/trusted_g/test-test--test-test') + '\n',
				["util_canonical.c:canonical: trusted_g/test-test--test-test is a bad path. Path contains invalid characters.\n\nFailed to get canonical path: >/home/super/Repos/envelope/src/app|trusted_g/test-test--test-test<"]
			],
			['APP FILE CREATE_FOLDER FAIL 3', 'websocket', '', 'FILE\tCREATE_FOLDER',
				["Invalid Request","TRANSACTION COMPLETED"]],
			['APP FILE CREATE_FOLDER FAIL 4', 'websocket', '', 'FILE\tCREATE_PI',
				["Invalid Request","TRANSACTION COMPLETED"]],
			['APP FILE CREATE_FOLDER FAIL 5', 'websocket', '', 'FILE\tCREATE_FOLDER\t' + WS.encodeForTabDelimited('/app/trusted_g///////') + '\n',
				["util_canonical.c:canonical: trusted_g\\\\\\\\\\\\/ is a bad path. Path contains invalid characters.\n\nFailed to get canonical path: >/home/super/Repos/envelope/src/app|trusted_g\\\\\\\\\\\\/<"]
			],
			['APP FILE CREATE_FOLDER FAIL 6', 'websocket', '', 'FILE\tCREATE_FOLDER\t' + WS.encodeForTabDelimited('/role/trusted_g/ > /opt/test') + '\n',
				["util_canonical.c:canonical: trusted_g/ > /opt/test is a bad path. Path contains invalid characters.\n\nFailed to get canonical path: >/home/super/Repos/envelope/src/role|trusted_g/ > /opt/test<"]
			],
			['APP FILE CREATE_FOLDER FAIL 7', 'websocket', '', 'FILE\tCREATE_FOLDER\t' + WS.encodeForTabDelimited('/role/trusted_g/ > /opt/test'),
				["util_canonical.c:canonical: trusted_g/ > /opt/test is a bad path. Path contains invalid characters.\n\nFailed to get canonical path: >/home/super/Repos/envelope/src/role|trusted_g/ > /opt/test<"]
			],
			['APP FILE CREATE_FOLDER FAIL 8', 'websocket', '', 'FILE\tCREATE_FOLDER\t' + WS.encodeForTabDelimited('/role/trusted_g/π'),
				["util_canonical.c:canonical: trusted_g/π is a bad path. Path contains invalid characters.\n\nFailed to get canonical path: >/home/super/Repos/envelope/src/role|trusted_g/π<"]
			],
			['APP FILE CREATE_FOLDER', 'websocket', '', 'FILE\tCREATE_FOLDER\t/app/all/test3/test4/',
				['ANYTHING', 'TRANSACTION COMPLETED']],

			['APP FILE CREATE_FILE FAIL 1', 'websocket', '', 'FILE\tCREATE_FILE\t/test.txt' +
				WS.encodeForTabDelimited('/') + '\t' +
				WS.encodeForTabDelimited('../') + '\n',
				["common_util_sql.c:canonical_full_start: Starting path not recognized.\nInvalid Path"]
			],
			['APP FILE CREATE_FILE FAIL 2', 'websocket', '', 'FILE\tCREATE_FILE',
				["Invalid Request","TRANSACTION COMPLETED"]],
			['APP FILE CREATE_FILE FAIL 3', 'websocket', '', 'FILE\tCREATE_FILE\t',
				["common_util_sql.c:canonical_full_start: Starting path not recognized.\nInvalid Path",]
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
				["util_canonical.c:canonical: trusted_g/test.π is a bad path. Path contains invalid characters.\n\nFailed to get canonical path: >/home/super/Repos/envelope/src/app|trusted_g/test.π<"]
			],
			['APP FILE CREATE_FILE', 'websocket', '', 'FILE\tCREATE_FILE\t' +
				WS.encodeForTabDelimited('/app/all/test3.txt'),
				['ANYTHING', 'TRANSACTION COMPLETED']],

			['APP FILE DELETE FAIL 1', 'websocket', '', 'FILE\tDELETE\t/test.txt',
				["common_util_sql.c:canonical_full_start: Starting path not recognized.\nInvalid Path"]
			],
			['APP FILE DELETE FAIL 2', 'websocket', '', 'FILE\tDELETE\t' + WS.encodeForTabDelimited('../'),
				["common_util_sql.c:canonical_full_start: Starting path not recognized.\nInvalid Path"]
			],
			['APP FILE DELETE FAIL 3', 'websocket', '', 'FILE\tDELETE\t' + WS.encodeForTabDelimited('π'),
				["common_util_sql.c:canonical_full_start: Starting path not recognized.\nInvalid Path"]
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
				["common_util_sql.c:canonical_full_start: Starting path not recognized.\nInvalid Path"]
			],
			['APP FILE SEARCH FAIL 2', 'websocket', '', 'FILE\tSEARCH\t/app/nonexisitant/\tgs-page > gs-header,\nRECURSIVE\n',
				["util_canonical.c:canonical: read_dir: /home/super/Repos/envelope/src/app/|nonexisitant/ is a bad path. Path does not exist.\n\nFailed to get canonical path: >/home/super/Repos/envelope/src/app|nonexisitant/<"]
			],
			['APP FILE SEARCH FAIL 3', 'websocket', '', 'FILE\tSEARCH\t/app/\tThis is a test of the [search|bran|envelope,\nREGEX\n',
				["regcomp failed: 7 (Missing ']')"]],
			['APP FILE SEARCH FAIL 4', 'websocket', '', 'FILE\tSEARCH\t' +
				WS.encodeForTabDelimited('/app/trust_g/') + '\t' +
				WS.encodeForTabDelimited('This....a test' + ' of the search') + '\n' +
				'INSENSITIVE\tREGEX' + '\n',
				["util_canonical.c:canonical: read_dir: /home/super/Repos/envelope/src/app/|trust_g/ is a bad path. Path does not exist.\n\nFailed to get canonical path: >/home/super/Repos/envelope/src/app|trust_g/<"]
			],
			['APP FILE SEARCH FAIL 5', 'websocket', '', 'FILE\tSEARCH\t' +
				WS.encodeForTabDelimited('../../') + '\t' +
				WS.encodeForTabDelimited('This is a test' + ' of the search') + '\n' +
				'INSENSITIVE' + '\n',
				["common_util_sql.c:canonical_full_start: Starting path not recognized.\nInvalid Path"]
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

			['SOCKET CLOSE', 'websocket end'],


			['SOCKET OPEN', 'websocket start'],
			['BEGIN', 'websocket', '', 'BEGIN', ['OK']],
			['INSERT FAIL 1', 'websocket', '', ml(function () {/*INSERT	rtesting_table
RETURN	id	test_name
PK	id
SEQ	id

id	test_name
{{test_random}}1	Bob
{{test_random}}2	Alice
{{test_random}}3	Eve
*/
			}),
			["DB_exec failed:\nFATAL\nerror_text\tERROR:  relation \"id\" does not exist\\nLINE 1: SELECT nextval('id')\\n                       ^\\n\nerror_detail\t\nerror_hint\t\nerror_query\t\nerror_context\t\nerror_position\t16\n"]],
			['ROLLBACK', 'websocket', '', 'ROLLBACK', ['OK']],

			['BEGIN', 'websocket', '', 'BEGIN', ['OK']],
			['INSERT FAIL 2', 'websocket', '', ml(function () {/*INSERT	ttesting_view
RETURN	id	test_name
PK	id
SEQ

id	test_name
{{test_random}}1	Bob
{{test_random}}2	Alice
{{test_random}}3	Eve
*/
			}),
			["DB_exec failed:\nFATAL\nerror_text\tERROR:  cannot insert into view \"ttesting_view\"\\nDETAIL:  Views that do not select from a single table or view are not automatically updatable.\\nHINT:  To enable inserting into the view, provide an INSTEAD OF INSERT trigger or an unconditional ON INSERT DO INSTEAD rule.\\n\nerror_detail\tViews that do not select from a single table or view are not automatically updatable.\nerror_hint\tTo enable inserting into the view, provide an INSTEAD OF INSERT trigger or an unconditional ON INSERT DO INSTEAD rule.\nerror_query\t\nerror_context\t\nerror_position\t\n"]],
			['ROLLBACK', 'websocket', '', 'ROLLBACK', ['OK']],

			['BEGIN', 'websocket', '', 'BEGIN', ['OK']],
			['INSERT FAIL 3', 'websocket', '', ml(function () {/*INSERTRETURN	id	test_name
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
			['INSERT FAIL 4', 'websocket', '', ml(function () {/*INSERT	*/ }) + ml(function () {/*
RETURN	id	test_name
PK	id
SEQ	id

id	test_name
{{test_random}}1	Bob
{{test_random}}2	Alice
{{test_random}}3	Eve
*/
			}),
			["DB_exec failed:\nFATAL\nerror_text\tERROR:  zero-length delimited identifier at or near \"\"\"\"\\nLINE 2: SELECT \"id\",\"test_name\" FROM \"\" LIMIT 0;\\n                                     ^\\n\nerror_detail\t\nerror_hint\t\nerror_query\t\nerror_context\t\nerror_position\t78\n"]],
			['ROLLBACK', 'websocket', '', 'ROLLBACK', ['OK']],

			['BEGIN', 'websocket', '', 'BEGIN', ['OK']],
			['INSERT FAIL 5', 'websocket', '', ml(function () {/*INSERT
RETURN	id	test_name
PK	id
SEQ	id

id	test_name
{{test_random}}1	Bob
{{test_random}}2	Alice
{{test_random}}3	Eve
*/
			}),
			["common_util_sql.c:get_table_name: Invalid request\nQuery failed:\nFATAL\nerror_detail\tERROR: Failed to get table name from query.\n", "common_util_sql.c:get_table_name: Invalid request\nQuery failed:\nFATAL\nerror_detail\tERROR: Failed to get table name from query.\n"]],
			['ROLLBACK', 'websocket', '', 'ROLLBACK', ['OK']],

			['BEGIN', 'websocket', '', 'BEGIN', ['OK']],
			['INSERT FAIL 6', 'websocket', '', ml(function () {/*INSERT	rtesting_table
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
			["FATAL\nerror_text\tERROR:  zero-length delimited identifier at or near \"\"\"\"\\nLINE 1: COPY (SELECT \"rtesting_table\".\"\" FROM (SELECT \"rtesting_tabl...\\n                                      ^\\n\nerror_detail\t\nerror_hint\t\nerror_query\t\nerror_context\t\nerror_position\t31\n"]],
			['ROLLBACK', 'websocket', '', 'ROLLBACK', ['OK']],

			['BEGIN', 'websocket', '', 'BEGIN', ['OK']],
			['INSERT FAIL 7', 'websocket', '', ml(function () {/*INSERT	rtesting_table
RETURN
PK	id
SEQ

id	test_name
{{test_random}}1	Bob
{{test_random}}2	Alice
{{test_random}}3	Eve
*/
			}),
			["common_util_sql.c:get_return_columns: strstr failed\nFailed to get return columns from query"]],
			['ROLLBACK', 'websocket', '', 'ROLLBACK', ['OK']],

			['BEGIN', 'websocket', '', 'BEGIN', ['OK']],
			['INSERT FAIL 8', 'websocket', '', ml(function () {/*INSERT	rtesting_table
PK	id
SEQ

id	test_name
{{test_random}}1	Bob
{{test_random}}2	Alice
{{test_random}}3	Eve
*/
			}),
			["common_util_sql.c:get_return_columns: strstr failed\nFailed to get return columns from query"]],
			['ROLLBACK', 'websocket', '', 'ROLLBACK', ['OK']],

			['BEGIN', 'websocket', '', 'BEGIN', ['OK']],
			['INSERT FAIL 9', 'websocket', '', ml(function () {/*INSERT	rtesting_table
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
			['INSERT FAIL 10', 'websocket', '', ml(function () {/*INSERT	rtesting_table
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
			['INSERT FAIL 11', 'websocket', '', ml(function () {/*INSERT	rtesting_table
RETURN	test_name
PK	id
SEQ

*/
			}),
			["No column names"]],
			['ROLLBACK', 'websocket', '', 'ROLLBACK', ['OK']],

			['BEGIN', 'websocket', '', 'BEGIN', ['OK']],
			['INSERT FAIL 12', 'websocket', '', ml(function () {/*INSERT	rtesting_table
RETURN	test_name
PK	id
SEQ

id	test_name
*/
			}),
			["No insert data:\nFATAL\nerror_text\t\nerror_detail\t\nerror_hint\t\nerror_query\t\nerror_context\t\nerror_position\t\n"]],
			['ROLLBACK', 'websocket', '', 'ROLLBACK', ['OK']],

			['BEGIN', 'websocket', '', 'BEGIN', ['OK']],
			['INSERT FAIL 13', 'websocket', '', ml(function () {/*INSERT	rtesting_table
RETURN	test_name
PK	id
SEQ

id	test_name*/
			}),
			["No insert data"]],
			['ROLLBACK', 'websocket', '', 'ROLLBACK', ['OK']],

			['BEGIN', 'websocket', '', 'BEGIN', ['OK']],
			['INSERT FAIL 14', 'websocket', '', ml(function () {/*INSERT	rtesting_table
RETURN	test_name
PK	id
SEQ

iπd	test_name
2	rest*/
			}),
			["DB_exec failed:\nFATAL\nerror_text\tERROR:  column \"iπd\" does not exist\\nLINE 2: SELECT \"iπd\",\"test_name\" FROM \"rtesting_table\" LIMIT 0;\\n               ^\\nHINT:  Perhaps you meant to reference the column \"rtesting_table.id\".\\n\nerror_detail\t\nerror_hint\tPerhaps you meant to reference the column \"rtesting_table.id\".\nerror_query\t\nerror_context\t\nerror_position\t56\n"]],
			['ROLLBACK', 'websocket', '', 'ROLLBACK', ['OK']],

			['BEGIN', 'websocket', '', 'BEGIN', ['OK']],
			['INSERT FAIL 15', 'websocket', '', new Blob([ml(function () {/*INSERT	rtesting_table
RETURN	test_name
PK	id
SEQ

iπd	test_name
{{test_random}}2	rest*/
			})]),
            ["DB_exec failed:\nFATAL\nerror_text\tERROR:  column \"iπd\" does not exist\\nLINE 2: SELECT \"iπd\",\"test_name\" FROM \"rtesting_table\" LIMIT 0;\\n               ^\\nHINT:  Perhaps you meant to reference the column \"rtesting_table.id\".\\n\nerror_detail\t\nerror_hint\tPerhaps you meant to reference the column \"rtesting_table.id\".\nerror_query\t\nerror_context\t\nerror_position\t56\n"]],
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
			['COMMIT', 'websocket', '', 'COMMIT', ['OK']],

			['BEGIN', 'websocket', '', 'BEGIN', ['OK']],
			[
                'INSERT 3',
                'websocket',
                '',
                ml(function () {/*INSERT	rtesting_table
RETURN	id	test@test
PK	id
SEQ	*/
}) + ml(function () {/*
ORDER BY	id ASC

id	test@test
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
			[
                'INSERT 4',
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
			[
                'INSERT 5',
                'websocket',
                '',
                ml(function () {/*INSERT	ttesting_view2
RETURN	id_1	test_name_1
PK	id_1
SEQ

id_1	test_name_1
{{test_random}}73	Bob
*/
                }),
			    [
                    '{{test_random}}73\tBob\n',
                    'TRANSACTION COMPLETED'
			    ]
			],
			['COMMIT', 'websocket', '', 'COMMIT', ['OK']],

			['BEGIN', 'websocket', '', 'BEGIN', ['OK']],
			[
                'INSERT 6',
                'websocket',
                '',
                ml(function () {/*INSERT	rtesting_table_with_capital_column_name
RETURN	id	test_name	TestName
PK	id
SEQ

id	test_name	TestName
{{test_random}}1	Bob	Bob
*/
                }),
			    [
                    '{{test_random}}1\tBob\tBob\n',
                    'TRANSACTION COMPLETED'
			    ]
			],
			['COMMIT', 'websocket', '', 'COMMIT', ['OK']],
			['DELETE RECORDS 1', 'websocket', '', ml(function () {/*ACTION	public	action_delete_rows	{{test_random}}
*/}),
			[
                '""\n',
                "TRANSACTION COMPLETED"
			]],

			['BEGIN', 'websocket', '', 'BEGIN', ['OK']],
			['INSERT 7', 'websocket send from', '', ml(function () {/*INSERT	rtesting_table
RETURN	id	test_name	test_name2
PK	id
SEQ	*/
}) + ml(function () {/*
ORDER BY	id DESC

id	test_name	test_name2
*/
			}) + createTestDataRequest('', 200), createTestDataResponse('', 200)],
			['ROLLBACK', 'websocket', '', 'ROLLBACK', ['OK']],

			['BEGIN', 'websocket', '', 'BEGIN', ['OK']],
			['INSERT 8', 'websocket', '', ml(function () {/*INSERT	WFP's "Testing" Table
RETURN	id	WFP's First "Testing" Column	WFP's Second "Testing" Column
PK	id
SEQ	*/
}) + ml(function () {/*
ORDER BY	id ASC

id	WFP's First "Testing" Column	WFP's Second "Testing" Column
{{test_random}}1	test1	test1
{{test_random}}2	test2	test2
{{test_random}}3	test3	test3
*/}),
			['{{test_random}}1\ttest1\ttest1\n{{test_random}}2\ttest2\ttest2\n{{test_random}}3\ttest3\ttest3\n', 'TRANSACTION COMPLETED']],
			['ROLLBACK', 'websocket', '', 'ROLLBACK', ['OK']],

			['BEGIN', 'websocket', '', 'BEGIN', ['OK']],
			['INSERT 9 (TABLE)', 'websocket', '', ml(function () {/*INSERT	rtesting_table_with_sequence
RETURN	id	test_name	test_name2
PK	id
SEQ	public.rtesting_table_with_sequence_id_seq
ORDER BY	id DESC

test_name	test_name2
*/
			}) + createTestDataRequestNoId('', 2000), createTestDataResponseWithStart('', 2000, 2)],
			['ROLLBACK', 'websocket', '', 'ROLLBACK', ['OK']],

			['BEGIN', 'websocket', '', 'BEGIN', ['OK']],
			['INSERT 9 (VIEW)', 'websocket', '', ml(function () {/*INSERT	ttesting_view2
RETURN	id_1	test_name_1
PK	id_1
SEQ	*/
}) + ml(function () {/*
ORDER BY	id_1 DESC

id_1	test_name_1
*/
			}) + createTestDataRequestOneColumn('', 2000), createTestDataResponseOneColumn('', 2000)],
			['ROLLBACK', 'websocket', '', 'ROLLBACK', ['OK']],

			['DELETE RECORDS 2', 'websocket', '', ml(function () {/*ACTION	public	action_delete_rows	{{test_random}}
*/}),
			[
                '""\n',
                "TRANSACTION COMPLETED"
			]],
			['BEGIN', 'websocket', '', 'BEGIN', ['OK']],
			['CANCEL INSERT', 'websocket cancel', '', ml(function () {/*INSERT	rtesting_table
RETURN	id	test_name	test_name2
PK	id
SEQ	*/
}) + ml(function () {/*
ORDER BY	id DESC

id	test_name	test_name2
*/
			}) + createTestDataRequest('', 2000), 1],
			['ROLLBACK', 'websocket', '', 'ROLLBACK', ['OK']],
		    ['SOCKET CLOSE', 'websocket end']
		]
	}
};

$.ajax('/index.html', '', 'GET', function (data) {
    for (var i = 0, len = $.tests.crash.tests.length; i < len; i += 1) {
        if ($.tests.crash.tests[i] && $.tests.crash.tests[i][0] === 'Logout before login *') {
            $.tests.crash.tests[i][5] = data;
        }
    }
});
var req = $.ajax('/test.txt?anticache=' + Math.random().toString().substring(2), '', 'GET', function (data) {
    $.if_modified_since_changestamp = req.getResponseHeader('Last-Modified');
});
$.ajax('/env/auth', 'action=login&username=postgres&password=password', 'POST', function (data) {
	$.ajax('/env/auth', 'action=2fa&token=postgres1234', 'POST', function (data) {
		$.ajax('/env/app/all/index.html', '', 'GET', function (data) {
			for (var i = 0, len = $.tests.crash.tests.length; i < len; i += 1) {
				if ($.tests.crash.tests[i] && ($.tests.crash.tests[i][0] === 'File Read 3' || $.tests.crash.tests[i][0] === 'File Read 6')) {
					$.tests.crash.tests[i][5] = data;
				}
			}
		});
		$.ajax('/env/action_info', '', 'GET', function (data) {
			for (var i = 0, len = $.tests.crash.tests.length; i < len; i += 1) {
				if ($.tests.crash.tests[i] && $.tests.crash.tests[i][0] === 'action_info') {
					$.tests.crash.tests[i][5] = data;
				}
			}
		});
	});
});

$.tests.crash.intRun = 45;
