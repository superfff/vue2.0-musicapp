<template>
	<scroll class="listview" :data="data" ref="listview" :probeType="3" listenScroll @scroll="scroll">
		<ul>
			<li class="list-group" v-for="group in data" ref="listGroup">
				<h2 class="list-group-title">{{group.title}}</h2>
				<ul>
					<li class="list-group-item" v-for="item in group.items" @click="selectItem(item)">
						<img v-lazy="item.avatar" class="avatar">
						<span class="name">{{item.name}}</span>
					</li>
				</ul>
			</li>
		</ul>
		<div class="list-shortcut" @touchstart="onShortcutTouchStart" @touchmove.stop.prevent="onShortcutTouchMove">
			<ul>
				<li 
					class="item" 
					:class="{'current': currentIndex == index}"
					v-for="(item, index) in shortcutList" 
					:data-index="index">{{item}}</li>
			</ul>
		</div>
		<div class="list-fixed" v-if="fixedTitle" ref="fixed">
			<h1 class="fixed-title">{{fixedTitle}}</h1>
		</div>

		<div v-if="!data.length" class="loading-container">
			<loading></loading>
		</div>
	</scroll>
</template>

<script>

import scroll from 'base/scroll/scroll';
import loading from 'base/loading/loading';
import { getData } from 'common/js/dom';

//右侧锚点高度
const ANCHOR_HEIGHT = 18;
//每块title的高度
const TITLE_HEIGHT = 30;

export default {
	created() {
		//定义变量(因为不需要被watch get和set 所以直接在此处设置变量)
		this.touch = {}
	},
	components: {
		scroll,
		loading
	},
	data() {
		return {
			//当前滚动位置
			scrollY: -1,
			//落入区间
			currentIndex: 0,
			//左侧每块内容的高度
			listHeight: [],
			//滚动时, 每块内容的下限高度与顶的距离
			diff: -1,
			fixedTop: 0
		}
	},
	props: {
		data: {
			type: Array,
			default(){
				return []
			}
		}
	},
	computed: {
		//快速入口
		shortcutList() {
			return this.data.map((group) => {
				return group.title.substr(0, 1)
			})
		},
		//固定标题
		fixedTitle() {
			if(this.scrollY > 0){
				return ''
			}

			return this.data[this.currentIndex]? this.data[this.currentIndex].title: ''
		}
	},
	watch: {
		data() {
			setTimeout(() => {
				this._calculateHeight();
			}, 20)
		},
		//判断当前滚动位置(获取对应落入哪个区间)
		scrollY(newY) {
			const listHeight = this.listHeight;

			//当滚到顶部 newY > 0
			if(newY > 0) {
				this.currentIndex = 0;
				return;
			}
			//在中间部分滚动
			for(let i=0; i<listHeight.length - 1; i++){
				//获取当前上限值和下限值
				let height1 = listHeight[i];
				let height2 = listHeight[i+1];

				if(-newY >= height1 && -newY < height2){
					this.currentIndex = i;
					this.diff = height2 - (-newY)
					return;
				}
			}
			//当滚动到底部且 -newY大于最后一个元素的上限
			this.currentIndex = this.listHeight - 2;
		},
		//判断是否滚动到遮挡title的位置
		diff(value) {
			let fixedTop = (value>0 && value<TITLE_HEIGHT)? value-TITLE_HEIGHT: 0;

			if(this.fixedTop == fixedTop){
				return;
			}

			this.fixedTop = fixedTop;
			this.$refs.fixed.style.transform = `translate3d(0, ${fixedTop}px, 0)`;
		}
	},
	methods: {
		onShortcutTouchStart(event) {
			//获取当前事件 索引值
			let anchorIndex = getData(event.target, 'index');
			//获取点击时的位移量
			let firstTouch = event.touches[0];
			//记录数据
			this.touch.y1 = firstTouch.pageY;
			this.touch.anchorIndex = anchorIndex;

			this._scrollTo(anchorIndex);
			
		},
		onShortcutTouchMove(event) {
			//获取move时的位移量
			let firstTouch = event.touches[0];
			this.touch.y2 = firstTouch.pageY;

			//偏移量 (数值 | 0 表示向下取整)
			let delta = (this.touch.y2 - this.touch.y1) / ANCHOR_HEIGHT | 0;
			//偏移至具体的锚点
			let anchorIndex = Number(this.touch.anchorIndex) + delta

			this._scrollTo(anchorIndex);
		},
		//监听 scroll滚动
		scroll(pos) {
			this.scrollY = pos.y;
		},
		refresh() {
			this.$refs.listview.refresh();
		},
		selectItem(item) {
			this.$emit('select', item);
		},

		//滚动
		_scrollTo(index) {
			if(!index && index !== 0){
				return;
			}

			//避免touchmove超出
			if(index < 0){
				index = 0;
			}
			else if(index > this.listHeight.length - 2){
				/*
					一共data 有23个值. 索引就-1了
					手动增加了顶部0的初始值.
					固需要 -2

				 */
				index = this.listHeight.length - 2
			}
			//手动派发滚动值
			this.scrollY = -this.listHeight[index];
			this.$refs.listview.scrollToElement(this.$refs.listGroup[index], 0);
		},
		//计算左侧每块的高度
		_calculateHeight() {
			this.listHeight = [];
			const list = this.$refs.listGroup;

			let height = 0;
			this.listHeight.push(height);

			//获取每块
			for(let i=0; i<list.length; i++){
				let item = list[i];
				height += item.clientHeight;
				this.listHeight.push(height);
			}
		}
	}
}
</script>

<style lang="less" scoped>
	//引入mixin方法
	@import '~common/css/variable.less';
	@import '~common/css/mixin.less';

	.listview{
		width: 100%;
		height: 100%;
		overflow: hidden;
		position: relative;
		background: @color-background;

		.list-group{
			padding-bottom: 30px;

			&-title{
				height: 30px;
				line-height: 30px;
				padding-left: 20px;
				font-size: @font-size-small;
				color: @color-text-l;
				background: @color-highlight-background;
			}

			&-item{
				display: flex;
				align-items: center;
				padding: 20px 0 0 30px;

				.avatar{
					width: 50px;
					height: 50px;
					border-radius: 50%;
				}

				.name{
					margin-left: 20px;
					color: @color-text-l;
					font-size: @font-size-medium;
				}
			}
		}

		.list-shortcut{
			position: absolute;
			z-index: 30;
			right: 0;
			top: 50%;
			transform: translateY(-50%);
			width: 20px;
			padding: 20px 0;
			border-radius: 10px;
			text-align: center;
			background: @color-background-d;

			.item{
		        padding: 3px;
		        line-height: 1;
		        color: @color-text-l;
		        font-size: @font-size-small;
		        &.current{
		          color: @color-theme;
		        }
			}
		}

		.list-fixed{
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			.fixed-title{
				height: 30px;
				line-height: 30px;
				padding-left: 20px;
				font-size: @font-size-small;
				color: @color-text-l;
				background: @color-highlight-background;
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
