import * as Tone from "tone";
import {Envelope, LFO} from "tone";
import {toRaw} from "vue";

export default class MyFilter {
    constructor(type = "peaking", cutoff = 0.5, resonance = 0.5) {

        this.filter_type = type;
        this.cutoff = cutoff;
        this.resonance = resonance;

        this.modulatorsData = {
            envelope: {
                amount: 0,
                parameters: {
                    attack: 1,
                    decay: 0.3,
                    sustain: 0.8,
                    release: 1
                }
            },
            lfo: {
                amount: 0,
                parameters: {
                    frequency: 10,
                    waveform: "sine",
                    min: 0,
                    max: 1
                }
            }
        }

        //to stop moduoators only when there is one left active voice and the note is released
        this.activeNotes=0

        this.modulators = {
            envelope: {
                signal: this.createModulator("envelope"),
                scale: new Tone.ScaleExp(0, 1, 3),
                amount: 0
            },
            lfo: {
                signal: this.createModulator("lfo"),
                scale: new Tone.ScaleExp(0, 1, 3),
                amount: 0
            }
        }

        this.filter = new Tone.Filter();
        this.initFilterParams();


    }

    getCutoff() {
        return this.cutoff
    }

    getResonance() {
        return this.resonance
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


    // ----------- AUDIO SETTERS--------------
    initFilterParams() {
        let self = this;

        // init switched off filters
        switch (this.filter_type) {
            case "lowpass":
                this.cutoff = .9;
                this.resonance = 1;
                break;
            case "highpass":
                this.cutoff = 0.1;
                this.resonance = 1;
                break;
            case "peaking":
                this.cutoff = 0.5;
                this.resonance = 0.5;
                break;
            case "bandpass":
                break;
            case "lowshelf":
                break;
            case "highshelf":
                break;
            case "notch":
                break;
            case "allpass":
                break;
            default:
                console.log("Invalid filter type");
        }

        this.filter.set({
            frequency: self.cutoffLogMapping(this.cutoff),
            type: this.filter_type,
        })

        this.scaleSetter(this.modulators.envelope)
        this.scaleSetter(this.modulators.lfo)
        this.connectModulator(this.modulators.envelope)
        this.connectModulator(this.modulators.lfo)
        this.updateModulators()

    }


    //------------MODULATORS LOGIC----------

    scaleSetter(modulator, target = "") {
        //console.log(modulator)
        toRaw(modulator.scale).set({

            min: (Math.pow(10, Math.log10(this.cutoffLogMapping(this.cutoff)) - 1 * modulator.amount)),
            max: (Math.pow(10, Math.log10(this.cutoffLogMapping(this.cutoff)) + 1 * modulator.amount)),
        })

    }

    connectModulator(modulator) {
        modulator.signal.chain(modulator.scale, this.filter.frequency)
    }

    setModulatorParameters(type, target, parameters) {
        this.modulatorsData[type].parameters = parameters
        this.updateModulators()
    }

    setModulatorAmount(type, target, amount) {
        this.modulatorsData[type].amount = amount
        this.updateModulators()
    }

    updateModulators() {
        for (let type in this.modulators) {
            //update amount from preset
            this.modulators[type].amount = this.modulatorsData[type].amount
            //reset scale
            this.scaleSetter(this.modulators[type])
            //reset modulator
            this.modulatorSetter(toRaw(this.modulators[type].signal), type, this.modulatorsData[type].parameters)
        }
    }

    modulatorSetter(modulator, type, parameters) {
        if (!toRaw(parameters).waveform) toRaw(parameters).waveform = modulator.type
        switch (type) {
            case "envelope":
                modulator.set({
                    "attack": parameters.attack,
                    "decay": parameters.decay,
                    "sustain": parameters.sustain,
                    "release": parameters.release + 0.001,
                })
                break;
            case "lfo":
                modulator.set({
                    "type": toRaw(parameters).waveform,
                    "frequency": toRaw(parameters).frequency
                })
                break;
            default:
                console.log("Error setting modulator parameters, invalid args")
                break;
        }
    }

    playNote(note = "", velocity = "") {
        //trigger attack in modulators
        this.modulators.envelope.signal.cancel(Tone.now())
        this.modulators.envelope.signal.triggerAttack(Tone.now())
        this.modulators.lfo.signal.stop()
        this.modulators.lfo.signal.start()
        //console.log("PLAYED FILTER MODULATORS")
        this.activeNotes++
    }
    stopNote(note="") {
        if(this.activeNotes<=1){
            this.modulators.envelope.signal.triggerRelease(Tone.now())
            //lfos never stopped
            //this.modulators.lfo.signal.stop()
            //console.log("STOPPED FILTER MODULATORS")
        }
        this.activeNotes--
    }


    //--------------------


    setCutoff(cutoff = this.cutoff) {
        this.cutoff = cutoff;
        let self = this;
        this.filter.set({
            frequency: self.cutoffLogMapping(this.cutoff),
        });
        /*
        console.log(
            this.filter_type +
            " cutoff: " +
            this.cutoff.toFixed(2) +
            " - " +
            this.cutoffLogMapping(this.cutoff).toFixed(0) +
            " Hz"
        );

         */
        this.updateModulators()
    }

    setResonance(resonance = this.resonance) {
        this.resonance = resonance;
        let self = this;

        if (this.filter_type === "lowshelf" || this.filter_type === "highshelf" || this.filter_type === "peaking") {
            // bell delta amplitude is controlled changing the 'gain' parameter
            this.filter.set({
                gain: self.resonanceRangeNormalizer(1 - self.resonance, this.filter_type),
            });
            /*
            console.log(
                "Setting Peaking Resonance: " +
                self.resonanceRangeNormalizer(1 - self.resonance, this.filter_type)
            );

             */
        } else if (this.filter_type === "lowpass" || this.filter_type === "highpass") {
            // filter's Q is controlled changing the 'Q' parameter
            this.filter.set({
                Q: self.resonanceRangeNormalizer(1 - self.resonance, this.filter_type),
            });
            /*
            console.log(
                "Setting LowPass/HighPass Resonance: " +
                self.resonanceRangeNormalizer(1 - self.resonance, this.filter_type)
            );

             */
        }
        /*
            console.log(
              "resonance: " +
                this.resonance.toFixed(2) +
                " - " +
                Math.round(this.resonanceRangeNormalizer((self.resonance), this.type)) +
                " dB"
            );
        */
    }

    connect(destination) {
        try {
            this.filter.connect(destination);
        } catch (err) {
            console.log("ERROR: " + err + " - myfilter: ", this.filter, " -connect to destination: ", destination);
        }
    }

    disconnect(destination) {
        if (destination) {
            this.filter.disconnect(destination)
        } else {
            this.filter.disconnect(destination)
        }
    }

    getToneFilter() {
        return this.filter;
    }

    // ----------- AUDIO HELPERS--------------
    // takes value in [0, 1] range and it maps it to [50, 16000] interval in a logarithmic fashion
    cutoffLogMapping(x) {
        if (x < 0 || x > 1) {
            console.error("Input value must be between 0 and 1.");
            return;
        }
        return 20 * Math.pow(10, Math.log10(22000 / 20) * x);
    }

    // takes value in [0, 1] range and it maps it to [0, 10] linearly
    resonanceRangeNormalizer(x, type) {
        if (x < 0 || x > 1) {
            console.error("Input value must be between 0 and 1.");
            return;
        }
        switch (type) {
            case "lowpass":
                return 15 * x;
            case "highpass":
                return 15 * x;
            case "peaking":
                return 30 * (x - 0.5);
            default:
                break;
        }
    }

}