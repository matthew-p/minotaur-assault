var BasicGame = BasicGame || {};

BasicGame.Infinite = function(game) {};

BasicGame.Infinite.prototype = {
  init: function() {

  }, 
  preload: function() {
    
        // audio 
    this.sfx = {};
    this.sfx.commonLevel = 0.1;
    this.sfx.coin = this.game.add.audio('coinSFX');
    this.sfx.playerDeath = this.game.add.audio('playerDeathSFX');
    this.sfx.bulletImpact = this.game.add.audio("deepImpactSFX");
    this.sfx.enemyDeath = this.game.add.audio('shrinkBounceSFX');
    this.sfx.levelStart = this.game.add.audio('levelStartSFX');
    this.sfx.playerBullet = this.game.add.audio("playerGunSFX");
    this.sfx.jump = this.game.add.audio('jumpSFX');
    this.sfx.gameWin = this.game.add.audio('gameWinSFX');
    
    this.music = this.game.add.audio('organMusic');
    
  },
  create: function() {
    // attempt to set bounds
    this.world.setBounds(0, 0, this.game.baseWidth, this.game.baseHeight);
    
    this.playerScore = 0;
    
    if (localStorage.getItem("infiniteHighScore")) {
      this.highScore = localStorage.getItem("infiniteHighScore");
    } else {
      this.highScore = 0;
    }
    // speed of descent
    this.descentSpeed = 10;
    // bullet timer
    this.bulletTime = 0;
    
    this.music.play('', 0, 0.1, true, true); // marker, start pos, vol, loop?, forceRestart
    
    // background loop
    // x,y width, height, key, frame, group
    // levelBackground: "clouds-bg"
    this.background = this.game.add.tileSprite(0,0, this.game.baseWidth, this.game.baseHeight, "clouds-bg");
    
    this.background.tileScale.x = this.game.assetScaleFactor;
    this.background.tileScale.y = this.game.assetScaleFactor;
    this.background.fixedToCamera = true;
    // put at bottom of z axis
    this.background.sendToBack();
    
    // make player
    this.player = this.game.add.sprite(this.game.baseWidth * 0.5, this.game.baseHeight / 2 - 64, "player");
    // player scale
    this.player.scale.setTo(this.game.assetScaleFactor, this.game.assetScaleFactor);
    this.game.physics.arcade.enable(this.player);
    // x,y,x offset, y offset from the sprite
    // at 4x asset scale: 
    // this.player.body.setSize(this.player.width * 0.175, this.player.height * 0.25);
    // for 2x
    this.player.body.setSize(this.player.width * 0.175, this.player.height * 0.25);
    
        // center body anchor
    this.player.anchor.setTo(0.5,0.5);
    // enable gravity
    this.game.physics.arcade.gravity.y = 150 * this.game.assetScaleFactor;
    // give the player a walk cycle
    this.player.animations.add('walk', [0,1,2], 10, true);
    // move player with cursor keys
    this.cursors = this.game.input.keyboard.createCursorKeys();
        // input check for firing via space
    this.game.input.keyboard.addKeyCapture([Phaser.Keyboard.SPACEBAR]);
    // give player a dead status
    this.player.dead = false;
        //Make the player collide with the game boundaries 
    this.player.body.collideWorldBounds = true;
    
    // make player's green bullets
    this.bulletsGreen = this.game.add.group();
    this.bulletsGreen.enableBody = true;
    this.physicsBodyType = Phaser.Physics.ARACDE;

    for (var i = 0; i < 10; i++) {
      var bullet = this.bulletsGreen.create(0, 0, "bullet-green", 2); // x,y,key,frame
      bullet.exists = false;
      bullet.visible = false;
      bullet.body.allowGravity = false;
      bullet.scale.x = this.game.assetScaleFactor * 0.5;
      bullet.scale.y = this.game.assetScaleFactor * 0.5;
      bullet.body.setSize(bullet.width * 1, bullet.height * 1);
      bullet.anchor.setTo(0.5, 0.5);
      bullet.checkWorldBounds = true;
      bullet.outOfBoundsKill = true;
      bullet.directionValue = 1;
    }
  
    
    // make platforms
    this.platforms = this.game.add.group();
    this.platforms.enableBody = true;
  
    for (var i = 0; i < 500; i++) {
      //create(x, y, key, frame, exists)
      this.platforms.create(0, -16 * this.game.assetScaleFactor, "greyTiles", this.game.rnd.integerInRange(0, 5), false);
    }
    // setAll(key, value, checkAlive, checkVisible, operation, force)
    this.platforms.setAll("scale.x", this.game.assetScaleFactor, false, false, 0, true);
    this.platforms.setAll("scale.y", this.game.assetScaleFactor, false, false, 0, true);
    this.platforms.setAll("body.allowGravity", false, false, false, 0, true);
    this.platforms.setAll("body.width", 16 * this.game.assetScaleFactor, false, false, 0, true);
    this.platforms.setAll("body.height", 16 * this.game.assetScaleFactor, false, false, 0, true);

    
         // green bullet impacts
    this.playerBulletExplosions = this.game.add.group();
    for (var j = 0; j < 12; j++) {
      var explosion = this.playerBulletExplosions.create(0, 0, "bullet-green", 2);
      explosion.scale.x = this.game.assetScaleFactor;
      explosion.scale.y = this.game.assetScaleFactor;
      explosion.exists = false;
      explosion.visible = false;
      explosion.anchor.setTo(0.5, 0.5);
      explosion.animations.add("explode", [2,0,1,2], 10, false);
    }
    
        // touch input
    // x,y key, callback, callback context, frames
    if (!this.game.device.desktop) {
      this.leftButton = this.game.add.button(this.game.baseWidth * 0.02, this.game.baseHeight * 0.75, 'buttons', null, this, 14, 14, 14, 14);
      this.leftButton.scale.setTo(this.game.assetScaleFactor);
      // unsure if this scoping is correct
      this.leftButtonDown = false;
      this.leftButton.events.onInputDown.add(function(){
        this.leftButtonDown = true;
        this.leftButton.alpha = 0.4;
      }, this);
      this.leftButton.events.onInputUp.add(function(){
        this.leftButtonDown = false;
        this.leftButton.alpha = 0.3;
      }, this);
      this.leftButton.alpha = 0.3;
      this.leftButton.fixedToCamera = true;
       
      
      this.rightButton = this.game.add.button(this.game.baseWidth * 0.20, this.game.baseHeight * 0.75, "buttons", null, this, 5, 5, 5, 5);
      this.rightButton.scale.setTo(this.game.assetScaleFactor, this.game.assetScaleFactor);
      this.rightButtonDown = false;
      this.rightButton.events.onInputDown.add(function(){
        this.rightButtonDown = true;
        this.rightButton.alpha = 0.4;
      }, this);
      this.rightButton.events.onInputUp.add(function(){
        this.rightButtonDown = false;
        this.rightButton.alpha = 0.3;
      }, this);
      this.rightButton.alpha = 0.3;
      this.rightButton.fixedToCamera = true;

      this.aButton = this.game.add.button(this.game.baseWidth * 0.62, this.game.baseHeight * 0.75, "buttons", null, this, 12, 12, 12, 12);
      this.aButton.scale.setTo(this.game.assetScaleFactor, this.game.assetScaleFactor);
      this.aButtonDown = false;
      this.aButton.events.onInputDown.add(function(){
        this.aButtonDown = true;
        this.aButton.alpha = 0.4;
      }, this);
      this.aButton.events.onInputUp.add(function(){
        this.aButtonDown = false;
        this.aButton.alpha = 0.3;
      }, this);
      this.aButton.alpha = 0.3;
      this.aButton.fixedToCamera = true;

      this.bButton = this.game.add.button(this.game.baseWidth * 0.8, this.game.baseHeight * 0.75, "buttons", null, this, 9, 9, 9, 9);
      this.bButton.scale.setTo(this.game.assetScaleFactor, this.game.assetScaleFactor);
      this.bButtonDown = false;
      this.bButton.events.onInputDown.add(function(){
        this.bButtonDown = true;
        this.bButton.alpha = 0.4;
      }, this);
      this.bButton.events.onInputUp.add(function(){
        this.bButtonDown = false;
        this.bButton.alpha = 0.3;
      }, this);
      this.bButton.alpha = 0.3;
      this.bButton.fixedToCamera = true;
    }
    
    
    this.descentCounter = 0;
    
    //spacing for the initial platforms
   // this.spacing = 50;
    //create intital platforms
    this.initPlatforms();
    
    
      // called last, hopefully will render on top

    this.playerScoreText = this.game.add.bitmapText(this.game.baseWidth * 0.05, this.game.baseHeight * 0.05, "verminFontWhite", "Score: " + this.playerScore, this.game.bitmapFontSize * 1.5);
    this.highScoreText = this.game.add.bitmapText(this.game.baseWidth * 0.5, this.game.baseHeight * 0.05, "verminFontWhite", "High Score: " + this.highScore, this.game.bitmapFontSize * 1.5);
 
    // cause the text count to move w. the player
    this.playerScoreText.fixedToCamera = true;
    this.highScoreText.fixedToCamera = true;
    
  },
  // create a single tile and bind it to the screen
  addTile: function(x, y) {
    var tile = this.platforms.getFirstDead();
    // reset it to the specified coordinates
    tile.reset(x, y);
    // move it downward at a constant rate
    tile.body.velocity.y = this.descentSpeed * this.game.assetScaleFactor;
    // does not recieve impacts from other bodies
    tile.body.immovable = true;
    // when leaves screen, kill (note, expensive call)
    tile.checkWorldBounds = true;
    tile.outOfBoundsKill = true;
    
  },
  // create a platform of tiles
  addPlatform: function(y) {
    // if no y given, render outside screen
    if (typeof(y) === "undefined") {
      // height of the tile in pixels
      y = -16 * this.game.assetScaleFactor;
    }
    // number of tiles necessary to cover the entire width
    var tilesNeeded = Math.ceil(this.game.baseWidth / (this.game.assetScaleFactor * 16));
    // make the gap
    var hole = Math.floor(Math.random() * (tilesNeeded - 3)) + 1;
    // draw tiles, except for a random hole
    for (var i = 0; i < tilesNeeded; i++) {
      if (i != hole && i != hole + 1) {
        this.addTile(i * (16 * this.game.assetScaleFactor), y);
      }
    }
  },
  initPlatforms: function() {

    var bottom = this.game.baseHeight - (16 * this.game.assetScaleFactor);
    var top = 16 * this.game.assetScaleFactor;

    // keep making platforms until they reach the top, 192 is two blocks of space
    for (var y = bottom; y >= -200; y -= 200) {

      this.addPlatform(y);
    }
  },
  update: function() {
    
     
    //Make the sprite collide with the ground layer
    this.game.physics.arcade.collide(this.player, this.platforms);
    
        // kill bullets on touching wall
    this.game.physics.arcade.collide(this.bulletsGreen, this.platforms, this.resetPlayerBullet, null, this);
 
 
    //Check if the player is touching the bottom
    if(this.player.body.position.y >= this.game.world.height - (this.player.body.height)){
      this.player.dead = true;
      this.gameOver();
    }
    
    // paralax background
    this.background.tilePosition.y -= 0.05 + this.descentSpeed * 0.01;
    
    // make platforms 
    if (this.descentCounter === 0 || this.descentCounter >= 220 + this.descentSpeed * 2.5) {
      this.addPlatform();
      this.descentCounter = 0;
          // update score
      this.playerScore += 1;
            // local storage game save
      if (this.playerScore > this.highScore) {
        this.highScore = this.playerScore;
        localStorage.setItem("infiniteHighScore", this.highScore.toString());
        this.highScoreText.text = "High Score: " + this.highScore;
      }
      this.playerScoreText.text = "Score: " + this.playerScore;
      this.descentSpeed += (this.descentSpeed < 21 ? 0.8 : 0.1);
    }
    this.descentCounter += (this.descentSpeed * this.game.assetScaleFactor / 60);
    
    
    // colide player and platforms
    // collide(object1, object2, collideCallback, processCallback, callbackContext) 
    this.game.physics.arcade.collide(this.player, this.platforms);
    
    // player movement
    // set horizontal to 0 for immediate air & land control
    this.player.body.velocity.x = 0;

    // all the movement conditions
    // if player alive, not shooting, & doesn't have tank, he can move
    if (!this.player.dead && (!this.player.body.touching.down || (!this.game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR) && !this.bButtonDown))) { 
      if (this.cursors.left.isDown || this.leftButtonDown) {
        if (this.player.scale.x > 0) {this.player.scale.x *= -1;}
        
        this.player.body.velocity.x = -90 * this.game.assetScaleFactor;
        this.player.animations.play("walk");
      } else if (this.cursors.right.isDown || this.rightButtonDown) {
        this.player.scale.x = Math.abs(this.player.scale.x);
        this.player.body.velocity.x = 90 * this.game.assetScaleFactor;
        this.player.animations.play('walk');
      } else {
        this.player.loadTexture("player", 5);
      }

      if (this.cursors.up.isDown || this.aButtonDown) {
        this.player.loadTexture("player", 4);
        if (this.player.body.touching.down) {
          this.sfx.jump.play('', 0, this.sfx.commonLevel, false, true);
          this.player.body.velocity.y = -125 * this.game.assetScaleFactor; // was -125
        }
      }
      // add jump frame if not on floor, may not be most efficent way to do this
      if (!this.player.body.touching.down) {
        this.player.loadTexture("player", 4);
      }

    } else {
      // neutral pose
      this.player.loadTexture("player", 7);
    }
     // fire player bullets
    if (!this.player.dead && (this.game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR) || this.bButtonDown) && (!this.player.body.touching.down || Math.abs(this.player.body.velocity.x) === 0)) {
 
      this.player.loadTexture("player", 3);
      this.firePlayerBullet();
    }
      
    
  }, // end of Update method
  
  firePlayerBullet: function(bullet) {
    if (this.game.time.now > this.bulletTime) {
      var playerBullet = this.bulletsGreen.getFirstExists(false);
      if (playerBullet) {
        playerBullet.reset(this.player.x + ( (8 * this.game.assetScaleFactor) * (this.player.scale.x > 0 ? 1 : -1)), this.player.y - 0);
        playerBullet.body.velocity.x = 90 * (this.player.scale.x > 0 ? 1 : -1) * this.game.assetScaleFactor;
        playerBullet.directionValue = (this.player.scale.x > 0 ? 1 : -1);
        this.bulletTime = this.game.time.now + 500; // bullet timer
        this.sfx.playerBullet.play('', 0, this.sfx.commonLevel, false, true);
      }
    }
  },
  
  resetPlayerBullet: function(bullet) {
    var bulletExplosion = this.playerBulletExplosions.getFirstExists(false);
    if (bulletExplosion) {
      this.sfx.bulletImpact.play('', 0, this.sfx.commonLevel, false, true);
      bulletExplosion.reset(bullet.x + (6 * this.game.assetScaleFactor * bullet.directionValue), bullet.y);
      bulletExplosion.animations.play('explode', 7, false, true);
      // no loop, kill on complete
    }
    bullet.kill();
  },
  
  gameOver: function(){
    this.music.stop();
    this.sfx.playerDeath.play('', 0, this.sfx.commonLevel, false, true);
    this.game.state.start('InfiniteGameOver', true, false);
  },
  
  render: function() {

  },
  
};