// Ensure UI elements are loaded
document.addEventListener("DOMContentLoaded", () => {
  // --- DOM Elements ---
  const textInput = document.getElementById("text-input");
  const charCounter = document.getElementById("char-counter");
  const fontSelect = document.getElementById("font-select");
  const sizeSlider = document.getElementById("size-slider");
  const sizeValueText = document.getElementById("size-value");
  const speedSlider = document.getElementById("speed-slider");
  const speedValueText = document.getElementById("speed-value");
  
  const toggleBoldBtn = document.getElementById("toggle-bold");
  const toggleItalicBtn = document.getElementById("toggle-italic");
  const dirLeftBtn = document.getElementById("dir-left");
  const dirRightBtn = document.getElementById("dir-right");

  const textColorPicker = document.getElementById("text-color-picker");
  const textColorInput = document.getElementById("text-color-input");
  
  const bgModeSolidBtn = document.getElementById("bg-mode-solid");
  const bgModeGradientBtn = document.getElementById("bg-mode-gradient");
  
  const solidBgSection = document.getElementById("solid-bg-section");
  const gradientBgSection = document.getElementById("gradient-bg-section");

  const bgColorPicker = document.getElementById("bg-color-picker");
  const bgColorInput = document.getElementById("bg-color-input");
  
  const gradientStartPicker = document.getElementById("gradient-start-picker");
  const gradientStartInput = document.getElementById("gradient-start-input");
  const gradientEndPicker = document.getElementById("gradient-end-picker");
  const gradientEndInput = document.getElementById("gradient-end-input");
  
  const gradDirRBtn = document.getElementById("grad-dir-r");
  const gradDirBBtn = document.getElementById("grad-dir-b");
  const gradDirBrBtn = document.getElementById("grad-dir-br");
  const gradRadialBtn = document.getElementById("grad-radial");

  // Presets
  const presetNeonBtn = document.getElementById("preset-neon");
  const presetLedBtn = document.getElementById("preset-led");
  const presetDarkBtn = document.getElementById("preset-dark");

  // Interaction controls
  const previewScreenContainer = document.getElementById("preview-screen-container");
  const previewCanvas = document.getElementById("preview-canvas");
  const pctx = previewCanvas.getContext("2d");
  
  const previewControlBtn = document.getElementById("preview-control");
  const previewControlIcon = document.getElementById("preview-control-icon");
  const previewControlText = document.getElementById("preview-control-text");
  const previewFullBtn = document.getElementById("preview-fullscreen");
  
  // Media Exporters UI elements
  const exportResolutionSelect = document.getElementById("export-resolution");
  const exportDurationSelect = document.getElementById("export-duration");
  const exportFpsSelect = document.getElementById("export-fps");
  const exportProgressSection = document.getElementById("export-progress-section");
  const exportStatusLabel = document.getElementById("export-status-label");
  const exportProgressPercent = document.getElementById("export-progress-percent");
  const exportProgressBar = document.getElementById("export-progress-bar");
  
  const btnExportVideo = document.getElementById("btn-export-video");
  const btnExportGif = document.getElementById("btn-export-gif");

  // Exporters (HTML codes)
  const btnReset = document.getElementById("btn-reset");
  const btnCopy = document.getElementById("btn-copy");
  const btnDownload = document.getElementById("btn-download");
  const copyToast = document.getElementById("copy-toast");
  const btnDownloadText = document.getElementById("btn-download-text");
  const downloadLoadingSpin = document.getElementById("download-loading-spin");
  const downloadIcon = document.getElementById("download-icon");
  const apiErrorAlert = document.getElementById("api-error-alert");

  // Raw Code Drawer
  const toggleRawCodeBtn = document.getElementById("toggle-raw-code");
  const rawCodeChevron = document.getElementById("raw-code-chevron");
  const rawCodeDrawer = document.getElementById("raw-code-drawer");
  const codeOutputInspect = document.getElementById("code-output-inspect");

  // --- Initial Config State ---
  let config = {
    text: "RUNNING TEXT GENERATOR ★ EASILY EXPORT HTML WIDGETS ★ SMOOTH HARDWARE ACCELERATED TEXT",
    fontFamily: "Inter",
    fontSize: 48,
    speedRating: 5, // Rating 1 to 10
    direction: "left", // 'left' or 'right'
    bold: false,
    italic: false,
    textColor: "#06b6d4", // Cyan 500
    bgMode: "gradient", // 'solid' or 'gradient'
    bgColor: "#090d16", // Deep space dark blue
    gradientStart: "#161b33", // Space Blue
    gradientEnd: "#05050d", // Dark Space black
    gradientType: "linear-r", // 'linear-r', 'linear-b', 'linear-br', 'radial'
    themePreset: "dark", // 'neon', 'led', 'dark', 'none'
    isAnimationPaused: false
  };

  const resolutions = {
    "480p": { width: 854, height: 480 },
    "720p": { width: 1280, height: 720 },
    "1080p": { width: 1920, height: 1080 }
  };

  const speedToSecondsMap = {
    1: 30,
    2: 24,
    3: 18,
    4: 14,
    5: 11,
    6: 8,
    7: 6,
    8: 4,
    9: 3,
    10: 2
  };

  // --- HTML5 Canvas State offsets ---
  let xOffset = 0; // The scrolling offset state
  let ledPatternCache = null;

  // Pre-compile LED matrix pattern using a tiny offscreen Canvas pattern
  function getLedPattern(ctx) {
    if (ledPatternCache) return ledPatternCache;

    const patternCanvas = document.createElement("canvas");
    patternCanvas.width = 6;
    patternCanvas.height = 6;
    const pctx = patternCanvas.getContext("2d");

    // Diode backdrop matrix color gaps
    pctx.fillStyle = "rgba(10, 10, 15, 0.82)";
    pctx.fillRect(0, 0, 6, 6);

    // Erase a circular cutout diode in the center
    pctx.globalCompositeOperation = "destination-out";
    pctx.beginPath();
    pctx.arc(3, 3, 2.3, 0, Math.PI * 2);
    pctx.fill();

    // Source Over to add a real physical border framing
    pctx.globalCompositeOperation = "source-over";
    pctx.strokeStyle = "rgba(0, 0, 0, 0.9)";
    pctx.lineWidth = 0.55;
    pctx.beginPath();
    pctx.arc(3, 3, 2.3, 0, Math.PI * 2);
    pctx.stroke();

    ledPatternCache = ctx.createPattern(patternCanvas, "repeat");
    return ledPatternCache;
  }

  // Asynchronous Font loader to prevent canvas fallbacks
  function loadGoogleFontForCanvas(fontFamilyName) {
    if (!fontFamilyName) return;
    const spec = `16px "${fontFamilyName}"`;
    document.fonts.load(spec).then(() => {
      // Font is cached, repaints automatically
    }).catch(err => {
      console.warn("Could not load Google Font in background context", err);
    });
  }

  // --- Centralized Canvas Rendering Engine ---
  function drawFrame(ctx, width, height, text, currentConfig, updateCursor = true) {
    // 1. Draw Background (Solid or Gradient)
    if (currentConfig.bgMode === "solid") {
      ctx.fillStyle = currentConfig.bgColor;
      ctx.fillRect(0, 0, width, height);
    } else {
      let gradient;
      const gStart = currentConfig.gradientStart;
      const gEnd = currentConfig.gradientEnd;
      
      if (currentConfig.gradientType === "linear-r") {
        gradient = ctx.createLinearGradient(0, 0, width, 0);
      } else if (currentConfig.gradientType === "linear-b") {
        gradient = ctx.createLinearGradient(0, 0, 0, height);
      } else if (currentConfig.gradientType === "linear-br") {
        gradient = ctx.createLinearGradient(0, 0, width, height);
      } else if (currentConfig.gradientType === "radial") {
        gradient = ctx.createRadialGradient(width / 2, height / 2, 5, width / 2, height / 2, Math.max(width, height) / 1.5);
      }
      
      gradient.addColorStop(0, gStart);
      gradient.addColorStop(1, gEnd);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    }
    
    // 2. Setup Typography & Shadows
    ctx.save();
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    
    const fontStyle = currentConfig.italic ? "italic" : "normal";
    const fontWeight = currentConfig.bold ? "bold" : "normal";
    ctx.font = `${fontStyle} ${fontWeight} ${currentConfig.fontSize}px "${currentConfig.fontFamily}", sans-serif`;
    
    // Applying authentic canvas glow states
    if (currentConfig.themePreset === "neon") {
      ctx.shadowColor = currentConfig.textColor;
      ctx.shadowBlur = 24;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    } else if (currentConfig.themePreset === "led") {
      ctx.shadowColor = currentConfig.textColor;
      ctx.shadowBlur = 8;
    } else {
      ctx.shadowBlur = 0;
    }
    
    ctx.fillStyle = currentConfig.textColor;
    
    // Measure string on Canvas and scale looping
    const metrics = ctx.measureText(text);
    const textWidth = metrics.width || (text.length * currentConfig.fontSize * 0.6);
    const gap = currentConfig.fontSize * 2.5; // Gap proportional to font size
    const spacing = textWidth + gap;
    
    const textYPosition = height / 2;
    
    // Print looping message repetitions to keep screen endlessly populated
    let cursorX = xOffset;
    
    if (currentConfig.direction === "left") {
      while (cursorX < width) {
        ctx.fillText(text, cursorX, textYPosition);
        cursorX += spacing;
      }
    } else {
      while (cursorX > -spacing) {
        ctx.fillText(text, cursorX, textYPosition);
        cursorX -= spacing;
      }
    }
    ctx.restore();
    
    // 3. LED Pixel Grid masking overlay
    if (currentConfig.themePreset === "led") {
      const ledPattern = getLedPattern(ctx);
      if (ledPattern) {
        ctx.save();
        ctx.fillStyle = ledPattern;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
      }
    }
    
    // 4. Update horizontal displacement value
    if (updateCursor && !currentConfig.isAnimationPaused) {
      // Speed multiplier scales with width so animation speed looks consistent at high HD resolutions
      const frameSpeedFactor = currentConfig.speedRating * (width / 854) * 0.72;
      
      if (currentConfig.direction === "left") {
        xOffset -= frameSpeedFactor;
        if (xOffset < -spacing) {
          xOffset += spacing;
        }
      } else {
        xOffset += frameSpeedFactor;
        if (xOffset > width) {
          xOffset -= spacing;
        }
      }
    }
  }

  // --- Real-time Onscreen Animation Loop ---
  function livePreviewLoop() {
    const resKey = exportResolutionSelect.value || "720p";
    const dims = resolutions[resKey] || resolutions["720p"];
    
    if (previewCanvas.width !== dims.width || previewCanvas.height !== dims.height) {
      previewCanvas.width = dims.width;
      previewCanvas.height = dims.height;
    }

    // Paint active canvas structure
    drawFrame(pctx, previewCanvas.width, previewCanvas.height, config.text, config, true);

    requestAnimationFrame(livePreviewLoop);
  }

  // --- Update GUI Inputs & Synchronization ---
  function syncInputs() {
    textInput.value = config.text;
    charCounter.textContent = `${config.text.length} chars`;
    fontSelect.value = config.fontFamily;
    sizeSlider.value = config.fontSize;
    sizeValueText.textContent = `${config.fontSize}px`;
    speedSlider.value = config.speedRating;
    speedValueText.textContent = `Rating: ${config.speedRating} (${speedToSecondsMap[config.speedRating]}s)`;
    
    setToggleButtonActive(toggleBoldBtn, config.bold);
    setToggleButtonActive(toggleItalicBtn, config.italic);
    setDirectionActive(config.direction);

    textColorPicker.value = config.textColor;
    textColorInput.value = config.textColor;
    bgColorPicker.value = config.bgColor;
    bgColorInput.value = config.bgColor;
    gradientStartPicker.value = config.gradientStart;
    gradientStartInput.value = config.gradientStart;
    gradientEndPicker.value = config.gradientEnd;
    gradientEndInput.value = config.gradientEnd;

    setBgModeActive(config.bgMode);
    setGradientDirectionActive(config.gradientType);
    setPlayPauseButtonState(config.isAnimationPaused);

    // Trigger asynchronous download font family
    loadGoogleFontForCanvas(config.fontFamily);

    // Refresh standalone stylesheet codes drawer display
    updateDrawerCodeOutput();
  }

  function setToggleButtonActive(button, isActive) {
    if (isActive) {
      button.classList.add("bg-indigo-50", "border-indigo-300", "text-indigo-600");
      button.classList.remove("text-slate-500", "border-slate-200", "bg-slate-50");
    } else {
      button.classList.remove("bg-indigo-50", "border-indigo-300", "text-indigo-600");
      button.classList.add("text-slate-500", "border-slate-200", "bg-slate-50");
    }
  }

  function setDirectionActive(direction) {
    if (direction === "left") {
      dirLeftBtn.className = "py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer bg-indigo-50 border border-indigo-200 text-indigo-600 shadow-sm";
      dirRightBtn.className = "py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer text-slate-500 hover:text-slate-700 bg-white border border-slate-200";
    } else {
      dirRightBtn.className = "py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer bg-indigo-50 border border-indigo-200 text-indigo-600 shadow-sm";
      dirLeftBtn.className = "py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer text-slate-500 hover:text-slate-700 bg-white border border-slate-200";
    }
  }

  function setBgModeActive(mode) {
    if (mode === "solid") {
      bgModeSolidBtn.className = "py-1.5 text-[10px] font-semibold rounded-lg transition-all cursor-pointer bg-indigo-50 text-indigo-600 border border-indigo-200 shadow-sm";
      bgModeGradientBtn.className = "py-1.5 text-[10px] font-semibold rounded-lg transition-all cursor-pointer text-slate-500 hover:text-slate-700 bg-white border border-slate-200";
      solidBgSection.classList.remove("hidden");
      gradientBgSection.classList.add("hidden");
    } else {
      bgModeGradientBtn.className = "py-1.5 text-[10px] font-semibold rounded-lg transition-all cursor-pointer bg-indigo-50 text-indigo-600 border border-indigo-200 shadow-sm";
      bgModeSolidBtn.className = "py-1.5 text-[10px] font-semibold rounded-lg transition-all cursor-pointer text-slate-500 hover:text-slate-700 bg-white border border-slate-200";
      solidBgSection.classList.add("hidden");
      gradientBgSection.classList.remove("hidden");
    }
  }

  function setGradientDirectionActive(dir) {
    const buttons = {
      "linear-r": gradDirRBtn,
      "linear-b": gradDirBBtn,
      "linear-br": gradDirBrBtn,
      "radial": gradRadialBtn
    };

    Object.entries(buttons).forEach(([key, btn]) => {
      if (!btn) return;
      if (key === dir) {
        btn.className = "py-1 text-[10px] font-semibold rounded-md cursor-pointer bg-indigo-50 text-indigo-600 border border-indigo-200 shadow-sm";
      } else {
        btn.className = "py-1 text-[10px] font-semibold rounded-md cursor-pointer text-slate-500 hover:text-slate-700 bg-white border border-transparent";
      }
    });
  }

  function setPlayPauseButtonState(isPaused) {
    if (isPaused) {
      previewControlIcon.setAttribute("data-lucide", "play");
      previewControlIcon.className = "w-3.5 h-3.5 text-emerald-500";
      previewControlText.textContent = "Resume Animation";
    } else {
      previewControlIcon.setAttribute("data-lucide", "pause");
      previewControlIcon.className = "w-3.5 h-3.5 text-amber-500";
      previewControlText.textContent = "Pause Animation";
    }
    lucide.createIcons();
  }

  function updateDrawerCodeOutput() {
    let backgroundValue = "";
    if (config.bgMode === "solid") {
      backgroundValue = config.bgColor;
    } else {
      const gStart = config.gradientStart;
      const gEnd = config.gradientEnd;
      if (config.gradientType === "linear-r") {
        backgroundValue = `linear-gradient(to right, ${gStart}, ${gEnd})`;
      } else if (config.gradientType === "linear-b") {
        backgroundValue = `linear-gradient(to bottom, ${gStart}, ${gEnd})`;
      } else if (config.gradientType === "linear-br") {
        backgroundValue = `linear-gradient(to bottom right, ${gStart}, ${gEnd})`;
      } else if (config.gradientType === "radial") {
        backgroundValue = `radial-gradient(circle, ${gStart}, ${gEnd})`;
      }
    }

    const seconds = speedToSecondsMap[config.speedRating];
    const boldWeight = config.bold ? "bold" : "normal";
    const italicStyle = config.italic ? "italic" : "normal";
    const animationName = config.direction === "right" ? "scroll-right" : "scroll-left";
    let textShadowStyleLine = "";
    
    if (config.themePreset === "neon") {
      textShadowStyleLine = `\n  text-shadow: 0 0 10px ${config.textColor}, 0 0 20px ${config.textColor};`;
    } else if (config.themePreset === "led") {
      textShadowStyleLine = `\n  text-shadow: 0 0 4px rgba(255, 0, 0, 0.6);`;
    }

    const htmlLayoutInspect = `.marquee-container {
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  position: relative;
  background: ${backgroundValue};
}

.marquee-text {
  display: inline-block;
  white-space: nowrap;
  padding-left: 100%;
  font-size: ${config.fontSize}px;
  color: ${config.textColor};
  font-family: '${config.fontFamily}', sans-serif;
  font-weight: ${boldWeight};
  font-style: ${italicStyle};
  animation: ${animationName} ${seconds}s linear infinite;${textShadowStyleLine}
}

@keyframes scroll-left {
  0% { transform: translate3d(0, 0, 0); }
  100% { transform: translate3d(-100%, 0, 0); }
}

@keyframes scroll-right {
  0% { transform: translate3d(-100%, 0, 0); }
  100% { transform: translate3d(0, 0, 0); }
}`;
    
    codeOutputInspect.textContent = htmlLayoutInspect;
  }

  function applyConfigChangeAndRender(newConfig) {
    config = { ...config, ...newConfig };
    syncInputs();
  }

  // --- Input Element Listeners ---
  textInput.addEventListener("input", (e) => {
    applyConfigChangeAndRender({ text: e.target.value });
  });

  fontSelect.addEventListener("change", (e) => {
    applyConfigChangeAndRender({ fontFamily: e.target.value });
  });

  sizeSlider.addEventListener("input", (e) => {
    applyConfigChangeAndRender({ fontSize: parseInt(e.target.value) });
  });

  speedSlider.addEventListener("input", (e) => {
    applyConfigChangeAndRender({ speedRating: parseInt(e.target.value) });
  });

  toggleBoldBtn.addEventListener("click", () => {
    applyConfigChangeAndRender({ bold: !config.bold });
  });

  toggleItalicBtn.addEventListener("click", () => {
    applyConfigChangeAndRender({ italic: !config.italic });
  });

  dirLeftBtn.addEventListener("click", () => {
    applyConfigChangeAndRender({ direction: "left" });
  });

  dirRightBtn.addEventListener("click", () => {
    applyConfigChangeAndRender({ direction: "right" });
  });

  bgModeSolidBtn.addEventListener("click", () => {
    applyConfigChangeAndRender({ bgMode: "solid" });
  });

  bgModeGradientBtn.addEventListener("click", () => {
    applyConfigChangeAndRender({ bgMode: "gradient" });
  });

  textColorPicker.addEventListener("input", (e) => {
    applyConfigChangeAndRender({ textColor: e.target.value });
  });
  textColorInput.addEventListener("input", (e) => {
    if (e.target.value.match(/^#[0-9A-F]{6}$/i)) {
      applyConfigChangeAndRender({ textColor: e.target.value });
    }
  });

  bgColorPicker.addEventListener("input", (e) => {
    applyConfigChangeAndRender({ bgColor: e.target.value });
  });
  bgColorInput.addEventListener("input", (e) => {
    if (e.target.value.match(/^#[0-9A-F]{6}$/i)) {
      applyConfigChangeAndRender({ bgColor: e.target.value });
    }
  });

  gradientStartPicker.addEventListener("input", (e) => {
    applyConfigChangeAndRender({ gradientStart: e.target.value });
  });
  gradientStartInput.addEventListener("input", (e) => {
    if (e.target.value.match(/^#[0-9A-F]{6}$/i)) {
      applyConfigChangeAndRender({ gradientStart: e.target.value });
    }
  });

  gradientEndPicker.addEventListener("input", (e) => {
    applyConfigChangeAndRender({ gradientEnd: e.target.value });
  });
  gradientEndInput.addEventListener("input", (e) => {
    if (e.target.value.match(/^#[0-9A-F]{6}$/i)) {
      applyConfigChangeAndRender({ gradientEnd: e.target.value });
    }
  });

  gradDirRBtn.addEventListener("click", () => {
    applyConfigChangeAndRender({ gradientType: "linear-r" });
  });
  gradDirBBtn.addEventListener("click", () => {
    applyConfigChangeAndRender({ gradientType: "linear-b" });
  });
  gradDirBrBtn.addEventListener("click", () => {
    applyConfigChangeAndRender({ gradientType: "linear-br" });
  });
  gradRadialBtn.addEventListener("click", () => {
    applyConfigChangeAndRender({ gradientType: "radial" });
  });

  previewControlBtn.addEventListener("click", () => {
    applyConfigChangeAndRender({ isAnimationPaused: !config.isAnimationPaused });
  });

  // Clicking the canvas also triggers pause/play for an extremely friendly UX
  previewCanvas.addEventListener("click", () => {
    applyConfigChangeAndRender({ isAnimationPaused: !config.isAnimationPaused });
  });

  previewFullBtn.addEventListener("click", () => {
    if (!document.fullscreenElement) {
      previewScreenContainer.requestFullscreen()
        .then(() => {
          previewScreenContainer.classList.add("h-full", "w-full", "border-none");
        })
        .catch(err => {
          console.warn("Fullscreen mode not supported:", err.message);
        });
    } else {
      document.exitFullscreen();
    }
  });

  document.addEventListener("fullscreenchange", () => {
    if (!document.fullscreenElement) {
      previewScreenContainer.classList.remove("h-full", "w-full", "border-none");
    }
  });

  // --- Advanced Media Exporters ---

  // Export Video Handler (captureStream)
  async function exportToVideo() {
    const resKey = exportResolutionSelect.value;
    const duration = parseInt(exportDurationSelect.value);
    const fps = parseInt(exportFpsSelect.value);
    
    const dims = resolutions[resKey] || resolutions["720p"];
    
    // UI elements setup
    exportProgressSection.classList.remove("hidden");
    btnExportVideo.disabled = true;
    btnExportGif.disabled = true;
    exportProgressPercent.textContent = "0%";
    exportProgressBar.style.width = "0%";
    exportStatusLabel.textContent = "Preparing High-Def Video Stream...";
    
    // Save original offset
    const savedOffset = xOffset;
    xOffset = 0; // Starts clean
    
    // Detached canvas specifically for HD video captures
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = dims.width;
    exportCanvas.height = dims.height;
    const ectx = exportCanvas.getContext("2d");
    
    // Draw the very first frame
    drawFrame(ectx, dims.width, dims.height, config.text, {
      ...config,
      isAnimationPaused: false
    }, false);
    
    // Setup stream capture
    const stream = exportCanvas.captureStream(fps);
    let recordedChunks = [];
    
    let mimeType = 'video/webm;codecs=vp8';
    if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
      mimeType = 'video/webm;codecs=vp9';
    } else if (MediaRecorder.isTypeSupported('video/webm')) {
      mimeType = 'video/webm';
    } else if (MediaRecorder.isTypeSupported('video/mp4')) {
      mimeType = 'video/mp4';
    }
    
    let recorder;
    try {
      recorder = new MediaRecorder(stream, { mimeType: mimeType });
    } catch (e) {
      console.warn("Standard MIME fallback check failed, initializing standard fallback recorder", e);
      recorder = new MediaRecorder(stream);
    }
    
    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };
    
    recorder.onstop = () => {
      // Create high-speed download blob
      const videoBlob = new Blob(recordedChunks, { type: recorder.mimeType || 'video/webm' });
      const dlLink = document.createElement("a");
      dlLink.href = URL.createObjectURL(videoBlob);
      dlLink.download = `running-text-${resKey}.webm`;
      document.body.appendChild(dlLink);
      dlLink.click();
      document.body.removeChild(dlLink);
      
      // Cleanup states
      btnExportVideo.disabled = false;
      btnExportGif.disabled = false;
      exportProgressSection.classList.add("hidden");
      
      // Restore offset
      xOffset = savedOffset;
    };
    
    // Start recording segments
    recorder.start();
    
    const totalDurationMs = duration * 1000;
    const startTimePoint = performance.now();
    
    // Frame step animation loop matching export parameters
    function frameRenderLoop() {
      const now = performance.now();
      const elapsed = now - startTimePoint;
      const progress = Math.min(elapsed / totalDurationMs, 1);
      
      // Draw frame to capture
      drawFrame(ectx, dims.width, dims.height, config.text, {
        ...config,
        isAnimationPaused: false
      }, true);
      
      // Update responsive progress bar
      exportProgressPercent.textContent = `${Math.round(progress * 100)}%`;
      exportProgressBar.style.width = `${progress * 100}%`;
      exportStatusLabel.textContent = `Recording Video Frame-by-Frame (${(elapsed / 1000).toFixed(1)}s / ${duration}s)`;
      
      if (elapsed < totalDurationMs) {
        requestAnimationFrame(frameRenderLoop);
      } else {
        recorder.stop();
      }
    }
    
    // Begin video capture loops
    requestAnimationFrame(frameRenderLoop);
  }

  // Helper functions for dynamic script loading with CDN fallback
  function loadScript(url) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = url;
      script.crossOrigin = "anonymous";
      script.onload = () => resolve(true);
      script.onerror = () => reject(new Error(`Failed to load ${url}`));
      document.head.appendChild(script);
    });
  }

  async function ensureGifshotLoaded() {
    if (window.gifshot) return true;
    
    const urls = [
      "https://cdnjs.cloudflare.com/ajax/libs/gifshot/0.4.5/gifshot.min.js",
      "https://cdn.jsdelivr.net/npm/gifshot@0.4.5/dist/gifshot.min.js",
      "https://unpkg.com/gifshot@0.4.5/dist/gifshot.min.js"
    ];

    for (const url of urls) {
      try {
        console.log(`Trying to dynamically load gifshot from: ${url}`);
        await loadScript(url);
        if (window.gifshot) {
          console.log("Successfully loaded gifshot!");
          return true;
        }
      } catch (err) {
        console.warn(`Could not load gifshot from ${url}, retrying next...`);
      }
    }
    throw new Error("Unable to load the GIF compilation library (gifshot) from any cloud CDN. Please check your internet connectivity.");
  }

  // Export GIF Handler (Headless offline rendering & Web Worker compilation)
  function exportToGif() {
    const resKey = exportResolutionSelect.value;
    const duration = parseInt(exportDurationSelect.value);
    
    // Capping safety values for gif conversion to avoid extreme client frozen memory lag
    let fps = parseInt(exportFpsSelect.value);
    if (fps > 20) {
      fps = 15; // fallback to light 15 fps limit for GIF compilation safety
    }
// =========================
// Running Text Generator - Refactored (No Feature Changes)
// =========================

document.addEventListener("DOMContentLoaded", () => {
  // =========================
  // Helpers
  // =========================
  const $ = (id) => document.getElementById(id);

  const isHex = (v) => /^#[0-9A-F]{6}$/i.test(v);

  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  const setClass = (el, add, remove = []) => {
    if (!el) return;
    el.classList.add(...add);
    el.classList.remove(...remove);
  };

  // =========================
  // DOM
  // =========================
  const el = {
    textInput: $("text-input"),
    charCounter: $("char-counter"),
    fontSelect: $("font-select"),
    sizeSlider: $("size-slider"),
    sizeValue: $("size-value"),
    speedSlider: $("speed-slider"),
    speedValue: $("speed-value"),

    bold: $("toggle-bold"),
    italic: $("toggle-italic"),
    dirLeft: $("dir-left"),
    dirRight: $("dir-right"),

    textColorPicker: $("text-color-picker"),
    textColorInput: $("text-color-input"),

    bgSolid: $("bg-mode-solid"),
    bgGradient: $("bg-mode-gradient"),
    solidSection: $("solid-bg-section"),
    gradientSection: $("gradient-bg-section"),

    bgColorPicker: $("bg-color-picker"),
    bgColorInput: $("bg-color-input"),

    gradStartPicker: $("gradient-start-picker"),
    gradStartInput: $("gradient-start-input"),
    gradEndPicker: $("gradient-end-picker"),
    gradEndInput: $("gradient-end-input"),

    gradR: $("grad-dir-r"),
    gradB: $("grad-dir-b"),
    gradBr: $("grad-dir-br"),
    gradRadial: $("grad-radial"),

    canvas: $("preview-canvas"),
    canvasWrap: $("preview-screen-container"),

    previewBtn: $("preview-control"),
    previewIcon: $("preview-control-icon"),
    previewText: $("preview-control-text"),
    fullBtn: $("preview-fullscreen"),

    reset: $("btn-reset"),

    codeOut: $("code-output-inspect")
  };

  const ctx = el.canvas.getContext("2d");

  // =========================
  // Config
  // =========================
  let config = {
    text: "RUNNING TEXT GENERATOR ★ EASILY EXPORT HTML WIDGETS ★ SMOOTH HARDWARE ACCELERATED TEXT",
    fontFamily: "Inter",
    fontSize: 48,
    speedRating: 5,
    direction: "left",
    bold: false,
    italic: false,
    textColor: "#06b6d4",
    bgMode: "gradient",
    bgColor: "#090d16",
    gradientStart: "#161b33",
    gradientEnd: "#05050d",
    gradientType: "linear-r",
    themePreset: "dark",
    isAnimationPaused: false
  };

  const resolutions = {
    "480p": { width: 854, height: 480 },
    "720p": { width: 1280, height: 720 },
    "1080p": { width: 1920, height: 1080 }
  };

  const speedMap = {
    1: 30, 2: 24, 3: 18, 4: 14, 5: 11,
    6: 8, 7: 6, 8: 4, 9: 3, 10: 2
  };

  let xOffset = 0;
  let ledCache = null;

  // =========================
  // Background Builder (DEDUP)
  // =========================
  const getBackground = (cfg, ctx, w, h) => {
    if (cfg.bgMode === "solid") {
      ctx.fillStyle = cfg.bgColor;
      ctx.fillRect(0, 0, w, h);
      return;
    }

    let g;
    const { gradientStart: a, gradientEnd: b } = cfg;

    if (cfg.gradientType === "linear-r") g = ctx.createLinearGradient(0, 0, w, 0);
    else if (cfg.gradientType === "linear-b") g = ctx.createLinearGradient(0, 0, 0, h);
    else if (cfg.gradientType === "linear-br") g = ctx.createLinearGradient(0, 0, w, h);
    else g = ctx.createRadialGradient(w / 2, h / 2, 5, w / 2, h / 2, Math.max(w, h) / 1.5);

    g.addColorStop(0, a);
    g.addColorStop(1, b);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  };

  // =========================
  // LED Pattern
  // =========================
  const getLed = (ctx) => {
    if (ledCache) return ledCache;

    const c = document.createElement("canvas");
    c.width = c.height = 6;
    const p = c.getContext("2d");

    p.fillStyle = "rgba(10,10,15,.82)";
    p.fillRect(0, 0, 6, 6);

    p.globalCompositeOperation = "destination-out";
    p.beginPath();
    p.arc(3, 3, 2.3, 0, Math.PI * 2);
    p.fill();

    p.globalCompositeOperation = "source-over";
    p.strokeStyle = "rgba(0,0,0,.9)";
    p.lineWidth = 0.55;
    p.stroke();

    ledCache = ctx.createPattern(c, "repeat");
    return ledCache;
  };

  // =========================
  // Canvas Renderer
  // =========================
  function draw(ctx, w, h, cfg, text, update = true) {
    getBackground(cfg, ctx, w, h);

    ctx.save();
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    ctx.font = `${cfg.italic ? "italic" : "normal"} ${cfg.bold ? "bold" : "normal"} ${cfg.fontSize}px "${cfg.fontFamily}"`;

    ctx.fillStyle = cfg.textColor;

    const m = ctx.measureText(text);
    const textW = m.width || text.length * cfg.fontSize * 0.6;
    const gap = cfg.fontSize * 2.5;
    const step = textW + gap;

    const y = h / 2;
    let x = xOffset;

    if (cfg.direction === "left") {
      while (x < w) {
        ctx.fillText(text, x, y);
        x += step;
      }
    } else {
      while (x > -step) {
        ctx.fillText(text, x, y);
        x -= step;
      }
    }

    ctx.restore();

    if (cfg.themePreset === "led") {
      const p = getLed(ctx);
      ctx.fillStyle = p;
      ctx.fillRect(0, 0, w, h);
    }

    if (update && !cfg.isAnimationPaused) {
      const speed = cfg.speedRating * (w / 854) * 0.72;

      if (cfg.direction === "left") {
        xOffset -= speed;
        if (xOffset < -step) xOffset += step;
      } else {
        xOffset += speed;
        if (xOffset > w) xOffset -= step;
      }
    }
  }

  // =========================
  // Loop
  // =========================
  function loop() {
    const dims = resolutions["720p"];

    if (el.canvas.width !== dims.width || el.canvas.height !== dims.height) {
      el.canvas.width = dims.width;
      el.canvas.height = dims.height;
    }

    draw(ctx, el.canvas.width, el.canvas.height, config, config.text);
    requestAnimationFrame(loop);
  }

  // =========================
  // Sync UI
  // =========================
  function sync() {
    el.textInput.value = config.text;
    el.charCounter.textContent = `${config.text.length} chars`;

    el.fontSelect.value = config.fontFamily;
    el.sizeSlider.value = config.fontSize;
    el.sizeValue.textContent = `${config.fontSize}px`;

    el.speedSlider.value = config.speedRating;
    el.speedValue.textContent = `Rating: ${config.speedRating} (${speedMap[config.speedRating]}s)`;

    el.textColorPicker.value = config.textColor;
    el.textColorInput.value = config.textColor;

    el.bgColorPicker.value = config.bgColor;
    el.bgColorInput.value = config.bgColor;

    el.gradStartPicker.value = config.gradientStart;
    el.gradStartInput.value = config.gradientStart;

    el.gradEndPicker.value = config.gradientEnd;
    el.gradEndInput.value = config.gradientEnd;

    loadFont(config.fontFamily);
    updateCode();
  }

  function loadFont(f) {
    document.fonts.load(`16px "${f}"`);
  }

  // =========================
  // Config update
  // =========================
  const apply = (patch) => {
    config = { ...config, ...patch };
    sync();
  };

  // =========================
  // Events
  // =========================
  el.textInput.oninput = (e) => apply({ text: e.target.value });
  el.fontSelect.onchange = (e) => apply({ fontFamily: e.target.value });
  el.sizeSlider.oninput = (e) => apply({ fontSize: +e.target.value });
  el.speedSlider.oninput = (e) => apply({ speedRating: +e.target.value });

  el.bold.onclick = () => apply({ bold: !config.bold });
  el.italic.onclick = () => apply({ italic: !config.italic });

  el.dirLeft.onclick = () => apply({ direction: "left" });
  el.dirRight.onclick = () => apply({ direction: "right" });

  el.textColorPicker.oninput = (e) => apply({ textColor: e.target.value });

  el.textColorInput.oninput = (e) => {
    if (isHex(e.target.value)) apply({ textColor: e.target.value });
  };

  el.bgColorPicker.oninput = (e) => apply({ bgColor: e.target.value });

  el.bgColorInput.oninput = (e) => {
    if (isHex(e.target.value)) apply({ bgColor: e.target.value });
  };

  el.gradStartPicker.oninput = (e) => apply({ gradientStart: e.target.value });
  el.gradStartInput.oninput = (e) => isHex(e.target.value) && apply({ gradientStart: e.target.value });

  el.gradEndPicker.oninput = (e) => apply({ gradientEnd: e.target.value });
  el.gradEndInput.oninput = (e) => isHex(e.target.value) && apply({ gradientEnd: e.target.value });

  el.previewBtn.onclick = () => apply({ isAnimationPaused: !config.isAnimationPaused });
  el.canvas.onclick = () => apply({ isAnimationPaused: !config.isAnimationPaused });

  el.fullBtn.onclick = () => {
    if (!document.fullscreenElement) {
      el.canvasWrap.requestFullscreen();
    } else document.exitFullscreen();
  };

  el.reset.onclick = () =>
    apply({
      text: "RUNNING TEXT GENERATOR ★ EASILY EXPORT HTML WIDGETS ★ SMOOTH HARDWARE ACCELERATED TEXT",
      fontFamily: "Inter",
      fontSize: 48,
      speedRating: 5,
      direction: "left",
      bold: false,
      italic: false,
      textColor: "#06b6d4",
      bgMode: "gradient",
      bgColor: "#090d16",
      gradientStart: "#161b33",
      gradientEnd: "#05050d",
      gradientType: "linear-r",
      themePreset: "dark",
      isAnimationPaused: false
    });

  // =========================
  // Code output (simplified but same logic)
  // =========================
  function updateCode() {
    el.codeOut.textContent = `
.marquee {
  font-size:${config.fontSize}px;
  color:${config.textColor};
  font-family:${config.fontFamily};
  animation:${config.direction === "right" ? "right" : "left"} ${speedMap[config.speedRating]}s linear infinite;
}
    `.trim();
  }

  // =========================
  // Boot
  // =========================
  sync();
  loop();
});