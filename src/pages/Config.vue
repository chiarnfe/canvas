<template>
  <CfmMenu />
  <div class="flex flex-row w-full" style="height: calc(100vh - 50px)">
    <div class="justify-between w-1/6 h-full shadow-md column">
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
          <div class="flex flex-col p-2 gap-y-2">
            <q-input
              outlined
              label="版面寬度"
              type="number"
              v-model.number="width"
              debounce="600"
              max="4500"
              :rules="[val => val <= 4500 || '最大寬度為4500']"
            />
            <q-input
              outlined
              label="版面高度"
              type="number"
              v-model.number="height"
              debounce="600"
              max="4500"
              :rules="[val => val <= 4500 || '最大高度為4500']"
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
                  val =>
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
                  val =>
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
                :rules="[val => val >= 3 || '邊數必須大於等於3']"
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
                    :style="{backgroundColor: eqpProps.fill}"
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
              <q-input v-show="eqpProps.category!='區域'&&eqpProps.category!='柱位'" outlined label="機台名稱" v-model="eqpProps.text" />
              <q-input v-show="eqpProps.category=='柱位'" outlined label="柱位名稱" v-model="eqpProps.pillar" />
              <q-input v-show="eqpProps.category=='區域'" outlined label="區域名稱" v-model="eqpProps.area" />
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
            <div class="flex flex-row justify-end gap-x-2">
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
          <div class="flex flex-col p-2 gap-y-2">
            <q-input outlined v-model="blockProps.fill" label="底圖背景色">
              <template v-slot:before>
                <span
                  class="w-6 h-4"
                  :style="{backgroundColor: blockProps.fill}"
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
            <q-input outlined v-model="blockProps.color" label="字體顏色">
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
            <q-input
              type="number"
              v-show="mode == 'e'"
              outlined
              :model-value="blockProps.width"
              @update:model-value="handleGroupScaleX"
              label="底圖寬度"
              debounce="600"
            />
            <q-input
              type="number"
              v-show="mode == 'e'"
              outlined
              :model-value="blockProps.height"
              @update:model-value="handleGroupScaleY"
              label="底圖高度"
              debounce="600"
            />
            <div class="flex flex-row justify-end gap-x-2">
              <q-btn
                v-show="mode == 'e'"
                unelevated
                style="width: 60px"
                color="negative"
                label="刪除"
                @click="destroyBlock"
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
      <q-btn
        unelevated
        class="q-ma-sm"
        color="primary"
        label="上傳"
        @click="saveToDb"
      />
    </div>
    <div class="relative w-5/6 px-4 pb-4">
      <div class="items-center justify-between py-3 row">
        <div class="flex flex-row items-center">
          <div class="flex flex-row gap-x-2 min-w-[360px]">
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
          <q-btn
            unelevated
            color="primary"
            class="q-ml-sm"
            style="height: 2.5rem"
            label="搜尋"
            @click="load"
          />
        </div>
        <div class="relative row gap-x-2 q-py-sm">
          <span class="absolute right-0 -top-3"
            >縮放比例{{ currentScale * 100 + '%' }}</span
          >
          <q-checkbox label="顯示格線" v-model="grid" />
          <q-space />
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
      <q-card-section class="items-center row q-pb-none text-h5">
        Attension
      </q-card-section>
      <q-card-section class="h-24">
        {{ message }}
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="關閉" color="primary" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
  <q-dialog v-model="isLoading" backdrop-filter="blur(4px)" persistent>
    <q-card class="w-96">
      <q-card-section class="items-center justify-center row q-pb-none text-h5">
        資料讀取中...
      </q-card-section>
      <q-card-section
        class="flex flex-col items-center justify-center h-48 pt-0"
      >
        <q-circular-progress
          font-size="16px"
          indeterminate
          size="90px"
          :thinkness="0.2"
          color="primary"
          center-color="grey-5"
          track-color="transparent"
          class="q-mb-md q-mx-md"
        />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
<script setup lang="ts">
import {ref, reactive, onMounted, onBeforeUnmount, watch} from 'vue'
import {useTick} from 'quasar'
import Konva from 'konva'
import $ from 'jquery'
import axios from 'axios'
import CfmMenu from '../components/CfmMenu.vue'
import { KonvaEventObject } from 'konva/lib/Node'
import { Vector2d } from 'konva/lib/types'

interface ChildObject {
  attrs:Konva.GroupConfig,
  className:string,
  children:any[]
}

const isLoading = ref(false)
const showPreview = ref(true)
const position = ref('top-16 right-7')
const width = ref(1800)
const height = ref(1200)

const sLocation = ref('科技')
const sFloor = ref('1F')
const sDepartment = ref('TEST')

const grid = ref(true)
const mode = ref<'v' | 'i' | 'e'>('v')
const editNode = ref(false)
const editBlock = ref(false)
const container = ref<HTMLDivElement | null>(null)
const currentScale = ref(1)

const dialog = ref(false)
const message = ref('')

let previewStage = reactive<{} | Konva.Stage>({})

let stage = ref<null|Konva.Stage>(null)

//const drop = ref(null);
//const undo = ref(null);

const mesh = 20

let previewLayer = reactive(
  new Konva.Layer({x: 0, y: 0, draggable: true, name: 'preview'}),
)
let iconLayer = reactive<Konva.Layer>(
  new Konva.Layer({x: 0, y: 0, draggable: false, name: 'icon'}),
)
let gridLayer = reactive<Konva.Layer>(
  new Konva.Layer({x: 0, y: 0, draggable: false, name: 'grid'}),
)

const shape = ref<'Rect' | 'Circle' | 'Ellipse' | 'Ring' | 'RegularPolygon'>(
  'Rect',
)

const scale = 0.25
const GUIDELINE_OFFSET = 5

const rectProps = reactive({
  width: 100,
  height: 50,
})

const circleProps = reactive({
  radius: 50,
})

// const wedgeOptions = reactive({
//   radius:60,
//   angle:60,
//   rotation:-90,
// });

const ellipseProps = reactive({
  radiusX: 80,
  radiusY: 40,
})

// const starOptions = reactive({
//   numPoints:5,
//   innerRadius:40,
//   outerRadius:70
// });

const ringProps = reactive({
  innerRadius: 40,
  outerRadius: 70,
})

// const arcOptions = reactive({
//   innerRadius:40,
//   outerRadius:70,
//   angle:60
// });

const regpolyProps = reactive({
  sides: 5,
  radius: 60,
})

const eqpProps = reactive({
  category: 'CP',
  text: '',
  fill: 'red',
  fontSize: 20,
  color: 'black',
  pillar:'',
  area:'',
})

const blockProps = reactive({
  fill: '#0018dd',
  name: '',
  color: 'black',
  opacity: 1,
  width: 0,
  height: 0,
})

const positionOptions = [
  {label: '右上', value: 'top-16 right-7'},
  {label: '左上', value: 'top-16 left-7'},
  {label: '右下', value: 'bottom-7 right-7'},
  {label: '左下', value: 'bottom-7 left-7'},
]
const locationOptions = ['科技', '創新', '力行'].map(l => ({
  label: l,
  value: l,
}))
const floorOptions = ref(
  ['1F', '2F', '3F', '7F'].map(l => ({value: l, label: l})),
)
const departmentOptions = ['TEST', 'DS'].map(l => ({label: l, value: l}))
const fontSizeOptions = [8, 10, 12, 14, 16, 18, 20, 22, 24].map(num => ({
  label: num.toString(),
  value: num,
}))

const categoryOptions = ref(
  ['CP', 'FT', '氮氣櫃', '溫溼度監控', '柱位', '區域'].map(l => ({
    label: l,
    value: l,
  })),
)

const shapeOptions = [
  {label: '矩形', value: 'Rect'},
  {label: '圓形', value: 'Circle'},
  //{label:"楔形", value:"Wedge"},
  //{label: '橢圓形', value: 'Ellipse'},
  //{label:"星形", value:"Star"},
  //{label: '環形', value: 'Ring'},
  //{label:"弧形", value:"Arc"},
  //{label: '正多邊形', value: 'RegularPolygon'},
]

const {registerTick} = useTick()

watch([sLocation, sFloor, sDepartment], async (nValue, oValue) => {
  renewKonva()
  let floor = ['1F', '2F', '3F', '7F']
  if (nValue[0] !== oValue[0]) {
    switch (nValue[0]) {
      case '創新': {
        sFloor.value = '2F'
        floor = ['2F', '3F', '4F']
        break
      }
      case '力行': {
        sFloor.value = '3F'
        floor = ['3F']
        break
      }
      case '科技': {
        sFloor.value = '1F'
        break
      }
    }
    floorOptions.value = floor.map(l => ({value: l, label: l}))
  }

  if (nValue[2] !== oValue[2]) {
    if (nValue[2] == 'TEST') {
      eqpProps.category = 'CP'
      categoryOptions.value = ['CP', 'FT', '氮氣櫃', '溫溼度監控', '柱位', '區域'].map(l => ({
        value: l,
        label: l,
      }))
    } else if (nValue[2] == 'DS') {
      eqpProps.category = 'DS'
      categoryOptions.value = ['DS', '氮氣櫃', '溫溼度監控', '加藥機', 'CO2機', '柱位', '區域'].map(l => ({
        value: l,
        label: l,
      }))
    }
  }
})

watch([width, height], (nValue, _) => {
  if (stage.value) {
    stage.value.width(nValue[0])
    stage.value.height(nValue[1])
    gridLayer.removeChildren()
    initGridLayer()
  }
})

watch(grid, (nValue, _) => {
  if (nValue) {
    initGridLayer()
  } else {
    gridLayer.removeChildren()
  }
})

watch(eqpProps, (nValue,_) => {
  if (nValue.category != '區域' && nValue.category != '柱位') {
    eqpProps.pillar = "";
    eqpProps.area = ""
  }
  if (nValue.category == '區域') {
    eqpProps.text = ''
    eqpProps.pillar = ''
  }
  if (nValue.category == '柱位') {
    eqpProps.text = ''
    eqpProps.area = ''
  }
})

// utils
const show = () => {
  showPreview.value = true
}

const hide = () => {
  showPreview.value = false
}

function getGridlineStops() {
  let vertical = [],
    horizontal = []
  if (stage.value) {
    stage.value.find('.v-line').forEach(line => {
      const {x} = line.getClientRect()
      vertical.push(x)
    })

    stage.value.find('.h-line').forEach(line => {
      const {y} = line.getClientRect()
      horizontal.push(y)
    })

    iconLayer.find('.cfm-object').forEach(children => {
      const {x, y, width, height} = children.getClientRect()
      vertical.push([x, x + width / 2, x + width])
      horizontal.push([y, y + height / 2, y + height])
    })
  }

  return {
    vertical: vertical.flat(),
    horizontal: horizontal.flat(),
  }
}

function getGuidelineStops(skipItem) {
  const vertical = [],
    horizontal = []
  if (stage.value) { 
    stage.value.find('.cfm-object').forEach(guideItem => {
      if (guideItem === skipItem) return

      const item = guideItem.getClientRect()
      vertical.push([item.x, item.x + item.width / 2, item.x + item.width])
      horizontal.push([item.y, item.y + item.width / 2, item.y + item.width])
    })

    stage.value.find('.v-line').forEach(l => {
      const {x} = l.getClientRect()
      if (!vertical.includes(x)) vertical.push(x)
    })

    stage.value.find('.h-line').forEach(l => {
      const {y} = l.getClientRect()
      if (!horizontal.includes(y)) horizontal.push(y)
    })
  }

  return {
    vertical: vertical.flat(),
    horizontal: horizontal.flat(),
  }
}

function getObjectSnappingEdges(node) {
  const item = node.getClientRect()
  const absPos = node.absolutePosition()

  return {
    vertical: [
      {
        guide: Math.round(item.x),
        offset: Math.round(absPos.x - item.x),
        snap: 'start',
      },
      // {
      //   guide: Math.round(item.x + item.width / 2),
      //   offset: Math.round(absPos.x - item.x - item.width / 2),
      //   snap: "center",
      // },
      {
        guide: Math.round(item.x + item.width),
        offset: Math.round(absPos.x - item.x - item.width),
        snap: 'end',
      },
    ],
    horizontal: [
      {
        guide: Math.round(item.y),
        offset: Math.round(absPos.y - item.y),
        snap: 'start',
      },
      // {
      //   guide: Math.round(item.y + item.height / 2),
      //   offset: Math.round(absPos.y - item.y - item.height / 2),
      //   snap: "center",
      // },
      {
        guide: Math.round(item.y + item.height),
        offset: Math.round(absPos.y - item.y - item.height),
        snap: 'end',
      },
    ],
  }
}

function getGuidelines(guideStops, itemBounds) {
  const resultV = []
  const resultH = []

  guideStops.vertical.forEach(lineGuide => {
    itemBounds.vertical.forEach(bound => {
      const diff = Math.abs(lineGuide - bound.guide)

      if (diff < GUIDELINE_OFFSET) {
        resultV.push({
          lineGuide,
          diff,
          snap: bound.snap,
          offset: bound.offset,
        })
      }
    })
  })

  guideStops.horizontal.forEach(lineGuide => {
    itemBounds.horizontal.forEach(bound => {
      const diff = Math.abs(lineGuide - bound.guide)

      if (diff < GUIDELINE_OFFSET) {
        resultH.push({
          lineGuide,
          diff,
          snap: bound.snap,
          offset: bound.offset,
        })
      }
    })
  })

  const guides = []

  const minV = resultV.sort((a, b) => a.diff - b.diff)[0]
  const minH = resultH.sort((a, b) => a.diff - b.diff)[0]

  if (minV) {
    guides.push({
      lineGuide: minV.lineGuide,
      offset: minV.offset,
      orientation: 'V',
      snap: minV.snap,
    })
  }

  if (minH) {
    guides.push({
      lineGuide: minH.lineGuide,
      offset: minH.offset,
      orientation: 'H',
      snap: minH.snap,
    })
  }

  return guides
}

