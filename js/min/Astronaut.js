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


define(['easel', 'tween', 'sound', 'preload'], function(){
	
	//
	var Astronaut = Backbone.View.extend({
		
		//
		index: 0,					//enemy number
		sprite: null,				//Bitmap reference
		src: 'img/astronaut.png',	//Bitmap source
		hit: false,					//Boolean. Does the enemy has been hit?
		
		//sound
		fx_id: 'fx_hurt',
		
		//Array of sprite positions and dimensions. Depens on the 'hole' number.
		positions: [{x: 220, y: 360}, {x: 570, y: 380}, {x: 908, y: 390}, {x: 290, y: 525}, {x: 720, y: 538}, {x: 1040, y: 500}],
		dimensions: [{xScale: .68, yScale: .68}, {xScale: .75, yScale: .75}, {xScale: .6, yScale: .6}, {xScale: .72, yScale: .72}, {xScale: .75, yScale: .75}, {xScale: .76, yScale: .76}],		
		frameSettings: [
	    	[0, 0, 226, 389, 0, 113,  194],
	    	[226, 0, 226, 389, 0, 113,  194],
	    	[453, 0, 243, 389, 0, 124,  194],
	    	[696, 0, 219, 389, 0, 113,  194],
	    	[915, 0, 227, 389, 0, 113,  194],
	    	[1142, 0, 227, 389, 0, 113,  194]
	    ],
			    
		hole: 0,					//The 'hole' on which the sprite will appear.
		tween: null,				//sprite tween object
		score_sprite: null,
		score_value: 5,
		score_miss: 0,
		sound_smash: 'fx',
		
		life_state: 0,				//life/damage status
		life_max: 5,
		lifes: 5,
		
		delay_min: 0,
		delay_max: 260,
		
		
		
		//INIT
		initialize: function(){
		
			//bind scope
			_.bindAll(this, 'onClick', 'updateLifes', 'getLifes', 'gotoFrame', 'addListeners', 'removeListeners', 'reset', 'render', 'removeAstronaut', 'hide', 'setHole', 'close' );
			
			//update lifes
			this.updateLifes();
			
			//create sprite
			var spriteSheet = new createjs.SpriteSheet({
			    images: [this.src],
			    frames: this.frameSettings,
			    animations: {
				    idle: 0,
				    dead: 4,
				    ghost: 5
				}
			});
			this.sprite =  new createjs.Sprite(spriteSheet, 'idle');
			this.sprite.stop();
			
			
			//load sound fx
			//createjs.Sound.registerSound("sound/Laser_Shoot3.wav", this.sound_smash);
		},
		
		
		addListeners: function(){
			this.sprite.on('click', this.onClick);
		},
		removeListeners: function(){
			this.sprite.removeAllEventListeners();
		},
		
		onClick: function(){
			var scope = this;
			//dispatch 'hit' event
			scope.hit = true;
			scope.trigger('hit');
			
			//sound fx
			createjs.Sound.play(scope.fx_id);
			
			//check life status
			scope.life_state++;
			scope.gotoFrame( scope.life_state );
			
			//check life status
			if( scope.updateLifes() < 1 ){
				//remove all events
				scope.removeListeners();
				
				//animation
				scope.sprite.mask = null;
				createjs.Tween.get(scope.sprite, {override:true})
				.wait(1000)
				.to({alpha: 0, scaleX: 1.25, scaleY: 1.25 }, 200, createjs.Ease.sineIn )
				.call(function(){
					//trigger event
					scope.trigger('dead');
				});
			
				return;
			}
			
			//outro animation
			var spriteBounds = scope.sprite.getBounds();
			var tempY = scope.positions[scope.hole].y + 80;
			
			createjs.Tween.get(scope.sprite, {override:true})
			.wait(400)
			.to({y: tempY+spriteBounds.height }, 200, createjs.Ease.sineIn )
			.call(scope.removeAstronaut, null, scope);
		},
		
		
		reset: function(){
			var scope = this;
			
			//
			this.life_state = 0;
			this.removeListeners();
			this.addListeners();
			this.updateLifes();
			this.sprite.gotoAndStop( this.life_state );
		},
		
		gotoFrame: function(_target){
			this.sprite.gotoAndStop( _target );
		},
		
		updateLifes: function(){
			this.lifes = ((this.life_max) - (this.life_state + 1));
			return this.lifes;
		},
		
		getLifes: function(){
			return this.lifes - 1;
		},
		
		
		render: function(){
			var scope = this;
		
			//var spriteBounds = this.sprite.getBounds();
			var tempY = this.positions[this.hole].y + 150;
			var tempX = this.positions[this.hole].x;
			this.sprite.x = tempX;
			this.sprite.y = tempY;
			this.sprite.scaleX = this.dimensions[this.hole].xScale;
			this.sprite.scaleY = this.dimensions[this.hole].yScale;
			this.sprite.alpha = 1;
			
			//animate
			this.tween = new createjs.Tween(this.sprite)
			.to({y: this.positions[this.hole].y, scaleX: this.dimensions[this.hole].xScale, scaleY: this.dimensions[this.hole].yScale}, 260, createjs.Ease.quartOut)
			.wait(  scope.getRandomInt( scope.delay_min, scope.delay_max ) )
			.call(this.hide, null, this)
		},
		
		
		hide: function(){
			var scope = this;
			var tempY = this.positions[this.hole].y + 150;
			
			//hide
			this.tween = new createjs.Tween(this.sprite, {override:true})
			.to({y: tempY }, 300, createjs.Ease.backIn).call(function(){
				//dispatch event
				scope.removeAstronaut();
			});
		},
		
		removeAstronaut: function(){
			//dispatch event
			this.trigger('gone');
		},
		
		
		close: function(){
			this.sprite.removeAllEventListeners();
			this.unbind();
			
			this.remove();
			if (this.onClose){
				this.onClose();
			}
			
			delete this;
		},
		
		
		
		
		setHole: function( _hole, _mask ){
			this.hole = _hole;
			if( _mask ){
				this.sprite.mask = _mask;
			}
			this.render();
			
		},
		
		
		/*-----------------------------------------------------*/
		/*------------------- 	  UTILS    --------------------*/
		/*-----------------------------------------------------*/
		getRandomInt: function (min, max) {
		    return Math.floor(Math.random() * (max - min + 1)) + min;
		}
		
		
		
	});
	
	
	//
	return Astronaut;

});