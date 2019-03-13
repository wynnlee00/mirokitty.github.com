/**
 * Created by sungini.kim on 2015-06-04.
 */
//mqtt server connect
websocketclient.connect();
refreshIntervalId=0;
pushToastIntervalId=0;
currMsgIntervalIdArray=new Array();
displayArray=new Array();
contextArray=new Array();
initial_pop=1;

var msg_id_json ={};
var clicked_push =false;
var connect_ok= true;

function fnInit() {
	var request_body = '';
	var msg_txt = 'Reset';
	request_body = '{"request": {"cmd": {"Action": "Init"}}}';
	callApi_new(request_body, 'API', msg_txt);
	
	// Push refresh
	$('#push_toastbox > p').text('');
	$('#push_toastbox').fadeOut();
	
	$('#push_badge').css('display', 'none');
	
	$('#push_list').addClass('empty');
	$('#push_list').html(no_notification); // ???
	$('#popup_messagebox').fadeOut();
	closeDialog();
	initial_pop=1;
}

function fnIconClick(obj){
	var off_flag = $('#'+obj.id).find('span').hasClass('off');
	var cmd_param = (obj.id).split('__');
	var request_body = '';
	var msg_txt = '';
	
	if( off_flag == false) {
		request_body = '{"request": {"cmd": {"Category":"' +cmd_param[0]+ '","Property":"' +cmd_param[1]+ '","Value":"0"}}}';
		msg_txt=obj.getAttribute('msg_txt')+' OFF';
		if( cmd_param[1]=='State')	$('.icon').addClass("off");
		else						$('#'+obj.id).find('span').addClass("off");
	} else {
		request_body = '{"request": {"cmd": {"Category":"' +cmd_param[0]+ '","Property":"' +cmd_param[1]+ '","Value":"1"}}}';
		msg_txt=obj.getAttribute('msg_txt')+' ON';
		$('#'+obj.id).find('span').removeClass("off");
	}
	//alert(request_body);
	callApi_new(request_body, 'API', msg_txt);
	
}

function fnCheckBoxClick(obj) {
	if(obj.checked) {
		var value='1';
		var txt_value=' ON';
	} else {
		var value='0';
		var txt_value=' OFF';
	}
	var cmd_param = (obj.name).split('__');
	var request_body = '{"request": {"cmd": {"Category":"' +cmd_param[0]+ '","Property":"' +cmd_param[1]+ '","Value":"' +value+ '"}}}';
	var msg_txt=obj.getAttribute("msg_txt")+txt_value;
	callApi_new(request_body, 'API', msg_txt);
}

function fnRadioClick(obj) {
	var cmd_param = (obj.name).split('__');
	var value=obj.value;
	var request_body = '{"request": {"cmd": {"Category":"' +cmd_param[0]+ '","Property":"' +cmd_param[1]+ '","Value":"' +value+ '"}}}';
	var msg_txt=obj.getAttribute("msg_txt");
	callApi_new(request_body, 'API', msg_txt);
}

function fnClickSetting(obj) {
	property_id=obj.name;
    var value = $('#'+property_id+'_value').val();
    var cmd_param = (property_id).split('__');
	var request_body = '{"request": {"cmd": {"Category":"' +cmd_param[0]+ '","Property":"' +cmd_param[1]+ '","Value":"' +value+ '"}}}';
    
    callApi_new(request_body, 'API', msg_txt);
    var msg_txt=obj.getAttribute("msg_txt")+value;
	writeLog('REQ', 'HTTP', 'API', msg_txt, request_body, 0);
};

function fnContextSetting() {
	var selected_obj = $('input[name="prod_status"]:checked');
	// Context text Set
	context_code = selected_obj.val();
	var context_text = selected_obj.closest('li').children('label').text();
	set_context_box(context_text);
	
	var call_type = selected_obj.attr('call_type');
	/* Case 1. Common Context */
	if(call_type=='') {
	// Context Call
	id=$('input[name="prod_status"]:checked').attr('id');
	tid=id+'_timelapse';
	if($('#'+tid).prop('checked')==true) {
		// checked!!
		timelapse='true';
		request_body = '{"request": {"cmd": {"Action":"Context","Property":"' +context_code+ '", "Value": "TimeBoost"}}}';
	} else {
		timelapse='false';
		request_body = '{"request": {"cmd": {"Action":"Context","Property":"' +context_code+ '"}}}';
	}
	// call context api & get return msg_id
	msg_id=callApi_new(request_body, 'Product', context_text);
	
	// msg_id 를 key로 display용 text와 context set용 code 저장
	displayArray[msg_id]=context_text;
	contextArray[msg_id]=context_code+"::"+timelapse;
	/* Case 2. Sub Device Context */
	} else if(call_type=='NOTIFICATION'){
		// call context api & get return msg_id
		request_body='{"request": {"cmd": {"push_code":"'+selected_obj.val()+'","push_text":"' +context_text+ '", "sub_device_id":"' +selected_obj.attr('sub_device_id')+ '"}}}';;
		msg_id=callApi_new(request_body, 'NOTIFICATION', context_text, 'NOTIFICATION');
		$('.loading_layer').hide(); // Notification은 Monitor API 호출하지 않으므로 바로 로딩중 숨김처리  
	/* Case 3. Sub Device Context */
	} else if(call_type=='PUSH_PUBLISH'){
		var sub_device_id = selected_obj.attr('sub_device_id');
		
		// MQTT Publish
		var qosNo=1;
		var sub_topic_event ="#/devices/"+sub_device_id+"/event";
		
		var push_text='{'
			+'"msgId": "026f4d4b98cbb37c",'
			+'"result_code": "200",'
			+'"result": {'
			+'	"deviceId": "' + sub_device_id + '",'
			+'	"confirmed": false,'
			+'	"origin_level": "Information",'
			+'	"push_type": "ThinQ",'
			+'	"content": {'
			+'		"msg": {'
			+'			"text": "' + context_text + '"'
			+'		},'
			+'		"type": "PUSH"'
			+'	},'
			+'	"level": "Information",'
			+'	"notificationId": "1a81e3f9a114bd7dc4a8467eb28f9ef302ce1cec41d16ca285c01e54416266e1",'
			+'	"push_code": "' + selected_obj.val() + '",'
			+'	"repeat": {},'
			+'	"device_type": "' + selected_obj.attr('sub_device_type') + '",'
			+'	"ttl": ""'
			+'}	}';
		//websocketclient.publish(sub_topic_event, '{"msgId": "026f4d4b98cbb37c", "result_code": "200", "result": {"deviceId": "8f3658822c9a0e41", "origin_level": "Information", "notificationId": "1a81e3f9a114bd7dc4a8467eb28f9ef302ce1cec41d16ca285c01e54416266e1", "push_code": "0001", "device_type": "101", "push_type": "ThinQ", "ttl": "", "confirmed": false, "repeat": {}, "level": "Information", "content": {"msg": {"text": "PUSH_TEST"}, "type": "PUSH"}}}', qosNo,false );
		websocketclient.publish(sub_topic_event, push_text, qosNo,false );
	}
	
	// Close context box
	close_context_box();
	/*$(".prod_status_slidebox").slideToggle('fast');
	$('.context_back_layer').hide();*/
}


