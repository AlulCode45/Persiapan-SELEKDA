const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')

canvas.width = canvas.scrollWidth
canvas.height = canvas.scrollHeight

let gameTime = 0

const projectiles = []
const enemies = []

class Projectile {
    constructor(posX, posY) {
        this.posX = posX
        this.posY = posY
        this.width = 20
        this.height = 20
        this.projectileImage = new Image()
        this.projectileImage.src = './Spaceship-shooter-gamekit/spritesheets/laser-bolts.png'
        this.f_col = 0
        this.f_row = 1
        this.f_width = 15
        this.f_height = 15
        this.speed = 5
    }
    draw() {
        ctx.drawImage(this.projectileImage, this.f_col * this.f_width, this.f_row * this.f_height, this.f_width, this.f_height, this.posX + 10, this.posY, this.width, this.height)
    }
    update() {
        this.posY -= this.speed
        if (this.posY < 0) {
            projectiles.splice(0, 1)
        }
    }
}

class Enemy {
    constructor(posX, posY, enemyType = 0) {
        this.posX = posX
        this.posY = posY
        this.width = (enemyType == 0 ? 35 : (enemyType == 1 ? 50 : (enemyType == 2 ? 80 : 0)))
        this.height = (enemyType == 0 ? 35 : (enemyType == 1 ? 50 : (enemyType == 2 ? 80 : 0)))
        this.enemyType = ['small', 'medium', 'big']
        this.enemyTypeActive = enemyType
        this.enemyImage = new Image()
        this.enemyImage.src = `./Spaceship-shooter-gamekit/spritesheets/enemy-${this.enemyType[this.enemyTypeActive]}.png`
        this.f_col = 0
        this.f_row = 0
        this.f_width = (this.enemyTypeActive == 0 ? 16 : (this.enemyTypeActive == 1 ? 32 : (this.enemyTypeActive == 2 ? 32 : 0)))
        this.f_height = (this.enemyTypeActive == 0 || this.enemyTypeActive == 1 ? 16 : 32)
        this.health = 100
        this.speed = Math.random() * 2 + 1
        this.velX = 0
        this.velY = 0

        this.explosionImage = new Image()
        this.explosionImage.src = './Spaceship-shooter-gamekit/spritesheets/explosion.png'
        this.fEx_col = 0
        this.fEx_row = 0
        this.fEx_width = 16
        this.fEx_height = 16
        this.isDestroyed = false
        this.destructionFrame = 0
    }
    draw() {
        if (this.isDestroyed) {
            this.drawExplosion()
        } else {
            ctx.drawImage(this.enemyImage, this.f_col * this.f_width, this.f_row * this.f_height, this.f_width, this.f_height, this.posX, this.posY, this.width, this.height)
            ctx.fillStyle = 'white'
            ctx.font = '20px arial'
            ctx.fillText(this.health, this.posX + 5, this.posY)
        }
    }
    update() {
        if (!this.isDestroyed) {
            this.posY += this.speed
            if (gameTime % 50 == 0) {
                let sign = Math.random() < 0.5 ? -1 : 1;
                if (this.posX > this.width && this.posX < canvas.width) {
                    this.velX = (Math.random() * 2) * sign;
                }
            }
            this.posX += this.velX

            for (let i = 0; i < projectiles.length; i++) {
                const projectile = projectiles[i];
                if (collision(projectile, this)) {
                    this.health -= 10
                    projectiles.splice(i, 1)
                    if (this.health <= 0) {
                        this.isDestroyed = true
                        this.destructionFrame = gameTime
                    }
                }
            }
        } else {
            // Update destruction animation
            if (gameTime - this.destructionFrame > 30) { // Adjust the time for the explosion animation
                const enemyIndex = enemies.indexOf(this);
                if (enemyIndex > -1) {
                    enemies.splice(enemyIndex, 1);
                }
            }
        }
    }
    drawExplosion() {
        // Draw explosion animation
        const explosionDuration = 30; // Adjust the duration for the explosion animation
        const frame = Math.floor((gameTime - this.destructionFrame) / (explosionDuration / 4));
        this.fEx_col = frame % 5; // Assuming there are 4 frames in the explosion animation
        ctx.drawImage(this.explosionImage, this.fEx_col * this.fEx_width, this.fEx_row * this.fEx_height, this.fEx_width, this.fEx_height, this.posX, this.posY, this.width, this.height)
    }
}

class Player {
    constructor() {
        this.width = 40
        this.height = 60
        this.posX = canvas.width / 2 - this.width / 2
        this.posY = canvas.height - this.height - 50
        this.playerImage = new Image()
        this.playerImage.src = './Spaceship-shooter-gamekit/spritesheets/ship.png' // Memindahkan penugasan src ke konstruktor
        this.f_col = 0
        this.f_row = 0
        this.f_width = 15
        this.f_height = 25
        this.time = 0
        this.health = 3
        this.speed = 3
        this.control = {
            LEFT: false,
            RIGHT: false,
            TOP: false,
            BOTTOM: false
        }
        this.controller()
    }
    draw() {
        ctx.drawImage(this.playerImage, this.f_col * this.f_width, this.f_row * this.f_height, 15, 25, this.posX, this.posY, this.width, this.height)
    }
    update() {
        if (this.control.LEFT) {
            this.posX -= this.speed
        }
        if (this.control.TOP) {
            this.posY -= this.speed
        }
        if (this.control.RIGHT) {
            this.posX += this.speed
        }
        if (this.control.BOTTOM) {
            this.posY += this.speed
        }
    }
    controller() {
        window.addEventListener('keydown', e => {
            switch (e.keyCode) {
                case 65:
                    //kiri
                    this.control.LEFT = true
                    break;
                case 87:
                    //atas
                    this.control.TOP = true
                    break;
                case 68:
                    //kanan
                    this.control.RIGHT = true
                    break;
                case 83:
                    //bawah
                    this.control.BOTTOM = true
                    break;
                case 32:
                    //spasi
                    projectiles.push(new Projectile(this.posX, this.posY - 20))
                    break;
                default:
                    break;
            }
        })
        window.addEventListener('keyup', e => {
            switch (e.keyCode) {
                case 65:
                    //kiri
                    this.control.LEFT = false
                    break;
                case 87:
                    //atas
                    this.control.TOP = false
                    break;
                case 68:
                    //kanan
                    this.control.RIGHT = false
                    break;
                case 83:
                    //bawah
                    this.control.BOTTOM = false
                    break;
                default:
                    break;
            }
        })
    }
}

function drawProjectiles() {
    projectiles.forEach(projectile => {
        projectile.draw()
        projectile.update()
    })
}
function drawEnemies() {
    enemies.forEach(enemy => {
        enemy.draw();
        enemy.update();
    })
}

function collision(box1, box2) {
    if (
        box1.posX < box2.posX + box2.width &&
        box1.posX + box1.width > box2.posX &&
        box1.posY < box2.posY + box2.height &&
        box1.posY + box1.height > box2.posY
    ) {
        return true;
    }
    return false;
}

const player = new Player()

const backsound = new Audio()
// backsound.src = './spaceship shooter music/spaceship shooter .wav'
// backsound.loop = true
// backsound.play()

function animate() {
    requestAnimationFrame(animate)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    player.draw()
    player.update()
    drawProjectiles()
    drawEnemies()

    if (gameTime % 100 == 0) {
        enemies.push(new Enemy(Math.random() * (canvas.width - 80), 0, Math.floor(Math.random() * 2) + 1));
    }
    gameTime++
}

animate()
