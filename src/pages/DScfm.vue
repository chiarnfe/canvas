<template>
  <div class="h-[50px] w-full bg-gray-500/20"></div>
  <div class="w-full px-4">
    <h4 class="text-h4 mt-5 mb-2.5">Equipment CFM</h4>
    <div class="flex flex-row gap-x-2">
      <q-btn
        unelevated
        color="primary"
        label="匯出"
        class="rounded-[0.25rem] px-3 py-1"
        @click="downloadExcel"
      />
      <div class="flex flex-row gap-x-2">
        <q-select
          for="fact"
          v-model="sFactory"
          :options="factoryOptions"
          option-value="value"
          option-label="label"
          emit-value
          map-options
          outlined
          dense
        >
          <template v-slot:before>
            <label for="fact" class="text-sm"> 廠區 </label>
          </template>
        </q-select>
        <q-select
          v-model="sFloor"
          :options="floorOptions"
          option-value="value"
          option-label="label"
          emit-value
          map-options
          outlined
          dense
        >
          <template v-slot:before>
            <label class="text-sm"> 樓層 </label>
          </template>
        </q-select>
        <q-select
          v-model="sClient"
          :options="clientOptions"
          options-value="value"
          options-label="label"
          emit-value
          map-options
          outlined
          dense
          multiple
        >
          <template v-slot:before>
            <label class="text-sm">客戶</label>
          </template>
        </q-select>
        <q-input v-model="sEqp" outlined dense>
          <template v-slot:before>
            <label class="text-sm">機台</label>
          </template>
        </q-input>
        <q-input v-model="sEqpType" outlined dense>
          <template v-slot:before>
            <label class="text-sm">機種</label>
          </template>
        </q-input>
        <q-input v-model="sModel" outlined dense>
          <template v-slot:before>
            <label class="text-sm">型號</label>
          </template>
        </q-input>
      </div>
      <q-btn
        unelevated
        label="搜尋"
        class="px-3 py-1 rounded-md"
        style="border: 1px solid #aaa"
        @click="loadData"
      />
    </div>
    <q-separator class="q-my-md" />
    <div class="flex flex-row pb-4 gap-x-2">
      <div
        v-show="!showTab"
        class="w-[calc(16.66%_-_50px)] flex flex-col gap-y-1 overflow-auto px-2 min-w-[180px]"
      >
        <q-btn
          v-for="(tab, index) in tabList"
          :key="index"
          :class="['w-full py-0 pr-0 pl-2', index < 6 ? '!cursor-default' : '']"
          size="sm"
          :ripple="false"
          no-caps
          v-on="index > 5 ? {click: getEqpStatus} : {}"
          :data-status="tab.tabText"
        >
          <template v-slot:default>
            <div class="flex flex-row items-center w-full">
              <span class="w-2/3 text-left">{{ tab.tabText }}</span>
              <span
                class="block w-4 h-6 mr-1"
                :style="{backgroundColor: tab.tabColor.replaceAll('，', ',')}"
              ></span>
              <span class="flex justify-center flex-1">{{ tab.tabCount }}</span>
            </div>
          </template>
        </q-btn>
        <div
          class="flex flex-row items-center justify-center h-6 rounded-sm ring-2 ring-inset ring-red-500"
        >
          12吋機台紅框
        </div>
      </div>
      <q-btn
        icon="chevron_right"
        unelevated
        color="primary"
        class="px-1"
        @click="toggleTab"
      />
      <q-scroll-area
        :class="[!showTab ? 'w-5/6' : 'w-[calc(100%_-_50px)]']"
        style="
          box-shadow:
            inset 1px 0 0 #000,
            inset 0 1px 0 #000,
            inset -1px 0 0 #000,
            inset 0 -1px 0 #000;
          height: calc(100vh - 210px);
        "
      >
        <div class="w-full" ref="container" id="canvas_container"></div>
      </q-scroll-area>
    </div>
    <q-dialog v-model="isLoading" backdrop-filter="blur(4px)" persistent>
      <q-card class="w-96">
        <q-card-section> 資料讀取中... </q-card-section>
      </q-card>
    </q-dialog>
    <q-dialog full-width v-model="showDetail" backdrop-filter="blur(4px)">
      <q-card class="relative">
        <q-btn unelevated icon="close" class="absolute top-2 right-2" />
        <q-card-section class="items-center row q-pb-none text-h5">
          {{ detail[0] }}
        </q-card-section>
        <q-separator />
        <q-card-section class="overflow-auto">
          <q-markup-table class="px-4" flat>
            <thead>
              <tr>
                <th colspan="4" class="!text-base !bg-gray-400">機況明細</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="!bg-gray-400 text-center">機台</td>
                <td class="text-center">{{ detail[0] }}</td>
                <td class="!bg-gray-400 text-center">批號</td>
                <td class="text-center">{{ detail[9] }}</td>
              </tr>
              <tr>
                <td class="!bg-gray-400 text-center">站點</td>
                <td class="text-center">{{ detail[1] }}</td>
                <td class="!bg-gray-400 text-center">Change Time</td>
                <td class="text-center">{{ detail[10] }}</td>
              </tr>
              <tr>
                <td class="!bg-gray-400 text-center">機群</td>
                <td class="text-center">{{ detail[2] }}</td>
                <td class="!bg-gray-400 text-center">產品種類</td>
                <td class="text-center">{{ detail[11] }}</td>
              </tr>
              <tr>
                <td class="!bg-gray-400 text-center">機型</td>
                <td class="text-center">{{ detail[3] }}</td>
                <td class="!bg-gray-400 text-center">備註</td>
                <td class="text-center">{{ detail[12] }}</td>
              </tr>
              <tr>
                <td class="!bg-gray-400 text-center">機種</td>
                <td class="text-center">{{ detail[4] }}</td>
                <td class="!bg-gray-400 text-center">OP工號</td>
                <td class="text-center">{{ detail[13] }}</td>
              </tr>
              <tr>
                <td class="!bg-gray-400 text-center">機況</td>
                <td class="text-center">{{ detail[5] }}</td>
                <td class="!bg-gray-400 text-center">狀態時間HR</td>
                <td class="text-center">{{ detail[14] }}</td>
              </tr>
              <tr>
                <td class="!bg-gray-400 text-center">客戶代碼</td>
                <td class="text-center">{{ detail[6] }}</td>
                <td class="!bg-gray-400 text-center">Z1</td>
                <td class="text-center">{{ detail[15] }}</td>
              </tr>
              <tr>
                <td class="!bg-gray-400 text-center">流程卡</td>
                <td class="text-center">{{ detail[7] }}</td>
                <td class="!bg-gray-400 text-center">Z2</td>
                <td class="text-center">{{ detail[16] }}</td>
              </tr>
              <tr>
                <td class="!bg-gray-400 text-center">型號</td>
                <td class="text-center">{{ detail[8] }}</td>
                <td class="text-center"></td>
                <td class="text-center"></td>
              </tr>
            </tbody>
          </q-markup-table>
        </q-card-section>
        <q-separator />
        <q-card-actions align="right" class="border-black border-t-1">
          <q-btn unelevated v-close-popup label="關閉" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog
      full-width
      v-model="showEQPStatusList"
      backdrop-filter="blur(4px)"
    >
      <q-card class="relative">
        <q-btn
          unelevated
          icon="close"
          class="absolute z-10 px-2 py-0 top-2 right-2"
          v-close-popup
        />
        <q-card-section class="items-center row q-pb-none text-h5">
          {{eqpStatus}}
        </q-card-section>
        <q-separator />
        <q-card-section class="overflow-auto">
          <q-table
            class="sticky-first-column"
            :rows="eqpStatusList"
            :pagination="{rowsPerPage:10}"
            :columns="columns"
            row-key="id"
          >
            <template v-slot:header="props">
              <q-tr>
                <q-th>Date</q-th>
                <q-th colspan="17">{{ today.toLocaleDateString("zh-TW", {month:"2-digit", day:"2-digit"}) }}</q-th>
                <q-th colspan="7">{{ tomorrow.toLocaleDateString("zh-TW", {month:"2-digit", day:"2-digit"}) }}</q-th>
              </q-tr>
              <q-tr>
                <q-th v-for="col in props.cols" :key="col.name">{{
                  col.label
                }}</q-th>
                <q-th v-for="ele in time" :key="ele.name">{{ ele.label }}</q-th>
              </q-tr>
            </template>
            <template #body="props">
              <q-tr>
                <q-td
                  class="text-center"
                  :style="{
                    boxShadow:
                      'inset -8px 0 0 ' + colorSetting[props.row.label[4]],
                  }"
                  :data-eqp="props.row.label[0]"
                  @click="getEqpMCDetail"
                >
                  <VTooltip>
                    <span>{{ props.row.label[0] }}</span>
                    <template #popper>
                      {{ props.row.label[0] }}【{{ props.row.label[1] }}/{{
                        props.row.label[2]
                      }}{{ props.row.label[3] }}/{{ props.row.label[4] }}
                    】</template>
                  </VTooltip>
                </q-td>
                <q-td colspan="24">
                  <div
                    class="inline-block rounded-sm hover:ring-2 hover:ring-red-500"
                    v-for="child in props.row.row"
                    :key="child[2]"
                    :style="{
                      backgroundColor: colorSetting[child[0]],
                      width: child[1] + '%',
                      height: '100%',
                    }"
                    :data-index="child[2]"
                    :data-eqp="props.row.label[0]"
                    @click="getEqpDetail"
                  ></div>
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </q-card-section>
        <q-separator />
        <q-card-actions align="right" class="border-black border-t-1">
          <q-btn unelevated v-close-popup label="關閉" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
  <q-dialog full-width v-model="showEQPDetail" backdrop-filter="blur(4px)">
    <q-card class="relative">
      <q-btn unelevated icon="close" class="absolute z-10 px-2 py-0 top-2 right-2"/>
      <q-card-section class="items-center row q-pb-none text-h5">
        機台/{{eqpTarget}}
      </q-card-section>
      <q-separator />
      <q-card-section>
        <q-table
          :columns="detailColumns"
          :rows="eqpDetailData"
          :pagination="{rowsPerPage:10}"
          row-key="name"
        >
          <template #header="props">
            <q-tr>
              <q-th class="text-center" v-for="col in props.cols" :key="col.name">
                {{col.label}}
              </q-th>
            </q-tr>
          </template>
          <template #body-cell-STATUS2="props">
            <q-td class="text-center">{{props.row.STATUS2}}</q-td>
          </template>
          <template #body-cell-PERIOD_TIME="props">
            <q-td class="text-center">{{props.row.PERIOD_TIME}}</q-td>
          </template>
          <template #body-cell-START_TIME="props">
            <q-td class="text-center">{{props.row.START_TIME}}</q-td>
          </template>
          <template #body-cell-END_TIME="props">
            <q-td class="text-center">{{props.row.END_TIME}}</q-td>
          </template>
          <template #body-cell-EQP_AREA="props">
            <q-td class="text-center">{{props.row.EQP_AREA}}</q-td>
          </template>
          <template #body-cell-CST_NO="props">
            <q-td class="text-center">{{props.row.CST_NO}}</q-td>
          </template>
          <template #body-cell-DEVICE_NO="props">
            <q-td class="text-center">{{props.row.DEVICE_NO}}</q-td>
          </template>
          <template #body-cell-RUNCARD="props">
            <q-td class="text-center">{{props.row.RUNCARD}}</q-td>
          </template>
          <template #body-cell-REMARK="props">
            <q-td class="text-center">{{props.row.REMARK}}</q-td>
          </template>
        </q-table>
      </q-card-section>
      <q-separator />
      <q-card-actions align="right">
        <q-btn unelevated v-close-popup label="關閉" />
      </q-card-actions>
    </q-card>
  </q-dialog>
  <q-dialog full-width v-model="showEQPMC" backdrop-filter="blur(4px)">
    <q-card class="relative">
      <q-btn unelevated icon="close" class="absolute z-10 px-2 py-0 top-2 right-2"/>
      <q-card-section class="items-center row q-pb-none text-h5">
        {{eqpTarget}}
      </q-card-section>
      <q-separator />
      <q-card-section>
        <q-table
          :columns="eqpMCDetailHeader"
          :rows="eqpMCDetailRow"
          row-key="name"
          :pagination="{rowsPerPage:10}"
        >
          <template #header="props">
            <q-tr>
              <q-th v-for="col in props.cols" :key="col.name">{{col.name}}</q-th>
            </q-tr>
          </template>
          <template #body="props">
            <q-tr>
              <q-td v-for="(text,idex) in props.row" class="text-center">
                {{text}}
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </q-card-section>
      <q-separator />
      <q-card-actions align="right">
        <q-btn unelevated v-close-popup label="關閉" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<style scoped lang="scss">
