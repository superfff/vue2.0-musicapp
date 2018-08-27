import * as types from './mutation-type.js';

const mutations = {
	[types.SET_SINGER](state, singer) {
		state.singer = singer;
	}
}

export default mutations