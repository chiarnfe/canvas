<template>
<div class="h-[50px] w-full bg-gray-500/20"></div>
<div class="w-full px-4">
<h4 class="text-h4 mt-5 mb-2.5">Equipment CFM</h4>
<div class="flex flex-row gap-x-2">
  <q-btn unelevated color="primary" label="匯出" class="rounded-[0.25rem] px-3 py-1" @click="downloadExcel" />
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
        <label for="fact" class="text-sm">
          廠區
        </label>
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
        <label class="text-sm">
          樓層
        </label>
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
    <q-input
      v-model="sEqp"
      outlined
      dense
    >
      <template v-slot:before>
        <label class="text-sm">機台</label>
      </template>
    </q-input>
    <q-input
      v-model="sEqpType"
      outlined
      dense
    >
      <template v-slot:before>
        <label class="text-sm">機種</label>
      </template>
    </q-input>
    <q-input
      v-model="sModel"
      outlined
      dense
    >
      <template v-slot:before>
        <label class="text-sm">型號</label>
      </template>
    </q-input>
  </div>
  <q-btn unelevated label="搜尋" class="rounded-md px-3 py-1" style="border:1px solid #aaa" @click="loadTab" />
</div>
<q-separator class="q-my-md" />
<div class="flex flex-row pb-4 gap-x-2">
  <div v-show="!showTab"  class="w-[calc(16.66%_-_50px)] flex flex-col gap-y-1 overflow-auto px-2 min-w-[180px]">
    <q-btn 
      v-for="(tab, index) in tabList" 
      :key="index"
      :class="['w-full py-0 pr-0 pl-2', index < 6 ? '!cursor-default':'']" 
      size="sm" 
      :ripple="false" 
      no-caps
      v-on="index > 5 ? {click:getEqpStatus}:{}"
      :data-status="tab.tabText"
    >
      <template v-slot:default>
        <div class='flex flex-row items-center w-full'>
          <span class="w-2/3 text-left">{{tab.tabText}}</span>
          <span class="w-4 h-6 block mr-1" :style="{backgroundColor:tab.tabColor.replaceAll('，', ',')}"></span>
          <span class="flex flex-1 justify-center">{{tab.tabCount}}</span>
        </div>
      </template>
    </q-btn>
    <div class="ring-2 ring-inset ring-red-500 h-6 flex flex-row items-center justify-center rounded-sm">12吋機台紅框</div>
  </div>
  <q-btn icon="chevron_right" unelevated color="primary" class="px-1" @click="toggleTab" /> 
  <q-scroll-area :class="[!showTab ? 'w-5/6':'w-[calc(100%_-_50px)]']" style="box-shadow:inset 1px 0 0 #000, inset 0 1px 0 #000, inset -1px 0 0 #000, inset 0 -1px 0 #000;height:calc(100vh - 210px)">
    <div class="w-full" ref="container" id="canvas_container"></div>
  </q-scroll-area>
</div>
<q-dialog v-model="isLoading" backdrop-filter="blur(4px)" persistent>
  <q-card class="w-96">
    <q-card-section>
      資料讀取中...
    </q-card-section>
  </q-card>
