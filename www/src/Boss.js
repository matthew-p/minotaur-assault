var BasicGame = BasicGame || {};

BasicGame.Boss = function(game) {};

BasicGame.Boss.prototype = {
  // load level data
  init: function(levelFlags, currentLevel) {
    this.levelFlags = levelFlags;
    this.currentLevel = currentLevel;
    this.levelData = levelFlags["level" + currentLevel];
    
    this.menuText = null;
  },
  preload: function() {
      // audio
    
    this.sfx = {};
    this.sfx.roar = this.game.add.audio('roarSFX');                   
  
    this.sfx.commonLevel = 0.1;
    this.sfx.coin = this.game.add.audio('coinSFX');
    this.sfx.playerDeath = this.game.add.audio('playerDeathSFX');
    this.sfx.bulletImpact = this.game.add.audio("deepImpactSFX");
    this.sfx.enemyDeath = this.game.add.audio('shrinkBounceSFX');
    this.sfx.levelStart = this.game.add.audio('levelStartSFX');
    this.sfx.playerBullet = this.game.add.audio("playerGunSFX");
    this.sfx.jump = this.game.add.audio('jumpSFX');
    this.sfx.gameWin = this.game.add.audio('gameWinSFX');

    this.sfx.roarFire = this.game.add.audio('roarFireSFX');
    this.sfx.maceImpact = this.game.add.audio('maceImpactSFX');
    
    this.music = this.game.add.audio(this.levelData.levelMusic);

    

  },
  create: function() {
    
    this.music.play('', 0, 0.3, true, true); // marker, start pos, vol, loop?, forceRestart

            // coins earned vs. availble holders, world count filled in createCoins loop
    this.playerCoinCount = 0;
    this.worldCoinCount = 0;
    this.bulletTime = 0;
    this.gameOverStatus = false;

    
    // game map
    this.map = this.game.add.tilemap(this.levelData.levelMap);

    // the first arg is the tileset name as given in Tiled, 2nd is key to asset
    this.map.addTilesetImage("tiles-extended", "gameTiles");

    // create a layer

    this.blockedLayer = this.map.createLayer("blockedLayer");
    this.blockedLayer.setScale(this.game.assetScaleFactor, this.game.assetScaleFactor);

    
    this.triggerLayer = this.map.createLayer("triggerLayer");
    this.triggerLayer.setScale(this.game.assetScaleFactor, this.game.assetScaleFactor);
    

    // collision on layers
    this.map.setCollisionBetween(1, 100, true, "blockedLayer");
    this.map.setCollisionBetween(1, 20, true, "triggerLayer");
    this.triggerLayer.visible = false;
    this.map.setCollisionBetween(1, 100, true, "lavaLayer");
    // resize the game world to match the layer dimensions
 
    this.blockedLayer.resizeWorld();
    
        
    // background loop
    // x,y width, height, key, frame, group
    // levelBackground: "clouds-bg"

    this.background = this.game.add.tileSprite(0,0, this.game.baseWidth, this.game.baseHeight, this.levelData.levelBackground);

    this.background.tileScale.x = this.game.assetScaleFactor;
    this.background.tileScale.y = this.game.assetScaleFactor;
    this.background.fixedToCamera = true;
    // put at bottom of z axis
    this.background.sendToBack();
    
        // make pickups
  //  this.createCoins();
  //  this.createTanks();
  //  console.log("coins: " + this.coins.children[0].body.height + "\n tanks: " + this.tanks.children);
    
                // make enemies

    this.createEnemiesMinotaur();
    
        // create player
    var result = this.findObjectsByType("playerStart", this.map, "objectsLayer");
    // we know there is just one result
    this.playerStartX = result[0].x * this.game.assetScaleFactor;
    this.playerStartY = result[0].y * this.game.assetScaleFactor;
    this.player = this.game.add.sprite(this.playerStartX, this.playerStartY, "player");
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
    // make tank collection win condition
    this.player.hasTank = false;
    // enable gravity
    this.game.physics.arcade.gravity.y = 150 * this.game.assetScaleFactor;
    // give the player a walk cycle
    this.player.animations.add('walk', [0,1,2], 10, true);
    // the camera will follow the player
    this.game.camera.follow(this.player);
    // move player with cursor keys
    this.cursors = this.game.input.keyboard.createCursorKeys();
        // input check for firing via space
    this.game.input.keyboard.addKeyCapture([Phaser.Keyboard.SPACEBAR]);
    // give player a dead status
    this.player.dead = false;
    // neutral pose
    this.player.loadTexture("player", 5);
    

    // make enemy's orange bullets
    this.bulletsOrange = this.game.add.group();
    this.bulletsOrange.enableBody = true;
    this.physicsBodyType = Phaser.Physics.ARACDE;
    for (var i = 0; i < 30; i++) {
      var bullet = this.bulletsOrange.create(0, 0, "fireball", 0);
      bullet.exists = false;
      bullet.visible = false;
      bullet.body.allowGravity = false;
      bullet.scale.x = this.game.assetScaleFactor;
      bullet.scale.y = this.game.assetScaleFactor;
      //bullet.body.setSize(10, 8);
      // bullet.body.setSize(bullet.width * 0.18, bullet.height * 0.125);
      bullet.anchor.set(0.5);
    //  bullet.body.setSize(bullet.width * 0.25, bullet.height * 0.15, 0, 0);
      bullet.directionValue = 1;
      bullet.animations.add("fly", [0,1,2,3], 10, true);
    }
      // putting bullet body size limit in firebullet method, unsure why this is not enough
    this.bulletsOrange.setAll("body.setSize", this.bulletsOrange.children[0].height * 0.25);
    
    
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

      bullet.directionValue = 1;
    }
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
        // orange  bullet impacts
    this.enemyBulletExplosions = this.game.add.group();
    for (var i = 0; i < 30; i++) {
      var explosion = this.enemyBulletExplosions.create(0, 0, "bullet-orange", 3);
      explosion.scale.x = this.game.assetScaleFactor;
      explosion.scale.y = this.game.assetScaleFactor;
      explosion.exists = false;
      explosion.visible = false;
      explosion.anchor.setTo(0.5, 0.5);
      explosion.animations.add('explode', [2,3], 7, false);
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
    
    this.tank = false;
  },

  deathSpawn: function() {
    this.tank = this.game.add.sprite(this.enemiesMinotaur.children[0].x, this.enemiesMinotaur.children[0].y, 'tank');
    this.game.physics.arcade.enable(this.tank);
    this.tank.anchor.setTo(0.5, 0.5);
    this.tank.scale.setTo(4,4);

  },

  createEnemiesMinotaur: function() {
    this.enemiesMinotaur = this.game.add.group();
    this.enemiesMinotaur.enableBody = true;
    var result = this.findObjectsByType('enemies-minotaur', this.map, "objectsLayer");
    result.forEach(function(element) {
      this.createFromTiledObject(element, this.enemiesMinotaur);
    }, this);
    // behaviors
    this.enemiesMinotaur.forEach(function(enemy) {
      enemy.scale.setTo(4, 4);

      enemy.animations.add('walk', [20,21,22,23,24,25,26,27,28,29], 7, true);
      enemy.animations.add('idle', [0,1,2,3,4,5,6,7,8,9], 7, true);
      enemy.animations.add('roar', [10,11,12,13,14,15,16,17,18,19], 7, false);
      enemy.animations.add('swing', [30,31,32,33,34,35,36,37,38,39,31], 7, false);
      enemy.animations.add('die', [40,41,42,43,44,45,46,47,48,49], 7, false);
      enemy.directionValue = 1;
      enemy.swingTimer = 0;
      enemy.roarTimer = 0;
      enemy.bulletTimer = 0;
      enemy.anchor.setTo(0.5,0.5);
      enemy.health = 100;
      enemy.deathRattle = this.game.add.audio('deathRattle');
      enemy.animations.play('idle');
      enemy.initialTrigger = false;
      enemy.body.setSize(enemy.width * 0.13, enemy.height * 0.15, 0, enemy.height * 0.19);
      // attempt from http://www.thebotanistgame.com/blog/2015/01/25/death-and-killing.html
      enemy.kill = function () {
        this.alive = false;
        this.body.velocity.setTo(0,0);
        this.animations.stop;
        this.animations.play('die');
        this.deathRattle.play('', 0, 0.2, false, true); // marker, start pos, vol, loop?, forceRestart
        this.events.onAnimationComplete.addOnce(function() {
          this.exists = true;
          this.visible = true;
          this.events.destroy;
        }, this);
        if (this.events) {
          this.events.onKilled$dispatch(this);
        }
        return this;
      };
    }, this);
  },
    
    // find objects from Tiled object layer, based on property 'type' values
  findObjectsByType: function(type, map, layer) {
    var result = [];
    map.objects[layer].forEach(function(element) {
      if (element.type === type) {
        // phaser uses top left, Tiled bottom left so y pos must be adjusted
        element.y -= map.tileHeight;
        result.push(element);
      }
    });
    return result;
  },
    // create sprites from an object
  createFromTiledObject: function(element, group) {
    // here you're using diff types that correspond to the element keys
    var sprite = group.create(element.x * this.game.assetScaleFactor, element.y * this.game.assetScaleFactor, element.type);

    // copy all properties to the sprite
    Object.keys(element.properties).forEach(function(key) {
      sprite[key] = element.properties[key];
    });
  },
  
  update: function() {
    
    // paralax background

    this.background.tilePosition.set(this.game.camera.x * -0.2, this.game.camera.y * -0.2);
    
    // check if gameover to restart on SPACE
    if ((this.game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR) || this.aButtonDown || this.bButtonDown) && this.gameOverStatus === true && this.player.dead === true) {
      // args: state, clear World, don't clear cache, pass thru level data, restart this level
      this.game.state.start("Boss", true, false, this.levelFlags, this.currentLevel);
    }
    if ((this.game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR) || this.aButtonDown || this.bButtonDown) && this.gameOverStatus === true && this.player.dead === false) {

      this.game.state.start("Menu", true, false);

    }
    
    if (this.menuText) {
       // touch input
      if (this.game.input.activePointer.isDown) {
        if (Phaser.Rectangle.containsPoint(this.menuText.getBounds(), this.game.input.activePointer.position)) {
          this.game.state.start('Menu', true, false);
        }
      }
    }
        
    // collisions
    this.game.physics.arcade.collide(this.player, this.blockedLayer);

    // enemy collisions w. tiles
    this.game.physics.arcade.collide(this.enemiesMinotaur, this.blockedLayer);
    this.game.physics.arcade.collide(this.enemiesMinotaur, this.triggerLayer);

    if (this.tank) {
  
      this.game.physics.arcade.collide(this.tank, this.blockedLayer);
      this.game.physics.arcade.collide(this.player, this.tank, this.tankCollision, null, this);
    }

    // kill bullets on touching wall
    this.game.physics.arcade.collide(this.bulletsGreen, this.blockedLayer, this.resetPlayerBullet, null, this);
    this.game.physics.arcade.collide(this.bulletsOrange, this.blockedLayer, this.resetEnemyBullet, null, this);
    
    // player movement
    // set horizontal to 0 for immediate air & land control
    this.player.body.velocity.x = 0;
    
    // all the movement conditions
    // if player alive, not shooting, & doesn't have tank, he can move
    if (!this.player.dead && this.enemiesMinotaur.children[0].started && (!this.player.body.onFloor() || (!this.game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR) && !this.bButtonDown)) && !this.player.hasTank) { 
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
        if (this.player.body.onFloor()) {
          this.sfx.jump.play('', 0, this.sfx.commonLevel, false, true);
          this.player.body.velocity.y = -125 * this.game.assetScaleFactor; // was -125
        }
      }

      // add jump frame if not on floor, may not be most efficent way to do this
      if (!this.player.body.onFloor()) {
        this.player.loadTexture("player", 4);
      }
    } else if (this.player.hasTank) {
      // victory pose
      this.player.loadTexture("player", 6);
    }else if (!this.player.dead && !this.enemiesMinotaur.children[0].started) {
      // neutral pose
      this.player.loadTexture("player", 5);
    } else  {
      // dead pose
      this.player.loadTexture("player", 7);
    }
        // fire player bullets
    if (!this.player.dead && this.enemiesMinotaur.children[0].started && (this.game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR) || this.bButtonDown) && !this.player.hasTank && (!this.player.body.onFloor() || Math.abs(this.player.body.velocity.x) === 0)) {
      this.player.loadTexture("player", 3);
      this.firePlayerBullet();
    }
    
    if (this.enemiesMinotaur.children && !this.enemiesMinotaur.children[0].started && this.enemiesMinotaur.children[0].inCamera && this.enemiesMinotaur.children[0].initialTrigger === false) {
      this.enemiesMinotaur.children[0].initialTrigger = true;
      this.game.time.events.add(2000, function() {
        this.enemiesMinotaur.children[0].animations.play("roar");

        this.sfx.roar.play('', 0, this.sfx.commonLevel * 4, false, true);
        this.enemiesMinotaur.children[0].animationLocked = true;
        // this.game.time.events.add(delay, callback, callbackContext, arguments) 
        this.game.time.events.add(1000, function() {this.enemiesMinotaur.children[0].started = true;}, this);
        
      }, this);      
    }
    
    if (this.enemiesMinotaur.children[0].alive && 
        this.enemiesMinotaur.children[0].started) {
      this.enemiesMinotaur.children[0].body.velocity.x = 0;
      if (!this.enemiesMinotaur.children[0].animationLocked) {
        if (Math.abs(this.enemiesMinotaur.children[0].x - this.player.x) > 30) {
          this.enemiesMinotaur.children[0].directionValue = this.enemiesMinotaur.children[0].x > this.player.x ? 1 : -1;
        }

        this.enemiesMinotaur.children[0].body.velocity.x = -25 * this.game.assetScaleFactor * this.enemiesMinotaur.children[0].directionValue;
        this.enemiesMinotaur.children[0].scale.x = this.enemiesMinotaur.children[0].directionValue > 0 ? Math.abs(this.enemiesMinotaur.children[0].scale.x) : Math.abs(this.enemiesMinotaur.children[0].scale.x) * -1; 
        this.enemiesMinotaur.children[0].animations.play('walk');

        if (this.enemiesMinotaur.children[0].swingTimer < this.game.time.now) {
          if (Math.abs(this.enemiesMinotaur.children[0].x - this.player.x) < this.enemiesMinotaur.width * 0.75 && this.enemiesMinotaur.children[0].y * 0.95 < this.player.y) {
            this.enemiesMinotaur.children[0].swingAnimation = this.enemiesMinotaur.children[0].animations.play('swing');
            this.enemiesMinotaur.children[0].animationLocked = true;
          }
        } 
        if (this.enemiesMinotaur.children[0].roarTimer < this.game.time.now) {
          if (Math.abs(this.enemiesMinotaur.children[0].x - this.player.x) > this.enemiesMinotaur.children[0].width * 1.5 || this.enemiesMinotaur.children[0].y * 0.95 > this.player.y) {
            this.enemiesMinotaur.children[0].roarAnimation = this.enemiesMinotaur.children[0].animations.play('roar');
             this.sfx.roarFire.play('', 0, this.sfx.commonLevel, false, true);
            this.enemiesMinotaur.children[0].animationLocked = true;            
          }
        }
        
        
      } else if (this.enemiesMinotaur.children[0].animationLocked) {
        // sprite.animations.currentAnim.frame returns the number, out of all possible frames in the sheet
  
        if (this.enemiesMinotaur.children[0].animations.currentAnim == this.enemiesMinotaur.children[0].animations.getAnimation('swing') && this.enemiesMinotaur.children[0].animations.currentAnim.frame < 39) {
          if (this.enemiesMinotaur.children[0].animations.currentAnim.frame === 35) {
            this.sfx.maceImpact.play('', 0, this.sfx.commonLevel * 3, false, true);
          }
          
          this.enemiesMinotaur.children[0].swingTimer = this.game.time.now + 2000; 
        } else if (this.enemiesMinotaur.children[0].animations.currentAnim == this.enemiesMinotaur.children[0].animations.getAnimation('roar') && this.enemiesMinotaur.children[0].animations.currentAnim.frame < 19) {
       
          if (this.enemiesMinotaur.children[0].animations.currentAnim.frame == 14) {
           
            this.fireEnemyBullet(this.enemiesMinotaur.children[0]);
          }
          this.enemiesMinotaur.children[0].roarTimer = this.game.time.now + 2000;
        } else {
          this.enemiesMinotaur.children[0].animationLocked = false;
     
        }
      }
    }
      

    if (this.enemiesMinotaur.children[0].alive) {
      this.game.physics.arcade.overlap(this.player, this.enemiesMinotaur, this.enemyCollision, null, this);
    } else if (!this.tank) {
      this.deathSpawn();
    }


    this.game.physics.arcade.overlap(this.bulletsGreen, this.enemiesMinotaur, this.hurtEnemy, null, this);

    // check enemy bullet collision on player
    this.game.physics.arcade.overlap(this.player, this.bulletsOrange, this.playerDeathByBullet, null, this);
    
  }, // end of update method
    
  coinCollision: function(player, coin) {
    // remove the touched coin
    coin.kill();
    // update score
    this.playerCoinCount += 1;
    this.coinText.text = "Coins: " + this.playerCoinCount + "/" + this.worldCoinCount;
    // sfx
    this.sfx.coin.play('', 0, this.sfx.commonLevel, false, true);
  },
  tankCollision: function(player, tank) {
    tank.kill();
    this.player.hasTank = true;
   // console.log('in tankCollision, hastank: ' + this.player.hasTank);
    if (this.gameOverStatus === false) {
    //  console.log('in gameoverStatus if');
      this.gameOver();
    }
  },
  enemyCollision: function(player, enemiesGreen) {
    this.player.body.velocity.y = -50 * this.game.assetScaleFactor;
    this.player.body.velocity.x = -20 * (this.player.scale.x > 0 ? 1 : -1) * this.game.assetScaleFactor;
    this.player.dead = true;
    if (this.gameOverStatus === false) {
      this.gameOver();
    }
  },
  playerDeathByBullet: function(player, bullet) {
    this.player.body.velocity.y = -50;
    this.player.body.velocity.x = -20 * (this.player.scale.x > 0 ? 1 : -1) * this.game.assetScaleFactor;
    this.player.dead = true;
    var bulletExplosion = this.enemyBulletExplosions.getFirstExists(false);
    if (bulletExplosion) {
      bulletExplosion.reset(bullet.x + ((6 * this.game.assetScaleFactor) * bullet.directionValue), bullet.y);
      bulletExplosion.animations.play('explode', 10, false, true);
    }
    bullet.kill();
    if (this.gameOverStatus === false) {
      this.gameOver();
    }
  },
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
  fireEnemyBullet: function(enemy) {
    if (this.game.time.now > enemy.bulletTimer) {
      enemy.bulletTimer = this.game.time.now + 100;
      
      var enemyBullet = this.bulletsOrange.getFirstExists(false);
      if (enemyBullet) {
        enemyBullet.body.height = 10;

        enemyBullet.directionValue = enemy.directionValue * -1;
        enemyBullet.reset(enemy.x + (16 * enemyBullet.directionValue), enemy.y);


        this.game.physics.arcade.moveToObject(enemyBullet, this.player, 60 * this.game.assetScaleFactor);
        enemyBullet.scale.x = enemyBullet.directionValue > 0 ? Math.abs(enemyBullet.scale.x) : Math.abs(enemyBullet.scale.x) * -1;
        enemyBullet.animations.play("fly");
      }
    }
    
  
  },
  killEnemy: function(bullet, enemy) {
    var bulletExplosion = this.playerBulletExplosions.getFirstExists(false);
    var bulletDirection = bullet.body.velocity.x > 0 ? 1 : -1;
    if (bulletExplosion) {
      this.sfx.enemyDeath.play('', 0, this.sfx.commonLevel, false, true);
      bulletExplosion.reset(bullet.x + (10 * bulletDirection), bullet.y);
      bulletExplosion.animations.play("explode", 7, false, true);
    }
    bullet.kill();
   // enemy.kill();
    // kill doesn't remove it from memory
    enemy.destroy();
  },
  hurtEnemy: function(bullet, enemy) {
    var bulletExplosion = this.playerBulletExplosions.getFirstExists(false);
    var bulletDirection = bullet.body.velocity.x > 0 ? 1 : -1;
    if (bulletExplosion) {
      this.sfx.bulletImpact.play('', 0, this.sfx.commonLevel, false, true);
      bulletExplosion.reset(bullet.x + (6 * this.game.assetScaleFactor * bullet.directionValue), bullet.y);
      bulletExplosion.animations.play('explode', 7, false, true);
      // no loop, kill on complete
    }
    bullet.kill();
    if (enemy.started) {
      enemy.damage(1.5);
 
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
  resetEnemyBullet: function(bullet) {
    var bulletExplosion = this.enemyBulletExplosions.getFirstExists(false);
    if (bulletExplosion) {
      bulletExplosion.reset(bullet.x + (6 * this.game.assetScaleFactor * bullet.directionValue), bullet.y);
      bulletExplosion.animations.play('explode', 10, false, true);
    }
    bullet.kill();
  },
  triggerCollision: function(enemy) {
    enemy.directionValue *= -1;
    if (enemy.directionOrientation != "vertical") {
      enemy.scale.x *= -1;
      enemy.body.velocity.x = 25 * this.game.assetScaleFactor * enemy.directionValue;
    } else if (enemy.directionOrientation == "vertical") {
      enemy.body.velocity.y = 25 * this.game.assetScaleFactor * enemy.directionValue; 
    }

  },
  
  gameOver: function() {
    this.textOffset = Math.round(this.game.baseWidth * 0.2);
  
    this.music.stop();
    if (this.player.dead) {
      this.sfx.playerDeath.play('', 0, this.sfx.commonLevel, false, true);
      if (this.game.device.desktop) {
        this.gameOverText = this.game.add.bitmapText(this.textOffset, this.game.baseHeight * 0.2, "verminFontWhite", "Game Over\nPress SPACE to Restart", this.game.bitmapFontSize * 1.5);

      } else {
        this.gameOverText = this.game.add.bitmapText(this.textOffset, this.game.baseHeight * 0.2, "verminFontWhite", "Game Over\nPress 'A' to Restart", this.game.bitmapFontSize * 1.5);

        // exit to menu 
        this.menuText = this.game.add.bitmapText(this.game.baseWidth * 0.5, this.game.baseHeight * 0.05, "verminFontWhite", "Exit to Menu", this.game.bitmapFontSize * 1.5);

        this.menuText.fixedToCamera = true;
        
      }
      this.gameOverText.fixedToCamera = true;
      this.gameOverStatus = true;

    } else {
      this.sfx.gameWin.play('', 0, this.sfx.commonLevel, false, true);
      if (this.game.device.desktop) {
        this.gameOverText = this.game.add.bitmapText(this.textOffset, this.game.baseHeight * 0.2, "verminFontWhite", "Congratulations\nYou Win!\nPress SPACE to Restart", this.game.bitmapFontSize * 1.5);
 
      } else {
        this.gameOverText = this.game.add.bitmapText(this.textOffset, this.game.baseHeight * 0.2, "verminFontWhite", "Congratulations\nYou Win!\nPress 'A' to Restart", this.game.bitmapFontSize * 1.5);

      }
      this.gameOverText.fixedToCamera = true;
      this.gameOverStatus = true;
   
    }

  },

  
  
  render: function() {
  
   
  } // end of render method
};