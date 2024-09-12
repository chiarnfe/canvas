<template>
  <div class="h-[50px] w-full bg-gray-500/20"></div>
  <div class="w-full px-4">
    <h4 class="text-h4 mt-5 mb-2.5 dfkai">Equipment CFM</h4>
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
            <label for="fact" class="text-sm dfkai !font-bold"> 廠區 </label>
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
          v-model="sCategory"
          :options="categoryOptions"
          options-value="value"
          options-label="label"
          emit-value
          map-options
          outlined
          dense
          multiple
        >
          <template v-slot:before>
            <label class="text-sm">顯示類別</label>
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
        >
          <template v-slot:before>
            <label class="text-sm">客戶</label>
          </template>
        </q-select>
        <q-input v-model="sEqp" class="w-32" outlined dense>
          <template v-slot:before>
            <label class="text-sm">機台</label>
          </template>
        </q-input>
        <q-input v-model="sEqpType" class="w-32" outlined dense>
          <template v-slot:before>
            <label class="text-sm">機種</label>
          </template>
        </q-input>
        <q-input v-model="sModel" class="w-32" outlined dense>
          <template v-slot:before>
            <label class="text-sm">型號</label>
          </template>
        </q-input>
        <q-select
          v-model="sOCR"
          :options="ynOptions"
          options-value="value"
          options-label="label"
          emit-value
          map-options
          outlined
          dense
        >
          <template v-slot:before>
            <label class="text-sm">OCR</label>
          </template>
        </q-select>
        <q-select
          v-model="sKeyProd"
          :options="ynOptions"
          options-value="value"
          options-label="label"
          emit-value
          map-options
          outlined
          dense
        >
          <template v-slot:before>
            <label class="text-sm">重點產品</label>
          </template>
        </q-select>
        <q-select
          v-model="sCharter"
          :options="ynOptions"
          options-value="value"
          options-label="label"
          emit-value
          map-options
          outlined
          dense
        >
          <template v-slot:before>
            <label class="text-sm">客戶包機</label>
          </template>
        </q-select>
        <q-select
          v-model="sBottleNeck"
          :options="ynOptions"
          options-value="value"
          options-label="label"
          emit-value
          map-options
          outlined
          dense
        >
          <template v-slot:before>
            <label class="text-sm">重點機台</label>
          </template>
        </q-select>
      </div>
      <q-btn
        unelevated
        label="搜尋"
        class="px-3 py-1 rounded-md"
        style="border: 1px solid #aaa"
        @click="loadData"
      />
      <span>{{ new Date().toLocaleTimeString("zh-TW", {year:'numeric', month:'2-digit', day:'2-digit'}) }}</span>
    </div>
    <q-separator class="q-my-md" />
    <div class="flex flex-row pb-4 gap-x-2">
      <div
        v-show="showTab"
        class="w-[calc(16.66%_-_50px)] flex flex-col gap-y-1 overflow-auto px-2 min-w-[180px]"
      >
        <q-btn
          v-for="(tab, index) in tabList"
          :key="index"
          :class="['w-full py-0 pr-0 pl-2', index < 5 ? '!cursor-default' : '']"
          size="sm"
          :ripple="false"
          no-caps
          v-on="index > 4 ? {click: getEqpStatus} : {}"
          :data-status="tab.tabTitle"
        >
          <template v-slot:default>
            <div class="flex flex-row items-center w-full">
              <span class="w-2/3 text-left">{{ tab.tabTitle }}</span>
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
          高溫紅框
        </div>
        <div
          class="flex flex-row items-center justify-center h-6 rounded-sm ring-2 ring-inset ring-[blue]"
        >
          低溫藍框
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
        :class="[showTab ? 'w-5/6' : 'w-[calc(100%_-_50px)]']"
        style="
          box-shadow:
            inset 1px 0 0 #000,
            inset 0 1px 0 #000,
            inset -1px 0 0 #000,
            inset 0 -1px 0 #000;
          height: calc(100vh - 210px);
          backgroundColor:rgb(236,236,236)
        "
      >
        <div class="w-full" ref="container" id="canvas_container"></div>
      </q-scroll-area>
    </div>
