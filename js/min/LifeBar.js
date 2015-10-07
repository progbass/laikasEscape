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


define(['jquery', 'easel', 'tween', 'preload'], function($){
	
	//
	var LifeBar = Backbone.View.extend({
		
		//
		index: 0,			//enemy number
		sprite: null,		//Bitmap reference
		astronaut_line: null,	//Life Indicator
		enemy_line: null,
		width: 300,
		height: 5,
		
		icon_enemy: null,
		icon_heroe: null,
		
		//INIT
		initialize: function(){
			
			_.bindAll(this, 'update' ); // fixes loss of context for 'this' within method
			
			
			var baseWidth = this.width + 70;
			var baseHeight = this.height + 50;
			var baseBg = new createjs.Shape( new createjs.Graphics().beginFill("#FA8C14").drawRoundRect(0, 0, baseWidth, baseHeight, 30) );
			baseBg.regX = 35;
			baseBg.regY = 25;
			
			//base background
			var pathBase = new createjs.Shape( new createjs.Graphics().beginFill("#0000").drawRoundRect(0, 0, this.width, this.height, 3) );
			pathBase.alpha = .36;
			pathBase.name = 'base';
			
			//astronaut line
			this.astronaut_line = new createjs.Shape( new createjs.Graphics().beginFill("#FFF").drawRect(0, 0, this.width, this.height) );
			this.astronaut_line.mask = pathBase;
			
			//enemy line
			this.enemy_line = new createjs.Shape( new createjs.Graphics().beginFill("#FF0000").drawRect(0, 0, this.width, this.height) );
			this.enemy_line.mask = pathBase;
			
			
			//icons
			this.icon_enemy = new createjs.Bitmap('img/icon_alien.png');
			this.icon_enemy.regX = 22;
			this.icon_enemy.regX = 24;
			this.icon_enemy.y = -20;
			
			this.icon_heroe = new createjs.Bitmap('img/icon_astronaut.png');
			this.icon_heroe.regX = 22;
			this.icon_heroe.regX = 24;
			this.icon_heroe.y = -20;
			
			//container
			this.sprite = new createjs.Container();
			
			this.sprite.addChild(baseBg);
			this.sprite.addChild(pathBase);
			this.sprite.addChild(this.astronaut_line);
			this.sprite.addChild(this.enemy_line);
			this.sprite.addChild(this.icon_heroe);
			this.sprite.addChild(this.icon_enemy);
			
			
			//init positions
			this.reset();
		},
		
		
		reset: function(){
			//position lines
			this.enemy_line.x = -this.width;
			this.astronaut_line.x = -(this.width*.7);
			
			this.icon_heroe.x = this.astronaut_line.x + this.width;
			this.icon_enemy.x = this.enemy_line.x + this.width;
		},
		
		
		
		slowEnemy: function(_amount){
			this.enemy_line.x -=  _amount || 10;
		},
		slowHero: function( _amount ){
			this.astronaut_line.x -= _amount || 10;
		},
		
		
		
		speedEnemy: function(_amount){
			this.enemy_line.x += _amount || 10;
		},
		speedHero: function( _amount ){
			this.astronaut_line.x += _amount || 10;
		},
		
		
		update: function(){
			var scope = this;
			
			scope.astronaut_line.x += .6;
			scope.enemy_line.x += .8;
			
			this.icon_heroe.x = this.astronaut_line.x + this.width;
			this.icon_enemy.x = this.enemy_line.x + this.width;
			
			if( scope.astronaut_line.x >= 0 ){
				//position
				scope.astronaut_line.x = 0;
				
				//dispatch event
				//if(!scope.loose){
					scope.trigger('madeIt');
				//}
				
				return;
			}	
			
			
			if( scope.enemy_line.x >= (scope.astronaut_line.x - 20) && scope.astronaut_line.x < -10 ){
				//position both lines together
				//scope.enemy_line.x = scope.astronaut_line.x;
				
				//dispatch event
				//if(!scope.win){
					scope.trigger('timeUp');
				//}
				
				
				return
			}	
			
		},
		
				
		
		close: function(){
			this.sprite.removeAllEventListeners();
			this.unbind();
			this.remove();
		},
		
		
		
		/*-----------------------------------------------------*/
		/*------------------- 	  UTILS    --------------------*/
		/*-----------------------------------------------------*/
		getRandomInt: function (min, max) {
		    return Math.floor(Math.random() * (max - min + 1)) + min;
		}
		
		
	});
	
	
	//
	return LifeBar;

});