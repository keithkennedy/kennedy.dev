browser.webRequest.onBeforeRequest.addListener(
  function (details) {
    if (details.url.includes("eu-west-2")) {
      const redirectUrl = details.url.split("eu-west-2").join("eu-west-1");
      return { redirectUrl };
    }
  },
  { urls: ["*://*.console.aws.amazon.com/*"] },
  ["blocking"]
);