onmessage = function (e) {
    console.log("message received by worker");
    let arr = e.data;
    let retArr = [];
    let randIndex = 0;
    let selectedItem = null;

    while (retArr.length < 10){
        // Assign a random index to randIndex
        randIndex = Math.ceil((Math.random() * (arr.length - 1)));
        // Use random index to select a random item
        selectedItem = arr[randIndex];

        // Store selected item in retArr(returned array)
        retArr.push(selectedItem);
        // Remove the selected item from the main array to avoid duplicates
        arr = arr.filter((item) => {
            return item["_id"] !== selectedItem["_id"];
        });
    }
    postMessage(retArr);
}