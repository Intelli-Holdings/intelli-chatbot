/**
 * Get the best supported audio MIME type for MediaRecorder.
 * Prefers mp4/aac (Instagram-compatible) over webm.
 */
export function getSupportedAudioMimeType(): string {
  const preferred = [
    "audio/mp4",
    "audio/aac",
    "audio/wav",
    "audio/webm;codecs=opus",
    "audio/webm",
  ]
  for (const mime of preferred) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(mime)) {
      return mime
    }
  }
  return ""
}

/**
 * Get the file extension for a given MIME type.
 */
export function getAudioExtension(mimeType: string): string {
  if (mimeType.startsWith("audio/mp4")) return "m4a"
  if (mimeType.startsWith("audio/aac")) return "aac"
  if (mimeType.startsWith("audio/wav")) return "wav"
  if (mimeType.startsWith("audio/webm")) return "webm"
  return "bin"
}

/**
 * Convert a webm audio blob to wav using Web Audio API.
 * This is needed because Instagram doesn't support webm audio.
 */
export async function convertWebmToWav(blob: Blob): Promise<Blob> {
  const audioContext = new AudioContext()
  const arrayBuffer = await blob.arrayBuffer()
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)

  // Encode as WAV
  const wavBuffer = encodeWav(audioBuffer)
  await audioContext.close()

  return new Blob([wavBuffer], { type: "audio/wav" })
}

function encodeWav(audioBuffer: AudioBuffer): ArrayBuffer {
  const numChannels = audioBuffer.numberOfChannels
  const sampleRate = audioBuffer.sampleRate
  const format = 1 // PCM
  const bitsPerSample = 16

  // Interleave channels
  const length = audioBuffer.length * numChannels
  const samples = new Int16Array(length)

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = audioBuffer.getChannelData(channel)
    for (let i = 0; i < audioBuffer.length; i++) {
      // Clamp and convert float32 [-1, 1] to int16
      const s = Math.max(-1, Math.min(1, channelData[i]))
      samples[i * numChannels + channel] = s < 0 ? s * 0x8000 : s * 0x7fff
    }
  }

  const byteRate = sampleRate * numChannels * (bitsPerSample / 8)
  const blockAlign = numChannels * (bitsPerSample / 8)
  const dataSize = samples.length * (bitsPerSample / 8)
  const headerSize = 44
  const buffer = new ArrayBuffer(headerSize + dataSize)
  const view = new DataView(buffer)

  // RIFF header
  writeString(view, 0, "RIFF")
  view.setUint32(4, 36 + dataSize, true)
  writeString(view, 8, "WAVE")

  // fmt chunk
  writeString(view, 12, "fmt ")
  view.setUint32(16, 16, true)
  view.setUint16(20, format, true)
  view.setUint16(22, numChannels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, byteRate, true)
  view.setUint16(32, blockAlign, true)
  view.setUint16(34, bitsPerSample, true)

  // data chunk
  writeString(view, 36, "data")
  view.setUint32(40, dataSize, true)

  // Write PCM samples
  const output = new Int16Array(buffer, headerSize)
  output.set(samples)

  return buffer
}

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i))
  }
}
