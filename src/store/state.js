import { playMode } from 'common/js/config'

const state = {
	singer: {},
	//播放器状态
	playing: false,
	//播放器展开标识
	fullScreen: false,
	//当前播放列表
	playlist: [],
	//播放顺序列表
	sequenceList: [],
	//播放模式
	mode: playMode.sequence,
	//当前播放歌曲的索引
	currentIndex: -1
};

export default state