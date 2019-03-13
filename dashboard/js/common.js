/***** ECHART CONSTANTS *****/
var echart_fontFamily = 'Rubik';
var echart_color_palette15 = ['#5f83e8', '#99cccc', '#8454b2','#f57399','#d2cabe','#5b6083','#61d3aa','#6361d3','#cac76e','#f0d732','#39bdc1','#bfd8d8','#809be6','#dcb7e2','#f385d0'];
var echart_tooltip_backgroundColor = 'rgba(0,0,0,0.6)';
var echart_tooltip_padding = [10,15];
var echart_tooltip_fontSize = 13;

/***** ECHART CONSTANTS END *****/

//stopPropagation with IE, FF
function stopPropagation(evt) {
    if (typeof evt.stopPropagation !== "undefined") {
        evt.stopPropagation();
    } else {
        evt.cancelBubble = true;
    }
}

function loadComplete() {
	$('.mask').fadeOut('fast');
	$('body').css('overflow','auto');
}

//modal open
function showModal(evt, modalId){
    evt = evt || window.event;
    stopPropagation(evt);

    var currentTop = $(document).scrollTop();

    $('body').css('top', -currentTop + 'px').addClass('modal-open');
    $('.modal').show();
    $(modalId).show();
}

// 헤더 disabled on/off
function headerOnOff(flag){
    if(flag){
        var disabledElements = $('.header-body').find('.selectbox.disabled');
        disabledElements.removeClass('disabled');
    }else{
        $('.selectbox.account').addClass('disabled');
        $('.selectbox.date').addClass('disabled');
        $('.selectwrap.account .select-default').text('Please Choose One or More Account');
    }
}

$(function () {
	// nav Accordion
	$('.nav-leftbar a').click(function () {
		if ($(this).hasClass('haschild')) {
			if (!$(this).parent().hasClass('open')) {
				$(this).parent().addClass('open');
				$(this).parent().children('.nav-leftbar-sub').slideDown('fast').animate({opacity: '1'}, 0);
			} else {
				$(this).parent().removeClass('open');
				$(this).parent().children('.nav-leftbar-sub').animate({opacity: '0'}, 0).slideUp('fast');
			}
		}
	});


    //topbar-account
	$('.topbar-account').click(function (evt) {
        stopPropagation(evt);
		$(this).next('.account-menu').slideToggle('fast');
	});
    $('.account-menu').click(function (evt) {
        stopPropagation(evt);
    });
    //다른 영역 클릭 시 topbar-account 닫히도록
    $(document).click(function(){
        var accountMenu = $('.account-menu').css('display');
        if (accountMenu == 'block'){
            $('.account-menu').slideUp('fast');
        }
    });


	//tab
	$('.tab>a').click(function () {
		$('.tab>a').removeClass('active');
		$(this).addClass('active');
	});


	//btn_top
	$(window).scroll(function () {
        var bodyH = $('.content-header').height() + $('.content-body').height();
        var winH = $(window).height();
        var scrollTop= $(this).scrollTop();

		if ( scrollTop > 80) {
			$('.btn-top').fadeIn().css('display','block');
		} else {
			$('.btn-top').fadeOut();
		}

        // footer 와 겹치지 않도록
        if( scrollTop > bodyH - winH) {
           $('.btn-top').css({
               bottom: scrollTop - (bodyH - winH) + 13 + 'px'
           });
       } else {
           $('.btn-top').css({
               bottom: ''
           });
       }
	});
	$('.btn-top').click(function () {
		$('html, body').animate({scrollTop : 0}, 400);
		return false;
	});


	//dropdown
	$('a[name=dropdown]').click(function (e) {
		var flag = ($(this).next('div').css('display'));
		if(flag == 'block'){
			$(this).next('div').hide();
		} else {
			$('a[name=dropdown]').next('div').hide();
			$('a[name=dropdown]').removeClass('open');
			$(this).addClass('open');
			$(this).next('div').show();
		}
	 });


	// if close button is clicked
	$('a[name=close]').click(function (e) {
		$(this).parents().find('a[name=dropdown]').removeClass('open');
		$(this).parent().hide();
	});


    //modal
	$('a[name=modal]').click(function (evt) {
		evt = evt || window.event;
		stopPropagation(evt);

		var id = $(this).attr('href');
		var currentTop = $(document).scrollTop();

		$('body').css('top', -currentTop + 'px').addClass('modal-open');
		$('.modal').show();
		$(id).show();
	});
	$('.modal-close').click(function () {
		var scrollTop = parseInt($('body').css('top'));

		$('.modal').fadeOut();
		$(this).parents().find('.modal-dialog').hide();
		$('body').removeClass('modal-open').css('top','');
		$(document).scrollTop(-scrollTop);
	});


	// modal-footer(하단 버튼)이 없는 모달의 경우, modal-backdrop을 클릭하면 닫히도록
	$('.modal-backdrop').click(function(){
		var openmodal = $('.modal-dialog').find(':visible');
		var modalfooter = $(openmodal).children('.modal-footer');
		var scrollTop = parseInt($('body').css('top'));

		if(modalfooter.length == 0){
			$('.modal').fadeOut();
			$('.modal-dialog').hide();
			$('body').removeClass('modal-open').css('top','');
			$(document).scrollTop(-scrollTop);
		}
	});


	// collapse
	if($('.collapse').hasClass('open')){
		$('.collapse.open').find('.collapse-body').css('display','block');
	}

	$('.collapse .collapse-header').click(function(){
		if(!$(this).closest('.collapse').hasClass('open')){
			$(this).closest('.collapse').addClass('open');
			$(this).closest('.collapse').find('.collapse-body').slideDown();
		} else {
			$(this).closest('.collapse').removeClass('open');
			$(this).closest('.collapse').find('.collapse-body').slideUp();
		}
	});

    $(document).mouseup(function(e) {
        // header selectbox 창 닫기 처리
        var container = $('.selectwrap .dropselectbox');
        var selectbar = $('.selectwrap .select-default');
        if (!container.is(e.target) && container.has(e.target).length === 0 && !selectbar.is(e.target)) {
            container.hide();
        }
    });


    $(document).mouseup(function(e) {
        // header selectbox 창 닫기 처리
        var container = $('.selectwrap .dropselectbox');
        var selectbar = $('.selectwrap .select-default');
        if (!container.is(e.target) && container.has(e.target).length === 0 && !selectbar.is(e.target)) {
            container.hide();
        }
    });


    //차트 별도legend의 스크롤이 생겼을 때 휠스크롤 높이 조정
    $('.chart-legend').on( 'mousewheel DOMMouseScroll', function (e) {
        var e0 = e.originalEvent;
        var delta = e0.wheelDelta || -e0.detail;
        this.scrollTop += ( delta < 0 ? 1 : -1 ) * 10;

        var scrollHeight = $(this).prop('scrollHeight');
        var boxHeight = this.scrollTop + $(this).innerHeight();

        if(this.scrollTop !== 0 && scrollHeight !== boxHeight){
            e.preventDefault();
        }
    });

});
