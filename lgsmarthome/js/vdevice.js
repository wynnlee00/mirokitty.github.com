/**
 * Created by sungini.kim on 2015-06-04.
 */

function popupDevice(deviceId,nickName,modelNm,deviceType,serviceId,service_name)
{
    var popUrl = '/vdevice/popVdevice/'+deviceId+'/'+nickName+'/'+modelNm+'/'+deviceType+'/'+serviceId+'/'+service_name;
    var popOption = "width=800, height=800, " +
        "fullscreen=no, menubar=no,resizable=no, scrollbars=no, status=no,location=no,directories=no;";
    window.open(popUrl,"",popOption);

}


    //function popupOpen(){
    //    var popUrl = "test.html";	//팝업창에 출력될 페이지 URL
    //    var popOption = "width=370, height=360, resizable=no, scrollbars=no, status=no;";    //팝업창 옵션(optoin)
    //    Future = "fullscreen=no,toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=no," +
    //    "resizable=no,left=" + Left + ",top=" + Top + ",width=" + popupwidth + ",height=" + popupheight;
    //    window.open(popUrl,"",popOption);
    //}


/*-------------------- OLD popup ------------*/

