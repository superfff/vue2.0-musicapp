<template>
	<div class="m-header">
		<div class="icon"></div>
		<div class="text">Chicken Music</div>
	</div>
</template>

<script>


export default {
	components: {

	},
	data(){
		return {

		}
	},
	created(){

	},
	methods: {

	}
}
</script>

<style lang="less" scoped>
	//引入mixin方法
	@import '~common/css/variable.less';
	@import '~common/css/mixin.less';

	.m-header{
		position: relative;
		width: 100%;
		height: 44px;
		text-align: center;
		color: @color-theme;
		font-size: 0;

		.icon{
			#display-type > .inline-block-top;

			width: 30px;
			height: 32px;
			margin-top: 6px;
			margin-right: 9px;

			.bg-image('m-header/logo');
			background-size: 30px 32px;
		}

		.text{
			#display-type > .inline-block-top;
			
			line-height: 44px;
			font-size: @font-size-large;
		}
		
	}

</style>
