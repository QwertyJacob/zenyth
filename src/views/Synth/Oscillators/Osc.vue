<template>
  <!-- PLEASE DON'T GO CRAZY TRYING UNDERSTAND THIS DIVs LAYER STACKS XD, Look into OSC MIDDLE-->
  <!-- IN "osc_middle" there are the movable circle slider crowns : : 'mod_slider' / 'volume_slider' -->
  <div class="main_container" @click.shift="dispose">
    <div class="type_button" @click="nextOscType" :style="this.type_button">
      <div class="innertext" :style="this.type_text">{{
        osc_types[true] === "" ? 'std' : osc_types[this.oscTypeIndex]
      }}
      </div>
    </div>
    <!-- DO NOT TOUCH EVER AGAIN HTML STRUCTURE / CSS !!!!!!!!!!!!-->
    <div class="osc_container" :style="osc_container">
      <div class="osc">
        <div class="osc_back">
          <div class="mod_area" :style="this.mod_area"></div>
          <div class="volume_area" :style="this.volume_area"></div>
          <div class="pitch_slider" :style="this.pitch_slider"></div>
        </div>
        <div class="osc_middle">

          <div class="mod_slider" ref="modulation" :style="this.mod_slider"></div>
          <div class="volume_slider" ref="volume" :style="this.volume_slider"></div>
        </div>
        <div class="osc_front">
          <div class="pitch_area" :style="this.pitch_area"></div>
          <div class="pitch_hand" ref="pitch" :style="this.pitch_hand"></div>
          <div class="lineL" :style="this.lineL"></div>
          <div class="lineU" :style="this.lineU"></div>
          <div class="lineR" :style="this.lineR"></div>
        </div>
        <div class="draggable left" @dragenter="handleDragEnter('mod')" @dragleave="handleDragLeave('mod')"
          @dragenter.prevent @dragover.prevent @drop="handleDrop($event, 'mod')" @mousedown="modulationDown">
          <div class="modDot" :style="computedModulation('mod')" @click.shift.stop="unlinkMod('mod')"
            v-text="computedModText('mod')"></div>
        </div>
        <div class="draggable right" @dragenter="handleDragEnter('vol')" @dragleave="handleDragLeave('vol')"
          @dragenter.prevent @dragover.prevent @drop="handleDrop($event, 'vol')" @mousedown="volumeDown">
          <div class="modDot" :style="computedModulation('vol')" @click.shift.stop="unlinkMod('vol')"
            v-text="computedModText('vol')"></div>
        </div>
        <div class="draggable low" @dragenter="handleDragEnter('pitch')" @dragleave="handleDragLeave('pitch')"
          @dragenter.prevent @dragover.prevent @drop="handleDrop($event, 'pitch')" @mousedown="pitchDown">
          <div class="modDot" :style="computedModulation('pitch')" @click.shift.stop="unlinkMod('pitch')"
            v-text="computedModText('pitch')"></div>
        </div>
        <div class="osc_wave" @click="nextWaveform" :style="this.osc_wave">
          <img v-if="this.oscWaveIndex === 0" src="@/icons/sine.svg" alt="" draggable="false">
          <img v-if="this.oscWaveIndex === 1" src="@/icons/triangle.svg" alt="" draggable="false">
          <img v-if="this.oscWaveIndex === 2" src="@/icons/saw.svg" alt="" draggable="false">
          <img v-if="this.oscWaveIndex === 3" src="@/icons/square.svg" alt="" draggable="false">
        </div>
      </div>
    </div>
    <div class="chain_buttons" :style="chain_buttons">
      <div></div>
      <div class="button_1" :style="button_1" @click="this.onChainclick(0)"></div>
      <div class="button_2" :style="button_2" @click="this.onChainclick(1)"></div>
      <div class="button_3" :style="button_3" @click="this.onChainclick(2)"></div>
      <div></div>
    </div>
  </div>
</template>

<script>
import * as Tone from "tone";
import SineIcon from "vue-material-design-icons/SineWave";
import SquareIcon from "vue-material-design-icons/SquareWave";
import TriangleIcon from "vue-material-design-icons/TriangleWave";
import SawtoothIcon from "vue-material-design-icons/SawtoothWave";
import {gainToDb} from "tone";
import MyPolySynth from "./MyPolySynth.js";

const wave_types = ["sine", "triangle", "sawtooth", "square"];
const osc_types = ["", "fm", "am", "fat"];

