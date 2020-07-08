// SW Enhancement
if (navigator.serviceWorker) {
  // Register SW
  navigator.serviceWorker.register("sw.js").catch(console.error);

  //   Giphy cache clean
  function giphyCacheClean(giphys) {
    // get service worker registration
    navigator.serviceWorker.getRegistration().then(function (reg) {
      // Only post message to active SW
      if (reg.active)
        reg.active.postMessage({ action: "cleanGiphyCache", giphys: giphys });
    });
  }
}

// Giphy API
var giphy = {
  url: "https://api.giphy.com/v1/gifs/trending",
  query: {
    api_key: "y0BbEK0zqVdjHWizJ0dK8IK9bT5yVzJ2",
    limit: 12,
  },
};

// update trnding giphy
function update() {
  // toggle refresh state
  $("#update .icon").toggleClass("d-none");

  // call giphy api
  $.get(giphy.url, giphy.query)
    // success
    .done(function (res) {
      // empty element
      $("#giphys").empty();

      //Populate array of latest giphys
      var latestGiphys = [];

      // loop giphy
      $.each(res.data, function (i, giphy) {
        // add to latest giphys
        latestGiphys.push(giphy.images.downsized_large.url);

        // add giphy to html
        $("#giphys").prepend(
          `<div class="col-sm-6 col-md-4 col-lg-3 p-1">
                        <img class="w-100 img-fluid" src="${giphy.images.downsized_large.url}">
                    </div>
                    `
        );
      });
      // Inform the SW (if available) of current Giphys
      if (navigator.serviceWorker) giphyCacheClean(latestGiphys);
    })
    // failure
    .fail(function () {
      $(".alert").slideDown();
      setTimeout(function () {
        $(".alert").slideUp();
      }, 2000);
    })
    // complete
    .always(function () {
      // re-toggle refresh state
      $("#update .icon").toggleClass("d-none");
    });

  // prevent submission if originates from click
  return false;
}
// manual refresh
$("#update .icon").click(update);

// update trending giphys on load
update();
