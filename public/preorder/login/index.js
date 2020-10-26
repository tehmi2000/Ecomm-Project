const startAnimation = function(tl) {
    const a = function() {
        const element = document.querySelector("main *:nth-child(2)");

        gsap.set(element, {opacity: 1});
        return gsap.to(element, 0.8, {
            y: "-40vh",
            delay: 1,
            onComplete: function() {
                gsap.to(element, 0.5, {opacity: 0, ease: Power2.easeIn});
            }
        });
    };

    const b = function() {
        const element = document.querySelector("main *:nth-child(3)");

        gsap.set(element, {y: "-60vh"});
        return gsap.to(element, 1.5, {
            opacity: 1,
            delay: 0.6,
            onComplete: function() {
                gsap.to(element, 1, {y: "0vh", ease: "elastic.out(1.3, 0.3)", repeat: 1, yoyo: true});
            }
        });
    };

    const c = function() {
        const elementParent = document.querySelector("main .login");
        const elementChildren = document.querySelectorAll("main .login *");
        let anim = null;

        const myDevice = function(x) {
            if (!x.matches) { // If media query is not true
                try {
                    anim = gsap.to(elementParent, 0.8, {
                        opacity: 1,
                        scale: 1,
                        y: "-5vh",
                        delay: 2.2,
                        onComplete: function() {
                            gsap.to(elementChildren, 1, {opacity: 1, scale: 1, ease: "Power1.easeOut", stagger: 0.3, onComplete: function() {
                                gsap.to(elementParent, 0.5, {x: "-20vw", ease: "Power1.easeOut"});
                            }});
                        }
                    });
                } catch (error) {
                    console.error(error);
                }
            } else {
                try {
                    anim = gsap.to(elementParent, 0.8, {
                        opacity: 1,
                        scale: 1,
                        delay: 2.2,
                        onComplete: function() {
                            gsap.to(elementChildren, 1, {opacity: 1, scale: 1, ease: "Power1.easeOut", stagger: 0.3});
                        }
                    });
                } catch (error) {
                    console.error(error);
                }
            }
        };

        let x = window.matchMedia("(max-width: 800px)");
        myDevice(x); // Call listener function at run time
        x.addListener(myDevice);

        return anim;
    };

    const d = function() {
        const element = document.querySelector("main .exp-container");

        return gsap.to(element, 1, {
            opacity: 1,
            delay: 2.5,
            y: "-10vh",
            onComplete: function() {
                gsap.to(document.querySelector("header"), 1, {opacity: 1, position: "relative", height: "auto", ease: "elastic.out(1, 0.3)", onComplete: function() {
                    gsap.to(document.querySelector("main"), 0.4, {height: "calc(100vh - 4.3rem)", ease: "Power1.easeOut"});
                }});
            }
        });
    };

    const e = function() {
        const element = document.querySelectorAll("main .login-extra, main > *:nth-child(4)");
        return gsap.to(element, 1, {
            opacity: 1,
            delay: 1
        });
    };

    // Add animation fragments to timeline, tl...
    tl.add(gsap.set(document.querySelector("header"), {height: "0", opacity: 0, position: "absolute"}))
    .add(gsap.set(document.querySelector("main"), {height: "100vh"}))
    .add(a())
    .add(b())
    .add(c())
    .add(d())
    .add(e());

    return tl;
};

document.addEventListener("DOMContentLoaded", function() {
    const tl = gsap.timeline();
    tl.add(gsap.set(document.querySelector(".login, .login *"), {opacity: 0}))
    .add(gsap.set(document.querySelector(".login"), {scale: 0.5}))
    .add(gsap.set(document.querySelectorAll("main .login-extra, main > *:nth-child(4)"), {opacity: 0}));
    startAnimation(tl);
});