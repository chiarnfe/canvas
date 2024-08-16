<template>
  <div class="w-full border" style="height:50px"></div>
  <div class="flex flex-row w-full" style="height:calc(100vh - 50px)">
    <div class="column w-1/6 h-full shadow-md">
      <q-expansion-item
        group
        icon="aspect_ratio"
        label="版面調整"
        @show="show"
        @hide="hide"
        :default-opened="true"
      >
        <div class="flex flex-col gap-y-2 p-2">
          <div class="flex flex-row gap-x-2">
            <q-select
              class="w-[calc(66%_-_8px)]"
              outlined
              label="廠區"
              option-label="label"
              option-value="value"
              v-model="sLocation"
              :options="location"
              emit-value
              map-options
            />
            <q-select
              outlined
              class="w-1/3"
              label="樓層"
              option-label="label"
              option-value="value"
              v-model="sFloor"
              :options="floor"
              emit-value
              map-options
            />
          </div>
          <q-input
            outlined
            label="版面寬度"
            type="number"
            v-model.number="width"
            debounce="600"
            max="2400"
            :rules="[val => val <= 2400 || '最大寬度為2400']"
          />
          <q-input
            outlined
            label="版面高度"
            type="number"
            v-model.number="height"
            debounce="600"
            max="2400"
            :rules="[val => val <= 2400 || '最大高度為2400']"
          />
          <q-select
            outlined
            label="預覽視窗"
            option-label="label"
            option-value="value"
            v-model="position"
            :options="positionOptions"
            emit-value
            map-options
          />
        </div>
      </q-expansion-item>
      <q-separator class="q-ml-sm q-mr-md" />
      <q-expansion-item
        group
        icon="dashboard"
        label="編輯機台"
      >
        <div class="flex flex-col p-2 gap-y-2">
          <q-select
            outlined
            v-model="shape"
            label="選擇圖形"
            :options="shapeOptions"
            option-label="label"
            option-value="value"
            emit-value
            map-options
          ></q-select>
          <div v-if="shape=='Rect'">
            <q-input v-model="shapeProperty.width" label="寬度" />
            <q-input v-model="shapeProperty.height" label="高度" />
          </div>
          <div class="flex flex-row gap-x-2">
            <q-btn class="w-full" unelevated color="secondary" label="刪除" />
            <q-btn class="w-full" unelevated color="primary" label="確認" @click="predraw" />
          </div>     
        </div>
        
      </q-expansion-item>
      <q-separator class="q-ml-sm q-mr-md" />
      <q-expansion-item
        group
        icon="space_dashboard"
        label="編輯底圖"
      >
      </q-expansion-item>
    </div>
    <div class="px-4 pb-4 w-5/6 relative">
      <div class="row gap-x-2 q-py-sm items-center">
        <span>{{sLocation}} / {{sFloor}}</span>
        <q-checkbox label="顯示格線" v-model="grid" />
        <q-space />
        <q-btn size="md" class="q-px-sm" icon="zoom_in" @click="zoomIn" outline />
        <q-btn size="md" class="q-px-sm" icon="zoom_out" @click="zoomOut" outline />
      </div>

      <q-scroll-area style="height:calc(100vh - 122px);box-shadow:inset 1px 0 0 #000,inset 0 1px 0 #000,inset -1px 0 0 #000,inset 0 -1px 0 #000">
        <div class="w-full" ref="container" id="canvas_container"></div>
      </q-scroll-area>
      <div v-show="showPreview" :class="[position, 'absolute']" id="preview_container"></div>
    </div>
  </div>
</template>

