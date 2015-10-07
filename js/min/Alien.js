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
	var Alien = Backbone.View.extend({
		
		//
		index: 0,			//enemy number
		sprite: null,		//Bitmap reference
		src: '',			//Bitmap source
		hit: false,			//Boolean. Does the enemy has been hit?
		positions: [],		//Array of sprite positions. Depens on the 'hole' number.
		dimensions: [],		//Array of sprite dimensions. Depens on the 'hole' number.
		hole: 0,			//The 'hole' on which the sprite will appear.
		tween: null,		//sprite tween object
		score_sprite: null,
		score_value: 5,
		score_miss: 3,
		
		delay_min: 400,
		delay_max: 840,
		
		//fx
		fx_sounds: [],
		fx_id: 'fx',
		
		
		//enemies configuration
		enemy: null,
		enemies_config: [
			{
				src: 'img/alien1.png',
				positions: [{x: 220, y: 335}, {x: 568, y: 345}, {x: 912, y: 335}, {x: 290, y: 510}, {x: 720, y: 540}, {x: 1040, y: 485},],
				dimensions: [{xScale: .68, yScale: .68}, {xScale: .8, yScale: .8}, {xScale: .65, yScale: .65}, {xScale: .78, yScale: .78}, {xScale: .8, yScale: .8}, {xScale: .7, yScale: .7}],
				frameSettings: [
			    	[0, 0, 224, 310, 0, 112,  155],
			    	[224, 0, 224, 310, 0, 112,  155],
			    	[448, 0, 224, 310, 0, 112,  155]
			    ],
				fx: "fx_flan"
			},
			
			{
				src: 'img/alien2.png',
				positions: [{x: 222, y: 310}, {x: 570, y: 360}, {x: 915, y: 320}, {x: 285, y: 465}, {x: 735, y: 530}, {x: 1035, y: 4685}],
				dimensions: [{xScale: .78, yScale: .78}, {xScale: .82, yScale: .82}, {xScale: .7, yScale: .7}, {xScale: .9, yScale: .9}, {xScale: .8, yScale: .8}, {xScale: .78, yScale: .78}],
				frameSettings: [
			    	[0, 0, 220, 209, 0, 110,  104],
			    	[220, 0, 220, 209, 0, 110,  104],
			    	[440, 0, 220, 209, 0, 110,  104]
			    ],
				fx: "fx_fly"

			},
			
			{
				src: 'img/alien3.png',
				positions: [{x: 210, y: 320}, {x: 555, y: 320}, {x: 905, y: 320}, {x: 290, y: 455}, {x: 700, y: 510}, {x: 1035, y: 465}],
				dimensions: [{xScale: .6, yScale: .6}, {xScale: .76, yScale: .76}, {xScale: .62, yScale: .62}, {xScale: .8, yScale: .8}, {xScale: .85, yScale: .85}, {xScale: .7, yScale: .7}],
				frameSettings: [
			    	[0, 0, 245, 395, 0, 123,  197],
			    	[246, 0, 324, 395, 0, 198,  197],
			    	[570, 0, 246, 395, 0, 123,  197],
			    ],
				fx: "fx_worm"
			}
		],
		
		//blood
		blood: null,
		blood_src: "img/blood.png",
		blood_frames: [
	    	[0, 0, 145, 78, 0, 73,  39],
	    	[145, 0, 167, 78, 0, 83, 39]
	    ],
		
		
		
		//INIT
		initialize: function(){
		
			//bind scope
			_.bindAll(this, 'render', 'removeEnemy', 'hide', 'setHole', 'close' );
			
			
			var enemieType =  Math.floor(Math.random() * 3);
			
			
			//sprite config
			this.src = this.enemies_config[ enemieType ].src;
			this.positions = this.enemies_config[ enemieType ].positions;
			this.dimensions = this.enemies_config[ enemieType ].dimensions;
			this.frameSettings =  this.enemies_config[ enemieType ].frameSettings;
			
			//create blood
			var bloodSheet = new createjs.SpriteSheet({
			    images: [this.blood_src],
			    frames: this.blood_frames
			});
			this.blood = new createjs.Sprite(bloodSheet);
			this.blood.gotoAndStop(  Math.round(Math.random()) );
			this.blood.scaleX = 1.7;
			this.blood.scaleY = 1.7;
			this.blood.visible = false;
			
			
			//create enemy
			var spriteSheet = new createjs.SpriteSheet({
			    images: [this.src],
			    frames: this.frameSettings,
			    animations: {
				    // start, end, next*, speed*
				    idle: 0,
				    dead: 1 + Math.round(Math.random())
				}
			});
			this.enemy = new createjs.Sprite(spriteSheet, "idle");
			
			
			//container
			this.sprite = new createjs.Container();
			
			//events
			this.sprite.on('click', function(){
				//remove all events
				this.sprite.removeAllEventListeners();
				
				//dispatch 'hit' event
				this.hit = true;
				this.trigger('hit');
				
				//sound fxv
				createjs.Sound.play(this.fx_id);
				//console.log(this.fx_id)
				//createjs.Sound.play(this.fx_id);
				
				//smash animation
				this.enemy.gotoAndStop('dead');
				var spriteBounds = this.sprite.getBounds();
				var tempY = this.positions[this.hole].y + 80;
				
				//enemy animation
				createjs.Tween.get(this.sprite, {override:true})
				.wait(300)
				.to({scaleX: this.sprite.scaleX + .1, scaleY: this.sprite.scaleY + .1, alpha: 0 }, 180, createjs.Ease.quartIn )
				.call(this.removeEnemy, null, this);
				
				//blood animation
				this.blood.visible = true;
				
			}, this);
			
			
			//display
			this.sprite.addChild(this.blood);
			this.sprite.addChild(this.enemy);
			
			
			//create invisible hit area
			var bounds = {width: this.frameSettings[0][2], height: this.frameSettings[0][2]};
			var hitArea = new createjs.Shape();
			hitArea.graphics.beginFill("#0F0").drawRect( 0, 0, bounds.width + 200, bounds.height + 120 );
			hitArea.regX = (bounds.width + 80)/2;
			hitArea.regY = (bounds.height + 80)/2;
			this.sprite.hitArea = hitArea;
			//this.sprite.addChild(hitArea);
			
			
			//load sound fx
			var sounds_arr = ["fx_smash1"];
			//sounds_arr.push( this.enemies_config[ enemieType ].fx );
			this.fx_id = sounds_arr[ Math.round( Math.random() * (sounds_arr.length-1) ) ];
			
			
			
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
			
			//animate
			this.tween = new createjs.Tween(this.sprite)
			.to({y: this.positions[this.hole].y, scaleX: this.dimensions[this.hole].xScale, scaleY: this.dimensions[this.hole].yScale }, 240, createjs.Ease.quartOut)
			.wait(  scope.getRandomInt( scope.delay_min, scope.delay_max ) )
			.call(this.hide, null, this)
		},
		
		
		hide: function(){
			var scope = this;
			var tempY = this.positions[this.hole].y + 150;
			
			//hide
			this.tween = new createjs.Tween(this.sprite, {override:true})
			.to({y: tempY }, 280, createjs.Ease.backIn).call(function(){
				//dispatch event
				scope.removeEnemy();
			});	
		},
		
		removeEnemy: function(){
			
			//dispatch event
			this.trigger('enemyGone');
			
			//if the enemy was not hit, fire 'miss' event
			if( !this.hit ){
				//dispatch event
				this.trigger("miss");
			}
				
			//close/dispose object
			this.close();

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
	return Alien;

});