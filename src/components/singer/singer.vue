<template>
	<div class="singer" ref="singer">
		<list-view :data="singers" @select="selectSinger" ref="list"></list-view>
		<transition name="slide">
			<router-view></router-view>
		</transition>
	</div>
</template>

<script>
import { getSingerList } from 'api/singer';
import { ERR_OK } from 'api/config';
import listView from 'base/listview/listview'
import { mapMutations } from 'vuex';
import { playlistMixin } from 'common/js/mixin';

const HOT_NAME = '热门';

export default {
	mixins: [playlistMixin],
	components: {
		listView
	},
	data(){
		return {
			singers: []
		}
	},
	created(){
		this._getSingerList();
	},
	methods: {
		...mapMutations({
			setSinger: 'SET_SINGER'
		}),

		//点击
		selectSinger(singer) {
			this.setSinger(singer);
			
			this.$router.push({
				path: `/singer/${singer.id}`
			})
		},
		handlePlaylist(playlist) {
			const bottom = playlist.length > 0? '60px' : '';
			this.$refs.singer.style.bottom = bottom;

			this.$refs.list.refresh();
		},
		_getSingerList(){
			getSingerList()
			.then((res) => {
				// console.log(res);
				if(res.code === ERR_OK){
					this.singers = this._normalizeSinger(res.data.list)
				}
			})
		},
		//格式化数据
		_normalizeSinger(list){
			let map = {
				hot: {
					title: HOT_NAME,
					items: []
				}
			}

			list.forEach((item, index) => {
				//歌手信息
				let singer = {
					id: item.Fsinger_mid,
					name: item.Fsinger_name,
					avatar: `https://y.gtimg.cn/music/photo_new/T001R150x150M000${item.Fsinger_mid}.jpg?max_age=2592000`
				}

				//设置前10条为热门数据
				if(index < 10){
					map.hot.items.push(singer);
				}

				const key = item.Findex;

				//以拼音为key值保存数据
				if(!map[key]){
					map[key] = {
						title: key,
						items: []
					}
				}
				map[key].items.push(singer);
			})


			//获取 有序列表
			let hot = [];
			let ret = [];

			for(let key in map){
				let val = map[key];
				if(val.title.match(/[a-zA-Z]/)){
					ret.push(val);
				}
				else if (val.title == HOT_NAME){
					hot.push(val);
				}
			}

			//排序
			ret.sort((a, b) => {
				return a.title.charCodeAt(0) - b.title.charCodeAt(0)
			})

			return hot.concat(ret);
		}
	}
}
</script>

<style lang="less" scoped>
	.singer{
		width: 100%;
		position: fixed;
		top: 88px;
		bottom: 0;
	}

	//详情划入css
	.slide-enter-active,
	.slide-leave-active{
		transition: all .3s;
	}
	.slide-enter,
	.slide-leave-to{
		transform: translate3d(100%, 0, 0);
	}
</style>
