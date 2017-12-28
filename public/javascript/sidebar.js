var toggleBtn = document.querySelector('.sidebar-toggle');
var sidebar = document.querySelector('.sidebar');

var overlayBtn = document.querySelector('.overlay-toggle');
var overlay = document.querySelector('.overlay');

toggleBtn.addEventListener('click', function() {
  toggleBtn.classList.toggle('is-closed');
  sidebar.classList.toggle('is-closed');
})

// overlayBtn.addEventListener('click', function() {
//   overlayBtn.classList.toggle('ov-is-closed');
//   overlay.classList.toggle('overlay-closed');
//
//   console.log("clocl")
// })





var isLateralNavAnimating = false;

//open/close lateral navigation
$('.navi-trigger').on('click', function(event){
  console.log("hello")
  event.preventDefault();
  //stop if nav animation is running
  if( !isLateralNavAnimating ) {
    if($(this).parents('.csstransitions').length > 0 ) isLateralNavAnimating = true;

    $('body').toggleClass('navigation-is-open');
    $('.navigation-wrapper').one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function(){
      //animation is over
      isLateralNavAnimating = false;
    });
  }
});


/*

$(document).ready(function(){
    $(".button a").click(function(){
        $(".overlay").fadeToggle(200);
       $(this).toggleClass('btn-open').toggleClass('btn-close');
    });
});
$('.overlay').on('click', function(){
    $(".overlay").fadeToggle(200);
    $(".button a").toggleClass('btn-open').toggleClass('btn-close');
    open = false;
});
*/
