/* globals Phaser:false */
// create BasicGame Class
var BasicGame = BasicGame || {};

// create Boot function in BasicGame
BasicGame.InfiniteGameOver = function(game) {
};

// set Boot function prototype
BasicGame.InfiniteGameOver.prototype = {

  init: function () {
    this.menuText = null;
  }, 

  preload: function () {

  },

  create: function () {
    var textOffset = Math.round(this.game.baseWidth * 0.2);
    this.gameOverText = this.game.add.bitmapText(textOffset, this.game.baseHeight * 0.2, "verminFontWhite", "Game Over\nPress 'A' to Restart", this.game.bitmapFontSize * 1.5);
    
    this.menuText = this.game.add.bitmapText(this.game.baseWidth * 0.5, this.game.baseHeight * 0.05, "verminFontWhite", "Exit to Menu", this.game.bitmapFontSize * 1.5);
    this.menuText.fixedToCamera = true;
    
         // touch input
      
    // x,y key, callback, callback context, frames
    if (!this.game.device.desktop) {
      this.leftButton = this.game.add.button(this.game.baseWidth * 0.02, this.game.baseHeight * 0.75, 'buttons', null, this, 14, 14, 14, 14);
      //console.log("leftButton x: " + this.leftButton.x + " leftButton Y" + this.leftButton.y);
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
      
      //this.leftButtonGeom = new Phaser.Rectangle(this.leftButton.x, this.leftButton.y, this.leftButton.width, this.leftButton.height);
     
      
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
      
      //this.rightButtonGeom = new Phaser.Rectangle(this.rightButton.x, this.rightButton.y, this.rightButton.width, this.leftButton.height);

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

  update: function () {
    //if (this.bButtonDown) {
    //  this.game.state.start('Menu');
   // } else if (this.aButtonDown) {
    if (this.aButtonDown) {
      this.game.state.start("Infinite", true, false);
    }
    if (this.game.input.activePointer.isDown) {
      if (Phaser.Rectangle.containsPoint(this.menuText.getBounds(), this.game.input.activePointer.position)) {
        this.game.state.start('Menu', true, false);
      }
    }
  },

  render: function () {

  },
};