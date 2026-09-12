import "./style.css";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import gsap from "gsap";

import { ScrollToPlugin } from "gsap/ScrollToPlugin";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

// selection
const counterElement = document.querySelector(".counter h2");
const oneBtns = document.querySelectorAll(".links div");
const h2 = document.querySelector(".projects-content h2");
const p = document.querySelector(".projects-content h4");
const btn = document.querySelector(".projects-content .btn a");
const aboutClick = document.querySelectorAll(".two-click-about");
const projectClick = document.querySelectorAll(".two-click-project");
const portfolioClick = document.querySelectorAll('.two-click-portfolio')



aboutClick.forEach((aboutc)=>{
  aboutc.addEventListener("click", () => {
  gsap.to(window, {
    duration: 1,
    ease: "power1.inOut",
    scrollTo: "#about",
  });
});
})

projectClick.forEach((projectc)=>{
  projectc.addEventListener("click", () => {
  gsap.to(window, {
    duration: 1,
    ease: "power1.inOut",
    scrollTo: "#projects",
  });
});
})

portfolioClick.forEach((portfolio)=>{
  
  portfolio.addEventListener('click' , ()=>{
    gsap.to(window, {
    duration: 1,
    ease: "power1.inOut",
    scrollTo: "#skills",
  });
  }
)
})

// loader
const loaderTm = gsap.timeline();

oneBtns.forEach((btn) => {
  const hoverTimeLine = gsap.timeline({ paused: true });

  const two = btn.querySelector(".two");
  const one = btn.querySelector(".one");

  gsap.set(two.querySelectorAll("span"), {
    y: 30,
  });

  hoverTimeLine
    .to(one.querySelectorAll("span"), {
      y: -30,
      stagger: 0.01,
      duration: 0.6,
      ease: "back.out(2)",
    })
    .to(
      two.querySelectorAll("span"),
      {
        stagger: 0.01,
        y: 0,
        duration: 0.3,
        ease: "back.out(2)",
      },
      "<",
    );

  btn.addEventListener("mouseenter", () => {
    hoverTimeLine.play();
  });

  btn.addEventListener("mouseleave", () => {
    hoverTimeLine.reverse();
  });
});

gsap.set(".hero h1 span", {
  y: 300,
});

let loaderInfo = {
  value: 0,
};

loaderTm
  .to(loaderInfo, {
    duration: 1.3,
    ease: "power2.inOut",
    value: 100,
    stagger: 0.5,
    ease: "power2.inOut",
    onUpdate: () => {
      counterElement.textContent = `${Math.round(loaderInfo.value)}%`;
    },

    onStart:()=>{
      document.body.style.overflowY = 'hidden'
      document.body.style.overflowX = 'hidden'
    },

    onComplete: () => {
      gsap.to(".counter .line", {
        duration: 0.8,
        ease: "power2.inOut",
        y: "-100%",
      });

      gsap.to(counterElement, {
        y: -120,
        duration: 0.8,
        ease: "back.out(2)",
        onComplete: () => {
          heroTL.play();
        },
      });
    },
  })
  .to(
    ".counter .line",
    {
      y: "0%",
      ease: "power4.inOut",
      duration: 1.2,
    },
    "-=1.1",
  );

const heroTL = gsap.timeline({ paused: true });

heroTL
  .to(".loader", {
    yPercent: -100,
    duration: 0.7,
    ease: "power4.inOut",
    delay: 0.3,

    onComplete : ()=>{
      document.body.style.overflowY = 'auto'
      document.body.style.overflowX = 'hidden'

    }
  })
  .to(
    ".hero h1 span",
    {
      y: 0,
      duration: 0.6,
      stagger: 0.01,
      ease: "back.out(1)",
    },
    "-=0.3",
  );

// revel text scroll

gsap.set(".ab-con h1 span", {
  y: 350,
});

const revelTL = gsap.timeline({
  scrollTrigger: {
    trigger: ".main-about",
    start: "top 60%",
  },
});

revelTL.to(".ab-con h1 span", {
  y: 0,
  duration: 0.6,
  ease: "back.out(0.5)",
  stagger: 0.01,
});

gsap.set(".comming-project .img", {
  scale: 0.6,
});

