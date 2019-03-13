//*virtual device*//
//websocketserver = 'api-qa.lglime.com';
//websocketserver = 'api-dv.lglime.com';
websocketport = 9000;
keepalive = 60;

//topic_device ="/lime/devices/"+deviceId+"/"+x_service_id;
//topic_messages="/lime/messages/"+deviceId+"/"+x_service_id;
//topic_event ="/lime/devices/"+deviceId+"/event";

//topic_device ="#/devices/"+deviceId+"/"+x_session_id;
//topic_messages="#/messages/user/"+x_session_id;
//topic_event ="#/devices/"+deviceId+"/event";

serviceLevelLabel = function(str){
    switch(str){
        case 0 : return 'Default'; break;
        case 1 : return 'Standard'; break;
        case 2 : return 'Expanded'; break;
        case 3 : return 'All'; break;
        default : return '-'; break;
    }
}

var device_map = new Map();
device_map.set(101, "refrigerator");
device_map.set(201 ,"washer");
device_map.set(202 ,"dryer");
device_map.set(301 ,"oven");
device_map.set(401 ,"airconditioner");
device_map.set(501 ,"hombot");
device_map.set(601 ,"601 dummy type");
device_map.set(801 ,"boiler");
device_map.set(901 ,"speaker");


var cmd_ini = '{"request": {"cmd": {"Action": "Init"}}}';
var cmd_monitor ='{"request": {"cmd": {"Action": "Monitor"}}}';

var cmd_401 = new Map();
//monitor
cmd_401.set("Monitor", '{"request": {"cmd": {"Action": "Monitor"}}}');
cmd_401.set("Init", '{"request": {"cmd": {"Action": "Init"}}}');
//network
cmd_401.set("home_networkfalse", '{"request": {"cmd": {"Category":"Power","Property":"Network","Value":"0"}}}');
cmd_401.set("home_networktrue", '{"request": {"cmd": {"Category":"Power","Property":"Network","Value":"1"}}}');
//power supply
cmd_401.set("power_supplyfalse", '{"request": {"cmd": {"Category":"Power","Property":"State","Value":"0"}}}');
cmd_401.set("power_supplytrue", '{"request": {"cmd": {"Category":"Power","Property":"State","Value":"1"}}}');
//save power_saving
cmd_401.set("power_savingfalse", '{"request": {"cmd": {"Category":"Power","Property":"Save","Value":"0"}}}');
cmd_401.set("power_savingtrue", '{"request": {"cmd": {"Category":"Power","Property":"Save","Value":"1"}}}');
//현재 온도 Current
cmd_401.set("current", '{"request": {"cmd": {"Category":"Temperature","Property":"Current","Value":val}}}');
//운전시작 start/stop
cmd_401.set("powerfalse", '{"request": {"cmd": {"Category":"Operation","Property":"Status","Value":"0"}}}');
cmd_401.set("powertrue", '{"request": {"cmd": {"Category":"Operation","Property":"Status","Value":"1"}}}');
//network
cmd_401.set("home_networkfalse", '{"request": {"cmd": {"Category":"Power","Property":"Network","Value":"0"}}}');
cmd_401.set("home_networktrue", '{"request": {"cmd": {"Category":"Power","Property":"Network","Value":"1"}}}');
//운전모드 mode
cmd_401.set("cool", '{"request": {"cmd": {"Category":"Operation","Property":"Mode","Value":"0"}}}');
cmd_401.set("humid", '{"request": {"cmd": {"Category":"Operation","Property":"Mode","Value":"1"}}}');
cmd_401.set("dry", '{"request": {"cmd": {"Category":"Operation","Property":"Mode","Value":"1"}}}');//us
cmd_401.set("fan", '{"request": {"cmd": {"Category":"Operation","Property":"Mode","Value":"2"}}}');//us
cmd_401.set("heat", '{"request": {"cmd": {"Category":"Operation","Property":"Mode","Value":"4"}}}');//us
cmd_401.set("aco", '{"request": {"cmd": {"Category":"Operation","Property":"Mode","Value":"6"}}}');//us
cmd_401.set("saver", '{"request": {"cmd": {"Category":"Operation","Property":"Mode","Value":"8"}}}');//us


