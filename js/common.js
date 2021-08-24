/**
 * Created by Administrator on 2015/7/21 0021.
 */
/**
* 判断客户端来源
*/
var browser = (function(){
	return {
		versions:function(){
	        var u = navigator.userAgent, app = navigator.appVersion;
	        return {
	            trident: u.indexOf('Trident') > -1, //IE内核
	            presto: u.indexOf('Presto') > -1, //opera内核
	            webKit: u.indexOf('AppleWebKit') > -1, //苹果、谷歌内核
	            gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1,//火狐内核
	            mobile: !!u.match(/AppleWebKit.*Mobile.*/), //是否为移动终端
	            ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios终端
	            android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1, //android终端或者uc浏览器
	            iPhone: u.indexOf('iPhone') > -1 , //是否为iPhone或者QQHD浏览器
	            iPad: u.indexOf('iPad') > -1, //是否iPad
	            webApp: u.indexOf('Safari') == -1, //是否web应该程序，没有头部与底部
	            weixin: u.indexOf('MicroMessenger') > -1, //是否微信 （2015-01-22新增）
	            qq: u.match(/\sQQ/i) == " qq" //是否QQ
	        };
	    }(),
	    language:(navigator.browserLanguage || navigator.language).toLowerCase()
	};
})();

/**
* trigger event
*/
function trigger(element, eventName, data){
	var event;
	if(document.createEvent){
		event = document.createEvent("HTMLEvents");
		event.initEvent(eventName, true, true);
	}else{
		event = document.createEventObject();
		event.eventType = eventName;
	}
	event.eventName = eventName;
	!event.detail&&(event.detail = data);
	!event.data&&(event.data = data);
	//console.log(event)
	if(document.createEvent){
		element.dispatchEvent(event);
	}else{
		element.fireEvent("on"+event.eventType, event);
	}
}

/**
* requestAnimationFrame
*/
initRequestAnimationFrame();
function initRequestAnimationFrame(){
	var lastTime = 0;
	var vendors = ['webkit', 'moz','o','ms'];
	window.requestAnimFrame = window.requestAnimationFrame;
	window.cancelAnimFrame = window.cancelAnimationFrame;
	for(var x = 0; x < vendors.length && !window.requestAnimFrame; ++x) {
		window.requestAnimFrame = window[vendors[x]+'RequestAnimationFrame'];
		window.cancelAnimFrame =
		window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
	}

	if (!window.requestAnimFrame)
		window.requestAnimFrame = function(callback, element) {
			var currTime = new Date().getTime();
			var timeToCall = Math.max(0, 16 - (currTime - lastTime));
			var id = window.setTimeout(function() { callback(currTime + timeToCall); },
			timeToCall);
			lastTime = currTime + timeToCall;
			return id;
		};

	if (!window.cancelAnimFrame)
		window.cancelAnimFrame = function(id) {
			clearTimeout(id);
		};	
}

/**
* webglAvailable
*/
function webglAvailable() {
	try {
		var canvas = document.createElement( 'canvas' );
		return !!( window.WebGLRenderingContext && (
			canvas.getContext( 'webgl' ) ||
			canvas.getContext( 'experimental-webgl' ) )
		);
	} catch ( e ) {
		return false;
	}
}

function disableTopDefaultEvent(){
	window.addEventListener('',function(event){},true);
}
