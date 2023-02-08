# Zenynth

Zenynth is a minimal powerful Semi-Modular Synthetizer, able to generate all of the most iconic Synth's sounds.

It features infinite Synth Engines (of 4 different types), Noise generators, 3 Filter Chains, and 3 FX chains (each one made by 5 effects to choose from: Delay, Reverb, Distortion, Vibrato, Pan, and Chorus).
5 freely assignables Modulators and a main ADSR Envelope allow to shape the sound further and produce crazy noises.

  
<br>

# How to use it
  - Online Version [here](https://eliapirrello.github.io/zenyth/) //currently offline
  - Locallly: Clone git repo and run the following command in the project terminal:
  1. `npm install`
  2. `npm update`
  3. `npm run build` or `npm run serve` respectively for distribution or developement builds

<br>

Play the synth with your computer keyboard: `[a,w,s,e,d,f,t,g,y,h,u,j,k,o,l,p,ò,à]` 

Or connect a MIDI keyboard and reload the page!

(Connecting more than one MIDI/audio device could interfere with MIDI)
  
<br>

### OSCILLATORS

|                                                     |   |  |  |
|-----------------------------------------------------|---|---|---|
| <img src='res/osc.png'  margin='10%' width='90%' >  | Synth Engine: Shift+Click to remove, click "+" to add |   <img src='res/FM.png'  height='100vw' padding='5%'> | Synth Engine Selector   | 
| <img src='res/wave.png'  >                          |  Waveform Selector (change clicking)  |    <img src='res/ModSlider.png'  > |   Left Slider: Noise Volume | 
| <img src='res/VolSlider.png'  >                     |  Right Slider: Oscillator Volume  |   <img src='res/Osc Routes.png'  margin='10%' width='90%'> |  Synth Routing: Select filter chains clicking on the dots (more chains can be selected for each Synth Engine)  | 
| <img src='res/pitch.png'  margin='10%' width='90%'> |  Oscillator Tuning |

  
<br>
    
### FILTERS
Three parallel Filter Chains (Horizontal)

|   |   |                                     |  |
|---|---|-------------------------------------|---|
| <img src='res/Filters.png'  padding='5%' >|  Low Pass, Band and High Pass filters in serie | <img src='res/FilterCutoff.png'  >  | Drag Horizonatally to change frequency, vertically to change amount and resonance |  
| <img src='res/Resonance.png'  >|  Resonance/amount rapresented by glow around each filter | <img src='res/Filter Routes.png'  > |   Filter Routing: Select Fx Chain by clicking on the dots (more chains can be selected for each Filter Chain) |

  
<br>

### EFFECTS
Three parallel Fx Chains (Vertical)

|   |   |  |  |
|---|---|---|---|
| <img src='res/FXMatrix.png'  >| Add and swap effects clicking, change intensity by dragging vertically. Shift+Click to remove | <img src='res/FXGain.png'  >| Drag vertically to change volume of the filter chain |

  
<br>

### MODULATORS
One main envelope, three assignable envelopes, two assignable lfos

|   |   |
|---|---|
| <img src='res/ADSR.png'  padding='5%' > | Main Envelope: Relative to Synth Engine Volume (Draw the shape of Attack, Decay, Sustain and Release dragging the dots) |
| <img src='res/LFO.png'  > | LFO produces a periodic signal to modulate parameters. Vertical slider changes LFO speed, the button below changes waveform  |

|   |                                                          |   |                                                                                                         |
|---|----------------------------------------------------------|---|---------------------------------------------------------------------------------------------------------|
 | <img src='res/Drag.png'  > | Thunder icons are draggable                              | <img src='res/Drop.png' height='60%' > | Drop the thunder icon on: Synth Volume, Noise Volume, Synth Pitch or Filter Frequency to modulate the parameters |
|<img src='res/ModAmount.png'  > | Change modulation amount dragging the circles vertically | <img src='res/Id.png' > | The dot color and number indicates the modulator signal, Shift+Click on the dot to unlink the modulator |
| <img src='res/VolButton.png'  > | Click mod icons to select the modulator shown            |
 
___ 

  
<br>

## How we built it

  
<br>

### Main framework and visuals:

- To achieve a simpler architecture and facilitate team cooperation, we used *Vue.js* as our main framework. The resulting graphical interface is a composition of custom Vue components, nested one into each other.
- All visual effects are realized in plain CSS, without any other library.
- The whole application is completely resizable, with a fixed aspect ratio and dimensions relative to the window's width.

  
<br>

### Audio Core:

- Tone.js was our initial choice to write the audio logic. As the code kept growing, the complexity increased too and the stock Tone objects weren't sufficient. We decided to wrap our main audio engines in more sophisticated and modular custom objects:
    - **MyPolySynth** - A polyphonic, multi-engine synthesizer with 6 modulator signals and a noise generator included in each voice. Each MyPolySynth can be initialized with a custom number of voices and a defined destination.
    - **MyFilter** - A multi-type filter (HP, BAND, LP), based on Tone.Filter, with the addition of 1 envelope and 1 LFO to modulate the cutoff frequency.
    - **MyFx** - A multi-Fx object, unifying 6 Tone effects in a single component.
    
    <br>
- Thanks to these wrappers, it's now possible to modulate synth pitch, synth volume, noise volume, and filter cutoff using both LFOs and envelopes. Simply set the modulation parameters and amount.
- Further updates aim to substitute Tone with the plain WebAudioAPI to improve latency and optimize the code further.

    &rarr; _[Audio Core Detailed Scheme](./res/Zenyth_Audio_Core.pdf)_

  
<br>

## Dependencies
- [Tone.js](https://tonejs.github.io) - Web Audio Framework
- [Vue.js](https://vuejs.org) - Web UI Framework
- [npm](https://www.npmjs.com/) - Package Manager

<br>

## Team
- Colombo Marco Furio - Routing, MyFx, Animated Graphics - `marcofurio.colombo@polimi.it`
- Guglielmo Fratticioli - Front End Developement and UI Design - `guglielmo.fratticioli@mail.polimi.it`
- Elia Pirrello - Audio Core Coding and Project Management - `elia.pirrello@mail.polimi.it`