const drawGridGuideLine = guides => {
  guides.forEach(guideline => {
    if (guideline.orientation === 'H') {
      const line = new Konva.Line({
        points: [-6000, 0, 6000, 0],
        stroke: 'rgb(0, 161, 255)',
        strokeWidth: 1,
        name: 'grid-guide-line',
        dash: [4, 6],
      })
      gridLayer.add(line)
      line.absolutePosition({
        x: 0,
        y: guideline.lineGuide,
      })
    }

    if (guideline.orientation === 'V') {
      const line = new Konva.Line({
        points: [0, -6000, 0, 6000],
        stroke: 'rgb(0,161,255)',
        strokeWidth: 1,
        name: 'grid-guide-line',
        dash: [4, 6],
      })
      gridLayer.add(line)
      line.absolutePosition({
        x: guideline.lineGuide,
        y: 0,
      })
    }
  })
}

function drawGuideline(guides) {
  guides.forEach(guideline => {
    if (guideline.orientation === 'H') {
      const line = new Konva.Line({
        points: [-6000, 0, 6000, 0],
        stroke: 'rgb(0, 161, 255)',
        strokeWidth: 1,
        name: 'guide-line',
        dash: [4, 6],
      })
      iconLayer.add(line)
      line.absolutePosition({
        x: 0,
        y: guideline.lineGuide,
      })
    }

    if (guideline.orientation === 'V') {
      const line = new Konva.Line({
        points: [0, -6000, 0, 6000],
        stroke: 'rgb(0,161,255)',
        strokeWidth: 1,
        name: 'guide-line',
        dash: [4, 6],
      })
      iconLayer.add(line)
      line.absolutePosition({
        x: guideline.lineGuide,
        y: 0,
      })
    }
  })
}

function zoomIn() {
  const lastScale = stage.value?.scaleX() as number
  stage.value?.scale({
    x: scale + lastScale,
    y: scale + lastScale,
  })
  stage.value?.width(width.value * (scale + lastScale))
  stage.value?.height(height.value * (scale + lastScale))
  currentScale.value = lastScale + scale
}

