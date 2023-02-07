<template>
  <div class="filter">
    <div class="modDot" :style="computedModulation('filter')" @click.shift.stop="unlinkMod('filter')"
         v-text="computedModText('filter')"></div>
    <div class="filter_back" ref="filter_back"
         >

    </div>
    <div class="filter_logo" :style="this.filter_logo" @mousedown="logoDown">
      <div v-if="is_logoDown && type != 'peaking'" class="logo_text">
        {{ ((1 - this.resonance) * 100).toFixed() + "%" }}
      </div>
      <div v-if="is_logoDown && type == 'peaking'" class="logo_text">
        {{ ((1 - 2 * this.resonance) * 100).toFixed() + "%" }}
      </div>
      <!--<div v-if="type==='peaking'" class="logo_BD_mask" :style="computedBDMaks"></div> -->
      <div class="logo_glow" :style="computedGlow"></div>

      <div class="logo_border"
           @dragenter="handleDragEnter('filter')" @dragleave="handleDragLeave('filter')"
           @dragenter.prevent @dragover.prevent @drop="handleDrop($event, 'filter')"
      ></div>
      <div class="logo" :style="logo">
        <div v-if="is_logoDown" class="logo_text_back" :style="this.logo_text_back"></div>
        <div
            v-if="type === 'lowpass'"
            class="logo_LP"
            :style="computedLP"
        ></div>
        <div
            v-if="type === 'highpass'"
            class="logo_HP"
            :style="computedHP"
        ></div>
        <div v-if="type === 'peaking'" class="logo_BD_back"></div>
        <div
            v-if="type === 'peaking'"
            class="logo_BD_circle"
            :style="computedBDCircle"
        ></div>
      </div>
    </div>
  </div>
</template>

<script>
import MyFilter from "@/views/Synth/Filters/MyFilter";

