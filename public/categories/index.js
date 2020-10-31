const createItem = function(container, object){
 
    // <a href="" class="item cols">
    //     <div class="cols">
    //         <div class="rows item-img">
    //             <i class="icofont-jacket"></i>
    //         </div>
    //         <div class="item-description cols">
    //             <span>Fashion & Beauty</span>
    //             <span class="hidden-info"></span>
    //         </div>
    //     </div>
    // </a>
    let categoryExplanation = {

    }
    let a0 = createComponent("A", null, ["item", "cols"]);
        let div0 = createComponent("DIV", null, ["cols"]);
            let div1 = createComponent("DIV", null, ["rows", "item-img"]);
                let i0 = createComponent("I", null, [object.image]);
            let div2 = createComponent("DIV", null, ["item-description", "cols"]);
                let span0 = createComponent("SPAN", object.title, ["category-title"]);
                let span1 = createComponent("SPAN", "More information about the categories and what products to expect in them", ["hidden-info"]);

    i0.style.color = "#fcfcfc";
    span0.style.color = "#fcfcfc";
    // span1.style.color = "#fcfcfc";

    a0.setAttribute("href", `/categories/view?query=${window.encodeURIComponent(object.title)}`);
    div1 = joinComponent(div1, i0);
    div2 = joinComponent(div2, span0, span1);
    div0 = joinComponent(div0, div1, div2);
    a0 = joinComponent(a0, div0);

    a0.style.backgroundColor = generateRandomColor();
    // a0.style.opacity = 0;
    container.appendChild(a0);
};

document.addEventListener("DOMContentLoaded", function () {
    let getCategoriesSuccessCallback = categoryList => {
        try {
            // const tl = gsap.timeline();
            document.querySelector("#item-container").innerHTML = "";
            categoryList.forEach(element => {
                // debugger;
                const nullChild = document.querySelector("[name='country'] option[value='null']");
                if(nullChild){
                    nullChild.parentNode.removeChild(nullChild);
                }
                createItem(document.querySelector("#item-container"), element);
            });

            gsap.from(document.querySelectorAll("#item-container > *"), 0.3, {opacity: 0, y: "50vh", ease: Power1.easeOut, stagger: 0.15, onComplete: function() {
                document.querySelectorAll("#item-container > *").forEach(item => {
                    item.style.transition = "all 0.35s ease";
                });
            }});

            createSuggestions(document.querySelector(".pane.sug"), document.querySelector(".pane.sug #suggestion-container"));
            
            document.querySelectorAll(".item .item-description .hidden-info").forEach(el => {
                $clamp(el, {clamp: 3});
            });
        } catch (error) {
            console.error(error);
        }
    };

    fetchAndCacheData(`/api/categories`, getCategoriesSuccessCallback);
});