"use strict";
var
	button_now = document.getElementById('button_now'),
	Canvas = document.getElementById('Canvas'),
	context = Canvas.getContext('2d'),
	CanvasWidth = window.innerWidth,
	CanvasHeight = window.innerHeight,
	ratioH = CanvasHeight / 620, /*CanvasHeight=620-величина на разрабатываемом компьютере 
т.к некоторые параметры игры завязаны на этом значении*/
	ratioW = CanvasWidth / 1340,
	ratio = ratioH / 2 + ratioW / 2,
	stateG = 3, /*0-конец игры( один из игроков набрал 15 очков), 1-подает первый игрок, 2-подает 2й игрок.3-начало игры*/
	state1 = 0, /*0-игрок 1 в начальном положении, 1-игрок 1 летит вверх, 2-летит вниз */
	state2 = 0, /*0-игрок 2 в начальном положении, 1-игрок 2 летит вверх, 2-летит вниз*/
	stateB = 3, //0-мяч летит вверх, 1- мяч летит вниз;2-мяч лежит на земле;3-начальное
	BallR = 40 * ratio, //радиус мяча
	Ball = new Image(),
	Pillar = new Image(),
	Area = new Image(),
	GridW = CanvasWidth / 100,// ширина столба сетки
	GridH = CanvasHeight / 2,//высота столба сетки
	Player1X = 0,//смещение 1го игрока от начального значения по Х
	Player1Y = 0,//смещение 1го игрока от начального значения по Y
	Player2X = 0,//смещение 2го игрока от начального значения по Х
	Player2Y = 0,//смещение 2го игрока от начального значения по Y
	Player1SpeedX = 0, //скорость первого игрока по Х
	Player1SpeedY = 0, //скорость первого игрока по Y
	Player2SpeedX = 0, //скорость второго игрока по Х
	Player2SpeedY = 0, //скорость второго игрока по Y
	BallSpeedX = 0, //скорость мяча по Х
	BallSpeedY = 0, //скорость мяча по Y
	BallX = 0, //смещение мяча  по Х
	BallY = 0, //смещение мяча по Y
	accelY = 0.95, // во сколько раз теряется скорость 
	frictK = 0.99, // во сколько раз теряется скорость 
	BallPos = new Array(),
	angle = 0,
	amthit1 = 0,//количество подряд ударов 1го
	amthit2 = 0,//количество подряд ударов 2го
	score1 = 10,//очки 1го
	score2 = 10,//очки 2го 
	R1 = 35 * ratio,
	R2 = 40 * ratio,
	win = 0,//победитель
	touch1X,//координата касания по X
	touch2X,//координата касания по X
	touch1Y,//координата касания по Y
	touch2Y,//координата касания по Y
	touch1Player,//касание отвечающее за 1го игрока
	touch2Player,//касание отвечающее за 2го игрока
	Player1Name = localStorage.Player1Name,
	Player2Name = localStorage.Player2Name,
	Player1Color = localStorage.Player1Color,
	Player2Color = localStorage.Player2Color,
	updatePassword;;

var hitAudio = new Audio("hit.mp3"),
	goalAudio = new Audio("goal.mp3"),
	winnerAudio = new Audio("winner.mp3");

function resize() {
	CanvasWidth = window.innerWidth;
	CanvasHeight = window.innerHeight;
	Canvas.width = CanvasWidth;
	Canvas.height = CanvasHeight;
	ratioH = CanvasHeight / 620;
	ratioW = CanvasWidth / 1340;
	ratio = ratioH / 2 + ratioW / 2;
	BallR = 40 * ratio;
	GridW = CanvasWidth / 100;
	GridH = CanvasHeight / 2;
	R1 = 35 * ratio;
	R2 = 40 * ratio;
	console.log(screen.orientation.lock);
/*	if (CanvasWidth < CanvasHeight) {
		if (screen.orientation.angle == 0);
		screen.orientation.angle = 90;
	}*/
}
button_now.addEventListener('click', start, false);
button_now.addEventListener('touchstart', start, false);
function start(EO) {
	EO = EO || window.event;
	button_now.style.display = "none";
	score1 = 0;
	score2 = 0;
	stateG = 3;
	requestAnimationFrame(tick);
}

