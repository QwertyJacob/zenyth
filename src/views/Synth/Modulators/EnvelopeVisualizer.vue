<template>
    <div class="envelope_container" :style="this.envelope_container">
        <div class="envelope" ref="envelope" :style="this.adsr">
            <div class="attack_area" :style="attack_area" @mousedown="attack_down()"></div>
            <div class="decay_area" :style="decay_area" @mousedown="decay_down()"></div>
            <div class="sustain_area" :style="sustain_area" @mousedown="sustain_down()"></div>
            <div class="release_area" :style="release_area" @mousedown="release_down()"></div>
            <div class="attack_dot" :style="attack_dot" @mousedown="attack_down()"></div>
            <div class="decay_dot" :style="decay_dot" @mousedown="decay_down()"></div>
            <div class="release_dot" :style="release_dot" @mousedown="release_down()"></div>

            <div class="attack" :style="this.attack">
                <div class="attack_color" :style="this.attack_Color"></div>
            </div>
            <div class="decay" :style="this.decay">
                <div class="decay_head" :style="this.decay_head"></div>
                <div class="decay_color" :style="this.decay_Color"></div>
            </div>
            <div class="sustain" :style="this.sustain">
                <div class="sustain_head" :style="this.sustain_head"></div>
                <div class="sustain_color" :style="this.sustain_Color"></div>
            </div>
            <div class="release" :style="this.release">
                <div class="release_color" :style="this.release_Color"></div>
            </div>

            <div class="space" :style="this.space"></div>

            <!--<div class="time_strech" :style="this.time_Stretch"></div>-->
        </div>
    </div>
</template>

