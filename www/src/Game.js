var BasicGame = BasicGame || {};

BasicGame.Game = function(game) {};

BasicGame.Game.prototype = {
  // load level data
  init: function(levelFlags, currentLevel) {
    this.levelFlags = levelFlags;
    this.currentLevel = currentLevel;
    this.levelData = levelFlags["level" + currentLevel];
    // clears it if created in prior mode
    this.menuText = null;
  },
  preload: function() {
        // audio
    this.music = this.game.add.audio(this.levelData.levelMusic);
    
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
    

  },
  create: function() {
    
    this.music.play('', 0, 0.2, true, true); // marker, start pos, vol, loop?, forceRestart
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
    //this.blockedLayer.debug = true;

    this.lavaLayer = this.map.createLayer("lavaLayer");
    this.lavaLayer.setScale(this.game.assetScaleFactor, this.game.assetScaleFactor);
    
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
    this.createCoins();
    this.createTanks();

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
    
        // make enemies
    this.createEnemiesGreen();
    this.createEnemiesOrange();
    this.createEnemiesFly();

    // make enemy's orange bullets
    this.bulletsOrange = this.game.add.group();
    this.bulletsOrange.enableBody = true;
    this.physicsBodyType = Phaser.Physics.ARACDE;
    for (var i = 0; i < 30; i++) {
      var bullet = this.bulletsOrange.create(0, 0, "bullet-orange", 0);
      bullet.exists = false;
      bullet.visible = false;
      bullet.body.allowGravity = false;
      bullet.scale.x = this.game.assetScaleFactor;
      bullet.scale.y = this.game.assetScaleFactor;
      bullet.anchor.set(0.5);
      bullet.directionValue = 1;
      bullet.animations.add("fly", [0,1,2], 10, true);
    }
    
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
        // called last, will render on top
    this.coinText = this.game.add.bitmapText(this.game.baseWidth * 0.05, this.game.baseHeight * 0.05, "verminFontWhite", "Coins: " + this.playerCoinCount + "/" + this.worldCoinCount, this.game.bitmapFontSize * 1.5);
    //this.coinText.alpha = 0.7;
    // cause the coin count to move w. the player
    this.coinText.fixedToCamera = true;
    
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
  },
    
  // extra create methods
  
  createCoins: function() {
    this.coins = this.game.add.group();
    this.coins.enableBody = true;
    var result = this.findObjectsByType('coin', this.map, "objectsLayer");
    result.forEach(function(element) {
      this.createFromTiledObject(element, this.coins);
    }, this);

    // turn off gravity, and add & play animation
    this.coins.forEach(function(coin) {
      coin.scale.setTo(this.game.assetScaleFactor);
      coin.body.allowGravity = false;
      coin.animations.add('spin', [0,1,2,3], 10, true);
      coin.animations.play('spin');
      this.worldCoinCount += 1;
    }, this); // the 'this' establishes the scope for the forEach callback

  },

  createTanks: function() {
    this.tanks = this.game.add.group();
    this.tanks.enableBody = true;
    var result = this.findObjectsByType("tank", this.map, "objectsLayer");
    result.forEach(function(element) {
      this.createFromTiledObject(element, this.tanks);
    }, this);
    this.tanks.forEach(function(tank) {
      // 4,4 for 4x asset scale
      // tank.scale.setTo(4,4);
      tank.scale.setTo(4, 4);
    });

  },

  
  createEnemiesGreen: function() {
    this.enemiesGreen = this.game.add.group();
    this.enemiesGreen.enableBody = true;
    var item;
    var result1 = this.findObjectsByType("enemies-jelly-red", this.map, "objectsLayer");
    var result2 = this.findObjectsByType("enemies-jelly-green", this.map, "objectsLayer");
    var result = result1.concat(result2);
  
    result.forEach(function(element) { 
      this.createFromTiledObject(element, this.enemiesGreen);
    }, this);

    // add green behaviors
    this.enemiesGreen.forEach(function(enemy) {
      enemy.scale.setTo(this.game.assetScaleFactor, this.game.assetScaleFactor);
      enemy.animations.add("walk", [0,1,2], 5, true);
      enemy.animations.play("walk");
      enemy.body.velocity.x = 25 * this.game.assetScaleFactor;
      enemy.directionValue = 1;
      enemy.body.setSize(13, 13);
      enemy.anchor.setTo(0.5, 0.5);

    }, this);
  },

  createEnemiesOrange: function() {
    this.enemiesOrange = this.game.add.group();
    this.enemiesOrange.enableBody = true;

    var result1 = this.findObjectsByType('enemies-fire-green', this.map, 'objectsLayer');
    var result2 = this.findObjectsByType("enemies-fire-orange", this.map, "objectsLayer");
    var result = result1.concat(result2);
    result.forEach(function(element) {
      this.createFromTiledObject(element, this.enemiesOrange);
    }, this);
    // orange behaviors
    this.enemiesOrange.forEach(function(enemy) {
      enemy.scale.setTo(this.game.assetScaleFactor * -1, this.game.assetScaleFactor);
      enemy.animations.add("walk", [0,1,2], 5, true);
      enemy.animations.add("shoot", [3,3], 10, false);
      enemy.animations.play("walk");
      enemy.body.velocity.x = 25 * this.game.assetScaleFactor;
      enemy.directionValue = -1;
      enemy.bulletTimer = 0;
      enemy.anchor.setTo(0.5, 0.5);
      // ready for potential modification
      //enemy.body.setSize(enemy.width * 1, enemy.height * 1);
    }, this);
  //  this.enemiesOrange.setAll("scale.x", -1); flip horizontally legacy
  },
  
  createEnemiesFly: function() {
    this.enemiesFly = this.game.add.group();
    this.enemiesFly.enableBody = true;

    var result = this.findObjectsByType("enemies-fly", this.map, "objectsLayer");
    result.forEach(function(element) {
      this.createFromTiledObject(element, this.enemiesFly);
    }, this);
    // flying behaviors
    this.enemiesFly.forEach(function(enemy) {
      enemy.scale.setTo(this.game.assetScaleFactor * -1, this.game.assetScaleFactor);
      enemy.animations.add("fly", [0,1,2], 5, true);
      enemy.animations.play("fly");
      enemy.body.velocity.y = 25 * this.game.assetScaleFactor;
      enemy.directionValue = 1;
      enemy.directionOrientation = "vertical";
    //  enemy.body.setSize(enemy.width * .2, enemy.height * .2);
      enemy.anchor.setTo(0.5, 0.5);
      
    }, this);
    // this.enemiesFly.setAll("scale.x", -1);
//    bullet.body.allowGravity = false;
    this.enemiesFly.setAll("body.allowGravity", false);
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
      this.game.state.start("Game", true, false, this.levelFlags, this.currentLevel);
    }
    if ((this.game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR) || this.aButtonDown || this.bButtonDown) && this.gameOverStatus === true && this.player.dead === false) {
      if (parseInt(this.currentLevel) < this.levelFlags.totalLevels) {
        // start Game.js, clear world, don't clear cache, pass thru level data, start next level
        this.game.state.start("Game", true, false, this.levelFlags, (parseInt(this.currentLevel) + 1).toString());
      } else if (parseInt(this.currentLevel) == this.levelFlags.totalLevels) {
        this.game.state.start("Boss", true, false, this.levelFlags, "Boss");
      }
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
    // kill player on lava touch, should make diff callback
    this.game.physics.arcade.collide(this.player, this.lavaLayer, this.enemyCollision, null, this);
    // enemy collisions w. tiles
    this.game.physics.arcade.collide(this.enemiesGreen, this.triggerLayer, this.triggerCollision, null, this);
    this.game.physics.arcade.collide(this.enemiesGreen, this.blockedLayer);
    this.game.physics.arcade.collide(this.enemiesOrange, this.triggerLayer, this.triggerCollision, null, this);
    this.game.physics.arcade.collide(this.enemiesOrange, this.blockedLayer);
    this.game.physics.arcade.collide(this.enemiesFly, this.triggerLayer, this.triggerCollision, null, this);
    this.game.physics.arcade.collide(this.enemiesFly, this.blockedLayer);
    this.game.physics.arcade.collide(this.tanks, this.blockedLayer);

    // kill bullets on touching wall
    this.game.physics.arcade.collide(this.bulletsGreen, this.blockedLayer, this.resetPlayerBullet, null, this);
    this.game.physics.arcade.collide(this.bulletsOrange, this.blockedLayer, this.resetEnemyBullet, null, this);
    
 
      
    // player movement
    // set horizontal to 0 for immediate air & land control
    this.player.body.velocity.x = 0;
    
    // all the movement conditions
    // if player alive, not shooting, & doesn't have tank, he can move
    if (!this.player.dead && (!this.player.body.onFloor() || (!this.game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR) && !this.bButtonDown)) && !this.player.hasTank) { 
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
    }else if (!this.player.dead) {
      // neutral pose
      this.player.loadTexture("player", 5);
    } else  {
      // dead pose
      this.player.loadTexture("player", 7);
    }
       // fire player bullets
    if (!this.player.dead && (this.game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR) || this.bButtonDown) && !this.player.hasTank && (!this.player.body.onFloor() || Math.abs(this.player.body.velocity.x) === 0)) {
      this.player.loadTexture("player", 3);
      this.firePlayerBullet();
    }
    
      // check collisions on coins
    this.game.physics.arcade.overlap(this.player, this.coins, this.coinCollision, null, this);
    this.game.physics.arcade.overlap(this.player, this.tanks, this.tankCollision, null, this);
    // check player collisions on enemies
    this.game.physics.arcade.overlap(this.player, this.enemiesGreen, this.enemyCollision, null, this);
    this.game.physics.arcade.overlap(this.player, this.enemiesOrange, this.enemyCollision, null, this);
    this.game.physics.arcade.overlap(this.player, this.enemiesFly, this.enemyCollision, null, this);

    // check player bullet collisions on enemies
    this.game.physics.arcade.overlap(this.bulletsGreen, this.enemiesGreen, this.killEnemy, null, this);
    this.game.physics.arcade.overlap(this.bulletsGreen, this.enemiesOrange, this.killEnemy, null, this);
    this.game.physics.arcade.overlap(this.bulletsGreen, this.enemiesFly, this.killEnemy, null, this);
        // fire enemy bullets
    for (var i = 0; i < this.enemiesOrange.children.length; i++) {
      if (this.enemiesOrange.children[i].alive &&
          (Math.abs(this.enemiesOrange.children[i].x - this.player.x) < this.game.baseWidth * 0.6) &&
          (Math.abs(this.enemiesOrange.children[i].y - this.player.y) < this.game.baseHeight * 0.5) &&
          this.enemiesOrange.children[i].bulletTimer < this.game.time.now) {
        this.fireEnemyBullet(this.enemiesOrange.children[i]);
      }
    }
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
    if (this.gameOverStatus === false) {
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
    var enemyBullet = this.bulletsOrange.getFirstExists(false);
    if (enemyBullet) {
        enemyBullet.body.height = 10;
      enemy.animations.play("shoot");
      enemy.events.onAnimationComplete.add(function() {
        enemy.animations.play('walk');
      });
      enemyBullet.directionValue = enemy.directionValue;
      enemyBullet.reset(enemy.x + (8 * enemyBullet.directionValue), enemy.y);
      
      enemyBullet.body.velocity.x = 60 * enemyBullet.directionValue * this.game.assetScaleFactor;
      enemyBullet.scale.x = enemyBullet.directionValue > 0 ? Math.abs(enemyBullet.scale.x) : Math.abs(enemyBullet.scale.x) * -1;
      enemyBullet.animations.play("fly");
      enemy.bulletTimer = this.game.time.now + 1000; // bullet timer
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
   // enemy.kill() doesn't remove it from memory
    enemy.destroy();
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
    var textOffset = Math.round(this.game.baseWidth * 0.2);

    this.music.stop();
    if (this.player.dead) {
      this.sfx.playerDeath.play('', 0, this.sfx.commonLevel, false, true);
      if (this.game.device.desktop) {
        this.gameOverText = this.game.add.bitmapText(textOffset, this.game.baseHeight * 0.2, "verminFontWhite", "Game Over\nPress SPACE to Restart", this.game.bitmapFontSize * 1.5);

      } else {
        this.gameOverText = this.game.add.bitmapText(textOffset, this.game.baseHeight * 0.2, "verminFontWhite", "Game Over\nPress 'A' to Restart", this.game.bitmapFontSize * 1.5);
        
        // exit to menu 
        this.menuText = this.game.add.bitmapText(this.game.baseWidth * 0.5, this.game.baseHeight * 0.05, "verminFontWhite", "Exit to Menu", this.game.bitmapFontSize * 1.5);
    
        this.menuText.fixedToCamera = true;
        
      }
      this.gameOverText.fixedToCamera = true;
      this.gameOverStatus = true;
    } else if (parseInt(this.currentLevel) < this.levelFlags.totalLevels){
      this.sfx.gameWin.play('', 0, this.sfx.commonLevel, false, true);
      if (this.game.device.desktop) {
        this.gameOverText = this.game.add.bitmapText(textOffset, this.game.baseHeight * 0.2, "verminFontWhite", "Level Complete!\nPress SPACE to Advance", this.game.bitmapFontSize * 1.5);

      } else {
        this.gameOverText = this.game.add.bitmapText(textOffset, this.game.baseHeight * 0.2, "verminFontWhite", "Level Complete!\nPress 'A' to Advance", this.game.bitmapFontSize * 1.5);

      }
      this.gameOverText.fixedToCamera = true;
      this.gameOverStatus = true;

      // local storage game save
      localStorage.setItem("activeLevel", (parseInt(this.currentLevel) + 1).toString());

    } else if (parseInt(this.currentLevel) === this.levelFlags.totalLevels) {
      this.sfx.gameWin.play('', 0, this.sfx.commonLevel, false, true);
      if (this.game.device.desktop) {
        this.gameOverText = this.game.add.bitmapText(textOffset, this.game.baseHeight * 0.2, "verminFontWhite", "Level Complete!\nPress SPACE to Advance", this.game.bitmapFontSize * 1.5);
 
      } else {
        this.gameOverText = this.game.add.bitmapText(textOffset, this.game.baseHeight * 0.2, "verminFontWhite", "Level Complete!\nPress 'A' to Advance", this.game.bitmapFontSize * 1.5);

      }
      this.gameOverText.fixedToCamera = true;
      this.gameOverStatus = true;
      
      // local storage game save
      localStorage.setItem("activeLevel", 'Boss');
    }
    if (this.playerCoinCount == this.worldCoinCount) {
      this.youWinText = this.game.add.bitmapText(textOffset, this.game.baseHeight * 0.4, "verminFontWhite", "You Got All The Coins", this.game.bitmapFontSize * 1.5);
      this.youWinText.fixedToCamera = true;
    } else {
      this.missedText = this.game.add.bitmapText(textOffset, this.game.baseHeight * 0.4, "verminFontWhite", "You Missed Some Coins", this.game.bitmapFontSize * 1.5);

      this.missedText.fixedToCamera = true;
    }

  },

  
  
  render: function() {
  //  this.game.debug.text(this.game.time.fps || '--', 2, 14, "#00ff00");   
    //this.game.debug.geom(this.leftButtonGeom, "rgba(200,0,0,1)", true, 1);
   //  console.log("this.leftButtonGeom: " + this.leftButtonGeom);
   // this.game.debug.geom(this.rightButtonGeom, 'rgba(255,0,0,1)' ) ;
/*  console.log(Phaser.Rectangle( 100, 100, 100, 100 );
    console.log(this.rightButton.getLocalBounds());
    var rightButtonRect = this.rightButton.getLocalBounds();
    this.game.debug.geom(rightButtonRect, 'rgb(200, 0, 0)', false);

    this.game.debug.geom( this.aButton.getLocalBounds(), 'rgb(200,100,50)', true ) ;
    
    this.game.debug.body(this.player);
*/

    /*
    for (var i = 0; i < this.enemiesFly.children.length; i++) {
      this.game.debug.body(this.enemiesFly.children[i]);
    }
    for (var i = 0; i < this.enemiesGreen.children.length; i++) {
      this.game.debug.body(this.enemiesGreen.children[i]);
    }
    for (var i = 0; i < this.enemiesOrange.children.length; i++) {
      this.game.debug.body(this.enemiesOrange.children[i]);
    }
    for (var i = 0; i < this.coins.children.length; i++) {
      this.game.debug.body(this.coins.children[i]);
    }
    for (var i = 0; i < this.tanks.children.length; i++) {
        this.game.debug.body(this.tanks.children[i]);
        console.log("tank y: " + this.tanks.children[i].y);
    
    }
    
        this.blockedLayer.debug.collidingTileOverfill;
    this.blockedLayer.debugSettings = 'collidingTileOverfill';
    this.game.debug.body(this.blockedLayer);
   */
  } // end of render method
};