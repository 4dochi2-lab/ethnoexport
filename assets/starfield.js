// EthnoExport — starfield background (Three.js) for panel & admin
// Mint/jade/bone stars streaming past as an endless tunnel, bloom glow,
// scroll dives the camera, cursor gently repels nearby stars.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

const canvas = document.getElementById('scene');
if (canvas && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  try {
    const CONFIG = { colorA:'#aef6cf', colorB:'#5fe6a0', colorC:'#eafff2',
      drift:2.35, spin:0.03, scrollPush:8, scrollDrift:6, scrollSpin:0.1,
      repelRadius:5, repelStrength:0.35, parallax:0.6 };
    const hexToVec3 = h => { const n=parseInt(h.slice(1),16);
      return new THREE.Vector3(((n>>16)&255)/255,((n>>8)&255)/255,(n&255)/255); };

    const renderer = new THREE.WebGL1Renderer({ canvas, antialias:true, alpha:true });
    renderer.setPixelRatio(Math.min(devicePixelRatio,2));
    renderer.setClearColor(0x000000,0);
    renderer.setSize(innerWidth, innerHeight);

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x000000, 0, 15);
    const camera = new THREE.PerspectiveCamera(45, innerWidth/innerHeight, 0.1, 80);
    camera.position.set(0,0,5); scene.add(camera);

    const count=4200, depth=30;
    const geo=new THREE.BufferGeometry();
    const positions=new Float32Array(count*3), scales=new Float32Array(count),
          phases=new Float32Array(count), palette=new Float32Array(count), bright=new Float32Array(count);
    for(let i=0;i<count;i++){const i3=i*3;
      positions[i3]=(Math.random()-.5)*24; positions[i3+1]=(Math.random()-.5)*16; positions[i3+2]=(Math.random()-.5)*30;
      palette[i]=Math.floor(Math.random()*3); bright[i]=.7+Math.random()*.6;
      scales[i]=.5+Math.pow(Math.random(),1.4)*2.5; phases[i]=Math.random();}
    geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
    geo.setAttribute('aScale',new THREE.Float32BufferAttribute(scales,1));
    geo.setAttribute('aPhase',new THREE.Float32BufferAttribute(phases,1));
    geo.setAttribute('aPalette',new THREE.Float32BufferAttribute(palette,1));
    geo.setAttribute('aBright',new THREE.Float32BufferAttribute(bright,1));

    const uniforms={ uTime:{value:0}, uSize:{value:50}, uOpacity:{value:0}, uDrift:{value:0},
      uDepth:{value:30}, uTwinkle:{value:1}, uCursor:{value:new THREE.Vector3()},
      uRepelRadius:{value:5}, uRepelStrength:{value:.35}, uActivity:{value:0},
      uColorA:{value:hexToVec3(CONFIG.colorA)}, uColorB:{value:hexToVec3(CONFIG.colorB)},
      uColorC:{value:hexToVec3(CONFIG.colorC)}, uBrightness:{value:1.85} };

    const mat=new THREE.ShaderMaterial({ transparent:true, depthWrite:false, blending:THREE.AdditiveBlending, uniforms,
      vertexShader:`
        uniform float uTime; uniform float uSize; uniform float uDrift; uniform float uDepth; uniform float uTwinkle;
        uniform vec3 uCursor; uniform float uRepelRadius; uniform float uRepelStrength; uniform float uActivity;
        uniform vec3 uColorA; uniform vec3 uColorB; uniform vec3 uColorC;
        attribute float aScale; attribute float aPhase; attribute float aPalette; attribute float aBright;
        varying vec3 vColor; varying float vTwinkle;
        void main(){
          vec3 pos=position;
          pos.z=mod(pos.z+uDrift+(uDepth*0.5),uDepth)-(uDepth*0.5);
          float tw=sin(uTime*1.6+aPhase*6.2831);
          vTwinkle=(1.0-uTwinkle)+uTwinkle*(0.55+0.45*tw);
          vec4 modelPosition=modelMatrix*vec4(pos,1.0);
          vec3 toParticle=modelPosition.xyz-uCursor;
          float dist=length(toParticle);
          float falloff=smoothstep(uRepelRadius,0.0,dist);
          modelPosition.xyz+=normalize(toParticle+vec3(0.0001))*falloff*uRepelStrength*uActivity;
          vec4 viewPosition=viewMatrix*modelPosition;
          gl_Position=projectionMatrix*viewPosition;
          gl_PointSize=uSize*aScale;
          gl_PointSize*=(1.0/-viewPosition.z);
          vec3 base=aPalette<0.5?uColorA:(aPalette<1.5?uColorB:uColorC);
          vColor=base*aBright;
        }`,
      fragmentShader:`
        uniform float uOpacity; uniform float uBrightness;
        varying vec3 vColor; varying float vTwinkle;
        void main(){
          vec2 uv=gl_PointCoord-0.5; float d=length(uv);
          if(d>0.5) discard;
          float strength=pow(1.0-d*2.0,4.0);
          vec3 color=mix(vec3(0.0),vColor,strength);
          gl_FragColor=vec4(color*uBrightness,strength*uOpacity*vTwinkle);
        }` });

    const points=new THREE.Points(geo,mat);
    const group=new THREE.Group(); group.add(points); scene.add(group);

    const composer=new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene,camera));
    const bloom=new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),0.6,0.5,0);
    composer.addPass(bloom);

    // interaction
    let scrollTarget=0,scrollSmooth=0,scrollCurrent=0;
    const mouse={x:0,y:0},mouseSmooth={x:0,y:0};
    let active=false,lastMove=performance.now();
    const POINTER={world:new THREE.Vector3(),activity:0};
    addEventListener('scroll',()=>{const max=Math.max(1,document.documentElement.scrollHeight-innerHeight);scrollTarget=Math.min(1,Math.max(0,scrollY/max));},{passive:true});
    addEventListener('mousemove',e=>{mouse.x=e.clientX/innerWidth*2-1;mouse.y=-(e.clientY/innerHeight*2-1);active=true;lastMove=performance.now();});
    addEventListener('mouseout',()=>{active=false;});
    const plane=new THREE.Plane(new THREE.Vector3(0,0,1),0),ray=new THREE.Raycaster(),ndc=new THREE.Vector2();
    function updatePointer(){
      const target=new THREE.Vector3();
      if(active){ndc.set(mouse.x,mouse.y);ray.setFromCamera(ndc,camera);const hit=ray.ray.intersectPlane(plane,target);if(!hit)target.set(0,0,0);}
      POINTER.world.lerp(target,0.12);
      const idle=(performance.now()-lastMove)/1000;
      const want=(active&&idle<3)?1:0;
      POINTER.activity+=(want-POINTER.activity)*0.06;
      uniforms.uCursor.value.copy(POINTER.world);
      uniforms.uActivity.value=POINTER.activity;
    }

    const appearStart=performance.now();let t0=performance.now()/1000;
    function loop(){
      requestAnimationFrame(loop);
      scrollSmooth+=(scrollTarget-scrollSmooth)*0.10;
      scrollCurrent+=(scrollSmooth-scrollCurrent)*0.06;
      mouseSmooth.x+=(mouse.x-mouseSmooth.x)*0.06;
      mouseSmooth.y+=(mouse.y-mouseSmooth.y)*0.06;
      updatePointer();
      const t=performance.now()/1000; const dt=Math.min(0.05,t-t0); t0=t;
      const scroll=scrollCurrent;
      uniforms.uTime.value=t;
      uniforms.uDrift.value+=dt*(CONFIG.drift+scroll*CONFIG.scrollDrift);
      camera.position.set(mouseSmooth.x*0.6,mouseSmooth.y*0.6,5-scroll*CONFIG.scrollPush);
      camera.lookAt(mouseSmooth.x*0.6,mouseSmooth.y*0.6,-10);
      const elapsed=performance.now()-appearStart;
      const fade=Math.min(1,Math.max(0,(elapsed-300)/1400));
      uniforms.uOpacity.value=fade*2;
      group.rotation.z+=dt*(CONFIG.spin+scroll*CONFIG.scrollSpin);
      composer.render();
    }
    loop();

    addEventListener('resize',()=>{
      renderer.setPixelRatio(Math.min(devicePixelRatio,2));
      renderer.setSize(innerWidth,innerHeight);
      camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();
      composer.setPixelRatio(Math.min(devicePixelRatio,2));
      composer.setSize(innerWidth,innerHeight);
    });
  } catch(e){ /* WebGL yoxdursa fon sadəcə göstərilmir */ }
}
