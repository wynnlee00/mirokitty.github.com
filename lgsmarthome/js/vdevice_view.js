var msg_id_json ={};
var clicked_push =false;
var connect_ok= true;

//function callMonitorApi()
//{
//    $("input[name=cmd]").val('{"request": {"cmd": {"Action": "Monitor"}}}');
//    callApi('API','Monitor');
//}

function callMonitorApi(){
    // msg_id insert
    var cmd_val = JSON.parse(cmd_monitor);
    var now=new Date().getTime();
    var msg_id = deviceId+"_"+now;
    var msg_val = JSON.parse('{"msgId": "'+msg_id+'"}');
    $.extend(cmd_val.request,msg_val);
    $("input[name=cmd]").val(JSON.stringify(cmd_val));

    //msg_id save
    msg_time = new Date().getTime()+"";
    var msg_id_json_add = {};
    var  msg_cont = '{"msg_time": "'+now+'","msg_type": "API","msg_cmd": "Monitor"}';
    msg_id_json_add[msg_id] = JSON.parse(msg_cont);
    $.extend(msg_id_json,msg_id_json_add);

    //5분 이후 msg_id delete
    delete_msg_id_5min();

    console.log('callApi serialize:'+$(api).serialize());
    try{
        $.ajax({
            url : '/vdevice/deviceApiCall',
            type : 'post',
            timeout : 20000,//20 sec
            data : $(api).serialize(),
            beforeSend : function(){
                console.log("Monitor ajax call beforeSend" );
            },
            success:function(data){
                console.log('Monitor callApi[HTTP RESPONSE]:'+data);
                var http_res_result = JSON.parse(data);
                var  is_error =0;
                if(http_res_result !=null && http_res_result.result_code !=null && http_res_result.result_code!="200"){
                    showSetFailErrorMsg(http_res_result.result);
                }else{
                    closeDialog();
                }
            },
            error : function(xhr,status,error) {
                console.log("Monitor ajax call ERROR : " + error);
                showSetFailErrorMsg(error);
            },
            complete:function(){
                console.log("Monitor ajax call complete");
            }
        })
    }
    catch (e){
        showSetFailErrorMsg(error);
    }
    finally{
    }

}

function cmdCall(vType, cmdType, msgType, msgText, val){

    if(val !=null) $("input[name=cmd]").val(eval(vType).get(cmdType).replace('val',val));
    else $("input[name=cmd]").val(eval(vType).get(cmdType));
    if($("input[name=cmd]").val()!='')callApi(msgType,msgText);
}