.sticky-first-column {
  position: relative;
  th:first-child,
  td:first-child {
    background-color: white;
    position: sticky;
    left: 0;
    z-index: 1;
  }
}
</style>
<script setup lang="ts">
import {ref, reactive, watch, onMounted} from 'vue'

import Konva from 'konva'
import $ from 'jquery'

const today = new Date()
const tomorrow = new Date(new Date().setDate(today.getDate()+1))
const url =
  window.location.origin + window.location.pathname + '/../HomePageSearch'
const cust = $('#DS_CFM_CUST').text() as string
const clientOptions = [{value: '', label: 'All'}]
cust.split(';').forEach(row => {
  const [value, label] = row.split(',')
  clientOptions.push({value, label})
})

const isLoading = ref(false)
const showDetail = ref(false)
const showTab = ref(false)
const showEQPStatusList = ref(false)
const showEQPDetail = ref(false)
const showEQPMC = ref(false)

const width = ref(1800)
const height = ref(1200)
const container = ref<HTMLDivElement | null>(null)
const factoryOptions = ['科技', '創新', '力行'].map(f => ({value: f, label: f}))
const floorOptions = ref(
  ['1F', '2F', '3F', '7F'].map(f => ({value: f, label: f})),
)

const sFactory = ref('科技')
const sFloor = ref('1F')
const sClient = ref([''])
const sEqp = ref('')
const sEqpType = ref('')
const sModel = ref('')

