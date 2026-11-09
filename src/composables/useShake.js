import { ref, onBeforeUnmount } from 'vue'

const GRAVITY = 9.81

export function useShake(onShake, { threshold = 12, cooldownMs = 1500 } = {}) {
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  // Desktops expose DeviceMotionEvent but never fire it, so require a touch device.
  const isSupported = 'DeviceMotionEvent' in window && hasTouch
  const isEnabled = ref(false)

  let lastShakeAt = 0

  function measureStrength(event) {
    const a = event.acceleration
    if (a && a.x !== null) {
      return Math.hypot(a.x, a.y, a.z)
    }
    const g = event.accelerationIncludingGravity
    if (g && g.x !== null) {
      return Math.abs(Math.hypot(g.x, g.y, g.z) - GRAVITY)
    }
    return 0
  }

  function handleMotion(event) {
    const now = Date.now()
    if (measureStrength(event) > threshold && now - lastShakeAt > cooldownMs) {
      lastShakeAt = now
      onShake()
    }
  }

  // Must be called from a tap: iOS only grants motion access in response to a user gesture.
  async function enable() {
    if (!isSupported || isEnabled.value) return isEnabled.value

    if (typeof DeviceMotionEvent.requestPermission === 'function') {
      const permission = await DeviceMotionEvent.requestPermission().catch(() => 'denied')
      if (permission !== 'granted') return false
    }

    window.addEventListener('devicemotion', handleMotion)
    isEnabled.value = true
    return true
  }

  function disable() {
    window.removeEventListener('devicemotion', handleMotion)
    isEnabled.value = false
  }

  onBeforeUnmount(disable)

  return { isSupported, isEnabled, enable, disable }
}