gsap.to(".comming-project  .img", {
  scale: 1,
  ease: "none",
  scrollTrigger: {
    trigger: ".comming-project",
    start: "top top",
    end: "bottom top",
    scrub: 1,
    pin: true,

    onEnter: () => {
      gsap.to(".current", {
        y: -100,
        opacity: 0,
        duration: 0.3,
      });
    },
    onLeaveBack: () => {
      gsap.to(".current", {
        y: 0,
        opacity: 1,
        duration: 0.3,
      });
    },
  },
});

// project ani

let played = false;

const projectTL = gsap.timeline({
  scrollTrigger: {
    trigger: ".projects",
    pin: true,
    scrub: 2,
    end: "+=4000",
    start: "center 50%",
  },
});

projectTL
  .to("#one-pro", {
    bottom: 800,
    duration: 2.1,
    ease: "none",
    onStart: () => {
      played = true;
    },

    onUpdate: function () {
      if (this.progress() >= 0.5 && played) {
        h2.textContent = "dm system";
        p.textContent =
          "Patients can book available appointment slots, doctors can accept or confirm requests, and both can track their scheduled appointments.";
        btn.textContent = "See Project";
        btn.href = "https://doctor-managment-system-nu.vercel.app/";
        textTm.restart();
        played = false;
      }

      if (this.progress() <= 0.5 && played) {
        h2.textContent = "dm system";
        p.textContent =
          "Patients can book available appointment slots, doctors can accept or confirm requests, and both can track their scheduled appointments.";
        btn.textContent = "See Project";
        btn.href = "https://doctor-managment-system-nu.vercel.app/";
        textTm.restart();
        played = false;
      }
    },
    onReverseComplete: () => {
      played = true;
    },
  })
  .to("#two-pro", {
    bottom: 800,

    duration: 2.1,

    ease: "none",

    onStart: () => {
      played = true;
    },

    onUpdate: function () {
      if (this.progress() >= 0.5 && played) {
        h2.textContent = "LM system";
        p.textContent =
          "Students can watch courses, track video completion and learning progress, while mentors can upload videos, create playlists, manage courses, and monitor student progress.";
        btn.textContent = "See Project";
        btn.href = "https://mini-hackathone-react.vercel.app/";
        textTm.restart();
        played = false;
      }

      if (this.progress() <= 0.5 && played) {
        h2.textContent = "LM system";
        p.textContent =
          "Students can watch courses, track video completion and learning progress, while mentors can upload videos, create playlists, manage courses, and monitor student progress.";
        btn.textContent = "See Project";
        btn.href = "https://mini-hackathone-react.vercel.app/";
        textTm.restart();
        played = false;
      }
    },

    onReverseComplete: () => {
      played = true;
    },
  })
  .to("#three-pro", {
    bottom: 800,

    duration: 2.1,

    ease: "none",

    onStart: () => {
      played = true;
    },

    onUpdate: function () {
      if (this.progress() >= 0.5 && played) {
        h2.textContent = "FinTrack Pro";
        p.textContent =
          "Track income, manage expenses, set budgets, and monitor your spending with a clear financial dashboard.";
        btn.textContent = "See Project";
        btn.href = "https://fin-track-pro-three-blue.vercel.app/";
        textTm.restart();
        played = false;
      }

      if (this.progress() <= 0.5 && played) {
        h2.textContent = "FinTrack Pro";
        p.textContent =
          "Track income, manage expenses, set budgets, and monitor your spending with a clear financial dashboard.";
        btn.textContent = "See Project";
        btn.href = "https://fin-track-pro-three-blue.vercel.app/";
        textTm.restart();
        played = false;
      }
    },

    onReverseComplete: () => {
      played = true;
    },
  })
  .to("#four-pro", {
    bottom: 800,

    duration: 2.1,

    ease: "none",

    onStart: () => {
      played = true;
    },

    onUpdate: function () {
      if (this.progress() >= 0.5 && played) {
        h2.textContent = "SM System";
        p.textContent =
          "Manage products, monitor stock levels, track inventory, and keep product availability organized from one dashboard.";
        btn.textContent = "See Project";
        btn.href = "https://assignment-3-in-js.vercel.app/";
        textTm.restart();
        played = false;
      }

      if (this.progress() <= 0.5 && played) {
        h2.textContent = "SM System";
        p.textContent =
          "Manage products, monitor stock levels, track inventory, and keep product availability organized from one dashboard.";
        btn.textContent = "See Project";
        btn.href = "https://assignment-3-in-js.vercel.app/";
        textTm.restart();
        played = false;
      }
    },

    onReverseComplete: () => {
      played = true;
    },
  })
  .to("#five-pro", {
    bottom: 800,

    duration: 2.1,

    ease: "none",

    onStart: () => {
      played = true;
    },

    onUpdate: function () {
      if (this.progress() >= 0.5 && played) {
        h2.textContent = "Productivity Dashboard";
        p.textContent =
          "Plan tasks, organize projects, track progress, and manage daily work from one focused workspace.";
        btn.textContent = "See Project";
        btn.href = "https://a9-assignment.vercel.app/";
        textTm.restart();
        played = false;
      }

      if (this.progress() <= 0.5 && played) {
        h2.textContent = "Productivity Dashboard";
        p.textContent =
          "Plan tasks, organize projects, track progress, and manage daily work from one focused workspace.";
        btn.textContent = "See Project";
        btn.href = "https://a9-assignment.vercel.app/";
        textTm.restart();
        played = false;
      }
    },

    onReverseComplete: () => {
      played = true;
    },
  })
  .to("#six-pro", {
    bottom: 800,

    duration: 2.1,

    ease: "none",

    onStart: () => {
      played = true;
    },

    onUpdate: function () {
      if (this.progress() >= 0.5 && played) {
        h2.textContent = "E-Commerce";
        p.textContent =
          "Discover products, manage your cart, and shop seamlessly through a clean and intuitive online store.";
        btn.textContent = "See Project";
        btn.href = "https://assignment10-shery1.vercel.app/";
        textTm.restart();
        played = false;
      }

      if (this.progress() <= 0.5 && played) {
        h2.textContent = "E-Commerce";
        p.textContent =
          "Discover products, manage your cart, and shop seamlessly through a clean and intuitive online store.";
        btn.textContent = "See Project";
        btn.href = "https://assignment10-shery1.vercel.app/";
        textTm.restart();
        played = false;
      }
    },

    onReverseComplete: () => {
      played = true;
    },
  });