function set_context_box(context_text){
	if(context_text == null || context_text=='') { // Rest Context
		if($('.prod_status_slidebox').css('display')!='block') { // Context 선택창 열린 상태에서는 reset 되지않도록함
			$('input[name="prod_status"]').prop("checked", false);
			$('input[name="timelapse_check"]').prop("checked", false);
		}
		$('#curr_prod_status_none').show();
		$('#curr_prod_status').hide();
	} else { // set context
		$('#curr_prod_status_none').hide();
		$('#curr_prod_status').html(context_text);
		$('#curr_prod_status').attr('data-id',$('input[name="prod_status"]:checked').val());
		id=$('input[name="prod_status"]:checked').attr('id');
		if($('#'+id+'_timelapse').prop('checked')==true) {
			$('#curr_prod_status').attr('data-id-t','time_boost');
		}
		$('#curr_prod_status').show();
	}
	//$(".prod_status_slidebox").hide();
}


function callMonitorApi(msgId) {
	if(monitor_enable=='N') { // Monitor 필요없는 Device용 - 3001, 1001
		closeDialog();
		$('.loading_layer').hide();
		callApi_doNothing();
		return false;
	}
    req_body = '{"request": {"cmd": {"Action": "Monitor"}}}';
    callApi_new(req_body, 'API', 'Monitor', msgId);
}


function processMqttResult(data) {
    mqtt_result=JSON.parse(data);
    emul_log("MQTT Response GET");
    emul_log(mqtt_result);
    var is_error=0;
    if(mqtt_result.result_code && mqtt_result.result_code!='200') { // result_code 존재하는데, 200 아니면 error
    	is_error=1;
    }
    
    // Error처리는?
    if(mqtt_result.result_code!=undefined && mqtt_result.result_code!='200') {
    	//return false; // ??? // 200 아닐때 setResultToDisplay에서 처리(display수정 및 unlock)
    }
    
    // MQTT 응답중 Monitor 구분
    if(mqtt_result.result!=undefined) {
    	//mqtt_result.result.length;
    }
    if(mqtt_result.result!=undefined && Object.keys(mqtt_result.result).length>0) { // 실제기기 테스트용  mqtt_result.result['Power']!=undefined
    	emul_log("MQTT Result exist");
    	if(mqtt_result.result.push_code!=undefined) { // PUSH
    		emul_log("MQTT : Push");
    		// 1001 Display MQTT Push only with Checked Devices 
    		if(device_type==1001) {
    			var pushed_device_id=mqtt_result.result.deviceId;
    			//var subscribe_device_ids=new Array("8f3658822c9a0e41");
    			//sub_device_ids.push('ff04902c388e70a2');
    			if(sub_device_ids.indexOf(pushed_device_id)<0) return false;
    		}
    	    // 1001 End
    		writeLog('RES', 'NOTI', 'API', 'MQTT', data, is_error);
    		setPushMessage();
    		
    	} else if(mqtt_result.result_code!=200){ // MQTT Error case
    		emul_log("MQTT Error");
    		emul_log(mqtt_result.result_code);
    		writeLog('RES', 'MQTT', 'API', 'MQTT', data, is_error);
    		
    		var monitor_need_result_code=['423', '424', '503', '514', '529', '539'];
    		if(monitor_need_result_code.indexOf(mqtt_result.result_code) >=0) {
    			emul_log("MQTT Error, Monitor Call");
    			callMonitorApi(mqtt_result.msgId);
    		} else if(mqtt_result.result_code==444) { // 실제기기 Power OFF or Network OFF 인 경우용
    			if(initial_pop==1) { // Emulator 켜지고 처음 or Reset시에만 실행하도록
    				initial_pop=0;
    				closeDialog();
    			}
    			/*** Unlock Display ***/
    		    unlock_display(mqtt_result.msgId);
    		    if(device_type=='201') {
					$('.icon.power').addClass('off');
					$('.icon.wifi').addClass('off');
					$('.display_mask').show();
				}
    		}
    		
    	} else {
    		writeLog('RES', 'MQTT', 'API', 'MQTT', data, is_error);
    		setResultToDisplay(mqtt_result); // new
    		if(initial_pop==1) { // Emulator 켜지고 처음 or Reset시에만 실행하도록
    			initial_pop=0;
    			closeDialog();
    		}
    	}
    } else {
    	writeLog('RES', 'MQTT', 'API', 'MQTT', data, is_error);
    	callMonitorApi(mqtt_result.msgId);
    }
}

