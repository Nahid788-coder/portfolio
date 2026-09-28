import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

/*
  Liquid Glass 3D scene
  - One morphing "liquid glass" blob that refracts a warm, slowly moving backdrop.
  - A few glass pebbles and a glass ring orbit around it.
  - The blob travels across the page as you scroll and leans toward the cursor.
  - Lighter geometry on phones, a single still frame for reduced-motion users.
*/

const NOISE = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0); const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.0-g; vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857; vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z); vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy; vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0; vec4 s1=floor(b1)*2.0+1.0; vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0); m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}`;

/* Warm backdrop the glass refracts: latte base with drifting caramel and cocoa pools */
const backdropMaterial = () =>
  new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uScroll: { value: 0 }, uAspect: { value: 1 } },
    vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);} `,
    fragmentShader: /* glsl */ `
      precision highp float;
      varying vec2 vUv; uniform float uTime; uniform float uScroll; uniform float uAspect;
      ${NOISE}
      float pool(vec2 p, vec2 c, float r){ return smoothstep(r, 0.0, length(p-c)); }
      void main(){
        vec2 p = vUv - 0.5; p.x *= uAspect;
        float t = uTime*0.05; float s = uScroll;
        vec3 latte   = vec3(0.925,0.886,0.831);
        vec3 sand    = vec3(0.914,0.800,0.667);
        vec3 caramel = vec3(0.788,0.604,0.439);
        vec3 cinnamon= vec3(0.620,0.420,0.290);
        vec3 col = latte;
        float w = snoise(vec3(p*1.4, t))*0.08;
        col = mix(col, sand,    0.85*pool(p+w, vec2(-0.55+sin(t*2.)*0.08, 0.28-s*0.35), 0.55));
        col = mix(col, caramel, 0.70*pool(p-w, vec2( 0.62+cos(t*1.7)*0.1,-0.18+s*0.25), 0.42));
        col = mix(col, cinnamon,0.45*pool(p+w, vec2( 0.10+sin(t*1.3)*0.15,-0.46+s*0.2), 0.30));
        col = mix(col, sand,    0.55*pool(p, vec2(0.85, 0.45), 0.40));
        float grain = fract(sin(dot(vUv*vec2(1280.,720.)+uTime, vec2(12.9898,78.233)))*43758.5453);
        col += (grain-0.5)*0.018;
        gl_FragColor = vec4(col,1.0);
      }`,
    depthWrite: false,
  });

/* Glass material. When `liquid` is true, the vertex shader turns the sphere into a slow, wobbling liquid. */
function glassMaterial({ liquid = false, tint = '#b8845a', mobile = false } = {}) {
  const mat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#fffaf3'),
    metalness: 0,
    roughness: 0.06,
    transmission: 1,
    thickness: liquid ? 1.6 : 0.8,
    ior: 1.32,
    attenuationColor: new THREE.Color(tint),
    attenuationDistance: liquid ? 2.4 : 1.8,
    clearcoat: 1,
    clearcoatRoughness: 0.04,
    iridescence: mobile ? 0 : 0.35,
    iridescenceIOR: 1.25,
    specularIntensity: 1,
    envMapIntensity: 1.15,
  });
  if (!liquid) return { mat, uniforms: null };

  const uniforms = {
    uTime: { value: 0 },
    uAmp: { value: 0.16 },
    uFreq: { value: 0.62 },
    uMouseDir: { value: new THREE.Vector3(0, 0, 1) },
    uMouseAmt: { value: 0 },
  };
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
        uniform float uTime; uniform float uAmp; uniform float uFreq; uniform vec3 uMouseDir; uniform float uMouseAmt;
        ${NOISE}
        vec3 liquidDisp(vec3 p){
          vec3 n = normalize(p);
          float d = snoise(p*uFreq + vec3(uTime*0.22, uTime*0.17, -uTime*0.2));
          d += 0.22*snoise(p*uFreq*1.9 - vec3(uTime*0.3));
          float pull = pow(max(dot(n, uMouseDir), 0.0), 3.0) * uMouseAmt;
          return p + n*(d*uAmp + pull);
        }`
      )
      .replace(
        '#include <beginnormal_vertex>',
        `vec3 nrm0 = normalize(normal);
        vec3 tng = normalize(cross(nrm0, abs(nrm0.y) < 0.99 ? vec3(0.0,1.0,0.0) : vec3(1.0,0.0,0.0)));
        vec3 btg = normalize(cross(nrm0, tng));
        float eps = 0.012;
        vec3 dp0 = liquidDisp(position);
        vec3 dp1 = liquidDisp(position + tng*eps);
        vec3 dp2 = liquidDisp(position + btg*eps);
        vec3 objectNormal = normalize(cross(dp1 - dp0, dp2 - dp0));
        if (dot(objectNormal, nrm0) < 0.0) objectNormal = -objectNormal;
        #ifdef USE_TANGENT
          vec3 objectTangent = vec3( tangent.xyz );
        #endif`
      )
      .replace('#include <begin_vertex>', 'vec3 transformed = dp0;');
  };
  return { mat, uniforms };
}

