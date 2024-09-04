<template>
  <div class="w-full border" style="height: 50px"></div>
  <div class="flex flex-row w-full" style="height: calc(100vh - 50px)">
    <div class="column justify-between w-1/6 h-full shadow-md">
      <div class="h-fit">
        <q-expansion-item
          group="group"
          icon="aspect_ratio"
          label="版面調整"
          @show="show"
          @hide="hide"
          :default-opened="true"
          @before-hide="loseFocusWhenSwitchExpansionItem"
        >
          <div class="flex flex-col gap-y-2 p-2">
            <q-input
              outlined
              label="版面寬度"
              type="number"
              v-model.number="width"
              debounce="600"
              max="4500"
              :rules="[(val) => val <= 4500 || '最大寬度為4500']"
            />
            <q-input
              outlined
              label="版面高度"
              type="number"
              v-model.number="height"
              debounce="600"
              max="4500"
              :rules="[(val) => val <= 4500 || '最大高度為4500']"
            />
            <!-- <q-select
              outlined
              label="預覽視窗"
              option-label="label"
              option-value="value"
              v-model="position"
              :options="positionOptions"
              emit-value
              map-options
            /> -->
          </div>
        </q-expansion-item>
        <q-separator class="q-ml-sm q-mr-md" />
        <q-expansion-item
          v-model="editNode"
          group="group"
          icon="dashboard"
          label="編輯機台"
          @before-hide="loseFocusWhenSwitchExpansionItem"
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
            <div v-if="shape == 'Rect'" class="flex flex-row gap-x-2">
              <q-input
                outlined
                class="w-[calc(50%_-_4px)]"
                v-model.number="rectProps.width"
                label="寬度"
              />
              <q-input
                outlined
                class="w-[calc(50%_-_4px)]"
                v-model.number="rectProps.height"
                label="高度"
              />
            </div>
            <div v-if="shape == 'Circle'">
              <q-input
                outlined
                v-model.number="circleProps.radius"
                label="圓半徑"
              />
            </div>
            <!-- <div v-if="shape=='Wedge'">  
            </div> -->
            <div v-if="shape == 'Ellipse'" class="flex flex-row gap-x-2">
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
            <div v-if="shape == 'Ring'">
              <q-input
                outlined
                type="number"
                v-model.number="ringProps.outerRadius"
                label="外圓半徑"
                :rules="[
                  (val) =>
                    val > ringProps.innerRadius || '外圓半徑要大於內圓半徑',
                ]"
              />
              <q-input
                outlined
                class="q-mt-sm"
                type="number"
                label="內圓半徑"
                v-model.number="ringProps.innerRadius"
                :rules="[
                  (val) =>
                    val < ringProps.outerRadius || '內圓半徑要小於外圓半徑',
                ]"
              />
            </div>
            <!-- <div v-if="shape=='Arc'">
            </div> -->
            <div v-if="shape == 'RegularPolygon'" class="flex flex-row gap-x-2">
              <q-input
                outlined
                class="w-[calc(50%_-_4px)]"
                label="邊數"
                type="number"
                :min="3"
                v-model.number="regpolyProps.sides"
                :rules="[(val) => val >= 3 || '邊數必須大於等於3']"
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
              <q-input outlined label="圖例背景色" v-model="eqpProps.fill">
                <template v-slot:before>
                  <span
                    class="w-6 h-4"
                    :style="{ backgroundColor: eqpProps.fill }"
                  ></span>
                </template>
                <template v-slot:append>
                  <q-icon name="colorize" class="cursor-pointer">
                    <q-popup-proxy
                      cover
                      transition-show="scale"
                      transition-hide="scale"
                    >
                      <q-color no-header no-footer v-model="eqpProps.fill" />
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
              <q-input outlined label="機台名稱" v-model="eqpProps.text" />
              <div class="flex flex-row gap-x-2">
                <q-input
                  outlined
                  class="w-[calc(60%_-_4px)]"
                  label="字體顏色"
                  v-model="eqpProps.color"
                >
                  <template v-slot:append>
                    <q-icon name="colorize" class="cursor-pointer">
                      <q-popup-proxy
                        cover
                        transition-show="scale"
                        transition-hide="scale"
                      >
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
              <q-btn
                v-show="mode == 'e'"
                unelevated
                color="negative"
                label="刪除"
                @click="destroyNode"
              />
              <q-btn
                v-show="mode == 'e'"
                unelevated
                color="secondary"
                label="更新"
                @click="updateNode"
              />
              <!-- <q-btn class="w-full" unelevated color="secondary" label="" /> -->
              <q-btn
                v-show="mode == 'i' || mode == 'v'"
                unelevated
                color="primary"
                label="新增"
                @click="predraw"
              />
            </div>
          </div>
        </q-expansion-item>
        <q-separator class="q-ml-sm q-mr-md" />
        <q-expansion-item
          v-model="editBlock"
          group="group" 
          icon="space_dashboard" 
          label="編輯底圖"
          @before-hide="loseFocusWhenSwitchExpansionItem"
        >
          <div class="p-2 flex flex-col gap-y-2">
            <q-input outlined v-model="blockProps.fill" label="底圖背景色">
              <template v-slot:before>
                <span
                  class="w-6 h-4"
                  :style="{ backgroundColor: blockProps.fill }"
                ></span>
              </template>
              <template v-slot:append>
                <q-icon name="colorize" class="cursor-pointer">
                  <q-popup-proxy
                    cover
                    transition-show="scale"
                    transition-hide="scale"
                  >
                    <q-color no-header no-footer v-model="blockProps.fill" />
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
            <q-input outlined v-model="blockProps.name" label="區塊名稱" />
            <q-input 
              outlined 
              v-model="blockProps.color" 
              label="字體顏色"
            >
              <template v-slot:append>
                <q-icon name="colorize" class="cursor-pointer">
                  <q-popup-proxy
                    cover
                    transition-show="scale"
                    transition-hide="scale"
                  >
                    <q-color no-header no-footer v-model="blockProps.color" />
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
            <div class="flex flex-row">
              <q-radio v-model="blockProps.opacity" :val="1" label="顯示名稱" />
              <q-radio v-model="blockProps.opacity" :val="0" label="隱藏名稱" />
            </div>
            <q-input type="number" v-show="mode=='e'" outlined :model-value="blockProps.width" @update:model-value="handleGroupScaleX" label="底圖寬度" debounce='600' />
            <q-input type="number" v-show="mode=='e'" outlined :model-value="blockProps.height" @update:model-value="handleGroupScaleY" label="底圖高度" debounce='600' />
            <div class="flex flex-row gap-x-2 justify-end">
              <q-btn
                v-show="mode == 'e'"
                unelevated
                style="width: 60px"
                color="negative"
                label="刪除"
                @click="removeBlock"
              />
              <q-btn 
                v-show="mode == 'e'"
                unelevated
                style="width: 60px"
                color="secondary"
                label="更新"
                @click="updateBlock"
              />
              <q-btn
                v-show="mode == 'i' || mode == 'v'"
                unelevated
                style="width: 60px"
                color="primary"
                label="新增"
                @click="drawBlock"
              />
            </div>
          </div>
        </q-expansion-item>
      </div>
      <!-- <q-btn unelevated class="q-ma-sm" color="primary" @click="saveToDb" label="上傳" /> -->
      <q-btn unelevated class="q-ma-sm" color="primary" label="上傳" @click="saveToDb" />
    </div>
    <div class="px-4 pb-4 w-5/6 relative">
      <div class="row items-center py-3">
        <div class="flex flex-row gap-x-2 w-1/3">
          <q-select
            class="w-1/3"
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
            class="w-[calc(33%_-_8px)]"
            label="樓層"
            option-label="label"
            option-value="value"
            v-model="sFloor"
            :options="floorOptions"
            emit-value
            map-options
          />
          <q-select
            outlined
            class="w-[calc(33%_-_8px)]"
            label="部門"
            option-label="label"
            option-value="value"
            v-model="sDepartment"
            :options="departmentOptions"
            emit-value
            map-options
          />
        </div>
        <q-btn unelevated color="primary" style="height:2.5rem" label="搜尋" @click="load" />
        <div class="row gap-x-2 q-py-sm items-center">
          <q-checkbox label="顯示格線" v-model="grid" />
          <q-space />
          <span>縮放比例{{currentScale*100 + "%"}}</span>
          <q-btn
            size="md"
            class="q-px-sm"
            icon="zoom_in"
            @click="zoomIn"
            outline
          />
          <q-btn
            size="md"
            class="q-px-sm"
            icon="zoom_out"
            @click="zoomOut"
            outline
          />
        </div>
      </div>
      <q-scroll-area
        @scroll="scroll"
        style="
          height: calc(100vh - 152px);
          box-shadow:
            inset 1px 0 0 #000,
            inset 0 1px 0 #000,
            inset -1px 0 0 #000,
            inset 0 -1px 0 #000;
        "
      >
      <div class="w-full" ref="container" id="canvas_container"></div>
    </q-scroll-area>
      <div
        v-show="showPreview"
        :class="[position, 'absolute']"
        id="preview_container"
      ></div>
    </div>
  </div>
  <q-dialog v-model="dialog" backdrop-filter="blur(4px) grayscale(100%)">
    <q-card class="w-96">
      <q-card-section class="row items-center q-pb-none text-h5">
        Attension
      </q-card-section>
      <q-card-section class="h-24">
        {{message}}
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="關閉" color="primary" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<!-- <style scoped>
:deep(.q-field--standard .q-field__control:before) {
  border: 0px !important;
  outline: none !important;
  padding: 2px !important;
}
:deep(.q-field--auto-height .q-field__control-container) {
  padding-left: 6px !important;
  outline: none !important;
}
:deep(.q-field--auto-height .q-field__control, ) {
  min-height: 32px !important;
  height: 32px !important;
  outline: none !important;
}
:deep(.q-field__marginal) {
  height: 32px !important;
  outline: none !important;
}
:deep(
    .q-field--auto-height .q-field__native,
    .q-field--auto-height .q-field__prefix,
    .q-field--auto-height .q-field__suffix
  ) {
  height: 32px !important;
  min-height: 32px !important;
  outline: none !important;
}
:deep(.q-field__label) {
  top:0px!important;
  background-color:white!important;
}
</style> -->
<script setup lang="ts">
import {
  ref,
  reactive,
  onMounted,
  onBeforeUnmount,
  watch,
} from "vue";
import {useTick} from "quasar"
import Konva from "konva";
import $ from "jquery";
import axios from 'axios';
interface ScrollInfo {
  horizontalPosition: number;
  verticalPosition: number;
}

