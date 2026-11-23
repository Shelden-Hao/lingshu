export function PiLogo({ compact = false }: { compact?: boolean }) {
	return (
		<svg className={`lingshu-logo ${compact ? "compact" : ""}`} viewBox="0 0 4 4" role="img" aria-label="Lingshu">
			<title>Lingshu</title>
			<rect className="lingshu-logo-coral" width="3" height="1" />
			<rect className="lingshu-logo-coral" x="2" y="1" width="1" height="1" />
			<rect className="lingshu-logo-blue" y="1" width="1" height="3" />
			<rect className="lingshu-logo-blue" x="1" y="2" width="1" height="1" />
			<rect className="lingshu-logo-yellow" x="3" y="2" width="1" height="2" />
		</svg>
	);
}
