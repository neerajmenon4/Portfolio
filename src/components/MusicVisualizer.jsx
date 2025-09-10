"use client";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import SongNotification from "./SongNotification";

export default function MusicVisualizer() {
  const containerRef = useRef(null);
  const rafRef = useRef(0);
  const rendererRef = useRef(null);
  const composerRef = useRef(null);
  const usePostProcessing = false; // disable to keep transparent background
  const cameraRef = useRef(null);
  const sceneRef = useRef(null);
  const meshRef = useRef(null);
  const matRef = useRef(null);
  const analyserRef = useRef(null);
  const soundRef = useRef(null);
  const listenerRef = useRef(null);
  // Token to prevent race conditions from async AudioLoader.load callbacks
  const loadIdRef = useRef(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [songIndex, setSongIndex] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const [currentSongName, setCurrentSongName] = useState("");
  const [notificationStatus, setNotificationStatus] = useState("nowPlaying"); // 'loading' | 'nowPlaying'
  const [currentPlayingSong, setCurrentPlayingSong] = useState(""); // Track actual song being played
  const { theme } = useTheme();

  const songs = [
    "/music/Air.wav",
    "/music/Glitch.wav",
    "/music/House_Final.wav",
    "/music/Space.wav",
    "/music/Water.wav",
  ];

  const getSongName = (filePath) => {
    const fileName = filePath.split('/').pop().replace('.wav', '');
    return fileName.replace(/_/g, ' ');
  };

  const showSongNotification = (songPath) => {
    const songName = getSongName(songPath);
    setCurrentSongName(songName);
    setCurrentPlayingSong(songPath); // Track the actual song
    setNotificationStatus("nowPlaying");
    setShowNotification(true);
    console.log(`🎵 NOW PLAYING: ${songName} (path: ${songPath})`);
  };

  const showLoadingNotification = (songPath) => {
    const songName = getSongName(songPath);
    setCurrentSongName(songName);
    setNotificationStatus("loading");
    setShowNotification(true);
    console.log(`⏳ LOADING: ${songName} (path: ${songPath})`);
  };

  const loadSong = (index) => {
    if (!soundRef.current) return;

    // Increment token for this load request
    const myLoadId = ++loadIdRef.current;
    const songPath = songs[index];
    console.log(`🔄 Loading song index ${index}: ${songPath}`);

    // Stop current sound if playing
    if (soundRef.current.isPlaying) {
      try { soundRef.current.stop(); } catch {}
    }

    const audioLoader = new THREE.AudioLoader();
    audioLoader.load(
      songPath,
      (buffer) => {
        // Ignore if another load started after this one
        if (loadIdRef.current !== myLoadId) return;
        console.log(`✅ Song loaded successfully: ${songPath}`);
        // Success callback
        soundRef.current.setBuffer(buffer);
        try { soundRef.current.setLoop(false); } catch {}
        analyserRef.current = new THREE.AudioAnalyser(soundRef.current, 32);
        if (isPlaying) {
          try {
            soundRef.current.play();
            // Attach end handler to auto-advance
            if (soundRef.current.source) {
              soundRef.current.source.onended = () => {
                console.log(`🏁 Song ended: ${songPath}`);
                setSongIndex((prev) => (prev + 1) % songs.length);
              };
            }
            console.log(`🎵 Started playing: ${songPath}`);
          } catch {}
          // Show notification only after playback actually starts
          showSongNotification(songPath);
        } else {
          // Not playing: keep any existing 'loading' notification as-is.
          // Do not show 'NOW PLAYING' until playback begins.
          console.log(`📦 Song loaded but not playing: ${songPath}`);
        }
      },
      () => {
        // Progress callback (optional) - intentionally silent to avoid noisy logs
      },
      (error) => {
        // Ignore if another load started after this one
        if (loadIdRef.current !== myLoadId) return;
        console.error('Error loading song:', songPath, error);
        // Try to load next song
        const nextIndex = (index + 1) % songs.length;
        if (nextIndex !== index) {
          // show loading for the next song as we switch
          showLoadingNotification(songs[nextIndex]);
          setSongIndex(nextIndex);
        }
      }
    );
  };

  const playPause = () => {
    if (!soundRef.current) return;
    // Ensure AudioContext is resumed on user gesture
    try { listenerRef.current?.context?.resume?.(); } catch {}
    console.log(`🎮 Play/Pause clicked. Current state: isPlaying=${isPlaying}, songIndex=${songIndex}`);
    if (isPlaying) {
      soundRef.current.pause();
      setIsPlaying(false);
      console.log(`⏸️ Paused: ${currentPlayingSong}`);
    } else {
      soundRef.current.play();
      // Attach end handler to auto-advance
      if (soundRef.current.source) {
        soundRef.current.source.onended = () => {
          console.log(`🏁 Song ended: ${currentPlayingSong}`);
          setSongIndex((prev) => (prev + 1) % songs.length);
        };
      }
      setIsPlaying(true);
      console.log(`▶️ Resumed/Started: ${currentPlayingSong}`);
      // Announce the track that actually started playing
      showSongNotification(currentPlayingSong || songs[songIndex]);
    }
  };

  const nextSong = () => {
    // Ensure AudioContext is resumed on user gesture
    try { listenerRef.current?.context?.resume?.(); } catch {}
    const nextIndex = (songIndex + 1) % songs.length;
    console.log(`⏭️ Next song: from index ${songIndex} to ${nextIndex}`);
    // show immediate loading notification for feedback
    showLoadingNotification(songs[nextIndex]);
    setSongIndex(nextIndex);
    setIsPlaying(true);
    // Notification will be shown in loadSong success callback
  };

  const prevSong = () => {
    // Ensure AudioContext is resumed on user gesture
    try { listenerRef.current?.context?.resume?.(); } catch {}
    const prevIndex = (songIndex - 1 + songs.length) % songs.length;
    console.log(`⏮️ Previous song: from index ${songIndex} to ${prevIndex}`);
    // show immediate loading notification for feedback
    showLoadingNotification(songs[prevIndex]);
    setSongIndex(prevIndex);
    setIsPlaying(true);
    // Notification will be shown in loadSong success callback
  };

  useEffect(() => {
    // Initialize Three.js scene
    const container = containerRef.current;
    if (!container) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    // Set initial clear color based on current theme
    const isDarkInit = theme === "dark";
    if (isDarkInit) {
      renderer.setClearColor(0x000000, 0);
      renderer.setClearAlpha(0);
      if (renderer.domElement && renderer.domElement.style) {
        renderer.domElement.style.background = "transparent";
        renderer.domElement.style.backgroundColor = "transparent";
      }
    } else {
      renderer.setClearColor(0xffffff, 1);
      renderer.setClearAlpha(1);
      if (renderer.domElement && renderer.domElement.style) {
        renderer.domElement.style.background = "#ffffff";
        renderer.domElement.style.backgroundColor = "#ffffff";
      }
    }
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, -2, 14);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    if (usePostProcessing) {
      const renderPass = new RenderPass(scene, camera);
      const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(container.clientWidth, container.clientHeight)
      );
      bloomPass.threshold = 0.5;
      bloomPass.strength = 0.2;
      bloomPass.radius = 0.8;

      const composer = new EffectComposer(renderer);
      composer.addPass(renderPass);
      composer.addPass(bloomPass);
      composer.addPass(new OutputPass());
      composerRef.current = composer;
    }

    const uniforms = {
      u_time: new THREE.Uniform(0.0),
      u_frequency: new THREE.Uniform(1.0),
      u_red: new THREE.Uniform(1.0),
      u_green: new THREE.Uniform(1.0),
      u_blue: new THREE.Uniform(1.0),
    };

    const vertexShader = `
      uniform float u_time;
      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 permute(vec4 x) { return mod289(((x*34.0)+10.0)*x); }
      vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
      vec3 fade(vec3 t) { return t*t*t*(t*(t*6.0-15.0)+10.0); }
      float pnoise(vec3 P, vec3 rep) {
        vec3 Pi0 = mod(floor(P), rep);
        vec3 Pi1 = mod(Pi0 + vec3(1.0), rep);
        Pi0 = mod289(Pi0); Pi1 = mod289(Pi1);
        vec3 Pf0 = fract(P);
        vec3 Pf1 = Pf0 - vec3(1.0);
        vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
        vec4 iy = vec4(Pi0.yy, Pi1.yy);
        vec4 iz0 = Pi0.zzzz; vec4 iz1 = Pi1.zzzz;
        vec4 ixy = permute(permute(ix) + iy);
        vec4 ixy0 = permute(ixy + iz0);
        vec4 ixy1 = permute(ixy + iz1);
        vec4 gx0 = ixy0 * (1.0 / 7.0);
        vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
        gx0 = fract(gx0);
        vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
        vec4 sz0 = step(gz0, vec4(0.0));
        gx0 -= sz0 * (step(0.0, gx0) - 0.5);
        gy0 -= sz0 * (step(0.0, gy0) - 0.5);
        vec4 gx1 = ixy1 * (1.0 / 7.0);
        vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
        gx1 = fract(gx1);
        vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
        vec4 sz1 = step(gz1, vec4(0.0));
        gx1 -= sz1 * (step(0.0, gx1) - 0.5);
        gy1 -= sz1 * (step(0.0, gy1) - 0.5);
        vec3 g000 = vec3(gx0.x, gy0.x, gz0.x);
        vec3 g100 = vec3(gx0.y, gy0.y, gz0.y);
        vec3 g010 = vec3(gx0.z, gy0.z, gz0.z);
        vec3 g110 = vec3(gx0.w, gy0.w, gz0.w);
        vec3 g001 = vec3(gx1.x, gy1.x, gz1.x);
        vec3 g101 = vec3(gx1.y, gy1.y, gz1.y);
        vec3 g011 = vec3(gx1.z, gy1.z, gz1.z);
        vec3 g111 = vec3(gx1.w, gy1.w, gz1.w);
        vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
        g000 *= norm0.x; g010 *= norm0.y; g100 *= norm0.z; g110 *= norm0.w;
        vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
        g001 *= norm1.x; g011 *= norm1.y; g101 *= norm1.z; g111 *= norm1.w;
        float n000 = dot(g000, Pf0);
        float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
        float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
        float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
        float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
        float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
        float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
        float n111 = dot(g111, Pf1);
        vec3 fade_xyz = fade(Pf0);
        vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
        vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
        float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
        return 2.2 * n_xyz;
      }
      uniform float u_frequency;
      void main() {
        float noise = 3.0 * pnoise(position + u_time, vec3(10.0));
        float displacement = (u_frequency / 30.) * (noise / 10.);
        vec3 newPosition = position + normal * displacement;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
      }
    `;

    const fragmentShader = `
      uniform float u_red;
      uniform float u_blue;
      uniform float u_green;
      void main() {
        gl_FragColor = vec4(vec3(u_red, u_green, u_blue), 1.);
      }
    `;

    const mat = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      wireframe: true,
    });
    // Set initial color based on theme (white in dark, black in light)
    const setColorByTheme = (t) => {
      const isDark = t === "dark";
      mat.uniforms.u_red.value = isDark ? 1.0 : 0.0;
      mat.uniforms.u_green.value = isDark ? 1.0 : 0.0;
      mat.uniforms.u_blue.value = isDark ? 1.0 : 0.0;
    };
    setColorByTheme(theme);
    matRef.current = mat;

    const geo = new THREE.IcosahedronGeometry(3, 12); // lower subdivision for perf
    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);
    meshRef.current = mesh;

    // Audio
    const listener = new THREE.AudioListener();
    listenerRef.current = listener;
    camera.add(listener);
    const sound = new THREE.Audio(listener);
    soundRef.current = sound;
    // Show initial loading immediately, then load
    showLoadingNotification(songs[0]);
    loadSong(0);

    // Interaction
    let mouseX = 0;
    let mouseY = 0;
    const onMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      mouseX = (e.clientX - cx) / 100;
      mouseY = (e.clientY - cy) / 100;
    };
    window.addEventListener("mousemove", onMouseMove);

    const clock = new THREE.Clock();
    const animate = () => {
      camera.position.x += (mouseX - camera.position.x) * 0.05;
      camera.position.y += (-mouseY - camera.position.y) * 0.5;
      camera.lookAt(scene.position);
      mat.uniforms.u_time.value = clock.getElapsedTime();
      if (analyserRef.current) {
        mat.uniforms.u_frequency.value = analyserRef.current.getAverageFrequency();
      }
      if (usePostProcessing && composerRef.current) {
        composerRef.current.render();
      } else if (rendererRef.current) {
        rendererRef.current.render(scene, camera);
      }
      rafRef.current = requestAnimationFrame(animate);
    };

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      renderer.setSize(w, h);
      if (usePostProcessing && composerRef.current) {
        composerRef.current.setSize(w, h);
      }
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    animate();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      if (soundRef.current) {
        try { soundRef.current.stop(); } catch {}
        soundRef.current.disconnect();
      }
      if (meshRef.current) {
        meshRef.current.geometry.dispose();
        meshRef.current.material.dispose();
      }
      composerRef.current?.dispose?.();
      rendererRef.current?.dispose?.();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update shader color when theme changes
  useEffect(() => {
    if (!matRef.current) return;
    const isDark = theme === "dark";
    matRef.current.uniforms.u_red.value = isDark ? 1.0 : 0.0;
    matRef.current.uniforms.u_green.value = isDark ? 1.0 : 0.0;
    matRef.current.uniforms.u_blue.value = isDark ? 1.0 : 0.0;
    
    // Also update renderer clear color to guarantee expected background
    if (rendererRef.current) {
      if (isDark) {
        // In dark mode, keep transparent so page dark background shows
        rendererRef.current.setClearColor(0x000000, 0);
        rendererRef.current.setClearAlpha(0);
        if (rendererRef.current.domElement && rendererRef.current.domElement.style) {
          rendererRef.current.domElement.style.background = "transparent";
          rendererRef.current.domElement.style.backgroundColor = "transparent";
        }
      } else {
        // In light mode, render an opaque white background to avoid any black bleed
        rendererRef.current.setClearColor(0xffffff, 1);
        rendererRef.current.setClearAlpha(1);
        if (rendererRef.current.domElement && rendererRef.current.domElement.style) {
          rendererRef.current.domElement.style.background = "#ffffff";
          rendererRef.current.domElement.style.backgroundColor = "#ffffff";
        }
      }
    }
  }, [theme]);

  // Reload song when songIndex changes
  useEffect(() => {
    console.log(`📍 songIndex changed to: ${songIndex}, currentPlayingSong: ${currentPlayingSong}`);
    if (soundRef.current) {
      loadSong(songIndex);
    }
  }, [songIndex]);

  // Initial notification removed; we now notify only after a successful load
  useEffect(() => {
    // no-op
  }, []);

  return (
    <>
      <div style={{ position: "fixed", top: 64, left: 0, right: 0, bottom: 0, overflow: "hidden", backgroundColor: "transparent" }}>
        <div ref={containerRef} style={{ width: "100%", height: "100%", backgroundColor: "transparent" }} />
        <div
          style={{
            position: "fixed",
            bottom: 20,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: 10,
            zIndex: 10,
          }}
        >
          <button 
            aria-label="Play or pause audio" 
            onClick={playPause}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            {isPlaying ? (
              <svg 
                className="w-5 h-5" 
                style={{ color: 'var(--foreground)' }}
                fill="currentColor" 
                viewBox="0 0 24 24"
              >
                <rect x="6" y="4" width="4" height="16" rx="0.5"/>
                <rect x="14" y="4" width="4" height="16" rx="0.5"/>
              </svg>
            ) : (
              <svg 
                className="w-5 h-5" 
                style={{ color: 'var(--foreground)' }}
                fill="currentColor" 
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z"/>
              </svg>
            )}
          </button>
          <button 
            aria-label="Previous song" 
            onClick={prevSong}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <svg 
              className="w-5 h-5" 
              style={{ color: 'var(--foreground)' }}
              fill="currentColor" 
              viewBox="0 0 24 24"
            >
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
            </svg>
          </button>
          <button 
            aria-label="Next song" 
            onClick={nextSong}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <svg 
              className="w-5 h-5" 
              style={{ color: 'var(--foreground)' }}
              fill="currentColor" 
              viewBox="0 0 24 24"
            >
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
            </svg>
          </button>
        </div>
      </div>
      
      <SongNotification 
        songName={currentSongName}
        isVisible={showNotification}
        status={notificationStatus}
        onClose={() => setShowNotification(false)}
      />
    </>
  );
}
