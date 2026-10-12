import "./style.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const Lenis = window.Lenis;
let lenis;

if (typeof Lenis === "function") {
  lenis = new Lenis({
    duration: 1.1,
    smoothWheel: true,
    anchors: true,
  });

  const raf = (time) => lenis.raf(time * 1000);
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add(raf);
  gsap.ticker.lagSmoothing(0);
  window.addEventListener(
    "pagehide",
    () => {
      lenis.destroy();
      gsap.ticker.remove(raf);
    },
    { once: true },
  );
} else {
  console.error("Lenis CDN failed to load. Falling back to native scrolling.");
}

const progressBar = document.querySelector(".scroll-progress span");
const updateProgress = () => {
  const scrollableHeight =
    document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;

  gsap.set(progressBar, { scaleX: progress });
};

lenis?.on("scroll", updateProgress);
window.addEventListener("scroll", updateProgress, { passive: true });
window.addEventListener("resize", updateProgress);
updateProgress();

const featuredImage = document.querySelector(".featured-image");
const featuredProject = document.querySelector(".featured-project");
const featuredTitle = document.querySelector(".featured-title");
const projectDescription = document.querySelector(".project-description");
const projectCursor = document.querySelector(".project-cursor");
const projectShowcase = document.querySelector(".project-showcase");
const projectList = document.querySelector(".project-list");
const projectFlowLine = document.querySelector(".project-flow-line");
const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

const projectRows = [...document.querySelectorAll(".project-row")];
const activateProject = (row) => {
  if (row.classList.contains("is-active")) return;

  document
    .querySelector(".project-row.is-active")
    ?.classList.remove("is-active");
  row.classList.add("is-active");

  if (featuredImage instanceof HTMLImageElement) {
    gsap.killTweensOf(featuredImage);
    featuredImage.src = row.dataset.image ?? "";
    featuredImage.alt = row.dataset.alt ?? row.dataset.title ?? "";
    gsap.fromTo(
      featuredImage,
      { opacity: 0, scale: 1.035 },
      {
        opacity: 1,
        scale: 1,
        duration: prefersReducedMotion ? 0 : 0.55,
        ease: "power2.out",
      },
    );
  }

  if (featuredProject instanceof HTMLAnchorElement) {
    featuredProject.href = row.href;
    featuredProject.setAttribute(
      "aria-label",
      `View ${row.dataset.title ?? "project"}`,
    );
  }

  if (projectDescription) {
    projectDescription.textContent = row.dataset.description ?? "";
  }

  if (featuredTitle) {
    gsap.killTweensOf(featuredTitle);
    featuredTitle.textContent = row.dataset.title ?? "SELECTED PROJECT";
    gsap.fromTo(
      featuredTitle,
      { y: 8, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: prefersReducedMotion ? 0 : 0.35,
        ease: "power2.out",
      },
    );
  }
};

projectRows.forEach((row) => {
  row.addEventListener("pointerenter", () => activateProject(row));
  row.addEventListener("focus", () => activateProject(row));

  if (!prefersReducedMotion) {
    gsap.fromTo(
      row,
      { x: -34, scale: 0.94, autoAlpha: 0.15 },
      {
        x: 0,
        scale: 1,
        autoAlpha: 1,
        ease: "none",
        scrollTrigger: {
          trigger: row,
          start: "top 82%",
          end: "center 50%",
          scrub: 0.65,
        },
      },
    );

    gsap.fromTo(
      row,
      { x: 0, scale: 1, autoAlpha: 1 },
      {
        x: -28,
        scale: 0.95,
        autoAlpha: 0.15,
        ease: "none",
        scrollTrigger: {
          trigger: row,
          start: "center 50%",
          end: "bottom 18%",
          scrub: 0.65,
        },
      },
    );
  }
});