export default {
  props: ["filter_type", "chainId", "chainColor", "id"],

  data() {
    return {
      color: this.colors.yellow,
      type: this.filter_type,
      cutoff: 0.5,  //DON'T CHANGE FROM HERE, CHANGE PRESET INSIDE MYFILTER
      resonance: 0.5, //DON'T CHANGE FROM HERE, CHANGE PRESET INSIDE MYFILTER
      is_logoDown: false,

      modulator: null,
    }
  },
  mounted() {
    // mouse event listeners
    document.addEventListener("mousemove", this.onMouseMove);
    document.addEventListener("mouseup", this.onMouseUp);

    //console.log(this.$props)

    // -------------- AUDIO ---------------
    this.filter = new MyFilter(this.type, this.cutoff, this.resonance);

    this.cutoff = this.filter.getCutoff()
    this.resonance = this.filter.getResonance()


    //console.log(this.chainId+" "+this.id)
    //Inserting filter in global variable
    this.filterChains[this.chainId][this.id] = this.filter;

    if (this.id === this.nFiltersXchain - 1 && this.chainId === this.nFilterChains - 1) {
      this.$emit("filtersMounted");
    }

  },

  methods: {
    //------------DRAG AND DROP LOGIC---------
    handleDrop(event, target = "") {
      if (this.modulator === null) {
        let data = JSON.parse(event.dataTransfer.getData("data"));
        this.modulator = {color: data.color, id: data.id, type: data.type}
        //console.log("RECEIVED HANDLEDROP, THIS.MODULATOR=")
        //console.log(this.modulator)
        document.dispatchEvent(new CustomEvent("link", {
          detail: {
            object: this.filter,
            target: target,
            color: this.color["light"],
            modulator: {type: this.modulator.type, id: this.modulator.id}
          }}
        ))
      }

    },
    handleDragEnter(target) {
      //todo: highlight object when dragging on it
      //console.log("Dragging over " + target)
    },
    handleDragLeave(target) {
      //console.log("Dragging out of " + target)
    },
    unlinkMod(target) {
      //todo: CALL BACK ENVELOPS TO UNLINK
      document.dispatchEvent(new CustomEvent("unLink", {
            detail: {
              object: this.filter,
              target: target,
              modulator: {type: this.modulator.type, id: this.modulator.id}
            }
          }
      ))

      //re-hide link dot
      this.modulator = null;

    },
    //--------DRAG AND DROP STYLING--------
    computedModulation(target = "") {
      if (this.modulator) {
        return {
          width: "1vw",
          height: "1vw",
          borderRadius: "50%",
          backgroundColor: this.modulator.color,
          position: "absolute",
          left: "10%",
          zIndex: "1",
          top: "10%",
        };
      } else {
        return {
          display: "none",
          width: "0%",
          height: "0%",
        }
      }
    },
    computedModText(target = "") {
      if (this.modulator) {
        return this.modulator.id
      } else return "";
    },

    //------------------------------------

    // ----------- USER EVENTS -----------
    onMouseMove(event) {
      if (this.is_logoDown) {
        if (event.movementY < 0) {
          // Mouse is moving up
          this.resonance = Math.max(this.resonance + event.movementY / 100, 0);
          //console.log("moving up");
        } else {
          // Mouse is moving down
          this.resonance = Math.min(this.resonance + event.movementY / 100, 1);
        }
        if (event.movementX < 0) {
          // Mouse is moving right
          this.cutoff = Math.max(
              this.cutoff + Math.floor(event.movementX) / 100,
              0
          );
        } else if (event.movementX > 0) {
          // Mouse is moving left
          this.cutoff = Math.min(
              this.cutoff + Math.floor(event.movementX) / 100,
              1
          );
        }
        // ----------- audio ---------
        this.filter.setResonance(this.resonance);
        this.filter.setCutoff(this.cutoff);
      }
    },

    onMouseUp() {
      if (this.is_logoDown) this.is_logoDown = false;
      document.body.style.cursor = "pointer";
    },
    logoDown() {
      if (!this.is_logoDown) {
        this.is_logoDown = true;
        document.body.style.cursor = "none";
      }
    },

    // ----------- AUDIO SETTERS--------------
    setCutoff(cutoff = this.cutoff) {
      this.cutoff = cutoff;
      this.filter.setCutoff(this.cutoff)
    },

    setResonance(resonance = this.resonance) {
      this.resonance = resonance
      this.filter.setResonance(this.resonance)
    },

    connect(destination) {
      this.filter.connect(destination);
    },

    disconnect(destination) {
      this.filter.disconnect(destination)
    },

    // ------------ GETTERS SETTERS -------------
    getToneFilter() {
      return this.filter.getToneFilter();
    },

    getMyFilter() {
      return this.filter;
    },
  },

  computed: {
    computedHeadStyle() {
      return {
        left: 0.7 * this.cutoff * 100 + 13.5 + "%",
      };
    },
    computedGlow() {
      if (this.filter_type === "peaking" && this.resonance < 0.5) {
        return {
          opacity: 1 - 2 * this.resonance,
          background: this.colors.yellow.light,
        };
      } else if (this.filter_type === "peaking" && this.resonance >= 0.5) {
        return {
          opacity: 2 * this.resonance - 1,
          background: this.colors.yellow.light,
        };
      } else {
        return {
          opacity: 1 - this.resonance,
          background: this.colors.yellow.light,
        };
      }
    },
    computedLP() {
      return {
        transform: "translateX(" + (-100 + this.cutoff * 100)  + "%)",
      };
    },
    computedHP() {
      return {
        transform: "translateX(" + this.cutoff * 100 + "%)",
      };
    },
    computedBDMaks() {
      let clip = "";
      if (this.resonance > 0.5)
        clip = "polygon(0% 0%, 100% 0%, 100% 50%, 0% 50%)";
      else if (this.resonance < 0.5)
        clip = "polygon(0% 50%, 0% 100%, 100% 100%, 100% 50%)";
      else clip = "polygon(0% 0%, 100% 0%, 100% 50%, 0% 50%)";
      return {
        clipPath: clip,
      };
    },
    computedBD() {
      if (1 - this.resonance >= 0.5) {
        return {
          //transform: 'translateY(' + (this.resonance > .5 ? -100 + this.resonance * 100 : this.resonance * 100) + '%)',
          height: (1 - this.resonance) * 100 + "%",
          transform: "translateX(" + this.cutoff * 100 + "%)",
        };
      } else {
        return {
          //transform: 'translateY(' + (this.resonance > .5 ? -100 + this.resonance * 100 : this.resonance * 100) + '%)',
          height: (1 - this.resonance - 0.5) * 100 + "%",
          transform: "translateX(" + (this.cutoff - 0.5) * 100 + "%)",
        };
      }
    },
    computedBDCircle() {
      return {
        transform:
            "translate(" +
            (this.cutoff - 0.5) * 100 +
            "%, " +
            (this.resonance - 0.5) * 100 +
            "%)",
        //transform: 'translateX('+(this.cutoff-.5)*100+'%)'
      };
    },
    filter_logo() {
      return {
        background: this.colors.yellow.glow
      }
    },
    logo() {
      return {
        background: this.colors.yellow.light
      }
    },
    logo_text_back() {
      return {
        background: this.colors.yellow.light,
      }
    }
  },
};
</script>

