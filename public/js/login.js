let errorField;
let query = get_query()
document.addEventListener("DOMContentLoaded", function () {
    let err_image = "<i class=\"icofont-close-circled\"></i>";
    errorField = document.querySelector('#error');

	if (query && query['idn'] && query['idn'] === "invalidid") {
        errorField.innerHTML = err_image + ' <div>Username/Password is incorrect!</div>';
        errorField.classList.toggle("serror", true);
    }else if(query['idn'] === "novalid"){
        errorField.innerHTML = err_image + ' <div>Username does not exist!</div>';
        errorField.classList.toggle("serror", true);
    }
});