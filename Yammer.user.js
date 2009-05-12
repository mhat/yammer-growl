// ==UserScript==
// @name        Yammer Growl Notifications
// @namespace   http://fluidapp.com
// @description Growles on Yammer Updates from Fluid!
// @include     *
// @author      Matt Knopp
// ==/UserScript==

(function () {
    console.log("starting yammer user script");

    if (window.fluid) {
        var last_message_id = 0
        
        // hide the system_notice banner after 10 seconds!
        window.setTimeout(function() {
            $("system_notice").hide();
        }, 10*1000);

        window.setInterval(function() {
            //console.log("checking for new messages : " + last_message_id);

            var messages     = [];
            var raw_messages = $$("li[id^=message_]");
            
            // fixme: right now this does two passes, the first is to determin which
            // if any messages should be growled and then second growl them. i think
            // it would be better to add an attribute or class to the messages that 
            // i've already seen/groweled and then search for !class or !attr, then
            // growl those directly in one-loop.

            for(var i=0; i < raw_messages.length; i++) {
                var raw_message       = raw_messages[i];
                var message           = {};
                message['message_id'] = parseInt(raw_message.readAttribute('message_id'));
                
                // make sure that the first itereation doesn't growl-spam the user
                // 
                if (last_message_id == 0)
                    last_message_id = message['message_id'];
                
                // make sure that i only growl messages that haven't been growled
                if (message['message_id'] <= last_message_id)
                    break;
                
                // crufty: extract the main content from a message and reformat it 
                // to look better as a growl message.
                message['content'] =
                    (raw_message.getElementsBySelector(".content")[0].innerText.split('\n'))[0]
                    .replace(/to.+\:/,'says');
                    
                // extract a the userpic so it can be part of the growl notification
                message['userpic'] =
                    raw_message.getElementsBySelector("img[alt^='@']")[0].readAttribute('src');
                
                // fixme: determins if the message is private, eventually I'll do 
                // something with this but not yet it seems. 
                message['private'] =
                    raw_message.getElementsBySelector("img[src$='private_icn.gif']")
                    .length ? true : false;
                
                messages.push(message);
            }
            
            for (var i=messages.length-1; i >= 0; i--) {
                console.log("handling message " + i + "of " + messages.length);
                last_message_id = messages[i]['message_id'];
                
                window.fluid.showGrowlNotification({
                    icon        : messages[i]['userpic'],
                    description : messages[i]['content'], 
                    identifier  : "FluidYammer_" + messages[i]['message_id']
                });
            }
            
        }, 60*1000);
        
    }
})();