<style scoped>
.modDot {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 0.8vw;
  text-align: center;
  box-sizing: border-box;
  border: .06vw solid black;
}
.filter {
  position: relative;
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 4;
}

.filter_back {
  position: absolute;
  display: flex;
  flex-direction: column;
  width: 80%;
  height: 80%;
  background-color: transparent;
  justify-content: center;
  align-items: center;
}

.filter_logo {
  position: absolute;
  display: flex;
  flex: 5;

  height: 100%;
  top: 0;
  aspect-ratio: 1/1;
  border-radius: 50%;
  z-index: 0;
  clip-path: circle(50%);
  justify-content: center;
  align-items: center;
}

.logo_border {
  position: absolute;
  height: 70%;
  aspect-ratio: 1/1;
  z-index: 5;
  border-radius: 50%;
  border: 0.1vw solid #3b210e;
}

.logo {
  position: absolute;
  height: 70%;
  aspect-ratio: 1/1;
  z-index: 3;
  clip-path: circle(50%);
}

.logo_glow {
  position: absolute;
  height: 90%;
  aspect-ratio: 1/1;
  border-radius: 50%;
  z-index: 1;
  filter: blur(0.3vw);
}

.logo_text {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1vw;
  font-weight: bold;
  position: absolute;
  height: 100%;
  aspect-ratio: 1/1;
  border-radius: 50%;
  color: black;
  opacity: 100%;
  background-color: black;
  z-index: 5;
  background: rgba(255, 255, 255, 0.1);
}

.logo_text_back {
  position: absolute;
  z-index: 6;
  left: 15%;
  top: 30%;
  width: 70%;
  height: 40%;
  opacity: 100%;
  border-radius: 10%;
}

.logo_LP {
  opacity: 60%;
  display: flex;
  position: absolute;
  height: 100%;
  aspect-ratio: 1/1;
  border-radius: 50%;
  border: .1vw solid black;
  background-color: #faf8ef;
  z-index: 1;
}

.logo_HP {
  opacity: 60%;
  display: flex;
  position: absolute;
  height: 100%;
  aspect-ratio: 1/1;
  border-radius: 50%;
  border: .1vw solid black;
  background-color: #faf8ef;
  z-index: 1;
}
.logo_BD_circle {
  opacity: 60%;
  position: absolute;
  width: 100%;
  aspect-ratio: 1/1;
  border: .1vw solid black;
  border-radius: 50%;
  background-color: #faf8ef;
  z-index: 5;
}

.logo_BD_mask {
  opacity: 60%;
  position: absolute;
  height: 100%;
  width: 100%;
  border: .1vw solid black;
  background-color: #ffebd2;
  z-index: 2;
}

.logo_BD {
  display: flex;
  position: absolute;
  height: 100%;
  aspect-ratio: 1/1;
  border-radius: 50%;
  background-color: white;
  z-index: 1;
}

.logo_BD_line {
  position: absolute;
  width: 100%;
  height: 4%;
  top: 48%;
  filter: blur(0.02vw);
  border-radius: 30%;
  background-color: #e58138;
  z-index: 5;
}


.logo_BD_circle {
  position: absolute;
  width: 100%;
  aspect-ratio: 1/1;

  border-radius: 50%;
  background-color: #faf8ef;
  z-index: 5;
}
</style>