function setResultToDisplay(monitor_result) {
	emul_log("Display MQTT Result : setResultToDisplay()");
	//0. init exception
    if( typeof monitor_result.result !== "undefined" ){
        if( typeof monitor_result.result.result !== "undefined" ){
            monitor_result = monitor_result.result;
        }
    }
    
    /*** 0-2. Result code check ***/
    if(monitor_result.result_code!='200') {
    	showViewPanel(monitor_result);
    	unlock_display(mqtt_result.msgId);
    	callMonitorApi();
    	return false;
    }
    
    /*** 1. Get Device Status from Monitor data ***/
    set_device_status_result(monitor_result.result); // device_status_map
    
    
    /*** 1-1. Fridge, Energy Monitoring ***/
    if(device_type=='101' && monitor_result.result.PowerMeter) {
    	
    	/*** 5. Display Panel(Display, Control) ***/
        try {
        	showViewPanel(mqtt_result);
        } catch(e) {}
               
        /*** 6. Unlock Display ***/
        unlock_display(mqtt_result.msgId);
        
        return false;
    }
    

    /*** 2. Constraint Set ***/
    check_constraint(); // device_status_map
    
    
    /*** 3. Set Context text ***/
    setCurrContext(mqtt_result.msgId, true);
    
    
    /*** 4. Power & Network status check ***/
    /*** For Aircon & Purifier ***/
    if(device_type=='401' || device_type=='402') {
    	if(device_status_map['Power__Code']!=undefined) { // 실제기기와 동일하게 수정하면서 임시 로직 추가, 추후삭제예정
    		power_status=device_status_map['Power__Code']['value'];
    	} else {
    		power_status=1;
    	}
   	/*** For Other Devices ***/
    } else {
    	power_status=device_status_map['Power__State']['value'];
    }
    
    if(power_status=='1') {
    	// Display ON
    	$('.display_mask').hide();
    	$('.icon.power').removeClass('off');
    	
    	// Network check
    	if(device_status_map['Power__Network']==undefined) { // for real device test
    		device_status_map['Power__Network']= new Array();
    		device_status_map['Power__Network']['value']='1';
    	}
    	
    	if( device_status_map['Power__Network']['value']=='0') {
    		$('.icon.wifi').addClass('off');
    	} else {
    		$('.icon.wifi').removeClass('off');
    	}
    	
    } else { // Power, Wifi, Display Panel Off
		$('.icon.power').addClass('off');
		$('.icon.wifi').addClass('off');
		$('.display_mask').show();
    }
    
    // Power & Network check
    if(power_status==0 || device_status_map['Power__Network']['value']==0) {
    	for(property_id in device_status_map) {
    		device_status_map[property_id]['constraint']='Disabled';
    	}
    	$( "ul.accordion" ).children('li').addClass("disabled"); // for fridge, washer custom control list
    	if(device_type=='101') {
    		$('#smartsaving_night_desc').css('display','none');
    		$('#smartsaving_custom_desc').css('display','none');
    		$('#smartsaving_custom_control').css('display','none');
    	}
    	emul_log('Device Status(after power chk)');
    	emul_log(device_status_map);
    } else {
    	$( "ul.accordion" ).children('li').removeClass("disabled");  // for fridge, washer custom control list
    }
    
    /*** 5. Display Panel(Display, Control) ***/
    try {
    	showViewPanel(mqtt_result);
    } catch(e) {}
    
    
    /*** 6. Unlock Display ***/
    unlock_display(mqtt_result.msgId);
}

function setCurrContext(msg_id, write_log_context_guide_flag) {
	emul_log("Set curr context if context return : setcurrContext()");
	if(msg_id=='NOTIFICATION') return false; // Notification호출은 Context선택한 대로 표시
	
	// Currnet Context Set
	if(contextArray[msg_id]!= undefined && contextArray[msg_id]!=null) {
		context = contextArray[msg_id].split('::');
		context_code=context[0];
		context_timelapse=context[1];
		// Checkbox checked
		context_obj=$('input[value="'+context_code+'"]');
		context_obj.prop("checked", "checked");
		if(context_timelapse=='true') {
			context_obj.parent('li').find('[name=timelapse_check]').prop("checked", "checked");
		}
		// Context Text Set
		var context_text=context_obj.closest('li').children('label').text();
		set_context_box(context_text);
		
		// If Context guide exist
		if(write_log_context_guide_flag) {
			guide_text=context_obj.attr('guide');
			if(guide_text!='') {
				writeLog('Context_guide', null, null, null, guide_text);
			}
		}
		
	} else {
		// Reset Context
		set_context_box();
	}
}

