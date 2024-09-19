<template>
  <CfmMenu />
  <div class="w-full px-4">
    <div class="relative">
      <h4 class="text-h4 mt-5 mb-2.5 arial">Equipment CFM</h4>
    </div>
    <div class="flex flex-row gap-2 items-center flex-wrap relative">
      <q-btn size="md" class="absolute right-0 bottom-0 q-px-sm" icon="zoom_in" @click="zoomIn" outline />
      <q-btn size="md" class="absolute right-12 bottom-0 q-px-sm" icon="zoom_out" @click="zoomOut" outline />
      <q-btn
        unelevated
        dense
        color="primary"
        label="匯出"
        class="rounded-md px-3 py-1 dfkai"
        @click="downloadExcel"
      />
      <div class="flex flex-row gap-2 flex-wrap">
        <q-select
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
            <label class="text-sm dfkai !font-bold hover:cursor-pointer" @click="focus"> 廠區 </label>
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
            <label class="text-sm dfkai !font-bold hover:cursor-pointer" @click="focus"> 樓層 </label>
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
        >
          <template v-slot:before>
            <label class="text-sm dfkai !font-bold hover:cursor-pointer" @click="focus">顯示類別</label>
          </template>
        </q-select>
        <q-select
          input-debounce="600"
          class='w-56'
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
            <label class="text-sm dfkai !font-bold hover:cursor-pointer" @click="focus">客戶</label>
          </template>
          <template v-slot:before-options> 
            <div class="p-2 sticky top-0 bg-white z-10" style="boxShadow:inset 0 -1px 0 rgba(0,0,0,0.12)">
              <div class="flex flex-row justify-center w-full mt-1">
                <q-btn unelevated outline class="w-1/2 capitalize rounded-r-none" label="Select All" @click="selectAllClient" />
                <q-btn unelevated outline class="w-1/2 capitalize rounded-l-none" label="Deselect All" @click="deselectAllClient" />
              </div>
            </div>
          </template>
          <template v-slot:selected>
            <span v-if="sClient.length==0">Nothing selected</span>
            <span v-else-if="sClient.length==1">{{sClient[0] == '' ? "All": sClient[0]}}</span>
            <span v-else>{{sClient.length}} items selected</span>
          </template>
          <template v-slot:option="scope">
            {{console.log(scope)}}
            <q-item v-bind="scope.itemProps" dense>
              <q-item-section>{{scope.opt.label}}</q-item-section>
              <q-item-section v-show="scope.selected" side>
                <q-icon name="check" />
              </q-item-section>
            </q-item>
          </template>
        </q-select>
        <q-input v-model="sEqp" class="w-32" outlined dense>
          <template v-slot:before>
            <label class="text-sm dfkai !font-bold hover:cursor-pointer" @click="focus">機台</label>
          </template>
        </q-input>
        <q-input v-model="sEqpType" class="w-32" outlined dense>
          <template v-slot:before>
            <label class="text-sm dfkai !font-bold hover:cursor-pointer" @click="focus">機種</label>
          </template>
        </q-input>
        <q-input v-model="sModel" class="w-32" outlined dense>
          <template v-slot:before>
            <label class="text-sm dfkai !font-bold hover:cursor-pointer" @click="focus">型號</label>
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
            <label class="text-sm dfkai !font-bold hover:cursor-pointer" @click="focus">OCR</label>
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
            <label class="text-sm dfkai !font-bold hover:cursor-pointer" @click="focus">重點產品</label>
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
            <label class="text-sm dfkai !font-bold hover:cursor-pointer" @click="focus">客戶包機</label>
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
            <label class="text-sm dfkai !font-bold hover:cursor-pointer" @click="focus">重點機台</label>
          </template>
        </q-select>
      </div>
      <q-btn
        unelevated
        dense
        label="搜尋"
        class="px-3 py-1 rounded-md dfkai"
        style="border: 1px solid #aaa"
        @click="loadData"
      />
      <span>{{ new Date().toLocaleTimeString("zh-TW", {year:'numeric', month:'2-digit', day:'2-digit', hour12:false, hour:'2-digit', minute:'2-digit'}) }}</span>
    </div>
    <q-separator class="q-my-md" />
    <div class="flex flex-row pb-4 gap-x-2">
      <q-scroll-area
        v-show="showTab"
        class="w-[calc(16.66%_-_50px)] min-w-[180px] max-h-[calc(100vh_-_220px)]"
      >
        <div class="flex flex-col gap-y-1 px-2">
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
            class="flex flex-row items-center justify-center h-6 rounded-sm ring-2 ring-inset ring-red-500 dfkai"
          >
            高溫紅框
          </div>
          <div
            class="flex flex-row items-center justify-center h-6 rounded-sm ring-2 ring-inset ring-[blue] dfkai mb-4"
          >
            低溫藍框
          </div>
          <div v-for="block in blockColor" :style="{backgroundColor:block.fillColor}" class="h-6 text-center" style="line-height:24px" :key="block.blockName">{{block.blockName}}</div>
        </div>
      </q-scroll-area>
      <q-btn
        icon="chevron_right"
        unelevated
        color="primary"
        class="px-1"
        @click="toggleTab"
      />
      <q-scroll-area
        :class="[showTab ? 'w-5/6' : 'w-[calc(100%_-_50px)]']"
        @scroll="scroll" 
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
      <q-btn color="primary" dense unelevated class="text-white ml-3 px-2" v-if="detail[33].length" @click="searchCloseSite">關site data</q-btn>
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
            <td v-if="detail[33].length" class="!bg-gray-400 text-center">關Site開始時間</td>
            <td v-if="detail[33].length" class="text-center">{{ detail[33]}}</td>
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
                class="inline-block hover:ring-2 hover:ring-red-500 hover:mr-0.5"
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
          <template #body-cell-SUB_STATUS="props">
            <q-td class="text-center">{{props.row.SUB_STATUS}}</q-td>
          </template>
          <template #body-cell-STEP="props">
            <q-td class="text-center">{{props.row.STEP}}</q-td>
          </template>
          <template #body-cell-TESTER="props">
            <q-td class="text-center">{{props.row.TESTER}}</q-td>
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
          <template #body-cell-ACCESSORY4="props">
            <q-td class="text-center">{{props.row.ACCESSORY4}}</q-td>
          </template>
          <template #body-cell-ACCESSORY1="props">
            <q-td class="text-center">{{props.row.ACCESSORY1}}</q-td>
          </template>
          <template #body-cell-DUT_USE="props">
            <q-td class="text-center">{{props.row.DUT_USE}}</q-td>
          </template>
          <template #body-cell-DUT="props">
            <q-td class="text-center">{{props.row.DUT}}</q-td>
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
<q-dialog full-width v-model="showSite" backdrop-filter="blur(4px)">
  <q-card class="relative">
    <q-btn unelevated icon="close" class="absolute z-10 px-2 py-0 top-2 right-2" />
    <q-card-section class="items-center row q-pb-none text-h5">
      {{eqpTarget}}
    </q-card-section>
    <q-separator />
    <q-card-section>
      <q-table
        :columns="siteColumns"
        :rows="eqpCloseSiteData"
        :pagination="{rowPerPage:10}"
      >
          <template #body-cell-EQP_NO="props">
            <q-td class="text-center">{{props.row.EQP_NO}}</q-td>
          </template>
          <template #body-cell-START_TIME="props">
            <q-td class="text-center">{{props.row.START_TIME}}</q-td>
          </template>
          <template #body-cell-END_TIME="props">
            <q-td class="text-center">{{props.row.END_TIME}}</q-td>
          </template>
          <template #body-cell-STATUS="props">
            <q-td class="text-center">{{props.row.STATUS}}</q-td>
          </template>
          <template #body-cell-SUB_STATUS="props">
            <q-td class="text-center">{{props.row.SUB_STATUS}}</q-td>
          </template>
          <template #body-cell-RUNCARD="props">
            <q-td class="text-center">{{props.row.RUNCARD}}</q-td>
          </template>
          <template #body-cell-DEVICE_NO="props">
            <q-td class="text-center">{{props.row.DEVICE_NO}}</q-td>
          </template>
          <template #body-cell-STEP="props">
            <q-td class="text-center">{{props.row.STEP}}</q-td>
          </template>
          <template #body-cell-DUT="props">
            <q-td class="text-center">{{props.row.DUT}}</q-td>
          </template>
          <template #body-cell-DUT_USE="props">
            <q-td class="text-center">{{props.row.DUT_USE}}</q-td>
          </template>
          <template #body-cell-ACCESSORY1="props">
            <q-td class="text-center">{{props.row.ACCESSORY1}}</q-td>
          </template>
          <template #body-cell-ABNOR_DESC="props">
            <q-td class="text-center">{{props.row.ABNOR_DESC}}</q-td>
          </template>
      </q-table>
    </q-card-section>
    <q-separator />
    <q-card-actions align='right'>
      <q-btn unelevated v-close-popup label="關閉" />
    </q-card-actions>
  </q-card>
