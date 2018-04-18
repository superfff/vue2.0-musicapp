import originJSONP from 'jsonp';

export default function jsonp(url, data, option) {
	/*
		url       地址
		data      请求参数
		option    api参数
	*/

	url += (url.indexOf('?')<0? '?': '&') + params(data);

	return new Promise((resolve, reject) => {
		originJSONP(url, option, (err, data) => {
			if(!err){
				return resolve(data);
			}
			else{
				return reject(err);
			}
		})
	})
}

function params(data) {
	let url = '';

	for(var k in data){
		let value = (data[k] !== undefined)? data[k]: '';
		url += `&${k}=${encodeURIComponent(value)}`;
	}

	return url ? url.substring(1): url;
}