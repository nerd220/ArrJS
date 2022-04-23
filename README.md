# ArrJS
Wrapper over array &amp; map classes. Allow use push, shift, unshift, sort &amp; else methods on Map class.

## для чего это нужно

 к сожалению, массивы, объекты и Map/Set в JS не реализуют стандартный необходимый функционал векторов (как, например, массивы в PHP)
 например, невозможно сделать push в Map или Object
 невозможно работать с нелинейными нечисловыми ключами в Array (при удалении/добавлении теряется length)
 пример: x[25]=1 вернёт length, равной 26 даже если это единственный элемент массива
 если мы после этого сделаем x['test']=2, то length всё равно будет равен 26
 по этому было решено объеденить функционал Map и Array
 плюсы:
 — вам доступен функционал Map
 — вам доступен функционал Array
 минусы:
 — медленней скорость работы
 — данные занимают больше памяти

## что работает?

 создаём массив с помощью конструктора Arr
 var a=new Arr('Яблоко','Банан','Апельсин'); 

 for(let v of a) 
 перебираем массив, методом for of

 for(let i=0; i<a.length; i++) a[i] (а точнее a.array[i], т.к. array упорядочен по индексам от 0 до length—1)
 перебираем массив методом for (при включённом proxy, возможно, замедляет работу)

 a['а']='Яблоко';
 console.log(a['а'])
 добавление элементов как в обычный массив (при включённом proxy, возможно, замедляет работу)

 a.push('Яблоко')
 также работают unshift, shift, pop, splice (без третьего аргумента), reverse
 особое внимание оператору sort, который работает, но его работа занимает дольше времени (т.к. требует переиндексацию)

 a.get(key), a.set(key,value), a.delete(key) и остальные методы Map

 a.array, a.map — доступ к данным в виде массива или в виде Map

 a.length, a.size
 корректно работают операторы длины массива

 a.set('123','Банан') и a.set(123,'Банан') идентичны
 они приведут к одному и тому же элементу, т.к. работает приведение типов ключей к числам и строкам (ключи—объекты запрещены)

 key in a
 вернёт true или false в зависимости от наличия ключа в a

 ...a
 spread оператор вернёт набор значений a

## что не работает

 for(let i in a)
 delete a[key]
 для удаления испольлзуйте метод a.delete или a.splice

## расширенный функционал

a.array	— работа так, как если бы это был массив (это и есть массив)
a.map	— работа так, как если бы это был объект Map (это и есть объект Map)
a.copy	— работа так, как если бы это был массив (работать с копией массива)
a.iter	— итератор для перебора для for of
a.foreach( f(key,value) )	— перебор значений, если вы хотите завершить перебор, верните false
a.push()	— добавить элемент v в массив
a.shift()
a.pop()
a.unshift()
a.splice(pos,deleteCount)		— обратите внимание, что здесь нет третьего элемента items
a.reverse
a.sort
также можно использовать функции массива через a.array и функции Map через a.map

## стандартный функционал (с доработками, вроде коррекции ключа и синхронизации с a,b,c)

a.has	— проверяет, есть ли элемент с таким ключом
a.size	— размер массива
a.length	— ~
a.clear	— очистить массив
a.set	— установить значение
a.get	— получить значение
a.delete	— удалить значение с этим ключом
a.keys
a.values
a.entries

## как это устроено

 a.a — содержит массив ключей
 a.b — содержит массив значений
 a.c — содержит Map ключ —> индекс массивов a и b
 a.d — содержит Map ключ —> значение

## внимание

 допускаются только текстовые и числовые ключи
 ключи pushIndex%NUM% зарезервированы под внутренний индекс массива для корректного push—а

## параметры
		
useProxy
включить, чтобы иметь возможность доступа к массиву через a[key]

deepTrace
включить, чтобы исключить из доступа поля самого класса, например a['a'] и т.д. (работает только если включён useProxy)
значительно замедляет работу