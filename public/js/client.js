require.config({
  baseUrl: "js",
  paths: {
    text :"./lib/text"
  }
});

require(["skeleton", "function/expense", "function/income"], function(skeletonMod, expenseMod, incomeMod) {

  /**
  * Initialize side nav:
  * 1. Set up function list
  * 2. Register click event handler for initializing function content
  */
  skeletonMod.registerNavFunction(expenseMod);
  skeletonMod.registerNavFunction(incomeMod);

  /**
  * Initialize default function content
  */
  expenseMod.initialize();

});
