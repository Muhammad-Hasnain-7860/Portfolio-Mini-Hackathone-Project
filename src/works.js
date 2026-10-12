import "./works.css";
import gsap from "gsap";

const sourceDeck = document.querySelector(".works-projects");
const stage = document.querySelector(".works-stage");
const currentCount = document.querySelector(".works-progress-current");
const progress = document.querySelector(".works-progress-track span");
const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;
const cubeFaceCount = 4;
const cubeBaseAngles = [0, -90, -180, 90];
const rulerWidth = 80;
const rulerTickSpacing = 10;
const rulerSegment = 100;
const rulerBow = 48;

let cube;
let cubeViewport;
let faces = [];
let faceOwners = Array(cubeFaceCount).fill(-1);
let rawAngle = 0;
let displayAngle = 0;
let rotationStep = 0;
let snapTimer;
let snapTween;
let snapProxy = { angle: 0 };
let isSnapping = false;
let activePointer;
let pointerStartY = 0;
let pointerLastY = 0;
let pointerDragged = false;
let rulerLeft;
let rulerRight;
let rulerLeftContext;
let rulerRightContext;
let rulerHeight = 0;
let rulerDpr = window.devicePixelRatio || 1;
let previousRenderTimestamp = 0;
let frameId;

const wrapIndex = (index, length) => ((index % length) + length) % length;

const mod4 = (index) => wrapIndex(index, cubeFaceCount);

const updateCounter = (angle) => {
  const total = sourceDeck.children.length;
  const fraction = angle / 90;
  const wrapped = wrapIndex(fraction, total);
  const selected = wrapIndex(Math.round(fraction), total);

  currentCount.textContent = String(selected + 1).padStart(2, "0");
  gsap.set(progress, { scaleX: wrapped / total });
};

const populateFace = (faceIndex, projectIndex) => {
  if (faceOwners[faceIndex] === projectIndex) return;

  const template = sourceDeck.children[projectIndex];
  if (!(template instanceof HTMLElement)) return;

  const face = faces[faceIndex];
  const content = template.cloneNode(true);
  content.classList.add("is-layout-right");
  content.removeAttribute("inert");
  content.removeAttribute("aria-hidden");
  content.setAttribute("data-project-index", String(projectIndex));
  content.querySelector(".work-project-index").textContent =
    `PROJECT ${String(projectIndex + 1).padStart(2, "0")} / ${String(sourceDeck.children.length).padStart(2, "0")}`;

  const details = content.querySelector(".work-details");
  const title = content.querySelector(".work-project-title");
  const image = content.querySelector(".work-visual img");
  if (details && title) {
    details.querySelector(".work-category")?.after(title);
  }

  if (details && image) {
    const backdrop = image.cloneNode();
    backdrop.className = "work-details-backdrop";
    backdrop.alt = "";
    backdrop.setAttribute("aria-hidden", "true");
    backdrop.removeAttribute("fetchpriority");
    backdrop.loading = "lazy";
    details.prepend(backdrop);
  }

  content.setAttribute("aria-hidden", "true");
  content.inert = true;
  face.replaceChildren(content);
  faceOwners[faceIndex] = projectIndex;
};

const syncFaces = (step) => {
  for (let offset = -1; offset <= 2; offset += 1) {
    const faceIndex = mod4(step + offset);
    const projectIndex = wrapIndex(step + offset, sourceDeck.children.length);
    populateFace(faceIndex, projectIndex);
  }

  const activeFace = mod4(step);
  faces.forEach((face, index) => {
    const isCurrent = index === activeFace;
    const content = face.firstElementChild;
    if (!(content instanceof HTMLElement)) return;

    content.inert = !isCurrent;
    content.setAttribute("aria-hidden", String(!isCurrent));
    face.setAttribute("aria-label", `Project ${faceOwners[index] + 1}`);
  });
};

const updateCubeGeometry = () => {
  if (!cube || !cubeViewport) return;

  const halfHeight = cubeViewport.clientHeight / 2;
  cube.style.setProperty("--cube-depth", `${halfHeight}px`);
  cube.style.transform = `translateZ(${-halfHeight}px) rotateX(${displayAngle}deg)`;
  drawRulers(displayAngle);
};

const curveX = (y, height) => {
  const position = y / height;
  return rulerBow * 4 * position * (1 - position);
};

const setupRulers = () => {
  if (!rulerLeft || !rulerRight || !cubeViewport) return;

  const bounds = cubeViewport.getBoundingClientRect();
  rulerHeight = bounds.height;
  rulerDpr = window.devicePixelRatio || 1;

  [rulerLeft, rulerRight].forEach((canvas) => {
    canvas.width = rulerWidth * rulerDpr;
    canvas.height = rulerHeight * rulerDpr;
    canvas.style.height = `${rulerHeight}px`;
    canvas.style.marginTop = `${-rulerHeight / 2}px`;
  });

  rulerLeft.style.left = `${bounds.left - rulerWidth - 12}px`;
  rulerRight.style.left = `${bounds.right + 12}px`;
  rulerLeftContext = rulerLeft.getContext("2d");
  rulerRightContext = rulerRight.getContext("2d");
  rulerLeftContext?.setTransform(rulerDpr, 0, 0, rulerDpr, 0, 0);
  rulerRightContext?.setTransform(rulerDpr, 0, 0, rulerDpr, 0, 0);
};

