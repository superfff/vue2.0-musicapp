<template>
	<div class="player" v-show="playlist.length > 0">
		<transition 
			name="normal"
			@enter="enter"
			@after-enter="afterEnter"
			@leave="leave"
			@after-leave="afterLeave">
			<div class="normal-player" v-show="fullScreen">
				<div class="background">
					<img width="100%" height="100%" :src="currentSong.image">
				</div>
				<div class="top">
					<div class="back" @click="back">
						<i class="icon-back"></i>
					</div>
					<h1 class="title" v-html="currentSong.name"></h1>
					<h2 class="subtitle" v-html="currentSong.singer"></h2>
				</div>
				<div 
					class="middle"
					@touchstart.prevent="middleTouchStart"
					@touchmove.prevent="middleTouchMove"
					@touchend="middleTouchEnd">
					<div class="middle-l" ref="middleL">
						<div class="cd-wrapper" ref="cdWrapper">
							<div class="cd" :class="cdCls">
								<img class="image" :src="currentSong.image">
							</div>
						</div>

						<div class="playing-lyric-wrapper">
							<div class="playing-lyric">{{playingLyric}}</div>
						</div>
					</div>
					<scroll 
						class="middle-r" 
						ref="lyricList" 
						:data="currentLyric && currentLyric.lines">
						<div class="lyric-wrapper">
							<div v-if="currentLyric">
								<p 
									ref="lyricLine" 
									class="text" 
									:class="{'current': currentLineNum === index}"
									v-for="(line, index) in currentLyric.lines">
									{{line.txt}}
								</p>
							</div>
						</div>
					</scroll>
				</div>
				<div class="bottom">
					<div class="dot-wrapper">
						<span class="dot" :class="{'active': currentShow === 'cd'}"></span>
						<span class="dot" :class="{'active': currentShow === 'lyric'}"></span>
					</div>
					<div class="progress-wrapper">
						<span class="time time-l">{{format(currentTime)}}</span>
						<div class="progress-bar-wrapper">
							<progress-bar 
								:percent="percent" 
								@percentMove="onProgressBarMove"
								@percentChange="onProgressBarChange"></progress-bar>
						</div>
						<span class="time time-r">{{format(currentSong.duration)}}</span>
					</div>
					<div class="operators">
						<div class="icon i-left" @click="changeMode">
							<i :class="iconMode"></i>
						</div>
						<div class="icon i-left" :class="disableCls">
							<i class="icon-prev" @click="prev"></i>
						</div>
						<div class="icon i-center" :class="disableCls">
							<i :class="playIcon" @click="togglePlaying"></i>
						</div>
						<div class="icon i-right" :class="disableCls">
							<i class="icon-next" @click="next"></i>
						</div>
						<div class="icon i-right">
							<i class="icon icon-not-favorite"></i>
						</div>
					</div>
				</div>
			</div>
		</transition>
		<transition name="mini">
			<div class="mini-player" v-show="!fullScreen" @click="open">
				<div class="icon">
					<img width="40" height="40" :class="cdCls" :src="currentSong.image">
				</div>
				<div class="text">
					<h2 class="name" v-html="currentSong.name"></h2>
					<p class="desc" v-html="currentSong.singer"></p>
				</div>
				<div class="control">
					<progress-circle :radius="32" :percent="percent">
						<i 
							class="icon-mini" 
							:class="miniIcon" 
							@click.stop="togglePlaying"></i>
					</progress-circle>
				</div>
				<div class="control">
					<i class="icon-playlist"></i>
				</div>
			</div>
		</transition>
		<audio 
			:src="currentSong.url" 
			ref="audio" 
			@canplay="ready" 
			@error="error"
			@timeupdate="updateTime"
			@ended="end"></audio>
	</div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex';
import animations from 'create-keyframe-animation';
import { prefixStyle } from 'common/js/dom';
import { playMode } from 'common/js/config';
import progressBar from 'base/progress-bar/progress-bar';
import progressCircle from 'base//progress-circle/progress-circle';
import scroll from 'base/scroll/scroll'

//引入util的方法
import { shuffle } from 'common/js/util';

//引入歌词解析
import Lyric from 'lyric-parser';

const transform = prefixStyle('transform');
const transitionDuration = prefixStyle('transitionDuration');

