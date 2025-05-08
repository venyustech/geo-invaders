import Grid from "./classes/Grid.js";
import Obstacle from "./classes/Obstacle.js";
import Particle from "./classes/Particle.js";
import Player from "./classes/Player.js";
import SoundEffects from "./classes/SoundEffects.js";
import Star from "./classes/Star.js";
import { GameState, NUMBER_STARS } from "./utils/constants.js";

const soundEffects = new SoundEffects();

const startScreen = document.querySelector(".start-screen");
const gameOverScreen = document.querySelector(".game-over");
const scoreUi = document.querySelector(".score-ui");
const scoreElement = scoreUi.querySelector(".score > span");
const levelElement = scoreUi.querySelector(".level > span");
const highElement = scoreUi.querySelector(".high > span");
const buttonPlay = document.querySelector(".button-play");
const buttonRestart = document.querySelector(".button-restart");

gameOverScreen.remove();

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
canvas.width = innerWidth;
canvas.height = innerHeight;
ctx.imageSmoothingEnabled = false;

let currentState = GameState.START;

const gameData = {
    score: 0,
    level: 1,
    high: 0,
};

const showGameData = () => {
    scoreElement.textContent = gameData.score;
    levelElement.textContent = gameData.level;
    highElement.textContent = gameData.high;
};

const incrementScore = (value) => {
    gameData.score += value;
    if (gameData.score > gameData.high) {
        gameData.high = gameData.score;
    }

    // Se chegar a 500 pontos, vence o jogo
    if (gameData.score >= 300 && currentState === GameState.PLAYING) {
        winGame();
    }
};

const incrementLevel = () => {
    gameData.level += 1;
};

const player = new Player(canvas.width, canvas.height);

const stars = [];
const playerProjectiles = [];
const invadersProjectiles = [];
const particles = [];
const obstacles = [];
const isWideScreen = () => window.innerWidth >= 1000;
const initObstacles = () => {
    if (!isWideScreen()) return;
    const x = canvas.width / 2 - 50;
    const y = canvas.height - 250;
    const offset = canvas.width * 0.15;
    const color = "crimson";

    obstacles.push(new Obstacle({ x: x - offset, y }, 100, 20, color));
    obstacles.push(new Obstacle({ x: x + offset, y }, 100, 20, color));
};

initObstacles();

const grid = new Grid(
    Math.round(Math.random() * 9 + 1),
    Math.round(Math.random() * 9 + 1)
);

const keys = {
    left: false,
    right: false,
};

let touchX = null;

canvas.addEventListener("touchstart", (e) => {
    touchX = e.touches[0].clientX;
    e.preventDefault();
});

canvas.addEventListener("touchmove", (e) => {
    const newX = e.touches[0].clientX;
    const dx = newX - touchX;

    if (dx > 10) {
        keys.right = true;
        keys.left = false;
    } else if (dx < -10) {
        keys.left = true;
        keys.right = false;
    }

    touchX = newX;
    e.preventDefault();
});

canvas.addEventListener("touchend", (e) => {
    keys.left = false;
    keys.right = false;
    e.preventDefault();
});

// 1) IDs de intervalo já declarados antes:
let invaderShootIntervalId;
let playerShootIntervalId;

// 2) Função única que inicia os tiros
function startIntervals() {
    invaderShootIntervalId = setInterval(() => {
        const invader = grid.getRandomInvader();
        if (invader) invader.shoot(invadersProjectiles);
    }, 1000);

    playerShootIntervalId = setInterval(() => {
        soundEffects.playShootSound();
        player.shoot(playerProjectiles);
    }, 500);
}

const generateStars = () => {
    for (let i = 0; i < NUMBER_STARS; i += 1) {
        stars.push(new Star(canvas.width, canvas.height));
    }
};

const drawStars = () => {
    stars.forEach((star) => {
        star.draw(ctx);
        star.update();
    });
};

const drawProjectiles = () => {
    [...playerProjectiles, ...invadersProjectiles].forEach((projectile) => {
        projectile.draw(ctx);
        projectile.update();
    });
};