Canvas.width = CanvasWidth;
Canvas.height = CanvasHeight;
Ball.onload = BallCanvas;
Pillar.onload = GridCanvas;
Area.onload = AreaCanvas;
Ball.src = 'img/ball1.png';
Pillar.src = 'img/pillar.png';
Area.src = 'img/beach.jpg ';
startSound();
function AreaCanvas() {
	context.drawImage(Area, 0, 0, CanvasWidth, CanvasHeight)
}
function Score() {
	context.beginPath();
	context.font = `normal normal ${ratio * 40}px 'Times New Roman'`;
	context.textAlign = 'center';
	context.textBaseline = 'middle';
	context.fillStyle = 'black';
	if (CanvasWidth < 620) {
		context.fillText(`${Player1Name}`, CanvasWidth / 4, CanvasHeight / 15);
		context.fillText(`${score1}`, CanvasWidth / 4, 2 * CanvasHeight / 15);
		context.fillText(`${score2}`, 3 * CanvasWidth / 4, 2 * CanvasHeight / 15);
		context.fillText(`${Player2Name}`, 3 * CanvasWidth / 4, CanvasHeight / 15);
	}
	else {
		context.fillText(`${Player1Name}`, CanvasWidth / 4, CanvasHeight / 15);
		context.fillText(`${score1} : ${score2}`, CanvasWidth / 2, CanvasHeight / 15);
		context.fillText(`${Player2Name}`, 3 * CanvasWidth / 4, CanvasHeight / 15);
	}
}
function BallCanvas() {
	if (stateG == 1 && stateB == 3) {
		BallX += -1 / 4 * CanvasWidth;
		stateB = 0;
	}
	if (stateG == 2 && stateB == 3) {
		BallX += 1 / 4 * CanvasWidth;
		stateB = 0;
	}
	context.drawImage(Ball, CanvasWidth / 2 - BallR + BallX, CanvasHeight / 3 - BallR - BallY, 2 * BallR, 2 * BallR)
	BallP();
}
// вычисляем точки на окружности через каждые 10 градусов
function BallP() {
	angle = 0;
	for (let i = 0; i <= 18; i++) {
		let angleR = angle / 180 * Math.PI;
		let BallKX = (CanvasWidth / 2 + BallX) - BallR * Math.cos(angleR);
		let BallKY = (CanvasHeight / 3 - BallY) + BallR * Math.sin(angleR);
		BallPos[i] = { BallKX, BallKY };
		angle += 10;
	}
}
function GridCanvas() {
	context.drawImage(Pillar, CanvasWidth / 2 - GridW / 2, CanvasHeight / 2, GridW, GridH);
}
function Player1() {
	context.beginPath();
	context.fillStyle = Player1Color;
	context.arc(CanvasWidth / 4 + Player1X, 0.9 * CanvasHeight - R2 + Player1Y, R2, 0, Math.PI * 2, false);
	context.arc(CanvasWidth / 4 + Player1X, 0.9 * CanvasHeight - R2 + Player1Y - R1, R1, 0, Math.PI * 2, false);
	hit1();
	context.fill();
}
function Player2() {
	context.beginPath();
	context.fillStyle = Player2Color;
	context.arc(3 * CanvasWidth / 4 + Player2X, 0.9 * CanvasHeight - R2 + Player2Y, R2, 0, Math.PI * 2, false);
	context.arc(3 * CanvasWidth / 4 + Player2X, 0.9 * CanvasHeight - R2 + Player2Y - R1, R1, 0, Math.PI * 2, false);
	hit2()
	context.fill();
}
function hit1() { // проверяем столкновение мяча и 1 игрока
	if (amthit1 > 3) {
		Goal2()
	}
	else {
		for (let ii = 0; ii < BallPos.length; ii++) {
			let x = BallPos[ii].BallKX;
			let y = BallPos[ii].BallKY;
			if (context.isPointInPath(x, y)) {
				hitSound();
				vibro(100);
				if (stateB != 2) {
					BallSpeedX = ratio * (1 + 5 * Math.cos(ii * 10 / 180 * Math.PI));
					BallSpeedY = ratio * (1 + 20 * Math.sin(ii * 10 / 180 * Math.PI));
					if (state1 != 2 && stateB == 1) {
						Player1SpeedY = -Player1SpeedY;
					}
					stateB = 0;
					amthit1++;
					amthit2 = 0;
					break
				}
			}
		}
	}
}
function hit2() { // проверяем столкновение мяча и 2 игрока
	if (amthit2 > 3) {
		Goal1()
	}
	else {
		for (let ii = 0; ii < BallPos.length; ii++) {
			let x = BallPos[ii].BallKX;
			let y = BallPos[ii].BallKY;
			if (context.isPointInPath(x, y)) {
				hitSound();
				vibro(100);
				if (stateB != 2) {
					BallSpeedX = ratio * (-1 + 5 * Math.cos(ii * 10 / 180 * Math.PI));
					BallSpeedY = ratio * (-1 + 20 * Math.sin(ii * 10 / 180 * Math.PI));
					if (state2 != 2 && stateB == 1) {
						Player2SpeedY = -Player2SpeedY;
					}
					stateB = 0;
					amthit2++;
					amthit1 = 0;
					break
				}
			}
		}
	}
}
function Goal1() {
	goalSound();
	score1++;
	stateG = 1;
	stateB = 3;
	BallX = 0;
	BallY = 0;
	amthit1 = 0;
	amthit2 = 0;
	BallSpeedY = 0;
	BallSpeedX = 0;
	if (score1 == 15) {
		win = Player1Name;
		stateG = 0;
		requestAnimationFrame(Winner);
	}
}
function Goal2() {
	goalSound();
	score2++;
	stateG = 2;
	stateB = 3;
	BallX = 0;
	BallY = 0;
	amthit1 = 0;
	amthit2 = 0;
	BallSpeedY = 0;
	BallSpeedX = 0;
	if (score2 == 15) {
		win = Player2Name;
		stateG = 0;
		requestAnimationFrame(Winner);
	}
}
function Winner() {
	winnerSound();
	vibro([100, 100, 100, 100, 100, 500, 50, 100, 20, 100]);
	storeInfo();
	context.beginPath();
	context.fillStyle = 'rgba(0,0,0,0.9)'
	context.fillRect(CanvasWidth / 3, 0, CanvasWidth / 3, CanvasHeight);
	context.font = `normal normal ${ratio * 10}vh 'Times New Roman'`;
	context.textAlign = 'center';
	context.textBaseline = 'middle';
	context.fillStyle = "#ffd700";
	context.fillText(`Winner!!!`, CanvasWidth / 2, 0.1 * CanvasHeight);
	if (win == Player1Name) {
		context.fillText(`${Player1Name}`, CanvasWidth / 2, 0.2 * CanvasHeight);
		context.fillStyle = Player1Color;
	}
	if (win == Player2Name) {
		context.fillText(`${Player2Name}`, CanvasWidth / 2, 0.2 * CanvasHeight);
		context.fillStyle = Player2Color;
	}
	context.arc(CanvasWidth / 2, 0.7 * CanvasHeight - R2, R2, 0, Math.PI * 2, false);
	context.arc(CanvasWidth / 2, 0.7 * CanvasHeight - R2 - R1, R1, 0, Math.PI * 2, false);
	context.fillText(`${score1} : ${score2}`, CanvasWidth / 2, 0.35 * CanvasHeight);
	context.fill();
	button_now.style.display = "block";
	window.cancelAnimationFrame(tick);
}
AreaCanvas();
GridCanvas();
BallCanvas();
Player1();
Player2();
Score();
requestAnimationFrame(tick);

