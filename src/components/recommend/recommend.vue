<template>
	<div class="recommend" ref="recomment">
		<scroll ref="scroll" class="recommend-content" :data="discList">
			<div>
				<div class="slider-wrapper" v-if="recommends.length">
					<slider>
						<div v-for="item in recommends">
							<a :href="item.linkUrl">
								<img width="100%" @load="loadImage" :src="item.picUrl" alt="推荐轮播图">
							</a>
						</div>
					</slider>
				</div>
				<div class="recommend-list">
					<h1 class="list-title">热门歌单推荐</h1>
					<ul>
						<li class="item" v-for="item in discList">
							<div class="icon">
								<img v-lazy="item.imgurl" alt="" width="60" height="60">
							</div>
							<div class="text">
								<h2 class="name" v-html="item.creator.name"></h2>
								<p class="desc" v-html="item.dissname"></p>
							</div>
						</li>
					</ul>
				</div>
			</div>

			<div class="loading-container" v-show="!discList.length">
				<loading></loading>
			</div>
		</scroll>
	</div>
</template>

<script>
import { getRecommend, getDiscList } from 'api/recommend';
import { ERR_OK } from 'api/config';
import slider from 'base/slider/slider';
import scroll from 'base/scroll/scroll';
import loading from 'base/loading/loading';
import { playlistMixin } from 'common/js/mixin';


export default {
	mixins: [playlistMixin],
	components: {
		slider,
		scroll,
		loading
	},
	data(){
		return {
			//轮播图
			recommends: [],
			//歌单列表
			discList: [],
			//图片加载标识
			checkLoaded: false
		}
	},
	created(){

		this._getRecommend();
		this._getDiscList();
	},
	methods: {
		_getRecommend() {
			getRecommend().
			then((res) => {
				if(res.code === ERR_OK){
					this.recommends = res.data.slider;
				}
			})
		},
		_getDiscList(){
			getDiscList()
			.then((res) => {
				if(res.code === ERR_OK){
					// console.log('---');
					// console.log(res);
					this.discList = res.data.list;
				}
			})
		},
		//图片加载(推荐轮播图)
		loadImage(){
			if(!this.checkLoaded){
				this.$refs.scroll.refresh();
				this.checkLoaded = true;
			}
		},
		handlePlaylist(playlist) {
			const bottom = playlist.length > 0? '60px' : '';
			this.$refs.recomment.style.bottom = bottom;
			this.$refs.scroll.refresh();
		},
	}
}
</script>

<style lang="less" scoped>
	@import '~common/css/variable.less';
	
	.recommend {
		position: fixed;
		width: 100%;
		top: 88px;
		bottom: 0;

		&-content{
			width: 100%;
			height: 100%;
			overflow: hidden;

			.slider-wrapper{
				position: relative;
				width: 100%;
				overflow: hidden;
			}

			.recommend-list{
				.list-title {
					height: 65px;
					line-height: 65px;
					text-align: center;
					font-size: @font-size-medium;
					color: @color-theme;
				}
				.item{
					display: flex;
					box-sizing: border-box;
					align-items: center;
					padding: 0 20px 20px 20px;

					.icon{
						flex: 0 0 60px;
						width: 60px;
						padding-right: 20px;
					}
					.text{
						display: flex;
						flex-direction: column;
						justify-content: center;
						flex: 1;
						line-height: 20px;
						overflow: hidden;

						.name{
							margin-bottom: 10px;
							color: @color-text;
							font-size: @font-size-medium;
						}
						.desc{
							color: @color-text-d;
							font-size: @font-size-medium;
						}
					}
				}
			}
		}

		.loading-container{
			position: absolute;
			width: 100%;
			top: 50%;
			transform: translateY(-50%);
		}
	}

</style>
