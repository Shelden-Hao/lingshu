// The ports' texts: the ports panel, the settings list's entry and the envs actions' button. `en` defines the keys
// and their arguments; `zh` fills them.
import { defineMessages } from "@p2/app/v1";

export const messages = defineMessages("ports", {
	en: {
		ports: "Ports",
		portsHint: "Open dev servers through Radius",
		intro: "Open web servers running on this device, such as a dev server, from your other devices. Each port gets its own address through Radius, which signs you in to it. A public port has a second address that anyone can open without signing in.",
		linksPending: (command: string) =>
			`Links appear once this server has been opened through Radius (${command}, then Lingshu in Radius).`,
		port: (port: number) => `Port ${port}`,
		bySession: (title: string | undefined) => ` · by ${title ?? "another session"}`,
		byAnotherSession: "another session",
		remove: "Remove",
		cancel: "Cancel",
		open: "Open",
		publicConfirm: (port: number) => `Anyone with the link can open localhost:${port} without signing in.`,
		makePublic: "Make public",
		publicNoSignIn: "Public: no sign-in",
		noForwards: "No ports forwarded.",
		portPlaceholder: "5173",
		portLabel: "Port",
		namePlaceholder: "Name (optional)",
		nameLabel: "Name",
		add: "Add",
		// the tool's words in the chat (activity.tsx)
		verbOpened: "Opened port",
		verbClosed: "Closed port",
		verbListed: "Listed ports",
		openLink: (name: string) => `Open ${name}`,
		publicLink: "Public link",
	},
	zh: {
		ports: "端口",
		portsHint: "通过 Radius 打开开发服务器",
		intro: "在其它设备上打开本设备上运行的 Web 服务器，例如开发服务器。每个端口通过 Radius 获得自己的地址，并自动为你登录。公开端口还有一个无需登录、任何人都能打开的第二地址。",
		linksPending: (command: string) =>
			`此服务器通过 Radius 打开过一次后（运行 ${command}，然后在 Radius 中打开 Lingshu），链接才会出现。`,
		port: (port: number) => `端口 ${port}`,
		bySession: (title: string | undefined) => ` · 来自${title ?? "另一个会话"}`,
		byAnotherSession: "另一个会话",
		remove: "移除",
		cancel: "取消",
		open: "打开",
		publicConfirm: (port: number) => `任何持有该链接的人都可以无需登录打开 localhost:${port}。`,
		makePublic: "设为公开",
		publicNoSignIn: "公开：无需登录",
		noForwards: "尚无转发的端口。",
		portPlaceholder: "5173",
		portLabel: "端口",
		namePlaceholder: "名称（可选）",
		nameLabel: "名称",
		add: "新增",
		// the tool's words in the chat (activity.tsx)
		verbOpened: "打开了端口",
		verbClosed: "关闭了端口",
		verbListed: "列出了端口",
		openLink: (name: string) => `打开 ${name}`,
		publicLink: "公开链接",
	},
});
