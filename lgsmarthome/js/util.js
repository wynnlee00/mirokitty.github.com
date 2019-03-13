/**
 * Created by sungini.kim on 2015-06-04.
 */
(function($){
    $.fn.popupWindow = function(instanceSettings){
        console.log('popupWindowBtn');
        return this.each(function(){

            $(this).click(function(){

                $.fn.popupWindow.defaultSettings = {
                    centerBrowser:0, // center window over browser window? {1 (YES) or 0 (NO)}. overrides top and left
                    centerScreen:0, // center window over entire screen? {1 (YES) or 0 (NO)}. overrides top and left
                    height:500, // sets the height in pixels of the window.
                    left:0, // left position when the window appears.
                    location:0, // determines whether the address bar is displayed {1 (YES) or 0 (NO)}.
                    menubar:0, // determines whether the menu bar is displayed {1 (YES) or 0 (NO)}.
                    resizable:0, // whether the window can be resized {1 (YES) or 0 (NO)}. Can also be overloaded using resizable.
                    scrollbars:0, // determines whether scrollbars appear on the window {1 (YES) or 0 (NO)}.
                    status:0, // whether a status line appears at the bottom of the window {1 (YES) or 0 (NO)}.
                    width:500, // sets the width in pixels of the window.
                    windowName:null, // name of window set from the name attribute of the element that invokes the click
                    windowURL:null, // url used for the popup
                    top:0, // top position when the window appears.
                    toolbar:0 // determines whether a toolbar (includes the forward and back buttons) is displayed {1 (YES) or 0 (NO)}.
                };

                settings = $.extend({}, $.fn.popupWindow.defaultSettings, instanceSettings || {});

                var windowFeatures =    'height=' + settings.height +
                    ',width=' + settings.width +
                    ',toolbar=' + settings.toolbar +
                    ',scrollbars=' + settings.scrollbars +
                    ',status=' + settings.status +
                    ',resizable=' + settings.resizable +
                    ',location=' + settings.location +
                    ',menuBar=' + settings.menubar;

                settings.windowName = this.name || settings.windowName;
                settings.windowURL = this.href || settings.windowURL;
                var centeredY,centeredX;

                if(settings.centerBrowser){

                    if ($.browser.msie) {//hacked together for IE browsers
                        centeredY = (window.screenTop - 120) + ((((document.documentElement.clientHeight + 120)/2) - (settings.height/2)));
                        centeredX = window.screenLeft + ((((document.body.offsetWidth + 20)/2) - (settings.width/2)));
                    }else{
                        centeredY = window.screenY + (((window.outerHeight/2) - (settings.height/2)));
                        centeredX = window.screenX + (((window.outerWidth/2) - (settings.width/2)));
                    }
                    window.open(settings.windowURL, settings.windowName, windowFeatures+',left=' + centeredX +',top=' + centeredY).focus();
                }else if(settings.centerScreen){
                    centeredY = (screen.height - settings.height)/2;
                    centeredX = (screen.width - settings.width)/2;
                    window.open(settings.windowURL, settings.windowName, windowFeatures+',left=' + centeredX +',top=' + centeredY).focus();
                }else{
                    window.open(settings.windowURL, settings.windowName, windowFeatures+',left=' + settings.left +',top=' + settings.top).focus();
                }
                return false;
            });

        });
    };
})(jQuery);

function randomString(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}

function detrans(str){
    return unescape(replaceAll(str,"\\","%"));
}
function replaceAll(strTemp, strValue1, strValue2){

    while(1){
        if( strTemp.indexOf(strValue1) != -1 )
            strTemp = strTemp.replace(strValue1, strValue2);
        else
            break;
    }
    return strTemp;
}

function makeSelectTime(id,num) {
    inHtml='';
    for(var i=0; i<=num; i++){
        if(i>=0&& i<10){
            optDay="0"+i;
        }else{
            optDay=i;
        }
        inHtml +="<option value='"+optDay+"'>"+optDay+"</option> ";
    }
    $('#'+id).html(inHtml);
}


$(document).keydown(function (e) {
    // F5, ctrl + F5, ctrl + r 새로고침 막기
    var allowPageList   = new Array('/a.php', '/b.php');
    var bBlockF5Key     = true;
    for (number in allowPageList) {
        var regExp = new RegExp('^' + allowPageList[number] + '.*', 'i');
        if (regExp.test(document.location.pathname)) {
            bBlockF5Key = false;
            break;
        }
    }

    if (bBlockF5Key) {
        if (e.which === 116) {
            if (typeof event == "object") {
                event.keyCode = 0;
            }
            return false;
        } else if (e.which === 82 && e.ctrlKey) {
            return false;
        }
    }
});