export default {
  components: {
    SineIcon,
    SquareIcon,
    TriangleIcon,
    SawtoothIcon,
  },

  data() {
    return {
      // todo: UPDATE ALL COLOR DEPENDING ON THIS:
      color: {
        vol: this.colors.pink,
        mod: this.colors.azure,
        pitch: this.colors.green
      },


      // waveform_btn_style: osc_background_colors[0], todo: colors?
      osc_types: ["std", "fm", "am", "fat"],
      volume: 0.5,
      modulation: 1,
      pitch: 0,
      pan: 0,
      attack: 0.01,
      decay: 0.1,
      sustain: 1,
      release: 0.2,
      maxPitch: 24,
      minPitch: -24,
      partials: "",
      oscWaveIndex: 0, // wave currently selected from  ['sine','triangle', ...]
      oscTypeIndex: 0, // type of osc selected from ['std', 'fm', ...];
      waveform_btn_style: "lightblue",
      wave_icon_size: 32,
      is_modulationDown: false,
      is_volumeDown: false,
      is_pitchDown: false,
      isFilterChainRouteActive: [true, false, false],
      modulators: {
        vol: null,
        mod: null,
        pitch: null
      },
    };
  },
  props: ["id"],

  mounted() {
    document.addEventListener("mousemove", this.onMouseMove);
    document.addEventListener("mouseup", this.onMouseUp);
    window.addEventListener("resize", this.resizeGraphics);

    // resize graphics
    this.resizeGraphics();
    this.gainNode = new Tone.Gain();
    //console.log(this.polyphonyVoices)
    this.synth = new MyPolySynth(this.gainNode, this.polyphonyVoices);
    this.synth.setParameters({ volume: gainToDb(1 - this.volume) });

    this.synths.list.push(this.synth)
    //console.log(this.synths.list)
    // we need to init connection to first filter chain
    // in the first osc case we need to make sure we connect after the chain is created , so we handle that with events
    // emitted from the filter chain - in all other cases we can just normally connect to the chain
    if (this.id > 1) {
      this.initConnections()
    }
    //communicate to parent that a new osc has been created (to update volEnvelope from ModHost)
    this.$emit("newOsc")

  },

  computed: {

    osc_container() {
      return {
        background: '#f8e7e6'
      }
    },
    /*------------ TYPE BUTTON ------------*/
    type_button() {
      return {
        fontSize: '.5vw',
        background: this.colors.pink.glow
      }
    },
    type_text() {
      return {
        color: this.colors.gray.dark
      }
    },
    /*--------------- OSC -----------------*/
    volume_area() {
      return {
        background: this.colors.pink.dark
      }
    },
    mod_area() {
      return {
        background: this.colors.azure.medium
      }
    },
    pitch_area() {
      return {
        background: this.colors.green.glow
      }
    },
    mod_slider() {
      return {
        transform: "rotate(-" + this.modulation * 111 + "deg)",
        background: 'white',
        opacity: '60%'
      }
    },
    volume_slider() {
      return {
        backgroundColor: 'white',
        opacity: '60%',
        transform: "rotate(" + this.volume * 112 + "deg)",
      }
    },
    pitch_slider() {
      return {
        background: this.colors.green.medium
      }
    },
    pitch_hand() {
      return {
        transform: "rotate(" + (this.pitch * 50) / this.maxPitch + "deg)",
        borderLeft: ".1vw solid " + this.colors.green.dark
      }
    },
    osc_wave() {
      return {
        border: '.1vw solid ' + this.colors.green.dark,
        background: this.colors.green.glow
      }
    },
    lineL() {
      return {
        transform: "rotate(66deg)",
        borderLeft: ".1vw solid " + this.colors.green.dark
      }
    },
    lineU() {
      return {
        transform: "rotate(-66deg)",
        borderLeft: ".1vw solid " + this.colors.green.dark
      }
    },
    lineR() {
      return {
        transform: "rotate(180deg)",
        borderLeft: ".1vw solid " + this.colors.green.dark
      }
    },
    /*------------ CHAIN BUTTONS ------------*/
    chain_buttons() {
      return {
        background: this.colors.pink.glow
      }
    },
    button_1() {
      let color = ''
      if (this.isFilterChainRouteActive[0])
        color = this.colors.purple.light
      else {
        color = this.colors.pink.glow
      }
      return {
        background: color, 
        border: '.1vw solid ' + this.colors.gray.dark 
      }
    },
    button_2() {
      let color = ''
      if (this.isFilterChainRouteActive[1])
        color = this.colors.green.medium
      else {
        color = this.colors.pink.glow
      }
      return {
        background: color, 
        border: '.1vw solid ' + this.colors.gray.dark 
      }
    },
    button_3() {
      let color = ''
      if (this.isFilterChainRouteActive[2])
        color = this.colors.pink.light
      else {
        color = this.colors.pink.glow
      }
      return {
        background: color, 
        border: '.1vw solid ' + this.colors.gray.dark 
      }
    },
  },

  methods: {

    //--------DRAG AND DROP METHODS--------
    handleDrop(event, target) {
      if (this.modulators[target] === null) {
        let data = JSON.parse(event.dataTransfer.getData("data"));
        //if i'm not trying to link an evelope to volume
        if (!(target === 'vol' && data.type === 'envelope')) {
          //console.log("Dropping on " + target)
          //console.log(data)
          this.modulators[target] = {color: data.color, id: data.id, type: data.type}
          document.dispatchEvent(new CustomEvent("link", {
                detail: {
                  object: this.synth,
                  target: target,
                  color: this.color[target]["medium"],
                  modulator: {type: this.modulators[target].type, id: this.modulators[target].id}
                }
              }
          ))
        }
      }

    },
    handleDragEnter(target) {
      //todo: highlight object when dragging on it
      //console.log("Dragging over " + target)
    },
    handleDragLeave(target) {
      //console.log("Dragging out of " + target)
    },
    unlinkMod(target) {
      //todo: CALL BACK ENVELOPS TO UNLINK
      document.dispatchEvent(new CustomEvent("unLink", {
            detail: {
              object: this.synth,
              target: target,
              modulator: {type: this.modulators[target].type, id: this.modulators[target].id}
            }
          }
      ))

      //re-hide link dot
      this.modulators[target] = null;

    },
    //--------DRAG AND DROP STYLING--------
    computedModulation(target) {
      switch (target) {
        case "vol":
          if (this.modulators[target]) {
            return {
              width: "1vw",
              height: "1vw",
              borderRadius: "50%",
              backgroundColor: this.modulators[target].color,
              position: "absolute",
              right: "0%",
            };
          } else {
            return {
              display: "none",
              width: "0%",
              height: "0%",
            }
          }

        case "mod":
          if (this.modulators[target]) {
            return {
              width: "1vw",
              height: "1vw",
              borderRadius: "50%",
              backgroundColor: this.modulators[target].color,
              position: "absolute",
            };
          } else {
            return {
              display: "none",
              width: "0%",
              height: "0%",
            }
          }
        case "pitch":
          if (this.modulators[target]) {
            return {
              width: "1vw",
              height: "1vw",
              borderRadius: "50%",
              backgroundColor: this.modulators[target].color,
              position: "absolute",
              left: "0%",
              bottom: "0%"
            };
          } else {
            return {
              display: "none",
              width: "0%",
              height: "0%",
            }
          }
      }
    },
    computedModText(target) {
      if (this.modulators[target]) {
        return this.modulators[target].id
      } else return "";
    },



    //-----------------
    dispose() {
      //unlink linked modulators
      for (let key in this.modulators) {
        if (this.modulators[key])
          this.unlinkMod(key)
      }

      this.$emit("disposed", this.id)
      this.synth.disconnectDispose()
      this.synths.list.splice(this.synths.list.indexOf(this.synth), 1)


      //console.log("Synth to remove is at index: " + this.synths.list.indexOf(this.synth))
      //console.log("list of synths remaining:")
      //console.log(this.synths.list)
    },
    initConnections() {
      this.gainNode.connect(this.filterChains[0][0].getToneFilter())
    },

    // ----------- GRAPHIC HELPERS -----------
    resizeGraphics() {
      let width = document.body.clientWidth;
      if (width >= 500) {
        this.wave_icon_size = (32 * width) / 1500;
      } else {
        this.wave_icon_size = 0;
      }
    },

    // ---------- USER EVENTS ---------------
    // Audio routing changed clicking the dots that represent the filter chains
    onChainclick(id) {
      //console.log("chain click - id: " + id);
      try {
        if (this.isFilterChainRouteActive[id]) {
          /*
          console.log(
              "disconnect from: " +
              this.filterChains[id][0] + " " + id
          );
          */
          this.gainNode.disconnect(
              this.filterChains[id][0].getToneFilter()
          );
        } else {
          /*
          console.log(
            "connect to: " +
            this.filterChains[id][0] + " " + id
          );
          */
          this.gainNode.connect(
              this.filterChains[id][0].getToneFilter()
          );
        }
      } catch (e) {
        console.log(
          "error: " + e + "\nCHAIN CONNECTION TO OSC UNSUCCESSFUL. Can't connect to " + this.filterChains[id][0]
        );
      }
      this.isFilterChainRouteActive[id] = !this.isFilterChainRouteActive[id];
    },

    onMouseMove(event) {
      if (this.is_volumeDown) {
        // RIGHT FADER - volume
        if (event.movementY < 0) {
          // Mouse is moving up
          this.volume = Math.max(this.volume + event.movementY / 100, 0);
        } else {
          // Mouse is moving down
          this.volume = Math.min(this.volume + event.movementY / 100, 1);
        }
        // -------------- modify here synth audio ----------------
        // this.synth.volume.value = gainToDb(1 - this.volume);
        this.synth.setParameters({ volume: gainToDb(1 - this.volume) });
        //console.log("synth volume: " + this.volume.toFixed(2) + " dB");
      } else if (this.is_modulationDown) {
        // LEFT FADER - modulation
        if (event.movementY < 0) {
          // Mouse is moving down
          this.modulation = Math.max(this.modulation + event.movementY / 100, 0);
        } else {
          // Mouse is moving up
          this.modulation = Math.min(this.modulation + event.movementY / 100, 1);
        }
        // -------------- modify here synth audio ----------------
        // (1- this.modulation) needed because the graphics return a value of 1 for the minimum and 0 for the max
        this.synth.setParameters({modulation: 1 - this.modulation })
        //console.log("modulation: " + (1 -  this.modulation.toFixed(2)));
      } else if (this.is_pitchDown) {
        // BOTTOM FADER - pitch shift
        if (event.movementX < 0) {
          // Mouse is moving right
          this.pitch = Math.min(this.pitch - Math.floor(event.movementX), this.maxPitch);
        } else if (event.movementX > 0) {
          // Mouse is moving left
          this.pitch = Math.max(this.pitch - Math.floor(event.movementX), this.minPitch);
        }
        // ----------- modify here synth audio -------------
        // todo: pitch max a dx e min a sx - meglio il contrario, secondo me - segue possibile ma brutto fix
        // console.log("pitch shift: " + this.pitch * -1)
        // this.synth.set({detune: this.pitch * -100});
        //console.log("pitch shift: " + this.pitch);
        this.synth.setParameters({ transpose: this.pitch });
        // -------------------------------------------------
      }
    },
    onMouseUp(event) {
      if (this.is_modulationDown) this.is_modulationDown = false;
      if (this.is_volumeDown) this.is_volumeDown = false;
      if (this.is_pitchDown) this.is_pitchDown = false;
    },

    modulationDown(event) {
      if (!this.is_modulationDown) this.is_modulationDown = true;
    },
    volumeDown(event) {
      if (!this.is_volumeDown) this.is_volumeDown = true;
    },
    pitchDown(event) {
      if (!this.is_pitchDown) this.is_pitchDown = true;
    },

    // ----------- AUDIO -----------
    // Update osc waveform
    nextOscType() {
      // go circularly on along the list osc_types list
      this.oscTypeIndex++;
      if (this.oscTypeIndex >= osc_types.length) this.oscTypeIndex = 0;

      this.synth.setParameters({ type: osc_types[this.oscTypeIndex] })

      //console.log("osc type: " + osc_types[this.oscTypeIndex]);
    },

    nextWaveform() {
      // update selected wavetype changing the current index
      this.oscWaveIndex++;
      if (this.oscWaveIndex >= wave_types.length) this.oscWaveIndex = 0;

      //console.log(wave_types[this.oscWaveIndex])
      // set new waveform
      this.synth.setParameters({ waveform: wave_types[this.oscWaveIndex] })
    },

    // set routing
    connect(route) {
      this.synth.connect(route);
    },
  },

  unmounted() {
    // remove event listeners
    window.removeEventListener("resize", this.resizeGraphics);
    document.removeEventListener("mousemove", this.onMouseMove);
    document.removeEventListener("mouseup", this.onMouseUp);
  },
};
</script>

