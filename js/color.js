function Color(value){
	var self = this;
	self.init(value);
}
Color.prototype.init = function(value){
	var self = this;
	if(value===undefined)return;
	self.a;  //alpha  透明度
	self.r;  //red
	self.g;  //green
	self.b;  //blue
	self.h;  //hue   色调
	self.s;  //Saturation   饱和度
	self.l;  //value   亮度
	self.y;
	self.u;
	self.v;
	self.value = value.toLowerCase();
	if(self.value.indexOf('rgb')==0){
		self.initRgb(value);
		self.rgb2hsl();
	}else if(self.value.indexOf('#')==0){
		self.initHex(value);
		self.rgb2hsl();
	}else if(self.value.indexOf('hsl')==0){
		self.initHsl(value);
		self.hsl2rgb();
	}
	self.yuv();
}
Color.prototype.initHex = function(value){
	var self = this;
	var rgb;
	if(value.length>4){
		rgb = value.match(/^#([0-9,a-f]{2})([0-9,a-f]{2})([0-9,a-f]{2})$/i);
		self.r = parseInt('0x'+rgb[1]);
		self.g = parseInt('0x'+rgb[2]);
		self.b = parseInt('0x'+rgb[3]);
	}else{
		rgb = value.match(/^#([0-9,a-f]{1})([0-9,a-f]{1})([0-9,a-f]{1})$/i);
		self.r = parseInt('0x'+rgb[1]+rgb[1]);
		self.g = parseInt('0x'+rgb[2]+rgb[2]);
		self.b = parseInt('0x'+rgb[3]+rgb[3]);
	}
	
}
Color.prototype.initHsl = function(value){
	var self = this;
	var hsl;
	hsl = value.match(/^hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)$/i);
	self.h = hsl[1];
	self.s = hsl[2];
	self.l = hsl[3];
}
Color.prototype.initRgb = function(value){
	var self = this;
	var rgb = value.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/i);
	self.r = rgb[1];
	self.g = rgb[2];
	self.b = rgb[3];
}

Color.prototype.hsl2rgb = function(h,s,l){
	var self = this;
	var r,g,b;
	h = (h===undefined||h===null?self.h:h)/360;
	s = (s===undefined||s===null?self.s:s)/100;
	l = (l===undefined||l===null?self.l:l)/100;
	if(s==0){
		r=g=b=l;  //achromatic
	}else{
		var q = l<0.5?l*(1+s):l+s-l*s;
		var p = 2*l-q;
		r = hue2rgb(p,q,h+1/3);
		g = hue2rgb(p,q,h);
		b = hue2rgb(p,q,h-1/3);
	}
	self.r = r = Math.round(r*255);
	self.g = g = Math.round(g*255);
	self.b = b = Math.round(b*255);
	return [r,g,b];
	
	function hue2rgb(p,q,t){
		if(t<0) t+=1;
		if(t>1) t-=1;
		if(t<1/6)return p+(q-p)*6*t;
		if(t<1/2)return q;
		if(t<2/3)return p+(q-p)*(2/3-t)*6;
		return p;
	}
}
Color.prototype.rgb2hsl = function(r,g,b){
	var self = this;
	r = r===undefined||r===null?self.r:r;
	g = g===undefined||g===null?self.g:g;
	b = b===undefined||b===null?self.b:b;
	r/=255,g/=255,b/=255;
	var max = Math.max(r,g,b),min=Math.min(r,g,b);
	var h,s,l=(max+min)/2;
	if(max==min){
		h=s=0;   //achromatic
	}else{
		var d = max-min;
		s = l>0.5?d/(2-max-min):d/(max+min);
		switch(max){
			case r: h = (g-b)/d+(g<b?6:0);break;
			case g: h = (b-r)/d+2;break;
			case b: h = (r-g)/d+4;break;
		}
		h /= 6;
	}
	self.h = h = Math.round(h*360);
	self.s = s = Math.round(s*100); 
	self.l = l = Math.round(l*100);
	return [h,s,l];
}
Color.prototype.i_hsva2rgba = function(h,s,v,a){
	if(s > 1 || v > 1 || a > 1){return;}  
    var th = h % 360;  
    var i = Math.floor(th / 60);  
    var f = th / 60 - i;  
    var m = v * (1 - s);  
    var n = v * (1 - s * f);  
    var k = v * (1 - s * (1 - f));  
    var color = new Array();  
    if(!s > 0 && !s < 0){  
        color.push(v, v, v, a);   
    } else {  
        var r = new Array(v, n, m, m, k, v);  
        var g = new Array(k, v, v, n, m, m);  
        var b = new Array(m, m, k, v, v, n);  
        color.push(r[i], g[i], b[i], a);  
    }  
    return color;  
}
Color.prototype.yuv = function(value){
	var self = this;
	if(value)return _set(value);
	else return _get();
	function _get(){
		self.y = 0.299*self.r + 0.587*self.g + 0.114*self.b;   //[0,1]
		self.u = 0.436*(self.b-self.y)/(1-0.114);    //[-0.436,0.436] self.u = -0.14713*self.r - 0.28886*self.g + 0.436*self.b
		self.v = 0.615*(self.r-self.y)/(1-0.299);  //[-0.615,0.615] self.v = 0.615*self.r - 0.51499*self.g - 0.10001*self.b
	}
	function _set(value){
		self.r = self.y + 1.13983 * self.v;
		self.g = self.y - 0.39465 * self.u - 0.58060 * self.v;
		self.b = self.y + 2.03211 * self.u;
	}
}
Color.prototype.isDark = function(){
	return this.y/255 < 0.5;
}
Color.prototype.toString = function(type){
	var self = this;
	var result = '';
	switch(type){
		case 1,'rgb':
			result = 'rgb('+self.r+','+self.g+','+self.b+')';break;
		case 2,'hex':
			result = '#'+hex(self.r)+hex(self.g)+hex(self.b);break;
		case 3,'hsl':
			result = 'hsl('+self.h+','+self.s+'%,'+self.l+'%)';break;
	}
	
	return result;
	
	function hex(x){
		return ("0"+parseInt(x).toString(16)).slice(-2);
	}
}
function testColor(){
	var backgroundColors = [];
	var color = new Color('rgb(0,100,255)');
	console.log(color);
	console.log(color.toString('hex'));
	console.log(color.toString('hsl'));
	
	backgroundColors.push(color.toString('rgb'));
	backgroundColors.push(color.toString('hex'));
	backgroundColors.push(color.toString('hsl'));
	
	var color = new Color('#ff9900');
	console.log(color);
	console.log(color.toString('rgb'));
	
	var color = new Color('hsl(360,50%,50%)');
	console.log(color);
	console.log(color.toString('rgb'));
	console.log(color.toString('hsl'));
	backgroundColors.push(color.toString('rgb'));
	backgroundColors.push(color.toString('hsl'));
		
	window.onload = function(){
		testShowColor(colors);
	}
}
function testShowColor(colors){
	if(!(colors instanceof Array)){
		colors = [colors];
	}
	var colorDivs = document.getElementsByClassName('test_color');
	for(var i = 0; i<colorDivs.length; i++){
		var colorDiv = colorDivs[i];
		if(colors[i]){
			colorDiv.style.backgroundColor = colors[i];
		}	
	}
}
//testColor();