const isLoading = ref(false);
const showPreview = ref(true);
const position = ref("top-16 right-7");
const width = ref(1800);
const height = ref(1200);

const sLocation = ref("創新");
const sFloor = ref("3F");
const sDepartment = ref("TEST");

const grid = ref(true);
const mode = ref<"v" | "i" | "e">("v");
const editNode = ref(false);
const editBlock = ref(false);
const container = ref<HTMLDivElement | null>(null);

const dialog = ref(false);
const message = ref("");

let previewStage = reactive<{} | Konva.Stage>({});

let stage = reactive<{} | Konva.Stage>({});

//const drop = ref(null);
//const undo = ref(null);

const mesh = 20;

let previewLayer = reactive(new Konva.Layer({ x: 0, y: 0, draggable: true , name: "preview"}));
let iconLayer = reactive<Konva.Layer>(
  new Konva.Layer({ x: 0, y: 0, draggable: false, name: "icon" }),
);
let gridLayer = reactive<Konva.Layer>(
  new Konva.Layer({ x: 0, y: 0, draggable: false, name: "grid" }),
);

const shape = ref<"Rect" | "Circle" | "Ellipse" | "Ring" | "RegularPolygon">(
  "Rect",
);


const currentScale = ref(1);

const scale = 0.25;
const GUIDELINE_OFFSET = 5;

const rectProps = reactive({
  width: 100,
  height: 50,
});

const circleProps = reactive({
  radius: 50,
});

// const wedgeOptions = reactive({
//   radius:60,
//   angle:60,
//   rotation:-90,
// });

const ellipseProps = reactive({
  radiusX: 80,
  radiusY: 40,
});

// const starOptions = reactive({
//   numPoints:5,
//   innerRadius:40,
//   outerRadius:70
// });

const ringProps = reactive({
  innerRadius: 40,
  outerRadius: 70,
});

// const arcOptions = reactive({
//   innerRadius:40,
//   outerRadius:70,
//   angle:60
// });

const regpolyProps = reactive({
  sides: 5,
  radius: 60,
});

const eqpProps = reactive({
  category: "DS",
  text: "",
  fill: "red",
  fontSize: 20,
  color: "black",
});

const blockProps = reactive({
  fill: "#0018dd",
  name: "",
  color: "black",
  opacity: 1,
  width:0,
  height:0,
});

const positionOptions = [
  { label: "右上", value: "top-16 right-7" },
  { label: "左上", value: "top-16 left-7" },
  { label: "右下", value: "bottom-7 right-7" },
  { label: "左下", value: "bottom-7 left-7" },
];
const locationOptions = ["科技", "創新", "力行"].map((l) => ({
  label: l,
  value: l,
}));
const floorOptions = ref(["1F", "2F", "3F", "7F"].map(l => ({value:l, label:l})));
const departmentOptions = ["TEST", "DS"].map((l) => ({ label: l, value: l }));
const fontSizeOptions = [8, 10, 12, 14, 16, 18, 20, 22, 24].map((num) => ({
  label: num.toString(),
  value: num,
}));

const categoryOptions = ref(["DS", "氮氣櫃", "溫溼度監控"].map((l) => ({
  label: l,
  value: l,
})));