const drawRuler = (context, side, angle) => {
  if (!context || rulerHeight <= 0) return;

  context.clearRect(0, 0, rulerWidth, rulerHeight);
  const scrollPosition = (angle / 90) * rulerSegment;
  const margin = 20;
  const firstTick = Math.floor(
    (scrollPosition - rulerHeight / 2 - margin) / rulerTickSpacing,
  );
  const lastTick = Math.ceil(
    (scrollPosition + rulerHeight / 2 + margin) / rulerTickSpacing,
  );

  context.lineWidth = 1;
  for (let tick = firstTick; tick <= lastTick; tick += 1) {
    const tickInSegment = wrapIndex(tick, rulerSegment / rulerTickSpacing);
    const y = rulerHeight / 2 + tick * rulerTickSpacing - scrollPosition;
    if (y < -margin || y > rulerHeight + margin) continue;

    const length = tickInSegment === 0 ? 16 : tickInSegment === 5 ? 10 : 6;
    let alpha = tickInSegment === 0 ? 0.55 : tickInSegment === 5 ? 0.3 : 0.12;
    if (y < 50) alpha *= y / 50;
    else if (y > rulerHeight - 50) alpha *= (rulerHeight - y) / 50;

    const curve = curveX(Math.max(0, Math.min(rulerHeight, y)), rulerHeight);
    const edge = side === "left" ? rulerWidth - 4 - curve : 4 + curve;
    context.strokeStyle = `rgba(242, 240, 234, ${Math.max(0, alpha)})`;
    context.beginPath();
    context.moveTo(edge, y);
    context.lineTo(edge + (side === "left" ? -length : length), y);
    context.stroke();
  }

  context.strokeStyle = "rgba(242, 240, 234, 0.1)";
  context.beginPath();
  for (let y = 0; y <= rulerHeight; y += 2) {
    const curve = curveX(y, rulerHeight);
    const x = side === "left" ? rulerWidth - 4 - curve : 4 + curve;
    if (y === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  }
  context.stroke();
};

const drawRulers = (angle) => {
  drawRuler(rulerLeftContext, "left", angle);
  drawRuler(rulerRightContext, "right", angle);
};

const render = (timestamp) => {
  if (
    previousRenderTimestamp > 0 &&
    timestamp - previousRenderTimestamp > 500
  ) {
    displayAngle = rawAngle;
  }
  previousRenderTimestamp = timestamp;

  const easing = isSnapping ? 0.07 : 0.035;
  displayAngle += (rawAngle - displayAngle) * easing;
  if (Math.abs(rawAngle - displayAngle) < 0.05) displayAngle = rawAngle;

  updateCubeGeometry();
  const nextStep = Math.round(displayAngle / 90);
  if (nextStep !== rotationStep) {
    rotationStep = nextStep;
    syncFaces(rotationStep);
  }
  updateCounter(displayAngle);
  frameId = requestAnimationFrame(render);
};

const cancelSnap = () => {
  if (isSnapping && snapTween) {
    snapTween.kill();
    isSnapping = false;
  }
  window.clearTimeout(snapTimer);
};

const snapToNearest = () => {
  const nearest = Math.round(rawAngle / 90) * 90;
  if (Math.abs(rawAngle - nearest) < 0.5) {
    rawAngle = nearest;
    return;
  }

  isSnapping = true;
  snapProxy.angle = rawAngle;
  snapTween = gsap.to(snapProxy, {
    angle: nearest,
    duration: 0.5,
    ease: "power3.out",
    onUpdate: () => {
      rawAngle = snapProxy.angle;
    },
    onComplete: () => {
      rawAngle = nearest;
      isSnapping = false;
    },
  });
};

const scheduleSnap = (delay = 180) => {
  window.clearTimeout(snapTimer);
  snapTimer = window.setTimeout(snapToNearest, delay);
};

const onWheel = (event) => {
  if (reducedMotion) return;

  event.preventDefault();
  stage.classList.add("is-interacting");
  cancelSnap();
  rawAngle += event.deltaY * 0.22;
  scheduleSnap();
};

const onPointerDown = (event) => {
  if (reducedMotion || !event.isPrimary) return;
  if (event.pointerType === "mouse" && event.button !== 0) return;
  if (
    !(event.target instanceof Element) ||
    !event.target.closest(".works-cube")
  )
    return;

  activePointer = event.pointerId;
  stage.classList.add("is-interacting");
  pointerStartY = event.clientY;
  pointerLastY = event.clientY;
  pointerDragged = false;
  cancelSnap();
  cubeViewport.setPointerCapture(event.pointerId);
};

const onPointerMove = (event) => {
  if (event.pointerId !== activePointer) return;

  const delta = pointerLastY - event.clientY;
  pointerLastY = event.clientY;
  if (Math.abs(event.clientY - pointerStartY) > 5) pointerDragged = true;
  rawAngle += delta * (event.pointerType === "touch" ? 0.6 : 0.5);
};

const onPointerUp = (event) => {
  if (event.pointerId !== activePointer) return;

  activePointer = undefined;
  scheduleSnap(120);
  window.setTimeout(() => {
    pointerDragged = false;
  }, 0);
};

const onKeyDown = (event) => {
  if (reducedMotion) return;
  if (
    event.target instanceof HTMLElement &&
    event.target.closest("a, button")
  ) {
    return;
  }

  if (event.key === "ArrowDown" || event.key === "ArrowRight") {
    event.preventDefault();
    stage.classList.add("is-interacting");
    cancelSnap();
    rawAngle = (Math.round(rawAngle / 90) + 1) * 90;
    snapToNearest();
  } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
    event.preventDefault();
    stage.classList.add("is-interacting");
    cancelSnap();
    rawAngle = (Math.round(rawAngle / 90) - 1) * 90;
    snapToNearest();
  }
};

