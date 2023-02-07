import {Synth, Envelope, Gain, Meter, Frequency, LFO} from 'tone'
import {nextTick} from 'vue';
import * as Tone from 'tone'
import {isProxy, toRaw} from 'vue';

const max_partials_num = 50;
const vol_damp_factor = 0.5;

export default class MyPolySynth {
    constructor(destination = null, nVoices = 16) {

        this.destination = destination;


        //data of all modulators that could potentially be linked to the parameters of the synth
        this.modulatorsData = {
            envelope: {
                vol: {
                    amount: 1,
                    parameters: {
                        attack: 1,
                        decay: 0.3,
                        sustain: 0.8,
                        release: 1
                    }
                },
                mod: {
                    amount: 0,
                    parameters: {
                        attack: 0.05,
                        decay: 0.1,
                        sustain: 1,
                        release: 0.2
                    }
                },
                pitch: {
                    amount: 0,
                    parameters: {
                        attack: 0.05,
                        decay: 0.1,
                        sustain: 1,
                        release: 0.2
                    }
                },
            },
            lfo: {
                vol: {
                    amount: 0,
                    parameters: {
                        frequency: 10,
                        waveform: "sine",
                        min: 0,
                        max: 1
                    }
                },
                mod: {
                    amount: 0,
                    parameters: {
                        frequency: 10,
                        waveform: "sine",
                        min: 0,
                        max: 1
                    }
                },
                pitch: {
                    amount: 0,
                    parameters: {
                        frequency: 10,
                        waveform: "sine",
                        min: 0,
                        max: 1
                    }
                },
            }
        }

        //preset with which all voices of polyphony will be created
        this.synthPreset = {
            type: "",
            waveform: "sine",
            vol: -12,
            transpose: 0,
            mod: 0,
            partials: "",
            pan: ""
        }


        //modulation effect
        //this.crusher = new Tone.BitCrusher(3)


        this.dampNode = new Gain(vol_damp_factor);
        //all polyphony voices are connected here

        //console.log(Tone.dbToGain(this.synthPreset.vol))
        this.gainNode = new Gain(1);

        //list of polyphony voices
        this.allVoices = [] //always holds reference to all voices
        this.freeVoices = []    //holds reference to free voices
        this.busyVoices = {}    //holds reference to busy voices, key=note, value=voice
        this.nVoices = nVoices  //used to initialize, taken from globalProperties
        this.lastNotes = Array(this.nVoices)  //stores last nVoices played

        //INIT VOICES
        this.initVoices()


        // connect gainNode to destination
            this.gainNode.connect(this.dampNode)
            //this.crusher.connect(this.dampNode)
            this.dampNode.connect(this.destination)
    }

    initVoices() {
        //for each voice

        for (let index = 0; index < this.nVoices; index++) {

            //initializing empty modulators matrix
            let modulators = {
                envelope: {
                    vol: {amount: 1, signal: null, scale: null},
                    mod: {amount: 0, signal: null, scale: null},
                    pitch: {amount: 0, signal: null, scale: null},
                },
                lfo: {
                    vol: {amount: 0, signal: null, scale: null},
                    mod: {amount: 0, signal: null, scale: null},
                    pitch: {amount: 0, signal: null, scale: null},
                }
            }

            let lfoGain = new Gain()
            lfoGain.connect(this.gainNode) //USED TO CONNECT LFO TO VOICE VOLUME


            //creating gain and synth
            let gain = new Gain(1).connect(lfoGain)
            //synth is created and initialized with preset parameters
            let synth = this.createSynth()
            synth.oscillator.disconnect()
            synth.oscillator.connect(gain)

            //disconnect and dispose synth inner envelope
            synth.envelope.disconnect()
            synth.envelope.dispose()

            //thanks to noiseAdsrGain we can lower to zero the volume of the synth and still hear the noise, bypassing the synth volume
            let noiseAdsrGain = new Gain()  //used to have the same main adsr of synth on the noise too
            let noiseGain = new Gain()
            let noise = new Tone.Noise("pink")
            noise.connect(noiseGain)
            noiseGain.connect(noiseAdsrGain)
            noiseAdsrGain.connect(this.dampNode)




            let voice = {synth: synth, gain: gain, lfoGain: lfoGain, modulators: modulators, noise: noise, noiseGain: noiseGain, noiseAdsrGain: noiseAdsrGain}

            //creating and connecting every modulator
            for (let type in modulators) {
                for (let target in modulators[type]) {
                    let tempMod = this.createModulator(type)
                    modulators[type][target].signal = tempMod
                    modulators[type][target].scale = this.createScale(target)
                    this.connectModulator(modulators[type][target], type, target, voice)
                }
            }
            //pushing voice into freeVoices array
            this.freeVoices.push(voice)
            this.allVoices.push(voice)
        }

        this.initialized = false
        //setting all parameters of modulators
        this.updateModulators();
        this.initialized = true

    }

