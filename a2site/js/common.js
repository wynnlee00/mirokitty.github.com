$(function(){
	/*windows os, safari, font family
	if (navigator.appVersion.indexOf("Win")!=-1) { //windows os
		//safari browser FONT
		if (navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1) { 
			$('[class|="title"], #typed-strings, .copyright, .btn-border, .nav-list li').css({'font-family':'"Open Sans","Noto Sans KR", sans-serif'});
		}
	}*/

	//smooth scroll wheel
	jQuery.scrollSpeed(90, 1000, 'easeOutQuart');

	//header bg
	if( $('.cover').length > 0 ){
		$(window).scroll(function() {
			headerBg();
		});
	}

	//btn-menu click
	$('.btn-menu').click(function(){
		var scrollTop = $(window).scrollTop();
		var coverHeight = $('.cover').outerHeight();

		if ($('#menu').css('display') == 'none'){
			$('html').css('overflow','hidden');
			$('#menu').fadeIn(700);
			$(this).find('.menu').addClass('close');	
			

			if ($('header').hasClass('bg')){
				$('header').removeClass('bg');
			}
		} else {		
			$('html').css('overflow','');
			$('#menu').fadeOut(700);
			$(this).find('.menu').removeClass('close'); 

			if($('section').hasClass('cover') == true) {
				if ( scrollTop > coverHeight - 70) { 
					$('header').addClass('bg');
				} else {
					$('header').removeClass('bg');
				}
			}
			
		}
	});

	//btn-top
	$('.btn-top').click(function(){
		$('html, body').animate({scrollTop : 0},800);
		return false;
	});

	//google map
	if( $('#map').length > 0 ){
		$(function(){
			mapHeight();
			displayMap();
		});
	}

});

//header bg
function headerBg() {
	var scrollTop = $(window).scrollTop();
	var coverHeight = $('.cover').outerHeight();

	if ($('#menu').css('display') == 'none'){
		if ( scrollTop > coverHeight - 70) { 
			$('header').addClass('bg');
		} else {
			$('header').removeClass('bg');
		}
	}
}

//scroll reveal  default
var defaultReveal = {
	duration : 500,
	delay: 200,
	easing : 'ease-in-out',
	scale : 1,
	viewFactor  : 0.5,
	mobile : false
};
var titleReveal = {
	duration : 900,
	delay: 500,
	distance : '5px',
	easing : 'ease-in-out',
	scale : 1
};

//mapHeight
function mapHeight() {
	var winW = $(window).width();
	if (winW > 815){
		$("#map").css("height", "700px");
	} else if (winW < 400){
		$("#map").css("height", "250px");
	}  else {
		$("#map").css("height", "400px");
	}
}

//google map
function displayMap() {
	document.getElementById('map').style.display="block";
	initialize();
}
function initialize() {
	var myOptions = {
		zoom: 15,
		center: new google.maps.LatLng(37.506863,127.061086),
		scrollwheel: false
	}
	var map = new google.maps.Map(document.getElementById("map"), myOptions);

	var icon = {
		url: "img/marker.png", // url
		scaledSize: new google.maps.Size(49, 59), // scaled size
		origin: new google.maps.Point(0, 0), // origin
		anchor: new google.maps.Point(23, 59) // anchor
	};

	var marker = new google.maps.Marker({
		position: map.getCenter(),
		icon: icon,
		title: '(주)에이투컴퍼니',
		map: map
	});

	var center;
	function calculateCenter() {
		center = map.getCenter();
	}
	google.maps.event.addDomListener(window, "resize", function() {
		var center = map.getCenter();
		google.maps.event.trigger(map, "resize");
		map.setCenter(center);
	});
}