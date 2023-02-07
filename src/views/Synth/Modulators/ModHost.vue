<template>
  <div class="modHost" :style="modHost">
     <VolEnvelope ref="volEnvelope"/>
    <template
      v-for="modulator in envList"
      :key="modulator.id">

       <Envelope
        :id="modulator.id"
        ref="envelopes"
      @isDraggableUpdate="handleDraggableUpdate"/>
    </template>
    <template
        v-for="modulator in lfoList"
        :key="modulator.id">


       <Lfo
          :id="modulator.id"
          ref="lfos"/>
    </template>
    <ModSelector
      @selection="changeSelection"
      ref="modSelector"/>
  </div>
</template>

<script>
import * as Tone from "tone";
import Envelope from "./Envelope.vue";
import Lfo from "./Lfo.vue";
import VolEnvelope from "./VolEnvelope.vue";
import ModSelector from "./ModSelector.vue";
import { isProxy, toRaw } from 'vue';

export default {
  components: {
    VolEnvelope,
    Envelope,
    Lfo,
    ModSelector,
  },
  data() {
    return {
      name: "modHost",
      //number of total modulators

      //visible modulator
      selection: 'volEnvelope',
      selectionType: null,

      //list of modulators
      envList: [],
      lfoList: [],
    };
  },
  created() {
    //create arrays of modulators
    for (let i = 1; i < this.nEnvelopes+1; i++) {
      this.envList.push({ id: i, ref: i });
    }
    for (let i = 1; i < this.nLfo+1; i++) {
      this.lfoList.push({ id: i, ref: i });
    }
    //console.log(toRaw(this.modulatorList));
  },
  mounted() {
    //unhide main volume modulator
    this.$refs.volEnvelope.unHide();
    //console.log(this.$refs.volEnvelope)

    //listens to link and unlink events
    document.addEventListener("link", this.handleLink)
    document.addEventListener("unLink", this.handleUnlink)
  },
  computed: {
    modHost() {
      return{
        background: this.colors.gray.glow,
      }
    }
  },
  methods: {
    handleDraggableUpdate(isDraggable){
      this.$refs.modSelector.isDraggableUpdate(isDraggable)
    },
    handleNewOsc(){
      //initialize volEnvelope on all synth when a new oscillator is added
      this.$refs.volEnvelope.handleNewOsc();
    },
    handleMouseUp(e){
      if(this.selection==='volEnvelope'){
        this.$refs.volEnvelope.handleMouseUp(e)
      }else{
        if(this.selectionType==="envelope"){
          toRaw(toRaw(this.$refs.envelopes)[this.selection-1]).handleMouseUp(e);
        }
        if(this.selectionType==="lfo"){
          toRaw(toRaw(this.$refs.lfos)[this.selection-1]).handleMouseUp(e);
        }
      }
    },
    handleMouseMove(e){
      if(this.selection==='volEnvelope'){
        this.$refs.volEnvelope.handleMouseMove(e)
      }else{
        if(this.selectionType==="envelope"){
          toRaw(toRaw(this.$refs.envelopes)[this.selection-1]).handleMouseMove(e);
        }
        if(this.selectionType==="lfo"){
          toRaw(toRaw(this.$refs.lfos)[this.selection-1]).handleMouseMove(e);
        }
      }
    },
    changeSelection(id, type) {
      //console.log("selected "+id)
      //console.log(this.$refs)

      //hide old modulator
      if(this.selection==='volEnvelope'){
        this.$refs.volEnvelope.hide()
      }else{
        if(this.selectionType==="envelope"){
          toRaw(toRaw(this.$refs.envelopes)[this.selection-1]).hide();
        }
        if(this.selectionType==="lfo"){
          toRaw(toRaw(this.$refs.lfos)[this.selection-1]).hide();
          toRaw(toRaw(this.$refs.lfos)[this.selection-1]).stopOscilloscope();
        }
      }


      //show new modulator
      if(id==='volEnvelope'){
        this.$refs.volEnvelope.unHide()
      }else{
        if(type==="envelope"){
          toRaw(toRaw(this.$refs.envelopes)[id-1]).unHide();
        }
        if(type==="lfo"){
          toRaw(toRaw(this.$refs.lfos)[id-1]).unHide();
        }
      }


      this.selection = id;
      this.selectionType = type;
      
    },

    //handlers for drag and drop
    handleLink(event){
      //console.log("link")
      let data = event.detail
      //console.log(data)
      //console.log(this.synths)
      this.$refs[data.modulator.type+"s"][data.modulator.id-1].link(data.object, data.target, data.color)
    },
    handleUnlink(event){
      //console.log("unLink")
      let data = event.detail
      this.$refs[data.modulator.type+"s"][data.modulator.id-1].unLink(data.object, data.target)

    }

  },
};
</script>

<style scoped>
.modHost {
  grid-column: span 2; /* takes 2 spaces horizontally*/
  position: relative;
  display: grid;
  grid-template-rows: 80% 20%;
  grid-template-columns: 100%;
}
</style>