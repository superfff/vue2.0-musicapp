<template>
	<div id="app">
		<m-header></m-header>
		<tab></tab>
		<keep-alive>
			<router-view></router-view>
		</keep-alive>
		<player></player>

	</div>
</template>

<script>

import mHeader from 'components/m-header/m-header';
import tab from 'components/tab/tab';
import player from 'components/player/player';

export default {
	components: {
		mHeader,
		tab,
		player
	}
}
</script>

<style lang="less">
  /*引入全局样式*/
  // @import 'assets/less/common.less';
</style>