function setPushMessage() {
	// Get Push Text
	var push_code=mqtt_result.result.push_code;
	var icon_name=undefined;
	if(push_data[push_code]==undefined) {
		push_text=mqtt_result.result.content.msg.text;
	} else {
		push_text=push_data[push_code]['desc_'+USER_LANGUAGE];
		icon_name=push_data[push_code]['on_icon_name'];
	}
	
	// Push Toast
	$('#push_toastbox > p').text(push_text);
	$('#push_toastbox').fadeIn();
	clearInterval(pushToastIntervalId);
	pushToastIntervalId = setInterval(function() {$('#push_toastbox').fadeOut();}, 3000);
	
	// Push Badge
	$('#push_badge').css('display', 'inline-block');

	// Push Message Box
	push_cnt=$('#push_list > p').length;
	var nowdate=new Date();
	var n_month = (nowdate.getMonth()+1>=10) ? nowdate.getMonth()+1 : '0'+(nowdate.getMonth()+1);
	var n_date = (nowdate.getDate()>9) ? nowdate.getDate() : '0'+nowdate.getDate();
	var n_hour = (nowdate.getHours()>9) ? nowdate.getHours() : '0'+nowdate.getHours();
	var n_minute = (nowdate.getMinutes()>9) ? nowdate.getMinutes() : '0'+nowdate.getMinutes();
	var date_time = n_month+"/"+n_date+"  "+n_hour+":"+n_minute;
	var new_node='<p class="new">'+push_text+'<span class="time">'+date_time+'</span></p>';
	
	if(push_cnt>0) {
		$('#push_list p:first-child').before(new_node);
	} else {
		$('#push_list').removeClass('empty');
		$('#push_list').html(new_node);
	}
	
	// Show Icon in Display box
	if(icon_name!=undefined) {
		$('.'+icon_name).css('display', "block");
	}

	// Push List Max Limit
	if($('#push_list p').length>200) {
		$('#push_list p:last-child').remove();
	}
	// Exectue Monitoring if needed
	if(push_data[push_code]!=undefined &&  push_data[push_code]['exec_monitoring']!=undefined && push_data[push_code]['exec_monitoring']=='true') {
		callMonitorApi();
	}
}


function set_device_status_result(monitor_result){
	emul_log("Set result to device_status_map : set_device_status_result");
	device_status_map = new Array();
	emul_log(device_status_map);
    for(category in monitor_result) {
    	category_data = monitor_result[category];
    	
    	for(property in category_data) {
    		// for Oven Remain Time
    		if(device_type=='301' && property=='Remain' && category=='Time') { 
    			remain_time=category_data[property];
    			if(isNaN(remain_time)) {
    				device_status_map['Time__Remain_in_sec']=0;
    			} else {
    				var hh=remain_time.substr(0,2);
    				var mm=remain_time.substr(2,2);
    				var ss=remain_time.substr(4,2);
    				device_status_map['Time__Remain_in_sec']=hh*3600 + mm*60 + ss*1;
    			}
    		}
    		// for Oven Remain Time END
    		if(typeof category_data[property] === 'object') {
    			for(value in category_data[property]) {
    				device_status_map[category+'__'+property]=new Array();
    				device_status_map[category+'__'+property]['value']=value;
    				device_status_map[category+'__'+property]['text']=category_data[property][value]; // ??? 한/영 처리
    			}
    		} else {
    			device_status_map[category+'__'+property]=new Array();
    			device_status_map[category+'__'+property]['value']= category_data[property];
    		}
    	}
    }
    emul_log('Device_status_map(mqtt)' );
    emul_log(device_status_map);
}

function show_display_box() {
    for(id in display_items) {
    	if(display_items[id]['display_type']=='list') {
    		$('span[name="'+id+'_Display"]').each(function() {
    			$(this).css("display","none");
    		});
    		
    		// Power status==1
    		if(power_status==1) {
    			if(display_items[id]['items']!=undefined) { // Group List
    				for(seqNo in display_items[id]['items']) {
    					property_id=display_items[id]['items'][seqNo];
   						$('#'+property_id+'_'+device_status_map[property_id]['value']+'_Display').css("display", "inline-block");
    				}
    			} else {
    				if( device_type!='101' ||  id != 'Power__Save' )
    					$('#'+id+'_'+device_status_map[id]['value']+'_Display').css("display", "inline-block");
    				else {
    					var value = device_status_map[id]['value'].substr(0,1);
    					$('#'+id+'_'+value+'_Display').css("display", "inline-block");
    				}
    					
    			}
    		}
    		
    		if($('span[name="'+id+'_Display"][style*="display: inline-block"]').length==0) {
				$('#'+id+'_none_Display').css('display', 'inline-block');
			}
    	}
    }
}


