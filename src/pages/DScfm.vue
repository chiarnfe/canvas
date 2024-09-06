<template>
<div class="h-[50px] w-full bg-gray-500/20"></div>
<div class="w-full px-4">
<h4 class="text-h4 mt-5 mb-2.5">Equipment CFM</h4>
<div class="flex flex-row gap-x-2">
  <q-btn unelevated color="primary" label="匯出" class="rounded-[0.25rem] px-3 py-1" />
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
  <q-btn unelevated label="搜尋" class="rounded-md px-3 py-1" style="border:1px solid #aaa" @click="loadData" />
</div>
<q-separator class="q-my-md" />
<div class="flex flex-row pb-4 gap-x-2">
  <q-btn label=">>" unelevated color="primary"/> 
  <q-scroll-area class="w-5/6" style="box-shadow:inset 1px 0 0 #000, inset 0 1px 0 #000, inset -1px 0 0 #000, inset 0 -1px 0 #000;height:calc(100vh - 210px)">
    <div class="w-full" ref="container" id="canvas_container"></div>
  </q-scroll-area>
</div>
<q-dialog v-model="isLoading" backdrop-filter="blur(4px)">
  <q-card class="w-96">
    <q-card-section>
      資料讀取中...
    </q-card-section>
  </q-card>
</q-dialog>
</div>
</template>
<script setup lang="ts">
import {ref, reactive, watch, onMounted, onBeforeUnmount} from 'vue';
import axios from 'axios';
import Konva from 'konva';
import $ from 'jquery';

const cust = $("#DS_CFM_CUST").text() as string;
const clientOptions = [{value:"", label:"All"}];
cust.split(";").forEach(row => {
  const [value, label] = row.split(",");
  clientOptions.push({value, label});
})
const isLoading = ref(false);
const width = ref(1800);
const height = ref(1200);
const container = ref<HTMLDivElement|null>(null);
const factoryOptions = ["科技", "創新", "力行"].map(f => ({value:f, label:f}));
const floorOptions = ref(["1F", "2F", "3F", "7F"].map(f => ({value:f, label:f})));

const sFactory = ref("科技");
const sFloor = ref("1F");
const sClient = ref([]);
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


