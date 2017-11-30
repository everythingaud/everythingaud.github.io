$(document).ready(function () {
  var $obj = $('sidebar');
  var top = $obj.offset().top - parseFloat($obj.css('marginTop').replace(/auto/, 0));

  $(window).scroll(function (event) {
    // what the y position of the scroll is
    var y = $(this).scrollTop();

    // whether that's below the form
    if (y >= top) {
      // if so, ad the fixed class
      $obj.addClass('fixed');
    } else {
      // otherwise remove it
      $obj.removeClass('fixed');
    }
  });
});
