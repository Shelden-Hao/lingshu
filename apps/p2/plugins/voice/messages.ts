// The voice plugin's texts: the composer's orb, the Voice sheet and the settings list's label. `en` defines the
// keys; `zh` fills them.
import { defineMessages, type Translator } from "@p2/app/v1";

export const catalog = {
	en: {
		// the orb's states
		off: "Voice mode",
		connecting: "Connecting",
		listening: "Listening",
		hearing: "Hearing you",
		thinking: "Working",
		talking: "Someone is talking",
		whoTalking: (names: string) => `${names} talking`,
		preparing: "Preparing speech",
		speaking: "Playing",
		error: "Voice error",
		waitingReconnect: (count: number) => `Waiting to reconnect (${count} ${count === 1 ? "message" : "messages"})`,
		microphoneMuted: " (microphone muted)",
		errorTitle: (state: string, error: string) => `${state}: ${error}`,
		turnOn: "Turn voice mode on",
		turnOff: "Turn voice mode off",
		stopSpeaking: "Stop speaking",
		errorTurnOn: (error: string) => `Voice error: ${error}. Turn voice mode on`,
		muteMic: "Mute microphone",
		micMuted: "Microphone muted",
		micMutedUnmute: "Microphone muted. Unmute",
		// the sheet
		sheetTitle: "Voice",
		stateOff: "Voice mode off",
		lastError: (time: string, message: string) => `Last error ${time}: ${message}`,
		choicesNew: " · Choices apply to new conversations",
		pauseLabel: "Pause before sending",
		guestShared: (voice: string, language: string) => `Voice: ${voice}${language} (the owner's)`,
		guestPauseHint: "How long you can pause before what you said is sent.",
		otherLanguages: (engines: string) => ` (other languages: a ${engines} voice)`,
		speedLabel: "Speed",
		language: "Language",
		tryVoice: (verb: string) => `${verb} a voice, or choose a language, to hear it.`,
		// the settings section
		sectionVoice: "Voice",
		sectionVoiceTitle: "Voice mode's voice, speed and pause",
	},
	zh: {
		off: "语音模式",
		connecting: "正在连接",
		listening: "正在聆听",
		hearing: "正在听你说话",
		thinking: "工作中",
		talking: "有人在说话",
		whoTalking: (names: string) => `${names} 正在说话`,
		preparing: "正在准备语音",
		speaking: "正在播放",
		error: "语音出错",
		waitingReconnect: (count: number) => `等待重新连接（${count} 条消息）`,
		microphoneMuted: "（麦克风已静音）",
		errorTitle: (state: string, error: string) => `${state}：${error}`,
		turnOn: "开启语音模式",
		turnOff: "关闭语音模式",
		stopSpeaking: "停止播放",
		errorTurnOn: (error: string) => `语音出错：${error}。开启语音模式`,
		muteMic: "静音麦克风",
		micMuted: "麦克风已静音",
		micMutedUnmute: "麦克风已静音。取消静音",
		sheetTitle: "语音",
		stateOff: "语音模式已关闭",
		lastError: (time: string, message: string) => `上次出错 ${time}：${message}`,
		choicesNew: " · 所选将应用于新会话",
		pauseLabel: "发送前的停顿",
		guestShared: (voice: string, language: string) => `语音：${voice}${language}（由所有者设置）`,
		guestPauseHint: "说完后停顿多久，你说的话才会发送。",
		otherLanguages: (engines: string) => `（其他语言：${engines} 的语音）`,
		speedLabel: "语速",
		language: "语言",
		tryVoice: (verb: string) => `${verb}一个语音，或选择一种语言，即可试听。`,
		sectionVoice: "语音",
		sectionVoiceTitle: "语音模式的语音、语速与停顿",
	},
};

export const messages = defineMessages("voice", catalog);

/** A translator of the voice plugin's messages, for helpers outside components. */
export type VoiceT = Translator<"voice", typeof catalog>;
