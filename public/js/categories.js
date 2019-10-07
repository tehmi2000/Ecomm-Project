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
                let span0 = createComponent("SPAN", "Test example");

    a0.classList.add("item", "cols");
    div0.classList.add("cols");
    div1.classList.add("item-img");
    div2.classList.add("item-description", "cols");
    i0.classList.add("icofont-jacket");

    a0.setAttribute("href", "");
    div1 = joinComponent(div1, i0);
    div2 = joinComponent(div2, span0);
    div0 = joinComponent(div0, div1, div2);
    a0 = joinComponent(a0, div0);

    container.appendChild(a0);
};

window.onload = function () {

    if (get_cookie("username")) {

        let div0 = create("DIV");
        let child = "<a href='/myprofile'><img src='../assets/images/Logo.png' alt='' class='user-picture'></a><a href='/logout'><button>Logout</button></a>";
        div0.innerHTML = child;

        document.querySelector("#sidemenu nav div:first-child").replaceWith(div0);
    }
};