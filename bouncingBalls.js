const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

function distance(x1, y1, x2, y2) {
    return Math.hypot(x2 - x1, y2 - y1);
}

function rotate(velocity, angle) {
    return {
        x: velocity.x * Math.cos(angle) - velocity.y * Math.sin(angle),
        y: velocity.x * Math.sin(angle) + velocity.y * Math.cos(angle)
    };
}

function resolveCollision(ball1, ball2) {
    const xVelocityDiff = ball1.dx - ball2.dx;
    const yVelocityDiff = ball1.dy - ball2.dy;

    const xDist = ball2.x - ball1.x;
    const yDist = ball2.y - ball1.y;

    if (xVelocityDiff * xDist + yVelocityDiff * yDist >= 0) {
        const angle = -Math.atan2(ball2.y - ball1.y, ball2.x - ball1.x);

        const m1 = ball1.mass;
        const m2 = ball2.mass;

        const u1 = rotate({ x: ball1.dx, y: ball1.dy }, angle);
        const u2 = rotate({ x: ball2.dx, y: ball2.dy }, angle);

        const v1 = {
            x: (u1.x * (m1 - m2)) / (m1 + m2) + (u2.x * 2 * m2) / (m1 + m2),
            y: u1.y
        };
        const v2 = {
            x: (u2.x * (m2 - m1)) / (m1 + m2) + (u1.x * 2 * m1) / (m1 + m2),
            y: u2.y
        };

        const finalVel1 = rotate(v1, -angle);
        const finalVel2 = rotate(v2, -angle);

        ball1.dx = finalVel1.x;
        ball1.dy = finalVel1.y;

        ball2.dx = finalVel2.x;
        ball2.dy = finalVel2.y;
    }
}

function randomColor() {
    return `hsl(${Math.random() * 360}, 70%, 50%)`;
}

class Ball {
    constructor(x, y, dx, dy, radius, color) {
        this.x = x;
        this.y = y;
        this.dx = dx;
        this.dy = dy;
        this.radius = radius;
        this.color = color;
        this.mass = radius ** 3;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }

    update() {
        this.x += this.dx;
        this.y += this.dy;

        if (this.x - this.radius <= 0 || this.x + this.radius >= canvas.width) {
            this.dx = -this.dx;
            this.x = Math.max(this.radius, Math.min(this.x, canvas.width - this.radius));
        }

        if (this.y - this.radius <= 0 || this.y + this.radius >= canvas.height) {
            this.dy = -this.dy;
            this.y = Math.max(this.radius, Math.min(this.y, canvas.height - this.radius));
        }

        this.draw();
    }
}

const balls = [];
for (let i = 0; i < 50; i++) {
    const radius = Math.random() * 20 + 10;
    const x = Math.random() * (canvas.width - radius * 2) + radius;
    const y = Math.random() * (canvas.height - radius * 2) + radius;
    const dx = (Math.random() - 0.5) * 4;
    const dy = (Math.random() - 0.5) * 4;
    const color = randomColor();
    balls.push(new Ball(x, y, dx, dy, radius, color));
}

function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) {
            if (distance(balls[i].x, balls[i].y, balls[j].x, balls[j].y) < balls[i].radius + balls[j].radius) {
                resolveCollision(balls[i], balls[j]);
            }
        }
    }

    balls.forEach(ball => ball.update());
}

animate();