const stage = ref<Konva.Stage | null>(null)
const layer = reactive<Konva.Layer>(
  new Konva.Layer({
    x: 0,
    y: 0,
    draggable: false,
  }),
)
let detail = reactive<string[]>([])
let tabList = ref<any[]>([])
let eqpStatusList = reactive<{label: string[]; row: string[][]}[]>([])
let eqpStatus = ref("");
let colorSetting = reactive({})
let eqpTarget = ref("")
let eqpMCDataCount = ref(0);
let eqpMCDetailHeader = ref<{name:string,label:string}[]>([]);
let eqpMCDetailRow = reactive<string[][]>([]);
let eqpDetailData = reactive<Record<string,string>[]>([]);

let columns = [{name: 'Time', label: 'Time', field: row => row.label}]
let detailColumns = [
  {name:"STATUS2", label:"STATUS2"},
  {name:"PERIOD_TIME", label:"PERIOD_TIME"},
  {name:"START_TIME", label:"START_TIME"},
  {name:"END_TIME", label:"END_TIME"},
  {name:"EQP_AREA", label:"EQP_AREA"},
  {name:"CST_NO", label:"CST_NO"},
  {name:"DEVICE_NO", label:"DEVICE_NO"},
  {name:"RUNCARD", label:"RUNCARD"},
  {name:"REMARK", label:"REMARK"},
]
let time = [
  {name: '8:00', label: '8:00', field: '8:00'},
  {name: '9:00', label: '9:00', field: '9:00'},
  {name: '10:00', label: '10:00', field: '10:00'},
  {name: '11:00', label: '11:00', field: '11:00'},
  {name: '12:00', label: '12:00', field: '12:00'},
  {name: '13:00', label: '13:00', field: '13:00'},
  {name: '14:00', label: '14:00', field: '14:00'},
  {name: '15:00', label: '15:00', field: '15:00'},
  {name: '16:00', label: '16:00', field: '16:00'},
  {name: '17:00', label: '17:00', field: '17:00'},
  {name: '18:00', label: '18:00', field: '18:00'},
  {name: '19:00', label: '19:00', field: '19:00'},
  {name: '20:00', label: '20:00', field: '20:00'},
  {name: '21:00', label: '21:00', field: '21:00'},
  {name: '22:00', label: '22:00', field: '22:00'},
  {name: '23:00', label: '23:00', field: '23:00'},
  {name: '24:00', label: '24:00', field: '24:00'},
  {name: '1:00', label: '1:00', field: '1:00'},
  {name: '2:00', label: '2:00', field: '2:00'},
  {name: '3:00', label: '3:00', field: '3:00'},
  {name: '4:00', label: '4:00', field: '4:00'},
  {name: '5:00', label: '5:00', field: '5:00'},
  {name: '6:00', label: '6:00', field: '6:00'},
  {name: '7:00', label: '7:00', field: '7:00'},
]

