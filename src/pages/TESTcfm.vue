<template>
    <div class="h-[50px] w-full"></div>
    <div class="w-full px-4">
      <h4 class="text-h4 mt-5 mb-2.5">Equipment CFM</h4>
      <div class="flex flex-row gap-x-2">
        <q-btn unelevated color="primary" label="匯出" class="rounded-[0.25rem] px-3 py-1" @click="downloadExcel" />

      </div>

    </div>
</template>
<script setup lang="ts">
  import {ref, reactive, watch, onMounted} from 'vue'
  import Konva from 'konva'
  import $ from 'jquery'

  const url = window.location.origin + window.location.pathname + "/../HomePageSearch";
  const cust = $("#TEST_CFM_CUST").text() as string;

  const isLoading = ref(false);

  const layer = reactive<Konva.Layer>(
    new Konva.Layer({
      x:0,
      y:0,
      draggable:false,
    })
  );

  const sFactory = ref("科技");
  const sFloor = ref("1F");
  const sClient = ref([""]);
  const sCategory = ref("機台");
  const sEqp = ref("");
  const sEqpType = ref("");
  const sModel = ref("");
  const sOCR = ref("");
  const sProduct = ref("");
  const sPack = ref("");
  const sImpEqp = ref("");
</script>