const onClickCapture = (event) => {
  if (!pointerDragged) return;
  event.preventDefault();
  event.stopPropagation();
  pointerDragged = false;
};

const createDesktopShowcase = () => {
  document.documentElement.classList.add("has-3d-showcase");
  document.body.classList.add("has-3d-showcase");
  sourceDeck.hidden = true;
  stage.classList.remove("is-interacting");

  cubeViewport = document.createElement("div");
  cubeViewport.className = "works-cube-viewport";
  cubeViewport.setAttribute("aria-label", "Scroll to rotate through projects");
  cubeViewport.tabIndex = 0;

  const scene = document.createElement("div");
  scene.className = "works-cube-scene";
  cube = document.createElement("div");
  cube.className = "works-cube";
  scene.append(cube);
  cubeViewport.append(scene);

  faces = cubeBaseAngles.map((angle, index) => {
    const face = document.createElement("div");
    face.className = "works-cube-face";
    face.dataset.face = String(index);
    face.style.transform = `rotateX(${angle}deg) translateZ(var(--cube-depth))`;
    face.setAttribute("aria-label", "Project preview");
    cube.append(face);
    return face;
  });

  rulerLeft = document.createElement("canvas");
  rulerRight = document.createElement("canvas");
  rulerLeft.className = "works-ruler works-ruler-left";
  rulerRight.className = "works-ruler works-ruler-right";
  rulerLeft.setAttribute("aria-hidden", "true");
  rulerRight.setAttribute("aria-hidden", "true");
  stage.append(cubeViewport, rulerLeft, rulerRight);
  syncFaces(0);
  setupRulers();
  updateCubeGeometry();

  document.addEventListener("wheel", onWheel, { passive: false });
  document.addEventListener("pointerdown", onPointerDown);
  document.addEventListener("pointermove", onPointerMove);
  document.addEventListener("pointerup", onPointerUp);
  document.addEventListener("pointercancel", onPointerUp);
  document.addEventListener("click", onClickCapture, true);
  document.addEventListener("keydown", onKeyDown);
  window.addEventListener("resize", updateCubeGeometry);
  window.addEventListener("resize", setupRulers);
  frameId = requestAnimationFrame(render);
};

const removeDesktopShowcase = () => {
  document.documentElement.classList.remove("has-3d-showcase");
  document.body.classList.remove("has-3d-showcase");
  stage.classList.remove("is-interacting");
  document.removeEventListener("wheel", onWheel);
  document.removeEventListener("pointerdown", onPointerDown);
  document.removeEventListener("pointermove", onPointerMove);
  document.removeEventListener("pointerup", onPointerUp);
  document.removeEventListener("pointercancel", onPointerUp);
  document.removeEventListener("click", onClickCapture, true);
  document.removeEventListener("keydown", onKeyDown);
  window.removeEventListener("resize", updateCubeGeometry);
  window.removeEventListener("resize", setupRulers);
  cancelAnimationFrame(frameId);
  cancelSnap();
  cubeViewport?.remove();
  rulerLeft?.remove();
  rulerRight?.remove();
  cubeViewport = undefined;
  cube = undefined;
  faces = [];
  faceOwners = Array(cubeFaceCount).fill(-1);
  rotationStep = 0;
  rawAngle = 0;
  displayAngle = 0;
  previousRenderTimestamp = 0;
  sourceDeck.hidden = false;
  currentCount.textContent = "01";
  gsap.set(progress, { scaleX: 0 });
};

const updateMotionMode = () => {
  if (!reducedMotion) {
    if (!cube) createDesktopShowcase();
  } else if (cube) {
    removeDesktopShowcase();
  }
};

if (
  sourceDeck instanceof HTMLElement &&
  stage instanceof HTMLElement &&
  currentCount instanceof HTMLElement &&
  progress instanceof HTMLElement &&
  sourceDeck.children.length > 0
) {
  updateMotionMode();
  window.addEventListener("resize", updateMotionMode);
} else {
  console.error("Unable to initialize the selected work showcase.");
}
