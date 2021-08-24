function Painter(stage, options){
	var self = this;
	self.stage = stage;
	self.canvas = stage.canvas;
	self.initStage(stage);
	self.init(options);
	self.repaintCanvas();
}
Painter.prototype.paintMouseDownName = 'paintDown';
Painter.prototype.paintMouseMoveName = 'paintMove';
Painter.prototype.paintMouseUpName = 'paintUp';
Painter.prototype.testFn = function(event){
	var self = this;
	var bmp,mask;
	painter.removeTitle();
	testBmp();
	//testMask();
	
	self.stage.clear();
	self.stage.update(event);
	
	function testBmp(){
		var image = new Image();
		self.image = image;
		image.src = "./painting/flowers.jpg";
		image.setAttribute('crossOrigin', 'anonymous');
		//self.utils.toDataURL(image.src, function(img){});
		image.onload = handleImageLoad;
		
		function handleImageLoad(event){
			//console.log(this);
			//console.log(event);
			bmp = self.createBitmap(image);
			self.shapeContainer.addChild(bmp);
			/*
			Some browsers do not
			allow access to pixel data when running local files, and may throw a
			security error or not work unless the content is running on a server.
			except using hitArea
			*/
			var hitArea = new createjs.Shape();
			hitArea.graphics.beginFill("#FFF").drawRect(0,0,image.width,image.height);
			bmp.hitArea = hitArea;
			
			//testWinding();
			self.stage.clear();
			self.stage.update(event);
		}
	}
	
	function testWinding(){
		var shape = new createjs.Shape();
		//self.shapeContainer.addChild(shape);
		var g = shape.graphics;
		g.drawRect(20, 20, 450, 360);
		g.arc(160, 160, 110, 0, Math.PI * 2, true).closePath(); // Subtracts from the square
		g.arc(330, 240, 110, 0, Math.PI * 2, true).closePath(); // Subtracts from the square, but ADDs to the first circle
		
		mask = new createjs.Shape(g);
		bmp.bitmap.mask = mask;
	}
	
	function testMask(){
		var stage = self.stage;
		var stageX = 0,stageY = 0, stageW=stage.canvas.width, stageH=stage.canvas.height;
		var shape1 = self.createShape();
		shape1.graphics.beginFill('#f0f').rect(stageX, stageY, stageW, stageH);
		self.shapeContainer.addChild(shape1);
		
		var shape = self.createShape();
		var g = shape.graphics;
		g.setStrokeDash([10,10]);
		g.setStrokeStyle(3, 'round', 'round').beginStroke('#000');
		
		g.beginFill('#fff');
		g.rect(stageX, stageY, stageW, stageH);
		g.moveTo(100, 100);
		self.pathRect(g, [100, 100, 400, 300], true);   //逆时针画就在外面
		g.closePath();
		
		shape1.children[0].mask = shape;
		self.stage.clear();
		self.stage.update(event);
	}
}
Painter.prototype.initStage = function(){
	var self = this;
	var stage = self.stage;
	stage.removeAllChildren();
	stage.removeAllEventListeners();
	createjs.Ticker.removeAllEventListeners();	
	stage.clear();
	stage.update();
	
	stage.autoClear = false;
	stage.snapToPixelEnabled = true;
	stage.enableDOMEvents(true);
	stage.enableMouseOver = true;

	createjs.Touch.enable(stage, false, true);
	createjs.Ticker.setFPS(24);

	stage.addEventListener("stagemousedown", handleMouseDown);
	stage.addEventListener("stagemouseup", handleMouseUp);
	stage.addEventListener("stagemousemove", handleMouseMove);
	
	//stage.addEventListener('pressmove', handlePressMove);
	
	/*
	stage.addEventListener("stagemousedown", handleMouseDown);
	stage.addEventListener("stagemouseup", handleMouseUp);
	stage.addEventListener("stagemousemove", handleMouseMove);
	
	stage.addEventListener("rollover", self.events.rollover);
	stage.addEventListener("rollout",self.events.rollout);
	*/
	self.removeTitle = removeTitle;
	
	function handleMouseDown(event) {
		if (!event.primary) { return; }
		removeTitle();
		self.paintDown(event);
	}

	function handleMouseUp(event) {
		self.paintUp(event);
	}
	
	function handleMouseMove(event){
		self.paintMove(event);
	}
	
	function handlePressMove(event) {
		event.onMouseMove = handleMouseMove;
	}
	
	function removeTitle(){
		if (self.stageTitle&&stage.contains(self.stageTitle)) {
			stage.clear();
			stage.removeChild(self.stageTitle);
		}
	}
}
Painter.prototype.init = function(options){
	var self = this;
	self.options = options||self.options||{};
	self.removedShapeList = [];
	self.shape;
	self.currentshape;
	self.tempshape = new createjs.Shape();
	self.__paintType;
	self.__point = {};
	self.__color;
	self.__strokeWeight;
	
	self.shapeContainer = new createjs.Container();
	self.stage.addChild(self.shapeContainer);
	
	initOptions();
	//initShapeContainer();
	function initOptions(){
		self.options.paintType = self.options.paintType||'Pencel';
		self.options.point = self.options.point||{x:0,y:0};
		self.options.color = self.options.color||'#000';
		self.options.strokeWeight = self.options.strokeWeight||10;
		
		//self.color(self.options.color);
		for(var i in self.options){
			self[i](self.options[i]);
		}
	}
	
	function initShapeContainer(){
		self.stage.on('mousedown', function(event){
			var shapeContainer = this;
			if(self.paintType()=='Move'){ //  'Move'
				self.mutiTouchDistance = 0;
				
				var point1 = self.touchPoint1={};
				var point2 = self.touchPoint2={};
				point1.x = event.stageX;
				point1.y = event.stageY;
			}
			console.log(event);
		});
		self.stage.on('pressmove', function(event){
			var shapeContainer = this;
			if(self.paintType()=='Move'){ //  'Move'
				self.mutiTouchDistance = 0;
				
				var point1 = self.touchPoint1={};
				var point2 = self.touchPoint2={};
				point1.x = event.stageX;
				point1.y = event.stageY;
			}
			console.log(event);
		});
	}
}
Painter.prototype.imageFile = function(value, event){
	var self = this;
	var bitmap = self.createBitmap(value);
	bitmap.x = 0;
	bitmap.y = 0;
	self.shapeContainer.addChild(bitmap);
	self.stage.clear();
	self.stage.update(event);
	return self;
}
Painter.prototype.toDataUrl = function(){
	var self = this;
	return self.stage.toDataURL ();
}
Painter.prototype.repaintCanvas = function(event){
	var self = this;
	var stage = self.stage;
	var title = new createjs.Text("Click and Drag to draw", "36px Arial", "#777777");
	title.x = 300;
	title.y = 200;
	stage.addChild(title);
	stage.update();
	self.stageTitle = title;
	
	self.clearArray(self.removedShapeList);
	self.shapeContainer.removeAllChildren();
	self.shapeContainer.removeAllEventListeners();
	self.stage.clear();
	self.stage.update(event);
	return self;
}
Painter.prototype.paintGrid = function(event, callback){
	var self = this;
	var canvasData = self.toDataUrl();
	var image = new Image();
	image.src = canvasData;
	image.onload = function(){
		var child = self.createBitmap(image);
		self.shapeContainer.removeAllChildren();
		self.shapeContainer.addChild(child);
		self.stage.clear();
		self.stage.update(event);
		if(typeof callback == 'function')callback(image);
	}
	return self;
}
Painter.prototype.paintBack = function(event){
	var self = this;
	var lastChildIndex = self.shapeContainer.numChildren-1;
	if(lastChildIndex>=0){
		var lastChild = self.shapeContainer.getChildAt(lastChildIndex);
		self.removedShapeList.push(lastChild);
		self.shapeContainer.removeChildAt(lastChildIndex);
	}
	self.stage.clear();
	self.stage.update(event);
	return self;
}
Painter.prototype.paintForward = function(event){
	var self = this;
	if(self.removedShapeList.length>0){
		var lastChild = self.removedShapeList.pop();
		self.shapeContainer.addChild(lastChild);
	}
	self.stage.clear();
	self.stage.update(event);
	return self;
}
Painter.prototype.paintDown = function(event){
	if(!event.primary) { return; }
	var self = this;
	var paintType = self.paintType();
	return self[self.paintMouseDownName+paintType](event);
}
Painter.prototype.paintDownEnd = function(event){
	var self = this;
	self.stage.clear();
	self.stage.update(event);
}
Painter.prototype.paintDownZoom = function(event){
	var self = this;
	self.startPoint = {};
	self.startPoint.x = self.stage.mouseX;
	self.startPoint.y = self.stage.mouseY;
	self.orginScale = {};
	self.orginScale.scaleX = self.stage.scaleX;
	self.orginScale.scaleY = self.stage.scaleY;
	self.paintDownEnd(event);
	return self;
}
Painter.prototype.paintDownMove = function(event){
	var self = this;
	return self;
	self.point(new createjs.Point(stage.mouseX, stage.mouseY));
	//self.currentshape = self.findHitObject(event, self.shapeContainer.children);
	self.currentshape = event.relatedTarget;
	//if(self.currentshape)console.log(self.currentshape);
	//else console.log(self.shapeContainer.children);
	
	self.paintDownEnd(event);
	return self;
}
Painter.prototype.paintDownClipRect = function(event){
	var self = this;
	self.point(new createjs.Point(stage.mouseX, stage.mouseY));
	self.shape = new createjs.Shape();
	self.paintDownEnd(event);
	return self;
}
Painter.prototype.paintDownPencel = function(event){
	var self = this;
	self.clearArray(self.removedShapeList);
	self.point(new createjs.Point(stage.mouseX, stage.mouseY));
	self.shape = self.createShape();
	self.shape.graphics.moveTo(self.point().x, self.point().y);
	self.shapeContainer.addChild(self.shape);
	self.paintDownEnd(event);
	return self;
}
Painter.prototype.paintDownLine = function(event){
	var self = this;
	self.paintDownPencel(event);
}
Painter.prototype.paintDownRect = function(event){
	var self = this;
	self.paintDownPencel(event);
}
Painter.prototype.paintDownCircle = function(event){
	var self = this;
	self.paintDownPencel(event);
}
Painter.prototype.paintUp = function(event){
	if(!event.primary) { return; }
	var self = this;
	var paintType = self.paintType();
	return self[self.paintMouseUpName+paintType](event);
}
Painter.prototype.paintUpEnd = function(event){
	var self = this;
	self.currentshape = null;
	self.shape = null;
	self.tempshape = null;
	self.orginScale = null;   //zoom
	self.stage.clear();
	self.stage.update(event);
}
Painter.prototype.paintUpZoom = function(event){
	var self = this;
	self.paintUpEnd(event);
	return self;
}
Painter.prototype.paintUpMove = function(event){
	var self = this;
	self.paintUpEnd(event);
	return self;
}
Painter.prototype.paintUpClipRect = function(event){
	var self = this;
	self.shapeContainer.removeChild(self.tempshape);
	self.stage.clear();
	self.stage.update(event);
	self.paintGrid(event, function(image){
		var mask = new createjs.Shape();
		var g = mask.graphics;
		g.beginFill('#000');
		g.rect(0,0,self.stage.canvas.width,self.stage.canvas.height);
		g.moveTo(self.point().x, self.point().y);
		self.pathRect(g,[self.point().x, self.point().y, self.stage.mouseX-self.point().x, self.stage.mouseY-self.point().y],true);
		g.closePath();
		
		var mask2 = new createjs.Shape();
		mask2.graphics
		.rect(self.point().x, self.point().y, self.stage.mouseX-self.point().x, self.stage.mouseY-self.point().y);
		
		var childContainer = self.shapeContainer.children[0];
		if(childContainer){
			var child = childContainer.children[0];
			var childContainer3 = childContainer.clone(true);
			var childContainer2 = self.createShape();
			childContainer2.removeAllChildren();
			childContainer2.addChild(childContainer3.children[0]);
			var child2 = childContainer2.children[0];
			child2.mask = mask2;
			self.shapeContainer.addChild(childContainer2);
			//childContainer2.on('click', function(){});
			childContainer2.mouseChildren = false;
			
			child.mask = mask;
		}	
		self.paintUpEnd(event);
	});
	
	
	return self;
}
Painter.prototype.paintUpPencel = function(event){
	var self = this;
	self.paintUpEnd(event);
	return self;
}
Painter.prototype.paintUpLine = function(event){
	var self = this;
	self.shapeContainer.removeChild(self.tempshape);
	var g = self.shape.graphics;
	g.setStrokeStyle(self.strokeWeight(), 'round', 'round').beginStroke(self.color());
	g.moveTo(self.point().x, self.point().y);
	g.lineTo(self.stage.mouseX, self.stage.mouseY);
	self.paintUpEnd(event);
	return self;
}
Painter.prototype.paintUpRect = function(event){
	var self = this;
	self.shapeContainer.removeChild(self.tempshape);
	var g = self.shape.graphics;
	g.setStrokeStyle(self.strokeWeight(), 'round', 'round').beginStroke(self.color());
	g.beginFill(self.color());
	g.rect(self.point().x, self.point().y, self.stage.mouseX-self.point().x, self.stage.mouseY-self.point().y);
	self.paintUpEnd(event);
	return self;
}
Painter.prototype.paintUpCircle = function(event){
	var self = this;
	self.shapeContainer.removeChild(self.tempshape);
	var g = self.shape.graphics;
	g.setStrokeStyle(self.strokeWeight(), 'round', 'round').beginStroke(self.color());
	g.beginFill(self.color());
	g.drawCircle(self.point().x, self.point().y, self.utils.distance('point', self.point(), {x:self.stage.mouseX, y:self.stage.mouseY}));
	self.paintUpEnd(event);
	return self;
}
Painter.prototype.paintMove = function(event){
	if(!event.primary) { return; }
	var self = this;
	var paintType = self.paintType();
	return self[self.paintMouseMoveName+paintType](event);
}
Painter.prototype.paintMoveEnd = function(event){
	var self = this;
	self.paintDownEnd(event);
}
Painter.prototype.paintMoveZoom = function(event){
	var self = this;
	if(self.orginScale){
		self.movedPoint = {};
		self.movedPoint.x = self.stage.mouseX;
		self.movedPoint.y = self.stage.mouseY;
		
		var startPoint = self.startPoint;
		var movedPoint = self.movedPoint;
		var scaleX = (movedPoint.x - startPoint.x)/self.stage.canvas.width*10;
		if(scaleX<-1)scaleX = -1/scaleX;
		else if(scaleX>1)scaleX = scaleX;
		else scaleX = 1;
		self.stage.scaleX = self.orginScale.scaleX * scaleX;
		
		var scaleY = (movedPoint.y - startPoint.y)/self.stage.canvas.height*10;
		if(scaleY<-1)scaleY = -1/scaleY;
		else if(scaleY>1)scaleY = scaleY;
		else scaleY = 1;
		self.stage.scaleY = self.orginScale.scaleY * scaleY;
		
		self.paintMoveEnd(event);
	}
	return self;
}
Painter.prototype.paintMoveMove = function(event){
	var self = this;
	return self;
	if(self.currentshape){
		self.currentshape.x += (self.stage.mouseX-self.point().x);
		self.currentshape.y += (self.stage.mouseY-self.point().y);
		self.point(self.stage.mouseX, self.stage.mouseY);
		self.paintMoveEnd(event);
	}
	return self;
}
Painter.prototype.paintMoveClipRect = function(event){
	var self = this;
	if(self.shape){
		self.shapeContainer.removeChild(self.tempshape);
		self.tempshape = new createjs.Shape();
		var g = self.tempshape.graphics;
		g.setStrokeDash([10,10]);
		g.setStrokeStyle(3, 'round', 'round').beginStroke('#000');
		g.rect(self.point().x, self.point().y, self.stage.mouseX-self.point().x, self.stage.mouseY-self.point().y);
		self.shapeContainer.addChild(self.tempshape);
		self.paintMoveEnd(event);
	}
	return self;
}
Painter.prototype.paintMovePencel = function(event){
	var self = this;
	if(self.shape){
		var oldPt = self.point();
		var g = self.shape.graphics;
		g.setStrokeStyle(self.strokeWeight(), 'round', 'round').beginStroke(self.color());
		 
		var midPt = new createjs.Point(oldPt.x + self.stage.mouseX >> 1, oldPt.y + self.stage.mouseY >> 1);		
		g.curveTo(oldPt.x, oldPt.y, self.stage.mouseX, self.stage.mouseY);

		self.point(self.stage.mouseX, self.stage.mouseY);
		self.paintMoveEnd(event);
	}
	return self;
}
Painter.prototype.paintMoveLine = function(event){
	var self = this;
	if(self.shape){
		self.shapeContainer.removeChild(self.tempshape);
		self.tempshape = new createjs.Shape();
		var g = self.tempshape.graphics;
		g.setStrokeStyle(self.strokeWeight(), 'round', 'round');
		g.beginStroke(self.color());
		//var midPt = {x: ( self.point().x+self.stage.mouseX )/2,y: ( self.point().y+self.stage.mouseY )/2}
		//var radius = self.utils.distance('point', self.point(), {x:self.stage.mouseX, y:self.stage.mouseY})/2;
		//g.beginRadialGradientStroke([self.color(),"rgba(255,0,0)"], [0, 1], midPt.x, midPt.y, 0, midPt.x, midPt.y, radius);
		g.moveTo(self.point().x, self.point().y);
		g.lineTo(self.stage.mouseX, self.stage.mouseY);
		self.shapeContainer.addChild(self.tempshape);
		self.paintMoveEnd(event);
	}
	return self;
}
Painter.prototype.paintMoveRect = function(event){
	var self = this;
	if(self.shape){
		self.shapeContainer.removeChild(self.tempshape);
		self.tempshape = new createjs.Shape();
		var g = self.tempshape.graphics;
		g.setStrokeStyle(self.strokeWeight(), 'round', 'round').beginStroke(self.color());
		//g.moveTo(self.point().x, self.point().y);
		g.rect(self.point().x, self.point().y, self.stage.mouseX-self.point().x, self.stage.mouseY-self.point().y);
		self.shapeContainer.addChild(self.tempshape);
		self.paintMoveEnd(event);
	}
	return self;
}
Painter.prototype.paintMoveCircle = function(event){
	var self = this;
	if(self.shape){
		self.shapeContainer.removeChild(self.tempshape);
		self.tempshape = new createjs.Shape();
		var g = self.tempshape.graphics;
		g.setStrokeStyle(self.strokeWeight(), 'round', 'round').beginStroke(self.color());
		//g.moveTo(self.point().x, self.point().y);
		g.drawCircle(self.point().x, self.point().y, self.utils.distance('point', self.point(), {x:self.stage.mouseX, y:self.stage.mouseY}));
		self.shapeContainer.addChild(self.tempshape);
		self.paintMoveEnd(event);
	}
	return self;
}

