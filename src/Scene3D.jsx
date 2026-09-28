import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { getTheme } from './themes';

/*
  Liquid Glass 3D scene
  Every section of the page has its own glass object, each with its own motion:
    Home      liquid blob that wobbles like water, with a ring and orbiting pebbles
    About     glass knot that slowly ties and turns
    Skills    an atom: a glass core with electrons racing around three orbits
    Services  three glass blocks that assemble into a stack as you scroll
    Projects  glass "screens" that fan open like a deck of cards
    Contact   the liquid blob returns, calmer
  The object travels between sections and swaps shape while it is off-screen.
  Phones get lighter geometry; reduced-motion users get a still frame.
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

/* Soft backdrop the glass refracts: theme base colour with slowly drifting colour pools */
const backdropMaterial = (sc) =>
  new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 }, uScroll: { value: 0 }, uAspect: { value: 1 },
      uBase: { value: new THREE.Color(sc.base) }, uC1: { value: new THREE.Color(sc.c1) },
      uC2: { value: new THREE.Color(sc.c2) }, uC3: { value: new THREE.Color(sc.c3) },
    },
    vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);} `,
    fragmentShader: /* glsl */ `
      precision highp float;
      varying vec2 vUv; uniform float uTime; uniform float uScroll; uniform float uAspect;
      uniform vec3 uBase; uniform vec3 uC1; uniform vec3 uC2; uniform vec3 uC3;
      float pool(vec2 p, vec2 c, float r){ return smoothstep(r, 0.0, length(p-c)); }
      void main(){
        vec2 p = vUv - 0.5; p.x *= uAspect;
        float t = uTime*0.05; float s = uScroll;
        vec3 col = uBase;
        float w = (sin(p.x*2.3 + t*3.0) + sin(p.y*1.9 - t*2.4)) * 0.035;
        col = mix(col, uC1, 0.85*pool(p+w, vec2(-0.55+sin(t*2.)*0.08, 0.28-s*0.35), 0.55));
        col = mix(col, uC2, 0.70*pool(p-w, vec2( 0.62+cos(t*1.7)*0.1,-0.18+s*0.25), 0.42));
        col = mix(col, uC3, 0.40*pool(p+w, vec2( 0.10+sin(t*1.3)*0.15,-0.46+s*0.2), 0.30));
        col = mix(col, uC1, 0.55*pool(p, vec2(0.85, 0.45), 0.40));
        float grain = fract(sin(dot(vUv*vec2(1280.,720.)+uTime, vec2(12.9898,78.233)))*43758.5453);
        col += (grain-0.5)*0.018;
        gl_FragColor = vec4(col,1.0);
      }`,
    depthWrite: false,
  });

function glassMaterial({ sc, tint, liquid = false, mobile = false, thickness = 0.8, shell = false }) {
  if (shell) {
    // looks like glass (reflections + tint) but skips the expensive refraction pass
    return {
      mat: new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(tint), metalness: 0, roughness: 0.08, transparent: true, opacity: 0.38,
        clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 1.6, depthWrite: false,
      }),
      uniforms: null,
    };
  }
  const mat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(sc.glass),
    metalness: 0,
    roughness: 0.06,
    transmission: 1,
    thickness: liquid ? 1.6 : thickness,
    ior: 1.32,
    attenuationColor: new THREE.Color(tint),
    attenuationDistance: liquid ? 2.4 : 1.8,
    clearcoat: 1,
    clearcoatRoughness: 0.04,
    iridescence: liquid && !mobile ? 0.3 : 0,
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

/* ---------------------------------------------------------------
   Shapes. Each returns { group, update(time, localProgress, mouse) }
   --------------------------------------------------------------- */

function makeLiquid({ sc, mobile, withPebbles }) {
  const group = new THREE.Group();
  const { mat, uniforms } = glassMaterial({ sc, tint: sc.tintA, liquid: true, mobile });
  const blob = new THREE.Mesh(new THREE.IcosahedronGeometry(1.25, mobile ? 22 : 44), mat);
  group.add(blob);
  const ringMat = glassMaterial({ sc, tint: sc.tintB, mobile, shell: true }).mat;
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.8, 0.04, 16, mobile ? 80 : 140), ringMat);
  ring.rotation.set(1.15, 0.35, 0);
  group.add(ring);

  const pebbles = [];
  if (withPebbles) {
    const pm = glassMaterial({ sc, tint: sc.tintA, mobile, shell: true }).mat;
    [
      { geo: new THREE.SphereGeometry(0.22, 48, 48), r: 2.35, speed: 0.32, phase: 0.0, tilt: 0.5, y: 0.2 },
      { geo: new THREE.CapsuleGeometry(0.1, 0.34, 12, 24), r: 2.6, speed: -0.24, phase: 2.1, tilt: -0.35, y: -0.3 },
      { geo: new THREE.TorusGeometry(0.16, 0.06, 20, 48), r: 2.2, speed: 0.4, phase: 4.0, tilt: 0.2, y: 0.55 },
      { geo: new THREE.SphereGeometry(0.12, 32, 32), r: 2.9, speed: 0.2, phase: 5.2, tilt: -0.6, y: -0.6 },
      { geo: new THREE.IcosahedronGeometry(0.16, 0), r: 2.45, speed: -0.3, phase: 1.1, tilt: 0.8, y: 0.0 },
    ].slice(0, mobile ? 2 : 4).forEach((d) => {
      const m = new THREE.Mesh(d.geo, pm);
      group.add(m);
      pebbles.push({ mesh: m, ...d });
    });
  }

  return {
    group,
    uniforms,
    kick: 0,
    update(t, lt, mouse, calm) {
      blob.rotation.y = t * 0.12 + lt * 1.5;
      blob.rotation.x = Math.sin(t * 0.2) * 0.25 + mouse.y * 0.3;
      ring.rotation.z = t * 0.15 + lt * 2.0;
      ring.rotation.x = 1.15 + mouse.y * 0.25;
      ring.rotation.y = 0.35 + mouse.x * 0.25;
      pebbles.forEach((pb) => {
        const a = pb.phase + t * pb.speed + lt * 3.0;
        pb.mesh.position.set(Math.cos(a) * pb.r, pb.y + Math.sin(a * 1.3) * 0.25 + Math.sin(a) * pb.tilt, Math.sin(a) * pb.r * 0.6);
        pb.mesh.rotation.set(t * 0.4 + pb.phase, t * 0.3, 0);
      });
      uniforms.uTime.value = t;
      uniforms.uAmp.value = (calm ? 0.12 : 0.17) + (this.kick || 0);
    },
  };
}

function makeKnot({ sc, mobile }) {
  const group = new THREE.Group();
  const mat = glassMaterial({ sc, tint: sc.tintA, mobile, thickness: 1.1 }).mat;
  const knot = new THREE.Mesh(new THREE.TorusKnotGeometry(0.85, 0.27, mobile ? 120 : 200, mobile ? 16 : 28, 2, 3), mat);
  group.add(knot);
  return {
    group,
    update(t, lt, mouse) {
      knot.rotation.set(0.4 + t * 0.18 + mouse.y * 0.3, t * 0.25 + lt * Math.PI * 1.5 + mouse.x * 0.3, t * 0.08);
      const breathe = 1 + Math.sin(t * 1.1) * 0.035;
      knot.scale.setScalar(breathe);
    },
  };
}

function makeAtom({ sc, mobile }) {
  const group = new THREE.Group();
  const coreMat = glassMaterial({ sc, tint: sc.tintA, mobile, thickness: 1.2 }).mat;
  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.55, mobile ? 6 : 12), coreMat);
  group.add(core);
  const ringMat = glassMaterial({ sc, tint: sc.tintB, mobile, shell: true }).mat;
  const eMat = glassMaterial({ sc, tint: sc.tintA, mobile, shell: true }).mat;
  const orbits = [0, 1, 2].map((i) => {
    const pivot = new THREE.Group();
    pivot.rotation.set(Math.PI / 2 + (i - 1) * 0.9, i * 1.05, 0);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.35, 0.02, 12, mobile ? 80 : 160), ringMat);
    const e = new THREE.Mesh(new THREE.SphereGeometry(0.14, 32, 32), eMat);
    pivot.add(ring);
    pivot.add(e);
    group.add(pivot);
    return { pivot, e, speed: 0.9 + i * 0.35, phase: i * 2.1 };
  });
  return {
    group,
    update(t, lt, mouse) {
      group.rotation.y = t * 0.15 + lt * 2 + mouse.x * 0.3;
      group.rotation.x = mouse.y * 0.3;
      core.rotation.set(t * 0.3, t * 0.2, 0);
      orbits.forEach((o) => {
        const a = o.phase + t * o.speed;
        o.e.position.set(Math.cos(a) * 1.35, Math.sin(a) * 1.35, 0);
      });
    },
  };
}

function makeBlocks({ sc, mobile }) {
  const group = new THREE.Group();
  const mats = [sc.tintA, sc.tintB, sc.tintA].map((c) => glassMaterial({ sc, tint: c, mobile, thickness: 1 }).mat);
  const blocks = [0, 1, 2].map((i) => {
    const m = new THREE.Mesh(new RoundedBoxGeometry(0.95, 0.95, 0.95, mobile ? 3 : 4, 0.18), mats[i]);
    group.add(m);
    return {
      mesh: m,
      scatter: new THREE.Vector3((i - 1) * 1.6, (i - 1) * -0.9 + 0.3, (i % 2 ? -0.6 : 0.5)),
      stack: new THREE.Vector3((i - 1) * 0.12, (i - 1) * 1.02, 0),
      spin: i % 2 ? -1 : 1,
    };
  });
  const tmp = new THREE.Vector3();
  return {
    group,
    update(t, lt, mouse) {
      // scattered when the section arrives, stacked by the middle of it
      const k = THREE.MathUtils.smoothstep(lt, 0.05, 0.55);
      blocks.forEach((b, i) => {
        tmp.lerpVectors(b.scatter, b.stack, k);
        tmp.y += Math.sin(t * 1.2 + i) * 0.06 * (1 - k * 0.6);
        b.mesh.position.copy(tmp);
        b.mesh.rotation.set(
          (1 - k) * (t * 0.5 + i) + k * 0.12,
          b.spin * t * (0.35 + (1 - k) * 0.4) + i * 0.6,
          (1 - k) * t * 0.3
        );
      });
      group.rotation.y = mouse.x * 0.35;
      group.rotation.x = mouse.y * 0.2;
    },
  };
}

function makeScreens({ sc, mobile }) {
  const group = new THREE.Group();
  const mat = glassMaterial({ sc, tint: sc.tintB, mobile, thickness: 0.4 }).mat;
  const geo = new RoundedBoxGeometry(1.7, 1.1, 0.07, mobile ? 2 : 4, 0.09);
  const cards = [0, 1, 2, 3].map(() => {
    const m = new THREE.Mesh(geo, mat);
    group.add(m);
    return m;
  });
  return {
    group,
    update(t, lt, mouse) {
      // cards fan open, then keep slowly cycling like a deck being shuffled
      const open = THREE.MathUtils.smoothstep(lt, 0.0, 0.35);
      cards.forEach((c, i) => {
        const f = i - 1.5;
        const cyc = (t * 0.25 + i / 4) % 1;
        c.position.set(f * 0.42 * open, Math.sin(cyc * Math.PI * 2) * 0.12, f * -0.28);
        c.rotation.set(-0.18 + mouse.y * 0.2, f * 0.32 * open + mouse.x * 0.3 + Math.sin(t * 0.4) * 0.08, f * -0.06 * open);
      });
    },
  };
}

/* ---------------------------------------------------------------
   Where the object sits in each section (world units, camera at z=8)
   --------------------------------------------------------------- */
const SECTION_IDS = ['home', 'about', 'skills', 'work', 'portfolio', 'contact'];
const SHAPE_FOR_SECTION = [0, 1, 2, 3, 4, 0]; // contact reuses the liquid blob
const DESKTOP_SPOTS = [
  { x: 1.95, y: 0.0, s: 0.9 },   // home: right of the headline
  { x: 2.3, y: -1.7, s: 0.64 },  // about: peeking out below the glass cards
  { x: -2.75, y: -0.1, s: 0.8 }, // skills: behind the proficiency card
  { x: 2.7, y: -0.35, s: 0.8 },  // services
  { x: -2.85, y: 0.15, s: 0.72 },// projects
  { x: 2.55, y: 0.0, s: 0.82 },  // contact: behind the form
];
const MOBILE_SPOTS = [
  { x: 0.0, y: 1.48, s: 0.34 },  // home: centred above the headline
  { x: -0.72, y: -2.0, s: 0.2 }, // other sections: a small gem in the lower-left corner
  { x: -0.72, y: -2.0, s: 0.2 },
  { x: -0.72, y: -2.0, s: 0.2 },
  { x: -0.72, y: -2.0, s: 0.2 },
  { x: -0.72, y: -2.0, s: 0.2 },
];

export default function Scene3D() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    if (new URLSearchParams(window.location.search).has('no3d')) {
      mount.classList.add('scene3d--fallback');
      return;
    }

    const sc = getTheme().scene;
    const mobile = window.matchMedia('(max-width: 768px), (hover: none)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: !mobile, powerPreference: 'high-performance' });
    } catch {
      mount.classList.add('scene3d--fallback');
      return;
    }
    let dpr = Math.min(window.devicePixelRatio, mobile ? 1 : 1.25);
    renderer.setPixelRatio(dpr);
    renderer.transmissionResolutionScale = mobile ? 0.4 : 0.5;
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

    scene.add(new THREE.HemisphereLight(sc.sky, sc.ground, 0.9));
    const key = new THREE.DirectionalLight('#ffffff', 2.1);
    key.position.set(3, 4, 5);
    scene.add(key);
    const rim = new THREE.DirectionalLight(sc.rim, 1.4);
    rim.position.set(-4, -2, -3);
    scene.add(rim);

    const bgMat = backdropMaterial(sc);
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

    // Carrier that travels between sections; shapes live inside it
    const world = new THREE.Group();
    scene.add(world);
    const carrier = new THREE.Group();
    world.add(carrier);

    const shapes = [
      makeLiquid({ sc, mobile, withPebbles: true }),
      makeKnot({ sc, mobile }),
      makeAtom({ sc, mobile }),
      makeBlocks({ sc, mobile }),
      makeScreens({ sc, mobile }),
    ];
    shapes.forEach((s, i) => {
      s.vis = i === 0 ? 1 : 0;
      s.group.visible = i === 0;
      carrier.add(s.group);
    });

    // Section geometry, re-measured when the page changes size
    let sections = [];
    const measure = () => {
      sections = SECTION_IDS.map((id) => {
        const el = document.getElementById(id);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { top: r.top + window.scrollY, height: Math.max(r.height, 1) };
      }).filter(Boolean);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);

    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    const onMove = (e) => {
      mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.ty = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('pointermove', onMove, { passive: true });

    const scroll = { y: window.scrollY, target: window.scrollY };
    // jelly: fast scrolling stretches the object, a damped spring snaps it back
    const jelly = { s: 0, v: 0, target: 0, lastY: window.scrollY, lastT: performance.now() };
    const onScroll = () => {
      scroll.target = window.scrollY;
      const now = performance.now();
      const v = (window.scrollY - jelly.lastY) / Math.max(16, now - jelly.lastT);
      jelly.lastY = window.scrollY; jelly.lastT = now;
      jelly.target = THREE.MathUtils.clamp(v * 0.14, -0.4, 0.4);
    };

    // bubbles that trail the cursor (mouse only) and burst on click
    const bubbleMat = glassMaterial({ sc, tint: sc.tintB, mobile, shell: true }).mat;
    const bubbleGeo = new THREE.SphereGeometry(1, 16, 16);
    const bubbles = Array.from({ length: mobile ? 8 : 16 }, () => {
      const m = new THREE.Mesh(bubbleGeo, bubbleMat);
      m.visible = false;
      scene.add(m);
      return { m, life: 0, max: 1, vx: 0, vy: 0, size: 0.1, seed: Math.random() * 6 };
    });
    let nextBubble = 0, lastSpawn = 0;
    const tmpV = new THREE.Vector3();
    const toWorld = (cx, cy, z = 1.4) => {
      tmpV.set((cx / window.innerWidth) * 2 - 1, -((cy / window.innerHeight) * 2 - 1), 0.5).unproject(camera).sub(camera.position).normalize();
      const d = (z - camera.position.z) / tmpV.z;
      return camera.position.clone().add(tmpV.multiplyScalar(d));
    };
    const spawnBubble = (x, y, burst) => {
      const b = bubbles[nextBubble++ % bubbles.length];
      const p = toWorld(x, y, 1.2 + Math.random() * 0.8);
      b.m.position.copy(p);
      b.life = 0; b.max = 1.5 + Math.random() * 1.2;
      b.vx = burst ? (Math.random() - 0.5) * 1.6 : (Math.random() - 0.5) * 0.2;
      b.vy = burst ? 0.6 + Math.random() * 1.2 : 0.45 + Math.random() * 0.5;
      b.size = 0.04 + Math.random() * (burst ? 0.1 : 0.07);
      b.m.visible = true;
    };
    const onBubbleMove = (e) => {
      if (reduced || e.pointerType !== 'mouse') return;
      const now = performance.now();
      if (now - lastSpawn < 55 || Math.random() > 0.6) return;
      lastSpawn = now;
      spawnBubble(e.clientX, e.clientY, false);
    };
    window.addEventListener('pointermove', onBubbleMove, { passive: true });

    // tap / click: a water ripple on the page, a wobble in the liquid, a burst of bubbles
    const onTap = (e) => {
      if (e.target.closest('input, textarea, select, .project-modal, .ai-chat-window')) return;
      const rp = document.createElement('span');
      rp.className = 'tap-ripple';
      rp.style.left = `${e.clientX}px`;
      rp.style.top = `${e.clientY}px`;
      document.body.appendChild(rp);
      rp.addEventListener('animationend', () => rp.remove());
      if (reduced) return;
      shapes[0].kick = 0.28;
      jelly.v -= 1.6;
      for (let i = 0; i < (mobile ? 4 : 8); i++) spawnBubble(e.clientX, e.clientY, true);
    };
    window.addEventListener('pointerdown', onTap, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      fitBackdrop();
      measure();
    };
    window.addEventListener('resize', onResize);

    /* Which section are we in, how far through it, and where should the object be? */
    const placement = (y) => {
      const spots = camera.aspect < 0.9 ? MOBILE_SPOTS : DESKTOP_SPOTS;
      const center = y + window.innerHeight * 0.5;
      let i = 0;
      sections.forEach((s, k) => { if (s.top <= center) i = k; });
      const sec = sections[i] || { top: 0, height: 1 };
      const lt = THREE.MathUtils.clamp((center - sec.top) / sec.height, 0, 1);
      const last = i >= sections.length - 1;
      const b = last ? 0 : THREE.MathUtils.smoothstep(lt, 0.62, 1.0);
      const a = spots[i] || spots[0];
      const n = spots[i + 1] || a;
      const af = spots === DESKTOP_SPOTS ? THREE.MathUtils.clamp(camera.aspect / 1.6, 0.6, 1.25) : 1;
      const crosses = Math.sign(a.x) !== Math.sign(n.x) && a.x !== 0 && n.x !== 0;
      const bump = Math.sin(Math.PI * b);
      // when switching sides, swoop off the top/bottom of the screen instead of crossing the text
      const arc = crosses ? (i % 2 ? -1 : 1) * 3.6 * bump : 0;
      return {
        x: THREE.MathUtils.lerp(a.x, n.x, b) * af,
        y: THREE.MathUtils.lerp(a.y, n.y, b) + arc,
        s: THREE.MathUtils.lerp(a.s, n.s, b) * Math.min(af, 1) * (crosses ? 1 - 0.35 * bump : 1),
        active: SHAPE_FOR_SECTION[b < 0.5 ? i : Math.min(i + 1, SHAPE_FOR_SECTION.length - 1)],
        section: b < 0.5 ? i : i + 1,
        lt: b < 0.5 ? lt : 0,
      };
    };

    const cur = { x: 0, y: 0, s: 0.9 };
    Object.assign(cur, placement(scroll.y));

    const timer = new THREE.Timer();
    timer.connect(document);
    let raf = 0;
    let running = true;
    const intro = { v: reduced ? 1 : 0 };
    const dir = new THREE.Vector3();

    // adaptive quality: if frames stay slow, render at a lower resolution
    const perf = { sum: 0, n: 0 };
    let idleNow = false;
    const adapt = (rawDt) => {
      perf.sum += rawDt; perf.n += 1;
      if (perf.n < 60) return;
      const avg = perf.sum / perf.n;
      perf.sum = 0; perf.n = 0;
      if (avg > 0.022 && dpr > 0.7) {
        dpr = Math.max(0.7, dpr - 0.2);
        renderer.setPixelRatio(dpr);
        renderer.transmissionResolutionScale = Math.max(0.3, renderer.transmissionResolutionScale - 0.1);
      }
    };

    const frame = (instant = false) => {
      timer.update();
      const rawDt = timer.getDelta();
      // half-rate idle frames would look 'slow' to the quality check, so skip them
      if (!instant && !idleNow) adapt(rawDt);
      const dt = Math.min(rawDt, 0.05);
      const t = timer.getElapsed();
      const k = instant ? 1 : 1 - Math.pow(0.001, dt);

      scroll.y += (scroll.target - scroll.y) * Math.min(1, k * 1.6);
      mouse.x += (mouse.tx - mouse.x) * k;
      mouse.y += (mouse.ty - mouse.y) * k;
      intro.v += (1 - intro.v) * k * 0.9;

      const goal = placement(scroll.y);
      cur.x += (goal.x - cur.x) * k;
      cur.y += (goal.y - cur.y) * k;
      cur.s += (goal.s - cur.s) * k;

      const introEase = 1 - Math.pow(1 - intro.v, 3);
      carrier.position.set(cur.x, cur.y + (1 - introEase) * -1.2, 0);
      const acc = (jelly.target - jelly.s) * 60 - jelly.v * 7;
      jelly.v += acc * dt; jelly.s += jelly.v * dt;
      jelly.target *= Math.pow(0.02, dt);
      const js = reduced ? 0 : jelly.s;
      const base = cur.s * (0.6 + 0.4 * introEase);
      carrier.scale.set(base * (1 - js * 0.45), base * (1 + js), base * (1 - js * 0.45));
      shapes[0].kick *= Math.pow(0.12, dt);

      bubbles.forEach((b) => {
        if (!b.m.visible) return;
        b.life += dt;
        const q = b.life / b.max;
        if (q >= 1) { b.m.visible = false; return; }
        b.m.position.x += (b.vx + Math.sin(t * 3 + b.seed) * 0.12) * dt;
        b.m.position.y += b.vy * dt;
        b.vx *= 0.985;
        b.m.scale.setScalar(b.size * Math.min(1, q * 6) * (1 - Math.max(0, (q - 0.75) / 0.25)));
      });

      shapes.forEach((sh, i) => {
        const target = i === goal.active ? 1 : 0;
        sh.vis += (target - sh.vis) * (instant ? 1 : Math.min(1, k * 1.8));
        if (sh.vis < 0.002 && target === 0) {
          sh.vis = 0;
          sh.group.visible = false;
          return;
        }
        sh.group.visible = true;
        const e = sh.vis * sh.vis * (3 - 2 * sh.vis);
        sh.group.scale.setScalar(e);
        sh.group.rotation.z = (1 - e) * 1.2;
        sh.update(t, goal.lt, mouse, goal.section === 5);
      });

      world.rotation.y = mouse.x * 0.12;
      world.rotation.x = -mouse.y * 0.08;

      const liquid = shapes[0].uniforms;
      if (liquid) {
        dir.set(mouse.x - cur.x / 4, mouse.y - cur.y / 3, 0.8).normalize();
        liquid.uMouseDir.value.lerp(dir, k);
        liquid.uMouseAmt.value += ((mobile ? 0 : 0.18) - liquid.uMouseAmt.value) * k;
      }
      bgMat.uniforms.uTime.value = t;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bgMat.uniforms.uScroll.value = max > 0 ? scroll.y / max : 0;

      renderer.render(scene, camera);
    };

    // full frame rate while the visitor scrolls or moves the mouse; half rate when idle
    let lastInput = performance.now();
    let skip = false;
    const poke = () => { lastInput = performance.now(); };
    window.addEventListener('scroll', poke, { passive: true });
    window.addEventListener('pointermove', poke, { passive: true });
    const loop = () => {
      if (!running) return;
      raf = requestAnimationFrame(loop);
      const idle = performance.now() - lastInput > 1500;
      if (idle !== idleNow) { perf.sum = 0; perf.n = 0; }
      idleNow = idle;
      skip = idle ? !skip : false;
      if (skip) return;
      frame();
    };

    let still = null;
    if (reduced) {
      frame(true);
      still = () => { scroll.target = scroll.y = window.scrollY; frame(true); };
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
      ro.disconnect();
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('scroll', poke);
      window.removeEventListener('pointermove', poke);
      window.removeEventListener('pointermove', onBubbleMove);
      window.removeEventListener('pointerdown', onTap);
      window.removeEventListener('resize', onResize);
      if (still) {
        window.removeEventListener('scroll', still);
        window.removeEventListener('resize', still);
      }
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
