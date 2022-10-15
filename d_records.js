var tbody, sortable, lenTab;
tbody = document.getElementById('tbody');
sortable = [];
lenTab = 0;
function restoreInfo() {
	$.ajax(
		{
			url: ajaxHandlerScript, type: 'POST', cache: false, dataType: 'json',
			data: { f: 'READ', n: stringName },
			success: readReady, error: errorHandler
		}
	);
}

function readReady(callresult) {
	if (callresult.error != undefined)
		alert(callresult.error);
	else {
		const info = JSON.parse(callresult.result);
		for (let Player in info) {
			sortable.push([Player, info[Player]]);
		}
		sortable.sort(function (a, b) {
			return b[1] - a[1];
		});
		if (sortable.length <= 10) {
			lenTab = sortable.length
		}
		else lenTab = 10;
		for (let i = 0; i < lenTab; i++) {
			let row = `row${i}`;
			row = document.createElement('tr');
			let col_1 = document.createElement('td');
			col_1.innerHTML = `${i + 1}.`;
			let col_2 = document.createElement('td');
			col_2.innerHTML = `${sortable[i][0]}`;
			let col_3 = document.createElement('td');
			col_3.innerHTML = `${sortable[i][1]}`;

			row.appendChild(col_1);
			row.appendChild(col_2);
			row.appendChild(col_3);
			tbody.appendChild(row);
		}
	};
}

function errorHandler(jqXHR, statusStr, errorStr) {
	alert(statusStr + ' ' + errorStr);
}
restoreInfo()

