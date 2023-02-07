<template>
    <div class="octave" @mousedown="handleMouseDown" @mouseup="handleMouseUp"  @mouseover="handleMouseOver">
        <div class="woctave">
            <div id="C" ref="C" @mouseleave="handleMouseLeave" class="wkey wUnpressed"></div>
            <div id="D" ref="D" @mouseleave="handleMouseLeave" class="wkey wUnpressed"></div>
            <div id="E" ref="E" @mouseleave="handleMouseLeave" class="wkey wUnpressed"></div>
            <div id="F" ref="F" @mouseleave="handleMouseLeave" class="wkey wUnpressed"></div>
            <div id="G" ref="G" @mouseleave="handleMouseLeave" class="wkey wUnpressed"></div>
            <div id="A" ref="A" @mouseleave="handleMouseLeave" class="wkey wUnpressed"></div>
            <div id="B" ref="B" @mouseleave="handleMouseLeave" class="wkey wUnpressed"></div>
        </div>
        <div class="boctave">
            <div id="C#" ref="Cs" @mouseleave="handleMouseLeave" class="bkey bUnpressed" style="grid-column: 3 / 5"></div>
            <div id="D#" ref="Ds" @mouseleave="handleMouseLeave" class="bkey bUnpressed" style="grid-column: 6 / 8"></div>
            <div id="F#" ref="Fs" @mouseleave="handleMouseLeave" class="bkey bUnpressed" style="grid-column: 12 / 14"></div>
            <div id="G#" ref="Gs" @mouseleave="handleMouseLeave" class="bkey bUnpressed" style="grid-column: 15 / 17"></div>
            <div id="A#" ref="As" @mouseleave="handleMouseLeave" class="bkey bUnpressed" style="grid-column: 18 / 20"></div>
        </div>   
    </div>
</template>

<script>
export default {
    name: "Octave",
    props: {
        octaveNumber: Number,
    },
        data() {
        return {
        }
    },
    methods: {
        handleMouseLeave(e){
            if(this.$parent.mouseDown){
                this.notifyUp(e.currentTarget)
            }    
        },
        handleMouseUp(e) {
            this.$parent.mouseDown= false;
            this.notifyUp(e.target)
            //console.log("mouse is now up")
        },
        handleMouseDown(e) {
            this.$parent.mouseDown= true;
            this.notifyDown(e.target)
            //console.log("mouse is now down")
        },
        handleMouseOver(e){
            if(this.$parent.mouseDown){
                //console.log(e.target)
                this.notifyDown(e.target)

            }
            //console.log("mouseDown is "+this.$parent.mouseDown+" and is moving")
        },
        notifyDown(key){
            //emitting cusom event "keyDown"
            this.$emit("virtualKeyDown",key.id,this.octaveNumber)
            this.switchColorPress(key.id)
        },
        switchColorPress(note){
            if(note.includes("#")){
                note = note.replace("#","s")
            }
            let key = this.$refs[note];
            //change color of key when pressed
            if (key.classList.contains('wkey')){
                key.classList.remove("wUnpressed")
                key.classList.add("pressed")
            }else{
                key.classList.remove("bUnpressed")
                key.classList.add("pressed")
            }     
        },
        notifyUp(key){
            //emitting cusom event "keyUp"
            this.$emit("virtualKeyUp",key.id,this.octaveNumber)
            this.switchColorRelease(key.id)
            //not needed, called in PianoKeyboard (when clicking with the mouse on keyboard all keys are released (color))
        },
        switchColorRelease(note){
            if(note === "all"){
                for (const ref of Object.values(this.$refs)) {
                    if (ref.classList.contains('wkey')){
                        ref.classList.add("wUnpressed")
                        ref.classList.remove("pressed")
                    }else{
                        ref.classList.add("bUnpressed")
                        ref.classList.remove("pressed")
                    }
                }  
            }else{
                if(note.includes("#")){
                note = note.replace("#","s")
                }
                let key = this.$refs[note];
                //change color of key when released
                if (key.classList.contains('wkey')){
                    key.classList.add("wUnpressed")
                    key.classList.remove("pressed")
                }else{
                    key.classList.add("bUnpressed")
                    key.classList.remove("pressed")
                }
            }
            
        }
    }
}
</script>

<style>

    .octave{
        width: 100%;
        height: 100%;
        box-sizing: border-box;
        position:relative;   
    }
    .woctave{
        position: absolute;
        width: 100%;
        height: 100%;
        display: flex;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;      
    }
    .boctave{
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        display: grid;
        grid-template-columns: repeat(21, 1fr);  
        grid-template-rows: 100%;  
    }
    .wkey{
        width: 100%;
        height: 100%;
        border: solid black 0.06vw;
        box-sizing: border-box;
        border-radius: 0.2vw;
        z-index: 1;
    }
    .wUnpressed{
        background-color:#f8e7e6;
        opacity: 40%;
    }
    .bUnpressed{
        background-color:#645352;
    }
    .pressed{
        background-color:#f3a59a;
    }
    .bkey{
        width: 100%;
        height: 60%;
        border: solid black 0.06vw;
        box-sizing: border-box;
        border-radius: 0.2vw;
        position: relative;
        z-index: 1;
    }
    

</style>