import "./info.css";
import gsap from "gsap";

const overlay = document.querySelector(".info-intro-overlay");
const pageTitle = document.querySelector(".info-page-title");
const backLink = document.querySelector(".info-back");
const main = document.querySelector(".info-main");
const footer = document.querySelector(".info-footer");
const profileItems = [...document.querySelectorAll(".info-profile > *")];
const copyItems = [...document.querySelectorAll(".info-copy > *")];
const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

if (
  overlay instanceof HTMLElement &&
  pageTitle instanceof HTMLAnchorElement &&
  backLink instanceof HTMLAnchorElement &&
  main instanceof HTMLElement &&
  footer instanceof HTMLElement
) {
  const showPage = () => {
    if (reducedMotion) {
      gsap.set([overlay, pageTitle, backLink, main, footer], {
        autoAlpha: 1,
      });
      return;
    }

    gsap.set([pageTitle, backLink, main, footer], { autoAlpha: 0 });
    gsap
      .timeline()
      .to(overlay, { autoAlpha: 0, duration: 0.75, ease: "power2.out" })
      .to(pageTitle, { autoAlpha: 1, duration: 0.55, ease: "power2.out" }, 0.12)
      .to(main, { autoAlpha: 1, duration: 0.7, ease: "power2.out" }, 0.25)
      .fromTo(
        profileItems,
        { y: 18, autoAlpha: 0, filter: "blur(7px)" },
        {
          y: 0,
          autoAlpha: 1,
          filter: "blur(0px)",
          duration: 0.7,
          stagger: 0.07,
          ease: "power3.out",
        },
        0.38,
      )
      .fromTo(
        copyItems,
        { y: 22, autoAlpha: 0, filter: "blur(7px)" },
        {
          y: 0,
          autoAlpha: 1,
          filter: "blur(0px)",
          duration: 0.72,
          stagger: 0.085,
          ease: "power3.out",
        },
        0.34,
      )
      .to(
        [backLink, footer],
        { autoAlpha: 1, duration: 0.55, ease: "power2.out", stagger: 0.08 },
        0.58,
      );
  };

  const leavePage = (event) => {
    if (
      reducedMotion ||
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();
    gsap.to(overlay, {
      autoAlpha: 1,
      duration: 0.45,
      ease: "power2.inOut",
      onComplete: () => {
        window.location.assign(backLink.href);
      },
    });
  };

  backLink.addEventListener("click", leavePage);

  if (document.fonts?.ready) {
    document.fonts.ready.then(showPage);
  } else {
    window.addEventListener("load", showPage, { once: true });
  }
} else {
  console.error("Unable to initialize the Info page animations.");
}