const shapeOptions = [
  { label: "矩形", value: "Rect" },
  { label: "圓形", value: "Circle" },
  //{label:"楔形", value:"Wedge"},
  { label: "橢圓形", value: "Ellipse" },
  //{label:"星形", value:"Star"},
  { label: "環形", value: "Ring" },
  //{label:"弧形", value:"Arc"},
  { label: "正多邊形", value: "RegularPolygon" },
];

const {registerTick} = useTick();

watch([sLocation, sFloor, sDepartment], async (nValue, oValue) => {
  renewKonva();
  let floor = ["1F", "2F", "3F", "7F"];
  if (nValue[0] !== oValue[0]) {
    switch (nValue[0]) {
      case "創新":{
        sFloor.value = "2F";
        floor = ["2F", "3F", "4F"];
        break;
      }
      case "力行":{
        sFloor.value = "3F";
        floor = ["3F"];
        break;
      }
      case "科技":{
        sFloor.value = "1F";
        break;
      }
    }
    floorOptions.value = floor.map(l => ({value:l,label:l}));
  }

  if (nValue[2] !== oValue[2]) {
    if (nValue[2] == "TEST") {
      eqpProps.category = "CP";
      categoryOptions.value = ["CP", "FT", "氮氣櫃", "溫溼度監控"].map(l => ({value:l, label:l}))
    } else if (nValue[2] == "DS") {
      eqpProps.category = "DS";
      categoryOptions.value = ["DS", "氮氣櫃", "溫溼度監控"].map(l => ({value:l, label:l}))
    }
  }
})

watch([width, height], (nValue, _) => {
  if (stage instanceof Konva.Stage) {
    stage.width(nValue[0]);
    stage.height(nValue[1]);
    gridLayer.removeChildren();
    initGridLayer();
  }
});

watch(grid, (nValue, _) => {
  if (nValue) {
    initGridLayer();
  } else {
    gridLayer.removeChildren();
  }
})

// utils
const show = () => {
  showPreview.value = true;
};

const hide = () => {
  showPreview.value = false;
};

function getGridlineStops() {
  let vertical = [],
    horizontal = [];
  if (stage instanceof Konva.Stage) {
    stage.find(".v-line").forEach((line) => {
      const { x } = line.getClientRect();
      vertical.push(x);
    });

    stage.find(".h-line").forEach((line) => {
      const { y } = line.getClientRect();
      horizontal.push(y);
    });

    iconLayer.find(".cfm-object").forEach((children) => {
      const { x, y, width, height } = children.getClientRect();
      vertical.push([x, (x + width / 2), (x + width)]);
      horizontal.push([y, (y + height / 2), (y + height)]);
    });
  }

  return {
    vertical: vertical.flat(),
    horizontal: horizontal.flat(),
  };
}

function getGuidelineStops(skipItem) {
  const vertical = [],
    horizontal = [];
  if (stage instanceof Konva.Stage) {
    stage.find(".cfm-object").forEach((guideItem) => {
      if (guideItem === skipItem) return;

      const item = guideItem.getClientRect();
      vertical.push([item.x, item.x + item.width / 2, item.x + item.width]);
      horizontal.push([item.y, item.y + item.width / 2, item.y + item.width]);
    });

    stage.find(".v-line").forEach((l) => {
      const { x } = l.getClientRect();
      if (!vertical.includes(x)) vertical.push(x);
    });

    stage.find(".h-line").forEach((l) => {
      const { y } = l.getClientRect();
      if (!horizontal.includes(y)) horizontal.push(y);
    });
  }

  return {
    vertical: vertical.flat(),
    horizontal: horizontal.flat(),
  };
}

function getObjectSnappingEdges(node) {
  const item = node.getClientRect();
  const absPos = node.absolutePosition();

  return {
    vertical: [
      {
        guide: Math.round(item.x),
        offset: Math.round(absPos.x - item.x),
        snap: "start",
      },
      // {
      //   guide: Math.round(item.x + item.width / 2),
      //   offset: Math.round(absPos.x - item.x - item.width / 2),
      //   snap: "center",
      // },
      {
        guide: Math.round(item.x + item.width),
        offset: Math.round(absPos.x - item.x - item.width),
        snap: "end",
      },
    ],
    horizontal: [
      {
        guide: Math.round(item.y),
        offset: Math.round(absPos.y - item.y),
        snap: "start",
      },
      // {
      //   guide: Math.round(item.y + item.height / 2),
      //   offset: Math.round(absPos.y - item.y - item.height / 2),
      //   snap: "center",
      // },
      {
        guide: Math.round(item.y + item.height),
        offset: Math.round(absPos.y - item.y - item.height),
        snap: "end",
      },
    ],
  };
}

function getGuidelines(guideStops, itemBounds) {
  const resultV = [];
  const resultH = [];

  guideStops.vertical.forEach((lineGuide) => {
    itemBounds.vertical.forEach((bound) => {
      const diff = Math.abs(lineGuide - bound.guide);

      if (diff < GUIDELINE_OFFSET) {
        resultV.push({
          lineGuide,
          diff,
          snap: bound.snap,
          offset: bound.offset,
        });
      }
    });
  });

  guideStops.horizontal.forEach((lineGuide) => {
    itemBounds.horizontal.forEach((bound) => {
      const diff = Math.abs(lineGuide - bound.guide);

      if (diff < GUIDELINE_OFFSET) {
        resultH.push({
          lineGuide,
          diff,
          snap: bound.snap,
          offset: bound.offset,
        });
      }
    });
  });

  const guides = [];

  const minV = resultV.sort((a, b) => a.diff - b.diff)[0];
  const minH = resultH.sort((a, b) => a.diff - b.diff)[0];

  if (minV) {
    guides.push({
      lineGuide: minV.lineGuide,
      offset: minV.offset,
      orientation: "V",
      snap: minV.snap,
    });
  }

  if (minH) {
    guides.push({
      lineGuide: minH.lineGuide,
      offset: minH.offset,
      orientation: "H",
      snap: minH.snap,
    });
  }

  return guides;
}

const drawGridGuideLine = (guides) => {
  guides.forEach((guideline) => {
    if (guideline.orientation === "H") {
      const line = new Konva.Line({
        points: [-6000, 0, 6000, 0],
        stroke: "rgb(0, 161, 255)",
        strokeWidth: 1,
        name: "grid-guide-line",
        dash: [4, 6],
      });
      gridLayer.add(line);
      line.absolutePosition({
        x: 0,
        y: guideline.lineGuide,
      });
    }

    if (guideline.orientation === "V") {
      const line = new Konva.Line({
        points: [0, -6000, 0, 6000],
        stroke: "rgb(0,161,255)",
        strokeWidth: 1,
        name: "grid-guide-line",
        dash: [4, 6],
      });
      gridLayer.add(line);
      line.absolutePosition({
        x: guideline.lineGuide,
        y: 0,
      });
    }
  });
};