</q-dialog>
</template>
<style scoped lang="scss">
th, td{
  font-family: 'DFKai-sb';
}
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
import CfmMenu from '../components/CfmMenu.vue'
import Konva from 'konva'
import $ from 'jquery'

const today = new Date()
const tomorrow = new Date(new Date().setDate(today.getDate()+1))
const url =
  window.location.origin + window.location.pathname + '/../HomePageSearch'
let cust = 'AB,AB/凌陽科技;AC,AC/義隆電子;AD,AD/松翰科技;AE,AE/富鼎先進電子;AF,AF/台亞半導體;AG,AG/立錡科技;AI,AI/偉詮電子;AJ,AJ/矽創電子;AN,AN/承芯微電子;BB,BB/新德科技;BCA,BCA/點序;BCM,BCM/昇瀚科技;BCR,BCR/威鋒電子;BDC,BDC/翊傑科技;BDG,BDG/原盛科技;BE,BE/盛群半導體;BED,BED/Focaltech;BEE,BEE/奕力科技;BEL,BEL/沛成科技;BEX,BEX/奇景光電;BEY,BEY/鼎暘科技;BFK,BFK/LiteonSG;BGG,BGG/瑞鼎科技;BGI,BGI/宏觀微;BHD,BHD/恆發科技;BIC,BIC/義明科技;BIK,BIK/義晶;BIY,BIY/穩耀半導體;BJ,BJ/聯笙電子;BJR,BJR/芯凱電子;BKF,BKF/應廣;BKQ,BKQ/安沛;BKV,BKV/安恩科技;BLE,BLE/SMTCHK;BLY,BLY/力領科技;BM,BM/笙泉科技;BMU,BMU/香港商芯原;BNB,BNB/博通;BNI,BNI/昇佳電子;BNN,BNN/漢芝電子;BO,BO/點晶科技;BPB,BPB/九齊科技;BPE,BPE/芯海;BPH,BPH/晶門科技;BPJ,BPJ/久元電子股份有限公司新竹園區分公司;BPN,BPN/笙科電子股份有限公司;BPR,BPR/美商明銳光電;BPW,BPW/美商睿思;BQH,BQH/FocalTech(KY3);BR,BR/巨華積體;BRH,BRH/立積電子;BRU,BRU/iComm HK Limited;BRY,BRY/Toppan;BS,BS/驊訊電子;BSA,BSA/NextInput;BSH,BSH/達宙科技股份有限公司;BUH,BUH/慧榮科技(澳門);BUU,BUU/長芯盛(武漢)科技有限公司;BVJ,BVJ/超炫科技股份有限公司;BVL,BVL/微源半導體有限公司;BWV,BWV/MaxLinear Inc.;BWX,BWX/北京集創北方科技股份有限公司;BWY,BWY/廈門凌陽華芯;BXE,BXE/力林科技股份有限公司;BXN,BXN/合肥創發微電子;BXS,BXS/物聯記憶體科技股份有限公司;BXT,BXT/濎通科技股份有限公司;BYH,BYH/絡明芯微;BYN,BYN/Silicon Line;BYR,BYR/泰佶科技;BZR,BZR/聯芯通;BZS,BZS/SiTime;BZX,BZX/力特康可;CA,CA/致新科技;CAC,CAC/Renesas;CAE,CAE/宏芯宇;CAG,CAG/富欣亞洲;CAI,CAI/Inphi;CAL,CAL/GenScript;CAM,CAM/聚睿電子;CAY,CAY/FocalTech(SZ2);CC,CC/凱鈺科技;CCA,CCA/中穎電子股份有限公司;CCN,CCN/禹創半導深圳有限公司;CCQ,CCQ/譜瑞;CDF,CDF/合肥大唐存儲科技有限公司;CEB,CEB/飛虹高科股份有限公司;CEG,CEG/芯立泰電子;CEL,CEL/西安恩狄集成電路有限公司;CFY,CFY/原景科技;CGJ,CGJ/合肥捷達微;CHN,CHN/Marvell;CHY,CHY/Qorvo;CIT,CIT/艾科微;CJ,CJ/騰富科技;CKG,CKG/雅特力;CKH,CKH/威達高科股份有限公司;CKQ,CKQ/雅特力重慶;CL,CL/巨盛電子;CLD,CLD/香港宏芯宇;CMY,CMY/Lumotive;CNI,CNI/意志力;CNX,CNX/芯旺(股);COM,COM/奧簡;CPH,CPH/衡宇;CPS,CPS/全芯電子;CQS,CQS/力晶微元;CRJ,CRJ/景相;CRM,CRM/昱盛;CSI,CSI/艾科;CSV,CSV/耐能智慧;CTJ,CTJ/銳發;DL,DL/天鈺;DR,DR/世紀創新;ET,ET/普誠科技;EV,EV/傑霖科技;EX,EX/勇領科技;FF,FF/凌通科技;FL,FL/智原科技;FU,FU/世紀民生科技;FY,FY/安國國際科技;GK,GK/聯陽半導體;GM,GM/慧榮科技;GR,GR/九暘電子;HG,HG/群聯竹南;HH,HH/芯原電子;HM,HM/晶豪科技;HN,HN/智榮科技;HP,HP/聯傑國際;HQ,HQ/碩呈科技;IC,IC/敦泰電子;IP,IP/安葳科技;JI,JI/原相科技;JQ,JQ/晶錡科技;JW,JW/威盛電子;LJ,LJ/瑞新電子;LO,LO/益芯科技;LQ,LQ/成越科技;LR,LR/慧榮貿易;LS,LS/聯華電子;MN,MN/紘康科技;NC,NC/久元;VK,VK/廣閎科技;VL,VL/高爾科技;WP,WP/聯詠科技;WR,WR/神盾;WX,WX/晶宏半導體;ZH,ZH/數能科技;ZV,ZV/晶相光電;ZX,ZX/智安電子' 

