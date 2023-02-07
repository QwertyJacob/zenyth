<template>
  <div class="oscilloscope">
    <canvas ref="canvas" class="oscilloscopeCanvas" :style="this.oscilloscopeCanvas"></canvas>
  </div>
</template>

<script>
import * as Tone from "tone";

export default {
  data() {
    return {
      oscilloscopeData: [],
      timing: 10,
    };
  },

  mounted() {
    this.oscilloscope = new Tone.Waveform();
    Tone.getDestination().connect(this.oscilloscope);
    this.startOscilloscope();

    // use the ref to get the canvas element
    this.canvas = this.$refs.canvas;

    // set the canvas width and height to 100%
    this.canvas.width = 4*this.canvas.offsetWidth;
    this.canvas.height = 4*this.canvas.offsetHeight;

    // get the canvas context
    this.ctx = this.canvas.getContext("2d");
  },
  methods: {
    setTiming(timing) {
      this.timing = timing;
      clearInterval(this.intervalId);
      this.startOscilloscope();
    },
    startOscilloscope() {
        //console.log("avviando oscilloscope con timer "+this.timing)
      this.intervalId = setInterval(() => {
        this.updateOscilloscopeData();
      }, this.timing);
    },
    draw(data) {
      // clear the canvas
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      // draw the data on the canvas
      // set the line color
      this.ctx.strokeStyle = "#658060";
      // set the line width
      this.ctx.lineWidth = 6;
      this.ctx.beginPath();

      // loop through the data and plot it on the canvas
      for (let i = 0; i < data.length; i++) {
        // calculate the x and y position of the point
        let x = i * (this.canvas.width / data.length);
        let y = (this.canvas.height / 2) * (1 - data[i]);

        // move to the x and y position
        this.ctx.moveTo(x, y);
        // draw a line to the next point
        this.ctx.lineTo(x + this.canvas.width / data.length, y);
      }
      // draw the line
      this.ctx.stroke();
      this.ctx.moveTo(0, 0);
    },
    updateOscilloscopeData() {
      this.oscilloscopeData = this.oscilloscope.getValue();
      this.draw(this.oscilloscopeData);
      //console.log(this.oscilloscopeData);
    },
  },
  computed: {
    oscilloscopeCanvas(){
      return{
        background: this.colors.green.glow,
      }
    }
  },
  beforeDestroy() {
    this.oscilloscope.dispose();
  },
};
</script>

<style>
.oscilloscope {
  grid-row: 2;
  margin: 0.15vw 0.3vw 0.3vw;
  box-sizing: border-box;
  
}
.oscilloscopeCanvas {
  width: 100%;
  height: 100%;
  background-color: #caffbf;
  border-radius: 0.2vw;
  border: 0.1vw solid #334030;
  box-sizing: border-box;
}
</style>