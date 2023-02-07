<template>
  <div class="cell" @click="nextFx" @click.shift="setToBypass" @mousedown="fxDown">
    <div class="icon">
      <div v-if="this.typeId === 0" ref="plus" :style="this.iconDiv" @mouseover="this.onIconEnter" @mouseout="onIconLeave"> +</div>
      <img v-if="this.typeId === 1" src="@/icons/blizzard.svg" alt="">
      <img v-if="this.typeId === 2" src="@/icons/drop.svg" alt="">
      <img v-if="this.typeId === 3" src="@/icons/fire.svg" alt="">
      <img v-if="this.typeId === 4" src="@/icons/moon.svg" alt="">
      <img v-if="this.typeId === 5" src="@/icons/wind.svg" alt="">
      <img v-if="this.typeId === 6" src="@/icons/tornado.svg" alt="">
    </div>
    <div class="glow" :style="computedGlowStyle" @mousedown="fxDown">
    </div>
  </div>
</template>

<script>
import { isSVGTag } from '@vue/shared';
import MyEffect from "@/views/Synth/Effects/MyFx";
import {Gain, getDestination} from "tone";
import { nextTick } from "vue";

const types = ['none', 'reverb', 'delay', 'distortion', 'vibrato', 'pan', 'chorus'];
const Fx_colors = ['transparent', 'lightblue', 'deepskyblue', 'red', 'orange', 'darkorchid', 'yellow'];
export default {
  props: ["chainId", "id", "ref"],

  data() {
    return {
      modulation: 0,
      is_down: false,
      typeId: 0,
      volume: 0,

      //variables to solve
      //dragging and clicking interference
      startX: 0,
      startY: 0,
      endX: 0,
      endY: 0,
      threshold: 2, // adjust as needed
    };
  },
  mounted() {
    // gesture listeners
    document.addEventListener("mouseup", this.onMouseup);
    document.addEventListener("mousemove", this.onMousemove);
    // init effect as bypass (a gain node)
    this.effect = new MyEffect({ typeId: types[this.typeId], modulation: this.modulation })
    // this.effect = this.fxHelper.generateToneFx('none');
    // create the effect in the global fx matrix
    this.fxChains[this.chainId][this.id] = this.effect;
    // console.log("fx chain: " + this.chainId + " - fx id: " + this.id)
    // console.log(this.chainId, " ", this.id)

    // notify parent that each filter has been created
    if (this.chainId === this.nFxChains - 1 && this.id === this.nFxXchain) {
      this.$emit("fxMounted")
    }
  },

  computed: {
    computedGlowStyle() {
      return {
        opacity: (this.modulation + 0.3) * 100 + "%",
        background: Fx_colors[this.typeId]
      }
    },
    iconDiv() {
      let color = 'black'
      if (this.chainId === 0) color = this.colors.purple.medium
      if (this.chainId === 1) color = this.colors.green.medium
      if (this.chainId === 2) color = this.colors.pink.medium
      return {
        color: color,
      }
    },
    iconDivBlack(){
      let color = 'black'
      return {
        color: color,
      }
    },
    onIconEnter() {
      this.$refs['plus'].style.color = 'black'
    },
    onIconLeave() {
      let color = 'black'
      if (this.chainId === 0) color = this.colors.purple.medium
      if (this.chainId === 1) color = this.colors.green.medium
      if (this.chainId === 2) color = this.colors.pink.medium
      this.$refs['plus'].style.color = color
    }
    /*     onIconLeave(){
          let color = 'black'
          if(this.chainId === 0 ) color = this.colors.purple.medium
          if(this.chainId === 1 ) color = this.colors.green.medium
          if(this.chainId === 2 ) color = this.colors.pink.medium
          this.$refs['plus'].style.color = color
        } */
  },

  components: { isSVGTag },

  methods: {
    // ------------------ USER INTERACTIONS -----------------------
    nextFx() {
      //calculate distance between mouseDown and mouseUp, if it is more than threshold pixels, then it is a drag
      const distance = Math.sqrt(
        Math.pow(this.endX - this.startX, 2) +
        Math.pow(this.endY - this.startY, 2)
      );

      if (distance <= this.threshold) {
        if (!this.is_down) {
          // change fx type and index
          this.typeId = this.generateNextTypeIndex();
          let fxType = types[this.typeId]
          //console.log(fxType)

          this.changeFxType(fxType)
        }
      }

    },

    changeFxType(fxType) {
      // disconnect old effect
      this.effect.disconnect();
      this.effect.dispose();

      // create new effect
      this.effect = new MyEffect({ type: fxType, modulation: this.modulation })
      this.effect.setFxParams({ type: fxType, mod: this.modulation })

      // attach new fx in the global fx matrix
      // init effect
      this.fxChains[this.chainId][this.id] = this.effect;
      // connect effect
      this.fxChains[this.chainId][this.id-1].connect(this.fxChains[this.chainId][this.id].getToneReference());
      if(this.fxChains[this.chainId][this.id+1] instanceof MyEffect) {
        this.fxChains[this.chainId][this.id].connect(this.fxChains[this.chainId][this.id + 1].getToneReference())
      } else if(this.fxChains[this.chainId][this.id+1] instanceof Gain){
        this.fxChains[this.chainId][this.id].connect(this.fxChains[this.chainId][this.id + 1])
      }
      //console.log(this.fxChains)

      /* // debug global fx matrix
      this.fxChains.forEach((chain) => {
        chain.forEach((fx) => {
          if (fx instanceof MyEffect){
            console.log(fx.getToneReference())
          } else { console.log(fx) }
        })
      })*/
    },

    generateRandomTypeIndex() {
      return Math.round(Math.random() * 10 + 1) % types.length
    },

    generateNextTypeIndex() {
      return (this.typeId + 1) % types.length;
    },

    setToBypass() {
      this.typeId = 0;
      this.changeFxType('none')

      //console.log("set fx in position " + this.chainId + " - " + this.id + " to bypass")
    },

    fxDown(e) {
      //save mouseDown position
      this.startX = e.clientX;
      this.startY = e.clientY;

      if (!this.is_down)
        this.is_down = true;
    },
    onMouseup(e) {
      //save mouseUp position
      this.endX = e.clientX;
      this.endY = e.clientY;
      if (this.is_down)
        this.is_down = false;
    },
    onMousemove(event) {
      if (this.is_down) {
        if (event.movementY < 0) {
          this.modulation = Math.min(this.modulation - event.movementY / 100, 1);
        } else {
          this.modulation = Math.max(this.modulation - event.movementY / 100, 0);
        }
        this.effect.setFxParams({ fx: this.effect, typeId: this.typeId, mod: this.modulation })

        // console.log(this.modulation);
      }
    }
  },
}
</script>

<style scoped>
.cell {
  position: relative;
  height: 85%;
  background-color: transparent;
  display: flex;
  margin: 10%;
  align-items: center;
  justify-content: center;
}

.icon {
  display: flex;
  aspect-ratio: 1/1;
  position: absolute;
  z-index: 2;
  background-color: transparent;
}

.icon div {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5vw;
  height: 100%;
  aspect-ratio: 1/1;
  background-color: transparent;
}

.icon img {
  width: 1.5vw;
  aspect-ratio: 1/1;
  opacity: 80%;
  -webkit-user-drag: none;
}

.glow {
  border-radius: 5%;
  flex: 1;
  height: 100%;
  width: 100%;
  position: absolute;
  z-index: 1;
  background-color: red;
}

.glow div {
  height: 100%;
  width: 100%;
  opacity: 100%;
  color: black;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2vw;
}
</style>