function check_constraint() {
	emul_log("Check constraint : check constraint()");
	/*** 1. Loop Filters ***/
	for(seqNo in device_filter) {
		conditions = device_filter[seqNo]['Current'];
		targets = device_filter[seqNo]['Request'];
		
		emul_log('필터 확인');
		emul_log(device_filter[seqNo]);
		if_text='';

		/*** 2. Check Current Condition ***/
		if(conditions[0]=='OR' || conditions[0]=='AND') { // Multiple Conditions
			operator='&&';
			for(subNo in conditions) {
				// Check Operator
				if(subNo==0) {
					if(conditions[subNo]=='OR') {
						operator='||';
						continue;
					} else if (conditions[subNo]=='AND') {
						operator='&&';
						continue;
					}
				}
				emul_log('컨디션 확인');
				emul_log(conditions[subNo]);
				
				// Filter에 포함된 Power/Network Off filter는 처리 예외, Power/Network 에 의한 Disabled는 4번에서 처리 [에어컨(target) Display 때문]
				//??? if(conditions[subNo]['Category']=='Power' && conditions[subNo]['Property']=='State' ) continue;
				//??? if(conditions[subNo]['Category']=='Power' && conditions[subNo]['Property']=='Network' ) continue;
				
				// Make if-condition
				condition_property = conditions[subNo]['Category']+'__'+conditions[subNo]['Property'];
				condition_value = conditions[subNo]['Value'];

				if(device_status_map[condition_property]!=undefined) {
					device_status=device_status_map[condition_property]['value'];
				} else {
					device_status='undefined';
				}
				
				if(conditions[subNo]['Operator'] != undefined) {
					condition_txt='("'+device_status+'"'+conditions[subNo]['Operator']+'"'+condition_value+'")';
				} else {
					condition_txt='("'+device_status+'"=="'+condition_value+'")';
				}
				
				if(if_text=='') {
					if_text=condition_txt;
				} else {
					if_text+=operator+condition_txt;
				}
			}
			
		} else { // Single Condition
			if(conditions[0]!=undefined && conditions[0]['Category']!=undefined) conditions=conditions[0]; // Filter 형식이 다른 경우를 위한 방어 로직
			condition_property = conditions['Category']+'__'+conditions['Property'];
			condition_value = conditions['Value'];
			if(device_status_map[condition_property]!=undefined) {
				device_status=device_status_map[condition_property]['value'];
			} else {
				device_status='undefined';
			}
			if_text='("'+condition_value+'"=="'+device_status+'")';
		}
		emul_log('최종 조건문'+if_text+" , 결과는!");
		emul_log(eval(if_text));
		
		/*** 3. Set Constraint by result ***/
		if(eval(if_text)) { // 조건에 만족하면 Target에 Disabled 처리
			if(targets[0]=='OR' || targets[0]=='AND') { // Multiple Targets
				for(tNo in targets) {
					if (targets[tNo]=='OR' || targets[tNo]=='AND') continue; // operator 예외
					
					if(targets[tNo]['Category']!=undefined) {
						target_property_id = targets[tNo]['Category']+'__'+targets[tNo]['Property'];
						target_value =targets[tNo]['Value'];
					// 에어컨 온도 범위 제한(이상 제외, 미만만 사용)
					if(targets[tNo]['Operator']=='>=') {
						continue;
					} else if(targets[tNo]['Operator']=='<=') {
						device_status_map[target_property_id]['operator']='lte';
					} 
					
						
						if(device_status_map[target_property_id]==undefined) continue; // Monitor에 없는 property_id는 무시
						if(target_value!='') { // 특정 parameter에 제약
							// 해당 Property에 전체 Disabled 처리가 이미 되어있는 경우, 특정 parameter 제약 필요 없음
							if(device_status_map[target_property_id]['constraint']!='Disabled') {
								// 특정 parameter 제약이 이미 있는 경우, '|' 구분자 이용하여 제약 추가 ex) '1|2'
								if(device_status_map[target_property_id]['constraint']!=undefined && device_status_map[target_property_id]['constraint']!='') {
									device_status_map[target_property_id]['constraint']=device_status_map[target_property_id]['constraint']+'|'+target_value;
								// 특정 parameter 제약없으면 최초 설정
								} else { 
						device_status_map[target_property_id]['constraint']=target_value;
								}
							}
						} else {
							device_status_map[target_property_id]['constraint']='Disabled';
						}
					} else if(targets[tNo]['Action']!=undefined) {
						target_property_id='Action__'+targets[tNo]['Action'];
						device_status_map[target_property_id] = new Array();
						device_status_map[target_property_id]['constraint']='Disabled';
					}
				}
				
			} else { // Single Target
				if(targets[0]!=undefined && (targets[0]['Category']!=undefined || targets[0]['Action']!=undefined)) targets=targets[0]; // Filter 형식이 다른 경우 방어로직
				if(targets['Category']!=undefined) {
					target_property_id = targets['Category']+'__'+targets['Property'];
					target_value =targets['Value'];
					
					//if(target_property_id==undefined || target_value==undefined) return false;
					
					if(target_value!='') { // 특정 parameter에 제약
					// 해당 Property에 전체 Disabled 처리가 이미 되어있는 경우, 특정 parameter 제약 필요 없음
					if(device_status_map[target_property_id]['constraint']!='Disabled') {
						device_status_map[target_property_id]['constraint']=target_value;
					}
					} else {
						device_status_map[target_property_id]['constraint']='Disabled';
					}
				} else if(targets['Action']!=undefined) {
					target_property_id='Action__'+targets[tNo]['Action'];
					device_status_map[target_property_id] = new Array();
					device_status_map[target_property_id]['constraint']='Disabled';
				}
			}
			
		}
	}
	emul_log('Constraint!!');
	emul_log(device_status_map);
}


