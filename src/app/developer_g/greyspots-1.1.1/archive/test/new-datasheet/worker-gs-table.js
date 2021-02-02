//global postMessage, console
//jslint maxlen:80, white:false



// CODE INDEX: (use find to skip to a section)
//      # INCOMING MESSAGE HANDLER
//      # FIRST CONTACT

// for sections of code that have been explained but need to be completed:
//      # NEED CODING













// ############################################################################
// ########################### INCOMING MESSAGE HANDLER #######################
// ############################################################################

function onmessage(event) {
    "use strict";
    //console.log('worker received', event);
    //postMessage('test');
}

// this prevents the JSLINT unused function error
onmessage({"content": ""});

// #############################################################################
// ################################# FIRST CONTACT #############################
// #############################################################################

// this let's the gs-table know that this web worker is ready to use
postMessage({"content": "ready"});