function tick() {
	BallX += BallSpeedX;
	BallY += BallSpeedY;
	Player1X += Player1SpeedX;
	Player2X += Player2SpeedX;
	//начало прыжка 1го
	if (Player1SpeedY < 0) {
		state1 = 1
		Player1Y += Player1SpeedY;
		Player1SpeedY *= accelY
	}
	// падение 1го
	if (Player1SpeedY > 0) {
		Player1Y += Player1SpeedY;
		Player1SpeedY /= accelY
	}
	// приземление 1го
	if (Player1Y > 0) {
		Player1Y = 0;
		Player1SpeedY = 0;
		state1 = 0
	}//высота прыжока 1го игрока
	if (0.9 * CanvasHeight - R2 + Player1Y < CanvasHeight / 2 - R1 - R2) {
		state1 = 2;
		Player1SpeedY = -Player1SpeedY;
	}
	//движение игрока 1го игрока по своему полю
	if (Player1X < -CanvasWidth / 4 + R2) {
		Player1X = -CanvasWidth / 4 + R2
	}
	if (Player1X > CanvasWidth / 4 - R2 - GridW / 2) {
		Player1X = CanvasWidth / 4 - R2 - GridW / 2
	}
	// начало прыжка 2го
	if (Player2SpeedY < 0) {
		state2 = 1
		Player2Y += Player2SpeedY;
		Player2SpeedY *= accelY
	}
	//падение 2го
	if (Player2SpeedY > 0) {
		Player2Y += Player2SpeedY;
		Player2SpeedY /= accelY
	}
	// приземление 2го
	if (Player2Y > 0) {
		Player2Y = 0;
		Player2SpeedY = 0;
		state2 = 0;
	}
	//высота прыжока 2го игрока
	if (0.9 * CanvasHeight - R2 + Player2Y < CanvasHeight / 2 - R1 - R2) {
		state2 = 2;
		Player2SpeedY = -Player2SpeedY;
	}
	//движение игрока 2го игрока по своему полю
	if (Player2X > CanvasWidth / 4 - R2) {
		Player2X = CanvasWidth / 4 - R2
	}
	if (Player2X < -CanvasWidth / 4 + R2 + GridW / 2) {
		Player2X = -CanvasWidth / 4 + R2 + GridW / 2
	}
	//полет мяча
	// вверх
	if (BallSpeedY > 0 && stateB == 0) {
		BallSpeedY *= accelY;
	}
	//вниз
	if (BallSpeedY < 0 && stateB == 1) {
		BallSpeedY /= accelY;
	}
	//верхняя точка
	if (BallSpeedY < 0.8 && stateB == 0) {
		BallSpeedY = - BallSpeedY;
		stateB = 1;
	}
	//отталкивание от стенок
	if (BallX < -CanvasWidth / 2 + BallR)
		BallSpeedX = -BallSpeedX;
	if (BallX > CanvasWidth / 2 - BallR)
		BallSpeedX = -BallSpeedX;

	//отталкивание от сетки
	if (BallX > - GridW / 2 - BallR && BallX < GridW / 2 - BallR && BallY < -CanvasHeight / 6 && amthit2 == 0) {
		BallSpeedX = -BallSpeedX;
		BallX = - BallR - GridW / 2;
	}
	if (BallX > - GridW / 2 + BallR && BallX < GridW / 2 + BallR && BallY < - CanvasHeight / 6 && amthit1 == 0) {
		BallSpeedX = -BallSpeedX;
		BallX = BallR + GridW / 2;
	}
	if (BallX < 0 && BallX > - BallR && BallY < -CanvasHeight / 6 + BallR && amthit2 == 0) {
		BallSpeedY = -BallSpeedY;
		BallY = -CanvasHeight / 6 + BallR;
		stateB = 0;
	}
	if (BallX > 0 && BallX < BallR && BallY < -CanvasHeight / 6 + BallR && amthit1 == 0) {
		BallY = -CanvasHeight / 6 + BallR;
		BallSpeedY = -BallSpeedY;
		stateB = 0;
	}
	//падение на землю
	if (BallY <= CanvasHeight / 3 - BallR - (0.9 * CanvasHeight - 2 * R2)) {
		BallY = CanvasHeight / 3 - BallR - (0.9 * CanvasHeight - 2 * R2)
		if (BallX > 0)
			Goal1()
		if (BallX < 0)
			Goal2()
	}
	// движение 1го за движением пальца
	if (Player1X > touch1X - CanvasWidth / 4 && Player1X < touch1X - CanvasWidth / 4 + Player1SpeedX)
		Player1SpeedX = 0;
	// движение 1го за движением пальца
	if (Player1X < touch1X - CanvasWidth / 4 && Player1X > touch1X - CanvasWidth / 4 + Player1SpeedX)
		Player1SpeedX = 0;
	// движение 2го за движением пальца
	if (Player2X > touch2X - 3 * CanvasWidth / 4 && Player2X < touch2X - 3 * CanvasWidth / 4 + Player2SpeedX)
		Player2SpeedX = 0;
	// движение 2го за движением пальца
	if (Player2X < touch2X - 3 * CanvasWidth / 4 && Player2X > touch2X - 3 * CanvasWidth / 4 + Player2SpeedX)
		Player2SpeedX = 0;

	AreaCanvas();
	GridCanvas();
	BallCanvas();
	Player1();
	Player2();
	Score();
	if (stateG != 0 && StateV == 1) {
		requestAnimationFrame(tick);
	}
}