function show_control_box() {
	for(order in control_items) {
    	display_type = control_items[order]['display_type'];
    	
    	// 기본 UI 인 경우만 처리
    	if(control_items[order]['id']!=undefined && control_items[order]['custom_flag']!='true') {
    		emul_log("show_control_box 222" + display_type+control_items[order]['id']);
    		// status값 없을때도 처리 ??
    		property_id = control_items[order]['id'];
    		status_value=device_status_map[property_id]['value'];
    		constraint=device_status_map[property_id]['constraint'];
    		emul_log("show_control_box 333" + property_id+status_value+constraint);
    		if(status_value!=undefined) {
    		} else {
    		}
    		
    		obj = $('input[name="'+property_id+'"]');
    		if(display_type=='toggle') {
    			if(constraint!=undefined && constraint!='') constraint='Disabled'; // 제약조건에 value를 잘못넣었을때도 처리하도록
    			if(constraint=='Disabled' || status_value==undefined) {
    				obj.closest('li').addClass('disabled');
    				obj.prop('checked', false);
    				obj.prop('disabled', true);
    			} else {
    				obj.closest('li').removeClass('disabled');
    				obj.prop('disabled', false);
    				if(status_value==0) {
    					obj.prop('checked', false);
    				} else {
    					obj.prop('checked', true);
    				}
    			}
    			
    		} else if(display_type=='select') {
    			obj.each(function() {
    				$(this).prop('checked', false);
    				$(this).prop('disabled', false);
    			});
    			if(constraint=='Disabled' || status_value==undefined) {
    				obj.closest('li').addClass('disabled');
    				obj.each(function() {
        				$(this).prop('disabled', true);
        			});
    			} else {
    				obj.closest('li').removeClass('disabled');
    				if(constraint!='') { // 특정 항목의 parameter에 제약
    					// 복수의 paramter 제약조건 있으면 ';' 구분자로 분리하여 처리
    					//$('#'+property_id+constraint).prop('disabled', true);
    					var constraint_array = (constraint+'').split('|');
    					for(var i in constraint_array) {
    					//	emul_log("constraint :"+i+"::"+constraint_array[i] );
    						$('#'+property_id+constraint_array[i]).prop('disabled', true);
    					}
    				}
    				obj = $('input[name="'+property_id+'"]'+'[value="'+status_value+'"]');
    				obj.prop('checked', true);
    			}
    			
    		} else if(display_type=='range') {
    			obj =  $('#'+property_id);
    			if(constraint=='Disabled' || status_value==undefined) {
    				obj.closest('li').addClass('disabled');
    				obj.closest('li').find('.collapse_body').hide();
    				obj.val('--');
    				
    			} else {
    				if(!isNaN(constraint)) {    // 온도 범위 제한
        				$("#"+property_id+"_slider").slider('option', 'min', constraint+1*1);
    				} else { 					// 온도 범위 원복
    					$("#"+property_id+"_slider").slider('option', 'min', $("#"+property_id+"_slider").slider('option', 'default_min') );
    				}
    				obj.closest('li').removeClass('disabled');
    				obj.val(status_value);
    				$("#"+property_id+"_slider").slider('value',status_value);
        		    $("#"+property_id+"_value").val(status_value);
    			}
    		}
	    }
    }
}

function reconnect() {
	websocketclient.connect();
	//refreshIntervalId=0;
	//pushToastIntervalId=0;
	//currMsgIntervalIdArray=new Array();
	//displayArray=new Array();
	//contextArray=new Array();
	initial_pop=1;
}

function  q(vType, cmdType, msgType, msgText, val){

    if(val !=null) $("input[name=cmd]").val(eval(vType).get(cmdType).replace('val',val));
    else $("input[name=cmd]").val(eval(vType).get(cmdType));
    if($("input[name=cmd]").val()!='')callApi(msgType,msgText);
}


// Connection Check Only for 1001, 3001
function callApi_doNothing() {
	clearInterval(refreshIntervalId);
	try{
		$.ajax({
			url : '/vdevice/deviceApiCall/connection_check',
			type : 'post',
			async: false,
			timeout : 20000,//20 sec
			data : '',
			beforeSend : function(){
				//emul_log("ajax call beforeSend " );
			},
			success:function(data){
			},
			error : function(xhr,status,error) {
			},
			complete:function(){
				//removeLoadingPush(menu_id);
				emul_log("Connection Check ajax call complete");
			}
		});
	} catch (e){
		//howErrorMsg(error);
	} finally {
		refreshIntervalId = setInterval(callMonitorApi, 1000*60);
	}
}
function callApi_new(req_body, msg_type, msg_short_txt, msg_id)
{
	if(websocketclient.connected!=true) return false;
	
	// Clear Display (Context, Icon..)
	setCurrContext(msg_id); // Reset Context, ???
	$('.main_area .icon').css("display", "none"); // Icon reset
	//$('#popup_messagebox').fadeOut(); // Close Pushbox
	
	clearInterval(refreshIntervalId);
	var add_url ="";
	if(msg_type=='NOTIFICATION') add_url='/notification';
	
	// msg_id insert
    var cmd_val = JSON.parse(req_body);
    if(msg_id==null) {
    	var now=new Date().getTime();
    	msg_id = $("input[name=deviceId]").val()+"_"+now;
    }
    var msg_val = JSON.parse('{"msgId": "'+msg_id+'"}');
    $.extend(cmd_val.request,msg_val);
    $("input[name=cmd]").val(JSON.stringify(cmd_val));
    
	// log write
	writeLog('REQ', 'RESTful', msg_type, msg_short_txt, $("input[name=cmd]").val(), 0);
	
	// ui lock (when not monitor)
	if(msg_short_txt!='Monitor') {
		lock_display(msg_id);
	}
	
	//$('.response_status').addClass('active',{children:true});
	$('.loading_layer').show();
	emul_log("add_url:"+add_url );
	
	emul_log('callApi serialize:'+$(api).serialize());
	try{
		$.ajax({
			url : '/vdevice/deviceApiCall'+add_url,
			type : 'post',
			async: false,
			timeout : 20000,//20 sec
			data : $(api).serialize(),
			beforeSend : function(){
				//emul_log("ajax call beforeSend " );
			},
			success:function(data){
				//                $('#response').val(data);
				emul_log('callApi[HTTP RESPONSE]:'+data);
				var http_res_result = JSON.parse(data);
				var  is_error =0;
				if(http_res_result !=null && http_res_result.result_code !=null && http_res_result.result_code!="200"){
					is_error =1;
				}
				writeLog('RES', 'RESTful', msg_type, msg_short_txt, data, is_error);
				
				if(is_error ==1){
					showErrorMsg(http_res_result.result);
					
					// Display, Control box 원복 및 Monitor
					try {
						show_control_box(); // Control BOX default UI 처리 ???
						showViewPanel();	// Display, Control CUSTOM UI 처리
					} catch(e) { }
					callMonitorApi(msg_id);
				}else{
						//closeDialog(); ??????
					
					//callMonitorApi(msg_id);
				}
				
			},
			error : function(xhr,status,error) {
				closeDialog();
				emul_log("ajax call ERROR : " + error);
				if(status=='error' && error=='Service unavailable') { // Log out Case
					clearInterval(refreshIntervalId); // stop monitoring
					$('#mask_light').show();
					showModal('#logout_shut_down');
				} else {
				showErrorMsg(error);
				// Display, Control box 원복 및 Monitor
				try {
					showViewPanel();
				} catch(e) { }
				callMonitorApi(msg_id);
				}
			},
			complete:function(){
				//removeLoadingPush(menu_id);
				emul_log("ajax call complete");
			}
		});
	}
	catch (e){
		showErrorMsg(error);
	}
	finally{
	    refreshIntervalId = setInterval(callMonitorApi, 1000*60);
	    return msg_id;
	}
	
}