    playNote(note, velocity) {
        //console.log(this.freeVoices)
        if (this.initialized) {

            this.lastNotes.push(note);
            if (this.lastNotes.length > this.nVoices) {
                this.lastNote = this.lastNotes.shift();
            }

            //removing first free voice from array
            let voice = this.freeVoices.shift()
            if (!voice) {
                //console.log("NEW NOTE OVERWRITE: " + this.lastNote)
                voice = this.busyVoices[this.lastNote]
                delete this.busyVoices[this.lastNote]
            }
            this.busyVoices[note] = voice

            //trigger attack in each modulator
            for (let type in voice.modulators) {
                for (let target in voice.modulators[type]) {
                    if (voice.modulators[type][target].amount>0 ) {
                    switch (type) {
                        case "envelope":
                            //console.log("TRIGGERING ATTACK IN "+type+" connected to "+target)
                            //console.log(voice.modulators[type][target].signal)
                            toRaw(voice.modulators[type][target].signal).cancel(Tone.now())
                            toRaw(voice.modulators[type][target].signal).triggerAttack(Tone.now())
                            break;
                        case "lfo":
                            toRaw(voice.modulators[type][target]).signal.stop()
                            toRaw(voice.modulators[type][target]).signal.start()
                            break;
                        default:
                            break;
                    }
                    }
                }
            }
            voice.synth.oscillator.stop(Tone.now())
            voice.synth.envelope.cancel(Tone.now())
            //trigger attack in synth and noise
            voice.noise.start()
            voice.synth.triggerAttack(note, Tone.now(), velocity / 128)
        }
    }

    stopNote(note) {
        if (this.initialized) {
            if (this.busyVoices[note]) {
                let voice = this.busyVoices[note]
                delete this.busyVoices[note]
                this.freeVoices.push(voice)

                //triggerRelease on all envelopes
                for (let type in voice.modulators) {
                    for (let target in voice.modulators[type]) {
                        if (voice.modulators[type][target].signal) {
                            switch (type) {
                                case "envelope":
                                    //console.log("Triggering release of "+type+" with target "+target)
                                    voice.modulators[type][target].signal.triggerRelease(Tone.now())
                                    break;
                                case "lfo":
                                    //lfos are never stopped, just diminished in amount if needed
                                    //fvoice.modulators[type][target].signal.stop()
                                    break;
                                default:
                                    break;
                            }
                        }
                    }
                }
            }
        }
    }

    createSynth() {
        let synth = new Synth()
        //Setting parameters
        nextTick(() => {
            synth.set({
                "volume": this.synthPreset.vol,
                "detune": this.synthPreset.transpose * 100,
                "oscillator": {
                    "type": this.synthPreset.type + this.synthPreset.waveform + this.synthPreset.partials
                }
            })
        })
        //console.log(this.synthPreset.type + this.synthPreset.waveform + this.synthPreset.partials)

        return synth
    }

    createModulator(type) {
        //console.log("creating modulator of type: "+type)
        switch (type) {
            case "envelope":
                return new Envelope
            case "lfo":
                return new LFO
            default:
                console.log("Error creating modulator")
                return null
        }
    }

