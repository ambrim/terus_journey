import { Character } from "../character.js";
import { Gems } from "../gems.js";
import { Camera } from "../camera.js";
import player1WinImg from '../../media/p1wins.png';
import player2WinImg from '../../media/p2wins.png';

declare var require: any

export class Scene
{
    readonly characters: Character[]
    readonly gems: Gems[]
    // readonly gemLocations: number[][]
    readonly camera: Camera
    gameover: boolean
    gemsSent: boolean = false;

    time: number;

    constructor() {

        this.time = 0;
        this.gameover = false;
        this.characters = new Array(2);
        this.gems = new Array(10);
        for(let i=0; i < this.characters.length; i++)
        {
            const center: number[] = [
                0.0,
                0.0,
                0.0
            ];

            const radius: number = 1.0;

            const color: number[] = [
                0.3 + 0.7 * Math.random(),
                0.3 + 0.7 * Math.random(),
                0.3 + 0.7 * Math.random()
            ];

            this.characters[i] = new Character(center);
        }
        for(let i=0; i < this.gems.length; i++)
        {
            const center: number[] = [
                0.0,
                0.0,
                0.0
            ];

            this.gems[i] = new Gems(center);
        }


        this.camera = new Camera([0.0, -10.0, 0.0]);
    }

    set(renderData: RenderData)
    {
        // Update characters
        this.characters[0].pos[0] = renderData.player1!.pos[0];
        this.characters[0].pos[1] = renderData.player1!.pos[1];
        this.characters[0].pos[2] = renderData.player1!.pos[2];
        this.characters[0].facing = renderData.player1!.facing;
        this.characters[0].score = renderData.player1!.score;
        this.characters[1].pos[0] = renderData.player2!.pos[0];
        this.characters[1].pos[1] = renderData.player2!.pos[1];
        this.characters[1].pos[2] = renderData.player2!.pos[2];
        this.characters[1].facing = renderData.player2!.facing;
        this.characters[1].score = renderData.player2!.score;
        this.time = renderData.time!;
        // Update gems locations only first time
        if (!this.gemsSent) {
            for (let i = 0; i < 3; i++) {
                this.gems[0].pos[i] = renderData.gem1!.pos[i];
                this.gems[1].pos[i] = renderData.gem2!.pos[i];
                this.gems[2].pos[i] = renderData.gem3!.pos[i];
                this.gems[3].pos[i] = renderData.gem4!.pos[i];
                this.gems[4].pos[i] = renderData.gem5!.pos[i];
                this.gems[5].pos[i] = renderData.gem6!.pos[i];
                this.gems[6].pos[i] = renderData.gem7!.pos[i];
                this.gems[7].pos[i] = renderData.gem8!.pos[i];
                this.gems[8].pos[i] = renderData.gem9!.pos[i];
                this.gems[9].pos[i] = renderData.gem10!.pos[i];
            }
        }
        if (!this.gems[0].collected) {
            this.gems[0].collected = renderData.gem1!.collected;
            if (this.gems[0].collected) {
                const gemCollected = require('../../media/sounds/hit_gem.wav');
                var audioGem = new Audio(gemCollected);
                audioGem.play();
            }
        }
        if (!this.gems[1].collected) {
            this.gems[1].collected = renderData.gem2!.collected;
            if (this.gems[1].collected) {
                const gemCollected = require('../../media/sounds/hit_gem.wav');
                var audioGem = new Audio(gemCollected);
                audioGem.play();
            }
        }
        if (!this.gems[2].collected) {
            this.gems[2].collected = renderData.gem3!.collected;
            if (this.gems[2].collected) {
                const gemCollected = require('../../media/sounds/hit_gem.wav');
                var audioGem = new Audio(gemCollected);
                audioGem.play();
            }
        }
        if (!this.gems[3].collected) {
            this.gems[3].collected = renderData.gem4!.collected;
            if (this.gems[3].collected) {
                const gemCollected = require('../../media/sounds/hit_gem.wav');
                var audioGem = new Audio(gemCollected);
                audioGem.play();
            }
        }
        if (!this.gems[4].collected) {
            this.gems[4].collected = renderData.gem5!.collected;
            if (this.gems[4].collected) {
                const gemCollected = require('../../media/sounds/hit_gem.wav');
                var audioGem = new Audio(gemCollected);
                audioGem.play();
            }
        }
        if (!this.gems[5].collected) {
            this.gems[5].collected = renderData.gem6!.collected;
            if (this.gems[5].collected) {
                const gemCollected = require('../../media/sounds/hit_gem.wav');
                var audioGem = new Audio(gemCollected);
                audioGem.play();
            }
        }
        if (!this.gems[6].collected) {
            this.gems[6].collected = renderData.gem7!.collected;
            if (this.gems[6].collected) {
                const gemCollected = require('../../media/sounds/hit_gem.wav');
                var audioGem = new Audio(gemCollected);
                audioGem.play();
            }
        }
        if (!this.gems[7].collected) {
            this.gems[7].collected = renderData.gem8!.collected;
            if (this.gems[7].collected) {
                const gemCollected = require('../../media/sounds/hit_gem.wav');
                var audioGem = new Audio(gemCollected);
                audioGem.play();
            }
        }
        if (!this.gems[8].collected) {
            this.gems[8].collected = renderData.gem9!.collected;
            if (this.gems[8].collected) {
                const gemCollected = require('../../media/sounds/hit_gem.wav');
                var audioGem = new Audio(gemCollected);
                audioGem.play();
            }
        }
        if (!this.gems[9].collected) {
            this.gems[9].collected = renderData.gem10!.collected;
            if (this.gems[9].collected) {
                const gemCollected = require('../../media/sounds/hit_gem.wav');
                var audioGem = new Audio(gemCollected);
                audioGem.play();
            }
        }

        // Have to make gems disappear if collected (maybe just move them off screen)
        
        var p1ScoreText= document.getElementById('p1-score');
        p1ScoreText!.innerHTML = "Player 1 Gems: " + this.characters[0].score;
        var p2ScoreText= document.getElementById('p2-score');
        p2ScoreText!.innerHTML = "Player 2 Gems: " + this.characters[1].score;

        if (this.characters[0].score >= 5 && !this.gameover) {
            var img = document.createElement("img");
            img.id ="p1wins"
            img.src = player1WinImg;
            img.width = screen.width;
            img.height = screen.height;
            var src = document.body;
            src!.appendChild(img);
            var x = document.getElementById("game-window");
            x!.style.display = "none";
            var y = document.getElementById("scoreboard-div");
            y!.style.display = "none";
            this.gameover = true;
            const endSound = require('../../media/sounds/game_over.wav');
            var gameoverSound = new Audio(endSound);
            gameoverSound.play();
        }
        else if (this.characters[1].score >= 5 && !this.gameover) {
            var img = document.createElement("img");
            img.id ="p2wins"
            img.src = player2WinImg;
            img.width = screen.width;
            img.height = screen.height;
            var src = document.body;
            src!.appendChild(img);
            var x = document.getElementById("game-window");
            x!.style.display = "none";
            var y = document.getElementById("scoreboard-div");
            y!.style.display = "none";
            this.gameover = true;
            const endSound = require('../../media/sounds/game_over.wav');
            var gameoverSound = new Audio(endSound);
            gameoverSound.play();
        }
    }
}