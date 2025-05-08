// ----- classes/Invader.js -----
import { PATH_INVADER_IMAGE } from "../utils/constants.js";
import Projectile from "./Projectile.js";

/**
 * Classe Invader: gerencia o invasor, sua imagem variante e pontuação.
 */
export default class Invader {
    /**
     * @param {{ x: number, y: number }} position - posição inicial
     * @param {number} velocity - velocidade de movimento (pixels por frame)
     */
    constructor(position, velocity) {
        this.position = { x: position.x, y: position.y };
        this.scale = 0.8;
        this.width = 50 * this.scale;
        this.height = 37 * this.scale;
        this.velocity = velocity;

        // Sorteia variante de sprite (1, 2 ou 3)
        const variant = Math.floor(Math.random() * 3) + 1;
        this.scoreValue = variant * 10; // 10, 20 ou 30 pontos

        // Base do caminho: remove extensão .png
        const basePath = PATH_INVADER_IMAGE.replace(/\.png$/i, "");
        // Carrega a imagem correspondente
        this.image = this.getImage(`${basePath}${variant}.png`);
    }

    /** Carrega e retorna uma imagem a partir do path informado */
    getImage(path) {
        const img = new Image();
        img.src = path;
        return img;
    }

    /** Move o invasor para a direita */
    moveRight() {
        this.position.x += this.velocity;
    }

    /** Move o invasor para a esquerda */
    moveLeft() {
        this.position.x -= this.velocity;
    }

    /** Desce o invasor em uma linha */
    moveDown() {
        this.position.y += this.height;
    }

    /** Incrementa a velocidade com um fator de boost */
    incrementVelocity(boost) {
        this.velocity += boost;
    }

    /** Desenha o invasor no contexto do canvas */
    draw(ctx) {
        if (this.image.complete) {
            ctx.drawImage(
                this.image,
                this.position.x,
                this.position.y,
                this.width,
                this.height
            );
        }
    }

    /** Atualiza a posição e redesenha o invasor */
    update(ctx) {
        // O Grid controla quando chamar moveRight/moveLeft/moveDown
        this.draw(ctx);
    }

    /** Cria um projétil para este invasor */
    shoot(projectiles) {
        projectiles.push(
            new Projectile(
                {
                    x: this.position.x + this.width / 2 - 2,
                    y: this.position.y + this.height,
                },
                10
            )
        );
    }

    /** Verifica colisão de projétil do jogador */
    hit(projectile) {
        return (
            projectile.position.x >= this.position.x &&
            projectile.position.x <= this.position.x + this.width &&
            projectile.position.y >= this.position.y &&
            projectile.position.y <= this.position.y + this.height
        );
    }

    /** Verifica colisão com obstáculo */
    collided(obstacle) {
        return (
            (obstacle.position.x >= this.position.x &&
                obstacle.position.x <= this.position.x + this.width &&
                obstacle.position.y >= this.position.y &&
                obstacle.position.y <= this.position.y + this.height) ||
            (obstacle.position.x + obstacle.width >= this.position.x &&
                obstacle.position.x <= this.position.x &&
                obstacle.position.y >= this.position.y &&
                obstacle.position.y <= this.position.y + this.height)
        );
    }
}