const drawParticles = () => {
    particles.forEach((particle) => {
        particle.draw(ctx);
        particle.update();
    });
};

const drawObstacles = () => {
    obstacles.forEach((obstacle) => obstacle.draw(ctx));
};

const clearProjectiles = () => {
    playerProjectiles.forEach((p, i) => {
        if (p.position.y <= 0) playerProjectiles.splice(i, 1);
    });
    invadersProjectiles.forEach((p, i) => {
        if (p.position.y >= canvas.height) invadersProjectiles.splice(i, 1);
    });
};

const clearParticles = () => {
    particles.forEach((p, i) => {
        if (p.opacity <= 0) particles.splice(i, 1);
    });
};

const createExplosion = (position, size, color) => {
    for (let i = 0; i < size; i += 1) {
        particles.push(
            new Particle(
                { x: position.x, y: position.y },
                { x: (Math.random() - 0.5) * 1.5, y: (Math.random() - 0.5) * 1.5 },
                2,
                color
            )
        );
    }
};

const checkShootInvaders = () => {
    grid.invaders.forEach((invader, ii) => {
        playerProjectiles.some((proj, pi) => {
            if (invader.hit(proj)) {
                soundEffects.playHitSound();

                createExplosion(
                    {
                        x: invader.position.x + invader.width / 2,
                        y: invader.position.y + invader.height / 2,
                    },
                    10,
                    "#941CFF"
                );

                // usa o scoreValue definido na instância
                incrementScore(invader.scoreValue);

                grid.invaders.splice(ii, 1);
                playerProjectiles.splice(pi, 1);
                return true;
            }
            return false;
        });
    });
};

const showGameOverScreen = () => {
    document.body.append(gameOverScreen);
    gameOverScreen.classList.add("zoom-animation");
};

function gameOver() {
    // Remove a mensagem de vitória, se existir
    const winMsg = gameOverScreen.querySelector(".win-message");
    if (winMsg) {
        winMsg.remove();
    }

    // Cria explosões na posição do jogador
    createExplosion(
        {
            x: player.position.x + player.width / 2,
            y: player.position.y + player.height / 2,
        },
        10,
        "white"
    );
    createExplosion(
        {
            x: player.position.x + player.width / 2,
            y: player.position.y + player.height / 2,
        },
        5,
        "#4D9BE6"
    );
    createExplosion(
        {
            x: player.position.x + player.width / 2,
            y: player.position.y + player.height / 2,
        },
        5,
        "crimson"
    );

    player.alive = false;
    currentState = GameState.GAME_OVER;

    // Para todos os intervalos de tiro
    clearInterval(invaderShootIntervalId);
    clearInterval(playerShootIntervalId);

    // Exibe a tela de Game Over
    showGameOverScreen();
}

const checkShootPlayer = () => {
    invadersProjectiles.some((proj, i) => {
        if (player.hit(proj)) {
            soundEffects.playExplosionSound();
            invadersProjectiles.splice(i, 1);
            gameOver();
            return true;
        }
        return false;
    });
};

const checkShootObstacles = () => {
    obstacles.forEach((obs, oi) => {
        playerProjectiles.some((proj, pi) => {
            if (obs.hit(proj)) {
                playerProjectiles.splice(pi, 1);
                return true;
            }
            return false;
        });
        invadersProjectiles.some((proj, i) => {
            if (obs.hit(proj)) {
                invadersProjectiles.splice(i, 1);
                return true;
            }
            return false;
        });
    });
};

const checkInvadersCollidedObstacles = () => {
    obstacles.forEach((obs, oi) => {
        grid.invaders.some((inv) => {
            if (inv.collided(obs)) {
                obstacles.splice(oi, 1);
                return true;
            }
            return false;
        });
    });
};

const checkPlayerCollidedInvaders = () => {
    grid.invaders.some((inv) => {
        if (
            inv.position.x >= player.position.x &&
            inv.position.x <= player.position.x + player.width &&
            inv.position.y >= player.position.y
        ) {
            gameOver();
            return true;
        }
        return false;
    });
};

