import { createStore } from "vuex";

const store = createStore({
	state: {
		user_id : 0,
		user : {
			user_id:0,
			user_group_id: 0,
			u_name: "",
			user_name:"",
			nick_name:"",
		},
		admin_id : 0,
		admin : {
			admin_id:0,
			admin_group_id: 0,
			a_name: "",
			admin_name:"",
		},
		language_id : "64",
		currency_id : "129",
		
		datetime_format : "YYYY-MM-DD HH:mm",
		date_format : "YYYY-MM-DD",
		time_format : "HH:mm",
		
		currency_value : "1.00000000",
		currency_symbol_left : "",
		currency_symbol_right : "원",
		decimal_place : "0",
		
		language_list : [],
		currency_list : [],
		// 네임스페이스별 i18n 사전: state.i18n[ns][key]
		// ns(모듈 경로)가 충돌 방지 판별자 — 서로 다른 API가 같은 키를 써도 겹치지 않음
		i18n : {},
		permission : {},
		page_permission : {},
		
		/* loading관리 */
		loading : {
			is_loading : false,
			load_data_dict : {},
		},
	},
	mutations : {
		// dict를 네임스페이스(ns) 아래에 병합.
		set_i18n(state, payload) {
			let ns = payload.ns;
			let dict = payload.dict || {};
			if(!state.i18n[ns]) { state.i18n[ns] = {}; }
			for(let key in dict) {
				state.i18n[ns][key] = dict[key];
			}
		},
	},
	getters : {
		// i18n 문자열 해석기. 사용: this.$store.getters.i18n_t(key, ns)
		// key가 "ns:key" 완전수식이면 ns 인자는 생략 가능.
		i18n_t: (state) => (key, ns) => {
			// "admin/posts:error_no_permission" 처럼 ns가 키에 붙어온 경우 분리
			if(ns === undefined && typeof key === 'string') {
				let idx = key.lastIndexOf(':');
				ns = key.slice(0, idx);
				key = key.slice(idx + 1);
			}
			// 번역이 없으면 원본 key(=전달된 문자열)를 그대로 반환
			return (state.i18n[ns] && state.i18n[ns][key]) || key;
		},
	},
	actions : {
		loading(context, data) {
			let total_cnt = Object.keys(context.state.loading.load_data_dict).length;
			let load_cnt = 0;
			context.state.loading.is_loading = false;
			context.state.loading.load_data_dict[data.name] = data.loading;
			for(let key in context.state.loading.load_data_dict) {
				if(context.state.loading.load_data_dict[key]==true) {
					context.state.loading.is_loading = true;
				} else {
					load_cnt += 1
				}
			}
			let percent = (total_cnt>0)? parseInt(100*load_cnt/total_cnt) : 0;
			context.state.loading.loading_percent = percent;
		},
	},
});

export default store;
