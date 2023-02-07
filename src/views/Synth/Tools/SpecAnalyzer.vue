<template>
  <div class="spectral-analyzer">
    <canvas class="analyzerCanvas" ref="canvas" :style="this.analyzerCanvas"></canvas>
  </div>
</template>

<script>
import * as Tone from "tone";
import { dbToGain, gainToDb } from "tone";

export default {
  data() {
    return {
      timing: 10,
    };
  },
  mounted() {
    this.analyser = new Tone.Analyser("fft", 2048);
    this.canvasCtx = this.$refs.canvas.getContext("2d");
    Tone.getDestination().connect(this.analyser);
    this.startAnalyzer()
  },
  methods: {
    draw() {
      //requestAnimationFrame(this.draw);

      this.data = this.analyser.getValue();
      this.canvasCtx.strokeStyle = "#658060";
      //console.log(this.data)

      // clear the canvas
      this.canvasCtx.clearRect(
        0,
        0,
        this.$refs.canvas.width,
        this.$refs.canvas.height
      );
        let x

        

      // render the analysis on the canvas
      for (let i = 0; i < this.data.length; i++) {
        
        this.value = 6*dbToGain(this.data[i])*this.$refs.canvas.height;
        //console.log(this.value)
        x = (Math.log10(i) / Math.log10(2048)) * this.$refs.canvas.width
        this.canvasCtx.fillStyle = "black";
        this.canvasCtx.fillRect(x, this.$refs.canvas.height - this.value, 1, this.value);
      }
    },
    startAnalyzer() {
      //console.log(this.$refs.canvas.height)
        //console.log("avviando analyzer con timer "+this.timing)
      this.intervalId = setInterval(() => {
        this.draw();
      }, 10);
    },
  },
  computed: {
    analyzerCanvas(){
      return{
        background: this.colors.green.glow
      }
    }
  },
  beforeDestroy() {},
};
</script>

<style>
.spectral-analyzer{
  grid-row: 1;
  margin: 0.3vw 0.3vw 0.15vw;
  box-sizing: border-box;
}
.analyzerCanvas {
  width: 100%;
  height: 100%;
  border-radius: 0.2vw;
  border: 0.1vw solid #334030;
  box-sizing: border-box;
}
</style>