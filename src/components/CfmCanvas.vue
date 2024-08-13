<script setup lang='ts'>
  import {ref, onMounted} from 'vue'
 
  interface Props {
    width?:number;
    height?:number;
  }

  const props = withDefaults(defineProps<Props>(), {
    width:400,
    height:300
  })
  const canvas = ref(null)

  onMounted(() => {
    console.log(canvas.value)
  })
</script>

<template>
  <canvas :width="props.width" :height="props.height" ref="canvas" />
</template>
