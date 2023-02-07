<template>
  <div class="buttonList" :style="this.buttonList">
    <div class="identifierVol" :style="buttonColor('mainEnv')" @click="handleClick(null, 'volEnvelope')">
      <img src="@/icons/ADSR.svg" alt="" draggable="false">
    </div>
    <template v-for="button in buttonListEnv" :key="button.id" :ref="button.ref">
      <div class="button" :style="buttonColor('envelope')">
        <div :style="textId"> {{ button.id }} </div>
        <div class="identifier" @click="handleClick(button.id, button.type)">

          <img src="@/icons/ADSR.svg" alt="" draggable="false">
        </div>
        <div class="draggableArea" :draggable="draggability('envelope', button.id)"
          @dragstart="startDrag($event, button.id, button.type)">ϟ
        </div>
      </div>
    </template>
    <template v-for="button in buttonListLfo" :key="button.id" :ref="button.ref">
      <div class="button" :style="buttonColor('lfo')">
        <div :style="textId"> {{ button.id }} </div>
        <div class="identifier" @click="handleClick(button.id, button.type)"><!-- {{ button.id }} -->

          <img src="@/icons/LFO.svg" alt="" draggable="false">
        </div>
        <div class="draggableArea" :draggable="draggability('lfo', button.id)"
          @dragstart="startDrag($event, button.id, button.type)">ϟ
        </div>
      </div>
    </template>
  </div>

</template>

<script>
import * as Tone from "tone";
import { watch } from 'vue';

export default {
  inject: ['dropFeedback'],
  props: [],
  data() {
    return {
      color: {
        mainEnv: this.colors.pink.glow,
        envelope: this.colors.azure.glow,
        lfo: this.colors.purple.glow,
      },
      type: "volEnvelope",

      isDraggable: this.isDraggable,
      buttonListEnv: [],
      buttonListLfo: [],
    };
  },
  mounted() {
    for (let i = 1; i < this.nEnvelopes + 1; i++) {
      this.buttonListEnv.push({ id: i, ref: "button" + i, type: "envelope" });
    }
    for (let i = 1; i < this.nLfo + 1; i++) {
      this.buttonListLfo.push({ id: i, ref: "button" + i, type: "lfo" });
    }
    //console.log(this.isDraggable)


    //console.log(this.buttonListEnv)
    //console.log(this.buttonListLfo)

    /*
    this.$on("unLink", (data) => {
          console.log("ModSelector disconnecting link from "+data.modulator.type+" "+data.modulator.id+" to "+data.section+data.target)})

     */

  },
  computed: {
    textId(){
      return {
        fontWeight: "bold",
        opacity: "80%",
        position: 'absolute',
        fontSize:'.8vw'
      }
    },
    buttonList() {
      switch (this.type) {
        case "volEnvelope":
          return{
            backgroundColor: this.colors.pink.medium
          }
          case "envelope":
          return{
            backgroundColor: this.colors.azure.medium
          }
          case "lfo":
          return{
            backgroundColor: this.colors.purple.glow
          }
      }
      
    } 

  },
  methods: {
    draggability(type, id) {
      //console.log(this.isDraggable)
      //console.log("checking draggability of " + type + " " + id)
      return this.isDraggable[type][id]
    },
    isDraggableUpdate(isDraggable) {
      //console.log("UPDATE ISDRAGGABLE")
      //console.log(this.isDraggable)
      this.isDraggable = isDraggable
    },
    buttonColor(type) {
      return {
        backgroundColor: this.color[type]
      }
    },

    startDrag(event, id, type) {
      //console.log("dragging " + type + " " + id)
      event.dataTransfer.dropEffect = "move"
      event.dataTransfer.effectAllowed = "move"
      let data = { type: type, id: id, color: this.color[type] }
      event.dataTransfer.setData("data", JSON.stringify(data));
      //console.log(data)
    },
    handleClick(id, type) {
      this.type = type
      if (type === "volEnvelope") {
        //console.log("Selected " + id)
        this.$emit("selection", type, null);
      } else {
        //console.log("Selected " + type + " " + id)
        this.$emit("selection", id, type);
      }
    },
  },
};
</script>

<style scoped>
.button {
  display: grid;
  grid-template-columns: 80% 18%;
  flex: 1;
  width: 100%;
  height: 100%;
  border: 0.06vw solid black; 
  border-radius: 0.2vw;
  padding: 1%;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  align-content: center;
  justify-items: stretch;

}

.buttonList {
  padding-left: 0.3vw;
  padding-right:  0.3vw;
  padding-bottom: 0.3vw;
  position: relative;
  grid-row: 2;
  display: flex;
  flex-basis: column;
  align-items: center;
  justify-content: center;
}

.identifier {
  height: 100%;
  justify-content: center;
  align-items: center;
  /* border: 0.1vw solid black; */
  display: flex;

}

.identifierVol {
  border: 0.06vw solid black; 
  border-radius: 0.2vw;
  flex: 1;
  box-sizing: border-box;
  display: flex;
  height: 100%;
  justify-content: center;
  align-items: center;
}

.draggableArea {
  border-radius: 50%;
  display: flex;
  border: 0.1vw solid black;
  box-sizing: border-box;
  position: relative;
  width: 100%;
  aspect-ratio: 1/1;
  font-size: .9vw;
  align-items: flex-end;
  justify-content: center;
}.draggableArea:hover {
  opacity: 40%;
}
.identifier img {
  position: relative;
  opacity: 60%;
  width: 4vw;
  aspect-ratio: 1/1;
}
.identifierVol img {
  position: relative;
  opacity: 60%;
  width: 4vw;
  aspect-ratio: 1/1;
}
.identifier img:hover {
  opacity: 40%;
}
.identifierVol img:hover {
  opacity: 40%;
}
</style>