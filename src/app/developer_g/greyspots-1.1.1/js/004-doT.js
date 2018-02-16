// ##############################################################
// ################ doT.js AND RELATED FUNCTIONS ################
// ##############################################################

// Laura Doktorova https://github.com/olado/doT
// version: 1.0.3
(function(){function p(b,a,d){return("string"===typeof a?a:a.toString()).replace(b.define||h,function(a,c,e,g){0===c.indexOf("def.")&&(c=c.substring(4));c in d||(":"===e?(b.defineParams&&g.replace(b.defineParams,function(a,b,l){d[c]={arg:b,text:l}}),c in d||(d[c]=g)):(new Function("def","def['"+c+"']="+g))(d));return""}).replace(b.use||h,function(a,c){b.useParams&&(c=c.replace(b.useParams,function(a,b,c,l){if(d[c]&&d[c].arg&&l)return a=(c+":"+l).replace(/'|\\/g,"_"),d.__exp=d.__exp||{},d.__exp[a]=
d[c].text.replace(new RegExp("(^|[^\\w$])"+d[c].arg+"([^\\w$])","g"),"$1"+l+"$2"),b+"def.__exp['"+a+"']"}));var e=(new Function("def","return "+c))(d);return e?p(b,e,d):e})}function k(b){return b.replace(/\\('|\\)/g,"$1").replace(/[\r\t\n]/g," ")}var f={version:"1.0.3",templateSettings:{evaluate:/\{\{([\s\S]+?(\}?)+)\}\}/g,interpolate:/\{\{=([\s\S]+?)\}\}/g,encode:/\{\{!([\s\S]+?)\}\}/g,use:/\{\{#([\s\S]+?)\}\}/g,useParams:/(^|[^\w$])def(?:\.|\[[\'\"])([\w$\.]+)(?:[\'\"]\])?\s*\:\s*([\w$\.]+|\"[^\"]+\"|\'[^\']+\'|\{[^\}]+\})/g,
define:/\{\{##\s*([\w\.$]+)\s*(\:|=)([\s\S]+?)#\}\}/g,defineParams:/^\s*([\w$]+):([\s\S]+)/,conditional:/\{\{\?(\?)?\s*([\s\S]*?)\s*\}\}/g,iterate:/\{\{~\s*(?:\}\}|([\s\S]+?)\s*\:\s*([\w$]+)\s*(?:\:\s*([\w$]+))?\s*\}\})/g,varname:"it",strip:!0,append:!0,selfcontained:!1,doNotSkipEncoded:!1},template:void 0,compile:void 0},m;



// f.encodeHTMLSource = function(b) {
//         var a = {
//                 "&": "&#38;",
//                 "<": "&#60;",
//                 ">": "&#62;",
//                 '"': "&#34;",
//                 "'": "&#39;",
//                 "/": "&#47;"
//             },
//             d = b ? /[&<>"'\/]/g : /&(?!#?\w+;)|<|>|"|'|\//g;
//         return function(b) {
//                 return b ?

f.encodeHTMLSource=function(b){var a={"&":"&#38;","<":"&#60;",">":"&#62;",'"':"&#34;","'":"&#39;","/":"&#47;"},d=b?/[&<>"'\/]/g:/&(?!#?\w+;)|<|>|"|'|\//g;return function(b){return b?
b.toString().replace(d,function(b){return a[b]||b}):b}}; // replaced :"" with :b so that if you put a zero in encodehtml you get a zero out of encodehtml


m=function(){return this||(0,eval)("this")}();

"undefined"!==typeof module&&module.exports?module.exports=f:"function"===typeof define&&define.amd?define(function(){return f}):m.doT=f;



var r={start:"'+(",end:")+'",startencode:"'+encodeHTML("},s={start:"';out+=(",end:");out+='",startencode:"';out+=encodeHTML("},h=/$^/;f.template=function(b,a,d){a=a||f.templateSettings;var n=a.append?r:s,c,e=0,g;b=a.use||a.define?p(a,b,d||{}):b;b=("var out='"+(a.strip?
b.replace(/(^|\r|\n)\t* +| +\t*(\r|\n|$)/g," ").replace(/\r|\n|\t|\/\*[\s\S]*?\*\//g,""):b).replace(/'|\\/g,"\\$&").replace(a.interpolate||h,function(b,a){return n.start+k(a)+n.end}).replace(a.encode||h,function(b,a){c=!0;return n.startencode+k(a)+n.end}).replace(a.conditional||h,function(b,a,c){return a?c?"';}else if("+k(c)+"){out+='":"';}else{out+='":c?"';if("+k(c)+"){out+='":"';}out+='"}).replace(a.iterate||h,function(b,a,c,d){if(!a)return"';} } out+='";e+=1;g=d||"i"+e;a=k(a);return"';var arr"+
e+"="+a+";if(arr"+e+"){var "+c+","+g+"=-1,l"+e+"=arr"+e+".length-1;while("+g+"<l"+e+"){"+c+"=arr"+e+"["+g+"+=1];out+='"}).replace(a.evaluate||h,function(a,b){return"';"+k(b)+"out+='"})+"';return out;").replace(/\n/g,"\\n").replace(/\t/g,"\\t").replace(/\r/g,"\\r").replace(/(\s|;|\}|^|\{)out\+='';/g,"$1").replace(/\+''/g,"");c&&(a.selfcontained||!m||m._encodeHTML||(m._encodeHTML=f.encodeHTMLSource(a.doNotSkipEncoded)),b="var encodeHTML = typeof _encodeHTML !== 'undefined' ? _encodeHTML : ("+f.encodeHTMLSource.toString()+
"("+(a.doNotSkipEncoded||"")+"));"+b);try{return new Function(a.varname,b)}catch(q){throw"undefined"!==typeof console&&console.log("Could not create a template function: "+b),q;}};f.compile=function(b,a){return f.template(b,null,a)}


    // we use doT.js in the global space, but sometimes module may be
    //      defined (electron defines module automatically) so we need to copy dot to
    //      the global namespace
    if (!window.doT) { // && window.module
        window.doT = f;
        
        //window.doT.encodeHTMLSource = module.exports.encodeHTMLSource;
        //window.doT.compile = module.exports.compile;
        //window.doT.templateSettings = module.exports.templateSettings;
        //window.doT.template = module.exports.template;
    }
})();


doT.templateSettings = {
    evaluate:    /\{\{([\s\S]+?)\}\}/g,
    interpolate: /\{\{=([\s\S]+?)\}\}/g,
    encode:      /\{\{!([\s\S]+?)\}\}/g,
    use:         /\{\{#([\s\S]+?)\}\}/g,
    define:      /\{\{##\s*([\w\.$]+)\s*(\:|=)([\s\S]+?)#\}\}/g,
    conditional: /\{\{\?(\?)?\s*([\s\S]*?)\s*\}\}/g,
    iterate:     /\{\{~\s*(?:}}|([\s\S]+?)\s*\:\s*([\w$]+)\s*(?:\:\s*([\w$]+))?\s*\}\})/g,
    varname: 'jo',
    strip: false,
    append: true,
    selfcontained: false
};

// html encoding function used by doT.js
function encodeHTML(text) {
    'use strict';
    var encode = {
        "&": "&#38;",
        "<": "&#60;",
        ">": "&#62;",
        '"': "&#34;",
        "'": "&#39;",
        "/": "&#47;"
    };
    return text ? text.toString().replace(/&|<|>|"|'|\//g, function (letter) {
        return encode[letter] || letter;
    }) : text;
}

// html decoding function
function decodeHTML(text) {
    'use strict';
    var decode = {
        "&#38;": "&",
        "&amp;": "&",
        
        "&#60;": "<",
        "&#62;": ">",
        
        "&lt;":  "<", // The rose by another name
        "&gt;":  ">", // The rose by another name
        
        "&#34;": '"',
        "&#39;": "'",
        "&#47;": "/"
    };
    return text ? text.toString().replace(/&#38;|&amp;|&#60;|&#62;|&lt;|&gt;|&#34;|&#39;|&#47;/g, function (letter) {
        return decode[letter] || letter;
    }) : text;
}

// multiline strings in javascript
//
// ml(function () {/*
//     multiline string
//     hey
// */console.log});
function ml(func) {
    'use strict';
    
    func = func.toString();
    
    return func.substring(func.indexOf('/*') + 2, func.indexOf('*/'));
}
