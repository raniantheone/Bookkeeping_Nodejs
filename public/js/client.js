require.config({
  baseUrl: "js",
  paths: {
    text: "./lib/text",
    d3: "./lib/d3"
  }
});

require(["clientUtil", "skeleton", "function/expense", "function/income", "function/configuration", "function/transfer", "function/distribution", "function/authentication", "function/records"], function(clientUtil, skeletonMod, expenseMod, incomeMod, configMod, transferMod, distroMod, authenMod, recordsMod) {

  clientUtil.ajaxPost("/auth/checkAuthen").then((payload) => {
    if(!payload.authenIsValid) {
      authenMod.initialize();
    }else{

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
      skeletonMod.registerNavFunction(recordsMod);

      /**
      * Initialize default function content
      */
      recordsMod.initialize();
      skeletonMod.showFunctionHeaderBar();

    };
  });

});
