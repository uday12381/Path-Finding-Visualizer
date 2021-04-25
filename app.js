var H = 0,
    W = 0,
    rows = 0,
    cols = 0,
    srcNode = null,
    destNode = null,
    mainFlag = false;

function initialize() {
    H = document.getElementById("container").clientHeight;
    W = document.getElementById("container").clientWidth;
    let den = parseInt(Math.sqrt(2 * W));
    cols = Math.floor(W / den);
    rows = Math.floor(H / (cols));
    cols = den;
    const container = document.getElementById("container");
    container.style.setProperty('--grid-rows', rows);
    container.style.setProperty('--grid-cols', cols);

    for (let c = 0; c < (rows * cols); c++) {
        let cell = document.createElement("button");
        cell.setAttribute("id", "button" + (c + 1));
        container.appendChild(cell);
    }
    for (let c = 0; c < (rows * cols); c++) {
        const btn = document.getElementById("button" + (c + 1));
        btn.className = "unvisited";
        btn.addEventListener("click", function() {
            if (!mainFlag) {
                if (c + 1 != srcNode && c + 1 != destNode) {
                    if (btn.className == "wall") {
                        btn.className = "unvisited";
                    }
                    else {
                        btn.className = "wall";
                    }
                }
            }
        });
    }
    document.getElementById("show-button1").addEventListener("click", function () {
        if (!mainFlag) {
            let r = document.getElementById("src-r").value;
            let c = document.getElementById("src-c").value;

            if (!Number.isNaN(r) && !Number.isNaN(c) && r <= rows && r > 0 && c <= cols && c > 0) {
                --r;
                --c;
                const buttonId = r * cols + c + 1;
                if (buttonId == destNode && destNode != null) {
                    alert("Please choose different Source and Destination");
                    return;
                }
                if (srcNode != null) {
                    document.getElementById("button" + srcNode).className = "unvisited";
                }
                srcNode = buttonId;
                document.getElementById("button" + srcNode).className = "source";
            } else {
                alert("Please select rows and columns between " + rows + " " + cols);
            }
        }
    });
    document.getElementById("show-button2").addEventListener("click", function () {
        if (!mainFlag) {
            let r = document.getElementById("dest-r").value;
            let c = document.getElementById("dest-c").value;

            if (!Number.isNaN(r) && !Number.isNaN(c) && r <= rows && r > 0 && c <= cols && c > 0) {
                --r;
                --c;
                const buttonId = r * cols + c + 1;
                if (buttonId == srcNode && srcNode != null) {
                    alert("Please choose different Source and Destination");
                    return;
                }
                if (destNode != null) {
                    document.getElementById("button" + destNode).className = "unvisited";
                }
                destNode = buttonId;
                document.getElementById("button" + destNode).className = "destination";
            } else {
                alert("Please select rows and columns between " + rows + " " + cols);
            }
        }
    });

    document.getElementById("visualize").addEventListener("click", function () {
        if (!mainFlag) {
            let algorithm = document.getElementById("alg").value;
            if (srcNode === null || destNode === null) {
                alert("Please choose the source and the destination");
                return;
            }
            mainFlag = true;
            if (algorithm == 'dfs') {
                dfs_helper(srcNode, destNode);
            } else if (algorithm == 'bfs') {
                bfs_helper(srcNode, destNode);
            } else {
                bidirectionalBfsHelper(srcNode, destNode);
            }
            mainFlag = false;
        }
    });
        document.getElementById("clear-section").addEventListener("click", clearBoard);
}
initialize();

function clearBoard() {
    if (!mainFlag) {
        srcNode = null;
        destNode = null;
        for (let c = 0; c < (rows * cols); c++) {
            document.getElementById("button" + (c + 1)).className = "unvisited";
        }
    }
}

var dx = [0, 1, -1, 0];
var dy = [1, 0, 0, -1];

function delay(delayInms) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(2);
        }, delayInms);
    });
}

