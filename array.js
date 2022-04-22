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


function Arr(){
	this.def=function(){
		this.index=0;
		this.a=Array();
		this.b=Array();
		this.c=new Map();
		this.d=new Map();
		this.array=this.b;
		this.map=this.d;
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
		if(!this.d.has(key)){
			this.a.push(key);
			this.b.push(value);
			let n=this.a.length-1;
			this.c.set(key,n);
		} else {
			let i=this.c.get(key)*1;
			this.b[i]=value;
		}
		this.d.set(key,value);
	}
	this.add=this.set; //alias
	this.clear=function(){
		this.c.clear();
		this.d.clear();
		this.def();
	}
	this.delete=function(key){
		let i=this.c.get(this.prependKey(key))*1;
		this.a.splice(i,1);
		this.b.splice(i,1);
		this.c.delete(this.prependKey(key));
		this.d.delete(this.prependKey(key));
	}
	this.push=function(value){
		let key='pushIndex'+this.index;
		this.set(key,value);
	}
	this.shift=function(){
		let val=this.b.shift();
		let key=this.a.shift();
		this.d.delete(this.prependKey(key));
		this.c.delete(this.prependKey(key));
	}
	this.pop=function(){
		let val=this.b.pop();
		let key=this.a.pop();
		this.d.delete(this.prependKey(key));
		this.c.delete(this.prependKey(key));
	}
	this.unshift=function(value){
		let key='pushIndex'+this.index;
		this.index++;
		this.c.forEach((v,k)=>this.c.set(k,Number(v)+1));
		this.a.unshift(key);
		this.b.unshift(value);
		this.d.set(key,value);
		this.c.set(key,0);
	}
	this.splice=function(pos,deleteCount){
		for(let i=pos;i<pos+deleteCount;i++){
			if(!(i in a)) continue;
			let key=this.prependKey(this.a[i]);
			this.d.delete(key);
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
				if(this.b[i]==oldB[j] && !(j in defined)){
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
		return this.d.has(this.prependKey(key));
	}
	this.get=function(key){
		return this.d.get(this.prependKey(key));
	}
	this.keys=function(){
		return this.d.keys();
	}
	this.values=function(){
		return this.d.values();
	}
	this.entries=function(){
		return this.d.entries();
	}
	this.__defineGetter__("size", function(){
		return this.d.size;
	});
	this.__defineGetter__("length", function(){
		return this.d.size;
	});
	this.__defineGetter__("length", function(){
		return this.copy();
	});
	this.__defineGetter__("iter", function(){
		let g=this.generator();
		return g;
	});
	this[Symbol.iterator]=this.generator;
	for(let i=0;i<arguments.length;i++){
		this.push(arguments[i]);
	}
}

//var a=new Arr('Яблоко','Банан');
//a.reverse();
//a.unshift('Кирка');
//a.sort();
//for(let v of a) alert(v);

//a.c.forEach((k,v)=>{alert(k+' '+v);});

//var a=new Arr();
//a.set('а','Яблоко');
//a.set('б','Банан');
//a.set('в','Сочи');
//a.sort();


//for(let v of a.iter){
//	alert(v);
//}