</q-dialog>
<q-dialog full-width v-model="showDetail" backdrop-filter="blur(4px)">
  <q-card class="relative">
    <q-btn unelevated  icon="close" class="absolute top-2 right-2" />
    <q-card-section class="row items-center q-pb-none text-h5">
      {{detail[0]}}
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
          <td class="text-center">{{detail[0]}}</td>
          <td class="!bg-gray-400 text-center">批號</td>
          <td class="text-center">{{detail[9]}}</td>
        </tr>
        <tr>
          <td class="!bg-gray-400 text-center">站點</td>
          <td class="text-center">{{detail[1]}}</td>
          <td class="!bg-gray-400 text-center">Change Time</td>
          <td class="text-center">{{detail[10]}}</td>
        </tr>
        <tr>
          <td class="!bg-gray-400 text-center">機群</td>
          <td class="text-center">{{detail[2]}}</td>
          <td class="!bg-gray-400 text-center">產品種類</td>
          <td class="text-center">{{detail[11]}}</td>
        </tr>
        <tr>
          <td class="!bg-gray-400 text-center">機型</td>
          <td class="text-center">{{detail[3]}}</td>
          <td class="!bg-gray-400 text-center">備註</td>
          <td class="text-center">{{detail[12]}}</td>
        </tr>
        <tr>
          <td class="!bg-gray-400 text-center">機種</td>
          <td class="text-center">{{detail[4]}}</td>
          <td class="!bg-gray-400 text-center">OP工號</td>
          <td class="text-center">{{detail[13]}}</td>
        </tr>
        <tr>
          <td class="!bg-gray-400 text-center">機況</td>
          <td class="text-center">{{detail[5]}}</td>
          <td class="!bg-gray-400 text-center">狀態時間HR</td>
          <td class="text-center">{{detail[14]}}</td>
        </tr>
        <tr>
          <td class="!bg-gray-400 text-center">客戶代碼</td>
          <td class="text-center">{{detail[6]}}</td>
          <td class="!bg-gray-400 text-center">Z1</td>
          <td class="text-center">{{detail[15]}}</td>
        </tr>
        <tr>
          <td class="!bg-gray-400 text-center">流程卡</td>
          <td class="text-center">{{detail[7]}}</td>
          <td class="!bg-gray-400 text-center">Z2</td>
          <td class="text-center">{{detail[16]}}</td>
        </tr>
        <tr>
          <td class="!bg-gray-400 text-center">型號</td>
          <td class="text-center">{{detail[8]}}</td>
          <td class="text-center"></td>
          <td class="text-center"></td>
        </tr>
      </tbody>
    </q-markup-table>
    </q-card-section>
    <q-separator />
    <q-card-actions align="right" class="border-t-1 border-black">
      <q-btn unelevated v-close-popup label="關閉" />
    </q-card-actions>
  </q-card>
</q-dialog>
<q-dialog full-width v-model="showEQPStatusList" backdrop-filter="blur(4px)" >
  <q-card class="relative">
    <q-btn unelevated icon="close" class="absolute top-2 right-2" v-close-popup />
    <q-card-section class="row items-center q-pb-none text-h5">
      Header
    </q-card-section>
    <q-separator />
    <q-card-section class="overflow-auto">
     <!-- <q-table
        :columns="columns"
        :rows="rows"
        row-key="name"
      />-->
    </q-card-section>
    <q-separator />
    <q-card-actions align="right" class="border-t-1 border-black">
      <q-btn unelevated v-close-popup label="關閉" />
    </q-card-actions>
  </q-card>
</q-dialog>
</div>
</template>
<script setup lang="ts">
import {ref, reactive, watch, onMounted} from 'vue';

import Konva from 'konva';
import $ from 'jquery';

const url = window.location.origin + window.location.pathname + "/../HomePageSearch";
const cust = $("#DS_CFM_CUST").text() as string;
const clientOptions = [{value:"", label:"All"}];
cust.split(";").forEach(row => {
  const [value, label] = row.split(",");
  clientOptions.push({value, label});
})

const isLoading = ref(false);
const showDetail = ref(false);
const showTab = ref(false);
const showEQPStatusList = ref(false);

const width = ref(1800);
const height = ref(1200);
const container = ref<HTMLDivElement|null>(null);
const factoryOptions = ["科技", "創新", "力行"].map(f => ({value:f, label:f}));
const floorOptions = ref(["1F", "2F", "3F", "7F"].map(f => ({value:f, label:f})));

const sFactory = ref("科技");
const sFloor = ref("1F");
const sClient = ref(['']);
const sEqp = ref("");
const sEqpType = ref("");
const sModel = ref("");

const stage = ref<Konva.Stage | null>(null);
const layer = reactive<Konva.Layer>(
  new Konva.Layer({
    x:0,
    y:0,
    draggable:false,
  })
);
let detail = reactive<string[]>([]);
let tabList = ref<any[]>([]);
let eqpStatusList = reactive<any[]>([]);

