/*jslint bitwise: true */
/*jshint esversion: 8 */

var H = 0,
    W = 0,
    rows = 0,
    cols = 0,
    srcNode = null,
    destNode = null,
    isMouseDown = false,
    isSrc = false,
    isDest = false,
    doneExecution = false,
    buttons = [],
    visualizeButton,
    delayInms = 100,
    visitedColor = "#eefa94",
    visited = "visited",
    themeColor = "#d5cbe7",
    navigationBar,
    algorithm = "BFS";
class Node {
    constructor(val) {
        this.val = val;
        this.next = null;
    }
}
class Queue {
    constructor() {
        this.front = null;
        this.rear = null;
        this.sz = 0;
    }
    push(val) {
        if (this.front === null) {
            this.front = this.rear = new Node(val);
        } else {
            this.rear.next = new Node(val);
            this.rear = this.rear.next;
        }
        this.sz++;
    }
    pop() {
        let ret = this.front.val;
        this.front = this.front.next;
        this.sz--;
        return ret;
    }
    empty() {
        return this.front === null;
    }
    size() {
        return this.sz;
    }
}

function initialize() {
    var temp1 = document.body.offsetHeight;
    var temp2 = document.getElementById("navigationBar").offsetHeight;
    const container = document.getElementById("container");

    H = temp1 - temp2 - 20;
    W = document.body.offsetWidth - 20;

    container.style.height = H + "px";
    let den = parseInt(Math.sqrt(2 * W));
    cols = Math.floor(W / den);
    rows = Math.floor(H / cols);
    cols = den;
    srcNode = 1;
    destNode = rows * cols;

    navigationBar = document.getElementById("navigationBar");

    container.style.setProperty("--grid-rows", rows);
    container.style.setProperty("--grid-cols", cols);
    buttons.push([]);

    visualizeButton = document.getElementById("visualize");

    for (let c = 1; c <= rows * cols; c++) {
        let cell = document.createElement("button");
        cell.setAttribute("id", "button" + c);
        cell.style.setProperty("cursor", "default");
        container.appendChild(cell);
        buttons.push(cell);
    }
    for (let c = 1; c <= rows * cols; c++) {
        const btn = buttons[c];
        btn.className = "unvisited";
        btn.addEventListener("click", function () {
            if (doneExecution) {
                if (c != srcNode && c != destNode) {
                    if (btn.className == "wall") {
                        btn.className = "unvisited";
                    } else {
                        btn.className = "wall";
                    }
                }
            }
        });
        btn.addEventListener("mousedown", function () {
            isMouseDown = true;
            if (btn.className == "source") {
                isSrc = true;
            } else if (btn.className == "destination") {
                isDest = true;
            } else {
                btn.className = btn.className === "unvisited" ? "wall" : "unvisited";
            }
        });
        btn.addEventListener("mouseup", function () {
            isMouseDown = isSrc = isDest = false;
            if (doneExecution) {
                clearPath();
                visualizeButton.click();
            }
        });
        btn.addEventListener("mouseover", function () {
            if (isMouseDown) {
                if (isSrc) {
                    if (btn.className != "destination") {
                        buttons[srcNode].className = "unvisited";
                        btn.className = "source";
                        srcNode = parseInt(btn.id.substring(6));
                        if (doneExecution) {
                            clearPath();
                            visualizeButton.click();
                        }
                    }
                } else if (isDest) {
                    if (btn.className != "source") {
                        buttons[destNode].className = "unvisited";
                        btn.className = "destination";
                        destNode = parseInt(btn.id.substring(6));
                        if (doneExecution) {
                            clearPath();
                            visualizeButton.click();
                        }
                    }
                } else {
                    if (btn.className != "source" && btn.className != "destination") {
                        if (btn.className == "wall") {
                            btn.className = "unvisited";
                            btn.style.backgroundColor = "white";
                        } else {
                            btn.className = "wall";
                            btn.style.backgroundColor = "black";
                        }
                    }
                }
            }
        });

    }

    document.getElementById("button" + srcNode).className = "source";
    document.getElementById("button" + destNode).className = "destination";

    $(document).ready(function () {
        $(".dropdown-menu a").click(function () {
            $("#options").text($(this).text());
            algorithm = $(this).text();
        });
    });

    visualizeButton.addEventListener("click", async function () {
        if (algorithm == "DFS") {
            await dfs_helper(srcNode, destNode);
        } else if (algorithm == "BFS") {
            await bfs_helper(srcNode, destNode);
        } else {
            await bidirectionalBfsHelper(srcNode, destNode);
        }
        color_nodes();
    });
    const rangebar = document.getElementById("speedRange");
    rangebar.setAttribute("min", "0");
    rangebar.setAttribute("max", "60");
    rangebar.setAttribute("value", "30");
    rangebar.addEventListener("change", function () {
        delayInms = (80 - this.value) * 3;
    });

    document.getElementById("vis-color").setAttribute("value", "#eefa94");
    document.getElementById("vis-color").addEventListener("change", function () {
        if (doneExecution) {
            visitedColor = this.value;
        }
    });
    document.getElementById("theme-color").setAttribute("value", "#d5cbe7");

    document.getElementById("theme-color").addEventListener("change", function () {
        if (doneExecution) {
            themeColor = this.value;
            navigationBar.style.backgroundColor = themeColor;
            let col = parseInt("0x" + themeColor.substring(1)) ^ (0xffffff);
            col = col.toString(16);
            navigationBar.style.color = ("#" + col + ("0".repeat(6 - col.length)));
        }
    });

    document.getElementById("clear-board").addEventListener("click", clearBoard);
    document.getElementById("clear-path").addEventListener("click", clearPath);
}