function callApi(msg_type, msg_short_txt,push_id ,menu_id)
{
    var add_url ="";
    if(push_id!=null) {

        clicked_push=true;
        add_url ="/push";
    }
  console.log('menu_id:'+menu_id);
    // log write
    writeLog('REQ', 'HTTP', msg_type, msg_short_txt, $("input[name=cmd]").val(), 0);

    // msg_id insert
    var cmd_val = JSON.parse($("input[name=cmd]").val());
    var now=new Date().getTime();
    var msg_id = $("input[name=deviceId]").val()+"_"+now;
    var msg_val = JSON.parse('{"msgId": "'+msg_id+'"}');
    if(push_id==null) $.extend(cmd_val.request,msg_val);
    $("input[name=cmd]").val(JSON.stringify(cmd_val));

    var str_cmd_val =JSON.stringify(cmd_val);
    var is_monitor=false;
    if(str_cmd_val.indexOf("Monitor")>0 || str_cmd_val.indexOf("monitor") >0) is_monitor=true;

    //msg_id save
    msg_time = new Date().getTime()+"";
    var msg_id_json_add = {};
 //   "msg_time": "1437091663652",    "msg_type": "API",    "msg_cmd": "test"
    var  msg_cont = '{"msg_time": "'+now+'","msg_type": "'+msg_type+'","msg_cmd": "'+msg_short_txt+'"}';
    msg_id_json_add[msg_id] = JSON.parse(msg_cont);
    console.log('msg_id_json_add:'+JSON.stringify(msg_id_json_add));
    $.extend(msg_id_json,msg_id_json_add);
    console.log('msg_id_json:'+JSON.stringify(msg_id_json));
    //5분 이후 msg_id delete
    delete_msg_id_5min();

    console.log("add_url:"+add_url );

    console.log('callApi serialize:'+$(api).serialize());
    try{
            $.ajax({
                url : '/vdevice/deviceApiCall'+add_url,
                type : 'post',
                timeout : 20000,//20 sec
                data : $(api).serialize(),
                beforeSend : function(){
                    console.log("ajax call beforeSend " );
                    if(push_id!=null) showLoadingPush(push_id);
                    else if(menu_id!=null && menu_id!='dialog_energy_monitoring') showLoadingPush(menu_id);
                    else showLoadingBar();
                },
                success:function(data){
        //                $('#response').val(data);
                    console.log('callApi[HTTP RESPONSE]:'+data);
                    var http_res_result = JSON.parse(data);
                    var  is_error =0;
                    if(http_res_result !=null && http_res_result.result_code !=null && http_res_result.result_code!="200"){
                        is_error =1;
                    }
                    writeLog('RES', 'HTTP', msg_type, msg_short_txt, data, is_error);

                    if(is_error ==1){
                        if(push_id==null) showSetFailErrorMsg(http_res_result.result);
                        if(menu_id==null) showSetFailErrorMsg(http_res_result.result);
                        //showViewPanel(monitor_last_payload);
                    }else{
                        if(menu_id=='dialog_energy_monitoring'){
                            showDialogModal('#dialog_energy_monitoring');
                        }else{
                            if(push_id==null){
                                closeDialog();
                            }

                        }

                    }

                },
                error : function(xhr,status,error) {
                    closeDialog();
                    console.log("ajax call ERROR : " + error);
                    showSetFailErrorMsg(error);
                },
                complete:function(){
                    if(push_id!=null) removeLoadingPush(push_id);
                    if(menu_id!=null && menu_id!='dialog_energy_monitoring') removeLoadingPush(menu_id);
                    console.log("ajax call complete");
                }
            })
    }
    catch (e){
        showSetFailErrorMsg(error);
    }
    finally{
        if(!is_monitor)callMonitorApi();
    }

}



function delete_msg_id_5min() {
    $.each(msg_id_json,function(key,val){
        var now = new Date().getTime();

        if( (parseInt(now)-parseInt(val.msg_time)) > (1000*60*5) ){
        //if( (parseInt(now)-parseInt(val.msg_time)) > (1000*10) ){
            console.log("delete_msg_id_5min exe:"+key+":"+val);
            delete msg_id_json[key];
        }
    });
}
function viewAllToggle() {
    if($( ".msg_long").css("display")=="none"){
        $( ".msg_long" ).show();
    }else{
        $( ".msg_long" ).hide();
    }
    //$( ".msg_long" ).toggle();
}

function viewSmall() {
    $( ".msg_long" ).hide();
    $( ".mode_icon.doc" ).css("opacity","1");
    $( ".mode_icon.log" ).css("opacity","0.5");
}

function viewAll() {
    $( ".msg_long" ).show();
    $( ".mode_icon.doc" ).css("opacity","0.5");
    $( ".mode_icon.log" ).css("opacity","1");

}

function showLoadingPush(push_id) {
    $('#mask').fadeIn();
    //var lodding_html ='<img src="/img/loadding.gif" class="loadding_push" align="center" style="margin-right:30px">';
    var lodding_html ='<img src="/img/loading_pk.gif" class="loadding_push" align="center" style="margin-right:23px">';
    $( "#"+push_id ).parent().append(lodding_html);
    $( "#"+push_id ).css("display","none");
}

function removeLoadingPush(push_id) {
    $( ".loadding_push").remove();
    $( "#"+push_id ).css("display","block");
    //$('#mask').fadeOut();
    clicked_push=false;
}

function showDialogModal(id)
{

    event.preventDefault();
    var winH = $(window).height();
    var winW = $(window).width();
    $(id).css('top',  (winH - $(id).height())/2);
    $(id).css('left', (winW - $(id).width())/2);
    // transition effect
    $(id).show();
    shownDialog = $(id);
    //dialog draggable
    //$(id).draggable();
}