Painter.prototype.clearArray = function(array){
	for(var i = 0; i< array.length; i++){
		array[i] = null;
	}
	array = [];
}
Painter.prototype.paintType = function(value){
	var self = this;
	if(value===undefined) return _get();
	else return _set(value);
	function _get(){ return self.__paintType;}
	function _set(value){ 
		self.__paintType = value;
		self.utils.each(self.shapeContainer.children, function(index, child){
			child.paintType = value;
		});
		return self;
	}
}
Painter.prototype.color = function(value){
	var self = this;
	if(value===undefined) return _get();
	else return _set(value);
	function _get(){ return self.__color;}
	function _set(value){ self.__color = value;return self;}
}
Painter.prototype.point = function(x, y){
	var self = this;
	if(x===undefined) return _get();
	else {
		if(y===undefined){ y = x.y; x = x.x;}
		return _set(x,y);
	}
	function _get(){ return self.__point;}
	function _set(x,y){ self.__point.x = x; self.__point.y = y; return self;}
}
Painter.prototype.strokeWeight = function(value){
	var self = this;
	if(value===undefined) return _get();
	else return _set(value);
	function _get(){ return self.__strokeWeight;}
	function _set(value){ self.__strokeWeight = value;return self;}
}

Painter.prototype.findHitObject = function(event, array){
	var result;
	//for(var i = 0; i<array.length; i++){
	for(var i = array.length-1; i>=0; i--){
		if(array[i].hitTest(event.mouseX, event.mouseY)){
			result = array[i];
			break;
		}
	}
	return result;
}
Painter.prototype.pathRect = function(g, rect, anticlockwise){
	var self = this;
	anticlockwise = !!anticlockwise;
	var x,y,w,h;
	if(rect instanceof Array){
		x = rect[0];y = rect[1];w = rect[2];h = rect[3];
	}else{
		x = rect.x;y = rect.y;w = rect.w;h = rect.h;
	}
	var x2 = x+w;
	var y2 = y+h;
	if(!anticlockwise){  //顺时针 在图形内渲染
		g.curveTo(x, y, x2, y2);
		g.curveTo(x2, y, x2, y2);
		g.curveTo(x2, y2, x, y2);
		g.curveTo(x, y2, x, y);
	}else{  //逆时针 在图形外渲染
		g.curveTo(x, y, x, y2);
		g.curveTo(x, y2, x2, y2);
		g.curveTo(x2, y2, x2, y);
		g.curveTo(x2, y, x, y);
	}
	return self;
}
Painter.prototype.events = (function(){
	function rollover(event){
		var o = event.target;
		o.scaleX = o.scaleY = o.scale * 1.2;
	}
	function rollout(event){
		var o = event.target;
		o.scaleX = o.scaleY = o.scale / 1.2;
	}
	
	return {
		rollover: rollover,
		rollout: rollout
	};
})();
	
