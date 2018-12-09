<template>
	<div class="music-list">
		<div class="back" @click="back">
			<i class="icon-back"></i>
		</div>
		<h1 class="title" v-html="title"></h1>
		<div class="bg-image" :style="bgStyle" ref="bgImage">
			<div class="play-wrapper">
				<div class="play" v-show="songs.length && playBtn" @click="random">
					<i class="icon-play"></i>
					<span class="text">随机播放全部</span>
				</div>
			</div>
			<div class="filter" ref="filter"></div>
		</div>
		<div class="bg-layer" ref="layer"></div>
		<scroll 
			:data="songs" 
			:probe-type="probeType" 
			:listen-scroll="listenScroll" 
			@scroll="scroll"
			class="list" 
			ref="list">
			<div class="song-list-wrapper">
				<song-list :songs="songs" @select="selectItem"></song-list>
			</div>
			<div class="loading-container" v-show="!songs.length">
				<loading></loading>
			</div>
		</scroll>
	</div>
</template>

<script>
import scroll from 'base/scroll/scroll';
import songList from 'base/song-list/song-list';
import loading from 'base/loading/loading';
import { prefixStyle } from 'common/js/dom';
import { mapActions } from 'vuex';
import { playlistMixin } from 'common/js/mixin';

//预留偏移量
const RESERVED_HEIGHT = 40;
const transform = prefixStyle('transform');
const backdrop = prefixStyle('backdrop-filter');


export default {
	mixins: [playlistMixin],
	components: {
		scroll,
		songList,
		loading
	},
	data(){
		return {
			//纵向滚动
			scrollY: 0,
			playBtn: true,
		}
	},
	props: {
		bgImage: {
			type: String,
			default: ''
		},
		songs: {
			type: Array,
			default() {
				return []
			}
		},
		title: {
			type: String,
			default: ''
		}
	},
	computed: {
		bgStyle() {
			return `background-image: url(${this.bgImage})`
		}
	},
	watch: {
		scrollY(newY) { 
			//滚动遮罩层
			let translateY = Math.max(this.minTranslateY, newY);
			let zIndex = 0;
			//放大
			let scale = 1;
			//模糊
			let blur = 0;
			this.$refs.layer.style[transform] = `translate3d(0, ${translateY}px, 0)`;
			

			//往下拉
			const percent = Math.abs(newY / this.imageHeight);
			if (newY > 0) {
				scale = 1 + percent;
				zIndex = 10;
			}
			else {
				blur = Math.min(20*percent, 20);
			}
			this.$refs.filter.style[backdrop] = `blur(${blur}px)`;


			//滚动到顶部
			if (newY < this.minTranslateY) {
				zIndex = 10;
				this.$refs.bgImage.style.paddingTop = 0;
				this.$refs.bgImage.style.height = `${RESERVED_HEIGHT}px`;
				//隐藏播放按钮
				this.playBtn = false;
			}
			else {
				this.$refs.bgImage.style.paddingTop = '70%';
				this.$refs.bgImage.style.height = 0;
				this.playBtn = true;
			}

			this.$refs.bgImage.style.zIndex = zIndex;
			this.$refs.bgImage.style[transform] = `scale(${scale})`;
		}
	},
	created() {
		this.probeType = 3;
		this.listenScroll = true;
	},
	mounted() {
		//图片高度
		this.imageHeight = this.$refs.bgImage.clientHeight;
		//最大允许偏移量
		this.minTranslateY = -this.imageHeight + RESERVED_HEIGHT;
		//设置高度
		this.$refs.list.$el.style.top = `${this.imageHeight}px`;
	},
	methods: {
		...mapActions(['selectPlay', 'randomPlay']),
		//返回
		back() {
			this.$router.back();
		},
		//歌单滚动
		scroll(pos) {
			this.scrollY = pos.y;
		},
		//点击歌曲
		selectItem(item, index) {
			this.selectPlay({
				list: this.songs, 
				index
			})
		},
		//随机播放歌曲按钮
		random() {
			this.randomPlay({
				list: this.songs
			})
		},
		handlePlaylist(playlist) {
			const bottom = playlist.length > 0? '60px' : '';
			this.$refs.list.$el.style.bottom = bottom;

			this.$refs.list.refresh();
		}
	}
}
</script>

<style lang="less" scoped>
	//引入mixin方法
	@import '~common/css/variable.less';
	@import '~common/css/mixin.less';

	.music-list {
		position: fixed;
		z-index: 100;
		top: 0;
		left: 0;
		bottom: 0;
		right: 0;
		background: @color-background;

		.back {
			position: absolute;
			top: 0;
			left: 6px;
			z-index: 50;
			.icon-back {
				display: block;
				padding: 10px;
				font-size: @font-size-large-x;
				color: @color-theme;
			}
		}

		.title {
			position: absolute;
			top: 0;
			left: 10%;
			z-index: 40;
			width: 80%;
			text-align: center;
			line-height: 40px;
			font-size: @font-size-large;
			color: @color-text;
			.no-wrap();
		}

		.bg-image {
			position: relative;
			width: 100%;
			height: 0;
			padding-top: 70%;
			transform-origin: top;
			background-size: cover;
			// z-index: 30;
			.play-wrapper {
				width: 100%;
				position: absolute;
				bottom: 20px;
				z-index: 50;
				.play {
					box-sizing: border-box;
					width: 135px;
					padding: 7px 0;
					margin: 0 auto;
					text-align: center;
					border: 1px solid @color-theme;
					color: @color-theme;
					border-radius: 100px;
					font-size: 0;
					.icon-play {
						display: inline-block;
						vertical-align: middle;
						margin-right: 6px;
						font-size: @font-size-medium-x;
					}
					.text {
						display: inline-block;
						vertical-align: middle;
						font-size: @font-size-small;
					}
				}
			}

			.filter {
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				background: rgba(7, 17, 27, .4);
			}
		}

		.bg-layer {
      position: relative;
      height: 100%;
      background: @color-background;
		}
    .list {
      position: fixed;
      top: 0;
      bottom: 0;
      width: 100%;
      background: @color-background;

      .song-list-wrapper {
        padding: 20px 30px;
      }
      .loading-container {
        position: absolute;
        width: 100%;
        top: 50%;
        transform: translateY(-50%);
      }
    }
	}

</style>
