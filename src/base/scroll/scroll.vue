<template>
	<div ref="wrapper">
		<slot></slot>
	</div>
</template>

<script>
//https://ustbhuangyi.github.io/better-scroll/doc/zh-hans/#better-scroll%20%E6%98%AF%E4%BB%80%E4%B9%88
import BScroll from 'better-scroll'

export default {
	components: {

	},
	data(){
		return {

		}
	},
	props: {
		//监听滚动位置
		probeType: {
			type: Number,
			default: 1
		},
		//是否派发点击事件
		click: {
			type: Boolean,
			default: true
		},
		//数据
		data: {
			type: Array,
			default(){
				return []
			}
		},
		//是否监听滚动时间
		listenScroll: {
			type: Boolean,
			defalut: false
		}
		
	},
	created(){

	},
	mounted(){
		setTimeout(() => {
			this._initScroll()
		}, 20)
	},
	watch: {
		data: {
			deep: true,
			handler(){
				setTimeout(() => {
					this.refresh();
				}, 20)
			}
		}
	},
	methods: {
		_initScroll(){
			if(!this.$refs.wrapper){
				return;
			}

			this.scroll = new BScroll(this.$refs.wrapper, {
				probeType: this.probeType,
				click: this.click
			})

			if(this.listenScroll){
				let self = this;
				this.scroll.on('scroll', (positon) => {
					self.$emit('scroll', positon)
				})
			}
		},
		enable(){
			if(this.scroll){
				this.scroll.enable();
			}
		},
		disable(){
			if(this.scroll){
				this.scroll.disable();
			}
		},
		refresh(){
			if(this.scroll){
				this.scroll.refresh();
			}
		},
		//滚动到具体位置
		scrollTo(){
			if(this.scroll){
				this.scroll.scrollTo.apply(this.scroll, arguments);
			}
		},
		scrollToElement(){
			if(this.scroll){
				this.scroll.scrollToElement.apply(this.scroll, arguments)
			}
		}
	}
}
</script>

<style lang="less" scoped>
	//引入mixin方法
	@import '~common/css/variable.less';
	@import '~common/css/mixin.less';



</style>
