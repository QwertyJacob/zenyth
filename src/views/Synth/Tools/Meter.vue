<template>
  <div class="meter" :style="this.Meter">
    <div class="signalSum">
      <div ref="left" class="signal" :style="computedWidthLeft"></div>
      <div></div>
      <div ref="right" class="signal" :style="computedWidthRight"></div>
    </div>
  </div>
</template>

<script>
import { Meter } from "tone";
import { dbToGain, gainToDb } from "tone";
import * as Tone from "tone";

export default {
  data() {
    return {
      widthLeft: 0,
      widthRight: 0,
    };
  },
  computed: {
    computedWidthLeft() {
      return { width: `${this.widthLeft}%` , background: this.colors.green.medium};
    },
    computedWidthRight() {
      return { width: `${this.widthRight}%` , background: this.colors.green.medium};
    },
    Meter(){
      return{
        background: this.colors.green.glow,
      }
    },
  },
  mounted() {
    this.meter = new Meter({channels: 2});
    Tone.getDestination().connect(this.meter);
    this.intervalId = setInterval(() => {
      this.updateWidths();
    }, 25);
  },
  
  methods: {
    updateWidths() {
      //this.volume = this.meter.getValue();
      [ this.leftVolume , this.rightVolume ] = this.meter.getValue();
      if (!isFinite(this.leftVolume) && !isFinite(this.rightVolume)) return;
      //console.log(this.meter.getValue()); 
      this.widthLeft = Math.min(dbToGain(this.leftVolume) * 100,100);
      this.widthRight = Math.min(dbToGain(this.rightVolume) * 100,100);
    },
  },
  beforeDestroy() {
    this.meter.stop();
    this.meter.dispose();
    clearInterval(this.intervalId);
  },
};
</script>

<style scoped>
.meter {
  grid-row: 3;
  border-radius: 0.2vw;
  margin: 0vw 0.3vw 0.3vw;
  display: flex;
  border: 0.1vw solid #334030;
}
.signal {
  height: 100%;
  border-radius: 0.05vw;
}
.signalSum {
  margin: 0.3vw;
  display: grid;
  grid-template-rows: 45% 10% 45%;
  width: 100%;
}
</style>