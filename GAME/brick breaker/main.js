const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

canvas.width = canvas.scrollWidth;
canvas.height = canvas.scrollHeight;

const bricks = [];

let ball = {
    x: canvas.width / 2 - 10,
    y: 400,
    radius: 20,
    color: 'green',
    vx: Math.random() * 5 + 1, // kecepatan awal pada sumbu x
    vy: 5 // kecepatan awal pada sumbu y
};

class Brick {
    constructor(x, y, width) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = 20;
        this.color = 'black';
    }
    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

class Paddle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 100;
        this.height = 20;
        this.color = 'blue';
        this.acc = 10;
        this.addEventListeners();
    }
    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
    addEventListeners() {
        window.addEventListener('keydown', e => {
            switch (e.keyCode) {
                case 65: // A key
                    this.x -= this.acc;
                    break;
                case 68: // D key
                    this.x += this.acc;
                    break;
            }
        });
    }
}

const row = 5;
const col = 5;
const gap = 10;
const widthBrick = (canvas.width / col) - gap;

for (let y = 0; y < row; y++) {
    for (let x = 0; x < col; x++) {
        bricks.push(new Brick((x * widthBrick) + gap, y * 30 + 30, widthBrick - gap));
    }
}

const paddle = new Paddle(canvas.width / 2 - 50, canvas.height - 30);

function detectCollision(ball, brick) {
    return (
        ball.x + ball.radius > brick.x &&
        ball.x - ball.radius < brick.x + brick.width &&
        ball.y + ball.radius > brick.y &&
        ball.y - ball.radius < brick.y + brick.height
    );
}

function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    paddle.draw();

    bricks.forEach((brick, index) => {
        brick.draw();
        if (detectCollision(ball, brick)) {
            ball.vy *= -1; // Memantulkan bola
            bricks.splice(index, 1); // Menghancurkan brick
        }
    });

    ball.x += ball.vx;
    ball.y += ball.vy;

    // Memantulkan bola saat mengenai paddle
    if (
        ball.y + ball.radius >= paddle.y &&
        ball.x + ball.radius > paddle.x &&
        ball.x - ball.radius < paddle.x + paddle.width
    ) {
        ball.vy *= -1;
    }

    // Memantulkan bola saat mengenai sisi atas canvas
    if (ball.y - ball.radius <= 0) {
        ball.vy *= -1;
    }

    // Memantulkan bola saat mengenai sisi kiri atau kanan canvas
    if (ball.x + ball.radius >= canvas.width || ball.x - ball.radius <= 0) {
        ball.vx *= -1;
    }

    ctx.beginPath();
    ctx.fillStyle = ball.color;
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
}

animate();
