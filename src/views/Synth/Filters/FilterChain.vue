<template>
  <div class="filterChain">
    <div class="chainline" :style="this.chainLine"></div>
    <div class = "chainDot" :style="this.chainDot"></div>
    <div class="chainHead" ref="chainHead"></div>
    <template v-for="(filter) in this.filterList" :key="filter.id" :item="filter">
      <Filter :ref="filter.ref" :chainId="this.id" :id="filter.id" :filter_type="filter.type" :chainColor="this.color"
              @filtersMounted="this.handleFiltersMounted()"/>
    </template>
    <div class="chainTail">
      <div></div>
      <div class="routing-btn fx_chain_1" :style="fx_chain_1" @click="setRouting(0)"></div>
      <div class="routing-btn fx_chain_2" :style="fx_chain_2" @click="setRouting(1)"></div>
      <div class="routing-btn fx_chain_3" :style="fx_chain_3" @click="setRouting(2)"></div>
      <div></div>
    </div>
  </div>
</template>

<script>
// I want to modify a variable of a vue component from its father that is a vue component too
import Filter from './Filter.vue'
import {getDestination} from "tone";
import {isProxy, toRaw} from "vue";

const filterTypes = ["highpass", "peaking", "lowpass"]

export default {
  ref: "FilterChain",
  components: {
    Filter,
  },
  props: ["color", "id"],
  data() {
    return {
      filterList: [],
      nFilters: 3,
      isFxChainRouteActive: [true, false, false]
    }
  },
  mounted() {
    //console.log("mounting filter chain" + this.id)
    for (let index = 0; index < this.nFiltersXchain; index++) {
      this.filterList.push({id: index, ref: "filter" + index, type: filterTypes[index]})
    }
  },

  computed: {
    fx_chain_1() {
      let color = ''
      if (this.isFxChainRouteActive[0])
        color = this.colors.purple.light
      else
        color = this.colors.yellow.glow
      return {
        background: color,
        border: '.1vw solid' + this.colors.gray.dark
      }
    },
    fx_chain_2() {
      let color = ''
      if (this.isFxChainRouteActive[1])
        color = this.colors.green.medium
      else
        color = this.colors.yellow.glow
      return {
        background: color,
        border: '.1vw solid' + this.colors.gray.dark
      }
    },
    fx_chain_3() {
      let color = ''
      if (this.isFxChainRouteActive[2])
        color = this.colors.pink.light
      else
        color = this.colors.yellow.glow
      return {
        background: color,
        border: '.1vw solid' + this.colors.gray.dark
      }
    },
    chainLine(){
      return {
        top: '49%',
        left: '5%',
        width: '88%',
        height: '.2vw',
        position:'absolute',
        background: this.$props['color'],
        zIndex:'0',
        borderRadius:'10%'
      }
    },
    chainDot(){
      return {
        top: '45%',
        left: '3.5%',
        height: '10%',
        aspectRatio: '1/1',
        position: 'absolute',
        zIndex: '3',
        background: this.$props['color'],
        borderRadius: '50%',
      }
    }

  },

  methods: {
    handleFiltersMounted() {
      if (this.id === this.nFilterChains - 1) {
        this.$emit("filterInitialized")
      }
    },
    // -------- AUDIO -------x
    initConnections() {
      //console.log("filter chain init connections")
      for (let index = 0; index < this.nFiltersXchain - 1; index++) {
        this.filterChains[this.id][index].connect(this.filterChains[this.id][index + 1].getToneFilter());
        //console.log("connected " + this.filterChains[this.id][index] + " to " + this.filterChains[this.id][index + 1])
      }
      // connect chain of filters output to chain each chain of effects
      this.filterChains[this.id][this.nFilters - 1].connect(this.fxChains[0][0]); // init connection to first fx chain
      this.isFxChainRouteActive[0] = true;
      /*for (let i = 0; i < this.nFxChains; i++) { // init connection to all chains
        this.filterChains[this.id][this.nFilters - 1].connect(this.fxChains[i][0]);
        this.isFxChainRouteActive[i] = true;
      }*/
    },

    setRouting(id) {
      //console.log("chain click - id: " + id);
      try {
        if (this.isFxChainRouteActive[id]) {
          //console.log("disconnect from: " + this.fxChains[id][0] + " " + id);
          this.filterChains[this.id][this.nFilters - 1].disconnect(
              this.fxChains[id][0]
          );
        } else {
          //console.log("connect to: " + this.fxChains[id][0] + " " + id);
          this.filterChains[this.id][this.nFilters - 1].connect(
              this.fxChains[id][0]
          );
        }
      } catch (e) {
        console.log(
            "error: " + e + "\nCHAIN FILTERS CONNECTION TO FX CHAIN " + id + " UNSUCCESSFUL. Can't connect to " + this.fxChains[id][0]
        );
      }
      this.isFxChainRouteActive[id] = !this.isFxChainRouteActive[id];
    },
  }
}

</script>

<style scoped>

.filter {
  flex: 4;
}

.filterChain {
  position:relative;
  flex: 1;
  display: flex;
  flex-direction: row;
}

.chainHead {
  flex: 1;
  background-color: transparent;
}

.chainTail {
  flex: 1;
  display: inline-grid;
  align-items: center;
  justify-items: center;
  flex-direction: column;
  background-color: transparent;
}

.routing-btn {
  width: 50%;
  aspect-ratio: 1/1;
  border-radius: 50%;
}

</style>