//		что работает?

// создаём массив с помощью конструктора Arr
// var a=new Arr('Яблоко','Банан','Апельсин'); 
//
// for(let v of a) 
// перебираем массив, методом for of
//
// for(let i=0; i<a.length; i++) a[i] (а точнее a.array[i], т.к. array упорядочен по индексам от 0 до length-1)
// перебираем массив методом for (при включённом proxy, возможно, замедляет работу)
//
// a['а']='Яблоко';
// console.log(a['а'])
// добавление элементов как в обычный массив (при включённом proxy, возможно, замедляет работу)
//
// a.push('Яблоко')
// также работают unshift, shift, pop, splice (без третьего аргумента), reverse
// особое внимание оператору sort, который работает, но его работа занимает дольше времени (т.к. требует переиндексацию)
//
// a.get(key), a.set(key,value), a.delete(key) и остальные методы Map
//
// a.array, a.map - доступ к данным в виде массива или в виде Map
//
// a.length, a.size
// корректно работают операторы длины массива
//
// a.set('123','Банан') и a.set(123,'Банан') идентичны
// они приведут к одному и тому же элементу, т.к. работает приведение типов ключей к числам и строкам (ключи-объекты запрещены)
//
// ...a
// spread оператор вернёт набор значений a

//		что не работает

// for(let i in a)
//
// delete a[key]
//
// key in a

//		для чего это нужно

// к сожалению, массивы, объекты и Map/Set в JS не реализуют стандартный необходимый функционал векторов (как, например, массивы в PHP)
// например, невозможно сделать push в Map или Object
// невозможно работать с нелинейными нечисловыми ключами в Array (при удалении/добавлении теряется length)
// пример: x[25]=1 вернёт length, равной 26 даже если это единственный элемент массива
// если мы после этого сделаем x['test']=2, то length всё равно будет равен 26
// по этому было решено объеденить функционал Map и Array
// плюсы:
// - вам доступен функционал Map
// - вам доступен функционал Array
// минусы:
// - медленней скорость работы
// - данные занимают больше памяти

//		расширенный функционал

//a.array	- работа так, как если бы это был массив (это и есть массив)
//a.map	- работа так, как если бы это был объект Map (это и есть объект Map)
//a.copy	- работа так, как если бы это был массив (работать с копией массива)
//a.iter	- итератор для перебора для for of
//a.foreach( f(key,value) )	- перебор значений, если вы хотите завершить перебор, верните false
//a.push()	- добавить элемент v в массив
//a.shift()
//a.pop()
//a.unshift()
//a.splice(pos,deleteCount)		- обратите внимание, что здесь нет третьего элемента items
//a.reverse
//a.sort
//также можно использовать функции массива через a.array и функции Map через a.map

//		стандартный функционал (с доработками, вроде коррекции ключа и синхронизации с a,b,c)

//a.has	- проверяет, есть ли элемент с таким ключом
//a.size	- размер массива
//a.length	- ~
//a.clear	- очистить массив
//a.set	- установить значение
//a.get	- получить значение
//a.delete	- удалить значение с этим ключом
//a.keys
//a.values
//a.entries

//		как это устроено

// a.a - содержит массив ключей
// a.b - содержит массив значений
// a.c - содержит Map ключ -> индекс массивов a и b
// a.d - содержит Map ключ -> значение

//		внимание

// допускаются только текстовые и числовые ключи
//
// ключи pushIndex%NUM% зарезервированы под внутренний индекс массива для корректного push-а

var useProxy=0; // включить, чтобы иметь возможность доступа к массиву через a[key]
var deepTrace=0;	// включить, чтобы исключить из доступа поля самого класса, например a['a'] и т.д. (работает только если включён useProxy)
				// значительно замедляет работу
var useMap=0; // использовать отдельный Map с ключами-значениями

// prepend
var allowMethodsT=['array','map','foreach','copy','set','add','clear','delete','push','shift','pop','unshift','splice','reverse','sort','get','has','keys','values','entries','length','size','iter'];
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
	this[Symbol.iterator]=this.generator;
	for(let i=0;i<arguments.length;i++){
		this.push(arguments[i]);
	}
	if(useProxy) return this.asProxy();
}

// some tests & examples

//var a=new Arr('Яблоко','Банан');
//a.reverse();
//a.unshift('Кирка');
//a.sort();
//for(let v of a) alert(v);
//a.c.forEach((k,v)=>{alert(k+' '+v);});

//var a=new Arr();
//a.set('а','Яблоко');
//a.set('б','Банан');
//a.set('123','Близнецы');
//a.set(123,'Близнецы');
//a.set('в','Сочи');
//a['1234']='Красная поляна';
//a['a'];
//alert(a.length);
//a.sort();
//console.log(...a);
//let s='';
//for(let v of a){
//	s+=v+', ';
//}
//a.sort();
//for(let i=0; i<a.length; i++){
//	s+=a.array[i];
//}
//console.log(s);
