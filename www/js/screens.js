/*
 * screens.js v.1
 * Author: Yurkin Alexandr
 * a@justweb.ru
 */
;(function () {

	var screensModule = {

		settings: {
			scrollAnimationTime: 500, // Время анимации скроллинга экранов
			use_bullets: true, // Использовать буллетсы для скринов?
			use_progress: true, // Использовать прогресс-бар скроллинга?
			progress_position: "top", // Позиция прогрессбара - top/left/bottom/right
			beforeScroll: 35, // На сколько % нужно проскролить скрин, чтобы ему присвоился класс showed
			firstScreenInfelicity: 0, // Погрешность для первого экрана (px)
			lastScreenInfelicity: 0, // Погрешность для последнего экрана (px)
			bullets_position: "right", // Позиция булетсов -  top/left/bottom/right
			use_easing: true, // Использовать изинги при прокрутке - true / false. Чтобы изинги работали, нужно подключить либу jquery.easing
			easing: 'easeOutExpo', // Если изинг true - то какой эффект использовать - Примеры можно посмотреть на http://easings.net
			//todo
			hideShowedOnScrollOut: true // Убирать класс "showed", когда они уходят из видимости
		},

		selector: {
			window: window,
			bodyScroll: 'html, body',
			body: 'body',
			stopScrolling: 'stop-scrolling',

			screens: '.screen',
			screens_content: '.screen__content',

			bullets: '.screen-bullets',
			bullets_container: '.screen-bullets__container',
			bullets_items: '.screen-bullets__item',

			progress: '.screen-progress',
			progress_bar: '.screen-progress__bar'
		},

		scroll: null,
		scroll_percents: null,
		scrollBottom: null,
		activeScreen: null,
		scrolling: true,
		documentHeight: 0,

		$obj: [],
		screen: [],
		scrollTemp: 0,

		// Включает или выключает скроллинг у body
		toggleScrolling: function (action) {

			var debug = false;
			var self = this;

			if (!action) {
				action = (self.scrolling) ? 'stop' : 'start';
			}

			if (action == 'start' && self.scrolling == true) {
				return;
			}

			self.scrolling = (action == 'start');

			if (debug) {
				console.clear();
				console.log('Stop scrolling');
				console.log('Action = ' + action);
			}

			if (action == 'start') {
				self.$obj['body'].removeClass(self.selector.stopScrolling);
				self.$obj['body'].css('top', 0);
				self.$obj['bodyScroll'].scrollTop(self.scrollTemp);
			}

			if (action == 'stop') {
				self.$obj['body'].addClass(self.selector.stopScrolling);
				self.$obj['body'].css('top', -self.scroll);
				self.scrollTemp = self.scroll;
			}
		},

		// Возвращает высоту экрана
		windowHeight: function () {
			return this.$obj['window'].height();
		},

		// Возвращает количество скринов
		screensCount: function () {
			return this.screen.length - 1;
		},

		// Обсчёт скринов и скидывание данных в массив
		screensArray: function () {

			var debug = false;
			var self = this;
			var from = 0;
			self.documentHeight = 0;

			if (debug) {
				console.clear();
				console.error('screensArray');
				console.info('----------------');
			}

			self.$obj['screens'].each(function (i) {
				i++;

				var $this = $(this);

				if (self.screen[i] == null) {
					self.screen[i] = {id: '', from: 0, to: 0, height: 0, showed: false, obj: false};
					//self.screen[i] = {};
				}

				if (!self.screen[i].obj) {
					self.screen[i].obj = $(this);
				}

				//noinspection JSValidateTypes
				var height = $this.outerHeight();

				self.screen[i]['id'] = ($this[0].id == undefined) ? '' : $this[0].id;
				self.screen[i]['from'] = from;
				self.screen[i]['to'] = from + height;
				self.screen[i]['height'] = height;
				self.documentHeight = self.documentHeight + self.screen[i]['height'];
				from = from + height;

				if (debug) {
					console.log('screen - ' + i);
					console.log('id - ' + self.screen[i]['id']);
					console.log('from - ' + self.screen[i]['from']);
					console.log('to - ' + self.screen[i]['to']);
					console.log('height - ' + self.screen[i]['height']);
					console.info('----------------');
				}
			});

			if (debug) {
				console.log('Document height: ' + self.documentHeight + 'px');
			}
		},

		// Обновляем переменные scroll и scrollBottom
		updateScroll: function () {
			var debug = false;

			this.scroll = this.$obj['window'].scrollTop();
			this.scrollBottom = this.scroll + this.windowHeight();
			this.scroll_percents = (this.scroll / (this.$obj['document'].height() - this.windowHeight()) * 100).toFixed(2);

			if (debug) {
				console.clear();
				console.warn('updateScroll');
				console.log('----------------');
				console.log('Scroll: ' + this.scroll + 'px');
				console.log('Document height: ' + (this.$obj['document'].height() - this.windowHeight()) + 'px');
				console.log('Percents: ' + this.scroll_percents + '%');
			}
		},

		onScroll: function () {
			var debug = false;
			var self = this;
			var screenMiddle = this.scroll + self.windowHeight() / 2;
			var count = this.screensCount();

			if (debug) {
				console.clear();
				console.warn('onScroll');
				console.log('count screens - ' + count);
				console.log('scroll top - ' + self.scroll);
				console.log('scroll bottom - ' + self.scrollBottom);
				console.log('middle of screen - ' + screenMiddle);
				console.log('------');
			}

			// Перебор массива скринов
			$.each(self.screen, function (k, v) {
				if (!self.screen[k]) return;

				// Если диапазон скрина попадает на середину экрана, значит он "активный"
				if (screenMiddle > v['from'] && screenMiddle < v['to']) {
					self.activeScreen = k;
				}

				if (self.screen[k].showed == false && (self.scroll + self.windowHeight() - (self.windowHeight() / 100 * self.settings.beforeScroll) >= self.screen[k].from)) {
					self.screen[k].showed = true;
					self.screen[k].obj.find(self.selector.screens_content).addClass(self.selector.screens_content.slice(1) + '_showed');
				}

				// Add class "showed"
				//if (self.screen[k].showed == false && (self.scroll + self.windowHeight() - (self.windowHeight() / 100 * self.settings.beforeScroll) >= self.screen[k].from)) {
				//	self.screen[k].showed = true;
				//	self.screen[k].obj.find(self.selector.screens_content).addClass(self.selector.screens_content.slice(1) + '_showed');
				//
				//	// todo try to else :)
				//}

				// todo
				// Если from скрина меньше, чем scroll и to больше, чем scrollBottom - то скрин считается ушедшим и класс showed выпиливается


				if (debug) {
					console.log(k + ' - from:' + v['from'] + ' to:' + v['to']);
					console.log('screen ' + k + ' showed: ' + self.screen[k].showed);
					console.info('------');
				}


			});

			// Погрешность первого скрина
			if (self.scroll <= self.settings.firstScreenInfelicity) {
				self.activeScreen = 1;
			}

			// Погрешность последнего скрина
			if (self.scrollBottom >= self.screen[count]['to'] - self.settings.lastScreenInfelicity) {
				self.activeScreen = count;
				self.screen[count].showed = true;
				self.screen[count].obj.find(self.selector.screens_content).addClass(self.selector.screens_content.slice(1) + '_showed');
			}

			// Если включенны буллетсы, то присваиваем нужному класс active
			if (self.settings.use_bullets && count > 0 && self.scrolling) {
				self.$obj['bullets_item'].removeClass(self.selector.bullets_items.slice(1) + '_active');
				self.$obj['bullets_item'].eq(self.activeScreen - 1).addClass(self.selector.bullets_items.slice(1) + '_active');
			}

			// Если включен прогресс-бар, то меняем его
			if (self.settings.use_progress && count > 0 && self.scrolling) {
				var param = (self.settings.progress_position == "top" || self.settings.progress_position == "bottom") ? 'width' : 'height';
				self.$obj['progress_bar'].css(param, self.scroll_percents + '%');
			}

			if (debug) {
				console.log('Current screen: ' + self.activeScreen);
			}

		},

		// Создаем буллетсы в body
		make_bullets: function () {
			if (this.settings.use_bullets) {

				var debug = false;
				var self = this;
				var count = self.screen.length - 1;
				var cn = this.selector.bullets.slice(1);
				var cnP = ' ' + cn + '_' + self.settings.bullets_position;
				var bullets_div = '<div class="' + cn + cnP + '"></div>';

				if (debug) {
					console.log('Make bullets');
					console.log('Count: ' + count);
				}

				if (count) {
					this.$obj['body'].append(bullets_div);
					var template = "";
					template += '<div class="' + self.selector.bullets_container.slice(1) + '">\n';
					for (var i = 1; i <= count; i++) {
						template += '	<div class="' + self.selector.bullets_items.slice(1) + '" data-num="' + i + '"></div>\n';
					}
					template += '</div>\n';

					if (debug) {
						console.log(template);
					}

					$(self.selector.bullets).html(template);
					self.$obj['bullets_item'] = $(self.selector.bullets_items);

					self.$obj['bullets_item'].on('click', function (e) {
						e.preventDefault();
						self.toScreen($(this).data('num'));
					});

				}
			}
		},

		// Создаем progress bar в body
		make_progress: function () {
			if (this.settings.use_progress) {
				var debug = false;
				var self = this;
				var count = self.screen.length - 1;
				if (count) {
					if (debug) {
						console.log('Make progress bar');
					}
					var bar_styles = (self.settings.progress_position == 'top' || self.settings.progress_position == 'bottom') ? 'width: 0; height: inherit' : 'width: inherit; height: 0';
					var progress_div = '<div class="' + this.selector.progress.slice(1) + ' ' + this.selector.progress.slice(1) + '_' + this.settings.progress_position + '"><div style="' + bar_styles + '" class="' + this.selector.progress_bar.slice(1) + '"></div></div>';
					this.$obj['body'].append(progress_div);
					self.$obj['progress'] = $(self.selector.progress);
					self.$obj['progress_bar'] = $(self.selector.progress_bar);
				}
			}
		},

		// Получаем номер скрина по его ID
		getNumber: function (screen) {
			var self = this;
			for (var i = 1; i < self.screen.length; i++) {
				if (self.screen[i].id === screen) {
					return i;
				}
			}
		},

		// Перемотка к скрину № или ID
		toScreen: function (screen) {
			var self = this;
			if (!self.scrolling) {
				return false;
			}
			var screen_num = (!isNaN(screen)) ? screen : self.getNumber(screen);
			if (!self.screen[screen_num]) {
				return false;
			}
			var scrollTop = (self.screen[screen_num].height >= self.windowHeight()) ? self.screen[screen_num].from : (self.screen[screen_num].from - self.windowHeight() / 2 + self.screen[screen_num].height / 2);

			if (self.settings.use_easing) {
				self.$obj['bodyScroll'].stop().animate({
					scrollTop: scrollTop
				}, self.settings.scrollAnimationTime, self.settings.easing);

			} else {
				self.$obj['bodyScroll'].stop().animate({
					scrollTop: scrollTop
				}, self.settings.scrollAnimationTime);
			}
		},

		init: function (options) {

			this.settings = $.extend(this.settings, options);

			var self = this;

			self.$obj['window'] = $(self.selector.window);
			self.$obj['bodyScroll'] = $(self.selector.bodyScroll);
			self.$obj['body'] = $(self.selector.body);
			self.$obj['document'] = $(document);
			self.$obj['screens'] = $(self.selector.screens);
			self.$obj['progress'] = null;
			self.$obj['progress_bar'] = null;

			//self.$obj['menu'] = $(self.selector.menu);
			//self.$obj['menu_item'] = $(self.selector.menu_items);
			//self.$obj['menu_button'] = $(self.selector.menu_button);

			self.screensArray();
			self.make_bullets();
			self.make_progress();
			self.updateScroll();
			self.onScroll();

			//self.$obj['menu_button'].on('click', function () {
			//	self.$obj['menu'].toggleClass('menu_show');
			//	self.toggleScrolling();
			//});
			//
			//self.$obj['menu_item'].on('click', function (e) {
			//	e.preventDefault();
			//
			//	self.$obj['menu'].removeClass('menu_show');
			//	self.toggleScrolling('start');
			//	self.toScreen($(this).data('num'));
			//	return false;
			//});

			var timer = false;
			self.$obj['window'].bind('resize', function () {
				if (timer) clearTimeout(timer);
				timer = setTimeout(function () {
					self.screensArray();
					self.updateScroll();
					self.onScroll();
				}, 500);
			});

			self.$obj['window'].bind('scroll', function () {
				self.updateScroll();
				self.onScroll();
			});


		}
	};

	// Экспорт методов и переменных
	var exportMethods = {};
	exportMethods.scroll = screensModule.scroll;
	exportMethods.scrollBottom = screensModule.scrollBottom;
	exportMethods.activeScreen = screensModule.activeScreen;
	exportMethods.scrolling = screensModule.scrolling;
	exportMethods.height = screensModule.windowHeight.bind(screensModule);
	exportMethods.toggleScrolling = screensModule.toggleScrolling.bind(screensModule);
	exportMethods.toScreen = screensModule.toScreen.bind(screensModule);
	exportMethods.init = screensModule.init.bind(screensModule);

	window.screens = exportMethods;

})();