function lock_display(msg_id) {
	//$('.loading_layer').css('display', 'block');
	$('.loading_layer').show();
	currMsgIntervalIdArray[msg_id]=setInterval(unlock_display, 1000*20, msg_id, true);
}

function unlock_display(msg_id, force_unlock_flag) {

	// unlock display ui->none
	if(currMsgIntervalIdArray[msg_id]!=undefined) {
		clearInterval(currMsgIntervalIdArray[msg_id]);
	}
	if(force_unlock_flag==true) { // 강제 unlock시, 원복 및 Monitor
		showViewPanel();
		callMonitorApi();
	}
	
	//$('.response_status').removeClass('active',{children:true});
	//$('.loading_layer').css('display', 'none'); 
	$('.loading_layer').hide();
}


function showDialogModal(id)
{

    event.preventDefault();
    // Get the A tag
    //var id = $("#"+e.target.id).attr('href');
    //dialog center position
    var winH = $(window).height();
    var winW = $(window).width();
    $(id).css('top',  (winH - $(id).height())/2);
    $(id).css('left', (winW - $(id).width())/2);
    // transition effect
    $(id).show();
    shownDialog = $(id);
}

function delete_msg_id_5min() {
    $.each(msg_id_json,function(key,val){
        var now = new Date().getTime();

        if( (parseInt(now)-parseInt(val.msg_time)) > (1000*60*5) ){
        	//emul_log("delete_msg_id_5min exe:"+key+":"+val);
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


function showErrorMsg(error_msg_contents) {
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
    //console.log('btn_disconnect');
    window.close();
});

function showDisconnectFn() {
    event.preventDefault();
    //console.log('showDisconnectFn');
    window.close();

}

function showDisconnectMsg(error_msg_contents) {
    connect_ok=false;
    $('#mask').fadeIn();
    //event.preventDefault();

    $('.dialog').hide();
    $('.close.btn_modal.btn_pink.try_monitor').prop('id','btn_disconnect');
    $('#btn_disconnect').attr('onclick', 'javascript:showDisconnectFn();return false;');

    //var id = "#dialog_error_msg";
    var id = "#disconnect_server";
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
    //console.log('showLoadingBar');
// Cancel the link behavior
//    e.preventDefault();
//    closeDialog();
//    event.preventDefault();
//    $('#mask').fadeIn();
//    // Get the A tag
//    var id = "#dialog_loadding";
//
//    //dialog center position
//    var winH = $(window).height();
//    var winW = $(window).width();
//    $(id).css('top',  (winH - $(id).height())/2);
//    $(id).css('left', (winW - $(id).width())/2);
//
//    // transition effect
//    $(id).show();
//    shownDialog = $(id);
    $("#dialog_loadding").show();
    //dialog draggable
    //$(id).draggable();
}


$(".log_area").scroll( function() {
    var offset = 350;
    var duration = 3;
    var scrollHeight= $('.log_area').scrollTop();
    var topHeight = $(".log_area")[0].scrollHeight;
    var outerHeight = $(".log_area").outerHeight();

    //if(topHeight-scrollHeight-outerHeight>50) $('.alret_area').fadeIn(duration);
    //else $('.alret_area').fadeOut(duration);
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
    if(call_type=='Context_guide') {
    	addLogHtml += '<div class="tip"><p class="point_txt">'+msg_long_txt+'</p></div>';
    } else {
    	if(is_error =='1') {//<p class="error_txt">에러 : 9999</p> <div id="mask" style="display: none;"></div>
    		msg_short_txt = '<p class="error_txt msg_short">'+msg_short_txt+'</p>';
    		msg_long_txt = '<p class="error_txt msg_long"  style="display: none;">'+msg_long_txt+'</p>';
    	}else{
    		msg_short_txt = '<p class="msg_short">'+msg_short_txt+'</p>';
    		msg_long_txt = '<p class="msg_long" style="display: none;">'+msg_long_txt+'</p>';
    	}
    	
    	if(call_type=='REQ') {
    		call_type = '<span class="violet_txt">['+call_type+']</span>'; 
    	} else { // 'RES'
    		call_type = '<span class="orange_txt">['+call_type+']</span>'; 
    	}
    	
    	if(protocol=='RESTful') {
    		protocol = '<span class="green_txt">['+protocol+']</span>'; 
    	} else { // MQTT
    		protocol = '<span class="blue_txt">['+protocol+']</span>'; 
    	}
    	
    	//addLogHtml +='<p class="msg_head">['+hh_mm_ss()+']'+'['+call_type+']'+'['+protocol+']'+'['+msg_type+']</p>'+msg_short_txt+msg_long_txt+'<p style="margin-bottom:10px"></p>';
    	addLogHtml +='<p class="msg_head">['+hh_mm_ss()+']'+call_type+protocol+'['+msg_type+']</p>'+msg_short_txt+msg_long_txt+'<p style="margin-bottom:10px"></p>';
    	
    }
    //$('#log_text_area').append("[SUBSCRIPTION] subscription.topic:"+subscription.topic+"qosNr:"+subscription.qos+"\n<br>");
    //$('#log_text_area').append(addLogHtml);
    //scrollTopLog_text_area();

    var offset = 350;
    var duration = 3;
    var scrollHeight= $('.log_area').scrollTop();
    var totalHeight = $('.log_area').prop('scrollHeight');
    var bottomHeight=totalHeight-scrollHeight;
    
    $('#log_text_area').prepend(addLogHtml);
    if($('.msg_long').get($('.msg_long').length-1).style.display!="none"){
    	$( ".msg_long" ).show();
    }

    totalHeight=$('.log_area').prop('scrollHeight');
    var scrollHeight_tmp=totalHeight-bottomHeight;
    
    if(scrollHeight>50) {
    	$('.alret_area').fadeIn(duration);
    	$(".log_area").scrollTop(scrollHeight_tmp);
    } else scrollTopLog_text_area();
}

function hh_mm_ss() {
    now = new Date();
    hour = "" + now.getHours(); if (hour.length == 1) { hour = "0" + hour; }
    minute = "" + now.getMinutes(); if (minute.length == 1) { minute = "0" + minute; }
    second = "" + now.getSeconds(); if (second.length == 1) { second = "0" + second; }
    return hour + ":" + minute + ":" + second;
}

/*$(".search_word00").change(function(event) {
     var strSearch = $("#search_word").val();
    highlightText(strSearch);
});

$(".btn_search00").click(function(event) {
	var strSearch = $("#search_word").val();
    highlightText(strSearch);
});*/

function search_log() {
	var strSearch = $("#search_word").val();
	highlightText(strSearch);
	
	$('.btn_search').hide();
	$('.btn_area').show();
	
}

$(".next").click(function(event) {
    moveFocus(1);
});

$(".prev").click(function(event) {
    moveFocus(-1);
});

//log search box
$('.search_icon').clickToggle(
		function(){
			$(this).addClass('ic_close');
			$(this).attr('title','Close');
			$('.log_header').css('height','8.5em');
			$('.wrap_log').css('padding-top','13.5em');
			$('.alret_area').css('top','13.5em');
		},
		function(){
			$(this).removeClass('ic_close');
			$(this).attr('title','Search');
			$('.log_header').css('height','4.5em');
			$('.wrap_log').css('padding-top','9.5em');
			$('.alret_area').css('top','9.5em');
			
			// log initilaize
			$('#search_word').val('');
			unHighlightText();
		}
	);



(function($) {
    $.fn.hasScrollBar = function() {
        return this.get(0).scrollHeight > this.height();
    };
})(jQuery);

var scroll_index=0;
function moveFocus(plus_number) {
    if( $('.result').length>0 ){
        if(scroll_index >= $('.result').length-1 && plus_number==1) {
            scroll_index=0;
        }else if(scroll_index <= 0 && plus_number==-1) {
            scroll_index=$('.result').length-1;
        }else{
            scroll_index = scroll_index + Number(plus_number);
        }
        $('#search_number').html( Number(scroll_index)+1+'/'+$('.result').length);
        
        // current nth search word
        $('.result_curr').removeClass('result_curr');
        $('.result').eq(scroll_index).addClass('result_curr');

        if($('#log_text_area').hasScrollBar())    {
            if($('.result').get(scroll_index) != null ){
                $('.result').get(scroll_index).scrollIntoView(false);
                //console.log("scrollIntoView(true:");
            }

        }else{
            //console.log("scrollIntoView(false:");
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
    if($("input[name=cmd]").val()!='')callApi('non-API','initilaization');
    $('.dialog').hide();
}


//display product status slidebox
$(".prod_status_init").click(function() {
	if($( ".prod_status_slidebox").css("display")=="none") {
		$('.context_back_layer').css("display", "block");
	}
	$(".prod_status_slidebox").slideToggle('fast');
});

function showContextSubDevice(sub_device_id) {
	$('input[sub_device_id="'+sub_device_id+'"]').next().toggle();
}
function close_context_box() {
	// selected context reset with current context
	if($('#curr_prod_status').css('display')=='block') {
		curr_context_id=$('#curr_prod_status').attr('data-id');
		$('input:radio[name=prod_status]:input[value="'+curr_context_id+'"]').prop("checked", true);
		// Time Lapse set
		curr_context_timelapse=$('#curr_prod_status').attr('data-id-t');
		if(curr_context_timelapse!=undefined && curr_context_timelapse=='time_boost') {
			tid = $('input:radio[name=prod_status]:input[value='+curr_context_id+']').attr('id')+'_timelapse';
			$('#'+tid).prop("checked", true);
		}
	} else {
		$('.prod_status_slidebox ul li input').prop("checked", false);
	}
	
	$(".prod_status_slidebox").slideToggle('fast');
	$('.context_back_layer').hide();
}

// close context box
$('.context_back_layer').click(function() {
	close_context_box();
	/*$(".prod_status_slidebox").slideToggle('fast');
	$('.context_back_layer').hide();*/
});

// drag 방지
//$(".content_emulator").attr("oncontextmenu","return false");
$(".content_emulator").attr("onselectstart","return false");
$(".content_emulator").attr("ondragstart","return false");

//$("#log_text_area").attr("oncontextmenu","return true");
$("#log_text_area").attr("onselectstart","return true");
$("#log_text_area").attr("ondragstart","return true");

function emul_log(text) {
	if(OPERATION_ENV!='OP' && OPERATION_ENV!='op') {
		console.log(text);
	}
}