initialize();


function clearBoard() {
    if (doneExecution) {
        buttons[srcNode].className = "source";
        buttons[destNode].className = "destination";
        for (let c = 1; c <= rows * cols; c++) {
            const btn = buttons[c];
            if (btn.className != "source" && btn.className != "destination") {
                btn.className = "unvisited";
                btn.style.backgroundColor = "white";
            }

        }
    }
}

function clearPath() {
    if (doneExecution) {
        for (let c = 1; c <= rows * cols; c++) {
            const btn = buttons[c];
            if (btn.className != "wall" && btn.className != "source" && btn.className != "destination") {
                btn.className = "unvisited";
                btn.style.backgroundColor = "white";
            }
        }
    }
}

var dx = [0, 1, -1, 0];
var dy = [1, 0, 0, -1];

async function printPath(key, prev) {
    while (prev[key] != key) {
        if (!doneExecution) {
            let promise = new Promise((resolve) => {
                setTimeout(() => resolve("done!"), delayInms);
            });

            await promise;
        }
        buttons[key + 1].className = "path";
        key = prev[key];
    }
}
async function bfs(src_row, src_col) {
    let q = new Queue();
    q.push([src_row, src_col]);

    let prev = [];
    for (let i = 0; i < (rows * cols); i++) {
        prev.push(i);
    }
    while (!q.empty()) {
        let sz = q.size();

        if (!doneExecution) {
            let promise = new Promise((resolve) => {
                setTimeout(() => resolve(""), delayInms);
            });

            await promise;
        }
        for (let i = 0; i < sz; i++) {
            let top = q.pop();
            for (let j = 0; j < 4; j++) {
                let new_row = top[0] + dx[j];
                let new_col = top[1] + dy[j];
                if (new_row < rows && new_row >= 0 && new_col < cols && new_col >= 0) {

                    var temp = buttons[new_row * cols + new_col + 1].className;

                    if (temp == "destination") {
                        prev[new_row * cols + new_col] = top[0] * cols + top[1];

                        await printPath(prev[destNode - 1], prev);
                        return;
                    }
                    if (temp != "unvisited") {
                        continue;
                    }

                    q.push([new_row, new_col]);
                    prev[new_row * cols + new_col] = top[0] * cols + top[1];
                    buttons[new_row * cols + new_col + 1].className = visited;
                }
            }
        }
    }
}
async function bidirectionalBfs(src_row, src_col, dest_row, dest_col) {
    let front = new Queue(),
        back = new Queue();
    front.push([src_row, src_col]);
    back.push([dest_row, dest_col]);
    let prev = [],
        prev2 = [];
    for (let i = 0; i < (rows * cols); i++) {
        prev2.push(i);
        prev.push(i);
    }
    while (front.size() > 0 && back.size() > 0) {
        let sz = front.size();

        if (!doneExecution) {
            let promise = new Promise((resolve) => {
                setTimeout(() => resolve(""), delayInms);
            });

            await promise;
        }
        for (let i = 0; i < sz; i++) {
            let top = front.pop();
            for (let j = 0; j < 4; j++) {
                let new_row = top[0] + dx[j];
                let new_col = top[1] + dy[j];
                if (new_row < rows && new_row >= 0 && new_col < cols && new_col >= 0) {
                    let temp = buttons[new_row * cols + new_col + 1].className;
                    if (temp == "backvisited") {
                        prev[new_row * cols + new_col] = top[0] * cols + top[1];

                        printPath(new_row * cols + new_col, prev2);

                        await printPath(new_row * cols + new_col, prev);

                        return;
                    }
                    if (temp != "unvisited") {
                        continue;
                    }

                    front.push([new_row, new_col]);
                    prev[new_row * cols + new_col] = top[0] * cols + top[1];
                    buttons[new_row * cols + new_col + 1].className = "frontvisited";
                }
            }
        }
        sz = back.size();
        for (let i = 0; i < sz; i++) {
            let top = back.pop();
            for (let j = 0; j < 4; j++) {
                let new_row = top[0] + dx[j];
                let new_col = top[1] + dy[j];
                if (new_row < rows && new_row >= 0 && new_col < cols && new_col >= 0) {
                    let temp = buttons[new_row * cols + new_col + 1].className;
                    if (temp == "frontvisited") {
                        prev2[new_row * cols + new_col] = top[0] * cols + top[1];
                        printPath(new_row * cols + new_col, prev);

                        await printPath(new_row * cols + new_col, prev2);
                        return;
                    }
                    if (temp != "unvisited") {
                        continue;
                    }

                    back.push([new_row, new_col]);
                    prev2[new_row * cols + new_col] = top[0] * cols + top[1];
                    buttons[new_row * cols + new_col + 1].className = "backvisited";
                }
            }
        }
    }
}
async function dfs(row, col) {
    let stack = [];
    stack.push([row, col, 3]);

    while (stack.length > 0) {
        let top = stack.pop();
        let i = top[2];

        if (!doneExecution) {
            let promise = new Promise((resolve) => {
                setTimeout(() => resolve(""), delayInms / 7);
            });

            await promise;
        }
        if (top[2] >= 0) {
            top[2]--;
            stack.push(top);
        } else {
            if (buttons[top[0] * cols + top[1] + 1].className != "source") {
                buttons[top[0] * cols + top[1] + 1].className = "unvisited";
            }
            continue;
        }
        let new_row = top[0] + dx[i],
            new_col = top[1] + dy[i];
        if (new_row < rows && new_row >= 0 && new_col < cols && new_col >= 0) {
            if (buttons[new_row * cols + new_col + 1].className == "unvisited") {
                buttons[new_row * cols + new_col + 1].className = visited;
                stack.push([new_row, new_col, 3]);
            } else if (buttons[new_row * cols + new_col + 1].className == "destination") {
                break;
            }
        }
    }
}

