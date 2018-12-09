import * as types from './mutation-type';
import { playMode } from 'common/js/config';
import { shuffle } from 'common/js/util';

function findIndex(list, song) {
	return list.findIndex((item) => {
		return item.id === song.id
	})
}

export const selectPlay = function ({ commit, state }, { list, index }) {
	//保存列表
	commit(types.SET_SEQUENCE_LIST, list);

	//判断当前播放状态
	if (state.mode === playMode.random) {
		let randomList = shuffle(list);
		commit(types.SET_PLAYLIST, randomList);

		//顺序列表歌曲 对应随机列表的index
		index = findIndex(randomList, list[index])
	}
	else {
		commit(types.SET_PLAYLIST, list);
	}
	
	commit(types.SET_CURRENT_INDEX, index);
	commit(types.SET_FULL_SCREEN, true);
	commit(types.SET_PLAYING_STATE, true);
}

//随机播放
export const randomPlay = function({ commit }, { list }) {
	commit(types.SET_PLAY_MODE, playMode.random);
	commit(types.SET_SEQUENCE_LIST, list);

	//保存随机播放列表
	let randomList = shuffle(list);
	commit(types.SET_PLAYLIST, randomList);
	commit(types.SET_CURRENT_INDEX, 0);
	commit(types.SET_FULL_SCREEN, true);
	commit(types.SET_PLAYING_STATE, true);
}