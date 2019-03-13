$(document).ready(function(){

	//GNB sticky
	var headerNav = $('.navbar');
	var scroll = 0;

	$(window).scroll(function(){

		var topDist = $('header').height();
		scroll = $(this).scrollTop();

		if( scroll > topDist ) {
			headerNav.addClass('sticky');
		} else {
			headerNav.removeClass('sticky');
		}
	});
	

	//footer fixed bottom
	documentRender();

	$(window).resize(function(){
		documentRender();
	});

	//modal
	$('.modal-trigger').leanModal({
		dismissible: false, // Modal can be dismissed by clicking outside of the modal
		opacity: .6
	});

	//custom join modal
	$('.modal-trigger-join').leanModal({
		dismissible: false, // Modal can be dismissed by clicking outside of the modal
		opacity: .6,
		in_duration: 0, // Transition in duration
		out_duration: 200, // Transition out duration
		ready: function() { 
			var in_duration = 300,
				  modal = $('#modal_agree_terms');
			$("#lean-overlay").css({ display : "block", opacity : 0 });
			$("#lean-overlay").velocity({opacity: .8}, {duration: in_duration, queue: false, ease: "easeOutCubic"})
			$(modal).css({
				top: "3%",
				opacity: 0
			});
			$(modal).velocity({top: "5%", opacity: 1}, {
			  duration: in_duration,
			  queue: false,
			  ease: "easeOutCubic"
			});
		}
	});


	//unsupported_bar click
	$('#close_unsupported_bar').click(function(){
		$('.unsupported_bar').slideUp('fast', function(){
			documentRender();
		});
	});


	/*
	//GNB right menu
	$('.dropdown').on("mouseenter", function() {
		var $this = $(this),
        $selectOptionsContainer = $this.find('.dropdown_content');
		$selectOptionsContainer.stop().fadeIn(500);
	}).on("mouseleave", function(e) {
		if(e.target.tagName.toLowerCase() != "select") {
			var $this = $(this),
			$selectOptionsContainer = $this.find('.dropdown_content');
			$selectOptionsContainer.stop().fadeOut(200);
		}
	});

	//navbar dropdown menu
	$('.dropdown_content').mouseenter(function(){
		$(this).parent('.dropdown').addClass('open');
	});
	$('.dropdown_content').mouseleave(function(){
		$(this).parent('.dropdown').removeClass('open');
	});
	*/


	//GNB right menu
	$('html').click(function(){
		$('.dropdown').removeClass('open');
		$('.dropdown_content').fadeOut('fast');
	});

	$('.dropdown_content').click(function(event){
		event.stopPropagation();
	});

	$('.dropdown>a').click(function(evt){
		evt = evt || window.event;
		//evt.preventDefault();
		stopPropagation(evt);

		if(!$(this).parent().hasClass('open')){
			//other dropdown reset 
			$('.dropdown').removeClass('open');
			$('.dropdown_content').fadeOut('fast');
			//dropdown_content open
			$(this).parent().addClass('open');
			$(this).parent().find('.dropdown_content').fadeIn('fast');
		} else if (evt.target.tagName.toLowerCase() != "select"){
			$(this).parent().removeClass('open');
			$(this).parent().find('.dropdown_content').fadeOut('fast');
		}
	});


	//btn_top
	$(window).scroll(function(){
		if ($(this).scrollTop() > 200) {
			$('.btn_top').fadeIn();
		} else {
			$('.btn_top').fadeOut();
		}
	});
	$('.btn_top').click(function(){
		$('html, body').animate({scrollTop : 0},800);
		return false;
	});


	/*
	//view table effect row click, mouseover
    $('tbody tr[data-href]').click( function() { 
        window.location = $(this).attr('data-href'); 
    });
	*/


	//view table effect row click, mouseover (except delete btn)
    $('tbody tr[data-href] td').click( function() { 
		if(!$(this).hasClass('td_delete')){
			window.location = $(this).parent().attr('data-href'); 
		}
    });


	//Code Mirror	
	  var codeFrag=jQuery('pre[name="codemirror"]');
	  codeFrag.each(function(i){
		var q=jQuery(this);
		var codeText=q.text();
		q.text('');
		var lang=$.trim(q.attr('class').split('-')[1]);        
		var config={value:codeText,
					mode:lang,
					tabSize:2,                
					smartIndent:true,
					lineNumbers:true,
					viewportMargin: Infinity,
					readOnly:false,
					theme:'eclipse',
					lineWrapping:true,                
					extraKeys:{
					  Tab:function(cm){
						if(cm.getSelection().length){
						  CodeMirror.commands.indentMore(cm);
						} else{
						  cm.replaceSelection('  ', 'end');                      
						}
					  },
					  'Shift-Tab':function(cm){
						CodeMirror.commands.indentLess(cm);
					  }}        
		  };    
		CodeMirror(this,config);    
	  });

});


function documentRender(){
	var headerH = $('header').outerHeight() + $('.navbar_wrap').outerHeight();

	$('.content').css({"margin-top":'-' + headerH + 'px'});
	$('.wrap_content').css({"padding-top":headerH + 'px'});
};


//stopPropagation with IE, FF
function stopPropagation(evt) {
    if (typeof evt.stopPropagation != "undefined") {
        evt.stopPropagation();
    } else {
        evt.cancelBubble = true;
    }
}


// Scroll spy & Smmoth scroll (APIs common data right nav)
$.fn.hcScroll = function(options){
	var selector = this,
		_options = {
				speed: (options && options.speed) ? options.speed : 300
		},         
		sideMenu = selector,
		menuItems = sideMenu.find("a"),
		anchor = window.location.hash.replace("#", "");
		scrollItems = menuItems.map(function(){
		  var item = $($(this).attr("href"));
		  if (item.length) { return item; }
		});

	menuItems.click(function(e){               
		var href = $(this).attr("href"),
			offsetTop = href === "#" ? 0 : $(href).offset().top-80;
		$('html, body').stop().animate({
			scrollTop: offsetTop
		}, _options.speed, function(){
			//window.location.hash = href;
		});
		e.preventDefault();
	});

	$(window).scroll(function(){
		var id,
			fromTop = $(this).scrollTop();
			cur = scrollItems.map(function(){
				if ($(this).offset().top-110 < fromTop)
				return this;
			});
						 
		if(anchor == ""){
			if( menuItems.length - cur.length === 1){
				var documentHeight = $(document).height(),
					windowHeight = $(window).height(),
					last = $(cur[cur.length-1]).next(),
					lastHeight = last.height();

				if( (windowHeight > lastHeight) && ( (documentHeight - windowHeight) <= fromTop )){
						var lastId = last.attr("id");
						menuItems.removeClass("active");
						menuItems.filter("[href=#"+lastId+"]").addClass("active");
						return;
				}
			}
			cur = cur[cur.length-1];
			id = cur && cur.length ? cur[0].id : "";
		}else{
			id = anchor;           
			anchor = "";
		}

		menuItems.removeClass("active");
		menuItems.filter("[href=#"+id+"]").addClass("active");

	});

};