//const cust = $('#TEST_CFM_CUST').text() as string
const _clientOptions = [{value: '', label: 'All'}]
cust.split(';').forEach(row => {
  const [value, label] = row.split(',')
  _clientOptions.push({value, label})
})

const clientOptions = ref(_clientOptions)
const ynOptions = [{value:"", label:"All"}, {value:"Y", label:"Y"}, {value:"N", label:"N"}]

const isLoading = ref(false)
const showDetail = ref(false)
const showTab = ref(false)
const showEQPStatusList = ref(false)
const showEQPDetail = ref(false)
const showEQPMC = ref(false)
const showSite = ref(false)

const width = ref(1800)
const height = ref(1200)
const container = ref<HTMLDivElement | null>(null)
const _factoryOptions = $("#FACTORY_TEST").text().length ? $("#FACTORY_TEST").text().split(";").reverse() : ['科技,科技', '創新,創新', '力行,力行']
const factoryOptions = _factoryOptions.map(row => {
  let [value, label] = row.split(",")
  return {value, label}
})

const sFactory = ref('科技')
const _floorOptions = $("#FLOOR_TEST").text().split(";").filter(f => f.includes(sFactory.value))

const floorOptions = ref(
  _floorOptions.map(f => ({value:f.split(";")[0], label:f.split(",")[0]}))
)
const categoryOptions = ['機台', '配件'].map(c => ({value:c, label:c}))

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
const filterInput = ref('')

