<template>
</template>

<script>
export default ({
  data() {
    return {
      midiAccess: null,
      midiInput: null,
      notes: [ "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B" ],
      lowestOctave: -2,
    };
  },
  mounted() {
    navigator.requestMIDIAccess()
      .then((midiAccess) => {
        if(midiAccess.inputs.size>0){
            this.midiAccess = midiAccess;
            this.midiInput = midiAccess.inputs.values().next().value;
            //console.log(this.midiInput);
            this.midiInput.addEventListener('midimessage', this.handleMidiMessage)
        }else{
            //console.log('There are no MIDI inputs available, if you need MIDI, reload the page with a MIDI keyboard connected');
        }
        
      });
  },
  methods: {
    handleMidiMessage(event){
        let [status, note, velocity] = event.data;
        let label = this.notes[note%12]
        let octave = (this.lowestOctave+parseInt(note/12,10))
        if (status == 144) {
            //console.log(`Keydown: note=${label}, velocity=${velocity}`);
            this.$emit("MIDIDown", label, octave, velocity);
        } else if (status == 128) {
            //console.log(`Keyup: note=${label}, velocity=${velocity}`);
            this.$emit("MIDIUp", label, octave);
        }
    },
  },
});
</script>

<style>

</style>