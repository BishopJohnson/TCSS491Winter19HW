//no inheritance
function Ground(game, x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.ctx = game.ctx;
}

Ground.prototype.update = function () {
    //do nothing
}

Ground.prototype.draw = function () {
    //draws border for visibility
    this.ctx.fillStyle = "green";
    this.ctx.fillRect(this.x, this.y, this.width, this.height);
}

//inheritance
/**
 * 
 * 
 * @param {any} game
 * @param {any} spritesheet
 */
function Mario(game, spritesheet, ground) {
    this.spritesheet = spritesheet;
    this.animationIdleR = new Animation(spritesheet, "idle", 80, 1, 16, 32, 1, 0.10, 1, true, 3, "right");
    this.animationIdleL = new Animation(spritesheet, "idle", 437, 1, 16, 32, 1, 0.10, 1, true, 3, "left");
    this.animationWalkR = new Animation(spritesheet, "walk", 97, 1, 16, 32, 1, 0.10, 3, true, 3, "right");
    this.animationWalkL = new Animation(spritesheet, "walk", 454, 1, 16, 32, 1, 0.10, 3, true, 3, "left");
    this.animationReverseR = new Animation(spritesheet, "reverse", 148, 1, 16, 32, 1, 0.10, 1, true, 3, "right");
    this.animationReverseL = new Animation(spritesheet, "reverse", 505, 1, 16, 32, 1, 0.10, 1, true, 3, "left");
    this.animationJumpR = new Animation(spritesheet, "jump", 165, 1, 16, 32, 1, 0.10, 1, true, 3, "right");
    this.animationJumpL = new Animation(spritesheet, "jump", 522, 1, 16, 32, 1, 0.10, 1, true, 3, "left");
    this.animationCrouchR = new Animation(spritesheet, "crouch", 182, 1, 16, 32, 1, 0.10, 1, true, 3, "right");
    this.animationCrouchL = new Animation(spritesheet, "crouch", 539, 1, 16, 32, 1, 0.10, 1, true, 3, "left");
    this.animation = this.animationIdleR; //initial animation
    this.ctx = game.ctx;
    this.speed = 0.05;
    this.MAX_SPEED = 10;
    this.friction = 0.2;
    this.falling = false;
    this.ground = ground;

    /* TODO: Have x,y position based on game world coordinates instead of canvas coordinates.
     */

    /* TODO: Keep animations in an array/list.
     */

    Entity.call(this, game, 300, ground.y - (this.animation.frameHeight * this.animation.scale));
}

Mario.prototype = new Entity();
Mario.prototype.constructor = Mario;

/**
 * 
 */
Mario.prototype.update = function () {
    //checks if player has hit the ground
    if (this.falling && this.y >= this.ground.y - (this.animation.frameHeight * this.animation.scale)) {
        this.y = this.ground.y - (this.animation.frameHeight * this.animation.scale);
        this.falling = false;
        this.velocityY = 0;
    }

    //checks if entity is falling
    if (!this.falling) {
        //checks for jump input
        if (this.game.keySpace) {
            this.velocityY = -15;
            this.falling = true;

            //checks the direction of the previous animation
            if (this.animation.direction == "right")
                this.animation = this.animationJumpR;
            else
                this.animation = this.animationJumpL;
        }
    } else {
        this.velocityY += 9.8 * 0.05; //0.05; //applies gravity if falling
    }

    //checks for left-right input
    if (this.game.keyA) {
        this.velocityX = Math.max(-this.MAX_SPEED, this.velocityX - this.speed); //accelerates the player

        //checks if player is not falling to switch to walk animation
        if (!this.falling) {
            //checks if player should be sliding
            if (Math.sign(this.velocityX) <= 0)
                this.animation = this.animationWalkL;
            else
                this.animation = this.animationReverseL;
        }
    } else if (this.game.keyD) {
        this.velocityX = Math.min(this.MAX_SPEED, this.velocityX + this.speed); //accelerates the player

        //checks if player is not falling to switch to walk animation
        if (!this.falling) {
            //checks if player should be sliding
            if (Math.sign(this.velocityX) >= 0)
                this.animation = this.animationWalkR;
            else
                this.animation = this.animationReverseR;
        }
    } else if (this.game.keyS) {
        this.velocityX = Math.sign(this.velocityX) * Math.max(0, Math.abs(this.velocityX) - this.friction); //implements friction to simulate deceleration

        //checks the direction of the previous animation
        if (this.animation.direction == "right")
            this.animation = this.animationCrouchR;
        else
            this.animation = this.animationCrouchL;
    } else {
        this.velocityX = Math.sign(this.velocityX) * Math.max(0, Math.abs(this.velocityX) - this.friction); //implements friction to simulate deceleration

        //checks if player is not moving to switch to idle animation
        if (!this.falling && this.velocityX == 0) {
            //checks the direction of the previous animation
            if (this.animation.direction == "right")
                this.animation = this.animationIdleR;
            else
                this.animation = this.animationIdleL;
        } else if (!this.falling && this.velocityX != 0) {
            //checks the direction of the previous animation
            if (this.animation.direction == "right")
                this.animation = this.animationWalkR;
            else
                this.animation = this.animationWalkL;
        }
    }

    //updates position
    this.x += this.velocityX;
    this.y += this.velocityY;

    //teleports the player when they walk off the screen
    if (this.x > this.ground.width + (this.animation.frameWidth * this.animation.scale))
        this.x = 0 - (this.animation.frameWidth * this.animation.scale);
    else if (this.x < 0 - (this.animation.frameWidth * this.animation.scale))
        this.x = this.ground.width + (this.animation.frameWidth * this.animation.scale);

    Entity.prototype.update.call(this);
}

/**
 * 
 */
Mario.prototype.draw = function () {
    this.animation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);

    var width = this.animation.frameWidth * this.animation.scale;
    var height = this.animation.frameHeight * this.animation.scale;

    //draws animation border for debugging
    //this.ctx.strokeStyle = "green";
    //this.ctx.strokeRect(this.x, this.y, width, height);

    Entity.prototype.draw.call(this);
}

//main code begins here

var AM = new AssetManager();

AM.queueDownload("./SuperMarioBros/img/MarioAndLuigi.png");

AM.downloadAll(function () {
    var canvas = document.getElementById("gameWorld");
    var ctx = canvas.getContext("2d");

    ctx.imageSmoothingEnabled = false; //disables pixel smoothing

    var gameEngine = new GameEngine();

    gameEngine.init(ctx);
    gameEngine.start();

    var ground = new Ground(gameEngine, 0, 600, canvas.width, 20);
    var player = new Mario(gameEngine, AM.getAsset("./SuperMarioBros/img/MarioAndLuigi.png"), ground);

    gameEngine.addEntity(player);
    gameEngine.addEntity(ground);

    console.log("All Done!");
});
