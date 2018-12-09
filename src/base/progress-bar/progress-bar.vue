<template>
	<!-- 进度条 -->
	<div class="progress-bar" ref="progressBar" @click="progressClick">
		<div class="bar-inner" >
			<div class="progress" ref="progress"></div>
			<div 
				class="progress-btn-wrapper" 
				ref="progressBtn"
				@touchstart.prevent="progressTouchStart"
				@touchmove.prevent="progressTouchMove"
				@touchend="progressTouchEnd">
				<div class="progress-btn"></div>
			</div>
		</div>
	</div>
</template>

<script>
import { prefixStyle } from 'common/js/dom';

//进度条按钮宽度
const progressBtnWidth = 16;
const transform = prefixStyle('transform');

export default {
	components: {

	},
	data(){
		return {

		}
	},
	props: {
		//歌曲进度
		percent: {
			type: Number,
			default: 0
		}
	},
	watch: {
		percent(newPercent) {
			//判断是否正在被拖动 以及 歌曲是否正在播放
			if (newPercent >= 0 && !this.touch.initiated) {
				//进度条宽度
				const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth;
				//偏移宽度
				const offsetWidth = newPercent * barWidth;

				this._offset(offsetWidth);
			}
		}
	},
	created(){
		//记录拖动回调的共享数据
		this.touch = {};
	},
	methods: {
		//进度条拖拽事件
		progressTouchStart(e) {
			//初始化
			this.touch.initiated = true;
			//启动时的初始坐标
			this.touch.startX = e.touches[0].pageX;
			//记录当前按钮的偏移位置
			this.touch.left = this.$refs.progress.clientWidth;
		},
		progressTouchMove(e) {
			if (!this.touch.initiated) {
				return
			}

			//进度条宽度
			const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth;

			//偏移量(纵向)
			const deltaX = e.touches[0].pageX - this.touch.startX;
			//计算偏移量
			const offsetWidth = Math.min(barWidth, Math.max(0, this.touch.left + deltaX));

			const percent = this.$refs.progress.clientWidth / barWidth;
			//讲滚动时的时间传递出去
			this.$emit('percentMove', percent);

			this._offset(offsetWidth);
		},
		progressTouchEnd(e) {
			this.touch.initiated = false;

			//改变歌曲播放时长
			this._triggerPercent();
		},
		//进度条点击函数
		progressClick(e) {
			//获取点击偏移值
			//点击到progressBtn的时候, offset值不对
			// this._offset(e.offsetX);
			
			//获取整个bar的位置
			const rect = this.$refs.progressBar.getBoundingClientRect();
			const offsetWidth = e.pageX - rect.left;
			this._offset(offsetWidth);
			this._triggerPercent();
		},
		_triggerPercent() {
			//进度条宽度
			const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth;
			const percent = this.$refs.progress.clientWidth / barWidth;

			//将当前的播放进度派发出去
			this.$emit('percentChange', percent);

		},
		//进度条移动
		_offset(offsetWidth) {
			this.$refs.progress.style.width = `${offsetWidth}px`;
			this.$refs.progressBtn.style[transform] = `translate3d(${offsetWidth}px, 0, 0)`;
		}
	}
}
</script>

<style lang="less" scoped>
	//引入mixin方法
	@import '~common/css/variable.less';

	.progress-bar {
    height: 30px;
    .bar-inner {
      position: relative;
      top: 13px;
      height: 4px;
      background: rgba(0, 0, 0, 0.3);
      .progress {
        position: absolute;
        height: 100%;
        background: @color-theme;
      }
      .progress-btn-wrapper {
        position: absolute;
        left: -8px;
        top: -13px;
        width: 30px;
        height: 30px;
        .progress-btn {
          position: relative;
          top: 7px;
          left: 7px;
          box-sizing: border-box;
          width: 16px;
          height: 16px;
          border: 3px solid @color-text;
          border-radius: 50%;
          background: @color-theme;
        }
      }
    }
	}

</style>
