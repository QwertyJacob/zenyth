<template>
  <div class="lfoOscilloscope">
    <canvas ref="canvas" class="lfoOscilloscopeCanvas" :style="this.oscilloscopeCanvas"></canvas>
  </div>
</template>

<script>
import {nextTick} from "vue";

const qualFactor = 50
const sinValsBuffer = new Array(qualFactor).fill(0);
const triValsBuffer = new Array(qualFactor).fill(0);
const sqValsBuffer = new Array(qualFactor).fill(0);
const sawValsBuffer = new Array(qualFactor).fill(0);

//todo: rmv real audio
// todo: remap dept in -0.5 + 0.5 range
// todo: start only when needs to be visualized

export default {
  components: {},
  props: ["freq", "depth", "wave"],
  data() {
    return {
      timing: 10,
      //freq: this.freq,
      //depth: this.depth,
      intervalId: "",
      waveform: this.wave
    }
  },

  mounted() {
    //console.log("mounted LfoVisual")
    this.timing = 1000 / (qualFactor * this.$props.freq);
    for (let i = 0; i < qualFactor; i++) {
      sinValsBuffer[i] = Math.sin(Math.PI*2/qualFactor * i) * this.$props.depth;
      triValsBuffer[i] = this.$props.depth - 2*Math.abs(2*(i - qualFactor/2)/qualFactor) * this.$props.depth
      i >= qualFactor/2? sqValsBuffer[i] = this.$props.depth : sqValsBuffer[i] = - this.$props.depth
      sawValsBuffer[i] = this.depth * (2*i/qualFactor -1)
    }

    switch (this.waveform) {
      case 'sine':
        this.oscilloscopeData = sinValsBuffer
        break;
      case 'triangle':
        this.oscilloscopeData = triValsBuffer
        break;
      case 'square':
        this.oscilloscopeData = sqValsBuffer;
        break;
      case 'sawtooth':
        this.oscilloscopeData = sawValsBuffer;
        break;
      default:
        console.log("ERROR - waveform not recognised")
    }

    // --------- GRAPHICS INIT --------
    // use the ref to get the canvas element
    this.canvas = this.$refs.canvas;

    // set the canvas width and height to 100%
    this.canvas.width = 4*this.canvas.offsetWidth;
    this.canvas.height = 4*this.canvas.offsetHeight;
    // get the canvas context
    this.ctx = this.canvas.getContext("2d");
  },

  methods: {
    updateParams({ freq = this.$props.freq, depth = this.$props.depth, waveform = this.waveform }) {
      //this.$props.freq = freq;
      //this.$props.depth = depth;
      this.waveform = waveform;
      //console.log("this.wave: " + waveform);

      this.timing = 1000 / (qualFactor * this.$props.freq);
      switch (this.waveform) {
        case 'sine':
          this.oscilloscopeData = sinValsBuffer
          break;
        case 'triangle':
          this.oscilloscopeData = triValsBuffer
          break;
        case 'square':
          this.oscilloscopeData = sqValsBuffer;
          break;
        case 'sawtooth':
          this.oscilloscopeData = sawValsBuffer;
          break;
        default:
          console.log("ERROR - waveform not recognised")
      }

      if(this.intervalId){ clearInterval(this.intervalId) }
      this.stopOscilloscope();
      //console.log("end - this.wave: " + waveform)

      nextTick(() => {
        this.startOscilloscope()
      })
    },

    startOscilloscope() {
      this.canvas.width = 4*this.canvas.offsetWidth;
      this.canvas.height = 4*this.canvas.offsetHeight;
      //console.log("start - this.waveform: " + this.waveform)

     // console.log("this.timing: " + this.timing)
     // console.log("avviando oscilloscope con timer " + this.timing)
      this.intervalId = setInterval(() => {
        let t = this.oscilloscopeData.shift();
        this.oscilloscopeData.push(t);
        this.draw(this.oscilloscopeData);
      }, this.timing);
      //console.log("this.timing:  " + this.intervalId);
    },

    stopOscilloscope(){
      if(this.intervalId){ clearInterval(this.intervalId) }
    },

    draw(data) {
      // clear the canvas
      //console.log("drawing")
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      let x, y, y_next;

      // draw the data on the canvas
      // set the line color
      this.ctx.strokeStyle = "black";
      // set the line width
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();

      y_next = (this.canvas.height / 2) * (1 - data[0]).toFixed(3);
      // loop through the data and plot it on the canvas
      for (let i = 1; i < data.length; i++) {
        y = y_next;
        // calculate the x and y position of the point
        x = i * (this.canvas.width / data.length).toFixed(3);
        y_next = (this.canvas.height / 2) * (1 - data[i]).toFixed(3);
        // move to the x and y position
        this.ctx.moveTo(x, y);
        // draw a line to the next point
        this.ctx.lineTo(x + this.canvas.width / data.length, y_next );
        // console.log(x, y)
      }
      // draw the line
      this.ctx.stroke();
      this.ctx.moveTo(0, 0);
    },

    beforeDestroy() {
      if (this.oscilloscope) {
        this.oscilloscope.disconnect();
        this.oscilloscope.dispose();
      }
    },
  }, 
  computed: {
    oscilloscopeCanvas(){
      return {
        background: this.colors.purple.glow
      } 
    }
  }
}
</script>

<style>
.lfoOscilloscope {
  margin: 0.4vw;
  margin-right: 0.1vw;;
  height: 90%;
  width: 90%;
  border: 0;
  padding: 0;
  box-sizing: border-box;
  position: relative;
}

.lfoOscilloscopeCanvas {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  border-radius: 0.2vw;
  border: 0.06vw solid #334030;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
</style>