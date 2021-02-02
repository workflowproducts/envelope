//global GS, xtag, document, window, ml, evt, doT, Worker
//jslint browser:true, this:true, white:true


// ########################################################################
// ########################### BEFORE YOU START ###########################
// ########################################################################

// before you start coding, here's what you need to know before contributing

// ############## WHITESPACE ##############
// don't worry about whitespace or the number of characters on a line

// ############## PARAMETERS ##############
// there is only one parameter per function. the only parameter is the "element" parameter, which is the gs-table element. other function parameters are not used except in a few cases. you can use parameters if the function you want to create is purely a utility function. the other allowable case where you can use parameters if the parameters are consumable (for example, an insert function takes in data for an insert and consumes it, for now, there is no reason to store that info).
// how you pass data around is to store it on the element itself. there are several JSON objects stored on the element that are there just for storing info that could be useful to other functions. here's a list of the JSON objects:
//      element.elems
//      element.internalData
//      element.internalScrollOffsets
//      element.internalEvents
//      element.internalEventCancelled
//      element.internalScroll
//      element.internalTimerIDs
//      element.internalTemplates
//      element.internalDisplay
//      element.internalSelection
//      element.internalClip
//      element.internalWorker
//      element.internalLoaders
//      element.internalResize
//      element.internalReorder
// each one of these is defined in the main file (test.js) at about line #1780.
// if you need something defined in there or you need a new JSON object, let me(mike) know and I'll see what i can do about it.
// having most information passed around through these JSON objects prevents issues like functions that have twenty parameters and you need to set some undefined and some to true (whatever 'true' means!) and all kinds of unintelligible mess.

// ############## COMMENTS ##############
// at the bare minimum, if something would be confusing to me(mike), COMMENT IT. at the bare minimum, tell me why you did it. it would also be beneficial to tell me what you're doing in the code.

// ############## YOUR CODE ##############
// in the end, I'll be formatting the whitespace, renaming the variables to something consistent, adding more comments and changing the code to 80 chars max width. this isn't because I think i'm some elite programmer who is the only one who can write code like the rest of the datasheet, it's because we need to save time and in order to keep the code consistent and save time this is the proccess we need to follow. i don't have time to teach you everything. make sure you name your variables in such a way that I'll understand what they are.

// #######################################################################
// ######################## WHAT YOU ARE BUILDING ########################
// #######################################################################

// we want to give the user some feedback about their scrolling position
//      so, we'll add shadows on the sides that have room to scroll. how
//      this'll need to work is we'll need to add a shadow element at the
//      correct locations on any side where you can scroll. to see an
//      example of this, look at the ace editor at https://ace.c9.io and
//      make it's content scroll to the side (there'll be a shadow at the
//      left side)

// ######################################################################
// ############################## THE CODE ##############################
// ######################################################################



(function () {
    "use strict";
    // we need two versions of this function, one for a full render (clear out and replace all html in the viewport) and one for a partial render (delete and append shadow elements)
    
    // generate html for shadow elements
    window.separate1js_html = function (element) {
        var strHTML = '';
        
        return strHTML;
    };
    
    // add and delete shadow elements in the viewport
    window.separate1js_elements = function (element) {
        //element.elems.dataViewport.removeChild()
        //element.elems.dataViewport.appendChild()
    };
}());
















