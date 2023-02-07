import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App).use(router)
//global properties

//audio
app.config.globalProperties.synths = {
    list: [],
}

app.config.globalProperties.nFilterChains = 3
app.config.globalProperties.nFiltersXchain = 3
app.config.globalProperties.areFiltersMounted = false

app.config.globalProperties.nFxChains = 3 //DO NOT CHANGE WITHOUT CHANGING GRID STYLE IN FX
app.config.globalProperties.nFxXchain = 5
app.config.globalProperties.nNodesXfxChain = 7
app.config.globalProperties.areFxMounted = false

app.config.globalProperties.nModulators = 6
app.config.globalProperties.nEnvelopes = 3
app.config.globalProperties.nLfo = 2
app.config.globalProperties.nKnobs = 9      //DO NOT CHANGE WITHOUT CHANGING GRID STYLE IN KNOBS
app.config.globalProperties.polyphonyVoices = 4

// init filters global matrix
app.config.globalProperties.filterChains = Array(app.config.globalProperties.nFilterChains)
for (let i = 0; i < app.config.globalProperties.nFilterChains; i++) {
    app.config.globalProperties.filterChains[i] = Array(app.config.globalProperties.nFiltersXchain)
}

// init fx global matrix
app.config.globalProperties.fxChains = Array(app.config.globalProperties.nFxChains)
for (let i = 0; i < app.config.globalProperties.nFxChains; i++) {
    app.config.globalProperties.fxChains[i] = Array(app.config.globalProperties.nNodesXfxChain) // gain nodes at start and end
}
//console.log(app.config.globalProperties.fxChains)

app.config.globalProperties.colors = {
    green: {light: '#7fe2a6', medium: '#599e74', dark: '#335a42', glow: '#b2eeca'},
    yellow: {light: '#fee573', medium: '#e5ce68', dark: '#b2a051', glow: '#feefab'},
    azure: {light: '#8fe1d8', medium: '#81cbc2', dark: '#649e97', glow: '#b1eae4'},
    purple: {light: '#cdadc4', medium: '#b99cb0', dark: '#a48a9d', glow: '#e1cedc'},
    pink: {light: '#f3a59a', medium: '#db958b', dark: '#c2847b', glow: '#f9d2cd'},
    orange: {light: '#ffc16c', medium: '#e6ae61', dark: '#cc9a56', glow: '#ffd498'},
    gray: {light: '#a8a8a8', medium: '#868686', dark: '#111111', glow: '#f6f6f6'},
}

//To communicate from dropzone module to dragzone module
app.config.globalProperties.dropFeedback = null
app.provide('dropFeedback', app.config.globalProperties.dropFeedback)

app.config.globalProperties.isDraggable = {
    envelope: {},
    lfo: {}
}


app.mount('#app')