/* Where the blob sits at each point of the page (0 = top, 1 = bottom). */
const DESKTOP_PATH = [
  { p: 0.0, x: 1.95, y: 0.0, s: 0.9, amp: 0.17 },
  { p: 0.16, x: -2.7, y: 0.25, s: 0.72, amp: 0.22 },
  { p: 0.34, x: 2.85, y: -0.2, s: 0.62, amp: 0.15 },
  { p: 0.52, x: -2.9, y: 0.0, s: 0.66, amp: 0.24 },
  { p: 0.74, x: 2.9, y: 0.15, s: 0.68, amp: 0.18 },
  { p: 1.0, x: -2.6, y: -0.25, s: 0.8, amp: 0.22 },
];
DESKTOP_PATH.arc = 3.6; // big enough that the blob leaves the screen while it switches sides
// Phones: the blob stays tucked into the top corner so it never sits on top of text.
const MOBILE_PATH = [
  { p: 0.0, x: 0.5, y: 1.78, s: 0.4, amp: 0.15 },
  { p: 0.3, x: 0.62, y: 1.95, s: 0.34, amp: 0.2 },
  { p: 0.6, x: 0.55, y: 1.85, s: 0.37, amp: 0.15 },
  { p: 1.0, x: 0.6, y: 1.95, s: 0.35, amp: 0.2 },
];

function samplePath(path, p) {
  if (p <= path[0].p) return path[0];
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1], b = path[i];
    if (p <= b.p) {
      let t = (p - a.p) / (b.p - a.p);
      t = t * t * (3 - 2 * t);
      // swoop above/below the content while crossing sides, instead of cutting through the text
      const bump = Math.sin(Math.PI * t);
      const arc = (path.arc || 0) * (i % 2 ? 1 : -1) * bump;
      return {
        x: a.x + (b.x - a.x) * t,
        y: a.y + (b.y - a.y) * t + arc,
        s: (a.s + (b.s - a.s) * t) * (1 - 0.35 * bump * (path.arc ? 1 : 0)),
        amp: a.amp + (b.amp - a.amp) * t + 0.08 * bump,
      };
    }
  }
  return path[path.length - 1];
}