watch(sFactory, (nValue, _) => {
  let floor = ['1F', '2F', '3F', '7F']
  switch (nValue) {
    case '科技':
      break
    case '創新':
      floor = ['2F', '3F', '4F']
      break
    case '力行':
      floor = ['3F']
      break
  }
  floorOptions.value = floor.map(f => ({value: f, label: f}))
})

const toggleTab = () => {
  showTab.value = !showTab.value
}

const loadLayer = (data: string[]) => {
  layer.removeChildren()
  let indexMap = new Map()
  data.forEach(row => {
    const [
      eqpType,
      eqp_no,
      clientName,
      statusTime,
      bu,
      jsonAttrs,
      eqpStatus,
      temp,
      bgColor,
      modelName,
      z1,
      z2,
      bool,
    ] = row.split(',')
    let attrs = JSON.parse(jsonAttrs.replaceAll('，', ','))
    if (bu.includes('圖層')) {
      stage.value.setAttrs({
        width: attrs['width'],
        height: attrs['height'],
      })
    } else {
      let group = new Konva.Group({
        x: attrs.attrs.x,
        y: attrs.attrs.y,
        name: attrs.attrs.name,
      })
      if (Object.prototype.hasOwnProperty.call(attrs.attrs, 'width'))
        group.width(attrs.attrs.width)
      if (Object.prototype.hasOwnProperty.call(attrs.attrs, 'height'))
        group.height(attrs.attrs.height)
      if (Object.prototype.hasOwnProperty.call(attrs.attrs, 'scaleX'))
        group.scaleX(attrs.attrs.scaleX)
      if (Object.prototype.hasOwnProperty.call(attrs.attrs, 'scaleY'))
        group.scaleY(attrs.attrs.scaleY)
      if (Object.prototype.hasOwnProperty.call(attrs, 'zIndex')) {
        let indexName =
          attrs.attrs.x + '.' + attrs.attrs.y + '.' + attrs.attrs.name
        indexMap.set(indexName, attrs.zIndex)
      }
      //console.log({eqpType}, {eqp_no}, {clientName}, {statusTime}, {bu}, {jsonAttrs}, {eqpStatus}, {temp}, {bgColor}, {modelName}, {z1}, {z2}, {bool});

      if (eqpType.length) group.setAttr('eqpType', eqpType)
      if (clientName.length) group.setAttr('clientName', clientName)
      if (statusTime.length) group.setAttr('statusTime', statusTime)
      if (modelName.length) group.setAttr('modelName', modelName)
      if (eqpStatus.length) group.setAttr('status', eqpStatus)
      if (z1 && !bu.includes('底圖')) group.setAttr('z1', z1)
      if (z2 && !bu.includes('底圖')) group.setAttr('z2', z2)
      if (!bu.includes('底圖') || !bu.includes('圖層')) group.setAttr('bu', bu)
      if (!bu.includes('底圖') || !bu.includes('圖層'))
        group.setAttr('eqp_no', eqp_no)
      if (bu.includes('溫溼度監控')) {
        group.setAttr('temp', temp)
        group.setAttr('humid', z1)
      }
      attrs.children.forEach(child => {
        switch (child.className) {
          case 'Rect': {
            const rect = new Konva.Rect({
              fill: bgColor.length
                ? bgColor.replaceAll('，', ',')
                : child.attrs.fill,
              height: child.attrs.height,
              width: child.attrs.width,
              name: child.attrs.name,
            })
            if (!bu.includes('底圖')) {
              if (bool == 'N') rect.stroke('black')
              if (bool == 'Y') rect.stroke('red')
              rect.strokeWidth(2)
            }
            if (Object.prototype.hasOwnProperty.call(child.attrs, 'offsetX'))
              rect.setAttr('offsetX', child.attrs.offsetX)
            if (Object.prototype.hasOwnProperty.call(child.attrs, 'offsetY'))
              rect.setAttr('offsetY', child.attrs.offsetY)

            group.add(rect)

            const fontSize = 12
            const eqpNoText = new Konva.Text({fontSize}).measureSize(eqp_no)

            if (eqp_no !== 'B' && eqpType.length) {
              const clientNameText = new Konva.Text({fontSize}).measureSize(
                clientName,
              )
              const statusTimeText = new Konva.Text({fontSize}).measureSize(
                statusTime,
              )

              const yGap = (child.attrs.height - 36) / 4

              const tEqpNoText = new Konva.Text({
                x: (child.attrs.width - eqpNoText.width) / 2,
                y: yGap,
                text: eqp_no,
                fontSize: 12,
                fill: 'black',
              })

              const tClientNameText = new Konva.Text({
                x: (child.attrs.width - clientNameText.width) / 2,
                y: 2 * yGap + 12,
                text: clientName,
                fontSize: 12,
                fill: 'black',
              })

              const tStatusTimeText = new Konva.Text({
                x: (child.attrs.width - statusTimeText.width) / 2,
                y: 3 * yGap + 12 * 2,
                text: statusTime,
                fill: 'black',
              })
              group.add(tEqpNoText)
              group.add(tClientNameText)
              group.add(tStatusTimeText)
            } else if (
              eqp_no !== 'B' &&
              !bu.includes('底圖') &&
              eqpType.length == 0
            ) {
              let tEqpNoText = new Konva.Text({
                x: (child.attrs.width - eqpNoText.width) / 2,
                y: (child.attrs.height - 12) / 2,
                text: eqp_no,
                fontSize: 12,
                fill: 'black',
              })
              group.add(tEqpNoText)
            } else if (bu.includes('底圖')) {
              let offsetX = group.find('Rect')[0].getAttr('offsetX')
              let offsetY = group.find('Rect')[0].getAttr('offsetY')
              let scaleX = group.getAttr('scaleX')
              let scaleY = group.getAttr('scaleY')
              let width = child.attrs.width
              let height = child.attrs.height
              let tEqpNoText = new Konva.Text({
                x: (width - eqpNoText.width) / 2,
                y: (height - 12) / 2,
                scaleX: 1 / scaleX,
                scaleY: 1 / scaleY,
                text: eqp_no,
                fontSize: 12,
                fill: 'black',
                offsetX,
                offsetY,
              })
              group.add(tEqpNoText)
            }
            break
          }
          case 'Circle': {
            const circle = new Konva.Circle({
              fill: bgColor.length
                ? bgColor.replaceAll('，', ',')
                : child.attrs.fill,
              x: child.attrs.x,
              y: child.attrs.y,
              radius: child.attrs.radius,
              name: child.attrs.name,
              stroke: bool == 'N' ? 'black' : 'red',
              strokeWidth: 2,
            })
            group.add(circle)
            break
          }
        }
      })

      if (
        !bu.includes('底圖') &&
        !bu.includes('圖層') &&
        eqp_no !== 'B' &&
        !bu.includes('溫溼度監控')
      ) {
        group.on("mouseenter", showTooltip);
        group.on("mousemove", moveTooltip);
        group.on("mouseleave", removeTooltip);
        group.on('click', loadDetail)
      } else if (bu.includes('溫溼度監控')) {
        group.on("mouseenter", showTooltip);
        group.on("mousemove", moveTooltip);
        group.on("mouseleave", removeTooltip);
        group.on('click', () => {
          let destination =
            window.location.origin +
            window.location.pathname +
            '/../../Default/TEMP'
          window.open(destination, '_blank').focus()
        })
      }
      layer.add(group)
    }
  })
  layer.getChildren().forEach(child => {
    let x = child.getAttr('x')
    let y = child.getAttr('y')
    let name = child.getAttr('name')
    let indexName = x + '.' + y + '.' + name
    let index = indexMap.get(indexName)
    child.zIndex(index)
  })
  layer.batchDraw()
  isLoading.value = false
}