if (projectShowcase && projectRows.length > 0) {
  const updateProjectShowcase = () => {
    const showcaseBounds = projectShowcase.getBoundingClientRect();
    const isShowcaseVisible =
      showcaseBounds.top < window.innerHeight && showcaseBounds.bottom > 0;

    if (!isShowcaseVisible) {
      return;
    }

    const viewportCenter = window.innerHeight / 2;
    const nearestRow = projectRows.reduce(
      (nearest, row) => {
        const bounds = row.getBoundingClientRect();
        const distance = Math.abs(
          bounds.top + bounds.height / 2 - viewportCenter,
        );
        return distance < nearest.distance ? { row, distance } : nearest;
      },
      { row: projectRows[0], distance: Number.POSITIVE_INFINITY },
    );

    activateProject(nearestRow.row);
  };

  const flowLinePath = projectFlowLine?.querySelector("path");
  if (
    projectList &&
    projectFlowLine instanceof SVGSVGElement &&
    flowLinePath
  ) {
    const pathLength = flowLinePath.getTotalLength();
    gsap.set(flowLinePath, {
      strokeDasharray: pathLength,
      strokeDashoffset: prefersReducedMotion ? 0 : pathLength,
    });

    const flowLineObserver = new IntersectionObserver(([entry]) => {
      projectFlowLine.classList.toggle("is-visible", entry.isIntersecting);
    });
    flowLineObserver.observe(projectList);

    if (!prefersReducedMotion) {
      gsap.to(flowLinePath, {
        strokeDashoffset: 0,
        ease: "none",
        scrollTrigger: {
          trigger: projectList,
          start: "top 78%",
          end: "bottom 22%",
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: updateProjectShowcase,
          onRefresh: updateProjectShowcase,
        },
      });
    } else {
      ScrollTrigger.create({
        trigger: projectList,
        start: "top 78%",
        end: "bottom 22%",
        onUpdate: updateProjectShowcase,
        onRefresh: updateProjectShowcase,
      });
    }
  } else {
    ScrollTrigger.create({
      trigger: projectShowcase,
      start: "top bottom",
      end: "bottom top",
      onUpdate: updateProjectShowcase,
      onRefresh: updateProjectShowcase,
    });
  }
}

const projectGallery = document.querySelector(".project-gallery");
const galleryStage = document.querySelector(".gallery-stage");
const galleryCopy = document.querySelector(".gallery-copy");
const galleryCopyMotion = document.querySelector(".gallery-copy-motion");
const galleryKicker = document.querySelector(".gallery-copy .intro-kicker");
const galleryProgress = document.querySelector(".gallery-progress-fill");
const galleryCurrent = document.querySelector(".gallery-count span");
const galleryCards = [...document.querySelectorAll(".gallery-card")];
const galleryFaces = [...document.querySelectorAll(".gallery-card-face")];
const galleryWords = [...document.querySelectorAll(".gallery-word")];
const galleryMotion = { progress: 0 };

const updateGalleryOrbit = (progress) => {
  const radiusX = Math.min(window.innerWidth * 0.33, 460);
  const radiusY = Math.min(window.innerHeight * 0.25, 205);
  const exitStart = 0.58;
  const exitRange = 1 - exitStart;
  const exitCycleProgress = Math.max(
    0,
    Math.min(1, (progress - exitStart) / exitRange),
  );
  const orbitProgress =
    progress < exitStart
      ? progress / exitStart
      : 1 + exitCycleProgress;

  galleryCards.forEach((card, index) => {
    const exitProgress = Math.min(
      1,
      Math.max(
        0,
        (exitCycleProgress - index / galleryCards.length) *
          galleryCards.length,
      ),
    );
    const easedExit =
      exitProgress * exitProgress * (3 - 2 * exitProgress);
    const angle =
      exitProgress > 0
        ? 0
        : (index / galleryCards.length) * Math.PI * 2 -
          orbitProgress * Math.PI * 2;
    const depth = Math.sin(angle);
    const scale = 0.76 + ((depth + 1) / 2) * 0.18;

    gsap.set(card, {
      x:
        Math.cos(angle) * radiusX +
        easedExit * (window.innerWidth * 1.2 + card.offsetWidth),
      y: depth * radiusY * (1 - easedExit),
      scale,
      autoAlpha: 1 - easedExit,
      zIndex: exitProgress > 0 ? 20 + index : Math.round(10 + depth * 10),
    });
  });
};