</div>
<q-dialog v-model="isLoading" backdrop-filter="blur(4px)" persistent>
  <q-card class="w-96">
    <q-card-section> 資料讀取中... </q-card-section>
  </q-card>
</q-dialog>
<q-dialog full-width v-model="showDetail" backdrop-filter="blur(4px)">
  <q-card class="relative">
    <q-card-actions class="absolute top-2 right-2 z-10 p-0">
      <q-btn unelevated v-close-popup icon="close" />
    </q-card-actions>
    <q-card-section class="items-center row q-pb-none text-h5">
      {{ detail[0] }}
      <q-btn color="primary" dense unelevated class="text-white ml-3 px-2" v-if="detail[33]">關site data</q-btn>
    </q-card-section>
    <q-separator />
    <q-card-section class="overflow-auto max-h-[calc(100vh_-_148px)]">
      <q-markup-table class="px-4 tr-10" flat>
        <thead>
          <tr>
            <th colspan="4" class="!text-base !bg-gray-400">機況明細</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="!bg-gray-400 text-center">機台</td>
            <td class="text-center">{{ detail[0] }}</td>
            <td class="!bg-gray-400 text-center">流程卡</td>
            <td class="text-center">{{ detail[17] }}</td>
          </tr>
          <tr>
            <td class="!bg-gray-400 text-center">測試機</td>
            <td class="text-center">{{ detail[1] }}</td>
            <td class="!bg-gray-400 text-center">製程別</td>
            <td class="text-center">{{ detail[18] }}</td>
          </tr>
          <tr>
            <td class="!bg-gray-400 text-center">機群</td>
            <td class="text-center">{{ detail[2] }}</td>
            <td class="!bg-gray-400 text-center">PKG_TYPE</td>
            <td class="text-center">{{ detail[19] }}</td>
          </tr>
          <tr>
            <td class="!bg-gray-400 text-center">區域</td>
            <td class="text-center">{{ detail[3] }}</td>
            <td class="!bg-gray-400 text-center">SPEC_NO</td>
            <td class="text-center">{{ detail[20] }}</td>
          </tr>
          <tr>
            <td class="!bg-gray-400 text-center">狀態時間HR</td>
            <td class="text-center">{{ detail[4] }}</td>
            <td class="!bg-gray-400 text-center">工程師</td>
            <td class="text-center">{{ detail[21] }}</td>
          </tr>
          <tr>
            <td class="!bg-gray-400 text-center">機況</td>
            <td class="text-center">{{ detail[5] }}</td>
            <td class="!bg-gray-400 text-center">INI測試機</td>
            <td class="text-center">{{ detail[22] }}</td>
          </tr>
          <tr>
            <td class="!bg-gray-400 text-center">子狀態</td>
            <td class="text-center">{{ detail[6] }}</td>
            <td class="!bg-gray-400 text-center">Host Name</td>
            <td class="text-center">{{ detail[23] }}</td>
          </tr>
          <tr>
            <td class="!bg-gray-400 text-center">異常單號</td>
            <td class="text-center">{{ detail[7] }}</td>
            <td class="!bg-gray-400 text-center">批號</td>
            <td class="text-center">{{ detail[24] }}</td>
          </tr>
          <tr>
            <td class="!bg-gray-400 text-center">型號</td>
            <td class="text-center">{{ detail[8] }}</td>
            <td class="!bg-gray-400 text-center">STEP</td>
            <td class="text-center">{{ detail[25] }}</td>
          </tr>
          <tr>
            <td class="!bg-gray-400 text-center">子體</td>
            <td class="text-center">{{ detail[9] }}</td>
            <td class="!bg-gray-400 text-center">Probe Card</td>
            <td class="text-center">{{ detail[26] }}</td>
          </tr>
          <tr>
            <td class="!bg-gray-400 text-center">客戶代碼</td>
            <td class="text-center">{{ detail[10] }}</td>
            <td class="!bg-gray-400 text-center">Load Board</td>
            <td class="text-center">{{ detail[27] }}</td>
          </tr>
          <tr>
            <td class="!bg-gray-400 text-center">客戶名稱</td>
            <td class="text-center">{{ detail[11] }}</td>
            <td class="!bg-gray-400 text-center">Dut Board</td>
            <td class="text-center">{{ detail[28] }}</td>
          </tr>
          <tr>
            <td class="!bg-gray-400 text-center">應開DUT</td>
            <td class="text-center">{{ detail[12] }}</td>
            <td class="!bg-gray-400 text-center">Socket</td>
            <td class="text-center">{{ detail[29] }}</td>
          </tr>
          <tr>
            <td class="!bg-gray-400 text-center">實開DUT</td>
            <td class="text-center">{{ detail[13] }}</td>
            <td class="!bg-gray-400 text-center">Change Kit</td>
            <td class="text-center">{{ detail[30] }}</td>
          </tr>
          <tr>
            <td class="!bg-gray-400 text-center">Abnor_Bin</td>
            <td class="text-center">{{ detail[14] }}</td>
            <td class="!bg-gray-400 text-center">Abssy</td>
            <td class="text-center">{{ detail[31] }}</td>
          </tr>
          <tr>
            <td class="!bg-gray-400 text-center">Abnor_DUT</td>
            <td class="text-center">{{ detail[15] }}</td>
            <td class="!bg-gray-400 text-center">Temp</td>
            <td class="text-center">{{ detail[32] }}</td>
          </tr>
          <tr>
            <td class="!bg-gray-400 text-center">Change_Time</td>
            <td class="text-center">{{ detail[16] }}</td>
            <td v-if="detail[33]" class="!bg-gray-400 text-center">關Site開始時間</td>
            <td v-if="detail[33]" class="text-center">{{ detail[33]}}</td>
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
              <q-td v-for="(text,idex) in props.row" class="text-center" :key="idex">
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
.tr-10 {
    td{
        height:2.5rem;
        width:25%;
    }
}
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
const cust = $('#TEST_CFM_CUST').text() as string
const clientOptions = [{value: '', label: 'All'}]
cust.split(';').forEach(row => {
  const [value, label] = row.split(',')
  clientOptions.push({value, label})
})