window.addEventListener("keydown", keydown, false);
window.addEventListener("keyup", keyup, false);
window.addEventListener("touchstart", touchstart, { passive: false });
window.addEventListener("touchmove", touchmove, { passive: false });
window.addEventListener("touchend", touchend, { passive: false });
window.addEventListener("swipe", jump, false);
window.addEventListener("resize", resize, false);
window.addEventListener('beforeunload', beforeunload, false)

function beforeunload(EO) {
	cancelAnimationFrame(tick);
	EO.preventDefault();
	EO.returnValue = 'Есть несохранённые изменения. Всё равно уходим?';
};
var mySwipe = new Event("swipe", { bubbles: true });

function jump(EO) {
	EO.preventDefault();
	if (mySwipe.who == 1)
		Player1SpeedY = -15 * ratioH;
	if (mySwipe.who == 2)
		Player2SpeedY = -15 * ratioH;
	mySwipe.who = 0;
}
function touchstart(EO) {
	EO.preventDefault();
	for (const touch of EO.targetTouches) {
		if (touch.pageX < CanvasWidth / 2) {
			touch1Player = touch;
			touch1X = touch1Player.pageX;
			touch1Y = touch1Player.pageY;
		}
		if (touch.pageX > CanvasWidth / 2) {
			touch2Player = touch;
			touch2X = touch2Player.pageX;
			touch2Y = touch2Player.pageY;
		}
		if (touch1Player && touch2Player)
			break
	}
}
function touchmove(EO) {
	EO.preventDefault();
	if (touch1Player) {
		if (touch1X > Player1X + CanvasWidth / 4) {
			Player1SpeedX = 6 * ratioW;
			touch1X = EO.changedTouches[touch1Player.identifier].pageX;
		}
		if (touch1X < Player1X + CanvasWidth / 4) {
			Player1SpeedX = -6 * ratioW;
			touch1X = EO.changedTouches[touch1Player.identifier].pageX;
		}
		if (touch1Y - EO.changedTouches[touch1Player.identifier].pageY - 50 > touch1X - EO.changedTouches[touch1Player.identifier].pageX && state1 == 0) {
			mySwipe.who = 1;
			document.dispatchEvent(mySwipe);
		}
	}
	if (touch2Player) {
		if (touch2X > Player2X + 3 * CanvasWidth / 4) {
			Player2SpeedX = 6 * ratioW;
			touch2X = EO.changedTouches[touch2Player.identifier].pageX;
		}

		if (touch2X < Player2X + 3 * CanvasWidth / 4) {
			Player2SpeedX = -6 * ratioW;
			touch2X = EO.changedTouches[touch2Player.identifier].pageX;
		}
		if (touch2Y - EO.changedTouches[touch2Player.identifier].pageY - 50 > touch2X - EO.changedTouches[touch2Player.identifier].pageX && state2 == 0) {
			mySwipe.who = 2;
			document.dispatchEvent(mySwipe);
		}
	}
}
function touchend(EO) {
	EO.preventDefault();
	if (touch1Player) {
		if (EO.changedTouches[touch1Player.identifier].identifier == touch1Player.identifier) {
			Player1SpeedX = 0;
			touch1Player = null;
		}
	}
	if (touch2Player) {
		if (EO.changedTouches[touch2Player.identifier].identifier == touch2Player.identifier) {
			Player2SpeedX = 0
			touch2Player = null;
		}
	}
}

