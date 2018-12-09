<template>
	<music-list :songs="songs" :title="title" :bg-image="bgImage"></music-list>
</template>

<script>
import { mapGetters } from 'vuex';
import { getSingerDetail } from 'api/singer';
import { ERR_OK } from 'api/config';
import { createSong } from 'common/js/song';
import musicList from 'components/music-list/music-list';

export default {
	components: {
		musicList
	},
	data(){
		return {
			songs: []
		}
	},
	computed: {
		...mapGetters([
			'singer'
		]),
		title() {
			return this.singer.name
		},
		bgImage() {
			return this.singer.avatar
		}
	},
	created(){
		this._getDetail();
	},
	methods: {
		//获取详情
		_getDetail() {

			if(!this.singer.id) {
				this.$router.replace('/singer');
				return;
			}

			getSingerDetail(this.singer.id)
			.then((res) => {
				if(res.code === ERR_OK) {
					this.songs = this._normalizeSongs(res.data.list);
					console.log(this.songs);
				}
			})
		},
		//格式化数据
		_normalizeSongs(list) {
			let ret = [];
			list.forEach((item) => {
				let { musicData } = item;
				if(musicData.songid && musicData.albummid) {
					ret.push(createSong(musicData));
				}
			})

			return ret;
		}
	}
}
</script>

<style lang="less" scoped>
	//引入mixin方法
	@import '~common/css/variable.less';
	// @import '~common/css/mixin.less';

	// .singer-detail{
	// 	position: fixed;
	// 	z-index: 100;
	// 	top: 0;
	// 	left: 0;
	// 	right: 0;
	// 	bottom: 0;
	// 	background-color: @color-background;
	// }



</style>