//희망 온도 Target
cmd_401.set("target", '{"request": {"cmd": {"Category":"Temperature","Property":"Target","Value":val}}}');
//약중강 wind
cmd_401.set("weak", '{"request": {"cmd": {"Category":"Wind","Property":"Strength","Value":"2"}}}');
cmd_401.set("medium", '{"request": {"cmd": {"Category":"Wind","Property":"Strength","Value":"4"}}}');
cmd_401.set("strong", '{"request": {"cmd": {"Category":"Wind","Property":"Strength","Value":"6"}}}');
cmd_401.set("low", '{"request": {"cmd": {"Category":"Wind","Property":"Strength","Value":"2"}}}');//us
cmd_401.set("high", '{"request": {"cmd": {"Category":"Wind","Property":"Strength","Value":"6"}}}');//us
cmd_401.set("auto", '{"request": {"cmd": {"Category":"Wind","Property":"Strength","Value":"8"}}}');//us

//취침,꺼짐,켜짐 예약 wind
cmd_401.set("timersleep", '{"request": {"cmd": {"Action":"Reserve","Property":"Sleep","Value":val}}}');
cmd_401.set("timeroff", '{"request": {"cmd": {"Action":"Reserve","Property":"Off","Value":val}}}');
cmd_401.set("timeron", '{"request": {"cmd": {"Action":"Reserve","Property":"On","Value":val}}}');

//공기 청정 airclean
cmd_401.set("aircleantrue", '{"request": {"cmd": {"Category":"Misc","Property":"AirClean","Value":"1"}}}');
cmd_401.set("aircleanfalse", '{"request": {"cmd": {"Category":"Misc","Property":"AirClean","Value":"0"}}}');

cmd_401.set("full_tank", '{"request": {"content": {"value": "Full Tank"},"push_code": "0001","level": "Caution"}}');



var cmd_301 = new Map();
//monitor
cmd_301.set("Monitor", '{"request": {"cmd": {"Action": "Monitor"}}}');
cmd_301.set("Init", '{"request": {"cmd": {"Action": "Init"}}}');
//power
cmd_301.set("power_supplyfalse", '{"request": {"cmd": {"Category":"Power","Property":"State","Value":"0"}}}');
cmd_301.set("power_supplytrue", '{"request": {"cmd": {"Category":"Power","Property":"State","Value":"1"}}}');
//network
cmd_301.set("home_networkfalse", '{"request": {"cmd": {"Category":"Power","Property":"Network","Value":"0"}}}');
cmd_301.set("home_networktrue", '{"request": {"cmd": {"Category":"Power","Property":"Network","Value":"1"}}}');
//일시정지, 다시 시작, 취소
cmd_301.set("mode_pause", '{"request": {"cmd": {"Category":"Operation","Property":"Mode","Value":"04"}}}');
cmd_301.set("mode_resume", '{"request": {"cmd": {"Category":"Operation","Property":"Mode","Value":"04"}}}');
cmd_301.set("mode_standby", '{"request": {"cmd": {"Category":"Operation","Property":"Mode","Value":"00"}}}');

//push
cmd_301.set("heating_done", '{"request": {"content": {"value": "heating done"},"push_code": "0001","level": "Caution"}}');
cmd_301.set("over_turn", '{"request": {"content": {"value": "over turn"},"push_code": "0002","level": "Caution"}}');
cmd_301.set("lack_of_water", '{"request": {"content": {"value": "lack of water"},"push_code": "0003","level": "Caution"}}');
cmd_301.set("cooking_done", '{"request": {"content": {"value": "cooking done"},"push_code": "0004","level": "Caution"}}');
cmd_301.set("cleaning_done", '{"request": {"content": {"value": "cleaning done"},"push_code": "0006","level": "Caution"}}');