async function printPath(key, prev) {
    while (prev[key] != key) {
        await delay(50);
        document.getElementById("button" + (key + 1)).className = 'path';
        key = prev[key];

    }
}
async function bfs(src_row, src_col) {
    let q = [];
    q.push([src_row, src_col]);
    let prev = [];
    for (let i = 0; i < (rows * cols); i++) {
        prev.push(i);
    }
    while (q.length > 0) {
        let sz = q.length;
        await delay(140);
        for (let i = 0; i < sz; i++) {
            let top = q[0];
            q.shift();
            for (let j = 0; j < 4; j++) {
                let new_row = top[0] + dx[j];
                let new_col = top[1] + dy[j];
                if (new_row < rows && new_row >= 0 && new_col < cols && new_col >= 0) {
                    var temp = document.getElementById("button" + (new_row * cols + new_col + 1)).className;
                    if (temp == 'destination') {
                        prev[new_row * cols + new_col] = top[0] * cols + top[1];
                        printPath(prev[destNode - 1], prev);
                        return;
                    }
                    if (temp != 'unvisited') {
                        continue;
                    }

                    q.push([new_row, new_col]);
                    prev[new_row * cols + new_col] = top[0] * cols + top[1];
                    document.getElementById("button" + (new_row * cols + new_col + 1)).className = "visited";
                }
            }
        }
    }
}
async function bidirectionalBfs(src_row, src_col, dest_row, dest_col) {
    let front = [],
        back = [];
    front.push([src_row, src_col]);
    back.push([dest_row, dest_col]);
    let prev = [],
        prev2 = [];
    for (let i = 0; i < (rows * cols); i++) {
        prev2.push(i);
        prev.push(i);
    }
    while (front.length > 0 && back.length > 0) {
        let sz = front.length;
        await delay(140);
        for (let i = 0; i < sz; i++) {
            let top = front[0];
            front.shift();
            for (let j = 0; j < 4; j++) {
                let new_row = top[0] + dx[j];
                let new_col = top[1] + dy[j];
                if (new_row < rows && new_row >= 0 && new_col < cols && new_col >= 0) {
                    var temp = document.getElementById("button" + (new_row * cols + new_col + 1)).className;
                    if (temp == 'backvisited') {
                        prev[new_row * cols + new_col] = top[0] * cols + top[1];

                        printPath(new_row * cols + new_col, prev2);

                        printPath(new_row * cols + new_col, prev);
                        return;
                    }
                    if (temp != 'unvisited') {
                        continue;
                    }

                    front.push([new_row, new_col]);
                    prev[new_row * cols + new_col] = top[0] * cols + top[1];
                    document.getElementById("button" + (new_row * cols + new_col + 1)).className = "frontvisited";
                }
            }
        }
        sz = back.length;
        for (let i = 0; i < sz; i++) {
            let top = back[0];
            back.shift();
            for (let j = 0; j < 4; j++) {
                let new_row = top[0] + dx[j];
                let new_col = top[1] + dy[j];
                if (new_row < rows && new_row >= 0 && new_col < cols && new_col >= 0) {
                    let temp = document.getElementById("button" + (new_row * cols + new_col + 1)).className;
                    if (temp == 'frontvisited') {
                        prev2[new_row * cols + new_col] = top[0] * cols + top[1];
                        printPath(new_row * cols + new_col, prev);

                        printPath(new_row * cols + new_col, prev2);
                        return;
                    }
                    if (temp != 'unvisited') {
                        continue;
                    }

                    back.push([new_row, new_col]);
                    prev2[new_row * cols + new_col] = top[0] * cols + top[1];
                    document.getElementById("button" + (new_row * cols + new_col + 1)).className = "backvisited";
                }
            }
        }
    }
}
async function dfs(row, col) {
    if (document.getElementById("button" + (row * cols + col + 1)).className != 'source') {
        document.getElementById("button" + (row * cols + col + 1)).className = "visited";
    }

    await delay(30);
    for (let i = 0; i < dx.length; i++) {
        let new_row = row + dx[i];
        let new_col = col + dy[i];
        if (new_row < rows && new_row >= 0 && new_col < cols && new_col >= 0) {
            if (document.getElementById("button" + ((new_row * cols) + new_col + 1)).className == "unvisited" && dfs(new_row, new_col)) {
                return true;
            } else if (document.getElementById("button" + ((new_row * cols) + new_col + 1)).className == "destination") {
                return true;
            }
        }
    }
    return false;
}

function dfs_helper(src, dest) {
    --src;
    --dest;
    let src_row = Math.floor(src / cols),
        src_col = src % cols;
    let dest_row = Math.floor(dest / cols),
        dest_col = dest % cols;
    dfs(src_row, src_col, dest_row, dest_col);
}

function bfs_helper(src, dest) {
    --src;
    --dest;
    let src_row = Math.floor(src / cols),
        src_col = src % cols;
    bfs(src_row, src_col);
}

function bidirectionalBfsHelper(src, dest) {
    --src;
    --dest;
    let src_row = Math.floor(src / cols),
        src_col = src % cols;
    let dest_row = Math.floor(dest / cols),
        dest_col = dest % cols;
    bidirectionalBfs(src_row, src_col, dest_row, dest_col);
}