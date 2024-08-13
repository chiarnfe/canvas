<template>
  <div class="w-full border" style="height:50px"></div>
  <div class="flex flex-row w-full" style="height:calc(100vh - 50px)">
    <div class="column w-1/6 h-full shadow-md">
      <div>
        <q-checkbox label="顯示格線" v-model="grid" />
      </div>
      <q-expansion-item
        group
        icon="dashboard"
        :default-opened="true"
        label="編輯機台"
      >
        <div class="px-2">
          <q-select outlined label="選擇圖形" :options="shapeOptions" :model-value="shape" @update:model-value="selectShape"></q-select>

        </div>
      </q-expansion-item>
      <q-expansion-item
        group
        icon="space_dashboard"
        label="編輯底圖"
      >
        <div class="px-2">test</div>
      </q-expansion-item>
      <q-space/>
      <div class="p-1 flex flex-row">
        <q-btn class="flex-grow" unelevated color="primary" label="確認" @click="predraw" />
      </div>
    </div>
    <div>
      <div class="w-full" style="height:calc(100vh - 60px)" ref="container" id="canvas_container"></div>
    </div>
  </div>
</template>

<script setup lang='ts'>
  import {ref, onMounted, onBeforeUnmount, watch} from 'vue'
  import Konva from 'konva'
  import $ from 'jquery'

  const grid = ref(false)
  const mode = ref<"v"|"i"|"n">("v")
  const container = ref(null)
  const stage = ref(null)

  const current = ref(null)

  const previewLayer = ref(null)
  const iconLayer = ref(null)
  const gridLayer = ref(null)
  
  const shape = ref("Rect")

  const shapeOptions = [
    {label:"矩形", value:"Rect"},
    {label:"圓形", value:"Circle"},
    {label:"楔形", value:"Wedge"}
  ]
  
  const selectShape = (option) => {
    shape.value = option.value
  }

  function position(evt) {
    console.log(evt)
  }

  function mouse(evt) {
    let {top, left} = container.value.getBoundingClientRect();
    const {x,y} = evt
    console.log(x - left,y - top);
  }

  function enter(evt) {
    let {top, left} = container.value.getBoundingClientRect();
    let {x, y} = evt;
    let previewShape = new Konva[shape.value]({
      x:x - left - 50,
      y:y - top - 25,
      width:100,
      height:50,
      fill:'red',
      opacity:0.3
    });
    previewLayer.value.add(previewShape)
    previewLayer.value.draw();
  }

  function move(evt) {
    let children = previewLayer.value.children[0];
    current.value = children;
    current.value.startDrag();
  }

  function stopmove() {
    if(current.value)
     current.value.stopDrag();
    previewLayer.value.removeChildren();
  }

  function click(evt) {
    current.value.startDrag(); 
    let {top, left, width, height} = container.value.getBoundingClientRect();
    let {x, y} = evt; 
    let drawShape = new Konva[shape.value]({
      x:x - left - 50,
      y:y - top - 25,
      width:100,
      height:50,
      fill:"red"
    });
    drawShape.on("dblclick",(event) => {
      if (mode.value == "v") {
        current.value = event.target;

      } 
    })
    drawShape.on("mouseover", (event) => { 
      // TODO 判斷tooltip產生的位置, tooltip anchor起始點為center middle, canvas的正中心
      const 
        cX = event.target.attrs.x + event.target.attrs.width/2, 
        cY = event.target.attrs.y + event.target.attrs.height/2;
      if (mode.value == "v") {
        current.value = event.target;
        event.target.stroke("black");
        event.target.strokeWidth(2);
      }
     // tooltipOffset.value = [cX - width/2 - left, cY - height/2 - top];
     // showTooltip.value = true;
    })
    drawShape.on("mouseleave", (event) => {
      // showTooltip.value = false
      if (mode.value == "v") {
        event.target.stroke();
        event.target.strokeWidth(0); 
      }
    })
    iconLayer.value.add(drawShape);
    iconLayer.value.draw()
  }

  function cancelDraw(evt) {
    if (evt.key == "Escape" || evt.type == "mouseleave") {
      mode.value = "v";
      stopmove();
      container.value.removeEventListener("mouseenter", enter);
      container.value.removeEventListener("mousemove", move);
      container.value.removeEventListener("click", click);
    } 
  }

  function predraw() {
    mode.value = "i";
    previewLayer.value.removeChildren(); 
    let {top, left} = container.value.getBoundingClientRect();
    container.value.addEventListener("mouseenter", enter);
    container.value.addEventListener('mousemove', move);
    container.value.addEventListener("click", click);
    container.value.addEventListener("mouseleave", cancelDraw);
    container.value.addEventListener("keydown", cancelDraw);
   // (evt) => {
   //   stopmove();
   //   container.value.removeEventListener("mouseenter", enter)
   //   container.value.removeEventListener("mousemove", move)
   //   container.value.removeEventListener("click", click)
   // }
   // )
    
   // stage.value.on("mouseenter", (evt) => console.log(evt))
   // stage.value.on("mouseenter", enter)
   // stage.value.on("mousemove", move)
   // stage.value.on("click", click)
   // stage.value.on("mouseleave", ()=>console.log("test"))
   // stage.value.on("mouseout", () => {
   //   stopmove(); 
   //   stage.value.off("mouseenter", enter)
   //   stage.value.off("mousemove", move)
   //   stage.value.off("click", click)
   // })
  }

  function initKonva() {
    let _stage = new Konva.Stage({
      container:"canvas_container",
      width:1080,
      height:713
    })
    // preview圖層
    previewLayer.value = new Konva.Layer({
      x:0,
      y:0,
      draggable:false
    });
    // icon圖層
    iconLayer.value = new Konva.Layer({
      x:0,
      y:0,
      draggable:false,
    });
    // 格線圖層
    gridLayer.value = new Konva.Layer({
      x:0,
      y:0,
      draggable:false
    })

    _stage.add(previewLayer.value)    
    _stage.add(iconLayer.value)
    _stage.add(gridLayer.value)
    
    return _stage
  }

  watch(grid, (grid, oldgrid) => {
    if (grid) {
      const xSize = stage.value.size(), ySize = stage.value.size();
      const xSteps = Math.round(xSize/20), ySteps = Math.round(ySize/20);
      for (let i=0;i<=xSteps;i++) {
        gridLayer.value.add(
          new Konva.Line({
            x:0 + i*20,
            y:0,
            points:[0,0,0,ySize],
            stroke:"rgba(0,0,0,0.2)",
            strokeWidth:1
          })
        )
      }

      for (let i=0;i<=ySteps;i++) {
        gridLayer.value.add(
          new Konva.Line({
            x:0,
            y:20*i,
            points:[0,0,xSize,0],
            stroke:"rgb(0,0,0,0.2)",
            stokeWidth:1
          })
        )
      }
      gridLayer.value.batchDraw();
    } else {
      gridLayer.value.clear();
      gridLayer.value.destroyChildren();
      gridLayer.value.clipWidth(null);
    }
  })

  onMounted(() => {
    stage.value = initKonva()
    window.addEventListener("keydown", cancelDraw);
  })

  onBeforeUnmount(() => {
    window.removeEventListener("keydown", cancelDraw);
  })
</script>