cmd_301.set("push3", '{"request": {"content": {"value": "Washing water replenishment"},"push_code": "0013","level": "Caution"}}');
cmd_301.set("push4", '{"request": {"content": {"value": "Use the error"},"push_code": "0014","level": "Caution"}}');
cmd_301.set("push5", '{"request": {"content": {"value": "Temperature sensor error(1)"},"push_code": "0015","level": "Caution"}}');
cmd_301.set("push6", '{"request": {"content": {"value": "Temperature sensor error(1)"},"push_code": "0016","level": "Caution"}}');
cmd_301.set("push7", '{"request": {"content": {"value": "Enter Button error"},"push_code": "0017","level": "Caution"}}');
cmd_301.set("push8", '{"request": {"content": {"value": "Steam generator temperature sensor error(1)"},"push_code": "0018","level": "Caution"}}');
cmd_301.set("push9", '{"request": {"content": {"value": "Steam generator temperature sensor error(2)"},"push_code": "0019","level": "Caution"}}');
cmd_301.set("push10", '{"request": {"content": {"value": "Cooling fan error"},"push_code": "0020","level": "Caution"}}');
cmd_301.set("push11", '{"request": {"content": {"value": "Communication error"},"push_code": "0021","level": "Caution"}}');
cmd_301.set("push12", '{"request": {"content": {"value": "Exceeding the current generation error"},"push_code": "0022","level": "Caution"}}');
cmd_301.set("push13", '{"request": {"content": {"value": "Heating element temperature sensor error"},"push_code": "0023","level": "Caution"}}');
cmd_301.set("push14", '{"request": {"content": {"value": "Inverter temperature sensor error"},"push_code": "0024","level": "Caution"}}');

cmd_301.set("complete_notification", '{"request": {"content": {"value": "Complete Notification"},"push_code": "0004","level": "Caution"}}');//us
cmd_301.set("self_clean_needed",  '{"request": {"content": {"value": "Self Clean Needed"},"push_code": "0005","level": "Caution"}}');//us
cmd_301.set("an_error_has_occurred",  '{"request": {"content": {"value": "An Error Has Occurred"},"push_code": "9999","level": "Caution"}}');//us

var cmd_201 = new Map();
cmd_201.set("Monitor", '{"request": {"cmd": {"Action": "Monitor"}}}');
cmd_201.set("StartWash", '{"request": {"cmd": {"Action":"StartWashNormal", "Property" : "1"}}}');
cmd_201.set("Init", '{"request": {"cmd": {"Action": "Init"}}}');

//cmd_201.set("PowerOn", '{"request": {"cmd": {"Category":"Power","Property":"State","Value":"1"}}}');
//cmd_201.set("PowerOff", '{"request": {"cmd": {"Category":"Power","Property":"State","Value":"0"}}}');
cmd_201.set("SmartOn", '{"request": {"cmd": {"Category":"Power","Property":"Smart","Value":"1"}}}');
cmd_201.set("SmartOff", '{"request": {"cmd": {"Category":"Power","Property":"Smart","Value":"0"}}}');

//전원 powerpower_supplyfalse
cmd_201.set("power_supplyfalse", '{"request": {"cmd": {"Category":"Power","Property":"State","Value":"0"}}}');
cmd_201.set("power_supplytrue", '{"request": {"cmd": {"Category":"Power","Property":"State","Value":"1"}}}');
//network
cmd_201.set("home_networkfalse", '{"request": {"cmd": {"Category":"Power","Property":"Network","Value":"0"}}}');
cmd_201.set("home_networktrue", '{"request": {"cmd": {"Category":"Power","Property":"Network","Value":"1"}}}');
//일시정지
cmd_201.set("mode_pause", '{"request": {"cmd": {"Category":"Operation","Property":"Mode","Value":"6"}}}');

cmd_201.set("push1", '{"request": {"content": {"value": "Door lock error"},"push_code": "0010,DE2","level": "Caution"}}');  //""문 잠김 에러 알림(DE2)"
cmd_201.set("push2", '{"request": {"content": {"value": "Water supply error"},"push_code": "0100,IE","level": "Caution"}}');  //""급수 에러 알림(IE)"
cmd_201.set("push3", '{"request": {"content": {"value": "Drainage error"},"push_code": "0100,OE","level": "Caution"}}');  //""배수 에러 알림(OE)"
cmd_201.set("push4", '{"request": {"content": {"value": "Dehydration error"},"push_code": "0100,UE","level": "Caution"}}');  //""탈수 에러 알림(UE)"
cmd_201.set("push5", '{"request": {"content": {"value": "Water valve error"},"push_code": "0100,FE","level": "Caution"}}');  //""급수 밸브 에러 알림(FE)"
cmd_201.set("push6", '{"request": {"content": {"value": "Water level sensor error"},"push_code": "0100,PE","level": "Caution"}}');  //""물 수위 센서 에러 알림(PE)"
cmd_201.set("push7", '{"request": {"content": {"value": "Over temperature sensor"},"push_code": "0100,tE","level": "Caution"}}');  //""온도 센서 이상 알림(tE)"
cmd_201.set("push8", '{"request": {"content": {"value": "Tub over operations"},"push_code": "0100,LE","level": "Caution"}}');  //""세탁조 동작 이상 알림 (LE)"
cmd_201.set("push9", '{"request": {"content": {"value": "Dry error"},"push_code": "0100,dHE","level": "Caution"}}'); //" "건조 에러(dHE)"
cmd_201.set("push10", '{"request": {"content": {"value": "Freeze detection error"},"push_code": "0100,FF","level": "Caution"}}');//" "동결 감지 에러 (FF)"
cmd_201.set("push11", '{"request": {"content": {"value": "Door open Error"},"push_code": "0100,DE1","level": "Caution"}}');//" "문 열림 에러 (DE1)"
cmd_201.set("push12", '{"request": {"content": {"value": "Detergent inlet cover open error"},"push_code": "0100,LOE","level": "Caution"}}');//" "세제 투입구 덮개 열림 에러 (LOE)"

