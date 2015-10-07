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


define(['easel', 'tween', 'preload'], function(){
	
	//
	var ModalWindow = Backbone.View.extend({
		
		font: 'Bowlby One SC',		//font
		font_color: '#f6edda',		//hex font color
		index: 0,					//enemy number
		sprite: null,				//Bitmap reference
		overlay: null,				//overlay
		
		width: 577,
		height: 327,
		margin: 80,
		
		window: null,
		window_background: null,
		window_content: null,
		window_img_src: ["img/modalWindow_sprite.png"],
		window_frame_settings: [
		   	[0, 0, 577, 327, 0, 288,  163],
		   	[577, 0, 477, 327, 0, 238,  163],
		   	[1054, 0, 716, 437, 0, 358,  218]
		],
	    
		
		//////////////////////////////////////////////////////////////////
		///INIT
		//////////////////////////////////////////////////////////////////
		initialize: function(){
			var scope = this;
			
			//BIND
			_.bindAll(scope, 'drawOverlay', 'show', 'hide', 'setWindow', 'redraw'); // fixes loss of context for 'this' within method
			
			
			//MAIN CONTAINER
			this.sprite = new createjs.Container();
			
			//OVERLAY
			this.drawOverlay();
			
			
			//BG SPRITE
			//create sprite
			
			var spriteSheet = new createjs.SpriteSheet({
			    images: this.window_img_src,
			    frames: this.window_frame_settings,
			    animations: {
				    intro: 0,
				    level: 1,
				    gameOver: 2,
				    pause: 1,
				    end: 2
				}
			});
			this.window_background = new createjs.Sprite(spriteSheet);
			//this.window_background.scaleX = this.window_background.scaleY = .5;
			this.window_background.stop();
			
			
			//
			this.window = new createjs.Container();
			this.window.y = -300;
			this.window.addChild(this.window_background);
			this.sprite.addChild(this.window);
			this.sprite.setChildIndex(this.window, 1);
			
			
			//CREATE WINDOWS
			this.createIntroWindow();
			this.createLevelWindow();
			this.createPauseWindow();
			//this.createEndWindow();
			this.createGameOverWindow();
			
			
			//DEFINE DEFAULT WINDOW
			this.setWindow('intro');
			
			
		},
		
		
		drawOverlay: function(_w, _h){
			//if overlay exist, remove from the stage
			if(this.overlay){
				this.sprite.removeChild(this.overlay);
			}
			
			//dimensions
			var overlayWidth = _w || 1280;
			var overlayHeight = _h || 768;
			
			//create overlay
			this.overlay = new createjs.Shape( new createjs.Graphics().beginFill("rgba(0,0,0,.22)").drawRect(0, 0, overlayWidth, overlayHeight) );
			this.overlay.width = overlayWidth;
			this.overlay.height = overlayHeight;
			this.overlay.x = -(overlayWidth/2);
			
			//draw
			this.sprite.addChild(this.overlay);
			this.sprite.setChildIndex(this.overlay, 0);
		},
		
		redraw: function(_w, _h){
			this.drawOverlay(_w, _h);
			this.window.y = this.overlay.height / 2;
		},
		
		
		
		
		//////////////////////////////////////////////////////////////////
		///CREATE AND CONFIG WINDOW SPRITES/LAYOUTS
		//////////////////////////////////////////////////////////////////
		
		//INTRO WINDOW
		createIntroWindow: function(){
			var scope = this;
			
			//create container
			var content = new createjs.Container();
			content.name = 'intro';
			content.visible = false;
			
			//text
			var text = new createjs.Text("Rescue LAIKA from being devoured by the aliens!", "1.775em " + this.font, this.font_color);
			text.name = "text";
			text.textAlign = 'center'; 
			text.lineWidth = this.width - this.margin;
			text.lineHeight = 29;
			text.y = -100;
			content.addChild(text);
			
			//addChild
			this.window.addChild(content);
			
		},
		
		
		//LEVEL WINDOW
		createLevelWindow: function(){
			var scope = this;
			
			//create container
			var content = new createjs.Container();
			content.name = 'level';
			content.visible = false;
			
			
			//text
			var text = new createjs.Text("Level "+this.level, "52px " + this.font, this.font_color);
			text.name = "text";
			text.textAlign = 'center'; 
			text.lineWidth = this.width - this.margin;
			text.lineHeight = 30;
			text.y = -20;
			content.addChild(text);
			
			//addChild
			this.window.addChild(content);
			
		},
		
		
		//PAUSE WINDOW
		createPauseWindow: function(){
			var scope = this;
			
			//create container
			var content = new createjs.Container();
			content.name = 'pause';
			content.visible = false;
			
			
			//text
			var text = new createjs.Text("Pause", "52px " + this.font, this.font_color);
			text.name = "text";
			text.textAlign = 'center'; 
			text.lineWidth = this.width - this.margin;
			text.lineHeight = 30;
			text.y = -30;
			content.addChild(text);
			
			//addChild
			this.window.addChild(content);
			
		},
		
		
		//GAME OVER WINDOW
		createGameOverWindow: function(){
			var scope = this;
			
			//create container
			var content = new createjs.Container();
			content.name = 'gameOver';
			content.visible = false;
			
			//text
			var text = new createjs.Text("Game Over", "48px " + this.font, this.font_color);
			text.name = "text";
			text.textAlign = 'center'; 
			text.lineWidth = this.width - this.margin;
			text.lineHeight = 30;
			text.y = -50;
			content.addChild(text);
			
			//addChild
			this.window.addChild(content);
			
		},

	
		//END GAME WINDOW
		createEndWindow: function(){
			var scope = this;
			
			//create container
			var content = new createjs.Container();
			content.name = 'end';
			content.visible = false;
			
			//text
			var text = new createjs.Text("The End", "48px " + this.font, this.font_color);
			text.name = "text";
			text.textAlign = 'center'; 
			text.lineWidth = this.width - this.margin;
			text.lineHeight = 30;
			text.y = -100;
			content.addChild(text);
			
			
			//addChild
			this.window.addChild(content);
			
		},		
		
		
		
		
		
		
		
		
		//////////////////////////////////////////////////////////////////
		///REMOVE LISTENERS
		//////////////////////////////////////////////////////////////////
		removeListeners: function(  ){
			var scope = this;
			
			//remove all events
			this.sprite.removeAllEventListeners();
		},
		
		
		
		
		
		
		//////////////////////////////////////////////////////////////////
		//SET WINDOW TO DISPLAY
		//////////////////////////////////////////////////////////////////
		setWindow: function( _target, _text ){
					
			//display correct window background
			this.window_background.gotoAndStop(_target);
				
				
			//show / hide info that matches the '_target'	
			for (var i = 0; i < this.window.children.length; i++) {
				var currentObject = (this.window.children[i]);
				
				//hide all content except the background
				if( currentObject !== this.window_background){
					currentObject.visible = false;
				}
				
				//show target content
				if( currentObject.name === _target ){
					if(_text){
						currentObject.getChildByName("text").text = _text;
					}
				
					currentObject.visible = true;
				}
			}
		},
		
		
		
		
		//////////////////////////////////////////////////////////////////
		///SHOW/HIDE MODAL WINDOW
		//////////////////////////////////////////////////////////////////
		show: function(){
			var scope = this;
			
			//show window
			createjs.Tween.get(this.window, {override:true, ignoreGlobalPause: true})
			.wait(620)
			.to({y: this.overlay.height/2 }, 480, createjs.Ease.backOut );
			
			//show overlay
			this.overlay.visible = true;
			this.overlay.alpha = 0;
			createjs.Tween.get(this.overlay, {override:true, ignoreGlobalPause: true})
			.to({alpha: 1 }, 420 );
		},
		hide: function(){
			var scope = this;
			
			//remove listeners
			this.removeListeners();
			
			//outro animation
			createjs.Tween.get(this.window, {override:true, ignoreGlobalPause: true})
			.wait(100)
			.to({y: -this.height }, 480, createjs.Ease.backIn );
			
			//show overlay
			createjs.Tween.get(this.overlay, {override:true, ignoreGlobalPause: true})
			.to({alpha: 0, visible: false }, 420 );
		},
		
				
		
		
		//////////////////////////////////////////////////////////////////
		///OBJECT CLOSE
		//////////////////////////////////////////////////////////////////
		close: function(){
			this.sprite.removeAllEventListeners();
			this.unbind();
			this.remove();
		}
		
		
	});
	
	
	//
	return ModalWindow;

});