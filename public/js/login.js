let errorField;
let query = getQuery();

document.addEventListener("DOMContentLoaded", function () {

    if(query["redirect"] && query["redirect"] === "true"){
        document.querySelector("[name='redirect_url'").value = window.decodeURIComponent(query["redirect_url"]);
    }

    let err_image = `<i class="icofont-close-circled"></i>`;
    errorField = document.querySelector('#error');

	if (query && query['idn'] && query['idn'] === "invalidid") {
        errorField.innerHTML = err_image + ' <div>Username/Password is incorrect!</div>';
        errorField.classList.toggle("serror", true);
    }else if(query['idn'] === "novalid"){
        errorField.innerHTML = err_image + ' <div>Username does not exist!</div>';
        errorField.classList.toggle("serror", true);
    }

    const tl = gsap.timeline();
    tl.add(
        gsap.from(document.querySelector("#login-form input[type='submit']"), 0.6, {y: "100vh", ease: Power2.easeOut})
    )
    .add(
        gsap.from(document.querySelectorAll("main h1, #login-form+div"), 0.5, {opacity: 0, ease: Power1.easeOut, stagger: 0.2})
    );
});