const ynOptions = [{value:"", label:"All"}, {value:"Y", label:"Y"}, {value:"N", label:"N"}]

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
const categoryOptions = ['機台', '配件'].map(c => ({value:c, label:c}))

const sFactory = ref('科技')
const sFloor = ref('1F')
const sCategory = ref('機台')
const sClient = ref([''])
const sEqp = ref('')
const sEqpType = ref('')
const sModel = ref('')
const sOCR = ref('')
const sKeyProd = ref('')
const sCharter = ref('')
const sBottleNeck = ref('')

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
  let indexMap = new Map();
  data.forEach(row => {
    const [eqp_no,probeCard,eqpCluster,clientCode,statusTime,bu,jsonAttrs,temp,eqpStatus,bgColor,subStatus] = row.split(",")
    const attrs = JSON.parse(jsonAttrs.replaceAll("，", ","));
    if (Object.prototype.hasOwnProperty.call(attrs, 'zIndex')) {
      attrs["eqp_no"] = eqp_no
      attrs["probeCard"] = probeCard
      attrs["eqpCluster"] = eqpCluster
      attrs["clientCode"] = clientCode
      attrs["statusTime"] = statusTime
      attrs["bu"] = bu
      attrs["temp"] = temp
      attrs["eqpStatus"] = eqpStatus
      attrs["bgColor"] = bgColor.replaceAll("，", ",")
      attrs["subStatus"] = subStatus
      let index = attrs['zIndex']
      indexMap.set(index, attrs)
    } else {
      width.value = attrs["width"]
      height.value = attrs["height"]
    }
  })
  let length = indexMap.size
  for (let index=0;index < length;index++) {
    let attrs = indexMap.get(index);
    let grpConfig = attrs['attrs'] as Konva.GroupConfig
    let group = new Konva.Group(grpConfig)
    let temp = attrs["temp"]
    let bu = attrs["bu"]
    let eqp_no = attrs["eqp_no"]
    let eqpCluster = attrs["eqpCluster"]
    let probeCard = attrs["probeCard"]
    let clientCode = attrs["clientCode"]
    let statusTime = attrs["statusTime"]
    let eqpStatus = attrs["eqpStatus"] 
    let subStatus = attrs["subStatus"] 
    group.setAttr("eqp_no", eqp_no)
    group.setAttr("probeCard",  probeCard)
    group.setAttr("eqpCluster", eqpCluster)
    group.setAttr("clientCode", clientCode)
    group.setAttr("statusTime", statusTime)
    group.setAttr("bu", bu)
    group.setAttr("temp", temp)
    group.setAttr("eqpStatus", eqpStatus)
    group.setAttr("subStatus", subStatus)
    const {attrs:cAttrs, className} =  attrs.children[0];
    let node = new Konva[className](cAttrs)
    if (eqp_no == "B") {
      node.fill("black")
    } else {
      node.fill(attrs["bgColor"])
      if (!bu.includes("底圖")) {
        if (temp.length && temp > 25) {
          node.stroke('red')
        } else if (temp.length && temp < 25) {
          node.stroke('blue')
        } else {
          node.stroke('black')          
        }
      }
    }
    node.strokeWidth(2)
    group.add(node)
    let clickable = true;
    if (eqpCluster.length==0 && statusTime.length == 0 && clientCode.length == 0) clickable = false
    if(eqp_no !== 'B' && !bu.includes("底圖") && !bu.includes("溫溼度監控") && !bu.includes("氮氣櫃") && clickable) {    
      let eqpEstText = new Konva.Text({fontSize:12}).measureSize(eqp_no)
      let codeEstText = new Konva.Text({fontSize:12}).measureSize(clientCode)
      let clusterEstText = new Konva.Text({fontSize:12}).measureSize(eqpCluster)
      let timeEstText = new Konva.Text({fontSize:12}).measureSize(statusTime)
      // console.log({eqpEstText}, {codeEstText},{clusterEstText},{timeEstText})
      switch (className) {
        case "Rect":{
          let shapeHeight = node.height();
          let shapeWidth = node.width();
          let yGap = (shapeHeight - 12*3)/4
          if (statusTime.length == 0) {
            yGap = (shapeHeight - 12*2)/3
          } else if (clientCode.length == 0 && eqpCluster.length == 0) {
            yGap = (shapeHeight - 12)/2
          }

          let eqpText = new Konva.Text({
            fontSize:12,
            text:eqp_no,
            fill:"#333",
            y:yGap,
            x:(shapeWidth - eqpEstText.width)/2
          })
          let clusterText = new Konva.Text({
            fontSize:12,
            text:eqpCluster,
            fill:"#333",
            y:2*yGap+12,
            x:(shapeWidth/2 - clusterEstText.width)/2
          })
          let codeText = new Konva.Text({
            fontSize:12,
            text:clientCode,
            fill:"#333",
            y:2*yGap+12,
            x:shapeWidth/2 + (shapeWidth/2 - codeEstText.width)/2
          })
          let timeText = new Konva.Text({
            fontSize:12,
            text:statusTime,
            fill:"#333",
            y:3*yGap + 12*2,
            x:(shapeWidth - timeEstText.width)/2
          })
          group.add(eqpText)
          group.add(clusterText)
          group.add(codeText)
          group.add(timeText)
        }
        break;
        default:
        break;
      }
      group.on("mouseenter", showTooltip)
      group.on("mousemove", moveTooltip)
      group.on("mouseleave", removeTooltip)
      group.on("click", loadDetail)
    } else if (bu.includes("溫溼度監控")) {
      group.on("mouseenter", showTooltip)
      group.on("mousemove", moveTooltip)
      group.on("mouseleave", removeTooltip)
      group.on("click", () => {
        let destination = window.location.origin + window.location.pathname + "/../../Default/TEMP"
        window.open(destination, "_blank").focus()
      })
    } else if ((bu.includes("氮氣櫃") || !clickable ) && !bu.includes("底圖")) {
      let width = node.width();
      let height = node.height();
      let estText = new Konva.Text({fontSize:12}).measureSize(eqp_no);
      let text = new Konva.Text({
        text:eqp_no,
        x:(width - estText.width)/2,
        y:(height - 12)/2,
        fill:"#333",
        fontSize:12,
      })
      group.add(text)
    }
    layer.add(group)
  }

  layer.batchDraw();
  isLoading.value = false
}

