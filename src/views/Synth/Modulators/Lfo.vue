<template>
  <div ref="container" class="container hidden" :style="this.container">
    <div class="border" :style="this.border">
      <div class="lfo_elems_row" :style="this.lfo_elems_row">
        <!-- MODULATION AMOUNT: REGULATES THE AMPLITUDE OF THE LFO !!!!! broken !!!!!!
      <div class="lfoFaderBase volFaderBase" @mousedown="isDepthFaderDown=true">
        <div class="lfoDepthFaderLevel" :style="this.lfoDepthFaderLevel"></div>
      </div> -->
      <LfoVisualizer ref="visualizer" :freq="this.freq" :depth="this.depth" :wave="this.waveform"></LfoVisualizer>
      <div class="lfo_controls_column" >
        <div class="lfoFaderBase freqFader" :style="this.lfoFaderBase" @mousedown="isFreqFaderDown=true">
          <div class="lfoFreqFaderLevel" :style="this.lfoFreqFaderLevel"></div>
        </div>
        <div class="lfo_waveform-btn-selector" :style="lfo_waveform_btn_selector" @click="nextWaveType">
          <img v-if="this.waveform==='sine'" class="lfo_waveform_btn_icon" src="@/icons/sine.svg" alt="" draggable="false">
          <img v-if="this.waveform==='triangle'" class="lfo_waveform_btn_icon" src="@/icons/triangle.svg" alt="" draggable="false">
          <img v-if="this.waveform==='square'" class="lfo_waveform_btn_icon" src="@/icons/square.svg" alt="" draggable="false">
          <img v-if="this.waveform==='sawtooth'" class="lfo_waveform_btn_icon" src="@/icons/saw.svg" alt="" draggable="false">

        </div>
      </div>
    </div>

    <Knobs ref="knobs" type="lfo" :id="this.id" :parameters="this.parameters"/>
  </div>
  </div>
</template>

<script>
import LfoVisualizer from "@/views/Synth/Modulators/LfoVisualizer";
import * as Tone from "tone";
import Knobs from "./Knobs.vue";
import { toRaw } from "vue";