const showTooltip = (e) => {
  let index = layer.getChildren().length;
  let group = e.target.getParent();
  let height = 20;
  const gapY = 4;
  const {x, y} = stage.value.getPointerPosition(); 
  let tooltipGroup = new Konva.Group({
    x:x+10,
    y:y+10,
    name:"tooltip"
  });
  let width = 120;
  let bu = group.getAttr("bu");
  if (!bu.includes("溫溼度監控")) {
    let eqp_no = group.getAttr("eqp_no");
    let eqp_text = new Konva.Text({
      x:5,
      y:gapY,
      text:eqp_no,
      fontSize:12,
      fill:"#333"
    });
    if (eqp_text.width() > width) width = eqp_text.width() + 10
    tooltipGroup.add(eqp_text);
    let {clientName, statusTime, modelName, z1, z2} = group.getAttrs();
    if (clientName && clientName.length > 0) {
      let text = new Konva.Text({
        x:5,
        y:2*gapY + 12,
        text:clientName,
        fontSize:12,
        fill:"#333"
      });
      height+=16;
      tooltipGroup.add(text)
      let text_width = text.width();
      if (text_width > width) width = text_width + 10
      if (height < text.y() + 16) height = text.y() + 16;
    }
    if (statusTime && statusTime.length > 0) {
      let text = new Konva.Text({
        x:5,
        y:3*gapY + 12*2,
        text:statusTime,
        fontSize:12,
        fill:"#333"
      }); 
      height+=16;
      tooltipGroup.add(text)
      let text_width = text.width();
      if (text_width > width) width = text_width + 10
      if (height < text.y() + 16) height = text.y() + 16;
    }
    if (modelName && modelName.length > 0) {
      let text = new Konva.Text({
        x:5,
        y:4*gapY + 12*3,
        text:modelName,
        fontSize:12,
        fill:"#333"
      });
      height+=16;
      tooltipGroup.add(text);
      let text_width = text.width();
      if (text_width > width) width = text_width + 10
      if (height < text.y() + 16) height = text.y() + 16;
    }
    if (z1 && z1.length > 0) {
      let text = new Konva.Text({
        x:5,
        y:5*gapY + 12*4,
        text:z1,
        fontSize:12,
        fill:"#333"
      });
      height+=16;
      tooltipGroup.add(text); 
      let text_width = text.width();
      if (text_width > width) width = text_width + 10
      if (height < text.y() + 16) height = text.y() + 16;
    }
    if (z2 && z2.length > 0) {
      let text = new Konva.Text({
        x:5,
        y:6*gapY + 12*5,
        text:z2,
        fontSize:12,
        fill:"#333"
      });
      height+=16;
      tooltipGroup.add(text);
      let text_width = text.width();
      if (text_width > width) width = text_width + 10
      if (height < text.y() + 16) height = text.y() + 16;
    } 
  } else {
    let {eqp_no, temp, humid} = group.getAttrs();
    height = 68;
    let title = new Konva.Text({
      x:5,
      y:gapY,
      text:"溫溼度監控",
      fontSize:12,
      fill:"#333"
    });
    let eqp_text = new Konva.Text({
      x:5,
      y:2*gapY + 12,
      text:eqp_no,
      fontSize:12,
      fill:"#333"
    }); 
    let temp_text = new Konva.Text({
      x:5,
      y:3*gapY + 12*2,
      text:"溫度:"+temp,
      fontSize:12,
      fill:"#333"
    });
    let humid_text = new Konva.Text({
      x:5,
      y:4*gapY + 12*3,
      text:"濕度:"+humid,
      fontSize:12,
      fill:"#333"
    });
    if (title.width() > width) width = title.width() + 10
    if (eqp_text.width() > width) width = eqp_text.width() + 10
    if (temp_text.width() > width) width = temp_text.width() + 10
    if (humid_text.width() > width) width = humid_text.width() + 10
    tooltipGroup.add(title);
    tooltipGroup.add(eqp_text);
    tooltipGroup.add(temp_text);
    tooltipGroup.add(humid_text);
  }
  let rect = new Konva.Rect({
    width,
    height,
    fill:'#eee',
    stroke:"#333",
    strokeWidth:1
  });
  tooltipGroup.add(rect);
  layer.add(tooltipGroup);
  rect.zIndex(0)
}