function zoomOut() {
  const lastScaleX = stage.value?.scaleX() as number
  if (lastScaleX > 0.25) {
    stage.value?.scale({
      x: lastScaleX - scale,
      y: lastScaleX - scale,
    })

    stage.value?.width(width.value * (lastScaleX - scale))
    stage.value?.height(height.value * (lastScaleX - scale))
    currentScale.value = lastScaleX - scale
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
  let {top, left} = container.value!.getBoundingClientRect()
  let {x, y} = evt.evt
  let currentScaleX = 1,
    currentScaleY = 1

  currentScaleX = stage.value?.scaleX() as number
  currentScaleY = stage.value?.scaleY() as number
  
  let originX = -left + x,
    originY = -top + y
  let previewShape: Konva.Shape
  let fontSize = 12
  let group = new Konva.Group({
    x:originX,
    y:originY,
    opacity:0.5,
    name:'cfm-object'
  })
  let estText = eqpProps.text
  if (eqpProps.category == '區域') {
    estText = eqpProps.area
    group.addName("cfm-area")
  } else if (eqpProps.category == '柱位') {
    estText = eqpProps.pillar
    group.addName("cfm-pillar")
  } else {
    group.addName("cfm-eqp")
  }
  
  const estTextWidth = new Konva.Text({
    fontSize: eqpProps.fontSize,
  }).measureSize(estText)

  const estCategoryWidth = new Konva.Text({fontSize}).measureSize(
    eqpProps.category,
  )

  let category = new Konva.Text({
    x: 0,
    y: 0,
    width: estCategoryWidth.width,
    height: estCategoryWidth.height,
    opacity: 0,
    text: eqpProps.category,
    fontSize,
    name: 'category',
  })

  switch (shape.value) {
    case 'Rect': {
      let txt = new Konva.Text({
        x: (rectProps.width - estTextWidth.width) / 2,
        y: (rectProps.height - estTextWidth.height) / 2,
        width: estTextWidth.width,
        height: estTextWidth.height,
        fill: eqpProps.color,
        text: estText,
        fontSize: eqpProps.fontSize,
        name: 'name',
      })

      previewShape = new Konva.Rect({
        x: 0,
        y: 0,
        width: rectProps.width,
        height: rectProps.height,
        fill: eqpProps.fill,
        name: 'cfm-frame',
        stroke: 'black',
        strokeWidth: 2,
      })

      group.add(previewShape)
      group.add(txt)
      group.add(category)
      break
    }
    case 'Circle': {
      let txt = new Konva.Text({
        x: circleProps.radius - estTextWidth.width / 2,
        y: circleProps.radius - estTextWidth.height / 2,
        width: estTextWidth.width,
        height: estTextWidth.height,
        fill: eqpProps.color,
        text: estText,
        fontSize: eqpProps.fontSize,
        name: 'name',
      })

      previewShape = new Konva.Circle({
        x: circleProps.radius,
        y: circleProps.radius,
        radius: circleProps.radius,
        fill: eqpProps.fill,
        name: 'cfm-frame',
        stroke: 'black',
        strokeWidth: 2,
      })

      group.add(previewShape)
      group.add(txt)
      group.add(category)
      break
    }
    case 'Ellipse': {
      let txt = new Konva.Text({
        x: ellipseProps.radiusX - estTextWidth.width / 2,
        y: ellipseProps.radiusY - estTextWidth.height / 2,
        width: estTextWidth.width,
        height: estTextWidth.height,
        fill: eqpProps.color,
        text: estText,
        fontSize: eqpProps.fontSize,
        name: 'name',
      })

      previewShape = new Konva.Ellipse({
        x: ellipseProps.radiusX,
        y: ellipseProps.radiusY,
        radiusX: ellipseProps.radiusX,
        radiusY: ellipseProps.radiusY,
        fill: eqpProps.fill,
        name: 'cfm-frame',
        stroke: 'black',
        strokeWidth: 2,
      })

      group.add(previewShape)
      group.add(txt)
      group.add(category)
      break
    }
    case 'RegularPolygon': {
      let txt = new Konva.Text({
        x: regpolyProps.radius - estTextWidth.width / 2,
        y: regpolyProps.radius - estTextWidth.height / 2,
        width: estTextWidth.width,
        height: estTextWidth.height,
        fill: eqpProps.color,
        text: estText,
        fontSize: eqpProps.fontSize,
        name: 'name',
      })

      previewShape = new Konva.RegularPolygon({
        x: regpolyProps.radius,
        y: regpolyProps.radius,
        radius: regpolyProps.radius,
        sides: regpolyProps.sides,
        fill: eqpProps.fill,
        name: 'cfm-frame',
        stroke: 'black',
        strokeWidth: 2,
      })

      group.add(previewShape)
      group.add(txt)
      group.add(category)
      break
    }
    case 'Ring': {
      let txt = new Konva.Text({
        x: ringProps.outerRadius - estTextWidth.width / 2,
        y: ringProps.outerRadius - estTextWidth.height / 2,
        width: estTextWidth.width,
        height: estTextWidth.height,
        fill: eqpProps.color,
        text: estText,
        fontSize: eqpProps.fontSize,
        name: 'name',
      })

      previewShape = new Konva.Ring({
        x: ringProps.outerRadius,
        y: ringProps.outerRadius,
        outerRadius: ringProps.outerRadius,
        innerRadius: ringProps.innerRadius,
        fill: eqpProps.fill,
        name: 'cfm-frame',
        stroke: 'black',
        strokeWidth: 2,
      })

      group.add(previewShape)
      group.add(txt)
      group.add(category)
      break
    }
  }

  if (previewLayer.children.length < 1 && group) {
    previewLayer.add(group)
    previewLayer.draw()
    group.startDrag()
    window.removeEventListener('keydown', cancelInsert)
    group.off('dragmove', startInsertSnapping)
    stage.value?.off('mouseup', keepDrag)
    stage.value?.off('mousedown', insertToIconLayer)

    window.addEventListener('keydown', cancelInsert)
    group.on('dragmove', startInsertSnapping)
    stage.value?.on('mouseup', keepDrag)
    stage.value?.on('mousedown', insertToIconLayer)
  }
}

const cancelInsert = (evt: KeyboardEvent | MouseEvent) => {
  if ((evt instanceof KeyboardEvent && evt.key === 'Escape') || evt.type === 'mouseleave') {
    stage.value?.off('mouseup', keepDrag)
    stage.value?.off('mousedown', insertToIconLayer)
    previewLayer.getChildren().forEach(children => {
      children.off()
      children.destroy()
    })
    gridLayer.find('.grid-guide-line').forEach(l => l.destroy())
  }
}

const insertToIconLayer = () => {
  let nodeCount = iconLayer.getChildren().length
  let children = previewLayer.getChildren()[0]
  let clone = children.clone().opacity(1)
  clone.on('click', pickNode)
  clone.on('dragmove', dragStart)
  clone.on('dragend', dragEnd)
  iconLayer.add(clone)
  clone.zIndex(nodeCount)
  iconLayer.draw()
}

const keepDrag = () => {
  previewLayer.getChildren().forEach(children => children.startDrag())
}

const startInsertSnapping = (evt: Konva.KonvaEventObject<MouseEvent>) => {
  const {left, top} = document!.getElementById('canvas_container')!.getBoundingClientRect()

  stage.value?.find('.grid-guide-line').forEach((l: Konva.Node) => l.destroy())
  const {target} = evt
  // target.y(Math.max(target.y(), 0));
  // target.x(Math.max(target.x(), 0));

  const gridlineStops = getGridlineStops()
  if (stage.value?.scaleX() !== 1 || stage.value?.scaleY() !== 1)
    target.absolutePosition({
      x: evt.evt.clientX - left,
      y: evt.evt.clientY - top,
    })
  const itemBounds = getObjectSnappingEdges(target)
  const guides = getGuidelines(gridlineStops, itemBounds)
  if (!guides.length) return

  drawGridGuideLine(guides)

  const absPos = target.absolutePosition()
  guides.forEach(line => {
    switch (line.orientation) {
      case 'V': {
        absPos.x = line.lineGuide + line.offset
        break
      }
      case 'H': {
        absPos.y = line.lineGuide + line.offset
        break
      }
    }
  })

  target.absolutePosition(absPos)
}

const pickNode = (evt: Konva.KonvaEventObject<MouseEvent>) => {
  editNode.value = true
  mode.value = 'e'
  let group = evt.target.getParent() as Konva.Group
  group.draggable(true)
  group.addName("selected-cfm-object")
  const [frame, txt, category] = group.getChildren()
  eqpProps.category = category.getAttrs().text
  eqpProps.color = txt.getAttrs().fill
  eqpProps.text = txt.getAttrs().text
  eqpProps.fontSize = txt.getAttrs().fontSize
  eqpProps.fill = frame.getAttrs().fill
  let className = frame.getClassName() as
    | 'Rect'
    | 'Circle'
    | 'Ellipse'
    | 'RegularPolygon'
    | 'Ring'
  shape.value = className

  switch (className) {
    case 'Rect': {
      rectProps.width = frame.getAttr('width')
      rectProps.height = frame.getAttr('height')
      break
    }
    case 'Circle': {
      circleProps.radius = frame.getAttr('radius')
      break
    }
    case 'Ellipse': {
      ellipseProps.radiusX = frame.getAttr('radiusX')
      ellipseProps.radiusY = frame.getAttr('radiusY')
      break
    }
    case 'RegularPolygon': {
      regpolyProps.sides = frame.getAttr('sides')
      regpolyProps.radius = frame.getAttr('radius')
      break
    }
    case 'Ring': {
      ringProps.innerRadius = frame.getAttr('innerRadius')
      ringProps.outerRadius = frame.getAttr('outerRadius')
      break
    }
  }
}

const updateNode = () => {
  let target = iconLayer.find('.selected-cfm-object')
  if (target.length) {
    let group = target[0] as Konva.Group
    const [frame, nameText, categoryText] = group.getChildren()
    const {fill, fontSize, text, color, pillar, area, category} = eqpProps
  
    const txtWidth = new Konva.Text({fontSize}).measureSize(text)
    const categoryWidth = new Konva.Text({fontSize: 12}).measureSize(
      eqpProps.category,
    )
    let className = frame.getClassName()
  
    frame.setAttr('fill', fill)
    category.width(categoryWidth.width)
    category.setAttr('text', eqpProps.category)
    switch (className) {
      case 'Rect': {
        txt.setAttrs({
          x: (rectProps.width - txtWidth.width) / 2,
          y: (rectProps.height - txtWidth.height) / 2,
          width: txtWidth.width,
          height: txtWidth.height,
          text,
          fontSize,
          fill: color,
        })
        frame.setAttr('width', rectProps.width)
        frame.setAttr('height', rectProps.height)
        break
      }
      case 'Circle': {
        txt.setAttrs({
          x: circleProps.radius - txtWidth.width / 2,
          y: circleProps.radius - txtWidth.height / 2,
          width: txtWidth.width,
          height: txtWidth.height,
          text,
          fontSize,
          fill: color,
        })
        frame.setAttr('radius', circleProps.radius)
        break
      }
      case 'Ellipse': {
        txt.setAttrs({
          x: ellipseProps.radiusX - txtWidth.width / 2,
          y: ellipseProps.radiusY - txtWidth.height / 2,
          width: txtWidth.width,
          height: txtWidth.height,
          text,
          fontSize,
          fill: color,
        })
        frame.setAttr('radiusX', ellipseProps.radiusX)
        frame.setAttr('radiusY', ellipseProps.radiusY)
        break
      }
      case 'RegularPolygon': {
        txt.setAttrs({
          x: regpolyProps.radius - txtWidth.width / 2,
          y: regpolyProps.radius - txtWidth.height / 2,
          width: txtWidth.width,
          height: txtWidth.height,
          fill: color,
          text,
          fontSize,
        })
        frame.setAttr('sides', regpolyProps.sides)
        frame.setAttr('radius', regpolyProps.radius)
        break
      }
      case 'Ring': {
        txt.setAttrs({
          x: ringProps.outerRadius - txtWidth.width / 2,
          y: ringProps.outerRadius - txtWidth.height / 2,
          width: txtWidth.width,
          height: txtWidth.height,
          fill: color,
          text,
          fontSize,
        })
        frame.setAttrs({
          x: ringProps.outerRadius,
          y: ringProps.outerRadius,
          outerRadius: ringProps.outerRadius,
          innerRadius: ringProps.innerRadius,
        })
        break
      }
    }
    group.removeName('selected-cfm-object')
    group.draggable(false)
  }
  mode.value = 'v'
}

const destroyNode = () => {
  const group = iconLayer.find('.selected-cfm-object')
  if (group.length) {
    group[0].off()
    group[0].destroy()
  }
  mode.value = 'v'
}

const dragStart = (evt:KonvaEventObject<MouseEvent>) => {
  iconLayer.find('.guide-line').forEach(l => l.destroy())
  const lineGuideStops = getGuidelineStops(evt.target)
  const itemBounds = getObjectSnappingEdges(evt.target)
  const guides = getGuidelines(lineGuideStops, itemBounds)

  if (!guides.length) return

  drawGuideline(guides)

  const absPos = evt.target.absolutePosition()

  guides.forEach(line => {
    switch (line.orientation) {
      case 'V': {
        absPos.x = line.lineGuide + line.offset
        break
      }
      case 'H': {
        absPos.y = line.lineGuide + line.offset
        break
      }
    }
  })
  evt.target.absolutePosition(absPos)
}

const dragEnd = () => {
  iconLayer.find('.guide-line').forEach(l => l.destroy())
}

const createPreviewBlock = () => {
  stage.value?.find('.grid-guide-line').forEach(l => l.destroy())
  const pos = stage.value?.getPointerPosition() as Vector2d
  let group = new Konva.Group({
    x:pos?.x,
    y:pos?.y,
    width: 0,
    height: 0,
    name: 'block',
  })
  let text = new Konva.Text({
    fontSize: 12,
    text: blockProps.name,
    fill: blockProps.color,
    opacity: 0.5,
    name: 'name',
  })
  let rect = new Konva.Rect({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    opacity: 0.5,
    fill: blockProps.fill,
    name: 'fill',
  })
  group.add(rect).add(text)
  stage.value?.off('mousemove', showGridlineGuide)

  if (!previewLayer.getChildren().length) {
    previewLayer.add(group)
    stage.value?.off('mousemove', drawPreviewBlock)
    stage.value?.on('mousemove', drawPreviewBlock)
  }
}

const drawPreviewBlock = () => {
  stage.value?.find('.grid-guide-line').forEach(l => l.destroy())
  let pos = stage.value?.getPointerPosition()
  let group = previewLayer.getChildren()[0] as Konva.Group
  let x = group.x()
  let y = group.y()
  let width = Math.abs(pos!.x- x),
    height = Math.abs(pos!.y - y)
  let offsetX = 0,
    offsetY = 0
  if (pos!.x - x < 0) offsetX = width
  if (pos!.y - y < 0) offsetY = height
  let rect = group.find('Rect')[0]
  let text = group.find('Text')[0]
  rect.width(width)
  rect.height(height)
  if (pos!.x - x < 0) {
    rect.offsetX(offsetX)
    text.offsetX(offsetX)
  }
  if (pos!.y - y < 0) {
    rect.offsetY(offsetY)
    text.offsetY(offsetY)
  }
  const gridlineStops = getGridlineStops()
  const itemBounds = {
    vertical: [
      {
        guide: Math.round(pos!.x),
        offset: 0,
        snap: offsetX > 0 ? 'end' : 'start',
      },
    ],
    horizontal: [
      {
        guide: Math.round(pos!.y),
        offset: 0,
        snap: offsetY > 0 ? 'end' : 'start',
      },
    ],
  }
  const guides = getGuidelines(gridlineStops, itemBounds)
  if (!guides.length) return
  drawGridGuideLine(guides)
}

const drawBlockToLayer = () => {
  let _stage = stage.value as Konva.Stage
  _stage.container().style.cursor = 'default'
  stage.value?.off('mousemove', drawPreviewBlock)
  stage.value?.off('mousedown', createPreviewBlock)
  stage.value?.off('mouseenter', beforeDrawPreviewBlock)
  if (previewLayer.getChildren().length) {
    let group = previewLayer.getChildren()[0].clone()
    group.find('Text')[0].opacity(blockProps.opacity)
    group.find('Rect')[0].opacity(1)
    group.on('click', pickBlock)
    iconLayer.add(group)
    iconLayer.draw()
    let itemCount = iconLayer.getChildren().length
    iconLayer.find('.block').forEach((f, i) => f.zIndex(i))
    iconLayer.find('.cfm-object').forEach((o, i) => o.zIndex(itemCount - 1 - i))
  }
  previewLayer.removeChildren()
  stage.value?.find('.grid-guide-line').forEach(l => l.destroy())
  stage.value?.off('mouseup', drawBlockToLayer)
}

const moveBlock = (evt:KonvaEventObject<MouseEvent>) => {
  stage.value?.find('.guide-line').forEach(l => l.destroy())
  let lineGuideStops = getGuidelineStops(evt.target)
  let itemBounds = getObjectSnappingEdges(evt.target)
  const guides = getGuidelines(lineGuideStops, itemBounds)
  if (!guides.length) return
  drawGuideline(guides)
  const absPos = evt.target.absolutePosition()

  guides.forEach(line => {
    switch (line.orientation) {
      case 'V': {
        absPos.x = line.lineGuide + line.offset
        break
      }
      case 'H': {
        absPos.y = line.lineGuide + line.offset
        break
      }
    }
  })
  evt.target.absolutePosition(absPos)
}

const leaveBlock = () => {
  stage.value?.find('.guide-line').forEach(l => l.destroy())
}

const pickBlock = (evt:KonvaEventObject<MouseEvent>) => {
  iconLayer.find('.block').forEach(grp => {
    if (grp.isAncestorOf(evt.target)) {
      evt.target.name('selected-fill')
    } else {
      grp.find('Rect')[0].name('fill')
    }
  })

  let tr = new Konva.Transformer({
    visible: true,
    rotateEnabled: false,
    flipEnabled: false,
  })
  let group = evt.target.getParent() as Konva.Group
  group.on('dragmove', moveBlock)
  group.on('mouseup', leaveBlock)
  group.on('transformend', blockTransformend)

  tr.nodes([group])
  iconLayer.add(tr)
  iconLayer.draw()
  iconLayer.find('Transformer').forEach(child => {
    if (child._id !== tr._id) child.destroy()
  })

  let rect = group.find('Rect')[0]
  let txt = group.find('Text')[0]
  group.draggable(true)
  editBlock.value = true
  mode.value = 'e'
  blockProps.fill = rect.getAttr('fill')
  blockProps.name = txt.getAttr('text')
  blockProps.opacity = txt.getAttr('opacity')
  blockProps.color = txt.getAttr('fill')
  blockProps.width = Math.ceil(rect.width() * group.scaleX())
  blockProps.height = Math.ceil(rect.height() * group.scaleY())
}

const blockTransformend = (evt:KonvaEventObject<MouseEvent>) => {
  let group = evt.target as Konva.Group
  let rect = group.find('Rect')[0]
  blockProps.width = Math.ceil(rect.width() * evt.target.scaleX())
  blockProps.height = Math.ceil(rect.height() * evt.target.scaleY())
}

const handleGroupScaleX = (evt: number) => {
  let selectedFill = iconLayer.find('.selected-fill')
  if (selectedFill.length) {
    let rect = selectedFill[0]
    let group = rect.getParent() as Konva.Group
    let width = rect.width()
    let scaleX = evt / width
    group.scaleX(scaleX)
  }
  blockProps.width = evt
}

const handleGroupScaleY = (evt: number) => {
  let selectedFill = iconLayer.find('.selected-fill')
  if (selectedFill.length) {
    let rect = selectedFill[0]
    let group = rect.getParent() as Konva.Group
    let height = rect.height()
    let scaleY = evt / height
    group.scaleY(scaleY)
  }
  blockProps.height = evt
}

const updateBlock = () => {
  mode.value = 'v'
  let transformer = iconLayer.find('Transformer')[0] as Konva.Transformer
  transformer.detach()
  let rect = iconLayer.find('.selected-fill')[0]
  let group = rect.getParent() as Konva.Group
  let txt = group.find('Text')[0]
  group.off('dragmove', moveBlock)
  group.off('mouseup', leaveBlock)
  group.draggable(false)
  rect.setAttr('fill', blockProps.fill)
  txt.setAttrs({
    text: blockProps.name,
    fill: blockProps.color,
    opacity: blockProps.opacity,
  })
  rect.name('fill')
}

const destroyBlock = () => {
  let group = iconLayer.find('.selected-fill')[0].getParent() as Konva.Group
  let transformer = iconLayer.find('Transformer')[0]
  group.off()
  group.destroy()
  transformer.destroy()
  mode.value = 'v'
}

const beforeDrawPreviewBlock = () => {
  let _stage = stage.value as Konva.Stage
  _stage.container().style.cursor = 'crosshair'
  stage.value?.off('mousemove', showGridlineGuide)
  stage.value?.on('mousemove', showGridlineGuide)
}

const showGridlineGuide = () => {
  stage.value?.find('.grid-guide-line').forEach(l => l.destroy())
  const gridlineStops = getGridlineStops()
  const {x, y} = stage.value!.getPointerPosition() as Vector2d
  const itemBounds = {
    vertical: [
      {
        guide: Math.round(x),
        offset: 0,
        snap: 'start',
      },
    ],
    horizontal: [
      {
        guide: Math.round(y),
        offset: 0,
        snap: 'start',
      },
    ],
  }
  const guides = getGuidelines(gridlineStops, itemBounds)
  if (!guides.length) return
  drawGridGuideLine(guides)
}

const cancelDrawPreviewBlock = () => {
  stage.value?.find('.grid-guide-line').forEach(l => l.destroy())
  let _stage = stage.value as Konva.Stage
  _stage.container().style.cursor = 'default'
  stage.value?.off('mousemove', showGridlineGuide)
}

function drawBlock() {
  stage.value?.off('mouseenter', beforeDrawPreviewBlock)
  stage.value?.off('mousedown', createPreviewBlock)
  stage.value?.off('mouseup', drawBlockToLayer)
  stage.value?.off('mouseleave', cancelDrawPreviewBlock)
  stage.value?.on('mouseenter', beforeDrawPreviewBlock)
  stage.value?.on('mousedown', createPreviewBlock)
  stage.value?.on('mouseup', drawBlockToLayer)
  stage.value?.on('mouseleave', cancelDrawPreviewBlock)
}

const scroll = () => {
  if (previewLayer.getChildren().length) {
    let absPos = stage.value?.getPointerPosition()
    let children = previewLayer.getChildren()[0]
    children.absolutePosition(absPos as Vector2d)
  }
}

function cancelDraw(evt: KeyboardEvent | MouseEvent) {
  if ((evt instanceof KeyboardEvent && evt.key == 'Escape') || evt.type == 'mouseleave') {
      stage.value?.off('mouseenter', enter)
      mode.value = 'v'
      iconLayer
        .find('.selected-cfm-object')
        .forEach(children => children.name('cfm-object'))
  }
}

function predraw() {
  if (previewLayer.getChildren().length) {
    previewLayer.removeChildren()
  }

  stage.value?.find('.grid-guide-line').forEach((l) => l.destroy())
  stage.value?.off('mouseenter', enter)
  stage.value?.on('mouseenter', enter)
}

const drawGridLine = (direction: 'V' | 'H', mesh: number) => {
  const qBool = direction == 'V'
  const scrollarea = $('.q-scrollarea')
  const qSize = qBool ? (scrollarea.width() ?? 0) : (scrollarea.height() ?? 0)

  const size = qBool ? width.value : height.value
  const steps = Math.round(size / mesh)
  let buffer = []
  for (let i = 0; i <= steps; i++) {
    let stroke = i == 0 ? 'rgba(0,0,0,0)' : 'rgba(0,0,0,0.2)'
    buffer.push(i * mesh)
    if (i == steps && size > qSize) {
      stroke = 'rgba(0,0,0,0)'
    }

    gridLayer.add(
      new Konva.Line({
        x: qBool ? i * mesh : 0,
        y: qBool ? 0 : i * mesh,
        points: qBool ? [0, 0, 0, height.value] : [0, 0, width.value, 0],
        stroke,
        strokeWidth: 1,
        name: qBool ? 'v-line' : 'h-line',
      }),
    )
  }
  gridLayer.batchDraw()
}

const initGridLayer = () => {
  drawGridLine('V', mesh)
  drawGridLine('H', mesh)
}

// init canvas
function initKonva() {
  stage.value = new Konva.Stage({
    container: 'canvas_container',
    width: width.value,
    height: height.value,
    name: 'main',
  })

  stage.value.add(iconLayer as Konva.Layer)
  stage.value.add(previewLayer as Konva.Layer)
  stage.value.add(gridLayer as Konva.Layer)
  initGridLayer()
}

const renewKonva = () => {
  
  stage.value?.off()
  stage.value?.width(width.value)
  stage.value?.height(height.value)
  iconLayer.removeChildren()
  previewLayer.removeChildren()
  gridLayer.removeChildren()

  initGridLayer()
}

const initPreview = () => {
  const divide = 8
  const minimap_width = ($('.q-scrollarea')?.width() ?? 0) / divide
  const minimap_height = ($('.q-scrollarea')?.height() ?? 0) / divide

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
}


const saveToDb = async () => {
  iconLayer.find('Transformer').forEach(transformer => transformer.destroy())

  let payload = {
    PageName: sDepartment.value + '_CFM_MAP',
    BU: '',
    DeleteArr: [],
    InsertArr: [],
    UpdateArr: [],
  }

  let dept = sDepartment.value == 'TEST' ? '測試' : '切挑'
  stage.find('Group').forEach(group => {
    let str = [sLocation.value, sFloor.value]
    let name = group.find('.name')[0].getAttr('text')
    str.push(name)
    let obj = group.toObject()
    let zIndex = group.zIndex()
    obj['zIndex'] = zIndex

    if (group.name() == 'cfm-object') {
      let bu = group.find('.category')[0].getAttr('text')
      if (!['CP', 'DS', 'FT'].includes(bu)) {
        str.push(bu + `(${dept})`)
      } else {
        str.push(bu)
      }
    } else if (group.name() == 'block') {
      str.push('底圖' + `(${dept})`)
    }
    let groupAttrs: string = JSON.stringify(obj).replaceAll(',', '，')
    str.push(groupAttrs)
    payload.InsertArr.push(str.join(','))
  })
  let stageStr = [sLocation.value, sFloor.value, '圖層', `圖層(${dept})`]
  let stageAttr = JSON.stringify({
    width: width.value,
    height: height.value,
  }).replaceAll(',', '，')
  stageStr.push(stageAttr)
  payload.InsertArr.push(stageStr.join(','))

  let res = await axios.post(
    window.location.origin + window.location.pathname + '/../Update',
    payload,
  )
  if (res.status == 200 && res.data[1]) {
    dialog.value = true
    message.value = '儲存成功!'
    iconLayer.removeChildren()
    load()
  }
}

const load = async () => {
  isLoading.value = true
  iconLayer.removeChildren()
  let payload = {
    BU: '',
    NumberPerAPage: -1,
    PageName: sDepartment.value + '_CFM_MAP',
    QueryArr: [],
  }

  if (sDepartment.value == 'DS')
    payload.QueryArr = [sLocation.value, sFloor.value, '', '', '', '']
  else if (sDepartment.value == 'TEST')
    payload.QueryArr = [
      sLocation.value,
      sFloor.value,
      '機台',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
    ]

  registerTick(async () => {
    // let res = await axios.post(
    //   window.location.origin + window.location.pathname + '/../HomePageSearch',
    //   payload,
    // )
    let data : string[]= [
        "UF574,,,,1039.94,CP,{\"attrs\":{\"x\":520.5，\"y\":200.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF574\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":179},,NS,rgb(166，166，166),移機 ;UF574,,,,1039.94,CP,{\"attrs\":{\"x\":520.5，\"y\":200.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF574\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":179},,NS,rgb(166，166，166),移機 ",
        "B,,,,,CP,{\"attrs\":{\"x\":20.5，\"y\":0.5，\"width\":20，\"height\":20，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(0，0，0)\"，\"height\":20，\"width\":20，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"B\"，\"x\":5.3310546875，\"y\":3，\"fontSize\":14}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":180},,,,",
        "B,,,,,CP,{\"attrs\":{\"x\":620.5，\"y\":1120.5，\"width\":20，\"height\":20，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(0，0，0)\"，\"height\":20，\"width\":20，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"B\"，\"x\":5.3310546875，\"y\":3，\"fontSize\":14}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":181},,,,",
        "UF03,PG6967-002,7D,AC,2.96,CP,{\"attrs\":{\"x\":920.5，\"y\":580.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF03\"，\"x\":10.328125，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":182},25,WORK,rgb(0，128，0),換程式-重測 ",
        "UF40,*,7D,BGG,385.72,CP,{\"attrs\":{\"x\":1240.5，\"y\":580.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF40\"，\"x\":10.328125，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":183},30,NS,rgb(166，166，166),無產能/節能關機 ",
        "UF564,*,7D,CKQ,3.72,CP,{\"attrs\":{\"x\":940.5，\"y\":320.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF564\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":184},25,LEND,rgb(0，255，255),AD 松翰科技 客戶借機 ",
        "UF143,PG5603-009,7D,CCQ,5.17,CP,{\"attrs\":{\"x\":1360.5，\"y\":580.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF143\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":185},25,LOSS,rgb(255，255，204),待料 ",
        "B,,,,,CP,{\"attrs\":{\"x\":1660.5，\"y\":0.5，\"width\":20，\"height\":20，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(0，0，0)\"，\"height\":20，\"width\":20，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"B\"，\"x\":5.3310546875，\"y\":3，\"fontSize\":14}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":186},,,,",
        "UF215,*,7D,AC,6.58,CP,{\"attrs\":{\"x\":240.5，\"y\":540.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF215\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":187},25,LEND,rgb(0，255，255),ZX 智安電子 客戶借機 ",
        "B,,,,,CP,{\"attrs\":{\"x\":880.5，\"y\":1220.5，\"width\":20，\"height\":20，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(0，0，0)\"，\"height\":20，\"width\":20，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"B\"，\"x\":5.3310546875，\"y\":3，\"fontSize\":14}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":188},,,,",
        "UF28,,,,,CP,{\"attrs\":{\"x\":920.5，\"y\":460.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF28\"，\"x\":10.328125，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":189},,,,",
        "UF27,,,,,CP,{\"attrs\":{\"x\":860.5，\"y\":460.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF27\"，\"x\":10.328125，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":190},,,,",
        "B,,,,,CP,{\"attrs\":{\"x\":1920.5，\"y\":320.5，\"width\":20，\"height\":20，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(0，0，0)\"，\"height\":20，\"width\":20，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"B\"，\"x\":5.3310546875，\"y\":3，\"fontSize\":14}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":191},,,,",
        "UF414,PG7113-012,2C,BNB,14.10,CP,{\"attrs\":{\"x\":1340.5，\"y\":840.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF414\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":192},25,WORK,rgb(0，128，0),生產 ",
        "UF140,,,,,CP,{\"attrs\":{\"x\":180.5，\"y\":20.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF140\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":193},,,,",
        "UF570,*,2C,AD,0.71,CP,{\"attrs\":{\"x\":880.5，\"y\":120.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF570\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":194},-20,LEND,rgb(0，255，255),ET 普誠科技 客戶借機 ",
        "UF567,*,7D,BCA,1.19,CP,{\"attrs\":{\"x\":880.5，\"y\":200.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF567\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":195},25,NS,rgb(166，166，166),無產能/節能關機 ",
        "UF397,PG4331-001,7D,HG,0.22,CP,{\"attrs\":{\"x\":1600.5，\"y\":260.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF397\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":196},25,WORK,rgb(0，128，0),換批/原批生產 ",
        "UF579,PG7113-006,2C,BNB,11.85,CP,{\"attrs\":{\"x\":920.5，\"y\":1080.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF579\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":197},25,WORK,rgb(0，128，0),換批/原批生產 ",
        "UF547,*,7D,BWY,150.73,CP,{\"attrs\":{\"x\":880.5，\"y\":40.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF547\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":198},25,LEND,rgb(0，255，255),AD 松翰科技 客戶借機 ",
        "UF351,*,7D,GK,192.84,CP,{\"attrs\":{\"x\":540.5，\"y\":960.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF351\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":199},25,NS,rgb(166，166，166),無產能/節能關機 ",
        "B,,,,,CP,{\"attrs\":{\"x\":2180.5，\"y\":0.5，\"width\":20，\"height\":20，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(0，0，0)\"，\"height\":20，\"width\":20，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"B\"，\"x\":5.3310546875，\"y\":3，\"fontSize\":14}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":200},,,,",
        "UF63,*,7D,BPB,24.66,CP,{\"attrs\":{\"x\":920.5，\"y\":400.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF63\"，\"x\":10.328125，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":201},25,NS,rgb(166，166，166),無產能/節能關機 ",
        "UF403,PG7271-021,7D,CAY,11.07,CP,{\"attrs\":{\"x\":920.5，\"y\":1020.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF403\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":202},25,WORK,rgb(0，128，0),換批/原批生產 ",
        "UF569,*,7D,AC,215.59,CP,{\"attrs\":{\"x\":940.5，\"y\":120.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF569\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":203},25,LEND,rgb(0，255，255),CKG 雅特力 客戶借機 ",
        "UF96,*,7D,AD,311.75,CP,{\"attrs\":{\"x\":860.5，\"y\":400.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF96\"，\"x\":10.328125，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":204},25,NS,rgb(166，166，166),無產能/節能關機 ",
        "UF400,*,7D,AD,0.22,CP,{\"attrs\":{\"x\":2208.5，\"y\":630.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF400\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":205},25,LOSS,rgb(255，255，204),待料 ",
        "UF46,,,,,CP,{\"attrs\":{\"x\":60.5，\"y\":420.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF46\"，\"x\":10.328125，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":206},,,,",
        "庫房,,,,,CP,{\"attrs\":{\"x\":2020.5，\"y\":760.5，\"width\":800，\"height\":320，\"name\":\"cfm-object\"，\"draggable\":true}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":220，\"width\":460，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"rgb(181，0，0)\"，\"name\":\"name\"，\"text\":\"庫房\"，\"x\":212，\"y\":101，\"fontSize\":18}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":11},,,,",
        "B,,,,,CP,{\"attrs\":{\"x\":2740.5，\"y\":960.5，\"width\":20，\"height\":20，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(0，0，0)\"，\"height\":20，\"width\":20，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"B\"，\"x\":5.3310546875，\"y\":3，\"fontSize\":14}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":12},,,,",
        "UF217,PG7592-002,2C,JI,12.97,CP,{\"attrs\":{\"x\":2440.5，\"y\":120.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF217\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":13},50,WORK,rgb(0，128，0),生產 ",
        "UF259,*,7D,ET,312.17,CP,{\"attrs\":{\"x\":560.5，\"y\":460.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF259\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":14},85,NS,rgb(166，166，166),無產能/節能關機 ",
        "UF201,PG5440-004,64,FF,31.14,CP,{\"attrs\":{\"x\":1940.5，\"y\":448.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF201\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":15},25,WORK,rgb(0，128，0),生產 ",
        "UF197,*,2C,CAY,17308.85,CP,{\"attrs\":{\"x\":60.5，\"y\":600.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF197\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":16},25,NS,rgb(166，166，166),無產能/節能關機 ",
        "UF338,PG7087-005,2C,BFK,0.35,CP,{\"attrs\":{\"x\":2260.5，\"y\":180.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF338\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":17},25,SETUP處理中,rgb(255，0，255),設定 ",
        "UF349,PG6877-012,7D,GM,17.32,CP,{\"attrs\":{\"x\":740.5，\"y\":960.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF349\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":18},85,WORK,rgb(0，128，0),生產 ",
        "UF386,PG6860-008,7D,GK,0.55,CP,{\"attrs\":{\"x\":2060.5，\"y\":40.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF386\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":19},0,WORK,rgb(0，128，0),生產 ",
        "UF295,PG6398-002,64,AD,0.08,CP,{\"attrs\":{\"x\":2068.5，\"y\":630.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF295\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":20},85,WORK,rgb(0，128，0),生產 ",
        "UF261,*,2C,BXN,17785.48,CP,{\"attrs\":{\"x\":120.5，\"y\":540.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF261\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":21},25,NS,rgb(166，166，166),無產能/節能關機 ",
        "UF05,PG4172-003,7D,WP,28.55,CP,{\"attrs\":{\"x\":500.5，\"y\":580.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF05\"，\"x\":10.328125，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":22},25,WORK,rgb(0，128，0),換批/原批生產 ",
        "UF11,*,T8,AE,679.06,CP,{\"attrs\":{\"x\":1180.5，\"y\":640.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF11\"，\"x\":10.7734375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":23},25,NS,rgb(166，166，166),無產能/節能關機 ",
        "UF17,*,5D,LR,837.02,CP,{\"attrs\":{\"x\":980.5，\"y\":520.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF17\"，\"x\":10.328125，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":24},25,NS,rgb(166，166，166),無產能/節能關機 ",
        "UF388,PG4495-001,7D,AD,20.31,CP,{\"attrs\":{\"x\":2120.5，\"y\":120.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF388\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":25},25,WORK,rgb(0，128，0),生產 ",
        "UF02,PG7119-008,7D,WP,6.82,CP,{\"attrs\":{\"x\":980.5，\"y\":580.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF02\"，\"x\":10.328125，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":26},25,WORK,rgb(0，128，0),換批/原批生產 ",
        "UF47,,,,,CP,{\"attrs\":{\"x\":60.5，\"y\":200.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF47\"，\"x\":10.328125，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":27},,,,",
        "ESI02,,,BFK,0.54,CP,{\"attrs\":{\"x\":1680.5，\"y\":400.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"ESI02\"，\"x\":8.6552734375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":28},25,LOSS,rgb(255，255，204),待料 ",
        "B,,,,,CP,{\"attrs\":{\"x\":1660.5，\"y\":960.5，\"width\":20，\"height\":20，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(0，0，0)\"，\"height\":20，\"width\":20，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"B\"，\"x\":5.3310546875，\"y\":3，\"fontSize\":14}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":29},,,,",
        "UF181,*,PC,BZS,837.05,CP,{\"attrs\":{\"x\":1320.5，\"y\":700.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF181\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":30},30,LEND,rgb(0，255，255),BZS SiTime 客戶借機 ",
        "B,,,,,CP,{\"attrs\":{\"x\":2740.5，\"y\":660.5，\"width\":20，\"height\":20，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(0，0，0)\"，\"height\":20，\"width\":20，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"B\"，\"x\":5.3310546875，\"y\":3，\"fontSize\":14}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":31},,,,",
        "UF287,PG6707-002,64,AD,39.82,CP,{\"attrs\":{\"x\":2240.5，\"y\":508.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF287\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":32},25,WORK,rgb(0，128，0),換批/原批生產 ",
        "B,,,,,CP,{\"attrs\":{\"x\":1920.5，\"y\":660.5，\"width\":20，\"height\":20，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(0，0，0)\"，\"height\":20，\"width\":20，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"B\"，\"x\":5.3310546875，\"y\":3，\"fontSize\":14}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":33},,,,",
        "UF91,,,,,CP,{\"attrs\":{\"x\":2260.5，\"y\":120.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF91\"，\"x\":10.328125，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":34},,,,",
        "B,,,,,CP,{\"attrs\":{\"x\":1140.5，\"y\":320.5，\"width\":20，\"height\":20，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(0，0，0)\"，\"height\":20，\"width\":20，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"B\"，\"x\":5.3310546875，\"y\":3，\"fontSize\":14}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":35},,,,",
        "UF470,PG7067-002,7D,AD,0.08,CP,{\"attrs\":{\"x\":860.5，\"y\":1080.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF470\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":36},25,WORK,rgb(0，128，0),重測RT1 ",
        "B,,,,,CP,{\"attrs\":{\"x\":1920.5，\"y\":960.5，\"width\":20，\"height\":20，\"name\":\"cfm-object\"，\"draggable\":true}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(0，0，0)\"，\"height\":20，\"width\":20，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"B\"，\"x\":5.3310546875，\"y\":3，\"fontSize\":14}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":37},,,,",
        "UF472,PG4343-004,PC,BZS,819.42,CP,{\"attrs\":{\"x\":1600.5，\"y\":120.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF472\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":38},30,LEND,rgb(0，255，255),BZS SiTime 客戶借機 ",
        "UF396,*,7D,JI,95.00,CP,{\"attrs\":{\"x\":1660.5，\"y\":260.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF396\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":39},25,LEND,rgb(0，255，255),JI 原相科技 客戶借機 ",
        "UF04,PG7455-003,7D,WP,0.06,CP,{\"attrs\":{\"x\":860.5，\"y\":580.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF04\"，\"x\":10.328125，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":40},25,SETUP,rgb(255，102，204),設定 ",
        "OBP008,,,,38532.12,CP,{\"attrs\":{\"x\":2430.5，\"y\":388.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"OBP008\"，\"x\":2.318359375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":41},,NS,rgb(166，166，166),歲修 ",
        "UF198,*,2C,AC,17128.68,CP,{\"attrs\":{\"x\":120.5，\"y\":600.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF198\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":42},25,NS,rgb(166，166，166),無產能/節能關機 ",
        "UF355,PG4510-001,7D,AC,2.73,CP,{\"attrs\":{\"x\":540.5，\"y\":1020.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF355\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":43},85,WORK,rgb(0，128，0),生產 ",
        "UF352,PG6612-004,7D,HG,20.35,CP,{\"attrs\":{\"x\":480.5，\"y\":960.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF352\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":44},25,WORK,rgb(0，128，0),生產 ",
        "UF376,PG6837-013,2C,BNB,0.43,CP,{\"attrs\":{\"x\":500.5，\"y\":840.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF376\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":45},25,DOWN,rgb(255，80，80),產品 Site Fail",
        "UF291,PG7003-001,64,ET,9.35,CP,{\"attrs\":{\"x\":2000.5，\"y\":568.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF291\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":46},25,WORK,rgb(0，128，0),生產 ",
        "UF247,PG7508-004,7D,GK,15.74,CP,{\"attrs\":{\"x\":2240.5，\"y\":568.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF247\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":47},25,WORK,rgb(0，128，0),生產 ",
        "UF110,PG7649-001,5C,ET,527.22,CP,{\"attrs\":{\"x\":1940.5，\"y\":508.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF110\"，\"x\":7.4365234375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":48},85,NS,rgb(166，166，166),無產能/節能關機 ",
        "B,,,,,CP,{\"attrs\":{\"x\":880.5，\"y\":320.5，\"width\":20，\"height\":20，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(0，0，0)\"，\"height\":20，\"width\":20，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"B\"，\"x\":5.3310546875，\"y\":3，\"fontSize\":14}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":49},,,,",
        "UF209,PG4203-001,2C,BPR,15.44,CP,{\"attrs\":{\"x\":2120.5，\"y\":448.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF209\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":50},25,WORK,rgb(0，128，0),生產 ",
        "UF39,PG3819-012,64,ZX,0.65,CP,{\"attrs\":{\"x\":560.5，\"y\":520.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF39\"，\"x\":10.328125，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":51},25,DOWN處理中,rgb(255，0，0),配件 Probe Card 電性異常",
        "B,,,,,CP,{\"attrs\":{\"x\":1920.5，\"y\":0.5，\"width\":20，\"height\":20，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(0，0，0)\"，\"height\":20，\"width\":20，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"B\"，\"x\":5.3310546875，\"y\":3，\"fontSize\":14}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":52},,,,",
        "UF582,,,,794.15,CP,{\"attrs\":{\"x\":800.5，\"y\":780.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF582\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":53},,NS,rgb(166，166，166),移機 ",
        "UF57,PG5638-001,1A,BE,36.01,CP,{\"attrs\":{\"x\":620.5，\"y\":520.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF57\"，\"x\":10.328125，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":54},25,WORK,rgb(0，128，0),生產 ",
        "UF539,*,PC,BZS,1728.20,CP,{\"attrs\":{\"x\":700.5，\"y\":840.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF539\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":55},30,LEND,rgb(0，255，255),BZS SiTime 客戶借機 ",
        "UF211,PG3292-102,64,ZX,0.81,CP,{\"attrs\":{\"x\":2240.5，\"y\":448.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF211\"，\"x\":7.4365234375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":56},25,WORK,rgb(0，128，0),生產 ",
        "UF392,PG4625-001,7D,BKQ,2.62,CP,{\"attrs\":{\"x\":2060.5，\"y\":180.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF392\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":57},105,LEND,rgb(0，255，255),BKQ 安沛 客戶借機 ",
        "配件室,,,,,CP,{\"attrs\":{\"x\":1060.5，\"y\":0.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":220，\"width\":480，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"rgb(181，0，0)\"，\"name\":\"name\"，\"text\":\"配件室\"，\"x\":213，\"y\":101，\"fontSize\":18}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":58},,,,",
        "UF121,PG4342-004,64,FF,2.54,CP,{\"attrs\":{\"x\":2500.5，\"y\":40.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF121\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":59},25,LOSS,rgb(255，255，204),待料 ",
        "UF389,PG7712-001,7D,CNX,0.05,CP,{\"attrs\":{\"x\":2060.5，\"y\":120.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF389\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":60},25,ABNOR,rgb(255，255，102),連續Fail ",
        "UF34,,,,,CP,{\"attrs\":{\"x\":120.5，\"y\":360.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF34\"，\"x\":10.328125，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":61},,,,",
        "B,,,,,CP,{\"attrs\":{\"x\":1140.5，\"y\":1280.5，\"width\":20，\"height\":20，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(0，0，0)\"，\"height\":20，\"width\":20，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"B\"，\"x\":5.3310546875，\"y\":3，\"fontSize\":14}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":62},,,,",
        "UF246,*,2C,BPB,17785.62,CP,{\"attrs\":{\"x\":60.5，\"y\":540.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF246\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":63},25,NS,rgb(166，166，166),無產能/節能關機 ",
        "UF134,*,7D,AC,6.02,CP,{\"attrs\":{\"x\":980.5，\"y\":400.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF134\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":64},25,LEND,rgb(0，255，255),ET 普誠科技 客戶借機 ",
        "UF44,,,,,CP,{\"attrs\":{\"x\":60.5，\"y\":360.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF44\"，\"x\":10.328125，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":65},,,,",
        "UF50,,,,,CP,{\"attrs\":{\"x\":120.5，\"y\":20.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF50\"，\"x\":10.328125，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":66},,,,",
        "UF265,*,L3,AJ,796.84,CP,{\"attrs\":{\"x\":240.5，\"y\":360.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF265\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":67},30,NS,rgb(166，166，166),無產能/節能關機 ",
        "UF268,PG7239-002,2C,AC,4.44,CP,{\"attrs\":{\"x\":2120.5，\"y\":508.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF268\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":68},85,WORK,rgb(0，128，0),換批/原批生產 ",
        "UF130,,,,,CP,{\"attrs\":{\"x\":120.5，\"y\":420.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF130\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":69},,,,",
        "UF109,,,,,CP,{\"attrs\":{\"x\":120.5，\"y\":80.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF109\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":70},,,,",
        "UF286,PG6745-001,2C,AD,20.19,CP,{\"attrs\":{\"x\":2180.5，\"y\":508.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF286\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":71},25,WORK,rgb(0，128，0),生產 ",
        "OBP031,,,,1853.86,CP,{\"attrs\":{\"x\":1820.5，\"y\":40.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"OBP031\"，\"x\":2.318359375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":72},,LOSS,rgb(255，255，204),上線",
        "UF547,*,7D,BWY,150.73,CP,{\"attrs\":{\"x\":820.5，\"y\":40.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF547\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":73},25,LEND,rgb(0，255，255),AD 松翰科技 客戶借機 ",
        "UF562,PG4527-005,7D,BPB,18.23,CP,{\"attrs\":{\"x\":500.5，\"y\":780.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF562\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":74},25,WORK,rgb(0，128，0),生產 ",
        "UF208,PG6652-038,2C,HG,218.32,CP,{\"attrs\":{\"x\":2060.5，\"y\":448.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF208\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":75},25,NS,rgb(166，166，166),無產能/節能關機 ",
        "UF210,PG3819-014,64,ZX,0.19,CP,{\"attrs\":{\"x\":2180.5，\"y\":448.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF210\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":76},25,LOSS,rgb(255，255，204),待產品分析 ",
        "UF43,,,,,CP,{\"attrs\":{\"x\":240.5，\"y\":200.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF43\"，\"x\":10.328125，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":77},,,,",
        "UF341,PG4164-001,7D,CAY,0.52,CP,{\"attrs\":{\"x\":420.5，\"y\":900.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF341\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":78},25,WORK,rgb(0，128，0),生產 ",
        "UF560,PG4357-002,7D,WP,9.52,CP,{\"attrs\":{\"x\":600.5，\"y\":780.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF560\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":79},30,NS,rgb(166，166，166),無產能/節能關機 ",
        "UF09,,,,,CP,{\"attrs\":{\"x\":120.5，\"y\":260.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF09\"，\"x\":10.328125，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":80},,,,",
        "B,,,,,CP,{\"attrs\":{\"x\":620.5，\"y\":0.5，\"width\":20，\"height\":20，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(0，0，0)\"，\"height\":20，\"width\":20，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"B\"，\"x\":5.3310546875，\"y\":3，\"fontSize\":14}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":81},,,,",
        "UF331,PG7507-005,7D,HG,287.00,CP,{\"attrs\":{\"x\":400.5，\"y\":780.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF331\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":82},30,NS,rgb(166，166，166),無產能/節能關機 ",
        "UF313,*,2C,AD,0.90,CP,{\"attrs\":{\"x\":2120.5，\"y\":568.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF313\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":83},25,LOSS,rgb(255，255，204),待料 ",
        "UF213,PG7459-003,7D,BPB,4.96,CP,{\"attrs\":{\"x\":2268.5，\"y\":630.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF213\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":84},25,WORK,rgb(0，128，0),生產 ",
        "UF350,PG7587-004,7D,BCA,80.02,CP,{\"attrs\":{\"x\":680.5，\"y\":960.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF350\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":85},25,WORK,rgb(0，128，0),生產 ",
        "UF561,,,,815.05,CP,{\"attrs\":{\"x\":600.5，\"y\":840.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF561\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":86},,LEND,rgb(0，255，255),BZS SiTime 客戶借機 ",
        "UF317,PG6744-001,2C,AD,6.04,CP,{\"attrs\":{\"x\":2060.5，\"y\":508.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF317\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":87},25,WORK,rgb(0，128，0),生產 ",
        "UF18,PG4175-003,PC,BZS,83.54,CP,{\"attrs\":{\"x\":1380.5，\"y\":700.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF18\"，\"x\":10.328125，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":88},30,WORK,rgb(0，128，0),生產 ",
        "UF112,,,,,CP,{\"attrs\":{\"x\":120.5，\"y\":140.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF112\"，\"x\":7.4365234375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":89},,,,",
        "UF280,*,1A,BCR,21.20,CP,{\"attrs\":{\"x\":440.5，\"y\":460.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF280\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":90},25,DOWN處理中,rgb(255，0，0),機台 Prober",
        "UF416,PG6160-014,2C,BNB,25.88,CP,{\"attrs\":{\"x\":1260.5，\"y\":780.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF416\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":91},25,WORK,rgb(0，128，0),換批/原批生產 ",
        "UF37,,,,,CP,{\"attrs\":{\"x\":60.5，\"y\":20.5，\"width\":60，\"height\":60，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF37\"，\"x\":10.328125，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":92},,,,",
        "B,,,,,CP,{\"attrs\":{\"x\":1140.5，\"y\":660.5，\"width\":20，\"height\":20，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(0，0，0)\"，\"height\":20，\"width\":20，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"B\"，\"x\":5.3310546875，\"y\":3，\"fontSize\":14}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":93},,,,",
        "UF61,PG5915-020,7D,GK,0.65,CP,{\"attrs\":{\"x\":800.5，\"y\":840.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF61\"，\"x\":10.328125，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":94},25,WORK,rgb(0，128，0),生產 ",
        "UF558,PG4572-004,7D,BPB,0.10,CP,{\"attrs\":{\"x\":2180.5，\"y\":388.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF558\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":95},25,WORK,rgb(0，128，0),生產 ",
        "UF58,PG6025-025,1A,BS,6.22,CP,{\"attrs\":{\"x\":500.5，\"y\":520.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF58\"，\"x\":10.328125，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":96},25,WORK,rgb(0，128，0),生產 ",
        "OBP007,*,5C,BKQ,63.86,CP,{\"attrs\":{\"x\":1820.5，\"y\":520.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"OBP007\"，\"x\":2.318359375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":97},25,LOSS,rgb(255，255，204),待料 ",
        "UF42,PG4512-032,EG,BZS,52.67,CP,{\"attrs\":{\"x\":800.5，\"y\":520.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF42\"，\"x\":10.328125，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":98},125,WORK,rgb(0，128，0),生產 ",
        "Air Shower,,,,,CP,{\"attrs\":{\"x\":1440.5，\"y\":780.5，\"width\":480，\"height\":220，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(199，199，199)\"，\"height\":120，\"width\":240，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"rgb(181，0，0)\"，\"name\":\"name\"，\"text\":\"Air Shower\"，\"x\":75.984375，\"y\":51，\"fontSize\":18}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":99},,,,",
        "UF41,PG4512-037,EG,BZS,1.71,CP,{\"attrs\":{\"x\":860.5，\"y\":520.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF41\"，\"x\":10.328125，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":100},125,WORK,rgb(0，128，0),生產 ",
        "UF254,PG6473-003,7D,BRY,0.14,CP,{\"attrs\":{\"x\":440.5，\"y\":520.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF254\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":101},25,SETUP處理中,rgb(255，0，255),設定 ",
        "UF289,PG6778-005,64,ET,0.48,CP,{\"attrs\":{\"x\":2360.5，\"y\":508.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF289\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":102},25,WORK,rgb(0，128，0),生產 ",
        "OBP003,,,,38531.95,CP,{\"attrs\":{\"x\":1740.5，\"y\":520.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"OBP003\"，\"x\":2.318359375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":103},,NS,rgb(166，166，166),歲修 ",
        "UF576,,,,7.58,CP,{\"attrs\":{\"x\":580.5，\"y\":120.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF576\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":104},,LOSS,rgb(255，255，204),待料 ",
        "ESI01,,,BFK,12.51,CP,{\"attrs\":{\"x\":1680.5，\"y\":460.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"ESI01\"，\"x\":8.6552734375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":105},25,LOSS,rgb(255，255，204),待料 ",
        "UF578,PG4547-001,S3,GM,0.17,CP,{\"attrs\":{\"x\":460.5，\"y\":120.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF578\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":106},90,LEND,rgb(0，255，255),GM 慧榮科技 客戶借機 ",
        "UF334,PG7368-023,7D,BPB,6.68,CP,{\"attrs\":{\"x\":680.5，\"y\":900.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF334\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":107},25,WORK,rgb(0，128，0),生產 ",
        "UF311,*,2C,CHY,793.86,CP,{\"attrs\":{\"x\":500.5，\"y\":460.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF311\"，\"x\":7.4365234375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":108},85,NS,rgb(166，166，166),無產能/節能關機 ",
        "UF573,*,7D,BPB,651.61,CP,{\"attrs\":{\"x\":580.5，\"y\":200.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF573\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":109},25,LEND,rgb(0，255，255),CHY Qorvo 客戶借機 ",
        "UF391,PG7474-007,7D,AD,0.17,CP,{\"attrs\":{\"x\":2120.5，\"y\":180.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF391\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":110},75,WORK,rgb(0，128，0),Data Log Saving",
        "UF118,PG4175-007,PC,BZS,1.39,CP,{\"attrs\":{\"x\":1260.5，\"y\":700.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF118\"，\"x\":7.4365234375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":111},30,WORK,rgb(0，128，0),生產 ",
        "UF546,*,7D,GK,24.28,CP,{\"attrs\":{\"x\":940.5，\"y\":40.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF546\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":112},25,NS,rgb(166，166，166),無產能/節能關機 ",
        "OBP010,,,,38532.12,CP,{\"attrs\":{\"x\":1820.5，\"y\":460.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"OBP010\"，\"x\":2.318359375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":113},,NS,rgb(166，166，166),歲修 ",
        "B,,,,,CP,{\"attrs\":{\"x\":2460.5，\"y\":0.5，\"width\":20，\"height\":20，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(0，0，0)\"，\"height\":20，\"width\":20，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"B\"，\"x\":5.3310546875，\"y\":3，\"fontSize\":14}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":114},,,,",
        "大廳,,,,,CP,{\"attrs\":{\"x\":1160.5，\"y\":980.5，\"width\":480，\"height\":220，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":320，\"width\":520，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"rgb(181，0，0)\"，\"name\":\"name\"，\"text\":\"大廳\"，\"x\":242，\"y\":151，\"fontSize\":18}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":115},,,,",
        "UF420,*,7D,HG,87.21,CP,{\"attrs\":{\"x\":414.5，\"y\":660.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF420\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":116},30,NS,rgb(166，166，166),無產能/節能關機 ",
        "UF353,PG7541-020,7D,BCA,3.67,CP,{\"attrs\":{\"x\":420.5，\"y\":960.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF353\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":117},25,WORK,rgb(0，128，0),生產 ",
        "UF398,PG7690-001,7D,AD,6.43,CP,{\"attrs\":{\"x\":2040.5，\"y\":320.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF398\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":118},25,LEND,rgb(0，255，255),AD 松翰科技 客戶借機 ",
        "UF122,*,CS,ZV,837.04,CP,{\"attrs\":{\"x\":2440.5，\"y\":40.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF122\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":119},25,NS,rgb(166，166，166),無產能/節能關機 ",
        "UF156,*,64,DL,10.64,CP,{\"attrs\":{\"x\":560.5，\"y\":400.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF156\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":120},-40,WORK,rgb(0，128，0),下Ink ",
        "UF183,PG4512-036,EG,BZS,2.77,CP,{\"attrs\":{\"x\":1240.5，\"y\":640.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF183\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":121},125,WORK,rgb(0，128，0),生產 ",
        "B,,,,,CP,{\"attrs\":{\"x\":2740.5，\"y\":0.5，\"width\":20，\"height\":20，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(0，0，0)\"，\"height\":20，\"width\":20，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"B\"，\"x\":5.3310546875，\"y\":3，\"fontSize\":14}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":122},,,,",
        "UF296,PG5175-001,64,FF,0.87,CP,{\"attrs\":{\"x\":2126.5，\"y\":630.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF296\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":123},25,WORK,rgb(0，128，0),生產 ",
        "B,,,,,CP,{\"attrs\":{\"x\":880.5，\"y\":660.5，\"width\":20，\"height\":20，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(0，0，0)\"，\"height\":20，\"width\":20，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"B\"，\"x\":5.3310546875，\"y\":3，\"fontSize\":14}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":124},,,,",
        "UF157,*,,FF,1.89,CP,{\"attrs\":{\"x\":500.5，\"y\":400.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF157\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":125},25,WORK,rgb(0，128，0),下Ink ",
        "B,,,,,CP,{\"attrs\":{\"x\":880.5，\"y\":0.5，\"width\":20，\"height\":20，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(0，0，0)\"，\"height\":20，\"width\":20，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"B\"，\"x\":5.3310546875，\"y\":3，\"fontSize\":14}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":126},,,,",
        "UF566,*,7D,GK,2.82,CP,{\"attrs\":{\"x\":940.5，\"y\":200.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF566\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":127},25,LEND,rgb(0，255，255),驗卡借機 ",
        "B,,,,,CP,{\"attrs\":{\"x\":360.5，\"y\":960.5，\"width\":20，\"height\":20，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(0，0，0)\"，\"height\":20，\"width\":20，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"B\"，\"x\":5.3310546875，\"y\":3，\"fontSize\":14}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":128},,,,",
        "UF146,PG7162-011,2C,BFK,8.54,CP,{\"attrs\":{\"x\":2500.5，\"y\":120.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF146\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":129},25,WORK,rgb(0，128，0),生產 ",
        "UF549,*,7D,CAY,45.97,CP,{\"attrs\":{\"x\":580.5，\"y\":40.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF549\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":130},25,NS,rgb(166，166，166),無產能/節能關機 ",
        "UF33,,,,,CP,{\"attrs\":{\"x\":180.5，\"y\":360.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF33\"，\"x\":10.328125，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":131},,,,",
        "OBP032,,,,1853.86,CP,{\"attrs\":{\"x\":1880.5，\"y\":40.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"OBP032\"，\"x\":2.318359375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":132},,LOSS,rgb(255，255，204),上線",
        "UF08,PG5699-013,7D,WP,1.64,CP,{\"attrs\":{\"x\":440.5，\"y\":580.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF08\"，\"x\":10.328125，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":133},25,WORK,rgb(0，128，0),生產 ",
        "UF325,PG4574-001,5C,BKQ,203.10,CP,{\"attrs\":{\"x\":2000.5，\"y\":508.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF325\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":134},25,NS,rgb(166，166，166),無產能/節能關機 ",
        "UF332,PG4565-002,S3,BUH,217.77,CP,{\"attrs\":{\"x\":440.5，\"y\":400.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF332\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":135},-30,LEND,rgb(0，255，255),GM 慧榮科技 客戶借機 ",
        "UF394,PG7622-001,7D,GK,0.89,CP,{\"attrs\":{\"x\":2120.5，\"y\":260.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF394\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":136},25,WORK,rgb(0，128，0),生產 ",
        "UF367,*,7D,HG,793.70,CP,{\"attrs\":{\"x\":920.5，\"y\":660.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF367\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":137},25,NS,rgb(166，166，166),無產能/節能關機 ",
        "UF90,PG7087-010,2C,BFK,13.14,CP,{\"attrs\":{\"x\":2200.5，\"y\":40.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF90\"，\"x\":10.328125，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":138},25,WORK,rgb(0，128，0),生產 ",
        "UF52,,,,,CP,{\"attrs\":{\"x\":180.5，\"y\":140.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF52\"，\"x\":10.328125，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":139},,,,",
        "UF141,PG7441-006,7D,ET,0.01,CP,{\"attrs\":{\"x\":980.5，\"y\":460.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF141\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":140},25,WORK,rgb(0，128，0),生產 ",
        "UF137,*,64,BM,11621.44,CP,{\"attrs\":{\"x\":1140.5，\"y\":700.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF137\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":141},25,LEND,rgb(0，255，255),鄒志宏 工程師借機 ",
        "B,,,,,CP,{\"attrs\":{\"x\":1400.5，\"y\":320.5，\"width\":20，\"height\":20，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(0，0，0)\"，\"height\":20，\"width\":20，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"B\"，\"x\":5.3310546875，\"y\":3，\"fontSize\":14}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":142},,,,",
        "UF417,*,7D,AC,17.55,CP,{\"attrs\":{\"x\":1340.5，\"y\":780.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF417\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":143},25,NS,rgb(166，166，166),無產能/節能關機 ",
        "UF35,,,,,CP,{\"attrs\":{\"x\":60.5，\"y\":260.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF35\"，\"x\":10.328125，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":144},,,,",
        "UF135,PG6434-006,1A,AD,2.28,CP,{\"attrs\":{\"x\":920.5，\"y\":520.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF135\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":145},25,WORK,rgb(0，128，0),生產 ",
        "UF288,PG6778-011,64,ET,0.48,CP,{\"attrs\":{\"x\":2300.5，\"y\":508.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF288\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":146},25,WORK,rgb(0，128，0),換批/原批生產 ",
        "UF336,PG6707-001,64,AD,0.05,CP,{\"attrs\":{\"x\":2200.5，\"y\":120.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF336\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":147},25,LOSS,rgb(255，255，204),待料 ",
        "UF294,*,5C,ET,794.62,CP,{\"attrs\":{\"x\":2008.5，\"y\":630.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF294\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":148},85,NS,rgb(166，166，166),無產能/節能關機 ",
        "UF577,,,,1207.28,CP,{\"attrs\":{\"x\":520.5，\"y\":120.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF577\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":149},,NS,rgb(166，166，166),移機 ",
        "B,,,,,CP,{\"attrs\":{\"x\":2740.5，\"y\":320.5，\"width\":20，\"height\":20，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(0，0，0)\"，\"height\":20，\"width\":20，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"B\"，\"x\":5.3310546875，\"y\":3，\"fontSize\":14}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":150},,,,",
        "OBP028,,,,1853.87,CP,{\"attrs\":{\"x\":2428.5，\"y\":468.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"OBP028\"，\"x\":2.318359375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":151},,LOSS,rgb(255，255，204),上線",
        "UF277,*,7D,AC,142.02,CP,{\"attrs\":{\"x\":980.5，\"y\":1140.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF277\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":152},85,NS,rgb(166，166，166),無產能/節能關機 ",
        "UF411,PG5051-025,7D,HG,1.85,CP,{\"attrs\":{\"x\":1600.5，\"y\":180.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF411\"，\"x\":7.4365234375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":153},25,WORK,rgb(0，128，0),生產 ",
        "UF264,PG7441-004,7D,ET,2.48,CP,{\"attrs\":{\"x\":620.5，\"y\":460.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF264\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":154},25,WORK,rgb(0，128，0),生產 ",
        "UF62,PG4501-001,7D,WP,0.09,CP,{\"attrs\":{\"x\":800.5，\"y\":660.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF62\"，\"x\":10.328125，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":155},30,ABNOR處理中,rgb(255，255，0),測試不穩 ",
        "UF412,PG6837-014,2C,BNB,27.67,CP,{\"attrs\":{\"x\":1180.5，\"y\":840.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF412\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":156},25,WORK,rgb(0，128，0),生產 ",
        "UF145,PG7528-002,7D,GK,4.76,CP,{\"attrs\":{\"x\":2560.5，\"y\":120.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF145\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":157},25,LOSS,rgb(255，255，204),待料 ",
        "UF424,PG4310-001,7D,BPB,1.62,CP,{\"attrs\":{\"x\":1660.5，\"y\":180.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF424\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":158},25,LOSS,rgb(255，255，204),待料 ",
        "CEI01,*,,BUH,17663.02,CP,{\"attrs\":{\"x\":1620.5，\"y\":400.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"CEI01\"，\"x\":8.32421875，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":159},,LOSS,rgb(255，255，204),待料 ",
        "OBP030,*,7D,BPB,352.12,CP,{\"attrs\":{\"x\":1700.5，\"y\":40.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"OBP030\"，\"x\":2.318359375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":160},25,LOSS,rgb(255，255，204),待料 ",
        "UF575,,,,25.65,CP,{\"attrs\":{\"x\":460.5，\"y\":200.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF575\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":161},,LEND,rgb(0，255，255),GM 慧榮科技 客戶借機 ",
        "AOI01,*,7D,BCA,365.86,CP,{\"attrs\":{\"x\":1560.5，\"y\":400.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"AOI01\"，\"x\":7.990234375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":162},25,LOSS,rgb(255，255，204),待料 ",
        "UF339,PG7162-010,2C,BFK,0.16,CP,{\"attrs\":{\"x\":2380.5，\"y\":180.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF339\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":163},25,WORK,rgb(0，128，0),生產 ",
        "UF354,*,7D,ZX,222.52,CP,{\"attrs\":{\"x\":480.5，\"y\":1020.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF354\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":164},25,LEND,rgb(0，255，255),ZX 智安電子 客戶借機 ",
        "UF337,PG7517-001,64,MN,13.14,CP,{\"attrs\":{\"x\":2200.5，\"y\":180.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF337\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":165},25,WORK,rgb(0，128，0),生產 ",
        "B,,,,,CP,{\"attrs\":{\"x\":1400.5，\"y\":960.5，\"width\":20，\"height\":20，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(0，0，0)\"，\"height\":20，\"width\":20，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"B\"，\"x\":5.3310546875，\"y\":3，\"fontSize\":14}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":166},,,,",
        "UF276,PG7705-001,7D,GK,0.36,CP,{\"attrs\":{\"x\":2240.5，\"y\":388.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF276\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":167},25,CORR,rgb(255，153，0),New Setup",
        "UF314,PG4143-004,2C,ZX,36.52,CP,{\"attrs\":{\"x\":2180.5，\"y\":568.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF314\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":168},25,WORK,rgb(0，128，0),生產 ",
        "UF260,*,EG,BZS,6.08,CP,{\"attrs\":{\"x\":60.5，\"y\":480.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF260\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":169},125,LOSS,rgb(255，255，204),待料 ",
        "B,,,,,CP,{\"attrs\":{\"x\":2180.5，\"y\":960.5，\"width\":20，\"height\":20，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(0，0，0)\"，\"height\":20，\"width\":20，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"B\"，\"x\":5.3310546875，\"y\":3，\"fontSize\":14}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":170},,,,",
        "庫房,,,,,CP,{\"attrs\":{\"x\":1680.5，\"y\":980.5，\"width\":520，\"height\":320，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":320，\"width\":800，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"rgb(181，0，0)\"，\"name\":\"name\"，\"text\":\"庫房\"，\"x\":382，\"y\":151，\"fontSize\":18}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":171},,,,",
        "OBP035,,,,1853.86,CP,{\"attrs\":{\"x\":1760.5，\"y\":40.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"OBP035\"，\"x\":2.318359375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":172},,LOSS,rgb(255，255，204),上線",
        "B,,,,,CP,{\"attrs\":{\"x\":2460.5，\"y\":320.5，\"width\":20，\"height\":20，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(0，0，0)\"，\"height\":20，\"width\":20，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"B\"，\"x\":5.3310546875，\"y\":3，\"fontSize\":14}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":173},,,,",
        "UF182,*,EG,BZS,215.29,CP,{\"attrs\":{\"x\":1300.5，\"y\":640.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF182\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":174},125,NS,rgb(166，166，166),無產能/節能關機 ",
        "B,,,,,CP,{\"attrs\":{\"x\":20.5，\"y\":660.5，\"width\":20，\"height\":20，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(0，0，0)\"，\"height\":20，\"width\":20，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"B\"，\"x\":5.3310546875，\"y\":3，\"fontSize\":14}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":175},,,,",
        "UF51,*,7D,WP,727.31,CP,{\"attrs\":{\"x\":800.5，\"y\":400.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF51\"，\"x\":10.328125，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":176},25,LEND,rgb(0，255，255),WP 聯詠科技 客戶借機 ",
        "UF290,*,5C,ET,144.79,CP,{\"attrs\":{\"x\":1940.5，\"y\":568.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF290\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":177},85,NS,rgb(166，166，166),無產能/節能關機 ",
        "UF580,PG7271-016,7D,CAY,4.73,CP,{\"attrs\":{\"x\":980.5，\"y\":960.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF580\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":178},25,WORK,rgb(0，128，0),生產 ",
        "UF257,PG7412-030,7D,BPB,2.14,CP,{\"attrs\":{\"x\":740.5，\"y\":900.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF257\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":207},25,LEND,rgb(0，255，255),驗卡借機 ",
        "UF214,*,7D,BPB,6.72,CP,{\"attrs\":{\"x\":180.5，\"y\":540.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF214\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":208},25,LEND,rgb(0，255，255),GK 聯陽半導體 客戶借機 ",
        "UF385,PG6956-005,7D,BKQ,2.79,CP,{\"attrs\":{\"x\":2120.5，\"y\":40.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF385\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":209},25,WORK,rgb(0，128，0),換批/原批生產 ",
        "UF550,*,7D,BIK,0.30,CP,{\"attrs\":{\"x\":520.5，\"y\":40.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF550\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":210},25,NS,rgb(166，166，166),無產能/節能關機 ",
        "UF131,*,PC,BZS,839.64,CP,{\"attrs\":{\"x\":1200.5，\"y\":700.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF131\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":211},30,LEND,rgb(0，255，255),BZS SiTime 客戶借機 ",
        "UF144,PG6480-009,5C,CAY,368.18,CP,{\"attrs\":{\"x\":2260.5，\"y\":40.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF144\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":212},25,NS,rgb(166，166，166),無產能/節能關機 ",
        "UF06,PG5415-011,7D,WP,8.02,CP,{\"attrs\":{\"x\":560.5，\"y\":580.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF06\"，\"x\":10.328125，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":213},85,WORK,rgb(0，128，0),生產 ",
        "B,,,,,CP,{\"attrs\":{\"x\":620.5，\"y\":320.5，\"width\":20，\"height\":20，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(0，0，0)\"，\"height\":20，\"width\":20，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"B\"，\"x\":5.3310546875，\"y\":3，\"fontSize\":14}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":214},,,,",
        "B,,,,,CP,{\"attrs\":{\"x\":880.5，\"y\":960.5，\"width\":20，\"height\":20，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(0，0，0)\"，\"height\":20，\"width\":20，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"B\"，\"x\":5.3310546875，\"y\":3，\"fontSize\":14}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":215},,,,",
        "B,,,,,CP,{\"attrs\":{\"x\":20.5，\"y\":320.5，\"width\":20，\"height\":20，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(0，0，0)\"，\"height\":20，\"width\":20，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"B\"，\"x\":5.3310546875，\"y\":3，\"fontSize\":14}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":216},,,,",
        "UF393,PG6860-007,7D,GK,2.95,CP,{\"attrs\":{\"x\":2000.5，\"y\":180.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF393\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":217},0,WORK,rgb(0，128，0),生產 ",
        "UF348,PG4435-001,7D,BPB,3.91,CP,{\"attrs\":{\"x\":800.5，\"y\":960.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF348\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":218},25,WORK,rgb(0，128，0),生產 ",
        "UF343,PG4512-034,EG,BZS,4.53,CP,{\"attrs\":{\"x\":120.5，\"y\":480.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF343\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":219},125,WORK,rgb(0，128，0),生產 ",
        "B,,,,,CP,{\"attrs\":{\"x\":360.5，\"y\":0.5，\"width\":20，\"height\":20，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(0，0，0)\"，\"height\":20，\"width\":20，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"B\"，\"x\":5.3310546875，\"y\":3，\"fontSize\":14}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":220},,,,",
        "UF26,PG7342-002,1A,BE,8.06,CP,{\"attrs\":{\"x\":800.5，\"y\":460.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF26\"，\"x\":10.328125，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":221},25,WORK,rgb(0，128，0),生產 ",
        "UF31,,,,,CP,{\"attrs\":{\"x\":240.5，\"y\":480.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF31\"，\"x\":10.328125，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":222},,,,",
        "UF01,PG4206-004,7D,WP,14.62,CP,{\"attrs\":{\"x\":380.5，\"y\":580.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF01\"，\"x\":10.328125，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":223},25,WORK,rgb(0，128，0),生產 ",
        "UF240,*,7D,BPB,173.68,CP,{\"attrs\":{\"x\":180.5，\"y\":420.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF240\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":224},25,NS,rgb(166，166，166),無產能/節能關機 ",
        "UF395,PG4230-001,7D,AD,0.31,CP,{\"attrs\":{\"x\":2060.5，\"y\":260.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF395\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":225},25,WORK,rgb(0，128，0),生產 ",
        "UF415,*,7D,HG,332.33,CP,{\"attrs\":{\"x\":1180.5，\"y\":780.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF415\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":226},25,NS,rgb(166，166，166),無產能/節能關機 ",
        "UF372,PG7113-011,2C,BNB,11.21,CP,{\"attrs\":{\"x\":400.5，\"y\":840.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF372\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":227},25,WORK,rgb(0，128，0),生產 ",
        "UF241,*,7D,BPB,475.77,CP,{\"attrs\":{\"x\":540.5，\"y\":900.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF241\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":228},25,NS,rgb(166，166，166),無產能/節能關機 ",
        "B,,,,,CP,{\"attrs\":{\"x\":620.5，\"y\":960.5，\"width\":20，\"height\":20，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(0，0，0)\"，\"height\":20，\"width\":20，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"B\"，\"x\":5.3310546875，\"y\":3，\"fontSize\":14}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":229},,,,",
        "UF374,PG7271-023,7D,CAY,32.97,CP,{\"attrs\":{\"x\":980.5，\"y\":1080.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF374\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":230},25,WORK,rgb(0，128，0),生產 ",
        "UF422,PG7271-012,7D,CAY,10.73,CP,{\"attrs\":{\"x\":900.5，\"y\":840.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF422\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":231},25,WORK,rgb(0，128，0),生產 ",
        "UF07,PG4257-005,7D,BPB,13.41,CP,{\"attrs\":{\"x\":800.5，\"y\":580.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF07\"，\"x\":10.328125，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":232},25,WORK,rgb(0，128，0),生產 ",
        "UF248,PG7412-026,7D,BPB,9.22,CP,{\"attrs\":{\"x\":2300.5，\"y\":568.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF248\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":233},25,WORK,rgb(0，128，0),生產 ",
        "UF184,*,7D,AD,107.74,CP,{\"attrs\":{\"x\":1300.5，\"y\":580.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF184\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":234},25,NS,rgb(166，166，166),無產能/節能關機 ",
        "B,,,,,CP,{\"attrs\":{\"x\":360.5，\"y\":660.5，\"width\":20，\"height\":20，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(0，0，0)\"，\"height\":20，\"width\":20，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"B\"，\"x\":5.3310546875，\"y\":3，\"fontSize\":14}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":235},,,,",
        "OBP009,,,,38532.12,CP,{\"attrs\":{\"x\":2428.5，\"y\":588.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"OBP009\"，\"x\":2.318359375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":236},,NS,rgb(166，166，166),歲修 ",
        "休息室,,,,,CP,{\"attrs\":{\"x\":1440.5，\"y\":1160.5，\"width\":520，\"height\":320，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":140，\"width\":240，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"rgb(181，0，0)\"，\"name\":\"name\"，\"text\":\"休息室\"，\"x\":93，\"y\":61，\"fontSize\":18}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":237},,,,",
        "UF293,PG6585-001,2C,AD,15.91,CP,{\"attrs\":{\"x\":1948.5，\"y\":630.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF293\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":238},25,WORK,rgb(0，128，0),生產 ",
        "UF423,*,7D,HG,791.76,CP,{\"attrs\":{\"x\":480.5，\"y\":660.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF423\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":239},25,NS,rgb(166，166，166),無產能/節能關機 ",
        "B,,,,,CP,{\"attrs\":{\"x\":1660.5，\"y\":320.5，\"width\":20，\"height\":20，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(0，0，0)\"，\"height\":20，\"width\":20，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"B\"，\"x\":5.3310546875，\"y\":3，\"fontSize\":14}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":240},,,,",
        "UF124,PG7087-004,2C,BFK,11.12,CP,{\"attrs\":{\"x\":2320.5，\"y\":40.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF124\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":241},25,WORK,rgb(0，128，0),生產 ",
        "UF206,PG4235-001,7D,CAY,2.77,CP,{\"attrs\":{\"x\":800.5，\"y\":900.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF206\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":242},25,WORK,rgb(0，128，0),生產 ",
        "OBP014,,,,38532.11,CP,{\"attrs\":{\"x\":2428.5，\"y\":528.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"OBP014\"，\"x\":2.318359375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":243},,NS,rgb(166，166，166),歲修 ",
        "UF390,PG4331-002,7D,HG,2.60,CP,{\"attrs\":{\"x\":2000.5，\"y\":120.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF390\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":244},25,WORK,rgb(0，128，0),生產 ",
        "UF190,PG4568-001,2C,BPB,4.82,CP,{\"attrs\":{\"x\":380.5，\"y\":460.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF190\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":245},25,WORK,rgb(0，128，0),生產 ",
        "UF139,,,,,CP,{\"attrs\":{\"x\":60.5，\"y\":140.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF139\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":246},,,,",
        "UF68,,,,,CP,{\"attrs\":{\"x\":300.5，\"y\":480.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF68\"，\"x\":10.328125，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":247},,,,",
        "UF565,*,2C,BNB,718.77,CP,{\"attrs\":{\"x\":820.5，\"y\":320.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF565\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":248},25,NS,rgb(166，166，166),無產能/節能關機 ",
        "B,,,,,CP,{\"attrs\":{\"x\":360.5，\"y\":320.5，\"width\":20，\"height\":20，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(0，0，0)\"，\"height\":20，\"width\":20，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"B\"，\"x\":5.3310546875，\"y\":3，\"fontSize\":14}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":249},,,,",
        "UF216,*,7D,ZX,117.64,CP,{\"attrs\":{\"x\":300.5，\"y\":540.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF216\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":250},25,NS,rgb(166，166，166),無產能/節能關機 ",
        "UF123,*,7D,BFK,217.59,CP,{\"attrs\":{\"x\":2380.5，\"y\":40.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF123\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":251},25,LEND,rgb(0，255，255),BFK LiteonSG 客戶借機 ",
        "B,,,,,CP,{\"attrs\":{\"x\":2180.5，\"y\":660.5，\"width\":20，\"height\":20，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(0，0，0)\"，\"height\":20，\"width\":20，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"B\"，\"x\":5.3310546875，\"y\":3，\"fontSize\":14}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":252},,,,",
        "UF551,PG6798-004,7D,BKQ,8.74,CP,{\"attrs\":{\"x\":740.5，\"y\":1080.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF551\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":253},25,WORK,rgb(0，128，0),生產 ",
        "UF199,*,1A,FF,17614.30,CP,{\"attrs\":{\"x\":180.5，\"y\":600.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF199\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":254},25,NS,rgb(166，166，166),無產能/節能關機 ",
        "UF401,PG5603-008,7D,CCQ,1.40,CP,{\"attrs\":{\"x\":2360.5，\"y\":568.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF401\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":255},25,LOSS,rgb(255，255，204),待料 ",
        "UF256,*,7D,BPB,174.47,CP,{\"attrs\":{\"x\":480.5，\"y\":900.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF256\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":256},25,NS,rgb(166，166，166),無產能/節能關機 ",
        "UF120,PG7135-020,2C,BFK,1.37,CP,{\"attrs\":{\"x\":2560.5，\"y\":40.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF120\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":257},25,WORK,rgb(0，128，0),生產 ",
        "B,,,,,CP,{\"attrs\":{\"x\":1140.5，\"y\":960.5，\"width\":20，\"height\":20，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(0，0，0)\"，\"height\":20，\"width\":20，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"B\"，\"x\":5.3310546875，\"y\":3，\"fontSize\":14}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":258},,,,",
        "B,,,,,CP,{\"attrs\":{\"x\":1660.5，\"y\":660.5，\"width\":20，\"height\":20，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(0，0，0)\"，\"height\":20，\"width\":20，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"B\"，\"x\":5.3310546875，\"y\":3，\"fontSize\":14}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":259},,,,",
        "B,,,,,CP,{\"attrs\":{\"x\":2460.5，\"y\":660.5，\"width\":20，\"height\":20，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(0，0，0)\"，\"height\":20，\"width\":20，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"B\"，\"x\":5.3310546875，\"y\":3，\"fontSize\":14}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":260},,,,",
        "UF258,*,2C,CAY,17785.61,CP,{\"attrs\":{\"x\":180.5，\"y\":480.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF258\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":261},25,NS,rgb(166，166，166),無產能/節能關機 ",
        "UF413,PG7113-010,2C,BNB,66.64,CP,{\"attrs\":{\"x\":1260.5，\"y\":840.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF413\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":262},25,WORK,rgb(0，128，0),生產 ",
        "UF200,*,1A,BE,17614.29,CP,{\"attrs\":{\"x\":240.5，\"y\":600.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF200\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":263},25,NS,rgb(166，166，166),無產能/節能關機 ",
        "UF189,,,,,CP,{\"attrs\":{\"x\":180.5，\"y\":80.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF189\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":264},,,,",
        "UF113,,,,,CP,{\"attrs\":{\"x\":60.5，\"y\":80.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF113\"，\"x\":7.4365234375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":265},,,,",
        "B,,,,,CP,{\"attrs\":{\"x\":620.5，\"y\":660.5，\"width\":20，\"height\":20，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(0，0，0)\"，\"height\":20，\"width\":20，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"B\"，\"x\":5.3310546875，\"y\":3，\"fontSize\":14}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":266},,,,",
        "B,,,,,CP,{\"attrs\":{\"x\":2180.5，\"y\":320.5，\"width\":20，\"height\":20，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(0，0，0)\"，\"height\":20，\"width\":20，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"B\"，\"x\":5.3310546875，\"y\":3，\"fontSize\":14}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":267},,,,",
        "UF399,PG7664-002,7D,HG,72.14,CP,{\"attrs\":{\"x\":2100.5，\"y\":320.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF399\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":268},25,NS,rgb(166，166，166),無產能/節能關機 ",
        "UF581,PG7271-022,7D,CAY,3.75,CP,{\"attrs\":{\"x\":920.5，\"y\":960.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF581\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":269},25,WORK,rgb(0，128，0),換批/原批生產 ",
        "UF344,PG4338-002,1A,BE,2.12,CP,{\"attrs\":{\"x\":380.5，\"y\":520.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF344\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":270},25,WORK,rgb(0，128，0),換批/原批生產 ",
        "OBP001,*,7D,HG,590.58,CP,{\"attrs\":{\"x\":1740.5，\"y\":580.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"OBP001\"，\"x\":2.318359375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":271},25,LOSS,rgb(255，255，204),待料 ",
        "UF471,PG5972-003,7D,BCR,1.85,CP,{\"attrs\":{\"x\":800.5，\"y\":1080.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF471\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":272},25,WORK,rgb(0，128，0),換批/原批生產 ",
        "UF212,PG7342-001,1A,BE,14.27,CP,{\"attrs\":{\"x\":2300.5，\"y\":448.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF212\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":273},25,WORK,rgb(0，128，0),生產 ",
        "UF309,*,,ZX,0.59,CP,{\"attrs\":{\"x\":620.5，\"y\":400.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF309\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":274},25,WORK,rgb(0，128，0),下Ink ",
        "B,,,,,CP,{\"attrs\":{\"x\":1140.5，\"y\":0.5，\"width\":20，\"height\":20，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(0，0，0)\"，\"height\":20，\"width\":20，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"B\"，\"x\":5.3310546875，\"y\":3，\"fontSize\":14}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":275},,,,",
        "UF207,PG6501-015,2C,BNB,14.36,CP,{\"attrs\":{\"x\":2000.5，\"y\":448.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF207\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":276},25,WORK,rgb(0，128，0),換批/原批生產 ",
        "UF559,*,7D,CHY,505.95,CP,{\"attrs\":{\"x\":860.5，\"y\":780.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF559\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":277},25,NS,rgb(166，166，166),無產能/節能關機 ",
        "B,,,,,CP,{\"attrs\":{\"x\":1400.5，\"y\":660.5，\"width\":20，\"height\":20，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(0，0，0)\"，\"height\":20，\"width\":20，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"B\"，\"x\":5.3310546875，\"y\":3，\"fontSize\":14}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":278},,,,",
        "QC,,,,,CP,{\"attrs\":{\"x\":1680.5，\"y\":680.5，\"width\":240，\"height\":140，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":220，\"width\":260，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"rgb(181，0，0)\"，\"name\":\"name\"，\"text\":\"QC\"，\"x\":116.5，\"y\":101，\"fontSize\":18}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":279},,,,",
        "UF275,PG7271-015,7D,CAY,1.23,CP,{\"attrs\":{\"x\":2300.5，\"y\":388.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF275\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":280},25,SETUP,rgb(255，102，204),待OP結單",
        "UF45,,,,,CP,{\"attrs\":{\"x\":240.5，\"y\":420.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF45\"，\"x\":10.328125，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":281},,,,",
        "UF188,*,7D,WP,478.92,CP,{\"attrs\":{\"x\":1180.5，\"y\":580.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF188\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":282},25,NS,rgb(166，166，166),無產能/節能關機 ",
        "UF568,*,S3,BUH,25.63,CP,{\"attrs\":{\"x\":820.5，\"y\":200.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF568\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":283},25,LEND,rgb(0，255，255),HG 群聯竹南 客戶借機 ",
        "UF327,PG6430-001,2C,AC,6.07,CP,{\"attrs\":{\"x\":2380.5，\"y\":120.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF327\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":284},25,WORK,rgb(0，128，0),生產 ",
        "UF356,PG7489-008,7D,CAY,16.46,CP,{\"attrs\":{\"x\":680.5，\"y\":1020.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF356\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":285},25,WORK,rgb(0，128，0),生產 ",
        "UF48,*,2C,BPB,10.68,CP,{\"attrs\":{\"x\":680.5，\"y\":400.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF48\"，\"x\":10.328125，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":286},25,WORK,rgb(0，128，0),下Ink ",
        "UF129,,,,,CP,{\"attrs\":{\"x\":180.5，\"y\":260.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF129\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":287},,,,",
        "UF292,PG4542-002,5C,BKQ,6.78,CP,{\"attrs\":{\"x\":2060.5，\"y\":568.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF292\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":288},25,NS,rgb(166，166，166),無產能/節能關機 ",
        "UF335,*,,BKQ,215.16,CP,{\"attrs\":{\"x\":380.5，\"y\":400.5，\"width\":50，\"height\":50，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":50，\"width\":50，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UF335\"，\"x\":6.9912109375，\"y\":19}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":289},25,LOSS,rgb(255，255，204),待料 ",
        "B,,,,,CP,{\"attrs\":{\"x\":1400.5，\"y\":0.5，\"width\":20，\"height\":20，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(0，0，0)\"，\"height\":20，\"width\":20，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"B\"，\"x\":5.3310546875，\"y\":3，\"fontSize\":14}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"CP\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":290},,,,",
        "B,,,,,CP,{\"attrs\":{\"x\":2460.5，\"y\":960.5，\"width\":20，\"height\":20，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"width\":20，\"height\":20，\"fill\":\"rgb(0，0，0)\"，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"x\":5.3310546875，\"y\":3，\"fill\":\"black\"，\"text\":\"B\"，\"fontSize\":14，\"name\":\"name\"}，\"className\":\"Text\"}，{\"attrs\":{\"opacity\":0，\"text\":\"CP\"，\"name\":\"category\"，\"fill\":\"black\"}，\"className\":\"Text\"}]，\"zIndex\":291},,,,",
        "W01,W01,,,,底圖(測試),{\"attrs\":{\"x\":359.5，\"y\":779.5，\"name\":\"block\"，\"scaleX\":14.4，\"scaleY\":1.5584415584415585}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(184，204，228)\"，\"height\":77，\"width\":75，\"name\":\"fill\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"W01\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":3},,底圖(測試),,,%",
        "W03,W03,,,,底圖(測試),{\"attrs\":{\"x\":359.5，\"y\":579.5，\"name\":\"block\"，\"scaleX\":18.7012987012987，\"scaleY\":1.096774193548387}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(149，179，215)\"，\"height\":93，\"width\":77，\"name\":\"fill\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"W03\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":5},,底圖(測試),,,%",
        "W05,W05,,,,底圖(測試),{\"attrs\":{\"x\":359.5，\"y\":379.5，\"name\":\"block\"，\"scaleX\":12.100840336134453，\"scaleY\":1.25}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，153)\"，\"height\":64，\"width\":119，\"name\":\"fill\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"W05\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":7},,底圖(測試),,,%",
        "W00,W00,,,,底圖(測試),{\"attrs\":{\"x\":359.5，\"y\":899.5，\"name\":\"block\"，\"scaleX\":17.06382978723404，\"scaleY\":2.5443037974683542}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(253，233，217)\"，\"height\":158，\"width\":47，\"name\":\"fill\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"W00\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":2},,底圖(測試),,,%",
        "W12,W12,,,,底圖(測試),{\"attrs\":{\"x\":1539.5，\"y\":-0.5，\"name\":\"block\"，\"scaleX\":7.063583815028902，\"scaleY\":5.641025641025641}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(196，215，155)\"，\"height\":78，\"width\":173，\"name\":\"fill\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"W12\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":4},,底圖(測試),,,%",
        "圖層,圖層,,,,圖層(測試),{\"width\":2780，\"height\":1320},,圖層(測試),,,%",
        "W07,W07,,,,底圖(測試),{\"attrs\":{\"x\":359.5，\"y\":-0.5，\"name\":\"block\"，\"scaleX\":3.3146067415730336，\"scaleY\":2.389937106918239}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(177，160，199)\"，\"height\":159，\"width\":356，\"name\":\"fill\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"W07\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":8},,底圖(測試),,,%",
        "W09,W09,,,,底圖(測試),{\"attrs\":{\"x\":19.5，\"y\":-0.5，\"name\":\"block\"，\"scaleX\":3.4343434343434343，\"scaleY\":4.577181208053691}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(220，230，241)\"，\"height\":149，\"width\":99，\"name\":\"fill\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"W09\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":9},,底圖(測試),,,%",
        "W02,W02,,,,底圖(測試),{\"attrs\":{\"x\":359.5，\"y\":679.5，\"name\":\"block\"，\"scaleX\":6.407766990291262，\"scaleY\":2.7027027027027026}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(250，191，143)\"，\"height\":37，\"width\":206，\"name\":\"fill\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"W02\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":0},,底圖(測試),,,%",
        "W06,W06,,,,底圖(測試),{\"attrs\":{\"x\":1799.5，\"y\":439.5，\"name\":\"block\"，\"scaleX\":6.328947368421052，\"scaleY\":3.1025641025641026}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(235，241，222)\"，\"height\":78，\"width\":152，\"name\":\"fill\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"W06\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":6},,底圖(測試),,,%",
        "W04,W04,,,,底圖(測試),{\"attrs\":{\"x\":359.5，\"y\":459.5，\"name\":\"block\"，\"scaleX\":13.333333333333334，\"scaleY\":1.791044776119403}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(146，208，80)\"，\"height\":67，\"width\":108，\"name\":\"fill\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"W04\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":10},,底圖(測試),,,%",
        "W10,W10,,,,底圖(測試),{\"attrs\":{\"x\":2179.5，\"y\":-0.5，\"name\":\"block\"，\"scaleX\":2.2213740458015265，\"scaleY\":4.170731707317073}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(228，223，236)\"，\"height\":82，\"width\":262，\"name\":\"fill\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"W10\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":1},,底圖(測試),,,%"
    ]
    if (data.length) {
    // if (res.data.length > 0 && res.status == 200) {
      let indexMap = new Map()
      data.forEach((row: string) => {
        let grpAttrs =
          sDepartment.value == 'TEST' ? row.split(',')[6] : row.split(',')[5]
        let attrs = JSON.parse(grpAttrs.replaceAll('，', ','))
        if (Object.prototype.hasOwnProperty.call(attrs, 'zIndex')) {
          let index = attrs['zIndex']
          indexMap.set(index, attrs)
        } else {
          width.value = attrs.width
          height.value = attrs.height
        }
      })

      let length = indexMap.size
      for (let index = 0; index < length; index++) {
        let attrs = indexMap.get(index)
        let grpConfig = attrs['attrs'] as Konva.GroupConfig
        let group = new Konva.Group(grpConfig)
        if (attrs['attrs'].name == 'cfm-object') {
          group.on('click', pickNode)
        } else {
          group.on('click', pickBlock)
        }
        group.on('dragmove', dragStart)
        group.on('dragend', dragEnd)
        // children
        attrs.children.forEach((child:ChildObject) => {
          const {attrs, className} = child
          if(className == "Text") {
            console.log(attrs)
          }
          let node = new Konva[className](attrs) as Konva.Shape
          group.add(node)
        })
        iconLayer.add(group)
      }
      iconLayer.batchDraw()
    }

    isLoading.value = false
  })
}

const loseFocusWhenSwitchExpansionItem = () => {
  mode.value = 'v'
  let rect = iconLayer.find('.selected-fill')
  let group = iconLayer.find('.selected-cfm-object')
  if (rect.length) rect[0].name('fill')
  if (group.length) group[0].name('cfm-object')
}

onMounted(() => {
  initKonva()
  load()

  window.addEventListener('keydown', cancelDraw)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', cancelDraw)
})
</script>
