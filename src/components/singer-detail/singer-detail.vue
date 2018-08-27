<template>
	<div class="singer-detail"></div>
</template>

<script>
import { mapGetters } from 'vuex';
import { getSingerDetail } from 'api/singer';
import { ERR_OK } from 'api/config';

export default {
	components: {

	},
	data(){
		return {

		}
	},
	computed: {
		...mapGetters([
			'singer'
		])
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
					console.log(res);
				}
			})
		}
	}
}
</script>

<style lang="less" scoped>
	//引入mixin方法
	@import '~common/css/variable.less';
	// @import '~common/css/mixin.less';

	.singer-detail{
		position: fixed;
		z-index: 100;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: @color-background;
	}



</style>