const showTooltip = (e) => {
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
    let {eqpCluster, clientCode, statusTime, subStatus} = group.getAttrs();
    if (eqpCluster && eqpCluster.length > 0) {
      let text = new Konva.Text({
        x:5,
        y:2*gapY + 12,
        text:eqpCluster,
        fontSize:12,
        fill:"#333"
      });
      height+=16;
      tooltipGroup.add(text)
      let text_width = text.width();
      if (text_width > width) width = text_width + 10
      if (height < text.y() + 16) height = text.y() + 16;
    }
    if (clientCode && clientCode.length) {
        let shift = 5;
        if (eqpCluster && eqpCluster.length) {
            let shiftText = new Konva.Text({fontSize:12}).measureSize(eqpCluster)
            shift+=shiftText.width + 10
        }
        let text = new Konva.Text({
            x:shift,
            y:2*gapY + 12,
            text:clientCode,
            fontSize:12,
            fill:"#333"
        })
        height+=16;
      tooltipGroup.add(text)
      let text_width = text.width();
      if (text_width > width) width = text_width + 10
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
    if (subStatus && subStatus.length > 0) {
      let text = new Konva.Text({
        x:5,
        y:4*gapY + 12*3,
        text:subStatus,
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
    PageName: 'TEST_CFM_MAP_LIST',
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
    PageName: 'TEST_CFM_MAP_ALL_LIST',
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
      let a = $("#HiddenClickBtn")
      a.attr("href", window.location.origin + res);
      a.click();
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
    const [STATUS2, PERIOD_TIME, START_TIME, END_TIME, SUB_STATUS, STEP, TESTER, CST_NO, DEVICE_NO, RUNCARD, ACCESSORY4, ACCESSORY1, DUT_USE, DUT] = row.split(",");
    buffer.push({
      STATUS2,
      PERIOD_TIME,
      START_TIME, 
      END_TIME,
      SUB_STATUS,
      STEP,
      TESTER,
      CST_NO,
      DEVICE_NO,
      RUNCARD,
      ACCESSORY4,
      ACCESSORY1,
      DUT_USE,
      DUT
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
    if (attrs.eqpStatus == status) {
      eqpName.push(attrs.eqp_no)
    }
  })
  const payload = {
    BU: '',
    NumberPerAPage: -1,
    PageName: 'TEST_EQP',
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
    PageName:"TEST_MC_DETAIL",
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
    PageName:"TEST_EQP_DETAIL",
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
    PageName: 'TEST_CFM_MAP_NUM',
    PageNumber: -1,
    QueryArr: [
      sFactory.value,
      sFloor.value,
      sCategory.value,
      sClient.value.join('@'),
      sEqp.value,
      sEqpType.value,
      sModel.value,
      sOCR.value,
      sKeyProd.value,
      sCharter.value,
      sBottleNeck.value
    ],
  }
  const mapPayload = {
    BU: '',
    NumberPerAPage: -1,
    PageName: 'TEST_CFM_MAP',
    PageNumber: -1,
    QueryArr: [
      sFactory.value,
      sFloor.value,
      sCategory.value,
      sClient.value.join('@'),
      sEqp.value,
      sEqpType.value,
      sModel.value,
      sOCR.value,
      sKeyProd.value,
      sCharter.value,
      sBottleNeck.value
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
    background:"rgb(236,236,236)"
  })
  stage.value.add(layer)
//   loadData()
})
</script>