const moveTooltip = (e) => {
  let tooltip = layer.find(".tooltip")[0];
  let {x, y} = stage.value.getPointerPosition();
  tooltip.absolutePosition({x:x+10, y:y+10});

}

const removeTooltip = (e) => {
  let tooltip = layer.find(".tooltip")[0];
  tooltip.destroy();
}

const loadDetail = e => {
  let group = e.target.getParent()
  const {eqp_no, bu} = group.getAttrs()
  isLoading.value = true
  let payload = {
    BU: '',
    NumberPerAPage: -1,
    PageName: 'DS_CFM_MAP_LIST',
    PageNumber: -1,
    QueryArr: [eqp_no, bu],
  }

  $.ajax({
    type: 'POST',
    url,
    data: JSON.stringify(payload),
    success: data => {
      isLoading.value = false
      showDetail.value = true
      detail = data[0].split(',')
    },
    dataType: 'json',
    contentType: 'application/json; charset=utf-8',
  })
}

const downloadExcel = async () => {
  const payload = {
    BU: '',
    NumberPerAPage: -1,
    PageName: 'DS_CFM_MAP_ALL_LIST',
    PageNumber: -1,
    QueryArr: [
      sFactory.value,
      sFloor.value,
      sClient.value.join('@'),
      sEqp.value,
      sEqpType.value,
      sModel.value,
    ],
  }
  $.ajax({
    type: 'POST',
    url: window.location.origin + window.location.pathname + '/../ExportExcel',
    data: JSON.stringify(payload),
    success: res => {
      let a = $("#HiddenClickBtn");
      a.attr("href", window.location.origin + res);
    },
    async: true,
    dataType: 'json',
    contentType: 'application/json; charset=utf-8',
  })
}

