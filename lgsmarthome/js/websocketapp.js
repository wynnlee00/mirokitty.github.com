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
        var clientId = n+"-"+randomString(5);

        var username = JSON.parse(CryptoJS.AES.decrypt(encrypted1, encTime, {format: CryptoJSAesJson}).toString(CryptoJS.enc.Utf8));
        var password = JSON.parse(CryptoJS.AES.decrypt(encrypted2, encTime, {format: CryptoJSAesJson}).toString(CryptoJS.enc.Utf8));
        var keepAlive = parseInt(60);
        var cleanSession = true;
        var lwTopic = '';
        var lwQos = 0;
        var lwRetain = false;
        var lwMessage = '';
        var ssl = true;

        console.log('host:'+host);
        console.log('port:'+port);
        console.log('clientId:'+clientId);


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

        $('.connection_status').removeClass('disconnected').addClass('connected');

        var qosNo=1;

        websocketclient.subscribe(topic_device, qosNo ,'device');
        websocketclient.subscribe(topic_messages_device, qosNo,'message_device');
        websocketclient.subscribe(topic_event, qosNo ,'event');
        //websocketclient.subscribe(topic_messages_user, qosNo,'message_user');
        //websocketclient.subscribe(topic_dialogue_user, qosNo ,'dialogue_user');

        websocketclient.publish(topic_device, '{"clientId":"'+websocketclient.clientId+'"}', qosNo,false );

        callMonitorApi();
    },

    'onFail': function (message) {
        websocketclient.connected = false;
        console.log("error: " + message.errorMessage);
        websocketclient.render.showDisconnectMsg('Server connection failed.' );
    },

    'onConnectionLost': function (responseObject) {
        $('#isConnected').html('Connected Lost');
        websocketclient.connected = false;
        if (responseObject.errorCode !== 0) {
            console.log("onConnectionLost:" + responseObject.errorMessage);
        }
        websocketclient.render.showDisconnectMsg('Server connection failed.' );
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

        console.log(messageObj);
        messageObj.id = websocketclient.render.message(messageObj);
        websocketclient.messages.push(messageObj);
    },

    'disconnect': function () {
        this.client.disconnect();
        websocketclient.render.showDisconnectMsg('The connection is closed.' );
    },

    'publish': function (topic, payload, qos, retain) {

        if (!websocketclient.connected) {
            websocketclient.render.showDisconnectMsg("It is not connected to the server.");
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
            websocketclient.render.showDisconnectMsg("It is not connected to the server.");
            return false;
        }

        if (topic.length < 1) {
            websocketclient.render.showDisconnectMsg("Topic cannot be empty");
            return false;
        }

        if (_.find(this.subscriptions, { 'topic': topic })) {
            websocketclient.render.showDisconnectMsg('You are already subscribed to this topic');
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

        'showDisconnectMsg': function (message) {
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

            var receiveId= JSON.parse(message.payload).clientId;
            if(receiveId !=null && receiveId !=websocketclient.clientId){
                console.log("receiveId:"+JSON.parse(message.payload).clientId);
                console.log("my clientId:"+websocketclient.clientId);
                console.log("client check flase");
                websocketclient.disconnect();

                //alert('다른 연결이 발생해서 이 연결은 닫힙니다.');
                self.opener = self;
                //window.close();
            }else{
                console.log("client check ok");
            }

            $( ".connected .light" ).effect( "pulsate", { times:3 }, 600 );
            /*
             $('#log_text_area').append("[MQTT RECEIVE MSG] ["
             +"time:"+message.timestamp.format("YYYY-MM-DD HH:mm:ss") +"|"
             +"topic:"+message.topic +"|" +"qos:"+message.qos +"|"
             +"payload:"+message.payload +"|" +"\n<br>");
             +"payload:"+detrans(message.payload) +"|" +"\n");
             */

            showViewPanel(message.payload);



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