const selectAllClient = () => {
  sClient.value = _clientOptions.map(option => option.value)  
}

const deselectAllClient = () => {
  sClient.value = [];
}

const filterFn = (val, updateFn) => {
  if (val == '') {
    updateFn(() => {
      clientOptions.value = _clientOptions  
    })
  } else {
    updateFn(() => {
      clientOptions.value = _clientOptions.filter(option => (option.value.includes(val) || option.label.includes(val)))
    })
  }
}
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
let colorSetting = reactive({
  WORK: 'rgb(0,128,0)',
  LOSS: 'rgb(255,255,204)',
  LEND: 'rgb(0,255,255)',
  CORR: 'rgb(255,153,0)',
  SETUP: 'rgb(255,102,204)',
  SETUP_W: 'rgb(255,0,255)',
  ETUP: 'rgb(255,0,255)',
  ABNOR_W: 'rgb(255,255,102)',
  ABNOR: 'rgb(255,255,0)',
  PM: 'rgb(0,0,255)',
  DOWN: 'rgb(255,0,0)',
  NS: 'rgb(166,166,166)',
  PROCESS: 'rgb(0,128,0)',
  'LOSS-WIP': 'rgb(255,255,204)',
  'LOSS-MEN': 'rgb(255,255,204)',
  ENG: 'rgb(0,255,255)',
  'SD-SETUP': 'rgb(255,0,255)',
  'SD-PM': 'rgb(0,0,255)',
  nothing: 'rgb(199,199,199)'
})
let eqpTarget = ref("")
let eqpMCDataCount = ref(0);
let eqpMCDetailHeader = ref<{name:string,label:string}[]>([]);
let eqpMCDetailRow = reactive<string[][]>([]);
let eqpDetailData = reactive<Record<string,string>[]>([]);
let blockColor = reactive<Record<string,string>[]>([])
let eqpCloseSiteData = reactive<string[][]>([])

