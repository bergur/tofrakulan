import { ref, computed, onBeforeUnmount } from 'vue'

export function useSpeechSynthesis(langPrefix) {
  const isSupported = 'speechSynthesis' in window
  const voice = ref(null)

  function pickVoice() {
    const voices = window.speechSynthesis.getVoices()
    voice.value = voices.find((v) => v.lang.toLowerCase().startsWith(langPrefix)) ?? null
  }

  if (isSupported) {
    // Voices load asynchronously in most browsers.
    pickVoice()
    window.speechSynthesis.addEventListener('voiceschanged', pickVoice)
    onBeforeUnmount(() => window.speechSynthesis.removeEventListener('voiceschanged', pickVoice))
  }

  const hasVoice = computed(() => voice.value !== null)

  function speak(text) {
    if (!hasVoice.value) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.voice = voice.value
    utterance.lang = voice.value.lang
    window.speechSynthesis.speak(utterance)
  }

  return { isSupported, hasVoice, speak }
}
