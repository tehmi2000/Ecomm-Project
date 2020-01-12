document.addEventListener("DOMContentLoaded", function() {
    const tl = gsap.timeline();
    appear({
        init: function(){
            gsap.set(".pane-container", {opacity: 0});
        },
        elements: (function() {
            return document.querySelectorAll(".pane-container");
        }()),
        appear: function(el){
            if(el === document.querySelector(".pane-container.one")){
                gsap.set(".pane-container.one", {opacity: 1});
                tl.from(document.querySelectorAll(".pane-container.one > *"), 0.4, {x: "-100vw", ease: Power2.easeOut, stagger: 0.2});
            }

            if(el === document.querySelector(".pane-container.two")){
                gsap.set(".pane-container.two", {opacity: 1});
                tl.from(document.querySelectorAll(".pane-container.two > *"), 0.4, {x: "-100vw", ease: Power2.easeOut, stagger: 0.2});
            }
        }
    });
});