Painter.prototype.utils = (function(){
	function distance(type, point1, point2){
		switch (type){
			case 'point':
			return distancePoint(point1, point2);
		}
		
		function distancePoint(point1, point2){
			return Math.sqrt(Math.pow(point1.x-point2.x, 2) + Math.pow(point1.y-point2.y, 2));
		}
	}
	
	function each(array, callback){
		for(var i=0 ;i<array.length;i++){
			callback(i,array[i]);
		}
	}
	
	function loadImageFileAsUrl(inputFileElement, callback){
		var fileUpload = inputFileElement;
		var files = fileUpload.files;
		var fileReader = new FileReader();
		fileReader.onload = function(e){
			var image = new Image();
			image.src = this.result;
			if(typeof callback=='function')callback(image);
		}
		fileReader.readAsDataURL(files[0]);
	}
	
	function print(type, param){
		switch (type){
			case 'pointArray':
			return printPointArray(param);
		}
		
		function printPointArray(param){
			console.log(param);
		}
	}
	
	function toDataURL(src,callback,outputFormat){
		outputFormat = outputFormat||'image/png';
		//Uncaught SecurityError: Failed to execute 'toDataURL' on 'HTMLCanvasElement': Tainted canvases may not be exported.
		var canvas = document.createElement('canvas');
		var ctx = canvas.getContext('2d');
		var img = new Image();
		img.src = src;
		img.onload = function(){
			ctx.drawImage(img,0,0);
			img.src = canvas.toDataURL(outputFormat, "");
			if(typeof callback =='function')callback(img);
		}
	}
	
	return {
		distance: distance,    //距离函数 type（类型）
		each: each,
		loadImageFileAsUrl: loadImageFileAsUrl,
		print: print,        //console.log函数 （类型）
		toDataURL: toDataURL   //img to dataUrl(base64)
	};
})();
//复制类的属性 类的继承用
Painter.clone = function (source, target){
	var target = target||{};
	for(var name in source){
		if(typeof source[name] != 'function'){
			if(name!='prototype'&&name.indexOf('__proto__')<0){
				target[name]=source[name];
			}
		}
	}
	return target;
}
Painter.prototype.createBitmap = function(graphics){
	var self = this;
	var result = new Painter.Bitmap(graphics);
	result.paintType = self.paintType();
	return result;
}
Painter.prototype.createShape = function(graphics){
	var self = this;
	var result = new Painter.Shape(graphics);
	result.paintType = self.paintType();
	return result;
}