function keydown(EO) {
	EO.preventDefault();
	if (EO.code === "KeyW") {
		if (state1 == 0)
			Player1SpeedY = -15 * ratioH;
	}
	if (EO.code === "KeyD") {
		Player1SpeedX = 6 * ratioW;
	}
	if (EO.code === "KeyA") {
		Player1SpeedX = -6 * ratioW;
	}
	if (EO.code === "ArrowUp") {
		if (state2 == 0)
			Player2SpeedY = -15 * ratioH;
	}
	if (EO.code === "ArrowRight") {
		Player2SpeedX = 6 * ratioW;
	}
	if (EO.code === "ArrowLeft") {
		Player2SpeedX = -6 * ratioW;
	}
};
function keyup(EO) {
	EO = EO || window.event;
	EO.preventDefault();
	if (EO.code === "KeyD") {
		Player1SpeedX = 0;
	}
	if (EO.code === "KeyA") {
		Player1SpeedX = 0;
	}
	if (EO.code === "ArrowRight") {
		Player2SpeedX = 0;
	}
	if (EO.code === "ArrowLeft") {
		Player2SpeedX = 0;
	}
}

function startSound() {
	hitAudio.play(); // запускаем звук
	hitAudio.pause(); // и сразу останавливаем
	goalAudio.play(); // запускаем звук
	goalAudio.pause(); // и сразу останавливаем
	winnerAudio.play(); // запускаем звук
	winnerAudio.pause(); // и сразу останавливаем
}
function hitSound() {
	hitAudio.currentTime = 0;
	hitAudio.play();
}
function goalSound() {
	goalAudio.currentTime = 0;
	goalAudio.play();
}
function winnerSound() {
	winnerAudio.currentTime = 0;
	winnerAudio.play();
}
function vibro(time) {
	// есть поддержка Vibration API?
	if (navigator.vibrate) {
		window.navigator.vibrate(time);
	}
}

function storeInfo() {
	updatePassword = Math.random();
	$.ajax({
		url: ajaxHandlerScript, type: 'POST', cache: false, dataType: 'json',
		data: { f: 'LOCKGET', n: stringName, p: updatePassword },
		success: lockGetReady, error: errorHandler
	}
	);
}

function lockGetReady(callresult) {
	if (callresult.error != undefined)
		alert(callresult.error);
	else {
		const info = JSON.parse(callresult.result);
		info[win] += Math.abs(score1 - score2);
		console.log(info);
		$.ajax({
			url: ajaxHandlerScript, type: 'POST', cache: false, dataType: 'json',
			data: {
				f: 'UPDATE', n: stringName,
				v: JSON.stringify(info), p: updatePassword
			},
			success: updateReady, error: errorHandler
		}
		);
	}
}

function updateReady(callresult) {
	if (callresult.error != undefined)
		alert(callresult.error);
}

function errorHandler(jqXHR, statusStr, errorStr) {
	alert(statusStr + ' ' + errorStr);
}

