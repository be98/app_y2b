var $io = (function() {
	var self = {
		host : "",
		cookie : "",
		is_mobile : true,
		to_formdata : function(params) {
			let form_data = new FormData();
			form_data.append('_', ''); //아무것도 없는 빈것은 python-multipart에서 에러가 발생하므로 추가함
			for(let key in params) { //params는 dict형식
				let value=params[key];
				form_data.append(key, value);
			}
			return form_data;
		},
		to_paramdata : function(params) {
			let form_data = {};
			for(let key in params) {
				form_data[key] = ''+params[key]; //스트링으로 변환
			}
			return form_data;
		},
		
		'get' : function(url, params) {
			let headers = {};
			let options ={
				method : 'GET',
				url : self.host+url,
				headers : headers,
				params : self.to_paramdata(params),
			};
			return window.pywebview.api.request(options);
		},
		//일반 post와 함께 (upload)file을 post함수로 사용한다.
		//다만, (upload)file의 경우는 params가 FormData로 만들어져 넘겨주어야 한다.
		'post' : function(url, params) {
			let headers = { 'Content-Type': 'application/x-www-form-urlencoded', };
			let options ={
				method : 'POST',
				url : self.host+url,
				headers : headers,
				data : params, //self.to_formdata(params),
			};
			return window.pywebview.api.request(options);
		},
		'put' : function(url, params) {
			let headers = { 'Content-Type': 'application/x-www-form-urlencoded', };
			let options ={
				method : 'PUT',
				url : self.host+url,
				headers : headers,
				data : params, //self.to_formdata(params),
			};
			return window.pywebview.api.request(options);
		},
		'delete' : function(url, params) {
			let headers = { 'Content-Type': 'application/x-www-form-urlencoded', };
			let options ={
				method : 'DELETE',
				url : self.host+url,
				headers : headers,
				data : params, //self.to_formdata(params),
			};
			return window.pywebview.api.request(options);
		},
	};
	return self;
})();

export default $io;
