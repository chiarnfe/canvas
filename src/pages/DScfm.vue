<template>
<div class="h-[50px] w-full bg-gray-500/20"></div>
<div class="w-full px-4">
<h4 class="text-h4 mt-5 mb-2.5">Equipment CFM</h4>
<div class="flex flex-row gap-x-2">
    <q-btn unelevated label="匯出" class="rounded-[0.25rem] px-3 py-1" style="border:1px solid #aaa" />
    <q-btn unelevated label="搜尋" class="rounded-md px-3 py-1" style="border:1px solid #aaa" />
</div>
<q-dialog v-model="isLoading" backdrop-filter="blur(4px)"></q-dialog>
</div>
</template>
<script setup lang="ts">
import {ref, reactive, onMounted, onBeforeUnmount} from 'vue';
import axios from 'axios';
import Konva from 'konva';
import $ from 'jquery';
const isLoading = ref(false);
const width = ref(1800);
const height = ref(1200);
const factoryOptions = ["科技", "創新", "力行"].map(f => ({value:f, label:f}));
const floorOptions = ref(["1F", "2F", "3F", "7F"].map(f => ({value:f, label:f})));


const sFactory = ref("科技");
const sFloor = ref("1F");
const sClient = ref("");
const sEqp = ref("");
const sEqpType = ref("");
const sModel = ref("");



const loadMap = async () => {
  const payload = {
    BU: "",
    NumberPerAPage: -1,
    PageName: "DS_CFM_MAP",
    PageNumber: -1,
    QueryArr:[sFactory.value, sFloor.value, sClient.value, sEqp.value, sEqpType.value, sModel.value]
  }
  const res = await axios.post(window.location.origin + window.location.pathname + "/../HomePageSearch", payload);
  console.log(res)
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
  console.log(res);
}

onMounted(() => {
  loadMap();
})
</script>