<script>
export default {
    props: ['is_volume'],
    data() {
        return {
            //tempEvent: null,
            type: "envelope",
            parameters: {
                attack: 0.01,
                attackCurve: "linear",
                decay: 0.1,
                decayCurve: "linear",
                sustain: 0.1,
                releaseCurve: "linear",
                release: 0.1,
                sustain_lev: 0.5,
                duration: 4,
            },
            is_attack_down: false,
            is_decay_down: false,
            is_sustain_down: false,
            is_release_down: false,
            test: 10,
        };
    },
    mounted() {
        
    },
    methods: {

        handleMouseMove(e) {
            //console.log(e)
            if (this.isDragging) {
                this.tempEvent = e;
            }
            let p = this.parameters;
            if (this.is_attack_down) { // attack
                if (e.movementX > 0) {
                    /* console.log(p.attack,); */
                    p.attack = Math.min(p.attack + e.movementX / (this.$refs.envelope.offsetWidth), 1 - (p.decay + p.sustain + p.release));
                }
                if (e.movementX < 0) {
                   /*  console.log(p.attack); */
                    p.attack = Math.max(p.attack + e.movementX / (this.$refs.envelope.offsetWidth), 0);
                }
            }
            if (this.is_decay_down) { // decay
                if (e.movementX > 0) {
                   /*  console.log(p.attack,); */
                    p.decay = Math.min(p.decay + e.movementX / (this.$refs.envelope.offsetWidth), 1 - (p.attack + p.sustain + p.release));
                }
                if (e.movementX < 0) {
                    /* console.log(p.attack); */
                    p.decay = Math.max(p.decay + e.movementX / (this.$refs.envelope.offsetWidth), 0);
                }
                if (e.movementY > 0) {
                    p.sustain_lev = Math.max(p.sustain_lev - e.movementY / 100, 0);
                } else if (e.movementY < 0) {
                    p.sustain_lev = Math.min(p.sustain_lev - e.movementY / 100, 1);
                }
                /* console.log(p.sustain_lev); */
            }
            if (this.is_sustain_down) { // sustain
                if (e.movementX > 0) {
                    /* console.log(p.attack,); */
                    p.decay = Math.min(p.decay + e.movementX / (this.$refs.envelope.offsetWidth), 1 - (p.attack + p.sustain + p.release));
                }
                if (e.movementX < 0) {
                    /* console.log(p.attack); */
                    p.decay = Math.max(p.decay + e.movementX / (this.$refs.envelope.offsetWidth), 0);
                }
                if (e.movementY > 0) {
                    p.sustain_lev = Math.max(p.sustain_lev - e.movementY / 100, 0);
                } else if (e.movementY < 0) {
                    p.sustain_lev = Math.min(p.sustain_lev - e.movementY / 100, 1);
                }
                /* console.log(p.sustain_lev); */
            }
            if (this.is_release_down) { // release
                if (e.movementX > 0) {
                    /* console.log(p.attack,); */
                    p.release = Math.min(p.release + e.movementX / (this.$refs.envelope.offsetWidth), 1 - (p.decay + p.sustain + p.attack));
                }
                if (e.movementX < 0) {
                    /* console.log(p.attack); */
                    p.release = Math.max(p.release + e.movementX / (this.$refs.envelope.offsetWidth), 0);
                }
            }
            if (this.is_attack_down || this.is_decay_down || this.is_sustain_down || this.is_release_down) {

                let parameters = {
                    attack: this.parameters.attack * this.parameters.duration,
                    decay: this.parameters.decay * this.parameters.duration,
                    sustain: this.parameters.sustain_lev,
                    release: this.parameters.release * this.parameters.duration,
                }
                this.$emit("paramRefresh", parameters)
            }


        },
        handleMouseUp() {
            /*if (this.isDragging) {
              console.log(this.tempEvent.target)
              this.isDragging = false
            }*/
            //console.log("mouseUp");
            this.is_attack_down = false;
            this.is_decay_down = false;
            this.is_sustain_down = false;
            this.is_release_down = false;
        },
        attack_down() {
            if (!this.is_attack_down) this.is_attack_down = true;
        },
        decay_down() {
            if (!this.is_decay_down) this.is_decay_down = true;
        },
        sustain_down() {
            if (!this.is_sustain_down) this.is_sustain_down = true;
        },
        release_down() {
            if (!this.is_release_down) this.is_release_down = true;
        }
    },
    computed: {
        envelope_container() {
            let color = '';
            if (this.$props['is_volume']) color = this.colors.pink.medium
            else color = this.colors.azure.medium
            return {
                background: color
            }
        },
        adsr() {
            /* console.log(((this.parameters.attack - this.parameters.sustain) * 100).toFixed(2)) */
            let color = '';
            if (this.$props['is_volume']) color = '#f8e7e6'
            else color = '#ceeae7'
            return {
                display: "grid",
                opacity: '100%',
                background: color,
                gridTemplateColumns: this.parameters.attack * 100 + '% '
                    + Math.ceil(this.parameters.decay * 100) + '% '
                    + Math.ceil(this.parameters.sustain * 100) + '% '
                    + Math.ceil(this.parameters.release * 100) + '% '
                    + '10% '
            };
        },
        attack() {
            return {
                height: "100%",
                width: "100%",
                clipPath: "polygon(0% 100%, 100% 0%, 100% 100%)",
            };
        },
        decay() {
            return {
                height: "100%",
            };
        },
        sustain() {
            return {
                display: "grid",
                gridTemplateRows:
                    (1 - this.parameters.sustain_lev) * 100 +
                    "% " +
                    this.parameters.sustain_lev * 100 +
                    "%",
                height: "100%",
            };
        },
        release() {
            return {
                height: "100%",
                clipPath:
                    "polygon(0% " +
                    (1 - this.parameters.sustain_lev) * 100 +
                    "%, 0% 100%, 100% 100%)",
            };
        },
        attack_Color() {
            let color = '';
            if (this.$props['is_volume']) color = this.colors.pink.dark
            else color = this.colors.azure.dark
            return {
                height: "100%",
                background: color,
            };
        },
        decay_Color() {
            let color ='';
            if(this.$props['is_volume']) color= this.colors.pink.medium
            else color = this.colors.azure.medium
            return {
                position: 'relative',
                height: "100%",
                background: color,
                top: (this.parameters.sustain_lev - 1) * 100 + "%",
            };
        },
        sustain_Color() {
            let color ='';
            if(this.$props['is_volume']) color= this.colors.pink.light
            else color = this.colors.azure.light
            return {
                zIndex: '1',
                height: "100%",
                background: color,
            };
        },
        release_Color() {
            let color ='';
            if(this.$props['is_volume']) color= this.colors.pink.light
            else color = this.colors.azure.light
            return {
                height: "100%",
                background: color,
                opacity: '60%'
            };
        },
        decay_head() {
            let color ='';
            if(this.$props['is_volume']) color= '#f8e7e6'
            else color = '#ceeae7'
            return {
                position: 'relative',
                zIndex: '3',
                background: color,
                opacity:'100%',
                top:'-1%',
                clipPath: "polygon(0% 0%, 100% 100%, 100% 0%)",
                height: (1 - this.parameters.sustain_lev) * 100 + "%",
                width: "102%",
            };
        },
        sustain_head() {
            return {
                background: "transparent",
            };
        },

        attack_dot() {
            let color ='';
            let borderColor='';
            if(this.$props['is_volume']){ 
                color= this.colors.pink.dark
                borderColor = this.colors.pink.glow
                }
            else {
                color = this.colors.azure.dark
                borderColor = this.colors.azure.glow
            }
            return {
                border: '.1vw solid ' + borderColor,
                background: color,
                aspectRatio: "1/1",
                height: "7%",
                position: "absolute",
                zIndex: "4",
                borderRadius: "50%",
                left: this.parameters.attack * 100 - 1 + "%",
                top: "-2%",
            };
        },
        decay_dot() {
            let color ='';
            let borderColor='';
            if(this.$props['is_volume']){ 
                color= this.colors.pink.medium
                borderColor = this.colors.pink.dark
                }
            else {
                color = this.colors.azure.medium
                borderColor = this.colors.azure.dark
            }
            return {
                border: '.1vw solid ' + borderColor,
                background: color,
                aspectRatio: "1/1",
                height: "7%",
                position: "absolute",
                zIndex: "5",
                borderRadius: "50%",
                left: (this.parameters.decay + this.parameters.attack) * 100 - .9 + "%",
                top: (1 - this.parameters.sustain_lev) * 100 - 5 + "%",
            };
        },
        release_dot() {
            let color ='';
            let borderColor='';
            if(this.$props['is_volume']){ 
                color= this.colors.pink.glow
                borderColor = this.colors.pink.dark
                }
            else {
                color = this.colors.azure.glow
                borderColor = this.colors.azure.dark
            }
            return {
                border: '.1vw solid ' + borderColor,
                opacity: '60%',
                background: color,
                aspectRatio: "1/1",
                height: "7%",
                position: "absolute",
                zIndex: "2",
                borderRadius: "50%",
                left: (this.parameters.attack + this.parameters.decay + this.parameters.sustain + this.parameters.release) * 100 - 1 + "%",
                top: "95%",
            };
        },
        space() {
            return {
                background: "transparent",
            };
        },

        attack_area() {
            return {
                background: "transparent",
                aspectRatio: "1/1",
                width: "10%",
                position: "absolute",
                zIndex: "4",
                borderRadius: "50%",
                left: this.parameters.attack * 100 - 5 + "%",
            };
        },
        decay_area() {
            return {
                background: "transparent",
                aspectRatio: "1/1",
                width: "10%",
                position: "absolute",
                zIndex: "4",
                borderRadius: "50%",
                left: (this.parameters.decay + this.parameters.attack) * 100 - 5 + "%",
                top: (1 - this.parameters.sustain_lev) * 100 - 20 + "%",
            };
        },
        sustain_area() {
            return {
                background: "transparent",
                aspectRatio: "16/9",
                width: "10%",
                position: "absolute",
                zIndex: "4",
                borderRadius: "50%",
                left: (this.parameters.attack + this.parameters.decay + this.parameters.sustain) * 100 - 10 + "%",
                top: (1 - this.parameters.sustain_lev) * 100 - 12 + "%",
            };
        },
        release_area() {
            return {
                background: "transparent",
                aspectRatio: "1/1",
                width: "7%",
                position: "absolute",
                zIndex: "4",
                borderRadius: "50%",
                left: (this.parameters.attack + this.parameters.decay + this.parameters.sustain + this.parameters.release) * 100 - 5 + '%',
                top: '80%'
            };
        },
    }

}
</script>

<style scoped>
.envelope_container {
    position: relative;
    margin: 0.5vw 1vw 0.5vw 1vw;
}

.envelope {
    width: 100%;
    height: 100%;
    background-color: transparent;
    box-sizing: border-box;
}
</style>