const spawnGrid = () => {
    if (grid.invaders.length === 0) {
        soundEffects.playNextLevelSound();
        grid.rows = Math.round(Math.random() * 9 + 1);
        grid.cols = Math.round(Math.random() * 9 + 1);
        grid.restart();
        incrementLevel();
        if (obstacles.length === 0) initObstacles();
    }
};

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawStars();

    if (currentState === GameState.PLAYING) {
        showGameData();
        spawnGrid();
        drawProjectiles();
        drawParticles();
        drawObstacles();
        clearProjectiles();
        clearParticles();
        checkShootInvaders();
        checkShootPlayer();
        checkShootObstacles();
        checkInvadersCollidedObstacles();
        checkPlayerCollidedInvaders();

        grid.draw(ctx);
        grid.update(player.alive);

        ctx.save();
        ctx.translate(
            player.position.x + player.width / 2,
            player.position.y + player.height / 2
        );
        if (keys.left && player.position.x >= 0) {
            player.moveLeft();
            ctx.rotate(-0.15);
        }
        if (keys.right && player.position.x <= canvas.width - player.width) {
            player.moveRight();
            ctx.rotate(0.15);
        }
        ctx.translate(
            -player.position.x - player.width / 2,
            -player.position.y - player.height / 2
        );
        player.draw(ctx);
        ctx.restore();
    }

    if (currentState === GameState.GAME_OVER) {
        checkShootObstacles();
        drawProjectiles();
        drawParticles();
        drawObstacles();
        clearProjectiles();
        clearParticles();
        grid.draw(ctx);
        grid.update(player.alive);
    }

    requestAnimationFrame(gameLoop);
}

function winGame() {
    // Para os tiros automáticos
    clearInterval(invaderShootIntervalId);
    clearInterval(playerShootIntervalId);

    currentState = GameState.GAME_OVER;

    // Customiza o título
    const titleEl = gameOverScreen.querySelector("h1");
    titleEl.textContent = "Ain feliz aniversariozinhown!";

    // Cria ou atualiza parágrafo com mensagem especial
    let msgEl = gameOverScreen.querySelector(".win-message");
    if (!msgEl) {
        msgEl = document.createElement("p");
        msgEl.className = "win-message";
        msgEl.style.margin = "1rem 0";
        titleEl.insertAdjacentElement("afterend", msgEl);
    }
    msgEl.textContent = "Que voce tenha sorrido enquanto joga ❤️";

    // Ajusta texto do botão para reiniciar
    const btnRestart = gameOverScreen.querySelector(".button-restart");
    btnRestart.textContent = "Jogar de Novo";

    // Exibe a tela de fim de jogo
    document.body.append(gameOverScreen);
}
addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();
    if (key === "a" || key === "arrowleft") keys.left = true;
    if (key === "d" || key === "arrowright") keys.right = true;
});

addEventListener("keyup", (event) => {
    const key = event.key.toLowerCase();
    if (key === "a" || key === "arrowleft") keys.left = false;
    if (key === "d" || key === "arrowright") keys.right = false;
});

buttonPlay.addEventListener("click", () => {
    startScreen.remove();
    scoreUi.style.display = "block";
    currentState = GameState.PLAYING;

    startIntervals();
});

const restartGame = () => {
    // Restaura estado e variáveis
    currentState = GameState.PLAYING;
    player.alive = true;
    grid.invaders.length = 0;
    grid.invadersVelocity = 1;
    invadersProjectiles.length = 0;
    playerProjectiles.length = 0;
    gameData.score = 0;
    gameData.level = 1;

    // Restaura texto e remove tela de game over
    gameOverScreen.querySelector("h1").textContent = "Perdeu, viado";
    gameOverScreen.querySelector(".button-restart").textContent = "Tenta de novo";
    gameOverScreen.remove();

    // **Aqui**: reinicia ambos os intervalos
    startIntervals();
};

window.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("introModal");
    const startBtn = document.getElementById("startGameBtn");
    const buttonPlay = document.querySelector(".button-play");

    startBtn.addEventListener("click", () => {
        modal.remove(); // fecha o modal
        buttonPlay.click(); // inicia o jogo
    });
});

buttonRestart.addEventListener("click", restartGame);

generateStars();
gameLoop();