    createScale(target) {
        switch (target) {
            case "vol":
                return new Tone.Scale(0, 1);
            case "mod":
                return new Tone.Scale(0, 1);
            case "pitch":
                return new Tone.Scale(0, 1);
            case "pan":
                return new Tone.Scale(0, 1);
            default:
                console.log("Error creating scale for target "+target)
                return null
        }
    }

    updateModulators() {
        this.allVoices.forEach(voice => {
                for (let type in voice.modulators) {
                    for (let target in voice.modulators[type]) {
                        //update amount from preset
                        voice.modulators[type][target].amount = this.modulatorsData[type][target].amount
                        if (!toRaw(voice.modulators[type][target].signal)) {
                            //IF IT'S STILL NOT CREATED
                            //console.log("RECREATING")
                            voice.modulators[type][target].signal = this.createModulator(type)
                            voice.modulators[type][target].scale = this.createScale(target)
                            this.connectModulator(toRaw(voice.modulators[type][target]), type, target, toRaw(voice))
                            //console.log(voice.modulators[type][target])
                        }
                        this.scaleSetter(voice.modulators[type][target], target)
                        this.modulatorSetter(toRaw(voice.modulators[type][target].signal), type, this.modulatorsData[type][target].parameters)
                    }
                }
            }
        );
    }

    updateSynths() {
        this.allVoices.forEach(voice => {
            voice.synth.set({
                "detune": this.synthPreset.transpose * 100,
                "oscillator": {
                    "type": this.synthPreset.type + this.synthPreset.waveform + this.synthPreset.partials
                }
            })
            //this.gainNode.set({gain: Tone.dbToGain(this.synthPreset.vol)})
            voice.noiseGain.set({
                gain: this.synthPreset.mod
            })
        });
    }

    scaleSetter(modulator, target) {
        switch (target) {
            case "vol":
                //ENVELOPE FOR VOL SHOULD HAVE SCALE TOO TO CENTER AROUND SELECTED FREQUENCY
                toRaw(modulator.scale).set({
                    min: (Math.max(Tone.dbToGain(this.synthPreset.vol) - modulator.amount,0)),
                    max: (Math.min(Tone.dbToGain(this.synthPreset.vol) + modulator.amount,1)),
                })


                break;
            case "mod":
                toRaw(modulator.scale).set({
                    min: (Math.max(this.synthPreset.mod - modulator.amount,0)),
                    max: (Math.min(this.synthPreset.mod + modulator.amount,1)),
                })
                break;
            case "pitch":
                //TO-DO
                //console.log("CHANGING SCALE ")
                //console.log(modulator.scale)
                toRaw(modulator.scale).set({
                    min: ((this.synthPreset.transpose - 24 * modulator.amount) * 100),
                    max: ((this.synthPreset.transpose + 24 * modulator.amount) * 100)
                })
                break;
            case "pan":
                //TO-DO
                break;

            default:
                console.log("invalid target to connect modulator to")
                break;
        }
    }

