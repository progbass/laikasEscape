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

requirejs.config({
    baseUrl: 'js',
    
    //export libraries
    shim: {
    	'easel': {
            exports: 'createjs'
        },
        'tween': {
            deps: ['easel'],
            exports: 'createjs.Tween'
        },
        'preload': {
            exports: 'createjs.LoadQueue'
        },
        'sound': {
            exports: 'createjs.Sound'
        }
    },
	
	//define modules
	paths: {
		//vendor libraries
        'jquery':		'../bower_components/jquery/dist/jquery.min',
        'underscore':	'../bower_components/underscore/underscore-min',
        'backbone':		'../bower_components/backbone/backbone-min',
        'fastclick':	'../bower_components/fastclick/lib/fastclick',
        
        //createjs
        'easel':	'../bower_components/EaselJS/lib/easeljs-0.8.2.min',
        'tween':	'../bower_components/TweenJS/lib/tweenjs-0.6.2.min',
        'preload':	'../bower_components/PreloadJS/lib/preloadjs-0.6.2.min',
        'sound':	'../bower_components/SoundJS/lib/soundjs-0.6.2.min',
        
        //game modules
        'Game': 'Game',
        'Alien': 'Alien',
        'Astronaut': 'Astronaut',
        'ScoreDisplay': 'ScoreDisplay',
        'LifeBar': 'LifeBar',
        'ModalWindow': 'ModalWindow'

    }
});




define(['jquery', 'underscore', 'backbone', 'Game', 'fastclick'], function($, _, Backbone, Game) {


	//
	var canvas = document.getElementById('game_canvas');
	var refWidth = canvas.getAttribute('width');
	var refHeight = canvas.getAttribute('height');
	var refRatio = refHeight / refWidth; //refWidth / refHeight;
	var pixelRatio = 0;
	var fullscreen = false;

	if(!supportFullscreen(document.documentElement))
		document.getElementsByClassName('fullscreen')[0].style.display = 'none';
	window.addEventListener('resize', setupCanvasResolution);
	setupCanvasResolution();



	//Fast Click (avoids 300ms delay before click event on mobile devices)
	var FastClick = require('fastclick');
	FastClick.attach(document.body);
	
	//Create Game
	var whack_game = new Game();
	
	
	//
	$('a.fullscreen').click(function(){
		if(!$(this).hasClass('exit')){
			launchIntoFullscreen(document.documentElement);
		} else {
			exitFullscreen();
		}
		
		$(this).toggleClass('exit');
	});






	//CHEKC FULLSCREEN COMPATIBILITY
	function supportFullscreen(element){
		
		if(element.requestFullscreen) {
			return true;
		} else if(element.mozRequestFullScreen) {
			return true;
		} else if(element.webkitRequestFullscreen) {
			return true;
		} else if(element.msRequestFullscreen) {
			return true;
		}
		
		return false;
	}

	//GO TO FULLSCREEN MODE (BROWSER)
	function launchIntoFullscreen(element) {
		if(element.requestFullscreen) {
			element.requestFullscreen;
		} else if(element.mozRequestFullScreen) {
			element.mozRequestFullScreen();
		} else if(element.webkitRequestFullscreen) {
			element.webkitRequestFullscreen();
		} else if(element.msRequestFullscreen) {
			element.msRequestFullscreen();
		}
		
		fullscreenMode = true;
	};

	//EXIT FULLSCREEN MODE
	function exitFullscreen() {
		if(document.exitFullscreen) {
			document.exitFullscreen();
		} else if(document.mozCancelFullScreen) {
			document.mozCancelFullScreen();
		} else if(document.webkitExitFullscreen) {
			document.webkitExitFullscreen();
		}
		
		fullscreenMode = false;	
	};



	function mobilecheck() {
	  var check = false;
	  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
	  return check;
	}

	function mobileAndTabletcheck() {
	  var check = false;
	  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
	  return check;
	}


	//SETUP CANVAS RESOLUTION
	function setupCanvasResolution(){
		var maxWidth = 1024;
		
		//get actual window dimensions
		var contextWidth = window.innerWidth;//(window.innerWidth < maxWidth) ? window.innerWidth : maxWidth;
		var contextHeight = window.innerHeight;
		var width, height;
		
		
		//calculate actual window ratio
		var actualRatio = contextHeight/contextWidth;//contextWidth / contextHeight;
		var ratio = actualRatio;
			
			
		if(!mobileAndTabletcheck()){
			//
			width = contextWidth;
			width = contextWidth > maxWidth ? maxWidth : width;
			ratio = refHeight / refWidth;
			height = width * ratio;
			
			if(actualRatio < refRatio){
				height = contextHeight;
				ratio = refWidth / refHeight;
				width = height * ratio;
			}
			
			
		///
		} else {
			width = contextWidth;
			ratio = refHeight / refWidth;
			height = width * ratio;
			
			if(actualRatio < refRatio){
				height = contextHeight;
				ratio = refWidth / refHeight;
				width = height * ratio;
			}
		}
		
		
		//////
		var ctx = canvas.getContext('2d');
		var devicePixelRatio = window.devicePixelRatio || 1;
		var backingStoreRatio = ctx.webkitBackingStorePixelRatio ||
	                    		ctx.mozBackingStorePixelRatio ||
								ctx.msBackingStorePixelRatio ||
								ctx.oBackingStorePixelRatio ||
								ctx.backingStorePixelRatio || 1;
		pixelRatio = devicePixelRatio / backingStoreRatio;
		
		
		
		
		// upscale the canvas if the two ratios don't match
		//if (devicePixelRatio !== backingStoreRatio) {
			canvas.width = Math.round(width * pixelRatio);
			canvas.height = Math.round(height * pixelRatio);
			canvas.style.width = width + 'px';
			canvas.style.height = height + 'px';
		//} 
		
		
		
		//Position developer link
		if(mobileAndTabletcheck()){
			var link = document.getElementById('developer');
			if(actualRatio > refRatio){
				link.style.top = (contextHeight - 18)+'px';
			} else{
				var holder = document.getElementById('main_holder');
				var offset = contextHeight - holder.offsetHeight;
				link.style.top = (holder.offsetHeight+(offset/2))-5+'px';
				console.log(offset)
			}
		}
		
		
		///Moon Background
		var maxMoonPercent = maxWidth / 1280;
		var widthPercent = (width/1280) > maxWidth ? maxWidth : (width/1280);
		var moonWidth = 2200;
		var moonHeight = 980;
		var moonRatio = moonWidth/moonHeight;
		var moonNewWidth = (moonWidth * widthPercent);
		var moonNewHeight = moonNewWidth / moonRatio;
		document.getElementById('moon_background').style.backgroundSize = moonNewWidth+'px '+moonNewHeight+'px';
		document.getElementById('moon_background').style.backgroundPosition = 'center 0px';
	}
});





	
	
	