const loadTab = (data: string[]) => {
  const [row_title, row_text, row_count, row_color] = data
  let title = row_title.split(',')
  let text = row_text.split(',')
  let count = row_count.split(',')
  let color = row_color.split(',')
  let list = []
  let setting = {}
  title.forEach((t, i) => {
    let tColor = color[i].includes('，')
      ? color[i].replaceAll('，', ',')
      : color[i]
    let obj = {
      tabTitle: t,
      tabText: text[i],
      tabCount: count[i],
      tabColor: tColor,
    }
    setting[t] = tColor
    list.push(obj)
  })
  colorSetting = setting
  tabList.value = list
}

const loadEqpDetailData = (data:string[]) => {
  let buffer:Record<string,string>[] = [];
  data.forEach(row => {
    const [STATUS2,PERIOD_TIME,START_TIME,END_TIME,EQP_AREA,CST_NO, DEVICE_NO, RUNCARD, REMARK] = row.split(",");
    buffer.push({
      STATUS2,
      PERIOD_TIME,
      START_TIME,
      END_TIME,
      EQP_AREA,
      CST_NO,
      DEVICE_NO,
      RUNCARD,
      REMARK
    })
  });
  eqpDetailData = buffer;
  showEQPDetail.value = true
}

const loadEqpMcData = (data:string[]) => {
  const [header, ...rest] = data;
  let headerArr = [];
  let buffer = []
  header.split(",").forEach(str => {
    headerArr.push({
      align:"center",
      name:str,
      label:str,
    })
  });
  eqpMCDetailHeader.value = headerArr;
  
  rest.forEach(row => {
    buffer.push(row.split(","))
  });
  eqpMCDetailRow = buffer;
  showEQPMC.value = true;
}

