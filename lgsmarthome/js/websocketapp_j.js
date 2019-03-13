/**
 * Copyright 2013 dc-square GmbH
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @author: Christoph Schäbel
 */

var CryptoJSAesJson = {
    stringify: function (cipherParams) {
        var j = {ct: cipherParams.ciphertext.toString(CryptoJS.enc.Base64)};
        if (cipherParams.iv) j.iv = cipherParams.iv.toString();
        if (cipherParams.salt) j.s = cipherParams.salt.toString();
        return JSON.stringify(j);
    },
    parse: function (jsonStr) {
        var j = JSON.parse(jsonStr);
        var cipherParams = CryptoJS.lib.CipherParams.create({ciphertext: CryptoJS.enc.Base64.parse(j.ct)});
        if (j.iv) cipherParams.iv = CryptoJS.enc.Hex.parse(j.iv)
        if (j.s) cipherParams.salt = CryptoJS.enc.Hex.parse(j.s)
        return cipherParams;
    }
}

var websocketclient = {
    'client': null,
    'lastMessageId': 1,
    'lastSubId': 1,
    'subscriptions': [],
    'messages': [],
    'connected': false,
    'topics': [],
    'clientId':'',

    'connect': function () {

        var host = websocketserver;
        var port = websocketport;
        var d = new Date();
        var n = d.getTime();
        //var clientId = n+"-"+randomString(5);
        var clientId = emul_session;
        //var username = x_session_id;
        //var password = x_session_key;

        var username = JSON.parse(CryptoJS.AES.decrypt(encrypted1, encTime, {format: CryptoJSAesJson}).toString(CryptoJS.enc.Utf8));
        var password = JSON.parse(CryptoJS.AES.decrypt(encrypted2, encTime, {format: CryptoJSAesJson}).toString(CryptoJS.enc.Utf8));
        var keepAlive = parseInt(30); // keep alive change : 60s -> 30s
        var cleanSession = true;
        var lwTopic = '';
        var lwQos = 0;
        var lwRetain = false;
        var lwMessage = '';
        var ssl = true;

        emul_log('host:'+host);
        emul_log('port:'+port);
        emul_log('clientId:'+clientId);
        //emul_log('username:'+username);
        //emul_log('password:'+password);

        this.client = new Messaging.Client(host, port, clientId);
        this.client.onConnectionLost = this.onConnectionLost;
        this.client.onMessageArrived = this.onMessageArrived;
        this.clientId=clientId;
        var options = {
            timeout: 3,
            keepAliveInterval: keepAlive,
            cleanSession: cleanSession,
            useSSL: ssl,
            onSuccess: this.onConnect,
            onFailure: this.onFail
        };

        if (username.length > 0) {
            options.userName = username;
        }
        if (password.length > 0) {
            options.password = password;
        }
        if (lwTopic.length > 0) {
            var willmsg = new Messaging.Message(lwMessage);
            willmsg.qos = lwQos;
            willmsg.destinationName = lwTopic;
            willmsg.retained = lwRetain;
            options.willMessage = willmsg;
        }

        this.client.connect(options);
    },

    'onConnect': function () {
        websocketclient.connected = true;
        console.log("connected");

        //var body = $('body').addClass('connected').removeClass('notconnected').removeClass('connectionbroke');
        //$('#isConnected').html('Connected OK');
        $('.connection_status').removeClass('disconnected').addClass('connected');

        //add sungini
        var qosNo=1;

        websocketclient.subscribe(topic_device, qosNo ,'device');
        websocketclient.subscribe(topic_messages_device, qosNo,'message_device');
        //websocketclient.subscribe(topic_messages_user, qosNo,'message_user');
        websocketclient.subscribe(topic_event, qosNo ,'event'); // for push
        //websocketclient.subscribe(topic_dialogue_user, qosNo ,'dialogue_user');

        // sub devices 들이 존재하여, 여러건의 subscribe가 필요한 경우 : 3001(G/W), arch
        if(sub_device_ids!='') {
        	for(var key in sub_device_ids) {
        		var sub_topic_event ="#/devices/"+sub_device_ids[key]+"/event";
        		websocketclient.subscribe(sub_topic_event, qosNo ,'event'); // for push
        	}
        }

        websocketclient.publish(topic_device, '{"clientId":"'+websocketclient.clientId+'"}', qosNo,false );

    },

    'onFail': function (message) {
        websocketclient.connected = false;
        console.log("error: " + message.errorMessage);

        websocketclient.render.showError('Connect failed: ' + message.errorMessage);
    },

    'onConnectionLost': function (responseObject) {
        $('#isConnected').html('Connected Lost');
        websocketclient.connected = false;
        if (responseObject.errorCode !== 0) {
            console.log("onConnectionLost:" + responseObject.errorMessage);
        }
        showDisconnectMsg('The connection is closed');
        $('.connection_status').removeClass('connected').addClass('disconnected');

        websocketclient.render.show('conni');
        websocketclient.render.hide('publish');
        websocketclient.render.hide('sub');
        websocketclient.render.hide('messages');

        //Cleanup messages
        websocketclient.messages = [];
        websocketclient.render.clearMessages();

        //Cleanup subscriptions
        websocketclient.subscriptions = [];
        websocketclient.render.clearSubscriptions();
    },

    'onMessageArrived': function (message) {
//        console.log("onMessageArrived:" + message.payloadString + " qos: " + message.qos);

        var subscription = websocketclient.getSubscriptionForTopic(message.destinationName);

        var messageObj = {
            'topic': message.destinationName,
            'retained': message.retained,
            'qos': message.qos,
            'payload': message.payloadString,
            'timestamp': moment(),
            'subscriptionId': subscription.id,
            'color': websocketclient.getColorForSubscription(subscription.id)
        };

        //console.log(messageObj);
        messageObj.id = websocketclient.render.message(messageObj);
        websocketclient.messages.push(messageObj);
    },

    'disconnect': function () {
        this.client.disconnect();
        showDisconnectMsg('The connection is closed');
    },

    'publish': function (topic, payload, qos, retain) {

        if (!websocketclient.connected) {
            websocketclient.render.showError("Not connected");
            return false;
        }

        var message = new Messaging.Message(payload);
        message.destinationName = topic;
        message.qos = qos;
        message.retained = retain;
        this.client.send(message);
    },

    'subscribe': function (topic, qosNr,subscription_type ) {

        if (!websocketclient.connected) {
            websocketclient.render.showError("Not connected");
            return false;
        }

        if (topic.length < 1) {
            websocketclient.render.showError("Topic cannot be empty");
            return false;
        }

        if (_.find(this.subscriptions, { 'topic': topic })) {
            websocketclient.render.showError('You are already subscribed to this topic');
            return false;
        }

        this.client.subscribe(topic, {qos: qosNr});
        var subscription = {'topic': topic, 'qos': qosNr,'subscription_type': subscription_type};
        subscription.id = websocketclient.render.subscription(subscription);
        this.subscriptions.push(subscription);
        return true;
    },

    'unsubscribe': function (id) {
        var subs = _.find(websocketclient.subscriptions, {'id': id});
        this.client.unsubscribe(subs.topic);
        websocketclient.subscriptions = _.filter(websocketclient.subscriptions, function (item) {
            return item.id != id;
        });

        websocketclient.render.removeSubscriptionsMessages(id);
    },

    'deleteSubscription': function (id) {
        var elem = $("#sub" + id);

        if (confirm('Wirklich löschen ?')) {
            elem.remove();
            this.unsubscribe(id);
        }
    },

    'getRandomColor': function () {
        var r = (Math.round(Math.random() * 255)).toString(16);
        var g = (Math.round(Math.random() * 255)).toString(16);
        var b = (Math.round(Math.random() * 255)).toString(16);
        return r + g + b;
    },

    'getSubscriptionForTopic': function (topic) {
        var i;
        for (i = 0; i < this.subscriptions.length; i++) {
            if (this.compareTopics(topic, this.subscriptions[i].topic)) {
                return this.subscriptions[i];
            }
        }
        return false;
    },

    'getColorForPublishTopic': function (topic) {
        var id = this.getSubscriptionForTopic(topic);
        return this.getColorForSubscription(id);
    },

    'getColorForSubscription': function (id) {
        try {
            if (!id) {
                return '99999';
            }

            var sub = _.find(this.subscriptions, { 'id': id });
            if (!sub) {
                return '999999';
            } else {
                return sub.color;
            }
        } catch (e) {
            return '999999';
        }
    },

    'compareTopics': function (topic, subTopic) {
        var pattern = subTopic.replace("+", "(.+?)").replace("#", "(.*)");
        var regex = new RegExp("^" + pattern + "$");
        return regex.test(topic);
    },

    'render': {

        'showError': function (message) {
            showDisconnectMsg(message);
            //alert(message);
        },
        'messages': function () {

            websocketclient.render.clearMessages();
            _.forEach(websocketclient.messages, function (message) {
                message.id = websocketclient.render.message(message);
            });

        },
        'message': function (message) {

            var largest = websocketclient.lastMessageId++;

            //var html = '<li class="messLine id="' + largest + '">' +
            //    '   <div class="row large-12 mess' + largest + '" style="border-left: solid 10px #' + message.color + '; ">' +
            //    '       <div class="large-12 columns messageText">' +
            //    '           <div class="large-3 columns date">' + message.timestamp.format("YYYY-MM-DD HH:mm:ss") + '</div>' +
            //    '           <div class="large-5 columns topicM truncate" id="topicM' + largest + '" title="' + Encoder.htmlEncode(message.topic, 0) + '">Topic: ' + Encoder.htmlEncode(message.topic) + '</div>' +
            //    '           <div class="large-2 columns qos">Qos: ' + message.qos + '</div>' +
            //    '           <div class="large-2 columns retain">';
            //if (message.retained) {
            //    html += 'Retained';
            //}
            //html += '           </div>' +
            //    '           <div class="large-12 columns message break-words">' + Encoder.htmlEncode(message.payload) + '</div>' +
            //    '       </div>' +
            //    '   </div>' +
            //    '</li>';
            //$("#messEdit").prepend(html);

            var receiveId= JSON.parse(message.payload).clientId;
            if(receiveId !=null && receiveId !=websocketclient.clientId){
                /*console.log("receiveId:"+JSON.parse(message.payload).clientId);
                console.log("my clientId:"+websocketclient.clientId);
                console.log("client check flase");*/
                websocketclient.disconnect();

                closeEmulator();
            }else{
                //console.log("client check ok");
                processMqttResult(message.payload);
            }

            $( ".connected .light" ).effect( "pulsate", { times:3 }, 600 );

            //$('#log_text_area').append("[MQTT RECEIVE MSG] ["
            //+"time:"+message.timestamp.format("YYYY-MM-DD HH:mm:ss") +"|"
            //+"topic:"+message.topic +"|" +"qos:"+message.qos +"|"
            //+"payload:"+message.payload +"|" +"\n<br>");

            //+"payload:"+detrans(message.payload) +"|" +"\n");
            
            return largest;
        },

        'subscriptions': function () {
            websocketclient.render.clearSubscriptions();
            _.forEach(websocketclient.subscriptions, function (subs) {
                subs.id = websocketclient.render.subscription(subs);
            });
        },

        'subscription': function (subscription) {
            var largest = websocketclient.lastSubId++;
            //$("#innerEdit").append(
            //    '<li class="subLine" id="sub' + largest + '">' +
            //        '   <div class="row large-12 subs' + largest + '" style="border-left: solid 10px #' + subscription.color + '; background-color: #ffffff">' +
            //        '       <div class="large-12 columns subText">' +
            //        '           <div class="large-1 columns right closer">' +
            //        '              <a href="#" onclick="websocketclient.deleteSubscription(' + largest + '); return false;">x</a>' +
            //        '           </div>' +
            //        '           <div class="qos">Qos: ' + subscription.qos + '</div>' +
            //        '           <div class="topic truncate" id="topic' + largest + '" title="' + Encoder.htmlEncode(subscription.topic, 0) + '">' + Encoder.htmlEncode(subscription.topic) + '</div>' +
            //        '       </div>' +
            //        '   </div>' +
            //        '</li>');

            //$('#log_text_area').append("[SUBSCRIPTION] subscription.topic:"+subscription.topic+"qosNr:"+subscription.qos+"\n<br>");
            var long_log_txt ="subscription.topic:"+subscription.topic;
            writeLog('REQ', 'MQTT', 'API', subscription.subscription_type, long_log_txt, 0);

            return largest;
        },

        'toggleAll': function () {
            websocketclient.render.toggle('conni');
            websocketclient.render.toggle('publish');
            websocketclient.render.toggle('messages');
            websocketclient.render.toggle('sub');
        },

        'toggle': function (name) {
            $('.' + name + 'Arrow').toggleClass("closed");
            $('.' + name + 'Top').toggleClass("closed");
            var elem = $('#' + name + 'Main');
            elem.slideToggle();
        },

        'hide': function (name) {
            $('.' + name + 'Arrow').addClass("closed");
            $('.' + name + 'Top').addClass("closed");
            var elem = $('#' + name + 'Main');
            elem.slideUp();
        },

        'show': function (name) {
            $('.' + name + 'Arrow').removeClass("closed");
            $('.' + name + 'Top').removeClass("closed");
            var elem = $('#' + name + 'Main');
            elem.slideDown();
        },

        'removeSubscriptionsMessages': function (id) {
            websocketclient.messages = _.filter(websocketclient.messages, function (item) {
                return item.subscriptionId != id;
            });
            websocketclient.render.messages();
        },

        'clearMessages': function () {
            $("#messEdit").empty();
        },

        'clearSubscriptions': function () {
            $("#innerEdit").empty();
        }
    }
};