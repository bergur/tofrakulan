<script setup>
defineProps({
  // 'idle' | 'shaking' | 'revealed'
  phase: { type: String, required: true },
  answer: { type: String, default: '' },
})

defineEmits(['ask'])
</script>

<template>
  <button
    type="button"
    class="ball"
    :class="{ 'ball--shaking': phase === 'shaking' }"
    aria-label="Spyrja kúluna"
    @click="$emit('ask')"
  >
    <span class="ball__window">
      <Transition name="reveal" mode="out-in">
        <span v-if="phase === 'revealed'" :key="answer" class="ball__triangle">
          <span class="ball__answer">{{ answer }}</span>
        </span>
        <span v-else-if="phase === 'idle'" class="ball__idle">?</span>
      </Transition>
    </span>
  </button>
</template>

<style scoped>
.ball {
  --size: min(78vw, 340px);

  position: relative;
  display: grid;
  place-items: center;
  width: var(--size);
  height: var(--size);
  padding: 0;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  background: radial-gradient(circle at 35% 28%, #5a5a6e 0%, #1a1a24 30%, #000 70%);
  box-shadow:
    0 30px 60px rgb(0 0 0 / 0.55),
    inset -12px -16px 40px rgb(0 0 0 / 0.8);
  -webkit-tap-highlight-color: transparent;
}

.ball:focus-visible {
  outline: 4px solid var(--accent);
  outline-offset: 6px;
}

.ball--shaking {
  animation: shake 0.15s ease-in-out infinite alternate;
}

@keyframes shake {
  from { transform: translate(-8px, 2px) rotate(-6deg); }
  to   { transform: translate(8px, -2px) rotate(6deg); }
}

.ball__window {
  display: grid;
  place-items: center;
  width: 52%;
  height: 52%;
  border-radius: 50%;
  background: radial-gradient(circle at 50% 40%, #16207a 0%, #070b33 75%);
  box-shadow: inset 0 6px 18px rgb(0 0 0 / 0.9);
  overflow: hidden;
}

.ball__idle {
  color: rgb(255 255 255 / 0.85);
  font-size: calc(var(--size) * 0.22);
  font-weight: 800;
}

.ball__triangle {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  width: 92%;
  height: 80%;
  padding: 14% 22% 0;
  background: linear-gradient(180deg, #4462ff, #2a3fd6);
  clip-path: polygon(0 0, 100% 0, 50% 100%);
}

.ball__answer {
  color: #fff;
  font-size: calc(var(--size) * 0.042);
  font-weight: 700;
  line-height: 1.15;
  text-align: center;
  text-transform: uppercase;
  overflow-wrap: anywhere;
}

.reveal-enter-active {
  transition: opacity 0.9s ease, transform 0.9s ease;
}
.reveal-leave-active {
  transition: opacity 0.2s ease;
}
.reveal-enter-from {
  opacity: 0;
  transform: scale(0.6) rotate(-20deg);
}
.reveal-leave-to {
  opacity: 0;
}
</style>