function drawGuideline(guides) {
  guides.forEach((guideline) => {
    if (guideline.orientation === "H") {
      const line = new Konva.Line({
        points: [-6000, 0, 6000, 0],
        stroke: "rgb(0, 161, 255)",
        strokeWidth: 1,
        name: "guide-line",
        dash: [4, 6],
      });
      iconLayer.add(line);
      line.absolutePosition({
        x: 0,
        y: guideline.lineGuide,
      });
    }

    if (guideline.orientation === "V") {
      const line = new Konva.Line({
        points: [0, -6000, 0, 6000],
        stroke: "rgb(0,161,255)",
        strokeWidth: 1,
        name: "guide-line",
        dash: [4, 6],
      });
      iconLayer.add(line);
      line.absolutePosition({
        x: guideline.lineGuide,
        y: 0,
      });
    }
  });
}

function zoomIn() {
  const lastScale = stage.scaleX();
  stage.scale({ 
    x: scale + lastScale,
    y: scale + lastScale,
    width: width.value * (scale + lastScale),
    height: height.value * (scale + lastScale)
  });
  currentScale.value = lastScale + scale;
}

function zoomOut() {
  const lastScaleX = stage.scaleX();
  if (lastScaleX > 0.25) {
    stage.scale({ 
      x: lastScaleX - scale, 
      y: lastScaleX - scale,
      width: width.value * (lastScaleX - scale),
      height: height.value * (lastScaleX - scale)
    });
    currentScale.value = lastScaleX - scale;
  }
}

// // debug
// function mouse(evt) {
//   let { top, left } = container.value.getBoundingClientRect();
//   const { x, y } = evt;
//   console.log(x - left, y - top);
// }

// interaction with canvas
function enter(evt: Konva.KonvaEventObject<MouseEvent>) {
  let { top, left } = container.value!.getBoundingClientRect();
  let { x, y } = evt.evt;
  let currentScaleX = 0,
    currentScaleY = 1;

  if (stage instanceof Konva.Stage) {
    currentScaleX = stage.scaleX();
    currentScaleY = stage.scaleY();
  }

  let previewShape: Konva.Shape;
  let group: Konva.Group;
  let fontSize = 12;

  const estTextWidth = new Konva.Text({
    fontSize: eqpProps.fontSize,
  }).measureSize(eqpProps.text);
  const estCategoryWidth = new Konva.Text({ fontSize }).measureSize(
    eqpProps.category,
  );
  const {x:_x_, y:_y_} = stage.getPointerPosition();
  let originX = -left + x,
  originY = -top + y;
  switch (shape.value) {
    case "Rect": {
      group = new Konva.Group({
        x: originX,
        y: originY,
        width: rectProps.width,
        height: rectProps.height,
        opacity: 0.5,
        name: "cfm-object",
      });

      let txt = new Konva.Text({
        x: (rectProps.width - estTextWidth.width) / 2,
        y: (rectProps.height - estTextWidth.height) / 2,
        width: estTextWidth.width,
        height: estTextWidth.height,
        fill: eqpProps.color,
        text: eqpProps.text,
        fontSize: eqpProps.fontSize,
        name:"name"
      });

      let category = new Konva.Text({
        x: 0,
        y: 0,
        width: estCategoryWidth.width,
        height: estCategoryWidth.height,
        opacity:0,
        text: eqpProps.category,
        name:"category"
      });

      previewShape = new Konva.Rect({
        x: 0,
        y: 0,
        width: rectProps.width,
        height: rectProps.height,
        fill: eqpProps.fill,
        name: "cfm-frame",
        stroke:"black",
        strokeWidth:2
      });

      group.add(previewShape);
      group.add(txt);
      group.add(category);
      break;
    }
    case "Circle": {
      group = new Konva.Group({
        x: originX,
        y: originY,
        width: circleProps.radius * 2,
        height: circleProps.radius * 2,
        name: "cfm-object",
      });

      let txt = new Konva.Text({
        x: circleProps.radius - estTextWidth.width / 2,
        y: circleProps.radius - estTextWidth.height / 2,
        width: estTextWidth.width,
        height: estTextWidth.height,
        fill: eqpProps.color,
        text: eqpProps.text,
        fontSize: eqpProps.fontSize,
        name:"name"
      });

      let category = new Konva.Text({
        x: 0,
        y: 0,
        width: estCategoryWidth.width,
        height: estCategoryWidth.height,
        opacity:0,
        text: eqpProps.category,
        fontSize,
        name:"category",
      });

      previewShape = new Konva.Circle({
        x: circleProps.radius,
        y: circleProps.radius,
        radius: circleProps.radius,
        fill: eqpProps.fill,
        name: "cfm-frame",
        stroke:"black",
        strokeWidth:2
      });

      group.add(previewShape);
      group.add(txt);
      group.add(category);
      break;
    }
    case "Ellipse": {
      group = new Konva.Group({
        x: originX,
        y: originY,
        width: ellipseProps.radiusX * 2,
        height: ellipseProps.radiusY * 2,
        name: "cfm-object",
      });

      let txt = new Konva.Text({
        x: ellipseProps.radiusX - estTextWidth.width / 2,
        y: ellipseProps.radiusY - estTextWidth.height / 2,
        width: estTextWidth.width,
        height: estTextWidth.height,
        fill: eqpProps.color,
        text: eqpProps.text,
        fontSize: eqpProps.fontSize,
        name: "name",
      });

      let category = new Konva.Text({
        x: 0,
        y: 0,
        width: estCategoryWidth.width,
        height: estCategoryWidth.height,
        opacity:0,
        text: eqpProps.category,
        fontSize,
        name: "category",
      });

      previewShape = new Konva.Ellipse({
        x: ellipseProps.radiusX,
        y: ellipseProps.radiusY,
        radiusX: ellipseProps.radiusX,
        radiusY: ellipseProps.radiusY,
        fill: eqpProps.fill,
        name: "cfm-frame",
        stroke:"black",
        strokeWidth:2
      });

      group.add(previewShape);
      group.add(txt);
      group.add(category);
      break;
    }
    case "RegularPolygon": {
      group = new Konva.Group({
        x: originX,
        y: originY,
        width: regpolyProps.radius * 2,
        height: regpolyProps.radius * 2,
        name: "cfm-object",
      });

      let txt = new Konva.Text({
        x: regpolyProps.radius - estTextWidth.width / 2,
        y: regpolyProps.radius - estTextWidth.height / 2,
        width: estTextWidth.width,
        height: estTextWidth.height,
        fill: eqpProps.color,
        text: eqpProps.text,
        fontSize: eqpProps.fontSize,
        name: "name",
      });

      let category = new Konva.Text({
        x: 0,
        y: 0,
        width: estCategoryWidth.width,
        height: estCategoryWidth.height,
        opacity:0,
        text: eqpProps.category,
        fontSize,
        name: "category",
      });

      previewShape = new Konva.RegularPolygon({
        x: regpolyProps.radius,
        y: regpolyProps.radius,
        radius: regpolyProps.radius,
        sides: regpolyProps.sides,
        fill: eqpProps.fill,
        name: "cfm-frame",
        stroke:"black",
        strokeWidth:2
      });

      group.add(previewShape);
      group.add(txt);
      group.add(category);
      break;
    }
    case "Ring": {
      group = new Konva.Group({
        x: originX,
        y: originY,
        width: ringProps.outerRadius * 2,
        height: ringProps.outerRadius * 2,
        name: "cfm-object",
      });

      let txt = new Konva.Text({
        x: ringProps.outerRadius - estTextWidth.width / 2,
        y: ringProps.outerRadius - estTextWidth.height / 2,
        width: estTextWidth.width,
        height: estTextWidth.height,
        fill: eqpProps.color,
        text: eqpProps.text,
        fontSize: eqpProps.fontSize,
        name: "name",
      });

      let category = new Konva.Text({
        x: 0,
        y: 0,
        width: estCategoryWidth.width,
        height: estCategoryWidth.height,
        opacity:0,
        text: eqpProps.category,
        fontSize,
        name:"category"
      });

      previewShape = new Konva.Ring({
        x: ringProps.outerRadius,
        y: ringProps.outerRadius,
        outerRadius: ringProps.outerRadius,
        innerRadius: ringProps.innerRadius,
        fill: eqpProps.fill,
        name: "cfm-frame",
        stroke:"black",
        strokeWidth:2
      });

      group.add(previewShape);
      group.add(txt);
      group.add(category);
      break;
    }
  }

  if (previewLayer.children.length < 1 && group) {
    previewLayer.add(group);
    previewLayer.draw();
    group.startDrag();
    window.removeEventListener("keydown", cancelInsert);
    group.off("dragmove", startInsertSnapping);
    stage.off("mouseup", keepDrag);
    stage.off("mousedown", insertToIconLayer);

    window.addEventListener("keydown", cancelInsert);
    group.on("dragmove", startInsertSnapping);
    stage.on("mouseup", keepDrag);
    stage.on("mousedown", insertToIconLayer);
  }
}
const cancelInsert = (evt: KeyboardEvent | MouseEvent) => {
  if (evt.key === "Escape" || evt.type === "mouseleave") {
    stage.off("mouseup", keepDrag);
    stage.off("mousedown", insertToIconLayer);
    previewLayer.getChildren().forEach((children) => {
      children.off();
      children.destroy();
    });
    gridLayer.find(".grid-guide-line").forEach((l) => l.destroy());
  }
};