function color_nodes() {
    let color_copy = visitedColor;
    for (let i = 1; i <= rows * cols; i++) {
        let name = buttons[i].className;
        if (name == visited || name == "frontvisited" || name == "backvisited") {
            buttons[i].className = visited;
            buttons[i].style.backgroundColor = color_copy;
        } else if (name == "unvisited") {
            buttons[i].style.backgroundColor = "white";
        } else if (name == "path") {
            buttons[i].style.backgroundColor = themeColor;
        } else if (name == "wall") {
            buttons[i].style.backgroundColor = "black";
        } else if (name == "source") {
            buttons[i].style.backgroundColor = "#71c7b3";
        } else if (name == "destination") {
            buttons[i].style.backgroundColor = "#e36f7d";
        }
    }
    visited = "newVisited";
}
async function dfs_helper(src, dest) {
    --src;
    --dest;
    let src_row = Math.floor(src / cols),
        src_col = src % cols;

    await dfs(src_row, src_col);
    if (!doneExecution) {
        for (let i = 1; i <= rows * cols; i++) {
            buttons[i].style.animationDuration = "0s";
        }
        doneExecution = true;
    }
}

async function bfs_helper(src, dest) {
    --src;
    --dest;
    let src_row = Math.floor(src / cols),
        src_col = src % cols;

    await bfs(src_row, src_col);
    if (!doneExecution) {
        for (let i = 1; i <= rows * cols; i++) {
            buttons[i].style.animationDuration = "0s";
        }
        doneExecution = true;
    }
}

async function bidirectionalBfsHelper(src, dest) {
    --src;
    --dest;
    let src_row = Math.floor(src / cols),
        src_col = src % cols;
    let dest_row = Math.floor(dest / cols),
        dest_col = dest % cols;

    await bidirectionalBfs(src_row, src_col, dest_row, dest_col);
    if (!doneExecution) {
        for (let i = 1; i <= rows * cols; i++) {
            buttons[i].style.animationDuration = "0s";
        }
        doneExecution = true;
    }
}