const loadLayer = (data:string[]) => {
  layer.removeChildren();
  let indexMap = new Map();
  data.forEach(row => {
    // temp 溫度在ds用不到
    const [eqpType, eqp_no, clientName, statusTime, bu, jsonAttrs, eqpStatus, _temp, bgColor, modelName, z1, z2, bool] = row.split(",");
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

      if (eqpType.length) group.setAttr("eqpType", eqpType);
      if (clientName.length) group.setAttr("clientName", clientName);
      if (statusTime.length) group.setAttr("statusTime", statusTime);
      if (modelName.length) group.setAttr("modelName", modelName);
      if (!bu.includes("底圖") && z1.length) group.setAttr("z1");
      if (!bu.includes("底圖") && z2.length) group.setAttr("z2");
      if (!bu.includes("底圖") || !bu.includes("圖層")) group.setAttr("bu", bu);
      if (!bu.includes("底圖") || !bu.includes("圖層")) group.setAttr("eqp_no", eqp_no);
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
      if (!bu.includes("底圖") || !bu.includes("圖層")) {
        
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

const loadMap = async () => {
  const payload = {
    BU: "",
    NumberPerAPage: -1,
    PageName: "DS_CFM_MAP",
    PageNumber: -1,
    QueryArr:[sFactory.value, sFloor.value, sClient.value, sEqp.value, sEqpType.value, sModel.value]
  }
  const res = await axios.post(window.location.origin + window.location.pathname + "/../HomePageSearch", payload);
}

const loadTab = async () => {
  const payload = {
    BU:"",
    NumberPerAPage: -1,
    PageName:"DS_CFM_MAP_NUM",
    PageNumber: -1,
    QueryArr:[sFactory.value, sFloor.value, sClient.value, sEqp.value, sEqpType.value, sModel.value]
  };
  const res = await axios.post(window.location.origin + window.location.pathname + "/../HomePageSearch", payload);
}

const loadData = () => {
  isLoading.value = true;
  let url = window.location.origin + window.location.pathname + "/../HomePageSearch";
  const tabPayload = {
    BU:"",
    NumberPerAPage: -1,
    PageName:"DS_CFM_MAP_NUM",
    PageNumber: -1,
    QueryArr:[sFactory.value, sFloor.value, "", sEqp.value, sEqpType.value, sModel.value]
  }
  const mapPayload = {
    BU: "",
    NumberPerAPage: -1,
    PageName: "DS_CFM_MAP",
    PageNumber: -1,
    QueryArr:[sFactory.value, sFloor.value, "", sEqp.value, sEqpType.value, sModel.value]
  }
  
  //axios.post(url, mapPayload).then(res => console.log(res))
  $.ajax({
    type:"POST",
    url,
    data:JSON.stringify(tabPayload),
    success:(res) => {
      console.log(res)
    },
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
  let data =[
    "挑檢,IS-37,AJ,6.96,DS,{\"attrs\":{\"x\":380.5，\"y\":1240.5，\"width\":40，\"height\":60，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":60，\"width\":60，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"IS-37\"，\"x\":15.6591796875，\"y\":24}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":115},PROCESS,,rgb(0，128，0),ST7789VI-G4_A2125-GN,,,N",
    "挑檢,IS-31,AJ,6.96,DS,{\"attrs\":{\"x\":300.5，\"y\":1320.5，\"width\":40，\"height\":60，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":60，\"width\":60，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"IS-31\"，\"x\":15.6591796875，\"y\":24}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":110},PROCESS,,rgb(0，128，0),ST7789VI-G4_A2125-GN,,,N",
    "AOI,AI-003,AJ,1.77,DS,{\"attrs\":{\"x\":422.5，\"y\":560.5，\"width\":40，\"height\":60，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":60，\"width\":60，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"AI-003\"，\"x\":12.322265625，\"y\":24}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":85},LOSS-MEN,,rgb(255，255，204),ST7789VI-G4_A2125-GN,,,N",
    "挑檢,IS-34,AJ,10.45,DS,{\"attrs\":{\"x\":300.5，\"y\":1160.5，\"width\":40，\"height\":60，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":60，\"width\":60，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"IS-34\"，\"x\":15.6591796875，\"y\":24}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":4},PROCESS,,rgb(0，128，0),ST7701SI-G7-P_E2143-GA-012,,,N",
    "挑檢,IS-32,AJ,10.45,DS,{\"attrs\":{\"x\":300.5，\"y\":1080.5，\"width\":40，\"height\":60，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":60，\"width\":60，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"IS-32\"，\"x\":15.6591796875，\"y\":24}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":39},PROCESS,,rgb(0，128，0),ST7701SI-G7-P_E2143-GA-012,,,N",
    "切割,DS-017,AJ,3.83,DS,{\"attrs\":{\"x\":501.5，\"y\":320.5，\"width\":40，\"height\":60，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":60，\"width\":60，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"DS-017\"，\"x\":9.65625，\"y\":24}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":113},PROCESS,,rgb(0，128，0),ST7701SI-G7-P_E2143-GA-012,GD-13U,GD-14,Y",
    "切割,DS-014,AJ,8.49,DS,{\"attrs\":{\"x\":342.5，\"y\":400.5，\"width\":40，\"height\":60，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":60，\"width\":60，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"DS-014\"，\"x\":9.65625，\"y\":24}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":109},PROCESS,,rgb(0，128，0),ST7701SI-G7-P_E2143-GA-012,GD-13U,GD-14,N",
    "切割,DS-011,AJ,8.49,DS,{\"attrs\":{\"x\":581.5，\"y\":400.5，\"width\":40，\"height\":60，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":60，\"width\":60，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"DS-011\"，\"x\":10.1015625，\"y\":24}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":5},PROCESS,,rgb(0，128，0),ST7701SI-G7-P_E2143-GA-012,GD-13U,GD-14,N",
    "研磨,WG-006,AJ,0.03,DS,{\"attrs\":{\"x\":800.5，\"y\":40.5，\"width\":60，\"height\":40，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":40，\"width\":80，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"WG-006\"，\"x\":17.6611328125，\"y\":14}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":40},PROCESS,,rgb(0，128，0),ST7701SN-G5-1_E2143-GA-010,,,N",
    "挑檢,IS-67,AJ,0.97,DS,{\"attrs\":{\"x\":780.5，\"y\":1240.5，\"width\":40，\"height\":60，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":60，\"width\":60，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"IS-67\"，\"x\":15.6591796875，\"y\":24}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":108},PROCESS,,rgb(0，128，0),ST7701SN-G5-1_E2143-GA-010,,,Y",
    "挑檢,IS-52,AJ,2.69,DS,{\"attrs\":{\"x\":539.5，\"y\":1240.5，\"width\":40，\"height\":60，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":60，\"width\":60，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"IS-52\"，\"x\":15.6591796875，\"y\":24}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":104},PROCESS,,rgb(0，128，0),ST7701SN-G5-1_E2143-GA-010,,,N",
    "挑檢,IS-42,AJ,2.69,DS,{\"attrs\":{\"x\":539.5，\"y\":1400.5，\"width\":40，\"height\":60，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":60，\"width\":60，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"IS-42\"，\"x\":15.6591796875，\"y\":24}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":8},PROCESS,,rgb(0，128，0),ST7701SN-G5-1_E2143-GA-010,,,N",
    "挑檢,IS-41,AJ,1.81,DS,{\"attrs\":{\"x\":460.5，\"y\":1240.5，\"width\":40，\"height\":60，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":60，\"width\":60，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"IS-41\"，\"x\":15.6591796875，\"y\":24}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":107},PROCESS,,rgb(0，128，0),ST7701SN-G5-1_E2143-GA-010,,,N",
    "挑檢,IS-39,AJ,2.69,DS,{\"attrs\":{\"x\":460.5，\"y\":1400.5，\"width\":40，\"height\":60，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":60，\"width\":60，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"IS-39\"，\"x\":15.6591796875，\"y\":24}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":12},PROCESS,,rgb(0，128，0),ST7701SN-G5-1_E2143-GA-010,,,N",
    "切割,DS-016,AJ,12.80,DS,{\"attrs\":{\"x\":420.5，\"y\":320.5，\"width\":40，\"height\":60，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":60，\"width\":60，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"DS-016\"，\"x\":9.65625，\"y\":24}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":11},PROCESS,,rgb(0，128，0),ST7701SN-G5-1_E2143-GA-010,GD-13U,GD-14,Y",
    "研磨_TAPING,WT-002,BNI,3.43,DS,{\"attrs\":{\"x\":60.5，\"y\":40.5，\"width\":60，\"height\":40，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":40，\"width\":80，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"WT-002\"，\"x\":18.994140625，\"y\":14}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":21},LOSS-MEN,,rgb(255，255，204),A6027C-1-BLKONLY-200-25V,,,N",
    "挑檢,IS-66,BGG,0.85,DS,{\"attrs\":{\"x\":780.5，\"y\":1320.5，\"width\":40，\"height\":60，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":60，\"width\":60，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"IS-66\"，\"x\":15.6591796875，\"y\":24}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":99},PROCESS,,rgb(0，128，0),RA142BE.G56050_AUO,,,Y",
    "切割,DS-013,BGG,7.01,DS,{\"attrs\":{\"x\":742.5，\"y\":400.5，\"width\":40，\"height\":60，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":60，\"width\":60，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"DS-013\"，\"x\":9.65625，\"y\":24}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":114},PROCESS,,rgb(0，128，0),RA142BE.G54050_AUO,GD-13L,GD-14,N",
    "切割,DS-010,BGG,7.01,DS,{\"attrs\":{\"x\":501.5，\"y\":400.5，\"width\":40，\"height\":60，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":60，\"width\":60，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"DS-010\"，\"x\":9.65625，\"y\":24}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":72},PROCESS,,rgb(0，128，0),RA142BE.G54050_AUO,GD-13L,GD-14,N",
    "AOI,TI-001,BGG,0.76,DS,{\"attrs\":{\"x\":780.5，\"y\":740.5，\"width\":40，\"height\":60，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":60，\"width\":60，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"TI-001\"，\"x\":12.6591796875，\"y\":24}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":98},PROCESS,,rgb(0，128，0),RA142BE.G55050_AUO,,,N",
    "挑檢,IS-04,BE,86.62,DS,{\"attrs\":{\"x\":701.5，\"y\":1400.5，\"width\":40，\"height\":60，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":60，\"width\":60，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"IS-04\"，\"x\":15.6591796875，\"y\":24}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":93},LOSS-WIP,,rgb(255，255，204),JSD17076/GSD1707,,,N",
    "切割,DS-026,BFK,2.71,DS,{\"attrs\":{\"x\":661.5，\"y\":240.5，\"width\":40，\"height\":60，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":60，\"width\":60，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"DS-026\"，\"x\":9.65625，\"y\":24}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":94},PROCESS,,rgb(0，128，0),32C237C,GD-08L,GD-10,Y",
    "切割,DS-025,BFK,6.49,DS,{\"attrs\":{\"x\":582.5，\"y\":240.5，\"width\":40，\"height\":60，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":60，\"width\":60，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"DS-025\"，\"x\":9.65625，\"y\":24}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":112},PROCESS,,rgb(0，128，0),32C237C,GD-08L,GD-10,Y",
    "切割,DS-009,BFK,2.25,DS,{\"attrs\":{\"x\":422.5，\"y\":400.5，\"width\":40，\"height\":60，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":60，\"width\":60，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"DS-009\"，\"x\":9.65625，\"y\":24}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":74},PROCESS,,rgb(0，128，0),32C237C,GD-08L,GD-10,N",
    "挑檢,IS-46,BGG,2.31,DS,{\"attrs\":{\"x\":300.5，\"y\":980.5，\"width\":40，\"height\":60，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":60，\"width\":60，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"IS-46\"，\"x\":15.6591796875，\"y\":24}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":92},PROCESS,,rgb(0，128，0),RA135F2.G71040_AUO,,,N",
    "研磨_Laser Marking,LM-001,CHY,34.94,DS,{\"attrs\":{\"x\":1120.5，\"y\":178.5，\"width\":60，\"height\":60，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":60，\"width\":80，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"LM-001\"，\"x\":19.65625，\"y\":24}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":82},LOSS-MEN,,rgb(255，255，204),TFT4500BBDP31,,,N",
    "切割,DS-020,CHY,1.64,DS,{\"attrs\":{\"x\":742.5，\"y\":320.5，\"width\":40，\"height\":60，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":60，\"width\":60，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"DS-020\"，\"x\":9.65625，\"y\":24}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":90},PROCESS,,rgb(0，128，0),TFT4500BBDP31,GD-08L,GD-14,Y",
    "AOI,AI-002,CHY,19.30,DS,{\"attrs\":{\"x\":780.5，\"y\":560.5，\"width\":40，\"height\":60，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":60，\"width\":60，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"AI-002\"，\"x\":12.322265625，\"y\":24}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":22},LOSS-MEN,,rgb(255，255，204),TFT4500BBDP31,,,N",
    "挑檢,IS-65,BEX,12.31,DS,{\"attrs\":{\"x\":460.5，\"y\":820.5，\"width\":40，\"height\":60，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":60，\"width\":60，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"IS-65\"，\"x\":15.6591796875，\"y\":24}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":86},PROCESS,,rgb(0，128，0),F83102E00PG1703G_PA5472N_9U,,,Y",
    "挑檢,IS-64,BEX,9.16,DS,{\"attrs\":{\"x\":380.5，\"y\":820.5，\"width\":40，\"height\":60，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":60，\"width\":60，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"IS-64\"，\"x\":15.6591796875，\"y\":24}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":18},LOSS-WIP,,rgb(255，255，204),F83102E00PG1703G_PA5472N_9U,,,Y",
    "切割,DS-012,AJ,4.73,DS,{\"attrs\":{\"x\":661.5，\"y\":400.5，\"width\":40，\"height\":60，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":60，\"width\":60，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"DS-012\"，\"x\":9.65625，\"y\":24}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":100},PROCESS,,rgb(0，128，0),ST7789VI-G4_A2125-GN-028,GD-11,GD-03,N",
    "挑檢,IS-36,BGG,6.01,DS,{\"attrs\":{\"x\":380.5，\"y\":1320.5，\"width\":40，\"height\":60，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":60，\"width\":60，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"IS-36\"，\"x\":15.6591796875，\"y\":24}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":84},PROCESS,,rgb(0，128，0),RA167AA.GG0340_AUO,,,N",
    "切割,DS-007,BGG,3.63,DS,{\"attrs\":{\"x\":342.5，\"y\":480.5，\"width\":40，\"height\":60，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":60，\"width\":60，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"DS-007\"，\"x\":9.65625，\"y\":24}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":35},LOSS-MEN,,rgb(255，255，204),RA167AA.GG0340_AUO,GD-19U,GD-14,N",
    "切割,DS-001,BGG,3.63,DS,{\"attrs\":{\"x\":422.5，\"y\":480.5，\"width\":40，\"height\":60，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":60，\"width\":60，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"DS-001\"，\"x\":9.65625，\"y\":24}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":83},LOSS-MEN,,rgb(255，255，204),RA167AA.GG0340_AUO,GD-19U,GD-14,N",
    "挑檢,IS-62,BEX,6.29,DS,{\"attrs\":{\"x\":380.5，\"y\":740.5，\"width\":40，\"height\":60，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":60，\"width\":60，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"IS-62\"，\"x\":15.6591796875，\"y\":24}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":77},PROCESS,,rgb(0，128，0),F83112A00QG15031_PA5412P,,,Y",
    "挑檢,IS-47,AJ,74.98,DS,{\"attrs\":{\"x\":539.5，\"y\":1320.5，\"width\":40，\"height\":60，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":60，\"width\":60，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"IS-47\"，\"x\":15.6591796875，\"y\":24}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":76},DOWN,,rgb(255，0，0),ST7701SI-G5-G_E2143-GA-014,,,N",
    "挑檢,IS-68,AJ,10.14,DS,{\"attrs\":{\"x\":780.5，\"y\":1160.5，\"width\":40，\"height\":60，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":60，\"width\":60，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"IS-68\"，\"x\":15.6591796875，\"y\":24}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":43},LOSS-MEN,,rgb(255，255，204),ST7701SI-G5_E2143-GA-015,,,Y",
    "挑檢_SAW-TAPE UV,UV-001,AJ,20.74,DS,{\"attrs\":{\"x\":701.5，\"y\":560.5，\"width\":40，\"height\":60，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":60，\"width\":60，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UV-001\"，\"x\":9.9873046875，\"y\":24}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":64},LOSS-MEN,,rgb(255，255，204),ST7796SI-G5-V_A2128-GI,,,N",
    "切割,DS-004,AJ,2.93,DS,{\"attrs\":{\"x\":581.5，\"y\":480.5，\"width\":40，\"height\":60，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":60，\"width\":60，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"DS-004\"，\"x\":9.65625，\"y\":24}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":57},PROCESS,,rgb(0，128，0),ST7570-G4C_A2078-GZ,GD-11,GD-03,N",
    "切割,DS-003,AJ,2.93,DS,{\"attrs\":{\"x\":500.5，\"y\":480.5，\"width\":40，\"height\":60，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":60，\"width\":60，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"DS-003\"，\"x\":9.65625，\"y\":24}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":48},PROCESS,,rgb(0，128，0),ST7570-G4C_A2078-GZ,GD-11,GD-03,N",
    "切割,DS-019,AJ,6.23,DS,{\"attrs\":{\"x\":661.5，\"y\":320.5，\"width\":40，\"height\":60，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":60，\"width\":60，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"DS-019\"，\"x\":9.65625，\"y\":24}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":81},LOSS-MEN,,rgb(255，255，204),ST7285-G4-1-T3S_C2148-GW-005,GD-13L,GD-10,Y",
    "挑檢,IS-60,AD,8.22,DS,{\"attrs\":{\"x\":460.5，\"y\":740.5，\"width\":40，\"height\":60，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":60，\"width\":60，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"IS-60\"，\"x\":15.6591796875，\"y\":24}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":25},PROCESS,,rgb(0，128，0),SRC8594B-003S,,,Y",
    "挑檢,IS-54,AJ,4.11,DS,{\"attrs\":{\"x\":380.5，\"y\":1400.5，\"width\":40，\"height\":60，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":60，\"width\":60，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"IS-54\"，\"x\":15.6591796875，\"y\":24}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":23},PROCESS,,rgb(0，128，0),SC7283-G4-1_C2148-GW-002,,,N",
    "挑檢,IS-48,AJ,4.11,DS,{\"attrs\":{\"x\":300.5，\"y\":1400.5，\"width\":40，\"height\":60，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":60，\"width\":60，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"IS-48\"，\"x\":15.6591796875，\"y\":24}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":75},PROCESS,,rgb(0，128，0),SC7283-G4-1_C2148-GW-002,,,N",
    "挑檢,IS-61,BEX,3.91,DS,{\"attrs\":{\"x\":460.5，\"y\":660.5，\"width\":40，\"height\":60，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":60，\"width\":60，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"IS-61\"，\"x\":15.6591796875，\"y\":24}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":71},LOSS-MEN,,rgb(255，255，204),F83102J00PG1704A,,,Y",
    "切割,DS-031,BEX,2.70,DS,{\"attrs\":{\"x\":1061.5，\"y\":320.5，\"width\":40，\"height\":60，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":60，\"width\":60，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"DS-031\"，\"x\":9.65625，\"y\":24}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":29},PROCESS,,rgb(0，128，0),F83102J00PG1704A,GD-03,GD-14,Y",
    "挑檢,IS-33,BGG,13.24,DS,{\"attrs\":{\"x\":300.5，\"y\":1240.5，\"width\":40，\"height\":60，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":60，\"width\":60，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"IS-33\"，\"x\":15.6591796875，\"y\":24}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":68},LOSS-MEN,,rgb(255，255，204),RA167A7.GC0040_AUO,,,N",
    "LG,LG-002,BEX,2.76,DS,{\"attrs\":{\"x\":300.5，\"y\":40.5，\"width\":60，\"height\":40，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":40，\"width\":80，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"LG-002\"，\"x\":19.9873046875，\"y\":14}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":28},PROCESS,,rgb(0，128，0),F83108B00PG17035_PA5488C_9U,,,N",
    "LG,LG-001,BEX,2.42,DS,{\"attrs\":{\"x\":400.5，\"y\":40.5，\"width\":60，\"height\":40，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":40，\"width\":80，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"LG-001\"，\"x\":19.9873046875，\"y\":14}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":67},PROCESS,,rgb(0，128，0),F83108B00PG17035_PA5488C_9U,,,N",
    "挑檢,IS-72,BEX,0.96,DS,{\"attrs\":{\"x\":620.5，\"y\":740.5，\"width\":40，\"height\":60，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":60，\"width\":60，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"IS-72\"，\"x\":15.6591796875，\"y\":24}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":26},PROCESS,,rgb(0，128，0),F83108B00PG17035_PA5488C_9U,,,Y",
    "挑檢,IS-63,BEX,14.53,DS,{\"attrs\":{\"x\":380.5，\"y\":660.5，\"width\":40，\"height\":60，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":60，\"width\":60，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"IS-63\"，\"x\":15.6591796875，\"y\":24}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":66},PROCESS,,rgb(0，128，0),F83108B00PG17035_PA5488C_9U,,,Y",
    "切割,DS-032,BEX,3.81,DS,{\"attrs\":{\"x\":1140.5，\"y\":320.5，\"width\":40，\"height\":60，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":60，\"width\":60，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"DS-032\"，\"x\":9.65625，\"y\":24}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":59},PROCESS,,rgb(0，128，0),F83108B00PG17035_PA5488C_9U,GD-03,GD-14,Y",
    "切割,DS-030,BEX,1.54,DS,{\"attrs\":{\"x\":1140.5，\"y\":400.5，\"width\":40，\"height\":60，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":60，\"width\":60，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"DS-030\"，\"x\":9.65625，\"y\":24}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":60},PROCESS,,rgb(0，128，0),F83108B00PG17035_PA5488C_9U,GD-03,GD-14,Y",
    "切割,DS-029,BEX,1.54,DS,{\"attrs\":{\"x\":1061.5，\"y\":400.5，\"width\":40，\"height\":60，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":60，\"width\":60，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"DS-029\"，\"x\":9.65625，\"y\":24}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":63},PROCESS,,rgb(0，128，0),F83108B00PG17035_PA5488C_9U,GD-03,GD-14,Y",
    "切割_TAPING,DM-001,AJ,1.80,DS,{\"attrs\":{\"x\":1020.5，\"y\":100.5，\"width\":60，\"height\":40，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":40，\"width\":80，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"DM-001\"，\"x\":18.66015625，\"y\":14}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":65},LOSS-MEN,,rgb(255，255，204),ST7570-G4_A2078-GZ,,,N",
    "研磨_DE-TAPING,WD-001,AJ,1.65,DS,{\"attrs\":{\"x\":1120.5，\"y\":40.5，\"width\":60，\"height\":40，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":40，\"width\":80，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"WD-001\"，\"x\":17.9951171875，\"y\":14}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":32},LOSS-MEN,,rgb(255，255，204),ST7789T3-G4-1_E2142-GD-012,,,N",
    "切割_TAPING,DM-004,AJ,1.64,DS,{\"attrs\":{\"x\":1220.5，\"y\":100.5，\"width\":60，\"height\":40，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":40，\"width\":80，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"DM-004\"，\"x\":18.66015625，\"y\":14}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":37},LOSS-MEN,,rgb(255，255，204),ST7789T3-G4-1_E2142-GD-012,,,N",
    "研磨_TAPING,WT-004,BNI,0.32,DS,{\"attrs\":{\"x\":160.5，\"y\":40.5，\"width\":60，\"height\":40，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":40，\"width\":80，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"WT-004\"，\"x\":18.994140625，\"y\":14}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":95},PROCESS,,rgb(0，128，0),A6055C-IRC700+BLK-75-25,,,N",
    "研磨,WG-004,BNI,0.38,DS,{\"attrs\":{\"x\":601.5，\"y\":40.5，\"width\":60，\"height\":40，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":40，\"width\":80，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"WG-004\"，\"x\":17.6611328125，\"y\":14}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":79},PROCESS,,rgb(0，128，0),A6055C-IRC700+BLK-75-25,,,N",
    "切割_TAPING,DM-005,BNI,0.38,DS,{\"attrs\":{\"x\":501.5，\"y\":40.5，\"width\":60，\"height\":40，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":40，\"width\":80，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"DM-005\"，\"x\":18.66015625，\"y\":14}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":78},PROCESS,,rgb(0，128，0),A6055C-IRC700+BLK-75-25,,,N",
    "挑檢,IS-43,BGG,11.24,DS,{\"attrs\":{\"x\":300.5，\"y\":900.5，\"width\":40，\"height\":60，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":60，\"width\":60，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"IS-43\"，\"x\":15.6591796875，\"y\":24}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":62},PROCESS,,rgb(0，128，0),RA136H1.G71E51_Sharp_SANSHIN_LH,,,N",
    "AOI,TI-004,BGG,0.17,DS,{\"attrs\":{\"x\":860.5，\"y\":740.5，\"width\":40，\"height\":60，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":60，\"width\":60，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"TI-004\"，\"x\":12.6591796875，\"y\":24}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":97},LOSS-MEN,,rgb(255，255，204),RA136H1.G70E51_Sharp_SANSHIN_LH,,,N",
    "AOI,TI-003,BGG,3.30,DS,{\"attrs\":{\"x\":780.5，\"y\":660.5，\"width\":40，\"height\":60，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":60，\"width\":60，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"TI-003\"，\"x\":12.6591796875，\"y\":24}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":38},LOSS-MEN,,rgb(255，255，204),RA136H1.G70E51_Sharp_SANSHIN_LH,,,N",
    "AOI,TI-002,BGG,2.43,DS,{\"attrs\":{\"x\":861.5，\"y\":660.5，\"width\":40，\"height\":60，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":60，\"width\":60，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"TI-002\"，\"x\":12.6591796875，\"y\":24}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":103},LOSS-MEN,,rgb(255，255，204),RA136H1.G70E51_Sharp_SANSHIN_LH,,,N",
    "挑檢,IS-11,AJ,9.28,DS,{\"attrs\":{\"x\":701.5，\"y\":1320.5，\"width\":40，\"height\":60，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":60，\"width\":60，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"IS-11\"，\"x\":16.1044921875，\"y\":24}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":56},PROCESS,,rgb(0，128，0),ST7036i-0A-G2_A2030-0A-GE-6,,,N",
    "挑檢,IS-07,AJ,28.52,DS,{\"attrs\":{\"x\":701.5，\"y\":1240.5，\"width\":40，\"height\":60，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":60，\"width\":60，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"IS-07\"，\"x\":15.6591796875，\"y\":24}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":55},PROCESS,,rgb(0，128，0),ST7036i-0A-G2_A2030-0A-GE-6,,,N",
    "挑檢,IS-03,AJ,28.52,DS,{\"attrs\":{\"x\":620.5，\"y\":1240.5，\"width\":40，\"height\":60，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":60，\"width\":60，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"IS-03\"，\"x\":15.6591796875，\"y\":24}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":58},PROCESS,,rgb(0，128，0),ST7036i-0A-G2_A2030-0A-GE-6,,,N",
    "挑檢,IS-53,AJ,11.94,DS,{\"attrs\":{\"x\":539.5，\"y\":1160.5，\"width\":40，\"height\":60，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":60，\"width\":60，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"IS-53\"，\"x\":15.6591796875，\"y\":24}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":52},PROCESS,,rgb(0，128，0),ST7775S-G4_A2102-GL-001,,,N",
    "挑檢,IS-51,AJ,9.28,DS,{\"attrs\":{\"x\":460.5，\"y\":1320.5，\"width\":40，\"height\":60，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":60，\"width\":60，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"IS-51\"，\"x\":15.6591796875，\"y\":24}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":42},PROCESS,,rgb(0，128，0),ST7775S-G4_A2102-GL-001,,,N",
    "切割_BAKE,OV-001,AD,2.64,DS,{\"attrs\":{\"x\":821.5，\"y\":240.5，\"width\":40，\"height\":60，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":60，\"width\":60，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"OV-001\"，\"x\":9.6533203125，\"y\":24}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":88},LOSS-MEN,,rgb(255，255，204),SLC2750C-265S,,,N",
    "切割_TAPING,DM-002,AD,2.65,DS,{\"attrs\":{\"x\":1120.5，\"y\":100.5，\"width\":60，\"height\":40，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":40，\"width\":80，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"DM-002\"，\"x\":18.66015625，\"y\":14}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":96},LOSS-MEN,,rgb(255，255，204),SLC2750C-265S,,,N",
    "挑檢,IS-44,AJ,11.60,DS,{\"attrs\":{\"x\":300.5，\"y\":820.5，\"width\":40，\"height\":60，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":60，\"width\":60，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"IS-44\"，\"x\":15.6591796875，\"y\":24}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":53},LOSS-MEN,,rgb(255，255，204),ST7262-G4-1-H2_A2156-GN-001,,,N",
    "切割,DS-015,COG,0.84,DS,{\"attrs\":{\"x\":342.5，\"y\":320.5，\"width\":40，\"height\":60，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":60，\"width\":60，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"DS-015\"，\"x\":9.65625，\"y\":24}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":101},PROCESS,,rgb(0，128，0),NSA2300-100um,,,Y",
    "挑檢,IS-06,FF,177.90,DS,{\"attrs\":{\"x\":620.5，\"y\":1320.5，\"width\":40，\"height\":60，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":60，\"width\":60，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"IS-06\"，\"x\":15.6591796875，\"y\":24}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":51},LOSS-WIP,,rgb(255，255，204),GRL860B-836A-C,,,N",
    "挑檢_SAW-TAPE UV,UV-003,AJ,1.22,DS,{\"attrs\":{\"x\":621.5，\"y\":560.5，\"width\":40，\"height\":60，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":60，\"width\":60，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"UV-003\"，\"x\":9.9873046875，\"y\":24}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":19},LOSS-MEN,,rgb(255，255，204),ST7789T3-G4-1_E2142-GD-000,,,N",
    "挑檢,IS-71,AJ,0.55,DS,{\"attrs\":{\"x\":620.5，\"y\":820.5，\"width\":40，\"height\":60，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":60，\"width\":60，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"IS-71\"，\"x\":15.6591796875，\"y\":24}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":50},LOSS-MEN,,rgb(255，255，204),ST7789T3-G4-1_E2142-GD-000,,,Y",
    "挑檢,IS-50,AJ,4.66,DS,{\"attrs\":{\"x\":300.5，\"y\":660.5，\"width\":40，\"height\":60，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":60，\"width\":60，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"IS-50\"，\"x\":15.6591796875，\"y\":24}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":46},PROCESS,,rgb(0，128，0),ST7789T3-G4-1_E2142-GD-000,,,N",
    "挑檢,IS-49,AJ,12.54,DS,{\"attrs\":{\"x\":300.5，\"y\":740.5，\"width\":40，\"height\":60，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":60，\"width\":60，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"IS-49\"，\"x\":15.6591796875，\"y\":24}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":45},PROCESS,,rgb(0，128，0),ST7789T3-G4-1_E2142-GD-000,,,N",
    "切割,DS-006,AJ,10.66,DS,{\"attrs\":{\"x\":742.5，\"y\":480.5，\"width\":40，\"height\":60，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":60，\"width\":60，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"DS-006\"，\"x\":9.65625，\"y\":24}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":69},PROCESS,,rgb(0，128，0),ST7789T3-G4-1_E2142-GD-000,GD-13L,GD-10,N",
    "切割,DS-005,AJ,6.68,DS,{\"attrs\":{\"x\":661.5，\"y\":480.5，\"width\":40，\"height\":60，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":60，\"width\":60，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"DS-005\"，\"x\":9.65625，\"y\":24}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":44},PROCESS,,rgb(0，128，0),ST7789T3-G4-1_E2142-GD-000,GD-13L,GD-10,N",
    "研磨_DE-TAPING,WD-002,LS,5.69,DS,{\"attrs\":{\"x\":1220.5，\"y\":40.5，\"width\":60，\"height\":40，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":40，\"width\":80，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"WD-002\"，\"x\":17.9951171875，\"y\":14}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":111},LOSS-MEN,,rgb(255，255，204),H4909-001,,,N",
    "研磨_TAPING,WT-001,BMM,5.26,DS,{\"attrs\":{\"x\":1020.5，\"y\":40.5，\"width\":60，\"height\":40，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":40，\"width\":80，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"WT-001\"，\"x\":18.994140625，\"y\":14}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":54},LOSS-MEN,,rgb(255，255，204),EU5A22-ZE301,,,N",
    "切割,DS-024,BRF,0.88,DS,{\"attrs\":{\"x\":500.5，\"y\":240.5，\"width\":40，\"height\":60，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":60，\"width\":60，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"DS-024\"，\"x\":9.65625，\"y\":24}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":61},PROCESS,,rgb(0，128，0),PL610C4-D5,GD-08,TD-02,Y",
    "研磨,WG-001,,0.21,DS,{\"attrs\":{\"x\":901.5，\"y\":40.5，\"width\":60，\"height\":40，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":40，\"width\":80，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"WG-001\"，\"x\":17.6611328125，\"y\":14}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":47},SD-SETUP,,rgb(255，0，255),,,,N",
    "挑檢,IS-08,,214.68,DS,{\"attrs\":{\"x\":620.5，\"y\":1400.5，\"width\":40，\"height\":60，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":60，\"width\":60，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"IS-08\"，\"x\":15.6591796875，\"y\":24}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":36},DOWN,,rgb(255，0，0),,,,N",
    "切割,DS-023,,0.89,DS,{\"attrs\":{\"x\":420.5，\"y\":240.5，\"width\":40，\"height\":60，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":60，\"width\":60，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"DS-023\"，\"x\":9.65625，\"y\":24}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":89},SD-SETUP,,rgb(255，0，255),,,,Y",
    "切割,DS-022,,0.54,DS,{\"attrs\":{\"x\":342.5，\"y\":240.5，\"width\":40，\"height\":60，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":60，\"width\":60，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"DS-022\"，\"x\":9.65625，\"y\":24}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":106},SD-SETUP,,rgb(255，0，255),,,,Y",
    "切割,DS-021,,919.57,DS,{\"attrs\":{\"x\":821.5，\"y\":320.5，\"width\":40，\"height\":60，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":60，\"width\":60，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"DS-021\"，\"x\":9.65625，\"y\":24}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":41},DOWN,,rgb(255，0，0),,,,Y",
    "切割,DS-018,,0.44,DS,{\"attrs\":{\"x\":582.5，\"y\":320.5，\"width\":40，\"height\":60，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":60，\"width\":60，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"DS-018\"，\"x\":9.65625，\"y\":24}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":24},SD-SETUP,,rgb(255，0，255),,,,Y",
    ",QC,,,DS,{\"attrs\":{\"x\":940.5，\"y\":560.5，\"width\":380，\"height\":320，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":200，\"width\":380，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"QC\"，\"x\":175，\"y\":90，\"fontSize\":20}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":33},,,,,,,N",
    ",FVI,,,DS,{\"attrs\":{\"x\":940.5，\"y\":1080.5，\"width\":380，\"height\":380，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":380，\"width\":380，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"FVI\"，\"x\":174.443359375，\"y\":180，\"fontSize\":20}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":34},,,,,,,N",
    ",DM-006,,,DS,{\"attrs\":{\"x\":701.5，\"y\":40.5，\"width\":60，\"height\":40，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":40，\"width\":80，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"DM-006\"，\"x\":18.66015625，\"y\":14}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":49},,,,,,,N",
    ",DC-001,,,DS,{\"attrs\":{\"x\":742.5，\"y\":240.5，\"width\":40，\"height\":60，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":60，\"width\":60，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"DC-001\"，\"x\":9.3251953125，\"y\":24}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":30},,,,,,,N",
    ",B,,,DS,{\"attrs\":{\"x\":561.5，\"y\":1080.5，\"width\":20，\"height\":20，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(0，0，0)\"，\"height\":20，\"width\":20，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"B\"，\"x\":5.998046875，\"y\":4}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":105},,,,,,,N",
    ",B,,,DS,{\"attrs\":{\"x\":1320.5，\"y\":0.5，\"width\":20，\"height\":20，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(0，0，0)\"，\"height\":20，\"width\":20，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"B\"，\"x\":5.998046875，\"y\":4}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":102},,,,,,,N",
    ",B,,,DS,{\"attrs\":{\"x\":921.5，\"y\":600.5，\"width\":20，\"height\":20，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(0，0，0)\"，\"height\":20，\"width\":20，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"B\"，\"x\":5.998046875，\"y\":4}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":91},,,,,,,N",
    ",B,,,DS,{\"attrs\":{\"x\":561.5，\"y\":600.5，\"width\":20，\"height\":20，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(0，0，0)\"，\"height\":20，\"width\":20，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"B\"，\"x\":5.998046875，\"y\":4}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":87},,,,,,,N",
    ",B,,,DS,{\"attrs\":{\"x\":560.5，\"y\":-1.5，\"width\":20，\"height\":20，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(0，0，0)\"，\"height\":20，\"width\":20，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"B\"，\"x\":5.998046875，\"y\":4}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":80},,,,,,,N",
    ",B,,,DS,{\"attrs\":{\"x\":260.5，\"y\":-1.5，\"width\":20，\"height\":20，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(0，0，0)\"，\"height\":20，\"width\":20，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"B\"，\"x\":5.998046875，\"y\":4}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":73},,,,,,,N",
    ",B,,,DS,{\"attrs\":{\"x\":20.5，\"y\":0.5，\"width\":20，\"height\":20，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(0，0，0)\"，\"height\":20，\"width\":20，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"B\"，\"x\":5.998046875，\"y\":4}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":70},,,,,,,N",
    ",B,,,DS,{\"attrs\":{\"x\":921.5，\"y\":2.5，\"width\":20，\"height\":20，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(0，0，0)\"，\"height\":20，\"width\":20，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"B\"，\"x\":5.998046875，\"y\":4}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":31},,,,,,,N",
    ",B,,,DS,{\"attrs\":{\"x\":1320.5，\"y\":220.5，\"width\":20，\"height\":20，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(0，0，0)\"，\"height\":20，\"width\":20，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"B\"，\"x\":5.998046875，\"y\":4}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":27},,,,,,,N",
    ",B,,,DS,{\"attrs\":{\"x\":20.5，\"y\":1080.5，\"width\":20，\"height\":20，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(0，0，0)\"，\"height\":20，\"width\":20，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"B\"，\"x\":5.998046875，\"y\":4}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":20},,,,,,,N",
    ",B,,,DS,{\"attrs\":{\"x\":921.5，\"y\":1080.5，\"width\":20，\"height\":20，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(0，0，0)\"，\"height\":20，\"width\":20，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"B\"，\"x\":5.998046875，\"y\":4}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":17},,,,,,,N",
    ",B,,,DS,{\"attrs\":{\"x\":921.5，\"y\":220.5，\"width\":20，\"height\":20，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(0，0，0)\"，\"height\":20，\"width\":20，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"B\"，\"x\":5.998046875，\"y\":4}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":16},,,,,,,N",
    ",B,,,DS,{\"attrs\":{\"x\":260.5，\"y\":600.5，\"width\":20，\"height\":20，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(0，0，0)\"，\"height\":20，\"width\":20，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"B\"，\"x\":5.998046875，\"y\":4}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":15},,,,,,,N",
    ",B,,,DS,{\"attrs\":{\"x\":260.5，\"y\":220.5，\"width\":20，\"height\":20，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(0，0，0)\"，\"height\":20，\"width\":20，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"B\"，\"x\":5.998046875，\"y\":4}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":14},,,,,,,N",
    ",B,,,DS,{\"attrs\":{\"x\":561.5，\"y\":219.5，\"width\":20，\"height\":20，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(0，0，0)\"，\"height\":20，\"width\":20，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"B\"，\"x\":5.998046875，\"y\":4}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":13},,,,,,,N",
    ",B,,,DS,{\"attrs\":{\"x\":1320.5，\"y\":602.5，\"width\":20，\"height\":20，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(0，0，0)\"，\"height\":20，\"width\":20，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"B\"，\"x\":5.998046875，\"y\":4}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":10},,,,,,,N",
    ",B,,,DS,{\"attrs\":{\"x\":1320.5，\"y\":1080.5，\"width\":20，\"height\":20，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(0，0，0)\"，\"height\":20，\"width\":20，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"B\"，\"x\":5.998046875，\"y\":4}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":7},,,,,,,N",
    ",B,,,DS,{\"attrs\":{\"x\":20.5，\"y\":220.5，\"width\":20，\"height\":20，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(0，0，0)\"，\"height\":20，\"width\":20，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"B\"，\"x\":5.998046875，\"y\":4}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":3},,,,,,,N",
    ",B,,,DS,{\"attrs\":{\"x\":20.5，\"y\":600.5，\"width\":20，\"height\":20，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(0，0，0)\"，\"height\":20，\"width\":20，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"B\"，\"x\":5.998046875，\"y\":4}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":2},,,,,,,N",
    ",B,,,DS,{\"attrs\":{\"x\":260.5，\"y\":1080.5，\"width\":20，\"height\":20，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(0，0，0)\"，\"height\":20，\"width\":20，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"B\"，\"x\":5.998046875，\"y\":4}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":1},,,,,,,N",
    ",LC-001,,,DS,{\"attrs\":{\"x\":342.5，\"y\":560.5，\"width\":40，\"height\":60，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":60，\"width\":60，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"LC-001\"，\"x\":10.3212890625，\"y\":24}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":9},,,,,,,N",
    ",PACK,,,DS,{\"attrs\":{\"x\":940.5，\"y\":761.5，\"width\":380，\"height\":320，\"name\":\"cfm-object\"}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"fill\":\"rgb(255，255，255)\"，\"height\":320，\"width\":380，\"name\":\"cfm-frame\"，\"stroke\":\"black\"}，\"className\":\"Rect\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"name\"，\"text\":\"PACK\"，\"x\":163.5107421875，\"y\":150，\"fontSize\":20}，\"className\":\"Text\"}，{\"attrs\":{\"fill\":\"black\"，\"name\":\"category\"，\"text\":\"DS\"，\"opacity\":0}，\"className\":\"Text\"}]，\"zIndex\":6},,,,,,,N",
    ",圖層,,,圖層(切挑),{\"width\":1360，\"height\":1500},圖層(切挑),,,",
    ",CP,,,底圖(切挑),{\"attrs\":{\"x\":280.84374999999955，\"y\":220.99999999999994，\"name\":\"block\"，\"scaleX\":1.0156249999999987，\"scaleY\":4.881889763779528}，\"className\":\"Group\"，\"children\":[{\"attrs\":{\"width\":256，\"height\":254，\"fill\":\"#d6d6d6\"，\"name\":\"fill\"，\"offsetX\":256}，\"className\":\"Rect\"}，{\"attrs\":{\"text\":\"CP\"，\"fill\":\"black\"，\"opacity\":0，\"name\":\"name\"，\"offsetX\":256}，\"className\":\"Text\"}]，\"zIndex\":0},底圖(切挑),,,"
];

