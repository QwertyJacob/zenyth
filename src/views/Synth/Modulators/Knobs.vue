<template>
  <div class="knobs">
    <div v-for="knob in knobList" :key="knob.id" :ref="knob.ref" class="knob" @mousedown="mouseDown(knob.id)">
      <div class="knob_fader_background"></div>
      <div v-if="knob.isOn===true" class="knob_fader" :style="computedFaderStyle(knob.id)"></div>
    </div>
  </div>
</template>

<script>
import { isProxy, toRaw } from 'vue';
export default {
  props: ["type", "id", "parameters"],
  name: "Knobs",
  data() {
    return {
      knobList: [],
      freeKnobs: this.nKnobs,
      isMouseDown: false,
      selectedKnobId: "",
    }
  },
  mounted() {
    for (let i = 0; i < this.nKnobs; i++) {
      this.knobList.push({id: i, ref: "knob" + i, isOn:false, amount: 0, object: null, target: null});
    }

    //Set available state (isDraggable)
    this.isDraggable[this.type][this.id] = true

  },
  methods: {
    updateParameters(parameters=this.parameters){
     // console.log("UPDATING PARAMETERS", parameters)
      for(let i=0; i<this.nKnobs; i++){
        if(this.knobList[i].isOn) {
          this.knobList[i].object.setModulatorParameters(this.type, this.knobList[i].target, parameters)
          break
        }
      }
    },

    knobText(id){
      if(this.knobList[id].isOn===true){
        return this.knobList[id].amount
      }else{
        return "yo"
      }
    },

    addLink(object, target, color, parameters=this.parameters){
      for(let i=0; i<this.nKnobs; i++){
        if(!this.knobList[i].isOn) {
          this.knobList[i].color = color
          this.knobList[i].isOn = true;
          this.knobList[i].amount= 0.5;
          this.knobList[i].object = object
          this.knobList[i].target = target
          this.freeKnobs -= 1;

          //set modulator amount at object
          console.log("ADDING LINK")
          console.log(parameters)
          object.setModulatorParameters(this.type, target, parameters)
          object.setModulatorAmount(this.type, target, this.knobList[i].amount)
          break;
        }
      }
      if (this.freeKnobs === 0) this.isDraggable[this.type][this.id] = false
      this.$emit("isDraggableUpdate", this.isDraggable)
      //todo: event to set isDraggable inside modSelector NOT WORKING
    },

    removeLink(object, target){
      //console.log("REMOVING LINK TO"+target)
      //console.log(object)

      this.knobList.forEach((knob) => {
        knob.amount = knob.amount+0.01
        knob.amount = knob.amount-0.01
        knob = toRaw(knob)
        if (knob.object === object && knob.target === target) {
          knob.object.setModulatorAmount(this.type, target, 0)
          //remove info from knob
          knob.amount = 0
          knob.isOn = false
          knob.object = null
          knob.target = null
        }
      })
      this.freeKnobs++;
      this.isDraggable[this.type][this.id] = true
    },

    handleMouseMove(e) {

      if(this.isMouseDown &&  this.knobList[this.selectedKnobId].isOn){
        this.knobList[this.selectedKnobId].amount = this.knobList[this.selectedKnobId].amount - Math.floor(e.movementY) / 100;
        this.knobList[this.selectedKnobId].amount = Math.max(this.knobList[this.selectedKnobId].amount, 0)
        this.knobList[this.selectedKnobId].amount = Math.min(this.knobList[this.selectedKnobId].amount, 1)
        this.knobList[this.selectedKnobId].object.setModulatorAmount(this.type, this.knobList[this.selectedKnobId].target, this.knobList[this.selectedKnobId].amount)

      }

    },

    mouseDown(knobId){
      this.isMouseDown = true;
      this.selectedKnobId = knobId;
    },

    computedFaderStyle(id) {
      let rawKnobAmount = this.knobList[id].amount
        return {
          backgroundColor: this.knobList[id].color,
          height: (rawKnobAmount * 100).toString() + "%"
        }
    },

    handleMouseUp() {
      this.isMouseDown = false;
    },
  },
  computed: {
  }
}
</script>

<style scoped>
.knobs {
  margin: 2%;
  border-radius: 0.3vw;
  box-sizing: border-box;
  position: relative;
  display: grid;
  grid-template-rows: repeat(3, 1fr);
  column-gap: 1vw;
  row-gap: 1vw;
  grid-template-columns: repeat(3, 1fr);
  align-content: center;
  justify-content: center;
  align-items: stretch;
  justify-items: center;
  padding: 4%;
  border: 0.06vw solid black;
}

.knob {
  aspect-ratio: 1/1;
  clip-path: circle(50%);
  position: relative;
  vertical-align: bottom;
  background-color: whitesmoke;
  display: grid;
}

.knob_fader {
  position: absolute;
  height: 0%;
  box-sizing: border-box;
  align-self: end;
  width: 100%;
  background-color: transparent;
  border-bottom-left-radius: 0.4vw;
  border-bottom-right-radius: 0.4vw;
  background-clip: content-box;
  padding: 0.1vw;
  z-index: 101;
}

.knob_fader_background {
  clip-path: circle(50%);
  box-sizing: border-box;
  aspect-ratio: 1/1;
  height: 100%;
  background-color: transparent;
  border: 0.1vw solid black;
  border-radius: 50%;
  z-index: 102;
}
</style>