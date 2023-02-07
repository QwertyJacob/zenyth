<template>
  <div class="span" @mouseleave="handleMouseLeave">
    <div class="container">
      <Octave
        ref="oct1"
        :octaveNumber="1"
        @virtualKeyDown="handleNoteDown"
        @virtualKeyUp="handleNoteUp"
      />
    </div>
    <div class="container">
      <Octave
        ref="oct2"
        :octaveNumber="2"
        @virtualKeyDown="handleNoteDown"
        @virtualKeyUp="handleNoteUp"
      />
    </div>
    <div class="container">
      <Octave
        ref="oct3"
        :octaveNumber="3"
        @virtualKeyDown="handleNoteDown"
        @virtualKeyUp="handleNoteUp"
      />
    </div>
    <MIDIKeyboard @MIDIDown="handleMIDIDown" @MIDIUp="handleMIDIUp" />
  </div>
</template>

<script>
import MIDIKeyboard from "./MIDIKeyboard.vue";
import Octave from "./Octave.vue";
import * as Tone from "tone";


export default {
  name: "PianoKeyboard",
  components: {
    Octave,
    MIDIKeyboard,
  },
  data() {
    return {
      //From here we can transpose the whole keyboard by octaves
      ocTranspose: 1,
      // Object to track which keys are currently being held down
      keysDown: {},
      keys: "awsedftgyhujkolpòà",
      notes: ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"],
      //Transposition amount (in octaves) for the computer keyboard
      keyboardTranspose: 0,
      mouseDown: false,
    };
  },
  mounted() {
    // Add keydown and keyup event listeners to the window object
    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("keyup", this.handleKeyUp);
  },
  beforeDestroy() {
    // Remove keydown and keyup event listeners from the window object
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("keyup", this.handleKeyUp);
  },

  methods: {
    handleMouseUp(){
      this.mouseDown = false
    },
    handleKeyDown(event) {
      // If the key is not currently being held down, handle the keydown event
      if (!this.keysDown[event.key] && this.keys.includes(event.key)) {
        let note = this.notes[this.keys.indexOf(event.key) % 12];
        let octave = parseInt(this.keys.indexOf(event.key) / 12, 10);
        this.handleNoteDown(note, 2 + octave + this.keyboardTranspose, 100);
        // Set keyDown flag to true
        this.keysDown[event.key] = true;
        // Change color on keyboard
        if (
          2 + octave + this.keyboardTranspose > 0 &&
          2 + octave + this.keyboardTranspose < 4
        )
          this.$refs[
            "oct" + (2 + octave + this.keyboardTranspose)
          ].switchColorPress(note);
      }
      // Change octave of computer keyboard with z or x
      if (!this.keysDown[event.key] && event.key == "z") {
        this.keyboardTranspose = this.keyboardTranspose - 1;
      }
      if (!this.keysDown[event.key] && event.key == "x") {
        this.keyboardTranspose = this.keyboardTranspose + 1;
      }
    },
    handleKeyUp(event) {
      // If the key is currently being held down, handle the keyup event
      if (this.keysDown[event.key]) {
        let note = this.notes[this.keys.indexOf(event.key) % 12];
        let octave = parseInt(this.keys.indexOf(event.key) / 12, 10);
        this.handleNoteUp(note, 2 + octave + this.keyboardTranspose);
        // Set keyDown flag to false
        this.keysDown[event.key] = false;
        // Change color on keyboard
        if (
          2 + octave + this.keyboardTranspose > 0 &&
          2 + octave + this.keyboardTranspose < 4
        )
          this.$refs[
            "oct" + (2 + octave + this.keyboardTranspose)
          ].switchColorRelease(note);
      }
    },
    handleMIDIDown(note, octave, velocity) {
      if (octave > 0 && octave < 4)
        this.$refs["oct" + octave].switchColorPress(note);
      this.synths.list.forEach(synth => {
        //console.log("Play note: "+(note+octave)+" at velocity: "+velocity+" from MIDI")
        synth.playNote(note+octave, velocity);
      });
      //play filter envelopes
      for(let chain in this.filterChains){
        for( let filter in this.filterChains[chain]){
          this.filterChains[chain][filter].playNote()
        }
      }
      this.$emit("noteDown", note)
    },
    handleMIDIUp(note, octave) {
      //console.log("MIDI released "+note+octave)
      if (octave > 0 && octave < 4)
        this.$refs["oct" + octave].switchColorRelease(note);
      this.synths.list.forEach(synth => {
        synth.stopNote(note+octave);
      });
      //stop filter envelopes
      for(let chain in this.filterChains){
        for( let filter in this.filterChains[chain]){
          this.filterChains[chain][filter].stopNote()
        }
      }
    },

    handleNoteDown(note, octave, velocity = 100) {
      let finalOctave = parseInt(octave) + this.ocTranspose;
      //console.log(note+finalOctave+" pressed")
      this.synths.list.forEach(synth => {
        synth.playNote(note+finalOctave, velocity);
        //console.log(synth)
      });
      
      //play filter envelopes
      for(let chain in this.filterChains){
        for( let filter in this.filterChains[chain]){
          this.filterChains[chain][filter].playNote()
        }
      }
      this.$emit("noteDown", note+finalOctave)
    },
    handleNoteUp(note, octave) {
      let finalOctave = parseInt(octave) + this.ocTranspose;
      //console.log(note+finalOctave+" released")
      this.synths.list.forEach(synth => {
        synth.stopNote(note+finalOctave);
      });
      //stop filter envelopes
      for(let chain in this.filterChains){
        for( let filter in this.filterChains[chain]){
          this.filterChains[chain][filter].stopNote()
        }
      }
    },
  }
  
};
</script>

<style scoped>
.container {
  background-color: white;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  position: relative;
  border-top: .1vw solid gray
}

.span {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-row: 3;
  grid-column: span 3;
}
</style>