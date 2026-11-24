// The providers' texts: the Providers sheet's sign-in flows, provider actions and the settings list's label.
// `en` defines the keys and their arguments; `zh` fills them.
import { defineMessages } from "@p2/app/v1";

export const messages = defineMessages("login", {
	en: {
		providers: "Providers",
		searchProviders: "Search providers",
		continueInBrowser: "Continue in browser",
		enterCode: "Enter this code on the verification page",
		openVerification: "Open verification page",
		moreInformation: "More information",
		manualCodeHint:
			"Complete sign-in in the provider tab, then paste the authorization code or final redirect URL below. If you land on an unreachable localhost page, copy its full address from the address bar and paste it here; that page does not need to load.",
		continue: "Continue",
		signedIn: "Signed in.",
		cancelled: "Cancelled.",
		cancel: "Cancel",
		done: "Done",
		signedInWith: (kind: "oauth" | "api_key") =>
			`Signed in with ${kind === "oauth" ? "a subscription" : "an API key"}.`,
		notSignedIn: "Not signed in. Environment keys may still apply.",
		credentialsStored: "Credentials are stored on the server.",
		modelsAvailable: (count: number) => `${count} model${count === 1 ? "" : "s"} available.`,
		catalogNoModels: "Catalog updated; no models reported.",
		updatingCatalog: "Updating model catalog…",
		updateCatalog: "Update model catalog",
		signOut: "Sign out",
		signedInRow: "Signed in",
		noProviderMatches: "No provider matches.",
		noProviders: "No providers available.",
	},
	zh: {
		providers: "提供商",
		searchProviders: "搜索提供商",
		continueInBrowser: "在浏览器中继续",
		enterCode: "在验证页面输入此代码",
		openVerification: "打开验证页面",
		moreInformation: "更多信息",
		manualCodeHint:
			"在提供商页面完成登录，然后将授权码或最终重定向网址粘贴到下方。若跳转到无法访问的 localhost 页面，从地址栏复制完整地址粘贴到这里即可；该页面无需加载。",
		continue: "继续",
		signedIn: "已登录。",
		cancelled: "已取消。",
		cancel: "取消",
		done: "完成",
		signedInWith: (kind: "oauth" | "api_key") => `已通过${kind === "oauth" ? "订阅" : "API 密钥"}登录。`,
		notSignedIn: "尚未登录。环境变量中的密钥可能仍然生效。",
		credentialsStored: "凭据保存在服务器上。",
		modelsAvailable: (count: number) => `${count} 个可用模型。`,
		catalogNoModels: "目录已更新；未报告任何模型。",
		updatingCatalog: "正在更新模型目录…",
		updateCatalog: "更新模型目录",
		signOut: "退出登录",
		signedInRow: "已登录",
		noProviderMatches: "没有匹配的提供商。",
		noProviders: "暂无可用提供商。",
	},
});
