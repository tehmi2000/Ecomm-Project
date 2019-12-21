const createItem = function(container, object){

    // <a href="" class="item cols">
    //     <div class="cols">
    //         <div class="item-img">
    //             <i class="icofont-jacket"></i>
    //         </div>
    //         <div class="item-description cols">
    //             <span>Fashion & Beauty</span>
    //         </div>
    //     </div>
    // </a>

    let a0 = create("A");
        let div0 = create("DIV");
            let div1 = create("DIV");
                let i0 = create("I");
            let div2 = create("DIV");
                let span0 = createComponent("SPAN", object.title);

    a0.classList.add("item", "cols");
    div0.classList.add("cols");
    div1.classList.add("item-img");
    div2.classList.add("item-description", "cols");
    i0.classList.add(object.image);

    a0.setAttribute("href", `categories/all/${object.title}`);
    div1 = joinComponent(div1, i0);
    div2 = joinComponent(div2, span0);
    div0 = joinComponent(div0, div1, div2);
    a0 = joinComponent(a0, div0);

    container.appendChild(a0);
};

const getAllCategories = function() {
    fetch(`/api/categories`).then(async function(response) {
        try {
            let category_list = await response.json();
            document.querySelector("#item-container").innerHTML = "";

            forEach(category_list, function(element) {
                // debugger;
                const nullChild = document.querySelector("[name='country'] option[value='null']");
                if(nullChild){
                    nullChild.parentNode.removeChild(nullChild);
                }
                createItem(document.querySelector("#item-container"), element);
            });

        } catch (err) {
            console.error(err);
        }
    }).catch(function(error) {
        console.error(error);
    });
};

document.addEventListener("DOMContentLoaded", function () {
    getAllCategories();
});