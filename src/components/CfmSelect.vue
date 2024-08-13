<script setup lang="ts">
import { ref } from 'vue'
import { Option } from './models'

interface Props {
  defaultValue:Option;
  id:string;
  label:string;
  options:Option[];
  multiple:boolean;
}
const props = defineProps<Props>()

const emit = defineEmits(["pick"]);

const selectedOption = ref(props.defaultValue);

const updateValue = function(option:Option) {
  selectedOption.value = option;
  emit('pick', option);
}

</script>

<template>
  <div class="flex flex-row w-fit items-center gap-x-2">
    <label :for="props.id" class="px-1">{{props.label}}</label>
    <q-select
      :for="props.id" 
      :options="props.options"
      :model-value="selectedOption"
      @update:model-value="updateValue"
      :multiple="props.multiple">
    </q-select>
  </div>
</template>