export default function Scene3D() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    if (new URLSearchParams(window.location.search).has('no3d')) {
      mount.classList.add('scene3d--fallback');
      return;
    }

    const mobile = window.matchMedia('(max-width: 768px), (hover: none)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: !mobile, powerPreference: 'high-performance' });
    } catch {
      mount.classList.add('scene3d--fallback');
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1.25 : 1.6));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 60);
    camera.position.set(0, 0, 8);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;

    scene.add(new THREE.HemisphereLight('#fff4e6', '#8a5a3b', 0.9));
    const key = new THREE.DirectionalLight('#fff1dc', 2.2);
    key.position.set(3, 4, 5);
    scene.add(key);
    const rim = new THREE.DirectionalLight('#e9b98a', 1.4);
    rim.position.set(-4, -2, -3);
    scene.add(rim);

    // Backdrop plane (what the glass refracts)
    const bgMat = backdropMaterial();
    const bg = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), bgMat);
    bg.position.z = -6;
    scene.add(bg);
    const fitBackdrop = () => {
      const dist = camera.position.z - bg.position.z;
      const h = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * dist * 1.08;
      bg.scale.set(h * camera.aspect, h, 1);
      bgMat.uniforms.uAspect.value = camera.aspect;
    };
    fitBackdrop();

    // Liquid blob
    const world = new THREE.Group();
    scene.add(world);
    const blobGroup = new THREE.Group();
    world.add(blobGroup);
    const { mat: blobMat, uniforms: blobU } = glassMaterial({ liquid: true, mobile });
    const blob = new THREE.Mesh(new THREE.IcosahedronGeometry(1.25, mobile ? 28 : 72), blobMat);
    blobGroup.add(blob);

    // Glass ring around the blob
    const ringMat = glassMaterial({ tint: '#c99a6e', mobile }).mat;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.8, 0.04, 24, mobile ? 90 : 180), ringMat);
    ring.rotation.set(1.15, 0.35, 0);
    blobGroup.add(ring);

    // Orbiting pebbles
    const pebbleDefs = [
      { geo: new THREE.SphereGeometry(0.22, 48, 48), r: 2.35, speed: 0.32, phase: 0.0, tilt: 0.5, y: 0.2 },
      { geo: new THREE.CapsuleGeometry(0.1, 0.34, 12, 24), r: 2.6, speed: -0.24, phase: 2.1, tilt: -0.35, y: -0.3 },
      { geo: new THREE.TorusGeometry(0.16, 0.06, 20, 48), r: 2.2, speed: 0.4, phase: 4.0, tilt: 0.2, y: 0.55 },
      { geo: new THREE.SphereGeometry(0.12, 32, 32), r: 2.9, speed: 0.2, phase: 5.2, tilt: -0.6, y: -0.6 },
      { geo: new THREE.IcosahedronGeometry(0.16, 0), r: 2.45, speed: -0.3, phase: 1.1, tilt: 0.8, y: 0.0 },
    ].slice(0, mobile ? 3 : 5);
    const pebbleMat = glassMaterial({ tint: '#a8744f', mobile }).mat;
    const pebbles = pebbleDefs.map((d) => {
      const m = new THREE.Mesh(d.geo, pebbleMat);
      blobGroup.add(m);
      return { mesh: m, ...d };
    });

    // Input
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    const onMove = (e) => {
      mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.ty = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('pointermove', onMove, { passive: true });

    const scrollState = { p: 0, target: 0 };
    const readScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      scrollState.target = max > 0 ? window.scrollY / max : 0;
    };
    readScroll();
    window.addEventListener('scroll', readScroll, { passive: true });

    const cur = { x: 0, y: 0, s: 1, amp: 0.24 };
    const pathFor = () => (camera.aspect < 0.9 ? MOBILE_PATH : DESKTOP_PATH);
    const aspectFactor = () => THREE.MathUtils.clamp(camera.aspect / 1.6, 0.6, 1.25);
    const init = samplePath(pathFor(), scrollState.target);
    Object.assign(cur, init);

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      fitBackdrop();
    };
    window.addEventListener('resize', onResize);

    // Loop
    const timer = new THREE.Timer();
    timer.connect(document);
    let raf = 0;
    let running = true;
    const intro = { v: reduced ? 1 : 0 };

    const frame = () => {
      timer.update();
      const dt = Math.min(timer.getDelta(), 0.05);
      const t = timer.getElapsed();
      const k = 1 - Math.pow(0.001, dt); // frame-rate independent easing

      scrollState.p += (scrollState.target - scrollState.p) * k * 1.4;
      mouse.x += (mouse.tx - mouse.x) * k;
      mouse.y += (mouse.ty - mouse.y) * k;
      intro.v += (1 - intro.v) * k * 0.9;

      const path = pathFor();
      const goal = samplePath(path, scrollState.p);
      const af = path === DESKTOP_PATH ? aspectFactor() : 1;
      cur.x += (goal.x * af - cur.x) * k;
      cur.y += (goal.y - cur.y) * k;
      cur.s += (goal.s * (path === DESKTOP_PATH ? Math.min(af, 1) : 1) - cur.s) * k;
      cur.amp += (goal.amp - cur.amp) * k;

      const introEase = 1 - Math.pow(1 - intro.v, 3);
      blobGroup.position.set(cur.x, cur.y + (1 - introEase) * -1.2, 0);
      blobGroup.scale.setScalar(cur.s * (0.6 + 0.4 * introEase));

      blob.rotation.y = t * 0.12 + scrollState.p * Math.PI * 2;
      blob.rotation.x = Math.sin(t * 0.2) * 0.25 + mouse.y * 0.3;
      ring.rotation.z = t * 0.15 + scrollState.p * 3.0;
      ring.rotation.x = 1.15 + mouse.y * 0.25;
      ring.rotation.y = 0.35 + mouse.x * 0.25;

      pebbles.forEach((pb) => {
        const a = pb.phase + t * pb.speed + scrollState.p * 4.0;
        pb.mesh.position.set(Math.cos(a) * pb.r, pb.y + Math.sin(a * 1.3) * 0.25 + Math.sin(a) * pb.tilt, Math.sin(a) * pb.r * 0.6);
        pb.mesh.rotation.set(t * 0.4 + pb.phase, t * 0.3, 0);
      });

      world.rotation.y = mouse.x * 0.12;
      world.rotation.x = -mouse.y * 0.08;

      if (blobU) {
        blobU.uTime.value = t;
        blobU.uAmp.value = cur.amp;
        // make the blob bulge toward the cursor
        const dir = new THREE.Vector3(mouse.x - cur.x / 4, mouse.y - cur.y / 3, 0.8).normalize();
        blobU.uMouseDir.value.lerp(dir, k);
        blobU.uMouseAmt.value += ((mobile ? 0 : 0.18) - blobU.uMouseAmt.value) * k;
      }
      bgMat.uniforms.uTime.value = t;
      bgMat.uniforms.uScroll.value = scrollState.p;

      renderer.render(scene, camera);
    };

    const loop = () => {
      if (!running) return;
      frame();
      raf = requestAnimationFrame(loop);
    };

    if (reduced) {
      frame();
      const still = () => { readScroll(); scrollState.p = scrollState.target; frame(); };
      window.addEventListener('scroll', still, { passive: true });
      window.addEventListener('resize', still);
    } else {
      loop();
    }

    const onVisibility = () => {
      if (reduced) return;
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!running) {
        running = true;
        loop();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('scroll', readScroll);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
      scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) o.material.dispose();
      });
      envTex.dispose();
      pmrem.dispose();
      timer.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={mountRef} className="scene3d" aria-hidden="true" />;
}
