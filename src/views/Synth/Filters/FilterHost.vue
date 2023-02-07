<template>
  <div class="filterHost" :style="this.filterHost">
    <template v-for="(chain) in this.chainList" :key="chain.id" :item="chain">
        <FilterChain :ref="chain.ref" :id="chain.id" :color="chain.color" @filterInitialized="initConnections()"/>
       <!-- todo: remove <FilterChain :ref="chain.ref" :id="chain.id" :color="chain.color" @filterInitialized="handleFilterInitialized" /> -->
      </template>
  </div>
</template>

<script>
import FilterChain from './FilterChain.vue'
import * as Tone from "tone";
import { isProxy, toRaw } from "vue";

export default {
  name: "FilterHost",
  components: {
    FilterChain,
  },

  data() {
    return {
      chain_colors: [],
      chainList: [],
      nFilterChains: 3,
    }
  },
  mounted() {
    this.chain_colors = [this.colors.purple.medium, this.colors.green.medium, this.colors.pink.medium]
    for (let index = 0; index < this.nFilterChains; index++) {
      this.chainList.push({ id: index, ref:"chain"+index, color: this.chain_colors[index]})
    }
    // console.log(this.filterChains)
  },
  computed: {
    filterHost(){
      return {
        background: this.colors.yellow.glow
      }
    }
  },
  methods: {
    initConnections(){
      //console.log("filter host init connections")
      for (let key in this.$refs) {
        //console.log(toRaw(this.$refs[key][0]))
        toRaw(this.$refs[key][0]).initConnections()
      }
      this.$emit('filterInitialized')
      //console.log("filters initilised")
      //console.log("filters:")
      //console.log(this.filterChains)
      //console.log("fx:")
      //console.log(this.fxChains)
    }
  }
}

// access a parameter of a vue component child from its father
</script>

<style scoped>

.filterHost {
  display: flex;
  flex-direction: column;
}
</style>