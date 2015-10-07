/*
	Copyright 2015 Israel Diaz
	
	This file is part of Laika´s Escape.

    Laika´s Escape is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Laika´s Escape is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Laika´s Escape.  If not, see <http://www.gnu.org/licenses/>.

*/

define(['underscore', 'backbone', 'Alien', 'Astronaut', 'ScoreDisplay', 'LifeBar', 'ModalWindow', 'easel', 'preload', 'sound', 'tween'], function(_, Backbone, Alien, Astronaut, ScoreDisplay, LifeBar, ModalWindow){
	
	
	//GAME DEFINITION
	var GameView = Backbone.View.extend({

		//GAME PROPERTIES/VARIABLES
		//general
		root: this,
		font: 'Bowlby One SC',
		canvas: "game_canvas",
		stage: null,
		container: null,
		preload: null,
		images: [],
		
		// window/canvas size
		defaultWidth: 1280,
		defaultHeight:  768,
		defaultRatio: 0,
		actualWidth: 0,
		actualHeight: 0,
		width: 0,
		height: 0,
		ratio: 0,
		pixelRatio: 1,
		stageScale: 1,
		user_agent: null,
		
		// enemies variables
		enemies_config: [ 'img/alien1.png', 'img/alien2.png', 'img/alien3.png', 'img/blood.png' ],
		enemies_int_min: 0,
		enemies_int_max: 0,
		enemies_int_min_default: 900,
		enemies_int_max_default: 1500,
		enemies_minInterval: 680,
		enemies_nextTime: 0,
		enemies_simultaneous: 0,
		enemies_max_simultaneous: 4,
		enemiesCount: 0,
		enemiesSmashed: 0,
		enemies_combo_flag: false,
		enemies_combo_hits: 0,
		enemies_combo_min: 2,
		enemies_combo_delay: 1000,
		enemies_combo_newTime: 0,
		enemies_combo_applause: 3,
		
		// astronaut variables
		astronaut: null,
		astronaut_generate: true,
		astronaut_int_min: 1800,
		astronaut_int_max: 3500,
		astronaut_nextTime: 0,
		
		// game variables
		level: 1,
		holes_number: 6,
		holes_used: [],
		holes_masks: [],
		
		// pause
		pause_btn: null,
		pause: false,
		pause_x: 120,
		pause_y: 57,
		isGameRunning: false,
		stopUpdating: false,
		
		
		// background music
		music: null,
		music_max_volume: 0.5,
		mute_btn: null,
		mute_flag: true,
		muting_active: false,
		mute_x: 60,
		mute_y: 57,
		
		// life bar
		life_bar: null,
		stopLifeBar: false,
		
		// score variables
		score_display: null,
		smashed_text: null,
		
		
		
		
		
		/*-----------------------------------------------------------------------------*/
		/*-----------------------------------  INIT  ----------------------------------*/
		/*-----------------------------------------------------------------------------*/
		initialize: function(){
			var scope = this;
			
			//bind scope
			_.bindAll(this, 'tick', 'startGame', 'gameOver', 'playNextLevel', 'theEnd', 'pauseGame', 'showAstronaut', 'showEnemy', 'getFreeHole', 'onResize', 'configTabVisibility', 'resizeCanvas',  'handleFileComplete', 'handleFileLoad', 'setupCanvasResolution' );

			//create Stage Object
			this.stage = new createjs.Stage(this.canvas);
			createjs.Touch.enable(this.stage);
			
			//config canvas display settings (dimensions, ratio, hidpi devices, etc...)
			this.setupCanvasResolution();
			
			//load images, background, audio, etc..
			this.loadAssets();
			
			//fullscreen
			//this.launchIntoFullscreen(document.documentElement);
		},
		
		
		
		
		
		
		/*-----------------------------------------------------------------------------*/
		/*----------------------------  PRELOAD METHODS  ------------------------------*/
		/*-----------------------------------------------------------------------------*/
		
		//PRELOAD GAME ASSETS
		loadAssets: function(){
			
			//load queue
			this.preload = new createjs.LoadQueue(true);
			this.preload.installPlugin(createjs.Sound);
			createjs.Sound.alternateExtensions = ["mp3", "ogg"];
			
			//add event handlers
			this.preload.on("fileload", this.handleFileLoad);
			this.preload.on("complete", this.handleFileComplete);
			this.preload.on("error", this.handleError);
			this.preload.on('fileprogress', this.handleFileProgress);
			this.preload.on('progress', this.handleProgress);
			//this.preload.load();
			
			
			//ASSETS
			//bg
			this.preload.loadFile({id:"bg", src: "img/icon_alien.png"});
			this.preload.loadFile({id:"pauseSprite", src: "img/pause.png"});
			
			
			
			//enemies list
			for(var i = 0; i < this.enemies_config.length; i++){
				this.preload.loadFile({id:"alien"+i, src: this.enemies_config[i]});
			}
			
			//astronaut
			this.preload.loadFile({id:"astronaut", src: "img/astronaut.png"});
			
			//modal window
			this.preload.loadFile({id:"modalWindow", src: "img/modalWindow_sprite.png"});
			
			//music
			this.preload.loadFile({id:"muteSprite", src: "img/mute.png"});
			this.preload.loadFile({id:"musicFX", src: "sound/LaikasEscape.mp3"});
			
			
			//sound fx
			this.preload.loadFile({id:"fx_flan", src: "sound/flan.mp3"});
			this.preload.loadFile({id:"fx_fly", src: "sound/fly.mp3"});
			this.preload.loadFile({id:"fx_worm", src: "sound/worm.mp3"});
			this.preload.loadFile({id:"fx_smash1", src: "sound/smash_1.mp3"});
			this.preload.loadFile({id:"fx_smash2", src: "sound/smash_2.mp3"});
			this.preload.loadFile({id:"fx_hurt", src: "sound/hurt.mp3"});
			this.preload.loadFile({id:"laikaGroan", src: "sound/laika_groan.mp3"});
			this.preload.loadFile({id:"gameOver", src: "sound/game_over.mp3"});
			this.preload.loadFile({id:"combo", src: "sound/ding.mp3"});
			this.preload.loadFile({id:"applause", src: "sound/applause.mp3"});
			this.preload.loadFile({id:"admiration", src: "sound/ooooh.mp3"});
		},
		
		
		handleFileLoad: function(e){
			//console.log('File loaded', e);
			//$state.text( '[' + e.item.id + ' loaded] ');
		},
		
		//HANDLE ERROR
		handleError: function(e){
			//conole.log(e)
		},
		
		
		handleFileProgress: function(e){
			//console.log('File progress', event);
		},
		
		
		handleProgress: function(e){
			var progress = Math.round(e.loaded * 100);
			var preloader = document.getElementById("progressbar");
			
			//update percentage text
			var percent = preloader.getElementsByClassName("percent")[0];
			percent.innerHTML = "Loading "+progress+"%";
			
			//update progress bar
			var progressbar = preloader.getElementsByClassName("bar")[0];
			progressbar.style.width =  progress + '%';
		},
		
		
		//ALL FILES COMPLETE LOADING
		handleFileComplete: function(){
			var scope = this;
			
			
			/////////////////////////////////////////////////////
			//HIDE PRELOADER FROM HTML DOM
			var preloader = document.getElementById("progressbar");
			$(preloader).fadeOut();
			
			
			
			

			/////////////////////////////////////////////////////
			//ASSETS DISPLAY AND CONFIG
			//Game sprite´s Main Container
			this.container = new createjs.Container();
			this.container.x = 0;
			this.container.y = 0;
			this.stage.addChild( this.container );
			
			
			//Hole Masks
			var hole0_g = new createjs.Graphics();
			hole0_g.f("rgba(150,198,221,254)").p("EA9aAR0Mg3KAAAMAAAAs2IMMAAYAAAKAAAUAAAUYAKC0FoAoImA8YDwAeEsgyCWg8YD6huBahGAehGIMCAAMAAAgs2").cp().ef();
			var hole1_g = new createjs.Graphics();
			hole1_g.f("rgba(150,198,221,254)").p("EA4GAR0MAAAAwwIMCAAYAADSI6CqLGAAYLGAAI6iqAAjSIJYAAMAAAgwwMg9aAAA").cp().ef();
			var hole2_g = new createjs.Graphics();
			hole2_g.f("rgba(150,198,221,254)").p("ECpOARqMg1cAAAMAAAAsYILaAAYAKAUAUAUAUAUYCWBkEOCMIcAAYISAAG4iMAAigIAAAAILGAAMAAAgsY").cp().ef();
			var hole3_g = new createjs.Graphics();
			hole3_g.f("rgba(150,198,221,254)").p("EBMkAjUMg+qAAAMAAAA0+IJsAAYAUDIE2DILuAAYFKAAImAADwg8YFohQDmiWAehuII6AAMAAAg0+").cp().ef();
			var hole4_g = new createjs.Graphics();
			hole4_g.f("rgba(150,198,221,254)").p("ECU6AmcMhKiAAAMAAAA6mIMMAAYAoDSKKC+NIAAYH+AAJsg8E2hkYDIhGCghaAohQIJsAAMAAAg6m").cp().ef();
			var hole5_g = new createjs.Graphics();
			hole5_g.f("rgba(150,198,221,254)").p("EDBmAjUMg9kAAAMAAAAwSIJiAAYAeBuC+A8C+A8YDcBQFAAUFKAAYJsAKH+iMB4jIIMgAAMAAAgwS").cp().ef();
			
			var hole0_mask = new createjs.Shape(hole0_g);
			var hole1_mask = new createjs.Shape(hole1_g);
			var hole2_mask = new createjs.Shape(hole2_g);
			var hole3_mask = new createjs.Shape(hole3_g);
			var hole4_mask = new createjs.Shape(hole4_g);
			var hole5_mask = new createjs.Shape(hole5_g);
			this.holes_masks.push(hole0_mask, hole1_mask, hole2_mask, hole3_mask, hole4_mask, hole5_mask );
			
			for(var i =0; i<6; i++){
				var item = this.holes_masks[i];
				//item.scaleX = item.scaleY = this.pixelRatio;
				//item.x = 4;
				//item.y = -3;
				//this.stage.addChild(item)
				//item.alpha = .4
			}
			
			
			
			//Score display
			this.score_display = new ScoreDisplay();
			this.score_display.sprite.x = this.stage.canvas.width - (this.stage.canvas.width * .1);
			this.score_display.sprite.y = 50;
			this.stage.addChild( this.score_display.sprite );
			
			
			//Smashed Enemies Text
			this.smashed_text = new createjs.Text("", "46px " + scope.font, "#FA8C14");
			this.smashed_text.y = 180; 
			this.smashed_text.x = (this.width / 2) ;
			this.smashed_text.regY = this.smashed_text.getMeasuredHeight() / 2;
			this.smashed_text.alpha = 0;
			this.smashed_text.scaleX = this.smashed_text.scaleY = 0;
			
			
			//enemies
			//this.showEnemy();
			
			//Astronaut
			this.configAstronaut();	
			
			//life bar config
			this.configLifeBar();
			
			//welcome window
			this.configModalWindow();	
			
			//pause button
			var pauseSheet = new createjs.SpriteSheet({
			    images: [this.preload.getResult('pauseSprite')],
			    frames: [
			    	[0, 0, 50, 50, 0, 25, 25],
			    	[50, 0, 50, 50, 0, 25, 25]
			    ]
			});
			
			this.pause_btn = new createjs.Sprite(pauseSheet);
			this.pause_btn.alpha = 0;	//hide button on init
			this.pause_btn.x = this.pause_x;
			this.pause_btn.y = this.pause_y;
			this.pause_btn.on("click", function(){
				scope.pauseGame();	// pause game
			});
			this.stage.addChild(this.pause_btn);
			
			
			
			//mute button
			var muteSheet = new createjs.SpriteSheet({
			    images: [this.preload.getResult('muteSprite')],
			    frames: [
			    	[0, 0, 50, 50, 0, 25, 25],
			    	[50, 0, 50, 50, 0, 25, 25]
			    ]
			});
			this.mute_btn = new createjs.Sprite(muteSheet);
			this.mute_btn.alpha = 0;	//hide button on init
			this.mute_btn.y = this.mute_y;
			this.mute_btn.x = this.mute_x;
			this.mute_btn.on("click", function(){
				//is audio fading out? (flag)
				scope.muting_active = true;
				//change sprite frame
				scope.mute_btn.gotoAndStop( scope.mute_flag ? 1 : 0);
				//mute flag
				scope.mute_flag = !scope.mute_flag;
			});
			this.stage.addChild(this.mute_btn);



			//RENDER
			this.render();
			
			
			
			
			/////////////////////////////////////////////////////
			//WINDOW CONFIG/LISTENERS
			//tab/document properties (visibility, unload, etc...)
			this.configTabVisibility();
			
			
			/////////////////////////////////////////////////////
			//GAME RESET
			//reset game config
			this.reset();
			
			
			/////////////////////////////////////////////////////
			//setTimeout(scope.setupCanvasResolution, 2000)
			window.addEventListener('resize', this.onResize, false);
			scope.onResize();
			
			
			/////////////////////////////////////////////////////
			//show default window
			this.modalWindow.show();
			
		},
		
		
		
		
		
		
		
		/*-----------------------------------------------------------------------------*/
		/*---------------------------  ASSETS CONFIGURATION  --------------------------*/
		/*-----------------------------------------------------------------------------*/
		
		//MODAL WINDOW
		configModalWindow: function(){
			var scope = this;		
			
			//create/config ModalWindow object
			scope.modalWindow = new ModalWindow();
			scope.modalWindow.sprite.x = Math.round(scope.width / 2) ;
			scope.stage.addChild( scope.modalWindow.sprite );
			
			//on click
			scope.modalWindow.sprite.on('click', function(){
				scope.modalWindow.hide();
				
				//START GAME
				setTimeout(scope.startGame, 600, scope);
				
				//begin ambient music
				scope.mute_btn.alpha = 1;
				scope.music = createjs.Sound.play("musicFX", "none", 0, 0, -1, scope.music_max_volume);
			});
		},
		
		
		
		//LIFE BAR
		configLifeBar: function(){
			var scope = this;
			
			//create life bar
			scope.life_bar = new LifeBar();
			scope.life_bar.sprite.x = (scope.width / 2) - (scope.life_bar.width / 2);
			scope.life_bar.sprite.y = 120;
			scope.life_bar.sprite.alpha = 0;	//hide bar on init
			scope.life_bar.on('madeIt', function(){
				if(scope.isGameRunning)
					scope.playNextLevel();
			});
			scope.life_bar.on('timeUp', function(){
				setTimeout(scope.gameOver, 200);
			});
			scope.stage.addChild( scope.life_bar.sprite );
		},
		
		
		
		
		//ASTRONAUT
		configAstronaut: function(){
			var scope = this;
			
			
			//create and config Astronaut
			this.astronaut = new Astronaut();
			this.astronaut.on('dead', this.gameOver);
			this.astronaut.on( 'hit', function(){
				//life line update
				//scope.life_bar.slowHero(10);
				
				//verify if the astronaut is has lifes
				if(this.getLifes() > 0){
					
					//display the remaining number of attempts
					var text = new createjs.Text(this.getLifes(), "40px " + scope.font, "#FF0000");
					text.y = this.sprite.y - 120; 
					text.x = this.sprite.x;
					text.regX = text.getMeasuredWidth() / 2;
					text.regY = text.getMeasuredHeight() / 2;
					text.alpha = 0;
					text.scaleX = text.scaleY = 0;
					scope.stage.addChild(text);
					
					//animate text
					createjs.Tween.get(text)
					.to({alpha: 1, scaleX: 1, scaleY: 1 }, 100, createjs.Ease.quartOut )
					.wait(100)
					.to({y: text.y-30, alpha: 0 }, 240, createjs.Ease.quartIn )
					.call( function(){
						scope.stage.removeChild(text);
					} );
				
				}
				
			});
			this.astronaut.on('gone', function(){
				//update astronaut flag, indicates wether to show the astronaut or not
				scope.astronaut_generate = true;
				
				//free the 'hole' where the astronaut appeared.
				scope.holes_used.splice( scope.holes_used.indexOf( this.hole ), 1 );
				
				//remove view
				scope.container.removeChild(this.sprite);
			});

		},
		
		
		
		
		
		
		
		/*-----------------------------------------------------------------------------*/
		/*-----------------------------  GAME FLOW METHODS  ---------------------------*/
		/*-----------------------------------------------------------------------------*/
		
		//START GAME
		startGame: function(){
			
			//Clear Game Intervals
			this.clearAll();
			
			//game is running
			this.isGameRunning = true;
			
			//we can show the astronaut (flag)
			this.astronaut_generate = true;
			this.astronaut_nextTime = createjs.Ticker.getTime(true) + (this.getRandomInt(this.astronaut_int_min, this.astronaut_int_max))
			
			//begin life line
			this.life_bar.reset();
			this.stopLifeBar = false;
			
			
			//show pause button and life bar
			createjs.Tween.get(this.pause_btn, {override:true})
			.to({alpha: 1 }, 200, createjs.Ease.easeOut );
			
			createjs.Tween.get(this.life_bar.sprite, {override:true})
			.to({alpha: 1 }, 200, createjs.Ease.easeOut );
			

		},
		
		//GAME OVER
		gameOver: function(){
			var scope = this;
			
			//game is not running
			this.isGameRunning = false;
						
			//pause life bar
			this.stopLifeBar = true;
			
			//hide pause button and life bar
			createjs.Tween.get(this.pause_btn, {override:true})
			.to({alpha: 0 }, 200, createjs.Ease.easeOut );
			
			createjs.Tween.get(this.life_bar.sprite, {override:true})
			.to({alpha: 0 }, 200, createjs.Ease.easeOut );
			
			
			////////////////////
			//Modal Window
			this.modalWindow.setWindow('gameOver');
			this.modalWindow.show();
			var point = scope.modalWindow.sprite;
			
			
			//show ghost astronaut
			scope.container.removeChild(scope.astronaut.sprite);
			scope.stage.addChild(scope.astronaut.sprite);
			scope.astronaut.gotoFrame('ghost');
			scope.astronaut.removeListeners();
			scope.astronaut.sprite.mask = null;
			scope.astronaut.sprite.alpha = 0;
		
			//animation
			createjs.Tween.get(scope.astronaut.sprite, {override:true})
			.set({x: point.x - 225, y: (scope.height/2) + 25, scaleX: 0.7, scaleY: 0.7 })
			.wait(800)
			.to({alpha: 1, y: (scope.height/2) }, 1000, createjs.Ease.quartInOut );
			
			
			//modal window click event
			setTimeout(function(){
				
				//sound fx
				createjs.Sound.play("gameOver");
				createjs.Sound.play("laikaGroan");
				
				
				//number of enemies smashed
				scope.smashed_text.text = "You killed "+scope.enemiesSmashed+" aliens";
				scope.smashed_text.regX = scope.smashed_text.getMeasuredWidth() / 2;
				scope.stage.addChild(scope.smashed_text);
				createjs.Tween.get(scope.smashed_text)
				.wait(800)
				.to({alpha: 1, scaleX: 1, scaleY: 1 }, 320, createjs.Ease.backOut );
				
				
				//click event
				scope.modalWindow.sprite.on('click', function(){
					
					//remove score
					scope.enemiesSmashed = 0;
					createjs.Tween.get(scope.smashed_text)
					.to({alpha: .1, scaleX: 0, scaleY: 0}, 240, createjs.Ease.backIn )
					.call( function(){
						scope.stage.removeChild(scope.smashed_text);
					} );
					
					//hide modal window
					scope.modalWindow.hide();
					
					//astronaut
					createjs.Tween.get(scope.astronaut.sprite, {override:true})
					.to({alpha: 0, y: (scope.stage.canvas.height/2) - 60 }, 380, createjs.Ease.quadIn );
					
					
					///
					setTimeout( function(){
						//astronaut
						scope.stage.removeChild(scope.astronaut.sprite);
						scope.container.addChild(scope.astronaut.sprite);
						
						//reset Game
						scope.reset();
						scope.startGame();
					}, 800);
				});
				
			}, 1000);
		},
		
		
		//THE END...
		theEnd: function(){
		},
		
		
		//NEXT LEVEL CONFIG
		playNextLevel: function(){
			var scope = this;
			
			//Clear Game Intervals
			this.clearAll();
			
			//pause life bar
			this.stopLifeBar = true;
			
			//pause tick
			createjs.Ticker.setPaused(true);
			
			
			//hide pause button and life bar
			createjs.Tween.get(this.pause_btn, {override:true})
			.to({alpha: 0 }, 200, createjs.Ease.easeOut );
			
			createjs.Tween.get(this.life_bar.sprite, {override:true})
			.to({alpha: 0 }, 200, createjs.Ease.easeOut );
			
			
			//update config
			this.level++;
			this.enemies_int_min -= 120;
			this.enemies_int_max -= 180;
			this.astronaut_int_min -= 100;
			this.astronaut_int_max -= 100;
			
			//simultaneous enemies
			this.enemies_simultaneous += (this.level % 4 === 0) ? 1 : 0;
			
			
			//limits
			if( this.enemies_int_min <= this.enemies_minInterval){
				this.enemies_int_min = this.enemies_minInterval;
			}
			if( this.enemies_int_max <= this.enemies_minInterval + 600){
				this.enemies_int_max = this.enemies_minInterval + 600;
			}
			
			if( this.astronaut_int_min <= 10){
				this.astronaut_int_min = 10;
			}
			if( this.astronaut_int_max <= 80){
				this.astronaut_int_max = 80;
			}
			
			if(this.enemies_simultaneous >= this.enemies_max_simultaneous){
				this.enemies_simultaneous = this.enemies_max_simultaneous;
			}
			
			
			
			//Modal Window
			this.modalWindow.setWindow('level', "Level "+this.level);
			this.modalWindow.on('click', function(){
				return false;
			});
			this.modalWindow.show();
			setTimeout(function(){
				scope.modalWindow.hide();
				
				//unpause tick
				createjs.Ticker.setPaused(false);
				
				//start game
				setTimeout(scope.startGame, 1000);
			}, 1500);
		},
		
		
		//RESET GAME TO FIRST CONFIGURATION (LEVELS, ENEMIES, INTERVALS, ETC...)
		reset: function(){
			
			//init config
			this.clearAll();
			this.astronaut.reset();
			this.enemies_int_min = this.enemies_int_min_default;
			this.enemies_int_max = this.enemies_int_max_default;
			this.enemies_simultaneous = 0;
			this.enemies_nextTime = 0;
			this.astronaut_nextTime = 0;
			this.level = 1;
			this.score_display.reset();
			
			this.holes_used = [];
		},
		
		
		//LOOK FOR A FREE HOLE TO SHOW A CHARACTER
		getFreeHole: function(){
			var scope = this;
			var freeHoles = [];
			
			//build an array of free holes
			for(var i = 0; i < scope.holes_number; i++){
				if(scope.holes_used.indexOf(i) === -1){
					freeHoles.push(i);
				}
			}
			
			
			//if not FreeHoles where found, return false and exit function;
			if( !freeHoles.length ){
				return -1;
			}
			
			//return a random free hole
			return freeHoles[ Math.floor(Math.random() * freeHoles.length) ];
		},



		
		
		
		
		/*-----------------------------------------------------------------------------*/
		/*-----------------------  PAUSE AND GAME 'TICK' CONTROL  ---------------------*/
		/*-----------------------------------------------------------------------------*/
		//CLEAR ALL INTERVALS AND ARRAYS
		clearAll: function(){
			
			//init config
			this.enemiesCount = 0;
			this.resetComboSettings();
		},
		
		
		
		
		//PAUSE GAME
		pauseGame: function(_flag){
			var scope = this;
			
			//if game is not running yet, return void
			if(!scope.isGameRunning){
				return;
			}
			
			
			////////////////////////////////////////
			//update or force pause status
			this.pause = _flag || !this.pause;
			
			//
			if( this.pause ){
				
				//pause ticker
				createjs.Ticker.setPaused(true);
				
				
				//Show a modal window
				this.modalWindow.setWindow('pause');
				this.modalWindow.show();
				this.modalWindow.sprite.on('click', function(){
					//remove pause
					scope.pauseGame(false);
				});
				
				setTimeout(function(){
					this.stopUpdating = true;
				}, 1200);
				
			} else {
				
				//remove pause of ticker
				//setTimeout(function(){
					createjs.Ticker.setPaused(false);
					this.stopUpdating = false;
				//}, 800);
								
				
				//Hide the Modal Window
				this.modalWindow.hide();
			}
			
		},
		
		
		
				
		
		
		
		
		
		
		/*-----------------------------------------------------------------------------*/
		//------------------------ SHOW / HIDE ASTRONAUT AND ENEMIES ------------------//
		/*-----------------------------------------------------------------------------*/
		
		//SHOW ASTRONAUT
		showAstronaut: function(){
			var scope = this;
			
			//check if there´s ay free hole before creating the astronaut
			var hole = this.getFreeHole();
			if( hole === -1 ){
				return false;
			}
			
			//hole position
			scope.holes_used.push(hole);
			
			//display astronaut
			scope.container.addChild(scope.astronaut.sprite);
			scope.container.setChildIndex(scope.astronaut.sprite, hole);
			scope.astronaut.setHole( hole, scope.holes_masks[hole]);
		},
		
		
		//SHOW ENEMY
		showEnemy: function(){
			var scope = this;
						
			//check if there´s ay free hole before creating the enemy
			var hole = this.getFreeHole();
			if( hole === -1 ){
				return false;
			}
			
			//hole position
			scope.holes_used.push(hole);
			
			
			////////////////////////
			//CREATE ENEMY
			var enemy = new Alien();	
			enemy.index = scope.enemiesCount++;
			
			//enemy events
			enemy.on( 'hit', function(){
				//enemie bounds
				var enemyBounds = this.sprite.getBounds();
				
				//life line update
				scope.life_bar.slowEnemy(4);
				
				//update number of shamshed enemies
				scope.enemiesSmashed++;
				
				//init hit combo timer
				if(!scope.enemies_combo_flag){
					scope.enemies_combo_newTime =  createjs.Ticker.getTime(true) + scope.enemies_combo_delay;
					scope.enemies_combo_flag = true;
					scope.enemies_combo_hits++;
					
				} else {
					scope.enemies_combo_hits++;
				}
				
				
				//check if this is a normal or combo hit and display/update point scored
				var comboHits = scope.isComboHit();	
				if( scope.isComboHit() ){
					//play sound
					createjs.Sound.play("combo");
					
					//update score display
					scope.score_display.update( this.score_value * comboHits);
					
					//points display
					var comboText = new createjs.Text("Combo "+comboHits+"x", "50px " + scope.font, "#ee2233");
					comboText.y = (this.sprite.y) - ((enemyBounds.height / 2)); 
					comboText.x = (this.sprite.x) - 22;
					comboText.regX = comboText.getMeasuredWidth() / 2;
					comboText.regY = comboText.getMeasuredHeight() / 2;
					comboText.alpha = 0;
					comboText.scaleX = comboText.scaleY = 0;
					scope.stage.addChild(comboText);
					createjs.Tween.get(comboText)
					.to({alpha: 1, scaleX: 1, scaleY: 1 }, 100, createjs.Ease.backInOut )
					.wait(240)
					.to({y: comboText.y-140, alpha: 0 }, 320, createjs.Ease.quartIn )
					.call( function(){
						scope.stage.removeChild(comboText);
					} );
					
				////////		
				} else {
					
					//update score display
					scope.score_display.update( this.score_value );
				
					var text = new createjs.Text("+"+this.score_value, "40px " + scope.font, "#FA8C14");
					text.y = (this.sprite.y) - ((enemyBounds.height / 2) + 20); 
					text.x = (this.sprite.x) - (text.getMeasuredWidth() / 2);
					text.regX = text.getMeasuredWidth() / 2;
					text.regY = text.getMeasuredHeight() / 2;
					text.alpha = 0;
					text.scaleX = text.scaleY = 0;
					scope.stage.addChild(text);
					createjs.Tween.get(text)
					.to({alpha: 1, scaleX: 1, scaleY: 1 }, 100, createjs.Ease.quartOut )
					.wait(100)
					.to({y: text.y-30, alpha: 0 }, 240, createjs.Ease.quartIn )
					.call( function(){
						scope.stage.removeChild(text);
					} );
				}
			});
			
			enemy.on( 'miss', function(){
				
				//update life line
				scope.life_bar.speedEnemy(4);
			});
			
			enemy.on('enemyGone', function(){
				//free the 'hole' where the enemy appeared.
				scope.holes_used.splice( scope.holes_used.indexOf( this.hole ), 1 );
				
				//remove view
				scope.container.removeChild(this.sprite);
			});
			
			
			//display enemy
			scope.container.addChild(enemy.sprite);
			scope.container.setChildIndex(enemy.sprite, hole);
			enemy.setHole( hole, scope.holes_masks[hole]);
			
			
		},
		
		
		
		
		////////////////
		//CHECK IF THE HIT TO THE ENEMY IS A COMBO
		isComboHit: function(){
			//verify if we have a combo and return No. of Hits.
			if(this.enemies_combo_hits >= this.enemies_combo_min){
				return (this.enemies_combo_hits-this.enemies_combo_min);
			}
			
			return false;
		},
		
		
		resetComboSettings: function(){
			this.enemies_combo_flag = false;
			this.enemies_combo_hits = 0;
		},
		
		
		
		
		
		
		
		/*-----------------------------------------------------------------------------*/
		/*-------------------------- 	  RENDER AND TICK    --------------------------*/
		/*-----------------------------------------------------------------------------*/
		
		//RENDER CANVAS
		render: function(){
			//create project 'tick' (animation loop)
			createjs.Ticker.useRAF = true;
			createjs.Ticker.setFPS(30);
			createjs.Ticker.addEventListener("tick", this.tick);
		},
		
		
		//TICK
		tick: function(e){
			
			//MUTE MUSIC
			//if we are fading the music...
			if( this.muting_active ){
				
				//volume fade in/out
				var volumeAmount = (this.mute_flag) ? 0.04 : -0.04;
				this.music.volume += volumeAmount;
							
				//handle volume
				if(this.music.volume >= this.music_max_volume){
					this.music.volume = this.music_max_volume;
					this.muting_active = false;	// stop fading
					
				} else if(this.music.volume <= 0){
					this.music.volume = 0;
					this.muting_active = false;	//stop fading
				}
			}
			
			
			
			//show characters
			if(!e.paused && this.isGameRunning){
				
				//ticker time (skipping paused time)
				var tickerTime = createjs.Ticker.getTime(true);
				
				//ENEMIES
				if( this.enemies_nextTime < tickerTime ){
					this.enemies_nextTime = tickerTime + (this.getRandomInt(this.enemies_int_min, this.enemies_int_max));
					
					var enemies_number = 1 + Math.round( Math.random() * this.enemies_simultaneous );
					for(var i = 0; i< enemies_number; i++){
						this.showEnemy();
					}
				}
				
				//ASTRONAUT
				if( this.astronaut_nextTime < tickerTime && this.astronaut_generate){
					this.astronaut_nextTime = tickerTime + (this.getRandomInt(this.astronaut_int_min, this.astronaut_int_max));
					this.astronaut_generate = false;
					
					this.showAstronaut();
				}
				
				
				
				//HIT COMBO
				if( this.enemies_combo_flag){
					
					if(this.enemies_combo_newTime < tickerTime ){
						//if combo hits were more than the 'admiration' limit
						//play sound
						if(this.enemies_combo_hits > this.enemies_combo_applause){
							createjs.Sound.play("applause");
							if (this.enemies_combo_hits > this.enemies_combo_applause + 1)
								createjs.Sound.play("admiration");
						}
						
						//reset combo values
						this.resetComboSettings();
					}
				}
				
				
				
				//LIFEBAR
				if(!this.stopLifeBar)
					this.life_bar.update();
			}
			
			
			////////////////////
			//redraw stage
			if(!this.stopUpdating)
				this.stage.update();
			
		},
		
		
		
		
		/*-----------------------------------------------------------------------------*/
		/*----------------- 	  BROWSER WINDOW CONFIG AND EVENTS    -----------------*/
		/*-----------------------------------------------------------------------------*/
		
		//SETUP CANVAS RESOLUTION
		setupCanvasResolution:function(){
			
			//set initial canvas values for default
			this.defaultWidth = 1280//this.stage.canvas.width;
			this.defaultHeight = 768//this.stage.canvas.height;
			this.defaultRatio = this.defaultWidth / this.defaultHeight;			
			
			//Pixel Ratio Definition
			var ctx = this.stage.canvas.getContext("2d");
			var devicePixelRatio = window.devicePixelRatio || 1;
			var backingStoreRatio = ctx.webkitBackingStorePixelRatio ||
                            		ctx.mozBackingStorePixelRatio ||
									ctx.msBackingStorePixelRatio ||
									ctx.oBackingStorePixelRatio ||
									ctx.backingStorePixelRatio || 1;
			this.pixelRatio = devicePixelRatio / backingStoreRatio;
		},
		
		
		resizeCanvas: function(){
			//depending on some devieces, height may vary
			//here we calculate the 'actual' canvas height vs. the 'default' game´s height
			var ratio = parseInt(this.stage.canvas.style.width, 10) / this.defaultWidth;
			var refRatio = this.defaultHeight / (this.defaultHeight * ratio);
			var totalHeight = parseInt(this.stage.canvas.style.height, 10) * refRatio;
			
			//update actual width and height references (used for responsive positioning)
			this.width = this.defaultWidth;
			this.height = Math.round(totalHeight);
			
			
			// Simple "fit-to-screen" scaling
			this.stageScale = this.stage.canvas.width / this.defaultWidth;
			this.stage.scaleX = this.stage.scaleY = this.stageScale;
			
			//get new width/height depending on window ratio
			var actualRatio = window.innerWidth / window.innerHeight;
			if(actualRatio < this.defaultRatio){
				if(!this.pause)
					this.pauseGame(true);
				
			} else {}
			
		},
		
		
		
		
		//ON RESIZE
		onResize:	function(){
			
			
			//get new canvas dimensions
			this.resizeCanvas();
			
			
			
			//MODAL WINDOW
			this.modalWindow.redraw(this.width, this.height);
			this.modalWindow.sprite.x = this.defaultWidth / 2; 
			
			
			//SCORE DISPLAY
			this.score_display.sprite.x = 1100;
			this.smashed_text.x = this.width /2;
			
			
			//LIFE BAR
			this.life_bar.sprite.x = (this.defaultWidth / 2) - (this.life_bar.width/2);
			
			
			
			//user agent detectition
			this.user_agent = navigator.userAgent.toLowerCase();
			this.android = this.user_agent.indexOf('android') > -1 ? true : false;
			this.ios = ( this.user_agent.indexOf('iphone') > -1 || this.user_agent.indexOf('ipad') > -1  ) ? true : false;
			
			//if mobile (iOS or Android), leave extraspace (offset) to avoid AdressBar
			if (this.android || this.ios) {
			    //document.body.style.height = (window.innerHeight + 50) + 'px';
			}
			
			//scroll to top
			window.setTimeout(function() {
                window.scrollTo(0,1);
	        }, 1);
	        
	        
	        
	        //INTERFACE BUTTONS
	        if(innerWidth < (768)){
				this.mute_btn.scaleX = 1.75;
		        this.mute_btn.scaleY = 1.75;
		        this.mute_btn.x = this.mute_x + 20;
		        this.mute_btn.y = this.mute_y + 30;
		        
		        this.pause_btn.scaleX = 1.75;
		        this.pause_btn.scaleY = 1.75;
		        this.pause_btn.x = this.pause_x + 60;
		        this.pause_btn.y = this.pause_y + 30;
		        
	        } else {
		        this.mute_btn.scaleX = 1;
		        this.mute_btn.scaleY = 1;
		        this.mute_btn.x = this.mute_x;
		        this.mute_btn.y = this.mute_y;
		        
		        this.pause_btn.scaleX = 1;
		        this.pause_btn.scaleY = 1;
		        this.pause_btn.x = this.pause_x;
		        this.pause_btn.y = this.pause_y;
	        }
		},
		
		
		
		
		
		//BROWSER TAB VISIBILITY
		configTabVisibility: function(){
			var scope = this;
			var prefix = scope.getPrefix();
			var hidden = 'hidden';
			var visibilityEvent =  'visibilitychange';
			
			if (prefix) {
				hidden = prefix + 'Hidden';
			}
			if (prefix) {
				visibilityEvent = prefix + 'visibilitychange';
			}
  
  
			document.addEventListener(visibilityEvent, function(){
			    if(document[hidden]) {
			        // Document is hidden 
			
			        // This re-initialize the audio element
			        // to release the audio focus
			        scope.pauseGame(true);
			        if(scope.music)
			        	scope.music.stop();
			    }
			    else {
			        // Document is focused
			        setTimeout(function(){
				        if(scope.music)
				        	scope.music.play();
							//scope.pauseGame(false);
			        }, 800);
			    }
		    },false);
		},
		
		
		
		//GET BROWSER PREFIX (Ej. -o-, -moz-, -webkit-, etc...)
		getPrefix: function(){
			// Check to see if the browser supports the unprefixed property.
			if ('hidden' in document) {
				// No prefix needed, return null.
				return null;
			}
			
			// Loop through all the possible prefixes.
			var prefixes = ['moz', 'ms', 'o', 'webkit'];
			
			for (var i = 0; i < prefixes.length; i++) {
				var testPrefix = prefixes[i] + 'Hidden';
				if (testPrefix in document) {
					return prefixes[i];
				}
			}
			
			// The API must not be supported in this browser.
			return null;
		},
		
		
		
		
		
		
		
		/*-----------------------------------------------------------------------------*/
		/*----------------------------------  UTILS  ----------------------------------*/
		/*-----------------------------------------------------------------------------*/
		
		//GET A RANDOM NUMBER
		getRandomInt: function (min, max) {
		    return Math.floor(Math.random() * (max - min + 1)) + min;
		}
		
		
	});	
		
		
		
	//RETURN GAME OBJECT
	return GameView;
});