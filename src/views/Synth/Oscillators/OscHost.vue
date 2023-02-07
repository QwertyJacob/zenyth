<template>
  <div class="oscHost" :style="this.oscHost">
    <div class="scrollable">
      <template v-for="(osc) in this.oscList" :key="osc.id" :item="osc">
        <Osc
            :ref="osc.ref"
            :id="osc.id"
            @disposed="removeOsc"
            @newOsc="handleNewOsc"
        />
      </template>
      <div class="voidContainer" @click="addOsc">
        <div class="voidBorder" :style="voidBorder">
          <div class="oscVoid">+</div>
        </div>
      </div>
      <div  v-if="this.oscList.length <= 1" class="voidContainer" @click="addOsc">
        <div class="voidBorder" :style="voidBorder">
          <div class="oscVoid">+</div>
        </div>
      </div>
      <div  v-if="this.oscList.length <= 0" class="voidContainer" @click="addOsc">
        <div class="voidBorder" :style="voidBorder">
          <div class="oscVoid" >+</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Osc from "./Osc.vue";
import Vue from "vue";
import {isProxy, toRaw} from "vue";

export default {
  components: {
    Osc,
  },

  data() {
    // data structure oscillators list
    return {
      oscList: [],
      name: "oscHost",
      i: 0,
    };
  },

  mounted() {
    this.addOsc();
    this.addOsc();
  },

  methods: {
    handleNewOsc(){
      this.$emit("newOsc")
    },
    initConnections() {
      for (let key in this.$refs) {
        //console.log(toRaw(this.$refs[key][0]))
        toRaw(this.$refs[key][0]).initConnections()

      }
    },
    addOsc() {
      //TO-DO REWRITE
      let ref = "osc" + this.i;
      this.oscList.push({id: this.i, ref: ref});
      //console.log("adding osc" + this.i)
      //console.log(this.oscList);
      this.i += 1;
    },

    removeOsc(id) {
      //console.log("removing oscillator" + id);
      // Remove the oscillator from the list
      let index = 0
      this.oscList.forEach(osc => {
        if (osc.id === id) index = this.oscList.indexOf(osc)
      });
      this.oscList.splice(index, 1);
    },
  },
  unmounted() {
  },
  computed: {
    oscHost(){
      return{
        background: '#f8e7e6',
      }
    },
    voidBorder(){
      return{
        background: this.colors.pink.glow,
        border: '.1vw solid' + this.colors.pink.dark
      }
    }
  }
};
</script>

<style scoped>

.scrollable {
  font-size: 2vw;
  justify-content: center;
  overflow-y: scroll;
  /* Add a vertical scrollbar */
  overflow-x: hidden;
  width: 100%;
  height: 100%;
}

.voidContainer {
  width: 100%;
  height: calc(100% / 3);
  position: relative
}

.voidBorder {
  height: 100%;
  padding: 0.3vw;
  box-sizing: border-box;
}

.oscVoid {
  border: 0.1vw solid #c2847b;
  color: #c2847b;
  background: #f8e7e6;
  border-radius: 0.3vw;
  box-sizing: border-box;
  height: 100%;
  justify-content: center;
  display: flex;
  align-items: center;
  font-size: 2vw;
}
.oscVoid:hover {
  border: 0.1vw solid #63443e;
  color: #63443e;
  border-radius: 0.3vw;
  box-sizing: border-box;
  height: 100%;
  justify-content: center;
  display: flex;
  align-items: center;
  font-size: 2vw;
}

/*  hide the scrollbar because cannot be resized in Chrome, Safari (breaks % layout)*/
.scrollable::-webkit-scrollbar {
  display: none;
}
</style>