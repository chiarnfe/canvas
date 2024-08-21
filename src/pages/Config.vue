<template>
  <div class="w-full border" style="height:50px"></div>
  <div class="flex flex-row w-full" style="height:calc(100vh - 50px)">
    <div class="column w-1/6 h-full shadow-md">
      <div class="flex flex-row gap-x-2 p-2">
        <q-select
          class="w-[calc(66%_-_8px)]"
          outlined
          label="廠區"
          option-label="label"
          option-value="value"
          v-model="sLocation"
          :options="locationOptions"
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
          :options="floorOptions"
          emit-value
          map-options
        />
      </div>
      <q-expansion-item
        group
        icon="aspect_ratio"
        label="版面調整"
        @show="show"
        @hide="hide"
        :default-opened="true"
      >
        <div class="flex flex-col gap-y-2 p-2">
          <q-input
            outlined
            label="版面寬度"
            type="number"
            v-model.number="width"
            debounce="600"
            max="4500"
            :rules="[(val:number) => val <= 4500 || '最大寬度為4500']"
          />
          <q-input
            outlined
            label="版面高度"
            type="number"
            v-model.number="height"
            debounce="600"
            max="4500"
            :rules="[(val:number) => val <= 4500 || '最大高度為4500']"
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
            v-model="eqpProps.category"
            label="類別"
            :options="categoryOptions"
            option-label="label"
            option-value="value"
            emit-value
            map-options
          />
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
          <div v-if="shape=='Rect'" class="flex flex-row gap-x-2">
            <q-input outlined class="w-[calc(50%_-_4px)]" v-model.number="rectProps.width" label="長度" />
            <q-input outlined class="w-[calc(50%_-_4px)]" v-model.number="rectProps.height" label="高度" />
          </div>
          <div v-if="shape=='Circle'">
            <q-input outlined v-model.number="circleProps.radius" label="圓半徑" />
          </div>
          <!-- <div v-if="shape=='Wedge'">  
          </div> -->
          <div v-if="shape=='Ellipse'" class="flex flex-row gap-x-2">
            <q-input 
              outlined 
              class="w-[calc(50%_-_4px)]"
              v-model.number="ellipseProps.radiusX" 
              label="主軸半徑" 
            />
            <q-input 
              outlined 
              class="w-[calc(50%_-_4px)]"
              v-model.number="ellipseProps.radiusY" 
              label="次軸半徑" 
            />
          </div>
          <!-- <div v-if="shape=='Star'">
          </div> -->
          <div v-if="shape=='Ring'">
            <q-input 
              outlined
              type="number"
              v-model.number="ringProps.outerRadius" 
              label="外圓半徑"
              :rules="[(val:number) => val > ringProps.innerRadius || '外圓半徑要大於內圓半徑']" 
            />
            <q-input 
              outlined
              class="q-mt-sm"
              type="number"
              label="內圓半徑" 
              v-model.number="ringProps.innerRadius" 
              :rules="[(val:number) => val < ringProps.outerRadius || '內圓半徑要小於外圓半徑']" 
            />
           </div>
          <!-- <div v-if="shape=='Arc'">
          </div> -->
          <div v-if="shape=='RegularPolygon'" class="flex flex-row gap-x-2">
            <q-input
              outlined
              class="w-[calc(50%_-_4px)]"
              label="邊數"
              type="number"
              :min="3"
              v-model.number="regpolyProps.sides"
              :rules="[(val:number) => val >= 3 || '邊數必須大於等於3']"
            />
            <q-input 
              outlined
              class="w-[calc(50%_-_4px)]"
              label="邊心距"
              type="number"
              v-model.number="regpolyProps.radius"
            />
          </div>
          <div class="flex flex-col gap-y-2">
            <q-input
              outlined
              label="顏色"
              v-model="eqpProps.fill"
            >
              <template v-slot:before>
                <span class="w-6 h-4" :style="{backgroundColor:eqpProps.fill}"></span>
              </template>
              <template v-slot:append>
                <q-icon name="colorize" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-color no-header no-footer v-model="eqpProps.fill" />
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
            <q-input
              outlined
              label="機台名稱"
              v-model="eqpProps.text"
            />
            <div class="flex flex-row gap-x-2">
              <q-input
                outlined
                class="w-[calc(60%_-_4px)]"
                label="字體顏色"
                v-model="eqpProps.color"
              >
                <template v-slot:append>
                  <q-icon name="colorize" class="cursor-pointer">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-color no-header no-footer v-model="eqpProps.color" />
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
              <q-select
                outlined
                class="w-[calc(40%_-_4px)]"
                label="字體大小"
                option-label="label"
                option-value="value"
                v-model="eqpProps.fontSize"
                :options="fontSizeOptions"
                emit-value
                map-options
              />
            </div>
          </div>
          <div class="flex flex-row gap-x-2 justify-end">
            <q-btn v-show="mode=='v'" unelevated color="negative" label="刪除" />
            <!-- <q-btn class="w-full" unelevated color="secondary" label="" /> -->
            <q-btn v-show="mode=='i'" unelevated color="primary" label="新增" @click="predraw" />
          </div>     
        </div>
        
      </q-expansion-item>
      <q-separator class="q-ml-sm q-mr-md" />
      <q-expansion-item
        group
        icon="space_dashboard"
        label="編輯底圖"
      >
        <div class="p-2 flex flex-col gap-y-2">
          <q-input 
            outlined
            v-model="blockProps.fill"
          >
            <template v-slot:prepend>
              <label class="text-xs absolute" style="top:0.25rem">底色</label>
              <span class="w-6 h-4" :style="{backgroundColor:blockProps.fill}"></span>
            </template>
            <template v-slot:append>
              <q-icon name="colorize" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-color no-header no-footer v-model="blockProps.fill" />
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
          <q-input
            outlined
            v-model="blockProps.name"
            label="區塊名稱"
          />
          <div class="flex flex-row justify-end">
            <q-btn v-show="mode=='v'" unelevated style="width:60px" color="negative" label="刪除" />
            <q-btn v-show="mode=='i'" unelevated style="width:60px;" color="primary" label="新增"/>
          </div>
        </div>
      </q-expansion-item>
    </div>
    <div class="px-4 pb-4 w-5/6 relative">
      <div class="row gap-x-2 q-py-sm items-center">
        <q-checkbox label="顯示格線" v-model="grid" />
        <q-space />
        <q-btn size="md" class="q-px-sm" icon="zoom_in" @click="zoomIn" outline />
        <q-btn size="md" class="q-px-sm" icon="zoom_out" @click="zoomOut" outline />
      </div>

      <q-scroll-area @scroll="scroll" style="height:calc(100vh - 122px);box-shadow:inset 1px 0 0 #000,inset 0 1px 0 #000,inset -1px 0 0 #000,inset 0 -1px 0 #000">
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

  interface ScrollInfo {
    horizontalPosition:number
    verticalPosition:number
  }

  const showPreview = ref(true);
  const position = ref("top-16 right-7")

  const width = ref(1800);
  const height = ref(1200);
  const sLocation = ref("科技");

  const sFloor = ref("1F");

  const grid = ref(true);
  const mode = ref<"v"|"i">("i");
  const container = ref<HTMLDivElement|null>(null);

  let previewStage = reactive<{}|Konva.Stage>({});

  let stage = reactive<{}|Konva.Stage>({});

  let current = reactive<Konva.Shape[]>([]);

  let verticalAlign = reactive<number[]>([]);
  let horizontalAligin = reactive<number[]>([]);
  //const drop = ref(null);
  //const undo = ref(null);

  const mesh = 20;

  let previewLayer = reactive(new Konva.Layer({x:0,y:0, draggable:true}));
  let iconLayer = reactive<Konva.Layer>(new Konva.Layer({x:0,y:0,draggable:false}));
  let gridLayer = reactive<Konva.Layer>(new Konva.Layer({x:0,y:0,draggable:false}));
  
  const shape = ref<"Rect" | "Circle" | "Ellipse" | "Ring" | "RegularPolygon">("Rect")

  const scale = 0.25;
  const GUIDELINE_OFFSET = 5;
  
  const rectProps = reactive({
    width:100,
    height:50,
  });

  const circleProps = reactive({
    radius:50,
  });
  // const wedgeOptions = reactive({
  //   radius:60,
  //   angle:60,
  //   rotation:-90,
  // });

  const ellipseProps = reactive({
    radiusX:80,
    radiusY:40
  });

  // const starOptions = reactive({
  //   numPoints:5,
  //   innerRadius:40,
  //   outerRadius:70
  // });

  const ringProps = reactive({
    innerRadius:40,
    outerRadius:70,
  });

  // const arcOptions = reactive({
  //   innerRadius:40,
  //   outerRadius:70,
  //   angle:60
  // });

  const regpolyProps = reactive({
    sides:5,
    radius:60,
  });

  const nodeProps = reactive<Konva.ShapeConfig>(computed(() => {
    let options = {};
    switch (shape.value) {
      case "Rect":{
        options = rectProps
        break;
      }
      case "Circle":{
        options = circleProps
        break;
      }
      case "Ellipse":{
        options = ellipseProps
        break;
      }
      case "RegularPolygon":{
        options = regpolyProps
        break;
      }
      case "Ring":{
        options = ringProps
        break;
      }
    }
    return options
  }));

  const eqpProps = reactive({
    category:"CP",
    text:"",
    fill:"red",
    fontSize:20,
    color:"black"
  });
  
  const blockProps = reactive({
    fill:"#0018dd",
    name:""
  });

  const positionOptions = [
    {label:"右上", value:"top-16 right-7"},
    {label:"左上", value:"top-16 left-7"},
    {label:"右下", value:"bottom-7 right-7"},
    {label:"左下", value:"bottom-7 left-7"}
  ];
  const locationOptions = ["科技", "創新", "力行"].map(l => ({label:l, value:l}));
  const floorOptions = reactive(computed(() => {
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
  const fontSizeOptions = [8, 10, 12, 14, 16, 18, 20, 22, 24].map(num => ({label:num.toString(), value:num}));
  const categoryOptions = ["CP", "FT", "氮氣櫃", "溫溼度監控"].map(l => ({label:l, value:l}));
  const shapeOptions = [
    {label:"矩形", value:"Rect"},
    {label:"圓形", value:"Circle"},
    //{label:"楔形", value:"Wedge"},
    {label:"橢圓形", value:"Ellipse"},
    //{label:"星形", value:"Star"},
    {label:"環形", value:"Ring"},
    //{label:"弧形", value:"Arc"},
    {label:"正多邊形", value:"RegularPolygon"}
  ];

  watch(floorOptions, (nValue,_) => {
    sFloor.value = nValue[0].value;
  });

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

  function zoomIn() {
    const lastScale = stage.scaleX();
    stage.scale({x:scale+lastScale, y:scale+lastScale });
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
  function    enter(evt:Konva.KonvaEventObject<MouseEvent>) {
    let {top, left} = container.value!.getBoundingClientRect();
    let {x, y} = evt.evt;
    let currentScaleX = 0, currentScaleY = 0;
    
    if (stage instanceof Konva.Stage) {
      currentScaleX = stage.scaleX();
      currentScaleY = stage.scaleY();
    }

    let previewShape:Konva.Shape;
    let group:Konva.Group;
    let fontSize = 12;

    const estTextWidth = new Konva.Text({fontSize:eqpProps.fontSize}).measureSize(eqpProps.text);
    const estCategoryWidth = new Konva.Text({fontSize}).measureSize(eqpProps.category);
    let originX = -left + x, originY = -top + y;
    switch (shape.value) {
      case "Rect":{
        originX = originX - nodeProps.value.width/2,
          originY = originY - nodeProps.value.height/2;

        group = new Konva.Group({
          x:originX,
          y:originY,
          width:nodeProps.value.width,
          height:nodeProps.value.height,
        });

        let txt = new Konva.Text({
          x:(nodeProps.value.width - estTextWidth.width)/2,
          y:(nodeProps.value.height - estTextWidth.height)/2,
          width:estTextWidth.width,
          height:estTextWidth.height,
          fill:eqpProps.color,
          text:eqpProps.text,
          fontSize:eqpProps.fontSize
        });

        let category = new Konva.Text({
          x:2,
          y:2,
          width:estCategoryWidth.width,
          height:estCategoryWidth.height,
          fill:eqpProps.color,
          text:eqpProps.category,
          fontSize
        });

        previewShape = new Konva.Rect({
          x:0,
          y:0,
          width:nodeProps.value.width,
          height:nodeProps.value.height,
          fill:eqpProps.fill
        });

        group.add(previewShape);
        group.add(txt);
        group.add(category);
        break;
      }
      case "Circle":{
        originX = originX - nodeProps.value.radius,
        originY = originY - nodeProps.value.radius;

        group = new Konva.Group({
          x:originX,
          y:originY,
          width:nodeProps.value.radius*2,
          height:nodeProps.value.radius*2
        });
        
        let txt = new Konva.Text({
          x:nodeProps.value.radius - estTextWidth.width/2,
          y:nodeProps.value.radius - estTextWidth.height/2,
          width:estTextWidth.width,
          height:estTextWidth.height,
          fill:eqpProps.color,
          text:eqpProps.text,
          fontSize:eqpProps.fontSize
        });

        let category = new Konva.Text({
          x:0,
          y:0,
          width:estCategoryWidth.width,
          height:estCategoryWidth.height,
          fill:eqpProps.fill,
          text:eqpProps.category,
          fontSize,
        });

        previewShape = new Konva.Circle({
          x:nodeProps.value.radius,
          y:nodeProps.value.radius,
          radius:nodeProps.value.radius,
          fill:eqpProps.fill,
        });

        group.add(previewShape);
        group.add(txt);
        group.add(category);
        break;
      }
      case "Ellipse":{
        originX = originX - nodeProps.value.radiusX,
        originY = originY - nodeProps.value.radiusY;

        group = new Konva.Group({
          x:originX,
          y:originY,
          width:nodeProps.value.radiusX*2,
          height:nodeProps.value.radiusY*2
        });

        let txt = new Konva.Text({
          x:nodeProps.value.radiusX - estTextWidth.width/2,
          y:nodeProps.value.radiusY - estTextWidth.height/2,
          width:estTextWidth.width,
          height:estTextWidth.height,
          fill:eqpProps.color,
          text:eqpProps.text,
          fontSize:eqpProps.fontSize
        });

        let category = new Konva.Text({
          x:0,
          y:0,
          width:estCategoryWidth.width,
          height:estCategoryWidth.height,
          fill:eqpProps.fill,
          text:eqpProps.category,
          fontSize
        });

        previewShape = new Konva.Ellipse({
          x:nodeProps.value.radiusX,
          y:nodeProps.value.radiusY,
          radiusX:nodeProps.value.radiusX,
          radiusY:nodeProps.value.radiusY,
          fill:eqpProps.fill
        });

        group.add(previewShape);
        group.add(txt);
        group.add(category);
        break;
      }
      case "RegularPolygon":{
        originX = originX - nodeProps.value.radius,
        originY = originY - nodeProps.value.radius;

        group = new Konva.Group({
          x:originX,
          y:originY,
          width:nodeProps.value.radius*2,
          height:nodeProps.value.radius*2
        });

        let txt = new Konva.Text({
          x:nodeProps.value.radius - estTextWidth.width/2,
          y:nodeProps.value.radius - estTextWidth.height/2,
          width:estTextWidth.width,
          height:estTextWidth.height,
          fill:eqpProps.color,
          text:eqpProps.text,
          fontSize:eqpProps.fontSize,
        });

        let category = new Konva.Text({
          x:0,
          y:0,
          width:estCategoryWidth.width,
          height:estCategoryWidth.height,
          fill:eqpProps.fill,
          text:eqpProps.category,
          fontSize,
        })
        
        previewShape = new Konva.RegularPolygon({
          x:nodeProps.value.radius,
          y:nodeProps.value.radius,
          radius:nodeProps.value.radius,
          sides:nodeProps.value.sides,
          fill:eqpProps.fill
        });

        group.add(previewShape);
        group.add(txt);
        group.add(category);
        break;
      }
      case "Ring":{
        originX = originX - nodeProps.value.outerRadius,
        originY = originY - nodeProps.value.outerRadius;

        group = new Konva.Group({
          x:originX,
          y:originY,
          width:nodeProps.value.outerRadius*2,
          height:nodeProps.value.outerRadius*2,
        });

        let txt = new Konva.Text({
          x:nodeProps.value.outerRadius - estTextWidth.width/2,
          y:nodeProps.value.outerRadius - estTextWidth.height/2,
          width:estTextWidth.width,
          height:estTextWidth.height,
          fill:eqpProps.color,
          text:eqpProps.text,
          fontSize:eqpProps.fontSize
        });

        let category = new Konva.Text({
          x:0,
          y:0,
          width:estCategoryWidth.width,
          height:estCategoryWidth.height,
          fill:eqpProps.color,
          text:eqpProps.category,
          fontSize,
        });

        previewShape = new Konva.Ring({
          x:nodeProps.value.outerRadius,
          y:nodeProps.value.outerRadius,
          outerRadius:nodeProps.value.outerRadius,
          innerRadius:nodeProps.value.innerRadius,
          fill:eqpProps.fill,
        });

        group.add(previewShape);
        group.add(txt);
        group.add(category);
        break;
      }
    }
    
    if (previewLayer.children.length < 1) {
      current.push(group);
      previewLayer.add(group);
      previewLayer.draw();
      group.startDrag();
    }
  }

  function move(evt) {
    let children = previewLayer.children[0];
    if (previewLayer.children.length > 1) previewLayer.children.pop()
    console.log(evt)
  }

  function stopmove() {
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
  const elementMousedownEvent = (evt:Konva.KonvaEventObject<MouseEvent>) => {
    evt.target.startDrag();
    iconLayer.on("dragmove", dragStart)
  }

  const elementMouseupEvent = (evt:Konva.KonvaEventObject<MouseEvent>) => {
    evt.target.stopDrag();
    iconLayer.on("dragend", dragEnd)    
  }
  // hover
  const elementMouseoverEvent = (evt) => {
    console.log(evt)
    if (mode.value == "i") {
      evt.target.stroke("black");
      evt.target.strokeWidth(2);
    }
  }
  // mouseleave 
  const elementMouseleaveEvent = (evt) => {
    console.log(evt)
    evt.target.stroke();
    evt.target.strokeWidth(0);
  }

  const scroll = (evt:ScrollInfo) => {
    if (previewLayer.children.length) {
      const {horizontalPosition, verticalPosition} = evt;
      console.log(previewLayer.children[0]);
    }
  }

  function click(evt:Konva.KonvaEventObject<MouseEvent>) {
    let element = previewLayer.children[0].clone();
    console.log(element);
    //current?.[0].startDrag();
   // let drawShape:Konva.Shape | undefined;
   // let group:Konva.Group | undefined;
   // let {top, left, width, height} = container.value!.getBoundingClientRect();
   // let {x, y} = evt.evt; 
   // let scaleX = 0,scaleY = 0; 
   // if (stage instanceof Konva.Stage) {
   //   scaleX = stage.scaleX(); 
   //   scaleY = stage.scaleY();
   // }

   // let fontSize = 12;

   // const estTextWidth = new Konva.Text({fontSize:eqpProps.fontSize}).measureSize(eqpProps.text);
   // const estCategoryWidth = new Konva.Text({fontSize}).measureSize(eqpProps.category);
   // let originX = -left + x, originY = -top + y;
   // switch (shape.value) {
   //   case "Rect":{
   //     originX = originX - nodeProps.value.width/2,
   //       originY = originY - nodeProps.value.height/2;

   //     group = new Konva.Group({
   //       x:originX,
   //       y:originY,
   //       width:nodeProps.value.width,
   //       height:nodeProps.value.height,
   //     });
   //     
   //     let txt = new Konva.Text({
   //       x:(nodeProps.value.width - estTextWidth.width)/2,
   //       y:(nodeProps.value.height - estTextWidth.height)/2,
   //       width:estTextWidth.width,
   //       height:estTextWidth.height,
   //       fill:eqpProps.color,
   //       text:eqpProps.text,
   //       fontSize:eqpProps.fontSize
   //     });

   //     let category = new Konva.Text({
   //       x:0,
   //       y:0,
   //       width:estCategoryWidth.width,
   //       height:estCategoryWidth.height,
   //       fill:eqpProps.color,
   //       text:eqpProps.category,
   //       fontSize,
   //     });

   //     drawShape = new Konva.Rect({
   //       x:0,
   //       y:0,
   //       width:nodeProps.value.width,
   //       height:nodeProps.value.height,
   //       fill:eqpProps.fill,
   //     });

   //     group.add(drawShape);
   //     group.add(txt);
   //     group.add(category);
   //     break;
   //   }
   //   case "Ellipse":{

   //     break;
   //   }
   //   case "Circle":{

   //     break;
   //   }
   //   case "RegularPolygon":{

   //     break;
   //   }
   //   case "Ring":{
   //     
   //     break;
   //   }
   // }
   // 
   // if (drawShape && group) {
   //   //drawShape.on("mousedown", elementMousedownEvent);
   //   //drawShape.on("mouseup", elementMouseupEvent);
   //   iconLayer.add(group);
   //   iconLayer.draw();

   //   console.log(iconLayer)
   // }
    // let drawShape = new Konva[shape.value]({
    //   x: - left + (x  - 50)*scaleX,
    //   y: - top + (y - 25)*scaleY,
    //   fill:fillColor.value,
    //   opacity:1,
    //   name:text.value,
    //   ...nodeProps.value
    // });

    
    // drawShape.on("mousedown",elementMousedownEvent);
    // drawShape.on("mouseup", elementMouseupEvent);
    // drawShape.on("mouseover", (event:MouseEvent) => { 
    //   // TODO 判斷tooltip產生的位置, tooltip anchor起始點為center middle, canvas的正中心
    //   const 
    //     cX = event.target.attrs.x + event.target.attrs.width/2, 
    //     cY = event.target.attrs.y + event.target.attrs.height/2;
    //   if (mode.value == "v") {
    //     current = event.target;
    //     event.target.stroke("black");
    //     event.target.strokeWidth(2);
    //   }
    // });
    // drawShape.on("mouseleave", (event) => {
    //   if (mode.value == "v") {
    //     event.target.stroke();
    //     event.target.strokeWidth(0); 
    //   }
    // });
    // iconLayer.add(drawShape);
    // iconLayer.draw();
  }

  function cancelDraw(evt) {
    if (evt.key == "Escape" || evt.type == "mouseleave") {
      //stopmove();
      //stage.off("mouseenter", enter);
      //stage.off("mousemove", move);
      //stage.off("mousedown", click);
    } 
  }

  function predraw() {
    mode.value = "i";

    //console.log(previewLayer);
    //previewLayer.removeChildren(); 
    //let {top, left, width, height} = container.value.getBoundingClientRect();
    if (stage instanceof Konva.Stage) {
      stage.on("mouseenter", enter);
      stage.on("mousedown", click);
      //stage.on("mousemove", move);
      //stage.on("mousedown", click);
      //stage.on("keydown", cancelDraw);
    }
  }

  const drawGridLine = (direction:"V"|"H", mesh:number) => {
    const qBool = direction == "V";
    const scrollarea = $(".q-scrollarea");
    const qSize = qBool ? (scrollarea.width() ?? 0) : (scrollarea.height() ?? 0);
    
    const size = qBool ? width.value : height.value;
    const steps = Math.round(size/mesh);
    let buffer = [];
    for (let i=0;i<=steps;i++) {
      let stroke = i == 0 ? "rgba(0,0,0,0)" : "rgba(0,0,0,0.2)";
      buffer.push(i*mesh);
      if (i == steps && (size > qSize)) {
        stroke = "rgba(0,0,0,0)";  
      }

      gridLayer.add(
        new Konva.Line({
          x:qBool ? i * mesh : 0,
          y:qBool ? 0 : i * mesh,
          points: qBool ? [0,0,0,height.value] : [0,0,width.value,0],
          stroke,
          strokeWidth:1,
          name: qBool ? "v-line" : "h-line"
        })
      )
    }

    if (stage instanceof Konva.Stage)
      if (qBool) {
        verticalAlign = buffer;
        stage.width(width.value);
      } else {
        horizontalAligin = buffer;
        stage.height(height.value);
      }
    gridLayer.batchDraw(); 
  }

  const initGridLayer = () => {
    drawGridLine("V",mesh);
    drawGridLine("H",mesh);
  }

  const startClick = (evt) => {
    console.log(evt);
  }

  const attach = () => {
    stage.on("click", startClick);
  }
  
  // init canvas 
  function initKonva() {
    stage = new Konva.Stage({
      container:"canvas_container",
      width:width.value,
      height:height.value,
    });

    if (stage instanceof Konva.Stage) {
      stage.add(iconLayer)
      stage.add(previewLayer)    
      stage.add(gridLayer)
    }
    initGridLayer();
  }

  const initPreview = () => {
    const divide = 8;
    let width = ($(".q-scrollarea")?.width() ?? 0) / divide;
    let height = ($(".q-scrollarea")?.height() ?? 0) / divide;
    
    previewStage = new Konva.Stage({
      container:"preview_container",
      width:width,
      height:height,
    })

    let layer = new Konva.Layer({x:0,y:0, draggable:false});
    // layer.add(new Konva.Rect({x:0, y:0, width:maxWidth, height:maxHeight, fill:"red"}))
    layer.add(new Konva.Rect({x:1, y:1, width:width-3, height:height-3, fill:"white",stroke:"#333", strokeWidth:1}));
    if (previewStage instanceof Konva.Stage)
      previewStage.add(layer)
  }

  const updateWidth = (value:string) => {
    width.value = Number(value);
    setTimeout(() => {
      gridLayer.find(".v-line").forEach(line => line.destroy());
      drawGridLine("V", mesh);
    }, 600)
  }

  const updateHeight = (value:string) => {
    height.value = Number(value);
    setTimeout(() => {
      gridLayer.find(".h-line").forEach(line => line.destroy())
      drawGridLine("H", mesh);
    }, 600)
  }
  onMounted(() => {
    initKonva();
    initPreview();
    window.addEventListener("keydown", cancelDraw);
    $(".q-scrollarea")!.on("mouseenter", () => {
      let isListening = stage.isListening();
      console.log(isListening);
    })
  })
  onBeforeUnmount(() => {
    window.removeEventListener("keydown", cancelDraw);
  })
</script>
