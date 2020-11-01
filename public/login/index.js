
// document.addEventListener("readystatechange", (ev) => {
//     console.log(`Ready State: ${document.readyState}`);
// });

document.addEventListener("DOMContentLoaded", function () {
    let errorField = document.querySelector('#error');;
    let query = getQuery();
    let errImage = `<i class="icofont-close-circled"></i>`;
    const tl = gsap.timeline();

    if(query["redirect"] && query["redirect"] === "true"){
        document.querySelector("[name='redirect_url'").value = window.decodeURIComponent(query["redirect_url"]);
    }

	if (query && query['idn'] && query['idn'] === "invalidid") {
        errorField.innerHTML = `${errImage} <div>Username/Password is incorrect!</div>`;
        errorField.classList.toggle("serror", true);
    }else if(query['idn'] === "novalid"){
        errorField.innerHTML = `${errImage} <div>Username does not exist!</div>`;
        errorField.classList.toggle("serror", true);
    }

    if(gsap){
        tl.add(
            gsap.from(document.querySelector("#login-form input[type='submit']"), 0.6, {y: "100vh", ease: Power2.easeOut})
        )
        .add(
            gsap.from(document.querySelectorAll("main h1, #login-form+div"), 0.5, {opacity: 0, ease: Power1.easeOut, stagger: 0.2})
        );
    }
});