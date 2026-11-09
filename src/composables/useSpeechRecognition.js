import { ref, onBeforeUnmount } from 'vue'

const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition

export function useSpeechRecognition(lang) {
  const isSupported = Boolean(Recognition)
  const isListening = ref(false)
  const transcript = ref('')
  const error = ref('')

  let recognition = null

  function start(onFinished) {
    if (!isSupported || isListening.value) return

    transcript.value = ''
    error.value = ''

    recognition = new Recognition()
    recognition.lang = lang
    recognition.interimResults = true
    recognition.continuous = false

    recognition.onresult = (event) => {
      transcript.value = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join('')
    }
    recognition.onerror = (event) => {
      error.value = event.error
    }
    recognition.onend = () => {
      isListening.value = false
      onFinished(transcript.value, error.value)
    }

    recognition.start()
    isListening.value = true
  }

  function stop() {
    recognition?.stop()
  }

  onBeforeUnmount(stop)

  return { isSupported, isListening, transcript, error, start, stop }
}
