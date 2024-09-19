<template>
<div class="flex flex-row h-[50px] relative navbar-container pl-4">
  <div class="w-6 h-[50px] absolute left-0"></div>
  <q-btn unelevated square class="w-24" type="a" :href="home" :ripple="false">
    <span class="capitalize" style="fontSize:18px">Home</span>
  </q-btn>
  <q-btn unelevated square class="w-24" type="a" :href="back" :ripple="false">
    <span class="capitalize" style="fontSize:18px">Back</span>
  </q-btn>
  <q-btn unelevated square class="capitalize hover:font-bold" v-for="item in menu" style="font-family:'Arial','DFKai-sb'">
    <div class="">{{item.MenuName}}</div>
    <q-icon name="arrow_drop_down" />
    <q-menu square anchor="bottom left">
      <q-list dense v-for="child in item.Child">
        <q-item clickable v-if="child.Child">
          <q-item-section>{{child.MenuName}}</q-item-section>
          <q-item-section side>
            <q-icon name="keyboard_double_arrow_right" />
          </q-item-section>
          <q-menu square anchor="top end" self="top start" :offset="[2,0]" v-if="child.Child.length">
            <q-list dense v-for="gChild in child.Child">
              <q-item clickable :href="gChild.CanUse ? gChild.URL : home" target="_blank">
                <q-item-section>
                  {{gChild.MenuName}}
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-item>
        <q-item clickable v-else :href="child.CanUse ? child.URL : home" target="_blank"> 
          <q-item-section>{{child.MenuName}}</q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </q-btn>
  <div class="w-[216px] h-[50px] absolute right-0"></div>
</div>
</template>
<style scoped lang="scss">
.navbar-container {
  background-color:rgb(223,224,226);
  background-repeat:no-repeat;
  background-image:url("../assets/YTEC_BOTTOM.png");
  > div:first-child {
    background-image:url("../assets/YTEC_ICON_v2.png");
    background-repeat:no-repeat;
  }
  > div:last-child {
    background-image:url("../assets/YTEC_TITLE_S-removebg-preview.png");
    background-image:no-repeat;
  }
}

</style>
<script setup lang="ts">
import {reactive, onMounted} from 'vue'
import $ from 'jquery'
const home = window.location.origin + "/HomePage/Default/Index"
const back = window.location.origin + "/Yield/Home/Index"
let menu = reactive([])

const getMenu = () => {
  $.ajax({
    type:"POST",
    url:window.location.origin + window.location.pathname + "/../../Home/GetMenu2",
    data:"1",
    success: res => {
      res.forEach(row => row.forEach(child => menu.push(child)))
    }
  })
}

onMounted(() => {
  getMenu()
})
</script>
