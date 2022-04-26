// vars
var useProxy=1; // enable, to access a[key]
var deepTrace=1; // enable, to ignore inner class fields (liks 'a', 'b' and etc)
				// very slow, because it's Error.log parsing
var useMap=1; // use alter Map storage on a.map field

// prepend
var allowMethodsT=['array','map','foreach','copy','set','add','clear','delete','push','shift','pop','unshift','splice','reverse','sort','ksort','get','has','keys','values','entries','length','size','iter','iterE'];
var allowMethodsArray=[];
for(let key of allowMethodsT) allowMethodsArray[key]=1;
delete allowMethodsT;
var scriptsT = document.getElementsByTagName('script');
var scriptNameArray = scriptsT[scriptsT.length-1].src.split('/');
scriptNameArray=scriptNameArray[scriptNameArray.length-1];
delete scriptsT;

function Arr(){
	this.def=function(){
		this.index=0;
		this.a=Array();
		this.b=Array();
		this.c=new Map();
		if(useMap) this.d=new Map();
		this.array=this.b;
		if(useMap) this.map=this.d;
	}
	this.def();
	this.generator=function*(){
		for(let i=0;i<this.a.length;i++) yield this.b[i];
	}
	this.generatorE=function*(){
		for(let i=0;i<this.a.length;i++) yield [this.a[i],this.b[i]];
	}
	this.foreach=function(f){
		for(let i=0;i<this.a.length;i++){
			if(f(this.a[i],this.b[i])==false) break;//key, value
		}
	}
	this.prependKey=function(key){
		let isNum=!isNaN(parseFloat(key)) && isFinite(key);
		if(isNum) return Number(key); else return String(key);
	}
	this.copy=function(){
		return this.b.slice();
	}
	this.set=function(key,value){
		this.index++;
		key=this.prependKey(key);
		if(!this.c.has(key)){
			this.a.push(key);
			this.b.push(value);
			let n=this.a.length-1;
			this.c.set(key,n);
		} else {
			let i=this.c.get(key)*1;
			this.b[i]=value;
		}
		if(useMap) this.d.set(key,value);
	}
	this.add=this.set; //alias
	this.clear=function(){
		this.c.clear();
		if(useMap) this.d.clear();
		this.def();
	}
	this.delete=function(key){
		let i=this.c.get(this.prependKey(key))*1;
		this.a.splice(i,1);
		this.b.splice(i,1);
		this.c.delete(this.prependKey(key));
		if(useMap) this.d.delete(this.prependKey(key));
	}
	this.push=function(value){
		let key='pushIndex'+this.index;
		this.set(key,value);
	}
	this.shift=function(){
		let val=this.b.shift();
		let key=this.a.shift();
		if(useMap) this.d.delete(this.prependKey(key));
		this.c.delete(this.prependKey(key));
	}
	this.pop=function(){
		let val=this.b.pop();
		let key=this.a.pop();
		if(useMap) this.d.delete(this.prependKey(key));
		this.c.delete(this.prependKey(key));
	}
	this.unshift=function(value){
		let key='pushIndex'+this.index;
		this.index++;
		this.c.forEach((v,k)=>this.c.set(k,Number(v)+1));
		this.a.unshift(key);
		this.b.unshift(value);
		if(useMap) this.d.set(key,value);
		this.c.set(key,0);
	}
	this.splice=function(pos,deleteCount){
		for(let i=pos;i<pos+deleteCount;i++){
			if(!(i in a)) continue;
			let key=this.prependKey(this.a[i]);
			if(useMap) this.d.delete(key);
			this.c.delete(key);
		}
		this.a.splice(pos,deleteCount);
		this.b.splice(pos,deleteCount);
	}
	this.rebuildC=function(){
		this.c.clear();
		for(let i=0;i<this.a.length;i++) this.c.set(this.prependKey(this.a[i]), i);
	}
	this.reverse=function(){
		this.a.reverse();
		this.b.reverse();
		this.rebuildC();
	}
	this.sort=function(f){
		let oldB=this.b.slice();
		let oldA=this.a.slice();
		this.a=Array();
		let defined=Array();
		if(f) this.b.sort(f); else this.b.sort();
		for(let i=0;i<this.b.length;i++){
			for(let j=0;j<this.b.length;j++){
				if(this.b[i]===oldB[j] && !(j in defined)){
					defined[j]=1;
					this.a.push(oldA[j]);
					break;
				}
			}
		}
		delete oldB;
		delete oldA;
		delete defined;
		this.rebuildC();
	}
	this.ksort=function(f){
		let oldB=this.b.slice();
		let oldA=this.a.slice();
		this.b=Array();
		let defined=Array();
		if(f) this.a.sort(f); else this.a.sort();
		for(let i=0;i<this.a.length;i++){
			for(let j=0;j<this.a.length;j++){
				if(this.a[i]===oldA[j] && !(j in defined)){
					defined[j]=1;
					this.b.push(oldB[j]);
					break;
				}
			}
		}
		delete oldB;
		delete oldA;
		delete defined;
		this.rebuildC();
	}
	this.has=function(key){
		return this.c.has(this.prependKey(key));
	}
	this.get=function(key){
		if(useMap) return this.d.get(this.prependKey(key));
		else {
			let k=this.c.get(this.prependKey(key));
			if(k!==false && k in this.b) return this.b[k];
		}
	}
	this.keys=function(){
		if(useMap) return this.d.keys();
		else return this.a;
	}
	this.values=function(){
		if(useMap) return this.d.values();
		else return this.b;
	}
	this.entries=function(){
		if(useMap) return this.d.entries();
		else {
			let e=[];
			for(let i=0;i<this.a.length;i++){
				e.push([this.a[i],this.b[i]]);
			}
			return e;
		}
	}
	this.asProxy=function(){
		let t=this;
		let handler = {
			get: function(target, prop){
				let e=false;
				if(deepTrace) e=new Error().stack.indexOf('Proxy.Arr')!==-1;
				//if(deepTrace) e=new Error().stack.indexOf(scriptNameArray)!==-1;
				if (typeof target[prop]!=='undefined' && (e || !deepTrace || (prop in allowMethodsArray))){
					return target[prop];
				} else {
					if(t.d.has(t.prependKey(prop))){
						return t.d.get(t.prependKey(prop));
					}
					else return false;
				}
			},
			set: function(target, prop, value){
				let e=false;
				if(deepTrace) e=new Error().stack.indexOf('Proxy.Arr')!==-1;
				if (typeof target[prop]!=='undefined' && (e || !deepTrace || (prop in allowMethodsArray))){
					target[prop]=value;
				} else {
					t.set(prop,value);
				}
			}
		}
		return new Proxy(this, handler)
	}
	
	let ok=Object.keys(this);
	for(let i in ok) Object.defineProperty(this,ok[i],{enumerable:false});
	Object.defineProperty(this,'length',{
		get: function(){
			if(useMap) return this.d.size;
			else return this.a.length;
		}
	});
	Object.defineProperty(this,'size',{
		get: function(){
			if(useMap) return this.d.size
			else return this.a.length;
		}
	});
	Object.defineProperty(this,'copy',{
		get: function(){return this.copy()}
	});
	Object.defineProperty(this,'iter',{
		get: function(){
			let g=this.generator();
			return g;
		}
	});
	Object.defineProperty(this,'iterE',{
		get: function(){
			let g=this.generatorE();
			return g;
		}
	});
	this[Symbol.iterator]=this.generator;
	for(let i=0;i<arguments.length;i++){
		this.push(arguments[i]);
	}
	if(useProxy) return this.asProxy();
}
