actionsheet
===========

A UI component base on http://gmu.baidu.com/ framework, similar to UIActionSheet in iOS

usage
===========

~~~
var actionsheet = new gmu.Actionsheet({
	title: 'please choose',
	items: ['first', 'second', 'third'],
	itemClick: function (e, data) {
		console.debug('item clicked, index is ' + data.index);
	},
	cancelClick: function (e) {
		console.debug('cancel button clicked');
	}
});
~~~

screenshot
=======
![image](https://raw.githubusercontent.com/fengjian0106/actionsheet/master/screenshot.png)
