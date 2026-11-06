'use client';

import { useEffect, useRef } from 'react';
import Img from '../animations/Img';

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main(){ vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }`;

const FRAG = `
precision mediump float;
uniform sampler2D uTex;
uniform vec2 uMouse;
uniform vec2 uVel;
uniform float uHover;
uniform float uTime;
uniform vec2 uRes;
uniform vec2 uImg;
varying vec2 vUv;
vec2 cover(vec2 uv){
  float rs = uRes.x / uRes.y; float ri = uImg.x / uImg.y;
  vec2 s = rs < ri ? vec2(rs / ri, 1.0) : vec2(1.0, ri / rs);
  return (uv - 0.5) * s + 0.5;
}
void main(){
  vec2 uv = vUv;
  vec2 m = uMouse;
  vec2 asp = vec2(uRes.x / uRes.y, 1.0);
  float d = distance(uv * asp, m * asp);
  float fall = smoothstep(0.55, 0.0, d) * uHover;
  // liquid: concentric ripples around the pointer
  float wave = sin(d * 34.0 - uTime * 5.0) * 0.012 * fall;
  vec2 dir = normalize(uv - m + 0.0001);
  vec2 off = dir * wave + uVel * 0.06 * fall;
  // RGB split pulls channels apart along the motion
  vec2 split = (uVel * 0.08 + dir * 0.004) * fall;
  vec2 base = cover(vec2(uv.x, 1.0 - uv.y));
  float r = texture2D(uTex, base + off + split).r;
  float g = texture2D(uTex, base + off).g;
  float b = texture2D(uTex, base + off - split).b;
  vec3 col = vec3(r, g, b);
  col += 0.06 * fall; // a little sheen
  gl_FragColor = vec4(col, 1.0);
}`;

/** Image with a WebGL liquid-ripple + RGB-split hover. Falls back to the plain image. */
export default function DistortImage({ src, alt, className = '' }: { src: string; alt: string; className?: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = wrap.current!;
    const cv = canvas.current!;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const gl = cv.getContext('webgl', { premultipliedAlpha: false, antialias: false });
    if (!gl) return;

    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'aPos');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const u = (n: string) => gl.getUniformLocation(prog, n);
    const uMouse = u('uMouse'),
      uVel = u('uVel'),
      uHover = u('uHover'),
      uTime = u('uTime'),
      uRes = u('uRes'),
      uImg = u('uImg');

    const tex = gl.createTexture();
    let ready = false;
    const image = new Image();
    image.decoding = 'async';
    image.src = `/_next/image?url=${encodeURIComponent(src)}&w=828&q=75`;
    image.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      gl.uniform2f(uImg, image.naturalWidth, image.naturalHeight);
      ready = true;
      resize();
      draw(0);
    };

    const resize = () => {
      const r = el.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio, 1.5);
      cv.width = Math.max(1, Math.round(r.width * dpr));
      cv.height = Math.max(1, Math.round(r.height * dpr));
      gl.viewport(0, 0, cv.width, cv.height);
      gl.uniform2f(uRes, cv.width, cv.height);
    };
    const ro = new ResizeObserver(() => {
      resize();
      if (ready) draw(performance.now());
    });
    ro.observe(el);

    const s = { mx: 0.5, my: 0.5, tx: 0.5, ty: 0.5, vx: 0, vy: 0, hover: 0, target: 0 };
    let raf = 0;
    const draw = (t: number) => {
      if (!ready) return;
      gl.uniform2f(uMouse, s.mx, s.my);
      gl.uniform2f(uVel, s.vx, s.vy);
      gl.uniform1f(uHover, s.hover);
      gl.uniform1f(uTime, t / 1000);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    const loop = (t: number) => {
      const px = s.mx,
        py = s.my;
      s.mx += (s.tx - s.mx) * 0.12;
      s.my += (s.ty - s.my) * 0.12;
      s.vx += (s.mx - px - s.vx) * 0.25;
      s.vy += (s.my - py - s.vy) * 0.25;
      s.hover += (s.target - s.hover) * 0.08;
      draw(t);
      if (s.target === 0 && s.hover < 0.003) {
        s.hover = 0;
        draw(t);
        raf = 0;
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      s.tx = (e.clientX - r.left) / r.width;
      s.ty = 1 - (e.clientY - r.top) / r.height;
      start();
    };
    const enter = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      s.target = 1;
      move(e);
    };
    const leave = () => {
      s.target = 0;
      start();
    };
    el.addEventListener('pointerenter', enter);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      el.removeEventListener('pointerenter', enter);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, [src]);

  return (
    <div ref={wrap} className={`relative overflow-hidden ${className}`} data-cursor="view" data-cursor-text="Hover">
      <Img src={src} alt={alt} sizes="(min-width: 1024px) 30vw, 90vw" />
      <canvas ref={canvas} aria-hidden className="absolute inset-0 h-full w-full" />
    </div>
  );
}
