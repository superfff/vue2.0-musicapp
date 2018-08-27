import Vue from 'vue';
import Vuex from 'vuex';
import * as actions from './actions';
import * as getters from './getters';
import state from './state';
import mutations from './mutations';

//控制台打印logger,显示操作日志
import createLogger from 'vuex/dist/logger';

Vue.use(Vuex);


const debug = process.env.NODE_ENV !== 'production';

export default new Vuex.Store({
	strict: debug,
	plugins: debug? [createLogger()]: [],
	state,
	getters,
	mutations,
	actions
})
