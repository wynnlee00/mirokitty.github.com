function closeDialog() {
	$('#mask, #mask_light').fadeOut();
	$('.dialog').hide();
	
	shownDialog = null;
	document.ontouchmove = function(e) {return true;}
    $("#dialog_loadding").hide();
}


//push message alert popup
(function($) {
    $.fn.clickToggle = function(func1, func2) {
        var funcs = [func1, func2];
        this.data('toggleclicked', 0);
        this.click(function() {
            var data = $(this).data();
            var tc = data.toggleclicked;
            $.proxy(funcs[tc], this)();
            data.toggleclicked = (tc + 1) % 2;
        });
        return this;
    };
}(jQuery));


// Accordion
$.fn.hcAccordion = function(options){
	var _options = {
		openClass: (options && options.openClass) ? options.openClass : "open",
		headElement: (options && options.headElement) ? options.headElement : ".collapse_header",
		contentElement: (options && options.contentElement) ? options.contentElement : ".collapse_body",
		collapse: (options && options.collapse) ? options.collapse : ".collapse",
		trigger: (options && options.trigger) ? options.trigger : "click",
		slideSpeed: (options && options.slideSpeed) ? options.slideSpeed : 300
	};
	this.each(function(){
		var _accordion = this;
		this._eventTrigger = ($(this).attr("data-accordion-event")) ? $(this).attr("data-accordion-event").toLowerCase() : _options.trigger;
		$(_accordion).find(_options.collapse + ">" + _options.contentElement).hide();
		$(this).find(_options.collapse + ">" + _options.headElement).each(function(){
			var eventHandler = function(e){		
				//e.preventDefault();	
				//var content = $(e.target).parent();
				var content = $(e.target).closest('div');

				if(!$(content).parent().hasClass('disabled')){
					content.next().slideToggle(_options.slideSpeed).end();
				}
			};

			switch(_accordion._eventTrigger){
				case "click": 
					$(this).click(function(e){
						eventHandler(e);
					});
					break;
				case "mouseover": 
					$(this).mouseover(function(e){
						eventHandler(e);
					});
					$(this).click(function(e){
						e.preventDefault();
					});
					break;
				default:
					break;
			}
		});
	});
};

$(document).ready(function(){

	//connection_status blink effect
	$( ".connected .light" ).effect( "pulsate", { times:3 }, 600 );


	/*//push message alert popup
	$('#messagebox').clickToggle(
		function() {   
		$('#popup_messagebox').fadeIn();
		},
		function() {
		$('#popup_messagebox').fadeOut();
	});*/


	//log search box
	/*$('.search_icon').clickToggle(
		function(){
			$(this).addClass('ic_close');
			$('.log_header').css('height','8.5em');
			$('.wrap_log').css('padding-top','13.5em');
			$('.alret_area').css('top','13.5em');
		},
		function(){
			$(this).removeClass('ic_close');
			$('.log_header').css('height','4.5em');
			$('.wrap_log').css('padding-top','9.5em');
			$('.alret_area').css('top','9.5em');
		}
	);*/

	//display product status slidebox
	//$(".prod_status_init").click(function() {
	//	$(".prod_status_slidebox").slideToggle('fast');
	//});

	//dialog
	$('a[name=dialog]').click(function(e) {
		$('#mask').fadeIn();
	});
	$('a[name=dialog_common]').click(function(e) {
		$('#mask_light').fadeIn();
	});

	$('a[name=dialog], a[name=dialog_common]').click(function(e) {
		// Cancel the link behavior
		e.preventDefault();
		/*
		// Get the A tag
		var id = $(this).attr('href');
		
		//dialog center position 
		var winH = $(window).height();
		var winW = $(window).width();
		$(id).css('top',  (winH - $(id).height())/2);
		$(id).css('left', (winW - $(id).width())/2);
		
		// transition effect
		$(id).show();
		shownDialog = $(id);

		//dialog draggable
		$(id).draggable();*/
		var id = $(this).attr('href');
		showModal(id);
	});
	
	
	//close button
	$('.dialog .close, .dialog .setting').click(function (e) {
		// Cancel the link behavior
		e.preventDefault();
		
		closeDialog();
	});

});


function showModal(id) {
	$('.dialog.modal.simple').css('display', 'none');
	
	//dialog center position 
	var winH = $(window).height();
	var winW = $(window).width();
	$(id).css('top',  (winH - $(id).height())/2);
	$(id).css('left', (winW - $(id).width())/2);
	
	// transition effect
	$(id).css('display','block');
	shownDialog = $(id);

	//dialog draggable
	$(id).draggable();
}


function closeEmulator() {
	showModal('#emul_shut_down');
}
