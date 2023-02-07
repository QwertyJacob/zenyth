<template>
  <div ref="container" class="container hidden" :style="this.container">
    <div class="border" :style="this.border">
      <EnvelopeVisualizer ref="visualizer" :is_volume="true" @paramRefresh="handleRefresh" />
    </div>
  </div>
</template>

<script>
import { transcode } from "buffer";
import * as Tone from "tone";
import ToolsHost from "../Tools/ToolsHost.vue";
import EnvelopeVisualizer from "./EnvelopeVisualizer.vue";
export default {
  props: ["id"],
  components: {
    EnvelopeVisualizer
  },
  data() {
    return {
      tempEvent: null,
      type: "envelope",
      parameters: {
      },
      knobList: [],
      is_attack_down: false,
      is_decay_down: false,
      is_sustain_down: false,
      is_release_down: false,
    };
  },
  mounted() {
     this.parameters = {
      attack: 0.1,
      attackCurve: "linear",
      decay: 0.5,
      decayCurve: "linear",
      sustain: 0.5,
      releaseCurve: "linear",
      release: 1,
      scale: 1,
    }; 
    for (let i = 0; i < 9; i++) {
      this.knobList.push({ id: i, ref: "knob" + i });
    }
  },
  methods: {
    handleRefresh(parameters) {
      this.parameters = parameters
      this.synths.list.forEach((synth) => {
        synth.setModulatorParameters("envelope", "vol", this.parameters);
      });
    },
    handleNewOsc() {
      //called when a new osc is created to set default values
      this.synths.list.forEach((synth) => {
        synth.setModulatorParameters("envelope", "vol", this.parameters);
      })
    },
    unHide() {
      this.$refs.container.classList.remove("hidden");
    },
    hide() {
      this.$refs.container.classList.add("hidden");
    },
    handleMouseMove(e) {
      this.$refs.visualizer.handleMouseMove(e);
    },
    handleMouseUp(e) {
      this.$refs.visualizer.handleMouseUp(e);
    }
  },
  computed: {
    border() {
      return {
        background: '#f8e7e6',
        opacity: '100%'
      }
    },
    container() {
      return {
        background: this.colors.pink.medium
      }
    }
  }
};
</script>

<style scoped>
.border {
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;

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
  position: relative;
  display: grid;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
}

.hidden {
  display: none;
}
</style>