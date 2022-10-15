"use strict";
const ajaxHandlerScript = "https://fe.it-academy.by/AjaxStringStorage2.php";
const stringName = 'YAKUSHEV_VOLLEYBALL_TABLEOFRECORDS';
window.onhashchange = switchToStateFromURLHash;
var SPAState = {}; // могут быть элементы pagename страницы, которую нужнно отобразить
var StateV = 0;//0-не в игре, 1 - в игре,2- промежуточный результат при отмене выхода из игры.
var SPApagename;
function switchToStateFromURLHash() {
	if (StateV == 1) {
		if (confirm("Вы точно желаете уйти? Все результаты игры будут утеряны. Нажмите ОК чтовы уйти, или Отмена если хотите остаться!") == false) {
			location.hash = encodeURIComponent(JSON.stringify(({ pagename: 'Volleyball' })));
			StateV = 2;
			return false;
		}
		StateV = 0;
	}
	if (StateV == 2) {
		StateV = 1;
		requestAnimationFrame(tick);
		return false;
	}

	var URLHash = window.location.hash;
	// убираем из закладки УРЛа решётку
	// (по-хорошему надо ещё убирать восклицательный знак, если есть)
	// и декодируем из формата УРЛ, т.к. любые значения в УРЛ закодированы
	var stateJSON = decodeURIComponent(URLHash.substr(1));
	if (stateJSON != "") {
		SPApagename = JSON.parse(stateJSON).pagename;
		if (SPApagename == 'Volleyball') {
			StateV = 1;
			SPAState = JSON.parse(stateJSON); // 
		}
		SPAState = JSON.parse(stateJSON); // если JSON непустой, читаем из него состояние и отображаем
	}
	else
		SPAState = { pagename: 'Menu' }; // иначе показываем главную страницу

	console.log('Новое состояние приложения:');
	console.log(SPAState);

	// обновляем вариабельную часть страницы под текущее состояние
	// это реализация View из MVC - отображение состояния модели в HTML-код
	var pageHTML = "";
	var jssrc = "";
	switch (SPAState.pagename) {
		case 'Menu':
			pageHTML += '<div id="Menu">';
			pageHTML += '<p id="Name"> VOLLEYBALL</p>';
			pageHTML += '<input type="button" onclick="switchToStartPage()" name="start" value="Начать игру" id="start">';
			pageHTML += '<input type="button" onclick="switchToRulsPage()" name="ruls" value="Правила" id="ruls">';
			pageHTML += '<input type="button" onclick="switchToRecordPage()" name="records" value="Рекорды" id="records">';
			pageHTML += '</div>';
			break;

		case 'd_start':
			pageHTML += '<div id="d_start">';
			pageHTML += '<form id="Start" name="Start">';
			pageHTML += '	<p id="Name"> VOLLEYBALL</p>';
			pageHTML += '<p>Введите имя первого игрока: </p>';
			pageHTML += '<input type="text" id="P1Name" name="P1Name" value="Player1"> </input><br>';
			pageHTML += '<p>Выберите цвет первого игрока: </p>';
			pageHTML += '<input type="color" id="P1Color" name="P1Color" value="#ff0000"><br><br>';
			pageHTML += '<p>Введите имя второго игрока: </p>';
			pageHTML += '	<input type="text" id="P2Name" name="P2Name" value="Player2"> </input>';
			pageHTML += '	<p>Выберите цвет первого игрока: </p>';
			pageHTML += '	<input type="color" id="P2Color" name="P2Color" value="#0000FF"><br><br>';
			pageHTML += '	<input type="button" name="button" value="ИГРАТЬ!" id="button">';
			pageHTML += '</form>';
			pageHTML += '</div>';
			jssrc = "d_start.js";
			break;

		case 'd_ruls':
			pageHTML += '<div id="d_ruls">';
			pageHTML += '<p id="Top"> Правила игры:</p>';
			pageHTML += '<ul>';
			pageHTML += '<li> Игра продолжается пока один из игроков не заработает 15 очков!</li>';
			pageHTML += '<li> Гол фиксируется при падении мяча на землю.</li>';
			pageHTML += '<li> Каждый игрок имеет право на 3 подряд касания, если после этого емк не удается перевести мяч сопернику, ему засчитывается гол. </li>';
			pageHTML += '</ul>';
			pageHTML += '<p id="Top"> Управление:</p>';
			pageHTML += '<table id="control">';
			pageHTML += '<tr>';
			pageHTML += '<td>';
			pageHTML += '<ul> На компьютере:';
			pageHTML += '<ul>Левый игрок:';
			pageHTML += '<li>Движение игрока влево:&quotA&quot </li>';
			pageHTML += '<li>Движение игрока вправо:&quotD&quot </li>';
			pageHTML += '<li>Движение игрока вверх(прыжок):&quotW&quot </li>';
			pageHTML += '</ul>';
			pageHTML += '<ul>Правый игрок:';
			pageHTML += '<li>Движение игрока влево:&quotСтрелка влево&quot </li>';
			pageHTML += '<li>Движение игрока вправо:&quotСтрелка вправо&quot </li>';
			pageHTML += '<li>Движение игрока вверх(прыжок):&quotСтрелка вверх&quot </li>';
			pageHTML += '</ul>';
			pageHTML += '</ul>';
			pageHTML += '</td>';
			pageHTML += '<td>';
			pageHTML += '<ul> На мобильном устройстве для управления конкретным игроком нужно касаться экрана на его половине поля:';
			pageHTML += '<ul>';
			pageHTML += '<li>Движение игрока влево:&Движение пальцем влево&quot </li>';
			pageHTML += '<li>Движение игрока вправо:&Движение пальцем вправо&quot </li>';
			pageHTML += '<li>Движение игрока вверх(прыжок):&quotСвайп вверх&quot </li>';
			pageHTML += '</ul>';
			pageHTML += '</ul>';
			pageHTML += '</td>';
			pageHTML += '</tr>';
			pageHTML += '</table>';
			pageHTML += '<p id="Top"> Рекорды:</p>';
			pageHTML += '<ul>';
			pageHTML += '<li> После окончания игры победитель получает очки, равные разцице очков встречи</li>';
			pageHTML += '</ul>';
			pageHTML += '</div>';
			break;

		case 'd_records':
			pageHTML += '<div id="d_records">';
			pageHTML += '<p id="Name"> VOLLEYBALL</p>';
			pageHTML += '<p id="Top"> Топ 10 игроков</p>';
			pageHTML += '</div>';
			pageHTML += '<table id="recordstable">';
			pageHTML += '<thead>';
			pageHTML += '<th id="Number">Позиция</th>';
			pageHTML += '<th id="Player">Игрок</th>';
			pageHTML += '<th id="Score">Очки</th>';
			pageHTML += '</thead>';
			pageHTML += '<tbody id="tbody">';
			pageHTML += '</tbody>';
			pageHTML += '</table>';
			jssrc = "d_records.js";
			break;

		case 'Volleyball':
			pageHTML += '	<canvas id="Canvas"></canvas>';
			pageHTML += '	<input type="button" name="button_now" value="ИГРАТЬ ЕЩЕ!" id="button_now">';
			jssrc = "Volleyball.js";
			break;
	}
	document.body.innerHTML = pageHTML;
	var script = document.createElement('script');
	script.setAttribute('src', jssrc);
	document.body.appendChild(script);
}

function switchToState(newState) {
	// устанавливаем закладку УРЛа (кодируя как положено любые компоненты УРЛ)
	// нужно для правильной работы кнопок навигации браузера
	// (т.к. записывается новый элемент истории просмотренных страниц)
	// и для возможности передачи УРЛа другим лицам
	location.hash = encodeURIComponent(JSON.stringify(newState));

	// АВТОМАТИЧЕСКИ вызовется switchToStateFromURLHash()
	// т.к. закладка УРЛа изменилась (ЕСЛИ она действительно изменилась)
}

function switchToMenuPage() {
	switchToState({ pagename: 'Menu' });
}
function switchToStartPage() {
	switchToState({ pagename: 'd_start' });
}
function switchToRulsPage() {
	switchToState({ pagename: 'd_ruls' });
}

function switchToRecordPage() {
	switchToState({ pagename: 'd_records' });
}
function switchToVolleyballPage() {
	switchToState({ pagename: 'Volleyball' });
}
// переключаемся в состояние, которое сейчас прописано в закладке УРЛ
switchToStateFromURLHash();

