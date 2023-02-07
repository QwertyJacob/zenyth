<template>
    <div class="toolsHost" :style="this.toolsHost">
        <SpecAnalyzer />
        <Oscilloscope ref="oscilloscope"/>
        <Meter/>
    </div>
</template>
<!-- ./Tools/Meter.vue../Meter.vue -->
<script>
    import * as Tone from "tone";
    import Meter from './Meter.vue'
    import Oscilloscope from './Oscilloscope.vue'
    import SpecAnalyzer from './SpecAnalyzer.vue'
    export default {
    name: "ToolsHost",
    components: {
        Meter,
        Oscilloscope,
        SpecAnalyzer
    },
    data() {
        return {

        }
    },
    mounted() {

    },
    beforeDestroy() {
    },

    methods: {
        setOscilloscopeTiming(note){
            let mseconds = (1/Tone.Frequency(note))*1000;
            this.$refs["oscilloscope"].setTiming(mseconds)
        }

    },
    computed: {
        toolsHost(){
            return{
                background: this.colors.green.light
            }
        }
    }
}
</script>

<style>
    .toolsHost{
        display: grid;
        grid-template-rows: 40% 40% 20%;
    }
</style>