var cmd_101 = new Map();
cmd_101.set("Monitor", '{"request": {"cmd": {"Action": "Monitor"}}}');
cmd_101.set("EnergyMonitoring", '{"request": {"cmd": {"Action": "EnergyMonitoring"}}}');
cmd_101.set("Init", '{"request": {"cmd": {"Action": "Init"}}}');

cmd_101.set("airfreshener_auto", '{"request": {"cmd": {"Category":"Misc","Property":"AirFreshener","Value":"2"}}}');
cmd_101.set("airfreshener_power", '{"request": {"cmd": {"Category":"Misc","Property":"AirFreshener","Value":"3"}}}');
cmd_101.set("airfreshener_off", '{"request": {"cmd": {"Category":"Misc","Property":"AirFreshener","Value":"1"}}}');

cmd_101.set("power_supplyfalse", '{"request": {"cmd": {"Category":"Power","Property":"State","Value":"0"}}}');
cmd_101.set("power_supplytrue", '{"request": {"cmd": {"Category":"Power","Property":"State","Value":"1"}}}');
//network
cmd_101.set("home_networkfalse", '{"request": {"cmd": {"Category":"Power","Property":"Network","Value":"0"}}}');
cmd_101.set("home_networktrue", '{"request": {"cmd": {"Category":"Power","Property":"Network","Value":"1"}}}');

cmd_101.set("refrigerator_temp", '{"request": {"cmd": {"Category":"Temperature","Property":"Fridge","Value":"val"}}}');
cmd_101.set("freezer_temp", '{"request": {"cmd": {"Category":"Temperature","Property":"Freezer","Value":"val"}}}');
cmd_101.set("iceplustrue", '{"request": {"cmd": {"Category":"Misc","Property":"IcePlus","Value":"2"}}}');
cmd_101.set("iceplusfalse", '{"request": {"cmd": {"Category":"Misc","Property":"IcePlus","Value":"1"}}}');

cmd_101.set("save_off", '{"request": {"cmd": {"Category":"Power","Property":"Save","Value":"0"}}}');
cmd_101.set("save_night", '{"request": {"cmd": {"Category":"Power","Property":"Save","Value":"1"}}}');
cmd_101.set("save_custom", '{"request": {"cmd": {"Category":"Power","Property":"Save","Value":"2"}}}');
cmd_101.set("save_grid", '{"request": {"cmd": {"Category":"Power","Property":"Save","Value":"3"}}}');

//push
cmd_101.set("push1", '{"request": {"content": {"value": "Door Open"},"push_code": "0010","level": "Caution"}}');

cmd_101.set("push3", '{"request": {"content": {"value": "IcePlus Auto Off"},"push_code": "0003","level": "Caution"}}');
cmd_101.set("push4", '{"request": {"content": {"value": "Change Fresh Air Filter"},"push_code": "0004","level": "Caution"}}');
cmd_101.set("push6", '{"request": {"content": {"value": "Change Water Filter"},"push_code": "0006","level": "Caution"}}');
cmd_101.set("push8", '{"request": {"content": {"value": "Door open"},"push_code": "0008","level": "Caution"}}');

cmd_101.set("push12", '{"request": {"content": {"value": "Detergent inlet cover open error"},"push_code": "0100,LOE","level": "Caution"}}');