export default {
	components: {
		progressBar,
		progressCircle,
		scroll
	},
	data(){
		return {
			//歌曲是否准备完毕标识
			songReady: false,
			//当前播放时间
			currentTime: 0,
			//歌词
			currentLyric: null,
			//当前歌词所在行
			currentLineNum: 0,
			//歌词/专辑图 显示标识  (cd/lyric)
			currentShow: 'cd',
			//当前滚动歌词
			playingLyric: ''
		}
	},
	computed: {
		...mapGetters([
			'fullScreen', 
			'playlist', 
			'currentSong', 
			'playing', 
			'currentIndex',
			'mode',
			'sequenceList'
		]),
		//正常播放器图标
		playIcon() {
			return this.playing? 'icon-pause' : 'icon-play'
		},
		//迷你图标
		miniIcon() {
			return this.playing? 'icon-pause-mini' : 'icon-play-mini'
		},
		//播放模式图标
		iconMode() {
			return this.mode === playMode.sequence? 'icon-sequence' : this.mode === playMode.loop? 'icon-loop': 'icon-random'
		},
		cdCls() {
			return this.playing? 'play' : 'play pause'
		},
		disableCls() {
			return this.songReady? '' : 'disable'
		},
		//歌曲播放进度
		percent() {
			return this.currentTime / this.currentSong.duration
		}
	},
	watch: {
		//当前歌曲
		currentSong(newSong, oldSong) {

			// console.log('watch');
			// console.log(newSong);
			// console.log(oldSong);

			if (newSong.id === oldSong.id) {
				return
			}

			//清除当前的歌词
			if (this.currentLyric) {
				this.currentLyric.stop();
			}

			this.$nextTick(() => {
				this.$refs.audio.play();
				this.setPlayingState(true);

				//获取歌词
				this.getLyric()
			})
		},
		//播放状态
		playing(newPlaying) {
			const audio = this.$refs.audio;
			this.$nextTick(() => {
				newPlaying? audio.play() : audio.pause()
			})
		}
	},
	created(){
		//关联专辑,歌词滑动的内容
		this.touch = {}
	},
	methods: {
		//引入vuex方法
		...mapMutations({
			setFullScreen: 'SET_FULL_SCREEN',
			setPlayingState: 'SET_PLAYING_STATE',
			setCurrentIndex: 'SET_CURRENT_INDEX',
			setPlayMode: 'SET_PLAY_MODE',
			setPlaylist: 'SET_PLAYLIST'
		}),

		//左上角返回
		back() {
			this.setFullScreen(false);
		},
		//mini播放器点击事件
		open() {
			this.setFullScreen(true);
		},

		//播放暂停歌曲
		togglePlaying() {

			if (!this.songReady) {
				return
			}
			this.setPlayingState(!this.playing);

			//歌词一同暂停或播放
			if (this.currentLyric) {
				this.currentLyric.togglePlay();
			}
		},
		//上一首
		prev() {

			if (!this.songReady) {
				return
			}

			//当当前歌单只有一首歌时
			if (this.playlist.length == 1) {
				this.loop();
			}
			else {
				let index = this.currentIndex - 1;

				//判断第一首时
				if (index === -1) {
					index = this.playlist.length - 1;
				}
				//修改当前index
				this.setCurrentIndex(index);
				//判断是否为暂停
				if (!this.playing) {
					this.togglePlaying();
				}
			}

			// this.songReady = false;
		},
		//下一首
		next() {

			if (!this.songReady) {
				return
			}

			//当当前歌单只有一首歌时
			if (this.playlist.length == 1) {
				this.loop();
			}
			else {
				let index = this.currentIndex + 1;

				//判断最后一首时
				if (index === this.playlist.length) {
					index = 0;
				}
				//修改当前index
				this.setCurrentIndex(index);
				//判断是否为暂停
				if (!this.playing) {
					this.togglePlaying();
				}
			}
			// this.songReady = false;
		},
		//audio 歌曲准备完毕回调
		ready(e) {
			console.log('----ready');
			console.log(e);

			this.songReady = true;
		},
		//audio 歌曲准备失败
		error() {
			this.songReady = true;

		},
		//audio 歌曲播放时间情况
		updateTime(e) {
			// console.log('---audio update');
			// console.log(e);

			this.currentTime = e.target.currentTime;
		},
		//audio 歌曲播放完毕
		end() {
			console.log('--end');
			console.log(this.mode);
			//判断模式
			if (this.mode === playMode.loop) {
				//单曲循环
				this.loop();
			}
			else {
				this.next();
			}
		},
		//audio 歌曲循环播放
		loop() {
			//重置歌曲
			this.$refs.audio.currentTime = 0;

			//重置歌词
			if (this.currentLyric) {
				this.currentLyric.seek(0);
			}

			this.setPlayingState(false);
			setTimeout(() => {
				this.togglePlaying();
			})
		},
		//滚动条被滚动时
		onProgressBarMove(percent) {

			const currentTime = this.currentSong.duration * percent;
			//改变当前播放时间
			this.$refs.audio.currentTime = currentTime;
		},
		//滚动条被改变后
		onProgressBarChange(percent) {


			const currentTime = this.currentSong.duration * percent;
			//改变当前播放时间
			this.$refs.audio.currentTime = currentTime;
			//判断是否为暂停
			if (!this.playing) {
				this.togglePlaying();
			}

			//改变歌词当前位置
			if (this.currentLyric) {
				this.currentLyric.seek(currentTime * 1000);
			}
		},

		//切换播放模式
		changeMode() {
			const mode = (this.mode + 1) % 3;
			this.setPlayMode(mode);

			let list = null;
			if (mode === playMode.random) {
				list = shuffle(this.sequenceList);
			}
			else {
				list = this.sequenceList;
			}

			//更改当前的索引值
			this.resetCurrentIndex(list);
			//更新播放列表
			this.setPlaylist(list);
		},
		//重新设置当前播放的索引,在当前播放列表的位置
		resetCurrentIndex(list) {
			//返回当前歌曲的index
			let index = list.findIndex((item) => {
				return item.id === this.currentSong.id
			})

			this.setCurrentIndex(index);
		},
		//获取歌词
		getLyric() {
				this.currentSong.getLyric()
				.then((lyric) => {
					this.currentLyric = new Lyric(lyric, this.handleLyric);

					//如果歌词正在播放,调用库的播放方法
					if (this.playing) {
						this.currentLyric.play();
					}

					// console.log('---解析歌词');
					// console.log(this.currentLyric);
				})
				.catch(() => {
					//当获取不到歌词时
					this.currentLyric = null;
					this.playingLyric = '';
					this.currentLineNum = 0;
				})
		},
		//歌词回调函数(每次执行歌词时,触发)
		handleLyric({ lineNum, txt }) {
			this.currentLineNum = lineNum;

			//调整scroll区域
			if (lineNum > 5) {
				//返回歌词p标签的数组
				let lineEl = this.$refs.lyricLine[lineNum - 5];
				this.$refs.lyricList.scrollToElement(lineEl, 1000);
			}
			else {
				this.$refs.lyricList.scrollTo(0, 0, 1000);
			}

			//显示当前歌词
			this.playingLyric = txt;
		},

		//歌词专辑滑动方法
		middleTouchStart(e) {
			this.touch.initiated = true;

			//记录坐标
			const touch = e.touches[0];
			this.touch.startX = touch.pageX;
			this.touch.startY = touch.pageY;
		},
		middleTouchMove(e) {
			if (!this.touch.initiated) {
				return
			}

			//记录位置
			const touch = e.touches[0];
			const deltaX = touch.pageX - this.touch.startX;
			const deltaY = touch.pageY - this.touch.startY;

			//纵轴方向上 滚动的距离大于横轴方向的滚动
			if (Math.abs(deltaY) > Math.abs(deltaX)) {
				return
			}

			//记录参考点位置(右侧位置)
			const right = this.currentShow === 'cd'? 0: -window.innerWidth;
			const width = Math.min(0, Math.max(-window.innerWidth, right + deltaX));
			//滑动的比例
			this.touch.percent = Math.abs(width / window.innerWidth);

			this.$refs.lyricList.$el.style[transform] = `translate3d(${width}px, 0, 0)`;
			this.$refs.lyricList.$el.style[transitionDuration] = 0;
			this.$refs.middleL.style.opacity = 1 - this.touch.percent;

		},
		middleTouchEnd() {
			let width;
			let opacity;
			//从右向左滑
			if (this.currentShow === 'cd') {
				//计算偏移量
				if (this.touch.percent > 0.1) {
					width = -window.innerWidth;
					this.currentShow = 'lyric';
					opacity = 0;
				}
				else {
					width = 0;
					opacity = 1;
				}
			}
			else {
				if (this.touch.percent < 0.9) {
					width = 0;
					this.currentShow = 'cd';
					opacity = 1;
				}
				else {
					width = -window.innerWidth;
					opacity = 0;
				}
			}

			const time = 300;
			this.$refs.lyricList.$el.style[transform] = `translate3d(${width}px, 0, 0)`;
			this.$refs.lyricList.$el.style[transitionDuration] = `${time}ms`;
			this.$refs.middleL.style.opacity = opacity;
			this.$refs.middleL.style[transitionDuration] = `${time}ms`;

		},
		

		//动画函数
		enter(el, done) {
			// el 执行的dom/ done 执行回调
			const { x, y, scale } = this._getPosAndScale();

			let animation = {
				0: {
					transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`
				},
				60: {
					transform: `translate3d(0, 0, 0) scale(1.2)`
				},
				100: {
					transform: `translate3d(0, 0, 0) scale(1)`
				}
			}

			animations.registerAnimation({
				name: 'move',
				animation,
				presets: {
					duration: 400,
					easing: 'linear'
				}
			})

			animations.runAnimation(this.$refs.cdWrapper, 'move', done);
		},
		afterEnter() {
			animations.unregisterAnimation('move');
			this.$refs.cdWrapper.style.animation = '';
		},
		leave(el, done) {
			this.$refs.cdWrapper.style.transition = 'all .4s';

			const { x, y, scale } = this._getPosAndScale();
			this.$refs.cdWrapper.style[transform] = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;

			this.$refs.cdWrapper.addEventListener('transitionend', done);
		},
		afterLeave() {
			this.$refs.cdWrapper.style.transition = '';
			this.$refs.cdWrapper.style[transform] = '';
		},
		//获取图片的位置
		_getPosAndScale() {
			//mini播放器图片的宽度和圆心间距
			const targetWidth = 40;
			const paddingLeft = 40;
			const paddingBottom = 30;

			//正常播放器图片的宽度和顶部间距
			const paddingTop = 80;
			const width = window.innerWidth * 0.8;

			//初始的缩放比例(大图和小图)
			const scale = targetWidth / width;

			//大图圆心与小图圆心的距离(从大图到小图的方向)
			const x = -(window.innerWidth / 2 - paddingLeft);
			const y = window.innerHeight - paddingTop - width / 2 - paddingBottom;
			return {
				x,
				y,
				scale
			}
		},
		//更新歌曲时间
		format(interval) {
			//向下取整
			interval = interval | 0;

			const minute = interval / 60 | 0;
			const second = this._pad(interval % 60);

			return `${minute}:${second}`
		},
		//补零函数
		_pad(num, n = 2) {
			let len = num.toString().length;

			while (len < n) {
				num = '0' + num;
				len++;
			}

			return num;
		}
	}
}
</script>

<style lang="less" scoped>
	//引入mixin方法
	@import '~common/css/variable.less';
	@import '~common/css/mixin.less';

	.player {
    .normal-player {
      position: fixed;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      z-index: 150;
      background: @color-background;
      .background {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        z-index: -1;
        opacity: 0.6;
        filter: blur(20px);
      }
      .top {
        position: relative;
        margin-bottom: 25px;
        .back {
          position: absolute;
          top: 0;
          left: 6px;
          z-index: 50;
          .icon-back {
            display: block;
            padding: 9px;
            font-size: @font-size-large-x;
            color: @color-theme;
            transform: rotate(-90deg);
          }
        }
        .title {
          width: 70%;
          margin: 0 auto;
          line-height: 40px;
          text-align: center;
          font-size: @font-size-large;
          color: @color-text;
          .no-wrap();
        }
        .subtitle {
          line-height: 20px;
          text-align: center;
          font-size: @font-size-medium;
          color: @color-text;
        }
      }
      .middle {
        position: fixed;
        width: 100%;
        top: 80px;
        bottom: 170px;
        white-space: nowrap;
        font-size: 0;
        .middle-l {
          display: inline-block;
          vertical-align: top;
          position: relative;
          width: 100%;
          height: 0;
          padding-top: 80%;
          .cd-wrapper {
            position: absolute;
            left: 10%;
            top: 0;
            width: 80%;
            height: 100%;
            .cd {
              width: 100%;
              height: 100%;
              box-sizing: border-box;
              border: 10px solid rgba(255, 255, 255, 0.1);
              border-radius: 50%;
              &.play {
                animation: rotate 20s linear infinite
              }
              &.pause {
                animation-play-state: paused
              }
              .image {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                border-radius: 50%;
              }
            }
          }

          .playing-lyric-wrapper {
            width: 80%;
            margin: 30px auto 0 auto;
            overflow: hidden;
            text-align: center;
            .playing-lyric {
              height: 20px;
              line-height: 20px;
              font-size: @font-size-medium;
              color: @color-text-l;
            }
          }
        }
        .middle-r {
          display: inline-block;
          vertical-align: top;
          width: 100%;
          height: 100%;
          overflow: hidden;
          .lyric-wrapper {
            width: 80%;
            margin: 0 auto;
            overflow: hidden;
            text-align: center;
            .text {
              line-height: 32px;
              color: @color-text-l;
              font-size: @font-size-medium;
              &.current {
                color: @color-text;
              }
            }
          }
        }
      }

      .bottom {
        position: absolute;
        bottom: 50px;
        width: 100%;
        .dot-wrapper {
          text-align: center;
          font-size: 0;
          .dot {
            display: inline-block;
            vertical-align: middle;
            margin: 0 4px;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: @color-text-l;
            &.active {
              width: 20px;
              border-radius: 5px;
              background: @color-text-ll;
            }
          }
        }
        .progress-wrapper {
          display: flex;
          align-items: center;
          width: 80%;
          margin: 0px auto;
          padding: 10px 0;
          .time {
            color: @color-text;
            font-size: @font-size-small;
            flex: 0 0 30px;
            line-height: 30px;
            width: 30px;
            &.time-l {
              text-align: left
            }
            &.time-r {
              text-align: right
            }
          }
          .progress-bar-wrapper {
            flex: 1
          }
        }
        .operators {
          display: flex;
          align-items: center;
          .icon {
            flex: 1;
            color: @color-theme;
            &.disable {
              color: @color-theme-d;
            }
            i {
              font-size: 30px;
            }
          }
          .i-left {
            text-align: right;
          }
          .i-center {
            padding: 0 20px;
            text-align: center;
            i {
              font-size: 40px;
            }
          }
          .i-right {
            text-align: left;
          }
          .icon-favorite {
            color: @color-sub-theme;
          }
        }
      }
      &.normal-enter-active, 
      &.normal-leave-active {
        transition: all 0.4s;
        .top, 
        .bottom {
          transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32);
        }
      }
      &.normal-enter, &.normal-leave-to {
        opacity: 0;
        .top {
          transform: translate3d(0, -100px, 0);
        }
        .bottom {
          transform: translate3d(0, 100px, 0)
        }
      }
    	
    }
		
    .mini-player {
      display: flex;
      align-items: center;
      position: fixed;
      left: 0;
      bottom: 0;
      z-index: 180;
      width: 100%;
      height: 60px;
      background: @color-highlight-background;
      &.mini-enter-active, 
      &.mini-leave-active {
        transition: all 0.4s
      }
      &.mini-enter, 
      &.mini-leave-to {
        opacity: 0
      }
      .icon {
        flex: 0 0 40px;
        width: 40px;
        padding: 0 10px 0 20px;
        img {
          border-radius: 50%;
          &.play {
            animation: rotate 10s linear infinite;
          }
          &.pause {
            animation-play-state: paused;
          }
        }
      }
      .text {
        display: flex;
        flex-direction: column;
        justify-content: center;
        flex: 1;
        line-height: 20px;
        overflow: hidden;
        .name {
          margin-bottom: 2px;
          .no-wrap();
          font-size: @font-size-medium;
          color: @color-text;
        }
        .desc {
          .no-wrap();
          font-size: @font-size-small;
          color: @color-text-d;
        }
      }
      .control {
        flex: 0 0 30px;
        width: 30px;
        padding: 0 10px;
        .icon-play-mini, 
        .icon-pause-mini, 
        .icon-playlist {
          font-size: 30px;
          color: @color-theme-d;
        }
        .icon-mini {
          font-size: 32px;
          position: absolute;
          left: 0;
          top: 0;
        }
      }
    }
	}

  @keyframes rotate {
    0% {
      transform: rotate(0);
    }
    100% {
      transform: rotate(360deg);
    }
  }

</style>
