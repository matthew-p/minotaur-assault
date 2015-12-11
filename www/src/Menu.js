var BasicGame = BasicGame || {};

BasicGame.Menu = function(game) {};

BasicGame.Menu.prototype = {
  init: function() {
    
  },
  preload: function() {
    this.music = this.game.add.audio('cheerfulMusic');
    
  },
  create: function() { 
     this.music.play('', 0, 0.1, true, true); // marker, start pos, vol, loop?, forceRestart
    
    // reset input scale

    this.game.input.scale.setTo(this.game.inputScaleFactor, this.game.inputScaleFactor);

    this.titleText = this.game.add.bitmapText(this.game.baseWidth * 0.1, this.game.baseHeight * 0.05, "verminFont", "Minotaur Assault", this.game.bitmapFontSize * 2);

    this.newSelectionText = this.game.add.bitmapText(this.game.baseWidth * 0.25, this.game.baseHeight * 0.20, "verminFontWhite", "New Game", this.game.bitmapFontSize * 1.5);

    
    // infinite jumper mode
    this.infiniteText = this.game.add.bitmapText(this.game.baseWidth * 0.25, this.game.baseHeight * 0.35, "verminFontWhite", "Infinite Mode", this.game.bitmapFontSize * 1.5);
    
    // exit app
    this.exitText = this.game.add.bitmapText(this.game.baseWidth * 0.25, this.game.baseHeight * 0.80, "verminFontWhite", "Exit Game", this.game.bitmapFontSize * 1.5);
    
            // use player sprite as cursor
    this.indicator = this.game.add.sprite(this.game.baseWidth * 0.15, this.game.baseHeight * 0.20, "player");
    this.indicator.scale.setTo(this.game.assetScaleFactor, this.game.assetScaleFactor);
    this.indicator.linePosition = 0;
    this.indicator.animations.add("walk", [0,1,2], 10, true);
    this.indicator.animations.play('walk');
      // timer to defeat input duplication
    this.menuTimer = 0;
    
    // condition to enable save game loading / deleting if present

    if (localStorage.getItem("activeLevel")) {
      this.activeLevel = localStorage.getItem("activeLevel");
      
      this.continueText = this.game.add.bitmapText(this.game.baseWidth * 0.25, this.game.baseHeight * 0.50, "verminFontWhite", "Continue", this.game.bitmapFontSize * 1.5);

      this.deleteSaveText = this.game.add.bitmapText(this.game.baseWidth * 0.25, this.game.baseHeight * 0.65, "verminFontWhite", "Delete Game Save", this.game.bitmapFontSize * 1.5);

    }
    
    if (this.game.device.desktop) {
      this.instructionText = this.game.add.bitmapText(this.game.baseWidth * 0.25, this.game.baseHeight * 0.50, "verminFontWhite", "Use Arrow Keys & SPACE", this.game.bitmapFontSize * 1.5);

    }
    
    // check arrow keys
    this.cursors = this.game.input.keyboard.createCursorKeys();
        // input check for firing via space
    this.game.input.keyboard.addKeyCapture([Phaser.Keyboard.SPACEBAR]);
    
    // creating a levelX object
    // that will hold the relevant data cues that will be taken by Game.js
    // to render the right level data instead of duplicating the Game.js into LevelX.js
    this.levelFlags = {
      totalLevels: 6,
      level1: {
        // key to pass in as arg in game.add.timemap in Game.js, key from preload call
        levelMap: "level1",
        levelMusic: "midlevelMusic",
        levelBackground: "clouds-bg"
      },
      level2: {
        levelMap: "level2",
        levelMusic: "cheerfulMusic",
        levelBackground: "clouds-bg",
      },
      level3: {
        levelMap: "level3",
        levelMusic: "organMusic",
        levelBackground: "greyblocks-bg",
      },
      level4: {
        levelMap: 'level4',
        levelMusic: 'midlevelMusic',
        levelBackground: "browncave-bg",
      },
      level5: {
        levelMap: "level5",
        levelMusic: "undergroundMusic",
        levelBackground: "greenblocks-bg",
      }, 
      level6: {
        levelMap: "level6",
        levelMusic: "undergroundMusic",
        levelBackground: "bluecave-bg",
      },
      levelBoss: {
        levelMap: "levelBoss",
        levelMusic: "bossMusic",
        levelBackground: "bluecave-bg",
      }
    };
  },
  update: function() {
    
    // new item bounds 
    this.newGameMenuItem = new Phaser.Rectangle(this.newSelectionText.getBounds().x, this.newSelectionText.getBounds().y, this.newSelectionText.getBounds().width, this.newSelectionText.getBounds().height);
    // this seems like a crappy way to handle this menu
    if (this.activeLevel) {
      if (this.cursors.up.isDown && this.game.time.now > this.menuTimer) {
        this.moveIndicator("up");
      }
      if (this.cursors.down.isDown && this.game.time.now > this.menuTimer) {
        this.moveIndicator("down");
      }
    }
    if (this.game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
      if (this.indicator.linePosition === 0) {
        this.music.stop();
        this.game.state.start("Game", true, false, this.levelFlags, "1");
      } else if (this.indicator.linePosition === 1) {
        this.music.stop();
        this.game.state.start("Infinite", true, false);

      } else if (this.indicator.linePosition === 2) {
        this.music.stop();
                if (this.activeLevel == "Boss") {
          this.game.state.start("Boss", true, false, this.levelFlags, this.activeLevel);
        } else {
          this.game.state.start("Game", true, false, this.levelFlags, this.activeLevel);
        }
      } else if (this.indicator.linePosition === 3) {
        localStorage.removeItem("activeLevel");
        this.music.stop();
        this.game.state.restart();
      }
    }
        // touch control
    if (this.game.input.activePointer.isDown) {

      if (Phaser.Rectangle.containsPoint(this.newSelectionText.getBounds(), this.game.input.activePointer.position)) {
        this.music.stop();
        this.game.state.start("Game", true, false, this.levelFlags, "1");
      } else if (Phaser.Rectangle.containsPoint(this.infiniteText.getBounds(), this.game.input.activePointer.position)) {
        this.music.stop();
        this.game.state.start("Infinite", true, false);
        
      } else if (Phaser.Rectangle.containsPoint(this.exitText.getBounds(), this.game.input.activePointer.position)) {
        // exit app 
        // prepending window close suggested in ionic forum thread on exiting
        window.close();
        navigator.app.exitApp();

      } else if ( this.continueText && Phaser.Rectangle.containsPoint(this.continueText.getBounds(), this.game.input.activePointer.position)) {
        this.music.stop();
        if (this.activeLevel == "Boss") {
          this.game.state.start("Boss", true, false, this.levelFlags, this.activeLevel);
        } else {
          this.game.state.start("Game", true, false, this.levelFlags, this.activeLevel);
        }
        
      } else if (this.deleteSaveText && Phaser.Rectangle.containsPoint(this.deleteSaveText.getBounds(), this.game.input.activePointer.position)) {
        localStorage.removeItem("activeLevel");
        this.music.stop();
        this.game.state.restart();
      }
    }
  },
    
  render: function() {

   // this.game.debug.geom(this.newGameMenuItem, "rgba(200,0,0,1)", true, 1);
    
  },
  
  // moving the menu item cursor indicator w. keyboard
  moveIndicator: function(direction) {
    this.menuTimer = this.game.time.now + 200;
    if (direction == "up") {
      this.indicator.linePosition = (this.indicator.linePosition === 0) ? 3 : this.indicator.linePosition - 1;
    } else if (direction == "down") {
      this.indicator.linePosition = (this.indicator.linePosition === 3) ? 0 : this.indicator.linePosition + 1;
    }

    if (this.indicator.linePosition === 0) {
      this.indicator.y = this.game.baseHeight * 0.20; 
    } else if (this.indicator.linePosition === 1) {
      this.indicator.y = this.game.baseHeight * 0.35;
    } else if (this.indicator.linePosition === 2) {
      this.indicator.y = this.game.baseHeight * 0.50;
    } else if (this.indicator.linePosition === 3) {
      this.indicator.y = this.game.baseHeight * 0.65;
    }
  }
  
};