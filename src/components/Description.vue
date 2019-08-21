<template>
  <div class="desc-wrapper">
    <p>说明：{{data.content}}</p>
    <a :href="data.link" target="blank">示例代码</a>
  </div>
</template>

<script>
export default {
  name: "Description",
  props: {
    data: {
        type:Object,
        default:()=>({
            content:"",
            link:""
        })
    }
  },
  data() {
    return {};
  }
};
</script>

<style lang="less" scoped>
.desc-wrapper{
  position: absolute;
  bottom: 0;
  right: 0;
  padding: 8px 18px;
  width: 200px;
  z-index: 9999;
  background-color: rgba(255,255,255,.5);
  p{
    font-size: 12px;
    color: #000;
  }
}
</style>