let columns = [
  { name:"eqp_no", label:"Time", field: row => row.name, sortable:false },
]
//let columns = [
//  {name:"Time", label:"Time", field:"Time"},
//  {name:"8:00", label:"8:00", field:"8:00"},
//  {name:"9:00", label:"9:00", field:"9:00"},
//  {name:"10:00", label:"10:00", field:"10:00"},
//  {name:"11:00", label:"11:00", field:"11:00"},
//  {name:"12:00", label:"12:00", field:"12:00"},
//  {name:"13:00", label:"13:00", field:"13:00"},
//  {name:"14:00", label:"14:00", field:"14:00"},
//  {name:"15:00", label:"15:00", field:"15:00"},
//  {name:"16:00", label:"16:00", field:"16:00"},
//  {name:"17:00", label:"17:00", field:"17:00"},
//  {name:"18:00", label:"18:00", field:"18:00"},
//  {name:"19:00", label:"19:00", field:"19:00"},
//  {name:"20:00", label:"20:00", field:"20:00"},
//  {name:"21:00", label:"21:00", field:"21:00"},
//  {name:"22:00", label:"22:00", field:"22:00"},
//  {name:"23:00", label:"23:00", field:"23:00"},
//  {name:"24:00", label:"24:00", field:"24:00"},
//  {name:"1:00", label:"1:00", field:"1:00"},
//  {name:"2:00", label:"2:00", field:"2:00"},
//  {name:"3:00", label:"3:00", field:"3:00"},
//  {name:"4:00", label:"4:00", field:"4:00"},
//  {name:"5:00", label:"5:00", field:"5:00"},
//  {name:"6:00", label:"6:00", field:"6:00"},
//  {name:"7:00", label:"7:00", field:"7:00"},
//];

watch(sFactory, (nValue, oValue) => {
  let floor = ["1F", "2F", "3F", "7F"];
  switch (sFactory.value) {
    case "科技":
      break;
    case "創新":
      floor = ["2F", "3F", "4F"];
      break;
    case "力行":
      floor = ["3F"];
      break;
  }
  sFloor.value = floor.map(f => ({value:f, label:f}));
});