const textTm = gsap.timeline({ paused: true });
textTm
  .to(
    ".projects-content h2",
    {
      y: 0,
      duration: 0.6,
      ease: "back.out(1)",
      opacity: 1,
    },
    "<",
  )
  .to(
    ".projects-content h4",
    {
      y: 0,
      duration: 0.6,
      ease: "back.out(1)",
      opacity: 1,
    },
    "<",
  )
  .to(
    ".projects-content .btn a",
    {
      y: 0,
      duration: 0.6,
      ease: "back.out(1)",
      opacity: 1,
    },
    "<",
  );

const skillTimeLine = gsap.timeline({
  scrollTrigger: {
    trigger: ".skills",
    start: "top top",
    end: "+=4000",
    pin: true,
    scrub: true,
  },
});

skillTimeLine
  .to("#skill-html", {
    duration: 1.5,
    ease: "power1.inOut",
    bottom: 30,
    x: 200,
  })
  .to("#skill-css", {
    duration: 1.5,
    ease: "power2.out",
    bottom: 60,
    x: 300,
  })
  .to("#skill-js", {
    duration: 1.5,
    ease: "power3.out",
    bottom: 90,
    x: 400,
  })
  .to("#skill-react", {
    duration: 1.5,
    ease: "back.out(1.4)",
    bottom: 120,
    x: 500,
  })
  .to("#skill-typescript", {
    duration: 1.5,
    ease: "power2.inOut",
    bottom: 30,
    x: -250,
  })
  .to("#skill-gsap", {
    duration: 1.5,
    ease: "back.out(1.7)",
    bottom: 60,
    x: -350,
  })
  .to("#skill-tailwind", {
    duration: 1.5,
    ease: "power3.out",
    bottom: 90,
    x: -450,
  })
  .to("#skill-github", {
    duration: 1.5,
    ease: "power4.out",
    bottom: 120,
    x: -550,
  });
