(function(){
	var boardWrapper = $('#boardWrapper');
	var board = $('#board');
	var codeWrapper = $('#codeWrapper');
	var code = $('#code');
	var audio = $('#audio');
	var progressBar = $('#progressBar');
	var btnPlay = $('#btnPlay');
	var btnFwd = $('#btnFwd');
	var btnRewind = $('#btnRewind');
	var btnOnex = $('#btnOnex');
	var btnTwox = $('#btnTwox');
	var btnThreex = $('#btnThreex');
	var btnVolume = $('#btnVolume');
	var volumeBar = $('#volumeBar');
	var btnFullScreen = $('#btnFullScreen');
	var sizeBar = $('#sizeBar');
	var btnBoardView = $('#btnBoardView');
	var btnCodeView = $('#btnCodeView');
	var btnSplitView = $('#btnSplitView');
	var btnPipCBView = $('#btnPipCBView');
	var btnPipBCView = $('#btnPipBCView');
	var btnPipHorizontal = $('#btnPipHorizontal');
	var btnPipVertical = $('#btnPipVertical');
	var btnHelp = $('#btnHelp');
	var spanTime = $('#spanTime');
	var divOverlay = $('#divOverlay');
	var divLoader = $('#divLoader');
	var modalHelp = $('#modalHelp');
	var playbackRateEnum = {
		onex: 1.0,
		twox: 1.5,
		threex: 2.0
	};
	var viewEnum = {
		board: 1,
		code: 2,
		split: 3,
		pipcb: 4,
		pipbc: 5,
		na: 6
	};
	var pipHorizontalEnum = {
		left: 1,
		right: 2,
		na: 3
	};
	var pipVerticalEnum = {
		top: 1,
		bottom: 2,
		na: 3
	};

	var pageData = {
			playing: false,
			toPlay: false,
			progressBy: 5,
			playbackRate: playbackRateEnum.onex,
			mute: false,
			volume: 1,
			volumeChange: 0.1,
			fullscreen: false,
			view: viewEnum.split,
			splitMin: 10,
			splitSpan: 80,
			splitSize: 50,
			pipMin: 10,
			pipSpan: 40,
			pipSize: 30,
			pipHorizontal: pipHorizontalEnum.left,
			pipVertical: pipVerticalEnum.top,
			src: window.location.search,
			dataLoaded: false,
			data: null,
			duration: 0,
			boardStart: 0,
			codeStart: 0,
			audioStart: 0,
			boardCanPlayThrough: false,
			codeCanPlayThrough: false,
			audioCanPlayThrough: false,
			currentTime: undefined,
			initialLoadDone: false,
			loaderVisible: true,
			syncing: false,
			syncAudio: 10,
			syncEveryThing: 60
	};

	// define init
	function Init(){
		setEvents();
		setInitialState();
		$('.modal').modal({});
	}

	function setEvents(){
		$(document).on('keypress', handleKeyEvents);
		progressBar.on('input', handleProgressBar);
		btnPlay.on('click', function(){
			pageData.playing = !pageData.playing;
			handlePlay();
		});
		btnFwd.on('click', handleFwd);
		btnRewind.on('click', handleRewind);
		btnOnex.on('click', function(){
			pageData.playbackRate = playbackRateEnum.onex;
			handlePace();
		});
		btnTwox.on('click', function(){
			pageData.playbackRate = playbackRateEnum.twox;
			handlePace();
		});
		btnThreex.on('click', function(){
			pageData.playbackRate = playbackRateEnum.threex;
			handlePace();
		});
		btnVolume.on('click', function(){
			pageData.mute = !pageData.mute;
			handleMute();
		});
		volumeBar.on('input', function(){
			pageData.volume = parseFloat(volumeBar.val());
			handleVolume();
		});
		btnFullScreen.on('click', function(){
			pageData.fullscreen = !pageData.fullscreen;
			handleFullScreen();
		});
		$(document).on('webkitfullscreenchange', function(){
			pageData.fullscreen = document.webkitFullscreenElement !== null;
			handleFullScreen();
		});
		sizeBar.on('input', function(){
			var size = parseFloat(sizeBar.val());
			handleSize(size);
		});
		btnBoardView.on('click', function(){
			pageData.view = viewEnum.board;
			handleView();
		});
		btnCodeView.on('click', function(){
			pageData.view = viewEnum.code;
			handleView();
		});
		btnSplitView.on('click', function(){
			pageData.view = viewEnum.split;
			handleView();
		});
		btnPipCBView.on('click', function(){
			pageData.view = viewEnum.pipcb;
			handleView();
		});
		btnPipBCView.on('click', function(){
			pageData.view = viewEnum.pipbc;
			handleView();
		});
		btnPipHorizontal.on('click', function(){
			pageData.pipHorizontal = pageData.pipHorizontal === pipHorizontalEnum.left?
															 pipHorizontalEnum.right:
															 pipHorizontalEnum.left;
			handlePipHorizontal();
		});
		btnPipVertical.on('click', function(){
			pageData.pipVertical = pageData.pipVertical === pipVerticalEnum.top?
														 pipVerticalEnum.bottom:
														 pipVerticalEnum.top;
			handlePipVertical();
		});
		btnHelp.on('click', handleHelp);
		setMediaEvents();
		setInterval(handleTime, 100);
	}

	function setMediaEvents(){
		board.on("canplaythrough", handleBoardCanPlayThrough);
		code.on("canplaythrough", handleCodeCanPlayThrough);
		audio.on("canplaythrough", handleAudioCanPlayThrough);
	}

	function setInitialState(){
		setMediaSource();
	}

	function setMediaSource(){
		board.attr("src", "./videos/" + pageData.src.replace("?path=", "") + "/camcs.mp4");
		code.attr("src", "./videos/" + pageData.src.replace("?path=", "") + "/screen.mp4");
		audio.attr("src", "./videos/" + pageData.src.replace("?path=", "") + "/audio.m4a");

		$.getJSON("./videos/" + pageData.src.replace("?path=", "") + "/data.json", handleDataLoaded);
	}

	function handleKeyEvents(){
		if(pageData.loaderVisible === true){
			return;
		}

		var evt = window.event;

		if(evt.keyCode === 118){ // v
			pageData.volume -= pageData.volumeChange;
			pageData.volume = pageData.volume < 0? 0: pageData.volume;
			handleVolume();
		} else if(evt.keyCode === 86){ // V
			pageData.volume += pageData.volumeChange;
			pageData.volume = pageData.volume > 1? 1: pageData.volume;
			handleVolume();
		} else if(evt.keyCode === 109 || evt.keyCode === 77){ // m or M
			pageData.mute = !pageData.mute;
			handleMute();
		} else if(evt.keyCode === 112){ // p
			handleRewind();
		} else if(evt.keyCode === 80){ // P
			handleFwd();
		} else if(evt.keyCode === 32){ // ' '
			pageData.playing = !pageData.playing;
			handlePlay();
		} else if(evt.keyCode === 102 || evt.keyCode === 70){ // f or F
			pageData.fullscreen = !pageData.fullscreen;
			handleFullScreen();
		} else if(evt.keyCode === 42){ // *
			if(pageData.playbackRate === playbackRateEnum.onex){
				pageData.playbackRate = playbackRateEnum.twox;
				handlePace();
			} else if(pageData.playbackRate === playbackRateEnum.twox){
				pageData.playbackRate = playbackRateEnum.threex;
				handlePace();
			} else if(pageData.playbackRate === playbackRateEnum.threex){
				pageData.playbackRate = playbackRateEnum.onex;
				handlePace();
			}
		} else if(evt.keyCode === 104 || evt.keyCode === 72){ // h or H
			handleHelp();
		} else if(evt.keyCode === 99){ // c
			pageData.view--;
			pageData.view = pageData.view === 0? viewEnum.pipbc: pageData.view;
			handleView();
		} else if(evt.keyCode === 67){ // C
			pageData.view++;
			pageData.view = pageData.view === viewEnum.na? viewEnum.board: pageData.view;
			handleView();
		} else if(evt.keyCode === 115){ // s
			if(pageData.view === viewEnum.split ||
				 pageData.view === viewEnum.pipcb ||
				 pageData.view === viewEnum.pipbc){
					var size = parseFloat(sizeBar.val());
					size -= 0.1;
					if(size < 0){
						size = 0;
					}
					handleSize(size);
				}
		} else if(evt.keyCode === 83){ // S
			if(pageData.view === viewEnum.split ||
				 pageData.view === viewEnum.pipcb ||
				 pageData.view === viewEnum.pipbc){
					var size = parseFloat(sizeBar.val());
					size += 0.1;
					if(size > 1){
						size = 1;
					}
					handleSize(size);
				}
		} else if(evt.keyCode === 100 || evt.keyCode === 68){ // d or D
			if(pageData.view === viewEnum.pipcb ||
				 pageData.view === viewEnum.pipbc){
					 if(pageData.pipHorizontal === pipHorizontalEnum.left &&
					    pageData.pipVertical === pipVerticalEnum.top){
								pageData.pipHorizontal = pipHorizontalEnum.right;
								pageData.pipVertical = pipVerticalEnum.top;
					 } else if(pageData.pipHorizontal === pipHorizontalEnum.right &&
					    			 pageData.pipVertical === pipVerticalEnum.top){
								pageData.pipHorizontal = pipHorizontalEnum.right;
								pageData.pipVertical = pipVerticalEnum.bottom;
					 } else if(pageData.pipHorizontal === pipHorizontalEnum.right &&
					    			 pageData.pipVertical === pipVerticalEnum.bottom){
								 pageData.pipHorizontal = pipHorizontalEnum.left;
								 pageData.pipVertical = pipVerticalEnum.bottom;
					 } else if(pageData.pipHorizontal === pipHorizontalEnum.left &&
					    			 pageData.pipVertical === pipVerticalEnum.bottom){
								 pageData.pipHorizontal = pipHorizontalEnum.left;
								 pageData.pipVertical = pipVerticalEnum.top;
					 }

		 			 handlePipHorizontal();
					 handlePipVertical();
				}
		}
	}

	function handleProgressBar(){
		if(pageData.syncing === false){
			pageData.loaderVisible = !pageData.loaderVisible;
			handleLoader();
		}

		if(pageData.playing === true){
			pageData.playing = false;
			pageData.toPlay = true;
			handlePlay();
	  }

		pageData.currentTime = parseInt(progressBar.val());
		board.get(0).currentTime = pageData.boardStart + pageData.currentTime;
		code.get(0).currentTime = pageData.codeStart + pageData.currentTime;
		audio.get(0).currentTime = pageData.audioStart + pageData.currentTime;
	}

	function handlePlay(){
		if(pageData.playing === false){
			board.get(0).pause();
			code.get(0).pause();
			audio.get(0).pause();
			btnPlay.find('i').removeClass('fa-pause-circle');
			btnPlay.find('i').addClass('fa-play-circle');
		} else {
			board.get(0).play();
			code.get(0).play();
			audio.get(0).play();
			btnPlay.find('i').removeClass('fa-play-circle');
			btnPlay.find('i').addClass('fa-pause-circle');
		}
	}

	function handleFwd(){
		pageData.currentTime = parseInt(progressBar.val());
		pageData.currentTime += pageData.progressBy;
		pageData.currentTime = pageData.currentTime > pageData.duration? pageData.duration: pageData.currentTime;
		progressBar.val(pageData.currentTime);
		handleProgressBar();
	}

	function handleRewind(){
		pageData.currentTime = parseInt(progressBar.val());
		pageData.currentTime -= pageData.progressBy;
		pageData.currentTime = pageData.currentTime < 0? 0: pageData.currentTime;
		progressBar.val(pageData.currentTime);
		handleProgressBar();
	}

	function handlePace(){
		board.get(0).playbackRate = pageData.playbackRate;
		code.get(0).playbackRate = pageData.playbackRate;
		audio.get(0).playbackRate = pageData.playbackRate;

		btnOnex.parent().children().removeClass('selected');
		if(pageData.playbackRate == playbackRateEnum.onex){
			btnOnex.addClass('selected');
		} else if(pageData.playbackRate == playbackRateEnum.twox){
			btnTwox.addClass('selected');
		} else if(pageData.playbackRate == playbackRateEnum.threex){
			btnThreex.addClass('selected');
		}
	}

	function handleMute(){
		if(pageData.mute === false){
			audio.prop("muted", false);
			btnVolume.find('i').removeClass('fa-volume-off');
			btnVolume.find('i').addClass('fa-volume-down');
		} else {
			audio.prop("muted", true);
			btnVolume.find('i').removeClass('fa-volume-down');
			btnVolume.find('i').addClass('fa-volume-off');
		}
	}

	function handleVolume(){
		audio.get(0).volume = pageData.volume;
		volumeBar.val(pageData.volume);
	}

	function handleFullScreen(){
		if(pageData.fullscreen === false){
			document.webkitExitFullscreen();
			btnFullScreen.find('i').removeClass('fa-compress');
			btnFullScreen.find('i').addClass('fa-expand');
		} else {
			document.documentElement.webkitRequestFullscreen();
			btnFullScreen.find('i').removeClass('fa-expand');
			btnFullScreen.find('i').addClass('fa-compress');
		}
	}

	function handleSize(size){
		sizeBar.val(size);

		if(pageData.view === viewEnum.split){
			pageData.splitSize = pageData.splitMin + parseInt(pageData.splitSpan * size);
			handleSplitView();
		} else if(pageData.view === viewEnum.pipcb){
			pageData.pipSize = pageData.pipMin + parseInt(pageData.pipSpan * size);
			handlePipCBView();
		} else if(pageData.view === viewEnum.pipbc){
			pageData.pipSize = pageData.pipMin + parseInt(pageData.pipSpan * size);
			handlePipBCView();
		}
	}

	function handleView(){
		btnBoardView.parent().children().removeClass('selected');
		if(pageData.view === viewEnum.board){
			btnBoardView.addClass('selected');
			handleBoardView();
		} else if(pageData.view === viewEnum.code){
			btnCodeView.addClass('selected');
			handleCodeView();
		} else if(pageData.view === viewEnum.split){
			btnSplitView.addClass('selected');
			handleSplitView();
		} else if(pageData.view === viewEnum.pipcb){
			btnPipCBView.addClass('selected');
			handlePipCBView();
		} else if(pageData.view === viewEnum.pipbc){
			btnPipBCView.addClass('selected');
			handlePipBCView();
		}
	}

	function handleBoardView(){
		normalizeViews();
		boardWrapper.css({
			'top': '0%',
			'left': '0%',
			'width': '100%',
			'height': '100%',
			'z-index': '1'
		});
		codeWrapper.css({
			'top': '0%',
			'left': '0%',
			'width': '100%',
			'height': '100%',
			'z-index': '0'
		});
		sizeBar.attr('disabled', 'disabled');
	}

	function handleCodeView(){
		normalizeViews();
		boardWrapper.css({
			'top': '0%',
			'left': '0%',
			'width': '100%',
			'height': '100%',
			'z-index': '0'
		});
		codeWrapper.css({
			'top': '0%',
			'left': '0%',
			'width': '100%',
			'height': '100%',
			'z-index': '1'
		});
		$('.controls-wrapper').css({
			'background': '#000'
		});
		sizeBar.attr('disabled', 'disabled');
	}

	function handleSplitView(){
		normalizeViews();
		boardWrapper.css({
			'top': '0%',
			'left': '0%',
			'width': (pageData.splitSize - 1) + '%',
			'height': '100%',
			'z-index': '0'
		});
		codeWrapper.css({
			'top': '0%',
			'left': pageData.splitSize + '%',
			'width': (100 - pageData.splitSize - 1) + '%',
			'height': '100%',
			'z-index': '0'
		});

		sizeBar.val((pageData.splitSize - pageData.splitMin)/ pageData.splitSpan);
	}

	function handlePipCBView(){
		normalizeViews();
		boardWrapper.css({
			'top': '0%',
			'left': '0%',
			'width': pageData.pipSize + '%',
			'height': '100%',
			'z-index': '1'
		});
		codeWrapper.css({
			'top': '0%',
			'left': '0%',
			'width': '100%',
			'height': '100%',
			'z-index': '0'
		});
		$('.controls-wrapper').css({
			'background': '#000'
		});
		btnPipHorizontal.removeClass('disabled');
		btnPipVertical.removeClass('disabled');

		handlePipHorizontal();
		handlePipVertical();

		sizeBar.val((pageData.pipSize - pageData.pipMin)/ pageData.pipSpan);
	}

	function handlePipBCView(){
		normalizeViews();
		boardWrapper.css({
			'top': '0%',
			'left': '0%',
			'width': '100%',
			'height': '100%',
			'z-index': '0'
		});
		codeWrapper.css({
			'top': '0%',
			'left': '0%',
			'width': pageData.pipSize + '%',
			'height': '100%',
			'z-index': '1'
		});
		btnPipHorizontal.removeClass('disabled');
		btnPipVertical.removeClass('disabled');

		handlePipHorizontal();
		handlePipVertical();

		sizeBar.val((pageData.pipSize - pageData.pipMin)/ pageData.pipSpan);
	}

	function handlePipHorizontal(){
		if(pageData.view === viewEnum.pipcb){
			if(pageData.pipHorizontal === pipHorizontalEnum.left){
				btnPipHorizontal.find('i').removeClass('fa-arrow-alt-circle-left');
				btnPipHorizontal.find('i').addClass('fa-arrow-alt-circle-right');
				boardWrapper.css({
					'left':'0%',
					'right': 'auto'
				});
			} else {
				btnPipHorizontal.find('i').removeClass('fa-arrow-alt-circle-right');
				btnPipHorizontal.find('i').addClass('fa-arrow-alt-circle-left');
				boardWrapper.css({
					'left':'auto',
					'right': '0%'
				});
			}
		} else if(pageData.view === viewEnum.pipbc){
			if(pageData.pipHorizontal === pipHorizontalEnum.left){
				btnPipHorizontal.find('i').removeClass('fa-arrow-alt-circle-left');
				btnPipHorizontal.find('i').addClass('fa-arrow-alt-circle-right');
				codeWrapper.css({
					'left':'0%',
					'right': 'auto'
				});
			} else {
				btnPipHorizontal.find('i').removeClass('fa-arrow-alt-circle-right');
				btnPipHorizontal.find('i').addClass('fa-arrow-alt-circle-left');
				codeWrapper.css({
					'left':'auto',
					'right': '0%'
				});
			}
		}
	}

	function handlePipVertical(){
		if(pageData.view === viewEnum.pipcb){
			if(pageData.pipVertical === pipVerticalEnum.top){
				btnPipVertical.find('i').removeClass('fa-arrow-alt-circle-up');
				btnPipVertical.find('i').addClass('fa-arrow-alt-circle-down');
				board.css({
					'top':'0%',
					'bottom': 'auto'
				});
			} else {
				btnPipVertical.find('i').removeClass('fa-arrow-alt-circle-down');
				btnPipVertical.find('i').addClass('fa-arrow-alt-circle-up');
				board.css({
					'top':'auto',
					'bottom': '10%'
				});
			}
		} else if(pageData.view === viewEnum.pipbc){
			if(pageData.pipVertical === pipVerticalEnum.top){
				btnPipVertical.find('i').removeClass('fa-arrow-alt-circle-up');
				btnPipVertical.find('i').addClass('fa-arrow-alt-circle-down');
				code.css({
					'top':'0%',
					'bottom': 'auto'
				});
			} else {
				btnPipVertical.find('i').removeClass('fa-arrow-alt-circle-down');
				btnPipVertical.find('i').addClass('fa-arrow-alt-circle-up');
				code.css({
					'top':'auto',
					'bottom': '10%'
				});
			}
		}
	}

	function normalizeViews(){
		boardWrapper.css({
			'z-index':'0'
		});
		board.css({
			'top': '0%',
			'bottom': 'auto'
		});
		codeWrapper.css({
			'z-index':'0'
		});
		code.css({
			'top': '0%',
			'bottom': 'auto'
		});
		$('.controls-wrapper').css({
			'background': 'transparent'
		});
		btnPipHorizontal.addClass('disabled');
		btnPipVertical.addClass('disabled');
		sizeBar.removeAttr	('disabled');
	}

	function handleHelp(){
		modalHelp.modal('open');
	}

	function handleDataLoaded(data){
		pageData.dataLoaded = true;
		pageData.data = data;
		handleCanPlayThrough();
	}

	function handleBoardCanPlayThrough(){
		pageData.boardCanPlayThrough = true;
		handleCanPlayThrough();
	}

	function handleCodeCanPlayThrough(){
		pageData.codeCanPlayThrough = true;
		handleCanPlayThrough();
	}

	function handleAudioCanPlayThrough(){
		pageData.audioCanPlayThrough = true;
		handleCanPlayThrough();
	}

	function handleCanPlayThrough(){
		if(pageData.dataLoaded === true &&
			 pageData.boardCanPlayThrough === true &&
		   pageData.codeCanPlayThrough === true &&
		   pageData.audioCanPlayThrough === true){
				pageData.boardCanPlayThrough = false;
				pageData.codeCanPlayThrough = false;
				pageData.audioCanPlayThrough = false;

				if(pageData.initialLoadDone === false){
					pageData.initialLoadDone = true;
					handleInitialLoad();
				} else {
					handleSeek();
				}
		}
	}

	function handleInitialLoad(){
		pageData.currentTime = undefined;
		pageData.duration = parseInt(pageData.data.duration, 10);
		pageData.boardStart = parseInt(pageData.data.mobile_start, 10);
		pageData.codeStart = parseInt(pageData.data.screen_start, 10);
		pageData.audioStart = parseInt(pageData.data.audio_start, 10);

		progressBar.attr('max', pageData.duration);
		board.get(0).currentTime = pageData.boardStart;
		code.get(0).currentTime = pageData.codeStart;
		audio.get(0).currentTime = pageData.audioStart;
	}

	function handleSeek(){
		if(pageData.currentTime === undefined){
			pageData.currentTime = 0;
		} else {
			if(pageData.toPlay === true){
				pageData.toPlay = false;
				pageData.playing = true;
				handlePlay();
		  }
		}

		handleTimeDisplay();
		if(pageData.syncing === false){
			pageData.loaderVisible = !pageData.loaderVisible;
			handleLoader();
		} else {
			pageData.syncing = false;
		}
	}

	function handleTime(){
		if(pageData.currentTime === undefined){
			return;
		}

		if(pageData.playing === true){
			if(pageData.currentTime < pageData.duration){
				pageData.currentTime += pageData.playbackRate / 10;
				progressBar.val(pageData.currentTime);
				handleTimeDisplay();
				handleSyncIssues();
			} else {
				pageData.loaderVisible = !pageData.loaderVisible;
				handleLoader();

				pageData.playing = !pageData.playing;
				handlePlay();

				pageData.currentTime = undefined;
				progressBar.val(0);
				board.get(0).currentTime = pageData.boardStart;
				code.get(0).currentTime = pageData.codeStart;
				audio.get(0).currentTime = pageData.audioStart;
			}
		}
	}

	function handleLoader(){
		if(pageData.loaderVisible === true){
			divOverlay.show();
			divLoader.show();
		} else {
			divOverlay.hide();
			divLoader.hide();
		}
	}

	function handleSyncIssues(){
		var boardGap = Math.floor(parseInt(board.get(0).currentTime) - pageData.boardStart);
		var codeGap = Math.floor(parseInt(code.get(0).currentTime) - pageData.codeStart);
		var audioGap = Math.floor(parseInt(audio.get(0).currentTime) - pageData.audioStart);

		if(Math.floor(pageData.currentTime) % pageData.syncAudio === 0){
			if(boardGap !== audioGap){
				handleSyncAudio(boardGap, codeGap, audioGap);
			}
		} else if(Math.floor(pageData.currentTime) % pageData.syncEveryThing === 0){
			if(boardGap !== codeGap || boardGap !== audioGap){
				handleSyncEverything(boardGap, codeGap, audioGap);
			}
		}
	}

	function handleSyncAudio(boardGap, codeGap, audioGap){
		console.log('Audio Sync lost. B:' + boardGap + ", C:" + codeGap + ", A:" + audioGap);

		if(pageData.syncing === true){
			return;
		}

		pageData.syncing = true;
		handleProgressBar();
		console.log('Audio syncup command issued.');
	}

	function handleSyncEverything(boardGap, codeGap, audioGap){
		console.log('Everything sync lost. B:' + boardGap + ", C:" + codeGap + ", A:" + audioGap);

		if(pageData.syncing === true){
			return;
		}

		pageData.syncing = true;
		handleProgressBar();
		console.log('Everything syncup command issued.');
	}

	function handleTimeDisplay(){
		var currentTimeFormatted = getFormattedTime(pageData.currentTime);
		var durationFormatted = getFormattedTime(pageData.duration);
		spanTime.find('i').text(currentTimeFormatted + " / " + durationFormatted);
	}

	function getFormattedTime(seconds){
		var minutes = Math.floor(seconds / 60);
		seconds = parseInt(seconds - minutes * 60);

		if(minutes <= 9){
			minutes = '0' + minutes;
		}

		if(seconds <= 9){
			seconds = '0' + seconds;
		}

		return minutes + ":" + seconds;
	}
	// call init
	Init();
})();