const toggleTab = () => {
  showTab.value = !showTab.value;
}
const loadLayer = (data:string[]) => {
  layer.removeChildren();
  let indexMap = new Map();
  data.forEach(row => {
    // temp 溫度在ds用不到
    const [eqpType, eqp_no, clientName, statusTime, bu, jsonAttrs, eqpStatus, temp, bgColor, modelName, z1, z2, bool] = row.split(",");
    let attrs = JSON.parse(jsonAttrs.replaceAll("，",","));
    if (bu.includes("圖層")) {
      stage.value.setAttrs({
        width:attrs["width"],
        height:attrs["height"]
      });
    } else {
      let group = new Konva.Group({
        x:attrs.attrs.x,
        y:attrs.attrs.y,
        name:attrs.attrs.name, 
      });
      if (Object.prototype.hasOwnProperty.call(attrs.attrs, "width")) group.width(attrs.attrs.width);
      if (Object.prototype.hasOwnProperty.call(attrs.attrs, "height")) group.height(attrs.attrs.height);
      if (Object.prototype.hasOwnProperty.call(attrs.attrs, "scaleX")) group.scaleX(attrs.attrs.scaleX);
      if (Object.prototype.hasOwnProperty.call(attrs.attrs, "scaleY")) group.scaleY(attrs.attrs.scaleY);
      if (Object.prototype.hasOwnProperty.call(attrs, "zIndex")) {
        let indexName = attrs.attrs.x + "." + attrs.attrs.y + "." + attrs.attrs.name;
        indexMap.set(indexName, attrs.zIndex);
      }
      //console.log({eqpType}, {eqp_no}, {clientName}, {statusTime}, {bu}, {jsonAttrs}, {eqpStatus}, {temp}, {bgColor}, {modelName}, {z1}, {z2}, {bool});

      if (eqpType.length) group.setAttr("eqpType", eqpType);
      if (clientName.length) group.setAttr("clientName", clientName);
      if (statusTime.length) group.setAttr("statusTime", statusTime);
      if (modelName.length) group.setAttr("modelName", modelName);
      if (eqpStatus.length) group.setAttr("status", eqpStatus);
      if (z1 && !bu.includes("底圖")) group.setAttr("z1", z1);
      if (z2 && !bu.includes("底圖")) group.setAttr("z2", z2);
      if (!bu.includes("底圖") || !bu.includes("圖層")) group.setAttr("bu", bu);
      if (!bu.includes("底圖") || !bu.includes("圖層")) group.setAttr("eqp_no", eqp_no);
      if (bu.includes("溫溼度監控")) {
        group.setAttr("temp", temp);
        group.setAttr("humid", z1);
      }
      attrs.children.forEach(child => {
        switch (child.className) {
          case "Rect":{
            const rect = new Konva.Rect({
              fill:bgColor.length ? bgColor.replaceAll("，", ","): child.attrs.fill,
              height:child.attrs.height,
              width:child.attrs.width,
              name:child.attrs.name,
            });
            if (!bu.includes("底圖")) {
              if (bool == "N") rect.stroke("black")
              if (bool == "Y") rect.stroke("red")
              rect.strokeWidth(2);
            }
            if (Object.prototype.hasOwnProperty.call(child.attrs, "offsetX")) rect.setAttr("offsetX", child.attrs.offsetX);
            if (Object.prototype.hasOwnProperty.call(child.attrs, "offsetY")) rect.setAttr("offsetY", child.attrs.offsetY);

            group.add(rect);
            
            const fontSize = 12
            const eqpNoText = new Konva.Text({fontSize}).measureSize(eqp_no);
            
            if (eqp_no !== 'B' && eqpType.length) {
              const clientNameText = new Konva.Text({fontSize}).measureSize(clientName);
              const statusTimeText = new Konva.Text({fontSize}).measureSize(statusTime);
              
              const yGap = (child.attrs.height - 36)/4;

              const tEqpNoText = new Konva.Text({
                x:(child.attrs.width - eqpNoText.width)/2,
                y:yGap,
                text:eqp_no,
                fontSize:12,
                fill:"black",
              });

              const tClientNameText = new Konva.Text({
                x:(child.attrs.width - clientNameText.width)/2,
                y:2*yGap + 12,
                text:clientName,
                fontSize:12,
                fill:"black",
              });

              const tStatusTimeText = new Konva.Text({
                x:(child.attrs.width - statusTimeText.width)/2,
                y:3*yGap + 12*2,
                text:statusTime,
                fill:"black",
              })
              group.add(tEqpNoText);
              group.add(tClientNameText);
              group.add(tStatusTimeText);
            } else if (eqp_no !== 'B' && !bu.includes("底圖") && eqpType.length == 0) {
              let tEqpNoText = new Konva.Text({
                x:(child.attrs.width - eqpNoText.width)/2,
                y:(child.attrs.height - 12)/2,
                text:eqp_no,
                fontSize:12,
                fill:"black"
              });
              group.add(tEqpNoText);
            } else if (bu.includes("底圖")) {
              let offsetX = group.find("Rect")[0].getAttr("offsetX");
              let offsetY = group.find("Rect")[0].getAttr("offsetY");
              let scaleX = group.getAttr("scaleX");
              let scaleY = group.getAttr("scaleY");
              let width = child.attrs.width;
              let height = child.attrs.height;
              let tEqpNoText = new Konva.Text({
                x:(width - eqpNoText.width)/2,
                y:(height - 12)/2,
                scaleX:1/scaleX,
                scaleY:1/scaleY,
                text:eqp_no,
                fontSize:12,
                fill:"black",
                offsetX,
                offsetY
              });
              group.add(tEqpNoText);
            } 
            break;
          }
          case "Circle":{
            const circle = new Konva.Circle({
              fill:bgColor.length ? bgColor.replaceAll("，", ","): child.attrs.fill,
              x:child.attrs.x,
              y:child.attrs.y,
              radius:child.attrs.radius,
              name:child.attrs.name,
              stroke: bool == "N" ? "black" : "red",
              strokeWidth: 2,
            });
            group.add(circle);
            break;
          }
        }
      });

      if (!bu.includes("底圖") && !bu.includes("圖層") && eqp_no !== "B" && !bu.includes("溫溼度監控")) {
        group.on("click", loadDetail);
      } else if (bu.includes("溫溼度監控")) {
        group.on("click", () => {
          let destination = window.location.origin + window.location.pathname + "/../../Default/TEMP"
          window.open(destination, "_blank").focus();
        })
      }
      layer.add(group);
    }
  });
  layer.getChildren().forEach(child => {
    let x = child.getAttr("x");
    let y = child.getAttr("y");
    let name = child.getAttr("name");
    let indexName = x + "." + y + "." + name;
    let index = indexMap.get(indexName);
    child.zIndex(index);
  })
  layer.batchDraw();
  isLoading.value = false;
}