if (
  projectGallery &&
  galleryStage &&
  galleryCopy &&
  galleryCopyMotion &&
  galleryProgress &&
  galleryCurrent &&
  galleryCards.length > 0 &&
  galleryWords.length > 0 &&
  galleryFaces.length === galleryCards.length
) {
  updateGalleryOrbit(0);
  window.addEventListener("resize", () =>
    updateGalleryOrbit(galleryMotion.progress),
  );

  if (!prefersReducedMotion) {
    const galleryTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: projectGallery,
        start: "top top",
        end: () => `+=${window.innerHeight * 4.5}`,
        pin: projectGallery,
        scrub: 0.8,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onRefresh: () => {
          lenis?.resize();
          updateGalleryOrbit(galleryMotion.progress);
        },
        onUpdate: ({ progress }) => {
          gsap.set(galleryProgress, { scaleX: progress });
          galleryCurrent.textContent = String(
            Math.min(
              galleryCards.length,
              Math.floor(progress * galleryCards.length) + 1,
            ),
          ).padStart(2, "0");
        },
      },
    });

    galleryTimeline.to(
      galleryMotion,
      {
        progress: 1,
        duration: 1,
        ease: "none",
        onUpdate: () => updateGalleryOrbit(galleryMotion.progress),
      },
      0,
    );
    galleryTimeline.fromTo(
      galleryCopyMotion,
      { autoAlpha: 0, y: 24 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.12,
        ease: "power2.out",
      },
      0,
    );
    galleryTimeline.fromTo(
      galleryWords,
      { autoAlpha: 0, y: 14, filter: "blur(5px)" },
      {
        autoAlpha: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 0.1,
        stagger: 0.045,
        ease: "power2.out",
      },
      0.06,
    );
    galleryTimeline.to(
      galleryWords,
      {
        autoAlpha: 0,
        y: -14,
        filter: "blur(5px)",
        duration: 0.08,
        stagger: { each: 0.022, from: "end" },
        ease: "power2.in",
      },
      0.7,
    );
    if (galleryKicker) {
      galleryTimeline.to(
        galleryKicker,
        {
          autoAlpha: 0,
          y: -10,
          filter: "blur(4px)",
          duration: 0.12,
          ease: "power2.in",
        },
        0.82,
      );
    }
    galleryTimeline.fromTo(
      galleryFaces,
      { y: 72, scale: 0.58, autoAlpha: 0 },
      {
        y: 0,
        scale: 1,
        autoAlpha: 1,
        duration: 0.12,
        stagger: 0.07,
        ease: "power3.out",
      },
      0,
    );
  } else {
    gsap.set(galleryCopyMotion, { autoAlpha: 1 });
    gsap.set(galleryWords, { autoAlpha: 1, clearProps: "filter,transform" });
  }
}