const insertToIconLayer = () => {
  let nodeCount = iconLayer.getChildren().length;
  let children = previewLayer.getChildren()[0];
  let clone = children.clone().opacity(1);
  clone.on("click", pickNode);
  clone.on("dragmove", dragStart);
  clone.on("dragend", dragEnd);
  iconLayer.add(clone);
  clone.zIndex(nodeCount);
  iconLayer.draw();
};

const keepDrag = () => {
  previewLayer.getChildren().forEach((children) => children.startDrag());
};

const startInsertSnapping = (evt: Konva.KonvaEventObject<MouseEvent>) => {
  
  const {left, top} = document.getElementById('canvas_container').getBoundingClientRect();
  
  stage.find(".grid-guide-line").forEach((l:Konva.Line) => l.destroy());
  const { target } = evt;
  // target.y(Math.max(target.y(), 0));
  // target.x(Math.max(target.x(), 0));

  const gridlineStops = getGridlineStops();
  if (stage.scaleX() !== 1 || stage.scaleY() !== 1)
    target.absolutePosition({x:evt.evt.clientX - left, y:evt.evt.clientY - top}); 
  const itemBounds = getObjectSnappingEdges(target);
  const guides = getGuidelines(gridlineStops, itemBounds);
  if (!guides.length) return;

  drawGridGuideLine(guides);

  const absPos = target.absolutePosition();
  guides.forEach((line) => {
    switch (line.orientation) {
      case "V": {
        absPos.x = line.lineGuide + line.offset;
        break;
      }
      case "H": {
        absPos.y = line.lineGuide + line.offset;
        break;
      }
    }
  });
  
  target.absolutePosition(absPos);
};

const hoverHighLight = (evt: Konva.KonvaEventObject<MouseEvent>) => {
  const { target } = evt;
  let rect = target.getParent().find(".cfm-frame")[0];
  rect.stroke("black").strokeWidth(2);
};

const leaveHighLight = (evt: Konva.KonvaEventObject<MouseEvent>) => {
  const { target } = evt;
  let rect = target.getParent().find(".cfm-frame")[0];
  rect.stroke("transparent").strokeWidth(0);
};

const pickNode = (evt: Konva.KonvaEventObject<MouseEvent>) => {
  editNode.value = true; 
  mode.value = "e";
  let group = evt.target.getParent();
  group.draggable(true);
  group.setAttr("name", "selected-cfm-object");
  const [frame, txt, category] = group.getChildren();
  eqpProps.category = category.getAttrs().text;
  eqpProps.color = txt.getAttrs().fill;
  eqpProps.text = txt.getAttrs().text;
  eqpProps.fontSize = txt.getAttrs().fontSize;
  eqpProps.fill = frame.getAttrs().fill;
  let className = frame.getClassName() as "Rect" | "Circle" | "Ellipse" | "RegularPolygon" | "Ring";
  shape.value = className;

  switch (className) {
    case "Rect": {
      rectProps.width = frame.getAttr("width");
      rectProps.height = frame.getAttr("height");
      break;
    }
    case "Circle": {
      circleProps.radius = frame.getAttr("radius");
      break;
    }
    case "Ellipse": {
      ellipseProps.radiusX = frame.getAttr("radiusX");
      ellipseProps.radiusY = frame.getAttr("radiusY");
      break;
    }
    case "RegularPolygon": {
      regpolyProps.sides = frame.getAttr("sides");
      regpolyProps.radius = frame.getAttr("radius");
      break;
    }
    case "Ring": {
      ringProps.innerRadius = frame.getAttr("innerRadius");
      ringProps.outerRadius = frame.getAttr("outerRadius");
      break;
    }
  }
};

const cancelEditNode = (evt:KeyboardEvent) => {
}

