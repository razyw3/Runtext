export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  try {
    const config = req.body || {};

    const {
      text = "Running Text Example",
      fontFamily = "Inter",
      fontSize = 48,
      textColor = "#ffffff",
      backgroundColor = "#111827", // solid or gradient
      speed = 10, // seconds
      direction = "left",
      bold = false,
      italic = false,
      themePreset = "dark"
    } = config;

    // Define Google Font Import URLs
    const fontUrls = {
      "Inter": "https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap",
      "Space Grotesk": "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700&display=swap",
      "Playfair Display": "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&display=swap",
      "Fira Code": "https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;700&display=swap",
      "Outfit": "https://fonts.googleapis.com/css2?family=Outfit:wght@400;700&display=swap",
      "Syne": "https://fonts.googleapis.com/css2?family=Syne:wght@700;800&display=swap",
      "Bungee": "https://fonts.googleapis.com/css2?family=Bungee&display=swap",
      "Monoton": "https://fonts.googleapis.com/css2?family=Monoton&display=swap",
      "Press Start 2P": "https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap",
      "Unbounded": "https://fonts.googleapis.com/css2?family=Unbounded:wght@400;700;900&display=swap"
    };

    const fontImportUrl = fontUrls[fontFamily] || fontUrls["Inter"];

    // Stylings based on presets or choices
    let textShadowStyle = "";
    if (themePreset === "neon") {
      textShadowStyle = `text-shadow: 0 0 10px ${textColor}, 0 0 20px ${textColor}, 0 0 30px ${textColor};`;
    } else if (themePreset === "led") {
      textShadowStyle = "text-shadow: 0 0 4px rgba(255, 0, 0, 0.6), 0 0 10px rgba(255, 0, 0, 0.4);";
    }

    const fontWeight = bold ? 'bold' : 'normal';
    const fontStyle = italic ? 'italic' : 'normal';
    const animationName = direction === 'right' ? 'scroll-right' : 'scroll-left';

    // Build self-contained HTML
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Running Text - ${text.substring(0, 20)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="${fontImportUrl}" rel="stylesheet">
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body, html {
      width: 100%;
      height: 100%;
      overflow: hidden;
      margin: 0;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: ${backgroundColor};
    }
    .marquee-container {
      width: 100%;
      white-space: nowrap;
      overflow: hidden;
      position: relative;
    }
    .marquee-text {
      display: inline-block;
      white-space: nowrap;
      padding-left: 100%;
      font-size: ${fontSize}px;
      color: ${textColor};
      font-family: '${fontFamily}', sans-serif;
      animation: ${animationName} ${speed}s linear infinite;
      font-weight: ${fontWeight};
      font-style: ${fontStyle};
      ${textShadowStyle}
    }
    @keyframes scroll-left {
      0% { transform: translate3d(0, 0, 0); }
      100% { transform: translate3d(-100%, 0, 0); }
    }
    @keyframes scroll-right {
      0% { transform: translate3d(-100%, 0, 0); }
      100% { transform: translate3d(0, 0, 0); }
    }
  </style>
</head>
<body>
  <div class="marquee-container">
    <div class="marquee-text">${text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
  </div>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="running-text.html"');
    return res.status(200).send(htmlContent);

  } catch (error) {
    console.error("Error generating running text:", error);
    return res.status(500).json({ error: "Failed to generate running text file" });
  }
}
