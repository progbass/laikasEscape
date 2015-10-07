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


define(['easel', 'tween'], function(){
	
	//
	var ScoreDisplay = Backbone.View.extend({
		
		//properties
		score: 0,			//score counter
		sprite: null,	//score text sprite
		
		
		
		//INIT
		initialize: function(){
			//score indicator
			this.sprite = new createjs.Text("SCORE: "+this.score, "3em Bowlby One SC", "#FA8C14");
			//this.sprite.textAlign = 'right';
		},
		
		
		update: function( _pts ){
			this.score += _pts || 0;
			this.score = (this.score <= 0 ) ? 0 : this.score;
			this.sprite.text = "Score: "+this.score;
			
			this.sprite.regX = this.sprite.getMeasuredWidth();
		},
		
		
		reset: function(){
			this.score = 0;
			this.update();
		},
		
		
		render: function(){
		},
		
		close: function(){
			this.sprite.removeAllEventListeners();
			this.unbind();
			this.remove();
		}
		
		
	});
	
	
	//
	return ScoreDisplay;

});