const skillToggles = [...document.querySelectorAll(".skill-toggle")];
skillToggles.forEach((toggle) => {
  toggle.addEventListener("click", () => {
    const panelId = toggle.getAttribute("aria-controls");
    const panel = panelId ? document.getElementById(panelId) : null;
    const group = toggle.closest(".skill-group");

    if (!(panel instanceof HTMLElement) || !group) {
      console.error("Unable to find the skill panel for the selected category.");
      return;
    }

    if (toggle.getAttribute("aria-expanded") === "true") return;

    skillToggles.forEach((otherToggle) => {
      const otherPanelId = otherToggle.getAttribute("aria-controls");
      const otherPanel = otherPanelId
        ? document.getElementById(otherPanelId)
        : null;
      const otherGroup = otherToggle.closest(".skill-group");

      if (
        !(otherPanel instanceof HTMLElement) ||
        !otherGroup ||
        otherToggle === toggle ||
        otherToggle.getAttribute("aria-expanded") !== "true"
      ) {
        return;
      }

      otherToggle.setAttribute("aria-expanded", "false");
      otherGroup.classList.remove("is-open");

      if (prefersReducedMotion) {
        otherPanel.hidden = true;
        return;
      }

      gsap.killTweensOf(otherPanel);
      gsap.to(otherPanel, {
        height: 0,
        autoAlpha: 0,
        duration: 0.45,
        ease: "power2.inOut",
        onComplete: () => {
          otherPanel.hidden = true;
          gsap.set(otherPanel, { clearProps: "height,opacity,visibility" });
        },
      });
    });

    toggle.setAttribute("aria-expanded", "true");
    group.classList.add("is-open");
    panel.hidden = false;

    const skillItems = panel.querySelectorAll("li");
    if (prefersReducedMotion) return;

    gsap.killTweensOf(panel);
    gsap.set(panel, { height: 0, autoAlpha: 0 });
    gsap.to(panel, {
      height: "auto",
      autoAlpha: 1,
      duration: 0.65,
      ease: "power3.inOut",
      onComplete: () => {
        gsap.set(panel, { clearProps: "height,opacity,visibility" });
      },
    });
    gsap.fromTo(
      skillItems,
      { y: 12, autoAlpha: 0 },
      {
        y: 0,
        autoAlpha: 1,
        duration: 0.4,
        stagger: 0.045,
        delay: 0.08,
        ease: "power2.out",
      },
    );
  });
});

featuredProject?.addEventListener("pointerenter", () => {
  featuredProject.classList.add("is-hovered");
});

featuredProject?.addEventListener("pointerleave", () => {
  featuredProject.classList.remove("is-hovered");
});

featuredProject?.addEventListener("pointermove", (event) => {
  if (!(projectCursor instanceof HTMLElement)) return;

  const bounds = featuredProject.getBoundingClientRect();
  projectCursor.style.left = `${event.clientX - bounds.left}px`;
  projectCursor.style.top = `${event.clientY - bounds.top}px`;
});

document.documentElement.classList.add("has-js");

