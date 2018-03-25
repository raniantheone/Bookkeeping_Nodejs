require.config({
  baseUrl: "js",
  paths: {
    text :"./lib/text"
  }
});

require(["skeleton", "function/expense", "function/income", "function/configuration", "function/transfer", "function/distribution"], function(skeletonMod, expenseMod, incomeMod, configMod, transferMod, distroMod) {

  // TODO
  // 1. authentication here
  // 2. register cookie expiration checking function on skeleton

  /**
  * Initialize side nav:
  * 1. Set up function list
  * 2. Register click event handler for initializing function content
  */
  skeletonMod.registerNavFunction(expenseMod);
  skeletonMod.registerNavFunction(incomeMod);
  skeletonMod.registerNavFunction(configMod);
  skeletonMod.registerNavFunction(transferMod);
  skeletonMod.registerNavFunction(distroMod);

  /**
  * Initialize default function content
  */
  // expenseMod.initialize();
  distroMod.initialize();

});
