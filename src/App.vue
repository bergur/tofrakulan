<script setup>
import { ref } from 'vue'
import MagicBall from './components/MagicBall.vue'
import { answers } from './answers.js'
import { useSpeechRecognition } from './composables/useSpeechRecognition.js'
import { useSpeechSynthesis } from './composables/useSpeechSynthesis.js'
import { useShake } from './composables/useShake.js'

const SHAKE_DURATION_MS = 1200

const MIC_ERRORS = {
  'not-allowed': 'Ég fékk ekki leyfi til að nota hljóðnemann.',
  'service-not-allowed': 'Ég fékk ekki leyfi til að nota hljóðnemann.',
  'no-speech': 'Ég heyrði ekkert. Reyndu aftur!',
  'language-not-supported': 'Vafrinn skilur ekki íslensku. Prófaðu að skrifa.',
  'network': 'Ekkert netsamband. Prófaðu að skrifa.',
}

const question = ref('')
const answer = ref('')
const phase = ref('idle') // 'idle' | 'shaking' | 'revealed'
const message = ref('')
const readAloud = ref(false)

const mic = useSpeechRecognition('is-IS')
const voice = useSpeechSynthesis('is')
const shake = useShake(ask)

function pickAnswer() {
  const options = answers.filter((a) => a !== answer.value)
  return options[Math.floor(Math.random() * options.length)]
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function ask() {
  if (phase.value === 'shaking') return

  message.value = ''
  phase.value = 'shaking'
  answer.value = pickAnswer()

  await wait(SHAKE_DURATION_MS)

  phase.value = 'revealed'
  navigator.vibrate?.(80)
  if (readAloud.value) voice.speak(answer.value)
}

function toggleMic() {
  if (mic.isListening.value) {
    mic.stop()
    return
  }
  message.value = ''
  question.value = ''
  mic.start((heard, error) => {
    if (error) {
      message.value = MIC_ERRORS[error] ?? 'Eitthvað fór úrskeiðis með hljóðnemann.'
      return
    }
    if (!heard) return
    question.value = heard
    ask()
  })
}

async function toggleShake() {
  if (shake.isEnabled.value) {
    shake.disable()
    return
  }
  const enabled = await shake.enable()
  message.value = enabled ? 'Hristu símann til að fá svar!' : 'Ég fékk ekki leyfi til að skynja hristing.'
}

function onReadAloudChange() {
  // iOS only lets a page speak after speaking once inside a tap, so say something now.
  if (readAloud.value) voice.speak('Ókei!')
}
</script>

<template>
  <main class="page">
    <h1 class="title">Töfrakúlan</h1>
    <p class="subtitle">Spurðu já- eða nei-spurningar og kúlan svarar.</p>

    <MagicBall :phase="phase" :answer="answer" @ask="ask" />

    <form class="ask" @submit.prevent="ask">
      <input
        v-model="question"
        class="ask__input"
        type="text"
        placeholder="Skrifaðu spurninguna þína…"
        aria-label="Spurning"
        enterkeyhint="send"
        :readonly="mic.isListening.value"
      />
      <button type="submit" class="button button--primary" :disabled="phase === 'shaking'">Spyrja</button>
    </form>

    <div class="controls">
      <button
        v-if="mic.isSupported"
        type="button"
        class="button"
        :class="{ 'button--active': mic.isListening.value }"
        @click="toggleMic"
      >
        {{ mic.isListening.value ? '🎤 Ég hlusta…' : '🎤 Tala' }}
      </button>

      <button
        v-if="shake.isSupported"
        type="button"
        class="button"
        :class="{ 'button--active': shake.isEnabled.value }"
        @click="toggleShake"
      >
        {{ shake.isEnabled.value ? '📳 Hristingur á' : '📳 Virkja hristing' }}
      </button>

      <label v-if="voice.hasVoice.value" class="toggle">
        <input v-model="readAloud" type="checkbox" @change="onReadAloudChange" />
        🔊 Lesa svarið upphátt
      </label>
    </div>

    <p class="message" aria-live="polite">
      <template v-if="mic.isListening.value && mic.transcript.value">„{{ mic.transcript.value }}“</template>
      <template v-else>{{ message }}</template>
    </p>

    <p class="sr-only" aria-live="assertive">
      <template v-if="phase === 'revealed'">{{ answer }}</template>
    </p>
  </main>
</template>
