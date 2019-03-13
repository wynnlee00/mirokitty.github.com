$(document).ready(function() {
	prettyPrint();
	// CodeMirror Initialize
	var jsoninput = document.getElementById('pre_requestBody');
	if (jsoninput != null) {
		editor = CodeMirror.fromTextArea(jsoninput, {
			lineNumbers: true,
			mode: "application/json",
			gutters: ["CodeMirror-lint-markers"],
			lint: true
		});
	}

	
	$('#service_category').change(function(){
		var code = $("#service_category option:selected").val();
		
	  	if($('#H-x-service-id')) $('#H-x-service-id').val('');
		if($('#H-x-session-id')) $('#H-x-session-id').val('');
		if($('#H-x-session-key')) $('#H-x-session-key').val('');
	   $('#err_selService').hide();
	   $('#err_noService').hide();
	   $("#err_selDevice").hide();
	   $('#err_noDevice').hide();
	   $.ajax({
			type:"post",
			url:"/myservice/ajax_getHeader",
			data: "code="+code,
			dataType: 'json'
		}).done(function(data) {
			if(data.code == 1){
            	result = data.message;
            	if($('#H-x-service-id')) $('#H-x-service-id').val(result['x-service-id']);
            	if($('#H-x-session-id')) $('#H-x-session-id').val(result['x-session-id']);
            	if($('#H-x-session-key')) $('#H-x-session-key').val(result['x-session-key']);
            	if($('#H-x-token-key')) $('#H-x-token-key').val(result['x-token-key']);
            	if($('#H-x-account-type')) $('#H-x-account-type').val(result['x-account-type']);
            	if($('#U-user-id')) $('#U-user-id').val(result['u-user-id']);
            	if($('#H-x-emp-id')) $('#H-x-emp-id').val(result['x-emp-id']);
            	if($('#H-x-target-date')) $('#H-x-target-date').val(result['x-target-date']);
            } else {
            	result = data.message;
            	if($('#hd_id').val() != 'register_new_user') $('#err_noService').show();
            	if($('#H-x-service-id')) $('#H-x-service-id').val(result['x-service-id']);
            	if($('#H-x-token-key')) $('#H-x-token-key').val(result['x-token-key']);
            	if($('#H-x-account-type')) $('#H-x-account-type').val(result['x-account-type']);
            	if($('#U-user-id')) $('#U-user-id').val(result['u-user-id']);

            }
		}).fail(function(data) {
			$('#err_selService').hide();
			$('#err_noService').hide();
			$('#err_fail').show();
		});
		
		if($('#hd_selProductFlag').val() == 'Y') {		// select product가 있을 경우
			
			var strHtml ='<option value="" disabled selected>Select</option>';
			$('#U-device-id').val('');
			$.ajax({
		        url: '/myservice/ajax_getDevice',
		        type: 'post',
		        data: "code="+code,
		        dataType: 'json'
	        }).done(function(data) {
	        	
	            if(data.code == 1){
	            	var device = data.message;
	            	if( device.length > 0) {
		            	for(var i=0; i < device.length; i++)
				    	{
				    		strHtml += "<option value='"+device[i]['deviceId']+"'>"+device[i]['deviceType']+" | "+device[i]['nickName']+"</option>";
				    	}
				    	$("#device_category").html(strHtml);
				    } else {
				    	$("#err_noDevice").show();
				    	$("#device_category").html(strHtml);
				    }
	            }
	            else {
	            	$("#err_noDevice").show();
	            	$("#device_category").html(strHtml);
	            }
	        });
		    
		}
	});
	$('#device_category').change(function(){
		
		var id = $("#device_category option:selected").val();
		$('#U-device-id').val('');
		if($('#U-device-id')) $('#U-device-id').val(id);
		if($('#H-x-device-id')) $('#H-x-device-id').val(id);
		
	});
	
	
	$('.btn_request').click(function(){
		var inputValues = new Array();
		var valid = true;
		
		if($("#service_category").length > 0) {
			if($("#service_category option:selected").val() == ''){
				$('#service_category').addClass('invalid');
				$('#err_selService').show();
				valid = false;
			} else {
				$('#service_category').removeClass('invalid');
				$('#err_selService').hide();
			}
		}
		if($("#device_category").length > 0) {
			if($("#device_category option:selected").val() == '') {
				$('#device_category').addClass('invalid');
				$('#err_selDevice').show();
				valid = false;
			} else {
				$('#device_category').removeClass('invalid');
				$('#err_selDevice').hide();
			}
		}
		
		$('.required').each(function(){
			if($('#hd_id').val() != 'get_user_info') {
				if($(this).val() == '') {
					$(this).addClass('invalid');
			    	$("#err_"+$(this).attr('name')).show();
			    	valid = false;
			  	} else {
			  		$(this).removeClass('invalid');
			  		$("#err_"+$(this).attr('name')).hide();
			  	}
			 } else {
			 	
			 	if($(this).val() == '') {
			 		if($(this).attr('name')=='H-x-service-id') return true;
			 		
					$(this).addClass('invalid');
			    	$("#err_"+$(this).attr('name')).show();
			    	valid = false;
			  	} else {
			  		$(this).removeClass('invalid');
			  		$("#err_"+$(this).attr('name')).hide();
			  	}
			 }
		});

		if(valid == false) return false; 
		
		var params = $('#frmapi').serialize();
		if(jsoninput) var requestBody = editor.getValue();
		if(requestBody) params = params+'&body='+requestBody;
		$('.request').hide();
		$('.loading').show();
		
		$.ajax({
		  type: "post",
		  url: "/myservice/ajax_request",
		  data: params,
		  dataType: 'json'
		}).done(function(data) {
			$('#pr_response').text(data.message);
			$('.btn_reponse_copy').show();
			$('.request').show();
			$('.loading').hide();
		});
	});
	

    $("body")
      .on("copy", ".btn_curl_copy", function(e) {
      	$('#curl_toast').fadeIn();
        e.clipboardData.clearData();
        var text = $('#curl_copy_text').html().replace(/<br\s?\/?>/g,"\n").replace(/&nbsp;&nbsp;&nbsp;&nbsp;/g,"").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
        e.clipboardData.setData("text",text);
        e.preventDefault();
        $('#curl_toast').fadeOut('slow');
      });
      
     $("body")
      .on("copy", ".btn_python_copy", function(e) {
      	$('#python_toast').fadeIn();
        e.clipboardData.clearData();
       // var text = $('#curl_copy_text2').html().replace(/<br\s?\/?>/g,"\n");
        //e.clipboardData.setData("text",text);
        e.clipboardData.setData("text/plain",$('#python_copy_text').html().replace(/<br\s?\/?>/g,"\n").replace(/&lt;/g, "<").replace(/&gt;/g, ">"));
        e.preventDefault();
        $('#python_toast').fadeOut('slow');
      });
      
     $("body")
      .on("copy", ".btn_reponse_copy", function(e) {
      	$('#response_toast').fadeIn();
        e.clipboardData.clearData();
        e.clipboardData.setData("text/plain",$('#pr_response').html().replace(/<br\s?\/?>/g,"\n"));
        e.preventDefault();
        $('#response_toast').fadeOut('slow');
      });
     
	
});