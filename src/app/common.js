import axios from 'axios'

const $c = (function() {
	var self = {
		init() {
			//timezone체크
			var visitortime = new Date();
			self.tzoffset = visitortime.getTimezoneOffset();
			//io.host세팅
			const url = new URL(window.location.href);
			self.io.host = url.host;
			self.io.origin = url.origin;
			
			//위치정보
			/*
			if (navigator.geolocation) { // GPS를 지원하면
				navigator.geolocation.getCurrentPosition(function(position) {
				  alert(position.coords.latitude + ' ' + position.coords.longitude);
				}, function(error) {
				  console.error(error);
				}, {
				  enableHighAccuracy: false,
				  maximumAge: 0,
				  timeout: Infinity
				});
			}*/
			
			//string에 함수 추가
			String.prototype.startswith = function( pattern ) {
				return this.substring( 0, pattern.length ) === pattern;
			};
			String.prototype.trim = function() { 
				return this.replace(/^\s+|\s+$/g,""); 
			};
			//string conv함수 추가
			String.prototype.to_date = function() { //서버의 utc 0타임을 date로 바꿈
				return self.parseDate( String(this) );
			};
			String.prototype.to_localdate = function() { //서버의 utc 0타임을 local로 바꿈
				var d = self.parseDate( String(this) );
				if( d ) { return new Date( d.getTime() - self.tzoffset*60000 ); }
				return null;
			};
			
			//Number에 함수 추가
			/** Number.prototype.format(n, x, s, c)
			 * n:소수점밑의 길이, x:구분문자간격, s:구분문자(,), c:소수점문자(.)
			 */
			Number.prototype.format = function(n, x, s, c) {
				var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\D' : '$') + ')',
					num = this.toFixed(Math.max(0, ~~n));
				return (c ? num.replace('.', c) : num).replace(new RegExp(re, 'g'), '$&' + (s || ','));
			};

		},
		
		toInt : function(value, base) {
			var parsed = parseInt(value, (base||10));
			if (isNaN(parsed)) { return 0; }
			return parsed;
		},
		toFloat : function(value, base) {
			var parsed = parseFloat(value, (base||10) );
			if (isNaN(parsed)) { return 0; }
			return parsed;
		},
		
		// ------------ io 함수 ----------------
		io : {
			host : '',	//모바일앱에서 사용함
			is_mobile : false,
			origin : '',
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
			
			'request': function(options) {
				return axios(options).then( (response)=>{
					return response;
				});
			},
			'get' : function(url, params) {
				var param_string = "";
				for(var k in params) { //딕셔너리 형식
					let key = encodeURIComponent(k);
					let value = encodeURIComponent(params[k]);
					if(param_string) { param_string += '&'; }
					param_string += key+'='+value;
				}
				if(param_string) { 
					param_string += '&'; 
					param_string += '_=';
				}
				return self.io.request({
					method: 'GET',
					url: url+'?'+param_string,
				});
			},
			//ionic서버에서 
			//--> application/x-www-form-urlencoded, multipart/form-data 모두 잘 작동함.
			'post' : function(url, params) {
				let headers = { 'Content-Type': 'application/x-www-form-urlencoded', };
				return self.io.request({
					method: 'POST',
					url: url,
					headers : headers,
					data: self.io.to_paramdata(params),
				});
			},
			'put' : function(url, params) {
				let headers = { 'Content-Type': 'application/x-www-form-urlencoded', };
				return self.io.request({
					method: 'PUT',
					url: url,
					headers : headers,
					data: self.io.to_paramdata(params),
				});
			},
			'delete' : function(url, params) {
				let headers = { 'Content-Type': 'application/x-www-form-urlencoded', };
				return self.io.request({
					method: 'DELETE',
					url: url,
					headers : headers,
					data: self.io.to_paramdata(params),
				});
			},
		},

		// ------------ form 함수 ----------------
		form : {
			clear_form : function(form_data) { //form_data는 object
				for(let k in form_data) {
					let value = form_data[k];
					if( value instanceof Array ) { //리스트형식
						form_data[k] = [];
					} else if(typeof value==='object') { //딕셔너리 형식
						self.form.clear_form(form_data[k]);
					} else if(typeof value==='number') { //수
						form_data[k] = 0;
					} else {
						form_data[k] = '';
					}
				}
			},
			
			clear_error : function(form_error) {
				for(let k in form_error) {
					let v = form_error[k];
					if(typeof v == "object") {  form_error[k] = {}; }
					else { form_error[k] = ''; }
				}
			},
			set_error : function(error, form_error) {
				for(let k in error) {
					form_error[k] = error[k];
				}
			},
			set_tab_error : function(error, input_list, tab_error) {
				for(let i=0; i<input_list.length; i++) {
					let input = input_list[i];
					console.log(input.name, error);
					if( error.prototype.hasOwnProperty.call(input.name) ) {
						let tab_list = [];
						let parent = input.$parent;
						while(parent) {
							if(parent['_'].type.name=='QTabPanel') { tab_list.unshift(parent.name); } 
							else if(parent['_'].type.name=='QForm') { break; }
							parent = parent.$parent;
						}
						//tab에러 세팅
						let tab_path = "";
						for(let j=0; j<tab_list.length; j++) {
							if(j>0) { tab_path += '/'; }
							tab_path += tab_list[j];
							tab_error[tab_path] = true;
						}
					}
				}
			},
			init_error : function(form_data, form_error) {
				for(let k in form_data) {
					let v = form_data[k];
					if(typeof v == "object") {  form_error[k] = {}; }
					else { form_error[k] = ''; }
				}
			},
		},
		

		// ------------ url 함수 ----------------
		url : {
			url_prefix : "",
			escape : function (str) {
				return str.replace(/%/g,'%25').replace(/#/g,'%23').replace(/&/g,'%26').replace(/"/g,'%22').replace(/'/g,'%27')
			},
			obj2param : function (obj) {
				var i=0, param = '';
				for (var prop in obj) {
					if(i>0) { param += '&'; }
					param += prop+'='+encodeURIComponent(obj[prop]);
					i += 1;
				}
				return param;
			},
		},
		get_url(url) {
			url = url.trim()
			if(url.indexOf("http://")==0 || url.indexOf("https://")==0) {
				return url;
			} 
			if( url.length==0 ) { url= '/'; }
			if( url[0]!='/' ) { url = '/'+url; }
			let cnt = self.url.url_prefix.length;
			if( cnt>0 ) {
				let url_prefix = self.url.url_prefix;
				if( url_prefix[cnt-1]=='/' ) { url_prefix = url_prefix.substring(0, cnt-1); }
				if( url_prefix ) { url = '/~' + url_prefix + url }
				if( url[0]!='/' ) { url = '/'+url; }
			}
			//url에 self.io.host를 붙이지 않기로 함. 다만, url을 정리하는 코드를 넣음
			//url = self.io.host + url;
			return url;
		},
		goto_page(page_url) {
			location.href=page_url;
		},
		change_language : function(language_id) {
			self.io.post("/country/language/a_set_language", {'language_id':language_id}).then(function(){
				location.reload();
			});
		},
		
		// ------------ timezone ----------------
		tzoffset : 0,
		dateMonths : "Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"),
		monthsHead : "January_February_March_April_May_June_July_August_September_October_November_December".split("_"),
		format_date : function(e, format) {
			if( !(e instanceof Date) ) { return e; }
			var s = e.getFullYear(),
			n = e.getMonth(),
			o = e.getDate(),
			a = e.getHours(),
			r = a % 12 == 0 ? 12 : a % 12,
			i = e.getMinutes(),
			c = e.getSeconds(),
			u = e.getMilliseconds(),
			l = function(e) {
				return ("0" + e).slice(-2)
			};
			var h = {
				YYYY: s,
				MM: l(n + 1),
				MMM: self.dateMonths[n],
				MMMM: self.monthsHead[n],
				M: n + 1,
				DD: l(o),
				D: o,
				HH: l(a),
				H: a,
				hh: l(r),
				h: r,
				mm: l(i),
				m: i,
				ss: l(c),
				s: c,
				S: u
			};
			return (format || "YYYY-MM-DD HH:mm:ss").replace(/Y+|M+|D+|H+|h+|m+|s+|S+/g, function(e) {
				return h[e];
			})
		},
		parseDate(vDate) {
			//format은
			//-->'YYYY-MM-DD HH:mm:ss' 형식이거나 공백대신 'T'문자가 있는 utc형식임
			if(!vDate) return null;
			var year = vDate.substr(0, 4), month = vDate.substr(5, 2), day = vDate.substr(8, 2);
			var hour = vDate.substr(11, 2), min = vDate.substr(14, 2), sec = vDate.substr(17, 2);
			return new Date(year,month-1,day,hour,min,sec);
		},
		isDate(date) {
			return date instanceof Date && !isNaN(date);
		},
		
		// ------------ cookie ----------------
		cookie : {
			get : function(cookieName) {
				var value = document.cookie.match('(^|;) ?' + cookieName + '=([^;]*)(;|$)');
				return value? value[2] : null;
			},
			set : function(cookieName, value, expire) {
				if(expire) {
					var date = new Date();
					date.setTime(date.getTime() + expire*1000); //서버의 expire와 맞추기위해 1000을 곱함.->ms를 s로 바꿈
					document.cookie = cookieName + '=' + value + ';expires=' + date.toUTCString() + ';path=/';
				} else {
					document.cookie = cookieName + '=' + value + ';path=/';
				}
			},
		},
		
		// ------------ tag ----------------
		tag : {
			//문자열에 있는 이미지태그의 src에 prefix를 삽입하는 함수
			//예) 이미지에 http://halfdev.net붙이기 -> img2hasPrefix(html, 'http://halfdev.net')
			img2hasPrefix : function( html, prefix ) {
				var description = document.createElement('span');
				description.innerHTML = html;
				var el_list = description.getElementsByTagName('img')
				var i, len;
				for(i=0, len=el_list.length; i<len; i++) {
					var el = el_list[i];
					var src = el.getAttribute('src');
					if( self.c.startsWith('http://', src)==false && self.c.startsWith('https://', src)==false ) {
						el.setAttribute('src', prefix+src );
					}
				}
				return description.innerHTML;
			},
			//사용예 : strip_tags('<p>Kevin</p> <b>van</b> <i>Zonneveld</i>', '<i><b>');
			strip_tags : function(str, allow){
				allow = (((allow || '') + '').toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join('');
				var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
				return str.replace(tags, function ($0, $1) {
					return allow.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 :' ';
				}).replace(/^\s+|\s+$/g,""); //마지막은 trim처리
			},
			//사용예 : extract_TagList('<p><img src="xxx">Kevin</p> <b>van</b> <i>Zonneveld</i>', 'img'); => img만 추려냄 
			extract_tagList : function(input, tag) {
				tag = tag.toUpperCase();
				var span = document.createElement('span');
				span.innerHTML = input;
				var children= span.querySelectorAll('*');
				var tag_list = [];
				for(var i = 0 ; i < children.length ; i++) {
					if(children[i].tagName==tag) {
						tag_list.push( children[i] );
					}
				}
				return tag_list;
			},
			encode_html : function( str ) {
				return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
			},
			decode_html : function(text) {
				var entities = [
					['amp', '&'], ['apos', '\''], ['#x27', '\''], ['#x2F', '/'], ['#47', '/'],
					['#39', '\''], ['lt', '<'], ['gt', '>'], ['nbsp', ' '], ['quot', '"']
				];
				for (var i = 0, max = entities.length; i < max; ++i) 
					text = text.replace(new RegExp('&'+entities[i][0]+';', 'g'), entities[i][1]);
				return text;
			},
		},
		
		// ------------ unique_id ----------------
		uid() {
			function rand(num) {
				const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
				let result = '';
				const charactersLength = characters.length;
				for (let i = 0; i < num; i++) {
					result += characters.charAt(Math.floor(Math.random() * charactersLength));
				}
				return result;
			}
			let now = new Date();
			let now_utc = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
			return now_utc.getTime()+'.'+rand(6);
		},
		
		/* script */
		add_script(url, callback) {
			let s = document.createElement('script');
			if(callback) { s.onload = callback; }
			s.setAttribute('src', url);
			s.setAttribute('type', 'text/javascript');
			document.body.appendChild(s)
		},
		add_css(url, callback) {
			let s = document.createElement('link');
			if(callback) { s.onload = callback; }
			s.setAttribute('href', url);
			s.setAttribute('rel', 'stylesheet');
			s.setAttribute('type', 'text/css');
			document.body.appendChild(s)
		},
		
		/* notify */
		$root : null,
		response_notify(success, message) {
			let position = 'top';
			if(self.io.is_mobile) { position = 'bottom'; }
			if(success) {
				self.$root.$q.notify({ message:message, type:'positive', position:position, 
					progress: true, html: true,
					group:'response_notify', icon:'check_circle_outline' });
			} else {
				self.$root.$q.notify({ message:message, type:'negative', position:position, 
					progress: true, html: true,
					group:'response_notify', icon:'error_outline' });
			}
		},
		
		/* parse_func */
		parse_func(func_string) {
			let is_func = 0;
			let func_name = '';
			let params = [];
			let start_pos = func_string.indexOf('(');
			if(start_pos>0) {
				func_name = func_string.substring(0, start_pos);
				let param_s = func_string.substring(start_pos+1).trim();
				if(param_s.length>0) {
					let end_char = param_s[param_s.length-1];
					if( end_char==')') {
						//괄호로 이루어진 경우임.
						param_s = "["+param_s.slice(0, param_s.length-1) +"]";
						try { 
							params = JSON.parse( param_s ); 
							is_func = 1;
						} catch( err ) {
							params = [];
						}
					}
				}
			}
			return [ is_func, func_name, params ];
		},
		
		hasProperty(targetObj, targetProp) {
			return Object.prototype.hasOwnProperty.call(targetObj, targetProp);
		},

	};
	
	//---------------
	// instance
	//---------------
	self.init();
	return self;
})();


export default $c;
