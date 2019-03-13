$(function () {

    //sidebar smooth scroll
    var lastId,
        menuItems = $(".nav-leftbar-sub").find("a"),
        openItems = $('.open .nav-leftbar-sub').find("a"),
        spaceTop = $('.top-padding').outerHeight(),

        // Anchors corresponding to menu items
        scrollItems = menuItems.map(function(){
            var item = $($(this).attr("href"));
            if (item.length) { return item; }
        });

    menuItems.click(function(e) {
        var href = $(this).attr("href"),
            viewTop = $(href).offset().top;

        $('html').animate({
            scrollTop: viewTop - spaceTop +1
        }, 500);

        e.preventDefault();
    });


    var innerOffset = $('.guide-content-inner').offset();

    $(window).scroll(function(){
        var id,
            winTop = $(window).scrollTop(),
            fromTop = $(this).scrollTop(),
            cur = scrollItems.map(function(){
                if ($(this).offset().top < fromTop+spaceTop+81)
                return this;
            });

        if( openItems.length - cur.length === 1){
            var docH = $(document).height(),
                winH = $(window).height(),
                last = $(cur[cur.length-1]).next(),
                lastHeight = last.height();

            if( (winH > lastHeight) && ( (docH - winH) <= fromTop )){
                var lastId = last.attr("id");
                menuItems.removeClass("active");
                menuItems.filter('[href="#'+lastId+'"]').addClass("active");
                return;
            }
        }
        cur = cur[cur.length-1];
        id = cur && cur.length ? cur[0].id : "";

        if (lastId !== id) {
           lastId = id;
            menuItems.removeClass("active");
            menuItems.filter('[href="#'+lastId+'"]').addClass("active");
        }

        //top-line orange color
        if ( winTop > spaceTop+81){
            $('.top-line').css({
                borderColor: '#f87a56'
            });
        } else {
            $('.top-line').css({
                borderColor: ''
            });
        }

        //overflow-x fixed items
        var scrollL = $(window).scrollLeft();
        var bodyPL = parseFloat($('body').css('padding-left'));
        var innerML =  parseFloat($('.guide-content-inner').css('margin-left'));
        if ( scrollL > 0) {
            $('.guide-sidebar').css({
                left: bodyPL - scrollL + 'px'
            });
            $('.top-line').css({
                left: bodyPL + innerML - scrollL + 'px'
            });
        } else {
            $('.guide-sidebar, .top-line').css({
                left: ''
            });
        }
    });

    //상위메뉴 클릭 시 맨 위로
    $('.open>a').click(function () {
        $('html, body').animate({scrollTop : 0}, 500);
        return false;
    });

});