const updateNode = () => {
  let group = iconLayer.find(".selected-cfm-object")[0];
  const [frame, txt, category] = group.getChildren();
  const { fill, fontSize, text, color } = eqpProps;
  const txtWidth = new Konva.Text({ fontSize }).measureSize(text);
  const categoryWidth = new Konva.Text({ fontSize: 12 }).measureSize(
    eqpProps.category,
  );
  let className = frame.getClassName();

  const state = group.getAttr("state");
  
  if (state !== "insert") {
    group.setAttr("state", "update");
  }

  frame.setAttr("fill", fill);
  category.width(categoryWidth.width);
  category.setAttr("text", eqpProps.category);
  switch (className) {
    case "Rect": {
      txt.setAttrs({
        x: (rectProps.width - txtWidth.width) / 2,
        y: (rectProps.height - txtWidth.height) / 2,
        width: txtWidth.width,
        height: txtWidth.height,
        text,
        fontSize,
        fill: color,
      });
      frame.setAttr("width", rectProps.width);
      frame.setAttr("height", rectProps.height);
      break;
    }
    case "Circle": {
      txt.setAttrs({
        x:(circleProps.radius - txtWidth.width) / 2,
        y:(circleProps.radius - txtWidth.height) / 2,
        width: txtWidth.width,
        height: txtWidth.height,
        text,
        fontSize,
        fill: color,
      });
      frame.setAttr("radius", circleProps.radius);
      break;
    }
    case "Ellipse": {
      txt.setAttrs({
        x:ellipseProps.radiusX - txtWidth.width/2,
        y:ellipseProps.radiusY - txtWidth.height/2,
        width:txtWidth.width,
        height:txtWidth.height,
        text,
        fontSize,
        fill: color,
      });
      frame.setAttr("radiusX", ellipseProps.radiusX);
      frame.setAttr("radiusY", ellipseProps.radiusY);
      break;
    }
    case "RegularPolygon": {
      txt.setAttrs({
        x:regpolyProps.radius - txtWidth.width /2,
        y:regpolyProps.radius - txtWidth.height /2,
        width:txtWidth.width,
        height:txtWidth.height,
        fill:color,
        text,
        fontSize,
      });
      frame.setAttr("sides", regpolyProps.sides);
      frame.setAttr("radius", regpolyProps.radius);
      break;
    }
    case "Ring": {
      txt.setAttrs({
        x:ringProps.outerRadius - txtWidth.width/2,
        y:ringProps.outerRadius - txtWidth.height/2,
        width:txtWidth.width,
        height:txtWidth.height,
        fill:color,
        text,
        fontSize,
      });
      frame.setAttrs({
        x:ringProps.outerRadius,
        y:ringProps.outerRadius,
        outerRadius:ringProps.outerRadius,
        innerRadius:ringProps.innerRadius,
      })
      break;
    }
  }
  group.setAttr("name", "cfm-object");
  group.draggable(false);
  mode.value = "v";
};

const destroyNode = () => {
  const group = iconLayer.find(".selected-cfm-object")[0];
  group.off();
  group.destroy();
  // group.setAttrs({
  //   state:"delete",
  //   name:'cfm-object',
  //   opacity:0,
  // });
  mode.value = "v";
};

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
      case "V": {
        absPos.x = line.lineGuide + line.offset;
        break;
      }
      case "H": {
        absPos.y = line.lineGuide + line.offset;
        break;
      }
    }
  });
  evt.target.absolutePosition(absPos);
};

const dragEnd = (evt) => {
  iconLayer.find(".guide-line").forEach(l => l.destroy());
};

const createPreviewBlock = (evt:Konva.KonvaEventObject<MouseEvent>) => {
  stage.find(".grid-guide-line").forEach(l => l.destroy());
  const { x, y } = stage.getPointerPosition();
  let group = new Konva.Group({
    x,
    y,
    width:0,
    height:0,
    name:"block"
  });
  let text = new Konva.Text({fontSize:12, text:blockProps.name, fill:blockProps.color, opacity:0.5, name:"name"});
  let rect = new Konva.Rect({
    x:0, y:0, width:0, height:0, opacity:0.5, fill:blockProps.fill, name:"fill"
  });
  group.add(rect).add(text);
  stage.off("mousemove", showGridlineGuide);

  if (!previewLayer.getChildren().length) {
    previewLayer.add(group);
    stage.off("mousemove", drawPreviewBlock);
    stage.on("mousemove", drawPreviewBlock);
  }
    
}

const drawPreviewBlock = (evt:Konva.KonvaEventObject<MouseEvent>) => {
  stage.find(".grid-guide-line").forEach(l => l.destroy());
  let {x:_x ,y:_y} = stage.getPointerPosition();
  let group = previewLayer.getChildren()[0];
  let x = group.x();
  let y = group.y();
  let width = Math.abs(_x - x), height = Math.abs(_y - y);
  let offsetX = 0, offsetY = 0;
  if (_x - x < 0) offsetX = width;
  if (_y - y < 0) offsetY = height;
  let rect = group.getChildren()[0];
  rect.width(width);
  rect.height(height);
  if (_x - x < 0) rect.offsetX(offsetX);
  if (_y - y < 0) rect.offsetY(offsetY);
  const gridlineStops = getGridlineStops();
  const itemBounds = {
    vertical:[
      {
        guide:Math.round(_x),
        offset:0,
        snap:offsetX > 0 ? "end":"start"
      }
    ],
    horizontal:[
      {
        guide:Math.round(_y),
        offset:0,
        snap:offsetY > 0 ? "end":"start"
      }
    ]
  }
  const guides = getGuidelines(gridlineStops, itemBounds);
  if (!guides.length) return;
  drawGridGuideLine(guides);
}

const drawBlockToLayer = () => {
  stage.container().style.cursor = "default";
  stage.off("mousemove", drawPreviewBlock);
  stage.off("mousedown", createPreviewBlock);
  stage.off("mouseenter", beforeDrawPreviewBlock);
  if (previewLayer.getChildren().length) {
    let group = previewLayer.getChildren()[0].clone();
    group.find("Text")[0].opacity(blockProps.opacity);
    group.find("Rect")[0].opacity(1);
    group.on("click", pickBlock);
    iconLayer.add(group);
    iconLayer.draw();
    let itemCount = iconLayer.getChildren().length;
    iconLayer.find(".block").forEach((f,i) => f.zIndex(i));
    iconLayer.find(".cfm-object").forEach((o,i) => o.zIndex(itemCount - 1 -i));
  }
  previewLayer.removeChildren();
  stage.find(".grid-guide-line").forEach(l => l.destroy());
  stage.off("mouseup", drawBlockToLayer); 
}