const waveforms = ['sine', 'triangle', 'square', 'sawtooth']
export default {
  components: { LfoVisualizer, Knobs },
  props: ["id"],

  data() {
    return {
      freq: 10,
      depth: 0.8,
      isDepthFaderDown: false,
      isFreqFaderDown: false,
      waveform: waveforms[0],
      waveformId: 0,
      parameters: {}

    }
  },

  mounted() {
    //document.addEventListener("mousemove", this.onMouseMove); // todo: remove this
    //console.log("mounted - this.waveformId: " + this.waveformId + " - this.waveform: " + this.waveform)

    this.parameters = {
      frequency: this.freq,
      waveform: this.waveform
    }
  },

  computed: {
    lfoDepthFaderLevel() {
      //console.log("lfoDepthFaderLevel")
      return {
        top: ((1 - this.depth) * 85).toString() + "%"
      }
    },
    lfo_elems_row() {
      return {
        background: this.colors.purple.medium
      }
    },
    lfoFaderBase() {
      return {
        background: this.colors.purple.glow
      }
    },
    lfoFreqFaderLevel() {
      return {
        top: ((20 - this.freq) / 20 * 85).toString() + "%",
        background: this.colors.purple.light,
        borderColor: this.colors.purple.dark
      }
    },
    lfo_waveform_btn_selector() {
      return {
        borderColor: this.colors.purple.dark,
        background: this.colors.purple.light,
        color: this.colors.gray.dark
      }
    },
    container(){
      return {
        background: this.colors.purple.glow
      }
    },
    border(){
      return{
        background: this.colors.purple.glow
      }
    }
  },

  methods: {
    setParams({ freq = this.freq, depth = this.depth, waveform = this.waveform}) {
      if (freq <= 20) {
        this.freq = freq;
      } else {
        this.freq = 20
      }
      if(typeof waveform === 'number') {
        this.waveformId = waveform;
        if(this.waveformId === 0 || this.waveformId === 1) {
          this.waveform = waveforms[this.waveformId]
        } else {
          console.log("ERROR: Called Non existing lfo wave type Id")
        }
      } else if(typeof waveform === 'string'){
        this.waveform = waveform;
        waveforms.forEach( (waveformNameString, index) => {
          if(waveformNameString === this.waveform) this.waveformId = index;
        })
      }
      this.parameters.waveform = this.waveform;
      this.depth = depth;
      this.$refs.visualizer.updateParams({freq: this.freq, depth: this.depth})
      this.$refs.knobs.updateParameters(this.parameters)

    },

    nextWaveType(){
      this.waveformId++;
      if(this.waveformId > waveforms.length-1) this.waveformId = 0;
      this.waveform = waveforms[this.waveformId]
      this.parameters.waveform = this.waveform;
      // console.log("nextWaveType - this.waveformId: " + this.waveformId + " - this.waveform: " + this.waveform)


      //console.log("CHANGING WAVE TYPE TO: " + this.waveform)
      this.$refs.knobs.updateParameters(this.parameters)
      this.$refs.visualizer.updateParams({ waveform: this.waveform, frequency: this.freq })
    },

    startOscilloscope() {
      //console.log("start LFO graphics")
      this.$refs.visualizer.startOscilloscope();
    },
    stopOscilloscope() {
      //console.log("stop LFO graphics")
      this.$refs.visualizer.stopOscilloscope();
    },
    resetOscilloscope() {
      this.$refs.visualizer.stopOscilloscope();
      this.$refs.visualizer.startOscilloscope();

    },
    // ---------- USER GESTURE ----------

    depthFaderSelected() {
      //console.log("depthFaderSelected")
      this.isDepthFaderDown = true;
    },
    freqFaderSelected() {
      //console.log("freqFaderSelected")
      this.isFreqFaderDown = true;
    },

    handleMouseMove(event) {
      //console.log("lfo - handleMouseMove")
     this.$refs.knobs.handleMouseMove(event)
      if (this.isDepthFaderDown) {
        if (event.movementY < 0) {
          // Mouse is moving dowm
          this.depth = this.depth - event.movementY / 100;
          //console.log("moving up");
        } else {
          // Mouse is moving up
          this.depth = this.depth - event.movementY / 100;
          //console.log("moving down");
        }
        this.depth = Math.max(this.depth, 0);
        this.depth = Math.min(this.depth, 1);

        //console.log("lfo depth: " + this.depth)
        this.$refs.visualizer.updateParams({depth: this.depth})
      }
      if (this.isFreqFaderDown) {
        if (event.movementY < 0) {
          // Mouse is moving dowm
          this.freq = this.freq - 20 * (event.movementY / 100);
          //console.log("moving up");
        } else {
          // Mouse is moving up
          this.freq = this.freq - 20 * (event.movementY / 100);
        }
        this.freq = Math.max(this.freq, 1);
        this.freq = Math.min(this.freq, 20);

        //console.log("lfo freq: " + this.freq)
        this.parameters.frequency = this.freq
        this.$refs.visualizer.updateParams({freq: this.freq})
        this.$refs.knobs.updateParameters(this.parameters)
      }
    },
    handleMouseUp() {
      if (this.isFreqFaderDown) this.isFreqFaderDown = false
      if (this.isDepthFaderDown) this.isDepthFaderDown = false

      this.$refs.knobs.handleMouseUp()
    },

    unHide() {
      this.$refs.container.classList.remove("hidden");
      this.startOscilloscope()
    },
    hide() {
      this.$refs.container.classList.add("hidden");
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
  }
}
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

.lfo_elems_row {
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: row;
  height: 100%;
  align-items: center;
  justify-items: center;
  justify-content: center;
}

.lfoFaderBase {
  position: absolute;
  top: 5%;
  left: 30%;
  aspect-ratio: 1/10;
  border-radius: 5vw;
  height: 70%;
}

.lfoDepthFaderLevel {
  position: relative;
  width: 100%;
  border-radius: 5vw;
  height: 15%;
  background-color: white;
  top: 80%
}

.lfoFreqFaderLevel {
  position: relative;
  width: 100%;
  height: 20%;
  border-width: 1px;
  border-style: solid;
  border-radius: 5vw;
  top: 80%;
  box-sizing: border-box;
}

.lfo_controls_column {
  height: 100%;
  width: 100%;
  display: flex;
  flex: 0.9;
  flex-direction: column;
  align-content: center;
  justify-content: center;
  position: relative;
  margin: 0;
  padding: 0;
}

.lfo_waveform-btn-selector {
  position: absolute;
  left: 5%;
  bottom: 5%;
  aspect-ratio: 7/4;
  width: 80%;
  border-radius: 0.3vw;
  border-style: solid;
  border-width: 1px;
  text-align: center;
}


.lfo_waveform_btn_icon {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 100%;
  bottom: 0;
  place-self: center;
  align-self: center;
  margin: 0;
  padding: 0;
  clip-path: circle(9%);
  transform: scale(3.25);
}
</style>