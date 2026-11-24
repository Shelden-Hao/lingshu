// The devices plugin's texts: Settings › Devices, the sign-in token sheet and signing out. `en` defines the keys;
// `zh` fills them.

import { defineMessages } from "@p2/app/v1";

export const messages = defineMessages("devices", {
	en: {
		sectionDevices: "Devices",
		sectionTitle: "Sign in another device",
		title: "Devices",
		signOutFailed: "Could not sign out. Try again.",
		tokenFailed: "Could not generate a sign-in token.",
		tokenWarning: "This token grants full owner access. Give it only to your own device, not to collaborators.",
		tokenHow:
			"Open Lingshu's domain on the other device, paste this token into the sign-in page, and choose Sign in. It expires after ten minutes and works once.",
		cannotMint:
			"Generate owner links on the host with npm run owner-link. Associated devices cannot mint more tokens.",
		tokenLabel: "One-time sign-in token",
		copyToken: "Copy token",
		newToken: "Generate a new token",
		generating: "Generating token…",
		signOutThis: "Sign out on this device",
		signOutAllNote:
			"This signs out every device and every browser on the host, including this one, and invalidates outstanding owner links. TUIs on the host sign in again by themselves. Already-running agent work is not stopped.",
		confirmSignOutAll: "Confirm sign out all devices",
		cancel: "Cancel",
		signOutAll: "Sign out all devices",
	},
	zh: {
		sectionDevices: "设备",
		sectionTitle: "在另一台设备登录",
		title: "设备",
		signOutFailed: "退出失败，请重试。",
		tokenFailed: "生成登录 token 失败。",
		tokenWarning: "此 token 授予完整所有者权限。只给你自己的设备，不要给协作者。",
		tokenHow:
			"在另一台设备上打开 Lingshu 的域名，将此 token 粘贴到登录页并选择登录。它十分钟后过期，且只能使用一次。",
		cannotMint: "请在主机上用 npm run owner-link 生成所有者链接。关联设备无法再生成 token。",
		tokenLabel: "一次性登录 token",
		copyToken: "复制 token",
		newToken: "生成新 token",
		generating: "正在生成 token…",
		signOutThis: "在本机退出登录",
		signOutAllNote:
			"这会让主机上的所有设备和浏览器（包括本机）退出登录，并使尚未使用的所有者链接失效。主机上的 TUI 会自行重新登录。已在运行的代理工作不会被停止。",
		confirmSignOutAll: "确认退出所有设备",
		cancel: "取消",
		signOutAll: "退出所有设备",
	},
});
