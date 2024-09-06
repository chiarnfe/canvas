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
] 
})
</script>