function showSetFailErrorMsg(error_msg_contents) {
    $('.dialog').hide();

    var id = "#setting_fail";
    //$("#setting_fail_msg").html(error_msg_contents);

    //dialog center position
    var winH = $(window).height();
    var winW = $(window).width();
    $(id).css('top',  (winH - $(id).height())/2);
    $(id).css('left', (winW - $(id).width())/2);

    // transition effect
    $(id).show();
}

$("#btn_disconnect").click(function(event) {
    console.log('btn_disconnect');
    window.close();
});


$('.dialog_disconnect').click(function (e) {
    console.log('dialog_disconnect');
    window.close();
});

function showDisconnectFn() {
    event.preventDefault();
    console.log('showDisconnectFn');
    window.close();

}

function showDisconnectMsg(error_msg_contents) {
    connect_ok=false;
    $('#mask').fadeIn();
    //event.preventDefault();

    $('.dialog').hide();
    $('.close.btn_modal.btn_pink.try_monitor').attr('onclick', 'javascript:showDisconnectFn();return false;');

    var id = "#dialog_error_msg";
    $("#error_msg_contents").html(error_msg_contents);

    //dialog center position
    var winH = $(window).height();
    var winW = $(window).width();
    $(id).css('top',  (winH - $(id).height())/2);
    $(id).css('left', (winW - $(id).width())/2);

    // transition effect
    $(id).show();
}


function showLoadingBar() {
    console.log('showLoadingBar');
    $("#dialog_loadding").show();
}


$(".log_area").scroll( function() {
    var offset = 350;
    var duration = 3;
    var scrollHeight= $('.log_area').scrollTop();
    var topHeight = $(".log_area")[0].scrollHeight;
    var outerHeight = $(".log_area").outerHeight();
    if(scrollHeight<50) $('.alret_area').fadeOut(duration);
});

$(".try_monitor").click(function(event) {
    if(connect_ok)    callMonitorApi();
});

$(".hidden_font").click(function(event) {
    scrollTopLog_text_area();
});

function scrollTopLog_text_area(position) {
    if(position ==null || position=='') position =$(".log_area")[0].scrollHeight;
    $(".log_area").scrollTop(0);
}

function writeLog(call_type, protocol, msg_type, msg_short_txt,msg_long_txt, is_error) {
    var addLogHtml ='';
    if(is_error =='1') {//<p class="error_txt">에러 : 9999</p> <div id="mask" style="display: none;"></div>
        msg_short_txt = '<p class="error_txt msg_short">'+msg_short_txt+'</p>';
        msg_long_txt = '<p class="error_txt msg_long"  style="display: none;">'+msg_long_txt+'</p>';
    }else{
        msg_short_txt = '<p class="msg_short">'+msg_short_txt+'</p>';
        msg_long_txt = '<p class="msg_long" style="display: none;">'+msg_long_txt+'</p>';
    }
    addLogHtml +='<p class="msg_head">['+hh_mm_ss()+']'+'['+call_type+']'+'['+protocol+']'+'['+msg_type+']'+msg_short_txt+msg_long_txt+'</p>';
    //$('#log_text_area').append("[SUBSCRIPTION] subscription.topic:"+subscription.topic+"qosNr:"+subscription.qos+"\n<br>");
    //$('#log_text_area').append(addLogHtml);
    $('#log_text_area').prepend(addLogHtml);
    //scrollTopLog_text_area();

    var offset = 350;
    var duration = 3;
    var scrollHeight= $('.log_area').scrollTop();
    var topHeight = $(".log_area")[0].scrollHeight;
    var outerHeight = $(".log_area").outerHeight();
    if(scrollHeight>50) $('.alret_area').fadeIn(duration);
    else scrollTopLog_text_area();

    if($('.msg_long').get($('.msg_long').length-1).style.display!="none"){
        $( ".msg_long" ).show();
    }

    if(typeof vdevice_log_max_length !== 'undefined' ) log_length_check(vdevice_log_max_length);
}

function hh_mm_ss() {
    now = new Date();
    hour = "" + now.getHours(); if (hour.length == 1) { hour = "0" + hour; }
    minute = "" + now.getMinutes(); if (minute.length == 1) { minute = "0" + minute; }
    second = "" + now.getSeconds(); if (second.length == 1) { second = "0" + second; }
    return hour + ":" + minute + ":" + second;
}

$(".next").click(function(event) {
    moveFocus(1);
});

