var qs = qryToJSON(getQueryString());

document.addEventListener('change', function (event) {
    if (event.target.tagName.toLowerCase() === 'input' && event.target.getAttribute('type') === 'checkbox') {
        var checkbox = event.target;
        var key = checkbox.getAttribute('data-key');
        var value = checkbox.checked.toString();
        pushQueryString(key + '=' + value);
        qs[key] = value;

        var list = document.getElementById('test-list-' + key);
        list.classList.toggle('disabled');
        if (qs[key] === 'true') {
            $.runTests(key);
        }
    }
});

document.addEventListener('DOMContentLoaded', function () {
	// $.ajax('https://www.sunnyserve.com/env/tst.acceptnc_test', 'action=begin&program_name=envelope&user_agent=' +
	// 	encodeURIComponent(navigator.userAgent), 'POST', function (data) {
	// 	if (!isNaN(parseInt(data, 10))) {
	// 		$.intID = data;

			setTimeout(function () {
				startTests();
			}, 2000);

	// 	} else {
	// 		alert(data);
	// 	}
	// });
});

function startTests() {
    $.ajax('/env/auth', 'action=logout', 'POST', function (data) {
        $.ajax('/env/auth', 'action=login&username=postgres&password=password', 'POST', function (data) {
			$.ajax('/env/auth', 'action=2fa&token=postgres1234', 'POST', function (data) {
				var i, len, key;
				for (key in $.tests) {
					if ($.tests.hasOwnProperty(key)) {
						var checkContainer = document.createElement('div');
						checkContainer.innerHTML =
							'<input id="toggle-' + key + '" data-key="' + key + '" type="checkbox" ' + (qs[key] === 'true' ? 'checked' : '') + ' />' +
							'<label for="toggle-' + key + '">' + key + '</label>';
						document.getElementById('checkboxes').appendChild(checkContainer);
					}
				}
				for (key in $.tests) {
					if ($.tests.hasOwnProperty(key)) {
						var list = document.createElement('div');
						list.classList.add('test-list');
						list.setAttribute('id', 'test-list-' + key);
						var strHTML = '';
						for (i = 0, len = $.tests[key].tests.length; i < len; i++) {
							strHTML +=
								'<div id="test' + key + i + '_label" class="test-block waiting"></div>';
						}
						list.innerHTML =
							'<p>' +
							key +
							' <small><b id="iterations-' + key + '">0</b> Iterations <b id="status-note-' + key + '"></b></small>' +
							'</p>' +
							strHTML + '<br />' +
							'<label style="display: none;" for="actual-status-' + key + '">Actual Status</label>' +
							'<input style="display: none;" id="actual-status-' + key + '" type="text" />' +
							'<label style="display: none;" for="actual-output-' + key + '">Actual Output</label>' +
							'<textarea style="display: none;" id="actual-output-' + key + '" autoresize rows="10"></textarea>';
						document.getElementById('tests').appendChild(list);

						if (qs[key] === 'true') {
							if (qs._http_auth !== 'true') {
								$.runTests(key);
							}
						} else {
							list.classList.add('disabled');
						}
					}
				}
				if (qs._http_auth === 'true') {
					$.runTests('_http_auth');
				}
			});
		});
    });
}
