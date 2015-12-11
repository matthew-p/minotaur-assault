var BasicGame = BasicGame || {};
// make the preload state function, pass in 'game' to reference current game
BasicGame.Preload = function (game) {};

BasicGame.Preload.prototype = {
  init: function() {
      this.loadingDelayTime = this.game.time.now + 1000;
            // Add logo to the center of the stage for minimum of 1 second
      this.logo = this.add.sprite(
            this.world.centerX, // (centerX, centerY) is the center coordination
            0,
            'logo');
        // Set the anchor to the x center of the sprite
      this.logo.anchor.setTo(0.5, 0);
      this.logo.y = this.logo.height * 0.1;
      this.logo.x = this.world.centerX;
      this.spinner = this.add.sprite(this.world.centerX,  
                      this.world.centerY,              
                     'spinner');
      this.spinner.scale.setTo(2,2);
      this.spinner.anchor.setTo(0.5, 0.5);
      this.spinner.x = this.world.centerX;
      this.spinner.y = this.logo.height * 1.1;
      this.spinner.animations.add("spin", null, 15, true);
      this.spinner.animations.play('spin');
    
  },
  preload: function() {
          
    // start physics
    this.game.physics.startSystem(Phaser.Physics.ARCADE);

    // font
    this.load.bitmapFont("verminFont", "asset/font/verminVibes1989font64.png", "asset/font/verminVibes1989font64.fnt");
    this.load.bitmapFont("verminFontWhite", "asset/font/verminVibes1989font64white.png", 'asset/font/verminVibes1989font64white.fnt');
    this.load.bitmapFont("berkeliumBitmap", "asset/font/berkeliumBitmap32.png", "asset/font/berkeliumBitmap32.fnt");
    // load game assets
    this.load.tilemap("level1", "asset/third-3.json", null, Phaser.Tilemap.TILED_JSON);
    this.load.tilemap("level2", "asset/third-7.json", null, Phaser.Tilemap.TILED_JSON);
    
    this.load.tilemap('level3', 'asset/third-5.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.tilemap('level4', 'asset/third-6.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.tilemap('level5', 'asset/third-1.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.tilemap('level6', 'asset/third-2.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.tilemap("levelBoss", "asset/boss.json", null, Phaser.Tilemap.TILED_JSON);
    this.load.image('gameTiles', "asset/tiles-extended.png");
    //spritesheet(key, url, frameWidth, frameHeight, frameMax, margin, spacing)
    this.load.spritesheet('greenTiles', "asset/horizontalBlocks-green.png", 16, 16);
    this.load.spritesheet('greyTiles', "asset/horizontalBlocks-grey.png", 16, 16);
    this.load.spritesheet("player", "asset/player.png", 16, 16);
    this.load.spritesheet("enemies-fire-orange", "asset/enemies-fire-orange.png", 13, 15);
    this.load.spritesheet("enemies-jelly-green", "asset/enemies-jelly-green.png", 16, 13);
    this.load.spritesheet("enemies-fly", "asset/enemies-fly.png", 16, 12);
    this.load.spritesheet("enemies-minotaur", "asset/minotaur-spritesheet-calciumtrice.png", 48, 48);
                        
    this.load.spritesheet("enemies-jelly-red", "asset/enemies-jelly-red.png", 16, 13);
    this.load.spritesheet("enemies-fire-green", "asset/enemies-fire-green.png", 13, 15);
    this.load.image('tank', "asset/tank.png");
    this.load.spritesheet('coin', 'asset/coin.png', 5, 7);
    this.load.spritesheet('bullet-green', 'asset/bullet-green.png', 11, 11);
    this.load.spritesheet('bullet-orange', 'asset/bullet-orange.png', 10, 10);
    this.load.spritesheet('fireball', 'asset/fireball1.png', 8,8);
    
    // backgrounds 
    this.load.spritesheet("bluecave-bg", "asset/bluecave-bg.png", 224, 224);
    this.load.spritesheet("clouds-bg", "asset/clouds-bg-3.png", 240, 240);
    this.load.spritesheet("browncave-bg", "asset/browncave-bg.png", 224, 224);
    this.load.spritesheet("greyblocks-bg", "asset/greyblocks-bg.png", 224, 224);
    this.load.spritesheet("greenblocks-bg", 'asset/greenblocks-bg.png', 224, 224);
    // mobile input
    this.load.spritesheet('buttons', 'asset/xbox360pixelpad.png', 34,34, 18);
    
    
          // audio

      this.load.audio('coinSFX', ['asset/ogg/coin.ogg', 'asset/mp3/coin.mp3']);
      this.load.audio('playerDeathSFX', ['asset/ogg/death.ogg', 'asset/mp3/death.mp3']);
      this.load.audio('deepImpactSFX', ['asset/ogg/deepImpact.ogg', 'asset/mp3/deepImpact.mp3']);
      this.load.audio('shrinkBounceSFX', ['asset/ogg/shrinkBounce.ogg','asset/mp3/shrinkBounce.mp3']);
      this.load.audio('levelStartSFX', ['asset/ogg/levelstart.ogg', 'asset/mp3/levelstart.mp3']);
      this.load.audio('playerGunSFX', ['asset/ogg/player-gun.ogg', 'asset/mp3/player-gun.mp3']);
      this.load.audio('jumpSFX', ['asset/ogg/jump.ogg', 'asset/mp3/jump.mp3']);
      this.load.audio('gameWinSFX', ['asset/ogg/gameWin-219.ogg', 'asset/mp3/gameWin-219.mp3']);
      this.load.audio('maceImpactSFX', ['asset/ogg/MetalPipe5.ogg','asset/mp3/MetalPipe5.mp3']);
      this.load.audio('roarFireSFX', ['asset/ogg/145729__frasbr__dragon-roar.ogg', 'asset/mp3/145729__frasbr__dragon-roar.mp3']);
      this.load.audio('roarSFX', ['asset/ogg/232289__zglar__zombie-or-monster-or-lion-roar.ogg', 'asset/mp3/232289__zglar__zombie-or-monster-or-lion-roar.mp3']);
      
      this.load.audio('deathRattle', ['asset/ogg/276577__mickboere__dragons-dying-breath.ogg', 'asset/mp3/276577__mickboere__dragons-dying-breath.mp3']);
      this.load.audio('cheerfulMusic', ['asset/ogg/cheerful-degrade-bg1.ogg', "asset/mp3/cheerful-degrade-bg1.mp3"]);
      this.load.audio('organMusic', ['asset/ogg/menu-organ-lalanl.ogg', 'asset/mp3/menu-organ-lalanl.mp3']);
      this.load.audio('midlevelMusic', ['asset/ogg/pirate-lalanl.ogg', 'asset/mp3/pirate-lalanl.mp3']);
      this.load.audio('bossMusic', ['asset/ogg/suspense-lalanl.ogg', 'asset/mp3/suspense-lalanl.mp3']);

      this.load.audio("undergroundMusic", ['asset/ogg/underground-lalanl-bg2.ogg', "asset/mp3/underground-lalanl-bg2.mp3"]);

    

  },
  create: function() {

  },
  update: function() {
        // check to see if audio is decoded, w/ a minimum limit to prevent flashing loading screen    
    if (this.loadingDelayTime < this.game.time.now && this.cache.isSoundDecoded('roarSFX') && this.cache.isSoundDecoded("cheerfulMusic"))
    {
        this.state.start('Menu');
    }
    
  },
  
  render: function() {

   // if (this.music.isDecoding) {
     //   this.game.debug.text("Decoding MP3 ...", 32, 20, "#00ff00");
    //  } else {
    //    this.game.debug.text("Not Decoding MP3 ...", 32, 20, "#00ff00");
    //  }
    //  this.game.debug.text(this.game.time.fps || '--', 2, 14, "#00ff00"); 
      
  
  },
  
};