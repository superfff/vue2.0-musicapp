function getRandomInt(min, max) {
	//返回一个min和max之间的数
	return Math.floor(Math.random() * (max - min + 1) + min);

}
//随机数组
export function shuffle(arr) {
	let _arr = [...arr];
	
	for (let i=0; i<_arr.length; i++) {
		let j = getRandomInt(0, i);
		let t = _arr[i];

		_arr[i] = _arr[j];
		_arr[j] = t;
	}

	return _arr
}