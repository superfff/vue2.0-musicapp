<template>
	<div class="slider" ref="slider">
		<div class="slider-group" ref="sliderGroup">
			<slot></slot>
		</div>
		<div class="dots">
			<span class="dot" :class="{'active' : currentPageIndex == index}" v-for="(item, index) in dots"></span>
		</div>
	</div>
</template>

<script>

import BScroll from 'better-scroll';
import { addClass } from 'common/js/dom';

export default {
	components: {

	},
	data(){
		return {
			dots: [],
			currentPageIndex: 0
		}
	},
	created(){

	},
	mounted(){
		setTimeout(() => {
			this._setSliderWidth();
			this._initDots();
			this._initSlider();

			if(this.autoPlay){
				this._play();
			}
		}, 20)
	},
	props: {
		//循环轮播
		loop: {
			type: Boolean,
			default: true
		},
		//自动轮播
		autoPlay: {
			type: Boolean,
			default: true
		},
		//间隔
		interval: {
			type: Number,
			default: 2500
		}
	},
	methods: {
		_setSliderWidth() {
			this.children = this.$refs.sliderGroup.children;

			// console.log(this.children.length);
			let width = 0;
			let sliderWidth = this.$refs.slider.clientWidth;
			for(let i=0; i<this.children.length; i++){
				let child = this.children[i];
				addClass(child, 'slider-item');

				child.style.width = `${sliderWidth}px`;
				width += sliderWidth;
			}

			if(this.loop){
				width += 2 * sliderWidth;
			}

			this.$refs.sliderGroup.style.width = `${width}px`;
		},
		_initDots() {
			this.dots = new Array(this.children.length);
		},
		_initSlider() {
			this.slider = new BScroll(this.$refs.slider, {
				scrollX: true,
				scrollY: false,
				momentum: false,
				snap: {
					loop: this.loop,
					threshold: 0.3,
					speed: 400
				},
				click: true
			})

			this.slider.on('scrollEnd', () => {
				this.currentPageIndex = this.slider.getCurrentPage().pageX;
				// console.log(this.currentPageIndex);

				if(this.autoPlay){
					clearTimeout(this.timer);
					this._play();
				}
			})
		},
		_play() {
			this.timer = setTimeout(() => {
				this.slider.next(400);
			}, this.interval)
		}
	},
	destroyed(){
		console.log('destory');
	}
}
</script>

<style lang="less" scoped>
	//引入mixin方法
	@import '~common/css/variable.less';

	.slider {
		min-height: 1px;

		&-group{
			position: relative;
			overflow: hidden;
			white-space: nowrap;

			.slider-item{
				float: left;
				box-sizing: border-box;
				overflow: hidden;
				text-align: center;

				a{
					display: block;
					width: 100%;
					overflow: hidden;
					text-decoration: none;
				}
				img{
					display: block;
					width: 100%;
				}
			}
		}

		.dots{
			position: absolute;
			right: 0;
			left: 0;
			bottom: 12px;
			text-align: center;
			font-size: 0;

			.dot{
				display: inline-block;
		        margin: 0 4px;
		        width: 8px;
		        height: 8px;
		        border-radius: 50%;
		        background: @color-text-l;

		        &.active{
		        	width: 20px;
		        	border-radius: 5px;
		        	background: @color-text-ll;
		        }
			}

		}
	}


</style>