    modulatorSetter(modulator, type, parameters) {
        if(!toRaw(parameters).waveform) toRaw(parameters).waveform = modulator.type

        switch (type) {
            case "envelope":
                modulator.set({
                    "attack": parameters.attack,
                    "decay": parameters.decay,
                    "sustain": parameters.sustain,
                    "release": parameters.release + 0.001,
                })
                //console.log("JUST SET PARAMETERS OF")
                //console.log(modulator)
                //console.log("WITH")
                //console.log(parameters)
                break;
            case "lfo":
                //TO-DO
                //console.log("PARAMETERS")
                //console.log(parameters)
                modulator.set({//
                    "type": toRaw(parameters).waveform,
                    "frequency": toRaw(parameters).frequency
                })
                break;
            default:
                console.log("Error setting modulator parameters, invalid args")
                break;
        }
        // console.log("modulator.type: ", modulator.type)
    }

//have to pass, the modulator (tone), the type (lfo or envelope), the gain linked to the voice, the voice and the target
    connectModulator(modulator, type, target, voice) {
        //console.log("connecting")
        //console.log(modulator)
        //console.log("to voice: ")
        //console.log(voice)
        //console.log("to target: " + target)
        switch (type) {
            case "envelope":
                switch (target) {
                    case "vol":
                        modulator.signal.chain(modulator.scale, voice.gain.gain)
                        //modulator.signal.connect(voice.gain.gain)   //SET MAIN ADSR TO SYNTH GAIN
                        modulator.signal.connect(voice.noiseAdsrGain.gain)      //SET MAIN ADSR TO NOISE GAIN
                        break;
                    case "mod":
                        modulator.signal.chain(modulator.scale, voice.noiseGain.gain)
                        break;
                    case "pitch":
                        //TO-DO
                        this.scaleSetter(modulator, target)
                        modulator.signal.chain(modulator.scale, voice.synth.detune)
                        break;
                    case "pan":
                        //TO-DO
                        break;
                    default:
                        console.log("invalid target to connect modulator to")
                        break;
                }

                break;

            case "lfo":
                switch (target) {
                    case "vol":
                        this.scaleSetter(modulator, target)
                        modulator.signal.chain(modulator.scale, voice.lfoGain.gain)
                        break;
                    case "mod":
                        modulator.signal.chain(modulator.scale, voice.noiseGain.gain)
                        break;
                    case "pitch":
                        //TO-DO
                        this.scaleSetter(modulator, target)
                        modulator.signal.chain(modulator.scale, voice.synth.detune)
                        break;
                    case "pan":
                        //TO-DO
                        break;
                    default:
                        console.log("invalid target to connect modulator to")
                        break;
                }

                break;

            default:
                console.log("invalid modulator type")
                break;
        }
    }

    // setters
    setModulatorParameters(type, target, parameters) {
        //console.log("myPolysynth - setModulatorParameters")
        if (this.initialized) {
            this.modulatorsData[type][target].parameters = parameters
            // console.log("New modulatorsData for type "+type+" to target "+target)
            // console.log(this.modulatorsData);
            // console.log("params: " , this.modulatorsData[type][target].parameters,  parameters)

            this.updateModulators()
            //console.log("SETTING")
            //console.log(this.modulatorsData)
        }
    }

    setModulatorAmount(type, target, amount) {
        if (this.initialized) {
            this.modulatorsData[type][target].amount = amount
            //console.log("setting modulator amount")
            this.updateModulators()
        }
    }

    //TO RENAME IN SET SYNTH PARAMETERS
    setParameters({
                      volume = this.synthPreset.vol,
                      modulation = this.synthPreset.mod,
                      transpose = this.synthPreset.transpose,
                      pan = this.synthPreset.pan,
                      type = this.synthPreset.type,
                      waveform = this.synthPreset.waveform
                  }) {
        if (this.initialized) {
            this.synthPreset.vol = volume;
            this.synthPreset.mod = modulation;
            this.synthPreset.transpose = transpose;
            this.synthPreset.pan = pan;
            this.synthPreset.type = type;
            this.synthPreset.waveform = waveform;
            //console.log(this.synthPreset.waveform)

            this.updateSynths()
            this.updateModulators()
        } else {
            console.log("Polysynth not initialized")
        }
    }

// connect each voice to the new routing
    connect(route) {
        this.gainNode.connect(route)
    }

    disconnectDispose() {
        //for each voice
        this.allVoices.forEach(voice => {
            //Disconnect and dispose synth
            voice = toRaw(voice)
            voice.synth.disconnect()
            voice.synth.dispose()
            //Disconnect and dispose gain
            voice.gain.disconnect()
            voice.gain.dispose()
            //Disconnect and dispose modulators
            for (let type in voice.modulators) {
                for (let target in voice.modulators[type]) {
                    if (voice.modulators[type][target].signal) {
                        voice.modulators[type][target].signal.disconnect()
                        voice.modulators[type][target].signal.dispose()
                        voice.modulators[type][target].scale.disconnect()
                        voice.modulators[type][target].scale.dispose()
                    }
                }
            }
        });
        //disconnect and dispose main gainNode
        this.gainNode.disconnect()
        this.gainNode.dispose()

        //console.log("MyPolySynth completely disconnected and disposed")
    }
}