const L = [
    "DS-003，AJ，ST7570-G4C_A2078-GZ，23-SAW_STEP，PROCESS,PROCESS，30.43，10，438，2024/09/06 07:30:00，2024/09/06 14:48:14，00IC240900001，PU5431I-C1@LOSS-WIP，0.02，20，0，2024/09/06 14:48:14，2024/09/06 14:48:30，，@PROCESS，11.22，30，161，2024/09/06 14:48:30，2024/09/06 17:30:00，00AJ240900089，ST7570-G4C_A2078-GZ",
    "DS-004，AJ，ST7570-G4C_A2078-GZ，23-SAW_STEP，PROCESS,PROCESS，2.52，10，36，2024/09/06 07:30:00，2024/09/06 08:06:21，00AJ240900060，ST7789VI-G4_A2125-GN@LOSS-MEN，0.06，20，1，2024/09/06 08:06:21，2024/09/06 08:07:12，，@PROCESS，15.91，30，229，2024/09/06 08:07:12，2024/09/06 11:56:16，00AJ240900058，ST7789VI-G4_A2125-GN@LOSS-MEN，0.30，40，4，2024/09/06 11:56:16，2024/09/06 12:00:38，，@PROCESS，11.61，50，167，2024/09/06 12:00:38，2024/09/06 14:47:51，00AJ240900018，ST7362-G4_A2125-GN@LOSS-WIP，0.05，60，1，2024/09/06 14:47:51，2024/09/06 14:48:30，，@PROCESS，11.22，70，161，2024/09/06 14:48:30，2024/09/06 17:30:00，00AJ240900089，ST7570-G4C_A2078-GZ",
    "DS-005，AJ，ST7789T3-G4-1_E2142-GD-000，23-SAW_STEP，PROCESS,PROCESS，14.68，10，211，2024/09/06 07:30:00，2024/09/06 11:01:27，00AJ240900072，ST7789T3-G4-1_E2142-GD-000@LOSS-MEN，0.14，20，2，2024/09/06 11:01:27，2024/09/06 11:03:24，，@PROCESS，26.85，30，387，2024/09/06 11:03:24，2024/09/06 17:30:00，00AJ240900073，ST7789T3-G4-1_E2142-GD-000",
    "DS-006，AJ，ST7789T3-G4-1_E2142-GD-000，23-SAW_STEP，PROCESS,PROCESS，41.67，10，600，2024/09/06 07:30:00，2024/09/06 17:30:00，00AJ240900073，ST7789T3-G4-1_E2142-GD-000",
    "DS-009，BFK，32C237C，23-SAW_STEP，PROCESS,PROCESS，33.20，10，478，2024/09/06 07:30:00，2024/09/06 15:28:09，0BFK240900013，32C184C-1@LOSS-WIP，0.03，20，0，2024/09/06 15:28:09，2024/09/06 15:28:35，，@PROCESS，0.03，30，0，2024/09/06 15:28:35，2024/09/06 15:29:05，0BFK240900012，32C237C@LOSS-WIP，0.03，40，0，2024/09/06 15:29:05，2024/09/06 15:29:34，，@PROCESS，8.36，50，120，2024/09/06 15:29:34，2024/09/06 17:30:00，0BFK240900011，32C237C",
    "DS-010，BGG，RA142BE.G54050_AUO，23-SAW_STEP，PROCESS,PROCESS，13.42，10，193，2024/09/06 07:30:00，2024/09/06 10:43:17，0BGG240900154，RA142BE.G54050_AUO@LOSS-WIP，0.03，20，0，2024/09/06 10:43:17，2024/09/06 10:43:46，，@PROCESS，28.21，30，406，2024/09/06 10:43:46，2024/09/06 17:30:00，0BGG240900109，RA142BE.G54050_AUO",
    "DS-011，AJ，ST7701SI-G7-P_E2143-GA-012，23-SAW_STEP，PROCESS,LOSS-MEN，7.28，10，105，2024/09/06 07:30:00，2024/09/06 09:14:46，，@PROCESS，34.39，20，495，2024/09/06 09:14:46，2024/09/06 17:30:00，00AJ240900081，ST7701SI-G7-P_E2143-GA-012",
    "DS-012，AJ，ST7789VI-G4_A2125-GN-028，23-SAW_STEP，PROCESS,PROCESS，16.09，10，232，2024/09/06 07:30:00，2024/09/06 11:21:44，0BGG240900154，RA142BE.G54050_AUO@LOSS-WIP，0.04，20，1，2024/09/06 11:21:44，2024/09/06 11:22:16，，@SD-SETUP，0.05，30，1，2024/09/06 11:22:16，2024/09/06 11:23:00，，@LOSS-WIP，0.89，40，13，2024/09/06 11:23:00，2024/09/06 11:35:50，，@PROCESS，5.72，50，82，2024/09/06 11:35:50，2024/09/06 12:58:15，00AJ240900085，ST7789VI-G4_A2125-GN-028@LOSS-WIP，0.08，60，1，2024/09/06 12:58:15，2024/09/06 12:59:25，，@SD-SETUP，0.05，70，1，2024/09/06 12:59:25，2024/09/06 13:00:05，，@LOSS-WIP，0.01，80，0，2024/09/06 13:00:05，2024/09/06 13:00:14，，@PROCESS，18.73，90，270，2024/09/06 13:00:14，2024/09/06 17:30:00，00AJ240900085，ST7789VI-G4_A2125-GN-028",
    "DS-013，BGG，RA142BE.G54050_AUO，23-SAW_STEP，PROCESS,PROCESS，4.84，10，70，2024/09/06 07:30:00，2024/09/06 08:39:43，0BGG240900137，RA142BL.G50050_AUO@LOSS-MEN，1.04，20，15，2024/09/06 08:39:43，2024/09/06 08:54:39，，@PROCESS，7.52，30，108，2024/09/06 08:54:39，2024/09/06 10:42:57，0BGG240900140，RA142BE.G55050_AUO@LOSS-WIP，0.05，40，1，2024/09/06 10:42:57，2024/09/06 10:43:39，，@PROCESS，28.22，50，406，2024/09/06 10:43:39，2024/09/06 17:30:00，0BGG240900109，RA142BE.G54050_AUO",
    "DS-014，AJ，ST7701SI-G7-P_E2143-GA-012，23-SAW_STEP，PROCESS,LOSS-WIP，7.28，10，105，2024/09/06 07:30:00，2024/09/06 09:14:46，，@PROCESS，34.39，20，495，2024/09/06 09:14:46，2024/09/06 17:30:00，00AJ240900081，ST7701SI-G7-P_E2143-GA-012",
    "DS-015，COG，NSA2300-100um，23-SAW_STEP，PROCESS,LOSS-MEN，2.30，10，33，2024/09/06 07:30:00，2024/09/06 08:03:08，，@PROCESS，30.08，20，433，2024/09/06 08:03:08，2024/09/06 15:16:15，0BNI240800046，B6031-BLACK-175-25@LOSS-WIP，1.48，30，21，2024/09/06 15:16:15，2024/09/06 15:37:32，，@SD-SETUP，0.03，40，0，2024/09/06 15:37:32，2024/09/06 15:38:00，，@LOSS-WIP，5.27，50，76，2024/09/06 15:38:00，2024/09/06 16:53:49，，@PROCESS，2.51，60，36，2024/09/06 16:53:49，2024/09/06 17:30:00，0COG240900001，NSA2300-100um",
    "DS-016，AJ，ST7701SN-G5-1_E2143-GA-010，23-SAW_STEP，PROCESS,PROCESS，41.67，10，600，2024/09/06 07:30:00，2024/09/06 17:30:00，00AJ240900087，ST7701SN-G5-1_E2143-GA-010",
    "DS-017，AJ，ST7701SI-G7-P_E2143-GA-012，23-SAW_STEP，PROCESS,PROCESS，16.95，10，244，2024/09/06 07:30:00，2024/09/06 11:34:08，0BGG240900103，UB030D3.G11080_AUO@LOSS-MEN，1.38，20，20，2024/09/06 11:34:08，2024/09/06 11:53:58，，@SD-SETUP，0.05，30，1，2024/09/06 11:53:58，2024/09/06 11:54:44，，@LOSS-WIP，0.01，40，0，2024/09/06 11:54:44，2024/09/06 11:54:54，，@SD-SETUP，8.23，50，119，2024/09/06 11:54:54，2024/09/06 13:53:26，，@LOSS-WIP，0.07，60，1，2024/09/06 13:53:26，2024/09/06 13:54:27，，@PROCESS，14.97，70，216，2024/09/06 13:54:27，2024/09/06 17:30:00，00AJ240900088，ST7701SI-G7-P_E2143-GA-012",
    "DS-020，CHY，TFT4500BBDP31，23-SAW_STEP，PROCESS,LOSS-MEN，4.05，10，58，2024/09/06 07:30:00，2024/09/06 08:28:23，，@SD-SETUP，0.05，20，1，2024/09/06 08:28:23，2024/09/06 08:29:04，，@LOSS-WIP，0.01，30，0，2024/09/06 08:29:04，2024/09/06 08:29:12，，@SD-SETUP，7.88，40，114，2024/09/06 08:29:12，2024/09/06 10:22:44，，@LOSS-WIP，0.91，50，13，2024/09/06 10:22:44，2024/09/06 10:35:47，，@PROCESS，22.77，60，328，2024/09/06 10:35:47，2024/09/06 16:03:42，0CHY240900002，TFT4500BBDP31@LOSS-WIP，0.04，70，1，2024/09/06 16:03:42，2024/09/06 16:04:15，，@SD-SETUP，0.09，80，1，2024/09/06 16:04:15，2024/09/06 16:05:32，，@LOSS-WIP，0.03，90，0，2024/09/06 16:05:32，2024/09/06 16:05:54，，@PROCESS，5.84，100，84，2024/09/06 16:05:54，2024/09/06 17:30:00，0CHY240900002，TFT4500BBDP31",
    "DS-023，，，23-SAW_STEP，SD-SETUP,PROCESS，36.75，10，529，2024/09/06 07:30:00，2024/09/06 16:19:15，00BM240900001，MG64F238AH-21390@LOSS-MEN，2.15，20，31，2024/09/06 16:19:15，2024/09/06 16:50:14，，@SD-SETUP，0.03，30，0，2024/09/06 16:50:14，2024/09/06 16:50:41，，@LOSS-WIP，0.01，40，0，2024/09/06 16:50:41，2024/09/06 16:50:50，，@SD-SETUP，2.72，50，39，2024/09/06 16:50:50，2024/09/06 17:30:00，，",
    "DS-025，BFK，32C237C，23-SAW_STEP，PROCESS,PROCESS，12.60，10，181，2024/09/06 07:30:00，2024/09/06 10:31:29，00AD240900015，SLL86F8A-013S@LOSS-WIP，3.01，20，43，2024/09/06 10:31:29，2024/09/06 11:14:50，，@PROCESS，26.05，30，375，2024/09/06 11:14:50，2024/09/06 17:30:00，0BFK240900009，32C237C",
    "DS-026，BFK，32C237C，23-SAW_STEP，PROCESS,PROCESS，29.63，10，427，2024/09/06 07:30:00，2024/09/06 14:36:38，0BFK240900006，32C237C@LOSS-MEN，1.73，20，25，2024/09/06 14:36:38，2024/09/06 15:01:33，，@PROCESS，10.31，30，148，2024/09/06 15:01:33，2024/09/06 17:30:00，0BFK240900007，32C237C",
    "DS-029，BEX，F83108B00PG17035_PA5488C_9U，23-SAW_STEP，PROCESS,PROCESS，36.24，10，522，2024/09/06 07:30:00，2024/09/06 16:11:51，0BEX240800145，F83108B00PG17035_PA5488C_9U@LOSS-WIP，0.02，20，0，2024/09/06 16:11:51，2024/09/06 16:12:10，，@PROCESS，5.41，30，78，2024/09/06 16:12:10，2024/09/06 17:30:00，0BEX240800148，F83108B00PG17035_PA5488C_9U",
    "DS-030，BEX，F83108B00PG17035_PA5488C_9U，23-SAW_STEP，PROCESS,PROCESS，0.48，10，7，2024/09/06 07:30:00，2024/09/06 07:36:52，0BEX240900019，F83112A00QG15031_PA5412P@LOSS-MEN，7.29，20，105，2024/09/06 07:36:52，2024/09/06 09:21:49，，@PROCESS，28.46，30，410，2024/09/06 09:21:49，2024/09/06 16:11:42，0BEX240800145，F83108B00PG17035_PA5488C_9U@LOSS-WIP，0.03，40，0，2024/09/06 16:11:42，2024/09/06 16:12:10，，@PROCESS，5.41，50，78，2024/09/06 16:12:10，2024/09/06 17:30:00，0BEX240800148，F83108B00PG17035_PA5488C_9U",
    "DS-031，BEX，F83102J00PG1704A，23-SAW_STEP，PROCESS,PROCESS，30.33，10，437，2024/09/06 07:30:00，2024/09/06 14:46:45，0BEX240900006，F83102J00PG1704A@LOSS-MEN，1.07，20，15，2024/09/06 14:46:45，2024/09/06 15:02:09，，@PROCESS，10.27，30，148，2024/09/06 15:02:09，2024/09/06 17:30:00，0BEX240900008，F83102J00PG1704A",
    "DS-032，BEX，F83108B00PG17035_PA5488C_9U，23-SAW_STEP，PROCESS,PROCESS，26.66，10，384，2024/09/06 07:30:00，2024/09/06 13:53:54，0BEX240900006，F83102J00PG1704A@LOSS-WIP，0.02，20，0，2024/09/06 13:53:54，2024/09/06 13:54:09，，@PROCESS，0.06，30，1，2024/09/06 13:54:09，2024/09/06 13:55:01，0BEX240800147，F83108B00PG17035_PA5488C_9U@LOSS-WIP，0.03，40，0，2024/09/06 13:55:01，2024/09/06 13:55:25，，@PROCESS，14.90，50，215，2024/09/06 13:55:25，2024/09/06 17:30:00，0BEX240800146，F83108B00PG17035_PA5488C_9U",
    "IS-03，AJ，ST7036i-0A-G2_A2030-0A-GE-6，34-P\u0026P_STEP，PROCESS,PROCESS，41.67，10，600，2024/09/06 07:30:00，2024/09/06 17:30:00，00AJ240900023，ST7036i-0A-G2_A2030-0A-GE-6",
    "IS-04，，，34-P\u0026P_STEP，LOSS-WIP,LOSS-WIP，41.67，10，600，2024/09/06 07:30:00，2024/09/06 17:30:00，，",
    "IS-11，AJ，ST7036i-0A-G2_A2030-0A-GE-6，34-P\u0026P_STEP，PROCESS,ABNOR，4.01，10，58，2024/09/06 07:30:00，2024/09/06 08:27:44，，@PROCESS，37.66，20，542，2024/09/06 08:27:44，2024/09/06 17:30:00，00AJ240900023，ST7036i-0A-G2_A2030-0A-GE-6",
    "IS-31，AJ，ST7789VI-G4_A2125-GN，34-P\u0026P_STEP，PROCESS,PROCESS，10.21，10，147，2024/09/06 07:30:00，2024/09/06 09:57:05，00AJ240900028，ST7789VI-G4_A2125-GN@LOSS-MEN，3.43，20，49，2024/09/06 09:57:05，2024/09/06 10:46:31，，@PROCESS，28.02，30，403，2024/09/06 10:46:31，2024/09/06 17:30:00，00AJ240900030，ST7789VI-G4_A2125-GN",
    "IS-32，AJ，ST7701SI-G7-P_E2143-GA-012，34-P\u0026P_STEP，PROCESS,PROCESS，41.67，10，600，2024/09/06 07:30:00，2024/09/06 17:30:00，00AJ240900047，ST7701SI-G7-P_E2143-GA-012",
    "IS-34，AJ，ST7701SI-G7-P_E2143-GA-012，34-P\u0026P_STEP，PROCESS,PROCESS，41.67，10，600，2024/09/06 07:30:00，2024/09/06 17:30:00，00AJ240900047，ST7701SI-G7-P_E2143-GA-012",
    "IS-36，BGG，RA167AA.GG0340_AUO，34-P\u0026P_STEP，PROCESS,PROCESS，5.04，10，73，2024/09/06 07:30:00，2024/09/06 08:42:34，0BGG240900091，RA167AA.GG0440_AUO@LOSS-MEN，0.34，20，5，2024/09/06 08:42:34，2024/09/06 08:47:24，，@PROCESS，12.02，30，173，2024/09/06 08:47:24，2024/09/06 11:40:27，0BGG240900053，RA167AA.GG0340_AUO@LOSS-MEN，0.02，40，0，2024/09/06 11:40:27，2024/09/06 11:40:42，，@PROCESS，0.02，50，0，2024/09/06 11:40:42，2024/09/06 11:41:03，0BGG240900054，RA167AA.GG0440_AUO@LOSS-MEN，0.01，60，0，2024/09/06 11:41:03，2024/09/06 11:41:13，，@PROCESS，0.02，70，0，2024/09/06 11:41:13，2024/09/06 11:41:27，0BGG240900055，RA167AA.GG0540_AUO@LOSS-MEN，0.14，80，2，2024/09/06 11:41:27，2024/09/06 11:43:31，，@PROCESS，24.06，90，346，2024/09/06 11:43:31，2024/09/06 17:30:00，0BGG240900121，RA167AA.GG0340_AUO",
    "IS-37，AJ，ST7789VI-G4_A2125-GN，34-P\u0026P_STEP，PROCESS,PROCESS，10.21，10，147，2024/09/06 07:30:00，2024/09/06 09:57:05，00AJ240900028，ST7789VI-G4_A2125-GN@LOSS-MEN，3.43，20，49，2024/09/06 09:57:05，2024/09/06 10:46:31，，@PROCESS，28.02，30，403，2024/09/06 10:46:31，2024/09/06 17:30:00，00AJ240900030，ST7789VI-G4_A2125-GN",
    "IS-39，AJ，ST7701SN-G5-1_E2143-GA-010，34-P\u0026P_STEP，PROCESS,PROCESS，9.93，10，143，2024/09/06 07:30:00，2024/09/06 09:53:03，00AJ240900002，ST7701SN-G5-1_E2143-GA-010@LOSS-MEN，0.08，20，1，2024/09/06 09:53:03，2024/09/06 09:54:13，，@PROCESS，21.39，30，308，2024/09/06 09:54:13，2024/09/06 15:02:13，00AJ240900034，ST7701SN-G5-1_E2143-GA-010@LOSS-MEN，0.05，40，1，2024/09/06 15:02:13，2024/09/06 15:02:57，，@PROCESS，10.21，50，147，2024/09/06 15:02:57，2024/09/06 17:30:00，00AJ240900035，ST7701SN-G5-1_E2143-GA-010",
    "IS-41，AJ，ST7701SN-G5-1_E2143-GA-010，34-P\u0026P_STEP，PROCESS,PROCESS，9.93，10，143，2024/09/06 07:30:00，2024/09/06 09:53:03，00AJ240900002，ST7701SN-G5-1_E2143-GA-010@LOSS-MEN，0.08，20，1，2024/09/06 09:53:03，2024/09/06 09:54:13，，@PROCESS，21.39，30，308，2024/09/06 09:54:13，2024/09/06 15:02:13，00AJ240900034，ST7701SN-G5-1_E2143-GA-010@LOSS-MEN，0.05，40，1，2024/09/06 15:02:13，2024/09/06 15:02:57，，@PROCESS，3.12，50，45，2024/09/06 15:02:57，2024/09/06 15:47:50，00AJ240900035，ST7701SN-G5-1_E2143-GA-010@ABNOR，0.54，60，8，2024/09/06 15:47:50，2024/09/06 15:55:40，，@PROCESS，6.55，70，94，2024/09/06 15:55:40，2024/09/06 17:30:00，00AJ240900035，ST7701SN-G5-1_E2143-GA-010",
    "IS-42，AJ，ST7701SN-G5-1_E2143-GA-010，34-P\u0026P_STEP，PROCESS,PROCESS，9.93，10，143，2024/09/06 07:30:00，2024/09/06 09:53:03，00AJ240900002，ST7701SN-G5-1_E2143-GA-010@LOSS-MEN，0.08，20，1，2024/09/06 09:53:03，2024/09/06 09:54:13，，@PROCESS，21.39，30，308，2024/09/06 09:54:13，2024/09/06 15:02:13，00AJ240900034，ST7701SN-G5-1_E2143-GA-010@LOSS-MEN，0.05，40，1，2024/09/06 15:02:13，2024/09/06 15:02:57，，@PROCESS，10.21，50，147，2024/09/06 15:02:57，2024/09/06 17:30:00，00AJ240900035，ST7701SN-G5-1_E2143-GA-010",
    "IS-43，BGG，RA136H1.G71E51_Sharp_SANSHIN_LH，34-P\u0026P_STEP，PROCESS,PROCESS，41.67，10，600，2024/09/06 07:30:00，2024/09/06 17:30:00，0BGG240900023，RA136H1.G71E51_Sharp_SANSHIN_LH",
    "IS-46，BGG，RA135F2.G71040_AUO，34-P\u0026P_STEP，PROCESS,PROCESS，1.08，10，16，2024/09/06 07:30:00，2024/09/06 07:45:33，0BGG240900104，RA135F2.G71040_AUO@LOSS-WIP，29.20，20，421，2024/09/06 07:45:33，2024/09/06 14:46:03，，@PROCESS，0.03，30，0，2024/09/06 14:46:03，2024/09/06 14:46:32，0BGG240900104，RA135F2.G71040_AUO@ABNOR，2.70，40，39，2024/09/06 14:46:32，2024/09/06 15:25:24，，@PROCESS，8.65，50，125，2024/09/06 15:25:24，2024/09/06 17:30:00，0BGG240900104，RA135F2.G71040_AUO",
    "IS-48，AJ，SC7283-G4-1_C2148-GW-002，34-P\u0026P_STEP，PROCESS,PROCESS，10.41，10，150，2024/09/06 07:30:00，2024/09/06 09:59:55，00AJ240900067，ST7272A-G4-1-TR0_C2148-GK1-012@LOSS-MEN，3.26，20，47，2024/09/06 09:59:55，2024/09/06 10:46:48，，@PROCESS，11.78，30，170，2024/09/06 10:46:48，2024/09/06 13:36:29，00AJ240900068，ST7272A-G4-1-TR0_C2148-GK1-012@LOSS-MEN，0.10，40，1，2024/09/06 13:36:29，2024/09/06 13:37:54，，@PROCESS，16.12，50，232，2024/09/06 13:37:54，2024/09/06 17:30:00，00AJ240900069，SC7283-G4-1_C2148-GW-002",
    "IS-49，AJ，ST7789T3-G4-1_E2142-GD-000，34-P\u0026P_STEP，PROCESS,PROCESS，41.67，10，600，2024/09/06 07:30:00，2024/09/06 17:30:00，00AJ240900071，ST7789T3-G4-1_E2142-GD-000",
    "IS-50，AJ，ST7789T3-G4-1_E2142-GD-000，34-P\u0026P_STEP，PROCESS,PROCESS，20.42，10，294，2024/09/06 07:30:00，2024/09/06 12:24:06，00AJ240900071，ST7789T3-G4-1_E2142-GD-000@ABNOR，2.84，20，41，2024/09/06 12:24:06，2024/09/06 13:04:58，，@PROCESS，18.41，30，265，2024/09/06 13:04:58，2024/09/06 17:30:00，00AJ240900071，ST7789T3-G4-1_E2142-GD-000",
    "IS-51，AJ，ST7775S-G4_A2102-GL-001，34-P\u0026P_STEP，PROCESS,PROCESS，0.97，10，14，2024/09/06 07:30:00，2024/09/06 07:44:01，00AJ240900015，ST7775S-G4_A2102-GL-001@ABNOR，3.00，20，43，2024/09/06 07:44:01，2024/09/06 08:27:16，，@PROCESS，37.69，30，543，2024/09/06 08:27:16，2024/09/06 17:30:00，00AJ240900015，ST7775S-G4_A2102-GL-001",
    "IS-52，AJ，ST7701SN-G5-1_E2143-GA-010，34-P\u0026P_STEP，PROCESS,PROCESS，11.24，10，162，2024/09/06 07:30:00，2024/09/06 10:11:52，00AJ240800574，ST7701SN-G5-1_E2143-GA-010@LOSS-MEN，0.11，20，2，2024/09/06 10:11:52，2024/09/06 10:13:30，，@PROCESS，0.53，30，8，2024/09/06 10:13:30，2024/09/06 10:21:05，00AJ240900034，ST7701SN-G5-1_E2143-GA-010@ABNOR，2.78，40，40，2024/09/06 10:21:05，2024/09/06 11:01:08，，@PROCESS，16.74，50，241，2024/09/06 11:01:08，2024/09/06 15:02:13，00AJ240900034，ST7701SN-G5-1_E2143-GA-010@LOSS-MEN，0.05，60，1，2024/09/06 15:02:13，2024/09/06 15:02:57，，@PROCESS，10.21，70，147，2024/09/06 15:02:57，2024/09/06 17:30:00，00AJ240900035，ST7701SN-G5-1_E2143-GA-010",
    "IS-53，AJ，ST7775S-G4_A2102-GL-001，34-P\u0026P_STEP，PROCESS,PROCESS，41.67，10，600，2024/09/06 07:30:00，2024/09/06 17:30:00，00AJ240900015，ST7775S-G4_A2102-GL-001",
    "IS-54，AJ，SC7283-G4-1_C2148-GW-002，34-P\u0026P_STEP，PROCESS,PROCESS，10.41，10，150，2024/09/06 07:30:00，2024/09/06 09:59:55，00AJ240900067，ST7272A-G4-1-TR0_C2148-GK1-012@LOSS-MEN，3.26，20，47，2024/09/06 09:59:55，2024/09/06 10:46:48，，@PROCESS，11.78，30，170，2024/09/06 10:46:48，2024/09/06 13:36:29，00AJ240900068，ST7272A-G4-1-TR0_C2148-GK1-012@LOSS-MEN，0.10，40，1，2024/09/06 13:36:29，2024/09/06 13:37:54，，@PROCESS，16.12，50，232，2024/09/06 13:37:54，2024/09/06 17:30:00，00AJ240900069，SC7283-G4-1_C2148-GW-002",
    "IS-60，AD，SRC8594B-003S，34-P\u0026P_STEP，PROCESS,SD-SETUP，8.42，10，121，2024/09/06 07:30:00，2024/09/06 09:31:14，，@PROCESS，33.25，20，479，2024/09/06 09:31:14，2024/09/06 17:30:00，00AD240800150，SRC8594B-003S",
    "IS-62，BEX，F83112A00QG15031_PA5412P，34-P\u0026P_STEP，PROCESS,PROCESS，1.01，10，14，2024/09/06 07:30:00，2024/09/06 07:44:29，0BEX240900001，F83112A00QG15031_PA5412P@ABNOR，3.32，20，48，2024/09/06 07:44:29，2024/09/06 08:32:19，，@PROCESS，7.71，30，111，2024/09/06 08:32:19，2024/09/06 10:23:18，0BEX240900001，F83112A00QG15031_PA5412P@LOSS-MEN，4.40，40，63，2024/09/06 10:23:18，2024/09/06 11:26:36，，@PROCESS，25.24，50，363，2024/09/06 11:26:36，2024/09/06 17:30:00，0BEX240900019，F83112A00QG15031_PA5412P",
    "IS-63，BEX，F83108B00PG17035_PA5488C_9U，34-P\u0026P_STEP，PROCESS,PROCESS，41.67，10，600，2024/09/06 07:30:00，2024/09/06 17:30:00，0BEX240800100，F83108B00PG17035_PA5488C_9U",
    "IS-65，BEX，F83102E00PG1703G_PA5472N_9U，34-P\u0026P_STEP，PROCESS,PROCESS，41.67，10，600，2024/09/06 07:30:00，2024/09/06 17:30:00，0BEX240900012，F83102E00PG1703G_PA5472N_9U",
    "IS-66，BGG，RA142BE.G56050_AUO，34-P\u0026P_STEP，PROCESS,PROCESS，8.61，10，124，2024/09/06 07:30:00，2024/09/06 09:33:57，0BGG240900120，RA142BH.G53080_AUO@LOSS-MEN，0.19，20，3，2024/09/06 09:33:57，2024/09/06 09:36:44，，@PROCESS，0.02，30，0，2024/09/06 09:36:44，2024/09/06 09:36:59，0BGG240900115，RA142BE.G54050_AUO@LOSS-WIP，0.02，40，0，2024/09/06 09:36:59，2024/09/06 09:37:13，，@PROCESS，0.02，50，0，2024/09/06 09:37:13，2024/09/06 09:37:27，0BGG240900116，RA142BE.G55050_AUO@LOSS-WIP，0.02，60，0，2024/09/06 09:37:27，2024/09/06 09:37:40，，@PROCESS，25.95，70，374，2024/09/06 09:37:40，2024/09/06 15:51:20，0BGG240900117，RA142BE.G56050_AUO@LOSS-MEN，0.38，80，6，2024/09/06 15:51:20，2024/09/06 15:56:51，，@PROCESS，0.05，90，1，2024/09/06 15:56:51，2024/09/06 15:57:35，0BGG240900125，RA142BL.G51050_AUO@LOSS-WIP，0.02，100，0，2024/09/06 15:57:35，2024/09/06 15:57:48，，@PROCESS，0.02，110，0，2024/09/06 15:57:48，2024/09/06 15:58:03，0BGG240900124，RA142BL.G50050_AUO@LOSS-WIP，0.02，120，0，2024/09/06 15:58:03，2024/09/06 15:58:16，，@PROCESS，3.46，130，50，2024/09/06 15:58:16，2024/09/06 16:48:08，0BGG240900126，RA142BL.G52050_AUO@LOSS-MEN，0.29，140，4，2024/09/06 16:48:08，2024/09/06 16:52:18，，@PROCESS，0.02，150，0，2024/09/06 16:52:18，2024/09/06 16:52:33，0BGG240900154，RA142BE.G54050_AUO@LOSS-WIP，0.02，160，0，2024/09/06 16:52:33，2024/09/06 16:52:47，，@PROCESS，0.02，170，0，2024/09/06 16:52:47，2024/09/06 16:53:01，0BGG240900155，RA142BE.G55050_AUO@LOSS-WIP，0.03，180，0，2024/09/06 16:53:01，2024/09/06 16:53:23，，@PROCESS，2.54，190，37，2024/09/06 16:53:23，2024/09/06 17:30:00，0BGG240900156，RA142BE.G56050_AUO",
    "IS-67，AJ，ST7701SN-G5-1_E2143-GA-010，34-P\u0026P_STEP，PROCESS,PROCESS，3.49，10，50，2024/09/06 07:30:00，2024/09/06 08:20:19，00AJ240900033，ST7701SN-G5-1_E2143-GA-010@LOSS-MEN，0.03，20，0，2024/09/06 08:20:19，2024/09/06 08:20:46，，@PROCESS，28.10，30，405，2024/09/06 08:20:46，2024/09/06 15:05:24，00AJ240900043，ST7701SN-G5-1_E2143-GA-010@ABNOR，1.48，40，21，2024/09/06 15:05:24，2024/09/06 15:26:43，，@PROCESS，4.91，50，71，2024/09/06 15:26:43，2024/09/06 16:37:25，00AJ240900043，ST7701SN-G5-1_E2143-GA-010@LOSS-MEN，0.59，60，8，2024/09/06 16:37:25，2024/09/06 16:45:52，，@PROCESS，3.06，70，44，2024/09/06 16:45:52，2024/09/06 17:30:00，00AJ240900062，ST7701SN-G5-1_E2143-GA-010",
    "IS-72，BEX，F83108B00PG17035_PA5488C_9U，34-P\u0026P_STEP，PROCESS,PROCESS，3.36，10，48，2024/09/06 07:30:00，2024/09/06 08:18:22，0BEX240800101，F83108B00PG17035_PA5488C_9U@ABNOR，1.03，20，15，2024/09/06 08:18:22，2024/09/06 08:33:12，，@PROCESS，2.57，30，37，2024/09/06 08:33:12，2024/09/06 09:10:14，0BEX240800101，F83108B00PG17035_PA5488C_9U@ABNOR，3.88，40，56，2024/09/06 09:10:14，2024/09/06 10:06:04，，@PROCESS，22.83，50，329，2024/09/06 10:06:04，2024/09/06 15:34:50，0BEX240800101，F83108B00PG17035_PA5488C_9U@LOSS-MEN，4.97，60，72，2024/09/06 15:34:50，2024/09/06 16:46:28，，@PROCESS，3.02，70，44，2024/09/06 16:46:28，2024/09/06 17:30:00，0BEX240800098，F83108B00PG17035_PA5488C_9U",
    "LG-001，BEX，F83108B00PG17035_PA5488C_9U，22A-LSG_STEP，PROCESS,PROCESS，18.36，10，264，2024/09/06 07:30:00，2024/09/06 11:54:22，0BEX240900007，F83102J00PG1704A@LOSS-MEN，0.15，20，2，2024/09/06 11:54:22，2024/09/06 11:56:31，，@PROCESS，9.48，30，137，2024/09/06 11:56:31，2024/09/06 14:13:05，0BEX240900009，F83102J00PG1704A@LOSS-MEN，0.54，40，8，2024/09/06 14:13:05，2024/09/06 14:20:54，，@PROCESS，3.97，50，57，2024/09/06 14:20:54，2024/09/06 15:18:04，00GM240900001，SM3281BE@LOSS-MEN，0.06，60，1，2024/09/06 15:18:04，2024/09/06 15:18:59，，@PROCESS，9.10，70，131，2024/09/06 15:18:59，2024/09/06 17:30:00，0BEX240800150，F83108B00PG17035_PA5488C_9U",
    "LG-002，BEX，F83108B00PG17035_PA5488C_9U，22A-LSG_STEP，PROCESS,PROCESS，14.71，10，212，2024/09/06 07:30:00，2024/09/06 11:01:48，0BEX240900008，F83102J00PG1704A@LOSS-MEN，0.13，20，2，2024/09/06 11:01:48，2024/09/06 11:03:37，，@PROCESS，16.32，30，235，2024/09/06 11:03:37，2024/09/06 14:58:38，0BEX240900010，F83102J00PG1704A@LOSS-MEN，0.02，40，0，2024/09/06 14:58:38，2024/09/06 14:58:52，，@PROCESS，10.50，50，151，2024/09/06 14:58:52，2024/09/06 17:30:00，0BEX240800151，F83108B00PG17035_PA5488C_9U",
    "TI-001，BGG，RA142BE.G55050_AUO，41-FVI_IN-TRAY AOI，PROCESS,LOSS-MEN，35.84，10，516，2024/09/06 07:30:00，2024/09/06 16:06:10，，@PROCESS，0.01，20，0，2024/09/06 16:06:10，2024/09/06 16:06:21，0BGG240900025，RA142BE.G55050_AUO@LOSS-MEN，3.65，30，53，2024/09/06 16:06:21，2024/09/06 16:58:54，，@PROCESS，2.16，40，31，2024/09/06 16:58:54，2024/09/06 17:30:00，0BGG240900116，RA142BE.G55050_AUO",
    "WG-004，BNI，A6055C-IRC700+BLK-75-25，12-GRIND_STEP，PROCESS,PROCESS，3.79，10，55，2024/09/06 07:30:00，2024/09/06 08:24:36，00AJ240900088，ST7701SI-G7-P_E2143-GA-012@PROCESS，4.46，20，64，2024/09/06 08:24:36，2024/09/06 09:28:46，00AJ240900088，ST7701SI-G7-P_E2143-GA-012@LOSS-MEN，0.42，30，6，2024/09/06 09:28:46，2024/09/06 09:34:46，，@SD-SETUP，2.19，40，32，2024/09/06 09:34:46，2024/09/06 10:06:19，，@PROCESS，0.02，50，0，2024/09/06 10:06:19，2024/09/06 10:06:32，0COG240900001，NSA2300-100um@PROCESS，9.15，60，132，2024/09/06 10:06:32，2024/09/06 12:18:16，0COG240900001，NSA2300-100um@LOSS-MEN，0.03，70，0，2024/09/06 12:18:16，2024/09/06 12:18:40，，@SD-SETUP，1.31，80，19，2024/09/06 12:18:40，2024/09/06 12:37:36，，@PROCESS，2.56，90，37，2024/09/06 12:37:36，2024/09/06 13:14:32，0BNI240900007，STK3311-BOLEB-X@LOSS-MEN，0.34，100，5，2024/09/06 13:14:32，2024/09/06 13:19:22，，@PROCESS，2.75，110，40，2024/09/06 13:19:22，2024/09/06 13:58:57，0CDP240900001，UCS11207CF1@LOSS-MEN，0.88，120，13，2024/09/06 13:58:57，2024/09/06 14:11:37，，@PROCESS，0.01，130，0，2024/09/06 14:11:37，2024/09/06 14:11:44，0BGG240900172，RA167A7.GC0040_AUO@PROCESS，2.31，140，33，2024/09/06 14:11:44，2024/09/06 14:44:56，0BGG240900169，RA167A7.GC0040_AUO@LOSS-MEN，0.06，150，1，2024/09/06 14:44:56，2024/09/06 14:45:47，，@SD-SETUP，1.67，160，24，2024/09/06 14:45:47，2024/09/06 15:09:54，，@PROCESS，0.01，170，0，2024/09/06 15:09:54，2024/09/06 15:10:06，0BNI240900005，A6027C-1-BLKONLY-200-25V@PROCESS，6.23，180，90，2024/09/06 15:10:06，2024/09/06 16:39:49，0BNI240900005，A6027C-1-BLKONLY-200-25V@LOSS-MEN，1.05，190，15，2024/09/06 16:39:49，2024/09/06 16:54:59，，@SD-SETUP，1.82，200，26，2024/09/06 16:54:59，2024/09/06 17:21:12，，@PROCESS，0.02，210，0，2024/09/06 17:21:12，2024/09/06 17:21:25，0BNI240900004，A6055C-IRC700+BLK-75-25@PROCESS，0.60，220，9，2024/09/06 17:21:25，2024/09/06 17:30:00，0BNI240900004，A6055C-IRC700+BLK-75-25",
    "WG-006，，，12-GRIND_STEP，LOSS-MEN,LOSS-MEN，4.08，10，59，2024/09/06 07:30:00，2024/09/06 08:28:46，，@SD-SETUP，2.38，20，34，2024/09/06 08:28:46，2024/09/06 09:03:01，，@PROCESS，0.00，30，0，2024/09/06 09:03:01，2024/09/06 09:03:01，00LS240900040，SUC86F8-077@PROCESS，2.33，40，34，2024/09/06 09:03:01，2024/09/06 09:36:38，00LS240900040，SUC86F8-077@LOSS-MEN，0.07，50，1，2024/09/06 09:36:38，2024/09/06 09:37:39，，@SD-SETUP，0.94，60，13，2024/09/06 09:37:39，2024/09/06 09:51:07，，@PROCESS，0.00，70，0，2024/09/06 09:51:07，2024/09/06 09:51:07，00LS240900041，H4909-001@PROCESS，7.04，80，101，2024/09/06 09:51:07，2024/09/06 11:32:26，00LS240900041，H4909-001@LOSS-MEN，0.45，90，6，2024/09/06 11:32:26，2024/09/06 11:38:53，，@PROCESS，0.00，100，0，2024/09/06 11:38:53，2024/09/06 11:38:53，00LS240900039，GCJ585-120@PROCESS，1.95，110，28，2024/09/06 11:38:53，2024/09/06 12:06:55，00LS240900039，GCJ585-120@LOSS-MEN，0.04，120，1，2024/09/06 12:06:55，2024/09/06 12:07:26，，@SD-SETUP，1.84，130，26，2024/09/06 12:07:26，2024/09/06 12:33:52，，@PROCESS，0.00，140，0，2024/09/06 12:33:52，2024/09/06 12:33:52，00AJ240900083，ST7789T3-G4-1_E2142-GD-012@PROCESS，5.56，150，80，2024/09/06 12:33:52，2024/09/06 13:53:59，00AJ240900083，ST7789T3-G4-1_E2142-GD-012@LOSS-MEN，0.12，160，2，2024/09/06 13:53:59，2024/09/06 13:55:41，，@PROCESS，0.00，170，0，2024/09/06 13:55:41，2024/09/06 13:55:41，00AJ240900090，ST7570-G4_A2078-GZ@PROCESS，4.23，180，61，2024/09/06 13:55:41，2024/09/06 14:56:38，00AJ240900090，ST7570-G4_A2078-GZ@LOSS-MEN，0.71，190，10，2024/09/06 14:56:38，2024/09/06 15:06:55，，@PROCESS，0.00，200，0，2024/09/06 15:06:55，2024/09/06 15:06:55，0BGG240900175，RA142BH.G52080_AUO@PROCESS，6.90，210，99，2024/09/06 15:06:55，2024/09/06 16:46:18，0BGG240900175，RA142BH.G52080_AUO@LOSS-MEN，3.03，220，44，2024/09/06 16:46:18，2024/09/06 17:30:00，，"
]
})
</script>
