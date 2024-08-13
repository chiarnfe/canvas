<script setup lang="ts">
  import {ref} from 'vue'
  import $ from 'jquery'
  import CfmSelect from '../components/CfmSelect.vue'
  import CfmCanvas from '../components/CfmCanvas.vue'
  import axios from 'axios'
  import shadow from 'vue-shadow-dom'
  const factory = ["科技", "創新", "力行"].map(l => ({label:l, value:l}));
  const floor = ["1F", "2F", "3F", "7F"].map(f => ({label:f, value:f}));
  const cust = ["AC", "AD", "AF"].map(ct =>　({label:ct, value:ct}));

  const selectedFactory = ref("科技");
  const selectedFloor = ref("1F");
  const selectedCust = ref("");
  const selectedEq = ref("");
  const selectedEqType = ref("");
  const selectedCategory = ref("");
  const dsStatus = ref([]);
  const pickFactory = function(val:string) {
    selectedFactory.value = val;
  }
  const pickFloor = function(val:string) {
    selectedFloor.value = val;
  }

  const pickCust = function(val:string) {
    selectedCust.value = val;
  }

  const getCFMData = async function() {
    const query = {
      BU:"",
      NumberPerAPage: -1,
      PageName:"DS_CFM_MAP_NUM",
      PageNumber:-1,
      QueryArr:[selectedFactory.value, selectedFloor.value, selectedCust.value, selectedEq.value, selectedEqType.value, selectedCategory.value]
    }
    const buffer = [];
    const res = await axios({
      url:"http:\//localhost:60135/Home/HomePageSearch",
      method:"post",
      headers:{
        'Content-Type':'application/x-www-form-urlencoded',
      },
      data:JSON.stringify(query),
    });
    if (res.status == 200) {
      let buffer = [];
      res.data.forEach((row,i) => {
        row.split(",").forEach((cell,j) => {
          if (i == 0)
            buffer.push([cell])
          else
            buffer[j].push(cell.replaceAll(/，/g,","))
        })
      });
      dsStatus.value = buffer;
    }
  }

  const getCFMStatus = async function(){
    const res = await axios.get("http://localhost:3000/DS_CFM_MAP_NUM");
    if (res.status == 200) {
    }
  }
  getCFMData();
  $("#app").addClass("h-screen").addClass("flex").addClass("flex-col").addClass("flex-grow")
</script>

<template>
  <div class="p-5">
    <h3 class="text-h4">Equipment</h3>
    <div class="flex flex-row gap-x-2">
      <CfmSelect 
        :options="factory" 
        :defaultValue="selectedFactory" 
        @pick="pickFactory"
        id="factory"
        label="廠區"
        :multiple="false"
      />
      <CfmSelect
        :options="floor"
        :defaultValue="selectedFloor"
        @pick="pickFloor"
        id="floor"
        label="樓層"
        :multiple="false"
      />
      <CfmSelect
        :options="cust"
        :defaultValue="selectedCust"
        @pick="pickCust"
        id="customer"
        label="客戶"
        :multiple="false"
      />
      <q-btn flat outline size="md" color="red"  @click="getCFMData">搜尋</q-btn>
    </div>
  </div>
  <q-separator inset />
    <div class="flex flex-row flex-grow">
      <div class="column">
        <div class="px-2" v-for="(row, i) in dsStatus">
          <q-btn style="width:100%">
            {{row[0]}}
            <span :style="{backgroundColor:row[3],width:'16px',height:'16px'}"></span>
            {{row[2]}}
          </q-btn>
        </div>
      </div>
      <q-btn></q-btn>
      <div>
        <CfmCanvas  :width="600" :height="400" />
      </div>
    </div>
</template>
