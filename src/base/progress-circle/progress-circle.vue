<template>
  <!-- 进度条进度圆圈效果 -->
  <div class="progress-circle">
    <svg 
      :width="radius" 
      :height="radius" 
      viewBox="0 0 100 100" 
      version="1.1" 
      xmlns="http://www.w3.org/2000/svg">
      <circle 
        class="progress-background" 
        r="50" 
        cx="50" 
        cy="50" 
        fill="transparent"/>
      <circle 
        class="progress-bar" 
        r="50" 
        cx="50" 
        cy="50" 
        fill="transparent" 
        :stroke-dasharray="dashArray"
        :stroke-dashoffset="dashOffset"/>
        <!-- dasharray周长 dashoffset偏移量 -->
    </svg>
    <slot></slot>
  </div>
</template>

<script type="text/ecmascript-6">
  export default {
    props: {
      //渲染进度条圆的半径
      radius: {
        type: Number,
        default: 100
      },
      //歌曲播放进度
      percent: {
        type: Number,
        default: 0
      }
    },
    data() {
      return {
        dashArray: Math.PI * 100
      }
    },
    computed: {
      // 计算偏移量
      dashOffset() {
        return (1 - this.percent) * this.dashArray
      }
    }
  }
</script>

<style lang="less" scoped>
  //引入mixin方法
  @import '~common/css/variable.less';

  .progress-circle {
    position: relative;
    circle {
      stroke-width: 8px;
      transform-origin: center;
      &.progress-background {
        transform: scale(0.9);
        stroke: @color-theme-d;
      }
      &.progress-bar {
        transform: scale(0.9) rotate(-90deg);
        stroke: @color-theme;
      }
    }
  }
</style>