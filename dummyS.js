let l = [1, 30, 4, 67, 78, 32, 2, 6, 90, 5, 9, 0, 3, 45];

const sort = function(list) {
    let length = list.length;
    let swapped = false;

    for (let i = 0; i < length; i++){
        if(list[i] > list[i+1]){
            let store = list[i];
            list[i] = list[i+1];
            list[i+1] = store;
            swapped = true;
        }
    }

    return (swapped)? sort(list) : list;
};

const linSearch = function(list, search) {
    let length = list.length;
    let idx = 0;
    list = sort(list);

    while(idx++ < length){
        if(list[idx] === search){
            return `Found at index ${idx}`;
        }
    }
    return 'Not Found';
};

const midSearch = function(list, search){
    let length = list.length;
    let lowBound = 0;
    let highBound = length - 1;
    let mid = Math.round((lowBound + highBound)/2);
    list = sort(list);

    while((highBound - lowBound) !== 1){
        if(list[mid] > search){
            highBound = mid;
        }else if(list[mid] < search){
            lowBound = mid;
        }else{
            return `Found at index ${mid}`;
        }
        mid = Math.round((lowBound + highBound)/2);
        console.log(`${mid}, ${lowBound}, ${highBound}`);
        console.log(`condition: ${(highBound - lowBound) !== 1}`);
    }

    return `Not Found!`;
};

console.time("linear-search");
console.log(linSearch(l, 90));
console.timeEnd("linear-search");

console.time("binary-search");
console.log(midSearch(l, 90));
console.timeEnd("binary-search");