<script setup lang='ts'>
  import {ref, reactive, onMounted, onBeforeUnmount, watch, computed} from 'vue'
  import Konva from 'konva'
  import $ from "jquery"
  const showPreview = ref(true);
  const positionOptions = [
    {label:"右上", value:"top-16 right-6"},
    {label:"左上", value:"top-16 left-6"},
    {label:"右下", value:"bottom-6 right-6"},
    {label:"左下", value:"bottom-6 left-6"}
  ];

  const position = ref("top-16 right-6")

  const width = ref(1000);
  const height = ref(800);
  const location = ["科技", "創新", "力行"].map(l => ({label:l, value:l}));
  const sLocation = ref("科技")
  const floor = reactive(computed(() => {
    let _floor = [];
    switch (sLocation.value) {
      case "科技":
        _floor = ["1F", "2F", "3F", "7F"];
        break;
      case "創新":
        _floor = ["2F", "3F", "4F"];
        break;
      case "力行":
        _floor = ["3F"];
        break;
      default:
        _floor = ["1F", "2F", "3F", "7F"]; 
        break;
    }
    return _floor.map(l => ({label:l , value:l}))
  }));

  const sFloor = ref("1F");

  watch(floor, (nValue, oValue) => {
    sFloor.value = nValue[0].value;
  })

  watch([width, height], () => {
    updateStageSize();
  })

  const grid = ref(true);
  const mode = ref<"v"|"i"|"n">("v");
  const container = ref(null);

  let previewStage = reactive({});

  let stage = reactive({});

  let current = reactive({});

  const drop = ref(null);
  const undo = ref(null);

  let previewLayer = reactive({});
  let iconLayer = reactive({});
  let gridLayer = reactive({});
  
  const shape = ref("Rect")
  const shapeOptions = [
    {label:"矩形", value:"Rect"},
    {label:"圓形", value:"Circle"},
    {label:"楔形", value:"Wedge"}
  ];  

  const scale = 0.25;
  const GUIDELINE_OFFSET = 5;
  
  const shapeProperty = reactive(computed(() => {
    let options = {};
    switch (shape.value) {
      case "Rect":{
        options = {
          width:100,
          height:50,
          fill:"red",
          opacity:1
        }
        break;
      }
      case "Circle":{
        options = {
          radius:40,
          fill:"blue",
          opacity:0.5
        }
        break;
      }
      default:
        break;
    }
    return options
  }))

  // utils
  const show = () => {
    showPreview.value = true;
  }

  const hide = () => {
    showPreview.value = false;
  }

  function getGuidelineStops(skipItem) {
    const vertical = [0, stage.width()/2, stage.width()];
    const horizontal = [0, stage.height()/2, stage.height()];
    stage.find(".object").forEach((guideItem) => {
      if (guideItem === skipItem)
        return
        
      const item = guideItem.getClientRect();
      vertical.push([item.x, item.x + item.width/2, item.x + item.width ]);
      horizontal.push([item.y,  item.y + item.width/2, item.y + item.width]);
    })

    return {
      vertical:vertical.flat(),
      horizontal:horizontal.flat()
    }
  }

  function getObjectSnappingEdges(node) {
    const item = node.getClientRect();
    const absPos = node.absolutePosition();

    return {
      vertical:[
        {
          guide:Math.round(item.x),
          offset:Math.round(absPos.x - item.x),
          snap:'start'
        },
        {
          guide:Math.round(item.x + item.width/2),
          offset:Math.round(absPos.x - item.x - item.width/2),
          snap:"center"
        },
        {
          guide:Math.round(item.x + item.width),
          offset:Math.round(absPos.x - item.x - item.width),
          snap:'end'
        },
      ] ,
      horizontal:[
        {
          guide:Math.round(item.y),
          offset:Math.round(absPos.y - item.y),
          snap:"start",
        },
        {
          guide:Math.round(item.y + item.height/2),
          offset:Math.round(absPos.y - item.y - item.height/2),
          snap:"center"
        },
        {
          guide:Math.round(item.y + item.height),
          offset:Math.round(absPos.y - item.y - item.height),
          snap:"end"
        }
      ]
    } 
  }

  function getGuidelines(guideStops, itemBounds) {
    const resultV = []
    const resultH = []

    guideStops.vertical.forEach((lineGuide) => {
      itemBounds.vertical.forEach((bound) => {
        const diff = Math.abs(lineGuide - bound.guide);

        if (diff < GUIDELINE_OFFSET) {
          resultV.push({
            lineGuide,
            diff,
            snap:bound.snap,
            offset:bound.offset
          })
        }
      })
    })

    guideStops.horizontal.forEach((lineGuide) => {
      itemBounds.horizontal.forEach((bound) => {
        const diff = Math.abs(lineGuide - bound.guide)

        if (diff < GUIDELINE_OFFSET) {
          resultH.push({
            lineGuide,
            diff,
            snap:bound.snap,
            offset:bound.offset
          })
        }
      })
    })

    const guides = [];

    const minV = resultV.sort((a,b) => a.diff - b.diff)[0];
    const minH = resultH.sort((a,b) => a.diff - b.diff)[0];

    if (minV) {
      guides.push({
        lineGuide:minV.lineGuide,
        offset:minV.offset,
        orientation:"V",
        snap:minV.snap
      })
    }

    if (minH) {
      guides.push({
        lineGuide:minH.lineGuide,
        offset:minH.offset,
        orientation:"H",
        snap:minH.snap
      })
    }

    return guides
  }  

  function drawGuideline(guides) {
    guides.forEach((guideline) => {
      if (guideline.orientation === "H") {
        const line = new Konva.Line({
          points:[-6000, 0, 6000, 0],
          stroke:'rgb(0, 161, 255)',
          strokeWidth:1,
          name:"guide-line",
          dash:[4, 6]
        })
        iconLayer.add(line);
        line.absolutePosition({
          x:0,
          y:guideline.lineGuide
        })
      }

      if (guideline.orientation === "V") {
        const line = new Konva.Line({
          points:[0, -6000, 0, 6000],
          stroke:"rgb(0,161,255)",
          strokeWidth:1,
          name:"guide-line",
          dash:[4,6]
        })
        iconLayer.add(line);
        line.absolutePosition({
          x:guideline.lineGuide,
          y:0
        })
      }
    })
  }

  function map() {
    
  }

  function zoomIn() {
    const lastScale = stage.scaleX(),
      originY = stage.y(),
      originX = stage.x(),
      width = stage.width(),
      height = stage.height();
    
    stage.scale({x:scale+lastScale, y:scale+lastScale }) 
  }

  function zoomOut() {
    const lastScaleX = stage.scaleX();
    const lastScaleY = stage.scaleY();
    stage.scale({x:lastScaleX - scale, y:lastScaleY - scale})
  }

  // debug
  function mouse(evt) {
    let {top, left} = container.value.getBoundingClientRect();
    const {x,y} = evt
    console.log(x - left,y - top);
  }
  
  // interaction with canvas
  function enter(evt) {
    let {top, left} = container.value.getBoundingClientRect();
    let {x, y} = evt.evt;
    let currentScaleX = stage.scaleX();
    let currentScaleY = stage.scaleY();
    let previewShape = new Konva[shape.value]({
      x:-left + (x - 50),
      y:-top + (y - 25),
      width:100,
      height:50,
      fill:"red",
      opacity:0.3,
      name:"object"
    });
    if (previewLayer.children.length < 1) {
      current = previewShape;
      previewLayer.add(previewShape);
      previewLayer.draw();
      previewShape.startDrag();
    }
  }

  function move(evt) {
    let children = previewLayer.children[0];
    if (previewLayer.children.length > 1) previewLayer.children.pop()
    current = children;
    if (current)
      current?.startDrag();
  }

  function stopmove() {
    current = {}
    previewLayer.removeChildren();
  }

  const dragStart = (evt) => {
    iconLayer.find(".guide-line").forEach((l) => l.destroy());
    const lineGuideStops = getGuidelineStops(evt.target);
    const itemBounds = getObjectSnappingEdges(evt.target);
    const guides = getGuidelines(lineGuideStops, itemBounds);

    if (!guides.length) return;

    drawGuideline(guides);

    const absPos = evt.target.absolutePosition();

    guides.forEach((line) => {
      switch (line.orientation) {
        case "V":{
          absPos.x = line.lineGuide + line.offset;
          break;
        }
        case "H":{
          absPos.y = line.lineGuide + line.offset;
          break;
        }
      }
    });
    evt.target.absolutePosition(absPos);
  }

  const dragEnd = (evt) => {
    iconLayer.find(".guide-line").forEach(l => l.destroy());
  }

  // TODO 新增元素的監聽事件
  // 選取
  const elementMousedownEvent = (evt) => {
    evt.target.startDrag();
    iconLayer.on("dragmove", dragStart)
  }

  const elementMouseupEvent = (evt) => {
    evt.target.stopDrag();
    iconLayer.on("dragend", dragEnd)    
  }
  // hover
  const elementMouseoverEvent = (evt) => {
    if (model.value == "v") {
      evt.target.stroke("black");
      evt.target.strokeWidth(2);
    }
  }
  // mouseleave 
  const elementMouseleaveEvent = (evt) => {
    evt.target.stroke();
    evt.target.strokeWidth(0);
  }

  function click(evt) {
    current.startDrag(); 
    let {top, left, width, height} = container.value.getBoundingClientRect();
    let {x, y} = evt.evt; 
    const scaleX = stage.scaleX();
    const scaleY = stage.scaleY();
    let drawShape = new Konva[shape.value]({
      x: - left + (x  - 50)*scaleX,
      y: - top + (y - 25)*scaleY,
      width:100,
      height:50,
      fill:"red",
      opacity:1,
      name:"object"
    });
    drawShape.on("mousedown",elementMousedownEvent);
    drawShape.on("mouseup", elementMouseupEvent);
    drawShape.on("mouseover", (event) => { 
      // TODO 判斷tooltip產生的位置, tooltip anchor起始點為center middle, canvas的正中心
      const 
        cX = event.target.attrs.x + event.target.attrs.width/2, 
        cY = event.target.attrs.y + event.target.attrs.height/2;
      if (mode.value == "v") {
        current = event.target;
        event.target.stroke("black");
        event.target.strokeWidth(2);
      }
    });
    drawShape.on("mouseleave", (event) => {
      if (mode.value == "v") {
        event.target.stroke();
        event.target.strokeWidth(0); 
      }
    });
    iconLayer.add(drawShape);
    iconLayer.draw();
  }

  function cancelDraw(evt) {
    if (evt.key == "Escape" || evt.type == "mouseleave") {
      mode.value = "v";
      stopmove();
      stage.off("mouseenter", enter);
      stage.off("mousemove", move);
      stage.off("mousedown", click);
    } 
  }

  function predraw() {
    mode.value = "i";
    previewLayer.removeChildren(); 
    let {top, left, width, height} = container.value.getBoundingClientRect();
    stage.on("mouseenter", enter);
    stage.on("mousemove", move);
    stage.on("mousedown", click);
    stage.on("keydown", cancelDraw);
  }

  // init canvas 
  function initKonva() {
    stage = new Konva.Stage({
      container:"canvas_container",
      width:width.value,
      height:height.value
    })

    // icon圖層
    iconLayer = new Konva.Layer({
      x:0,
      y:0,
      draggable:false,
    }); 
    // preview圖層
    previewLayer = new Konva.Layer({
      x:0,
      y:0,
      draggable:true
    });
    // 格線圖層
    gridLayer = new Konva.Layer({
      x:0,
      y:0,
      draggable:false
    })

    stage.add(iconLayer)
    stage.add(previewLayer)    
    stage.add(gridLayer)

    const xSize = stage.width(), ySize = stage.height();
    const xSteps = Math.round(xSize/20), ySteps = Math.round(ySize/20);
    
    for (let i=1;i<=xSteps;i++) {
      gridLayer.add(
        new Konva.Line({
          x:0 + i*20,
          y:0,
          points:[0,0,0,ySize],
          stroke:"rgba(0,0,0,0.2)",
          strokeWidth:1
        })
      )
    }
    
    for (let i=1;i<=ySteps;i++) {
      gridLayer.add(
        new Konva.Line({
          x:0,
          y:20*i,
          points:[0,0,xSize,0],
          stroke:"rgb(0,0,0,0.2)",
          stokeWidth:1
        })
      )
    }
    gridLayer.batchDraw(); 
  }

  const updateStageSize = () => {
    stage = new Konva.Stage({
      container:"canvas_container",
      width:width.value,
      height:height.value
    });

    stage.add(iconLayer);
    stage.add(previewLayer);
    stage.add(gridLayer);
  }

  const initPreview = () => {
    const divide = 8;
    let width = $(".q-scrollarea").width() / divide;
    let height = $(".q-scrollarea").height() / divide;
    let maxWidth = 300;
    let maxHeight = 300;
    previewStage = new Konva.Stage({
      container:"preview_container",
      width:width,
      height:height,
    })

    let layer = new Konva.Layer({x:0,y:0});
   // layer.add(new Konva.Rect({x:0, y:0, width:maxWidth, height:maxHeight, fill:"red"}))
    layer.add(new Konva.Rect({x:1, y:1, width:width-1, height:height-2, fill:"white",stroke:"#333", strokeWidth:1}));

    previewStage.add(layer)
  }

  onMounted(() => {
    initKonva();
    initPreview();
    window.addEventListener("keydown", cancelDraw);
  })
  onBeforeUnmount(() => {
    window.removeEventListener("keydown", cancelDraw);
  })
</script>