//container 因为children的问题 继承 clone 很是问题
Painter.Container = function(container){
	var self = this;
	if(container){
		self = container.clone(true); //很有问题
	}else{
		container = new createjs.Container();
		Painter.clone(container, self);
	}
	self.on('click', function(){});
	self.mouseChildren = false;   //没什么用
}
Painter.Container.prototype = new createjs.Container();
Painter.Bitmap = function(imageOrUri){
	var self = this;
	Painter.clone(new createjs.Container(), self);
	self.bitmap = new createjs.Bitmap(imageOrUri );
	self.addChild(self.bitmap);
	//self.on('click', function(){});
	self.mouseChildren = false;
	self.addPainterEvents(self);
}
Painter.Bitmap.prototype = new createjs.Container();
//Painter.Bitmap.prototype = createjs.Container.prototype;
//Painter.Bitmap.prototype.constructor = Painter.Bitmap;
//createjs.extend( Painter.Bitmap, createjs.Container);
Painter.Shape = function(graphics){
	var self = this;
	Painter.clone(new createjs.Container(), self);
	self.shape = new createjs.Shape(graphics);
	self.addChild(self.shape);
	self.g = self.graphics = self.shape.graphics;
	//self.on('click', function(){});
	self.mouseChildren = false;
	self.addPainterEvents();
}
Painter.Shape.prototype = new createjs.Container();
Painter.Bitmap.prototype.addPainterEvents =
Painter.Shape.prototype.addPainterEvents =
Painter.addPainterEvents = 
function(obj){
	var self = obj||this;
	self.on('mousedown', function(event){
		if(self.paintType=='Move'){
			self.pointX = event.stageX;
			self.pointY = event.stageY;
		}
	});
	self.on('pressmove', function(event){
		if(self.paintType=='Move'){
			self.x += (event.stageX-self.pointX);
			self.y += (event.stageY-self.pointY);
			self.pointX = event.stageX;
			self.pointY = event.stageY;
			event.target.stage.clear();
			event.target.stage.update(event);
		}
	});
	self.on('pressup', function(event){
		if(self.paintType=='Move'){
		}
	});
}