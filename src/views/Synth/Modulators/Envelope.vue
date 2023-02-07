<template>
  <div ref="container" class="container hidden" :style="this.container">
    <div class="border" :style="this.border">
      <EnvelopeVisualizer ref="visualizer" :is_volume="false" @paramRefresh="handleRefresh"/>
      <Knobs ref="knobs" type="envelope" :id="this.id" :parameters="this.parameters"
             @isDraggableUpdate="handleDraggableUpdate"/>
      <div> </div>
    </div>
  </div>
</template>

<script>
import {transcode} from "buffer";
import * as Tone from "tone";
import ToolsHost from "../Tools/ToolsHost.vue";
import Knobs from "./Knobs.vue";
import VolEnvelope from "@/views/Synth/Modulators/VolEnvelope.vue";
import Lfo from "@/views/Synth/Modulators/Lfo.vue";
import ModSelector from "@/views/Synth/Modulators/ModSelector.vue";
import EnvelopeVisualizer from "./EnvelopeVisualizer.vue";

export default {
  components: {
    EnvelopeVisualizer, Knobs,
  },
  props: ["id"],
  data() {
    return {
      parameters: {
        attack: 0.01 * 2.5,
        attackCurve: "linear",
        decay: 0.1 * 2.5,
        decayCurve: "linear",
        releaseCurve: "linear",
        release: 0.1 * 2.5,
        sustain: 0.5,
      },

    }
  },
  methods: {
    //UPDATE PARAMS CHANGED IN ENVELOPE VISUALIZER
    handleRefresh(parameters) {
      this.parameters = parameters
      this.$refs.knobs.updateParameters(this.parameters)
    },
    //-------------METHODS TO LINK WHEN DROPPING
    link(object, target, color) {
      //console.log("THINGS HAPPENING "+section+" "+target)
      this.$refs.knobs.addLink(object, target, color)

    },
    unLink(object, target) {
      //console.log("THINGS HAPPENING ")
      //console.log(object)
      //console.log(target)
      this.$refs.knobs.removeLink(object, target)
    },
    handleDraggableUpdate(isDraggable) {
      this.$emit("isDraggableUpdate", isDraggable)
    },
    //--------------METHODS TO SHOW/HIDE------------
    unHide() {
      this.$refs.container.classList.remove("hidden");
    },
    hide() {
      this.$refs.container.classList.add("hidden");
    },
    //----------------------------------------------
    handleMouseMove(e) {
      this.$refs.visualizer.handleMouseMove(e);
      this.$refs.knobs.handleMouseMove(e);
    },
    handleMouseUp(e) {
      this.$refs.visualizer.handleMouseUp(e);
      this.$refs.knobs.handleMouseUp(e);
    }
  },
  computed: {
    border(){
      return{
        background: '#ceeae7'
      }
    },
    container(){
      return{
        background: this.colors.azure.medium
      }
    }
  }
};
</script>

<style scoped>
.border {
  grid-template-columns: calc(6 / 8 * 100%) calc(2 / 8 * 100%);
  grid-template-rows: 100% ;

  position: relative;
  display: grid;
  width: calc(100% - 0.6vw);
  height: calc(100% - 0.6vw);
  box-sizing: border-box;
  margin: 0.3vw;
  border-radius: 0.2vw;
  border: 0.1vw solid #334030;
}

.container {
  grid-column: span 2;
  width: 100%;
  height: 100%;
}

.hidden {
  display: none;
}

.envelope {
  width: 100%;
  height: 100%;
  background-color: transparent;
  box-sizing: border-box;
}

.centering {
  position: relative;
  width: 100%;
  height: 100%;
}
</style>