const moveBlock = (evt) => {
  stage.find('.guide-line').forEach(l => l.destroy());
  let lineGuideStops = getGuidelineStops(evt.target);
  let itemBounds = getObjectSnappingEdges(evt.target);
  const guides = getGuidelines(lineGuideStops, itemBounds);
  if (!guides.length) return;
  drawGuideline(guides);
  const absPos = evt.target.absolutePosition();

  guides.forEach(line => {
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

const leaveBlock = () => {
  stage.find('.guide-line').forEach(l => l.destroy());
}

const pickBlock = (evt) => {
  iconLayer.find(".block").forEach(grp => {
    if (grp.isAncestorOf(evt.target)) {
      evt.target.name("selected-fill");
    } else {
      grp.find("Rect")[0].name("fill")
    }
  }); 

  let tr = new Konva.Transformer({
    visible:true,
    rotateEnabled:false,
  });
  let group = evt.target.getParent() as Konva.Group;
  group.on("dragmove", moveBlock);
  group.on("mouseup", leaveBlock);
  group.on("transformend", () => {
    tr.detach();
  });

  tr.nodes([group]);
  iconLayer.add(tr);
  iconLayer.draw();
  iconLayer.find("Transformer").forEach(child => {
    if (child._id !== tr._id) child.destroy();
  });


  let rect = group.find("Rect")[0];
  let txt = group.find("Text")[0];
  group.draggable(true);
  editBlock.value = true;
  mode.value = "e";
  blockProps.fill = rect.getAttr("fill");
  blockProps.name = txt.getAttr("text");
  blockProps.opacity = txt.getAttr("opacity");
  blockProps.color = txt.getAttr("fill");
  blockProps.width = Math.ceil(rect.width() * group.scaleX());
  blockProps.height = Math.ceil(rect.height() * group.scaleY());
}

const handleGroupScaleX = (evt:number) => {
  console.log(typeof evt);
  let selectedFill = iconLayer.find(".selected-fill");
  if (selectedFill.length) {
    let rect = selectedFill[0];
    let group = rect.getParent();
    let width = rect.width();
    let scaleX = evt/width;
    group.scaleX(scaleX);
  }
  blockProps.width = evt
}

const handleGroupScaleY = (evt:number) => {
  let selectedFill = iconLayer.find(".selected-fill");
  if (selectedFill.length) {
    let rect = selectedFill[0];
    let group = rect.getParent();
    let height = rect.height();
    let scaleY = evt/height;
    group.scaleY(scaleY);
  }
  blockProps.height = evt
}

const updateBlock = () => {
  mode.value = "v";
  let rect = iconLayer.find(".selected-fill")[0];
  let group = rect.getParent();
  let txt = group.find("Text")[0];
  group.off("dragmove", moveBlock);
  group.off("mouseup", leaveBlock);
  group.draggable(false);
  rect.setAttr("fill", blockProps.fill);
  txt.setAttrs({
    text:blockProps.name,
    fill:blockProps.color,
    opacity:blockProps.opacity,
  });
  rect.name("fill");
}

const removeBlock = () => {
  let group = iconLayer.find(".selected-fill")[0].getParent();
  group.off();
  group.destroy();
  mode.value = "v";
}

const beforeDrawPreviewBlock = (evt:Konva.KonvaEventObject<MouseEvent>) => {
  stage.container().style.cursor = "crosshair";
  stage.off("mousemove", showGridlineGuide);
  stage.on("mousemove",showGridlineGuide);
}

const showGridlineGuide = (evt:Konva.KonvaEventObject<MouseEvent>) => {
  stage.find(".grid-guide-line").forEach(l => l.destroy());
  const gridlineStops = getGridlineStops();
  const {x, y} = stage.getPointerPosition();
  const itemBounds = {
    vertical:[
      {
        guide:Math.round(x),
        offset:0,
        snap:"start"
      },
    ],
    horizontal:[
      {
        guide:Math.round(y),
        offset:0,
        snap:"start"
      }
    ]
  };
  const guides = getGuidelines(gridlineStops, itemBounds);
  if (!guides.length) return;
  drawGridGuideLine(guides);
}

const cancelDrawPreviewBlock = (evt:Konva.KonvaEventObject<MouseEvent>) => {
  stage.find(".grid-guide-line").forEach(l => l.destroy());
  stage.container().style.cursor = "default";
  stage.off("mousemove", showGridlineGuide);
}

function drawBlock() {
  if (stage instanceof Konva.Stage) {
    stage.off("mouseenter", beforeDrawPreviewBlock);
    stage.off("mousedown", createPreviewBlock);
    stage.off("mouseup", drawBlockToLayer);
    stage.off("mouseleave", cancelDrawPreviewBlock);
    stage.on("mouseenter", beforeDrawPreviewBlock);
    stage.on("mousedown", createPreviewBlock);
    stage.on("mouseup", drawBlockToLayer);
    stage.on("mouseleave", cancelDrawPreviewBlock);
  }
}

const scroll = () => {
  if (previewLayer.getChildren().length) {
    let absPos = stage.getPointerPosition();
    let children = previewLayer.getChildren()[0];
    children.absolutePosition(absPos);
  }
};

function cancelDraw(evt: KeyboardEvent) {
  if (evt.key == "Escape" || evt.type == "mouseleave") {
    if (stage instanceof Konva.Stage) {
      stage.off("mouseenter", enter);
      mode.value = "v";
      iconLayer.find(".selected-cfm-object").forEach(children => children.name("cfm-object"));
    }
  }
}

function predraw() {
  if (previewLayer.getChildren().length) {
    previewLayer.removeChildren();
  }
  
  if (stage instanceof Konva.Stage) {
    stage.find(".grid-guide-line").forEach((l:Konva.Line) => l.destroy());
    stage.off("mouseenter", enter);
    stage.on("mouseenter", enter);
  }
}

const drawGridLine = (direction: "V" | "H", mesh: number) => {
  const qBool = direction == "V";
  const scrollarea = $(".q-scrollarea");
  const qSize = qBool ? scrollarea.width() ?? 0 : scrollarea.height() ?? 0;

  const size = qBool ? width.value : height.value;
  const steps = Math.round(size / mesh);
  let buffer = [];
  for (let i = 0; i <= steps; i++) {
    let stroke = i == 0 ? "rgba(0,0,0,0)" : "rgba(0,0,0,0.2)";
    buffer.push(i * mesh);
    if (i == steps && size > qSize) {
      stroke = "rgba(0,0,0,0)";
    }

    gridLayer.add(
      new Konva.Line({
        x: qBool ? i * mesh : 0,
        y: qBool ? 0 : i * mesh,
        points: qBool ? [0, 0, 0, height.value] : [0, 0, width.value, 0],
        stroke,
        strokeWidth: 1,
        name: qBool ? "v-line" : "h-line",
      }),
    );
  }
  gridLayer.batchDraw();
};

const initGridLayer = () => {
  drawGridLine("V", mesh);
  drawGridLine("H", mesh);
};

// init canvas
function initKonva() {
  stage = new Konva.Stage({
    container: "canvas_container",
    width: width.value,
    height: height.value,
    name:"main"
  });

  if (stage instanceof Konva.Stage) {
    stage.add(iconLayer);
    stage.add(previewLayer);
    stage.add(gridLayer);
  }
  initGridLayer();
}

const renewKonva = () => {
  if (stage instanceof Konva.Stage) {
    stage.off();
    stage.width(width.value);
    stage.height(height.value);
    iconLayer.removeChildren();
    previewLayer.removeChildren();
    gridLayer.removeChildren();
  }
  initGridLayer();
};

const initPreview = () => {
  const divide = 8;
  const minimap_width = ($(".q-scrollarea")?.width() ?? 0) / divide;
  const minimap_height = ($(".q-scrollarea")?.height() ?? 0) / divide;

 // previewStage = new Konva.Stage({
 //   container:"preview_container",
 //   width: width.value/divide,
 //   height: height.value/divide,
 //   scaleX: 1/divide,
 //   scaleY: 1/divide,
 // });

 // let layer = gridLayer.clone();
 // let minimap = new Konva.Layer({x:0,y:0});

 // minimap.add(new Konva.Rect({
 //   x:1,
 //   y:1,
 //   width: minimap_width - 3,
 //   height: minimap_height - 3,
 //   stroke: "#333",
 //   strokeWidth: 1,
 //   scaleX:divide,
 //   scaleY:divide
 // }));

 // previewStage.add(layer);
 // previewStage.add(minimap);
 // previewStage = new Konva.Stage({
 //   container: "preview_container",
 //   width: width,
 //   height: height,
 // });

 // let layer = new Konva.Layer({ x: 0, y: 0, draggable: false });
 // layer.add(
 //   new Konva.Rect({
 //     x: 1,
 //     y: 1,
 //     width: width - 3,
 //     height: height - 3,
 //     fill: "white",
 //     stroke: "#333",
 //     strokeWidth: 1,
 //   }),
 // );
 // if (previewStage instanceof Konva.Stage) previewStage.add(layer);
};

// const payload = {
//   BU:"",
//   NumberPerAPage:-1,
//   PageName:"DS_CFM_MAP",
//   PageNumber:-1,
//   QueryArr:[sLocation.value, sFloor.value, "", "", "", ""]
// };
const saveToDb =  () => {
  
  // previewLayer.remove();
  // gridLayer.remove();
  iconLayer.getChildren().forEach(group => console.log(group.zIndex(),group.toJSON()))
  // let itemName = [sLocation.value, sFloor.value, sDepartment.value].join(",");
  // let data = stage.toJSON();
  // console.log(data);
  // localStorage.setItem(itemName, data);
  
  // let payload = {
  //   PageName:sDepartment.value + "_CFM_MAP",
  //   BU:"",
  //   DeleteArr:[],
  //   InsertArr:[],
  //   UpdateArr:[],
  // };
  
  // let dept = sDepartment.value == "TEST" ? "測試" : "切挑";
  // stage.find("Group").forEach(group => {
  //   let str = [sLocation.value, sFloor.value];
  //   let name = group.find(".name")[0].getAttr("text");
  //   str.push(name);
  
  //   if (group.name() == "cfm-object") {
  //     let bu = group.find(".category")[0].getAttr("text");
  //     if (!["CP", "DS", "FT"].includes(bu)) {
  //       str.push(bu + `(${dept})`);
  //     } else {
  //       str.push(bu);
  //     }
  //   } else if (group.name() == "block") {
  //     str.push("底圖"+`(${dept})`);
  //   }
  //   let groupAttrs:string = (group.toJSON()).replaceAll(",", "，");
  //   str.push(groupAttrs);
  //   payload.InsertArr.push(str.join(","));
  // });

  // let stageStr = [sLocation.value, sFloor.value, "圖層", `圖層(${dept})`];
  // let stageAttr = JSON.stringify({width:width.value, height:height.value}).replaceAll(",", "，");
  // stageStr.push(stageAttr);
  // payload.InsertArr.push(stageStr.join(','));
  
  // let res = await axios.post(window.location.origin + window.location.pathname + "/../Update", payload);
  // if (res.status == 200 && res.data[1]) {
  //   dialog.value = true;
  //   message.value = "儲存成功!";
  //   stage.add(previewLayer);
  //   stage.add(gridLayer);
  //   iconLayer.removeChildren();
  //   load();
  // }
}

const load = async () => {
  isLoading.value = true;
  iconLayer.removeChildren();
  let payload = {
    BU:"",
    NumberPerAPage:-1,
    PageName: sDepartment.value + "_CFM_MAP",
    QueryArr:[]
  }

  if (sDepartment.value == "DS") payload.QueryArr = [sLocation.value, sFloor.value, "", "", "", ""];
  else if (sDepartment.value == "TEST") payload.QueryArr = [sLocation.value, sFloor.value, "機台", "", "", "", "", "", "", "", ""];

  registerTick(async () => {
    let res = await axios.post("http://localhost:59024" + window.location.pathname + "/../HomePageSearch", payload);
    if (res.data.length > 0 && res.status == 200) {
      res.data.forEach((row:string, i:number) => {
        let grpAttrs = sDepartment.value == "TEST" ? row.split(",")[6]: row.split(",")[5];
        let attrs = JSON.parse(grpAttrs.replaceAll("，", ","));
        if (Object.prototype.hasOwnProperty.call(attrs, "className")) {
          let group = new Konva.Group({
            x:attrs.attrs.x,
            y:attrs.attrs.y,
            width:attrs.attrs.width,
            height:attrs.attrs.height,
            name:attrs.attrs.name
          });

          attrs.children.forEach(child => {
            switch (child.className) {
              case "Text":{
                const text = new Konva.Text({
                  fill:child.attrs.fill,
                  name:child.attrs.name,
                  text:child.attrs.text
                });
                if (Object.prototype.hasOwnProperty.call(child.attrs, "x")) text.setAttr("x", child.attrs.x);
                if (Object.prototype.hasOwnProperty.call(child.attrs, "y")) text.setAttr("y", child.attrs.y);
                if (Object.prototype.hasOwnProperty.call(child.attrs, "fontSize")) text.setAttr("fontSize", child.attrs.fontSize);
                if (Object.prototype.hasOwnProperty.call(child.attrs, "opacity")) text.setAttr("opacity", child.attrs.opacity);
                group.add(text);
                break;
              }
              case "Rect":{
                const rect = new Konva.Rect({
                  fill:child.attrs.fill,
                  height:child.attrs.height,
                  width:child.attrs.width,
                  name:child.attrs.name,
                  stroke:child.attrs.stroke
                });
                group.add(rect);
                break;
              }
            }
            group.on("click", pickNode);
            group.on("dragmove", dragStart);
            group.on("dragend", dragEnd);
            iconLayer.add(group);
          });
          iconLayer.batchDraw();
        } else {
          width.value = attrs.width;
          height.value = attrs.height;
        }
      })
    }
    isLoading.value = false;
  });
}

const loseFocusWhenSwitchExpansionItem = () => {
  mode.value = "v";
  let rect = iconLayer.find(".selected-fill");
  let group = iconLayer.find(".selected-cfm-object");
  if (rect.length) rect[0].name("fill");
  if (group.length) group[0].name("cfm-object");
}

onMounted(() => {
  initKonva();
  // load();
  window.addEventListener("keydown", cancelDraw);
});
onBeforeUnmount(() => {
  window.removeEventListener("keydown", cancelDraw);
});
</script>