$(".prev").click(function(event) {
    moveFocus(-1);
});


(function($) {
    $.fn.hasScrollBar = function() {
        return this.get(0).scrollHeight > this.height();
    }
})(jQuery);

var scroll_index=0;
function moveFocus(plus_number) {
    if( $('.result').length>0 ){
        console.log("plus_number:"+plus_number);
        console.log("scroll_index:"+scroll_index);
        console.log("$('.result').length:"+$('.result').length);
        if(scroll_index >= $('.result').length-1 && plus_number==1) {
            scroll_index=0;
        }else if(scroll_index <= 0 && plus_number==-1) {
            scroll_index=$('.result').length-1;
        }else{
            scroll_index = scroll_index + Number(plus_number);
        }
        console.log("scroll_index plus_number:"+scroll_index);
        $('#search_number').html( Number(scroll_index)+1+'/'+$('.result').length);

        if($('#log_text_area').hasScrollBar())    {
            if($('.result').get(scroll_index) != null ){
                $('.result').get(scroll_index).scrollIntoView(true);
                console.log("scrollIntoView(true:");
            }

        }else{
            console.log("scrollIntoView(false:");
        }
    }

    //$(".result").focus();
}

function unHighlightText() {
    $('.result').after( $('.result').html());
    $('.result').remove();
    $('#search_number').html('0/0');
}

function highlightText(strSearch) {
    scroll_index=0;
    console.log('result html:'+$('.result').html());
    $('.result').after( $('.result').html());
    $('.result').remove();

    //var str = $("#log_text_area").html();
    var str ='';
    var strNew = '';
    $('.msg_head').each(function(index) {
        strNew = '';
        str = $(this).text();
        var strParts = str.split(strSearch);
                if(strParts.length>1){
            for(var i=0; i < strParts.length; i++) {
                if(i==0  ){
                    strNew += strParts[i];
                }else{
                    strNew += "<span class='result'>" + strSearch + "</span>"+strParts[i];
                }
            }
            //console.log("msg_head strNew:"+strNew);
            $(this).html(strNew);
        }
    });
    $('.msg_short').each(function(index) {
        strNew = '';
        str = $(this).text();
        var strParts = str.split(strSearch);
        if(strParts.length>1){
            for(var i=0; i < strParts.length; i++) {
                if(i==0  ){
                    strNew += strParts[i];
                }else{
                    strNew += "<span class='result'>" + strSearch + "</span>"+strParts[i];
                }
            }
            //console.log("msg_short strNew:"+strNew);
            $(this).html(strNew);
        }

    });
    $('.msg_long').each(function(index) {
        strNew = '';
        str = $(this).text();
        var strParts = str.split(strSearch);
        if(strParts.length>1){
            for(var i=0; i < strParts.length; i++) {
                if(i==0  ){
                    strNew += strParts[i];
                }else{
                    strNew += "<span class='result'>" + strSearch + "</span>"+strParts[i];
                }
            }
            //console.log("msg_long strNew:"+strNew);
            $(this).html(strNew);
        }

    });

    if($('.result').length>0){
        $( ".msg_long" ).show();
        $('#search_number').html( '1/'+$('.result').length);
        moveFocus(0);
    }else{
        $('#search_number').html( '0/0');
    }
    scroll_index=0;

}

function setInit(){
    $("input[name=cmd]").val(cmd_ini);
    if($("input[name=cmd]").val()!='') callApi('non-API','initilaization');
    $('.dialog').hide();
}

function log_length_check(vdevice_log_max_length){
    var log_text_area_html =$('#log_text_area').html();
    var cnt = log_text_area_html.length;
    while(cnt > vdevice_log_max_length) {

        console.log('last:'+$("#log_text_area p:last-child").text());
        $("#log_text_area p:last-child").remove();
        cnt = $('#log_text_area').html().length;
        console.log('log_text_area.length:'+cnt);
    }
}

// drag 방지
//$(".content_emulator").attr("oncontextmenu","return false");
$(".content_emulator").attr("onselectstart","return false");
$(".content_emulator").attr("ondragstart","return false");

//$("#log_text_area").attr("oncontextmenu","return true");
$("#log_text_area").attr("onselectstart","return true");
$("#log_text_area").attr("ondragstart","return true");