<style scoped>
.modDot {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 0.8vw;
  text-align: center;
  box-sizing: border-box;
  border: .06vw solid black;
}

.main_container {
  border: .1vw solid #c2847b ;
  box-sizing: border-box;
  height: calc(100% / 3);
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}
.main_container:hover {
  border: .1vw solid #63443e;
  box-sizing: border-box;
  height: calc(100% / 3);
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.osc_container {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  flex: 4;
  height: 100%;
  width: 100%;
}

/*---------- MOD TYPE BUTTON ----------*/
.type_button {
  border: .1vw solid #c2847b;
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  height: 100%;
}
.type_button:hover {
  border: .1vw solid #63443e;
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  height: 100%;
}

.type_button .innertext {
  font-size: .8vw;
  writing-mode: vertical-rl;
  text-orientation: upright;
  text-transform: uppercase;
}

/*--------------- OSC -----------------*/
.osc {
  width: 90%;
  justify-content: center;
  align-items: center;
  display: flex;
  position: relative;
  aspect-ratio: 1/1;
}

.osc_back {
  margin: auto;
  width: 100%;
  position: absolute;
  aspect-ratio: 1/1;
  clip-path: circle(50%);
  z-index: 1;
}

.pitch_slider {
  position: absolute;
  width: 100%;
  height: 100%;
  clip-path: polygon(50% 100%, 100% 100%, 100% 72%, 50% 50%, 0% 72%, 0% 100%);
  z-index: 27;
}

.mod_area {
  position: absolute;
  width: 100%;
  height: 100%;
  clip-path: polygon(50% 0%, 0% 0%, 0% 100%, 50% 50%);
  z-index: 2;
}

.volume_area {
  position: absolute;
  width: 100%;
  height: 100%;
  clip-path: polygon(50% 0%, 100% 0%, 100% 100%, 50% 50%);
  z-index: 3;
}

.osc_middle {
  margin: auto;
  height: 95%;
  top: 2.5%;
  left: 2.5%;
  position: absolute;
  aspect-ratio: 1/1;
  clip-path: circle(50%);
  z-index: 25;
}

.mod_slider {
  position: absolute;
  width: 100%;
  height: 100%;
  clip-path: polygon(50% 0%, 0% 0%, 0% 100%, 50% 50%);
  z-index: 27;
}

.volume_slider {
  position: absolute;
  width: 100%;
  height: 100%;
  clip-path: polygon(50% 0%, 100% 0%, 100% 100%, 50% 50%);
  z-index: 26;
}

.osc_front {
  margin: auto;
  height: 96%;
  top: 2%;
  left: 2%;
  position: absolute;
  aspect-ratio: 1/1;
  clip-path: circle(50%);
  z-index: 50;
}

.pitch_area {
  position: absolute;
  width: 100%;
  height: 100%;
  clip-path: polygon(50% 100%,
      100% 100%,
      100% 72%,
      50% 50%,
      0% 72%,
      0% 100%,
      50% 100%);
  z-index: 10;
}

.pitch_hand {
  position: absolute;
  top: 50%;
  left: 50%;
  height: 40%;
  width: 100%;
  transform-origin: 0 0;
  z-index: 15;
}
.lineL {
  position: absolute;
  top: 50%;
  left: 50%;
  height: 100%;
  width: 100%;
  transform-origin: 0 0;
  z-index: 15;
}

.lineU {
  position: absolute;
  top: 50%;
  left: 50%;
  height: 100%;
  width: 100%;
  transform-origin: 0 0;
  z-index: 15;
}
.lineR {
  position: absolute;
  top: 50%;
  left: 50%;
  height: 100%;
  width: 100%;
  transform-origin: 0 0;
  z-index: 15;
}


.osc_wave {
  display: flex;
  position: relative;
  aspect-ratio: 1;
  width: 45%;
  border-radius: 50%;
  left: 0;
  top: 0;
  z-index: 101;
}

.osc_wave img {
  position: relative;
  aspect-ratio: 1/1;
  width: 100%;
  left: 0;
  top: 0;
  clip-path: circle(20%);
  z-index: 102;
}

.draggable {
  position: absolute;
  z-index: 75;
}

.left {
  width: 50%;
  height: 70%;
  left: 0;
  bottom: 30%;
  background-color: transparent;
}

.right {
  width: 50%;
  height: 70%;
  background-color: transparent;
  left: 50%;
  bottom: 30%
}

.low {
  width: 100%;
  height: 30%;
  top: 70%;
  background-color: transparent;
}

/*------------ CHAIN BUTTONS ------------*/
.chain_buttons {
  border: .1vw solid #c2847b;
  flex: .5;
  display: grid;
  grid-template-rows: .3fr 1fr 1fr 1fr .3fr;
  height: 100%;
  align-items: center;
  padding-left: 3%;
  padding-right: 3%;
}
.chain_buttons:hover {
  border: .1vw solid #63443e;
  flex: .5;
  display: grid;
  grid-template-rows: .3fr 1fr 1fr 1fr .3fr;
  height: 100%;
  align-items: center;
  padding-left: 3%;
  padding-right: 3%;
}


.button_1,
.button_2,
.button_3 {
  width: 100%;
  aspect-ratio: 1/1;
  border: .1vw solid black;
  border-radius: 50%;
}
</style>