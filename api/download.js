function escapeHTML(str = "") {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getFontUrl(font) {
  const fonts = {
    "Inter": "https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap",
    "Space Grotesk": "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700&display=swap",
    "Playfair Display": "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap",
    "Fira Code": "https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;700&display=swap",
    "Outfit": "https://fonts.googleapis.com/css2?family=Outfit:wght@400;700&display=swap",
    "Syne": "https://fonts.googleapis.com/css2?family=Syne:wght@700;800&display=swap",
    "Bungee": "https://fonts.googleapis.com/css2?family=Bungee&display=swap",
    "Monoton": "https://fonts.googleapis.com/css2?family=Monoton&display=swap",
    "Press Start 2P": "https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap",
    "Unbounded": "https://fonts.googleapis.com/css2?family=Unbounded:wght@400;700&display=swap"
  };
  return fonts[font] || fonts["Inter"];
}

export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end();
  }

  try {
    const {
      text = "Running Text",
      fontFamily = "Inter",
      fontSize = 48,
      textColor = "#ffffff",
      backgroundColor = "#111827",
      speed = 10,
      direction = "left",
      bold = false,
      italic = false,
      themePreset = "dark"
    } = req.body || {};

    const safeText = escapeHTML(text);

    const fontUrl = getFontUrl(fontFamily);

    const fontWeight = bold ? '700' : '400';
    const fontStyle = italic ? 'italic' : 'normal';

    const animationName = direction === 'right' ? 'scroll-right' : 'scroll-left';

    let textShadow = "";
    if (themePreset === "neon") {
      textShadow = `0 0 10px ${textColor}, 0 0 20px ${textColor}`;
    } else if (themePreset === "led") {
      textShadow = `0 0 5px rgba(255,0,0,0.7)`;
    }

    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Running Text</title>

<link href="${fontUrl}" rel="stylesheet">

<style>
body {
  margin: 0;
  background: ${backgroundColor};
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  overflow: hidden;
}

.wrapper {
  width: 100%;
  overflow: hidden;
}

.track {
  display: flex;
  width: max-content;
  animation: ${animationName} ${speed}s linear infinite;
}

.text {
  font-family: '${fontFamily}', sans-serif;
  font-size: ${fontSize}px;
  color: ${textColor};
  font-weight: ${fontWeight};
  font-style: ${fontStyle};
  white-space: nowrap;
  padding-right: 50px;
  text-shadow: ${textShadow};
}

@keyframes scroll-left {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

@keyframes scroll-right {
  from { transform: translateX(-50%); }
  to { transform: translateX(0); }
}
</style>
</head>

<body>
<div class="wrapper">
  <div class="track">
    <div class="text">${safeText}</div>
    <div class="text">${safeText}</div>
  </div>
</div>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', 'attachment; filename="running-text.html"');

    res.status(200).send(html);

  } catch (err) {
    res.status(500).json({ error: "Failed to generate file" });
  }
}