import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { getTheme } from './themes';

/*
  The loader's "N" as a 3D glass object: it spins in, a light sweeps across it,
  then the loader panels cover it and reveal the page (timing lives in App.jsx).
  Same outline as the SVG N it replaces.
*/
const N_OUTLINE = [[17, 83], [17, 17], [29, 17], [71, 62], [71, 17], [83, 17], [83, 83], [71, 83], [29, 38], [29, 83]];

export default function LoaderN() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const theme = getTheme();
    const sc = theme.scene;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const size = window.innerWidth < 600 ? 200 : 260;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      return; // the SVG fallback stays
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(size, size);
    renderer.toneMapping = THREE.NeutralToneMapping;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.className = 'lp-n-canvas';
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 30);
    camera.position.z = 6;
    const pmrem = new THREE.PMREMGenerator(renderer);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    scene.add(new THREE.HemisphereLight(sc.sky, sc.ground, 0.9));
    const key = new THREE.DirectionalLight('#ffffff', 2);
    key.position.set(3, 4, 5);
    scene.add(key);

    // backdrop the glass refracts; its edge matches the page colour so the square never shows
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const g = c.getContext('2d');
    g.fillStyle = theme.css.bg;
    g.fillRect(0, 0, 256, 256);
    [[170, 80, 120, sc.c1], [80, 180, 120, sc.c3], [128, 128, 90, sc.c2]].forEach(([x, y, r, col]) => {
      const gr = g.createRadialGradient(x, y, 0, x, y, r);
      gr.addColorStop(0, col);
      gr.addColorStop(1, theme.css.bg + '00');
      g.fillStyle = gr;
      g.fillRect(0, 0, 256, 256);
    });
    const edge = g.createRadialGradient(128, 128, 70, 128, 128, 128);
    edge.addColorStop(0, theme.css.bg + '00');
    edge.addColorStop(1, theme.css.bg);
    g.fillStyle = edge;
    g.fillRect(0, 0, 256, 256);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    // sized to exactly fill the view at its depth, so the faded edge meets the canvas edge
    const viewH = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * (camera.position.z + 3);
    const back = new THREE.Mesh(new THREE.PlaneGeometry(viewH, viewH), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }));
    back.position.z = -3;
    scene.add(back);

    const shape = new THREE.Shape();
    N_OUTLINE.forEach(([x, y], i) => {
      const X = (x - 50) * 0.042, Y = (50 - y) * 0.042;
      if (i) shape.lineTo(X, Y); else shape.moveTo(X, Y);
    });
    shape.closePath();
    const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.5, bevelEnabled: true, bevelThickness: 0.09, bevelSize: 0.07, bevelSegments: 5, curveSegments: 4 });
    geo.center();
    const mat = new THREE.MeshPhysicalMaterial({
      color: sc.glass, roughness: 0.05, transmission: 1, thickness: 0.9, ior: 1.33,
      attenuationColor: new THREE.Color(sc.c3), attenuationDistance: 1.3,
      clearcoat: 1, clearcoatRoughness: 0.04, iridescence: 0.4, iridescenceIOR: 1.25, envMapIntensity: 1.2,
    });
    const N = new THREE.Mesh(geo, mat);
    scene.add(N);
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(2.05, 0.05, 16, 180),
      new THREE.MeshPhysicalMaterial({ color: sc.glass, roughness: 0.05, transmission: 1, thickness: 0.4, ior: 1.3, attenuationColor: new THREE.Color(sc.rim), attenuationDistance: 1.5, clearcoat: 1 })
    );
    scene.add(ring);
    const glint = new THREE.PointLight('#ffffff', 0, 6);
    glint.position.set(-3, 1, 2);
    scene.add(glint);

    const ease = (x) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);
    const start = performance.now();
    let raf = 0;
    const frame = () => {
      const t = (performance.now() - start) / 1000;
      const inT = reduced ? 1 : ease(t / 1.1);
      N.rotation.y = (1 - inT) * Math.PI * 2 + Math.sin(t * 1.1) * 0.2;
      N.rotation.x = Math.sin(t * 0.7) * 0.08;
      N.scale.setScalar(0.35 + 0.65 * inT);
      ring.scale.setScalar(0.2 + 0.8 * ease((t - 0.25) / 0.9));
      ring.rotation.set(0.55, 0.3, t * 0.6);
      const k = Math.min(1, Math.max(0, (t - 0.9) / 0.8));
      glint.intensity = Math.sin(k * Math.PI) * 35;
      glint.position.x = -3 + k * 6;
      renderer.render(scene, camera);
      if (!reduced && t < 6) raf = requestAnimationFrame(frame);
    };
    frame();

    return () => {
      cancelAnimationFrame(raf);
      scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) o.material.dispose();
      });
      tex.dispose();
      env.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={mountRef} className="lp-n-3d" aria-hidden="true" />;
}
