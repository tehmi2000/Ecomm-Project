const fs = require('fs');
let head = null;

fs.readFile('./modules/templates/headcontent.html', "utf8", (err, content) => {
    if (err) {
        throw err;
    }

    head = content;
    console.log(head);
});

console.log(head);