const getEqpStatus = e => {
  //isLoading.value = true
  let status = $(e.target).closest('.q-btn')[0].dataset.status
  eqpStatus.value = status
  let eqpName = []
  layer.find('.cfm-object').forEach(group => {
    let attrs = group.getAttrs()
    if (attrs.status == status) {
      eqpName.push(attrs.eqp_no)
    }
  })
  const payload = {
    BU: '',
    NumberPerAPage: -1,
    PageName: 'DS_EQP',
    PageNumber: -1,
    QueryArr: [sFactory.value, sFloor.value, eqpName.join('@'), status],
  }

  $.ajax({
    type: 'POST',
    url,
    data: JSON.stringify(payload),
    success: loadStatusList,
  })
}

const getEqpMCDetail = (e) => {
  let td = $(e.target).closest(".q-td");
  let eqp = td[0].dataset.eqp;
  let payload = {
    BU:"",
    NumberPerAPage: -1,
    PageName:"DS_MC_DETAIL",
    QueryArr:[eqp, ""],
    PageNumber:-1
  };
  eqpTarget.value = eqp;
  $.ajax({
    type:"POST",
    url,
    data:JSON.stringify(payload),
    success:loadEqpMcData
  })
}

const getEqpDetail = (e) => {
  let dataset = $(e.target)[0].dataset
  eqpTarget.value = dataset.eqp
  let payload = {
    BU:"",
    NumberPerAPage: -1,
    PageName:"DS_EQP_DETAIL",
    PageNumber:-1,
    QueryArr:[dataset.eqp, dataset.index]
  }

  $.ajax({
    type:"POST",
    url,
    data:JSON.stringify(payload),
    success:loadEqpDetailData
  })
}

const loadStatusList = (data: string[]) => {
  isLoading.value = false
  let buffer = []
  data.forEach((row, idx) => {
    let [row_title, row_progress] = row.split(',')
    let obj = {
      id: idx,
      label: row_title.split('，'),
      row: row_progress.split('@').map(r => r.split('，')),
      tag: row_title.split('，')[0],
    }
    buffer.push(obj)
  })
  eqpStatusList = buffer
  showEQPStatusList.value = true
}

const loadData = () => {
  isLoading.value = true
  const tabPayload = {
    BU: '',
    NumberPerAPage: -1,
    PageName: 'DS_CFM_MAP_NUM',
    PageNumber: -1,
    QueryArr: [
      sFactory.value,
      sFloor.value,
      sClient.value.join('@'),
      sEqp.value,
      sEqpType.value,
      sModel.value,
    ],
  }
  const mapPayload = {
    BU: '',
    NumberPerAPage: -1,
    PageName: 'DS_CFM_MAP',
    PageNumber: -1,
    QueryArr: [
      sFactory.value,
      sFloor.value,
      sClient.value.join('@'),
      sEqp.value,
      sEqpType.value,
      sModel.value,
    ],
  }

  $.ajax({
    type: 'POST',
    url,
    data: JSON.stringify(tabPayload),
    success: loadTab,
    async: true,
    dataType: 'json',
    contentType: 'application/json; charset=utf-8',
  })

  $.ajax({
    type: 'POST',
    url,
    data: JSON.stringify(mapPayload),
    success: loadLayer,
    dataType: 'json',
    contentType: 'application/json; charset=utf-8',
  })
}
onMounted(() => {
  // init stage
  stage.value = new Konva.Stage({
    container: 'canvas_container',
    width: width.value,
    height: height.value,
  })
  stage.value.add(layer)
  loadData()
})
</script>