if (!prefersReducedMotion) {
  gsap.from(
    ".hero-top > *, .hero-heading-meta > *, .hero-title > *, .hero-statement-row > *, .hero-bottom > *",
    {
    y: 24,
    opacity: 0,
    duration: 0.9,
    stagger: 0.09,
    ease: "power3.out",
    delay: 0.15,
    },
  );

  const splitIntoWords = (element, className) => {
    const textWalker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
    );
    const textNodes = [];

    while (textWalker.nextNode()) {
      if (textWalker.currentNode.textContent?.trim()) {
        textNodes.push(textWalker.currentNode);
      }
    }

    textNodes.forEach((textNode) => {
      const fragment = document.createDocumentFragment();
      const parts = textNode.textContent.match(/\s+|[^\s]+/g) ?? [];

      parts.forEach((part) => {
        if (/^\s+$/.test(part)) {
          fragment.append(document.createTextNode(part));
        } else {
          const word = document.createElement("span");
          word.className = className;
          word.textContent = part;
          fragment.append(word);
        }
      });

      textNode.replaceWith(fragment);
    });
  };

  const intro = document.querySelector(".intro");
  const introKicker = document.querySelector(".intro-heading .intro-kicker");
  const introWords = [
    ...document.querySelectorAll(".intro-title-line .about-word"),
  ];
  const introLead = document.querySelector(".intro-lead");
  const introAside = document.querySelector(".intro-aside");
  const introLink = document.querySelector(".intro-link");

  if (
    intro &&
    introKicker &&
    introWords.length > 0 &&
    introLead &&
    introAside &&
    introLink
  ) {
    splitIntoWords(introLead, "about-word");

    const introLeadWords = [...introLead.querySelectorAll(".about-word")];
    const aboutTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: intro,
        start: "top 78%",
        end: "bottom 38%",
        scrub: 0.8,
      },
    });

    aboutTimeline.fromTo(
      introKicker,
      { y: 14, autoAlpha: 0, filter: "blur(6px)" },
      { y: 0, autoAlpha: 1, filter: "blur(0px)", duration: 0.12 },
      0,
    );
    aboutTimeline.fromTo(
      introWords,
      { y: 18, autoAlpha: 0.15, filter: "blur(8px)" },
      {
        y: 0,
        autoAlpha: 1,
        filter: "blur(0px)",
        duration: 0.48,
        stagger: 0.075,
        ease: "power2.out",
      },
      0.08,
    );
    aboutTimeline.fromTo(
      introLeadWords,
      { y: 8, autoAlpha: 0.18, filter: "blur(5px)" },
      {
        y: 0,
        autoAlpha: 1,
        filter: "blur(0px)",
        duration: 0.42,
        stagger: 0.012,
        ease: "power2.out",
      },
      0.38,
    );
    aboutTimeline.fromTo(
      [introAside, introLink],
      { y: 18, autoAlpha: 0 },
      {
        y: 0,
        autoAlpha: 1,
        duration: 0.18,
        stagger: 0.08,
        ease: "power2.out",
      },
      0.78,
    );
  }

  const contact = document.querySelector(".contact");
  const contactKicker = document.querySelector(".contact-heading .intro-kicker");
  const contactTitleLines = [
    ...document.querySelectorAll(".contact-title-line > span"),
  ];
  const contactCopy = document.querySelector(".contact-copy");
  const contactEmail = document.querySelector(".contact-email");
  const contactSocials = document.querySelector(".contact-socials");
  const contactCredit = document.querySelector(".contact-credit");

  if (
    contact &&
    contactKicker &&
    contactTitleLines.length > 0 &&
    contactCopy &&
    contactEmail &&
    contactSocials &&
    contactCredit
  ) {
    splitIntoWords(contactCopy, "contact-copy-word");

    const contactTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: contact,
        start: "top top",
        end: () => `+=${window.innerHeight * 1.35}`,
        pin: contact,
        scrub: 0.8,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onRefresh: () => lenis?.resize(),
      },
    });

    contactTimeline.fromTo(
      contactKicker,
      { y: 14, autoAlpha: 0, filter: "blur(6px)" },
      {
        y: 0,
        autoAlpha: 1,
        filter: "blur(0px)",
        duration: 0.12,
        ease: "power2.out",
      },
      0,
    );
    contactTimeline.fromTo(
      contactTitleLines,
      { y: 18, autoAlpha: 0 },
      {
        y: 0,
        autoAlpha: 1,
        duration: 0.18,
        stagger: 0.08,
        ease: "power2.out",
      },
      0.04,
    );
    contactTimeline.fromTo(
      contactCopy.querySelectorAll(".contact-copy-word"),
      { y: 10, autoAlpha: 0.12, filter: "blur(5px)" },
      {
        y: 0,
        autoAlpha: 1,
        filter: "blur(0px)",
        duration: 0.3,
        stagger: 0.014,
        ease: "power2.out",
      },
      0.3,
    );
    contactTimeline.fromTo(
      [contactEmail, contactSocials, contactCredit],
      { y: 18, autoAlpha: 0 },
      {
        y: 0,
        autoAlpha: 1,
        duration: 0.18,
        stagger: 0.08,
        ease: "power2.out",
      },
      0.68,
    );
  }

  gsap.utils.toArray("[data-reveal]").forEach((element) => {
    gsap.fromTo(
      element,
      { y: 28, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: "power3.out",
        clearProps: "transform",
        scrollTrigger: {
          trigger: element,
          start: "top 88%",
          once: true,
        },
      },
    );
  });
}