const loadDetail = (e) => {
  let group = e.target.getParent();
  const {eqp_no, bu} = group.getAttrs();
  console.log(group.getAttrs())
  isLoading.value = true;
  let payload = {
    BU:"",
    NumberPerAPage: -1,
    PageName: "DS_CFM_MAP_LIST",
    PageNumber: -1,
    QueryArr:[eqp_no, bu]
  };

  $.ajax({
    type:"POST",
    url,
    data:JSON.stringify(payload),
    success:(data) => {
      isLoading.value = false;
      showDetail.value = true;
      detail = data[0].split(",");
    },
    dataType:"json",
    contentType:"application/json; charset=utf-8"
  });
}

const downloadExcel = async () => {
  const payload = {
    BU:"",
    NumberPerAPage: -1,
    PageName: "DS_CFM_MAP_ALL_LIST",
    PageNumber: -1,
    QueryArr:[sFactory.value, sFloor.value, sClient.value.join("@"), sEqp.value, sEqpType.value, sModel.value]
  };
  $.ajax({
    type:"POST",
    url:window.location.origin + window.location.pathname + "/../ExportExcel",
    data:JSON.stringify(payload),
    success:(res) => {
      console.log(res)
    },
    async:true,
    dataType:"json",
    contentType:"application/json; charset=utf-8"
  });
}

const loadTab = (data:string[]) => { 
  const [row_title, row_text, row_count, row_color] = data;
  let title = row_title.split(",");
  let text = row_text.split(",");
  let count = row_count.split(",");
  let color = row_color.split(",");
  let list = [];
  title.forEach((t, i) => {
    let obj = {
      tabTitle:t,
      tabText:text[i],
      tabCount:count[i],
      tabColor:color[i],
    };
    list.push(obj);
  });
  tabList.value = list;
}

const getEqpStatus = (e) => {
  isLoading.value = true;
  let status = $(e.target).closest(".q-btn")[0].dataset.status;
  let eqpName = [];
  layer.find(".cfm-object").forEach(group => {
    let attrs = group.getAttrs();
    if (attrs.status == status) {
      eqpName.push(attrs.eqp_no);
    }
  })
  const payload = {
    BU:"",
    NumberPerAPage:-1,
    PageName:"DS_EQP",
    PageNumber:-1,
    QueryArr:[sFactory.value, sFloor.value, eqpName.join("@"), status]
  };

  $.ajax({
    type:"POST",
    url,
    data:JSON.stringify(payload),
    success:loadStatusList
  });
}

const loadStatusList = (data:string[]) => {
  isLoading.value = false;
  showEQPStatusList.value = true;

}


const loadData = () => {
  isLoading.value = true;
  const tabPayload = {
    BU:"",
    NumberPerAPage: -1,
    PageName:"DS_CFM_MAP_NUM",
    PageNumber: -1,
    QueryArr:[sFactory.value, sFloor.value, sClient.value.join("@"), sEqp.value, sEqpType.value, sModel.value]
  }
  const mapPayload = {
    BU: "",
    NumberPerAPage: -1,
    PageName: "DS_CFM_MAP",
    PageNumber: -1,
    QueryArr:[sFactory.value, sFloor.value, sClient.value.join("@"), sEqp.value, sEqpType.value, sModel.value]
  }
  
  $.ajax({
    type:"POST",
    url,
    data:JSON.stringify(tabPayload),
    success:loadTab,
    async: true,
    dataType:"json",
    contentType:"application/json; charset=utf-8"
  });

  $.ajax({
    type:"POST",
    url,
    data:JSON.stringify(mapPayload),
    success: loadLayer ,
    dataType:"json",
    contentType:"application/json; charset=utf-8"
  })
}
onMounted(() => {
  // init stage
  stage.value = new Konva.Stage({
    container:"canvas_container",
    width:width.value,
    height:height.value,
  });
  stage.value.add(layer);
  loadData();
})
</script>