let columns = [{name: 'Time', label: 'Time', field: row => row.label}]
let detailColumns = [
  {name:"STATUS2", label:"STATUS2"},
  {name:"PERIOD_TIME", label:"PERIOD_TIME"},
  {name:"START_TIME",  label:"START_TIME"},
  {name:"END_TIME", label:"END_TIME"},
  {name:"SUB_STATUS", label:"SUB_STATUS"},
  {name:"STEP", label:"STEP"},
  {name:"TESTER", label:"TESTER"},
  {name:"CST_NO", label:"CST_NO"},
  {name:"DEVICE_NO", label:"DEVICE_NO"},
  {name:"RUNCARD", label:"RUNCARD"},
  {name:"ACCESSORY4", label:"ACCESSORY4"},
  {name:"ACCESSORY1", label:"ACCESSORY1"},
  {name:"DUT_USE", label:"DUT_USE"},
  {name:"DUT", label:"DUT"}
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

let siteColumns = [
  {name:"EQP_NO", label:"EQP_NO", align:'center'},
  {name:"START_TIME", label:"START_TIME", align:'center'},
  {name:"END_TIME", label:"END_TIME", align:'center'},
  {name:"STATUS", label:"STATUS", align:'center'},
  {name:"SUB_STATUS", label:"SUB_STATUS", align:'center'},
  {name:"RUNCARD", label:"RUNCARD", align:'center'},
  {name:"DEVICE_NO", label:"DEVICE_NO", align:'center'},
  {name:"STEP", label:"STEP", align:'center'},
  {name:"DUT", label:"DUT", align:'center'},
  {name:"DUT_USE", label:"DUT_USE", align:'center'},
  {name:"ACCESSORY1", label:"ACCESSORY1", align:'center'},
  {name:"ABNOR_DESC", label:"ABNOR_DESC", align:'center'},
]

watch(sFactory, (nValue, oValue) => {
  if (nValue !== oValue) {
    let FLOOR_TEST = $("#FLOOR_TEST").text().split(";").filter(f => f.includes(nValue))
    floorOptions.value = FLOOR_TEST.map(f => ({value:f.split(",")[0], label:f.split(",")[0]}))
    sFloor.value = floorOptions.value[0].value
  }
})

const toggleTab = () => {
  showTab.value = !showTab.value
}

const focus = (e) => {
  let si = $(e.target).parent().siblings(".q-field__inner");
  $(si)[0].click();
}

const loadLayer = (data: string[]) => {
  layer.removeChildren()
  let indexMap = new Map();
  blockColor = [];
  data.forEach(row => {
    let rowData:string[] = row.split(",")
    const [eqp_no,probeCard,eqpCluster,clientCode,statusTime,bu,jsonAttrs,temp,eqpStatus,bgColor,subStatus] = rowData
    const attrs = JSON.parse(jsonAttrs.replaceAll("，", ","));
    if (Object.prototype.hasOwnProperty.call(attrs, 'zIndex')) {
      if (rowData.length == 13) {
        attrs["humid"] = rowData.at(-2)
        attrs["bool"] = rowData.at(-1)
      }
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
      stage.value.width(attrs["width"])
      stage.value.height(attrs["height"])
      stage.value.scale({
        x:1,
        y:1
      })
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
    let _bgColor = attrs["bgColor"]
    if (bu.includes("溫溼度監控") || bu.includes("氮氣櫃")) group.setAttr("humid", attrs["humid"])
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
      if (bu.includes("底圖")) {
        blockColor.push({
          blockName:eqp_no,
          fillColor:attrs.children[0].attrs.fill
        }) 
      } else {
        if (_bgColor.length > 0) {
          node.fill(_bgColor)
        }
        let bool = attrs["bool"]
        if (!bool) 
          if (temp.length && temp > 25) {
            node.stroke('red')
          } else if (temp.length && temp < 25) {
            node.stroke('blue')
          } else {
            node.stroke('black')          
          }
        else {
          if (bool == 'N') {
            node.stroke('black')
          } else {
            node.stroke("red")
          }
        }
      }
    }
    node.strokeWidth(2)
    group.add(node)
    let clickable = true;
    let fontSize = 12
    let fill = "black"
    if (Object.prototype.hasOwnProperty.call(attrs.children[1].attrs, "fill")) fill = attrs.children[1].attrs["fill"]
    if (Object.prototype.hasOwnProperty.call(attrs.children[1].attrs, "fontSize")) fontSize = attrs.children[1].attrs["fontSize"]
    if (probeCard.length == 0 && eqpCluster.length == 0 && clientCode.length == 0 && statusTime.length == 0) clickable = false
    if(clickable && !bu.includes("底圖") && !bu.includes("溫溼度監控") && !bu.includes("氮氣櫃")) {
      let combText = eqpCluster + " " + clientCode
      let eqpTitle = ""
      if (sCategory.value == "機台") eqpTitle = eqp_no
      else if (sCategory.value == "配件" && probeCard.includes("-")) {
        eqpTitle = probeCard.split("-")[0]
      } else {
        eqpTitle = probeCard
      }

      let eqpEstText = new Konva.Text({fontSize}).measureSize(eqpTitle)
      let combineEstText = new Konva.Text({fontSize}).measureSize(combText)
      let timeEstText = new Konva.Text({fontSize}).measureSize(statusTime)
      switch (className) {
        case "Rect":{
          let shapeHeight = node.height();
          let shapeWidth = node.width();
          let yGap = (shapeHeight - fontSize*3)/4

          let eqpText = new Konva.Text({
            fontSize,
            text:eqpTitle,
            fill,
            y:yGap,
            x:(shapeWidth - eqpEstText.width)/2
          })
          let combineText = new Konva.Text({
            fontSize,
            text:combText,
            fill,
            y:2*yGap + fontSize,
            x:(shapeWidth - combineEstText.width)/2
          })
          let timeText = new Konva.Text({
            fontSize,
            text:statusTime,
            fill,
            y:3*yGap + fontSize*2,
            x:(shapeWidth - timeEstText.width)/2
          })
          group.add(eqpText)
          group.add(combineText)
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
    } else if (bu.includes("溫溼度監控") || bu.includes("氮氣櫃")) {
      group.on("mouseenter", showTooltip)
      group.on("mousemove", moveTooltip)
      group.on("mouseleave", removeTooltip)
      group.on("click", HeadToTemp)
      if (bu.includes("氮氣櫃")) {
        let width = node.width();
        let height = node.height();
        let estText = new Konva.Text({fontSize}).measureSize(eqp_no);
        let text = new Konva.Text({
          text:eqp_no,
          x:(width - estText.width)/2,
          y:(height - fontSize)/2,
          fill,
          fontSize,
        })
        group.add(text)
      }
    } else if (!clickable && !bu.includes("底圖") && eqp_no !== "B") {
      let width = node.width();
      let height = node.height();
      let estText = new Konva.Text({fontSize}).measureSize(eqp_no);
      let text = new Konva.Text({
        text:eqp_no,
        x:(width - estText.width)/2,
        y:(height - fontSize)/2,
        fill,
        fontSize,
      })
      group.add(text)
    }
    layer.add(group)
  }

  layer.batchDraw();
  isLoading.value = false
}

const HeadToTemp = (e) => {
  const {eqp_no, bu} = e.target.getParent().getAttrs();
  let destination = window.location.origin + window.location.pathname + "/../../Default/TEMP?設備種類="
  if (bu.includes("溫溼度監控")) destination+="溫溼度監控設備&廠區="
  if (bu.includes("氮氣櫃")) destination+="氮氣櫃&廠區="
  if (sFactory.value == "科技") destination+='園區&設備編號='
  else destination+=sFactory.value+"&設備編號="
  destination+=eqp_no
  window.open(destination, "_blank").focus()
}

const showTooltip = (e) => {
  stage.value.container().style.cursor = "pointer"
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
  if (!bu.includes("溫溼度監控") && !bu.includes("氮氣櫃")) {
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
    let combText = eqpCluster + " " + clientCode
    if (combText.length > 1) {
      let text = new Konva.Text({
        x:5,
        y:2*gapY + 12,
        text:combText,
        fontSize:12,
        fill:"#333"
      })
      tooltipGroup.add(text)
      let text_width = text.width();
      if (text_width > width) width = text_width + 10
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
  let tooltip = layer.find(".tooltip");
  let {x, y} = stage.value.getPointerPosition();
  if (tooltip.length) {
    tooltip[0].absolutePosition({x:x+10, y:y+10});
  }
}

const removeTooltip = (e) => {
  stage.value.container().style.cursor = "default"
  let tooltip = layer.find(".tooltip");
  if (tooltip.length) {
    tooltip[0].destroy();
  }
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
    url: window.location.origin + window.location.pathname + '/../ExportExcel',
    data: JSON.stringify(payload),
    xhrFields:{
      withCredentials:true
    },
    success: res => {
      let a = $("#HiddenClickBtn")
      a.attr("href", url + "/../../Default/" + res)
      $(a)[0].click() 
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
    list.push(obj)
  })
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
const scale = 0.25
const zoomIn = () => {
  const lastScale = stage.value.scaleX()
  stage.value.scale({
    x:scale + lastScale,
    y:scale + lastScale,
  })
  stage.value.width(width.value * (scale+lastScale))
  stage.value.height(height.value * (scale+lastScale))
}

const zoomOut = () => {
  const lastScale = stage.value.scaleX()
  if (lastScale > 0.25) {
    stage.value.scale({
      x:lastScale - scale,
      y:lastScale - scale
    })
    stage.value.width(width.value * (lastScale - scale))
    stage.value.height(height.value * (lastScale - scale))
  }
}

const searchCloseSite = () => {
  showSite.value = false
  const payload = {
    BU:'FT',
    NumberPerAPage: -1,
    PageName: "CLOST_SITE_LIST",
    PageNumber: -1,
    QueryArr:[detail[0], detail[8], detail[27]]
  }
  let buffer = []
  $.ajax({
    type: "POST",
    url,
    data: JSON.stringify(payload),
    dataType: 'json',
    contentType: 'application/json; charset=utf-8',
    success: (res) => {
      res.forEach(row => {
        const [EQP_NO, START_TIME, END_TIME, STATUS, SUB_STATUS, RUNCARD, DEVICE_NO, STEP, DUT, DUT_USE, ACCESSORY1, ABNOR_DESC] = row.split(",") 
        buffer.push({
          EQP_NO, 
          START_TIME,
          END_TIME,
          STATUS,
          SUB_STATUS,
          RUNCARD,
          DEVICE_NO,
          STEP,
          DUT,
          DUT_USE,
          ACCESSORY1,
          ABNOR_DESC
        })
      })
      eqpCloseSiteData = buffer
      showSite.value = true
    }
  })
}

const scroll = () => {
  stage.value.container().style.cursor = "default"
  let tooltip = layer.find(".tooltip");
  if (tooltip.length > 0) {
    tooltip[0].destroy();
  }
}

onMounted(() => {
  // init stage
  stage.value = new Konva.Stage({
    container: 'canvas_container',
    width: width.value,
    height: height.value,
    background: "rgb(236,236,236)"
  })
  stage.value.add(layer)
  //loadData()
  
})
</script>
