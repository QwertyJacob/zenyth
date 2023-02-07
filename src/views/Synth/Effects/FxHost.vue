<template>
  <div :style="this.fxBack">
  <div class="fxHost" :style="this.fxHost">

    <div class="chainHeadsRow">
      <div class="chainHead " :style="this.chainHead1"></div>
      <div class="chainHead " :style="this.chainHead2"></div>
      <div class="chainHead " :style="this.chainHead3"></div>
    </div>
    <div class="fxGrid">
      <FxCell v-for="(fx) in Fx_chain1" ref="effects" :chainId="fx.chainId" :id="fx.id" :item="fx"></FxCell>
      <FxCell v-for="(fx) in Fx_chain2" :chainId="fx.chainId" :id="fx.id" :item="fx"></FxCell>
      <FxCell v-for="(fx) in Fx_chain3" :chainId="fx.chainId" :id="fx.id" :item="fx"
              @fxMounted="this.initFxConnections()"></FxCell>
    </div>
    <div class="gainList" :style="this.gainList">
      <div id="gain1" class="channelGain" :style="channelGain(0)" @mousedown="gainMouseDown(0)">
        <div class="channelGainFader" :style="computedFxGainKnobStyle(0)"></div>
      </div>
      <div id="gain2" class="channelGain" :style="channelGain(1)" @mousedown="gainMouseDown(1)">
        <div class="channelGainFader" :style="computedFxGainKnobStyle(1)"></div>
      </div>
      <div id="gain3" class="channelGain" :style="channelGain(2)" @mousedown="gainMouseDown(2)">
        <div class="channelGainFader" :style="computedFxGainKnobStyle(2)"></div>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import FxCell from '../Effects/FxCell.vue'
import {Gain, getDestination} from "tone";

export default {
  name: "FxHost",
  components: {FxCell},

  data() {
    return {
      Fx_chain1: [],
      Fx_chain2: [],
      Fx_chain3: [],
      isGainSelected: "",
      chainsGains: ""
    }
  },

  mounted() {
    this.isGainSelected = Array(this.nFxChains).fill(false)
    this.chainsGains = Array(this.nFxChains).fill(0);
    this.chainsGains[0] = 0.8;
    this.chainsGains[1] = 0.8;
    this.chainsGains[2] = 0.8;
    // note: refs are kept incremental through the chains, while everything else is indexed relatively to the chain
    //console.log("creating fx")
    for (let i = 1; i <= this.nFxXchain; i++) {
      this.Fx_chain1.push({id: i, ref: 'Fx' + i, chainId: 0});
      this.Fx_chain2.push({id: i, ref: 'Fx' + i + this.nFxXchain, chainId: 1});
      this.Fx_chain3.push({id: i, ref: 'Fx' + i + this.nFxXchain * 2, chainId: 2});
      // console.log(i)
    }

    //console.log(this.fxChains)
    for (let i = 0; i < this.nFxChains; i++) {
      this.fxChains[i][0] = new Gain(1);
      this.fxChains[i][this.nNodesXfxChain-1] = new Gain(+this.chainsGains[i]);
    }
  },

  methods: {
    // -------------------- AUDIO -----------------------
    initFxConnections() {
      //console.log(this.fxChains)
      for (let i = 0; i < this.nFxChains; i++) {
        // structure: Gain Filter Filter Filter Filter Filter Gain [7]
        for (let j = 0; j < this.nNodesXfxChain-2; j++) {
          //console.log("i: ", i, "j: ", j)
          this.fxChains[i][j].connect(this.fxChains[i][j + 1].getToneReference())
          // console.log("chain ", i ," id: ", j, " into chain ", i , " id: ", j+1)
        }
        // connect last filter to volume
        this.fxChains[i][this.nNodesXfxChain-2].connect(this.fxChains[i][this.nNodesXfxChain-1])
        // connect vol to destination
        this.fxChains[i][this.nNodesXfxChain-1].connect(getDestination())
        // console.log("chain ", i, " id: ", this.nFxXchain-1, " into getDestination()")
      }
    },

    // first node of each chain is a gain node - we set its volume to adjust whole chain gain
    setChainVolume(chainId, volume) {
      this.fxChains[chainId][this.nNodesXfxChain-1].gain = volume;

    },

    // --------------------  GESTURE -----------------------
    gainMouseDown(gainId) {
      this.isGainSelected[gainId] = true;
      // console.log("fx gainMouseDown")
    },

    handleMouseUp(e) {
      //Actions to execute when mouseup happens on any part of the screen
      this.isGainSelected.fill(false)
      // console.log("fx gainMouseUP")

    },
    handleMouseMove(e) {
      this.isGainSelected.forEach((isSelected, index) => {
        // console.log("fx gain vol knob mouse drag")
        if (isSelected) {
          //console.log("fx gain vol knob mouse drag of ", isSelected);
          this.chainsGains[index] = this.chainsGains[index] - Math.floor(e.movementY) / 100;
          this.chainsGains[index] = Math.max(this.chainsGains[index], 0);
          this.chainsGains[index] = Math.min(this.chainsGains[index], 1);
          //console.log(this.chainsGains[index])
          //console.log(this.fxChains[index][0])
          this.fxChains[index][this.nNodesXfxChain-1].set({
            gain: this.chainsGains[index]
          })
        }
      })
    },
    computedFxGainKnobStyle(id) {
      let color = ''; 
      if(id === 0) color = this.colors.purple.medium
      if(id === 1) color = this.colors.green.medium
      if(id === 2) color = this.colors.pink.medium
      return {
        height: 100 * this.chainsGains[id] + "%",
        top: 50 * (1-this.chainsGains[id]) + "%",
        left: 50 * (1-this.chainsGains[id]) + "%",
      
        background: color,
      }
    },
    channelGain(id) {
      let color = ''
      if(id == 0) color = this.colors.purple.glow
      if(id == 1) color = this.colors.green.glow
      if(id == 2) color = this.colors.pink.glow
      return {
        background: color,
      }
    }
  },

  computed : {

    fxHost(){
      return {
        background: this.colors.orange.glow,
        border: '.1vw solid '+this.colors.orange.dark,
        boxSizing: 'border-box'
      }
    },
    gainList(){
      return {
        background: this.colors.orange.light,
        borderTop: '.1vw solid '+this.colors.orange.dark,
        boxSizing: 'border-box',
        height: '100%'
      }
    },
    chainHead1(){
      return {
        background: this.colors.purple.light
      }
    },
    chainHead2(){
      return {
        background: this.colors.green.medium
      }
    },
    chainHead3(){
      return {
        background: this.colors.pink.light
      }
    },
    fxBack(){
      return {
        position: 'relative',
        height: '100%',
        width: '100%',
        background: this.colors.orange.light
      }
    }
    
  }
}

</script>

<style scoped>
  .fxHost{
    display: grid;
    margin: .3vw;
    height: calc(100% - .6vw);
    border-radius: 1%;
    opacity: 90%;
    grid-template-columns: 1fr;
    grid-template-rows: 10% 70% 20%;
    justify-content: center;
    align-items: center;
  }
  .fxGrid{
    justify-content: center;
    align-items: center;
    justify-items: stretch;
    height: 100%;
    width: 100%;
    flex: 1;
    display: grid;
    grid-column: auto;
    grid-template-rows:  1fr 1fr 1fr 1fr 1fr ;
    grid-template-columns: 1fr 1fr 1fr;
    grid-auto-flow: column;
    box-sizing: border-box;
  }

  .gainList{
    width: 100%;
    position: relative;
    display: flex;
    justify-content: space-around;
    align-items: center;
    flex-direction: row;
  }

.channelGainFader {
  box-sizing: border-box;
  position: relative;
  left: 50%;
  top: 50%;
  aspect-ratio: 1;
  border-radius: 50%;
  align-self: center;
}

.channelGain {
  box-sizing: border-box;
  position: relative;
  align-content: center;
  height: 70%;
  aspect-ratio: 1/1;
  border-radius: 50%;
  border: 0.06vw solid black;
}

.chainHeadsRow {
  height: 60%;
  width: 100%;
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex-direction: row;
  background-color: transparent;
  margin-top: 2%;
  box-sizing: border-box;;
  border: 0;
}


  .chainHead {
    height: 50%;
    aspect-ratio: 1/1;
    border: 0;
    clip-path: circle(50%)
  }

  .head1 {
    background-color: red;
  }
  .head2 {
    background-color: green;
  }
  .head3 {
    background-color: blue;
  }
</style>